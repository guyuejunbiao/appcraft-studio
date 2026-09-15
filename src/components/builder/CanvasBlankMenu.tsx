'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MousePointerSquareDashed, ClipboardPaste, Plus, LayoutTemplate,
  Trash2, Check, FileStack,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBuilder } from '@/lib/store';

interface BlankMenuState {
  x: number;
  y: number;
}

/**
 * 画布空白处右键菜单（自由/流式布局通用）：
 * 全选 / 粘贴 / 新增页面 / 切换布局 / 清空此页。
 * 由 Canvas 在 contextmenu 命中空白处时打开（坐标为视口坐标）。
 */
export function CanvasBlankMenu({ menu, onClose }: { menu: BlankMenuState | null; onClose: () => void }) {
  const [clearConfirm, setClearConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* 点击外部 / Esc 关闭 */
  useEffect(() => {
    if (!menu) return;
    setClearConfirm(false);
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', onDown, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const b = useBuilder.getState();
  const page = b.pages.find((p) => p.id === b.currentPageId);
  if (!page) return null;
  const isFree = page.layout === 'free';
  const visibleCount = page.components.filter((c) => !c.hidden).length;

  const item =
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40';
  const iconCls = 'size-4 shrink-0 text-zinc-400';

  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="画布操作菜单"
      className="fixed z-[80] w-56 rounded-xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-xl shadow-zinc-900/10 backdrop-blur animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: Math.min(menu.x, window.innerWidth - 240),
        top: Math.min(menu.y, window.innerHeight - 280),
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between px-3 pb-1.5 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">画布操作</span>
        <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
          {page.name}
        </span>
      </div>

      <button
        className={item}
        disabled={visibleCount === 0}
        onClick={run(() => {
          const ids = page.components.filter((c) => !c.hidden).map((c) => c.id);
          useBuilder.getState().selectMany(ids);
          toast(`已全选 ${ids.length} 个组件`, { description: '可批量对齐 / 分布 / 编组 / 删除' });
        })}
      >
        <MousePointerSquareDashed className={iconCls} /> 全部选中
        <span className="ml-auto rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[9px] font-bold text-zinc-400">
          {visibleCount}
        </span>
      </button>

      <button
        className={item}
        onClick={run(() => {
          const ok = useBuilder.getState().pasteWidget();
          if (ok) toast.success('已粘贴组件');
          else toast('剪贴板是空的', { description: '先选中组件按 Ctrl+C 复制' });
        })}
      >
        <ClipboardPaste className={iconCls} /> 粘贴组件
        <span className="ml-auto rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[9px] font-bold text-zinc-400">
          Ctrl+V
        </span>
      </button>

      <div className="mx-2 my-1 h-px bg-zinc-100" />

      <button
        className={item}
        onClick={run(() => {
          useBuilder.getState().addPage();
          toast.success('已新增页面', { description: '可在顶部标签间切换，右键标签可管理' });
        })}
      >
        <Plus className={iconCls} /> 新增页面
      </button>

      <button
        className={item}
        disabled={visibleCount === 0}
        onClick={run(() => {
          const p = useBuilder.getState().pages.find((x) => x.id === useBuilder.getState().currentPageId);
          if (!p) return;
          if (p.layout === 'free') {
            useBuilder.getState().updatePage(p.id, { layout: 'flow' });
            toast('已切换为流式布局', { description: '组件将按图层次序自上而下排列（可撤销）' });
          } else {
            /* 流式切自由：按当前渲染顺序堆叠生成坐标（缺坐标时由画布测量逻辑兜底） */
            let y = 12;
            const rects: Record<string, { x: number; y: number; w: number }> = {};
            p.components.forEach((c) => {
              rects[c.id] = { x: c.x ?? (c.width && c.width !== 'full' ? 10 : 0), y, w: 355 };
              y += (c.h ?? 64) + 8;
            });
            useBuilder.getState().convertToFreeLayout(rects);
            toast.success('已切换为自由布局', { description: '现在可以任意拖放位置与调整大小' });
          }
        })}
      >
        <LayoutTemplate className={iconCls} />
        {isFree ? '切换为流式布局' : '切换为自由布局'}
      </button>

      <div className="mx-2 my-1 h-px bg-zinc-100" />

      {clearConfirm ? (
        <button
          className={`${item} !text-rose-600 hover:!bg-rose-50`}
          onClick={run(() => {
            const ids = page.components.filter((c) => !c.locked).map((c) => c.id);
            useBuilder.getState().removeWidgets(ids);
            toast('已清空此页', { description: '锁定组件已保留；可 Ctrl+Z 撤销' });
          })}
        >
          <Trash2 className="size-4 shrink-0 text-rose-500" /> 确认清空（保留锁定）
        </button>
      ) : (
        <button
          className={`${item} !text-rose-500 hover:!bg-rose-50`}
          disabled={visibleCount === 0}
          onClick={() => setClearConfirm(true)}
        >
          <Trash2 className="size-4 shrink-0" /> 清空此页组件
        </button>
      )}

      <div className="flex items-center gap-1.5 px-3 pb-1 pt-1.5 text-[10px] text-zinc-400">
        <FileStack className="size-3" />
        {page.components.length} 个组件 · {isFree ? '自由布局' : '流式布局'}
        {page.isHome && (
          <span className="ml-auto flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 font-bold text-amber-600">
            <Check className="size-2.5" /> 主页
          </span>
        )}
      </div>
    </div>
  );
}
