import { useState } from 'react';
import {
  Store, Ticket, ListTree, UtensilsCrossed, Soup, Fish, Beef, Plus,
  ShoppingCart, Megaphone, ChevronRight, Check, LoaderCircle, Circle,
  Bike, Phone, Hash, Tags,
} from 'lucide-react';
import type { WidgetDef, InteractiveCtx } from '@/lib/widget-types';
import { useBusScope } from '@/lib/interaction-bus';
import { fireToast } from '@/lib/widget-toast';
import { stopAct, useAction } from './action-kit';
import { normalizeProducts } from './grid-kit';

/**
 * 外卖点餐 组件库（目录：food）
 * 参考实现：所有组件只用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应。
 * 菜品图一律用主色渐变 div + 图标占位；价格/徽标可用 rose-500。
 */

/** 主色系菜品占位渐变（跟随画布主题） */
const DISH_GRAD = 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #fff))';
/** 横滑推荐小卡的占位图标（按序循环） */
const DISH_ICONS = [Soup, Fish, Beef];

/** 逗号 / 中文逗号分隔 → 干净的字符串数组 */
const splitList = (v: unknown): string[] =>
  String(v ?? '').split(/[,，、]/).map((s) => s.trim()).filter(Boolean);

/* ------------------------------------------------------------------ */
/* 预览交互实现（Interactive）：复制对应 render 的视觉结构（保视觉一致），  */
/* 把静态元素替换为可交互元素。所有内部按钮 stopAct 阻断冒泡。             */
/* ------------------------------------------------------------------ */

/** 领券行交互：券 chips 点击领取 → toast；右侧箭头查看更多 */
function CouponRowInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const list = splitList(props.coupons);
  return (
    <div className="w-card flex items-center gap-2.5 p-3">
      <span className="shrink-0 text-sm font-bold">领券</span>
      <div className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
        {list.map((c, i) => (
          <button
            key={i}
            type="button"
            aria-label={`领取优惠券：${c}`}
            onClick={(e) => { stopAct(e); toast(`已领取优惠券：${c}`, 'success'); }}
            className={`shrink-0 cursor-pointer border border-dashed px-2 py-1 text-[11px] font-semibold transition-transform active:scale-[0.97] ${i % 2 === 1 ? '' : 'border-rose-500/45 bg-rose-500/10 text-rose-500'}`}
            style={{
              borderRadius: 'calc(var(--pr) - 3px)',
              ...(i % 2 === 1
                ? { borderColor: 'color-mix(in srgb, var(--p) 45%, transparent)', background: 'color-mix(in srgb, var(--p) 12%, transparent)', color: 'var(--p)' }
                : {}),
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label="查看更多优惠券"
        onClick={(e) => { stopAct(e); toast('更多优惠券（演示）', 'info'); }}
        className="cursor-pointer transition-opacity active:opacity-60"
      >
        <ChevronRight className="size-4 shrink-0 opacity-35" />
      </button>
    </div>
  );
}

/** 分类侧栏交互：左侧行原地切换选中高亮（useState）；右侧真实菜品行（+ 加购 toast 分流） */
function CategorySidebarInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const raw = splitList(props.cats);
  const cats = raw.length ? raw : ['热销'];
  const [active, setActive] = useState(() =>
    Math.min(Math.max(0, Math.floor(Number(props.active) || 0)), cats.length - 1)
  );
  const dishes = normalizeProducts(props.items);
  return (
    <div className="w-card flex overflow-hidden">
      <div className="w-chip w-[76px] shrink-0 py-1">
        {cats.map((c, i) => (
          <div
            key={i}
            role="button"
            aria-label={`切换分类：${c}`}
            data-cell-index={i}
            className="relative cursor-pointer py-2.5 text-center text-xs transition-transform active:scale-[0.97]"
            style={i === active ? { color: 'var(--p)', fontWeight: 700 } : { opacity: 0.5 }}
            onClick={(e) => { stopAct(e); setActive(i); }}
          >
            {i === active && (
              <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full" style={{ background: 'var(--p)' }} />
            )}
            {c}
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1 space-y-3 p-3">
        {dishes.map((d, i) => (
          <div key={i} data-item-index={i} className="flex items-center gap-2.5">
            <div
              className="flex size-12 shrink-0 items-center justify-center"
              style={{ borderRadius: 'calc(var(--pr) - 2px)', background: DISH_GRAD }}
            >
              <UtensilsCrossed className="size-5 text-white/85" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold leading-tight">{d.name || `菜品 ${i + 1}`}</span>
              <span className="mt-1 block text-xs font-bold leading-none" style={{ color: 'var(--p)' }}>
                <span className="text-[10px]">¥</span>{d.price || '0'}
              </span>
            </div>
            <button
              type="button"
              aria-label={`加入购物车：${d.name}`}
              onClick={(e) => { stopAct(e); toast(`已加入购物车：${cats[active]}·${d.name}`, 'success'); }}
              className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-90"
              style={{ background: 'var(--p)', color: 'var(--pf)' }}
            >
              <Plus className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 菜品卡交互：「+」加购（✓ 短反馈，分流阻断）；整卡 → onTap 或查看详情 */
function DishCardInteractive({ props, onTap }: InteractiveCtx) {
  const { toast, busy, done, run } = useAction();
  const name = String(props.name || '菜品');
  return (
    <div
      role="button"
      aria-label={`查看菜品：${name}`}
      className="w-card flex cursor-pointer gap-3 p-3 transition-transform active:scale-[0.99]"
      onClick={(e) => { stopAct(e); if (onTap) onTap(); else toast(`查看菜品详情：${name}`, 'info'); }}
    >
      <div
        className="flex h-[88px] w-[88px] shrink-0 items-center justify-center"
        style={{ borderRadius: 'calc(var(--pr) - 2px)', background: DISH_GRAD }}
      >
        <UtensilsCrossed className="size-8 text-white/85" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate text-[15px] font-bold">{name}</div>
        <div className="mt-0.5 text-[11px] opacity-45">月售 {props.sales} · 好评率 98%</div>
        <div className="mt-0.5 truncate text-xs opacity-45">{props.desc}</div>
        <div className="mt-auto flex items-end justify-between pt-1.5">
          <span className="font-extrabold leading-none" style={{ color: 'var(--p)' }}>
            <span className="text-xs">¥</span>
            <span className="text-lg">{props.price}</span>
          </span>
          <button
            type="button"
            aria-label={`加入购物车：${name}`}
            onClick={(e) => { stopAct(e); run(() => toast(`已加入购物车：${name}`, 'success'), 250, 700); }}
            className="flex size-7 cursor-pointer items-center justify-center rounded-full shadow-md transition-transform active:scale-90"
            style={{ background: 'var(--p)', color: 'var(--pf)' }}
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : done ? (
              <Check className="size-4" strokeWidth={3} />
            ) : (
              <Plus className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** 推荐横滑交互：逐菜品卡独立跳页（未绑定提示）→ 整卡兜底跳页 → 提示 */
function DishRowInteractive({ props, slotPush, onTap }: InteractiveCtx) {
  const scope = useBusScope();
  const raw = splitList(props.items);
  const names = (raw.length ? raw : ['推荐菜']).slice(0, 3);
  const prices = splitList(props.prices);
  const unboundHint = (i: number) =>
    fireToast(scope, names[i] ? `「${names[i]}」尚未绑定页面，选中组件后在「交互」页绑定` : '该菜品尚未绑定页面', 'info');
  const onDish = (i: number) => {
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
      {names.map((n, i) => {
        const Icon = DISH_ICONS[i % DISH_ICONS.length];
        return (
          <div
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`查看菜品：${n}`}
            className="w-chip min-w-0 flex-1 cursor-pointer p-1.5 transition-transform active:scale-[0.97]"
            style={{ borderRadius: 'var(--pr)' }}
            onClick={(e) => { stopAct(e); onDish(i); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDish(i); } }}
          >
            <div
              className="flex h-14 items-center justify-center"
              style={{ borderRadius: 'calc(var(--pr) - 4px)', background: DISH_GRAD }}
            >
              <Icon className="size-6 text-white/85" />
            </div>
            <div className="mt-1.5 truncate px-0.5 text-xs font-medium">{n}</div>
            <div className="px-0.5 pb-0.5 text-[13px] font-bold" style={{ color: 'var(--p)' }}>
              ¥{prices[i] ?? '--'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 购物车条交互：去结算 busy 转圈 → toast/跳页；购物车图标 toast（分流） */
function CartBarInteractive({ props, onTap }: InteractiveCtx) {
  const { toast, busy, done, run } = useAction();
  return (
    <div className="px-3 py-1">
      <div
        className="flex h-14 items-center gap-3 border border-white/10 bg-zinc-900 pl-4 pr-1.5 shadow-xl"
        style={{ borderRadius: 'calc(var(--pr) + 10px)' }}
      >
        <button
          type="button"
          aria-label="查看购物车"
          onClick={(e) => { stopAct(e); toast('购物车（演示）', 'info'); }}
          className="relative shrink-0 cursor-pointer transition-transform active:scale-90"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-white/10">
            <ShoppingCart className="size-[18px] text-white" />
          </span>
          {Number(props.count) > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {props.count}
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1 leading-tight text-white">
          <div className="truncate text-[13px] font-bold">
            合计 <span className="text-lg">¥{props.total}</span>
          </div>
          <div className="text-[10px] text-white/45">另需配送费 ¥{props.fee}</div>
        </div>
        <button
          type="button"
          aria-label="去结算"
          onClick={(e) => { stopAct(e); run(() => { if (onTap) onTap(); else toast('去结算（演示）', 'info'); }); }}
          className="flex h-[46px] shrink-0 cursor-pointer items-center gap-1.5 px-5 text-[15px] font-bold transition-transform active:scale-[0.98]"
          style={{ borderRadius: 'calc(var(--pr) + 6px)', background: 'var(--p)', color: 'var(--pf)' }}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : done ? (
            <Check className="size-4" strokeWidth={3} />
          ) : (
            '去结算'
          )}
        </button>
      </div>
    </div>
  );
}

/** 订单状态交互：联系骑手 / 联系商家各自 toast（分流） */
function OrderStatusInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const STEPS = ['商家接单', '配送中', '已送达'];
  const delivered = props.status === '已送达';
  const idx = props.status === '商家接单中' ? 0 : props.status === '配送中' ? 1 : 2;
  return (
    <div className="w-card p-4">
      <div className="text-lg font-extrabold">{props.status}</div>
      <div className="mt-3 flex items-center gap-2">
        <span className="w-chip flex shrink-0 items-center gap-1.5 py-1 pl-1.5 pr-2.5" style={{ borderRadius: '999px' }}>
          <span
            className="flex size-5 items-center justify-center rounded-full"
            style={{ background: 'var(--p)', color: 'var(--pf)' }}
          >
            <Bike className="size-3" />
          </span>
          <span className="text-[11px]">{props.rider}</span>
        </span>
        <button
          type="button"
          aria-label="联系骑手"
          onClick={(e) => { stopAct(e); toast('正在呼叫骑手…', 'info'); }}
          className="w-chip flex size-7 shrink-0 cursor-pointer items-center justify-center border w-line transition-transform active:scale-90"
          style={{ borderRadius: '999px' }}
        >
          <Phone className="size-3.5 opacity-55" />
        </button>
        <button
          type="button"
          aria-label="联系商家"
          onClick={(e) => { stopAct(e); toast('正在联系商家…', 'info'); }}
          className="w-chip ml-auto flex shrink-0 cursor-pointer items-center gap-1 px-2.5 py-1.5 transition-transform active:scale-[0.97]"
          style={{ borderRadius: '999px' }}
        >
          <Store className="size-3.5 shrink-0 opacity-55" />
          <span className="text-[11px] opacity-60">联系商家</span>
        </button>
      </div>
      <div className="mt-4 px-1">
        <div className="flex items-center">
          {STEPS.map((label, i) => {
            const stepDone = delivered || i < idx;
            const current = !delivered && i === idx;
            return (
              <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                {stepDone ? (
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--p)', color: 'var(--pf)' }}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                ) : current ? (
                  <LoaderCircle className="size-6 shrink-0 animate-spin" style={{ color: 'var(--p)' }} />
                ) : (
                  <Circle className="size-6 shrink-0 opacity-30" />
                )}
                {i < STEPS.length - 1 && (
                  <span
                    className={`mx-1.5 h-0.5 flex-1 rounded-full ${stepDone ? '' : 'bg-current opacity-15'}`}
                    style={stepDone ? { background: 'var(--p)' } : undefined}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="relative mt-1.5 h-4 text-[10px] leading-4">
          <span className="absolute left-0 top-0">{STEPS[0]}</span>
          <span
            className="absolute left-1/2 top-0 -translate-x-1/2"
            style={!delivered && idx === 1 ? { color: 'var(--p)', fontWeight: 600 } : undefined}
          >
            {STEPS[1]}
          </span>
          <span
            className="absolute right-0 top-0"
            style={!delivered && idx === 2 ? { color: 'var(--p)', fontWeight: 600 } : undefined}
          >
            {STEPS[2]}
          </span>
        </div>
      </div>
    </div>
  );
}

/** 评分标签行交互：全部/好评/有图/差评 chips 原地切换选中（激活样式跟随点击项） */
function RateTagsInteractive({ props }: InteractiveCtx) {
  const total = Number(props.total) || 0;
  const label = total >= 10000 ? `${(total / 10000).toFixed(1)}万` : String(total);
  const tabs = [`全部 ${label}`, '好评', '有图', '差评'];
  const [active, setActive] = useState(0);
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          aria-label={`筛选评价：${t}`}
          onClick={(e) => { stopAct(e); setActive(i); }}
          className={`shrink-0 cursor-pointer px-3.5 py-1.5 text-xs transition-transform active:scale-[0.97] ${
            i === active ? 'font-semibold' : 'w-chip opacity-65'
          }`}
          style={{ borderRadius: '999px', ...(i === active ? { background: 'var(--p)', color: 'var(--pf)' } : {}) }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export const widgets: WidgetDef[] = [
  {
    type: 'food.banner',
    category: 'food',
    name: '店铺头部卡',
    desc: '渐变底店铺名 + 月销/配送费 + 公告（通栏）',
    icon: Store,
    fullBleed: true,
    defaultProps: { name: '巷子口·老王川菜馆', sales: '2000+', fee: 3, time: '35分钟', notice: '新客立减 8 元，满 30 再减 8' },
    fields: [
      { key: 'name', label: '店铺名', type: 'text' },
      { key: 'sales', label: '月售', type: 'text' },
      { key: 'fee', label: '配送费（元）', type: 'number', min: 0, max: 20, step: 0.5 },
      { key: 'time', label: '配送时长', type: 'text' },
      { key: 'notice', label: '店铺公告', type: 'text' },
    ],
    render: (p) => (
      <div className="px-3 pt-3">
        <div
          className="flex items-start justify-between gap-3 p-4 shadow-lg"
          style={{
            borderRadius: 'var(--pr)',
            background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 68%, #000))',
            color: 'var(--pf)',
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold">{p.name}</div>
            <div className="mt-1 text-[11px] opacity-80">月售 {p.sales} · 配送费 ¥{p.fee} · {p.time}</div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] opacity-90">
              <Megaphone className="size-3 shrink-0" />
              <span className="truncate">{p.notice}</span>
            </div>
          </div>
          <div
            className="flex size-12 shrink-0 items-center justify-center bg-white/20 text-xl font-bold"
            style={{ borderRadius: 'calc(var(--pr) - 2px)' }}
          >
            {String(p.name || '店').slice(0, 1)}
          </div>
        </div>
      </div>
    ),
  },
  {
    type: 'food.coupon-row',
    category: 'food',
    name: '领券行',
    desc: '横向小券 chips + 查看更多',
    icon: Ticket,
    defaultProps: { coupons: '满30减8,满50减15,新客立减8' },
    fields: [{ key: 'coupons', label: '优惠券（逗号分隔）', type: 'text' }],
    Interactive: CouponRowInteractive,
    render: (p) => {
      const list = splitList(p.coupons);
      return (
        <div className="w-card flex items-center gap-2.5 p-3">
          <span className="shrink-0 text-sm font-bold">领券</span>
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
            {list.map((c, i) => (
              <span
                key={i}
                data-cell-index={i}
                className={`shrink-0 border border-dashed px-2 py-1 text-[11px] font-semibold ${i % 2 === 1 ? '' : 'border-rose-500/45 bg-rose-500/10 text-rose-500'}`}
                style={{
                  borderRadius: 'calc(var(--pr) - 3px)',
                  ...(i % 2 === 1
                    ? { borderColor: 'color-mix(in srgb, var(--p) 45%, transparent)', background: 'color-mix(in srgb, var(--p) 12%, transparent)', color: 'var(--p)' }
                    : {}),
                }}
              >
                {c}
              </span>
            ))}
          </div>
          <ChevronRight className="size-4 shrink-0 opacity-35" />
        </div>
      );
    },
  },
  {
    type: 'food.category-sidebar',
    category: 'food',
    name: '点餐分类侧栏',
    desc: '左分类右菜品列表，菜品逐个可编辑名称价格，可分别绑定跳转页面',
    icon: ListTree,
    defaultProps: {
      cats: '热销,优惠,主食,饮品,小吃',
      active: 0,
      items: [
        { name: '招牌手打柠檬茶', price: '12' },
        { name: '芝士莓莓奶盖', price: '18' },
      ],
    },
    fields: [
      { key: 'cats', label: '分类（逗号分隔）', type: 'text' },
      { key: 'active', label: '激活分类序号', type: 'number', min: 0, max: 8, step: 1 },
      { key: 'items', label: '菜品（逐个编辑）', type: 'products', max: 6 },
    ],
    slots: (p) =>
      normalizeProducts(p.items).map((it, i) => ({
        key: String(i),
        label: it.name ? it.name.slice(0, 10) : `菜品 ${i + 1}`,
      })),
    Interactive: CategorySidebarInteractive,
    render: (p) => {
      const raw = splitList(p.cats);
      const cats = raw.length ? raw : ['热销'];
      const active = Math.min(Math.max(0, Math.floor(Number(p.active) || 0)), cats.length - 1);
      const dishes = normalizeProducts(p.items);
      return (
        <div className="w-card flex overflow-hidden">
          <div className="w-chip w-[76px] shrink-0 py-1">
            {cats.map((c, i) => (
              <div
                key={i}
                data-cell-index={i}
                className="relative py-2.5 text-center text-xs"
                style={i === active ? { color: 'var(--p)', fontWeight: 700 } : { opacity: 0.5 }}
              >
                {i === active && (
                  <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full" style={{ background: 'var(--p)' }} />
                )}
                {c}
              </div>
            ))}
          </div>
          <div className="min-w-0 flex-1 space-y-3 p-3">
            {dishes.map((d, i) => (
              <div key={i} data-item-index={i} className="flex items-center gap-2.5">
                <div
                  className="flex size-12 shrink-0 items-center justify-center"
                  style={{ borderRadius: 'calc(var(--pr) - 2px)', background: DISH_GRAD }}
                >
                  <UtensilsCrossed className="size-5 text-white/85" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold leading-tight">{d.name || `菜品 ${i + 1}`}</span>
                  <span className="mt-1 block text-xs font-bold leading-none" style={{ color: 'var(--p)' }}>
                    <span className="text-[10px]">¥</span>{d.price || '0'}
                  </span>
                </div>
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'var(--p)', color: 'var(--pf)' }}
                >
                  <Plus className="size-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'food.dish-card',
    category: 'food',
    name: '菜品卡',
    desc: '左图 + 菜名/销量 + 主色价 + 加购钮',
    icon: UtensilsCrossed,
    defaultProps: { name: '宫保鸡丁', desc: '鸡丁滑嫩花生香脆，微微辣很下饭', price: 23.9, sales: '356' },
    fields: [
      { key: 'name', label: '菜名', type: 'text' },
      { key: 'desc', label: '描述', type: 'text' },
      { key: 'price', label: '价格（元）', type: 'number', min: 0, max: 999, step: 0.5 },
      { key: 'sales', label: '月售', type: 'text' },
    ],
    Interactive: DishCardInteractive,
    render: (p) => (
      <div className="w-card flex gap-3 p-3">
        <div
          className="flex h-[88px] w-[88px] shrink-0 items-center justify-center"
          style={{ borderRadius: 'calc(var(--pr) - 2px)', background: DISH_GRAD }}
        >
          <UtensilsCrossed className="size-8 text-white/85" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="truncate text-[15px] font-bold">{p.name}</div>
          <div className="mt-0.5 text-[11px] opacity-45">月售 {p.sales} · 好评率 98%</div>
          <div className="mt-0.5 truncate text-xs opacity-45">{p.desc}</div>
          <div className="mt-auto flex items-end justify-between pt-1.5">
            <span className="font-extrabold leading-none" style={{ color: 'var(--p)' }}>
              <span className="text-xs">¥</span>
              <span className="text-lg">{p.price}</span>
            </span>
            <span
              className="flex size-7 items-center justify-center rounded-full shadow-md"
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
    type: 'food.dish-row',
    category: 'food',
    name: '推荐横滑',
    desc: '3 张迷你菜品卡横向排布，每张菜品卡可分别绑定不同跳转页面',
    icon: Soup,
    defaultProps: { items: '宫保鸡丁,鱼香肉丝,水煮鱼片', prices: '28,32,45' },
    fields: [
      { key: 'items', label: '菜名（逗号分隔）', type: 'textarea' },
      { key: 'prices', label: '价格（逗号分隔）', type: 'text' },
    ],
    slots: (p) => {
      const raw = splitList(p.items);
      const names = (raw.length ? raw : ['推荐菜']).slice(0, 3);
      return names.map((n, i) => ({ key: String(i), label: n || `菜品卡 ${i + 1}` }));
    },
    Interactive: DishRowInteractive,
    render: (p) => {
      const raw = splitList(p.items);
      const names = (raw.length ? raw : ['推荐菜']).slice(0, 3);
      const prices = splitList(p.prices);
      return (
        <div className="flex gap-2 overflow-hidden">
          {names.map((n, i) => {
            const Icon = DISH_ICONS[i % DISH_ICONS.length];
            return (
              <div key={i} data-item-index={i} className="w-chip min-w-0 flex-1 p-1.5" style={{ borderRadius: 'var(--pr)' }}>
                <div
                  className="flex h-14 items-center justify-center"
                  style={{ borderRadius: 'calc(var(--pr) - 4px)', background: DISH_GRAD }}
                >
                  <Icon className="size-6 text-white/85" />
                </div>
                <div className="mt-1.5 truncate px-0.5 text-xs font-medium">{n}</div>
                <div className="px-0.5 pb-0.5 text-[13px] font-bold" style={{ color: 'var(--p)' }}>
                  ¥{prices[i] ?? '--'}
                </div>
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    type: 'food.cart-bar',
    category: 'food',
    name: '购物车条',
    desc: '深色悬浮条 + 合计 + 去结算（通栏）',
    icon: ShoppingCart,
    fullBleed: true,
    defaultProps: { total: 56.8, fee: 3, count: 2 },
    fields: [
      { key: 'total', label: '合计金额（元）', type: 'number', min: 0, max: 9999, step: 0.5 },
      { key: 'fee', label: '配送费（元）', type: 'number', min: 0, max: 20, step: 0.5 },
      { key: 'count', label: '商品数量', type: 'number', min: 0, max: 99, step: 1 },
    ],
    Interactive: CartBarInteractive,
    render: (p) => (
      <div className="px-3 py-1">
        <div
          className="flex h-14 items-center gap-3 border border-white/10 bg-zinc-900 pl-4 pr-1.5 shadow-xl"
          style={{ borderRadius: 'calc(var(--pr) + 10px)' }}
        >
          <div className="relative shrink-0">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/10">
              <ShoppingCart className="size-[18px] text-white" />
            </span>
            {Number(p.count) > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {p.count}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 leading-tight text-white">
            <div className="truncate text-[13px] font-bold">
              合计 <span className="text-lg">¥{p.total}</span>
            </div>
            <div className="text-[10px] text-white/45">另需配送费 ¥{p.fee}</div>
          </div>
          <button
            className="flex h-[46px] shrink-0 items-center px-5 text-[15px] font-bold active:scale-[0.98]"
            style={{ borderRadius: 'calc(var(--pr) + 6px)', background: 'var(--p)', color: 'var(--pf)' }}
          >
            去结算
          </button>
        </div>
      </div>
    ),
  },
  {
    type: 'food.order-status',
    category: 'food',
    name: '订单状态',
    desc: '大状态字 + 骑手行 + 3 步进度',
    icon: Bike,
    defaultProps: { status: '配送中', rider: '骑手·王师傅' },
    fields: [
      {
        key: 'status', label: '当前状态', type: 'select',
        options: [
          { label: '商家接单中', value: '商家接单中' },
          { label: '配送中', value: '配送中' },
          { label: '已送达', value: '已送达' },
        ],
      },
      { key: 'rider', label: '骑手名称', type: 'text' },
    ],
    Interactive: OrderStatusInteractive,
    render: (p) => {
      const STEPS = ['商家接单', '配送中', '已送达'];
      const delivered = p.status === '已送达';
      const idx = p.status === '商家接单中' ? 0 : p.status === '配送中' ? 1 : 2;
      return (
        <div className="w-card p-4">
          <div className="text-lg font-extrabold">{p.status}</div>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-chip flex shrink-0 items-center gap-1.5 py-1 pl-1.5 pr-2.5" style={{ borderRadius: '999px' }}>
              <span
                className="flex size-5 items-center justify-center rounded-full"
                style={{ background: 'var(--p)', color: 'var(--pf)' }}
              >
                <Bike className="size-3" />
              </span>
              <span className="text-[11px]">{p.rider}</span>
            </span>
            <span className="w-chip flex size-7 shrink-0 items-center justify-center border w-line" style={{ borderRadius: '999px' }}>
              <Phone className="size-3.5 opacity-55" />
            </span>
            <span className="w-chip ml-auto flex shrink-0 items-center gap-1 px-2.5 py-1.5" style={{ borderRadius: '999px' }}>
              <Store className="size-3.5 shrink-0 opacity-55" />
              <span className="text-[11px] opacity-60">联系商家</span>
            </span>
          </div>
          <div className="mt-4 px-1">
            <div className="flex items-center">
              {STEPS.map((label, i) => {
                const done = delivered || i < idx;
                const current = !delivered && i === idx;
                return (
                  <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    {done ? (
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-full"
                        style={{ background: 'var(--p)', color: 'var(--pf)' }}
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    ) : current ? (
                      <LoaderCircle className="size-6 shrink-0 animate-spin" style={{ color: 'var(--p)' }} />
                    ) : (
                      <Circle className="size-6 shrink-0 opacity-30" />
                    )}
                    {i < STEPS.length - 1 && (
                      <span
                        className={`mx-1.5 h-0.5 flex-1 rounded-full ${done ? '' : 'bg-current opacity-15'}`}
                        style={done ? { background: 'var(--p)' } : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="relative mt-1.5 h-4 text-[10px] leading-4">
              <span className="absolute left-0 top-0">{STEPS[0]}</span>
              <span
                className="absolute left-1/2 top-0 -translate-x-1/2"
                style={!delivered && idx === 1 ? { color: 'var(--p)', fontWeight: 600 } : undefined}
              >
                {STEPS[1]}
              </span>
              <span
                className="absolute right-0 top-0"
                style={!delivered && idx === 2 ? { color: 'var(--p)', fontWeight: 600 } : undefined}
              >
                {STEPS[2]}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    type: 'food.table-head',
    category: 'food',
    name: '取餐卡',
    desc: '超大取餐号 + 等待单数',
    icon: Hash,
    defaultProps: { no: 68, queue: 3 },
    fields: [
      { key: 'no', label: '取餐号', type: 'number', min: 1, max: 999, step: 1 },
      { key: 'queue', label: '前面等待单数', type: 'number', min: 0, max: 99, step: 1 },
    ],
    render: (p) => (
      <div className="w-card flex flex-col items-center py-5">
        <span className="text-xs opacity-50">取餐号</span>
        <span className="mt-1 text-5xl font-extrabold tracking-wider" style={{ color: 'var(--p)' }}>{p.no}</span>
        <span className="mt-1.5 text-xs opacity-45">前面等待 {p.queue} 单</span>
      </div>
    ),
  },
  {
    type: 'food.rate-tags',
    category: 'food',
    name: '评分标签行',
    desc: '全部/好评/有图/差评 chips',
    icon: Tags,
    defaultProps: { total: 23000 },
    fields: [{ key: 'total', label: '评价总数', type: 'number', min: 0, max: 99990000, step: 1000 }],
    Interactive: RateTagsInteractive,
    render: (p) => {
      const total = Number(p.total) || 0;
      const label = total >= 10000 ? `${(total / 10000).toFixed(1)}万` : String(total);
      return (
        <div className="flex items-center gap-2 overflow-hidden">
          <span
            className="shrink-0 px-3.5 py-1.5 text-xs font-semibold"
            style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
          >
            全部 {label}
          </span>
          {['好评', '有图', '差评'].map((t) => (
            <span key={t} className="w-chip shrink-0 px-3.5 py-1.5 text-xs opacity-65" style={{ borderRadius: '999px' }}>
              {t}
            </span>
          ))}
        </div>
      );
    },
  },
];
