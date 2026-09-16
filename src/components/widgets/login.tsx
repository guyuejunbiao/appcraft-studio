import {
  Lock, Smartphone, ShieldCheck, Eye, EyeOff, UserRound, ChevronRight,
  MessageCircle, Apple, Chrome, Mail, KeyRound, LogIn, UserPlus,
  RectangleHorizontal, Square, BadgeCheck,
} from 'lucide-react';
import type { WidgetDef } from '@/lib/widget-types';
import {
  LoginTabsInteractive, PhoneInputInteractive, PasswordInputInteractive,
  SmsInputInteractive, PrimaryBtnInteractive, AgreementCheckInteractive,
  SocialRowInteractive,
} from './interactive';

/**
 * 登录 / 注册 组件库（目录：login）
 * 参考实现：所有组件只用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应。
 */
export const widgets: WidgetDef[] = [
  {
    type: 'login.logo',
    category: 'login',
    name: '品牌 Logo',
    desc: 'App 品牌标识（方形/圆形）',
    icon: BadgeCheck,
    defaultProps: { brand: '星云 App', shape: 'square', size: 64 },
    fields: [
      { key: 'brand', label: '品牌名', type: 'text' },
      { key: 'shape', label: '形状', type: 'select', options: [{ label: '圆角方形', value: 'square' }, { label: '圆形', value: 'circle' }] },
      { key: 'size', label: '尺寸', type: 'number', min: 44, max: 96, step: 4 },
    ],
    render: (p) => (
      <div className="flex flex-col items-center gap-2.5 py-2">
        <div
          className="flex items-center justify-center font-bold shadow-lg"
          style={{
            width: p.size, height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : 'calc(var(--pr) + 6px)',
            background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #fff))',
            color: 'var(--pf)', fontSize: Number(p.size) * 0.38,
          }}
        >
          {String(p.brand || 'A').slice(0, 1)}
        </div>
        <span className="text-lg font-bold tracking-wide">{p.brand}</span>
      </div>
    ),
  },
  {
    type: 'login.app-title',
    category: 'login',
    name: '标题副标题',
    desc: '页面大标题 + 副标题',
    icon: RectangleHorizontal,
    defaultProps: { title: '欢迎回来', subtitle: '登录你的专属账号，继续精彩' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'subtitle', label: '副标题', type: 'text' },
    ],
    render: (p) => (
      <div className="py-1">
        <h1 className="text-2xl font-extrabold tracking-tight">{p.title}</h1>
        <p className="mt-1.5 text-[13px] opacity-55">{p.subtitle}</p>
      </div>
    ),
  },
  {
    type: 'login.phone-input',
    category: 'login',
    name: '手机号输入',
    desc: '带国际区号的手机号输入框（预览可输入）',
    icon: Smartphone,
    defaultProps: { placeholder: '请输入手机号', prefix: '+86' },
    fields: [
      { key: 'placeholder', label: '提示文案', type: 'text' },
      { key: 'prefix', label: '区号', type: 'text' },
    ],
    Interactive: PhoneInputInteractive,
    render: (p) => (
      <div className="w-input flex h-11 items-center gap-2.5 px-3" style={{ borderRadius: 'var(--pr)' }}>
        <Smartphone className="size-4 opacity-45" />
        <span className="text-sm font-semibold opacity-75">{p.prefix}</span>
        <span className="w-px h-4 w-line border-l" />
        <span className="text-sm opacity-40">{p.placeholder}</span>
      </div>
    ),
  },
  {
    type: 'login.password-input',
    category: 'login',
    name: '密码输入',
    desc: '可输入 + 真实明密文切换（预览）',
    icon: Lock,
    defaultProps: { placeholder: '请输入密码', eye: true, channel: 'loginMode', showValue: 'left' },
    fields: [
      { key: 'placeholder', label: '提示文案', type: 'text' },
      { key: 'eye', label: '显示可见切换', type: 'switch' },
      { key: 'channel', label: '联动频道（高级）', type: 'text', placeholder: '留空 = 恒显示，如 loginMode' },
      { key: 'showValue', label: '显示于值（高级）', type: 'text', placeholder: '如 left = 密码登录时显示' },
    ],
    Interactive: PasswordInputInteractive,
    render: (p) => (
      <div className="w-input flex h-11 items-center gap-2.5 px-3" style={{ borderRadius: 'var(--pr)' }}>
        <Lock className="size-4 opacity-45" />
        <span className="flex-1 text-sm opacity-40">{p.placeholder}</span>
        {p.eye !== false && <EyeOff className="size-4 opacity-40" />}
      </div>
    ),
  },
  {
    type: 'login.sms-input',
    category: 'login',
    name: '验证码输入',
    desc: '真实 60s 倒计时 + 模拟短信回填',
    icon: ShieldCheck,
    defaultProps: { placeholder: '请输入验证码', btnText: '获取验证码', channel: 'loginMode', showValue: 'right' },
    fields: [
      { key: 'placeholder', label: '提示文案', type: 'text' },
      { key: 'btnText', label: '按钮文案', type: 'text' },
      { key: 'channel', label: '联动频道（高级）', type: 'text', placeholder: '留空 = 恒显示，如 loginMode' },
      { key: 'showValue', label: '显示于值（高级）', type: 'text', placeholder: '如 right = 短信登录时显示' },
    ],
    Interactive: SmsInputInteractive,
    render: (p) => (
      <div className="w-input flex h-11 items-center gap-2 pl-3 pr-1" style={{ borderRadius: 'var(--pr)' }}>
        <ShieldCheck className="size-4 opacity-45" />
        <span className="flex-1 text-sm opacity-40">{p.placeholder}</span>
        <span
          className="flex h-8 items-center px-3 text-xs font-semibold"
          style={{ borderRadius: 'calc(var(--pr) - 4px)', background: 'var(--p)', color: 'var(--pf)' }}
        >
          {p.btnText}
        </span>
      </div>
    ),
  },
  {
    type: 'login.primary-btn',
    category: 'login',
    name: '登录按钮',
    desc: '主操作大按钮（预览带完整校验：手机号/密码/验证码/协议拦截）',
    icon: LogIn,
    defaultProps: { text: '登 录', sub: '', successText: '' },
    fields: [
      { key: 'text', label: '按钮文案', type: 'text' },
      { key: 'sub', label: '右侧小字', type: 'text' },
      { key: 'successText', label: '成功提示（留空自动判断）', type: 'text', placeholder: '如：注册成功' },
    ],
    Interactive: PrimaryBtnInteractive,
    render: (p) => (
      <button
        className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-bold shadow-md active:scale-[0.98]"
        style={{ borderRadius: 'var(--pr)', background: 'var(--p)', color: 'var(--pf)' }}
      >
        <LogIn className="size-4" /> {p.text}
        {p.sub ? <span className="text-xs font-normal opacity-70">{p.sub}</span> : null}
      </button>
    ),
  },
  {
    type: 'login.register-btn',
    category: 'login',
    name: '注册入口',
    desc: '次要按钮 / 注册新账号',
    icon: UserPlus,
    defaultProps: { text: '注册新账号' },
    fields: [{ key: 'text', label: '按钮文案', type: 'text' }],
    render: (p) => (
      <button
        className="flex h-11 w-full items-center justify-center gap-1.5 text-sm font-semibold w-line border active:scale-[0.98]"
        style={{ borderRadius: 'var(--pr)' }}
      >
        <UserPlus className="size-4 opacity-60" /> {p.text}
      </button>
    ),
  },
  {
    type: 'login.forgot-link',
    category: 'login',
    name: '忘记密码',
    desc: '右对齐的忘记密码链接',
    icon: KeyRound,
    defaultProps: { text: '忘记密码？', tip: '找回账号' },
    fields: [
      { key: 'text', label: '左侧文案', type: 'text' },
      { key: 'tip', label: '右侧文案', type: 'text' },
    ],
    render: (p) => (
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs opacity-50">{p.tip}</span>
        <span className="flex items-center text-xs font-semibold" style={{ color: 'var(--p)' }}>
          {p.text} <ChevronRight className="size-3" />
        </span>
      </div>
    ),
  },
  {
    type: 'login.agreement-check',
    category: 'login',
    name: '协议勾选',
    desc: '用户协议与隐私政策（预览可勾选）',
    icon: UserRound,
    defaultProps: { text: '我已阅读并同意', link1: '《用户协议》', link2: '《隐私政策》' },
    fields: [
      { key: 'text', label: '前缀文案', type: 'text' },
      { key: 'link1', label: '协议名', type: 'text' },
      { key: 'link2', label: '政策名', type: 'text' },
    ],
    Interactive: AgreementCheckInteractive,
    render: (p) => (
      <div className="flex items-start gap-2 px-0.5">
        <span className="mt-0.5 flex size-4 items-center justify-center rounded-[5px] border-2 w-line" style={{ borderColor: 'var(--p)' }} />
        <p className="text-[11px] leading-4 opacity-55">
          {p.text}
          <span style={{ color: 'var(--p)' }}>{p.link1}</span>
          <span className="opacity-55">和</span>
          <span style={{ color: 'var(--p)' }}>{p.link2}</span>
        </p>
      </div>
    ),
  },
  {
    type: 'login.divider',
    category: 'login',
    name: '分割线',
    desc: '带文字的「或」分割线',
    icon: Square,
    defaultProps: { text: '其他登录方式' },
    fields: [{ key: 'text', label: '文字', type: 'text' }],
    render: (p) => (
      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 w-line border-t" />
        <span className="text-[11px] opacity-45">{p.text}</span>
        <span className="h-px flex-1 w-line border-t" />
      </div>
    ),
  },
  {
    type: 'login.social-row',
    category: 'login',
    name: '第三方登录',
    desc: '微信 / Apple / 邮箱 / 一键登录（真机模拟唤起）',
    icon: MessageCircle,
    defaultProps: {
      showWechat: true, showApple: true, showWeb: false, showMail: true,
      showPhone: true, appName: '星云 App',
    },
    fields: [
      { key: 'appName', label: '应用名称', type: 'text' },
      { key: 'showWechat', label: '微信', type: 'switch' },
      { key: 'showApple', label: 'Apple', type: 'switch' },
      { key: 'showWeb', label: '浏览器', type: 'switch' },
      { key: 'showMail', label: '邮箱', type: 'switch' },
      { key: 'showPhone', label: '本机号码一键登录', type: 'switch' },
    ],
    Interactive: SocialRowInteractive,
    render: (p) => {
      const items = [
        { key: 'showWechat', icon: MessageCircle, label: '微信', color: '#07c160' },
        { key: 'showApple', icon: Apple, label: 'Apple', color: '#101013' },
        { key: 'showWeb', icon: Chrome, label: '浏览器', color: '#3f3f46' },
        { key: 'showMail', icon: Mail, label: '邮箱', color: '#f59e0b' },
        { key: 'showPhone', icon: Smartphone, label: '本机号码', color: '#0f9d58' },
      ].filter((i) => p[i.key] !== false);
      return (
        <div className="flex items-center justify-center gap-4 py-1.5">
          {items.map(({ key, icon: Icon, label, color }) => (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <span
                className="w-chip flex size-11 items-center justify-center rounded-full border w-line"
                style={{ background: `${color}14`, borderColor: `${color}30` }}
              >
                <Icon className="size-5" style={{ color }} />
              </span>
              <span className="text-[10px] opacity-45">{label}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'login.login-tabs',
    category: 'login',
    name: '登录方式切换',
    desc: '密码/短信分段器（预览真实切换联动）',
    icon: Eye,
    defaultProps: { left: '密码登录', right: '短信登录', active: 'left', channel: 'loginMode' },
    fields: [
      { key: 'left', label: '左项文案', type: 'text' },
      { key: 'right', label: '右项文案', type: 'text' },
      { key: 'active', label: '选中项', type: 'select', options: [{ label: '左项', value: 'left' }, { label: '右项', value: 'right' }] },
      { key: 'channel', label: '联动频道', type: 'text', placeholder: '配合输入框的「显示于值」使用' },
    ],
    Interactive: LoginTabsInteractive,
    /** 画板内可点击切换：编辑器里实时预览密码/短信两组件的联动显隐 */
    canvasInteractive: true,
    render: (p) => (
      <div className="w-chip flex rounded-full p-1" style={{ borderRadius: '999px' }}>
        {[p.left, p.right].map((t, i) => {
          const active = (p.active === 'right') === (i === 1);
          return (
            <span
              key={i}
              className="flex-1 py-2 text-center text-[13px] font-semibold"
              style={active
                ? { borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)', boxShadow: '0 2px 8px color-mix(in srgb, var(--p) 45%, transparent)' }
                : { borderRadius: '999px', opacity: 0.55 }}
            >
              {t}
            </span>
          );
        })}
      </div>
    ),
  },
];
