'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { useBusScope } from '@/lib/interaction-bus';
import { fireToast, type ToastKind } from '@/lib/widget-toast';

/**
 * 全站组件交互基建（按钮/开关原地生效的公共能力）：
 * 用户核心诉求——「带按钮的必须原地有反应，功能开关必须原地切换，
 * 不允许死按钮，也不允许用跳页糊弄开关类交互」。
 *
 * 使用模式（与既有 Interactive 一致）：
 * - Interactive 组件内复制对应 render 的视觉结构（保视觉一致），把静态元素替换为可交互元素；
 * - 开关/双态（点赞、关注、收藏、签到…）：useLocalToggle + toast，原地翻转；
 * - 动作按钮（领取、结算、续费…）：useAction().run 呈现 loading→成功→回位，或直接 toast；
 * - 所有内部按钮必须 stopAct(e) 阻断冒泡（防止触发画布选中/整卡跳页）；
 * - 整卡跳页语义：有 onTap 先执行原互动，onTap 由外层点击（非内部按钮）触发。
 */

/** 阻断事件冒泡与默认行为（预览中点击组件内部按钮时防止误触画布拖拽/整卡 onTap） */
export function stopAct(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation();
  e.preventDefault();
}

/**
 * 通用按钮动作 hook：
 * - scope/toast：页面作用域屏内提示（无限画布多画板互不串扰）；
 * - busy：动作进行中（防重复提交，按钮置灰/转圈）；
 * - done：成功闪示（按钮短暂显示「完成」态后自动回位）；
 * - run(work?, delay?)：模拟请求时序 busy(默认600ms) → work() 回调（切状态/toast/跳页）→ done 闪示。
 */
export function useAction() {
  const scope = useBusScope();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toast = useCallback(
    (msg: string, kind: ToastKind = 'info') => fireToast(scope, msg, kind),
    [scope]
  );

  const run = useCallback(
    (work?: () => void, delay = 600, doneMs = 900) => {
      if (busy) return;
      setBusy(true);
      timers.current.push(
        setTimeout(() => {
          work?.();
          setBusy(false);
          setDone(true);
          timers.current.push(setTimeout(() => setDone(false), doneMs));
        }, delay)
      );
    },
    [busy]
  );

  return { scope, toast, busy, done, run };
}

/** 双态本地开关（点赞/关注/收藏/订阅…）：原地翻转；setOn 供受控场景 */
export function useLocalToggle(initial: boolean) {
  const [on, setOn] = useState(initial);
  const toggleOn = useCallback(() => setOn((v) => !v), []);
  return [on, toggleOn, setOn] as const;
}

/** 计数型双态（点赞数 ±1）：返回 [on, count, click] */
export function useLikeCount(initialOn: boolean, initialCount: number) {
  const [on, setOn] = useState(initialOn);
  const [count, setCount] = useState(initialCount);
  const click = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      setCount((c) => Math.max(0, c + (next ? 1 : -1)));
      return next;
    });
  }, []);
  return [on, count, click, setOn] as const;
}

/** 成功态小图标（busy 转圈 / done 对勾），按钮内部用 */
export function ActStatusIcon({ busy, done, className = 'size-4' }: { busy: boolean; done: boolean; className?: string }) {
  if (busy) return <LoaderCircle className={`${className} animate-spin`} />;
  if (done) return <Check className={className} />;
  return null;
}

/** 数字展示：超过 1w 显示 1.2w（社交计数惯例） */
export function fmtCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}w`;
  return String(n);
}
