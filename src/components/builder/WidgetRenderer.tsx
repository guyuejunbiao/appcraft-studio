'use client';

import { getWidget } from '@/components/widgets/registry';
import { useBusScope, useInteractionBus, busVisible } from '@/lib/interaction-bus';
import { SHADOW_FILTER, type WidgetInstance } from '@/lib/types';

const WIDTH_MAP: Record<NonNullable<WidgetInstance['width']>, string> = {
  full: '100%',
  'three-quarter': '75%',
  half: '50%',
  third: '33.33%',
};

const ALIGN_MAP: Record<NonNullable<WidgetInstance['align']>, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

interface WidgetRendererProps {
  w: WidgetInstance;
  /** 预览模式：绑定连接后点击跳转 */
  onTap?: () => void;
  /** 预览模式下悬浮提示（目标页面名） */
  targetHint?: string | null;
  /** 预览模式：启用可交互组件实现（登录切换/输入/第三方唤起等） */
  interactive?: boolean;
  /** 自由布局模式：按 x/y/w/h 绝对定位 */
  free?: boolean;
  /**
   * 画布联动模式（无限画布/编辑器画板专用）：
   * ① 应用总线显隐（编辑态也能真实预览互斥组件的联动效果）
   * ② 对标记 canvasInteractive 的组件挂载 Interactive 实现
   *   （如 login-tabs 在画板内点击即可切换密码/短信视图）
   */
  canvasLive?: boolean;
  /** 槽位导航（tabbar）：传入槽位 key，若绑定则换根跳页 */
  tabNav?: (slot: string) => void;
  /** 槽位压栈导航（宫格逐格跳页）：推入页面栈，返回可回来源页；返回值=是否已跳转（未绑定 false） */
  slotPush?: (slot: string) => boolean;
  /** 槽位绑定提示：slot key → 目标页名 */
  slotHints?: Record<string, string>;
  /** 页面栈回退（navbar 返回箭头）：预览容器注入 */
  navBack?: () => void;
  /** 退出登录（list-item 退出项确认后调用）：预览容器注入 */
  onLogout?: () => void;
}

/**
 * 渲染一个组件实例（编辑器与预览共用）
 * - 编辑画布：interactive=false，纯静态展示
 * - 预览：interactive=true，带 Interactive 实现与联动显隐
 * - 画布联动：canvasLive=true，总线显隐 + 联动源头组件可交互（按页面作用域隔离）
 */
export function WidgetRenderer({
  w, onTap, targetHint, interactive = false, free = false, canvasLive = false, tabNav, slotPush, slotHints, navBack, onLogout,
}: WidgetRendererProps) {
  const def = getWidget(w.type);
  const busValues = useInteractionBus((s) => s.values);
  const scope = useBusScope();

  if (!def) {
    return (
      <div className="mx-2.5 my-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-center text-xs text-zinc-400">
        未知组件 {w.type}
      </div>
    );
  }

  const merged = { ...def.defaultProps, ...w.props };

  /* 联动显隐：channel 加页面作用域前缀，不匹配时隐藏（编辑模式非 canvasLive 时恒显示） */
  const effChannel = merged.channel && scope ? `${scope}::${merged.channel}` : merged.channel;
  if ((interactive || canvasLive) && !busVisible(busValues, effChannel, merged.showValue)) {
    return null;
  }

  const Interactive = def.Interactive;
  const Live = interactive
    ? Interactive
    : canvasLive && def.canvasInteractive
      ? Interactive
      : null;
  const body = Live ? (
    <Live props={merged} onTap={onTap} targetHint={targetHint} tabNav={tabNav} slotPush={slotPush} slotHints={slotHints} navBack={navBack} onLogout={onLogout} />
  ) : (
    def.render(merged)
  );

  const inner = def.fullBleed ? body : <div className="px-2.5">{body}</div>;
  const hint =
    onTap && targetHint ? (
      <span className="pointer-events-none absolute -top-1.5 right-1.5 z-10 hidden items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow group-hover/rel:flex">
        → {targetHint}
      </span>
    ) : null;

  if (free) {
    return (
      <div
        className="group/rel relative"
        style={{
          width: typeof w.w === 'number' ? w.w : '100%',
          height: typeof w.h === 'number' ? w.h : undefined,
          overflow: typeof w.h === 'number' ? 'hidden' : undefined,
          opacity: w.opacity ?? 1,
          filter: w.shadow ? SHADOW_FILTER[w.shadow] : undefined,
        }}
      >
        <div
          className={onTap ? 'cursor-pointer tap-target' : undefined}
          style={onTap ? { width: '100%', height: '100%' } : undefined}
          onClick={onTap}
          role={onTap ? 'button' : undefined}
          aria-label={onTap ? `跳转到 ${targetHint ?? ''}` : undefined}
        >
          {inner}
        </div>
        {hint}
      </div>
    );
  }

  const width = WIDTH_MAP[w.width ?? 'full'];
  const isNarrow = (w.width ?? 'full') !== 'full';

  return (
    <div
      style={{
        marginTop: w.mt ?? 0,
        marginBottom: w.mb ?? 8,
        opacity: w.opacity ?? 1,
        filter: w.shadow ? SHADOW_FILTER[w.shadow] : undefined,
      }}
      className="group/rel relative"
    >
      <div
        className={onTap ? 'cursor-pointer transition-transform active:scale-[0.97] tap-target' : undefined}
        style={isNarrow ? { display: 'flex', justifyContent: ALIGN_MAP[w.align ?? 'left'] } : undefined}
        onClick={onTap}
        role={onTap ? 'button' : undefined}
        aria-label={onTap ? `跳转到 ${targetHint ?? ''}` : undefined}
      >
        <div style={{ width, maxWidth: '100%' }}>{inner}</div>
      </div>
      {hint}
    </div>
  );
}

/**
 * 仅渲染组件内容（不含外层包装），供画布自由布局使用：
 * 位置/大小由画布的拖拽包装层控制。
 */
export function WidgetInner({
  w, interactive = false, canvasLive = false, onTap, targetHint,
}: {
  w: WidgetInstance;
  interactive?: boolean;
  canvasLive?: boolean;
  onTap?: () => void;
  targetHint?: string | null;
}) {
  const def = getWidget(w.type);
  const busValues = useInteractionBus((s) => s.values);
  const scope = useBusScope();

  if (!def) {
    return (
      <div className="m-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-center text-xs text-zinc-400">
        未知组件 {w.type}
      </div>
    );
  }

  const merged = { ...def.defaultProps, ...w.props };
  const effChannel = merged.channel && scope ? `${scope}::${merged.channel}` : merged.channel;
  if ((interactive || canvasLive) && !busVisible(busValues, effChannel, merged.showValue)) {
    return null;
  }

  const Interactive = def.Interactive;
  const Live = interactive
    ? Interactive
    : canvasLive && def.canvasInteractive
      ? Interactive
      : null;
  const body = Live ? (
    <Live props={merged} onTap={onTap} targetHint={targetHint} />
  ) : (
    def.render(merged)
  );

  return def.fullBleed ? <>{body}</> : <div className="px-2.5">{body}</div>;
}
