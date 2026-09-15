import {
  ArrowLeft, Phone, MoreVertical, Contact, MessagesSquare, MessageSquare,
  MessageSquareDot, Image as ImageIcon, Mic, UserRound, Info, CirclePlus,
  SendHorizontal, Keyboard, PanelBottom, MessageCircle, BookUser, Compass,
} from 'lucide-react';
import type { WidgetDef } from '@/lib/widget-types';
import { ChatTabbarInteractive } from './interactive';

/**
 * 即时聊天 组件库（目录：chat）
 * 参考实现：所有组件只用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应。
 * 头像/图片一律用渐变 div + 首字或图标占位。
 */

/** 会话头像装饰渐变（仅用于头像循环配色，非主色语义） */
const AVATAR_GRADS = [
  'linear-gradient(135deg, #f97316, #fdba74)',
  'linear-gradient(135deg, #10b981, #6ee7b7)',
  'linear-gradient(135deg, #f43f5e, #fda4af)',
  'linear-gradient(135deg, #8b5cf6, #c4b5fd)',
  'linear-gradient(135deg, #14b8a6, #5eead4)',
];
/** 按昵称首字稳定取一个装饰渐变（列表里天然"颜色循环"） */
const avatarGrad = (seed: string) => AVATAR_GRADS[(seed || '友').charCodeAt(0) % AVATAR_GRADS.length];
/** 主色系头像渐变（跟随画布主题） */
const PRIMARY_GRAD = 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #fff))';

/** 聊天底部导航的 4 个 tab */
const CHAT_TABS = [
  { key: 'msg', label: '消息', icon: MessageCircle },
  { key: 'contacts', label: '通讯录', icon: BookUser },
  { key: 'discover', label: '发现', icon: Compass },
  { key: 'me', label: '我', icon: UserRound },
];

export const widgets: WidgetDef[] = [
  {
    type: 'chat.header',
    category: 'chat',
    name: '聊天导航',
    desc: '返回 + 对方信息 + 通话/菜单（通栏）',
    icon: Contact,
    fullBleed: true,
    defaultProps: { name: '林小满', online: true },
    fields: [
      { key: 'name', label: '对方昵称', type: 'text' },
      { key: 'online', label: '在线状态', type: 'switch' },
    ],
    render: (p) => (
      <div className="flex items-center gap-2.5 border-b w-line px-3.5 py-2.5">
        <ArrowLeft className="size-5 shrink-0 opacity-70" />
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: PRIMARY_GRAD }}
        >
          {String(p.name || '友').slice(0, 1)}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="truncate text-sm font-bold">{p.name}</span>
          <span className={`size-1.5 shrink-0 rounded-full ${p.online !== false ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
        </div>
        <Phone className="size-[18px] shrink-0 opacity-55" />
        <MoreVertical className="size-[18px] shrink-0 opacity-55" />
      </div>
    ),
  },
  {
    type: 'chat.contact-item',
    category: 'chat',
    name: '会话列表项',
    desc: '头像 + 昵称 + 最近消息 + 未读徽标',
    icon: MessagesSquare,
    defaultProps: { name: '林小满', lastMsg: '周末聚餐你来吗？', time: '14:32', unread: 3, color: 'cycle' },
    fields: [
      { key: 'name', label: '昵称', type: 'text' },
      { key: 'lastMsg', label: '最后一条消息', type: 'text' },
      { key: 'time', label: '时间', type: 'text' },
      { key: 'unread', label: '未读数', type: 'number', min: 0, max: 99, step: 1 },
      {
        key: 'color', label: '头像配色', type: 'select',
        options: [{ label: '循环配色', value: 'cycle' }, { label: '跟随主色', value: 'primary' }],
      },
    ],
    render: (p) => (
      <div className="w-card flex items-center gap-3 p-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
          style={{ background: p.color === 'primary' ? PRIMARY_GRAD : avatarGrad(String(p.name || '友')) }}
        >
          {String(p.name || '友').slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{p.name}</div>
          <div className="mt-0.5 truncate text-xs opacity-45">{p.lastMsg}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-[10px] opacity-35">{p.time}</span>
          {Number(p.unread) > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {p.unread}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    type: 'chat.msg-left',
    category: 'chat',
    name: '对方消息',
    desc: '左侧头像 + 灰底气泡',
    icon: MessageSquare,
    defaultProps: { name: '林小满', text: '在吗？周末的聚餐你来了吗？' },
    fields: [
      { key: 'name', label: '头像昵称', type: 'text' },
      { key: 'text', label: '消息内容', type: 'textarea' },
    ],
    render: (p) => (
      <div className="flex items-end gap-2">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: avatarGrad(String(p.name || '友')) }}
        >
          {String(p.name || '友').slice(0, 1)}
        </div>
        <div className="w-chip max-w-[75%] px-3 py-2 text-sm leading-relaxed" style={{ borderRadius: 'var(--pr) var(--pr) var(--pr) 4px' }}>
          {p.text}
        </div>
      </div>
    ),
  },
  {
    type: 'chat.msg-right',
    category: 'chat',
    name: '我方消息',
    desc: '主色气泡 + 右侧头像',
    icon: MessageSquareDot,
    defaultProps: { name: '我', text: '来！位置我已经订好啦' },
    fields: [
      { key: 'name', label: '头像昵称', type: 'text' },
      { key: 'text', label: '消息内容', type: 'textarea' },
    ],
    render: (p) => (
      <div className="flex items-end justify-end gap-2">
        <div
          className="max-w-[75%] px-3 py-2 text-sm leading-relaxed"
          style={{ borderRadius: 'var(--pr) var(--pr) 4px var(--pr)', background: 'var(--p)', color: 'var(--pf)' }}
        >
          {p.text}
        </div>
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: avatarGrad(String(p.name || '我')) }}
        >
          {String(p.name || '我').slice(0, 1)}
        </div>
      </div>
    ),
  },
  {
    type: 'chat.msg-image',
    category: 'chat',
    name: '图片消息',
    desc: '渐变占位图 + 可选角标时长与配文',
    icon: ImageIcon,
    defaultProps: { caption: '', width: 168, duration: '00:12' },
    fields: [
      { key: 'caption', label: '配文（可选）', type: 'text', placeholder: '留空则不显示' },
      { key: 'width', label: '图片宽度', type: 'number', min: 120, max: 220, step: 4 },
      { key: 'duration', label: '角标时长（可选）', type: 'text', placeholder: '如 00:12，留空不显示' },
    ],
    render: (p) => {
      const w = Math.min(220, Math.max(120, Number(p.width) || 168));
      return (
        <div className="flex">
          <div className="w-chip p-1.5" style={{ borderRadius: 'var(--pr) var(--pr) var(--pr) 4px' }}>
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                width: w,
                height: Math.round(w * 0.72),
                borderRadius: 'calc(var(--pr) - 4px)',
                background: PRIMARY_GRAD,
              }}
            >
              <ImageIcon className="size-7 text-white/85" />
              {p.duration ? (
                <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {p.duration}
                </span>
              ) : null}
            </div>
            {p.caption ? <div className="px-1 pb-0.5 pt-1.5 text-xs opacity-60">{p.caption}</div> : null}
          </div>
        </div>
      );
    },
  },
  {
    type: 'chat.msg-voice',
    category: 'chat',
    name: '语音消息',
    desc: '麦克风波形条 + 秒数，可切换左右',
    icon: Mic,
    defaultProps: { seconds: 12, side: 'left' },
    fields: [
      { key: 'seconds', label: '语音秒数', type: 'number', min: 1, max: 60, step: 1 },
      {
        key: 'side', label: '消息方向', type: 'select',
        options: [{ label: '对方（左）', value: 'left' }, { label: '我方（右）', value: 'right' }],
      },
    ],
    render: (p) => {
      const right = p.side === 'right';
      return (
        <div className={`flex items-end gap-2 ${right ? 'flex-row-reverse' : ''}`}>
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: PRIMARY_GRAD }}
          >
            <UserRound className="size-4" />
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 ${right ? '' : 'w-chip'}`}
            style={{
              borderRadius: right ? 'var(--pr) var(--pr) 4px var(--pr)' : 'var(--pr) var(--pr) var(--pr) 4px',
              ...(right ? { background: 'var(--p)', color: 'var(--pf)' } : {}),
            }}
          >
            <Mic className="size-4 shrink-0" style={right ? undefined : { color: 'var(--p)' }} />
            <span className="shrink-0 text-xs font-semibold">{Number(p.seconds) || 12}''</span>
            <span className="flex shrink-0 items-center gap-[3px]">
              {[9, 16, 7, 12].map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{ height: h, background: right ? 'rgba(255,255,255,0.85)' : 'var(--p)' }}
                />
              ))}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    type: 'chat.system-tip',
    category: 'chat',
    name: '系统提示条',
    desc: '居中的灰色胶囊提示',
    icon: Info,
    defaultProps: { text: '对方开启了好友验证' },
    fields: [{ key: 'text', label: '提示文案', type: 'text' }],
    render: (p) => (
      <div className="flex justify-center py-0.5">
        <span className="w-chip flex items-center gap-1 px-3 py-1" style={{ borderRadius: '999px' }}>
          <Info className="size-3 shrink-0 opacity-50" />
          <span className="text-[11px] opacity-60">{p.text}</span>
        </span>
      </div>
    ),
  },
  {
    type: 'chat.input-bar',
    category: 'chat',
    name: '聊天输入栏',
    desc: '输入条 + 语音 + 发送按钮（通栏）',
    icon: Keyboard,
    fullBleed: true,
    defaultProps: { placeholder: '发消息…' },
    fields: [{ key: 'placeholder', label: '提示文案', type: 'text' }],
    render: (p) => (
      <div className="w-card flex items-center gap-2 border-t w-line px-3 py-2">
        <CirclePlus className="size-[22px] shrink-0 opacity-35" />
        <div className="w-input flex h-9 min-w-0 flex-1 items-center px-3.5" style={{ borderRadius: '999px' }}>
          <span className="truncate text-[13px] opacity-35">{p.placeholder}</span>
        </div>
        <Mic className="size-5 shrink-0 opacity-50" />
        <span
          className="flex size-9 shrink-0 items-center justify-center"
          style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
        >
          <SendHorizontal className="size-4" />
        </span>
      </div>
    ),
  },
  {
    type: 'chat.tabbar',
    category: 'chat',
    name: '聊天底部导航',
    desc: '消息 / 通讯录 / 发现 / 我（通栏）',
    icon: PanelBottom,
    fullBleed: true,
    defaultProps: { active: 'msg', channel: 'chatTab' },
    fields: [
      {
        key: 'active', label: '选中项', type: 'select',
        options: CHAT_TABS.map((t) => ({ label: t.label, value: t.key })),
      },
      { key: 'channel', label: '联动频道（高级）', type: 'text', placeholder: '其他组件订阅后可随标签切换显隐' },
    ],
    Interactive: ChatTabbarInteractive,
    slots: () => CHAT_TABS.map((t) => ({ key: t.key, label: `「${t.label}」标签` })),
    render: (p) => (
      <div className="w-card flex border-t w-line">
        {CHAT_TABS.map(({ key, label, icon: Icon }) => {
          const active = p.active === key;
          return (
            <div key={key} className="flex flex-1 flex-col items-center gap-1 pb-1.5 pt-2">
              <span className="relative" style={active ? { color: 'var(--p)' } : undefined}>
                <Icon className="size-[22px]" style={{ opacity: active ? 1 : 0.4 }} />
                {key === 'msg' && <span className="absolute -right-1.5 -top-0.5 size-2 rounded-full bg-rose-500" />}
              </span>
              <span
                className={`text-[10px] ${active ? 'font-semibold' : 'opacity-40'}`}
                style={active ? { color: 'var(--p)' } : undefined}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    ),
  },
];
