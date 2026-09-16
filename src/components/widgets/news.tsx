'use client';

import { useState } from 'react';
import {
  Newspaper, List, Rows3, Zap, Flame, Rss, Bookmark, CalendarDays,
  Images, Play, ChevronRight, Eye, MessageCircle, Plus, Image as ImageIcon,
} from 'lucide-react';
import type { InteractiveCtx, WidgetDef } from '@/lib/widget-types';
import { stopAct, useAction, useLocalToggle } from './action-kit';

/**
 * 资讯 / 新闻 组件库（目录：news）
 * 与 login.tsx 同一套规范：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应；
 * 图片位一律使用渐变 + lucide 图标占位，禁止外部图片 URL；render 为纯函数。
 */

/** 逗号（中英文）分隔 → 字符串数组（去空白项） */
const splitList = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,]/).map((s) => s.trim()).filter(Boolean);

/** 数字钳制 */
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** 热度值统一补「万」单位（纯数字时） */
const wan = (v: string) => (/^[\d.]+$/.test(v) ? `${v}万` : v);

/** 热榜 1-3 名强调色 */
const RANK_COLORS = ['#ef4444', '#f97316', '#f59e0b'];

/* ------------------------------------------------------------------ */
/* 交互实现（Interactive）：render 的「带 hooks 重写版」                  */
/* 原则：JSX 结构与 render 完全一致（视觉 100% 不变），仅把静态元素换成   */
/* 可交互元素；tab/订阅原地切换、严禁死按钮；所有点击 stopAct 阻断冒泡。  */
/* ------------------------------------------------------------------ */

/** news.headline：整卡点击 → onTap 优先，否则 toast 打开文章 */
function HeadlineInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const h = clamp(Math.round(Number(props.height) || 200), 140, 260);
  const title = String(props.title ?? '');
  const open = () => { if (onTap) onTap(); else toast(`打开文章：${title}`, 'info'); };
  return (
    <div
      role="button"
      aria-label={`打开文章：${title}`}
      className="relative w-full cursor-pointer overflow-hidden transition-opacity active:opacity-80"
      style={{ height: h }}
      onClick={(e) => { stopAct(e); open(); }}
    >
      {/* 大渐变图占位 + 装饰圆 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(150deg, color-mix(in srgb, var(--p) 72%, #000) 0%, var(--p) 48%, color-mix(in srgb, var(--p) 52%, #fff) 100%)',
        }}
      />
      <div className="absolute -right-8 -top-14 size-36 rounded-full" style={{ background: 'color-mix(in srgb, #fff 16%, transparent)' }} />
      <div className="absolute -bottom-10 -left-8 size-28 rounded-full" style={{ background: 'color-mix(in srgb, #fff 10%, transparent)' }} />
      <ImageIcon className="absolute right-4 top-4 size-6 opacity-25" style={{ color: '#fff' }} />
      {/* 底部黑色渐晕 */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
      {/* 标题与元信息 */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
        <p className="line-clamp-2 text-lg font-bold leading-snug text-white">{props.title}</p>
        <div className="flex items-center justify-between text-[11px] text-white/70">
          <span>{props.source} · {props.time}</span>
          <span className="flex items-center gap-1">
            <Eye className="size-3" /> {props.views} 阅读
          </span>
        </div>
      </div>
    </div>
  );
}

/** news.list-item：整行点击 → onTap 优先，否则 toast 打开文章 */
function ListItemInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const title = String(props.title ?? '');
  const open = () => { if (onTap) onTap(); else toast(`打开文章：${title}`, 'info'); };
  return (
    <div
      role="button"
      aria-label={`打开文章：${title}`}
      className="flex cursor-pointer gap-3 py-0.5 transition-opacity active:opacity-80"
      onClick={(e) => { stopAct(e); open(); }}
    >
      <div className="min-w-0 flex-1">
        {props.pinned ? (
          <span className="mb-1 inline-block rounded bg-red-500 px-1 py-0.5 text-[9px] font-bold leading-none text-white">
            置顶
          </span>
        ) : null}
        <p className="line-clamp-2 text-[13px] font-medium leading-[1.45]">{props.title}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] opacity-45">
          <span>{props.source}</span>
          <span>·</span>
          <MessageCircle className="size-3" />
          <span>{props.comments} 评论</span>
        </div>
      </div>
      {/* 右侧小方图（渐变占位） */}
      <div
        className="flex size-[68px] shrink-0 items-center justify-center"
        style={{
          borderRadius: 'calc(var(--pr) - 4px)',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 26%, transparent), color-mix(in srgb, var(--p) 58%, transparent))',
        }}
      >
        <ImageIcon className="size-5 opacity-35" />
      </div>
    </div>
  );
}

/** news.channel-tabs：频道 tab 原地切换选中（激活样式跟随点击项移动） */
function ChannelTabsInteractive({ props }: InteractiveCtx) {
  const tabs = splitList(props.channels);
  const [active, setActive] = useState(() => clamp(Math.round(Number(props.activeIndex) || 0), 0, Math.max(0, tabs.length - 1)));
  return (
    <div className="flex items-center gap-5 overflow-hidden border-b w-line px-1">
      {tabs.map((tab, i) => {
        const on = i === active;
        return (
          <span
            key={`${tab}-${i}`}
            role="tab"
            aria-selected={on}
            className={`relative flex shrink-0 cursor-pointer flex-col items-center pb-2 pt-1 text-sm transition-opacity active:opacity-80 ${on ? 'font-bold' : 'opacity-45'}`}
            style={on ? { color: 'var(--p)' } : undefined}
            onClick={(e) => { stopAct(e); if (!on) setActive(i); }}
          >
            {tab}
            {on ? <span className="absolute bottom-0 h-0.5 w-5 rounded-full" style={{ background: 'var(--p)' }} /> : null}
          </span>
        );
      })}
    </div>
  );
}

/** news.flash-bar：整条点击 → onTap 优先，否则 toast 查看快讯 */
function FlashBarInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const n = clamp(Math.round(Number(props.count) || 1), 1, 99);
  const open = () => { if (onTap) onTap(); else toast('查看快讯', 'info'); };
  return (
    <div
      role="button"
      aria-label="查看快讯"
      className="w-chip flex h-10 cursor-pointer items-center gap-2.5 px-3 transition-opacity active:opacity-80"
      style={{ borderRadius: 'var(--pr)' }}
      onClick={(e) => { stopAct(e); open(); }}
    >
      <span className="shrink-0 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">快讯</span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{props.title}</span>
      <span className="shrink-0 text-[10px] opacity-40">第 {n} 条</span>
      <ChevronRight className="size-3.5 shrink-0 opacity-40" />
    </div>
  );
}

/** news.hot-board：整卡点击 → onTap 优先，否则 toast 查看榜单 */
function HotBoardInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const rows = splitList(props.items).slice(0, 6).map((raw) => {
    const [title, ...rest] = raw.trim().split(/\s+/);
    return { title, heat: rest.join(' ') };
  });
  const open = () => { if (onTap) onTap(); else toast('查看榜单', 'info'); };
  return (
    <div
      role="button"
      aria-label="查看热点榜"
      className="w-card cursor-pointer p-3.5 transition-opacity active:opacity-80"
      style={{ borderRadius: 'var(--pr)' }}
      onClick={(e) => { stopAct(e); open(); }}
    >
      <div className="flex items-center gap-1.5">
        <Flame className="size-4" style={{ color: 'var(--p)' }} />
        <span className="text-[15px] font-extrabold">{props.title}</span>
      </div>
      <div className="mt-2.5 space-y-2.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={`w-5 shrink-0 text-center text-sm font-extrabold italic leading-none ${i > 2 ? 'opacity-35' : ''}`}
              style={i < 3 ? { color: RANK_COLORS[i] } : undefined}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px]">{row.title}</span>
            <span className="shrink-0 text-[11px] opacity-40">{wan(row.heat)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** news.subscribe-card：「+ 订阅」⇄「已订阅」原地翻转 + toast */
function SubscribeCardInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [subscribed, toggleSubscribed] = useLocalToggle(Boolean(props.subscribed));
  const name = String(props.name || '该来源');
  const initial = String(props.name || '').trim().charAt(0) || '科';
  return (
    <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
      {/* 圆方源头像（首字） */}
      <span
        className="flex size-11 shrink-0 items-center justify-center text-base font-extrabold"
        style={{
          borderRadius: 'calc(var(--pr) - 2px)',
          background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 52%, #fff))',
          color: 'var(--pf)',
        }}
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{props.name}</div>
        <div className="mt-0.5 truncate text-[11px] opacity-50">{props.desc}</div>
      </div>
      {subscribed ? (
        <span
          role="button"
          aria-label="取消订阅"
          className="flex h-8 shrink-0 cursor-pointer items-center rounded-full border px-3.5 text-xs font-bold w-line transition-opacity active:opacity-80"
          style={{ borderColor: 'var(--p)', color: 'var(--p)' }}
          onClick={(e) => { stopAct(e); toggleSubscribed(); toast(`已取消订阅「${name}」`, 'info'); }}
        >
          已订阅
        </span>
      ) : (
        <span
          role="button"
          aria-label="订阅"
          className="flex h-8 shrink-0 cursor-pointer items-center gap-0.5 rounded-full px-3.5 text-xs font-bold shadow-sm transition-transform active:scale-[0.97]"
          style={{ background: 'var(--p)', color: 'var(--pf)' }}
          onClick={(e) => { stopAct(e); toggleSubscribed(); toast(`已订阅「${name}」`, 'success'); }}
        >
          <Plus className="size-3.5" /> 订阅
        </span>
      )}
    </div>
  );
}

/** news.special-topic：整卡点击 → onTap 优先，否则 toast 进入专题 */
function SpecialTopicInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const name = String(props.name ?? '');
  const open = () => { if (onTap) onTap(); else toast(`进入专题：${name}`, 'info'); };
  return (
    <div
      role="button"
      aria-label={`进入专题：${name}`}
      className="relative flex cursor-pointer flex-col justify-center gap-1.5 overflow-hidden p-4 transition-opacity active:opacity-80"
      style={{
        borderRadius: 'var(--pr)',
        background: 'linear-gradient(120deg, color-mix(in srgb, var(--p) 78%, #000) 0%, var(--p) 46%, color-mix(in srgb, var(--p) 52%, #fff) 100%)',
      }}
      onClick={(e) => { stopAct(e); open(); }}
    >
      <div className="absolute -right-6 -top-9 size-24 rounded-full" style={{ background: 'color-mix(in srgb, #fff 15%, transparent)' }} />
      <span
        className="w-fit rounded px-1.5 py-0.5 text-[10px] font-bold leading-none"
        style={{ background: 'color-mix(in srgb, #fff 24%, transparent)', color: 'var(--pf)' }}
      >
        专题
      </span>
      <span className="text-base font-extrabold" style={{ color: 'var(--pf)' }}>{props.name}</span>
      <span className="text-[11px] opacity-80" style={{ color: 'var(--pf)' }}>{props.count}</span>
      <ChevronRight className="absolute bottom-3 right-3 size-4" style={{ color: 'var(--pf)' }} />
    </div>
  );
}

/** news.pic-news：整卡点击 → onTap 优先，否则 toast 浏览图集 */
function PicNewsInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const n = clamp(Math.round(Number(props.count) || 1), 1, 99);
  const title = String(props.title ?? '');
  const open = () => { if (onTap) onTap(); else toast(`浏览图集：${title}`, 'info'); };
  return (
    <div
      role="button"
      aria-label={`浏览图集：${title}`}
      className="cursor-pointer transition-opacity active:opacity-80"
      onClick={(e) => { stopAct(e); open(); }}
    >
      <div
        className="relative flex h-40 items-center justify-center overflow-hidden"
        style={{
          borderRadius: 'var(--pr)',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 30%, transparent), color-mix(in srgb, var(--p) 62%, transparent))',
        }}
      >
        <Images className="size-8 opacity-35" />
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          共 {n} 图
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[1.45]">{props.title}</p>
      <div className="mt-1 text-[11px] opacity-45">{props.source}</div>
    </div>
  );
}

/** news.video-news：整行 onTap/打开视频；缩略图播放钮 toast「▶ 播放视频」（分流） */
function VideoNewsInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const title = String(props.title ?? '');
  const open = () => { if (onTap) onTap(); else toast(`打开视频：${title}`, 'info'); };
  return (
    <div
      role="button"
      aria-label={`打开视频：${title}`}
      className="flex cursor-pointer gap-3 transition-opacity active:opacity-80"
      onClick={(e) => { stopAct(e); open(); }}
    >
      {/* 缩略图（渐变 + Play + 时长角标）：播放钮 → 播放视频 */}
      <div
        role="button"
        aria-label="播放视频"
        className="relative flex h-[72px] w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden transition-transform active:scale-[0.97]"
        style={{
          borderRadius: 'calc(var(--pr) - 2px)',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 36%, transparent), color-mix(in srgb, var(--p) 66%, transparent))',
        }}
        onClick={(e) => { stopAct(e); toast('▶ 播放视频', 'success'); }}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-black/35">
          <Play className="size-3.5 text-white" fill="currentColor" />
        </span>
        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-semibold text-white">
          {props.duration}
        </span>
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="line-clamp-2 text-[13px] font-medium leading-[1.45]">{props.title}</p>
        <div className="mt-2 text-[11px] opacity-45">{props.source} · {props.views}</div>
      </div>
    </div>
  );
}

export const widgets: WidgetDef[] = [
  {
    type: 'news.headline',
    category: 'news',
    name: '头条大图',
    desc: '通栏头图 + 底部渐晕 + 大字标题与来源',
    icon: Newspaper,
    Interactive: HeadlineInteractive,
    fullBleed: true,
    defaultProps: {
      title: '神舟二十号载人飞船发射取得圆满成功',
      source: '新华社', time: '刚刚', views: '328万', height: 200,
    },
    fields: [
      { key: 'title', label: '标题', type: 'textarea' },
      { key: 'source', label: '来源', type: 'text' },
      { key: 'time', label: '时间', type: 'text' },
      { key: 'views', label: '阅读数', type: 'text' },
      { key: 'height', label: '高度', type: 'number', min: 140, max: 260, step: 10 },
    ],
    render: (p) => {
      const h = clamp(Math.round(Number(p.height) || 200), 140, 260);
      return (
        <div className="relative w-full overflow-hidden" style={{ height: h }}>
          {/* 大渐变图占位 + 装饰圆 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(150deg, color-mix(in srgb, var(--p) 72%, #000) 0%, var(--p) 48%, color-mix(in srgb, var(--p) 52%, #fff) 100%)',
            }}
          />
          <div className="absolute -right-8 -top-14 size-36 rounded-full" style={{ background: 'color-mix(in srgb, #fff 16%, transparent)' }} />
          <div className="absolute -bottom-10 -left-8 size-28 rounded-full" style={{ background: 'color-mix(in srgb, #fff 10%, transparent)' }} />
          <ImageIcon className="absolute right-4 top-4 size-6 opacity-25" style={{ color: '#fff' }} />
          {/* 底部黑色渐晕 */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
          {/* 标题与元信息 */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
            <p className="line-clamp-2 text-lg font-bold leading-snug text-white">{p.title}</p>
            <div className="flex items-center justify-between text-[11px] text-white/70">
              <span>{p.source} · {p.time}</span>
              <span className="flex items-center gap-1">
                <Eye className="size-3" /> {p.views} 阅读
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    type: 'news.list-item',
    category: 'news',
    name: '新闻列表项',
    desc: '左标题两行省略 + 右侧小方图，可置顶',
    icon: List,
    Interactive: ListItemInteractive,
    defaultProps: {
      title: '多地下调首套房贷利率，刚需购房者迎来窗口期',
      source: '每日经济新闻', comments: '486', pinned: true,
    },
    fields: [
      { key: 'title', label: '标题', type: 'textarea' },
      { key: 'source', label: '来源', type: 'text' },
      { key: 'comments', label: '评论数', type: 'text' },
      { key: 'pinned', label: '置顶', type: 'switch' },
    ],
    render: (p) => (
      <div className="flex gap-3 py-0.5">
        <div className="min-w-0 flex-1">
          {p.pinned ? (
            <span className="mb-1 inline-block rounded bg-red-500 px-1 py-0.5 text-[9px] font-bold leading-none text-white">
              置顶
            </span>
          ) : null}
          <p className="line-clamp-2 text-[13px] font-medium leading-[1.45]">{p.title}</p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] opacity-45">
            <span>{p.source}</span>
            <span>·</span>
            <MessageCircle className="size-3" />
            <span>{p.comments} 评论</span>
          </div>
        </div>
        {/* 右侧小方图（渐变占位） */}
        <div
          className="flex size-[68px] shrink-0 items-center justify-center"
          style={{
            borderRadius: 'calc(var(--pr) - 4px)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 26%, transparent), color-mix(in srgb, var(--p) 58%, transparent))',
          }}
        >
          <ImageIcon className="size-5 opacity-35" />
        </div>
      </div>
    ),
  },
  {
    type: 'news.channel-tabs',
    category: 'news',
    name: '频道 Tab',
    desc: '横排频道切换，激活项主色 + 短横线',
    icon: Rows3,
    Interactive: ChannelTabsInteractive,
    defaultProps: { channels: '关注,推荐,热榜,科技,财经,体育', activeIndex: 1 },
    fields: [
      { key: 'channels', label: '频道（逗号分隔）', type: 'textarea' },
      { key: 'activeIndex', label: '激活项序号', type: 'number', min: 0, max: 5, step: 1 },
    ],
    render: (p) => {
      const tabs = splitList(p.channels);
      const active = clamp(Math.round(Number(p.activeIndex) || 0), 0, Math.max(0, tabs.length - 1));
      return (
        <div className="flex items-center gap-5 overflow-hidden border-b w-line px-1">
          {tabs.map((tab, i) => {
            const on = i === active;
            return (
              <span
                key={`${tab}-${i}`}
                className={`relative flex shrink-0 flex-col items-center pb-2 pt-1 text-sm ${on ? 'font-bold' : 'opacity-45'}`}
                style={on ? { color: 'var(--p)' } : undefined}
              >
                {tab}
                {on ? <span className="absolute bottom-0 h-0.5 w-5 rounded-full" style={{ background: 'var(--p)' }} /> : null}
              </span>
            );
          })}
        </div>
      );
    },
  },
  {
    type: 'news.flash-bar',
    category: 'news',
    name: '快讯条',
    desc: '通栏红色「快讯」标签 + 最新标题',
    icon: Zap,
    Interactive: FlashBarInteractive,
    fullBleed: true,
    defaultProps: { title: '工信部：我国算力总规模位居全球第二，年度增长率达 35%', count: 5 },
    fields: [
      { key: 'title', label: '最新快讯', type: 'textarea' },
      { key: 'count', label: '第 N 条', type: 'number', min: 1, max: 99, step: 1 },
    ],
    render: (p) => {
      const n = clamp(Math.round(Number(p.count) || 1), 1, 99);
      return (
        <div className="w-chip flex h-10 items-center gap-2.5 px-3" style={{ borderRadius: 'var(--pr)' }}>
          <span className="shrink-0 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">快讯</span>
          <span className="min-w-0 flex-1 truncate text-xs font-medium">{p.title}</span>
          <span className="shrink-0 text-[10px] opacity-40">第 {n} 条</span>
          <ChevronRight className="size-3.5 shrink-0 opacity-40" />
        </div>
      );
    },
  },
  {
    type: 'news.hot-board',
    category: 'news',
    name: '热点榜',
    desc: '火焰标题 + 6 行榜单，前三名强调色',
    icon: Flame,
    Interactive: HotBoardInteractive,
    defaultProps: {
      title: '热点榜',
      items: '神舟二十号载人飞船发射圆满成功 486.3万,多地出台新政支持改善性住房需求 312.5万,世界人工智能大会在沪开幕 287.9万,国产大模型集体降价 198.6万,秋冬流感高发期防护指南 165.2万,城市马拉松本周日开跑 121.8万',
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'items', label: '榜单（标题 空格 热度，逗号分隔）', type: 'textarea', placeholder: '最多 6 条' },
    ],
    render: (p) => {
      const rows = splitList(p.items).slice(0, 6).map((raw) => {
        const [title, ...rest] = raw.trim().split(/\s+/);
        return { title, heat: rest.join(' ') };
      });
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center gap-1.5">
            <Flame className="size-4" style={{ color: 'var(--p)' }} />
            <span className="text-[15px] font-extrabold">{p.title}</span>
          </div>
          <div className="mt-2.5 space-y-2.5">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={`w-5 shrink-0 text-center text-sm font-extrabold italic leading-none ${i > 2 ? 'opacity-35' : ''}`}
                  style={i < 3 ? { color: RANK_COLORS[i] } : undefined}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px]">{row.title}</span>
                <span className="shrink-0 text-[11px] opacity-40">{wan(row.heat)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'news.subscribe-card',
    category: 'news',
    name: '订阅源卡',
    desc: '源头像 + 简介 + 订阅按钮，可切换已订阅',
    icon: Rss,
    Interactive: SubscribeCardInteractive,
    defaultProps: { name: '科技每日推送', desc: '硬核科技资讯 · 每天 8 点更新', subscribed: false },
    fields: [
      { key: 'name', label: '源名称', type: 'text' },
      { key: 'desc', label: '简介', type: 'text' },
      { key: 'subscribed', label: '已订阅', type: 'switch' },
    ],
    render: (p) => {
      const initial = String(p.name || '').trim().charAt(0) || '科';
      return (
        <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
          {/* 圆方源头像（首字） */}
          <span
            className="flex size-11 shrink-0 items-center justify-center text-base font-extrabold"
            style={{
              borderRadius: 'calc(var(--pr) - 2px)',
              background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 52%, #fff))',
              color: 'var(--pf)',
            }}
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{p.name}</div>
            <div className="mt-0.5 truncate text-[11px] opacity-50">{p.desc}</div>
          </div>
          {p.subscribed ? (
            <span
              className="flex h-8 shrink-0 items-center rounded-full border px-3.5 text-xs font-bold w-line"
              style={{ borderColor: 'var(--p)', color: 'var(--p)' }}
            >
              已订阅
            </span>
          ) : (
            <span
              className="flex h-8 shrink-0 items-center gap-0.5 rounded-full px-3.5 text-xs font-bold shadow-sm"
              style={{ background: 'var(--p)', color: 'var(--pf)' }}
            >
              <Plus className="size-3.5" /> 订阅
            </span>
          )}
        </div>
      );
    },
  },
  {
    type: 'news.special-topic',
    category: 'news',
    name: '专题卡',
    desc: '渐变背景专题入口 + 篇数与箭头',
    icon: Bookmark,
    Interactive: SpecialTopicInteractive,
    defaultProps: { name: '人工智能改变生活', count: '共 24 篇 · 86.5万 次阅读' },
    fields: [
      { key: 'name', label: '专题名', type: 'text' },
      { key: 'count', label: '篇数 / 数据', type: 'text' },
    ],
    render: (p) => (
      <div
        className="relative flex flex-col justify-center gap-1.5 overflow-hidden p-4"
        style={{
          borderRadius: 'var(--pr)',
          background: 'linear-gradient(120deg, color-mix(in srgb, var(--p) 78%, #000) 0%, var(--p) 46%, color-mix(in srgb, var(--p) 52%, #fff) 100%)',
        }}
      >
        <div className="absolute -right-6 -top-9 size-24 rounded-full" style={{ background: 'color-mix(in srgb, #fff 15%, transparent)' }} />
        <span
          className="w-fit rounded px-1.5 py-0.5 text-[10px] font-bold leading-none"
          style={{ background: 'color-mix(in srgb, #fff 24%, transparent)', color: 'var(--pf)' }}
        >
          专题
        </span>
        <span className="text-base font-extrabold" style={{ color: 'var(--pf)' }}>{p.name}</span>
        <span className="text-[11px] opacity-80" style={{ color: 'var(--pf)' }}>{p.count}</span>
        <ChevronRight className="absolute bottom-3 right-3 size-4" style={{ color: 'var(--pf)' }} />
      </div>
    ),
  },
  {
    type: 'news.date-header',
    category: 'news',
    name: '报纸日期头',
    desc: '通栏大号日期 + 星期 + slogan 与天气',
    icon: CalendarDays,
    fullBleed: true,
    defaultProps: {
      date: '10月24日',
      weekday: '星期五 · 农历九月初八',
      slogan: '在这里，读懂世界',
      weather: '晴 23° · 空气 优',
    },
    fields: [
      { key: 'date', label: '日期', type: 'text' },
      { key: 'weekday', label: '星期 / 农历', type: 'text' },
      { key: 'slogan', label: '一句话 slogan', type: 'text' },
      { key: 'weather', label: '右侧天气小字', type: 'text' },
    ],
    render: (p) => (
      <div className="border-b-2 w-line pb-3 pt-1">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-extrabold leading-none tracking-tight">{p.date}</div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] opacity-55">
              <span className="font-semibold" style={{ color: 'var(--p)' }}>{p.weekday}</span>
            </div>
          </div>
          <div className="text-right text-[11px] leading-4 opacity-50">{p.weather}</div>
        </div>
        <div className="mt-2.5 border-t w-line pt-2 text-xs opacity-60">{p.slogan}</div>
      </div>
    ),
  },
  {
    type: 'news.pic-news',
    category: 'news',
    name: '图集新闻',
    desc: '宽幅渐变图 + 「共 N 图」角标 + 标题来源',
    icon: Images,
    Interactive: PicNewsInteractive,
    defaultProps: {
      title: '长征系列火箭第 537 次发射现场高清图集',
      source: '央视新闻', count: 9,
    },
    fields: [
      { key: 'title', label: '标题', type: 'textarea' },
      { key: 'source', label: '来源', type: 'text' },
      { key: 'count', label: '图片数', type: 'number', min: 1, max: 99, step: 1 },
    ],
    render: (p) => {
      const n = clamp(Math.round(Number(p.count) || 1), 1, 99);
      return (
        <div>
          <div
            className="relative flex h-40 items-center justify-center overflow-hidden"
            style={{
              borderRadius: 'var(--pr)',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 30%, transparent), color-mix(in srgb, var(--p) 62%, transparent))',
            }}
          >
            <Images className="size-8 opacity-35" />
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              共 {n} 图
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[1.45]">{p.title}</p>
          <div className="mt-1 text-[11px] opacity-45">{p.source}</div>
        </div>
      );
    },
  },
  {
    type: 'news.video-news',
    category: 'news',
    name: '视频新闻行',
    desc: '缩略图 + 播放钮 + 时长角标 + 标题',
    icon: Play,
    Interactive: VideoNewsInteractive,
    defaultProps: {
      title: '现场直击：全球首个商用海底数据中心正式投运',
      source: '极客前线', views: '52.6万次播放', duration: '03:45',
    },
    fields: [
      { key: 'title', label: '标题', type: 'textarea' },
      { key: 'source', label: '来源', type: 'text' },
      { key: 'views', label: '播放量', type: 'text' },
      { key: 'duration', label: '时长', type: 'text' },
    ],
    render: (p) => (
      <div className="flex gap-3">
        {/* 缩略图（渐变 + Play + 时长角标） */}
        <div
          className="relative flex h-[72px] w-32 shrink-0 items-center justify-center overflow-hidden"
          style={{
            borderRadius: 'calc(var(--pr) - 2px)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 36%, transparent), color-mix(in srgb, var(--p) 66%, transparent))',
          }}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-black/35">
            <Play className="size-3.5 text-white" fill="currentColor" />
          </span>
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-semibold text-white">
            {p.duration}
          </span>
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="line-clamp-2 text-[13px] font-medium leading-[1.45]">{p.title}</p>
          <div className="mt-2 text-[11px] opacity-45">{p.source} · {p.views}</div>
        </div>
      </div>
    ),
  },
];
