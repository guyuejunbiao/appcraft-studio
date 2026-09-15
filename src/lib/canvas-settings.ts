'use client';

import { create } from 'zustand';

/**
 * 画布辅助设置（编辑器级，localStorage 持久化，跨项目共享）：
 * - showGrid   自由布局下的点阵网格背景
 * - snapGuides 智能对齐吸附线（组件边缘/中心、屏幕边缘/中心）
 * - snapGrid   网格吸附（移动/缩放按 4px 取整）
 * - showRuler  画布标尺（顶部 + 左侧刻度，跟随缩放与滚动）
 */

export interface CanvasSettings {
  showGrid: boolean;
  snapGuides: boolean;
  snapGrid: boolean;
  showRuler: boolean;
}

interface CanvasSettingsState extends CanvasSettings {
  hydrated: boolean;
  hydrate: () => void;
  update: (patch: Partial<CanvasSettings>) => void;
}

const KEY = 'appcraft-canvas-settings';

const DEFAULTS: CanvasSettings = { showGrid: true, snapGuides: true, snapGrid: true, showRuler: true };

function load(): CanvasSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const obj = JSON.parse(raw) as Partial<CanvasSettings>;
    return {
      showGrid: obj.showGrid !== false,
      snapGuides: obj.snapGuides !== false,
      snapGrid: obj.snapGrid !== false,
      showRuler: obj.showRuler !== false,
    };
  } catch {
    return DEFAULTS;
  }
}

function persist(s: CanvasSettings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 忽略隐私模式写入失败 */
  }
}

export const useCanvasSettings = create<CanvasSettingsState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ ...load(), hydrated: true });
  },
  update: (patch) => {
    const next = {
      showGrid: patch.showGrid ?? get().showGrid,
      snapGuides: patch.snapGuides ?? get().snapGuides,
      snapGrid: patch.snapGrid ?? get().snapGrid,
      showRuler: patch.showRuler ?? get().showRuler,
    };
    set(next);
    persist(next);
  },
}));
