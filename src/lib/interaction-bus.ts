'use client';

import { createContext, useCallback, useContext, useEffect } from 'react';
import { create } from 'zustand';

/**
 * 预览交互总线：让画布上互相独立的组件在预览时可以联动。
 * 典型场景：登录方式切换（login.login-tabs）把频道 'loginMode' 置为
 * 'left' / 'right'，而密码输入 / 验证码输入通过 channel + showValue
 * 订阅该频道实现真实显隐切换。
 *
 * 作用域隔离（重要）：总线 key 按「页面」加前缀（BusScopeProvider 提供
 * 页面 id）。无限画布多画板同屏渲染、预览跨页跳转时，各页面的联动状态
 * 互不串扰——修复：登录页切到「短信登录」后，注册页的密码框被全局残留
 * 的 loginMode='right' 错误隐藏。
 */
interface BusState {
  values: Record<string, string>;
  set: (key: string, value: string) => void;
  reset: () => void;
  /** 退出登录：清会话数据（user::* + 各页 password/smsCode/smsSent），保留页面级 UI 状态 */
  clearSession: () => void;
  /** 登录成功：作废全 App 所有待输入密钥（各页密码/验证码/发送记录）。
   *  正常 App 语义：会话建立后，任何登录表单都不应残留待用凭证。 */
  clearSecrets: () => void;
}

export const useInteractionBus = create<BusState>((set) => ({
  values: {},
  set: (key, value) =>
    set((s) => ({ values: { ...s.values, [key]: value } })),
  reset: () => set({ values: {} }),
  /* 退出登录：只清「会话数据」，保留页面级 UI 状态（loginMode/tab 选中/协议文案等）。
   * - user::* 全部清除（手机号/昵称/协议勾选等会话身份）
   * - 各页面的 password / smsCode / smsSent（页面级密钥与发送记录）清除
   * 正常 App 行为：退出登录回到登录页时，密码与验证码必须为空，手机号一般也清空。 */
  clearSession: () =>
    set((s) => {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(s.values)) {
        if (k.startsWith('user::')) continue;
        if (/::(password|smsCode|smsSent)$/.test(k)) continue;
        next[k] = v;
      }
      return { values: next };
    }),
  clearSecrets: () =>
    set((s) => {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(s.values)) {
        if (/::(password|smsCode|smsSent)$/.test(k)) continue;
        next[k] = v;
      }
      return { values: next };
    }),
}));

/* 调试便捷入口（只读检查用） */
if (typeof window !== 'undefined') {
  (window as unknown as { __acBus: typeof useInteractionBus }).__acBus = useInteractionBus;
}

const BusScopeCtx = createContext<string>('');

/** 总线作用域提供者：包住单页内容，value = 页面 id */
export const BusScopeProvider = BusScopeCtx.Provider;

/** 读取当前总线作用域（页面 id；空字符串 = 全局，仅渲染器计算 key 用） */
export function useBusScope(): string {
  return useContext(BusScopeCtx);
}

/** 频道 → 总线 key（带作用域前缀；空作用域 = 全局）。
 *  导出供需要手工拼接 key 读取 values 表的场景（如 PrimaryBtn 读页面级标记），
 * 确保读写两侧永远用同一规则（否则空作用域时读 `::ch` 写 `ch` 永久 miss）。 */
export const busKeyOf = (scope: string, channel: string) =>
  scope ? `${scope}::${channel}` : channel;

const busKey = busKeyOf;

/** 读取总线当前值（非响应式、全局作用域，仅调试/事件回调用） */
export const busGet = (key: string) => useInteractionBus.getState().values[key];

/** 订阅频道值（作用域感知，响应式） */
export function useChannelValue(channel: string): string | undefined {
  const scope = useContext(BusScopeCtx);
  return useInteractionBus((s) => s.values[busKey(scope, channel)]);
}

/** 写入频道（作用域感知）：组件内 `const setBus = useChannelSetter(); setBus('loginMode','right')` */
export function useChannelSetter() {
  const scope = useContext(BusScopeCtx);
  const rawSet = useInteractionBus((s) => s.set);
  return useCallback(
    (channel: string, value: string) => rawSet(busKey(scope, channel), value),
    [scope, rawSet]
  );
}

/**
 * 频道源头组件（login-tabs / tabbar / sku-select 等）的默认值挂载：
 * 频道从未写入过时写入默认值，保证「初始选中态」与联动订阅方同步
 * （修复：tab 视觉选中「密码登录」，密码框却因总线为空被隐藏）。
 * 响应式触发——预览「重置」清空总线后也会自动恢复默认值。
 */
export function useChannelDefault(channel: string, value: string) {
  const key = busKey(useContext(BusScopeCtx), channel);
  const current = useInteractionBus((s) => s.values[key]);
  const set = useInteractionBus((s) => s.set);
  useEffect(() => {
    if (current === undefined) set(key, value);
  }, [current, key, value, set]);
}

/** 条件显示判定（channel 需已带作用域前缀）：
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

/* ------------------------------------------------------------------ */
/* 用户数据频道（user:: 前缀，全局共享、跨页保留）                       */
/* 手机号 / 密码 / 验证码 / 协议勾选属于「用户会话数据」：               */
/* 登录页输入的手机号跳到注册页应自动带过（正常 App 行为）；             */
/* 而 loginMode 等页面级 UI 状态靠 scope 前缀天然跨页隔离，无需切页清理。 */
/* （勿引入「切页清总线」：子组件写入标记的 effect 先于父 effect 执行，   */
/*   清掉后依赖值未变化不会自愈，页面级标记会永久丢失——已踩坑）          */
/* ------------------------------------------------------------------ */

const userKey = (key: string) => `user::${key}`;

/** 读用户数据（响应式） */
export function useUserValue(key: string): string | undefined {
  return useInteractionBus((s) => s.values[userKey(key)]);
}

/** 写用户数据 */
export function useUserSetter() {
  const rawSet = useInteractionBus((s) => s.set);
  return useCallback(
    (key: string, value: string) => rawSet(userKey(key), value),
    [rawSet]
  );
}

/** 读用户数据（非响应式，事件回调内使用） */
export const userGet = (key: string) =>
  useInteractionBus.getState().values[userKey(key)];
