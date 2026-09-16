'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Move } from 'lucide-react';
import { useDnd } from '@/lib/dnd-store';
import { useBuilder } from '@/lib/store';
import { getWidget } from '@/components/widgets/registry';

/** 跟随指针的拖拽幻影（指针拖拽系统的视觉反馈） */
export function DragGhost() {
  const active = useDnd((s) => s.active);
  const started = useDnd((s) => s.started);
  const kind = useDnd((s) => s.kind);
  const widgetType = useDnd((s) => s.widgetType);
  const preset = useDnd((s) => s.preset);
  const moveId = useDnd((s) => s.moveId);
  const px = useDnd((s) => s.px);
  const py = useDnd((s) => s.py);

  useEffect(() => {
    if (!active) return;
    document.body.classList.add('select-none');
    return () => document.body.classList.remove('select-none');
  }, [active]);

  if (!active || !started || kind === 'marquee') return null;

  let type = widgetType;
  if (kind === 'move' && moveId) {
    const pages = useBuilder.getState().pages;
    type = pages.flatMap((p) => p.components).find((c) => c.id === moveId)?.type ?? null;
  }
  const def = type ? getWidget(type) : null;

  return createPortal(
    <div
      style={{ left: px + 14, top: py + 16 }}
      className="pointer-events-none fixed z-[9999] flex items-center gap-2 rounded-xl bg-zinc-900/92 px-3 py-2 text-white shadow-2xl backdrop-blur-sm"
    >
      <span className="flex size-6 items-center justify-center rounded-lg bg-white/15">
        {def ? <def.icon className="size-3.5" /> : <Move className="size-3.5" />}
      </span>
      <span className="text-xs font-bold">{preset?.name ?? def?.name ?? '移动组件'}</span>
      <span className="text-[10px] font-medium text-white/55">
        {kind === 'new' ? '松手放入画布' : '拖动调整'}
      </span>
    </div>,
    document.body
  );
}
