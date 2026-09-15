'use client';

import { create } from 'zustand';

/**
 * 指针拖拽全局状态（替代 HTML5 Drag & Drop）：
 * - 支持鼠标 + 触摸（Pointer Events）
 * - kind='new'  从组件仓库拖出新组件
 * - kind='move' 画布内拖动组件（流式排序 / 自由移动 / 多选组拖）
 * - kind='marquee' 自由布局空白处框选
 * Canvas 订阅该状态渲染指示线/落点，并在 pointerup 时落盘。
 */
export type DragKind = 'new' | 'move' | 'marquee';

interface DndState {
  active: boolean;
  /** 是否已越过阈值，进入真正的拖拽 */
  started: boolean;
  kind: DragKind | null;
  /** kind=new：组件类型 */
  widgetType: string | null;
  /** kind=move：被拖动的实例 id */
  moveId: string | null;
  /** 指针客户区坐标 */
  px: number;
  py: number;
  /** 开始拖拽时的指针坐标（算偏移用） */
  startX: number;
  startY: number;
  /** 刚结束一次真正的拖拽，下一次 click 应被忽略（防止拖拽后误触发点击添加） */
  suppressNextClick: boolean;
  begin: (payload: {
    kind: DragKind;
    widgetType?: string;
    moveId?: string;
    px: number;
    py: number;
  }) => void;
  move: (px: number, py: number) => void;
  /** 越过阈值后标记 started */
  markStarted: () => void;
  end: () => void;
}

export const useDnd = create<DndState>((set, get) => ({
  active: false,
  started: false,
  kind: null,
  widgetType: null,
  moveId: null,
  px: 0,
  py: 0,
  startX: 0,
  startY: 0,
  suppressNextClick: false,
  begin: ({ kind, widgetType, moveId, px, py }) =>
    set({
      active: true,
      started: false,
      kind,
      widgetType: widgetType ?? null,
      moveId: moveId ?? null,
      px,
      py,
      startX: px,
      startY: py,
      suppressNextClick: false,
    }),
  move: (px, py) => {
    const s = get();
    const dist = Math.hypot(px - s.startX, py - s.startY);
    set({ px, py, started: s.started || dist > 6 });
  },
  markStarted: () => set({ started: true }),
  end: () =>
    set({
      active: false,
      started: false,
      kind: null,
      widgetType: null,
      moveId: null,
    }),
}));
