'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck, CircleX, Info } from 'lucide-react';
import { create } from 'zustand';
import { useBusScope } from '@/lib/interaction-bus';

/**
 * 手机屏内 Toast（组件预览专用）：
 * 校验错误 / 发码成功 / 收到验证码等反馈，模拟真实 App 的 toast 提示。
 * 按「页面作用域」隔离：无限画布多画板同屏时 toast 只出现在触发的画板内。
 */

export type ToastKind = 'error' | 'success' | 'info';

interface ToastState {
  scope: string;
  msg: string;
  kind: ToastKind;
  seq: number;
  fire: (scope: string, msg: string, kind?: ToastKind) => void;
}

export const useWidgetToast = create<ToastState>((set) => ({
  scope: '',
  msg: '',
  kind: 'info',
  seq: 0,
  fire: (scope, msg, kind = 'info') =>
    set((s) => ({ scope, msg, kind, seq: s.seq + 1 })),
}));

/** 非 hook 便捷触发（事件回调内使用）：fireToast(scope, '请输入手机号', 'error') */
export const fireToast = (scope: string, msg: string, kind: ToastKind = 'info') =>
  useWidgetToast.getState().fire(scope, msg, kind);

/** 挂载点：页面滚动容器的直接子元素（sticky 吸顶），须位于 BusScopeProvider 内 */
export function WidgetToast() {
  const scope = useBusScope();
  const seq = useWidgetToast((s) => s.seq);
  const msg = useWidgetToast((s) => s.msg);
  const kind = useWidgetToast((s) => s.kind);
  const tScope = useWidgetToast((s) => s.scope);
  const [on, setOn] = useState(false);

  useEffect(() => {
    /* scope 不匹配或消息为空：显式收起（如编辑画布切页后旧 toast 残留），
     * 否则 on 停留 true 且 cleanup 已清掉复位定时器 → toast 永久显示 */
    if (tScope !== scope || !msg) {
      const raf = requestAnimationFrame(() => setOn(false));
      return () => cancelAnimationFrame(raf);
    }
    /* 下一帧再显示：避免 effect 内同步 setState 造成级联渲染（react-hooks 规则） */
    const raf = requestAnimationFrame(() => setOn(true));
    const t = setTimeout(() => setOn(false), 2000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [seq, tScope, scope, msg]);

  const Icon =
    kind === 'error' ? CircleX : kind === 'success' ? CircleCheck : Info;
  const iconColor =
    kind === 'error' ? 'text-rose-400' : kind === 'success' ? 'text-emerald-400' : 'text-sky-300';

  return (
    <div
      className="pointer-events-none sticky top-2 z-[75] flex justify-center px-6"
      aria-live="polite"
    >
      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ y: -16, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
            className="flex max-w-full items-center gap-1.5 rounded-full bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur"
          >
            <Icon className={`size-3.5 shrink-0 ${iconColor}`} />
            <span className="truncate">{msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
