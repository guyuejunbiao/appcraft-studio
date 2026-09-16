import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Phone, MoreVertical, Contact, MessagesSquare, MessageSquare,
  MessageSquareDot, Image as ImageIcon, Mic, UserRound, Info, CirclePlus,
  SendHorizontal, Keyboard, PanelBottom, MessageCircle, BookUser, Compass,
} from 'lucide-react';
import type { WidgetDef, InteractiveCtx } from '@/lib/widget-types';
import { ChatTabbarInteractive } from './interactive';
import { stopAct, useAction } from './action-kit';

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

/* ------------------------------------------------------------------ */
/* 预览交互实现（Interactive）：复制对应 render 的视觉结构（保视觉一致），  */
/* 把静态元素替换为可交互元素。所有内部按钮 stopAct 阻断冒泡。             */
/* ------------------------------------------------------------------ */

/** 聊天导航交互：返回箭头回退页面栈（无栈时提示已在首页）；电话/更多各自 toast */
function ChatHeaderInteractive({ props, navBack }: InteractiveCtx) {
  const { toast } = useAction();
  return (
    <div className="flex items-center gap-2.5 border-b w-line px-3.5 py-2.5">
      <button
        type="button"
        aria-label="返回"
        onClick={(e) => { stopAct(e); if (navBack) navBack(); else toast('已在首页', 'info'); }}
        className="cursor-pointer transition-transform active:scale-90"
      >
        <ArrowLeft className="size-5 opacity-70" />
      </button>
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ background: PRIMARY_GRAD }}
      >
        {String(props.name || '友').slice(0, 1)}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-sm font-bold">{props.name}</span>
        <span className={`size-1.5 shrink-0 rounded-full ${props.online !== false ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
      </div>
      <button
        type="button"
        aria-label="语音通话"
        onClick={(e) => { stopAct(e); toast('正在呼叫…', 'info'); }}
        className="cursor-pointer transition-opacity active:opacity-60"
      >
        <Phone className="size-[18px] opacity-55" />
      </button>
      <button
        type="button"
        aria-label="更多操作"
        onClick={(e) => { stopAct(e); toast('更多操作（演示）', 'info'); }}
        className="cursor-pointer transition-opacity active:opacity-60"
      >
        <MoreVertical className="size-[18px] opacity-55" />
      </button>
    </div>
  );
}

/** 会话列表项交互：整行 → onTap 优先，否则 toast 打开会话 */
function ContactItemInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const name = String(props.name || '友');
  return (
    <div
      role="button"
      aria-label={`打开会话：${name}`}
      className="w-card flex cursor-pointer items-center gap-3 p-3 transition-transform active:scale-[0.99]"
      onClick={(e) => { stopAct(e); if (onTap) onTap(); else toast(`打开会话：${name}`, 'info'); }}
    >
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
        style={{ background: props.color === 'primary' ? PRIMARY_GRAD : avatarGrad(name) }}
      >
        {name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{props.name}</div>
        <div className="mt-0.5 truncate text-xs opacity-45">{props.lastMsg}</div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-[10px] opacity-35">{props.time}</span>
        {Number(props.unread) > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {props.unread}
          </span>
        )}
      </div>
    </div>
  );
}

/** 图片消息交互：点击 → 查看大图 toast */
function MsgImageInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const w = Math.min(220, Math.max(120, Number(props.width) || 168));
  return (
    <div className="flex">
      <div
        role="button"
        aria-label="查看大图"
        className="w-chip cursor-pointer p-1.5 transition-transform active:scale-[0.98]"
        style={{ borderRadius: 'var(--pr) var(--pr) var(--pr) 4px' }}
        onClick={(e) => { stopAct(e); toast('查看大图（演示）', 'info'); }}
      >
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
          {props.duration ? (
            <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {props.duration}
            </span>
          ) : null}
        </div>
        {props.caption ? <div className="px-1 pb-0.5 pt-1.5 text-xs opacity-60">{props.caption}</div> : null}
      </div>
    </div>
  );
}

/** 语音消息交互：点击 → 播放态波形动画 + toast，自动停止 */
function MsgVoiceInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const seconds = Number(props.seconds) || 12;
  const right = props.side === 'right';
  const play = (e: React.MouseEvent) => {
    stopAct(e);
    if (playing) return;
    setPlaying(true);
    toast(`▶ 播放语音 ${seconds}''`, 'info');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPlaying(false), Math.min(2400, 500 + seconds * 80));
  };
  return (
    <div className={`flex items-end gap-2 ${right ? 'flex-row-reverse' : ''}`}>
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: PRIMARY_GRAD }}
      >
        <UserRound className="size-4" />
      </div>
      <div
        role="button"
        aria-label={`播放语音 ${seconds} 秒`}
        onClick={play}
        className={`flex cursor-pointer items-center gap-2 px-3 py-2 transition-transform active:scale-[0.97] ${right ? '' : 'w-chip'}`}
        style={{
          borderRadius: right ? 'var(--pr) var(--pr) 4px var(--pr)' : 'var(--pr) var(--pr) var(--pr) 4px',
          ...(right ? { background: 'var(--p)', color: 'var(--pf)' } : {}),
        }}
      >
        <Mic className={`size-4 shrink-0 ${playing ? 'animate-pulse' : ''}`} style={right ? undefined : { color: 'var(--p)' }} />
        <span className="shrink-0 text-xs font-semibold">{seconds}''</span>
        <span className={`flex shrink-0 items-center gap-[3px] ${playing ? 'animate-pulse' : ''}`}>
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
}

/** 聊天输入栏交互：真实输入 + 发送（空文案拦截）；⊕/麦克风各自 toast */
function InputBarInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [val, setVal] = useState('');
  const send = () => {
    const text = val.trim();
    if (!text) {
      toast('请输入消息', 'info');
      return;
    }
    toast(`已发送：${text}`, 'success');
    setVal('');
  };
  return (
    <div className="w-card flex items-center gap-2 border-t w-line px-3 py-2">
      <button
        type="button"
        aria-label="更多功能"
        onClick={(e) => { stopAct(e); toast('更多功能（演示）', 'info'); }}
        className="cursor-pointer transition-opacity active:opacity-60"
      >
        <CirclePlus className="size-[22px] shrink-0 opacity-35" />
      </button>
      <div className="w-input flex h-9 min-w-0 flex-1 items-center px-3.5" style={{ borderRadius: '999px' }}>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
              send();
            }
          }}
          placeholder={String(props.placeholder || '发消息…')}
          aria-label="聊天输入框"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-35"
        />
      </div>
      <button
        type="button"
        aria-label="按住说话"
        onClick={(e) => { stopAct(e); toast('按住说话（演示）', 'info'); }}
        className="cursor-pointer transition-opacity active:opacity-60"
      >
        <Mic className="size-5 shrink-0 opacity-50" />
      </button>
      <button
        type="button"
        aria-label="发送"
        onClick={(e) => { stopAct(e); send(); }}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center transition-transform active:scale-90"
        style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
      >
        <SendHorizontal className="size-4" />
      </button>
    </div>
  );
}

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
    Interactive: ChatHeaderInteractive,
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
    Interactive: ContactItemInteractive,
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
    Interactive: MsgImageInteractive,
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
    Interactive: MsgVoiceInteractive,
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
    Interactive: InputBarInteractive,
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
