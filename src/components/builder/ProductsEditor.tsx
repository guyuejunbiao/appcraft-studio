'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, LayoutList, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { ProductItem } from '@/components/widgets/grid-kit';

/**
 * 商品逐个编辑器（双列商品网格等）：
 * 属性面板与画布就地编辑（QuickEditor）共用——每个商品独立编辑
 * 名称 / 售价 / 原价 / 已售，可排序、可增删；
 * 跳转页面在右侧「交互」页为每个商品单独绑定（每个商品可跳不同页面）。
 *
 * focusIndex（单件模式）：画布上点中具体商品时只编辑那一件——
 * 点谁编谁，其余商品不出现；点「管理全部商品」回到整卡管理。
 */
export function ProductsEditor({
  value,
  onChange,
  max = 6,
  focusIndex,
}: {
  value: ProductItem[];
  onChange: (v: ProductItem[]) => void;
  max?: number;
  focusIndex?: number | null;
}) {
  const [showAll, setShowAll] = useState(false);
  /* 单件目标：索引有效才进入单件模式（删除/移动后越界自动回退全列表）；
     点击条目切换时由 QuickEditor 的 key 重置组件（showAll 归位单件） */
  const fi = focusIndex != null && focusIndex >= 0 && focusIndex < value.length ? focusIndex : null;

  const update = (i: number, patch: Partial<ProductItem>) =>
    onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => {
    if (value.length <= 2) return; /* 双列网格最少保留 2 个商品 */
    onChange(value.filter((_, j) => j !== i));
  };
  const add = () => {
    if (value.length >= max) return;
    onChange([...value, { name: '', price: '' }]);
  };

  /* ============ 单件模式：只渲染被点击的那一个商品 ============ */
  if (fi != null && !showAll) {
    const it = value[fi];
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label>单独编辑这个商品</Label>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700"
            title="查看并管理全部商品"
          >
            <LayoutList className="size-3" /> 全部 {value.length} 个
          </button>
        </div>
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-2">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-white">
              {fi + 1}
            </span>
            <Input
              className="h-8 min-w-0 flex-1 border-emerald-200 bg-white text-xs"
              value={it.name}
              placeholder={`商品 ${fi + 1} 名称`}
              aria-label={`商品 ${fi + 1} 名称`}
              autoFocus
              onChange={(e) => update(fi, { name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <Input
              className="h-8 border-emerald-200 bg-white text-xs"
              value={it.price}
              placeholder="售价"
              aria-label={`商品 ${fi + 1} 售价`}
              onChange={(e) => update(fi, { price: e.target.value })}
            />
            <Input
              className="h-8 border-emerald-200 bg-white text-xs"
              value={it.original ?? ''}
              placeholder="原价(选填)"
              aria-label={`商品 ${fi + 1} 原价`}
              onChange={(e) => update(fi, { original: e.target.value })}
            />
            <Input
              className="h-8 border-emerald-200 bg-white text-xs"
              value={it.sales ?? ''}
              placeholder="已售(选填)"
              aria-label={`商品 ${fi + 1} 已售`}
              onChange={(e) => update(fi, { sales: e.target.value })}
            />
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] leading-4 text-emerald-700">
            <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold">单个</span>
            画布上点其他商品可切换编辑对象，跳转页面在「交互」页单独绑定
          </p>
        </div>
      </div>
    );
  }

  /* ============ 全列表模式：整卡管理（增删排序） ============ */
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label>商品（逐个编辑）</Label>
        <span className="text-[10px] font-semibold tabular-nums text-zinc-400">{value.length}/{max}</span>
      </div>
      <div className="max-h-96 space-y-2 overflow-y-auto thin-scroll pr-0.5">
        {value.map((it, i) => (
          <div key={i} className="rounded-xl border bg-zinc-50 p-2">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded bg-zinc-200 text-[10px] font-bold text-zinc-600">
                {i + 1}
              </span>
              <Input
                className="h-8 min-w-0 flex-1 bg-white text-xs"
                value={it.name}
                placeholder={`商品 ${i + 1} 名称`}
                aria-label={`商品 ${i + 1} 名称`}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  title="上移"
                  aria-label={`商品 ${i + 1} 上移`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="flex h-4.5 w-6 items-center justify-center rounded-t text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30"
                >
                  <ChevronUp className="size-3" />
                </button>
                <button
                  type="button"
                  title="下移"
                  aria-label={`商品 ${i + 1} 下移`}
                  disabled={i === value.length - 1}
                  onClick={() => move(i, 1)}
                  className="flex h-4.5 w-6 items-center justify-center rounded-b text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30"
                >
                  <ChevronDown className="size-3" />
                </button>
              </div>
              <button
                type="button"
                title={value.length <= 2 ? '至少保留 2 个商品' : '删除该商品'}
                aria-label={`删除商品 ${i + 1}`}
                disabled={value.length <= 2}
                onClick={() => remove(i)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Input
                className="h-8 bg-white text-xs"
                value={it.price}
                placeholder="售价"
                aria-label={`商品 ${i + 1} 售价`}
                onChange={(e) => update(i, { price: e.target.value })}
              />
              <Input
                className="h-8 bg-white text-xs"
                value={it.original ?? ''}
                placeholder="原价(选填)"
                aria-label={`商品 ${i + 1} 原价`}
                onChange={(e) => update(i, { original: e.target.value })}
              />
              <Input
                className="h-8 bg-white text-xs"
                value={it.sales ?? ''}
                placeholder="已售(选填)"
                aria-label={`商品 ${i + 1} 已售`}
                onChange={(e) => update(i, { sales: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        disabled={value.length >= max}
        onClick={add}
      >
        <Plus className="mr-1 size-3.5" /> 添加商品{value.length >= max ? '（已达上限）' : ''}
      </Button>
      <p className="mt-1.5 rounded-lg bg-violet-50 px-2 py-1.5 text-[10px] leading-4 text-violet-600">
        💡 每个商品可跳转不同页面：右侧「交互」页里为每个商品分别绑定
      </p>
    </div>
  );
}
