'use client';

import { useState } from 'react';
import {
  ArrowLeft, ArrowUp, ChevronRight, Copy, Heart, Link2, LogOut, MessageCircle,
  MoreHorizontal, Send, Share2, ShoppingCart, Star, ThumbsUp, Trash2,
  CircleUserRound, Headphones, LoaderCircle, Check, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WidgetDef, WidgetProps, InteractiveCtx } from '@/lib/widget-types';
import { stopAct, useAction, useLikeCount, fmtCount } from './action-kit';

/**
 * 功能按钮组件库（目录：buttons）
 * 独立目录的高频功能按钮：返回 / 确认取消 / 点赞收藏 / 返回顶部 / 关闭 /
 * 更多 / 分享组 / 危险操作 / 胶囊切换 / 文字链接 / 快捷钮条。
 * 设计规范与其他目录一致：CSS 变量（--p 主色 / --pf 主色上文字 / --pr 圆角）+
 * w-chip 明暗自适应表面类，次要文字用 opacity。
 * 交互铁律：预览中每个按钮原地有反应（action-kit 基建），带绑定连接的
 * 组件支持整钮跳转（onTap）与逐条目跳转（slotPush）。
 */

const toList = (s: unknown): string[] =>
  String(s ?? '').split(/[,，]/).map((x) => x.trim()).filter(Boolean);

/* 分享/快捷钮条图标池：按下标循环取用 */
const SHARE_ICONS: LucideIcon[] = [MessageCircle, CircleUserRound, Share2, Link2, Star, ThumbsUp, Send, Copy];
const QUICK_ICONS: LucideIcon[] = [Headphones, Heart, Share2, ShoppingCart, Star, MessageCircle, Link2, CircleUserRound];

/* ------------------------------------------------------------------ */
/* 返回按钮：预览中点击 = 真实页面栈回退（navBack）                     */
/* ------------------------------------------------------------------ */

function BackFace({ p, onClick }: { p: WidgetProps; onClick?: (e: React.MouseEvent) => void }) {
  const st = p.style === 'circle' ? 'circle' : p.style === 'bare' ? 'bare' : 'text';
  if (st === 'circle') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={String(p.text || '返回')}
        className="flex size-10 items-center justify-center w-chip shadow-sm transition-transform active:scale-95"
        style={{ borderRadius: '999px' }}
      >
        <ArrowLeft className="size-5" />
      </button>
    );
  }
  if (st === 'bare') {
    return (
      <button type="button" onClick={onClick} aria-label={String(p.text || '返回')} className="flex items-center">
        <ArrowLeft className="size-6" />
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 transition-transform active:scale-95">
      <ArrowLeft className="size-5" />
      <span className="text-[15px] font-semibold">{p.text}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 确认 / 取消 双按钮：右钮 loading→成功→跳转，左钮 toast              */
/* ------------------------------------------------------------------ */

function ConfirmPairFace({
  p, busy, done, onLeft, onRight,
}: {
  p: WidgetProps;
  busy?: boolean;
  done?: boolean;
  onLeft?: (e: React.MouseEvent) => void;
  onRight?: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex gap-2.5">
      <button
        type="button"
        onClick={onLeft}
        className="flex h-11 flex-1 items-center justify-center text-[14px] font-bold transition-transform active:scale-[0.98]"
        style={{ borderRadius: 'var(--pr)', border: '1.5px solid var(--p)', color: 'var(--p)' }}
      >
        {p.leftText}
      </button>
      <button
        type="button"
        onClick={onRight}
        className="flex h-11 flex-1 items-center justify-center gap-1.5 text-[14px] font-bold shadow-md transition-transform active:scale-[0.98]"
        style={{ borderRadius: 'var(--pr)', background: 'var(--p)', color: 'var(--pf)' }}
      >
        {busy ? (
          <><LoaderCircle className="size-4 animate-spin" /> 提交中…</>
        ) : done ? (
          <><Check className="size-4" /> 已完成</>
        ) : (
          p.rightText
        )}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 点赞 / 收藏：原地翻转 + 计数 ±1                                     */
/* ------------------------------------------------------------------ */

function LikeFace({
  p, on, count, onClick,
}: {
  p: WidgetProps;
  on?: boolean;
  count?: number;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const Icon = p.icon === 'thumbs' ? ThumbsUp : p.icon === 'star' ? Star : Heart;
  const active = on === true;
  const n = typeof count === 'number' ? count : Number(String(p.count).replace(/[^\d]/g, '')) || 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-9 items-center gap-1.5 px-3.5 transition-transform active:scale-95 ${active ? 'shadow-sm' : 'w-chip'}`}
      style={{ borderRadius: '999px', ...(active ? { background: 'color-mix(in srgb, var(--p) 12%, transparent)', color: 'var(--p)' } : {}) }}
    >
      <Icon className={`size-4 ${active ? 'fill-current' : 'opacity-55'}`} />
      <span className={`text-[12px] font-bold ${active ? '' : 'opacity-55'}`}>{fmtCount(n)}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 返回顶部：右对齐悬浮 chip                                            */
/* ------------------------------------------------------------------ */

function BackTopFace({ p, onClick }: { p: WidgetProps; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="flex h-9 items-center gap-1 w-chip px-3.5 shadow-md transition-transform active:scale-95"
        style={{ borderRadius: '999px' }}
      >
        <ArrowUp className="size-4" style={{ color: 'var(--p)' }} />
        <span className="text-[12px] font-bold" style={{ color: 'var(--p)' }}>{p.text}</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 关闭按钮：三种皮肤，靠右                                             */
/* ------------------------------------------------------------------ */

function CloseFace({ p, onClick }: { p: WidgetProps; onClick?: (e: React.MouseEvent) => void }) {
  const st = p.style === 'outline' ? 'outline' : p.style === 'bare' ? 'bare' : 'soft';
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        aria-label="关闭"
        className={`flex size-9 items-center justify-center transition-transform active:scale-95 ${st === 'soft' ? 'w-chip' : ''}`}
        style={{
          borderRadius: '999px',
          ...(st === 'outline' ? { border: '1.5px solid var(--w-line, rgba(0,0,0,.12))' } : {}),
        }}
      >
        <X className="size-5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 更多按钮：横/竖三点                                                  */
/* ------------------------------------------------------------------ */

function MoreFace({ p, onClick }: { p: WidgetProps; onClick?: (e: React.MouseEvent) => void }) {
  const vertical = p.direction === 'vertical';
  return (
    <div className={vertical ? 'flex justify-end' : 'flex'}>
      <button
        type="button"
        onClick={onClick}
        aria-label="更多"
        className={`flex items-center justify-center transition-transform active:scale-95 ${p.style === 'bare' ? '' : 'w-chip shadow-sm'} ${vertical ? 'size-9' : 'h-9 px-3'}`}
        style={{ borderRadius: '999px' }}
      >
        <MoreHorizontal className={`size-5 ${vertical ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 分享按钮组：横排圆形图标 + 名称，点击原地 toast                       */
/* ------------------------------------------------------------------ */

function ShareRowFace({
  p, onItem,
}: {
  p: WidgetProps;
  onItem?: (name: string, i: number, e: React.MouseEvent) => void;
}) {
  const items = toList(p.items).slice(0, 4);
  return (
    <div className="flex justify-around">
      {items.map((name, i) => {
        const Icon = SHARE_ICONS[i % SHARE_ICONS.length];
        return (
          <button
            key={`${name}-${i}`}
            type="button"
            onClick={onItem ? (e) => onItem(name, i, e) : undefined}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className="flex size-11 items-center justify-center w-chip transition-transform active:scale-95"
              style={{ borderRadius: '999px', ...(i === 0 ? { color: 'var(--p)' } : {}) }}
            >
              <Icon className="size-5" />
            </span>
            <span className="text-[10px] opacity-60">{name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 危险操作按钮：rose 语义色（本仓库红=rose-500 惯例）                  */
/* ------------------------------------------------------------------ */

function DangerFace({
  p, busy, done, onClick,
}: {
  p: WidgetProps;
  busy?: boolean;
  done?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const st = p.style === 'solid' ? 'solid' : p.style === 'soft' ? 'soft' : 'outline';
  const skin = st === 'solid'
    ? { background: 'rgb(244 63 94)', color: '#fff' }
    : st === 'soft'
      ? { background: 'rgba(244,63,94,.1)', color: 'rgb(244 63 94)' }
      : { border: '1.5px solid rgb(244 63 94)', color: 'rgb(244 63 94)' };
  const Icon = p.icon === 'logout' ? LogOut : Trash2;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-1.5 text-[14px] font-bold transition-transform active:scale-[0.98]"
      style={{ borderRadius: 'var(--pr)', ...skin }}
    >
      {busy ? (
        <><LoaderCircle className="size-4 animate-spin" /> 处理中…</>
      ) : done ? (
        <><Check className="size-4" /> 已完成</>
      ) : (
        <>
          <Icon className="size-4" /> {p.text}
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 胶囊切换组：单选激活，原地切换                                       */
/* ------------------------------------------------------------------ */

function PillRowFace({
  p, active, onPick,
}: {
  p: WidgetProps;
  active?: number;
  onPick?: (i: number, e: React.MouseEvent) => void;
}) {
  const items = toList(p.items).slice(0, 6);
  const cur = active ?? Math.max(0, Math.min(items.length - 1, Math.round(Number(p.active) || 0)));
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((label, i) => (
        <button
          key={`${label}-${i}`}
          type="button"
          onClick={onPick ? (e) => onPick(i, e) : undefined}
          className={`flex h-8 items-center px-4 text-[12px] font-bold transition-transform active:scale-95 ${i === cur ? 'shadow-sm' : 'w-chip'}`}
          style={i === cur
            ? { borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }
            : { borderRadius: '999px' }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 文字链接：主色文字 + 箭头，对齐可选；绑定连接即跳页                   */
/* ------------------------------------------------------------------ */

function TextLinkFace({ p, onClick }: { p: WidgetProps; onClick?: (e: React.MouseEvent) => void }) {
  const align = p.align === 'center' ? 'justify-center' : p.align === 'left' ? 'justify-start' : 'justify-end';
  return (
    <div className={`flex ${align}`}>
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-0.5 font-bold transition-opacity active:opacity-70 ${p.size === 'sm' ? 'text-[11px]' : 'text-[13px]'}`}
        style={{ color: 'var(--p)' }}
      >
        {p.text}
        {p.arrow !== false && <ChevronRight className="size-3.5" />}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 快捷功能钮条：竖排图标+字（客服/收藏/分享/购物车…），逐条目可绑页面   */
/* ------------------------------------------------------------------ */

function QuickBarFace({
  p, onItem,
}: {
  p: WidgetProps;
  onItem?: (name: string, i: number, e: React.MouseEvent) => void;
}) {
  const items = toList(p.items).slice(0, 6);
  return (
    <div className="flex items-start justify-around">
      {items.map((name, i) => {
        const Icon = QUICK_ICONS[i % QUICK_ICONS.length];
        return (
          <button
            key={`${name}-${i}`}
            type="button"
            onClick={onItem ? (e) => onItem(name, i, e) : undefined}
            className="flex flex-col items-center gap-1"
          >
            <span
              className="flex size-10 items-center justify-center w-chip transition-transform active:scale-95"
              style={{ borderRadius: '999px', color: 'var(--p)' }}
            >
              <Icon className="size-5" />
            </span>
            <span className="text-[10px] opacity-60">{name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 组件定义                                                             */
/* ------------------------------------------------------------------ */

export const widgets: WidgetDef[] = [
  {
    type: 'btn.back',
    category: 'buttons',
    name: '返回按钮',
    desc: '左上角返回：预览中点击真实回退上一页（页面栈返回）',
    icon: ArrowLeft,
    defaultProps: { text: '返回', style: 'text' },
    fields: [
      { key: 'text', label: '按钮文案', type: 'text' },
      { key: 'style', label: '样式', type: 'select', options: [{ label: '箭头+文字', value: 'text' }, { label: '圆形底图标', value: 'circle' }, { label: '裸图标', value: 'bare' }] },
    ],
    Interactive: ({ props, navBack }: InteractiveCtx) => (
      <BackFace
        p={props}
        onClick={(e) => { stopAct(e); navBack?.(); }}
      />
    ),
    render: (p) => <BackFace p={p} />,
  },
  {
    type: 'btn.confirm-pair',
    category: 'buttons',
    name: '确认 · 取消双按钮',
    desc: '并排主次操作钮：确认走提交时序（转圈→完成→可跳转），取消原地提示',
    icon: Check,
    defaultProps: { leftText: '取消', rightText: '确认提交' },
    fields: [
      { key: 'leftText', label: '左侧文案', type: 'text' },
      { key: 'rightText', label: '右侧文案', type: 'text' },
    ],
    Interactive: ({ props, onTap }: InteractiveCtx) => {
      const { toast, busy, done, run } = useAction();
      return (
        <ConfirmPairFace
          p={props}
          busy={busy}
          done={done}
          onLeft={(e) => { stopAct(e); toast('已取消'); }}
          onRight={(e) => {
            stopAct(e);
            run(() => { toast('操作成功', 'success'); onTap?.(); });
          }}
        />
      );
    },
    render: (p) => <ConfirmPairFace p={p} />,
  },
  {
    type: 'btn.like',
    category: 'buttons',
    name: '点赞收藏钮',
    desc: '心形/赞/星 + 计数：点击原地翻转并 ±1',
    icon: Heart,
    defaultProps: { count: '3286', icon: 'heart' },
    fields: [
      { key: 'count', label: '初始数量', type: 'text', placeholder: '如 3286' },
      { key: 'icon', label: '图标', type: 'select', options: [{ label: '心形', value: 'heart' }, { label: '点赞', value: 'thumbs' }, { label: '星标', value: 'star' }] },
    ],
    Interactive: ({ props }: InteractiveCtx) => {
      const [on, count, click] = useLikeCount(false, Number(String(props.count).replace(/[^\d]/g, '')) || 0);
      return <LikeFace p={props} on={on} count={count} onClick={(e) => { stopAct(e); click(); }} />;
    },
    render: (p) => <LikeFace p={p} />,
  },
  {
    type: 'btn.back-top',
    category: 'buttons',
    name: '返回顶部',
    desc: '右下角悬浮「顶部」chip，点击原地提示回顶',
    icon: ArrowUp,
    defaultProps: { text: '顶部' },
    fields: [
      { key: 'text', label: '文案', type: 'text' },
    ],
    Interactive: ({ props }: InteractiveCtx) => {
      const { toast } = useAction();
      return <BackTopFace p={props} onClick={(e) => { stopAct(e); toast('已回到顶部', 'success'); }} />;
    },
    render: (p) => <BackTopFace p={p} />,
  },
  {
    type: 'btn.close',
    category: 'buttons',
    name: '关闭按钮',
    desc: '右上角 X 圆钮：浅底 / 描边 / 裸图标',
    icon: X,
    defaultProps: { style: 'soft' },
    fields: [
      { key: 'style', label: '样式', type: 'select', options: [{ label: '浅底圆', value: 'soft' }, { label: '描边圆', value: 'outline' }, { label: '裸图标', value: 'bare' }] },
    ],
    Interactive: ({ props }: InteractiveCtx) => {
      const { toast } = useAction();
      return <CloseFace p={props} onClick={(e) => { stopAct(e); toast('已关闭'); }} />;
    },
    render: (p) => <CloseFace p={p} />,
  },
  {
    type: 'btn.more-dots',
    category: 'buttons',
    name: '更多按钮',
    desc: '横/竖三点更多操作钮',
    icon: MoreHorizontal,
    defaultProps: { direction: 'horizontal', style: 'soft' },
    fields: [
      { key: 'direction', label: '方向', type: 'select', options: [{ label: '横向三点', value: 'horizontal' }, { label: '竖向三点', value: 'vertical' }] },
      { key: 'style', label: '样式', type: 'select', options: [{ label: '浅底圆', value: 'soft' }, { label: '裸图标', value: 'bare' }] },
    ],
    Interactive: ({ props }: InteractiveCtx) => {
      const { toast } = useAction();
      return <MoreFace p={props} onClick={(e) => { stopAct(e); toast('更多操作'); }} />;
    },
    render: (p) => <MoreFace p={p} />,
  },
  {
    type: 'btn.share-row',
    category: 'buttons',
    name: '分享按钮组',
    desc: '横排圆形分享位（微信/朋友圈/微博/复制链接），逐个点击原地提示',
    icon: Share2,
    defaultProps: { items: '微信好友,朋友圈,微博,复制链接' },
    fields: [
      { key: 'items', label: '分享入口（逗号分隔，最多 4 个）', type: 'textarea' },
    ],
    Interactive: ({ props }: InteractiveCtx) => {
      const { toast } = useAction();
      return (
        <ShareRowFace
          p={props}
          onItem={(name, _i, e) => {
            stopAct(e);
            toast(name.includes('链接') ? '链接已复制' : `已分享到 ${name}`, 'success');
          }}
        />
      );
    },
    render: (p) => <ShareRowFace p={p} />,
  },
  {
    type: 'btn.danger',
    category: 'buttons',
    name: '危险操作按钮',
    desc: '删除/退出等红色警示钮：实底 / 描边 / 浅底，点击走处理时序',
    icon: Trash2,
    defaultProps: { text: '删除订单', icon: 'trash', style: 'outline', toastText: '已删除' },
    fields: [
      { key: 'text', label: '按钮文案', type: 'text' },
      { key: 'icon', label: '图标', type: 'select', options: [{ label: '垃圾桶', value: 'trash' }, { label: '退出', value: 'logout' }] },
      { key: 'style', label: '样式', type: 'select', options: [{ label: '红描边', value: 'outline' }, { label: '红实底', value: 'solid' }, { label: '红浅底', value: 'soft' }] },
      { key: 'toastText', label: '点击后提示', type: 'text' },
    ],
    Interactive: ({ props }: InteractiveCtx) => {
      const { toast, busy, done, run } = useAction();
      return (
        <DangerFace
          p={props}
          busy={busy}
          done={done}
          onClick={(e) => { stopAct(e); run(() => toast(String(props.toastText || '操作成功'), 'success')); }}
        />
      );
    },
    render: (p) => <DangerFace p={p} />,
  },
  {
    type: 'btn.pill-row',
    category: 'buttons',
    name: '胶囊切换组',
    desc: '一排筛选/状态胶囊：点击原地切换激活项',
    icon: Copy,
    defaultProps: { items: '全部,进行中,已完成,售后', active: 0 },
    fields: [
      { key: 'items', label: '胶囊文案（逗号分隔，最多 6 个）', type: 'textarea' },
      { key: 'active', label: '默认激活序号', type: 'number', min: 0, max: 5, step: 1 },
    ],
    Interactive: ({ props }: InteractiveCtx) => {
      const [cur, setCur] = useState(Math.max(0, Math.round(Number(props.active) || 0)));
      return (
        <PillRowFace
          p={props}
          active={cur}
          onPick={(i, e) => { stopAct(e); setCur(i); }}
        />
      );
    },
    render: (p) => <PillRowFace p={p} />,
  },
  {
    type: 'btn.text-link',
    category: 'buttons',
    name: '文字链接',
    desc: '「查看全部 >」主色文字链：绑定连接即跳页',
    icon: ChevronRight,
    defaultProps: { text: '查看全部', arrow: true, align: 'right', size: 'md' },
    fields: [
      { key: 'text', label: '链接文案', type: 'text' },
      { key: 'arrow', label: '显示箭头', type: 'switch' },
      { key: 'align', label: '对齐', type: 'select', options: [{ label: '靠右', value: 'right' }, { label: '居中', value: 'center' }, { label: '靠左', value: 'left' }] },
      { key: 'size', label: '字号', type: 'select', options: [{ label: '标准', value: 'md' }, { label: '小号', value: 'sm' }] },
    ],
    Interactive: ({ props, onTap }: InteractiveCtx) => {
      const { toast } = useAction();
      return (
        <TextLinkFace
          p={props}
          onClick={(e) => { stopAct(e); if (onTap) onTap(); else toast(`前往「${props.text}」`); }}
        />
      );
    },
    render: (p) => <TextLinkFace p={p} />,
  },
  {
    type: 'btn.quick-bar',
    category: 'buttons',
    name: '快捷功能钮条',
    desc: '客服/收藏/分享/购物车竖排钮条：逐条目可绑定不同跳转页面',
    icon: Headphones,
    defaultProps: { items: '客服,收藏,分享,购物车' },
    fields: [
      { key: 'items', label: '功能项（逗号分隔，最多 6 个）', type: 'textarea' },
    ],
    slots: (p) => toList(p.items).slice(0, 6).map((label, i) => ({ key: String(i), label: label || `项 ${i + 1}` })),
    Interactive: ({ props, slotPush }: InteractiveCtx) => {
      const { toast } = useAction();
      return (
        <QuickBarFace
          p={props}
          onItem={(name, i, e) => {
            stopAct(e);
            const ok = slotPush?.(String(i));
            if (!ok) toast(`点击了「${name}」，可在交互面板绑定跳转页面`);
          }}
        />
      );
    },
    render: (p) => <QuickBarFace p={p} />,
  },
];
