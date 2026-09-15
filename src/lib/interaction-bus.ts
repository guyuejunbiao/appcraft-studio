'use client';

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

/** 读取总线当前值（非响应式，用于事件回调） */
export const busGet = (key: string) => useInteractionBus.getState().values[key];

/** 条件显示判定：未配置频道 → 恒显示；配置了 → 频道值匹配才显示 */
export function busVisible(
  values: Record<string, string>,
  channel?: string,
  showValue?: string
): boolean {
  if (!channel || !showValue) return true;
  return values[channel] === showValue;
}
