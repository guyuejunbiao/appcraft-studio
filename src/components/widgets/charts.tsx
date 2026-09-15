import {
  ChartColumn, ChartBar, ChartLine, ChartPie, CircleDashed, TrendingUp,
  Trophy, Grid3x3, Gauge, Columns3, ArrowUp, ArrowDown,
} from 'lucide-react';
import type { WidgetDef } from '@/lib/widget-types';

/**
 * 数据图表 组件库（目录：charts）
 * 与 login.tsx 同一套规范：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 图表全部为纯静态 markup（div / 内联 SVG / conic-gradient），无 hooks、无外部请求；
 * 辅助色仅用 emerald / rose / amber，禁止蓝色系；render 为纯函数。
 */

/** 逗号（中英文）分隔 → 字符串数组（去空白项） */
const splitList = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,]/).map((s) => s.trim()).filter(Boolean);

/** 逗号分隔 → 数值数组（非法项按 0 处理） */
const numList = (raw: unknown): number[] =>
  splitList(raw).map((s) => (Number.isFinite(Number(s)) ? Number(s) : 0));

/** 「标签 空格 值」的列表解析 */
const pairList = (raw: unknown): { label: string; value: number }[] =>
  splitList(raw).map((item) => {
    const [label, ...rest] = item.trim().split(/\s+/);
    return { label, value: Number(rest[0]) || 0 };
  });

/** 数字钳制 */
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** 饼图三色：主色 / 玫红 / amber */
const PIE_COLORS = ['var(--p)', '#f43f5e', '#f59e0b'];

/** 领奖台头像渐变：金 / 银 / 铜 */
const MEDAL_GRADS: Record<number, string> = {
  1: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  2: 'linear-gradient(135deg, #a1a1aa, #d4d4d8)',
  3: 'linear-gradient(135deg, #f97316, #fdba74)',
};

/** 热力格 0~4 档 → 主色占比 */
const HEAT_OPS = [8, 24, 45, 68, 92];

/** 热力格演示纹理（35 格，各 0~4 档的相对偏移基准） */
const HEAT_PATTERN = [
  2, 3, 1, 4, 0, 3, 2,
  4, 1, 2, 3, 0, 1, 4,
  1, 4, 3, 2, 1, 0, 3,
  3, 0, 2, 4, 1, 3, 2,
  0, 2, 4, 1, 3, 4, 1,
];

export const widgets: WidgetDef[] = [
  {
    type: 'chart.bar-group',
    category: 'charts',
    name: '柱状图',
    desc: '7 根竖柱 + 星期标签，可指定高亮柱',
    icon: ChartColumn,
    defaultProps: {
      title: '本周活跃用户 (万)',
      values: '32,45,28,56,40,61,38',
      labels: '一,二,三,四,五,六,日',
      highlightIndex: 3,
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'values', label: '数值（逗号分隔）', type: 'textarea' },
      { key: 'labels', label: '底部标签（逗号分隔）', type: 'textarea' },
      { key: 'highlightIndex', label: '高亮柱序号', type: 'number', min: 0, max: 6, step: 1 },
    ],
    render: (p) => {
      const vals = numList(p.values);
      const labels = splitList(p.labels);
      const hi = clamp(Math.round(Number(p.highlightIndex) || 0), 0, Math.max(0, vals.length - 1));
      const max = Math.max(...vals, 1);
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">{p.title}</span>
            <span className="text-[10px] opacity-40">近 7 天</span>
          </div>
          <div className="mt-3 flex h-28 items-end gap-2">
            {vals.map((v, i) => (
              <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                <span
                  className={`w-full ${i === hi ? '' : 'w-chip'}`}
                  style={{
                    height: `${Math.max(8, (v / max) * 100)}%`,
                    borderRadius: '4px 4px 0 0',
                    background: i === hi ? 'var(--p)' : undefined,
                  }}
                />
                <span
                  className={`text-[10px] leading-none ${i === hi ? 'font-bold' : 'opacity-40'}`}
                  style={i === hi ? { color: 'var(--p)' } : undefined}
                >
                  {labels[i] ?? i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'chart.h-bar',
    category: 'charts',
    name: '横向条形图',
    desc: '标签 + 主色渐变横条 + 右端数值',
    icon: ChartBar,
    defaultProps: {
      title: '各地区销售额占比',
      items: '华东区 86,华南区 72,华北区 58,西南区 43',
      unit: '万元',
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'items', label: '数据（标签 空格 数值，逗号分隔）', type: 'textarea', placeholder: '4~5 行' },
      { key: 'unit', label: '单位', type: 'text' },
    ],
    render: (p) => {
      const rows = pairList(p.items).slice(0, 5);
      const max = Math.max(...rows.map((r) => r.value), 1);
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">{p.title}</span>
            <span className="text-[10px] opacity-40">{p.unit}</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-12 shrink-0 truncate text-[11px] opacity-60">{row.label}</span>
                <div className="h-3.5 min-w-0 flex-1 overflow-hidden" style={{ borderRadius: '999px' }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.max(6, (row.value / max) * 100)}%`,
                      borderRadius: '999px',
                      background: 'linear-gradient(90deg, var(--p), color-mix(in srgb, var(--p) 50%, #fff))',
                    }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-[11px] font-bold" style={{ color: 'var(--p)' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'chart.line-area',
    category: 'charts',
    name: '折线面积图',
    desc: '内联 SVG 折线 + 渐变面积 + 数据圆点',
    icon: ChartLine,
    defaultProps: { title: '7 日新增订阅', values: '12,18,15,26,21,30,36', unit: '人' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'values', label: '数值（逗号分隔）', type: 'textarea' },
      { key: 'unit', label: '单位', type: 'text' },
    ],
    render: (p) => {
      const vals = numList(p.values);
      while (vals.length < 2) vals.push(vals[vals.length - 1] ?? 0);
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      const W = 300, H = 110, PX = 8, PY = 14;
      const span = Math.max(max - min, 1);
      const x = (i: number) => PX + (i * (W - 2 * PX)) / (vals.length - 1);
      const y = (v: number) => H - PY - ((v - min) / span) * (H - 2 * PY);
      const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
      const area = `${x(0)},${H - PY} ${pts} ${x(vals.length - 1)},${H - PY}`;
      const cur = vals[vals.length - 1];
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-end justify-between">
            <span className="text-[13px] font-bold">{p.title}</span>
            <span className="text-xl font-extrabold leading-none" style={{ color: 'var(--p)' }}>
              {cur}
              <span className="ml-0.5 text-[10px] font-normal opacity-45">{p.unit}</span>
            </span>
          </div>
          <svg viewBox="0 0 300 110" className="mt-2 h-auto w-full">
            <defs>
              <linearGradient id="ac-line-area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--p)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--p)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polygon points={area} fill="url(#ac-line-area-fill)" />
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
                r={i === vals.length - 1 ? 3.5 : 2.5}
                fill="var(--p)"
                opacity={i === vals.length - 1 ? 1 : 0.55}
              />
            ))}
          </svg>
        </div>
      );
    },
  },
  {
    type: 'chart.pie',
    category: 'charts',
    name: '饼图',
    desc: 'conic-gradient 圆环 + 中心总数 + 图例',
    icon: ChartPie,
    defaultProps: {
      items: '直接访问 46,搜索引荐 32,社交媒体 22',
      total: '12.8万',
    },
    fields: [
      { key: 'items', label: '数据（名称 空格 百分比，逗号分隔）', type: 'textarea', placeholder: '最多 3 项' },
      { key: 'total', label: '中心总数', type: 'text' },
    ],
    render: (p) => {
      const rows = pairList(p.items).slice(0, 3);
      // 归一化为 conic-gradient 区间
      let acc = 0;
      const stops = rows.map((row, i) => {
        const from = acc;
        acc = i === rows.length - 1 ? 100 : Math.min(100, acc + row.value);
        return `${PIE_COLORS[i]} ${from}% ${acc}%`;
      });
      return (
        <div className="w-card flex items-center gap-4 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          {/* donut：中心洞用 w-card 自适应表面 */}
          <div
            className="relative size-24 shrink-0 rounded-full"
            style={{ background: `conic-gradient(${stops.join(', ')})` }}
          >
            <div className="w-card absolute inset-[14px] flex flex-col items-center justify-center rounded-full">
              <span className="text-sm font-extrabold leading-none">{p.total}</span>
              <span className="mt-0.5 text-[9px] opacity-45">总计</span>
            </div>
          </div>
          {/* 图例 3 行 */}
          <div className="min-w-0 flex-1 space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="min-w-0 flex-1 truncate text-[11px] opacity-65">{row.label}</span>
                <span className="shrink-0 text-[11px] font-bold">{row.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'chart.donut-progress',
    category: 'charts',
    name: '环形进度',
    desc: 'conic-gradient 主色环 + 中心大百分比',
    icon: CircleDashed,
    defaultProps: { title: '今日步数完成率', percent: 72, note: '还差 2,160 步达成目标' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'percent', label: '进度 (%)', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'note', label: '底部小字', type: 'text' },
    ],
    render: (p) => {
      const pct = clamp(Math.round(Number(p.percent) || 0), 0, 100);
      return (
        <div className="w-card flex items-center gap-4 p-4" style={{ borderRadius: 'var(--pr)' }}>
          <div
            className="relative size-24 shrink-0 rounded-full"
            style={{
              background: `conic-gradient(var(--p) 0% ${pct}%, color-mix(in srgb, currentColor 8%, transparent) ${pct}% 100%)`,
            }}
          >
            <div className="w-card absolute inset-[12px] flex items-center justify-center rounded-full">
              <span className="text-xl font-extrabold leading-none" style={{ color: 'var(--p)' }}>
                {pct}
                <span className="text-[11px]">%</span>
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{p.title}</div>
            <div className="mt-1 text-[11px] leading-4 opacity-50">{p.note}</div>
          </div>
        </div>
      );
    },
  },
  {
    type: 'chart.kpi-card',
    category: 'charts',
    name: '指标卡',
    desc: '超大数字 + 涨跌 chip + 同比小字',
    icon: TrendingUp,
    defaultProps: { title: '今日营收 (元)', value: '86,420', delta: '+12.4%', up: true, yoy: '同比上周增长 8.2%' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'value', label: '数值', type: 'text' },
      { key: 'delta', label: '涨跌幅度', type: 'text' },
      { key: 'up', label: '上涨趋势', type: 'switch' },
      { key: 'yoy', label: '同比小字', type: 'text' },
    ],
    render: (p) => {
      const up = p.up !== false;
      const c = up ? '#10b981' : '#f43f5e';
      return (
        <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
          <span className="text-xs opacity-55">{p.title}</span>
          <div className="mt-1.5 flex items-end gap-2.5">
            <span className="text-3xl font-extrabold leading-none tracking-tight">{p.value}</span>
            <span
              className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[11px] font-bold leading-none"
              style={{ background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c }}
            >
              {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {p.delta}
            </span>
          </div>
          <div className="mt-2 text-[11px] opacity-45">{p.yoy}</div>
        </div>
      );
    },
  },
  {
    type: 'chart.rank-top',
    category: 'charts',
    name: '排行榜 TOP3',
    desc: '领奖台式三列，第 1 名主色底最高',
    icon: Trophy,
    defaultProps: {
      title: '本周销售之星',
      items: '云图数据 9850,凌波科技 8720,格物传媒 7640',
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'items', label: '榜单（名称 空格 数值，逗号分隔）', type: 'textarea', placeholder: '3 项，按名次排序' },
    ],
    render: (p) => {
      const rows = pairList(p.items).slice(0, 3);
      while (rows.length < 3) rows.push({ label: '待上榜', value: 0 });
      // 屏幕列序：2 - 1 - 3
      const order: number[] = [1, 0, 2];
      const ranks: number[] = [2, 1, 3];
      const heights: Record<number, string> = { 1: 'h-16', 2: 'h-11', 3: 'h-8' };
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center gap-1.5">
            <Trophy className="size-4" style={{ color: 'var(--p)' }} />
            <span className="text-[13px] font-bold">{p.title}</span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            {order.map((rankIdx, col) => {
              const row = rows[rankIdx];
              const rank = ranks[col];
              const first = rank === 1;
              return (
                <div key={rank} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span
                    className="flex size-9 items-center justify-center rounded-full text-xs font-extrabold text-white"
                    style={{ background: MEDAL_GRADS[rank] }}
                  >
                    {String(row.label).trim().charAt(0) || '榜'}
                  </span>
                  <span className="max-w-full truncate text-[11px] font-semibold">{row.label}</span>
                  <span
                    className={`text-[10px] leading-none ${first ? 'font-bold' : 'opacity-50'}`}
                    style={first ? { color: 'var(--p)' } : undefined}
                  >
                    {row.value}
                  </span>
                  <span
                    className={`flex w-full ${heights[rank]} items-start justify-center rounded-t-md pt-1 text-base font-extrabold leading-none ${first ? '' : 'w-chip'}`}
                    style={first ? { background: 'var(--p)', color: 'var(--pf)' } : undefined}
                  >
                    <span className={first ? '' : 'opacity-45'}>{rank}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  },
  {
    type: 'chart.heatmap',
    category: 'charts',
    name: '日历热力格',
    desc: '7 列 × 5 行色块，0~4 档主色色阶',
    icon: Grid3x3,
    defaultProps: { title: '近 5 周学习打卡', level: 2 },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'level', label: '基准热力档位', type: 'number', min: 0, max: 4, step: 1 },
    ],
    render: (p) => {
      const base = clamp(Math.round(Number(p.level) || 0), 0, 4);
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">{p.title}</span>
            {/* 小图例 */}
            <span className="flex items-center gap-1 text-[9px] opacity-40">
              少
              {HEAT_OPS.map((op, i) => (
                <span
                  key={i}
                  className="size-2 rounded-[2px]"
                  style={{ background: `color-mix(in srgb, var(--p) ${op}%, transparent)` }}
                />
              ))}
              多
            </span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {HEAT_PATTERN.map((off, i) => {
              const lv = clamp(base + off - 2, 0, 4);
              return (
                <span
                  key={i}
                  className="aspect-square rounded-[4px]"
                  style={{ background: `color-mix(in srgb, var(--p) ${HEAT_OPS[lv]}%, transparent)` }}
                />
              );
            })}
          </div>
        </div>
      );
    },
  },
  {
    type: 'chart.gauge',
    category: 'charts',
    name: '仪表盘',
    desc: '半圆 SVG 弧 + 中心数值 + 刻度小字',
    icon: Gauge,
    defaultProps: { title: '系统健康度', percent: 78, unit: '分' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'percent', label: '进度 (%)', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'unit', label: '单位', type: 'text' },
    ],
    render: (p) => {
      const pct = clamp(Math.round(Number(p.percent) || 0), 0, 100);
      const LEN = Math.PI * 40; // r=40 半弧长
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <span className="text-[13px] font-bold">{p.title}</span>
          <div className="relative mx-auto mt-2 w-4/5">
            <svg viewBox="0 0 100 56" className="h-auto w-full">
              {/* 底灰轨道 */}
              <path d="M 10 52 A 40 40 0 0 1 90 52" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="8" strokeLinecap="round" />
              {/* 主色进度弧 */}
              <path
                d="M 10 52 A 40 40 0 0 1 90 52"
                fill="none"
                stroke="var(--p)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * LEN} ${LEN}`}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-0.5">
              <span className="text-2xl font-extrabold leading-none" style={{ color: 'var(--p)' }}>{pct}</span>
              <span className="pb-0.5 text-[11px] opacity-45">{p.unit}</span>
            </div>
          </div>
          {/* 刻度小字 */}
          <div className="mx-auto mt-1.5 flex w-4/5 justify-between px-1 text-[9px] opacity-35">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      );
    },
  },
  {
    type: 'chart.compare',
    category: 'charts',
    name: '对比双柱',
    desc: '本月 / 上月双柱对比，4 组分组标签',
    icon: Columns3,
    defaultProps: {
      title: '月度营收对比',
      categories: '第 1 周,第 2 周,第 3 周,第 4 周',
      current: '86,64,92,58',
      previous: '70,72,80,66',
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'categories', label: '分组标签（逗号分隔）', type: 'textarea' },
      { key: 'current', label: '本月数值（逗号分隔）', type: 'textarea' },
      { key: 'previous', label: '上月数值（逗号分隔）', type: 'textarea' },
    ],
    render: (p) => {
      const cats = splitList(p.categories);
      const cur = numList(p.current);
      const prev = numList(p.previous);
      const max = Math.max(...cur, ...prev, 1);
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold">{p.title}</span>
            {/* 图例 */}
            <span className="flex items-center gap-2.5 text-[10px] opacity-55">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ background: 'var(--p)' }} /> 本月
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-current opacity-20" /> 上月
              </span>
            </span>
          </div>
          <div className="mt-3 flex h-24 items-end gap-3">
            {cats.map((cat, i) => (
              <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <span
                    className="w-2.5 rounded-t-sm"
                    style={{ height: `${Math.max(6, ((cur[i] ?? 0) / max) * 100)}%`, background: 'var(--p)' }}
                  />
                  <span
                    className="w-2.5 rounded-t-sm bg-current opacity-15"
                    style={{ height: `${Math.max(6, ((prev[i] ?? 0) / max) * 100)}%` }}
                  />
                </div>
                <span className="max-w-full truncate text-[9px] leading-none opacity-40">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
];
