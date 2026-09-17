'use client';

import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Image as ImageIcon, Heart, JapaneseYen, Palette, Minus, Plus, ShieldCheck, Truck,
  RotateCcw, Star, MapPin, ChevronRight, ShoppingCart, MessageCircle, ReceiptText, X,
} from 'lucide-react';
import type { WidgetDef, InteractiveCtx } from '@/lib/widget-types';
import { useChannelSetter, useChannelValue } from '@/lib/interaction-bus';
import {
  galleryMainOf, imageSrcOf, isInlineEmoji, parseGalleryValue, serializeGalleryValue,
  toGalleryList, toStringList,
} from '@/lib/image-value';
import { QtyStepperInteractive, SkuSelectInteractive } from './interactive';
import { stopAct, useAction, useLocalToggle, ActStatusIcon } from './action-kit';
import { SwipeDeck } from './swipe-deck';

/**
 * 购物 / 商品详情 组件库（目录：shopping）
 * 规范与 login.tsx 一致：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应；
 * 图片位一律使用渐变 + lucide 图标占位，禁止外部图片 URL。
 */

/** 逗号 / 中文逗号分隔 → 字符串数组（去空白项） */
const splitList = (raw: unknown): string[] =>
  String(raw ?? '').split(/[,,]/).map((s) => s.trim()).filter(Boolean);

/* ------------------------------------------------------------------ */
/* Interactive 实现（仅预览模式挂载）：预览中按钮/开关原地生效，杜绝死按钮 */
/* ------------------------------------------------------------------ */

/** SKU 缩略圆片：chips 内的效果图小圆点（图片/表情），无图返回 null */
export function SkuThumb({ value }: { value: unknown }) {
  const src = imageSrcOf(value);
  const emoji = !src && isInlineEmoji(value) ? String(value).trim() : '';
  if (!src && !emoji) return null;
  return src ? (
     
    <img src={src} alt="" draggable={false} className="size-4 shrink-0 rounded-full object-cover shadow-sm" />
  ) : (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-black/5 text-[9px] leading-none">{emoji}</span>
  );
}

/** 主图渐变底（主题色随主题） */
const HERO_GRAD =
  'linear-gradient(160deg, color-mix(in srgb, var(--p) 22%, transparent), color-mix(in srgb, var(--p) 52%, transparent))';

/** 单页媒体：dataURL/链接 → 真实图片（cover 填满 / contain 完整展示），
 *  表情 → 大表情，空 → 渐变占位。bare=true 透明底（大图查看的黑底场景） */
function MediaSlide({ value, contain = false, bare = false }: { value: string; contain?: boolean; bare?: boolean }) {
  const src = imageSrcOf(value);
  const emoji = !src && isInlineEmoji(value) ? value.trim() : '';
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: bare ? 'transparent' : HERO_GRAD }}
    >
      {src ? (
        <img
          src={src}
          alt="商品图片"
          draggable={false}
          className={`size-full ${contain ? 'object-contain' : 'object-cover'}`}
        />
      ) : emoji ? (
        <span className={`leading-none drop-shadow-sm ${contain ? 'text-8xl' : 'text-6xl'}`}>{emoji}</span>
      ) : (
        <ImageIcon className={`size-14 ${bare ? 'text-white/35' : 'opacity-30'}`} />
      )}
    </div>
  );
}

/** 静态主图媒体层（编辑器画布用）：值变化时 crossfade 丝滑过渡 */
function HeroMediaLayer({ value }: { value: string }) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={value || 'ph'}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <MediaSlide value={value} />
      </motion.div>
    </AnimatePresence>
  );
}

/** 大图查看弹层：手机屏内原位全屏（portal 到 #phone-screen），
 *  左右滑动切换 + 弹簧跟手，不产生新页面 */
function HeroLightbox({
  deck, index, label, onIndexChange, onClose,
}: {
  deck: string[];
  index: number;
  label: string | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const target = typeof document !== 'undefined' ? document.getElementById('phone-screen') : null;
  const node = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute inset-0 z-[70] flex flex-col bg-black/90 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-label="商品大图查看"
    >
      {/* 顶栏：计数 + 关闭 */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs font-semibold tabular-nums text-white/85">
          {index + 1} / {deck.length}
        </span>
        <button
          type="button"
          aria-label="关闭大图"
          onClick={onClose}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-transform active:scale-90"
        >
          <X className="size-4" />
        </button>
      </div>
      {/* 大图：左右滑动 + 弹簧，完整展示不裁切 */}
      <div className="min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
        <SwipeDeck
          className="size-full"
          count={deck.length}
          index={index}
          onIndexChange={onIndexChange}
          showArrows={false}
          renderItem={(i) => (
            <motion.div
              key={`${i}-${deck[i] ?? 'ph'}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="size-full"
            >
              <MediaSlide value={deck[i] ?? ''} contain bare />
            </motion.div>
          )}
        />
      </div>
      {/* 底部：圆点直达 + 已选标签 */}
      <div className="flex shrink-0 flex-col items-center gap-2 pb-4 pt-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1.5">
          {deck.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`查看第 ${i + 1} 张图`}
              onClick={() => onIndexChange(i)}
              className="h-1.5 cursor-pointer rounded-full transition-all duration-300"
              style={{ width: i === index ? 14 : 6, background: i === index ? '#fff' : 'rgba(255,255,255,0.4)' }}
            />
          ))}
        </div>
        {label && (
          <span className="max-w-[80%] truncate rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white/90">
            {label}
          </span>
        )}
      </div>
    </motion.div>
  );
  return target ? createPortal(node, target) : node;
}

/** 图片列表属性 → 干净的字符串数组（过滤空项；兼容旧存档非数组值） */
const toImageList = (raw: unknown): string[] =>
  (Array.isArray(raw) ? raw : []).map((s) => String(s ?? '')).filter(Boolean);

/** 商品主图：轮播图片（可上传）+ 收藏心形原地翻转 + SKU 选中自动切换效果图组。
 *  主图支持左右滑动（弹簧跟手）；干净点击 → 大图查看弹层（原位，不跳页） */
function DetailHeroInteractive({ props }: InteractiveCtx) {
  const [fav, toggleFav] = useLocalToggle(false);
  const { toast } = useAction();
  const setBus = useChannelSetter();
  const images = useMemo(() => toImageList(props.images), [props.images]);
  const linkChannel = String(props.linkChannel || 'sku');
  /* 订阅 SKU 选择器写入的频道：:img = 当前效果图组（JSON 图组），:主频道 = 已选规格文案 */
  const skuImgRaw = useChannelValue(`${linkChannel}:img`);
  const skuLabel = useChannelValue(linkChannel);
  const skuGallery = useMemo(() => parseGalleryValue(skuImgRaw), [skuImgRaw]);
  const [zoom, setZoom] = useState(false);

  const showingSku = skuGallery.length > 0;
  const deck = showingSku ? skuGallery : images;
  /* 图组位置（纯派生）：deckKey 变化（点另一选项/退出效果图）自动归零回第一张，无需 effect */
  const deckKey = deck.join('\u0000');
  const [pos, setPos] = useState({ key: deckKey, idx: 0 });
  const safeIdx = pos.key === deckKey ? Math.min(pos.idx, Math.max(0, deck.length - 1)) : 0;
  const setIdx = (i: number) => setPos({ key: deckKey, idx: i });

  return (
    <div className="relative h-[260px] w-full">
      {/* 媒体层：SKU 效果图组 / 自身轮播，左右滑动 + 点击查看大图（原位弹层不跳页） */}
      {deck.length > 0 ? (
        <SwipeDeck
          className="size-full"
          count={deck.length}
          index={safeIdx}
          onIndexChange={setIdx}
          onTap={() => setZoom(true)}
          renderItem={(i) => (
            <motion.div
              key={`${i}-${deck[i] ?? 'ph'}`}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="size-full"
            >
              <MediaSlide value={deck[i] ?? ''} />
            </motion.div>
          )}
        />
      ) : (
        <MediaSlide value="" />
      )}
      {/* 右上角收藏心形：点击原地翻转 */}
      {props.fav !== false && (
        <button
          type="button"
          aria-label={fav ? '取消收藏' : '收藏商品'}
          onClick={(e) => {
            stopAct(e);
            toggleFav();
            toast(fav ? '已取消收藏' : '已收藏', 'success');
          }}
          className="absolute right-3 top-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/25 transition-transform active:scale-[0.88]"
        >
          <Heart
            className="size-4 text-white transition-colors"
            style={fav ? { color: '#f43f5e', fill: '#f43f5e' } : undefined}
          />
        </button>
      )}
      {/* 已选规格浮层：SKU 触发效果图切换时滑入提示；带 × 可退出效果图回轮播（不跳页、原地联动） */}
      <AnimatePresence>
        {showingSku && skuLabel && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-3 left-3 z-10 flex max-w-[60%] items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-sm"
          >
            <span className="size-1.5 shrink-0 rounded-full" style={{ background: 'var(--p)' }} />
            <span className="truncate text-[10px] font-semibold text-white">已选 · {skuLabel}</span>
            <button
              type="button"
              aria-label="退出效果图，回到轮播"
              onClick={(e) => { stopAct(e); setBus(`${linkChannel}:img`, ''); }}
              className="ml-0.5 flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/25 text-white transition-transform active:scale-90"
            >
              <X className="size-2.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 底部指示点：导航当前图组（SKU 效果图组 / 自身轮播组）；无图 → 装饰点 */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {deck.length > 0
          ? deck.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`查看第 ${i + 1} 张图`}
                onClick={(e) => { stopAct(e); setIdx(i); }}
                className="h-1.5 cursor-pointer rounded-full transition-all duration-300"
                style={{
                  width: i === safeIdx ? 12 : 6,
                  background: i === safeIdx ? '#fff' : 'color-mix(in srgb, #fff 45%, transparent)',
                }}
              />
            ))
          : Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="size-1.5 rounded-full"
                style={{ background: i === 0 ? '#fff' : 'color-mix(in srgb, #fff 45%, transparent)' }}
              />
            ))}
      </div>
      {/* 大图查看：原位全屏弹层（手机屏内），左右滑动观看，不产生新页面 */}
      <AnimatePresence>
        {zoom && deck.length > 0 && (
          <HeroLightbox
            deck={deck}
            index={safeIdx}
            label={showingSku && skuLabel ? `已选 · ${skuLabel}` : null}
            onIndexChange={setIdx}
            onClose={() => setZoom(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** 服务保障行：整行点击 → 已绑定页面则跳页（onTap），否则 toast 服务说明 */
function ServiceRowInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  return (
    <div
      role="button"
      aria-label="查看服务说明"
      onClick={(e) => {
        stopAct(e);
        if (onTap) onTap();
        else toast('查看服务说明（演示）', 'info');
      }}
      className="flex cursor-pointer items-center justify-between border-y w-line px-1 py-3 transition-opacity active:opacity-80"
    >
      {[
        { icon: Truck, text: props.s1 },
        { icon: RotateCcw, text: props.s2 },
        { icon: ShieldCheck, text: props.s3 },
      ].map(({ icon: Icon, text }, i) => (
        <span key={i} className="flex items-center gap-1.5 text-[11px] opacity-65">
          <Icon className="size-3.5" style={{ color: 'var(--p)' }} />
          {text}
        </span>
      ))}
    </div>
  );
}

/** 收货地址条：整行点击 → 已绑定页面则跳页（onTap），否则 toast 选择地址 */
function AddressBarInteractive({ props, onTap }: InteractiveCtx) {
  const { toast } = useAction();
  return (
    <div
      role="button"
      aria-label="选择收货地址"
      onClick={(e) => {
        stopAct(e);
        if (onTap) onTap();
        else toast('选择收货地址（演示）', 'info');
      }}
      className="w-card flex cursor-pointer items-center gap-3 p-3.5 transition-opacity active:opacity-80"
      style={{ borderRadius: 'var(--pr)' }}
    >
      <MapPin className="size-5 shrink-0" style={{ color: 'var(--p)' }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">
          {props.name}
          <span className="ml-2">{props.phone}</span>
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-4 opacity-55">{props.address}</p>
      </div>
      <ChevronRight className="size-4 shrink-0 opacity-35" />
    </div>
  );
}

/** 底部操作条：加购 busy→成功 toast；购买跳页/结算提示；购物车/客服图标独立 toast */
function AddCartBarInteractive({ props, onTap }: InteractiveCtx) {
  const { toast, busy, done, run } = useAction();
  return (
    <div
      className="w-card flex h-14 items-center gap-3.5 border-t w-line px-4"
      style={{ borderRadius: 'calc(var(--pr) + 2px) calc(var(--pr) + 2px) 0 0' }}
    >
      {/* 左侧竖排小图标钮 */}
      <button
        type="button"
        aria-label="购物车"
        onClick={(e) => { stopAct(e); toast('购物车（演示）', 'info'); }}
        className="flex shrink-0 cursor-pointer flex-col items-center gap-0.5 opacity-70 transition-opacity active:opacity-50"
      >
        <ShoppingCart className="size-[18px]" />
        <span className="text-[9px] leading-none">购物车</span>
      </button>
      <button
        type="button"
        aria-label="联系客服"
        onClick={(e) => { stopAct(e); toast('联系客服（演示）', 'info'); }}
        className="flex shrink-0 cursor-pointer flex-col items-center gap-0.5 opacity-70 transition-opacity active:opacity-50"
      >
        <MessageCircle className="size-[18px]" />
        <span className="text-[9px] leading-none">客服</span>
      </button>
      {/* 右侧大按钮 */}
      <div className="ml-auto flex flex-1 items-center gap-2">
        <button
          type="button"
          aria-label={String(props.cartText || '加入购物车')}
          onClick={(e) => { stopAct(e); run(() => toast('已加入购物车 🛒', 'success')); }}
          className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 text-[13px] font-bold active:scale-[0.98]"
          style={{
            borderRadius: 'calc(var(--pr) + 4px)',
            background: 'color-mix(in srgb, var(--p) 14%, transparent)',
            color: 'var(--p)',
          }}
        >
          <ActStatusIcon busy={busy} done={done} />
          {props.cartText}
        </button>
        <button
          type="button"
          aria-label={String(props.buyText || '立即购买')}
          onClick={(e) => {
            stopAct(e);
            if (onTap) onTap();
            else toast('跳转结算（演示）', 'info');
          }}
          className="h-10 flex-1 cursor-pointer text-[13px] font-bold shadow-md active:scale-[0.98]"
          style={{ borderRadius: 'calc(var(--pr) + 4px)', background: 'var(--p)', color: 'var(--pf)' }}
        >
          {props.buyText}
        </button>
      </div>
    </div>
  );
}

export const widgets: WidgetDef[] = [
  {
    type: 'shop.detail-hero',
    category: 'shopping',
    name: '商品主图',
    desc: '轮播图片（可上传）+ SKU 选中自动切效果图',
    icon: ImageIcon,
    fullBleed: true,
    defaultProps: { fav: true, images: [], linkChannel: 'sku' },
    fields: [
      { key: 'images', label: '轮播图片', type: 'images', max: 6 },
      { key: 'fav', label: '显示收藏按钮', type: 'switch' },
      { key: 'linkChannel', label: '联动频道（高级）', type: 'text', placeholder: '读取 SKU 选择的效果图，如 sku' },
    ],
    Interactive: DetailHeroInteractive,
    render: (p) => {
      const images = toImageList(p.images);
      return (
        <div className="relative h-[260px] w-full">
          <HeroMediaLayer value={images[0] ?? ''} />
          {/* 右上角收藏心形 */}
          {p.fav !== false && (
            <span className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/25">
              <Heart className="size-4 text-white" />
            </span>
          )}
          {/* 底部指示点：有真实图 → 真实数量长点；无图 → 装饰点 */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.length > 0
              ? images.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: i === 0 ? 12 : 6, background: i === 0 ? '#fff' : 'color-mix(in srgb, #fff 45%, transparent)' }}
                  />
                ))
              : Array.from({ length: 5 }).map((_, i) => (
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
    type: 'shop.price-row',
    category: 'shopping',
    name: '价格行',
    desc: '大字价格 + 划线原价 + 标签组',
    icon: JapaneseYen,
    defaultProps: { price: '1299', original: '1699', sales: '3.2万', tags: '包邮,顺丰' },
    fields: [
      { key: 'price', label: '售价', type: 'text' },
      { key: 'original', label: '原价', type: 'text' },
      { key: 'sales', label: '已售', type: 'text' },
      { key: 'tags', label: '标签', type: 'textarea', placeholder: '逗号分隔，如：包邮,顺丰' },
    ],
    render: (p) => (
      <div className="flex items-start justify-between px-0.5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold leading-none" style={{ color: 'var(--p)' }}>
              <span className="text-sm">¥</span>{p.price}
            </span>
            <span className="text-xs line-through opacity-40">¥{p.original}</span>
          </div>
          <p className="mt-1.5 text-[11px] opacity-45">已售 {p.sales}</p>
        </div>
        {/* 右侧标签组 */}
        <div className="flex shrink-0 gap-1.5 pt-0.5">
          {splitList(p.tags).slice(0, 3).map((tag, i) => (
            <span key={`${tag}-${i}`} className="w-chip px-1.5 py-0.5 text-[10px] font-medium leading-none" style={{ borderRadius: '4px' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'shop.sku-select',
    category: 'shopping',
    name: 'SKU 选择',
    desc: '颜色/版本 chips，双击选项传多图/改价，选中联动主图',
    icon: Palette,
    defaultProps: {
      colors: '月光白,曜石黑,晨曦粉',
      versions: '标准版,高配版',
      channel: 'sku',
      colorImages: [],
      versionImages: [],
      colorPrices: [],
      versionPrices: [],
    },
    fields: [
      { key: 'colors', label: '颜色', type: 'textarea', placeholder: '逗号分隔' },
      { key: 'versions', label: '版本', type: 'textarea', placeholder: '逗号分隔' },
      { key: 'colorImages', label: '颜色效果图', type: 'images', alignTo: 'colors' },
      { key: 'versionImages', label: '版本效果图', type: 'images', alignTo: 'versions' },
      { key: 'channel', label: '联动频道（高级）', type: 'text', placeholder: '写入已选规格与效果图，如 sku' },
    ],
    Interactive: SkuSelectInteractive,
    render: (p) => {
      const colorGals = toGalleryList(p.colorImages);
      const versionGals = toGalleryList(p.versionImages);
      const colorPrices = toStringList(p.colorPrices);
      const versionPrices = toStringList(p.versionPrices);
      return (
        <div className="w-card space-y-3.5 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
          {[
            { label: '颜色', items: splitList(p.colors), gals: colorGals, prices: colorPrices, imgKey: 'colorImages' as const },
            { label: '版本', items: splitList(p.versions), gals: versionGals, prices: versionPrices, imgKey: 'versionImages' as const },
          ].filter((row) => row.items.length > 0).map((row) => (
            <div key={row.label} className="flex items-start gap-3">
              <span className="w-7 shrink-0 pt-0.5 text-xs opacity-50">{row.label}</span>
              <div className="flex flex-wrap gap-1.5">
                {row.items.map((item, i) => {
                  const active = i === 0; // 默认选中第一项
                  const img = galleryMainOf(row.gals, i);
                  const hasThumb = !!imageSrcOf(img) || !!isInlineEmoji(img);
                  const price = (row.prices[i] ?? '').trim();
                  /* 编辑器双击标记：双击 chip → 打开该选项的效果图编辑弹窗（名称/价格/多图上传） */
                  const marker = { 'data-sku-row': row.imgKey, 'data-sku-index': i, 'data-sku-name': item };
                  const chip = (
                    <>
                      {hasThumb && <SkuThumb value={img} />}
                      {item}
                      {price && <span className="text-[9px] font-bold opacity-55">¥{price}</span>}
                    </>
                  );
                  return active ? (
                    <span
                      key={`${item}-${i}`}
                      {...marker}
                      className="flex cursor-pointer items-center gap-1.5 px-2 py-1 text-xs font-semibold"
                      style={{
                        borderRadius: 'calc(var(--pr) - 6px)',
                        border: '1px solid var(--p)',
                        background: 'color-mix(in srgb, var(--p) 10%, transparent)',
                        color: 'var(--p)',
                      }}
                    >
                      {chip}
                    </span>
                  ) : (
                    <span
                      key={`${item}-${i}`}
                      {...marker}
                      className="w-chip flex cursor-pointer items-center gap-1.5 px-2 py-1 text-xs opacity-65"
                      style={{ borderRadius: 'calc(var(--pr) - 6px)' }}
                    >
                      {chip}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'shop.qty-stepper',
    category: 'shopping',
    name: '数量步进器',
    desc: '购买数量 + 圆形加减按钮',
    icon: Minus,
    defaultProps: { label: '购买数量', value: 1, channel: 'qty' },
    fields: [
      { key: 'label', label: '左侧文案', type: 'text' },
      { key: 'value', label: '数量', type: 'number', min: 1, max: 99, step: 1 },
      { key: 'channel', label: '联动频道（高级）', type: 'text', placeholder: '写入当前数量，如 qty' },
    ],
    Interactive: QtyStepperInteractive,
    render: (p) => (
      <div className="flex items-center justify-between px-0.5">
        <span className="text-sm font-semibold">{p.label}</span>
        <div className="flex items-center gap-2.5">
          {/* 圆形步进按钮 */}
          <span className="w-chip flex size-7 items-center justify-center rounded-full border w-line">
            <Minus className="size-3.5 opacity-55" />
          </span>
          <span className="min-w-6 text-center text-sm font-bold">{p.value}</span>
          <span className="w-chip flex size-7 items-center justify-center rounded-full border w-line" style={{ color: 'var(--p)' }}>
            <Plus className="size-3.5" />
          </span>
        </div>
      </div>
    ),
  },
  {
    type: 'shop.service-row',
    category: 'shopping',
    name: '服务保障行',
    desc: '三项服务承诺横排',
    icon: ShieldCheck,
    defaultProps: { s1: '顺丰包邮', s2: '七天无理由', s3: '正品保障' },
    fields: [
      { key: 's1', label: '第一项文案', type: 'text' },
      { key: 's2', label: '第二项文案', type: 'text' },
      { key: 's3', label: '第三项文案', type: 'text' },
    ],
    Interactive: ServiceRowInteractive,
    render: (p) => (
      <div className="flex items-center justify-between border-y w-line px-1 py-3">
        {[
          { icon: Truck, text: p.s1 },
          { icon: RotateCcw, text: p.s2 },
          { icon: ShieldCheck, text: p.s3 },
        ].map(({ icon: Icon, text }, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11px] opacity-65">
            <Icon className="size-3.5" style={{ color: 'var(--p)' }} />
            {text}
          </span>
        ))}
      </div>
    ),
  },
  {
    type: 'shop.review-item',
    category: 'shopping',
    name: '评价卡片',
    desc: '用户评价 + 官方回复',
    icon: Star,
    defaultProps: {
      user: '柠*檬',
      date: '2025-06-18',
      content: '面膜超级服帖，敷完水润润的，第二天上妆也不卡粉，已经是回购的第三盒了！',
      reply: '感谢您的信任与支持，我们会持续带来更多好用的新品～',
    },
    fields: [
      { key: 'user', label: '用户名', type: 'text' },
      { key: 'date', label: '日期', type: 'text' },
      { key: 'content', label: '评价内容', type: 'textarea' },
      { key: 'reply', label: '官方回复', type: 'textarea' },
    ],
    render: (p) => (
      <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
        <div className="flex items-center gap-2.5">
          {/* 圆形首字头像 */}
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: 'color-mix(in srgb, var(--p) 15%, transparent)', color: 'var(--p)' }}
          >
            {String(p.user || '评').slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{p.user}</p>
            <div className="mt-1 flex gap-0.5">
              {/* 五星（主色填充） */}
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3" style={{ color: 'var(--p)', fill: 'var(--p)' }} />
              ))}
            </div>
          </div>
          <span className="shrink-0 text-[10px] opacity-40">{p.date}</span>
        </div>
        <p className="mt-2.5 line-clamp-2 text-xs leading-5 opacity-75">{p.content}</p>
        {/* 官方回复浅色块 */}
        <div className="w-chip mt-3 p-2.5 text-[11px] leading-4 opacity-60" style={{ borderRadius: 'calc(var(--pr) - 6px)' }}>
          <span className="font-semibold" style={{ color: 'var(--p)' }}>官方回复：</span>
          {p.reply}
        </div>
      </div>
    ),
  },
  {
    type: 'shop.address-bar',
    category: 'shopping',
    name: '收货地址条',
    desc: '姓名电话 + 详细地址',
    icon: MapPin,
    defaultProps: { name: '林晓', phone: '138****6688', address: '浙江省杭州市西湖区文三路 138 号 西溪世纪广场 3 幢 802 室' },
    fields: [
      { key: 'name', label: '姓名', type: 'text' },
      { key: 'phone', label: '电话', type: 'text' },
      { key: 'address', label: '地址', type: 'textarea' },
    ],
    Interactive: AddressBarInteractive,
    render: (p) => (
      <div className="w-card flex items-center gap-3 p-3.5" style={{ borderRadius: 'var(--pr)' }}>
        <MapPin className="size-5 shrink-0" style={{ color: 'var(--p)' }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">
            {p.name}
            <span className="ml-2">{p.phone}</span>
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-4 opacity-55">{p.address}</p>
        </div>
        <ChevronRight className="size-4 shrink-0 opacity-35" />
      </div>
    ),
  },
  {
    type: 'shop.add-cart-bar',
    category: 'shopping',
    name: '底部操作条',
    desc: '购物车 / 客服 + 加购与购买按钮',
    icon: ShoppingCart,
    fullBleed: true,
    defaultProps: { cartText: '加入购物车', buyText: '立即购买' },
    fields: [
      { key: 'cartText', label: '加购按钮文案', type: 'text' },
      { key: 'buyText', label: '购买按钮文案', type: 'text' },
    ],
    Interactive: AddCartBarInteractive,
    render: (p) => (
      <div
        className="w-card flex h-14 items-center gap-3.5 border-t w-line px-4"
        style={{ borderRadius: 'calc(var(--pr) + 2px) calc(var(--pr) + 2px) 0 0' }}
      >
        {/* 左侧竖排小图标钮 */}
        <span className="flex shrink-0 flex-col items-center gap-0.5 opacity-70">
          <ShoppingCart className="size-[18px]" />
          <span className="text-[9px] leading-none">购物车</span>
        </span>
        <span className="flex shrink-0 flex-col items-center gap-0.5 opacity-70">
          <MessageCircle className="size-[18px]" />
          <span className="text-[9px] leading-none">客服</span>
        </span>
        {/* 右侧大按钮 */}
        <div className="ml-auto flex flex-1 items-center gap-2">
          <button
            className="h-10 flex-1 text-[13px] font-bold active:scale-[0.98]"
            style={{
              borderRadius: 'calc(var(--pr) + 4px)',
              background: 'color-mix(in srgb, var(--p) 14%, transparent)',
              color: 'var(--p)',
            }}
          >
            {p.cartText}
          </button>
          <button
            className="h-10 flex-1 text-[13px] font-bold shadow-md active:scale-[0.98]"
            style={{ borderRadius: 'calc(var(--pr) + 4px)', background: 'var(--p)', color: 'var(--pf)' }}
          >
            {p.buyText}
          </button>
        </div>
      </div>
    ),
  },
  {
    type: 'shop.order-summary',
    category: 'shopping',
    name: '订单汇总',
    desc: '金额明细 + 实付款',
    icon: ReceiptText,
    defaultProps: { goods: '1299.00', freight: '免运费', coupon: '100', total: '1199.00' },
    fields: [
      { key: 'goods', label: '商品金额', type: 'text' },
      { key: 'freight', label: '运费', type: 'text' },
      { key: 'coupon', label: '优惠券', type: 'text' },
      { key: 'total', label: '实付款', type: 'text' },
    ],
    render: (p) => (
      <div className="w-card p-4" style={{ borderRadius: 'var(--pr)' }}>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="opacity-55">商品金额</span>
            <span>¥{p.goods}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="opacity-55">运费</span>
            <span>{p.freight}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="opacity-55">优惠券</span>
            <span style={{ color: 'var(--p)' }}>-¥{p.coupon}</span>
          </div>
        </div>
        <div className="my-3.5 h-px w-line border-t" />
        {/* 实付款右对齐主色大字 */}
        <div className="flex items-baseline justify-end gap-1.5">
          <span className="text-xs opacity-55">实付款</span>
          <span className="text-xl font-extrabold leading-none" style={{ color: 'var(--p)' }}>
            <span className="text-xs">¥</span>{p.total}
          </span>
        </div>
      </div>
    ),
  },
];
