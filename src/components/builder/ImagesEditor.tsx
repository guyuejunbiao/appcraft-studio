'use client';

import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImagePicker } from './ImagePicker';
import { galleryMainOf, toGalleryList } from '@/lib/image-value';

/**
 * 图片列表编辑器（字段类型 images），两种模式：
 *
 * 1. 轮播模式（无 alignNames）：自由增删/排序，如「商品主图 · 轮播图片」；
 * 2. 对齐模式（alignNames）：与逗号列表字段按序对齐（SKU 的 colors/versions）——
 *    行数随对齐字段的选项数自动对齐，行首展示选项名，不可增删行
 *    （增删选项请直接编辑「颜色/版本」文字字段，效果图按序号自动跟随）。
 *
 * 值为字符串数组（dataURL / http 链接 / 表情占位 / 空字符串），空位 = 无图；
 * 对齐模式下值为图组 string[][]（每选项多张效果图，旧单图 string[] 自动兼容）。
 */
export function ImagesEditor({
  value,
  onChange,
  max = 6,
  alignNames,
}: {
  /** 字符串数组（轮播模式）或图组 string[][]（对齐模式：每选项多图，旧单图自动兼容） */
  value: unknown;
  onChange: (v: string[] | string[][]) => void;
  max?: number;
  /** 对齐模式的选项名列表（如 ['月光白','曜石黑','晨曦粉']） */
  alignNames?: string[];
}) {
  const list: string[] = Array.isArray(value) && !Array.isArray(value[0]) ? (value as string[]) : [];

  /* ---------- 对齐模式（SKU 效果图） ---------- */
  if (alignNames) {
    /* 值为图组 string[][]（每选项多图）或旧单图 string[]（自动兼容）；行内编辑主图（第一张），
     * 多图上传/滑动观看走画布双击选项的编辑弹窗 */
    const gal = toGalleryList(value);
    const rows = Math.max(alignNames.length, gal.length);
    if (rows === 0) {
      return (
        <p className="rounded-lg bg-zinc-50 px-2.5 py-2 text-[10px] leading-4 text-zinc-400">
          先在上方「{alignNames.length === 0 ? '选项' : '选项'}」字段里添加选项，再为每个选项配效果图
        </p>
      );
    }
    const set = (i: number, v: string) => {
      const next = toGalleryList(value);
      while (next.length < rows) next.push([]);
      const rest = (next[i] ?? []).slice(1);
      next[i] = v ? [v, ...rest] : rest; /* 替换/清除主图，其余效果图保留 */
      onChange(next);
    };
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label>逐个选项配效果图</Label>
          <span className="text-[10px] font-semibold text-zinc-400">按序对应选项</span>
        </div>
        <div className="max-h-60 space-y-1.5 overflow-y-auto thin-scroll pr-0.5">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-14 shrink-0 truncate text-[10px] font-semibold text-zinc-500" title={alignNames[i] ?? `第 ${i + 1} 项`}>
                {alignNames[i] ?? `第 ${i + 1} 项`}
              </span>
              <ImagePicker compact value={galleryMainOf(gal, i)} onChange={(v) => set(i, v)} label={alignNames[i] ?? `第 ${i + 1} 项`} />
              {(gal[i]?.length ?? 0) > 1 && (
                <span className="shrink-0 rounded bg-violet-50 px-1 text-[9px] font-bold text-violet-500" title="该选项有多张效果图">
                  +{gal[i].length - 1}
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-1.5 rounded-lg bg-violet-50 px-2 py-1.5 text-[10px] leading-4 text-violet-600">
          💡 选中该选项时，商品主图自动切换成对应效果图（预览中生效，不跳页）；
          在画布上<span className="font-bold">双击选项</span>可为单个选项上传多张效果图并左右滑动观看
        </p>
      </div>
    );
  }

  /* ---------- 轮播模式（自由增删排序） ---------- */
  const set = (i: number, v: string) => onChange(list.map((s, j) => (j === i ? v : s)));
  const remove = (i: number) => onChange(list.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    if (list.length >= max) return;
    onChange([...list, '']);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label>轮播图片（可上传/链接/表情）</Label>
        <span className="text-[10px] font-semibold tabular-nums text-zinc-400">{list.length}/{max}</span>
      </div>
      {list.length === 0 && (
        <p className="mb-1.5 rounded-lg bg-zinc-50 px-2.5 py-2 text-[10px] leading-4 text-zinc-400">
          未配置时显示主题色渐变占位图；配置后主图变为真实图片轮播
        </p>
      )}
      <div className="max-h-72 space-y-1.5 overflow-y-auto thin-scroll pr-0.5">
        {list.map((it, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="w-6 shrink-0 text-center text-[10px] font-bold tabular-nums text-zinc-400">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <ImagePicker value={it} onChange={(v) => set(i, v)} label={`图 ${i + 1}`} />
            </div>
            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                title="上移"
                aria-label={`图 ${i + 1} 上移`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="flex h-3.5 w-5 items-center justify-center rounded-t text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30"
              >
                <ChevronUp className="size-2.5" />
              </button>
              <button
                type="button"
                title="下移"
                aria-label={`图 ${i + 1} 下移`}
                disabled={i === list.length - 1}
                onClick={() => move(i, 1)}
                className="flex h-3.5 w-5 items-center justify-center rounded-b text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30"
              >
                <ChevronDown className="size-2.5" />
              </button>
            </div>
            <button
              type="button"
              title="删除该图"
              aria-label={`删除图 ${i + 1}`}
              onClick={() => remove(i)}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        disabled={list.length >= max}
        onClick={add}
      >
        <Plus className="mr-1 size-3.5" /> 添加图片{list.length >= max ? '（已达上限）' : ''}
      </Button>
    </div>
  );
}
