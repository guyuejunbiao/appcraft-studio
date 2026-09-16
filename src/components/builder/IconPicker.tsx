'use client';

import { createElement, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { APP_ICONS, iconByName } from '@/lib/app-icons';

/** 图标字形（ForwardRef 组件需经 createElement 渲染；iconByName 返回模块级稳定引用） */
function IconGlyph({ name, className }: { name: string; className?: string }) {
  return createElement(iconByName(name), { className });
}

/**
 * lucide 图标选择器（TabBar 换图标等场景）。
 * 存档值为图标 name 字符串（lib/app-icons.ts 的 APP_ICONS 映射）。
 */
export function IconPicker({
  value,
  onChange,
  align = 'start',
}: {
  value: string;
  onChange: (name: string) => void;
  align?: 'start' | 'center' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return APP_ICONS;
    return APP_ICONS.filter((i) => i.name.includes(kw) || i.label.includes(q.trim()));
  }, [q]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="更换图标"
          aria-label="更换图标"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          <IconGlyph name={value} className="size-4.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-72 p-2.5">
        {/* 搜索 */}
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索图标（如 购物 / cart）"
            className="h-8 pl-8 text-xs"
          />
        </div>
        {/* 图标网格 */}
        <div
          className="grid max-h-56 grid-cols-7 gap-1 overflow-y-auto thin-scroll"
          role="listbox"
          aria-label="选择图标"
        >
          {list.map(({ name, label, Icon }) => {
            const selected = name === value;
            return (
              <button
                key={name}
                type="button"
                role="option"
                aria-selected={selected}
                title={`${label}（${name}）`}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  selected
                    ? 'bg-violet-500 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className="size-4.5" />
              </button>
            );
          })}
          {list.length === 0 && (
            <p className="col-span-7 py-6 text-center text-xs text-zinc-400">没有匹配的图标</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
