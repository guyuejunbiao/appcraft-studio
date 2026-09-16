'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Undo2, RotateCcw, MousePointerClick, Crown, Sparkles,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { useInteractionBus, BusScopeProvider } from '@/lib/interaction-bus';
import { WidgetToast, fireToast } from '@/lib/widget-toast';
import { getWidget } from '@/components/widgets/registry';
import { PhoneFrame } from './PhoneFrame';
import { WidgetRenderer } from './WidgetRenderer';
import { AppTabBar } from './AppTabBar';
import { Button } from '@/components/ui/button';
import type { PageData, ConnectionData, WidgetInstance } from '@/lib/types';
import { missingFreeCoords, ANIM_OPTS } from '@/lib/types';

/** 可交互预览：真实点击跳转 + 组件交互（登录切换/输入/第三方唤起） */
export function PreviewPlayer() {
  const previewSnapshot = useBuilder((s) => s.previewSnapshot);
  const project = useBuilder((s) => s.project);
  const storePages = useBuilder((s) => s.pages);
  const storeConnections = useBuilder((s) => s.connections);
  const storeCurrentPageId = useBuilder((s) => s.currentPageId);
  const setView = useBuilder((s) => s.setView);
  const exitPublishPreview = useBuilder((s) => s.exitPublishPreview);

  const pages: PageData[] = previewSnapshot?.pages ?? storePages;
  const connections: ConnectionData[] = previewSnapshot?.connections ?? storeConnections;
  const tabs = useBuilder((s) => s.tabs);
  const activeTabs = previewSnapshot?.tabs ?? tabs;
  const theme = previewSnapshot?.theme ?? project?.theme ?? { primary: '#f97316', radius: 'md' as const, dark: false };

  const [stack, setStack] = useState<string[] | null>(null);
  const [anim, setAnim] = useState('slide');

  const currentId = stack?.[stack.length - 1] ?? (previewSnapshot ? pages.find((p) => p.isHome)?.id ?? pages[0]?.id : storeCurrentPageId);
  const current = pages.find((p) => p.id === currentId);
  /* 自由布局但组件缺坐标（模板种子/旧数据未经编辑器迁移）：回退流式渲染，避免全部堆叠在 (0,0)。进入编辑器访问后会自动测量升级 */
  const isFree = current?.layout === 'free' && !missingFreeCoords(current?.components);

  /* 总线 key 自带页面 scope 前缀，跨页天然隔离，无需切页时清理：
   * 切页/返回时 loginMode 等页面状态保留（符合正常 App 返回行为），
   * 用户输入（user::phone 等）跨页共享；「重置」按钮才全清重来。
   * （勿在父 effect 里清总线：子组件写入标记的 effect 先于父 effect
   *   执行，清掉后依赖值未变化不会自愈，登录按钮的校验标记会丢失） */

  /* 自由布局内容总高（测量绝对定位子元素）— ResizeObserver 订阅式测量 */
  const contentRef = useRef<HTMLDivElement>(null);
  const [freeHeight, setFreeHeight] = useState(700);
  useEffect(() => {
    const root = contentRef.current;
    if (!isFree || !root) return;
    const measure = () => {
      let max = 700;
      root.querySelectorAll<HTMLElement>('[data-free-item]').forEach((el) => {
        max = Math.max(max, (Number(el.dataset.y) || 0) + el.offsetHeight + 24);
      });
      setFreeHeight((prev) => (Math.abs(prev - max) > 2 ? Math.max(700, max) : prev));
    };
    const ro = new ResizeObserver(measure);
    root.querySelectorAll<HTMLElement>('[data-free-item]').forEach((el) => ro.observe(el));
    /* 总线驱动的显隐（登录 tab 切换等）只会增删 DOM 节点，不触发 ResizeObserver：
     * MutationObserver 兑底重挂观察 + 重测，避免底部组件恢复显示后滚动区被截断 */
    const mo = new MutationObserver(() => {
      root.querySelectorAll<HTMLElement>('[data-free-item]').forEach((el) => ro.observe(el));
      measure();
    });
    mo.observe(root, { childList: true, subtree: true });
    measure();
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [isFree, pages, currentId]);

  const connMap = useMemo(() => {
    const map = new Map<string, ConnectionData>();
    connections.forEach((c) => {
      if (c.fromPageId === current?.id) map.set(`${c.fromWidgetId}|${c.slot ?? ''}`, c);
    });
    return map;
  }, [connections, current?.id]);

  const navigate = (pageId: string, animation: string) => {
    if (pageId === current?.id) return; /* 同页不重复入栈（快速跳转条点击当前页） */
    setAnim(animation);
    setStack((s) => [...(s ?? (currentId ? [currentId] : [])), pageId]);
  };

  /** tabbar 槽位导航：换根式（重置页面栈），模拟真实 App 底栏切换 */
  const navigateTab = (pageId: string, animation: string) => {
    setAnim(animation);
    setStack([pageId]);
  };

  const back = () => {
    setStack((s) => (s && s.length > 1 ? s.slice(0, -1) : s));
    setAnim('slide');
  };

  /** navbar 返回箭头语义：栈内回退；栈底时 toast 提示（正常 App 不会再退） */
  const navBack = () => {
    if (stack && stack.length > 1) {
      back();
    } else {
      fireToast(currentId ?? '', '已经是第一个页面', 'info');
    }
  };

  /** 退出登录语义：清会话数据（手机号/密码/验证码/协议勾选）+ 页面栈重置回首页 */
  const logout = () => {
    useInteractionBus.getState().clearSession();
    setStack(null);
    setAnim('fade');
  };

  const reset = () => {
    setStack(null);
    setAnim('slide');
    /* 全清（含用户输入 + 页面联动状态）：明确的「从头预览」意图；
     * 事件回调里同步清空 → 子组件 useChannelDefault 会因依赖变化自愈重写默认值 */
    useInteractionBus.getState().reset();
  };

  /* 悬空 tab 防御：历史数据可能含指向已删除页面的标签（removePage 级联清理之前遗留），
   * 渲染/点击侧双重过滤，避免点死标签后页面区域全空白 */
  const validTabs = useMemo(
    () => activeTabs.filter((t) => pages.some((p) => p.id === t.pageId)),
    [activeTabs, pages]
  );

  /* 四方向滑入 + 展开（对标 m3e-canvas：slide 四向 / fade / expand / none）*/
  const variants = (
    {
      slide: {
        initial: { x: 375, opacity: 1 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -375, opacity: 0 },
      },
      'slide-up': {
        initial: { y: '100%', opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 1 },
      },
      'slide-down': {
        initial: { y: '-100%', opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 1 },
      },
      fade: {
        initial: { x: 0, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 0, opacity: 0 },
      },
      push: {
        initial: { x: -375, opacity: 1 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 375, opacity: 0 },
      },
      zoom: {
        initial: { scale: 0.55, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.55, opacity: 0 },
      },
      none: {
        initial: { x: 0, opacity: 1 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 0, opacity: 0 },
      },
    } as const
  )[anim] ?? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const exit = () => {
    if (previewSnapshot) exitPublishPreview();
    else setView('editor');
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-dot bg-[#eef0f4] pb-10 pt-6">
      {/* 顶栏信息 */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" className="bg-white" onClick={exit}>
          <X className="size-4" /> 退出预览
        </Button>
        <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 shadow-sm">
          {previewSnapshot ? (
            <>
              <Crown className="size-4 text-amber-500" />
              <span className="text-xs font-bold">{previewSnapshot.name}</span>
              <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-600">v1.{previewSnapshot.version}</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4 text-emerald-500" />
              <span className="text-xs font-semibold text-zinc-600">
                {project?.name} · 可交互预览：登录切换 / 输入 / 第三方授权 / 点击跳转
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="bg-white" disabled={!stack || stack.length < 2} onClick={back}>
            <Undo2 className="size-4" /> 返回
          </Button>
          <Button variant="outline" size="sm" className="bg-white" onClick={reset}>
            <RotateCcw className="size-4" /> 重置
          </Button>
        </div>
      </div>

      {/* 手机 */}
      <PhoneFrame theme={theme} pageBg={current?.background ?? '#f6f7fb'}>
        <div id="phone-screen" className="relative h-full overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={current?.id ?? 'none'}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'tween', duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 overflow-y-auto thin-scroll"
              style={anim === 'zoom' ? { transformOrigin: '50% 50%' } : undefined}
            >
              <BusScopeProvider value={current?.id ?? ''}>
              <WidgetToast />
              <div
                ref={contentRef}
                className={isFree ? 'relative w-full' : 'relative'}
                style={isFree ? { minHeight: freeHeight } : undefined}
              >
                {current?.components.filter((w: WidgetInstance) => !w.hidden).map((w: WidgetInstance) => {
                  const conn = connMap.get(`${w.id}|`);
                  const targetName = conn ? pages.find((p) => p.id === conn.toPageId)?.name : null;

                  /* tabbar 等复合组件：收集槽位级连接 */
                  const hasSlots = !!getWidget(w.type)?.slots;
                  const slotLinks: Record<string, ConnectionData> = {};
                  const slotHints: Record<string, string> = {};
                  if (hasSlots) {
                    connections.forEach((c) => {
                      if (c.fromPageId === current?.id && c.fromWidgetId === w.id && c.slot) {
                        slotLinks[c.slot] = c;
                        slotHints[c.slot] = pages.find((p) => p.id === c.toPageId)?.name ?? '';
                      }
                    });
                  }
                  const tabNav =
                    hasSlots && Object.keys(slotLinks).length > 0
                      ? (slot: string) => {
                          const c = slotLinks[slot];
                          if (c) navigateTab(c.toPageId, c.animation);
                        }
                      : undefined;

                  if (isFree) {
                    return (
                      <div
                        key={w.id}
                        data-free-item
                        data-y={w.y ?? 0}
                        className="absolute"
                        style={{ left: w.x ?? 0, top: w.y ?? 0, width: w.w ?? 355 }}
                      >
                        <WidgetRenderer
                          w={w}
                          interactive
                          free
                          onTap={conn ? () => navigate(conn.toPageId, conn.animation) : undefined}
                          targetHint={targetName}
                          tabNav={tabNav}
                          slotHints={slotHints}
                          navBack={navBack}
                          onLogout={logout}
                        />
                      </div>
                    );
                  }
                  return (
                    <WidgetRenderer
                      key={w.id}
                      w={w}
                      interactive
                      onTap={conn ? () => navigate(conn.toPageId, conn.animation) : undefined}
                      targetHint={targetName}
                      tabNav={tabNav}
                      slotHints={slotHints}
                      navBack={navBack}
                      onLogout={logout}
                    />
                  );
                })}
                {current && current.components.length === 0 && (
                  <div className="m-3 flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 text-zinc-400">
                    <p className="text-sm">「{current.name}」还没有内容</p>
                    <p className="text-xs">回到编辑器拖入组件</p>
                  </div>
                )}
                {!isFree && <div className="h-10" />}
              </div>
              </BusScopeProvider>
            </motion.div>
          </AnimatePresence>

          {/* App 级底部导航：点击换根切换整页（项目级配置，与无限画布/编辑器同步） */}
          {validTabs.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 z-30">
              <AppTabBar
                tabs={validTabs}
                activePageId={currentId}
                onSelect={(tab) => navigateTab(tab.pageId, 'fade')}
              />
            </div>
          )}
        </div>
      </PhoneFrame>

      {/* 页面快速跳转 */}
      <div className="mt-6 w-full max-w-2xl px-4">
        <p className="mb-2 text-center text-[11px] text-zinc-400">
          快速跳转页面（{pages.length} 个）· <MousePointerClick className="inline size-3" /> 带绿点标记的按钮已绑定跳转
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {pages.map((p, i) => {
            const active = p.id === current?.id;
            const bound = connections.some((c) => c.fromPageId === current?.id && c.toPageId === p.id);
            return (
              <button
                key={p.id}
                onClick={() => navigate(p.id, 'slide')}
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white hover:border-zinc-400'
                }`}
              >
                <span className={`tabular-nums ${active ? 'text-zinc-400' : 'text-zinc-400'}`}>{i + 1}</span>
                {p.name}
                {p.layout === 'free' && (
                  <span className={`rounded px-1 text-[9px] ${active ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'}`}>自由</span>
                )}
                {bound && <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-emerald-500'}`} title="与当前页有连接" />}
              </button>
            );
          })}
        </div>
        {current && (
          <p className="mt-3 text-center text-[11px] text-zinc-400">
            当前页面「{current.name}」· 转场：{ANIM_OPTS.find((a) => a.value === anim)?.label ?? anim} · 可跳转组件 {connMap.size} 个
          </p>
        )}
      </div>
    </div>
  );
}
