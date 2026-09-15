import {
  Image as ImageIcon, Newspaper, Grid3x3, Heart, MessageCircle, Share2, Hash,
  Flame, TrendingUp, UserPlus, MonitorPlay, Play, Radio, Eye, CircleUserRound,
  Users, MessagesSquare, BadgeCheck,
} from 'lucide-react';
import type { WidgetDef } from '@/lib/widget-types';

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
    name: '直播卡',
    desc: '封面 + LIVE 红标 + 观看人数',
    icon: Radio,
    defaultProps: { anchor: '薇薇安ViVi', viewers: '1.2万' },
    fields: [
      { key: 'anchor', label: '主播昵称', type: 'text' },
      { key: 'viewers', label: '观看人数', type: 'text' },
    ],
    render: (p) => (
      <div
        className="relative h-36 overflow-hidden"
        style={{
          borderRadius: 'var(--pr)',
          background: 'linear-gradient(118deg, var(--p) 0%, color-mix(in srgb, var(--p) 62%, #fff) 58%, color-mix(in srgb, var(--p) 88%, #000) 100%)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="size-10 opacity-30" style={{ color: 'var(--pf)' }} />
        </div>
        {/* 左上角 LIVE 红标（呼吸圆点） */}
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-rose-500 px-1.5 py-1 text-[10px] font-black leading-none text-white">
          <span className="size-1.5 animate-pulse rounded-full bg-white" />
          LIVE
        </span>
        {/* 右上角观看人数 */}
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[10px] font-semibold leading-none text-white">
          <Eye className="size-3" />
          {p.viewers}
        </span>
        {/* 底部主播条 */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/45 to-transparent px-2.5 pb-2 pt-6">
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
            style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--p)' }}
          >
            {String(p.anchor || '播').slice(0, 1)}
          </span>
          <span className="truncate text-xs font-semibold text-white">{p.anchor}</span>
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
