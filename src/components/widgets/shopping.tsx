import {
  Image as ImageIcon, Heart, JapaneseYen, Palette, Minus, Plus, ShieldCheck, Truck,
  RotateCcw, Star, MapPin, ChevronRight, ShoppingCart, MessageCircle, ReceiptText,
} from 'lucide-react';
import type { WidgetDef } from '@/lib/widget-types';
import { QtyStepperInteractive, SkuSelectInteractive } from './interactive';

/**
 * 购物 / 商品详情 组件库（目录：shopping）
 * 规范与 login.tsx 一致：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应；
 * 图片位一律使用渐变 + lucide 图标占位，禁止外部图片 URL。
 */

/** 逗号 / 中文逗号分隔 → 字符串数组（去空白项） */
const splitList = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,]/).map((s) => s.trim()).filter(Boolean);

export const widgets: WidgetDef[] = [
  {
    type: 'shop.detail-hero',
    category: 'shopping',
    name: '商品主图',
    desc: '通栏主图轮播占位 + 收藏按钮',
    icon: ImageIcon,
    fullBleed: true,
    defaultProps: { fav: true },
    fields: [
      { key: 'fav', label: '显示收藏按钮', type: 'switch' },
    ],
    render: (p) => (
      <div className="relative h-[260px] w-full">
        {/* 渐变图片占位 */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(160deg, color-mix(in srgb, var(--p) 22%, transparent), color-mix(in srgb, var(--p) 52%, transparent))' }}
        >
          <ImageIcon className="size-14 opacity-30" />
        </div>
        {/* 右上角收藏心形 */}
        {p.fav !== false && (
          <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/25">
            <Heart className="size-4 text-white" />
          </span>
        )}
        {/* 底部指示点 */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="size-1.5 rounded-full"
              style={{ background: i === 0 ? '#fff' : 'color-mix(in srgb, #fff 45%, transparent)' }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'shop.price-row',
    category: 'shopping',
    name: '价格行',
    desc: '大字价格 + 划线原价 + 标签组',
    icon: JapaneseYen,
    defaultProps: { price: '1299', original: '1699', sales: '3.2万', tags: '包邮,顺丰' },
    fields: [
      { key: 'price', label: '售价', type: 'text' },
      { key: 'original', label: '原价', type: 'text' },
      { key: 'sales', label: '已售', type: 'text' },
      { key: 'tags', label: '标签', type: 'textarea', placeholder: '逗号分隔，如：包邮,顺丰' },
    ],
    render: (p) => (
      <div className="flex items-start justify-between px-0.5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold leading-none" style={{ color: 'var(--p)' }}>
              <span className="text-sm">¥</span>{p.price}
            </span>
            <span className="text-xs line-through opacity-40">¥{p.original}</span>
          </div>
          <p className="mt-1.5 text-[11px] opacity-45">已售 {p.sales}</p>
        </div>
        {/* 右侧标签组 */}
        <div className="flex shrink-0 gap-1.5 pt-0.5">
          {splitList(p.tags).slice(0, 3).map((tag, i) => (
            <span key={`${tag}-${i}`} className="w-chip px-1.5 py-0.5 text-[10px] font-medium leading-none" style={{ borderRadius: '4px' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'shop.sku-select',
    category: 'shopping',
    name: 'SKU 选择',
    desc: '颜色 / 版本规格 chips',
    icon: Palette,
    defaultProps: { colors: '月光白,曜石黑,晨曦粉', versions: '标准版,高配版' },
    fields: [
      { key: 'colors', label: '颜色', type: 'textarea', placeholder: '逗号分隔' },
      { key: 'versions', label: '版本', type: 'textarea', placeholder: '逗号分隔' },
      { key: 'channel', label: '联动频道（高级）', type: 'text', placeholder: '写入已选规格，如 sku' },
    ],
    Interactive: SkuSelectInteractive,
    render: (p) => (
      <div className="w-card space-y-3.5 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
        {[
          { label: '颜色', items: splitList(p.colors) },
          { label: '版本', items: splitList(p.versions) },
        ].filter((row) => row.items.length > 0).map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <span className="w-7 shrink-0 pt-0.5 text-xs opacity-50">{row.label}</span>
            <div className="flex flex-wrap gap-1.5">
              {row.items.map((item, i) => {
                const active = i === 0; // 默认选中第一项
                return active ? (
                  <span
                    key={item}
                    className="px-2.5 py-1 text-xs font-semibold"
                    style={{
                      borderRadius: 'calc(var(--pr) - 6px)',
                      border: '1px solid var(--p)',
                      background: 'color-mix(in srgb, var(--p) 10%, transparent)',
                      color: 'var(--p)',
                    }}
                  >
                    {item}
                  </span>
                ) : (
                  <span key={item} className="w-chip px-2.5 py-1 text-xs opacity-65" style={{ borderRadius: 'calc(var(--pr) - 6px)' }}>
                    {item}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    type: 'shop.qty-stepper',
    category: 'shopping',
    name: '数量步进器',
    desc: '购买数量 + 圆形加减按钮',
    icon: Minus,
    defaultProps: { label: '购买数量', value: 1 },
    fields: [
      { key: 'label', label: '左侧文案', type: 'text' },
      { key: 'value', label: '数量', type: 'number', min: 1, max: 99, step: 1 },
      { key: 'channel', label: '联动频道（高级）', type: 'text', placeholder: '写入当前数量，如 qty' },
    ],
    Interactive: QtyStepperInteractive,
    render: (p) => (
      <div className="flex items-center justify-between px-0.5">
        <span className="text-sm font-semibold">{p.label}</span>
        <div className="flex items-center gap-2.5">
          {/* 圆形步进按钮 */}
          <span className="w-chip flex size-7 items-center justify-center rounded-full border w-line">
            <Minus className="size-3.5 opacity-55" />
          </span>
          <span className="min-w-6 text-center text-sm font-bold">{p.value}</span>
          <span className="w-chip flex size-7 items-center justify-center rounded-full border w-line" style={{ color: 'var(--p)' }}>
            <Plus className="size-3.5" />
          </span>
        </div>
      </div>
    ),
  },
  {
    type: 'shop.service-row',
    category: 'shopping',
    name: '服务保障行',
    desc: '三项服务承诺横排',
    icon: ShieldCheck,
    defaultProps: { s1: '顺丰包邮', s2: '七天无理由', s3: '正品保障' },
    fields: [
      { key: 's1', label: '第一项文案', type: 'text' },
      { key: 's2', label: '第二项文案', type: 'text' },
      { key: 's3', label: '第三项文案', type: 'text' },
    ],
    render: (p) => (
      <div className="flex items-center justify-between border-y w-line px-1 py-3">
        {[
          { icon: Truck, text: p.s1 },
          { icon: RotateCcw, text: p.s2 },
          { icon: ShieldCheck, text: p.s3 },
        ].map(({ icon: Icon, text }, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11px] opacity-65">
            <Icon className="size-3.5" style={{ color: 'var(--p)' }} />
            {text}
          </span>
        ))}
      </div>
    ),
  },
  {
    type: 'shop.review-item',
    category: 'shopping',
    name: '评价卡片',
    desc: '用户评价 + 官方回复',
    icon: Star,
    defaultProps: {
      user: '柠*檬',
      date: '2025-06-18',
      content: '面膜超级服帖，敷完水润润的，第二天上妆也不卡粉，已经是回购的第三盒了！',
      reply: '感谢您的信任与支持，我们会持续带来更多好用的新品～',
    },
    fields: [
      { key: 'user', label: '用户名', type: 'text' },
      { key: 'date', label: '日期', type: 'text' },
      { key: 'content', label: '评价内容', type: 'textarea' },
      { key: 'reply', label: '官方回复', type: 'textarea' },
    ],
    render: (p) => (
      <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
        <div className="flex items-center gap-2.5">
          {/* 圆形首字头像 */}
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
          >
            {String(p.user || '评').slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{p.user}</p>
            <div className="mt-1 flex gap-0.5">
              {/* 五星（主色填充） */}
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3" style={{ color: 'var(--p)', fill: 'var(--p)' }} />
              ))}
            </div>
          </div>
          <span className="shrink-0 text-[10px] opacity-40">{p.date}</span>
        </div>
        <p className="mt-2.5 line-clamp-2 text-xs leading-5 opacity-75">{p.content}</p>
        {/* 官方回复浅色块 */}
        <div className="w-chip mt-3 p-2.5 text-[11px] leading-4 opacity-60" style={{ borderRadius: 'calc(var(--pr) - 6px)' }}>
          <span className="font-semibold" style={{ color: 'var(--p)' }}>官方回复：</span>
          {p.reply}
        </div>
      </div>
    ),
  },
  {
    type: 'shop.address-bar',
    category: 'shopping',
    name: '收货地址条',
    desc: '姓名电话 + 详细地址',
    icon: MapPin,
    defaultProps: { name: '林晓', phone: '138****6688', address: '浙江省杭州市西湖区文三路 138 号 西溪世纪广场 3 幢 802 室' },
    fields: [
      { key: 'name', label: '姓名', type: 'text' },
      { key: 'phone', label: '电话', type: 'text' },
      { key: 'address', label: '地址', type: 'textarea' },
    ],
    render: (p) => (
      <div className="w-card flex items-center gap-3 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
        <MapPin className="size-5 shrink-0" style={{ color: 'var(--p)' }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">
            {p.name}
            <span className="ml-2">{p.phone}</span>
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-4 opacity-55">{p.address}</p>
        </div>
        <ChevronRight className="size-4 shrink-0 opacity-35" />
      </div>
    ),
  },
  {
    type: 'shop.add-cart-bar',
    category: 'shopping',
    name: '底部操作条',
    desc: '购物车 / 客服 + 加购与购买按钮',
    icon: ShoppingCart,
    fullBleed: true,
    defaultProps: { cartText: '加入购物车', buyText: '立即购买' },
    fields: [
      { key: 'cartText', label: '加购按钮文案', type: 'text' },
      { key: 'buyText', label: '购买按钮文案', type: 'text' },
    ],
    render: (p) => (
      <div
        className="w-card flex h-14 items-center gap-3.5 border-t w-line px-4"
        style={{ borderRadius: 'calc(var(--pr) + 2px) calc(var(--pr) + 2px) 0 0' }}
      >
        {/* 左侧竖排小图标钮 */}
        <span className="flex shrink-0 flex-col items-center gap-0.5 opacity-70">
          <ShoppingCart className="size-[18px]" />
          <span className="text-[9px] leading-none">购物车</span>
        </span>
        <span className="flex shrink-0 flex-col items-center gap-0.5 opacity-70">
          <MessageCircle className="size-[18px]" />
          <span className="text-[9px] leading-none">客服</span>
        </span>
        {/* 右侧大按钮 */}
        <div className="ml-auto flex flex-1 items-center gap-2">
          <button
            className="h-10 flex-1 text-[13px] font-bold active:scale-[0.98]"
            style={{
              borderRadius: 'calc(var(--pr) + 4px)',
              background: 'color-mix(in srgb, var(--p) 14%, transparent)',
              color: 'var(--p)',
            }}
          >
            {p.cartText}
          </button>
          <button
            className="h-10 flex-1 text-[13px] font-bold shadow-md active:scale-[0.98]"
            style={{ borderRadius: 'calc(var(--pr) + 4px)', background: 'var(--p)', color: 'var(--pf)' }}
          >
            {p.buyText}
          </button>
        </div>
      </div>
    ),
  },
  {
    type: 'shop.order-summary',
    category: 'shopping',
    name: '订单汇总',
    desc: '金额明细 + 实付款',
    icon: ReceiptText,
    defaultProps: { goods: '1299.00', freight: '免运费', coupon: '100', total: '1199.00' },
    fields: [
      { key: 'goods', label: '商品金额', type: 'text' },
      { key: 'freight', label: '运费', type: 'text' },
      { key: 'coupon', label: '优惠券', type: 'text' },
      { key: 'total', label: '实付款', type: 'text' },
    ],
    render: (p) => (
      <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="opacity-55">商品金额</span>
            <span>¥{p.goods}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="opacity-55">运费</span>
            <span>{p.freight}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="opacity-55">优惠券</span>
            <span style={{ color: 'var(--p)' }}>-¥{p.coupon}</span>
          </div>
        </div>
        <div className="my-3.5 h-px w-line border-t" />
        {/* 实付款右对齐主色大字 */}
        <div className="flex items-baseline justify-end gap-1.5">
          <span className="text-xs opacity-55">实付款</span>
          <span className="text-xl font-extrabold leading-none" style={{ color: 'var(--p)' }}>
            <span className="text-xs">¥</span>{p.total}
          </span>
        </div>
      </div>
    ),
  },
];
