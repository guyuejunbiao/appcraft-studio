'use client';

import { useState } from 'react';
import {
  Activity, Footprints, Dumbbell, CalendarDays, Flame, Droplets, Moon, Scale,
  MessageCircle, UserRound, Medal, LayoutGrid, MonitorPlay, Play, UtensilsCrossed,
  GlassWater, TrendingUp, TrendingDown, MapPin, Heart, Star, BadgeCheck,
  CalendarCheck, ChevronRight, Timer, Zap, Route,
} from 'lucide-react';
import type { WidgetDef, InteractiveCtx } from '@/lib/widget-types';
import { useBusScope } from '@/lib/interaction-bus';
import { fireToast } from '@/lib/widget-toast';
import { stopAct, useAction, useLikeCount, ActStatusIcon, fmtCount } from './action-kit';

/**
 * 健康运动 组件库（目录：fitness）
 * 与 charts.tsx 同一套规范：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 图表/圆环全部为纯静态 markup（div / 内联 SVG / conic-gradient），无 hooks、无外部请求；
 * 辅助色仅用 rose / amber / emerald，禁止蓝色系；render 为纯函数。
 */

/** 逗号（中英文）分隔 → 字符串数组（去空白项） */
const splitList = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,]/).map((s) => s.trim()).filter(Boolean);

/** 逗号分隔 → 数值数组（非法项按 0 处理） */
const numList = (raw: unknown): number[] =>
  splitList(raw).map((s) => (Number.isFinite(Number(s)) ? Number(s) : 0));

/** 数字钳制 */
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** 宽松取数：容忍千分位逗号 / 单位文字（如 '8,426' / '62.5kg'） */
const looseNum = (raw: unknown): number =>
  Number(String(raw ?? '').replace(/[^\d.-]/g, '')) || 0;

/** 辅助强调色（装饰用途，非主色语义）：玫红 / 琥珀 / 翠绿 */
const C_ROSE = '#f43f5e';
const C_AMBER = '#f59e0b';
const C_GREEN = '#10b981';

/** 运动圆环三色：主色（步数）/ 玫红（消耗）/ 琥珀（时长） */
const RING_COLORS = ['var(--p)', C_ROSE, C_AMBER];
const RING_RADII = [50, 39, 28];

/** 赛事报名状态 → 芯片配色 */
const RACE_STATUS: Record<string, { fg: string; bg: string }> = {
  '报名中': { fg: 'var(--p)', bg: 'color-mix(in srgb, var(--p) 12%, transparent)' },
  '即将开跑': { fg: C_AMBER, bg: 'color-mix(in srgb, #f59e0b 14%, transparent)' },
  '已满员': { fg: C_ROSE, bg: 'color-mix(in srgb, #f43f5e 12%, transparent)' },
  '已结束': { fg: 'currentColor', bg: 'color-mix(in srgb, currentColor 8%, transparent)' },
};

/* ------------------------------------------------------------------ */
/* 交互实现（action-kit 规范）：视觉复制 render，仅替换可交互元素          */
/* ------------------------------------------------------------------ */

/** fitness.water-tracker 交互：水杯格子点击原地填充/取消（打卡即开关） */
function WaterTrackerInteractive({ props }: InteractiveCtx) {
  const scope = useBusScope();
  const count = clamp(Math.round(Number(props.count) || 8), 4, 12);
  const [cups, setCups] = useState<boolean[]>(() =>
    Array.from({ length: count }, (_, i) => i < clamp(Math.round(Number(props.done) || 0), 0, count))
  );
  const done = cups.filter(Boolean).length;
  const cupMl = looseNum(props.cupSize) || 250;
  const pct = Math.round((done / count) * 100);
  const clickCup = (i: number) => {
    const wasFilled = cups[i] ?? false;
    setCups((arr) => {
      const next = [...arr];
      next[i] = !wasFilled;
      return next;
    });
    fireToast(scope, wasFilled ? `已取消第 ${i + 1} 杯` : `已打卡第 ${i + 1} 杯`, wasFilled ? 'info' : 'success');
  };
  return (
    <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] font-bold">
          <Droplets className="size-4" style={{ color: 'var(--p)' }} />
          今日喝水
        </span>
        <span className="text-[11px] font-bold" style={{ color: 'var(--p)' }}>
          {done}<span className="font-normal opacity-40"> / {count} 杯</span>
        </span>
      </div>
      {/* 水杯格子：点击切换该杯填充态 */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {Array.from({ length: count }).map((_, i) => {
          const filled = cups[i] ?? false;
          return (
            <button
              key={i}
              type="button"
              aria-label={`第 ${i + 1} 杯${filled ? '，点击取消打卡' : '，点击打卡'}`}
              onClick={(e) => { stopAct(e); clickCup(i); }}
              className={`flex h-11 cursor-pointer flex-col items-center justify-center gap-0.5 transition-transform active:scale-[0.93] ${filled ? '' : 'w-chip'}`}
              style={{
                borderRadius: 'calc(var(--pr) - 4px)',
                background: filled ? 'var(--p)' : undefined,
              }}
            >
              <GlassWater className={`size-4 ${filled ? '' : 'opacity-30'}`} style={filled ? { color: 'var(--pf)' } : undefined} />
              <span className={`text-[8px] leading-none ${filled ? '' : 'opacity-30'}`} style={filled ? { color: 'var(--pf)' } : undefined}>
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>
      {/* 补水量进度 */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden" style={{ borderRadius: '999px' }}>
          <div
            className="h-full transition-all"
            style={{ width: `${Math.max(3, pct)}%`, borderRadius: '999px', background: 'var(--p)' }}
          />
        </div>
        <span className="shrink-0 text-[10px] opacity-45">
          {done * cupMl} / {count * cupMl} ml
        </span>
      </div>
    </div>
  );
}

/** fitness.community-post 交互：点赞红心原地翻转 + 计数 ±1 */
function CommunityPostInteractive({ props }: InteractiveCtx) {
  const [liked, likes, clickLike] = useLikeCount(false, looseNum(props.likes));
  return (
    <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-center gap-2.5">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #000))' }}
        >
          <UserRound className="size-5" style={{ color: 'var(--pf)' }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-bold">{props.nickname}</span>
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none"
              style={{ background: 'color-mix(in srgb, var(--p) 12%, transparent)', color: 'var(--p)' }}
            >
              {props.tag}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] opacity-40">{props.time}</div>
        </div>
      </div>
      <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed opacity-80">{props.content}</p>
      {/* 点赞 / 评论：红心原地翻转 */}
      <div className="mt-3 flex items-center gap-5 border-t w-line pt-2.5 text-[11px] opacity-55">
        <button
          type="button"
          aria-label={liked ? '取消点赞' : '点赞'}
          onClick={(e) => { stopAct(e); clickLike(); }}
          className={`flex cursor-pointer items-center gap-1 transition-transform active:scale-90 ${liked ? 'font-bold' : ''}`}
          style={liked ? { color: C_ROSE, opacity: 1 } : undefined}
        >
          <Heart className="size-3.5" style={{ color: C_ROSE }} fill={liked ? C_ROSE : 'none'} />
          {fmtCount(likes)}
        </button>
        <span className="flex items-center gap-1"><MessageCircle className="size-3.5" />{props.comments}</span>
        <span className="ml-auto flex items-center opacity-60">
          <ChevronRight className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

/** fitness.plan-card 交互：「开始训练」busy → 开始训练 toast / 绑定跳页 */
function PlanCardInteractive({ props, onTap }: InteractiveCtx) {
  const act = useAction();
  const levelStyle: Record<string, { fg: string; bg: string }> = {
    '入门': { fg: C_GREEN, bg: 'color-mix(in srgb, #10b981 16%, transparent)' },
    '进阶': { fg: C_AMBER, bg: 'color-mix(in srgb, #f59e0b 18%, transparent)' },
    '挑战': { fg: C_ROSE, bg: 'color-mix(in srgb, #f43f5e 16%, transparent)' },
  };
  const lv = levelStyle[props.level] ?? levelStyle['入门'];
  return (
    <div className="w-card overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
      <div
        className="relative h-28 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #000))',
        }}
      >
        <span className="absolute -right-5 -top-7 size-24 rounded-full bg-white opacity-10" />
        <span className="absolute -bottom-8 left-9 size-20 rounded-full bg-white opacity-[0.07]" />
        <span
          className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: lv.bg, color: '#fff' }}
        >
          {props.level}
        </span>
        <Dumbbell className="absolute bottom-3 right-4 size-12 text-white opacity-25" />
        <div className="absolute bottom-3 left-4 right-24">
          <div className="truncate text-[15px] font-extrabold text-white">{props.title}</div>
        </div>
      </div>
      <div className="p-3.5">
        <div className="flex items-center justify-between text-[11px] opacity-60">
          <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{props.weeks}</span>
          <span className="flex items-center gap-1"><Timer className="size-3.5" />{props.duration}</span>
          <span className="flex items-center gap-1"><Zap className="size-3.5" />{props.freq}</span>
        </div>
        <button
          type="button"
          aria-label="开始训练"
          onClick={(e) => {
            stopAct(e);
            act.run(() => {
              if (onTap) onTap();
              else act.toast(`开始训练：${props.title}`, 'success');
            });
          }}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 py-2.5 text-[13px] font-bold transition-transform active:scale-[0.98]"
          style={{ background: 'var(--p)', color: 'var(--pf)', borderRadius: 'calc(var(--pr) - 4px)' }}
        >
          {act.busy ? <ActStatusIcon busy done={false} className="size-3.5" /> : <Play className="size-3.5" />}
          开始训练
        </button>
      </div>
    </div>
  );
}

/** fitness.coach-card 交互：「立即预约」busy → 预约成功 toast / 绑定跳页 */
function CoachCardInteractive({ props, onTap }: InteractiveCtx) {
  const act = useAction();
  return (
    <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-center gap-3">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #000))' }}
        >
          <UserRound className="size-7" style={{ color: 'var(--pf)' }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[14px] font-extrabold">{props.name}</span>
            <BadgeCheck className="size-4 shrink-0" style={{ color: C_AMBER }} />
          </div>
          <div className="mt-0.5 truncate text-[11px] opacity-50">{props.title}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <Star className="size-3" style={{ color: C_AMBER, fill: C_AMBER }} />
            <span className="font-bold">{props.rating}</span>
            <span className="text-[10px] opacity-40">综合评分</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t w-line pt-3">
        <span className="text-[11px] opacity-50">{props.students}</span>
        <button
          type="button"
          aria-label={String(props.action || '立即预约')}
          onClick={(e) => {
            stopAct(e);
            act.run(() => {
              if (onTap) onTap();
              else act.toast('预约成功（演示）', 'success');
            });
          }}
          className="flex shrink-0 cursor-pointer items-center gap-1 px-3.5 py-1.5 text-[12px] font-bold transition-transform active:scale-[0.97]"
          style={{ background: 'var(--p)', color: 'var(--pf)', borderRadius: '999px' }}
        >
          {act.busy ? <ActStatusIcon busy done={false} className="size-3.5" /> : <CalendarCheck className="size-3.5" />}
          {props.action}
        </button>
      </div>
    </div>
  );
}

/** fitness.workout-item 交互：视频圆钮 toast；整卡跳页由外层分流 */
function WorkoutItemInteractive({ props }: InteractiveCtx) {
  const scope = useBusScope();
  const idx = clamp(Math.round(Number(props.index) || 1), 1, 99);
  return (
    <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold"
        style={{ background: 'var(--p)', color: 'var(--pf)' }}
      >
        {idx}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{props.name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] opacity-50">
          <span className="shrink-0">{props.sets}</span>
          {props.rest ? <><span className="opacity-40">·</span><span className="truncate">{props.rest}</span></> : null}
        </div>
      </div>
      {props.video !== false ? (
        <button
          type="button"
          aria-label="播放教学视频"
          onClick={(e) => { stopAct(e); fireToast(scope, '▶ 播放教学视频', 'info'); }}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-90"
          style={{ background: 'color-mix(in srgb, var(--p) 12%, transparent)', color: 'var(--p)' }}
        >
          <MonitorPlay className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

/** fitness.marathon-item 交互：整行点击查看赛事详情 / 绑定跳页 */
function MarathonItemInteractive({ props, onTap }: InteractiveCtx) {
  const scope = useBusScope();
  const st = RACE_STATUS[props.status] ?? RACE_STATUS['报名中'];
  return (
    <div
      role="button"
      aria-label="查看赛事详情"
      onClick={(e) => { stopAct(e); if (onTap) onTap(); else fireToast(scope, '查看赛事详情', 'info'); }}
      className="w-card flex cursor-pointer items-center gap-3 p-3 transition-opacity active:opacity-80"
      style={{ borderRadius: 'var(--pr)' }}
    >
      <div className="w-chip flex w-[52px] shrink-0 flex-col items-center justify-center rounded-xl py-2">
        <span className="text-[9px] leading-none opacity-50">{props.month}</span>
        <span className="mt-1 text-lg font-extrabold leading-none" style={{ color: 'var(--p)' }}>{props.day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{props.title}</div>
        <div className="mt-1 flex items-center gap-1 text-[11px] opacity-50">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{props.location}</span>
        </div>
      </div>
      <span
        className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold leading-none"
        style={{ background: st.bg, color: st.fg, opacity: props.status === '已结束' ? 0.55 : undefined }}
      >
        {props.status}
      </span>
    </div>
  );
}

/** fitness.stats-weekly 交互：整卡点击查看周报 / 绑定跳页 */
function StatsWeeklyInteractive({ props, onTap }: InteractiveCtx) {
  const scope = useBusScope();
  const cells = [
    { icon: Dumbbell, label: '运动次数', value: props.sessions },
    { icon: Timer, label: '运动时长', value: props.duration },
    { icon: Flame, label: '消耗热量', value: props.calories },
    { icon: Route, label: '运动里程', value: props.distance },
  ];
  return (
    <div
      role="button"
      aria-label="查看周报"
      onClick={(e) => { stopAct(e); if (onTap) onTap(); else fireToast(scope, '查看周报', 'info'); }}
      className="w-card cursor-pointer p-3.5 transition-opacity active:opacity-80"
      style={{ borderRadius: 'var(--pr)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold">{props.title}</span>
        <span className="flex items-center text-[10px] opacity-40">
          查看报告
          <ChevronRight className="size-3" />
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {cells.map((cell) => (
          <div key={cell.label} className="w-chip rounded-xl p-3" style={{ borderRadius: 'calc(var(--pr) - 4px)' }}>
            <span
              className="flex size-8 items-center justify-center rounded-lg"
              style={{ background: 'color-mix(in srgb, var(--p) 12%, transparent)', color: 'var(--p)' }}
            >
              <cell.icon className="size-4" />
            </span>
            <div className="mt-2 text-[10px] opacity-45">{cell.label}</div>
            <div className="mt-0.5 truncate text-[15px] font-extrabold leading-tight">{cell.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const widgets: WidgetDef[] = [
  {
    type: 'fitness.ring-progress',
    category: 'fitness',
    name: '运动圆环',
    desc: '三色同心环（步数/消耗/时长）+ 中心完成度 + 图例',
    icon: Activity,
    defaultProps: {
      steps: 86,
      burn: 64,
      duration: 42,
      centerValue: '78%',
      centerLabel: '今日目标',
    },
    fields: [
      { key: 'steps', label: '步数环进度 (%)', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'burn', label: '消耗环进度 (%)', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'duration', label: '时长环进度 (%)', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'centerValue', label: '中心数值', type: 'text' },
      { key: 'centerLabel', label: '中心标签', type: 'text' },
    ],
    render: (p) => {
      const pcts = [p.steps, p.burn, p.duration].map((v) => clamp(Math.round(Number(v) || 0), 0, 100));
      const labels = ['步数', '消耗', '时长'];
      return (
        <div className="w-card flex items-center gap-4 p-4" style={{ borderRadius: 'var(--pr)' }}>
          <div className="relative size-28 shrink-0">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
              {RING_RADII.map((r, i) => {
                const len = 2 * Math.PI * r;
                return (
                  <g key={i}>
                    <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="none"
                      stroke={RING_COLORS[i]}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(pcts[i] / 100) * len} ${len}`}
                    />
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold leading-none tracking-tight">{p.centerValue}</span>
              <span className="mt-1 text-[9px] opacity-45">{p.centerLabel}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-2.5">
            {labels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: RING_COLORS[i] }} />
                <span className="min-w-0 flex-1 truncate text-[11px] opacity-60">{label}</span>
                <span className="shrink-0 text-[11px] font-bold">{pcts[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'fitness.steps-card',
    category: 'fitness',
    name: '今日步数卡',
    desc: '大数字步数 + 7 天迷你柱状图 + 目标进度条',
    icon: Footprints,
    defaultProps: {
      today: '8,426',
      goal: '10,000',
      values: '5230,6810,9452,7180,8764,10230,8426',
      labels: '一,二,三,四,五,六,日',
    },
    fields: [
      { key: 'today', label: '今日步数', type: 'text' },
      { key: 'goal', label: '每日目标（步）', type: 'text' },
      { key: 'values', label: '近 7 天步数（逗号分隔）', type: 'textarea' },
      { key: 'labels', label: '星期标签（逗号分隔）', type: 'textarea' },
    ],
    render: (p) => {
      const vals = numList(p.values);
      const labels = splitList(p.labels);
      const max = Math.max(...vals, 1);
      const today = looseNum(p.today) || vals[vals.length - 1] || 0;
      const goal = looseNum(p.goal) || 1;
      const pct = clamp(Math.round((today / goal) * 100), 0, 100);
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Footprints className="size-3.5" style={{ color: 'var(--p)' }} />
                <span className="text-[11px] opacity-55">今日步数</span>
              </div>
              <div className="mt-1 text-[26px] font-extrabold leading-none tracking-tight">{p.today}</div>
            </div>
            <span className="w-chip rounded-full px-2 py-1 text-[10px] font-semibold" style={{ color: 'var(--p)' }}>
              目标 {p.goal}
            </span>
          </div>
          {/* 7 天迷你柱状图（最后一根 = 今日，主色高亮） */}
          <div className="mt-3 flex h-16 items-end gap-1.5">
            {vals.map((v, i) => {
              const last = i === vals.length - 1;
              return (
                <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  <span
                    className={`w-full ${last ? '' : 'w-chip'}`}
                    style={{
                      height: `${Math.max(8, (v / max) * 100)}%`,
                      borderRadius: '3px 3px 0 0',
                      background: last ? 'var(--p)' : undefined,
                    }}
                  />
                  <span className={`text-[9px] leading-none ${last ? 'font-bold' : 'opacity-35'}`}>
                    {labels[i] ?? i + 1}
                  </span>
                </div>
              );
            })}
          </div>
          {/* 目标进度条 */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden" style={{ borderRadius: '999px' }}>
              <div
                className="h-full"
                style={{
                  width: `${Math.max(4, pct)}%`,
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, var(--p), color-mix(in srgb, var(--p) 55%, #fff))',
                }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-bold" style={{ color: 'var(--p)' }}>{pct}%</span>
          </div>
        </div>
      );
    },
  },
  {
    type: 'fitness.workout-item',
    category: 'fitness',
    name: '训练动作条目',
    desc: '序号圆徽 + 动作名 + 组数×次数 + 教学视频入口',
    icon: Dumbbell,
    defaultProps: {
      index: 1,
      name: '哑铃卧推',
      sets: '3 组 × 12 次',
      rest: '组间休息 60 秒',
      video: true,
    },
    fields: [
      { key: 'index', label: '动作序号', type: 'number', min: 1, max: 20, step: 1 },
      { key: 'name', label: '动作名称', type: 'text' },
      { key: 'sets', label: '组数 × 次数', type: 'text' },
      { key: 'rest', label: '休息说明', type: 'text' },
      { key: 'video', label: '显示视频图标', type: 'switch' },
    ],
    Interactive: WorkoutItemInteractive,
    render: (p) => {
      const idx = clamp(Math.round(Number(p.index) || 1), 1, 99);
      return (
        <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold"
            style={{ background: 'var(--p)', color: 'var(--pf)' }}
          >
            {idx}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold">{p.name}</div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] opacity-50">
              <span className="shrink-0">{p.sets}</span>
              {p.rest ? <><span className="opacity-40">·</span><span className="truncate">{p.rest}</span></> : null}
            </div>
          </div>
          {p.video !== false ? (
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'color-mix(in srgb, var(--p) 12%, transparent)', color: 'var(--p)' }}
            >
              <MonitorPlay className="size-4" />
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    type: 'fitness.plan-card',
    category: 'fitness',
    name: '训练计划卡',
    desc: '渐变封面 + 难度芯片 + 周数/时长/频次 + 开始按钮',
    icon: CalendarDays,
    defaultProps: {
      title: '14 天燃脂塑形计划',
      level: '进阶',
      weeks: '4 周',
      duration: '20 分钟/次',
      freq: '5 次/周',
    },
    fields: [
      { key: 'title', label: '计划名称', type: 'text' },
      { key: 'level', label: '难度', type: 'select', options: [
        { label: '入门', value: '入门' },
        { label: '进阶', value: '进阶' },
        { label: '挑战', value: '挑战' },
      ] },
      { key: 'weeks', label: '计划周期', type: 'text' },
      { key: 'duration', label: '单次时长', type: 'text' },
      { key: 'freq', label: '训练频次', type: 'text' },
    ],
    Interactive: PlanCardInteractive,
    render: (p) => {
      const levelStyle: Record<string, { fg: string; bg: string }> = {
        '入门': { fg: C_GREEN, bg: 'color-mix(in srgb, #10b981 16%, transparent)' },
        '进阶': { fg: C_AMBER, bg: 'color-mix(in srgb, #f59e0b 18%, transparent)' },
        '挑战': { fg: C_ROSE, bg: 'color-mix(in srgb, #f43f5e 16%, transparent)' },
      };
      const lv = levelStyle[p.level] ?? levelStyle['入门'];
      return (
        <div className="w-card overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
          {/* 封面占位：主色 color-mix 渐变 + 装饰圆 + 图标 */}
          <div
            className="relative h-28 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #000))',
            }}
          >
            <span className="absolute -right-5 -top-7 size-24 rounded-full bg-white opacity-10" />
            <span className="absolute -bottom-8 left-9 size-20 rounded-full bg-white opacity-[0.07]" />
            <span
              className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: lv.bg, color: '#fff' }}
            >
              {p.level}
            </span>
            <Dumbbell className="absolute bottom-3 right-4 size-12 text-white opacity-25" />
            <div className="absolute bottom-3 left-4 right-24">
              <div className="truncate text-[15px] font-extrabold text-white">{p.title}</div>
            </div>
          </div>
          <div className="p-3.5">
            {/* 周数 / 时长 / 频次 元信息 */}
            <div className="flex items-center justify-between text-[11px] opacity-60">
              <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{p.weeks}</span>
              <span className="flex items-center gap-1"><Timer className="size-3.5" />{p.duration}</span>
              <span className="flex items-center gap-1"><Zap className="size-3.5" />{p.freq}</span>
            </div>
            <button
              className="mt-3 flex w-full items-center justify-center gap-1.5 py-2.5 text-[13px] font-bold"
              style={{ background: 'var(--p)', color: 'var(--pf)', borderRadius: 'calc(var(--pr) - 4px)' }}
            >
              <Play className="size-3.5" />
              开始训练
            </button>
          </div>
        </div>
      );
    },
  },
  {
    type: 'fitness.calories-ring',
    category: 'fitness',
    name: '热量平衡卡',
    desc: '摄入/消耗左右对比条 + 净热量缺口与剩余提示',
    icon: Flame,
    defaultProps: {
      intake: 1850,
      burn: 1230,
      note: '还可摄入 620 千卡达成平衡',
    },
    fields: [
      { key: 'intake', label: '今日摄入（千卡）', type: 'number', min: 0, max: 4000, step: 10 },
      { key: 'burn', label: '今日消耗（千卡）', type: 'number', min: 0, max: 4000, step: 10 },
      { key: 'note', label: '底部提示', type: 'text' },
    ],
    render: (p) => {
      const intake = clamp(Math.round(Number(p.intake) || 0), 0, 99999);
      const burn = clamp(Math.round(Number(p.burn) || 0), 0, 99999);
      const max = Math.max(intake, burn, 1);
      const gap = intake - burn;
      const rows = [
        { icon: UtensilsCrossed, label: '摄入', value: intake, color: 'var(--p)' },
        { icon: Flame, label: '消耗', value: burn, color: C_ROSE },
      ];
      return (
        <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[13px] font-bold">
              <Flame className="size-4" style={{ color: 'var(--p)' }} />
              热量平衡
            </span>
            <span className="text-[10px] opacity-40">今日</span>
          </div>
          {/* 净热量大数字 */}
          <div className="mt-2 flex items-end gap-1.5">
            <span className="text-2xl font-extrabold leading-none tracking-tight" style={{ color: 'var(--p)' }}>
              {gap > 0 ? '+' : ''}{gap}
            </span>
            <span className="pb-0.5 text-[10px] opacity-45">千卡 {gap > 0 ? '盈余' : '缺口'}</span>
          </div>
          {/* 摄入 / 消耗 左右对比条 */}
          <div className="mt-3 space-y-2.5">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-2.5">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in srgb, ${row.color} 14%, transparent)`, color: row.color }}
                >
                  <row.icon className="size-3.5" />
                </span>
                <span className="w-7 shrink-0 text-[11px] opacity-60">{row.label}</span>
                <div className="h-2.5 min-w-0 flex-1 overflow-hidden" style={{ borderRadius: '999px' }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.max(5, (row.value / max) * 100)}%`,
                      borderRadius: '999px',
                      background: `linear-gradient(90deg, ${row.color}, color-mix(in srgb, ${row.color} 55%, #fff))`,
                    }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-[11px] font-bold">{row.value}</span>
              </div>
            ))}
          </div>
          {p.note ? (
            <div className="mt-3 border-t w-line pt-2.5 text-[11px] opacity-55">{p.note}</div>
          ) : null}
        </div>
      );
    },
  },
  {
    type: 'fitness.water-tracker',
    category: 'fitness',
    name: '喝水打卡',
    desc: '水杯格子打卡（前 N 杯主色填充）+ 补水量进度',
    icon: Droplets,
    defaultProps: {
      count: 8,
      done: 5,
      cupSize: '250 ml',
    },
    fields: [
      { key: 'count', label: '目标杯数', type: 'number', min: 4, max: 12, step: 1 },
      { key: 'done', label: '已喝杯数', type: 'number', min: 0, max: 12, step: 1 },
      { key: 'cupSize', label: '每杯容量', type: 'text' },
    ],
    Interactive: WaterTrackerInteractive,
    render: (p) => {
      const count = clamp(Math.round(Number(p.count) || 8), 4, 12);
      const done = clamp(Math.round(Number(p.done) || 0), 0, count);
      const cupMl = looseNum(p.cupSize) || 250;
      const pct = Math.round((done / count) * 100);
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[13px] font-bold">
              <Droplets className="size-4" style={{ color: 'var(--p)' }} />
              今日喝水
            </span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--p)' }}>
              {done}<span className="font-normal opacity-40"> / {count} 杯</span>
            </span>
          </div>
          {/* 水杯格子 */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Array.from({ length: count }).map((_, i) => {
              const filled = i < done;
              return (
                <div
                  key={i}
                  className={`flex h-11 flex-col items-center justify-center gap-0.5 ${filled ? '' : 'w-chip'}`}
                  style={{
                    borderRadius: 'calc(var(--pr) - 4px)',
                    background: filled ? 'var(--p)' : undefined,
                  }}
                >
                  <GlassWater className={`size-4 ${filled ? '' : 'opacity-30'}`} style={filled ? { color: 'var(--pf)' } : undefined} />
                  <span className={`text-[8px] leading-none ${filled ? '' : 'opacity-30'}`} style={filled ? { color: 'var(--pf)' } : undefined}>
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
          {/* 补水量进度 */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden" style={{ borderRadius: '999px' }}>
              <div
                className="h-full"
                style={{ width: `${Math.max(3, pct)}%`, borderRadius: '999px', background: 'var(--p)' }}
              />
            </div>
            <span className="shrink-0 text-[10px] opacity-45">
              {done * cupMl} / {count * cupMl} ml
            </span>
          </div>
        </div>
      );
    },
  },
  {
    type: 'fitness.sleep-chart',
    category: 'fitness',
    name: '睡眠时长图',
    desc: '7 天睡眠柱状图（达标主色）+ 目标虚线 + 平均时长',
    icon: Moon,
    defaultProps: {
      values: '6.5,7.8,7.2,6.1,8.0,7.5,7.3',
      labels: '一,二,三,四,五,六,日',
      goal: 7,
    },
    fields: [
      { key: 'values', label: '每日时长（小时，逗号分隔）', type: 'textarea' },
      { key: 'labels', label: '星期标签（逗号分隔）', type: 'textarea' },
      { key: 'goal', label: '目标时长（小时）', type: 'number', min: 4, max: 12, step: 0.5 },
    ],
    render: (p) => {
      const vals = numList(p.values);
      const labels = splitList(p.labels);
      const goal = Number(p.goal) || 7;
      const max = Math.max(...vals, goal, 1);
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[13px] font-bold">
              <Moon className="size-4" style={{ color: 'var(--p)' }} />
              睡眠时长
            </span>
            <span className="text-[11px] opacity-55">
              平均 <span className="font-bold" style={{ color: 'var(--p)' }}>{avg.toFixed(1)}</span> 小时
            </span>
          </div>
          <div className="relative mt-3">
            {/* 目标虚线 */}
            <div
              className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
              style={{ bottom: `${(goal / max) * 100 * 0.86 + 14}%` }}
            >
              <span className="h-0 flex-1 border-t border-dashed border-current opacity-25" />
              <span className="w-chip ml-1 rounded px-1 py-0.5 text-[8px] leading-none opacity-60">目标 {goal}h</span>
            </div>
            <div className="flex h-24 items-end gap-2">
              {vals.map((v, i) => {
                const ok = v >= goal;
                return (
                  <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                    <span className={`text-[8px] leading-none ${ok ? 'font-bold' : 'opacity-35'}`} style={ok ? { color: 'var(--p)' } : undefined}>
                      {v}
                    </span>
                    <span
                      className={`w-full ${ok ? '' : 'bg-current opacity-15'}`}
                      style={{
                        height: `${Math.max(8, (v / max) * 86)}%`,
                        borderRadius: '4px 4px 0 0',
                        background: ok ? 'var(--p)' : undefined,
                      }}
                    />
                    <span className={`text-[9px] leading-none ${ok ? 'font-bold' : 'opacity-40'}`}>
                      {labels[i] ?? i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    type: 'fitness.weight-log',
    category: 'fitness',
    name: '体重记录',
    desc: '当前体重大数字 + 较上周涨跌芯片 + 迷你折线图',
    icon: Scale,
    defaultProps: {
      current: '62.5',
      delta: '0.8',
      down: true,
      values: '63.8,63.5,63.9,63.2,62.8,63.0,62.5',
    },
    fields: [
      { key: 'current', label: '当前体重（kg）', type: 'text' },
      { key: 'delta', label: '较上周变化（kg）', type: 'text' },
      { key: 'down', label: '体重下降', type: 'switch' },
      { key: 'values', label: '历史记录（逗号分隔）', type: 'textarea' },
    ],
    render: (p) => {
      const vals = numList(p.values);
      while (vals.length < 2) vals.push(vals[vals.length - 1] ?? 0);
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      const W = 280, H = 64, PX = 6, PY = 8;
      const span = Math.max(max - min, 0.5);
      const x = (i: number) => PX + (i * (W - 2 * PX)) / (vals.length - 1);
      const y = (v: number) => H - PY - ((v - min) / span) * (H - 2 * PY);
      const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
      const down = p.down !== false;
      const c = down ? C_GREEN : C_ROSE;
      return (
        <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center gap-1.5">
            <Scale className="size-4" style={{ color: 'var(--p)' }} />
            <span className="text-[13px] font-bold">体重记录</span>
          </div>
          <div className="mt-2 flex items-end gap-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold leading-none tracking-tight">{p.current}</span>
              <span className="text-[11px] opacity-45">kg</span>
            </div>
            <span
              className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[10px] font-bold leading-none"
              style={{ background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c }}
            >
              {down ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
              {p.delta} kg
            </span>
            <span className="pb-0.5 text-[10px] opacity-40">较上周</span>
          </div>
          {/* 迷你折线 */}
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full">
            <polyline
              points={pts}
              fill="none"
              stroke="var(--p)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {vals.map((v, i) => (
              <circle
                key={i}
                cx={x(i)}
                cy={y(v)}
                r={i === vals.length - 1 ? 3.5 : 2.2}
                fill="var(--p)"
                opacity={i === vals.length - 1 ? 1 : 0.45}
              />
            ))}
          </svg>
        </div>
      );
    },
  },
  {
    type: 'fitness.community-post',
    category: 'fitness',
    name: '社区动态卡',
    desc: '运动社区动态：头像 + 昵称 + 文案 + 点赞/评论/分享',
    icon: MessageCircle,
    defaultProps: {
      nickname: '晨跑打卡中',
      time: '12 分钟前',
      tag: '跑步打卡',
      content: '今天终于完成人生第一个 10 公里！最后 1 公里全靠意志力撑住，配速稳进 6 分内，继续加油！',
      likes: '326',
      comments: '48',
    },
    fields: [
      { key: 'nickname', label: '昵称', type: 'text' },
      { key: 'time', label: '发布时间', type: 'text' },
      { key: 'tag', label: '话题标签', type: 'text' },
      { key: 'content', label: '动态文案', type: 'textarea' },
      { key: 'likes', label: '点赞数', type: 'text' },
      { key: 'comments', label: '评论数', type: 'text' },
    ],
    Interactive: CommunityPostInteractive,
    render: (p) => (
      <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
        <div className="flex items-center gap-2.5">
          {/* 头像占位：主色渐变 + 图标 */}
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #000))' }}
          >
            <UserRound className="size-5" style={{ color: 'var(--pf)' }} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-bold">{p.nickname}</span>
              <span
                className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none"
                style={{ background: 'color-mix(in srgb, var(--p) 12%, transparent)', color: 'var(--p)' }}
              >
                {p.tag}
              </span>
            </div>
            <div className="mt-0.5 text-[10px] opacity-40">{p.time}</div>
          </div>
        </div>
        <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed opacity-80">{p.content}</p>
        {/* 点赞 / 评论 */}
        <div className="mt-3 flex items-center gap-5 border-t w-line pt-2.5 text-[11px] opacity-55">
          <span className="flex items-center gap-1"><Heart className="size-3.5" style={{ color: C_ROSE }} />{p.likes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="size-3.5" />{p.comments}</span>
          <span className="ml-auto flex items-center opacity-60">
            <ChevronRight className="size-3.5" />
          </span>
        </div>
      </div>
    ),
  },
  {
    type: 'fitness.coach-card',
    category: 'fitness',
    name: '教练名片卡',
    desc: '圆形头像占位 + 姓名/头衔 + 评分 + 主色预约按钮',
    icon: UserRound,
    defaultProps: {
      name: '李思远',
      title: '国家级健身教练 · 8 年经验',
      rating: '4.9',
      students: '已指导 1,200+ 学员',
      action: '立即预约',
    },
    fields: [
      { key: 'name', label: '教练姓名', type: 'text' },
      { key: 'title', label: '头衔简介', type: 'text' },
      { key: 'rating', label: '评分', type: 'text' },
      { key: 'students', label: '学员规模', type: 'text' },
      { key: 'action', label: '按钮文字', type: 'text' },
    ],
    Interactive: CoachCardInteractive,
    render: (p) => (
      <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
        <div className="flex items-center gap-3">
          {/* 头像占位：主色渐变 + 图标 */}
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #000))' }}
          >
            <UserRound className="size-7" style={{ color: 'var(--pf)' }} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-[14px] font-extrabold">{p.name}</span>
              <BadgeCheck className="size-4 shrink-0" style={{ color: C_AMBER }} />
            </div>
            <div className="mt-0.5 truncate text-[11px] opacity-50">{p.title}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <Star className="size-3" style={{ color: C_AMBER, fill: C_AMBER }} />
              <span className="font-bold">{p.rating}</span>
              <span className="text-[10px] opacity-40">综合评分</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t w-line pt-3">
          <span className="text-[11px] opacity-50">{p.students}</span>
          <span
            className="flex items-center gap-1 px-3.5 py-1.5 text-[12px] font-bold"
            style={{ background: 'var(--p)', color: 'var(--pf)', borderRadius: '999px' }}
          >
            <CalendarCheck className="size-3.5" />
            {p.action}
          </span>
        </div>
      </div>
    ),
  },
  {
    type: 'fitness.marathon-item',
    category: 'fitness',
    name: '赛事条目',
    desc: '日期块 + 赛事标题 + 地点 + 报名状态芯片',
    icon: Medal,
    defaultProps: {
      month: '10月',
      day: '26',
      title: '城市半程马拉松',
      location: '滨江公园起点广场',
      status: '报名中',
    },
    fields: [
      { key: 'month', label: '月份', type: 'text' },
      { key: 'day', label: '日期', type: 'text' },
      { key: 'title', label: '赛事名称', type: 'text' },
      { key: 'location', label: '举办地点', type: 'text' },
      { key: 'status', label: '报名状态', type: 'select', options: [
        { label: '报名中', value: '报名中' },
        { label: '即将开跑', value: '即将开跑' },
        { label: '已满员', value: '已满员' },
        { label: '已结束', value: '已结束' },
      ] },
    ],
    Interactive: MarathonItemInteractive,
    render: (p) => {
      const st = RACE_STATUS[p.status] ?? RACE_STATUS['报名中'];
      return (
        <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
          {/* 日期块 */}
          <div className="w-chip flex w-[52px] shrink-0 flex-col items-center justify-center rounded-xl py-2">
            <span className="text-[9px] leading-none opacity-50">{p.month}</span>
            <span className="mt-1 text-lg font-extrabold leading-none" style={{ color: 'var(--p)' }}>{p.day}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold">{p.title}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] opacity-50">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{p.location}</span>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold leading-none"
            style={{ background: st.bg, color: st.fg, opacity: p.status === '已结束' ? 0.55 : undefined }}
          >
            {p.status}
          </span>
        </div>
      );
    },
  },
  {
    type: 'fitness.stats-weekly',
    category: 'fitness',
    name: '周运动统计',
    desc: '2×2 统计格：运动次数 / 时长 / 消耗 / 里程',
    icon: LayoutGrid,
    defaultProps: {
      title: '本周运动概览',
      sessions: '5 次',
      duration: '320 分钟',
      calories: '2,860 千卡',
      distance: '42.5 公里',
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'sessions', label: '运动次数', type: 'text' },
      { key: 'duration', label: '总时长', type: 'text' },
      { key: 'calories', label: '总消耗', type: 'text' },
      { key: 'distance', label: '总里程', type: 'text' },
    ],
    Interactive: StatsWeeklyInteractive,
    render: (p) => {
      const cells = [
        { icon: Dumbbell, label: '运动次数', value: p.sessions },
        { icon: Timer, label: '运动时长', value: p.duration },
        { icon: Flame, label: '消耗热量', value: p.calories },
        { icon: Route, label: '运动里程', value: p.distance },
      ];
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">{p.title}</span>
            <span className="flex items-center text-[10px] opacity-40">
              查看报告
              <ChevronRight className="size-3" />
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {cells.map((cell) => (
              <div key={cell.label} className="w-chip rounded-xl p-3" style={{ borderRadius: 'calc(var(--pr) - 4px)' }}>
                <span
                  className="flex size-8 items-center justify-center rounded-lg"
                  style={{ background: 'color-mix(in srgb, var(--p) 12%, transparent)', color: 'var(--p)' }}
                >
                  <cell.icon className="size-4" />
                </span>
                <div className="mt-2 text-[10px] opacity-45">{cell.label}</div>
                <div className="mt-0.5 truncate text-[15px] font-extrabold leading-tight">{cell.value}</div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
];
