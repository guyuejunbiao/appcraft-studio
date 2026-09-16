'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Lock, Smartphone, ShieldCheck, Eye, EyeOff, LoaderCircle, Check,
  MessageCircle, Apple, Chrome, Mail, CircleCheck, CircleX, Fingerprint,
  Signal, Wifi, BatteryFull, Bell, Copy as CopyIcon,
  Home, LayoutGrid, Compass, UserRound, Settings, BookUser,
  Minus, Plus, Search, X,
} from 'lucide-react';
import { useChannelDefault, useChannelSetter, useChannelValue, useBusScope, useUserValue, useUserSetter, userGet, busGet, useInteractionBus, busKeyOf } from '@/lib/interaction-bus';
import { fireToast } from '@/lib/widget-toast';
import type { InteractiveCtx } from '@/lib/widget-types';

/** 中国大陆手机号格式（正常登录流程的第一道校验） */
const isPhoneValid = (v: string) => /^1[3-9]\d{9}$/.test(v);

/* ------------------------------------------------------------------ */
/* 登录方式切换：点击后真实切换，并通过总线联动其它组件的显隐           */
/* ------------------------------------------------------------------ */
export function LoginTabsInteractive({ props }: InteractiveCtx) {
  const channel = String(props.channel || 'loginMode');
  const value = useChannelValue(channel);
  const setBus = useChannelSetter();
  const active = value ?? String(props.active ?? 'left');
  /* 频道默认值：保证初始「选中项」与密码/验证码框的显隐联动同步（修复初始密码框消失） */
  useChannelDefault(channel, String(props.active ?? 'left'));

  return (
    <div className="w-chip flex rounded-full p-1" style={{ borderRadius: '999px' }}>
      <div className="relative flex flex-1">
        <motion.span
          className="absolute inset-y-0 rounded-full"
          style={{
            width: '50%',
            background: 'var(--p)',
            boxShadow: '0 2px 8px color-mix(in srgb, var(--p) 45%, transparent)',
          }}
          animate={{ x: active === 'right' ? '100%' : '0%' }}
          transition={{ type: 'spring', stiffness: 520, damping: 38 }}
        />
        {(['left', 'right'] as const).map((k) => {
          const isActive = active === k;
          return (
            <button
              key={k}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBus(channel, k);
              }}
              className="relative z-10 flex-1 py-2 text-center text-[13px] font-semibold transition-colors"
              style={isActive ? { color: 'var(--pf)' } : { opacity: 0.55 }}
            >
              {k === 'left' ? props.left : props.right}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 手机号输入：预览中可真实输入；值存总线 user::phone（跨页保留）       */
/* 号段校验：11 位且 1[3-9] 开头才亮绿勾，格式错亮红叉                 */
/* ------------------------------------------------------------------ */
export function PhoneInputInteractive({ props }: InteractiveCtx) {
  const setUser = useUserSetter();
  const val = useUserValue('phone') ?? '';
  const full = val.length === 11;
  const valid = isPhoneValid(val);
  /* 页面级标记：登录按钮据此校验手机号 */
  useChannelDefault('hasPhone', '1');
  return (
    <div className="w-input flex h-11 items-center gap-2.5 px-3" style={{ borderRadius: 'var(--pr)' }}>
      <Smartphone className="size-4 opacity-45" />
      <span className="text-sm font-semibold opacity-75">{props.prefix}</span>
      <span className="h-4 w-px w-line border-l" />
      <input
        value={val}
        onChange={(e) => setUser('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
        placeholder={props.placeholder}
        inputMode="numeric"
        aria-label="手机号"
        className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
      />
      {full && valid && <CircleCheck className="size-4" style={{ color: 'var(--p)' }} />}
      {full && !valid && <CircleX className="size-4 text-rose-500" />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 密码输入：可输入 + 小眼睛真实切换明文/密文；值存 user::password      */
/* （修复：去掉与密文圆点重复的 •••• 装饰；tab 切换重挂载不再丢输入）   */
/* ------------------------------------------------------------------ */
export function PasswordInputInteractive({ props }: InteractiveCtx) {
  const setUser = useUserSetter();
  const val = useUserValue('password') ?? '';
  const [show, setShow] = useState(false);
  /* 页面级标记：登录按钮据此校验密码 */
  useChannelDefault('hasPassword', '1');
  return (
    <div className="w-input flex h-11 items-center gap-2.5 px-3" style={{ borderRadius: 'var(--pr)' }}>
      <Lock className="size-4 opacity-45" />
      <input
        type={show ? 'text' : 'password'}
        value={val}
        onChange={(e) => setUser('password', e.target.value)}
        placeholder={props.placeholder}
        aria-label="密码"
        className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
      />
      {props.eye !== false && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShow((v) => !v);
          }}
          className="opacity-60 transition-opacity hover:opacity-100"
          aria-label={show ? '隐藏密码' : '显示密码'}
        >
          {show ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 验证码输入：真实倒计时 + 模拟短信回填；值存 user::smsCode           */
/* 正常流程：发码前校验手机号（未填/格式错 → toast 拦截）              */
/* ------------------------------------------------------------------ */
const MOCK_SMS_CODE = '284616';

export function SmsInputInteractive({ props }: InteractiveCtx) {
  const scope = useBusScope();
  const setUser = useUserSetter();
  const code = useUserValue('smsCode') ?? '';
  const [left, setLeft] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /* 页面级标记：登录按钮据此校验验证码 */
  useChannelDefault('hasSms', '1');

  const counting = left > 0;
  useEffect(() => {
    if (!counting) return;
    const iv = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(iv);
  }, [counting]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const send = () => {
    if (left > 0) return;
    /* 正常流程：先校验手机号再发码 */
    const phone = userGet('phone') ?? '';
    if (!phone) {
      fireToast(scope, '请先输入手机号', 'error');
      return;
    }
    if (!isPhoneValid(phone)) {
      fireToast(scope, '手机号格式不正确，请检查后重试', 'error');
      return;
    }
    setLeft(60);
    fireToast(scope, '验证码已发送，请注意查收', 'success');
    timers.current.push(
      setTimeout(() => {
        // 模拟收到短信，自动填充验证码
        setUser('smsCode', MOCK_SMS_CODE);
        fireToast(scope, `收到验证码 ${MOCK_SMS_CODE}，已自动填入`, 'info');
      }, 1100)
    );
  };

  return (
    <div className="w-input flex h-11 items-center gap-2 pl-3 pr-1" style={{ borderRadius: 'var(--pr)' }}>
      <ShieldCheck className="size-4 opacity-45" />
      <input
        value={code}
        onChange={(e) => setUser('smsCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder={props.placeholder}
        inputMode="numeric"
        aria-label="验证码"
        className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          send();
        }}
        className="flex h-8 shrink-0 items-center px-3 text-xs font-semibold disabled:opacity-60"
        style={{
          borderRadius: 'calc(var(--pr) - 4px)',
          background: left > 0 ? 'transparent' : 'var(--p)',
          color: left > 0 ? 'var(--p)' : 'var(--pf)',
          border: left > 0 ? '1px solid var(--p)' : 'none',
        }}
      >
        {left > 0 ? `${left}s 后重发` : props.btnText}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 登录按钮：正常登录流程的完整校验引擎                                */
/* 手机号 → 密码/验证码（按页面输入组合自动判定模式）→ 协议弹窗拦截    */
/* → loading → 成功 → 跳转；错误逐项 toast 提示。                      */
/* 页面无输入组件时保持旧行为（直接 loading → 成功），旧项目零破坏。    */
/* ------------------------------------------------------------------ */
export function PrimaryBtnInteractive({ props, onTap }: InteractiveCtx) {
  const scope = useBusScope();
  const setUser = useUserSetter();
  const [st, setSt] = useState<'idle' | 'loading' | 'done'>('idle');
  const [askAgree, setAskAgree] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* 页面输入组合（响应式：loginMode 驱动模式判定；hasXxx 由兄弟输入组件挂载后写入总线） */
  const loginMode = useChannelValue('loginMode');
  const busValues = useInteractionBus((s) => s.values);

  /** 校验模式：tabs 优先；无 tabs 时按挂载的输入组件组合推断（双输入 = 注册场景） */
  const modeOf = (hasPwd: boolean, hasSms: boolean): 'pwd' | 'sms' | 'reg' | 'none' => {
    if (loginMode === 'right') return 'sms';
    if (loginMode === 'left') return 'pwd';
    if (hasPwd && hasSms) return 'reg';
    if (hasPwd) return 'pwd';
    if (hasSms) return 'sms';
    return 'none';
  };
  /* key 拼接统一用 busKeyOf：与 useChannelDefault 写入侧同规则，空作用域时才不会永久 miss */
  const hasPwd = busValues[busKeyOf(scope, 'hasPassword')] !== undefined;
  const hasSms = busValues[busKeyOf(scope, 'hasSms')] !== undefined;
  const mode = modeOf(hasPwd, hasSms);
  const isReg = mode === 'reg';

  const doLogin = () => {
    setSt('loading');
    timers.current.push(
      setTimeout(() => {
        setSt('done');
        timers.current.push(
          setTimeout(() => {
            setSt('idle');
            onTap?.();
          }, 700)
        );
      }, 900)
    );
  };

  const click = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (st !== 'idle') return;

    /* ① 手机号（页面挂载了手机号输入才校验） */
    const phone = userGet('phone') ?? '';
    const hasPhone = busValues[busKeyOf(scope, 'hasPhone')] !== undefined;
    if (hasPhone) {
      if (!phone) {
        fireToast(scope, '请输入手机号', 'error');
        return;
      }
      if (!isPhoneValid(phone)) {
        fireToast(scope, '请输入正确的手机号', 'error');
        return;
      }
    }

    /* ② 验证码 / 密码（按模式；校验顺序跟随表单视觉顺序：验证码框在密码框上方） */
    const password = userGet('password') ?? '';
    const smsCode = userGet('smsCode') ?? '';
    if (mode === 'sms' || mode === 'reg') {
      if (!smsCode) {
        fireToast(scope, '请输入验证码', 'error');
        return;
      }
      if (smsCode.length < 6) {
        fireToast(scope, '请输入 6 位验证码', 'error');
        return;
      }
    }
    if (mode === 'pwd' || mode === 'reg') {
      if (!password) {
        fireToast(scope, isReg ? '请设置登录密码' : '请输入密码', 'error');
        return;
      }
      if (password.length < 6) {
        fireToast(scope, '密码至少 6 位，请重新输入', 'error');
        return;
      }
    }

    /* ③ 协议（页面挂载了协议组件且未勾选 → 微信式确认弹窗） */
    const hasAgreement = busValues[busKeyOf(scope, 'hasAgreement')] !== undefined;
    if (hasAgreement && userGet('agreed') !== '1') {
      setAskAgree(true);
      return;
    }

    doLogin();
  };

  const agreeAndGo = () => {
    setUser('agreed', '1');
    setAskAgree(false);
    doLogin();
  };

  const loadingText = isReg ? '正在注册…' : '正在登录…';
  const doneText = String(props.successText || '') || (isReg ? '注册成功' : '登录成功');

  /* 协议确认弹窗（微信式底部面板，覆盖整个手机屏） */
  const wrapBook = (s: string) => (s.includes('《') ? s : `《${s}》`);
  let links: string[] = ['《用户协议》', '《隐私政策》'];
  try {
    const raw = busValues[busKeyOf(scope, 'agreementLinks')];
    if (raw) links = JSON.parse(raw) as string[];
  } catch { /* 保持默认 */ }

  const dialog =
    askAgree && typeof document !== 'undefined'
      ? createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-[85] flex flex-col justify-end bg-black/50"
            onClick={() => setAskAgree(false)}
            role="dialog"
            aria-modal="true"
            aria-label="同意协议确认"
          >
            <motion.div
              initial={{ y: 220 }}
              animate={{ y: 0 }}
              exit={{ y: 220 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="rounded-t-3xl bg-white px-5 pb-8 pt-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-200" />
              <h3 className="text-center text-base font-bold text-zinc-900">服务协议及隐私保护</h3>
              <p className="mt-2.5 text-center text-xs leading-5 text-zinc-500">
                为了更好地保障您的合法权益，请阅读并同意以下协议
                <span className="text-zinc-400">{wrapBook(links[0] ?? '《用户协议》')}{wrapBook(links[1] ?? '《隐私政策》')}</span>
              </p>
              <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-500">
                <span style={{ color: 'var(--p)' }}>{wrapBook(links[0] ?? '《用户协议》')}</span>
                与
                <span style={{ color: 'var(--p)' }}>{wrapBook(links[1] ?? '《隐私政策》')}</span>
                约定了您对本服务的使用规范与个人信息处理方式，请务必仔细阅读并充分理解相关条款。
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAskAgree(false)}
                  className="h-11 flex-1 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-500 transition-transform active:scale-[0.97]"
                >
                  不同意
                </button>
                <button
                  type="button"
                  onClick={agreeAndGo}
                  className="flex h-11 flex-[1.6] items-center justify-center gap-1.5 rounded-full text-sm font-bold text-white shadow-md transition-transform active:scale-[0.97]"
                  style={{ background: 'var(--p)', color: 'var(--pf)' }}
                >
                  <Check className="size-4" /> 同意并继续
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.getElementById('phone-screen') ?? document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={click}
        className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-bold shadow-md transition-transform active:scale-[0.98]"
        style={{ borderRadius: 'var(--pr)', background: 'var(--p)', color: 'var(--pf)' }}
      >
        {st === 'loading' ? (
          <><LoaderCircle className="size-4 animate-spin" /> {loadingText}</>
        ) : st === 'done' ? (
          <><Check className="size-4" /> {doneText}</>
        ) : (
          <><Lock className="size-4" /> {props.text}{props.sub ? <span className="text-xs font-normal opacity-70">{props.sub}</span> : null}</>
        )}
      </button>
      {dialog}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 协议勾选：真实可勾选；勾选状态存 user::agreed（跨页共享）           */
/* 并上报 hasAgreement 标记 + 协议文案，供登录按钮拦截与弹窗展示       */
/* ------------------------------------------------------------------ */
export function AgreementCheckInteractive({ props }: InteractiveCtx) {
  const scope = useBusScope();
  const setBus = useChannelSetter();
  const setUser = useUserSetter();
  const agreedRaw = useUserValue('agreed');
  const checked = agreedRaw === '1';
  /* 页面级标记：登录按钮据此决定是否拦截 + 弹协议确认框 */
  useChannelDefault('hasAgreement', '1');

  /* 协议文案写入总线（供确认弹窗展示），值变化时才写，避免死循环 */
  const linksPayload = JSON.stringify([String(props.link1 ?? '用户协议'), String(props.link2 ?? '隐私政策')]);
  useEffect(() => {
    if (busGet(`${scope}::agreementLinks`) !== linksPayload) setBus('agreementLinks', linksPayload);
  }, [scope, linksPayload, setBus]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setUser('agreed', checked ? '0' : '1');
      }}
      className="flex items-start gap-2 px-0.5 text-left"
      aria-checked={checked}
      role="checkbox"
    >
      <span
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors"
        style={{
          borderColor: 'var(--p)',
          background: checked ? 'var(--p)' : 'transparent',
        }}
      >
        {checked && <Check className="size-3 text-white" strokeWidth={3.5} />}
      </span>
      <p className="text-[11px] leading-4 opacity-55">
        {props.text}
        <span style={{ color: 'var(--p)' }}>{props.link1}</span>
        <span className="opacity-55">和</span>
        <span style={{ color: 'var(--p)' }}>{props.link2}</span>
      </p>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 第三方登录：模拟真机唤起第三方 App → 品牌授权页 → 返回应用          */
/* ------------------------------------------------------------------ */

type BrandKey = 'wechat' | 'apple' | 'browser' | 'mail' | 'phone';

const BRANDS: Record<BrandKey, { label: string; color: string; dark?: boolean }> = {
  wechat: { label: '微信', color: '#07c160' },
  apple: { label: 'Apple', color: '#101013', dark: true },
  browser: { label: '浏览器', color: '#3f3f46' },
  mail: { label: '邮件', color: '#f59e0b' },
  phone: { label: '一键登录', color: '#0f9d58' },
};

const BRAND_ICONS: Record<BrandKey, typeof MessageCircle> = {
  wechat: MessageCircle,
  apple: Apple,
  browser: Chrome,
  mail: Mail,
  phone: Smartphone,
};

type Phase = 'idle' | 'splash' | 'auth' | 'granting' | 'success' | 'denied';

export function SocialRowInteractive({ props, onTap }: InteractiveCtx) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [brand, setBrand] = useState<BrandKey | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const launch = (key: BrandKey) => {
    if (phase !== 'idle') return;
    setBrand(key);
    setPhase('splash');
    later(() => setPhase('auth'), 850);
  };

  const agree = () => {
    setPhase('granting');
    later(() => {
      setPhase('success');
      later(() => {
        setPhase('idle');
        setBrand(null);
        onTap?.();
      }, 950);
    }, 850);
  };

  const deny = () => {
    setPhase('denied');
    later(() => {
      setPhase('idle');
      setBrand(null);
    }, 750);
  };

  const items = ([
    ['showWechat', 'wechat'],
    ['showApple', 'apple'],
    ['showWeb', 'browser'],
    ['showMail', 'mail'],
    ['showPhone', 'phone'],
  ] as const)
    .filter(([k]) => props[k] !== false)
    .map(([, key]) => key);

  const row = (
    <div className="flex items-center justify-center gap-4 py-1.5">
      {items.map((key) => {
        const Icon = BRAND_ICONS[key];
        const b = BRANDS[key];
        return (
          <button
            key={key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              launch(key);
            }}
            className="flex touch-manipulation flex-col items-center gap-1.5 transition-transform active:scale-90"
          >
            <span
              className="flex size-11 items-center justify-center rounded-full border w-line shadow-sm transition-colors"
              style={{ background: `${b.color}14`, borderColor: `${b.color}30` }}
            >
              <Icon className="size-5" style={{ color: b.color }} />
            </span>
            <span className="text-[10px] opacity-45">
              {key === 'phone' ? '本机号码' : b.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  if (phase === 'idle' || !brand) return row;

  const b = BRANDS[brand];
  const appName = String(props.appName || '星云 App');

  /* 唤起 / 授权 全屏覆盖层（挂载到手机屏幕容器） */
  const overlay = (
    <AnimatePresence>
      <motion.div
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 z-[80] flex flex-col overflow-hidden"
        style={{ background: phase === 'splash' ? '#000' : b.dark ? '#0a0a0c' : '#f4f5f7' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 仿系统状态栏 */}
        <div
          className="flex h-12 shrink-0 items-center justify-between px-7 pt-2 text-[13px] font-semibold"
          style={{ color: phase === 'splash' || b.dark ? '#fff' : '#111' }}
        >
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </div>
        </div>

        {phase === 'splash' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-white">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="flex size-20 items-center justify-center rounded-[22px] shadow-2xl"
              style={{ background: b.color }}
            >
              {(() => {
                const Icon = BRAND_ICONS[brand];
                return <Icon className="size-10 text-white" />;
              })()}
            </motion.div>
            <p className="text-lg font-bold">{BRANDS[brand].label}</p>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <LoaderCircle className="size-3.5 animate-spin" />
              正在打开「{BRANDS[brand].label}」…
            </div>
            <p className="absolute bottom-10 text-[10px] text-white/35">模拟真机唤起 · 演示环境</p>
          </div>
        )}

        {(phase === 'auth' || phase === 'granting') && (
          <AuthSheet
            brand={brand}
            color={b.color}
            dark={!!b.dark}
            appName={appName}
            busy={phase === 'granting'}
            onAgree={agree}
            onDeny={deny}
          />
        )}

        {phase === 'success' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            >
              <CircleCheck className="size-16" style={{ color: b.color }} />
            </motion.div>
            <p className={`text-base font-bold ${b.dark ? 'text-white' : 'text-zinc-900'}`}>
              授权成功
            </p>
            <p className={`text-xs ${b.dark ? 'text-white/50' : 'text-zinc-500'}`}>正在返回 {appName}…</p>
          </div>
        )}

        {phase === 'denied' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
              <CircleX className="size-14 text-zinc-400" />
            </motion.div>
            <p className={`text-sm font-semibold ${b.dark ? 'text-white/80' : 'text-zinc-600'}`}>已取消授权</p>
          </div>
        )}

        {/* 仿 Home 条 */}
        <div className="flex h-6 shrink-0 items-center justify-center">
          <div className={`h-1 w-32 rounded-full ${b.dark || phase === 'splash' ? 'bg-white/35' : 'bg-black/25'}`} />
        </div>
      </motion.div>
    </AnimatePresence>
  );

  const target = typeof document !== 'undefined' ? document.getElementById('phone-screen') : null;
  const overlayNode = target ? createPortal(overlay, target) : null;

  return (
    <>
      {row}
      {overlayNode}
    </>
  );
}

/** 第三方品牌授权页 */
function AuthSheet({
  brand, color, dark, appName, busy, onAgree, onDeny,
}: {
  brand: BrandKey;
  color: string;
  dark: boolean;
  appName: string;
  busy: boolean;
  onAgree: () => void;
  onDeny: () => void;
}) {
  const BrandIcon = BRAND_ICONS[brand];
  const textColor = dark ? 'text-white' : 'text-zinc-900';
  const subText = dark ? 'text-white/55' : 'text-zinc-500';

  const scopes =
    brand === 'phone'
      ? ['获取你的手机号（加密）', '获取你的昵称与头像']
      : brand === 'mail'
        ? ['获取你的邮箱地址', '获取你的公开资料']
        : brand === 'apple'
          ? ['获取你的姓名', '获取你的邮箱（可隐藏）']
          : ['获取你的昵称、头像', '获取你的地区与性别'];

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${dark ? 'bg-[#0a0a0c]' : 'bg-[#f4f5f7]'}`}>
      {/* 品牌导航栏 */}
      <div
        className="flex shrink-0 items-center gap-2 px-4 py-3"
        style={{ background: dark ? 'transparent' : color, color: dark ? '#fff' : '#fff' }}
      >
        <BrandIcon className="size-5" />
        <span className="text-sm font-bold">
          {brand === 'phone' ? '运营商一键登录' : `${BRANDS[brand].label}授权`}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 thin-scroll">
        {/* 应用卡片 */}
        <div className={`flex items-center gap-3 rounded-2xl p-3.5 shadow-sm ${dark ? 'bg-white/10' : 'bg-white'}`}>
          <span
            className="flex size-12 items-center justify-center rounded-[14px] text-lg font-black text-white shadow"
            style={{ background: 'var(--p)' }}
          >
            {appName.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`truncate text-sm font-bold ${textColor}`}>{appName}</p>
            <p className={`text-[11px] ${subText}`}>申请获取以下权限</p>
          </div>
          <Bell className={`size-4 ${subText}`} />
        </div>

        {/* 权限清单 */}
        <div className={`mt-3 rounded-2xl p-1 ${dark ? 'bg-white/10' : 'bg-white'}`}>
          {scopes.map((s, i) => (
            <div key={s} className={`flex items-center gap-2.5 px-3 py-3 ${i > 0 ? (dark ? 'border-t border-white/10' : 'border-t border-zinc-100') : ''}`}>
              <ShieldCheck className="size-4 shrink-0" style={{ color }} />
              <span className={`flex-1 text-xs font-medium ${textColor}`}>{s}</span>
              <span className={`text-[10px] ${subText}`}>授权后可获得</span>
            </div>
          ))}
        </div>

        {brand === 'phone' && (
          <div className={`mt-3 rounded-2xl p-4 text-center ${dark ? 'bg-white/10' : 'bg-white'}`}>
            <p className={`text-[11px] ${subText}`}>中国联通 · 本机号码</p>
            <p className={`mt-1 text-xl font-extrabold tracking-wider ${textColor}`}>138****8000</p>
          </div>
        )}

        {brand === 'apple' && (
          <div className="mt-4 flex flex-col items-center gap-2 py-2">
            <Fingerprint className="size-10 text-white/70" />
            <p className="text-xs text-white/50">通过 Face ID 确认身份</p>
          </div>
        )}

        {brand === 'mail' && (
          <div className={`mt-3 flex items-center gap-2 rounded-2xl px-3.5 py-3 ${dark ? 'bg-white/10' : 'bg-white'}`}>
            <Mail className="size-4" style={{ color }} />
            <span className={`flex-1 text-sm font-medium ${textColor}`}>user@example.com</span>
            <CopyIcon className={`size-3.5 ${subText}`} />
          </div>
        )}

        <p className={`mt-3 px-1 text-[10px] leading-4 ${subText}`}>
          授权代表你已同意 {BRANDS[brand].label} 与 {appName} 的用户协议及隐私政策，仅演示不会真实授权。
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="shrink-0 space-y-2 px-4 pb-4 pt-1">
        {brand === 'apple' ? (
          <button
            type="button"
            disabled={busy}
            onClick={onAgree}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-bold text-black shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Apple className="size-4" />}
            {busy ? '确认中…' : '通过 Face ID 继续'}
          </button>
        ) : (
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={onDeny}
              className={`h-12 flex-1 rounded-full text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-60 ${
                dark ? 'bg-white/10 text-white/80' : 'border border-zinc-200 bg-white text-zinc-600'
              }`}
            >
              拒绝
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onAgree}
              className="flex h-12 flex-[1.6] items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70"
              style={{ background: color }}
            >
              {busy ? (
                <><LoaderCircle className="size-4 animate-spin" /> 授权中…</>
              ) : brand === 'phone' ? (
                '本机号码一键登录'
              ) : (
                '同意授权'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


/* ================================================================== */
/* 以下为通用交互实现（tabbar / 步进器 / SKU / 表单 / 按钮 / 搜索）      */
/* ================================================================== */

/** 逗号分隔解析（与组件 render 内一致） */
const splitListI = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,]/).map((s) => s.trim()).filter(Boolean);

/* ------------------------------------------------------------------ */
/* 底部导航（fn.tabbar）：真实切换激活项 + 交互总线联动 + 槽位换根跳页  */
/* ------------------------------------------------------------------ */

const TAB_ICONS_I = [Home, LayoutGrid, Compass, UserRound, Bell, Settings];

export function FnTabbarInteractive({ props, tabNav }: InteractiveCtx) {
  const lid = useId();
  const setBus = useChannelSetter();
  const channel = String(props.channel || 'tab');
  const tabs = useMemo(() => splitListI(props.items), [props.items]);

  const [localActive, setLocalActive] = useState(() => {
    const a = Math.round(Number(props.active) || 0);
    return Math.max(0, Math.min(Math.max(tabs.length - 1, 0), a));
  });
  /* 频道默认值：初始选中项同步到总线（订阅 tab 频道显隐的组件初始即可见） */
  useChannelDefault(channel, String(localActive));
  /* 回读总线：页面重挂载（预览跳转/返回）后总线保留点击态，
   * 视觉选中必须以总线为准，否则 tabbar 显示 tab 0 而联动内容停留在其他 tab（与 LoginTabs 同款修复） */
  const busVal = useChannelValue(channel);
  const active = useMemo(() => {
    const n = Math.round(Number(busVal));
    if (busVal !== undefined && !Number.isNaN(n)) {
      return Math.max(0, Math.min(Math.max(tabs.length - 1, 0), n));
    }
    return localActive;
  }, [busVal, tabs.length, localActive]);

  const switchTab = (i: number) => {
    if (i === active) return;
    setLocalActive(i);
    setBus(channel, String(i));
    tabNav?.(String(i));
  };

  return (
    <div className="w-card flex border-t w-line" style={{ borderRadius: 'var(--pr) var(--pr) 0 0' }}>
      {tabs.map((label, i) => {
        const on = i === active;
        const Icon = TAB_ICONS_I[i % TAB_ICONS_I.length] || Home;
        return (
          <button
            key={`${i}-${label}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              switchTab(i);
            }}
            aria-pressed={on}
            className="flex flex-1 flex-col items-center gap-1 pb-2 pt-1.5 transition-transform active:scale-90"
          >
            {on ? (
              <motion.span
                layoutId={`${lid}-dot`}
                className="size-1 rounded-full"
                style={{ background: 'var(--p)' }}
                transition={{ type: 'spring', stiffness: 520, damping: 36 }}
              />
            ) : (
              <span className="size-1 rounded-full bg-transparent" />
            )}
            <Icon
              className={`size-5 shrink-0 transition-opacity ${on ? '' : 'opacity-45'}`}
              style={on ? { color: 'var(--p)' } : undefined}
            />
            <span
              className={`text-[10px] transition-opacity ${on ? 'font-semibold' : 'opacity-45'}`}
              style={on ? { color: 'var(--p)' } : undefined}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 聊天底部导航（chat.tabbar）：真实切换 + 总线联动 + 槽位换根跳页      */
/* ------------------------------------------------------------------ */

const CHAT_TABS_I = [
  { key: 'msg', label: '消息', icon: MessageCircle, badge: true },
  { key: 'contacts', label: '通讯录', icon: BookUser, badge: false },
  { key: 'discover', label: '发现', icon: Compass, badge: false },
  { key: 'me', label: '我', icon: UserRound, badge: false },
];

export function ChatTabbarInteractive({ props, tabNav }: InteractiveCtx) {
  const setBus = useChannelSetter();
  const channel = String(props.channel || 'chatTab');
  const [localActive, setLocalActive] = useState(() =>
    CHAT_TABS_I.some((t) => t.key === props.active) ? String(props.active) : 'msg'
  );
  /* 频道默认值：初始选中项同步到总线 */
  useChannelDefault(channel, localActive);
  /* 回读总线：页面重挂载后选中态以总线为准（与 LoginTabs 同款修复） */
  const busVal = useChannelValue(channel);
  const active = busVal !== undefined && CHAT_TABS_I.some((t) => t.key === busVal) ? busVal : localActive;

  const switchTab = (key: string) => {
    if (key === active) return;
    setLocalActive(key);
    setBus(channel, key);
    tabNav?.(key);
  };

  return (
    <div className="w-card flex border-t w-line">
      {CHAT_TABS_I.map(({ key, label, icon: Icon, badge }) => {
        const on = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              switchTab(key);
            }}
            aria-pressed={on}
            className="flex flex-1 flex-col items-center gap-1 pb-1.5 pt-2 transition-transform active:scale-90"
          >
            <span className="relative" style={on ? { color: 'var(--p)' } : undefined}>
              <Icon
                className="size-[22px] transition-opacity"
                style={{ opacity: on ? 1 : 0.4 }}
              />
              {badge && <span className="absolute -right-1.5 -top-0.5 size-2 rounded-full bg-rose-500" />}
            </span>
            <span
              className={`text-[10px] transition-opacity ${on ? 'font-semibold' : 'opacity-40'}`}
              style={on ? { color: 'var(--p)' } : undefined}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 数量步进器（shop.qty-stepper）：真实加减 + 写入总线                 */
/* ------------------------------------------------------------------ */

export function QtyStepperInteractive({ props }: InteractiveCtx) {
  const setBus = useChannelSetter();
  const channel = String(props.channel || 'qty');
  const [localCount, setLocalCount] = useState(() => Math.max(1, Math.min(99, Math.round(Number(props.value) || 1))));
  /* 频道默认值：初始数量同步到总线 */
  useChannelDefault(channel, String(localCount));
  /* 回读总线：页面重挂载后数量以总线为准（与 LoginTabs 同款修复） */
  const busVal = useChannelValue(channel);
  const count = useMemo(() => {
    const n = Math.round(Number(busVal));
    if (busVal !== undefined && !Number.isNaN(n)) return Math.max(1, Math.min(99, n));
    return localCount;
  }, [busVal, localCount]);

  const clamp = (n: number) => Math.max(1, Math.min(99, n));
  const apply = (n: number) => {
    setLocalCount(clamp(n));
    setBus(channel, String(clamp(n)));
  };

  return (
    <div className="flex items-center justify-between px-0.5">
      <span className="text-sm font-semibold">{props.label}</span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (count > 1) apply(count - 1); }}
          disabled={count <= 1}
          aria-label="减少数量"
          className="w-chip flex size-7 items-center justify-center rounded-full border w-line transition-transform active:scale-90 disabled:opacity-35"
        >
          <Minus className="size-3.5 opacity-55" />
        </button>
        <motion.span
          key={count}
          initial={{ scale: 1.25 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 30 }}
          className="min-w-6 text-center text-sm font-bold tabular-nums"
        >
          {count}
        </motion.span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (count < 99) apply(count + 1); }}
          disabled={count >= 99}
          aria-label="增加数量"
          className="w-chip flex size-7 items-center justify-center rounded-full border w-line transition-transform active:scale-90 disabled:opacity-35"
          style={{ color: 'var(--p)' }}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SKU 选择（shop.sku-select）：真实选中 + 写入总线                    */
/* ------------------------------------------------------------------ */

export function SkuSelectInteractive({ props }: InteractiveCtx) {
  const setBus = useChannelSetter();
  const channel = String(props.channel || 'sku');
  const colors = useMemo(() => splitListI(props.colors), [props.colors]);
  const versions = useMemo(() => splitListI(props.versions), [props.versions]);
  const [ciLocal, setCiLocal] = useState(0);
  const [viLocal, setViLocal] = useState(0);
  /* 频道默认值：初始选中 SKU 同步到总线（格式与 pick 一致） */
  useChannelDefault(
    channel,
    [colors[0] ?? '', versions[0] ?? ''].filter(Boolean).join(' · ')
  );
  /* 回读总线：页面重挂载后选中态以总线为准（与 LoginTabs 同款修复） */
  const busVal = useChannelValue(channel);
  const { ci, vi } = useMemo(() => {
    if (busVal === undefined) return { ci: ciLocal, vi: viLocal };
    const parts = busVal.split(' · ');
    const cIdx = colors.indexOf(parts[0] ?? '');
    const vIdx = versions.indexOf(parts[1] ?? '');
    return {
      ci: cIdx >= 0 ? cIdx : ciLocal,
      vi: vIdx >= 0 ? vIdx : viLocal,
    };
  }, [busVal, colors, versions, ciLocal, viLocal]);

  const pick = (row: 'c' | 'v', i: number) => {
    const nextCi = row === 'c' ? i : ci;
    const nextVi = row === 'v' ? i : vi;
    setCiLocal(nextCi);
    setViLocal(nextVi);
    const c = colors[nextCi] ?? '';
    const v = versions[nextVi] ?? '';
    setBus(channel, [c, v].filter(Boolean).join(' · '));
  };

  const rows = [
    { label: '颜色', items: colors, active: ci, pick: (i: number) => pick('c', i) },
    { label: '版本', items: versions, active: vi, pick: (i: number) => pick('v', i) },
  ].filter((r) => r.items.length > 0);

  return (
    <div className="w-card space-y-3.5 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-start gap-3">
          <span className="w-7 shrink-0 pt-0.5 text-xs opacity-50">{row.label}</span>
          <div className="flex flex-wrap gap-1.5">
            {row.items.map((item, i) => {
              const on = i === row.active;
              return (
                <button
                  key={`${item}-${i}`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); row.pick(i); }}
                  aria-pressed={on}
                  className={`px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 ${on ? '' : 'w-chip opacity-65'}`}
                  style={on
                    ? {
                        borderRadius: 'calc(var(--pr) - 6px)',
                        border: '1px solid var(--p)',
                        background: 'color-mix(in srgb, var(--p) 10%, transparent)',
                        color: 'var(--p)',
                      }
                    : { borderRadius: 'calc(var(--pr) - 6px)' }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 表单输入（fn.input-field）：预览真实输入                            */
/* ------------------------------------------------------------------ */

export function InputFieldInteractive({ props }: InteractiveCtx) {
  const [val, setVal] = useState('');
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold">{props.label}</label>
      <div className="w-input flex h-11 items-center px-3" style={{ borderRadius: 'var(--pr)' }}>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={props.placeholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
        />
        {val && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setVal(''); }}
            aria-label="清空"
            className="opacity-40 transition-opacity hover:opacity-80"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主按钮（fn.big-button）：点击 → 加载 → 成功 → 触发绑定跳转          */
/* ------------------------------------------------------------------ */

export function BigButtonInteractive({ props, onTap }: InteractiveCtx) {
  const [st, setSt] = useState<'idle' | 'loading' | 'done'>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const variant = props.style === 'outline' || props.style === 'ghost' ? props.style : 'primary';
  const br = props.radius === 'normal' ? 'var(--pr)' : '999px';
  const skin = variant === 'primary'
    ? { background: 'var(--p)', color: 'var(--pf)' }
    : variant === 'outline'
      ? { border: '1.5px solid var(--p)', color: 'var(--p)' }
      : { color: 'var(--p)' };

  const click = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (st !== 'idle') return;
    setSt('loading');
    timers.current.push(
      setTimeout(() => {
        setSt('done');
        timers.current.push(
          setTimeout(() => {
            setSt('idle');
            onTap?.();
          }, 620)
        );
      }, 700)
    );
  };

  return (
    <button
      type="button"
      onClick={click}
      className={`flex h-12 w-full items-center justify-center gap-2 text-[15px] font-bold transition-transform active:scale-[0.98] ${variant === 'primary' ? 'shadow-md' : variant === 'ghost' ? 'w-chip' : ''}`}
      style={{ borderRadius: br, ...skin }}
    >
      {st === 'loading' ? (
        <><LoaderCircle className="size-4 animate-spin" /> 请稍候…</>
      ) : st === 'done' ? (
        <><Check className="size-4" /> 操作成功</>
      ) : (
        props.text
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 搜索栏（mall.search）：预览真实输入 + 一键清空                      */
/* ------------------------------------------------------------------ */

export function SearchInputInteractive({ props }: InteractiveCtx) {
  const [val, setVal] = useState('');
  return (
    <div className="w-input flex h-10 items-center gap-2 pl-3.5 pr-1" style={{ borderRadius: '999px' }}>
      <Search className="size-4 shrink-0 opacity-45" />
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={props.placeholder}
        className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-40"
      />
      {val && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setVal(''); }}
          aria-label="清空搜索"
          className="flex size-5 items-center justify-center rounded-full bg-black/10 opacity-70"
        >
          <X className="size-3" />
        </button>
      )}
      <span
        className="flex h-8 shrink-0 items-center px-4 text-xs font-semibold"
        style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
      >
        {props.btnText}
      </span>
    </div>
  );
}
