'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Search, GalleryHorizontal, Image as ImageIcon, Megaphone, LayoutGrid, Heading1,
  ShoppingBag, Shirt, Coffee, Gamepad2, Headphones, Gift, Watch, Smartphone,
  Grid2x2, Plus, Check, X, Flame, TicketPercent, Ticket, Crown, ChevronRight,
} from 'lucide-react';
import type { WidgetDef, WidgetProps, InteractiveCtx } from '@/lib/widget-types';
import { parseCells, splitList, cellsToSlots, useCellAct, normalizeProducts, productsToSlots, type GridCell, type ProductItem } from './grid-kit';
import { useBusScope } from '@/lib/interaction-bus';
import { fireToast } from '@/lib/widget-toast';
import { stopAct, useAction, useLocalToggle } from './action-kit';

/**
 * 商城首页 组件库（目录：mall）
 * 规范与 login.tsx 一致：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应；
 * 图片位一律使用渐变 + lucide 图标占位，禁止外部图片 URL。
 */

/** 金刚区预设图标池（按顺序循环取用；cellsIcons 同序作为逐格默认图标建议） */
const CAT_ICONS = [ShoppingBag, Shirt, Coffee, Gamepad2, Headphones, Gift, Watch, Smartphone];
const CAT_ICON_NAMES = ['shopping-bag', 'tag', 'coffee', 'gamepad-2', 'headphones', 'gift', 'clock', 'zap'];

/** 金刚区视图（静态/交互共用；onTapCell 存在时逐格可点击） */
function CategoryGridView({
  cells,
  onTapCell,
}: {
  cells: (GridCell & { Icon: LucideIcon })[];
  onTapCell?: (i: number) => void;
}) {
  return (
    <div className="w-card grid grid-cols-4 gap-y-4 px-2 py-4" style={{ borderRadius: 'var(--pr)' }}>
      {cells.map((c, i) => {
        const body = (
          <>
            <span
              className="flex size-11 items-center justify-center rounded-full"
              style={{ background: 'color-mix(in srgb, var(--p) 10%, transparent)', color: 'var(--p)' }}
            >
              <c.Icon className="size-5" />
            </span>
            <span className="max-w-full truncate text-[11px] opacity-70">{c.label}</span>
          </>
        );
        return onTapCell ? (
          <button
            key={`${c.label}-${i}`}
            type="button"
            aria-label={c.label}
            data-cell-index={i}
            onClick={(e) => { stopAct(e); onTapCell(i); }}
            className="flex min-w-0 flex-col items-center gap-1.5 transition-opacity active:opacity-60"
          >
            {body}
          </button>
        ) : (
          <div key={`${c.label}-${i}`} data-cell-index={i} className="flex min-w-0 flex-col items-center gap-1.5">
            {body}
          </div>
        );
      })}
    </div>
  );
}

/** 金刚区交互：格动作（昼夜/提示）→ 逐格压栈跳页（未绑定提示）→ 整卡跳页 → 未绑定提示 */
function CategoryGridInteractive({ props, slotPush, onTap }: InteractiveCtx) {
  const cells = useMemo(() => parseCells(props.cells, props.labels, CAT_ICONS).slice(0, 8), [props]);
  const scope = useBusScope();
  const onAct = useCellAct(cells);
  const unboundHint = (i: number) =>
    fireToast(scope, cells[i]?.label ? `「${cells[i].label}」尚未绑定页面，选中组件后在「交互」页绑定` : '该格子尚未绑定页面', 'info');
  const onCell = (i: number) => {
    if (onAct(i)) return;
    if (slotPush) {
      if (!slotPush(String(i))) unboundHint(i);
      return;
    }
    if (onTap) {
      onTap();
      return;
    }
    unboundHint(i);
  };
  return <CategoryGridView cells={cells} onTapCell={onCell} />;
}

/* ------------------------------------------------------------------ */
/* 商城组件 Interactive 实现（仅预览模式挂载）：所有可点元素原地生效     */
/* ------------------------------------------------------------------ */

/** 搜索栏：可输入 + 清空 + 搜索钮点击 toast（有词搜词，空词提示） */
function MallSearchInteractive({ props }: InteractiveCtx) {
  const [val, setVal] = useState('');
  const { toast } = useAction();
  const doSearch = () => {
    const kw = val.trim();
    toast(kw ? `搜索：${kw}` : '请输入搜索内容', 'info');
  };
  return (
    <div className="w-input flex h-10 items-center gap-2 pl-3.5 pr-1" style={{ borderRadius: '999px' }}>
      <Search className="size-4 shrink-0 opacity-45" />
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
        placeholder={props.placeholder}
        aria-label="搜索商品"
        className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-40"
      />
      {val && (
        <button
          type="button"
          aria-label="清空搜索"
          onClick={(e) => { stopAct(e); setVal(''); }}
          className="flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/10 opacity-70 transition-opacity active:opacity-50"
        >
          <X className="size-3" />
        </button>
      )}
      <button
        type="button"
        aria-label={String(props.btnText || '搜索')}
        onClick={(e) => { stopAct(e); doSearch(); }}
        className="flex h-8 shrink-0 cursor-pointer items-center px-4 text-xs font-semibold transition-transform active:scale-[0.97]"
        style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
      >
        {props.btnText}
      </button>
    </div>
  );
}

/** 首页 Banner：整卡点击 → 已绑定页面则跳页，否则 toast 查看活动详情 */
function BannerInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const h = Math.min(220, Math.max(120, Number(props.height) || 160));
  return (
    <div
      role="button"
      aria-label={String(props.title || '活动 Banner')}
      onClick={(e) => {
        stopAct(e);
        if (onTap) onTap();
        else toast('查看活动详情', 'info');
      }}
      className="relative w-full cursor-pointer overflow-hidden transition-opacity active:opacity-90"
      style={{ height: h }}
    >
      {/* 渐变主视觉（基于主色 color-mix）+ 装饰圆 */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(118deg, var(--p) 0%, color-mix(in srgb, var(--p) 62%, #fff) 58%, color-mix(in srgb, var(--p) 88%, #000) 100%)' }}
      />
      <div className="absolute -right-7 -top-12 size-32 rounded-full" style={{ background: 'color-mix(in srgb, #fff 20%, transparent)' }} />
      <div className="absolute -bottom-14 -left-6 size-28 rounded-full" style={{ background: 'color-mix(in srgb, #fff 12%, transparent)' }} />
      {/* 文案 */}
      <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-5">
        <span className="text-xl font-extrabold tracking-wide" style={{ color: 'var(--pf)' }}>{props.title}</span>
        <span className="text-xs opacity-80" style={{ color: 'var(--pf)' }}>{props.subtitle}</span>
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
}

/** 公告栏：整条点击 → 已绑定页面则跳页，否则 toast 查看公告详情 */
function NoticeBarInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  return (
    <div
      role="button"
      aria-label="查看公告详情"
      onClick={(e) => {
        stopAct(e);
        if (onTap) onTap();
        else toast('查看公告详情', 'info');
      }}
      className="w-chip flex h-10 cursor-pointer items-center gap-2 px-3 transition-opacity active:opacity-80"
      style={{ borderRadius: 'var(--pr)' }}
    >
      <Megaphone className="size-4 shrink-0" style={{ color: 'var(--p)' }} />
      <span
        className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold leading-none"
        style={{ borderRadius: '4px', background: 'var(--p)', color: 'var(--pf)' }}
      >
        公告
      </span>
      <span className="flex-1 truncate text-xs opacity-60">{props.text}</span>
      <ChevronRight className="size-3.5 shrink-0 opacity-40" />
    </div>
  );
}

/** 标题行：「查看全部 >」点击 → 已绑定页面则跳页，否则 toast 查看全部 */
function SectionHeaderInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const more = String(props.more ?? '');
  return (
    <div className="flex items-center justify-between px-0.5">
      <div className="flex items-center gap-2">
        <span className="h-4 w-1 rounded-full" style={{ background: 'var(--p)' }} />
        <span className="text-[15px] font-bold">{props.title}</span>
      </div>
      {more ? (
        <button
          type="button"
          aria-label={more}
          onClick={(e) => {
            stopAct(e);
            if (onTap) onTap();
            else toast(more || '查看全部', 'info');
          }}
          className="flex cursor-pointer items-center text-[11px] opacity-50 transition-opacity active:opacity-40"
        >
          {more} <ChevronRight className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/** 单列商品卡：整卡点击查看商品；圆形加购钮即时 toast + 短暂变 ✓ */
function ProductCardInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const onAdd = (e: React.MouseEvent) => {
    stopAct(e);
    toast('已加入购物车', 'success');
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 900);
  };
  return (
    <div
      role="button"
      aria-label="查看商品"
      onClick={(e) => {
        stopAct(e);
        if (onTap) onTap();
        else toast('查看商品', 'info');
      }}
      className="w-card cursor-pointer overflow-hidden transition-opacity active:opacity-90"
      style={{ borderRadius: 'var(--pr)' }}
    >
      {/* 渐变图片占位 */}
      <div
        className="flex h-36 items-center justify-center"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 16%, transparent), color-mix(in srgb, var(--p) 42%, transparent))' }}
      >
        <ImageIcon className="size-9 opacity-30" />
      </div>
      <div className="p-3">
        <p className="line-clamp-2 min-h-10 text-[13px] leading-5">{props.name}</p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold leading-none" style={{ color: 'var(--p)' }}>
            <span className="text-xs">¥</span>{props.price}
          </span>
          <span className="text-[11px] line-through opacity-40">¥{props.original}</span>
        </div>
        <div className="mt-1.5 flex items-end justify-between">
          <span className="text-[10px] opacity-45">已售 {props.sales}</span>
          {/* 圆形加购按钮：点击后短暂变 ✓ */}
          <button
            type="button"
            aria-label="加入购物车"
            onClick={onAdd}
            className="flex size-7 cursor-pointer items-center justify-center rounded-full shadow-sm transition-transform active:scale-[0.9]"
            style={{ background: 'var(--p)', color: 'var(--pf)' }}
          >
            {added ? <Check className="size-4" /> : <Plus className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/** 双列商品网格视图（静态/交互共用；onTapItem 存在时逐商品可点击） */
function ProductGridView({
  items,
  onTapItem,
}: {
  items: ProductItem[];
  onTapItem?: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it, i) => {
        const body = (
          <>
            <div
              className="flex h-24 items-center justify-center"
              style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--p) ${14 + (i % 3) * 7}%, transparent), color-mix(in srgb, var(--p) ${36 + (i % 3) * 7}%, transparent))` }}
            >
              <ImageIcon className="size-7 opacity-30" />
            </div>
            <div className="space-y-1.5 p-2.5">
              <p className="line-clamp-2 min-h-8 text-[11px] leading-4 opacity-80">{it.name || `商品 ${i + 1}`}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-extrabold leading-none" style={{ color: 'var(--p)' }}>
                  <span className="text-[10px]">¥</span>{it.price || '0'}
                </span>
                {it.original && <span className="text-[10px] line-through opacity-40">¥{it.original}</span>}
              </div>
              {it.sales && <span className="block text-[9px] opacity-45">已售 {it.sales}</span>}
            </div>
          </>
        );
        return onTapItem ? (
          <div
            key={i}
            role="button"
            tabIndex={0}
            aria-label={it.name ? `查看商品 ${it.name}` : `查看商品 ${i + 1}`}
            data-item-index={i}
            onClick={(e) => { stopAct(e); onTapItem(i); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTapItem(i); } }}
            className="w-card cursor-pointer overflow-hidden transition-opacity active:opacity-90"
            style={{ borderRadius: 'var(--pr)' }}
          >
            {body}
          </div>
        ) : (
          <div key={i} data-item-index={i} className="w-card overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

/** 双列商品网格：每张迷你卡可点击查看商品 */
function ProductGridInteractive({ props, slotPush, onTap }: InteractiveCtx) {
  const items = useMemo(() => normalizeProducts(props.items, { count: props.count, name: props.name, price: props.price }), [props.items, props.count, props.name, props.price]);
  const scope = useBusScope();
  const onItem = (i: number) => {
    /* 逐商品独立跳页：每个商品可绑定不同页面（未绑定给语义化提示） */
    if (slotPush) {
      if (!slotPush(String(i))) fireToast(scope, items[i]?.name ? `「${items[i].name}」尚未绑定页面，选中组件后在「交互」页绑定` : '该商品尚未绑定页面', 'info');
      return;
    }
    if (onTap) {
      onTap();
      return;
    }
    fireToast(scope, items[i]?.name ? `「${items[i].name}」尚未绑定页面，选中组件后在「交互」页绑定` : '该商品尚未绑定页面', 'info');
  };
  return <ProductGridView items={items} onTapItem={onItem} />;
}

/* ------------------------------------------------------------------ */
/* 限时秒杀：每个秒杀商品位都是独立个体——名称/价格逐个编辑、逐个绑定跳页 */
/* ------------------------------------------------------------------ */

/** 秒杀位默认数据（新增组件初始值；老项目无 items 时回退，价格对齐历史硬编码视觉零跳变） */
const FLASH_FALLBACK_ITEMS: ProductItem[] = [
  { name: '爆款加绒卫衣', price: '29', original: '69' },
  { name: '无线蓝牙耳机', price: '99', original: '199' },
  { name: '304 不锈钢保温杯', price: '59', original: '129' },
];

/** 秒杀商品位解析：items 存档优先（逐商品独立数据）；旧数据/缺省回退默认三件 */
const flashItems = (p: WidgetProps): ProductItem[] =>
  Array.isArray(p.items) && p.items.length ? normalizeProducts(p.items) : FLASH_FALLBACK_ITEMS;

/** 限时秒杀视图（静态/交互共用；onTapTile 存在时逐商品位可点击） */
function FlashSaleView({
  items, title, hours, minutes, onTapTile,
}: {
  items: ProductItem[];
  title: unknown;
  hours: unknown;
  minutes: unknown;
  onTapTile?: (i: number) => void;
}) {
  /* 时 / 分均取两位数字（容忍 '2 h' 之类写法，非法按 0） */
  const pad2 = (v: unknown) =>
    String(Math.min(99, Math.max(0, Math.round(Number(String(v ?? '').replace(/[^\d.-]/g, '')) || 0)))).padStart(2, '0');
  const blocks = [pad2(hours), pad2(minutes)];
  const tiles = items.slice(0, 6);
  return (
    <div className="w-card p-3" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame className="size-4" style={{ color: 'var(--p)' }} />
          <span className="text-[15px] font-extrabold">{String(title ?? '')}</span>
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
      {/* 横排秒杀商品位：图块 + 商品名 + 秒杀价/划线原价，每格独立个体 */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {tiles.map((it, i) => {
          const body = (
            <>
              <div
                className="flex h-20 items-center justify-center"
                style={{
                  borderRadius: 'calc(var(--pr) - 4px)',
                  background: `linear-gradient(135deg, color-mix(in srgb, var(--p) ${16 + (i % 3) * 8}%, transparent), color-mix(in srgb, var(--p) ${40 + (i % 3) * 8}%, transparent))`,
                }}
              >
                <ImageIcon className="size-6 opacity-30" />
              </div>
              <div className="mt-1 truncate px-0.5 text-center text-[10px] leading-3.5 opacity-60">{it.name || `秒杀 ${i + 1}`}</div>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-sm font-extrabold leading-none" style={{ color: 'var(--p)' }}>
                  <span className="text-[10px]">¥</span>{it.price || '0'}
                </span>
                {it.original && <span className="text-[10px] line-through opacity-40">¥{it.original}</span>}
              </div>
            </>
          );
          return onTapTile ? (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-label={it.name ? `查看秒杀商品 ${it.name}` : `查看秒杀商品 ${i + 1}`}
              data-item-index={i}
              onClick={(e) => { stopAct(e); onTapTile(i); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTapTile(i); } }}
              className="min-w-0 cursor-pointer transition-opacity active:opacity-80"
            >
              {body}
            </div>
          ) : (
            <div key={i} data-item-index={i} className="min-w-0">{body}</div>
          );
        })}
      </div>
    </div>
  );
}

/** 限时秒杀交互：逐商品位独立跳页（未绑定提示）→ 整卡兜底跳页 → 提示 */
function FlashSaleInteractive({ props, slotPush, onTap }: InteractiveCtx) {
  const items = flashItems(props);
  const scope = useBusScope();
  const unboundHint = (i: number) =>
    fireToast(scope, items[i]?.name ? `「${items[i].name}」尚未绑定页面，选中组件后在「交互」页绑定` : '该商品尚未绑定页面', 'info');
  const onTile = (i: number) => {
    if (slotPush) {
      if (!slotPush(String(i))) unboundHint(i);
      return;
    }
    if (onTap) {
      onTap();
      return;
    }
    unboundHint(i);
  };
  return <FlashSaleView items={items} title={props.title} hours={props.hours} minutes={props.minutes} onTapTile={onTile} />;
}

/** 优惠券：票券钮点击原地变「已领取」灰态；已领取再点提示 */
function CouponCardInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [claimed, toggleClaimed] = useLocalToggle(false);
  return (
    <div className="w-card flex items-stretch overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
      {/* 左侧主色金额区 */}
      <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 py-4" style={{ background: 'var(--p)', color: 'var(--pf)' }}>
        <span className="font-extrabold leading-none">
          <span className="text-xs">¥</span>
          <span className="text-2xl">{props.amount}</span>
        </span>
        <span className="text-[10px] opacity-80">满 {props.condition} 可用</span>
      </div>
      {/* 虚线撕票分隔 */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 border-l border-dashed w-line px-3.5">
        <span className="truncate text-xs font-semibold opacity-75">{props.desc}</span>
        <span className="text-[10px] opacity-45">{props.date}</span>
      </div>
      <div className="flex items-center pr-3">
        <button
          type="button"
          aria-label={claimed ? '优惠券已领取' : String(props.btnText || '立即领取')}
          onClick={(e) => {
            stopAct(e);
            if (claimed) {
              toast('已领取过啦', 'info');
              return;
            }
            toggleClaimed();
            toast('领取成功', 'success');
          }}
          className={`flex h-8 cursor-pointer items-center whitespace-nowrap rounded-full border px-3 text-xs font-bold w-line transition-all active:scale-[0.97] ${claimed ? 'opacity-45' : ''}`}
          style={claimed ? undefined : { borderColor: 'var(--p)', color: 'var(--p)' }}
        >
          {claimed ? '已领取' : props.btnText}
        </button>
      </div>
    </div>
  );
}

/** 优惠券横条：2~3 张券各自独立领取态，领取后原地变「已领取」 */
function CouponRowInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const amounts = splitList(props.amount).slice(0, 3);
  const thresholds = splitList(props.threshold);
  const list = amounts.length ? amounts : ['50', '30', '20'];
  const [claimed, setClaimed] = useState<boolean[]>([]);
  const claim = (i: number) => {
    if (claimed[i]) {
      toast('已领取过啦', 'info');
      return;
    }
    setClaimed((prev) => { const next = [...prev]; next[i] = true; return next; });
    toast('领取成功', 'success');
  };
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
            <button
              type="button"
              aria-label={claimed[i] ? `已领取 ¥${amt} 优惠券` : `领取 ¥${amt} 优惠券`}
              onClick={(e) => { stopAct(e); claim(i); }}
              className={`block w-full cursor-pointer py-1 text-[10px] font-bold leading-none transition-all active:scale-[0.97] ${claimed[i] ? 'opacity-45' : ''}`}
              style={claimed[i]
                ? { borderRadius: '999px', background: 'color-mix(in srgb, currentColor 12%, transparent)' }
                : { borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
            >
              {claimed[i] ? '已领取' : '领取'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/** 品牌馆交互：逐品牌卡独立跳页（未绑定提示）→ 整卡兜底跳页 → 提示 */
function BrandRowInteractive({ props, slotPush, onTap }: InteractiveCtx) {
  const scope = useBusScope();
  const brands = splitList(props.brands).slice(0, 3);
  const unboundHint = (i: number) =>
    fireToast(scope, brands[i] ? `「${brands[i]}」尚未绑定页面，选中组件后在「交互」页绑定` : '该品牌卡尚未绑定页面', 'info');
  const onBrand = (i: number) => {
    if (slotPush) {
      if (!slotPush(String(i))) unboundHint(i);
      return;
    }
    if (onTap) {
      onTap();
      return;
    }
    unboundHint(i);
  };
  return (
    <div className="flex gap-2 overflow-hidden">
      {brands.map((brand, i) => (
        <div
          key={`${brand}-${i}`}
          role="button"
          tabIndex={0}
          aria-label={`进入${brand}品牌馆`}
          onClick={(e) => { stopAct(e); onBrand(i); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBrand(i); } }}
          className="flex h-20 w-[32%] shrink-0 cursor-pointer flex-col justify-end gap-1 overflow-hidden p-2.5 transition-opacity active:opacity-85"
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
  );
}

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
    Interactive: MallSearchInteractive,
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
    Interactive: BannerInteractive,
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
    Interactive: NoticeBarInteractive,
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
    desc: '4 x 2 圆形图标快捷入口，逐格可编辑图标文案动作，可绑页面',
    icon: LayoutGrid,
    canvasInteractive: true,
    defaultProps: {
      labels: '女装,数码,美食,游戏,母婴,生鲜,美妆,家电',
      cellsIcons: CAT_ICON_NAMES,
    },
    fields: [
      { key: 'cells', label: '宫格单元（逐格编辑）', type: 'cells', max: 8 },
    ],
    slots: (p) => cellsToSlots(parseCells(p.cells, p.labels, CAT_ICONS).slice(0, 8)),
    render: (p) => <CategoryGridView cells={parseCells(p.cells, p.labels, CAT_ICONS).slice(0, 8)} />,
    Interactive: CategoryGridInteractive,
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
    Interactive: SectionHeaderInteractive,
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
    Interactive: ProductCardInteractive,
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
    desc: '双列迷你商品卡，逐个商品可编辑名称价格，可分别绑定不同跳转页面',
    icon: Grid2x2,
    defaultProps: {
      count: 4,
      items: [
        { name: '云朵软糯牛奶卫衣', price: '128', original: '199', sales: '1.2万' },
        { name: '极简无线蓝牙耳机', price: '59', original: '99', sales: '8632' },
        { name: '轻氧玻尿酸保湿面膜', price: '199', original: '299', sales: '2.3万' },
        { name: '每日坚果混合装 30 包', price: '89', original: '139', sales: '4581' },
      ],
    },
    fields: [
      { key: 'items', label: '商品（逐个编辑）', type: 'products', max: 6 },
    ],
    slots: (p) => productsToSlots(normalizeProducts(p.items, { count: p.count })),
    Interactive: ProductGridInteractive,
    render: (p) => <ProductGridView items={normalizeProducts(p.items, { count: p.count })} />,
  },
  {
    type: 'mall.flash-sale',
    category: 'mall',
    name: '限时秒杀横条',
    desc: '标题 + 倒计时 + 横排秒杀商品位，逐个商品可编辑、可分别绑定不同跳转页面',
    icon: Flame,
    defaultProps: {
      title: '限时秒杀', hours: '02', minutes: '45',
      items: FLASH_FALLBACK_ITEMS.map((x) => ({ ...x })),
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'hours', label: '倒计时 · 时', type: 'text', placeholder: '如 02' },
      { key: 'minutes', label: '倒计时 · 分', type: 'text', placeholder: '如 45' },
      { key: 'items', label: '秒杀商品（逐个编辑）', type: 'products', max: 6 },
    ],
    slots: (p) => productsToSlots(flashItems(p).slice(0, 6), 3),
    Interactive: FlashSaleInteractive,
    render: (p) => <FlashSaleView items={flashItems(p)} title={p.title} hours={p.hours} minutes={p.minutes} />,
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
    Interactive: CouponCardInteractive,
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
    Interactive: CouponRowInteractive,
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
    desc: '横滑品牌卡片位，每张品牌卡可分别绑定不同跳转页面',
    icon: Crown,
    defaultProps: { brands: '悦颜美妆,星曜数码,沐光家居' },
    fields: [
      { key: 'brands', label: '品牌名', type: 'textarea', placeholder: '逗号分隔，最多 3 个' },
    ],
    slots: (p) =>
      splitList(p.brands).slice(0, 3).map((b, i) => ({ key: String(i), label: `「${b}」品牌卡` })),
    Interactive: BrandRowInteractive,
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
