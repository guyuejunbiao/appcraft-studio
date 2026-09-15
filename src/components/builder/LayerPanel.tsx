'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Eye, EyeOff, Lock, LockOpen, ChevronUp, ChevronDown, Copy, Trash2,
  ChevronsUp, ChevronsDown, Pencil, MoreHorizontal, Layers, Boxes,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { getWidget } from '@/components/widgets/registry';
import { groupColor } from './Canvas';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WidgetInstance } from '@/lib/types';

/**
 * 图层面板：当前页面的组件清单（顶层在前）
 * - 点击选中 · 双击重命名
 * - 显示/隐藏 · 锁定/解锁 · 上移/下移一层 · 置顶/置底 · 复制 · 删除
 */
export function LayerList() {
  const pages = useBuilder((s) => s.pages);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const selectedWidgetId = useBuilder((s) => s.selectedWidgetId);
  const updateWidget = useBuilder((s) => s.updateWidget);
  const reorderWidget = useBuilder((s) => s.reorderWidget);
  const duplicateWidget = useBuilder((s) => s.duplicateWidget);
  const removeWidget = useBuilder((s) => s.removeWidget);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const page = pages.find((p) => p.id === currentPageId);
  const comps = page?.components ?? [];
  /* 列表倒序渲染：数组末尾（渲染在最上层）显示在最前 */
  const layers: { w: WidgetInstance; z: number }[] = comps
    .map((w, i) => ({ w, z: i + 1 }))
    .reverse();

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const commitRename = () => {
    if (editingId) {
      const name = editName.trim();
      if (name) updateWidget(editingId, { name });
      setEditingId(null);
    }
  };

  if (comps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-zinc-400">
        <Layers className="size-8 opacity-40" />
        <p className="text-xs font-medium">当前页面还没有组件</p>
        <p className="text-[11px]">从左侧仓库拖入或点击添加后，可在此管理图层</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-zinc-500">
          共 {comps.length} 个图层<span className="ml-1.5 text-zinc-400">（顶层在前）</span>
        </p>
        <p className="text-[10px] text-zinc-400">双击名称可重命名</p>
      </div>

      <div className="max-h-[420px] space-y-1 overflow-y-auto pr-0.5 thin-scroll" role="list" aria-label="图层列表">
        {layers.map(({ w, z }) => {
          const def = getWidget(w.type);
          const Icon = def?.icon;
          const selected = selectedWidgetId === w.id;
          const hidden = !!w.hidden;
          const locked = !!w.locked;
          return (
            <div
              key={w.id}
              role="listitem"
              onClick={() => {
                /* 组内成员：整组高亮（多选） */
                const b = useBuilder.getState();
                const members = b.groupMembersOf(w.id);
                if (members) b.selectMany(members);
                else b.select(w.id);
              }}
              onDoubleClick={() => {
                setEditingId(w.id);
                setEditName(w.name ?? def?.name ?? w.type);
              }}
              className={`group flex cursor-pointer items-center gap-1.5 rounded-lg border px-1.5 py-1.5 transition-colors ${
                selected
                  ? 'border-zinc-300 bg-zinc-100'
                  : 'border-transparent hover:bg-zinc-50'
              } ${hidden ? 'opacity-55' : ''}`}
              title={`${def?.name ?? w.type} · 图层 ${z}`}
            >
              {/* 层叠序号 */}
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold tabular-nums ${
                  selected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                {z}
              </span>

              {/* 类型图标 */}
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-md"
                style={{ background: `${def ? '#f4f4f5' : '#fef2f2'}`, color: def?.icon ? '#3f3f46' : '#f43f5e' }}
              >
                {Icon ? <Icon className="size-3.5" /> : <Layers className="size-3.5" />}
              </span>

              {/* 名称 */}
              {editingId === w.id ? (
                <input
                  ref={editInputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  className="h-6 min-w-0 flex-1 rounded border border-zinc-300 px-1.5 text-xs outline-none focus:border-zinc-500"
                  aria-label="图层名称"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-700">
                  {w.name || def?.name || w.type}
                </span>
              )}

              {/* 状态徽标 */}
              {w.group && (
                <span
                  className="flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-bold"
                  style={{ background: `${groupColor(w.group)}1a`, color: groupColor(w.group) }}
                  title={`已编组（与同组组件联动选中/拖动）`}
                >
                  <Boxes className="size-2.5" /> 组
                </span>
              )}
              {hidden && (
                <span className="shrink-0 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700">隐藏</span>
              )}
              {typeof w.opacity === 'number' && w.opacity < 1 && (
                <span
                  className="shrink-0 rounded bg-violet-100 px-1 py-0.5 text-[9px] font-bold tabular-nums text-violet-700"
                  title={`透明度 ${Math.round(w.opacity * 100)}%`}
                >
                  {Math.round(w.opacity * 100)}%
                </span>
              )}
              {locked && (
                <span className="shrink-0 rounded bg-zinc-200 px-1 py-0.5 text-[9px] font-bold text-zinc-600">锁定</span>
              )}

              {/* 悬浮操作：上移/下移一层 */}
              <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                <LayerBtn
                  title="上移一层"
                  onClick={() => reorderWidget(w.id, 'up')}
                  disabled={z === comps.length}
                >
                  <ChevronUp className="size-3" />
                </LayerBtn>
                <LayerBtn
                  title="下移一层"
                  onClick={() => reorderWidget(w.id, 'down')}
                  disabled={z === 1}
                >
                  <ChevronDown className="size-3" />
                </LayerBtn>
              </span>

              {/* 常驻操作：显隐 / 锁定 */}
              <LayerBtn
                title={hidden ? '取消隐藏' : '隐藏'}
                onClick={() => updateWidget(w.id, { hidden: !hidden })}
                className={hidden ? 'text-amber-500' : ''}
              >
                {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </LayerBtn>
              <LayerBtn
                title={locked ? '解锁' : '锁定（防误拖/误删）'}
                onClick={() => updateWidget(w.id, { locked: !locked })}
                className={locked ? 'text-zinc-900' : ''}
              >
                {locked ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
              </LayerBtn>

              {/* 更多操作 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex size-6 shrink-0 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="更多图层操作"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => reorderWidget(w.id, 'front')}>
                    <ChevronsUp className="size-3.5" /> 置顶
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => reorderWidget(w.id, 'back')}>
                    <ChevronsDown className="size-3.5" /> 置底
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setEditingId(w.id);
                    setEditName(w.name ?? def?.name ?? w.type);
                  }}>
                    <Pencil className="size-3.5" /> 重命名
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => duplicateWidget(w.id)}>
                    <Copy className="size-3.5" /> 复制组件
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => removeWidget(w.id)}>
                    <Trash2 className="size-3.5" /> 删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LayerBtn({
  children, onClick, title, disabled, className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={(e) => e.stopPropagation()}
      className={`flex size-6 shrink-0 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 disabled:pointer-events-none disabled:opacity-25 ${className}`}
    >
      {children}
    </button>
  );
}
