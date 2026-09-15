'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Undo2, RotateCcw, MousePointerClick, Crown, Sparkles,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { useInteractionBus } from '@/lib/interaction-bus';
import { getWidget } from '@/components/widgets/registry';
import { PhoneFrame } from './PhoneFrame';
import { WidgetRenderer } from './WidgetRenderer';
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
  const theme = previewSnapshot?.theme ?? project?.theme ?? { primary: '#f97316', radius: 'md' as const, dark: false };

  const [stack, setStack] = useState<string[] | null>(null);
  const [anim, setAnim] = useState('slide');

  const currentId = stack?.[stack.length - 1] ?? (previewSnapshot ? pages.find((p) => p.isHome)?.id ?? pages[0]?.id : storeCurrentPageId);
  const current = pages.find((p) => p.id === currentId);
  /* 自由布局但组件缺坐标（模板种子/旧数据未经编辑器迁移）：回退流式渲染，避免全部堆叠在 (0,0)。进入编辑器访问后会自动测量升级 */
  const isFree = current?.layout === 'free' && !missingFreeCoords(current?.components);

  /* 交互总线：切页/重置时清空，保证登录等联动状态从初始值开始 */
  const resetBus = useInteractionBus((s) => s.reset);
  useEffect(() => {
    resetBus();
  }, [currentId, resetBus]);

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
    return () => ro.disconnect();
  }, [isFree, pages, currentId]);

  const connMap = useMemo(() => {
    const map = new Map<string, ConnectionData>();
    connections.forEach((c) => {
      if (c.fromPageId === current?.id) map.set(`${c.fromWidgetId}|${c.slot ?? ''}`, c);
    });
    return map;
  }, [connections, current?.id]);

  const navigate = (pageId: string, animation: string) => {
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

  const reset = () => {
    setStack(null);
    setAnim('slide');
    resetBus();
  };

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
            </motion.div>
          </AnimatePresence>
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
