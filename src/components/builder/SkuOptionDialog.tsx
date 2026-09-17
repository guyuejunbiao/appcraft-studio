'use client';

import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Check, ImagePlus, Link2, Loader2, Star, Tag, X } from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { getWidget } from '@/components/widgets/registry';
import { SwipeDeck } from '@/components/widgets/swipe-deck';
import {
  fileToDataUrl, imageSrcOf, isInlineEmoji, toGalleryList,
} from '@/lib/image-value';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

/**
 * SKU 选项编辑弹窗（编辑器画布双击选项触发）：
 * 双击「月光白」→ 弹窗编辑 名称 / 价格 / 效果图（多图上传、链接、表情）。
 * 上传的图片直接显示在弹窗顶部的「商品主图位置」，支持左右滑动观看；
 * 第一张 = 主图（预览中选中该选项时，页面商品主图原地切换为这组效果图，不跳页）。
 */

export interface SkuEditTarget {
  widgetId: string;
  rowKey: 'colorImages' | 'versionImages';
  nameKey: 'colors' | 'versions';
  priceKey: 'colorPrices' | 'versionPrices';
  rowLabel: string; /* 颜色 / 版本 */
  index: number;
}

/** 主图媒体渲染（与预览端 MediaSlide 同逻辑：图片/表情/占位三态） */
function MainImageSlide({ value }: { value: string }) {
  const src = imageSrcOf(value);
  const emoji = !src && isInlineEmoji(value) ? value.trim() : '';
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: emoji
          ? 'linear-gradient(160deg, color-mix(in srgb, var(--p) 18%, #fff), color-mix(in srgb, var(--p) 40%, #fff))'
          : src
            ? 'transparent'
            : 'linear-gradient(160deg, color-mix(in srgb, var(--p) 14%, #fff), color-mix(in srgb, var(--p) 38%, #fff))',
      }}
    >
      {src ? (
        <img src={src} alt="商品效果图" draggable={false} className="size-full object-cover" />
      ) : emoji ? (
        <span className="text-6xl leading-none drop-shadow-sm">{emoji}</span>
      ) : (
        <ImagePlus className="size-9 text-zinc-300" />
      )}
    </div>
  );
}

export function SkuOptionDialog({ target, onClose }: { target: SkuEditTarget; onClose: () => void }) {
  const pages = useBuilder((s) => s.pages);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const updateWidgetProps = useBuilder((s) => s.updateWidgetProps);

  const widget = useMemo(
    () => pages.find((p) => p.id === currentPageId)?.components.find((w) => w.id === target.widgetId),
    [pages, currentPageId, target.widgetId]
  );
  const def = widget ? getWidget(widget.type) : null;
  const merged = useMemo(
    () => (widget && def ? { ...def.defaultProps, ...widget.props } : null),
    [widget, def]
  );

  const names = useMemo(
    () =>
      String(merged?.[target.nameKey] ?? '')
        .split(/[,,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    [merged, target.nameKey]
  );
  const prices = useMemo(
    () =>
      Array.isArray(merged?.[target.priceKey])
        ? (merged?.[target.priceKey] as unknown[]).map((s) => String(s ?? ''))
        : [],
    [merged, target.priceKey]
  );
  const galleries = useMemo(() => toGalleryList(merged?.[target.rowKey]), [merged, target.rowKey]);

  /* 本地草稿：保存时一次性写回（双击 → 弹窗内随便改 → 保存生效 / 取消不动） */
  const [name, setName] = useState(names[target.index] ?? '');
  const [price, setPrice] = useState((prices[target.index] ?? '').trim());
  const [gallery, setGallery] = useState<string[]>(galleries[target.index] ?? []);
  const [idx, setIdx] = useState(0);
  const [urlDraft, setUrlDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const safeIdx = Math.min(idx, Math.max(0, gallery.length - 1));

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const base = gallery.length;
    try {
      const urls = await Promise.all(Array.from(files).map((f) => fileToDataUrl(f)));
      const ok = urls.filter(Boolean);
      if (ok.length) {
        setGallery((g) => [...g, ...ok]);
        setIdx(base); /* 上传的图直接跳到主图位置显示 */
        toast.success(`已导入 ${ok.length} 张图片`);
      }
    } catch {
      toast.error('图片读取失败，可改用粘贴链接');
    } finally {
      setUploading(false);
    }
  };

  const addDraft = () => {
    const v = urlDraft.trim();
    if (!v) return;
    setGallery((g) => [...g, v]);
    setIdx(gallery.length);
    setUrlDraft('');
  };

  const removeAt = (i: number) => {
    setGallery((g) => g.filter((_, j) => j !== i));
    setIdx((cur) => Math.max(0, Math.min(cur, gallery.length - 2)));
  };

  const setMain = (i: number) => {
    if (i === 0) return;
    setGallery((g) => [g[i], ...g.filter((_, j) => j !== i)]);
    setIdx(0);
  };

  const save = () => {
    if (!widget) return;
    const nextNames = [...names];
    nextNames[target.index] = name.trim() || `选项 ${target.index + 1}`;
    const nextPrices = [...prices];
    while (nextPrices.length < nextNames.length) nextPrices.push('');
    nextPrices[target.index] = price.trim();
    const nextGals = toGalleryList(merged?.[target.rowKey]);
    while (nextGals.length < nextNames.length) nextGals.push([]);
    nextGals[target.index] = gallery;
    updateWidgetProps(widget.id, {
      [target.nameKey]: nextNames.join(','),
      [target.priceKey]: nextPrices,
      [target.rowKey]: nextGals,
    });
    toast.success(
      `已保存「${nextNames[target.index]}」${gallery.length ? `· ${gallery.length} 张效果图` : '· 已清空效果图'}`
    );
    onClose();
  };

  const node = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-950/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-label="编辑 SKU 选项效果图"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="w-[400px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
            <ImagePlus className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold leading-tight">编辑选项效果图</p>
            <p className="text-[10px] leading-tight text-zinc-400">
              {target.rowLabel} · {names[target.index] ?? `第 ${target.index + 1} 项`}
            </p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="ml-auto flex size-7 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto thin-scroll p-4">
          {/* 商品主图位置：上传的图直接显示在这里，支持左右滑动观看 */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-600">商品主图</span>
              {gallery.length > 0 && (
                <span className="text-[10px] font-semibold tabular-nums text-zinc-400">
                  {safeIdx + 1} / {gallery.length} · 可左右滑动
                </span>
              )}
            </div>
            <div className="relative h-44 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              {gallery.length > 0 ? (
                <SwipeDeck
                  className="size-full"
                  count={gallery.length}
                  index={safeIdx}
                  onIndexChange={setIdx}
                  renderItem={(i) => <MainImageSlide value={gallery[i] ?? ''} />}
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1.5">
                  <ImagePlus className="size-7 text-zinc-300" />
                  <p className="text-[11px] text-zinc-400">还没有效果图，点击下方「上传图片」</p>
                </div>
              )}
              {gallery.length > 1 && (
                <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                  {safeIdx + 1}/{gallery.length}
                </span>
              )}
            </div>

            {/* 缩略图条：点选查看 / 设为主图 / 删除 */}
            {gallery.length > 0 && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto thin-scroll pb-0.5">
                {gallery.map((v, i) => (
                  <div key={i} className="group relative shrink-0">
                    <button
                      type="button"
                      aria-label={`查看第 ${i + 1} 张图${i === 0 ? '（主图）' : ''}`}
                      onClick={() => setIdx(i)}
                      className={`size-12 cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                        i === safeIdx ? 'border-violet-500 shadow-sm' : 'border-transparent hover:border-zinc-300'
                      }`}
                    >
                      <MainImageSlide value={v} />
                    </button>
                    {i === 0 ? (
                      <span className="absolute left-0.5 top-0.5 rounded bg-violet-600 px-1 text-[8px] font-bold leading-[14px] text-white">主图</span>
                    ) : (
                      <button
                        type="button"
                        title="设为主图"
                        aria-label={`把第 ${i + 1} 张设为主图`}
                        onClick={() => setMain(i)}
                        className="absolute left-0.5 top-0.5 flex size-3.5 cursor-pointer items-center justify-center rounded bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Star className="size-2" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="删除这张图"
                      aria-label={`删除第 ${i + 1} 张图`}
                      onClick={() => removeAt(i)}
                      className="absolute -right-1 -top-1 flex size-4 cursor-pointer items-center justify-center rounded-full bg-zinc-800 text-white opacity-0 shadow transition-opacity hover:bg-rose-500 group-hover:opacity-100"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 导入区：本地上传（可多选）/ 链接 / 表情 */}
            <div className="mt-2.5 flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1 text-[11px]"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
                {uploading ? '导入中…' : '上传图片'}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={(e) => {
                  void addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <div className="relative min-w-0 flex-1">
                <Link2 className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-400" />
                <Input
                  className="h-8 pl-7 text-[11px]"
                  value={urlDraft}
                  placeholder="粘贴图片链接，或输入 ≤4 字表情（如 🌙）后点添加"
                  aria-label="图片链接或表情"
                  onChange={(e) => setUrlDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDraft();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 text-[11px]"
                disabled={!urlDraft.trim()}
                onClick={addDraft}
              >
                添加
              </Button>
            </div>
            <p className="mt-1.5 rounded-lg bg-violet-50 px-2 py-1.5 text-[10px] leading-4 text-violet-600">
              💡 第一张为商品主图；保存后预览中点击该选项，主图原地切换为这组效果图（不跳页），可左右滑动观看
            </p>
          </div>

          {/* 名称 / 价格 */}
          <div className="grid grid-cols-[1fr_88px] gap-2">
            <div>
              <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-zinc-600">
                <Tag className="size-3" /> 选项名称
              </label>
              <Input
                className="h-8 text-xs"
                value={name}
                placeholder={`如 ${names[target.index] || '月光白'}`}
                aria-label="选项名称"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-zinc-600">价格</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">¥</span>
                <Input
                  className="h-8 pl-6 text-xs"
                  value={price}
                  inputMode="decimal"
                  placeholder="选填"
                  aria-label="选项价格"
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
          <p className="text-[10px] leading-4 text-zinc-400">
            名称改的是「{target.rowLabel}」里的这个选项；价格选填，填写后会以小字显示在选项上。
          </p>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50/60 px-4 py-3">
          <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onClose}>
            取消
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 bg-violet-600 text-xs hover:bg-violet-700"
            onClick={save}
          >
            <Check className="size-3.5" /> 保存
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

  /* 画布存在缩放 transform，fixed 定位必须 portal 到 body 才能全屏居中；
   * 由父级条件挂载（skuEdit 非空才渲染），此处直接 portal（AnimatePresence 包 Portal 会吞内容） */
  const mount = typeof document !== 'undefined' ? document.body : null;
  if (!mount) return null;
  return createPortal(node, mount);
}
