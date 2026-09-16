'use client';

import { useState } from 'react';
import {
  Image as ImageIcon, Newspaper, Grid3x3, Heart, MessageCircle, Share2, Hash,
  Flame, TrendingUp, UserPlus, MonitorPlay, Play, Radio, Eye, CircleUserRound,
  Users, MessagesSquare, BadgeCheck, CircleDashed,
} from 'lucide-react';
import type { WidgetDef, InteractiveCtx } from '@/lib/widget-types';
import { stopAct, useAction, useLocalToggle, useLikeCount } from './action-kit';

/**
 * 社区 / 内容 组件库（目录：social）
 * 规范与 mall.tsx / shopping.tsx 一致：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应；
 * 图片位一律使用渐变 + lucide 图标占位，禁止外部图片 URL。
 */

/** 逗号 / 中文逗号分隔 → 字符串数组（去空白项） */
const splitList = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,]/).map((s) => s.trim()).filter(Boolean);

/** 多图墙装饰渐变池（橙/翠绿/玫红/紫/青绿/琥珀，无蓝色系，按序循环取用） */
const GRADS = [
  'linear-gradient(135deg, #fdba74, #f97316)',
  'linear-gradient(135deg, #6ee7b7, #10b981)',
  'linear-gradient(135deg, #fda4af, #f43f5e)',
  'linear-gradient(135deg, #c4b5fd, #8b5cf6)',
  'linear-gradient(135deg, #5eead4, #14b8a6)',
  'linear-gradient(135deg, #fde68a, #f59e0b)',
];

/** 热门榜单热度值预设（用户未填或数量不足时兜底） */
const HOT_PRESETS = ['512.6万', '438.2万', '386.4万', '297.1万', '245.8万'];

/** 短视频封面点赞数预设 */
const VIDEO_LIKES = ['12.6万', '8.9万', '5.2万', '3.4万'];

/** 弹幕远近景预设：位置 / 字号 / 透明度（模拟景深） */
const DANMAKU_STYLE = [
  { left: '5%', top: 5, size: 12, opacity: 0.85 },
  { left: '18%', top: 25, size: 10, opacity: 0.5 },
  { left: '47%', top: 26, size: 10, opacity: 0.35 },
  { left: '64%', top: 6, size: 13, opacity: 0.95 },
];

/* ------------------------------------------------------------------ */
/* 交互实现（仅预览模式挂载）：复制对应 render 的视觉结构，              */
/* 把静态元素替换为可交互元素——开关原地翻转、按钮原地响应。              */
/* ------------------------------------------------------------------ */

/** '2.4万' / '328' → 数值；无法解析返回 null（计数 ±1 仅对可解析文案生效，其余文案保持原样展示） */
const parseCnCount = (raw: string): number | null => {
  const s = raw.trim();
  if (/^\d+(\.\d+)?万$/.test(s)) return Math.round(parseFloat(s) * 10000);
  if (/^\d+$/.test(s)) return Number(s);
  return null;
};

/** 数值 → 计数展示（≥1万 显示 x.x万，与组件默认文案的「万」风格保持一致） */
const fmtCnCount = (n: number): string => {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}万`;
  return String(n);
};

/** 点赞双态的统一响应：原地翻转 + 语义化 toast（返回当前翻转后的文案） */
function likeToastOnToggle(
  toast: (msg: string, kind?: 'success' | 'info' | 'error') => void,
  wasLiked: boolean
) {
  toast(wasLiked ? '已取消点赞' : '已点赞', wasLiked ? 'info' : 'success');
}

/** social.action-bar 交互：点赞格原地翻转（红心填充 + 计数 ±1）/ 评论 / 分享 toast */
function ActionBarInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const rawLikes = String(props.likes ?? '');
  const parsed = parseCnCount(rawLikes);
  const [liked, likeCount, toggleLike] = useLikeCount(props.liked === true, parsed ?? 0);
  const likesText = parsed === null ? rawLikes : fmtCnCount(likeCount);
  const cellCls =
    'flex cursor-pointer items-center justify-center gap-1.5 text-xs opacity-70 transition-transform active:scale-[0.97]';
  return (
    <div className="w-card grid grid-cols-3 py-3" style={{ borderRadius: 'var(--pr)' }}>
      <button
        type="button"
        aria-label={liked ? '取消点赞' : '点赞'}
        onClick={(e) => {
          stopAct(e);
          toggleLike();
          likeToastOnToggle(toast, liked);
        }}
        className={cellCls}
      >
        <Heart
          className="size-[18px]"
          style={liked ? { color: 'var(--p)', fill: 'var(--p)' } : undefined}
        />
        <span style={liked ? { color: 'var(--p)', fontWeight: 600 } : undefined}>{likesText}</span>
      </button>
      <button
        type="button"
        aria-label="评论"
        onClick={(e) => { stopAct(e); toast('评论功能演示', 'info'); }}
        className={cellCls}
      >
        <MessageCircle className="size-[18px]" />
        <span>{props.comments}</span>
      </button>
      <button
        type="button"
        aria-label="分享"
        onClick={(e) => { stopAct(e); toast('已复制链接', 'success'); }}
        className={cellCls}
      >
        <Share2 className="size-[18px]" />
        <span>{props.shares}</span>
      </button>
    </div>
  );
}

/** social.comment-item 交互：右侧点赞心形原地翻转 + 计数 ±1 */
function CommentItemInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const rawLikes = String(props.likes ?? '');
  const parsed = parseCnCount(rawLikes);
  const [liked, likeCount, toggleLike] = useLikeCount(props.liked === true, parsed ?? 0);
  const likesText = parsed === null ? rawLikes : fmtCnCount(likeCount);
  return (
    <div className="w-card flex gap-2.5 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
      >
        {String(props.user || '评').slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{props.user}</p>
        <p className="mt-1 text-xs leading-5 opacity-80">{props.text}</p>
        <p className="mt-1 text-[10px] opacity-40">{props.time}</p>
      </div>
      <button
        type="button"
        aria-label={liked ? '取消点赞' : '点赞'}
        onClick={(e) => {
          stopAct(e);
          toggleLike();
          likeToastOnToggle(toast, liked);
        }}
        className="flex shrink-0 cursor-pointer flex-col items-center gap-0.5 pt-0.5 transition-transform active:scale-[0.97]"
      >
        <Heart
          className="size-3.5"
          style={liked ? { color: 'var(--p)', fill: 'var(--p)' } : undefined}
        />
        <span className="text-[10px] tabular-nums opacity-50">{likesText}</span>
      </button>
    </div>
  );
}

/** social.feed-card 交互：「+ 关注」⇄「已关注」原地翻转（不跳页） */
function FeedCardInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [followed, toggleFollowed] = useLocalToggle(props.followed === true);
  const user = String(props.user ?? '');
  return (
    <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
      {/* 头部：首字头像 + 昵称时间 + 关注小按钮 */}
      <div className="flex items-center gap-2.5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
        >
          {String(props.user || '友').slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-4">{props.user}</p>
          <p className="mt-0.5 text-[10px] opacity-40">{props.time}</p>
        </div>
        {followed ? (
          <button
            type="button"
            aria-label="取消关注"
            onClick={(e) => { stopAct(e); toggleFollowed(); toast('已取消关注', 'info'); }}
            className="w-chip shrink-0 cursor-pointer px-2.5 py-1.5 text-[11px] leading-none opacity-55 transition-opacity active:opacity-80"
            style={{ borderRadius: '999px' }}
          >
            已关注
          </button>
        ) : (
          <button
            type="button"
            aria-label={`关注 ${user}`}
            onClick={(e) => { stopAct(e); toggleFollowed(); toast(`已关注 ${user}`, 'success'); }}
            className="shrink-0 cursor-pointer px-2.5 py-1.5 text-[11px] font-bold leading-none transition-transform active:scale-[0.97]"
            style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
          >
            + 关注
          </button>
        )}
      </div>
      {/* 正文 */}
      <p className="mt-2.5 line-clamp-2 text-[13px] leading-5">{props.text}</p>
      {/* 大图占位（主色渐变） */}
      <div
        className="mt-2.5 flex h-36 items-center justify-center overflow-hidden"
        style={{
          borderRadius: 'calc(var(--pr) - 4px)',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 16%, transparent), color-mix(in srgb, var(--p) 42%, transparent))',
        }}
      >
        <ImageIcon className="size-9 opacity-30" />
      </div>
    </div>
  );
}

/** social.profile-head 交互：关注大按钮原地翻转（+ 关注 ⇄ 已关注） */
function ProfileHeadInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [followed, toggleFollowed] = useLocalToggle(props.followed === true);
  const name = String(props.name ?? '');
  return (
    <div
      className="w-full px-4 pb-4 pt-5"
      style={{
        background: 'linear-gradient(118deg, var(--p) 0%, color-mix(in srgb, var(--p) 62%, #fff) 58%, color-mix(in srgb, var(--p) 88%, #000) 100%)',
      }}
    >
      {/* 头像 + 昵称 + 简介 */}
      <div className="flex items-center gap-3.5">
        <span
          className="flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-black"
          style={{
            background: 'color-mix(in srgb, var(--pf) 92%, transparent)',
            color: 'var(--p)',
            boxShadow: '0 0 0 2px color-mix(in srgb, var(--pf) 40%, transparent)',
          }}
        >
          {String(props.name || '友').slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-base font-extrabold" style={{ color: 'var(--pf)' }}>
            <span className="truncate">{props.name}</span>
            <BadgeCheck className="size-4 shrink-0" style={{ color: 'var(--pf)' }} />
          </p>
          <p className="mt-1 line-clamp-1 text-xs opacity-75" style={{ color: 'var(--pf)' }}>{props.bio}</p>
        </div>
      </div>
      {/* 三栏数据 */}
      <div className="mt-4 flex">
        {[
          { label: '关注', val: props.following },
          { label: '粉丝', val: props.followers },
          { label: '获赞', val: props.likes },
        ].map(({ label, val }) => (
          <div key={label} className="flex-1 text-center">
            <p className="text-lg font-extrabold leading-none" style={{ color: 'var(--pf)' }}>{val}</p>
            <p className="mt-1 text-[10px] opacity-70" style={{ color: 'var(--pf)' }}>{label}</p>
          </div>
        ))}
      </div>
      {/* 关注大按钮 */}
      {followed ? (
        <button
          type="button"
          aria-label="取消关注"
          onClick={(e) => { stopAct(e); toggleFollowed(); toast('已取消关注', 'info'); }}
          className="mt-4 flex h-10 w-full cursor-pointer items-center justify-center text-[13px] font-bold transition-opacity active:opacity-80"
          style={{
            borderRadius: '999px',
            border: '1px solid color-mix(in srgb, var(--pf) 55%, transparent)',
            color: 'var(--pf)',
          }}
        >
          已关注
        </button>
      ) : (
        <button
          type="button"
          aria-label={`关注 ${name}`}
          onClick={(e) => { stopAct(e); toggleFollowed(); toast(`已关注 ${name}`, 'success'); }}
          className="mt-4 flex h-10 w-full cursor-pointer items-center justify-center text-[13px] font-bold shadow-md transition-transform active:scale-[0.97]"
          style={{ borderRadius: '999px', background: 'var(--pf)', color: 'var(--p)' }}
        >
          + 关注
        </button>
      )}
    </div>
  );
}

/** social.fan-row 交互：「回关」⇄「已关注」原地翻转 */
function FanRowInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [followed, toggleFollowed] = useLocalToggle(props.followBack === true);
  const name = String(props.name ?? '');
  return (
    <div className="flex items-center gap-3 border-b w-line py-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
      >
        {String(props.name || '粉').slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold leading-4">{props.name}</p>
        <p className="mt-1 truncate text-[11px] opacity-50">{props.bio}</p>
      </div>
      {followed ? (
        <button
          type="button"
          aria-label="取消关注"
          onClick={(e) => { stopAct(e); toggleFollowed(); toast('已取消关注', 'info'); }}
          className="w-chip shrink-0 cursor-pointer px-2.5 py-1.5 text-[11px] leading-none opacity-55 transition-opacity active:opacity-80"
          style={{ borderRadius: '999px' }}
        >
          已关注
        </button>
      ) : (
        <button
          type="button"
          aria-label={`回关 ${name}`}
          onClick={(e) => { stopAct(e); toggleFollowed(); toast(`已回关 ${name}`, 'success'); }}
          className="shrink-0 cursor-pointer px-2.5 py-1.5 text-[11px] font-bold leading-none transition-transform active:scale-[0.97]"
          style={{ borderRadius: '999px', border: '1px solid var(--p)', color: 'var(--p)' }}
        >
          回关
        </button>
      )}
    </div>
  );
}

/** social.user-suggest 交互：3 张卡的「关注」按钮各自独立翻转 */
function UserSuggestInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const users = splitList(props.users).slice(0, 3);
  const [followed, setFollowed] = useState<boolean[]>(() => users.map(() => false));
  const clickFollow = (i: number) => {
    const was = followed[i] ?? false;
    setFollowed((arr) => arr.map((v, j) => (j === i ? !v : v)));
    toast(was ? '已取消关注' : `已关注 ${users[i] ?? ''}`, was ? 'info' : 'success');
  };
  return (
    <div className="flex gap-2 overflow-hidden">
      {users.map((u, i) => (
        <div
          key={`${u}-${i}`}
          className="w-card flex w-[31.5%] shrink-0 flex-col items-center gap-2 p-3"
          style={{ borderRadius: 'var(--pr)' }}
        >
          <span
            className="flex size-12 items-center justify-center rounded-full text-base font-bold"
            style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
          >
            {u.slice(0, 1)}
          </span>
          <span className="max-w-full truncate text-xs font-semibold">{u}</span>
          <button
            type="button"
            aria-label={(followed[i] ?? false) ? `取消关注 ${u}` : `关注 ${u}`}
            onClick={(e) => { stopAct(e); clickFollow(i); }}
            className={(followed[i] ?? false)
              ? 'w-full w-chip cursor-pointer py-1.5 text-center text-[11px] leading-none opacity-55 transition-opacity active:opacity-80'
              : 'w-full cursor-pointer py-1.5 text-center text-[11px] font-bold leading-none transition-transform active:scale-[0.97]'}
            style={(followed[i] ?? false)
              ? { borderRadius: '999px' }
              : { borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
          >
            {(followed[i] ?? false) ? '已关注' : '关注'}
          </button>
        </div>
      ))}
    </div>
  );
}

/** social.video-grid 交互：播放圆钮 toast；封面点赞角标原地翻转（实心 ⇄ 描边心 + 计数 ±1） */
function VideoGridInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const count = Number(props.count) === 2 ? 2 : 4;
  /* 初始 liked=true：与 render 的实心白心视觉一致 */
  const [liked, setLiked] = useState<boolean[]>(() => Array.from({ length: count }, () => true));
  const toggleLike = (i: number) => {
    const was = liked[i] ?? true;
    setLiked((arr) => arr.map((v, j) => (j === i ? !v : v)));
    likeToastOnToggle(toast, was);
  };
  const badgeText = (i: number) => {
    const preset = VIDEO_LIKES[i % VIDEO_LIKES.length];
    const parsed = parseCnCount(preset);
    if (parsed === null) return preset;
    return fmtCnCount(Math.max(0, parsed + ((liked[i] ?? true) ? 0 : -1)));
  };
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden"
          style={{ borderRadius: 'var(--pr)', background: GRADS[i % GRADS.length] }}
        >
          {/* 竖版封面 + 居中播放按钮 */}
          <div className="flex aspect-[3/4] items-center justify-center">
            <button
              type="button"
              aria-label={`播放视频 ${i + 1}`}
              onClick={(e) => { stopAct(e); toast(`▶ 播放：视频 ${i + 1}`, 'info'); }}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/25 transition-transform active:scale-[0.97]"
            >
              <Play className="size-5 text-white" fill="white" />
            </button>
          </div>
          {/* 右下角点赞数（可点击翻转） */}
          <button
            type="button"
            aria-label={(liked[i] ?? true) ? '取消点赞' : '点赞'}
            onClick={(e) => { stopAct(e); toggleLike(i); }}
            className="absolute bottom-1.5 right-1.5 flex cursor-pointer items-center gap-1 rounded-md bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white transition-transform active:scale-[0.97]"
          >
            <Heart className="size-3" fill={(liked[i] ?? true) ? 'white' : 'none'} />
            {badgeText(i)}
          </button>
        </div>
      ))}
    </div>
  );
}

/** social.topic-wall 交互：话题 chip 点击 toast「#话题#」 */
function TopicWallInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  return (
    <div className="w-card flex flex-wrap gap-2 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
      {splitList(props.topics).map((t, i) => (
        <button
          key={`${t}-${i}`}
          type="button"
          aria-label={`进入话题 ${t}`}
          onClick={(e) => { stopAct(e); toast(`#${t}#`, 'info'); }}
          className={i === 0
            ? 'cursor-pointer px-2.5 py-1.5 text-xs font-bold leading-none transition-transform active:scale-[0.97]'
            : 'w-chip cursor-pointer px-2.5 py-1.5 text-xs leading-none opacity-65 transition-transform active:scale-[0.97]'}
          style={{
            borderRadius: '999px',
            ...(i === 0 ? { background: 'var(--p)', color: 'var(--pf)' } : {}),
          }}
        >
          # {t}
        </button>
      ))}
    </div>
  );
}

/** social.rank-list 交互：榜单行整行点击 → onTap 优先，否则 toast「查看：xxx」 */
function RankListInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const items = splitList(props.items).slice(0, 5);
  const hots = splitList(props.hots);
  const rankColor = (i: number) =>
    i === 0 ? 'var(--p)' : i === 1 ? '#f59e0b' : i === 2 ? '#f43f5e' : undefined;
  const openRow = (t: string) => {
    if (onTap) onTap();
    else toast(`查看：${t}`, 'info');
  };
  return (
    <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
      {/* 标题行 */}
      <div className="flex items-center gap-1.5">
        <Flame className="size-4" style={{ color: 'var(--p)' }} />
        <span className="text-[15px] font-extrabold">{props.title}</span>
      </div>
      {/* 5 行榜单 */}
      <div className="mt-1.5">
        {items.map((t, i) => (
          <button
            key={`${t}-${i}`}
            type="button"
            aria-label={`查看 ${t}`}
            onClick={(e) => { stopAct(e); openRow(t); }}
            className="flex w-full cursor-pointer items-center gap-3 border-b w-line py-2.5 text-left transition-opacity last:border-b-0 active:opacity-80"
          >
            <span
              className="w-5 shrink-0 text-center text-base font-black italic leading-none"
              style={{ color: rankColor(i), opacity: i > 2 ? 0.35 : 1 }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px]">{t}</span>
            <span className="shrink-0 text-[10px] tabular-nums opacity-40">
              {hots[i] ?? HOT_PRESETS[i] ?? ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** social.topic-card 交互：整卡点击 → onTap 优先，否则 toast「进入话题」 */
function TopicCardInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const rank = Math.min(99, Math.max(1, Math.round(Number(props.rank) || 1)));
  /* 1-3 名主色热榜配色：主色由深到浅，4 名以后弱化 */
  const rankStyle =
    rank === 1
      ? { background: 'var(--p)', color: 'var(--pf)' }
      : rank === 2
        ? { background: 'color-mix(in srgb, var(--p) 45%, transparent)', color: 'var(--p)' }
        : rank === 3
          ? { background: 'color-mix(in srgb, var(--p) 20%, transparent)', color: 'var(--p)' }
          : undefined;
  return (
    <button
      type="button"
      aria-label={`进入话题 #${String(props.topic ?? '')}#`}
      onClick={(e) => { stopAct(e); if (onTap) onTap(); else toast('进入话题', 'info'); }}
      className="w-card flex w-full cursor-pointer items-center gap-3 p-3.5 text-left transition-transform active:scale-[0.97]"
      style={{ borderRadius: 'var(--pr)' }}
    >
      {/* 话题序号徽标 */}
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[15px] font-black italic leading-none ${rank > 3 ? 'w-chip opacity-40' : ''}`}
        style={rankStyle}
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold leading-5"># {props.topic}</p>
        <p className="mt-0.5 truncate text-[10px] leading-4 opacity-45">{props.posts} 条讨论</p>
      </div>
      {/* 热度值（主色强调） */}
      <span
        className="flex shrink-0 items-center gap-1 text-[11px] font-bold tabular-nums"
        style={{ color: 'var(--p)' }}
      >
        <Flame className="size-3.5" fill="currentColor" />
        {props.heat}
      </span>
    </button>
  );
}

/** social.story-row 交互：整卡点击 → onTap 优先，否则 toast「查看动态」；单个好友头像独立 toast */
function StoryRowInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const openCard = () => {
    if (onTap) onTap();
    else toast('查看动态', 'info');
  };
  return (
    <div
      onClick={(e) => { stopAct(e); openCard(); }}
      className="w-card flex cursor-pointer gap-3 overflow-hidden p-3 transition-opacity active:opacity-80"
      style={{ borderRadius: 'var(--pr)' }}
    >
      {splitList(props.names).slice(0, 5).map((name, i) => (
        <button
          key={`${name}-${i}`}
          type="button"
          aria-label={`查看 ${name} 的动态`}
          onClick={(e) => { stopAct(e); toast(`查看 ${name} 的动态`, 'info'); }}
          className="flex w-14 min-w-0 shrink-0 cursor-pointer flex-col items-center gap-1.5 transition-transform active:scale-[0.97]"
        >
          {/* 渐变描边圈头像 */}
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-full p-[2.5px]"
            style={{ background: GRADS[i % GRADS.length] }}
          >
            <span
              className="w-card flex size-full items-center justify-center rounded-full text-base font-bold"
              style={{ color: 'var(--p)' }}
            >
              {name.slice(0, 1)}
            </span>
          </span>
          <span className="w-full truncate text-center text-[10px] leading-3 opacity-60">{name}</span>
        </button>
      ))}
    </div>
  );
}

/** social.live-card 交互：整卡点击 → onTap 优先，否则 toast「进入直播间」 */
function LiveCardInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  return (
    <button
      type="button"
      aria-label="进入直播间"
      onClick={(e) => { stopAct(e); if (onTap) onTap(); else toast('进入直播间', 'info'); }}
      className="relative aspect-video w-full cursor-pointer overflow-hidden text-left transition-transform active:scale-[0.97]"
      style={{
        borderRadius: 'var(--pr)',
        background: 'linear-gradient(118deg, var(--p) 0%, color-mix(in srgb, var(--p) 62%, #fff) 58%, color-mix(in srgb, var(--p) 88%, #000) 100%)',
      }}
    >
      {/* 封面占位图标 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <MonitorPlay className="size-9 opacity-30" style={{ color: 'var(--pf)' }} />
      </div>
      {/* 左上角 LIVE 红点角标（呼吸圆点） */}
      <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-rose-500 px-1.5 py-1 text-[10px] font-black leading-none text-white">
        <span className="size-1.5 animate-pulse rounded-full bg-white" />
        LIVE
      </span>
      {/* 右上角观看人数 */}
      <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[10px] font-semibold leading-none text-white">
        <Eye className="size-3" />
        {props.viewers}
      </span>
      {/* 底部：直播标题 + 主播头像圆点 + 直播间文案 */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2.5 pt-8">
        <p className="truncate text-[13px] font-bold leading-4 text-white">{props.title}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--p)' }}
          >
            <CircleUserRound className="size-3.5" />
          </span>
          <span className="truncate text-[10px] font-medium text-white/85">{props.liveText}</span>
        </div>
      </div>
    </button>
  );
}

export const widgets: WidgetDef[] = [
  {
    type: 'social.feed-card',
    category: 'social',
    name: '动态卡片',
    desc: '图文动态：头像昵称 + 正文 + 大图',
    icon: Newspaper,
    defaultProps: {
      user: '是桃桃酱呀',
      time: '12 分钟前',
      text: '周末探店｜被这家奶油色系杂货铺美到了，每一件小物都想抱回家 🍰 分享给大家～',
      followed: false,
    },
    fields: [
      { key: 'user', label: '昵称', type: 'text' },
      { key: 'time', label: '发布时间', type: 'text' },
      { key: 'text', label: '动态正文', type: 'textarea' },
      { key: 'followed', label: '已关注', type: 'switch' },
    ],
    Interactive: FeedCardInteractive,
    render: (p) => (
      <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
        {/* 头部：首字头像 + 昵称时间 + 关注小按钮 */}
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
          >
            {String(p.user || '友').slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-4">{p.user}</p>
            <p className="mt-0.5 text-[10px] opacity-40">{p.time}</p>
          </div>
          {p.followed ? (
            <span className="w-chip shrink-0 px-2.5 py-1.5 text-[11px] leading-none opacity-55" style={{ borderRadius: '999px' }}>
              已关注
            </span>
          ) : (
            <span
              className="shrink-0 px-2.5 py-1.5 text-[11px] font-bold leading-none"
              style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
            >
              + 关注
            </span>
          )}
        </div>
        {/* 正文 */}
        <p className="mt-2.5 line-clamp-2 text-[13px] leading-5">{p.text}</p>
        {/* 大图占位（主色渐变） */}
        <div
          className="mt-2.5 flex h-36 items-center justify-center overflow-hidden"
          style={{
            borderRadius: 'calc(var(--pr) - 4px)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--p) 16%, transparent), color-mix(in srgb, var(--p) 42%, transparent))',
          }}
        >
          <ImageIcon className="size-9 opacity-30" />
        </div>
      </div>
    ),
  },
  {
    type: 'social.grid-images',
    category: 'social',
    name: '九宫格图片',
    desc: '1 / 4 / 9 张图片墙（1px 缝合风格）',
    icon: Grid3x3,
    defaultProps: { count: '9' },
    fields: [
      {
        key: 'count', label: '图片数量', type: 'select',
        options: [
          { label: '1 张', value: '1' },
          { label: '4 张', value: '4' },
          { label: '9 张', value: '9' },
        ],
      },
    ],
    render: (p) => {
      const n = Number(p.count);
      const count = n === 1 ? 1 : n === 4 ? 4 : 9;
      const cols = count === 1 ? 1 : count === 4 ? 2 : 3;
      return (
        <div
          className="grid overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: '1px',
            borderRadius: 'calc(var(--pr) - 4px)',
          }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{ aspectRatio: count === 1 ? '4 / 3' : '1 / 1', background: GRADS[i % GRADS.length] }}
            >
              <ImageIcon className="size-5 text-white/70" />
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'social.action-bar',
    category: 'social',
    name: '互动栏',
    desc: '点赞 / 评论 / 分享 三项互动数据',
    icon: Heart,
    defaultProps: { likes: '2.4万', comments: '1386', shares: '892', liked: true },
    fields: [
      { key: 'likes', label: '点赞数', type: 'text' },
      { key: 'comments', label: '评论数', type: 'text' },
      { key: 'shares', label: '分享数', type: 'text' },
      { key: 'liked', label: '已点赞', type: 'switch' },
    ],
    Interactive: ActionBarInteractive,
    render: (p) => {
      const liked = p.liked === true;
      return (
        <div className="w-card grid grid-cols-3 py-3" style={{ borderRadius: 'var(--pr)' }}>
          <span className="flex items-center justify-center gap-1.5 text-xs opacity-70">
            <Heart
              className="size-[18px]"
              style={liked ? { color: 'var(--p)', fill: 'var(--p)' } : undefined}
            />
            <span style={liked ? { color: 'var(--p)', fontWeight: 600 } : undefined}>{p.likes}</span>
          </span>
          <span className="flex items-center justify-center gap-1.5 text-xs opacity-70">
            <MessageCircle className="size-[18px]" />
            <span>{p.comments}</span>
          </span>
          <span className="flex items-center justify-center gap-1.5 text-xs opacity-70">
            <Share2 className="size-[18px]" />
            <span>{p.shares}</span>
          </span>
        </div>
      );
    },
  },
  {
    type: 'social.topic-wall',
    category: 'social',
    name: '话题墙',
    desc: '话题 chip 云排列（首话题高亮）',
    icon: Hash,
    defaultProps: { topics: '今日份治愈,周末去哪儿,奶油风穿搭,手帐日常,城市漫步,深夜食堂,好物分享,手机摄影' },
    fields: [
      { key: 'topics', label: '话题列表', type: 'textarea', placeholder: '逗号分隔，第一个话题将高亮' },
    ],
    Interactive: TopicWallInteractive,
    render: (p) => (
      <div className="w-card flex flex-wrap gap-2 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
        {splitList(p.topics).map((t, i) =>
          i === 0 ? (
            <span
              key={`${t}-${i}`}
              className="px-2.5 py-1.5 text-xs font-bold leading-none"
              style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
            >
              # {t}
            </span>
          ) : (
            <span
              key={`${t}-${i}`}
              className="w-chip px-2.5 py-1.5 text-xs leading-none opacity-65"
              style={{ borderRadius: '999px' }}
            >
              # {t}
            </span>
          ),
        )}
      </div>
    ),
  },
  {
    type: 'social.rank-list',
    category: 'social',
    name: '热门榜单',
    desc: '5 行排行榜（前三名强调色）',
    icon: TrendingUp,
    defaultProps: {
      title: '热搜榜',
      items: 'AI 一句话生成小程序,今日份治愈系日落,周末城市漫步路线,秋天的第一杯奶茶,深夜食堂治愈瞬间',
      hots: '512.6万,438.2万,386.4万,297.1万,245.8万',
    },
    fields: [
      { key: 'title', label: '榜单标题', type: 'text' },
      { key: 'items', label: '条目标题', type: 'textarea', placeholder: '逗号分隔，取前 5 条' },
      { key: 'hots', label: '热度值', type: 'textarea', placeholder: '逗号分隔，与条目一一对应' },
    ],
    Interactive: RankListInteractive,
    render: (p) => {
      const items = splitList(p.items).slice(0, 5);
      const hots = splitList(p.hots);
      const rankColor = (i: number) =>
        i === 0 ? 'var(--p)' : i === 1 ? '#f59e0b' : i === 2 ? '#f43f5e' : undefined;
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          {/* 标题行 */}
          <div className="flex items-center gap-1.5">
            <Flame className="size-4" style={{ color: 'var(--p)' }} />
            <span className="text-[15px] font-extrabold">{p.title}</span>
          </div>
          {/* 5 行榜单 */}
          <div className="mt-1.5">
            {items.map((t, i) => (
              <div key={`${t}-${i}`} className="flex items-center gap-3 border-b w-line py-2.5 last:border-b-0">
                <span
                  className="w-5 shrink-0 text-center text-base font-black italic leading-none"
                  style={{ color: rankColor(i), opacity: i > 2 ? 0.35 : 1 }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px]">{t}</span>
                <span className="shrink-0 text-[10px] tabular-nums opacity-40">
                  {hots[i] ?? HOT_PRESETS[i] ?? ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    type: 'social.user-suggest',
    category: 'social',
    name: '推荐关注',
    desc: '横滑 3 张用户卡 + 关注按钮',
    icon: UserPlus,
    defaultProps: { users: '桃桃酱,阿乐不吃香菜,山野君' },
    fields: [
      { key: 'users', label: '用户昵称', type: 'textarea', placeholder: '逗号分隔，取前 3 个' },
    ],
    Interactive: UserSuggestInteractive,
    render: (p) => (
      <div className="flex gap-2 overflow-hidden">
        {splitList(p.users).slice(0, 3).map((u, i) => (
          <div
            key={`${u}-${i}`}
            className="w-card flex w-[31.5%] shrink-0 flex-col items-center gap-2 p-3"
            style={{ borderRadius: 'var(--pr)' }}
          >
            <span
              className="flex size-12 items-center justify-center rounded-full text-base font-bold"
              style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
            >
              {u.slice(0, 1)}
            </span>
            <span className="max-w-full truncate text-xs font-semibold">{u}</span>
            <span
              className="w-full py-1.5 text-center text-[11px] font-bold"
              style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
            >
              关注
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    type: 'social.video-grid',
    category: 'social',
    name: '短视频双列',
    desc: '2 / 4 张竖版封面卡 + 点赞角标',
    icon: MonitorPlay,
    defaultProps: { count: 4 },
    fields: [
      { key: 'count', label: '视频数量', type: 'number', min: 2, max: 4, step: 2 },
    ],
    Interactive: VideoGridInteractive,
    render: (p) => {
      const count = Number(p.count) === 2 ? 2 : 4;
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden"
              style={{ borderRadius: 'var(--pr)', background: GRADS[i % GRADS.length] }}
            >
              {/* 竖版封面 + 居中播放按钮 */}
              <div className="flex aspect-[3/4] items-center justify-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-black/25">
                  <Play className="size-5 text-white" fill="white" />
                </span>
              </div>
              {/* 右下角点赞数 */}
              <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                <Heart className="size-3" fill="white" />
                {VIDEO_LIKES[i % VIDEO_LIKES.length]}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'social.live-card',
    category: 'social',
    name: '直播卡片',
    desc: '16:9 封面渐变 + LIVE 红点角标 + 主播头像 + 标题 + 观看人数',
    icon: Radio,
    defaultProps: { title: '周末零食开箱狂欢', viewers: '1.2万', liveText: '薇薇安ViVi 的直播间' },
    fields: [
      { key: 'title', label: '直播标题', type: 'text' },
      { key: 'viewers', label: '观看人数', type: 'text' },
      { key: 'liveText', label: '主播 / 直播间文案', type: 'text' },
    ],
    Interactive: LiveCardInteractive,
    render: (p) => (
      <div
        className="relative aspect-video w-full overflow-hidden"
        style={{
          borderRadius: 'var(--pr)',
          background: 'linear-gradient(118deg, var(--p) 0%, color-mix(in srgb, var(--p) 62%, #fff) 58%, color-mix(in srgb, var(--p) 88%, #000) 100%)',
        }}
      >
        {/* 封面占位图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <MonitorPlay className="size-9 opacity-30" style={{ color: 'var(--pf)' }} />
        </div>
        {/* 左上角 LIVE 红点角标（呼吸圆点） */}
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-rose-500 px-1.5 py-1 text-[10px] font-black leading-none text-white">
          <span className="size-1.5 animate-pulse rounded-full bg-white" />
          LIVE
        </span>
        {/* 右上角观看人数 */}
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[10px] font-semibold leading-none text-white">
          <Eye className="size-3" />
          {p.viewers}
        </span>
        {/* 底部：直播标题 + 主播头像圆点 + 直播间文案 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2.5 pt-8">
          <p className="truncate text-[13px] font-bold leading-4 text-white">{p.title}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--p)' }}
            >
              <CircleUserRound className="size-3.5" />
            </span>
            <span className="truncate text-[10px] font-medium text-white/85">{p.liveText}</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    type: 'social.comment-item',
    category: 'social',
    name: '评论项',
    desc: '头像昵称 + 评论内容 + 点赞',
    icon: MessageCircle,
    defaultProps: {
      user: '椰椰不加冰',
      time: '昨天 21:36',
      text: '这也太好看了吧！求店铺地址～ 已经收藏起来周末就去',
      likes: '328',
      liked: true,
    },
    fields: [
      { key: 'user', label: '昵称', type: 'text' },
      { key: 'time', label: '评论时间', type: 'text' },
      { key: 'text', label: '评论内容', type: 'textarea' },
      { key: 'likes', label: '点赞数', type: 'text' },
      { key: 'liked', label: '已点赞', type: 'switch' },
    ],
    Interactive: CommentItemInteractive,
    render: (p) => {
      const liked = p.liked === true;
      return (
        <div className="w-card flex gap-2.5 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
          >
            {String(p.user || '评').slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{p.user}</p>
            <p className="mt-1 text-xs leading-5 opacity-80">{p.text}</p>
            <p className="mt-1 text-[10px] opacity-40">{p.time}</p>
          </div>
          {/* 右侧点赞列 */}
          <span className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5">
            <Heart
              className="size-3.5"
              style={liked ? { color: 'var(--p)', fill: 'var(--p)' } : undefined}
            />
            <span className="text-[10px] tabular-nums opacity-50">{p.likes}</span>
          </span>
        </div>
      );
    },
  },
  {
    type: 'social.profile-head',
    category: 'social',
    name: '个人主页头',
    desc: '通栏渐变背景 + 三栏数据 + 关注',
    icon: CircleUserRound,
    fullBleed: true,
    defaultProps: {
      name: '野原柚子',
      bio: '记录日常碎片 ✨ 好物与探店分享',
      following: '128',
      followers: '2.6万',
      likes: '18.9万',
      followed: false,
    },
    fields: [
      { key: 'name', label: '昵称', type: 'text' },
      { key: 'bio', label: '个性签名', type: 'textarea' },
      { key: 'following', label: '关注数', type: 'text' },
      { key: 'followers', label: '粉丝数', type: 'text' },
      { key: 'likes', label: '获赞数', type: 'text' },
      { key: 'followed', label: '已关注', type: 'switch' },
    ],
    Interactive: ProfileHeadInteractive,
    render: (p) => (
      <div
        className="w-full px-4 pb-4 pt-5"
        style={{
          background: 'linear-gradient(118deg, var(--p) 0%, color-mix(in srgb, var(--p) 62%, #fff) 58%, color-mix(in srgb, var(--p) 88%, #000) 100%)',
        }}
      >
        {/* 头像 + 昵称 + 简介 */}
        <div className="flex items-center gap-3.5">
          <span
            className="flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-black"
            style={{
              background: 'color-mix(in srgb, var(--pf) 92%, transparent)',
              color: 'var(--p)',
              boxShadow: '0 0 0 2px color-mix(in srgb, var(--pf) 40%, transparent)',
            }}
          >
            {String(p.name || '友').slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-base font-extrabold" style={{ color: 'var(--pf)' }}>
              <span className="truncate">{p.name}</span>
              <BadgeCheck className="size-4 shrink-0" style={{ color: 'var(--pf)' }} />
            </p>
            <p className="mt-1 line-clamp-1 text-xs opacity-75" style={{ color: 'var(--pf)' }}>{p.bio}</p>
          </div>
        </div>
        {/* 三栏数据 */}
        <div className="mt-4 flex">
          {[
            { label: '关注', val: p.following },
            { label: '粉丝', val: p.followers },
            { label: '获赞', val: p.likes },
          ].map(({ label, val }) => (
            <div key={label} className="flex-1 text-center">
              <p className="text-lg font-extrabold leading-none" style={{ color: 'var(--pf)' }}>{val}</p>
              <p className="mt-1 text-[10px] opacity-70" style={{ color: 'var(--pf)' }}>{label}</p>
            </div>
          ))}
        </div>
        {/* 关注大按钮 */}
        {p.followed ? (
          <div
            className="mt-4 flex h-10 items-center justify-center text-[13px] font-bold"
            style={{
              borderRadius: '999px',
              border: '1px solid color-mix(in srgb, var(--pf) 55%, transparent)',
              color: 'var(--pf)',
            }}
          >
            已关注
          </div>
        ) : (
          <div
            className="mt-4 flex h-10 items-center justify-center text-[13px] font-bold shadow-md"
            style={{ borderRadius: '999px', background: 'var(--pf)', color: 'var(--p)' }}
          >
            + 关注
          </div>
        )}
      </div>
    ),
  },
  {
    type: 'social.fan-row',
    category: 'social',
    name: '粉丝行',
    desc: '头像昵称签名 + 回关按钮',
    icon: Users,
    defaultProps: { name: '海盐芝士', bio: '认真生活，认真快乐～', followBack: false },
    fields: [
      { key: 'name', label: '昵称', type: 'text' },
      { key: 'bio', label: '个性签名', type: 'textarea' },
      { key: 'followBack', label: '已回关', type: 'switch' },
    ],
    Interactive: FanRowInteractive,
    render: (p) => (
      <div className="flex items-center gap-3 border-b w-line py-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
        >
          {String(p.name || '粉').slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-4">{p.name}</p>
          <p className="mt-1 truncate text-[11px] opacity-50">{p.bio}</p>
        </div>
        {p.followBack ? (
          <span className="w-chip shrink-0 px-2.5 py-1.5 text-[11px] leading-none opacity-55" style={{ borderRadius: '999px' }}>
            已关注
          </span>
        ) : (
          <span
            className="shrink-0 px-2.5 py-1.5 text-[11px] font-bold leading-none"
            style={{ borderRadius: '999px', border: '1px solid var(--p)', color: 'var(--p)' }}
          >
            回关
          </span>
        )}
      </div>
    ),
  },
  {
    type: 'social.topic-card',
    category: 'social',
    name: '热搜话题卡',
    desc: '单条话题：序号徽标（前三名主色热榜配色）+ 话题 + 热度 + 讨论数',
    icon: Flame,
    defaultProps: { rank: 1, topic: 'AI 一句话生成小程序', heat: '512.6万', posts: '2.8万' },
    fields: [
      { key: 'rank', label: '话题排名', type: 'number', min: 1, max: 99, step: 1 },
      { key: 'topic', label: '话题文字', type: 'text' },
      { key: 'heat', label: '热度值', type: 'text' },
      { key: 'posts', label: '讨论数', type: 'text' },
    ],
    Interactive: TopicCardInteractive,
    render: (p) => {
      const rank = Math.min(99, Math.max(1, Math.round(Number(p.rank) || 1)));
      /* 1-3 名主色热榜配色：主色由深到浅，4 名以后弱化 */
      const rankStyle =
        rank === 1
          ? { background: 'var(--p)', color: 'var(--pf)' }
          : rank === 2
            ? { background: 'color-mix(in srgb, var(--p) 45%, transparent)', color: 'var(--p)' }
            : rank === 3
              ? { background: 'color-mix(in srgb, var(--p) 20%, transparent)', color: 'var(--p)' }
              : undefined;
      return (
        <div className="w-card flex items-center gap-3 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          {/* 话题序号徽标 */}
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[15px] font-black italic leading-none ${rank > 3 ? 'w-chip opacity-40' : ''}`}
            style={rankStyle}
          >
            {rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold leading-5"># {p.topic}</p>
            <p className="mt-0.5 truncate text-[10px] leading-4 opacity-45">{p.posts} 条讨论</p>
          </div>
          {/* 热度值（主色强调） */}
          <span
            className="flex shrink-0 items-center gap-1 text-[11px] font-bold tabular-nums"
            style={{ color: 'var(--p)' }}
          >
            <Flame className="size-3.5" fill="currentColor" />
            {p.heat}
          </span>
        </div>
      );
    },
  },
  {
    type: 'social.story-row',
    category: 'social',
    name: '好友动态条',
    desc: '一排渐变描边圆头像 + 用户名（最多 5 个）',
    icon: CircleDashed,
    defaultProps: { names: '桃桃酱,阿乐不吃香菜,山野君,椰椰,柚子' },
    fields: [
      { key: 'names', label: '好友昵称', type: 'textarea', placeholder: '逗号分隔，取前 5 个' },
    ],
    Interactive: StoryRowInteractive,
    render: (p) => (
      <div className="w-card flex gap-3 overflow-hidden p-3" style={{ borderRadius: 'var(--pr)' }}>
        {splitList(p.names).slice(0, 5).map((name, i) => (
          <div key={`${name}-${i}`} className="flex w-14 min-w-0 shrink-0 flex-col items-center gap-1.5">
            {/* 渐变描边圈头像 */}
            <span
              className="flex size-14 shrink-0 items-center justify-center rounded-full p-[2.5px]"
              style={{ background: GRADS[i % GRADS.length] }}
            >
              <span
                className="w-card flex size-full items-center justify-center rounded-full text-base font-bold"
                style={{ color: 'var(--p)' }}
              >
                {name.slice(0, 1)}
              </span>
            </span>
            <span className="w-full truncate text-center text-[10px] leading-3 opacity-60">{name}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    type: 'social.danmaku',
    category: 'social',
    name: '弹幕横条',
    desc: '圆角弹幕条（远近景深模拟）',
    icon: MessagesSquare,
    defaultProps: { items: '前方高能！,这个转场绝了,来了来了,主播好可爱' },
    fields: [
      { key: 'items', label: '弹幕内容', type: 'textarea', placeholder: '逗号分隔，取前 4 条' },
    ],
    render: (p) => {
      const items = splitList(p.items).slice(0, 4);
      return (
        <div className="w-card relative h-12 overflow-hidden" style={{ borderRadius: '999px' }}>
          {items.map((t, i) => {
            const s = DANMAKU_STYLE[i % DANMAKU_STYLE.length];
            return (
              <span
                key={`${t}-${i}`}
                className="w-chip absolute whitespace-nowrap leading-none"
                style={{ left: s.left, top: s.top, fontSize: s.size, opacity: s.opacity, padding: '4px 8px', borderRadius: '999px' }}
              >
                {t}
              </span>
            );
          })}
        </div>
      );
    },
  },
];
