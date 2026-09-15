import {
  Crown, Wallet, CreditCard, Package, Truck, Star, ClipboardList, Coins,
  CalendarCheck, Gift, LayoutGrid, Info, RefreshCw, Gem, LogOut,
  MapPin, Headphones, Heart, Footprints, TicketPercent, CircleHelp,
  Settings, MoreHorizontal, Trophy, Medal, Flame, Check, Image as ImageIcon,
} from 'lucide-react';
import type { WidgetDef } from '@/lib/widget-types';

/**
 * 个人中心 组件库（目录：profile）
 * 与 mall.tsx / functional.tsx 同一套规范：只使用 Tailwind + CSS 变量
 * （--p 主色 / --pr 圆角 / --pf 主色上文字），表面类 w-card/w-input/w-chip/w-line。
 * 主文字继承画布颜色，次要文字 opacity-40~70；渲染为纯函数，无 hooks / 无请求。
 * 会员 / 金卡类使用 amber 系渐变，钱包类使用主色渐变，禁止蓝色 / 靛蓝色系。
 */

/** 逗号 / 中文逗号分隔 → 字符串数组（去空白项） */
const splitList = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,]/).map((s) => s.trim()).filter(Boolean);

/** me.order-grid 订单入口图标（按序取用） */
const ORDER_ICONS = [CreditCard, Package, Truck, Star];

/** me.service-grid 服务入口图标（按序固定 8 个） */
const SERVICE_ICONS = [MapPin, Headphones, Heart, Footprints, TicketPercent, CircleHelp, Settings, MoreHorizontal];

/** me.achievement-badge 成就徽章图标（按序取用） */
const BADGE_ICONS = [Trophy, Medal, Star, Flame];

export const widgets: WidgetDef[] = [
  {
    type: 'me.member-card',
    category: 'profile',
    name: '会员卡',
    desc: '深色渐变会员卡 + 金标 + 续费按钮',
    icon: Crown,
    defaultProps: { name: '林晚风', level: '年度黄金会员', expire: '2026-08-18 到期', style: 'gold' },
    fields: [
      { key: 'name', label: '会员名', type: 'text' },
      { key: 'level', label: '会员等级', type: 'text' },
      { key: 'expire', label: '到期时间', type: 'text' },
      {
        key: 'style', label: '卡面风格', type: 'select',
        options: [{ label: '黑金', value: 'gold' }, { label: '黑紫', value: 'purple' }],
      },
    ],
    render: (p) => {
      const gold = p.style !== 'purple';
      const bg = gold
        ? 'linear-gradient(120deg, #1c1917 0%, #292524 55%, #0c0a09 100%)'
        : 'linear-gradient(120deg, #12101a 0%, #2e1065 68%, #0c0a09 100%)';
      const btnBg = gold
        ? 'linear-gradient(120deg, #fde68a, #f59e0b)'
        : 'linear-gradient(120deg, #c4b5fd, #8b5cf6)';
      const btnColor = gold ? '#451a03' : '#ffffff';
      return (
        <div
          className="relative overflow-hidden p-4"
          style={{ borderRadius: 'var(--pr)', background: bg }}
        >
          {/* 装饰光斑 */}
          <div className="absolute -right-8 -top-10 size-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute -bottom-12 -left-6 size-24 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="relative flex items-center gap-3">
            {/* 金标 Crown */}
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <Crown className="size-5 text-amber-400" fill="currentColor" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[15px] font-bold text-white">{p.name}</span>
                <span
                  className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none text-amber-300"
                  style={{ border: '1px solid rgba(251,191,36,0.55)' }}
                >
                  {p.level}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-white/55">{p.expire}</div>
            </div>
            {/* 金色续费小按钮 */}
            <span
              className="flex h-7 shrink-0 items-center rounded-full px-3 text-[11px] font-bold shadow-sm"
              style={{ background: btnBg, color: btnColor }}
            >
              立即续费
            </span>
          </div>
        </div>
      );
    },
  },
  {
    type: 'me.wallet-card',
    category: 'profile',
    name: '钱包卡',
    desc: '主色渐变大卡 + 超大余额 + 提现/充值',
    icon: Wallet,
    defaultProps: { balance: '12,860.50', withdraw: '提现', recharge: '充值' },
    fields: [
      { key: 'balance', label: '钱包余额', type: 'text' },
      { key: 'withdraw', label: '左侧按钮', type: 'text' },
      { key: 'recharge', label: '右侧按钮', type: 'text' },
    ],
    render: (p) => (
      <div
        className="relative overflow-hidden p-4"
        style={{
          borderRadius: 'var(--pr)',
          background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 62%, #fff))',
          color: 'var(--pf)',
        }}
      >
        {/* 装饰圆 + 水印图标 */}
        <div className="absolute -right-7 -top-9 size-28 rounded-full" style={{ background: 'rgba(255,255,255,0.16)' }} />
        <div className="absolute -bottom-12 -left-5 size-24 rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }} />
        <Wallet className="absolute right-4 top-4 size-9 opacity-25" />
        <div className="relative">
          <div className="text-xs opacity-80">钱包余额（元）</div>
          <div className="mt-1.5 text-[32px] font-extrabold leading-none tracking-tight">{p.balance}</div>
          {/* 白色半透明按钮组 */}
          <div className="mt-4 flex gap-2.5">
            {[p.withdraw, p.recharge].filter(Boolean).map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="flex h-8 items-center rounded-full px-5 text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.26)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    type: 'me.order-grid',
    category: 'profile',
    name: '订单宫格',
    desc: '待付款 / 待发货 / 待收货 / 评价 一行四项',
    icon: ClipboardList,
    defaultProps: { labels: '待付款,待发货,待收货,评价', badges: '2,0,1,0' },
    fields: [
      { key: 'labels', label: '入口文案（逗号分隔）', type: 'textarea', placeholder: '最多 4 个' },
      { key: 'badges', label: '角标数量（逗号分隔，0 不显示）', type: 'text', placeholder: '如：2,0,1,0' },
    ],
    render: (p) => {
      const labels = splitList(p.labels).slice(0, 4);
      const badges = splitList(p.badges);
      return (
        <div className="w-card grid grid-cols-4 px-2 py-4" style={{ borderRadius: 'var(--pr)' }}>
          {labels.map((label, i) => {
            const Icon = ORDER_ICONS[i % ORDER_ICONS.length];
            const raw = Number(badges[i]) || 0;
            return (
              <div key={`${label}-${i}`} className="relative flex flex-col items-center gap-1.5">
                {raw > 0 && (
                  <span
                    className="absolute -top-2 right-1/2 z-10 flex h-4 min-w-4 translate-x-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none text-white"
                    style={{ background: '#f43f5e' }}
                  >
                    {raw > 99 ? '99+' : raw}
                  </span>
                )}
                <Icon className="size-[22px]" style={{ color: 'var(--p)' }} />
                <span className="text-[11px] opacity-70">{label}</span>
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    type: 'me.assets-row',
    category: 'profile',
    name: '资产三栏',
    desc: '余额 / 优惠券 / 积分 数字概览',
    icon: Coins,
    defaultProps: { balance: '1,286.50', coupon: '12', points: '8,640' },
    fields: [
      { key: 'balance', label: '余额', type: 'text' },
      { key: 'coupon', label: '优惠券（张）', type: 'text' },
      { key: 'points', label: '积分', type: 'text' },
    ],
    render: (p) => {
      const cols: { value: string; label: string }[] = [
        { value: String(p.balance ?? ''), label: '余额（元）' },
        { value: String(p.coupon ?? ''), label: '优惠券（张）' },
        { value: String(p.points ?? ''), label: '积分' },
      ];
      return (
        <div className="w-card flex items-center px-2 py-4" style={{ borderRadius: 'var(--pr)' }}>
          {cols.map((c, i) => (
            <div
              key={c.label}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 ${i > 0 ? 'border-l w-line' : ''}`}
            >
              <span className="text-lg font-extrabold leading-none" style={{ color: 'var(--p)' }}>{c.value}</span>
              <span className="text-[11px] opacity-50">{c.label}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'me.sign-in-card',
    category: 'profile',
    name: '签到卡',
    desc: '七日签到圆点 + 连续天数 + 签到按钮',
    icon: CalendarCheck,
    defaultProps: { title: '每日签到', days: 3, signed: false },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'days', label: '已连续天数', type: 'number', min: 0, max: 7, step: 1 },
      { key: 'signed', label: '今日已签到', type: 'switch' },
    ],
    render: (p) => {
      const days = Math.max(0, Math.min(7, Math.round(Number(p.days) || 0)));
      const signed = p.signed === true;
      return (
        <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-extrabold">{p.title}</span>
            {/* 签到按钮：已签变灰 */}
            {signed ? (
              <span
                className="flex h-8 items-center gap-1 rounded-full border w-line px-4 text-xs font-semibold opacity-50 w-chip"
              >
                <Check className="size-3.5" /> 已签到
              </span>
            ) : (
              <span
                className="flex h-8 items-center rounded-full px-4 text-xs font-bold shadow-sm"
                style={{ background: 'var(--p)', color: 'var(--pf)' }}
              >
                签到
              </span>
            )}
          </div>
          <div className="mt-1.5 text-xs opacity-60">
            已连续签到 <span className="font-bold" style={{ color: 'var(--p)' }}>{days}</span> 天
          </div>
          {/* 七日圆点：前 N 个主色已签 + 对勾 */}
          <div className="mt-3 flex items-center justify-between">
            {Array.from({ length: 7 }).map((_, i) => {
              const on = i < days;
              return (
                <span
                  key={i}
                  className={`flex size-7 items-center justify-center rounded-full ${on ? '' : 'w-chip border w-line'}`}
                  style={on ? { background: 'var(--p)', color: 'var(--pf)' } : undefined}
                >
                  {on ? <Check className="size-3.5" /> : <span className="size-1 rounded-full bg-current opacity-30" />}
                </span>
              );
            })}
          </div>
        </div>
      );
    },
  },
  {
    type: 'me.points-mall',
    category: 'profile',
    name: '积分卡',
    desc: '积分数字 + 兑换按钮 + 商品位',
    icon: Gift,
    defaultProps: { points: '8,640', btnText: '去兑换', items: '香薰蜡烛礼盒 800,便携蓝牙音箱 1999' },
    fields: [
      { key: 'points', label: '当前积分', type: 'text' },
      { key: 'btnText', label: '按钮文案', type: 'text' },
      { key: 'items', label: '商品位（名称 积分，逗号分隔 2 个）', type: 'textarea' },
    ],
    render: (p) => {
      const goods = splitList(p.items).slice(0, 2).map((raw) => {
        const [name, ...rest] = raw.split(/\s+/);
        return { name, cost: rest.join(' ') };
      });
      return (
        <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] opacity-50">我的积分</div>
              <div className="mt-1 text-3xl font-extrabold leading-none tracking-tight" style={{ color: 'var(--p)' }}>
                {p.points}
              </div>
            </div>
            <span
              className="flex h-8 items-center rounded-full px-4 text-xs font-bold shadow-sm"
              style={{ background: 'var(--p)', color: 'var(--pf)' }}
            >
              {p.btnText}
            </span>
          </div>
          {/* 底部 2 个商品位 */}
          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            {goods.map((g, i) => (
              <div key={`${g.name}-${i}`}>
                <div
                  className="flex h-20 items-center justify-center"
                  style={{
                    borderRadius: 'calc(var(--pr) - 4px)',
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--p) ${14 + i * 8}%, transparent), color-mix(in srgb, var(--p) ${38 + i * 8}%, transparent))`,
                  }}
                >
                  <ImageIcon className="size-6 opacity-30" />
                </div>
                <div className="mt-1.5 truncate text-[11px] font-semibold">{g.name}</div>
                <div className="mt-0.5 text-[10px] font-bold" style={{ color: 'var(--p)' }}>
                  {g.cost || '—'} <span className="font-normal opacity-45">积分</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'me.service-grid',
    category: 'profile',
    name: '服务九宫格',
    desc: '2 行 x 4 列常用服务入口',
    icon: LayoutGrid,
    defaultProps: { labels: '地址,客服,收藏,足迹,优惠券,帮助,设置,更多' },
    fields: [
      { key: 'labels', label: '服务文案（逗号分隔）', type: 'textarea', placeholder: '最多 8 个' },
    ],
    render: (p) => (
      <div className="w-card grid grid-cols-4 gap-y-4 px-2 py-4" style={{ borderRadius: 'var(--pr)' }}>
        {splitList(p.labels).slice(0, 8).map((label, i) => {
          const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
          return (
            <div key={`${label}-${i}`} className="flex flex-col items-center gap-1.5">
              <span
                className="flex size-11 items-center justify-center rounded-full"
                style={{ background: 'color-mix(in srgb, var(--p) 10%, transparent)', color: 'var(--p)' }}
              >
                <Icon className="size-5" />
              </span>
              <span className="text-[11px] opacity-70">{label}</span>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    type: 'me.about-head',
    category: 'profile',
    name: '关于页头',
    desc: '居中 App 图标 + 名称 + 版本 + Slogan',
    icon: Info,
    defaultProps: { appName: '星云手记', version: 'v1.0.0', slogan: '记录每一刻灵感闪光' },
    fields: [
      { key: 'appName', label: 'App 名称', type: 'text' },
      { key: 'version', label: '版本号', type: 'text' },
      { key: 'slogan', label: 'Slogan', type: 'text' },
    ],
    render: (p) => (
      <div className="flex flex-col items-center gap-2 py-6">
        {/* 渐变圆角方 App 图标 + 首字 */}
        <span
          className="flex size-16 items-center justify-center text-2xl font-extrabold shadow-md"
          style={{
            borderRadius: 'calc(var(--pr) + 4px)',
            background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #fff))',
            color: 'var(--pf)',
          }}
        >
          {String(p.appName || 'A').slice(0, 1)}
        </span>
        <span className="mt-1 text-base font-bold">{p.appName}</span>
        <span className="font-mono text-[11px] opacity-45">{p.version}</span>
        <span className="mt-0.5 text-xs opacity-55">{p.slogan}</span>
      </div>
    ),
  },
  {
    type: 'me.version-card',
    category: 'profile',
    name: '版本信息卡',
    desc: '当前版本 + 检查更新（可带 NEW 标）',
    icon: RefreshCw,
    defaultProps: { version: 'v1.0.0', btnText: '检查更新', hasNew: true },
    fields: [
      { key: 'version', label: '版本号', type: 'text' },
      { key: 'btnText', label: '按钮文案', type: 'text' },
      { key: 'hasNew', label: '显示 NEW 角标', type: 'switch' },
    ],
    render: (p) => (
      <div className="w-card flex h-14 items-center justify-between px-4" style={{ borderRadius: 'var(--pr)' }}>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">当前版本</span>
          <span className="text-sm opacity-45">{p.version}</span>
        </div>
        <span className="relative">
          <span
            className="flex h-8 items-center rounded-full px-3.5 text-xs font-semibold"
            style={{ border: '1.5px solid var(--p)', color: 'var(--p)' }}
          >
            {p.btnText}
          </span>
          {p.hasNew === true && (
            <span
              className="absolute -right-1.5 -top-1.5 rounded-full px-1 py-0.5 text-[8px] font-bold leading-none text-white"
              style={{ background: '#f43f5e' }}
            >
              NEW
            </span>
          )}
        </span>
      </div>
    ),
  },
  {
    type: 'me.vip-banner',
    category: 'profile',
    name: '会员横幅',
    desc: '金色/主色渐变横条 + 开通按钮',
    icon: Gem,
    defaultProps: { title: '开通会员享 8 大权益', sub: '专属折扣 · 免费包邮 · 专属客服', btnText: '立即开通', style: 'gold' },
    fields: [
      { key: 'title', label: '主标题', type: 'text' },
      { key: 'sub', label: '副标题', type: 'text' },
      { key: 'btnText', label: '按钮文案', type: 'text' },
      {
        key: 'style', label: '横幅配色', type: 'select',
        options: [{ label: '金色', value: 'gold' }, { label: '主题色', value: 'primary' }],
      },
    ],
    render: (p) => {
      const gold = p.style !== 'primary';
      return (
        <div
          className="flex items-center gap-3 p-3.5"
          style={{
            borderRadius: 'var(--pr)',
            background: gold
              ? 'linear-gradient(115deg, #b45309 0%, #d97706 48%, #f59e0b 100%)'
              : 'linear-gradient(115deg, var(--p), color-mix(in srgb, var(--p) 62%, #fff))',
            color: gold ? '#ffffff' : 'var(--pf)',
          }}
        >
          <Crown className="size-6 shrink-0" fill="currentColor" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-extrabold">{p.title}</div>
            <div className="mt-0.5 truncate text-[10px] opacity-80">{p.sub}</div>
          </div>
          {/* 深色按钮 */}
          <span
            className="flex h-7 shrink-0 items-center rounded-full px-3 text-[11px] font-bold"
            style={
              gold
                ? { background: '#1c1917', color: '#fcd34d' }
                : { background: 'rgba(0,0,0,0.28)', color: 'var(--pf)' }
            }
          >
            {p.btnText}
          </span>
        </div>
      );
    },
  },
  {
    type: 'me.achievement-badge',
    category: 'profile',
    name: '成就墙',
    desc: '四枚圆形徽章，前 N 枚点亮',
    icon: Trophy,
    defaultProps: {
      title: '成就徽章',
      unlocked: 2,
      items: '初来乍到 2025-06-12,七日签到王 2025-08-15,百单达人 2025-09-30,全勤之星 2025-11-01',
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'unlocked', label: '已解锁数量', type: 'number', min: 0, max: 4, step: 1 },
      { key: 'items', label: '徽章（名称 获取时间，逗号分隔 4 个）', type: 'textarea' },
    ],
    render: (p) => {
      const unlocked = Math.max(0, Math.min(4, Math.round(Number(p.unlocked) || 0)));
      const badges = splitList(p.items).slice(0, 4).map((raw) => {
        const [name, ...rest] = raw.split(/\s+/);
        return { name, date: rest.join(' ') };
      });
      return (
        <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-extrabold">{p.title}</span>
            <span className="text-[11px] opacity-45">{unlocked}/{badges.length} 已解锁</span>
          </div>
          <div className="mt-3.5 grid grid-cols-4 gap-2">
            {badges.map((b, i) => {
              const on = i < unlocked;
              const Icon = BADGE_ICONS[i % BADGE_ICONS.length];
              return (
                <div key={`${b.name}-${i}`} className="flex min-w-0 flex-col items-center gap-1.5">
                  <span
                    className={`flex size-[52px] items-center justify-center rounded-full ${on ? 'shadow-sm' : 'w-chip border border-dashed w-line'}`}
                    style={on ? { background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#fff' } : undefined}
                  >
                    <Icon className="size-5" style={on ? { color: '#fff' } : { opacity: 0.3 }} />
                  </span>
                  <span className={`max-w-full truncate text-[10px] ${on ? 'font-semibold' : 'opacity-35'}`}>{b.name}</span>
                  <span className="text-[9px] leading-none opacity-40">{on ? (b.date || '已解锁') : '未解锁'}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  },
  {
    type: 'me.logout-btn',
    category: 'profile',
    name: '退出登录按钮',
    desc: '通栏卡片式玫红文字按钮',
    icon: LogOut,
    defaultProps: { text: '退出登录' },
    fields: [
      { key: 'text', label: '按钮文案', type: 'text' },
    ],
    render: (p) => (
      <div className="w-card flex h-12 items-center justify-center active:opacity-70" style={{ borderRadius: 'var(--pr)' }}>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-rose-500">
          <LogOut className="size-4" />
          {p.text}
        </span>
      </div>
    ),
  },
];
