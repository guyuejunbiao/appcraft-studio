'use client';

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { ProductItem } from '@/components/widgets/grid-kit';

/**
 * 商品逐个编辑器（双列商品网格等）：
 * 属性面板与画布就地编辑（QuickEditor）共用——每个商品独立编辑
 * 名称 / 售价 / 原价 / 已售，可排序、可增删；
 * 跳转页面在右侧「交互」页为每个商品单独绑定（每个商品可跳不同页面）。
 */
export function ProductsEditor({
  value,
  onChange,
  max = 6,
}: {
  value: ProductItem[];
  onChange: (v: ProductItem[]) => void;
  max?: number;
}) {
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
