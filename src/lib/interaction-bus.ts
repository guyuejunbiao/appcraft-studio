'use client';

import { useEffect } from 'react';
import { create } from 'zustand';

/**
 * 预览交互总线：让画布上互相独立的组件在预览时可以联动。
 * 典型场景：登录方式切换（login.login-tabs）把频道 'loginMode' 置为
 * 'left' / 'right'，而密码输入 / 验证码输入通过 channel + showValue
 * 订阅该频道实现真实显隐切换。
 */
interface BusState {
  values: Record<string, string>;
  set: (key: string, value: string) => void;
  reset: () => void;
}

export const useInteractionBus = create<BusState>((set) => ({
  values: {},
  set: (key, value) =>
    set((s) => ({ values: { ...s.values, [key]: value } })),
  reset: () => set({ values: {} }),
}));

/* 调试便捷入口（只读检查用） */
if (typeof window !== 'undefined') {
  (window as unknown as { __acBus: typeof useInteractionBus }).__acBus = useInteractionBus;
}

/** 读取总线当前值（非响应式，用于事件回调） */
export const busGet = (key: string) => useInteractionBus.getState().values[key];

/**
 * 频道源头组件（login-tabs / tabbar / sku-select 等）的默认值挂载：
 * 频道从未写入过时写入默认值，保证「初始选中态」与联动订阅方同步
 * （修复：tab 视觉选中「密码登录」，密码框却因总线为空被隐藏）。
 * 响应式触发——预览「重置」清空总线后也会自动恢复默认值。
 */
export function useChannelDefault(channel: string, value: string) {
  const current = useInteractionBus((s) => s.values[channel]);
  const set = useInteractionBus((s) => s.set);
  useEffect(() => {
    if (current === undefined) set(channel, value);
  }, [current, channel, value, set]);
}

/** 条件显示判定：
 *  - 未配置频道 → 恒显示；
 *  - 频道从未被写入（undefined）→ 恒显示（防御：页面上没有频道源头组件时不应永久消失）；
 *  - 已有值 → 匹配才显示 */
export function busVisible(
  values: Record<string, string>,
  channel?: string,
  showValue?: string
): boolean {
  if (!channel || !showValue) return true;
  const v = values[channel];
  if (v === undefined) return true;
  return v === showValue;
}
