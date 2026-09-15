import {
  Search, GalleryHorizontal, Image as ImageIcon, Megaphone, LayoutGrid, Heading1,
  ShoppingBag, Shirt, Coffee, Gamepad2, Headphones, Gift, Watch, Smartphone,
  Grid2x2, Plus, Flame, TicketPercent, Ticket, Crown, ChevronRight,
} from 'lucide-react';
import type { WidgetDef } from '@/lib/widget-types';
import { SearchInputInteractive } from './interactive';

/**
 * 商城首页 组件库（目录：mall）
 * 规范与 login.tsx 一致：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应；
 * 图片位一律使用渐变 + lucide 图标占位，禁止外部图片 URL。
 */

/** 金刚区预设图标池（按顺序循环取用） */
const CAT_ICONS = [ShoppingBag, Shirt, Coffee, Gamepad2, Headphones, Gift, Watch, Smartphone];

/** 逗号 / 中文逗号分隔 → 字符串数组（去空白项） */
const splitList = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,]/).map((s) => s.trim()).filter(Boolean);

export const widgets: WidgetDef[] = [
  {
    type: 'mall.search',
    category: 'mall',
    name: '搜索栏',
    desc: '首页顶部圆角搜索框 + 搜索按钮',
    icon: Search,
    defaultProps: { placeholder: '搜索商品 / 品牌 / 好物', btnText: '搜索' },
    fields: [
      { key: 'placeholder', label: '提示文案', type: 'text' },
      { key: 'btnText', label: '按钮文案', type: 'text' },
    ],
    Interactive: SearchInputInteractive,
    render: (p) => (
      <div className="w-input flex h-10 items-center gap-2 pl-3.5 pr-1" style={{ borderRadius: '999px' }}>
        <Search className="size-4 shrink-0 opacity-45" />
        <span className="flex-1 truncate text-[13px] opacity-40">{p.placeholder}</span>
        <span
          className="flex h-8 shrink-0 items-center px-4 text-xs font-semibold"
          style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
        >
          {p.btnText}
        </span>
      </div>
    ),
  },
  {
    type: 'mall.banner',
    category: 'mall',
    name: '首页轮播 Banner',
    desc: '通栏渐变主视觉 + 圆点指示器',
    icon: GalleryHorizontal,
    fullBleed: true,
    defaultProps: { title: '夏日焕新季', subtitle: '全场低至 5 折 · 满 300 减 50', height: 160 },
    fields: [
      { key: 'title', label: '主标题', type: 'text' },
      { key: 'subtitle', label: '副标题', type: 'text' },
      { key: 'height', label: '高度', type: 'number', min: 120, max: 220, step: 10 },
    ],
    render: (p) => {
      const h = Math.min(220, Math.max(120, Number(p.height) || 160));
      return (
        <div className="relative w-full overflow-hidden" style={{ height: h }}>
          {/* 渐变主视觉（基于主色 color-mix）+ 装饰圆 */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(118deg, var(--p) 0%, color-mix(in srgb, var(--p) 62%, #fff) 58%, color-mix(in srgb, var(--p) 88%, #000) 100%)' }}
          />
          <div className="absolute -right-7 -top-12 size-32 rounded-full" style={{ background: 'color-mix(in srgb, #fff 20%, transparent)' }} />
          <div className="absolute -bottom-14 -left-6 size-28 rounded-full" style={{ background: 'color-mix(in srgb, #fff 12%, transparent)' }} />
          {/* 文案 */}
          <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-5">
            <span className="text-xl font-extrabold tracking-wide" style={{ color: 'var(--pf)' }}>{p.title}</span>
            <span className="text-xs opacity-80" style={{ color: 'var(--pf)' }}>{p.subtitle}</span>
          </div>
          {/* 指示器：当前点白色实心 */}
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className="size-1.5 rounded-full"
                style={{ background: i === 0 ? '#fff' : 'color-mix(in srgb, #fff 45%, transparent)' }}
              />
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'mall.notice-bar',
    category: 'mall',
    name: '公告栏',
    desc: '通栏公告条（文字溢出省略）',
    icon: Megaphone,
    fullBleed: true,
    defaultProps: { text: '新品体验官招募中，前 100 名下单立减 30 元，点击查看详情' },
    fields: [
      { key: 'text', label: '公告文案', type: 'textarea' },
    ],
    render: (p) => (
      <div className="w-chip flex h-10 items-center gap-2 px-3" style={{ borderRadius: 'var(--pr)' }}>
        <Megaphone className="size-4 shrink-0" style={{ color: 'var(--p)' }} />
        <span
          className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold leading-none"
          style={{ borderRadius: '4px', background: 'var(--p)', color: 'var(--pf)' }}
        >
          公告
        </span>
        <span className="flex-1 truncate text-xs opacity-60">{p.text}</span>
        <ChevronRight className="size-3.5 shrink-0 opacity-40" />
      </div>
    ),
  },
  {
    type: 'mall.category-grid',
    category: 'mall',
    name: '金刚区',
    desc: '4 x 2 圆形图标快捷入口',
    icon: LayoutGrid,
    defaultProps: { labels: '女装,数码,美食,游戏,母婴,生鲜,美妆,家电' },
    fields: [
      { key: 'labels', label: '分类文案', type: 'textarea', placeholder: '逗号分隔，最多 8 个' },
    ],
    render: (p) => (
      <div className="w-card grid grid-cols-4 gap-y-4 px-2 py-4" style={{ borderRadius: 'var(--pr)' }}>
        {splitList(p.labels).slice(0, 8).map((label, i) => {
          const Icon = CAT_ICONS[i % CAT_ICONS.length];
          return (
            <div key={`${label}-${i}`} className="flex flex-col items-center gap-1.5">
              <span
                className="flex size-11 items-center justify-center rounded-full"
                style={{ background: 'color-mix(in srgb, var(--p) 10%, transparent)', color: 'var(--p)' }}
              >
                <Icon className="size-5" />
              </span>
              <span className="max-w-full truncate text-[11px] opacity-70">{label}</span>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    type: 'mall.section-header',
    category: 'mall',
    name: '标题行',
    desc: '分区标题 + 查看全部入口',
    icon: Heading1,
    defaultProps: { title: '猜你喜欢', more: '查看全部' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'more', label: '右侧文案', type: 'text' },
    ],
    render: (p) => (
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full" style={{ background: 'var(--p)' }} />
          <span className="text-[15px] font-bold">{p.title}</span>
        </div>
        {p.more ? (
          <span className="flex items-center text-[11px] opacity-50">
            {p.more} <ChevronRight className="size-3.5" />
          </span>
        ) : null}
      </div>
    ),
  },
  {
    type: 'mall.product-card',
    category: 'mall',
    name: '单列商品卡',
    desc: '大图商品卡 + 价格 + 加购按钮',
    icon: ShoppingBag,
    defaultProps: { name: '轻氧玻尿酸补水保湿面膜 30 片装', price: '89', original: '129', sales: '2.3万' },
    fields: [
      { key: 'name', label: '商品名称', type: 'textarea' },
      { key: 'price', label: '售价', type: 'text' },
      { key: 'original', label: '原价', type: 'text' },
      { key: 'sales', label: '已售', type: 'text' },
    ],
    render: (p) => (
      <div className="w-card overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
        {/* 渐变图片占位 */}
        <div
          className="flex h-36 items-center justify-center"
          style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 16%, transparent), color-mix(in srgb, var(--p) 42%, transparent))' }}
        >
          <ImageIcon className="size-9 opacity-30" />
        </div>
        <div className="p-3">
          <p className="line-clamp-2 min-h-10 text-[13px] leading-5">{p.name}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold leading-none" style={{ color: 'var(--p)' }}>
              <span className="text-xs">¥</span>{p.price}
            </span>
            <span className="text-[11px] line-through opacity-40">¥{p.original}</span>
          </div>
          <div className="mt-1.5 flex items-end justify-between">
            <span className="text-[10px] opacity-45">已售 {p.sales}</span>
            {/* 圆形加购按钮 */}
            <span
              className="flex size-7 items-center justify-center rounded-full shadow-sm"
              style={{ background: 'var(--p)', color: 'var(--pf)' }}
            >
              <Plus className="size-4" />
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    type: 'mall.product-grid',
    category: 'mall',
    name: '双列商品网格',
    desc: '双列迷你商品卡（骨架占位）',
    icon: Grid2x2,
    defaultProps: { count: 4 },
    fields: [
      { key: 'count', label: '商品数量', type: 'number', min: 2, max: 6, step: 2 },
    ],
    render: (p) => {
      const count = Math.min(6, Math.max(2, Number(p.count) || 4));
      const prices = ['128', '59', '199', '89', '45', '159'];
      return (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="w-card overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
              <div
                className="flex h-24 items-center justify-center"
                style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--p) ${14 + (i % 3) * 7}%, transparent), color-mix(in srgb, var(--p) ${36 + (i % 3) * 7}%, transparent))` }}
              >
                <ImageIcon className="size-7 opacity-30" />
              </div>
              <div className="space-y-1.5 p-2.5">
                {/* 两行文字骨架线 */}
                <span className="block h-2 w-4/5 rounded-full bg-current opacity-15" />
                <span className="block h-2 w-3/5 rounded-full bg-current opacity-15" />
                <span className="block pt-0.5 text-sm font-extrabold leading-none" style={{ color: 'var(--p)' }}>
                  <span className="text-[10px]">¥</span>{prices[i % prices.length]}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'mall.flash-sale',
    category: 'mall',
    name: '限时秒杀横条',
    desc: '标题 + 时:分 倒计时色块 + 横排秒杀商品位',
    icon: Flame,
    defaultProps: { title: '限时秒杀', hours: '02', minutes: '45' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'hours', label: '倒计时 · 时', type: 'text', placeholder: '如 02' },
      { key: 'minutes', label: '倒计时 · 分', type: 'text', placeholder: '如 45' },
    ],
    render: (p) => {
      /* 时 / 分均取两位数字（容忍 '2 h' 之类写法，非法按 0） */
      const pad2 = (v: unknown) =>
        String(Math.min(99, Math.max(0, Math.round(Number(String(v ?? '').replace(/[^\d.-]/g, '')) || 0)))).padStart(2, '0');
      const blocks = [pad2(p.hours), pad2(p.minutes)];
      const prices = ['29', '99', '59'];
      const originals = ['69', '199', '129'];
      return (
        <div className="w-card p-3" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="size-4" style={{ color: 'var(--p)' }} />
              <span className="text-[15px] font-extrabold">{p.title}</span>
            </div>
            {/* 倒计时色块（时 : 分，黑底白字） */}
            <div className="flex items-center gap-1">
              {blocks.map((t, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-[10px] font-bold opacity-40">:</span>}
                  <span className="rounded-md bg-zinc-900 px-1.5 py-1 font-mono text-[11px] font-bold leading-none text-white">{t}</span>
                </span>
              ))}
            </div>
          </div>
          {/* 横排 3 个秒杀商品位（图块 + 主色价格） */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div
                  className="flex h-20 items-center justify-center"
                  style={{
                    borderRadius: 'calc(var(--pr) - 4px)',
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--p) ${16 + i * 8}%, transparent), color-mix(in srgb, var(--p) ${40 + i * 8}%, transparent))`,
                  }}
                >
                  <ImageIcon className="size-6 opacity-30" />
                </div>
                <div className="mt-1.5 flex items-baseline justify-center gap-1">
                  <span className="text-sm font-extrabold leading-none" style={{ color: 'var(--p)' }}>
                    <span className="text-[10px]">¥</span>{prices[i]}
                  </span>
                  <span className="text-[10px] line-through opacity-40">¥{originals[i]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'mall.coupon-card',
    category: 'mall',
    name: '优惠券',
    desc: '面额票券卡 + 领取按钮',
    icon: TicketPercent,
    defaultProps: { amount: '50', condition: '299', desc: '全场通用 · 可叠加会员折扣', date: '有效期至 2025-12-31', btnText: '立即领取' },
    fields: [
      { key: 'amount', label: '面额', type: 'text' },
      { key: 'condition', label: '使用门槛', type: 'text', placeholder: '满多少可用' },
      { key: 'desc', label: '说明', type: 'text' },
      { key: 'date', label: '有效期', type: 'text' },
      { key: 'btnText', label: '按钮文案', type: 'text' },
    ],
    render: (p) => (
      <div className="w-card flex items-stretch overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
        {/* 左侧主色金额区 */}
        <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 py-4" style={{ background: 'var(--p)', color: 'var(--pf)' }}>
          <span className="font-extrabold leading-none">
            <span className="text-xs">¥</span>
            <span className="text-2xl">{p.amount}</span>
          </span>
          <span className="text-[10px] opacity-80">满 {p.condition} 可用</span>
        </div>
        {/* 虚线撕票分隔 */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 border-l border-dashed w-line px-3.5">
          <span className="truncate text-xs font-semibold opacity-75">{p.desc}</span>
          <span className="text-[10px] opacity-45">{p.date}</span>
        </div>
        <div className="flex items-center pr-3">
          <span
            className="flex h-8 items-center whitespace-nowrap rounded-full border px-3 text-xs font-bold w-line"
            style={{ borderColor: 'var(--p)', color: 'var(--p)' }}
          >
            {p.btnText}
          </span>
        </div>
      </div>
    ),
  },
  {
    type: 'mall.coupon-row',
    category: 'mall',
    name: '优惠券横条',
    desc: '2~3 张迷你票券：面额大字主色 + 门槛 + 虚线分隔 + 领取按钮',
    icon: Ticket,
    defaultProps: { amount: '50,30,20', threshold: '199,99,59' },
    fields: [
      { key: 'amount', label: '面额（逗号分隔）', type: 'textarea', placeholder: '如 50,30,20，取前 3 张' },
      { key: 'threshold', label: '使用门槛（逗号分隔）', type: 'textarea', placeholder: '与面额一一对应，如 199,99,59' },
    ],
    render: (p) => {
      const amounts = splitList(p.amount).slice(0, 3);
      const thresholds = splitList(p.threshold);
      const list = amounts.length ? amounts : ['50', '30', '20'];
      return (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${list.length}, minmax(0, 1fr))` }}>
          {list.map((amt, i) => (
            <div key={`${amt}-${i}`} className="w-card px-2 py-2.5 text-center" style={{ borderRadius: 'var(--pr)' }}>
              {/* 面额大字（主色） */}
              <div className="font-extrabold leading-none" style={{ color: 'var(--p)' }}>
                <span className="text-[10px]">¥</span>
                <span className="text-lg">{amt}</span>
              </div>
              {/* 门槛小字 */}
              <div className="mt-1 truncate text-[9px] leading-none opacity-45">满 {thresholds[i] ?? '0'} 可用</div>
              {/* 虚线撕票分隔 + 领取按钮（主色圆角） */}
              <div className="mt-2 border-t border-dashed w-line pt-2">
                <span
                  className="block py-1 text-[10px] font-bold leading-none"
                  style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
                >
                  领取
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'mall.brand-row',
    category: 'mall',
    name: '品牌馆',
    desc: '横滑品牌卡片位',
    icon: Crown,
    defaultProps: { brands: '悦颜美妆,星曜数码,沐光家居' },
    fields: [
      { key: 'brands', label: '品牌名', type: 'textarea', placeholder: '逗号分隔，最多 3 个' },
    ],
    render: (p) => (
      <div className="flex gap-2 overflow-hidden">
        {splitList(p.brands).slice(0, 3).map((brand, i) => (
          <div
            key={`${brand}-${i}`}
            className="flex h-20 w-[32%] shrink-0 flex-col justify-end gap-1 overflow-hidden p-2.5"
            style={{
              borderRadius: 'var(--pr)',
              background: `linear-gradient(135deg, color-mix(in srgb, var(--p) ${30 - i * 8}%, transparent), color-mix(in srgb, var(--p) ${10 - i * 2}%, transparent))`,
            }}
          >
            <span className="truncate text-[13px] font-bold">{brand}</span>
            <span
              className="w-fit px-1 py-0.5 text-[9px] font-semibold leading-none"
              style={{ borderRadius: '4px', background: 'var(--p)', color: 'var(--pf)' }}
            >
              官方旗舰
            </span>
          </div>
        ))}
      </div>
    ),
  },
];
