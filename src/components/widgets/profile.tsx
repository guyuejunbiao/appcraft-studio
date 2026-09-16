'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Crown, Wallet, CreditCard, Package, Truck, Star, ClipboardList, Coins,
  CalendarCheck, Gift, LayoutGrid, Info, RefreshCw, Gem, LogOut,
  MapPin, Headphones, Heart, Footprints, TicketPercent, CircleHelp,
  Settings, MoreHorizontal, Trophy, Medal, Flame, Check, Image as ImageIcon,
  Moon, Sun,
} from 'lucide-react';
import type { WidgetDef, WidgetProps, InteractiveCtx } from '@/lib/widget-types';
import {
  parseCells, normalizeCells, splitList, cellsToSlots, useCellAct,
  type GridCell,
} from './grid-kit';
import { useBusScope, useScene } from '@/lib/interaction-bus';
import { fireToast } from '@/lib/widget-toast';
import { stopAct, useAction, useLocalToggle, ActStatusIcon } from './action-kit';

/**
 * 个人中心 组件库（目录：profile）
 * 与 mall.tsx / functional.tsx 同一套规范：只使用 Tailwind + CSS 变量
 * （--p 主色 / --pr 圆角 / --pf 主色上文字），表面类 w-card/w-input/w-chip/w-line。
 * 主文字继承画布颜色，次要文字 opacity-40~70；渲染为纯函数，无 hooks / 无请求。
 * 会员 / 金卡类使用 amber 系渐变，钱包类使用主色渐变，禁止蓝色 / 靛蓝色系。
 */

/** me.order-grid 订单入口图标（按序取用；cellsIcons 同序作为逐格默认图标建议） */
const ORDER_ICONS = [CreditCard, Package, Truck, Star];
const ORDER_ICON_NAMES = ['credit-card', 'package', 'truck', 'star'];

/** me.service-grid 服务入口图标（按序固定 8 个） */
const SERVICE_ICONS = [MapPin, Headphones, Heart, Footprints, TicketPercent, CircleHelp, Settings, MoreHorizontal];
const SERVICE_ICON_NAMES = ['map-pin', 'headphones', 'heart', 'compass', 'ticket', 'circle-help', 'settings', 'list'];

/** 未绑定跳转且无内置动作时的统一提示（引导用户去交互面板绑定） */
function useCellFallback() {
  const scope = useBusScope();
  return (label?: string) =>
    fireToast(scope, label ? `「${label}」尚未绑定页面` : '该格子尚未绑定页面', 'info');
}

/** 订单宫格单元解析：cells 优先；旧数据回退 labels + badges（逗号分隔） */
function parseOrderCells(p: WidgetProps) {
  const cells = parseCells(p.cells, p.labels, ORDER_ICONS).slice(0, 4);
  if (normalizeCells(p.cells).length) return cells;
  const badges = splitList(p.badges);
  return cells.map((c, i) => ({ ...c, badge: Number(badges[i]) > 0 ? badges[i] : undefined }));
}

/** 订单宫格视图（静态/交互共用；onTapCell 存在时逐格可点击） */
function OrderGridView({
  cells,
  onTapCell,
}: {
  cells: (GridCell & { Icon: LucideIcon })[];
  onTapCell?: (i: number) => void;
}) {
  return (
    <div className="w-card grid grid-cols-4 px-2 py-4" style={{ borderRadius: 'var(--pr)' }}>
      {cells.map((c, i) => {
        const raw = Number(c.badge) || 0;
        const body = (
          <>
            {raw > 0 && (
              <span
                className="absolute -top-2 right-1/2 z-10 flex h-4 min-w-4 translate-x-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none text-white"
                style={{ background: '#f43f5e' }}
              >
                {raw > 99 ? '99+' : raw}
              </span>
            )}
            <c.Icon className="size-[22px]" style={{ color: 'var(--p)' }} />
            <span className="text-[11px] opacity-70">{c.label}</span>
          </>
        );
        return onTapCell ? (
          <button
            key={`${c.label}-${i}`}
            type="button"
            aria-label={c.label}
            data-cell-index={i}
            onClick={() => onTapCell(i)}
            className="relative flex flex-col items-center gap-1.5 transition-opacity active:opacity-60"
          >
            {body}
          </button>
        ) : (
          <div key={`${c.label}-${i}`} data-cell-index={i} className="relative flex flex-col items-center gap-1.5">
            {body}
          </div>
        );
      })}
    </div>
  );
}

/** 订单宫格交互：格动作（昼夜/提示）→ 逐格压栈跳页（未绑定提示）→ 整卡跳页 → 未绑定提示 */
function OrderGridInteractive({ props, slotPush, onTap }: InteractiveCtx) {
  const cells = useMemo(() => parseOrderCells(props), [props]);
  const onAct = useCellAct(cells);
  const cellFallback = useCellFallback();
  const onCell = (i: number) => {
    if (onAct(i)) return;
    if (slotPush) {
      if (!slotPush(String(i))) cellFallback(cells[i]?.label);
      return;
    }
    if (onTap) {
      onTap();
      return;
    }
    cellFallback(cells[i]?.label);
  };
  return <OrderGridView cells={cells} onTapCell={onCell} />;
}

/** 服务九宫格视图（静态/交互共用） */
function ServiceGridView({
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
            <span className="text-[11px] opacity-70">{c.label}</span>
          </>
        );
        return onTapCell ? (
          <button
            key={`${c.label}-${i}`}
            type="button"
            aria-label={c.label}
            data-cell-index={i}
            onClick={() => onTapCell(i)}
            className="flex flex-col items-center gap-1.5 transition-opacity active:opacity-60"
          >
            {body}
          </button>
        ) : (
          <div key={`${c.label}-${i}`} data-cell-index={i} className="flex flex-col items-center gap-1.5">
            {body}
          </div>
        );
      })}
    </div>
  );
}

/** 服务九宫格交互：格动作 → 逐格压栈跳页（未绑定提示）→ 整卡跳页 → 未绑定提示 */
function ServiceGridInteractive({ props, slotPush, onTap }: InteractiveCtx) {
  const cells = useMemo(() => parseCells(props.cells, props.labels, SERVICE_ICONS).slice(0, 8), [props]);
  const onAct = useCellAct(cells);
  const cellFallback = useCellFallback();
  const onCell = (i: number) => {
    if (onAct(i)) return;
    if (slotPush) {
      if (!slotPush(String(i))) cellFallback(cells[i]?.label);
      return;
    }
    if (onTap) {
      onTap();
      return;
    }
    cellFallback(cells[i]?.label);
  };
  return <ServiceGridView cells={cells} onTapCell={onCell} />;
}

/** 昼夜切换行视图（静态/交互共用）：太阳/月亮随场景切换 */
function ThemeRowBody({
  label,
  desc,
  dark,
}: {
  label: string;
  desc?: string;
  dark: boolean;
}) {
  return (
    <div className="w-card flex h-14 items-center justify-between px-4" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-center gap-3">
        <span
          className="flex size-8 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--p) 10%, transparent)', color: 'var(--p)' }}
        >
          {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </span>
        <div>
          <div className="text-sm font-semibold">{label}</div>
          {desc ? <div className="text-[10px] opacity-45">{desc}</div> : null}
        </div>
      </div>
      {/* 开关视觉：夜间=主色底滑块居右 */}
      <span
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
        style={{ background: dark ? 'var(--p)' : 'rgba(0,0,0,0.18)' }}
      >
        <span
          className="absolute size-5 rounded-full bg-white shadow transition-all"
          style={{ left: dark ? '22px' : '2px' }}
        />
      </span>
    </div>
  );
}

/** 昼夜切换行交互：点击整行真实切换整个屏幕的白天/黑夜场景 */
function ThemeRowInteractive({ props }: InteractiveCtx) {
  const { dark, canToggle, toggle } = useScene();
  const scope = useBusScope();
  return (
    <div
      role={canToggle ? 'switch' : undefined}
      aria-checked={canToggle ? dark : undefined}
      aria-label={String(props.label || '深色模式')}
      className={canToggle ? 'cursor-pointer select-none transition-opacity active:opacity-80' : 'cursor-default'}
      onClick={() => {
        if (!canToggle) {
          fireToast(scope, '预览中点击可切换昼夜场景', 'info');
          return;
        }
        toggle();
      }}
    >
      <ThemeRowBody
        label={String(props.label ?? '深色模式')}
        desc={props.desc ? String(props.desc) : undefined}
        dark={dark}
      />
    </div>
  );
}

/** me.achievement-badge 成就徽章图标（按序取用） */
const BADGE_ICONS = [Trophy, Medal, Star, Flame];

/* ------------------------------------------------------------------ */
/* 交互实现（action-kit 规范）：视觉复制 render，仅替换可交互元素          */
/* ------------------------------------------------------------------ */

/** me.member-card 交互：金色「立即续费」→ busy → 成功 toast / 绑定跳页 */
function MemberCardInteractive({ props, onTap }: InteractiveCtx) {
  const act = useAction();
  const gold = props.style !== 'purple';
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
      <div className="absolute -right-8 -top-10 size-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="absolute -bottom-12 -left-6 size-24 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="relative flex items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <Crown className="size-5 text-amber-400" fill="currentColor" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold text-white">{props.name}</span>
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none text-amber-300"
              style={{ border: '1px solid rgba(251,191,36,0.55)' }}
            >
              {props.level}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-white/55">{props.expire}</div>
        </div>
        <button
          type="button"
          aria-label="立即续费"
          onClick={(e) => {
            stopAct(e);
            act.run(() => {
              if (onTap) onTap();
              else act.toast('已续费会员（演示）', 'success');
            });
          }}
          className="flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 text-[11px] font-bold shadow-sm transition-transform active:scale-[0.97]"
          style={{ background: btnBg, color: btnColor }}
        >
          {(act.busy || act.done) && <ActStatusIcon busy={act.busy} done={act.done} className="size-3" />}
          立即续费
        </button>
      </div>
    </div>
  );
}

/** me.wallet-card 交互：提现 / 充值各自 busy → 演示 toast / 绑定跳页 */
function WalletCardInteractive({ props, onTap }: InteractiveCtx) {
  const wd = useAction();
  const rc = useAction();
  const buttons = [
    { label: String(props.withdraw ?? ''), act: wd },
    { label: String(props.recharge ?? ''), act: rc },
  ].filter((b) => b.label);
  return (
    <div
      className="relative overflow-hidden p-4"
      style={{
        borderRadius: 'var(--pr)',
        background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 62%, #fff))',
        color: 'var(--pf)',
      }}
    >
      <div className="absolute -right-7 -top-9 size-28 rounded-full" style={{ background: 'rgba(255,255,255,0.16)' }} />
      <div className="absolute -bottom-12 -left-5 size-24 rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }} />
      <Wallet className="absolute right-4 top-4 size-9 opacity-25" />
      <div className="relative">
        <div className="text-xs opacity-80">钱包余额（元）</div>
        <div className="mt-1.5 text-[32px] font-extrabold leading-none tracking-tight">{props.balance}</div>
        <div className="mt-4 flex gap-2.5">
          {buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              aria-label={b.label}
              onClick={(e) => {
                stopAct(e);
                b.act.run(() => {
                  if (onTap) onTap();
                  else b.act.toast(`${b.label}（演示）`, 'success');
                });
              }}
              className="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full px-5 text-xs font-bold transition-transform active:scale-[0.97]"
              style={{ background: 'rgba(255,255,255,0.26)' }}
            >
              {(b.act.busy || b.act.done) && <ActStatusIcon busy={b.act.busy} done={b.act.done} className="size-3" />}
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** me.sign-in-card 交互：签到 ⇄ 已签到原地翻转，七日圆点当日点亮 */
function SignInCardInteractive({ props }: InteractiveCtx) {
  const scope = useBusScope();
  const baseDays = Math.max(0, Math.min(7, Math.round(Number(props.days) || 0)));
  const [signed, toggleSigned] = useLocalToggle(props.signed === true);
  /* 当日本已签到时点击撤销不叠加天数；首次签到点亮下一格 */
  const days = Math.min(7, baseDays + (signed && props.signed !== true ? 1 : 0));
  const onSign = (e: React.MouseEvent) => {
    stopAct(e);
    const wasSigned = signed;
    toggleSigned();
    fireToast(scope, wasSigned ? '已取消今日签到' : '签到成功 +5 积分', wasSigned ? 'info' : 'success');
  };
  return (
    <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold">{props.title}</span>
        {signed ? (
          <button
            type="button"
            aria-label="取消签到"
            onClick={onSign}
            className="flex h-8 cursor-pointer items-center gap-1 rounded-full border w-line px-4 text-xs font-semibold opacity-50 transition-transform active:scale-[0.97] w-chip"
          >
            <Check className="size-3.5" /> 已签到
          </button>
        ) : (
          <button
            type="button"
            aria-label="签到"
            onClick={onSign}
            className="flex h-8 cursor-pointer items-center rounded-full px-4 text-xs font-bold shadow-sm transition-transform active:scale-[0.97]"
            style={{ background: 'var(--p)', color: 'var(--pf)' }}
          >
            签到
          </button>
        )}
      </div>
      <div className="mt-1.5 text-xs opacity-60">
        已连续签到 <span className="font-bold" style={{ color: 'var(--p)' }}>{days}</span> 天
      </div>
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
}

/** me.points-mall 交互：「去兑换」busy → 兑换成功 toast；整卡跳页由外层分流 */
function PointsMallInteractive({ props }: InteractiveCtx) {
  const act = useAction();
  const goods = splitList(props.items).slice(0, 2).map((raw) => {
    const [name, ...rest] = raw.split(/\s+/);
    return { name, cost: rest.join(' ') };
  });
  return (
    <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] opacity-50">我的积分</div>
          <div className="mt-1 text-3xl font-extrabold leading-none tracking-tight" style={{ color: 'var(--p)' }}>
            {props.points}
          </div>
        </div>
        <button
          type="button"
          aria-label={String(props.btnText || '去兑换')}
          onClick={(e) => {
            stopAct(e);
            act.run(() => act.toast('兑换成功（演示）', 'success'));
          }}
          className="flex h-8 cursor-pointer items-center gap-1 rounded-full px-4 text-xs font-bold shadow-sm transition-transform active:scale-[0.97]"
          style={{ background: 'var(--p)', color: 'var(--pf)' }}
        >
          {(act.busy || act.done) && <ActStatusIcon busy={act.busy} done={act.done} className="size-3" />}
          {props.btnText}
        </button>
      </div>
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
}

/** me.version-card 交互：「检查更新」busy 1.2s → 已是最新版本 toast */
function VersionCardInteractive({ props }: InteractiveCtx) {
  const act = useAction();
  return (
    <div className="w-card flex h-14 items-center justify-between px-4" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold">当前版本</span>
        <span className="text-sm opacity-45">{props.version}</span>
      </div>
      <span className="relative">
        <button
          type="button"
          aria-label={String(props.btnText || '检查更新')}
          onClick={(e) => {
            stopAct(e);
            act.run(() => act.toast('已是最新版本', 'success'), 1200);
          }}
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-transform active:scale-[0.97]"
          style={{ border: '1.5px solid var(--p)', color: 'var(--p)' }}
        >
          {(act.busy || act.done) && <ActStatusIcon busy={act.busy} done={act.done} className="size-3" />}
          {props.btnText}
        </button>
        {props.hasNew === true && (
          <span
            className="pointer-events-none absolute -right-1.5 -top-1.5 rounded-full px-1 py-0.5 text-[8px] font-bold leading-none text-white"
            style={{ background: '#f43f5e' }}
          >
            NEW
          </span>
        )}
      </span>
    </div>
  );
}

/** me.vip-banner 交互：「立即开通」busy → 开通成功 toast / 绑定跳页 */
function VipBannerInteractive({ props, onTap }: InteractiveCtx) {
  const act = useAction();
  const gold = props.style !== 'primary';
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
        <div className="truncate text-sm font-extrabold">{props.title}</div>
        <div className="mt-0.5 truncate text-[10px] opacity-80">{props.sub}</div>
      </div>
      <button
        type="button"
        aria-label={String(props.btnText || '立即开通')}
        onClick={(e) => {
          stopAct(e);
          act.run(() => {
            if (onTap) onTap();
            else act.toast('开通成功（演示）', 'success');
          });
        }}
        className="flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 text-[11px] font-bold transition-transform active:scale-[0.97]"
        style={
          gold
            ? { background: '#1c1917', color: '#fcd34d' }
            : { background: 'rgba(0,0,0,0.28)', color: 'var(--pf)' }
        }
      >
        {(act.busy || act.done) && <ActStatusIcon busy={act.busy} done={act.done} className="size-3" />}
        {props.btnText}
      </button>
    </div>
  );
}

/** me.achievement-badge 交互：徽章圆钮点击 toast 成就详情 */
function AchievementBadgeInteractive({ props }: InteractiveCtx) {
  const scope = useBusScope();
  const unlocked = Math.max(0, Math.min(4, Math.round(Number(props.unlocked) || 0)));
  const badges = splitList(props.items).slice(0, 4).map((raw) => {
    const [name, ...rest] = raw.split(/\s+/);
    return { name, date: rest.join(' ') };
  });
  return (
    <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold">{props.title}</span>
        <span className="text-[11px] opacity-45">{unlocked}/{badges.length} 已解锁</span>
      </div>
      <div className="mt-3.5 grid grid-cols-4 gap-2">
        {badges.map((b, i) => {
          const on = i < unlocked;
          const Icon = BADGE_ICONS[i % BADGE_ICONS.length];
          return (
            <div key={`${b.name}-${i}`} className="flex min-w-0 flex-col items-center gap-1.5">
              <button
                type="button"
                aria-label={`成就：${b.name}`}
                onClick={(e) => {
                  stopAct(e);
                  fireToast(
                    scope,
                    on ? `成就：${b.name}${b.date ? `（${b.date}）` : ''}` : `「${b.name}」尚未解锁`,
                    'info'
                  );
                }}
                className={`flex size-[52px] cursor-pointer items-center justify-center rounded-full transition-transform active:scale-[0.92] ${on ? 'shadow-sm' : 'w-chip border border-dashed w-line'}`}
                style={on ? { background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#fff' } : undefined}
              >
                <Icon className="size-5" style={on ? { color: '#fff' } : { opacity: 0.3 }} />
              </button>
              <span className={`max-w-full truncate text-[10px] ${on ? 'font-semibold' : 'opacity-35'}`}>{b.name}</span>
              <span className="text-[9px] leading-none opacity-40">{on ? (b.date || '已解锁') : '未解锁'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** me.logout-btn 交互：确认弹窗 → 真实清会话（onLogout）；无会话时演示提示 */
function LogoutBtnInteractive({ props, onLogout }: InteractiveCtx) {
  const scope = useBusScope();
  const [ask, setAsk] = useState(false);
  const label = String(props.text || '退出登录');
  const dialog =
    ask && onLogout && typeof document !== 'undefined'
      ? createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-[85] flex flex-col justify-end bg-black/50"
            onClick={() => setAsk(false)}
            role="dialog"
            aria-modal="true"
            aria-label="退出登录确认"
          >
            <motion.div
              initial={{ y: 220 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="rounded-t-3xl bg-white px-5 pb-8 pt-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-200" />
              <h3 className="text-center text-base font-bold text-zinc-900">退出登录？</h3>
              <p className="mt-2 text-center text-xs leading-5 text-zinc-500">
                退出后将清除本次登录状态，需要重新登录才能继续使用
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAsk(false)}
                  className="h-11 flex-1 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-500 transition-transform active:scale-[0.97]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAsk(false);
                    onLogout?.();
                  }}
                  className="flex h-11 flex-[1.6] items-center justify-center gap-1.5 rounded-full bg-rose-500 text-sm font-bold text-white shadow-md transition-transform active:scale-[0.97]"
                >
                  <LogOut className="size-4" /> {label}
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.getElementById('phone-screen') ?? document.body
        )
      : null;
  return (
    <>
      <div
        role="button"
        aria-label={label}
        onClick={(e) => {
          stopAct(e);
          if (onLogout) setAsk(true);
          else fireToast(scope, '演示环境无会话', 'info');
        }}
        className="w-card flex h-12 cursor-pointer items-center justify-center transition-opacity active:opacity-70"
        style={{ borderRadius: 'var(--pr)' }}
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold text-rose-500">
          <LogOut className="size-4" />
          {label}
        </span>
      </div>
      {dialog}
    </>
  );
}

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
    Interactive: MemberCardInteractive,
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
    Interactive: WalletCardInteractive,
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
    desc: '待付款 / 待发货 / 待收货 / 评价，逐格可编辑图标文案动作，可绑页面',
    icon: ClipboardList,
    canvasInteractive: true,
    defaultProps: {
      labels: '待付款,待发货,待收货,评价',
      badges: '2,0,1,0',
      cellsIcons: ORDER_ICON_NAMES,
    },
    fields: [
      { key: 'cells', label: '宫格单元（逐格编辑）', type: 'cells', max: 4, withBadge: true },
    ],
    slots: (p) => cellsToSlots(parseCells(p.cells, p.labels, ORDER_ICONS).slice(0, 4)),
    render: (p) => <OrderGridView cells={parseOrderCells(p)} />,
    Interactive: OrderGridInteractive,
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
    Interactive: SignInCardInteractive,
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
    Interactive: PointsMallInteractive,
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
    desc: '2 行 x 4 列服务入口，逐格可编辑图标文案动作，可绑页面',
    icon: LayoutGrid,
    canvasInteractive: true,
    defaultProps: {
      labels: '地址,客服,收藏,足迹,优惠券,帮助,设置,更多',
      cellsIcons: SERVICE_ICON_NAMES,
    },
    fields: [
      { key: 'cells', label: '宫格单元（逐格编辑）', type: 'cells', max: 8 },
    ],
    slots: (p) => cellsToSlots(parseCells(p.cells, p.labels, SERVICE_ICONS).slice(0, 8)),
    render: (p) => <ServiceGridView cells={parseCells(p.cells, p.labels, SERVICE_ICONS).slice(0, 8)} />,
    Interactive: ServiceGridInteractive,
  },
  {
    type: 'me.theme-row',
    category: 'profile',
    name: '昼夜切换行',
    desc: '深色模式设置行：预览/画布联动中点击真实切换白天/黑夜场景',
    icon: Moon,
    canvasInteractive: true,
    defaultProps: { label: '深色模式', desc: '点击切换夜间场景' },
    fields: [
      { key: 'label', label: '标题', type: 'text' },
      { key: 'desc', label: '副文案', type: 'text' },
    ],
    render: (p) => (
      <ThemeRowBody
        label={String(p.label ?? '深色模式')}
        desc={p.desc ? String(p.desc) : undefined}
        dark={false}
      />
    ),
    Interactive: ThemeRowInteractive,
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
    Interactive: VersionCardInteractive,
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
    Interactive: VipBannerInteractive,
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
    Interactive: AchievementBadgeInteractive,
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
    Interactive: LogoutBtnInteractive,
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
