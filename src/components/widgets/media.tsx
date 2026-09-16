'use client';

import { useState } from 'react';
import {
  Music, AudioLines, ListMusic, Album, Disc3, Radio, RadioTower, Podcast,
  Library, BookOpen, SquarePlay, ListVideo, Quote, BookMarked, Play, Pause,
  SkipBack, SkipForward, Crown, ArrowLeft, Clock3, Mic, BookAudio, CalendarDays, Headphones,
} from 'lucide-react';
import type { InteractiveCtx, WidgetDef } from '@/lib/widget-types';
import { ActStatusIcon, stopAct, useAction, useLocalToggle } from './action-kit';

/**
 * 影音 / 阅读 组件库（目录：media）
 * 规范与 mall.tsx / chat.tsx 一致：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应。
 * 封面/图片位一律使用渐变 + lucide 图标占位，禁止外部图片 URL。
 */

/** 逗号 / 中文逗号 / 换行 分隔 → 字符串数组（去空白项） */
const splitList = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,\n]/).map((s) => s.trim()).filter(Boolean);

/** 百分比钳制到 0-100 */
const pct = (v: unknown, fallback: number): number => {
  const n = Number(v);
  return Math.min(100, Math.max(0, Number.isFinite(n) && n > 0 ? Math.round(n) : fallback));
};

/** "04:18" → 秒 */
const toSeconds = (t: unknown): number => {
  const parts = String(t ?? '').split(':').map((n) => Number(n) || 0);
  return parts.reduce((acc, n) => acc * 60 + n, 0);
};

/** 秒 → "mm:ss" */
const fmtTime = (sec: number): string => {
  const s = Math.max(0, Math.round(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** 主色系封面渐变（跟随画布主题） */
const PRIMARY_GRAD = 'linear-gradient(135deg, color-mix(in srgb, var(--p) 62%, #fff) 0%, var(--p) 55%, color-mix(in srgb, var(--p) 55%, #000) 100%)';
/** 主色系深色渐变（视频头等暗色场景） */
const DARK_GRAD = 'radial-gradient(circle at 68% 28%, color-mix(in srgb, var(--p) 72%, #000) 0%, color-mix(in srgb, var(--p) 34%, #000) 72%, color-mix(in srgb, var(--p) 18%, #000) 100%)';
/** 专辑/书封装饰渐变（仅封面占位配色，非主色语义；紫/玫红/青/琥珀系，无蓝色） */
const COVER_GRADS = [
  'linear-gradient(150deg, #8b5cf6, #d946ef)',
  'linear-gradient(150deg, #f43f5e, #fb923c)',
  'linear-gradient(150deg, #14b8a6, #84cc16)',
  'linear-gradient(150deg, #d97706, #fbbf24)',
];
const coverGrad = (i: number) => COVER_GRADS[((i % COVER_GRADS.length) + COVER_GRADS.length) % COVER_GRADS.length];

/** 圆形实心播放钮（主色底 + var(--pf) 图标） */
const PlayKnob = ({ size, iconSize }: { size: number; iconSize: number }) => (
  <span
    className="flex shrink-0 items-center justify-center rounded-full shadow-sm"
    style={{ width: size, height: size, background: 'var(--p)', color: 'var(--pf)' }}
  >
    <Play className="translate-x-px" style={{ width: iconSize, height: iconSize }} fill="currentColor" />
  </span>
);

/* ------------------------------------------------------------------ */
/* 交互实现（Interactive）：render 的「带 hooks 重写版」                  */
/* 原则：JSX 结构与 render 完全一致（视觉 100% 不变），仅把静态元素换成   */
/* 可交互元素；播放/开关原地翻转、严禁死按钮；所有点击 stopAct 阻断冒泡。 */
/* ------------------------------------------------------------------ */

/** 交互版圆形播放钮（视觉同 PlayKnob）：播放⇄暂停原地切换 */
function PlayKnobLive({ size, iconSize, playing, onToggle, label }: {
  size: number; iconSize: number; playing: boolean;
  onToggle: (e: React.MouseEvent) => void; label: string;
}) {
  return (
    <span
      role="button"
      aria-label={label}
      className="flex shrink-0 cursor-pointer items-center justify-center rounded-full shadow-sm transition-transform active:scale-[0.97]"
      style={{ width: size, height: size, background: 'var(--p)', color: 'var(--pf)' }}
      onClick={onToggle}
    >
      {playing ? (
        <Pause style={{ width: iconSize, height: iconSize }} fill="currentColor" />
      ) : (
        <Play className="translate-x-px" style={{ width: iconSize, height: iconSize }} fill="currentColor" />
      )}
    </span>
  );
}

/** media.player-large：播放钮原地切换播放/暂停；切歌 toast 歌名；进度条展示型 */
function PlayerLargeInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [playing, togglePlaying] = useLocalToggle(false);
  const percent = pct(props.percent, 42);
  const total = toSeconds(props.duration);
  const elapsed = fmtTime((total * percent) / 100);
  const song = String(props.song || '当前歌曲');
  return (
    <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
      {/* 大封面渐变 + 装饰圆 */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden" style={{ borderRadius: 'calc(var(--pr) - 4px)', background: PRIMARY_GRAD }}>
        <div className="absolute -right-8 -top-10 size-28 rounded-full" style={{ background: 'color-mix(in srgb, #fff 18%, transparent)' }} />
        <div className="absolute -bottom-12 -left-7 size-24 rounded-full" style={{ background: 'color-mix(in srgb, #fff 10%, transparent)' }} />
        <Music className="size-14 text-white/85" fill="currentColor" />
      </div>
      {/* 歌名 / 歌手 */}
      <div className="mt-3.5 flex items-center gap-2 px-0.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold">{props.song}</div>
          <div className="mt-0.5 truncate text-[11px] opacity-45">{props.artist}</div>
        </div>
        <span className="w-chip shrink-0 px-2 py-1 text-[10px] font-semibold opacity-70" style={{ borderRadius: '999px' }}>无损 SQ</span>
      </div>
      {/* 进度条（展示型，进度跟随 defaultProps） */}
      <div className="mt-3">
        <div className="w-chip h-1.5 overflow-hidden rounded-full">
          <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--p)' }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] tabular-nums opacity-35">
          <span>{elapsed}</span>
          <span>{props.duration || '04:18'}</span>
        </div>
      </div>
      {/* 三个控制钮：上一首 / 播放暂停（原地翻转） / 下一首 */}
      <div className="mt-2.5 flex items-center justify-center gap-7">
        <SkipBack
          role="button"
          aria-label={`上一首：${song}`}
          className="size-5 cursor-pointer opacity-70 transition-opacity active:opacity-80"
          fill="currentColor"
          onClick={(e) => { stopAct(e); toast(`上一首：${song}`, 'info'); }}
        />
        <PlayKnobLive
          size={46} iconSize={19} playing={playing}
          label={playing ? '暂停' : '播放'}
          onToggle={(e) => { stopAct(e); togglePlaying(); }}
        />
        <SkipForward
          role="button"
          aria-label={`下一首：${song}`}
          className="size-5 cursor-pointer opacity-70 transition-opacity active:opacity-80"
          fill="currentColor"
          onClick={(e) => { stopAct(e); toast(`下一首：${song}`, 'info'); }}
        />
      </div>
    </div>
  );
}

/** media.mini-player：暂停/播放图标原地翻转；下一首 toast 切歌 */
function MiniPlayerInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [playing, togglePlaying] = useLocalToggle(true); // render 默认展示暂停图标 = 播放中
  const song = String(props.song || '当前歌曲');
  const percent = pct(props.percent, 63);
  return (
    <div className="w-card relative flex items-center gap-2.5 overflow-hidden py-2 pl-4 pr-2.5">
      {/* 左侧主色细进度条（竖向，已播比例） */}
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: 'color-mix(in srgb, currentColor 10%, transparent)' }}>
        <span className="block w-full rounded-b-full" style={{ height: `${percent}%`, background: 'var(--p)' }} />
      </span>
      {/* 小封面 */}
      <div className="flex size-10 shrink-0 items-center justify-center" style={{ borderRadius: 'calc(var(--pr) - 6px)', background: PRIMARY_GRAD }}>
        <Music className="size-4 text-white/90" fill="currentColor" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold">{props.song}</div>
        <div className="truncate text-[10px] opacity-45">{props.artist}</div>
      </div>
      {/* 播放中显示暂停控件（原地翻转）+ 下一首 */}
      {playing ? (
        <Pause
          role="button"
          aria-label="暂停"
          className="size-5 shrink-0 cursor-pointer opacity-75 transition-opacity active:opacity-80"
          fill="currentColor"
          onClick={(e) => { stopAct(e); togglePlaying(); toast(`已暂停：${song}`, 'info'); }}
        />
      ) : (
        <Play
          role="button"
          aria-label="播放"
          className="size-5 shrink-0 cursor-pointer opacity-75 transition-opacity active:opacity-80"
          fill="currentColor"
          onClick={(e) => { stopAct(e); togglePlaying(); toast(`继续播放：${song}`, 'success'); }}
        />
      )}
      <SkipForward
        role="button"
        aria-label={`下一首：${song}`}
        className="size-5 shrink-0 cursor-pointer opacity-55 transition-opacity active:opacity-80"
        fill="currentColor"
        onClick={(e) => { stopAct(e); toast(`下一首：${song}`, 'info'); }}
      />
    </div>
  );
}

/** media.playlist-item：单行组件，整行点击切换自身播放态（高亮样式跟随）+ toast */
function PlaylistItemInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const [playing, setPlaying] = useState(() => Boolean(props.playing));
  const song = String(props.song || '当前歌曲');
  const handleTap = () => {
    const next = !playing;
    setPlaying(next);
    toast(next ? `正在播放：${song}` : `已暂停：${song}`, next ? 'success' : 'info');
  };
  return (
    <div
      role="button"
      aria-label={playing ? `暂停：${song}` : `播放：${song}`}
      className="w-card flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-opacity active:opacity-80"
      style={playing ? { background: 'color-mix(in srgb, var(--p) 10%, transparent)' } : undefined}
      onClick={(e) => { stopAct(e); handleTap(); }}
    >
      {/* 序号 / 播放态主色双竖条 */}
      {playing ? (
        <span className="flex w-4 shrink-0 items-center justify-center gap-[3px]">
          <span className="h-3 w-[3px] rounded-full" style={{ background: 'var(--p)' }} />
          <span className="h-1.5 w-[3px] rounded-full" style={{ background: 'var(--p)' }} />
        </span>
      ) : (
        <span className="w-4 shrink-0 text-center text-xs tabular-nums opacity-35">{props.index}</span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold" style={playing ? { color: 'var(--p)' } : undefined}>{props.song}</div>
        <div className="truncate text-[10px] opacity-45">{props.artist}</div>
      </div>
      <span className="shrink-0 text-[10px] tabular-nums opacity-35">{props.duration}</span>
    </div>
  );
}

/** media.album-slide：整卡点击 → onTap 优先，否则 toast 打开专辑 */
function AlbumSlideInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const albums = splitList(props.albums).slice(0, 3);
  const years = splitList(props.years);
  return (
    <div className="flex gap-2.5 overflow-hidden">
      {albums.map((name, i) => (
        <div
          key={`${name}-${i}`}
          role="button"
          aria-label={`打开专辑：${name}`}
          className="w-[31.5%] min-w-0 shrink-0 cursor-pointer transition-transform active:scale-[0.97]"
          onClick={(e) => { stopAct(e); if (onTap) onTap(); else toast(`打开专辑：${name}`, 'info'); }}
        >
          <div
            className="relative flex aspect-square items-center justify-center overflow-hidden"
            style={{ borderRadius: 'calc(var(--pr) - 2px)', background: coverGrad(i) }}
          >
            <div className="absolute -right-4 -top-5 size-16 rounded-full" style={{ background: 'color-mix(in srgb, #fff 18%, transparent)' }} />
            <Disc3 className="size-8 text-white/85" />
          </div>
          <div className="mt-1.5 truncate text-[11px] font-semibold">{name}</div>
          <div className="truncate text-[10px] tabular-nums opacity-40">{years[i] ?? ''}</div>
        </div>
      ))}
    </div>
  );
}

/** media.radio-card：圆形播放钮原地切换播放态 */
function RadioCardInteractive({ props }: InteractiveCtx) {
  const [playing, togglePlaying] = useLocalToggle(false);
  return (
    <div className="w-card overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
      {/* 圆角大封面 */}
      <div className="relative flex h-32 items-center justify-center overflow-hidden" style={{ background: PRIMARY_GRAD }}>
        <div className="absolute -left-6 -top-8 size-24 rounded-full" style={{ background: 'color-mix(in srgb, #fff 16%, transparent)' }} />
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold text-white">FM 98.6</span>
        {/* 圆形主色播放钮（骑在封面右下角）：原地切换播放态 */}
        <span className="absolute -bottom-4 right-3.5">
          <PlayKnobLive
            size={42} iconSize={17} playing={playing}
            label={playing ? '暂停电台' : '播放电台'}
            onToggle={(e) => { stopAct(e); togglePlaying(); }}
          />
        </span>
      </div>
      <div className="pb-3.5 pl-3.5 pr-16 pt-3">
        <div className="truncate text-sm font-bold">{props.name}</div>
        <div className="mt-0.5 truncate text-[11px] opacity-45">{props.episode} · {props.desc}</div>
      </div>
    </div>
  );
}

/** media.podcast-row：圆形播放钮原地切换播放态 */
function PodcastRowInteractive({ props }: InteractiveCtx) {
  const [playing, togglePlaying] = useLocalToggle(false);
  return (
    <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
      {/* 方形封面 */}
      <div className="relative flex size-14 shrink-0 items-center justify-center" style={{ borderRadius: 'calc(var(--pr) - 2px)', background: PRIMARY_GRAD }}>
        <Mic className="size-5 text-white/90" />
        <span className="absolute bottom-0.5 right-1 rounded bg-black/40 px-1 text-[8px] font-bold leading-[1.5] tabular-nums text-white">{props.duration}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{props.title}</div>
        <div className="mt-0.5 truncate text-[11px] opacity-45">{props.intro}</div>
        <div className="mt-1 flex items-center gap-1 text-[10px] tabular-nums opacity-40">
          <Clock3 className="size-3" />
          单集 {props.duration}
        </div>
      </div>
      <PlayKnobLive
        size={32} iconSize={14} playing={playing}
        label={playing ? '暂停播客' : '播放播客'}
        onToggle={(e) => { stopAct(e); togglePlaying(); }}
      />
    </div>
  );
}

/** media.book-grid：整卡点击 → onTap 优先，否则 toast 打开书籍 */
function BookGridInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const count = Math.min(4, Math.max(2, Number(props.count) || 4));
  const titles = splitList(props.titles).slice(0, count);
  const authors = splitList(props.authors);
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {titles.map((title, i) => (
        <div
          key={`${title}-${i}`}
          role="button"
          aria-label={`打开书籍：${title}`}
          className="cursor-pointer transition-transform active:scale-[0.97]"
          onClick={(e) => { stopAct(e); if (onTap) onTap(); else toast(`打开书籍：${title}`, 'info'); }}
        >
          {/* 竖版书封：竖排书名居中 */}
          <div
            className="relative flex aspect-[3/4] items-center justify-center overflow-hidden"
            style={{ borderRadius: 'calc(var(--pr) - 2px)', background: coverGrad(i + 1) }}
          >
            <div className="absolute -bottom-7 -left-5 size-20 rounded-full" style={{ background: 'color-mix(in srgb, #fff 14%, transparent)' }} />
            <span
              className="relative max-h-full overflow-hidden px-2 text-[13px] font-bold leading-snug text-white"
              style={{ writingMode: 'vertical-rl', letterSpacing: '2px' }}
            >
              {title}
            </span>
            <span className="absolute left-2 top-2 h-8 w-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.55)' }} />
          </div>
          <div className="mt-1.5 truncate text-[12px] font-semibold">{title}</div>
          <div className="truncate text-[10px] opacity-40">{authors[i] ?? ''}</div>
        </div>
      ))}
    </div>
  );
}

/** media.read-progress：继续阅读 → busy 转圈 → toast/onTap */
function ReadProgressInteractive({ props, onTap }: InteractiveCtx) {
  const { toast, busy, run } = useAction();
  const percent = pct(props.percent, 68);
  const title = String(props.title || '本书');
  const btnText = String(props.btnText || '继续阅读');
  return (
    <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
      {/* 书封小图 */}
      <div
        className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden"
        style={{ borderRadius: 'calc(var(--pr) - 4px)', background: coverGrad(1) }}
      >
        <BookOpen className="size-4 text-white/85" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{props.title}</div>
        <div className="mt-0.5 truncate text-[10px] opacity-40">{props.author}</div>
        <div className="mt-2 flex items-center gap-2">
          {/* 进度条 */}
          <div className="w-chip h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
            <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--p)' }} />
          </div>
          <span className="shrink-0 text-[10px] font-semibold tabular-nums" style={{ color: 'var(--p)' }}>{percent}%</span>
        </div>
      </div>
      <span
        role="button"
        aria-label={btnText}
        className={`flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap px-3 py-1.5 text-xs font-bold transition-opacity active:opacity-80 ${busy ? 'opacity-70' : ''}`}
        style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
        onClick={(e) => {
          stopAct(e);
          run(() => {
            if (onTap) onTap();
            else toast(`继续阅读《${title}》`, 'success');
          });
        }}
      >
        <ActStatusIcon busy={busy} done={false} className="size-3.5" />
        {btnText}
      </span>
    </div>
  );
}

/** media.video-hero：中央大钮原地播放/暂停；返回箭头 navBack（栈底/缺失 toast） */
function VideoHeroInteractive({ props, navBack }: InteractiveCtx) {
  const { toast } = useAction();
  const [playing, togglePlaying] = useLocalToggle(false);
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9', background: DARK_GRAD }}>
      <div className="absolute -right-10 top-1/3 size-36 rounded-full" style={{ background: 'color-mix(in srgb, #fff 7%, transparent)' }} />
      {/* 左上返回箭头 */}
      <ArrowLeft
        role="button"
        aria-label="返回"
        className="absolute left-3.5 top-3.5 size-5 cursor-pointer text-white/90 transition-opacity active:opacity-80"
        onClick={(e) => { stopAct(e); if (navBack) navBack(); else toast('已在首页', 'info'); }}
      />
      {/* 右侧清晰度 chip */}
      <span className="absolute right-3.5 top-3.5 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-bold leading-[1.6] text-white">
        {props.quality}
      </span>
      {/* 中央大播放圆钮：原地切换播放/暂停 */}
      <span
        role="button"
        aria-label={playing ? '暂停' : '播放'}
        className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/45 transition-transform active:scale-[0.97]"
        style={{ background: 'rgba(255,255,255,0.18)' }}
        onClick={(e) => { stopAct(e); togglePlaying(); }}
      >
        {playing ? (
          <Pause className="size-6 text-white" fill="currentColor" />
        ) : (
          <Play className="size-6 translate-x-0.5 text-white" fill="currentColor" />
        )}
      </span>
      {/* 底部标题 */}
      <div className="absolute inset-x-0 bottom-0 px-3.5 pb-2.5 pt-10" style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--p) 22%, #000) 20%, transparent)' }}>
        <div className="truncate text-[13px] font-bold text-white">{props.title}</div>
      </div>
    </div>
  );
}

/** media.episode-chips：集数 chip 原地切换选中（当前集样式跟随） */
function EpisodeChipsInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const count = Math.min(8, Math.max(4, Number(props.count) || 8));
  const [current, setCurrent] = useState(() => Math.min(count, Math.max(1, Number(props.current) || 1)));
  return (
    <div>
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[15px] font-bold">{props.title}</span>
        <span className="text-[11px] opacity-40">共 {props.total} 集</span>
      </div>
      <div className="mt-2.5 flex gap-1.5 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => {
          const n = i + 1;
          const on = n === current;
          return (
            <span
              key={n}
              role="button"
              aria-label={`第 ${n} 集`}
              aria-current={on ? 'true' : undefined}
              className={`flex h-7 min-w-9 shrink-0 cursor-pointer items-center justify-center px-1.5 text-[11px] font-bold tabular-nums transition-transform active:scale-[0.97] ${on ? '' : 'w-chip opacity-60'}`}
              style={{ borderRadius: 'calc(var(--pr) - 2px)', ...(on ? { background: 'var(--p)', color: 'var(--pf)' } : {}) }}
              onClick={(e) => {
                stopAct(e);
                if (n !== current) {
                  setCurrent(n);
                  toast(`已选第 ${n} 集`, 'success');
                }
              }}
            >
              {String(n).padStart(2, '0')}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** media.lyric-card：整卡点击 → onTap 优先，否则查看完整歌词 */
function LyricCardInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const lines = splitList(props.lyrics).slice(0, 5);
  const cur = Math.min(Math.max(1, lines.length || 1), Math.max(1, Number(props.current) || 1));
  return (
    <div
      role="button"
      aria-label="查看完整歌词"
      className="w-card cursor-pointer px-5 py-5 transition-transform active:scale-[0.97]"
      style={{ borderRadius: 'var(--pr)' }}
      onClick={(e) => { stopAct(e); if (onTap) onTap(); else toast('查看完整歌词', 'info'); }}
    >
      <div className="flex flex-col items-center gap-2.5 text-center">
        {lines.map((line, i) => {
          const isCur = i + 1 === cur;
          const near = Math.abs(i + 1 - cur) === 1;
          return (
            <span
              key={`${line}-${i}`}
              className={`${isCur ? 'text-[15px] font-bold' : near ? 'text-[13px] opacity-50' : 'text-[13px] opacity-30'} leading-relaxed`}
              style={isCur ? { color: 'var(--p)' } : undefined}
            >
              {line}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** media.chapter-list：整行点击 → VIP 行提示解锁，免费行走 onTap/toast */
function ChapterListInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  const chapters = splitList(props.chapters).slice(0, 5);
  const durations = splitList(props.durations);
  const vipCount = Math.min(5, Math.max(0, Number(props.vipCount) || 0));
  return (
    <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold">{props.title}</span>
        <span className="text-[11px] opacity-40">{chapters.length} 章</span>
      </div>
      <div className="mt-1">
        {chapters.map((name, i) => {
          const vip = i >= vipCount;
          return (
            <div
              key={`${name}-${i}`}
              role="button"
              aria-label={vip ? `解锁章节：${name}` : `打开章节：${name}`}
              className="flex cursor-pointer items-center gap-2.5 border-t w-line py-2.5 transition-opacity first:border-t-0 active:opacity-80"
              style={vip ? { opacity: 0.55 } : undefined}
              onClick={(e) => {
                stopAct(e);
                if (onTap) onTap();
                else toast(vip ? '解锁章节需 VIP' : `打开章节：${name}`, 'info');
              }}
            >
              <span className="w-4 shrink-0 text-center text-[11px] tabular-nums opacity-40">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-[13px]">{name}</span>
              {vip && (
                <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-extrabold text-amber-400">
                  <Crown className="size-3" fill="currentColor" />
                  VIP
                </span>
              )}
              <span className="shrink-0 text-[10px] tabular-nums opacity-35">{durations[i] ?? ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** media.audio-card：圆形播放钮原地切换播放态 */
function AudioCardInteractive({ props }: InteractiveCtx) {
  const [playing, togglePlaying] = useLocalToggle(false);
  const percent = pct(props.progress, 35);
  return (
    <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
      {/* 方形封面渐变 */}
      <div
        className="relative flex size-16 shrink-0 items-center justify-center"
        style={{ borderRadius: 'calc(var(--pr) - 2px)', background: PRIMARY_GRAD }}
      >
        <Headphones className="size-6 text-white/90" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{props.title}</div>
        <div className="mt-0.5 truncate text-[10px] opacity-45">{props.author}</div>
        {/* 进度条（主色已播比例） */}
        <div className="mt-2 flex items-center gap-2">
          <div className="w-chip h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
            <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--p)' }} />
          </div>
          <span className="shrink-0 text-[10px] font-semibold tabular-nums" style={{ color: 'var(--p)' }}>{percent}%</span>
        </div>
      </div>
      {/* 主色播放圆钮：原地切换播放态 */}
      <PlayKnobLive
        size={36} iconSize={15} playing={playing}
        label={playing ? '暂停' : '播放'}
        onToggle={(e) => { stopAct(e); togglePlaying(); }}
      />
    </div>
  );
}

/** media.schedule-row：星期徽标列点击切换选中（本地 state） */
function ScheduleRowInteractive({ props }: InteractiveCtx) {
  const { toast } = useAction();
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  const [today, setToday] = useState(() => (days.includes(String(props.weekday)) ? String(props.weekday) : '三'));
  const titles = splitList(props.titles).slice(0, 7);
  return (
    <div className="w-card flex gap-3 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
      {/* 星期徽标列（选中主色高亮，点击切换） */}
      <div className="flex shrink-0 flex-col gap-1">
        {days.map((d) => {
          const on = d === today;
          return (
            <span
              key={d}
              role="button"
              aria-label={`周${d}`}
              aria-pressed={on}
              className={`flex size-5 cursor-pointer items-center justify-center rounded-md text-[10px] leading-none transition-opacity active:opacity-80 ${on ? 'font-bold' : 'w-chip opacity-50'}`}
              style={on ? { background: 'var(--p)', color: 'var(--pf)' } : undefined}
              onClick={(e) => {
                stopAct(e);
                if (!on) {
                  setToday(d);
                  toast(`已切换到周${d}更新`, 'info');
                }
              }}
            >
              {d}
            </span>
          );
        })}
      </div>
      {/* 剧名列表（按行均分高度，与星期列对齐） */}
      <div className="flex min-w-0 flex-1 flex-col">
        {titles.map((t, i) => (
          <div
            key={`${t}-${i}`}
            className={`flex min-h-5 flex-1 items-center gap-2 ${i < titles.length - 1 ? 'border-b w-line' : ''}`}
          >
            <span className="size-1.5 shrink-0 rounded-full bg-current opacity-30" />
            <span className="min-w-0 flex-1 truncate text-xs">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const widgets: WidgetDef[] = [
  {
    type: 'media.player-large',
    category: 'media',
    name: '大播放器',
    desc: '大封面 + 歌曲信息 + 进度条 + 三控制钮',
    icon: Music,
    Interactive: PlayerLargeInteractive,
    defaultProps: { song: '浪潮上岸', artist: '橘子海', percent: 42, duration: '04:18' },
    fields: [
      { key: 'song', label: '歌曲名', type: 'text' },
      { key: 'artist', label: '歌手', type: 'text' },
      { key: 'percent', label: '播放进度', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'duration', label: '总时长', type: 'text', placeholder: '如 04:18' },
    ],
    render: (p) => {
      const percent = pct(p.percent, 42);
      const total = toSeconds(p.duration);
      const elapsed = fmtTime((total * percent) / 100);
      return (
        <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
          {/* 大封面渐变 + 装饰圆 */}
          <div className="relative flex h-44 items-center justify-center overflow-hidden" style={{ borderRadius: 'calc(var(--pr) - 4px)', background: PRIMARY_GRAD }}>
            <div className="absolute -right-8 -top-10 size-28 rounded-full" style={{ background: 'color-mix(in srgb, #fff 18%, transparent)' }} />
            <div className="absolute -bottom-12 -left-7 size-24 rounded-full" style={{ background: 'color-mix(in srgb, #fff 10%, transparent)' }} />
            <Music className="size-14 text-white/85" fill="currentColor" />
          </div>
          {/* 歌名 / 歌手 */}
          <div className="mt-3.5 flex items-center gap-2 px-0.5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold">{p.song}</div>
              <div className="mt-0.5 truncate text-[11px] opacity-45">{p.artist}</div>
            </div>
            <span className="w-chip shrink-0 px-2 py-1 text-[10px] font-semibold opacity-70" style={{ borderRadius: '999px' }}>无损 SQ</span>
          </div>
          {/* 进度条（主色已播比例） */}
          <div className="mt-3">
            <div className="w-chip h-1.5 overflow-hidden rounded-full">
              <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--p)' }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] tabular-nums opacity-35">
              <span>{elapsed}</span>
              <span>{p.duration || '04:18'}</span>
            </div>
          </div>
          {/* 三个控制钮 */}
          <div className="mt-2.5 flex items-center justify-center gap-7">
            <SkipBack className="size-5 opacity-70" fill="currentColor" />
            <PlayKnob size={46} iconSize={19} />
            <SkipForward className="size-5 opacity-70" fill="currentColor" />
          </div>
        </div>
      );
    },
  },
  {
    type: 'media.mini-player',
    category: 'media',
    name: '迷你播放条',
    desc: '小封面 + 歌名 + 播放/下一首 + 左侧细进度条',
    icon: AudioLines,
    Interactive: MiniPlayerInteractive,
    fullBleed: true,
    defaultProps: { song: '平凡之路', artist: '朴树', percent: 63 },
    fields: [
      { key: 'song', label: '歌曲名', type: 'text' },
      { key: 'artist', label: '歌手', type: 'text' },
      { key: 'percent', label: '播放进度', type: 'number', min: 0, max: 100, step: 1 },
    ],
    render: (p) => {
      const percent = pct(p.percent, 63);
      return (
        <div className="w-card relative flex items-center gap-2.5 overflow-hidden py-2 pl-4 pr-2.5">
          {/* 左侧主色细进度条（竖向，已播比例） */}
          <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: 'color-mix(in srgb, currentColor 10%, transparent)' }}>
            <span className="block w-full rounded-b-full" style={{ height: `${percent}%`, background: 'var(--p)' }} />
          </span>
          {/* 小封面 */}
          <div className="flex size-10 shrink-0 items-center justify-center" style={{ borderRadius: 'calc(var(--pr) - 6px)', background: PRIMARY_GRAD }}>
            <Music className="size-4 text-white/90" fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{p.song}</div>
            <div className="truncate text-[10px] opacity-45">{p.artist}</div>
          </div>
          {/* 播放中显示暂停控件 + 下一首 */}
          <Pause className="size-5 shrink-0 opacity-75" fill="currentColor" />
          <SkipForward className="size-5 shrink-0 opacity-55" fill="currentColor" />
        </div>
      );
    },
  },
  {
    type: 'media.playlist-item',
    category: 'media',
    name: '播放列表行',
    desc: '序号/播放态双竖条 + 歌名 + 时长',
    icon: ListMusic,
    Interactive: PlaylistItemInteractive,
    defaultProps: { index: 7, song: '水星记', artist: '郭顶', duration: '04:14', playing: true },
    fields: [
      { key: 'index', label: '序号', type: 'number', min: 1, max: 99, step: 1 },
      { key: 'song', label: '歌曲名', type: 'text' },
      { key: 'artist', label: '歌手', type: 'text' },
      { key: 'duration', label: '时长', type: 'text', placeholder: '如 04:14' },
      { key: 'playing', label: '正在播放', type: 'switch' },
    ],
    render: (p) => {
      const playing = Boolean(p.playing);
      return (
        <div
          className="w-card flex items-center gap-3 px-3.5 py-2.5"
          style={playing ? { background: 'color-mix(in srgb, var(--p) 10%, transparent)' } : undefined}
        >
          {/* 序号 / 播放态主色双竖条（波形动画的静态替代） */}
          {playing ? (
            <span className="flex w-4 shrink-0 items-center justify-center gap-[3px]">
              <span className="h-3 w-[3px] rounded-full" style={{ background: 'var(--p)' }} />
              <span className="h-1.5 w-[3px] rounded-full" style={{ background: 'var(--p)' }} />
            </span>
          ) : (
            <span className="w-4 shrink-0 text-center text-xs tabular-nums opacity-35">{p.index}</span>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold" style={playing ? { color: 'var(--p)' } : undefined}>{p.song}</div>
            <div className="truncate text-[10px] opacity-45">{p.artist}</div>
          </div>
          <span className="shrink-0 text-[10px] tabular-nums opacity-35">{p.duration}</span>
        </div>
      );
    },
  },
  {
    type: 'media.album-slide',
    category: 'media',
    name: '专辑横滑',
    desc: '横排 3 张方形封面 + 专辑名 + 年份',
    icon: Album,
    Interactive: AlbumSlideInteractive,
    defaultProps: { albums: '范特西,叶惠美,七里香', years: '2001,2003,2004' },
    fields: [
      { key: 'albums', label: '专辑名', type: 'textarea', placeholder: '逗号分隔，最多 3 个' },
      { key: 'years', label: '发行年份', type: 'textarea', placeholder: '逗号分隔，与专辑一一对应' },
    ],
    render: (p) => {
      const albums = splitList(p.albums).slice(0, 3);
      const years = splitList(p.years);
      return (
        <div className="flex gap-2.5 overflow-hidden">
          {albums.map((name, i) => (
            <div key={`${name}-${i}`} className="w-[31.5%] min-w-0 shrink-0">
              <div
                className="relative flex aspect-square items-center justify-center overflow-hidden"
                style={{ borderRadius: 'calc(var(--pr) - 2px)', background: coverGrad(i) }}
              >
                <div className="absolute -right-4 -top-5 size-16 rounded-full" style={{ background: 'color-mix(in srgb, #fff 18%, transparent)' }} />
                <Disc3 className="size-8 text-white/85" />
              </div>
              <div className="mt-1.5 truncate text-[11px] font-semibold">{name}</div>
              <div className="truncate text-[10px] tabular-nums opacity-40">{years[i] ?? ''}</div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'media.radio-card',
    category: 'media',
    name: '电台卡',
    desc: '大封面电台卡 + 期数 + 圆形播放钮',
    icon: Radio,
    Interactive: RadioCardInteractive,
    defaultProps: { name: '午夜情绪收容所', episode: '第 128 期', desc: '睡前十分钟，把心事留在今晚' },
    fields: [
      { key: 'name', label: '电台名', type: 'text' },
      { key: 'episode', label: '期数', type: 'text', placeholder: '如 第 128 期' },
      { key: 'desc', label: '简介', type: 'text' },
    ],
    render: (p) => (
      <div className="w-card overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
        {/* 圆角大封面 */}
        <div className="relative flex h-32 items-center justify-center overflow-hidden" style={{ background: PRIMARY_GRAD }}>
          <div className="absolute -left-6 -top-8 size-24 rounded-full" style={{ background: 'color-mix(in srgb, #fff 16%, transparent)' }} />
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold text-white">FM 98.6</span>
          {/* 圆形主色播放钮（骑在封面右下角） */}
          <span className="absolute -bottom-4 right-3.5">
            <PlayKnob size={42} iconSize={17} />
          </span>
        </div>
        <div className="pb-3.5 pl-3.5 pr-16 pt-3">
          <div className="truncate text-sm font-bold">{p.name}</div>
          <div className="mt-0.5 truncate text-[11px] opacity-45">{p.episode} · {p.desc}</div>
        </div>
      </div>
    ),
  },
  {
    type: 'media.podcast-row',
    category: 'media',
    name: '播客行',
    desc: '方形封面 + 标题 + 简介 + 时长 + 播放钮',
    icon: Podcast,
    Interactive: PodcastRowInteractive,
    defaultProps: {
      title: 'Vol.96 三十五岁，重新出发',
      intro: '本期聊聊职业转型、副业尝试与自我和解',
      duration: '58:20',
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'intro', label: '简介', type: 'text' },
      { key: 'duration', label: '时长', type: 'text', placeholder: '如 58:20' },
    ],
    render: (p) => (
      <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
        {/* 方形封面 */}
        <div className="relative flex size-14 shrink-0 items-center justify-center" style={{ borderRadius: 'calc(var(--pr) - 2px)', background: PRIMARY_GRAD }}>
          <Mic className="size-5 text-white/90" />
          <span className="absolute bottom-0.5 right-1 rounded bg-black/40 px-1 text-[8px] font-bold leading-[1.5] tabular-nums text-white">{p.duration}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold">{p.title}</div>
          <div className="mt-0.5 truncate text-[11px] opacity-45">{p.intro}</div>
          <div className="mt-1 flex items-center gap-1 text-[10px] tabular-nums opacity-40">
            <Clock3 className="size-3" />
            单集 {p.duration}
          </div>
        </div>
        <PlayKnob size={32} iconSize={14} />
      </div>
    ),
  },
  {
    type: 'media.book-grid',
    category: 'media',
    name: '书城网格',
    desc: '双列竖版书封 + 书名 + 作者',
    icon: Library,
    Interactive: BookGridInteractive,
    defaultProps: {
      count: 4,
      titles: '三体,活着,小王子,百年孤独',
      authors: '刘慈欣,余华,圣埃克苏佩里,马尔克斯',
    },
    fields: [
      { key: 'count', label: '书籍数量', type: 'number', min: 2, max: 4, step: 2 },
      { key: 'titles', label: '书名', type: 'textarea', placeholder: '逗号分隔，最多 4 个' },
      { key: 'authors', label: '作者', type: 'textarea', placeholder: '逗号分隔，与书名一一对应' },
    ],
    render: (p) => {
      const count = Math.min(4, Math.max(2, Number(p.count) || 4));
      const titles = splitList(p.titles).slice(0, count);
      const authors = splitList(p.authors);
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {titles.map((title, i) => (
            <div key={`${title}-${i}`}>
              {/* 竖版书封：竖排书名居中 */}
              <div
                className="relative flex aspect-[3/4] items-center justify-center overflow-hidden"
                style={{ borderRadius: 'calc(var(--pr) - 2px)', background: coverGrad(i + 1) }}
              >
                <div className="absolute -bottom-7 -left-5 size-20 rounded-full" style={{ background: 'color-mix(in srgb, #fff 14%, transparent)' }} />
                <span
                  className="relative max-h-full overflow-hidden px-2 text-[13px] font-bold leading-snug text-white"
                  style={{ writingMode: 'vertical-rl', letterSpacing: '2px' }}
                >
                  {title}
                </span>
                <span className="absolute left-2 top-2 h-8 w-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.55)' }} />
              </div>
              <div className="mt-1.5 truncate text-[12px] font-semibold">{title}</div>
              <div className="truncate text-[10px] opacity-40">{authors[i] ?? ''}</div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'media.read-progress',
    category: 'media',
    name: '阅读进度卡',
    desc: '书封小图 + 进度条 + 继续阅读按钮',
    icon: BookOpen,
    Interactive: ReadProgressInteractive,
    defaultProps: { title: '百年孤独', author: '加西亚·马尔克斯', percent: 68, btnText: '继续阅读' },
    fields: [
      { key: 'title', label: '书名', type: 'text' },
      { key: 'author', label: '作者', type: 'text' },
      { key: 'percent', label: '阅读进度', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'btnText', label: '按钮文案', type: 'text' },
    ],
    render: (p) => {
      const percent = pct(p.percent, 68);
      return (
        <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
          {/* 书封小图 */}
          <div
            className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden"
            style={{ borderRadius: 'calc(var(--pr) - 4px)', background: coverGrad(1) }}
          >
            <BookOpen className="size-4 text-white/85" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold">{p.title}</div>
            <div className="mt-0.5 truncate text-[10px] opacity-40">{p.author}</div>
            <div className="mt-2 flex items-center gap-2">
              {/* 进度条 */}
              <div className="w-chip h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
                <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--p)' }} />
              </div>
              <span className="shrink-0 text-[10px] font-semibold tabular-nums" style={{ color: 'var(--p)' }}>{percent}%</span>
            </div>
          </div>
          <span
            className="shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-bold"
            style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
          >
            {p.btnText}
          </span>
        </div>
      );
    },
  },
  {
    type: 'media.video-hero',
    category: 'media',
    name: '视频播放头',
    desc: '16:9 大视频封面 + 播放钮 + 标题/清晰度',
    icon: SquarePlay,
    Interactive: VideoHeroInteractive,
    fullBleed: true,
    defaultProps: { title: '星际穿越 · 导演剪辑版', quality: '1080P' },
    fields: [
      { key: 'title', label: '视频标题', type: 'text' },
      { key: 'quality', label: '清晰度', type: 'text', placeholder: '如 1080P / 4K' },
    ],
    render: (p) => (
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9', background: DARK_GRAD }}>
        <div className="absolute -right-10 top-1/3 size-36 rounded-full" style={{ background: 'color-mix(in srgb, #fff 7%, transparent)' }} />
        {/* 左上返回箭头 */}
        <ArrowLeft className="absolute left-3.5 top-3.5 size-5 text-white/90" />
        {/* 右侧清晰度 chip */}
        <span className="absolute right-3.5 top-3.5 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-bold leading-[1.6] text-white">
          {p.quality}
        </span>
        {/* 中央大播放圆钮 */}
        <span
          className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/45"
          style={{ background: 'rgba(255,255,255,0.18)' }}
        >
          <Play className="size-6 translate-x-0.5 text-white" fill="currentColor" />
        </span>
        {/* 底部标题 */}
        <div className="absolute inset-x-0 bottom-0 px-3.5 pb-2.5 pt-10" style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--p) 22%, #000) 20%, transparent)' }}>
          <div className="truncate text-[13px] font-bold text-white">{p.title}</div>
        </div>
      </div>
    ),
  },
  {
    type: 'media.episode-chips',
    category: 'media',
    name: '选集横排',
    desc: '选集标题 + 横排集数 chip（当前集主色）',
    icon: ListVideo,
    Interactive: EpisodeChipsInteractive,
    defaultProps: { title: '选集', count: 8, current: 3, total: '32' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'count', label: 'chip 数量', type: 'number', min: 4, max: 8, step: 1 },
      { key: 'current', label: '当前集', type: 'number', min: 1, max: 8, step: 1 },
      { key: 'total', label: '总集数', type: 'text', placeholder: '如 32' },
    ],
    render: (p) => {
      const count = Math.min(8, Math.max(4, Number(p.count) || 8));
      const current = Math.min(count, Math.max(1, Number(p.current) || 1));
      return (
        <div>
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[15px] font-bold">{p.title}</span>
            <span className="text-[11px] opacity-40">共 {p.total} 集</span>
          </div>
          <div className="mt-2.5 flex gap-1.5 overflow-hidden">
            {Array.from({ length: count }).map((_, i) => {
              const n = i + 1;
              const on = n === current;
              return (
                <span
                  key={n}
                  className={`flex h-7 min-w-9 shrink-0 items-center justify-center px-1.5 text-[11px] font-bold tabular-nums ${on ? '' : 'w-chip opacity-60'}`}
                  style={{ borderRadius: 'calc(var(--pr) - 2px)', ...(on ? { background: 'var(--p)', color: 'var(--pf)' } : {}) }}
                >
                  {String(n).padStart(2, '0')}
                </span>
              );
            })}
          </div>
        </div>
      );
    },
  },
  {
    type: 'media.lyric-card',
    category: 'media',
    name: '歌词卡',
    desc: '3~5 行歌词，当前句主色加粗居中',
    icon: Quote,
    Interactive: LyricCardInteractive,
    defaultProps: {
      current: 2,
      lyrics:
        '晚风把路灯吹得摇晃,你哼的歌落在我肩膀,故事写到这一页刚好,下一站不说再见,青春替我们收了场',
    },
    fields: [
      { key: 'lyrics', label: '歌词（每行一句）', type: 'textarea', placeholder: '逗号或换行分隔，最多 5 行' },
      { key: 'current', label: '当前句序号', type: 'number', min: 1, max: 5, step: 1 },
    ],
    render: (p) => {
      const lines = splitList(p.lyrics).slice(0, 5);
      const cur = Math.min(Math.max(1, lines.length || 1), Math.max(1, Number(p.current) || 1));
      return (
        <div className="w-card px-5 py-5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex flex-col items-center gap-2.5 text-center">
            {lines.map((line, i) => {
              const isCur = i + 1 === cur;
              const near = Math.abs(i + 1 - cur) === 1;
              return (
                <span
                  key={`${line}-${i}`}
                  className={`${isCur ? 'text-[15px] font-bold' : near ? 'text-[13px] opacity-50' : 'text-[13px] opacity-30'} leading-relaxed`}
                  style={isCur ? { color: 'var(--p)' } : undefined}
                >
                  {line}
                </span>
              );
            })}
          </div>
        </div>
      );
    },
  },
  {
    type: 'media.chapter-list',
    category: 'media',
    name: '章节列表',
    desc: '章节目录 + VIP 章节金冠锁定',
    icon: BookMarked,
    Interactive: ChapterListInteractive,
    defaultProps: {
      title: '目录',
      vipCount: 2,
      chapters: '第一章 雪夜来客,第二章 老宅旧事,第三章 井底的信,第四章 消失的房客,第五章 长夜将尽',
      durations: '12:40,15:02,13:28,14:56,16:11',
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'vipCount', label: '免费章节数', type: 'number', min: 0, max: 5, step: 1 },
      { key: 'chapters', label: '章节名', type: 'textarea', placeholder: '逗号分隔，最多 5 章' },
      { key: 'durations', label: '章节时长', type: 'textarea', placeholder: '逗号分隔，与章节一一对应' },
    ],
    render: (p) => {
      const chapters = splitList(p.chapters).slice(0, 5);
      const durations = splitList(p.durations);
      const vipCount = Math.min(5, Math.max(0, Number(p.vipCount) || 0));
      return (
        <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold">{p.title}</span>
            <span className="text-[11px] opacity-40">{chapters.length} 章</span>
          </div>
          <div className="mt-1">
            {chapters.map((name, i) => {
              const vip = i >= vipCount;
              return (
                <div
                  key={`${name}-${i}`}
                  className="flex items-center gap-2.5 border-t w-line py-2.5 first:border-t-0"
                  style={vip ? { opacity: 0.55 } : undefined}
                >
                  <span className="w-4 shrink-0 text-center text-[11px] tabular-nums opacity-40">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px]">{name}</span>
                  {vip && (
                    <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-extrabold text-amber-400">
                      <Crown className="size-3" fill="currentColor" />
                      VIP
                    </span>
                  )}
                  <span className="shrink-0 text-[10px] tabular-nums opacity-35">{durations[i] ?? ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  },
  {
    type: 'media.audio-card',
    category: 'media',
    name: '有声书 / 播客卡片',
    desc: '方形封面 + 播放圆钮 + 标题作者 + 进度条',
    icon: BookAudio,
    Interactive: AudioCardInteractive,
    defaultProps: { title: '百年孤独（有声剧版）', author: '马尔克斯 · 演播：阿磊', progress: 35 },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'author', label: '作者 / 演播者', type: 'text' },
      { key: 'progress', label: '播放进度 (%)', type: 'number', min: 0, max: 100, step: 1 },
    ],
    render: (p) => {
      const percent = pct(p.progress, 35);
      return (
        <div className="w-card flex items-center gap-3 p-3" style={{ borderRadius: 'var(--pr)' }}>
          {/* 方形封面渐变 */}
          <div
            className="relative flex size-16 shrink-0 items-center justify-center"
            style={{ borderRadius: 'calc(var(--pr) - 2px)', background: PRIMARY_GRAD }}
          >
            <Headphones className="size-6 text-white/90" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold">{p.title}</div>
            <div className="mt-0.5 truncate text-[10px] opacity-45">{p.author}</div>
            {/* 进度条（主色已播比例） */}
            <div className="mt-2 flex items-center gap-2">
              <div className="w-chip h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
                <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--p)' }} />
              </div>
              <span className="shrink-0 text-[10px] font-semibold tabular-nums" style={{ color: 'var(--p)' }}>{percent}%</span>
            </div>
          </div>
          {/* 主色播放圆钮 */}
          <PlayKnob size={36} iconSize={15} />
        </div>
      );
    },
  },
  {
    type: 'media.schedule-row',
    category: 'media',
    name: '追剧日历条',
    desc: '星期徽标列（今天主色高亮）+ 更新剧名列表',
    icon: CalendarDays,
    Interactive: ScheduleRowInteractive,
    defaultProps: { weekday: '三', titles: '漫长的季节,繁花,庆余年第二季,三体' },
    fields: [
      {
        key: 'weekday', label: '今天（星期）', type: 'select',
        options: [
          { label: '周一', value: '一' },
          { label: '周二', value: '二' },
          { label: '周三', value: '三' },
          { label: '周四', value: '四' },
          { label: '周五', value: '五' },
          { label: '周六', value: '六' },
          { label: '周日', value: '日' },
        ],
      },
      { key: 'titles', label: '更新剧名', type: 'textarea', placeholder: '逗号分隔，取前 7 部' },
    ],
    render: (p) => {
      const days = ['一', '二', '三', '四', '五', '六', '日'];
      const today = days.includes(String(p.weekday)) ? String(p.weekday) : '三';
      const titles = splitList(p.titles).slice(0, 7);
      return (
        <div className="w-card flex gap-3 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          {/* 星期徽标列（今天主色高亮） */}
          <div className="flex shrink-0 flex-col gap-1">
            {days.map((d) => {
              const on = d === today;
              return (
                <span
                  key={d}
                  className={`flex size-5 items-center justify-center rounded-md text-[10px] leading-none ${on ? 'font-bold' : 'w-chip opacity-50'}`}
                  style={on ? { background: 'var(--p)', color: 'var(--pf)' } : undefined}
                >
                  {d}
                </span>
              );
            })}
          </div>
          {/* 剧名列表（按行均分高度，与星期列对齐） */}
          <div className="flex min-w-0 flex-1 flex-col">
            {titles.map((t, i) => (
              <div
                key={`${t}-${i}`}
                className={`flex min-h-5 flex-1 items-center gap-2 ${i < titles.length - 1 ? 'border-b w-line' : ''}`}
              >
                <span className="size-1.5 shrink-0 rounded-full bg-current opacity-30" />
                <span className="min-w-0 flex-1 truncate text-xs">{t}</span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
];
