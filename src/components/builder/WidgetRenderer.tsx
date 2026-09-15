'use client';

import { getWidget } from '@/components/widgets/registry';
import { useInteractionBus, busVisible } from '@/lib/interaction-bus';
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
  /** 槽位导航（tabbar）：传入槽位 key，若绑定则换根跳页 */
  tabNav?: (slot: string) => void;
  /** 槽位绑定提示：slot key → 目标页名 */
  slotHints?: Record<string, string>;
}

/**
 * 渲染一个组件实例（编辑器与预览共用）
 * - 编辑画布：interactive=false，纯静态展示
 * - 预览：interactive=true，带 Interactive 实现与联动显隐
 */
export function WidgetRenderer({
  w, onTap, targetHint, interactive = false, free = false, tabNav, slotHints,
}: WidgetRendererProps) {
  const def = getWidget(w.type);
  const busValues = useInteractionBus((s) => s.values);

  if (!def) {
    return (
      <div className="mx-2.5 my-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-center text-xs text-zinc-400">
        未知组件 {w.type}
      </div>
    );
  }

  const merged = { ...def.defaultProps, ...w.props };

  /* 预览联动：channel + showValue 不匹配时隐藏（编辑模式恒显示） */
  if (interactive && !busVisible(busValues, merged.channel, merged.showValue)) {
    return null;
  }

  const Interactive = def.Interactive;
  const body =
    interactive && Interactive ? (
      <Interactive props={merged} onTap={onTap} targetHint={targetHint} tabNav={tabNav} slotHints={slotHints} />
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
  w, interactive = false, onTap, targetHint,
}: {
  w: WidgetInstance;
  interactive?: boolean;
  onTap?: () => void;
  targetHint?: string | null;
}) {
  const def = getWidget(w.type);
  const busValues = useInteractionBus((s) => s.values);

  if (!def) {
    return (
      <div className="m-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-center text-xs text-zinc-400">
        未知组件 {w.type}
      </div>
    );
  }

  const merged = { ...def.defaultProps, ...w.props };
  if (interactive && !busVisible(busValues, merged.channel, merged.showValue)) {
    return null;
  }

  const Interactive = def.Interactive;
  const body =
    interactive && Interactive ? (
      <Interactive props={merged} onTap={onTap} targetHint={targetHint} />
    ) : (
      def.render(merged)
    );

  return def.fullBleed ? <>{body}</> : <div className="px-2.5">{body}</div>;
}
