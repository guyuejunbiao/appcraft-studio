'use client';

import { create } from 'zustand';
import {
  DEFAULT_THEME, deepClone, uid,
  type ProjectData, type ProjectSummary, type PublishSummary,
  type PageData, type ConnectionData, type WidgetInstance, type ThemeConfig, type AppSnapshot,
  type PresetData, type WidgetStyleClip, type AppTab,
} from './types';
import { getWidget } from '@/components/widgets/registry';

export type BuilderView = 'home' | 'editor' | 'flow' | 'canvas' | 'preview';

interface HistorySnap {
  pages: PageData[];
  connections: ConnectionData[];
}

/** 复制/粘贴剪贴板（会话级，跨页面也可粘贴） */
let widgetClipboard: { type: string; props: Record<string, any>; width?: WidgetInstance['width']; align?: WidgetInstance['align'] } | null = null;

/** 样式刷剪贴板（会话级，跨页面可用） */
let styleClipboard: (WidgetStyleClip & { fromType?: string }) | null = null;

interface BuilderState {
  view: BuilderView;
  /* 首页数据 */
  projects: ProjectSummary[];
  publishes: PublishSummary[];
  homeLoading: boolean;
  homeLoaded: boolean;
  /* 当前项目 */
  project: ProjectData | null;
  pages: PageData[];
  connections: ConnectionData[];
  /** App 级底部导航（项目级，每页底部自动出现） */
  tabs: AppTab[];
  currentPageId: string | null;
  selectedWidgetId: string | null;
  /** 多选集合（含 selectedWidgetId；Shift 点选/框选/批量操作） */
  selectedIds: string[];
  dirty: boolean;
  saving: boolean;
  lastSavedAt: string | null;
  /* 拖拽/批量编辑期间的临时快照（合并为一条历史） */
  batchSnap: HistorySnap | null;
  /* 上架 */
  publishOpen: boolean;
  previewSnapshot: (AppSnapshot & { version: number }) | null;
  /* 组件市场（我的组合） */
  presets: PresetData[];
  presetsLoaded: boolean;
  /* 历史 */
  past: HistorySnap[];
  future: HistorySnap[];
  /* 动作 */
  loadHome: () => Promise<void>;
  createProject: (name: string, description: string, templateId: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  openProject: (id: string) => Promise<void>;
  setView: (v: BuilderView) => void;
  addWidget: (type: string, index?: number, rect?: { x: number; y: number; w: number }) => void;
  moveWidget: (id: string, toIndex: number) => void;
  removeWidget: (id: string) => void;
  /** 批量删除（一条历史；联动清理相关连接） */
  removeWidgets: (ids: string[]) => void;
  duplicateWidget: (id: string) => void;
  /** 批量复制：返回新 id 列表（一条历史，整体错开 16px） */
  duplicateWidgets: (ids: string[]) => string[];
  /** 复制组件到剪贴板（Ctrl+C） */
  copyWidget: (id: string) => void;
  /** 粘贴剪贴板组件（Ctrl+V）；自由布局错开 12px，流式追加到末尾；返回是否真的粘贴了 */
  pasteWidget: () => boolean;
  /** 图层置顶/置底/上移一层/下移一层（数组序即层叠序，流式下置顶置底等于移到末尾/开头） */
  reorderWidget: (id: string, pos: 'front' | 'back' | 'up' | 'down') => void;
  updateWidget: (id: string, patch: Partial<WidgetInstance>) => void;
  updateWidgetProps: (id: string, props: Record<string, any>) => void;
  /** 自由布局：更新位置/大小（transient=true 时不记录历史，用于拖拽过程） */
  setWidgetRect: (id: string, rect: Partial<Pick<WidgetInstance, 'x' | 'y' | 'w' | 'h'>>, transient?: boolean) => void;
  /** 多选批量更新矩形（组拖拽用，transient 同上） */
  setWidgetsRects: (map: Record<string, Partial<Pick<WidgetInstance, 'x' | 'y' | 'w' | 'h'>>>, transient?: boolean) => void;
  /** 多选对齐（选择集包围盒）：left/hcenter/right/top/vcenter/bottom */
  alignWidgets: (mode: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom') => void;
  /** 多选等间距分布（需要画布测量尺寸，sizes 缺省用存储 h/w） */
  distributeWidgets: (axis: 'h' | 'v', sizes?: Record<string, { w?: number; h?: number }>) => void;
  /** 一键整理（对标 m3e-canvas Tidy）：通栏贴边、其余按行归位 16px 间距堆叠；sizes 为画布实测尺寸；一条历史可撤销 */
  tidyPage: (sizes?: Record<string, { w?: number; h?: number }>) => void;
  /** 多选统一宽度/高度：以主选中组件（面板当前显示的）为基准；measured 提供实测尺寸（自适应高度组件用） */
  unifyWidgetsSize: (dim: 'w' | 'h', measured?: Record<string, { w?: number; h?: number }>) => void;
  /** 多选批量补丁（任意实例字段，一次历史，锁定组件跳过） */
  patchWidgets: (map: Record<string, Partial<WidgetInstance>>) => void;
  /** 样式刷：复制组件外观（透明度/阴影/边距/宽度对齐），跨页面可用 */
  copyWidgetStyle: (id: string) => boolean;
  /** 样式刷：把剪贴板外观粘贴到给定组件（一次历史，锁定跳过）；返回应用数量 */
  pasteWidgetStyle: (ids: string[]) => number;
  /** 样式刷剪贴板是否有内容（供 UI 置灰） */
  hasStyleClip: () => boolean;
  /** 批量编辑：拖拽/缩放开始时调用，结束时 endBatch 合并为一条历史 */
  beginBatch: () => void;
  endBatch: () => void;
  /** 流式 → 自由布局迁移（rects 由画布测量后传入，记录历史） */
  convertToFreeLayout: (rects: Record<string, { x: number; y: number; w: number }>) => void;
  /** 旧数据自动升级为自由布局（不记历史，用户无感知迁移） */
  migrateToFree: (pageId: string, rects?: Record<string, { x: number; y: number; w: number }>) => void;
  select: (id: string | null, additive?: boolean) => void;
  /** 框选/批量设置选中集合（同时更新 primary） */
  selectMany: (ids: string[]) => void;
  /** 清空多选（保留 primary 不变或一并清空） */
  clearMulti: () => void;
  /** 编组：把多选组件绑为一组（返回组 id；单选/含锁定成员时为空操作） */
  groupWidgets: (ids: string[]) => string | null;
  /** 解组：清除这些组件的编组标记（组内仅剩 1 个时自动清掉孤组） */
  ungroupWidgets: (ids: string[]) => void;
  /** 选择整组：若 id 属于某组，返回全组成员 id（含自己） */
  groupMembersOf: (id: string) => string[] | null;
  setCurrentPage: (id: string) => void;
  addPage: () => void;
  duplicatePage: (id: string) => void;
  /** 页面拖拽排序：把页面移到目标下标（数组序即标签序） */
  movePage: (id: string, toIndex: number) => void;
  /** 设为主页：转移 isHome 标记（原主页自动让位） */
  setHomePage: (id: string) => void;
  updatePage: (id: string, patch: Partial<PageData>) => void;
  removePage: (id: string) => void;
  setFlowPos: (id: string, x: number, y: number) => void;
  /* ===== App 级底部导航（TabBar）=====
   * 与组件库 fn.tabbar 不同：项目级导航，每个标签绑定一整页，点击换根切换。
   * 不进撤销历史（与主题同级的项目设置），变更即标脏随保存持久化。 */
  setTabs: (tabs: AppTab[]) => void;
  addTab: (tab: AppTab) => void;
  updateTab: (id: string, patch: Partial<Omit<AppTab, 'id'>>) => void;
  removeTab: (id: string) => void;
  moveTab: (id: string, toIndex: number) => void;
  /** 向指定页面追加组件（无限画布画板内「+」添加；自由布局自动堆叠落位） */
  addWidgetToPage: (pageId: string, type: string) => void;
  addConnection: (c: Omit<ConnectionData, 'id' | 'action'>) => void;
  removeConnection: (id: string) => void;
  /** 编辑已有连接：改触发组件/目标页/转场动画（流程图连接标签点击编辑） */
  updateConnection: (
    id: string,
    patch: Partial<Pick<ConnectionData, 'fromWidgetId' | 'toPageId' | 'animation' | 'slot'>>
  ) => void;
  updateTheme: (patch: Partial<ThemeConfig>) => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<boolean>;
  setPublishOpen: (b: boolean) => void;
  publish: (name: string, description: string) => Promise<number | null>;
  openPublishPreview: (publishId: string) => Promise<void>;
  exitPublishPreview: () => void;
  exportProject: () => void;
  importProject: (payload: unknown) => Promise<boolean>;
  /** 拉取组件市场列表 */
  loadPresets: () => Promise<void>;
  /** 把选中的组件存为可复用组合；返回保存结果（失败为 null） */
  savePreset: (name: string, icon: string, ids: string[]) => Promise<PresetData | null>;
  deletePreset: (id: string) => Promise<void>;
  /** 插入组合到当前页面（自由布局还原相对位置 / 流式逐个追加）；anchor 给定时以释放点为组合原点 */
  insertPreset: (preset: PresetData, anchor?: { x: number; y: number }) => void;
  /** 重命名/换图标组件市场资源（乐观更新，失败回滚） */
  renamePreset: (id: string, patch: { name?: string; icon?: string }) => Promise<boolean>;
  /** 收藏/取消收藏组件市场资源（meta.starred，乐观更新失败回滚） */
  togglePresetStar: (id: string) => Promise<boolean>;
  /** 把整页存为页面模板（保留绝对坐标 + 背景 + 布局） */
  savePagePreset: (name: string, icon: string, pageId: string) => Promise<PresetData | null>;
  /** 从页面模板创建新页面（重生成组件 id，自动切换到新页） */
  addPageFromTemplate: (preset: PresetData) => void;
}

const MAX_HISTORY = 60;

export const useBuilder = create<BuilderState>((set, get) => {
  /** 提交一次变更：记录历史 + 标脏 */
  const commit = (fn: (s: { pages: PageData[]; connections: ConnectionData[] }) => Partial<BuilderState>) => {
    const { pages, connections, past } = get();
    const snap: HistorySnap = { pages: deepClone(pages), connections: deepClone(connections) };
    set({
      past: [...past.slice(-MAX_HISTORY), snap],
      future: [],
      dirty: true,
      ...fn({ pages, connections }),
    });
  };

  const currentPage = () => get().pages.find((p) => p.id === get().currentPageId);

  return {
    view: 'home',
    projects: [],
    publishes: [],
    homeLoading: false,
    homeLoaded: false,
    project: null,
    pages: [],
    connections: [],
    tabs: [],
    currentPageId: null,
    selectedWidgetId: null,
    selectedIds: [],
    dirty: false,
    saving: false,
    lastSavedAt: null,
    batchSnap: null,
    publishOpen: false,
    previewSnapshot: null,
    presets: [],
    presetsLoaded: false,
    past: [],
    future: [],

    async loadHome() {
      set({ homeLoading: true });
      try {
        const [projects, publishes] = await Promise.all([
          fetch('/api/projects').then((r) => r.json()),
          fetch('/api/publishes').then((r) => r.json()),
        ]);
        set({ projects, publishes, homeLoaded: true });
      } finally {
        set({ homeLoading: false });
      }
    },

    async createProject(name, description, templateId) {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, templateId }),
      });
      const { id } = await res.json();
      await get().loadHome();
      await get().openProject(id);
    },

    async deleteProject(id) {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (get().project?.id === id) set({ project: null, pages: [], connections: [], tabs: [], currentPageId: null });
      await get().loadHome();
    },

    async renameProject(id, name) {
      const { projects } = get();
      set({ projects: projects.map((p) => (p.id === id ? { ...p, name } : p)) });
      if (get().project?.id === id) {
        set({ project: { ...get().project!, name } });
        get().save();
      }
    },

    async openProject(id) {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) return;
      const data: ProjectData = await res.json();
      const home = data.pages.find((p) => p.isHome);
      set({
        project: data,
        pages: data.pages,
        connections: data.connections,
        tabs: Array.isArray(data.tabs) ? data.tabs : [],
        currentPageId: home?.id || data.pages[0]?.id || null,
        selectedWidgetId: null,
        selectedIds: [],
        dirty: false,
        saving: false,
        lastSavedAt: null,
        past: [],
        future: [],
        previewSnapshot: null,
        view: 'editor',
      });
    },

    setView(v) {
      set({ view: v });
      if (v === 'home') {
        get().loadHome();
      }
    },

    addWidget(type, index, rect) {
      const page = currentPage();
      if (!page) return;
      const def = getWidget(type);
      if (!def) return;
      const w: WidgetInstance = {
        id: uid(),
        type,
        props: deepClone(def.defaultProps),
        width: 'full',
        align: 'left',
        mt: 0,
        mb: 8,
      };
      /* 自由布局：按落点/智能位置放置（不钳制，可摆到首屏以下，画布自动增高） */
      if (page.layout === 'free') {
        const fullW = def.fullBleed ? 375 : 355;
        const maxBottom = page.components.reduce(
          (m, c) => Math.max(m, (c.y ?? 0) + (c.h ?? 64)),
          0
        );
        w.x = rect?.x ?? (def.fullBleed ? 0 : 10);
        w.y = rect?.y ?? maxBottom + 12;
        w.w = rect?.w ?? fullW;
        w.x = Math.max(0, Math.min(w.x ?? 0, 375 - (w.w ?? fullW)));
      }
      commit(({ pages }) => ({
        pages: pages.map((p) =>
          p.id === page.id
            ? {
                ...p,
                components: index === undefined
                  ? [...p.components, w]
                  : [...p.components.slice(0, index), w, ...p.components.slice(index)],
              }
            : p
        ),
      }));
      set({ selectedWidgetId: w.id, selectedIds: [w.id] });
    },

    moveWidget(id, toIndex) {
      const page = currentPage();
      if (!page) return;
      commit(({ pages }) => ({
        pages: pages.map((p) => {
          if (p.id !== page.id) return p;
          const from = p.components.findIndex((c) => c.id === id);
          if (from < 0) return p;
          const list = [...p.components];
          const [item] = list.splice(from, 1);
          const target = from < toIndex ? toIndex - 1 : toIndex;
          list.splice(Math.max(0, Math.min(target, list.length)), 0, item);
          return { ...p, components: list };
        }),
      }));
    },

    removeWidget(id) {
      const page = currentPage();
      if (!page) return;
      commit(({ pages, connections }) => ({
        pages: pages.map((p) => (p.id === page.id ? { ...p, components: p.components.filter((c) => c.id !== id) } : p)),
        connections: connections.filter((c) => !(c.fromPageId === page.id && c.fromWidgetId === id)),
      }));
      if (get().selectedWidgetId === id) set({ selectedWidgetId: null });
      set({ selectedIds: get().selectedIds.filter((x) => x !== id) });
    },

    removeWidgets(ids) {
      const page = currentPage();
      if (!page) return;
      const set2 = new Set(ids);
      commit(({ pages, connections }) => ({
        pages: pages.map((p) => (p.id === page.id ? { ...p, components: p.components.filter((c) => !set2.has(c.id) || c.locked) } : p)),
        connections: connections.filter((c) => !(c.fromPageId === page.id && set2.has(c.fromWidgetId))),
      }));
      const remaining = get().pages.find((p) => p.id === page.id)?.components.map((c) => c.id) ?? [];
      set({
        selectedIds: get().selectedIds.filter((x) => remaining.includes(x)),
        selectedWidgetId: remaining.includes(get().selectedWidgetId ?? '') ? get().selectedWidgetId : null,
      });
    },

    duplicateWidget(id) {
      const [copyId] = get().duplicateWidgets([id]);
      if (copyId) set({ selectedWidgetId: copyId, selectedIds: [copyId] });
    },

    duplicateWidgets(ids) {
      const page = currentPage();
      if (!page || ids.length === 0) return [];
      const OFFSET = 16;
      const srcList = page.components;
      const pairs = ids
        .map((id) => srcList.find((c) => c.id === id))
        .filter((c): c is WidgetInstance => !!c && !c.locked)
        .map((src) => {
          const copy: WidgetInstance = { ...deepClone(src), id: uid() };
          if (page.layout === 'free') {
            const cw = copy.w ?? 355;
            copy.x = Math.max(0, Math.min((copy.x ?? 0) + OFFSET, Math.max(0, 375 - cw)));
            copy.y = (copy.y ?? 0) + OFFSET;
          }
          return { srcId: src.id, clone: copy };
        });
      if (pairs.length === 0) return [];
      const created = pairs.map((p) => p.clone.id);
      commit(({ pages }) => ({
        pages: pages.map((p) => {
          if (p.id !== page.id) return p;
          const list = [...p.components];
          /* 倒序插入：插在各自源组件后面，保持图层相对顺序 */
          for (let i = pairs.length - 1; i >= 0; i--) {
            const idx = list.findIndex((c) => c.id === pairs[i].srcId);
            list.splice(idx >= 0 ? idx + 1 : list.length, 0, pairs[i].clone);
          }
          return { ...p, components: list };
        }),
      }));
      set({ selectedWidgetId: created[created.length - 1], selectedIds: created });
      return created;
    },

    copyWidget(id) {
      const page = currentPage();
      if (!page) return;
      const src = page.components.find((c) => c.id === id);
      if (!src) return;
      widgetClipboard = { type: src.type, props: deepClone(src.props), width: src.width, align: src.align };
    },

    pasteWidget() {
      if (!widgetClipboard) return false;
      const page = currentPage();
      if (!page) return false;
      const def = getWidget(widgetClipboard.type);
      if (!def) return false;
      const w: WidgetInstance = {
        id: uid(),
        type: widgetClipboard.type,
        props: deepClone(widgetClipboard.props),
        width: widgetClipboard.width ?? 'full',
        align: widgetClipboard.align ?? 'left',
        mt: 0,
        mb: 8,
      };
      if (page.layout === 'free') {
        const fullW = def.fullBleed ? 375 : 355;
        const maxBottom = page.components.reduce(
          (m, c) => Math.max(m, (c.y ?? 0) + (c.h ?? 64)),
          0
        );
        w.x = def.fullBleed ? 0 : 10;
        w.y = maxBottom + 12;
        w.w = fullW;
      }
      commit(({ pages }) => ({
        pages: pages.map((p) => (p.id === page.id ? { ...p, components: [...p.components, w] } : p)),
      }));
      set({ selectedWidgetId: w.id, selectedIds: [w.id] });
      return true;
    },

    reorderWidget(id, pos) {
      const page = currentPage();
      if (!page) return;
      commit(({ pages }) => ({
        pages: pages.map((p) => {
          if (p.id !== page.id) return p;
          const from = p.components.findIndex((c) => c.id === id);
          if (from < 0) return p;
          const list = [...p.components];
          const [item] = list.splice(from, 1);
          if (pos === 'front') list.push(item);
          else if (pos === 'back') list.unshift(item);
          else if (pos === 'up') list.splice(Math.min(from + 1, list.length), 0, item);
          else list.splice(Math.max(from - 1, 0), 0, item);
          return { ...p, components: list };
        }),
      }));
    },

    updateWidget(id, patch) {
      const page = currentPage();
      if (!page) return;
      commit(({ pages }) => ({
        pages: pages.map((p) =>
          p.id === page.id
            ? { ...p, components: p.components.map((c) => (c.id === id ? { ...c, ...patch } : c)) }
            : p
        ),
      }));
    },

    updateWidgetProps(id, props) {
      const page = currentPage();
      if (!page) return;
      commit(({ pages }) => ({
        pages: pages.map((p) =>
          p.id === page.id
            ? { ...p, components: p.components.map((c) => (c.id === id ? { ...c, props: { ...c.props, ...props } } : c)) }
            : p
        ),
      }));
    },

    setWidgetRect(id, rect, transient = false) {
      const page = currentPage();
      if (!page) return;
      const patchPages = (pages: PageData[]) =>
        pages.map((p) =>
          p.id === page.id
            ? { ...p, components: p.components.map((c) => (c.id === id ? { ...c, ...rect } : c)) }
            : p
        );
      if (transient) {
        set({ pages: patchPages(get().pages), dirty: true });
      } else {
        commit(({ pages }) => ({ pages: patchPages(pages) }));
      }
    },

    setWidgetsRects(map, transient = false) {
      const page = currentPage();
      if (!page) return;
      const patchPages = (pages: PageData[]) =>
        pages.map((p) =>
          p.id === page.id
            ? { ...p, components: p.components.map((c) => (map[c.id] ? { ...c, ...map[c.id] } : c)) }
            : p
        );
      if (transient) {
        set({ pages: patchPages(get().pages), dirty: true });
      } else {
        commit(({ pages }) => ({ pages: patchPages(pages) }));
      }
    },

    alignWidgets(mode) {
      const page = currentPage();
      if (!page || page.layout !== 'free') return;
      const { selectedIds } = get();
      if (selectedIds.length < 2) return;
      const comps = page.components.filter((c) => selectedIds.includes(c.id) && !c.locked);
      if (comps.length < 2) return;
      const rects = comps.map((c) => ({
        id: c.id,
        x: c.x ?? 0,
        y: c.y ?? 0,
        w: c.w ?? 355,
        h: c.h ?? 56,
      }));
      const minX = Math.min(...rects.map((r) => r.x));
      const maxX = Math.max(...rects.map((r) => r.x + r.w));
      const minY = Math.min(...rects.map((r) => r.y));
      const maxY = Math.max(...rects.map((r) => r.y + r.h));
      const map: Record<string, Partial<Pick<WidgetInstance, 'x' | 'y'>>> = {};
      for (const r of rects) {
        if (mode === 'left') map[r.id] = { x: minX };
        else if (mode === 'right') map[r.id] = { x: maxX - r.w };
        else if (mode === 'hcenter') map[r.id] = { x: Math.round((minX + maxX) / 2 - r.w / 2) };
        else if (mode === 'top') map[r.id] = { y: minY };
        else if (mode === 'bottom') map[r.id] = { y: maxY - r.h };
        else if (mode === 'vcenter') map[r.id] = { y: Math.round((minY + maxY) / 2 - r.h / 2) };
      }
      get().setWidgetsRects(map);
    },

    distributeWidgets(axis, sizes) {
      const page = currentPage();
      if (!page || page.layout !== 'free') return;
      const { selectedIds } = get();
      if (selectedIds.length < 3) return;
      const comps = page.components.filter((c) => selectedIds.includes(c.id) && !c.locked);
      if (comps.length < 3) return;
      const items = comps
        .map((c) => ({
          id: c.id,
          x: c.x ?? 0,
          y: c.y ?? 0,
          w: sizes?.[c.id]?.w ?? c.w ?? 355,
          h: sizes?.[c.id]?.h ?? c.h ?? 56,
        }))
        .sort((a, b) => (axis === 'h' ? a.x - b.x : a.y - b.y));
      const first = items[0];
      const last = items[items.length - 1];
      if (axis === 'h') {
        const span = last.x + last.w - first.x;
        const totalW = items.reduce((s, r) => s + r.w, 0);
        const gap = (span - totalW) / (items.length - 1);
        if (!isFinite(gap) || gap < 0) return;
        const map: Record<string, Partial<Pick<WidgetInstance, 'x' | 'y'>>> = {};
        let cursor = first.x;
        for (const r of items) {
          if (r.id !== first.id && r.id !== last.id) map[r.id] = { x: Math.round(cursor) };
          cursor += r.w + gap;
        }
        get().setWidgetsRects(map);
      } else {
        const span = last.y + last.h - first.y;
        const totalH = items.reduce((s, r) => s + r.h, 0);
        const gap = (span - totalH) / (items.length - 1);
        if (!isFinite(gap) || gap < 0) return;
        const map: Record<string, Partial<Pick<WidgetInstance, 'x' | 'y'>>> = {};
        let cursor = first.y;
        for (const r of items) {
          if (r.id !== first.id && r.id !== last.id) map[r.id] = { y: Math.round(cursor) };
          cursor += r.h + gap;
        }
        get().setWidgetsRects(map);
      }
    },

    /* 一键整理（对标 m3e-canvas Tidy）：编组聚成单元 → 按行分组 → 通栏贴边、
       其余从顶部边距起按 16px 行距归位堆叠；一条 commit 一条历史可撤销 */
    tidyPage(sizes) {
      const page = currentPage();
      if (!page || page.layout !== 'free') return;
      const movable = page.components.filter(
        (c) => !c.locked && !c.hidden && typeof c.x === 'number' && typeof c.y === 'number'
      );
      if (movable.length === 0) return;
      const dim = (c: WidgetInstance) => ({
        w: sizes?.[c.id]?.w ?? c.w ?? 355,
        h: sizes?.[c.id]?.h ?? c.h ?? 56,
      });

      /* 编组聚合成单元（成员保持相对偏移整组移动），散件各自成单元 */
      const groupsMap = new Map<string, WidgetInstance[]>();
      const singles: WidgetInstance[] = [];
      for (const c of movable) {
        if (c.group) {
          const arr = groupsMap.get(c.group) ?? [];
          arr.push(c);
          groupsMap.set(c.group, arr);
        } else singles.push(c);
      }
      type Unit = { x: number; y: number; w: number; h: number; members: { id: string; dx: number; dy: number }[] };
      const units: Unit[] = singles.map((c) => {
        const d = dim(c);
        return { x: c.x ?? 0, y: c.y ?? 0, w: d.w, h: d.h, members: [{ id: c.id, dx: 0, dy: 0 }] };
      });
      for (const members of groupsMap.values()) {
        if (members.length === 0) continue;
        const dims = members.map((m) => ({ m, d: dim(m) }));
        const minX = Math.min(...dims.map(({ m }) => m.x ?? 0));
        const minY = Math.min(...dims.map(({ m }) => m.y ?? 0));
        const maxR = Math.max(...dims.map(({ m, d }) => (m.x ?? 0) + d.w));
        const maxB = Math.max(...dims.map(({ m, d }) => (m.y ?? 0) + d.h));
        units.push({
          x: minX,
          y: minY,
          w: maxR - minX,
          h: maxB - minY,
          members: dims.map(({ m }) => ({ id: m.id, dx: (m.x ?? 0) - minX, dy: (m.y ?? 0) - minY })),
        });
      }

      /* 按 y（再按 x）排序 → 行分组：与当前行首单元 y 差 < 28px 视为同一视觉行 */
      units.sort((a, b) => a.y - b.y || a.x - b.x);
      const ROW_TOL = 28;
      const rows: Unit[][] = [];
      for (const u of units) {
        const row = rows[rows.length - 1];
        if (row && Math.abs(u.y - row[0].y) < ROW_TOL) row.push(u);
        else rows.push([u]);
      }

      /* 重排：行内从左到右依次排（列距 8），行距 16，起始边距 16；
         行内总宽超出屏幕（375 - 2×10 边距）则拆为逐行堆叠（通栏自然贴边） */
      const M = 10;
      const COL_G = 8;
      const ROW_G = 16;
      const SCREEN_W = 375;
      const map: Record<string, Partial<WidgetInstance>> = {};
      let cursorY = M + 6;
      for (const row of rows) {
        row.sort((a, b) => a.x - b.x);
        const totalW = row.reduce((acc, u) => acc + u.w, 0) + COL_G * (row.length - 1);
        if (totalW <= SCREEN_W - M * 2) {
          const rowH = Math.max(...row.map((u) => u.h));
          let cx = M;
          for (const u of row) {
            for (const m of u.members) map[m.id] = { x: Math.round(cx + m.dx), y: Math.round(cursorY + m.dy) };
            cx += u.w + COL_G;
          }
          cursorY += rowH + ROW_G;
        } else {
          for (const u of row) {
            for (const m of u.members) map[m.id] = { x: Math.round(M + m.dx), y: Math.round(cursorY + m.dy) };
            cursorY += u.h + ROW_G;
          }
        }
      }
      get().patchWidgets(map);
    },

    unifyWidgetsSize(dim, measured) {
      const page = currentPage();
      if (!page || page.layout !== 'free') return;
      const { selectedIds, selectedWidgetId } = get();
      if (selectedIds.length < 2) return;
      const comps = page.components.filter((c) => selectedIds.includes(c.id) && !c.locked);
      if (comps.length < 2) return;
      /* 基准：主选中组件（属性面板当前显示的）；不在选择集内时取第一个 */
      const refId = selectedWidgetId && selectedIds.includes(selectedWidgetId) ? selectedWidgetId : comps[0].id;
      const ref = comps.find((c) => c.id === refId);
      if (!ref) return;
      const refVal =
        dim === 'w'
          ? ref.w ?? 355
          : measured?.[ref.id]?.h ?? ref.h ?? undefined;
      if (refVal === undefined) return;
      const map: Record<string, Partial<Pick<WidgetInstance, 'x' | 'w' | 'h'>>> = {};
      for (const c of comps) {
        if (c.id === refId) continue;
        if (dim === 'w') {
          const target = Math.round(refVal);
          map[c.id] = { w: target, x: Math.max(0, Math.min((c.x ?? 0), 375 - target)) };
        } else {
          map[c.id] = { h: Math.round(refVal) };
        }
      }
      get().setWidgetsRects(map);
    },

    beginBatch() {
      const { pages, connections } = get();
      set({ batchSnap: { pages: deepClone(pages), connections: deepClone(connections) } });
    },

    /** 多选批量补丁（透明度等实例字段）：一次 commit = 一条可撤销历史 */
    patchWidgets(map) {
      const page = currentPage();
      if (!page) return;
      commit(({ pages }) => ({
        pages: pages.map((p) =>
          p.id === page.id
            ? { ...p, components: p.components.map((c) => (map[c.id] && !c.locked ? { ...c, ...map[c.id] } : c)) }
            : p
        ),
      }));
    },

    /* ==================== 样式刷 ==================== */

    copyWidgetStyle(id) {
      const page = currentPage();
      const w = page?.components.find((c) => c.id === id);
      if (!w) return false;
      const clip: WidgetStyleClip & { fromType?: string } = {};
      if (w.opacity !== undefined) clip.opacity = w.opacity;
      if (w.shadow) clip.shadow = w.shadow;
      if (w.mt !== undefined) clip.mt = w.mt;
      if (w.mb !== undefined) clip.mb = w.mb;
      if (w.width !== undefined) clip.width = w.width;
      if (w.align !== undefined) clip.align = w.align;
      if (w.w !== undefined) clip.w = w.w;
      clip.fromType = w.type;
      styleClipboard = clip;
      return true;
    },

    pasteWidgetStyle(ids) {
      const page = currentPage();
      if (!page || !styleClipboard || ids.length === 0) return 0;
      const { fromType: _ft, ...style } = styleClipboard;
      const idSet = new Set(ids);
      let n = 0;
      commit(({ pages }) => ({
        pages: pages.map((p) =>
          p.id === page.id
            ? {
                ...p,
                components: p.components.map((c) => {
                  if (!idSet.has(c.id) || c.locked) return c;
                  n += 1;
                  return { ...c, ...deepClone(style) };
                }),
              }
            : p
        ),
      }));
      return n;
    },

    hasStyleClip() {
      return styleClipboard !== null;
    },

    endBatch() {
      const { batchSnap, past } = get();
      if (!batchSnap) return;
      set({ past: [...past.slice(-MAX_HISTORY), batchSnap], future: [], batchSnap: null });
    },

    convertToFreeLayout(rects) {
      const page = currentPage();
      if (!page) return;
      commit(({ pages }) => ({
        pages: pages.map((p) =>
          p.id === page.id
            ? {
                ...p,
                layout: 'free',
                components: p.components.map((c) =>
                  rects[c.id] ? { ...c, x: rects[c.id].x, y: rects[c.id].y, w: rects[c.id].w } : c
                ),
              }
            : p
        ),
      }));
    },

    /** 旧数据自动升级：不记历史、不打断用户（画布测量后调用） */
    migrateToFree(pageId, rects) {
      set({
        pages: get().pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                layout: 'free',
                components: rects
                  ? p.components.map((c) => (rects[c.id] ? { ...c, ...rects[c.id] } : c))
                  : p.components,
              }
            : p
        ),
        dirty: true,
      });
    },

    select(id, additive = false) {
      if (id === null) {
        set({ selectedWidgetId: null, selectedIds: [] });
        return;
      }
      if (additive) {
        const cur = get().selectedIds;
        const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
        set({
          selectedIds: next,
          selectedWidgetId: next[next.length - 1] ?? null,
        });
      } else {
        set({ selectedWidgetId: id, selectedIds: [id] });
      }
    },

    selectMany(ids) {
      set({ selectedIds: ids, selectedWidgetId: ids[ids.length - 1] ?? null });
    },

    clearMulti() {
      set({ selectedIds: get().selectedWidgetId ? [get().selectedWidgetId!] : [] });
    },

    groupWidgets(ids) {
      const page = currentPage();
      if (!page || ids.length < 2) return null;
      const members = page.components.filter((c) => ids.includes(c.id) && !c.locked);
      if (members.length < 2) return null;
      /* 已全部同组则不重复建组 */
      const gids = new Set(members.map((c) => c.group).filter(Boolean) as string[]);
      if (gids.size === 1 && members.every((c) => c.group)) return members[0].group!;
      const gid = uid();
      const idSet = new Set(members.map((c) => c.id));
      commit(({ pages }) => ({
        pages: pages.map((p) =>
          p.id === page.id
            ? { ...p, components: p.components.map((c) => (idSet.has(c.id) ? { ...c, group: gid } : c)) }
            : p
        ),
      }));
      set({ selectedWidgetId: members[members.length - 1].id, selectedIds: members.map((c) => c.id) });
      return gid;
    },

    ungroupWidgets(ids) {
      const page = currentPage();
      if (!page || ids.length === 0) return;
      const groupIds = new Set(
        page.components.filter((c) => ids.includes(c.id) && c.group).map((c) => c.group!)
      );
      if (groupIds.size === 0) return;
      commit(({ pages }) => ({
        pages: pages.map((p) => {
          if (p.id !== page.id) return p;
          /* 组内仅剩 1 个成员时，一并清掉孤组标记 */
          const lonely = new Set<string>();
          for (const g of groupIds) {
            const size = p.components.filter((c) => c.group === g).length;
            const removing = p.components.filter((c) => ids.includes(c.id) && c.group === g).length;
            if (size - removing <= 1) lonely.add(g);
          }
          return {
            ...p,
            components: p.components.map((c) =>
              c.group && (ids.includes(c.id) || lonely.has(c.group)) ? { ...c, group: undefined } : c
            ),
          };
        }),
      }));
    },

    groupMembersOf(id) {
      const page = currentPage();
      const me = page?.components.find((c) => c.id === id);
      if (!page || !me?.group) return null;
      const members = page.components.filter((c) => c.group === me.group && !c.hidden).map((c) => c.id);
      return members.length > 1 ? members : null;
    },

    setCurrentPage(id) {
      set({ currentPageId: id, selectedWidgetId: null, selectedIds: [] });
    },

    setHomePage(id) {
      commit(({ pages }) => ({
        pages: pages.map((p) => (p.isHome || p.id === id ? { ...p, isHome: p.id === id } : p)),
      }));
    },

    addPage() {
      const pid = uid();
      const count = get().pages.length;
      commit(({ pages }) => ({
        pages: [
          ...pages,
          {
            id: pid,
            name: `页面 ${count + 1}`,
            background: '#f6f7fb',
            isHome: pages.length === 0,
            components: [],
            /* 新页面默认自由布局：添加组件后即可任意拖放位置 */
            layout: 'free',
            flowX: 80 + (count % 3) * 340,
            flowY: 80 + Math.floor(count / 3) * 280,
          },
        ],
      }));
      set({ currentPageId: pid, selectedWidgetId: null });
    },

    duplicatePage(id) {
      const { pages } = get();
      const src = pages.find((p) => p.id === id);
      if (!src) return;
      const pid = uid();
      const count = pages.length;
      commit(({ pages: list }) => ({
        pages: [
          ...list,
          {
            ...deepClone(src),
            id: pid,
            name: `${src.name} 副本`,
            isHome: false,
            components: deepClone(src.components).map((c) => ({ ...c, id: uid() })),
            flowX: 80 + (count % 3) * 340,
            flowY: 80 + Math.floor(count / 3) * 280,
          },
        ],
      }));
      set({ currentPageId: pid, selectedWidgetId: null, selectedIds: [] });
    },

    updatePage(id, patch) {
      commit(({ pages }) => ({
        pages: pages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },

    movePage(id, toIndex) {
      commit(({ pages }) => {
        const from = pages.findIndex((p) => p.id === id);
        if (from < 0 || toIndex < 0 || toIndex > pages.length || from === toIndex) return { pages };
        const list = [...pages];
        const [moved] = list.splice(from, 1);
        /* toIndex 语义 = 「插到原数组下标 toIndex 的元素之前」，移除后需校正 */
        const adj = from < toIndex ? toIndex - 1 : toIndex;
        list.splice(adj, 0, moved);
        return { pages: list };
      });
    },

    removePage(id) {
      const { pages } = get();
      if (pages.length <= 1) return;
      const target = pages.find((p) => p.id === id);
      if (target?.isHome) {
        // 主页不可删；先把主页身份转移
        return;
      }
      commit(({ pages, connections }) => ({
        pages: pages.filter((p) => p.id !== id),
        connections: connections.filter((c) => c.fromPageId !== id && c.toPageId !== id),
      }));
      if (get().currentPageId === id) {
        const rest = get().pages;
        set({ currentPageId: rest.find((p) => p.isHome)?.id || rest[0]?.id || null, selectedWidgetId: null, selectedIds: [] });
      }
    },

    setFlowPos(id, x, y) {
      commit(({ pages }) => ({
        pages: pages.map((p) => (p.id === id ? { ...p, flowX: x, flowY: y } : p)),
      }));
    },

    /* ==================== App 级底部导航（TabBar） ==================== */

    setTabs(tabs) {
      set({ tabs, dirty: true });
    },

    addTab(tab) {
      set({ tabs: [...get().tabs, tab], dirty: true });
    },

    updateTab(id, patch) {
      set({ tabs: get().tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)), dirty: true });
    },

    removeTab(id) {
      set({ tabs: get().tabs.filter((t) => t.id !== id), dirty: true });
    },

    moveTab(id, toIndex) {
      const list = [...get().tabs];
      const from = list.findIndex((t) => t.id === id);
      if (from < 0) return;
      const [item] = list.splice(from, 1);
      const adj = from < toIndex ? toIndex - 1 : toIndex;
      list.splice(Math.max(0, Math.min(adj, list.length)), 0, item);
      set({ tabs: list, dirty: true });
    },

    /** 向指定页面追加组件（无限画布画板内「+」添加）：流式追加尾部，自由布局自动堆叠落位 */
    addWidgetToPage(pageId, type) {
      const page = get().pages.find((p) => p.id === pageId);
      if (!page) return;
      const def = getWidget(type);
      if (!def) return;
      const w: WidgetInstance = {
        id: uid(),
        type,
        props: deepClone(def.defaultProps),
        width: 'full',
        align: 'left',
        mt: 0,
        mb: 8,
      };
      if (page.layout === 'free') {
        const fullW = def.fullBleed ? 375 : 355;
        const maxBottom = page.components.reduce(
          (m, c) => Math.max(m, (c.y ?? 0) + (c.h ?? 64)),
          0
        );
        w.x = def.fullBleed ? 0 : 10;
        w.y = maxBottom + 12;
        w.w = fullW;
      }
      commit(({ pages }) => ({
        pages: pages.map((p) =>
          p.id === pageId ? { ...p, components: [...p.components, w] } : p
        ),
      }));
      /* 选中落在该页的新组件（后续就地编辑直接生效于该页） */
      set({ currentPageId: pageId, selectedWidgetId: w.id, selectedIds: [w.id] });
    },

    addConnection(c) {
      if (c.fromPageId === c.toPageId) return;
      const conn: ConnectionData = { id: uid(), action: 'click', ...c };
      commit(({ connections }) => ({
        /* 同组件同槽位替换：一个按钮只有一个跳转行为，重复绑定即改绑 */
        connections: [
          ...connections.filter(
            (x) =>
              !(
                x.fromPageId === c.fromPageId &&
                x.fromWidgetId === c.fromWidgetId &&
                (x.slot || undefined) === (c.slot || undefined)
              )
          ),
          conn,
        ],
      }));
    },

    removeConnection(id) {
      commit(({ connections }) => ({ connections: connections.filter((c) => c.id !== id) }));
    },

    updateConnection(id, patch) {
      commit(({ connections }) => ({
        connections: connections.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    },

    updateTheme(patch) {
      const { project } = get();
      if (!project) return;
      set({
        project: { ...project, theme: { ...project.theme, ...patch } },
        dirty: true,
      });
    },

    undo() {
      const { past, pages, connections, future } = get();
      if (past.length === 0) return;
      const prev = past[past.length - 1];
      set({
        past: past.slice(0, -1),
        future: [{ pages: deepClone(pages), connections: deepClone(connections) }, ...future].slice(0, MAX_HISTORY),
        pages: prev.pages,
        connections: prev.connections,
        dirty: true,
        selectedWidgetId: null,
        selectedIds: [],
      });
    },

    redo() {
      const { future, pages, connections, past } = get();
      if (future.length === 0) return;
      const next = future[0];
      set({
        future: future.slice(1),
        past: [...past, { pages: deepClone(pages), connections: deepClone(connections) }],
        pages: next.pages,
        connections: next.connections,
        dirty: true,
        selectedWidgetId: null,
        selectedIds: [],
      });
    },

    async save() {
      const { project, pages, connections, tabs, saving } = get();
      if (!project || saving) return false;
      set({ saving: true });
      try {
        const res = await fetch(`/api/projects/${project.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: project.name,
            description: project.description,
            theme: project.theme,
            pages,
            connections,
            tabs,
          }),
        });
        if (!res.ok) throw new Error('save failed');
        set({ dirty: false, lastSavedAt: new Date().toISOString() });
        return true;
      } catch {
        set({ dirty: true });
        return false;
      } finally {
        set({ saving: false });
      }
    },

    setPublishOpen(b) {
      set({ publishOpen: b });
    },

    async publish(name, description) {
      const { project } = get();
      if (!project) return null;
      await get().save();
      const res = await fetch(`/api/projects/${project.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.version ?? null;
    },

    async openPublishPreview(publishId) {
      const res = await fetch(`/api/publishes/${publishId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.snapshot) return;
      const home = data.snapshot.pages?.find((p: PageData) => p.isHome);
      set({
        previewSnapshot: { ...data.snapshot, version: data.version },
        view: 'preview',
        currentPageId: home?.id || data.snapshot.pages?.[0]?.id || null,
        selectedWidgetId: null,
      });
    },

    exitPublishPreview() {
      const hasProject = !!get().project;
      set({ previewSnapshot: null, view: hasProject ? 'editor' : 'home' });
    },

    /** 导出当前项目为 JSON 文件下载 */
    exportProject() {
      const { project, pages, connections, tabs } = get();
      if (!project) return;
      const payload = {
        app: 'AppCraft Studio',
        format: 1,
        exportedAt: new Date().toISOString(),
        name: project.name,
        description: project.description,
        theme: project.theme,
        pages,
        connections,
        tabs,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name || 'appcraft-project'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    /** 导入项目 JSON：创建新项目并打开 */
    async importProject(payload) {
      try {
        const res = await fetch('/api/projects/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return false;
        const { id } = await res.json();
        await get().loadHome();
        await get().openProject(id);
        return true;
      } catch {
        return false;
      }
    },

    /* ==================== 组件市场（我的组合） ==================== */

    async loadPresets() {
      try {
        const res = await fetch('/api/presets');
        if (!res.ok) return;
        const data = await res.json();
        set({ presets: Array.isArray(data) ? data : [], presetsLoaded: true });
      } catch {
        set({ presetsLoaded: true });
      }
    },

    async savePreset(name, icon, ids) {
      const page = currentPage();
      if (!page || ids.length === 0) return null;
      const trimmed = name.trim();
      if (!trimmed) return null;
      /* 按画布顺序提取选中组件，坐标转为组合内相对坐标（去掉 id/锁定/隐藏/编组等运行时标记） */
      const picked = page.components
        .filter((c) => ids.includes(c.id) && !c.locked)
        .map((c) => {
          const { id: _id, locked: _l, hidden: _h, group: _g, ...rest } = c;
          return rest as WidgetInstance;
        });
      if (picked.length === 0) return null;
      const minX = Math.min(...picked.map((c) => c.x ?? 0));
      const minY = Math.min(...picked.map((c) => c.y ?? 0));
      const normalized = picked.map((c) =>
        c.x !== undefined || c.y !== undefined
          ? { ...c, x: (c.x ?? 0) - minX, y: (c.y ?? 0) - minY }
          : c
      );
      try {
        const res = await fetch('/api/presets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed, icon: icon || '✨', widgets: normalized }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        set({ presets: [data, ...get().presets] });
        return data;
      } catch {
        return null;
      }
    },

    async deletePreset(id) {
      set({ presets: get().presets.filter((p) => p.id !== id) });
      await fetch(`/api/presets/${id}`, { method: 'DELETE' }).catch(() => null);
    },

    async renamePreset(id, patch) {
      const prev = get().presets;
      const name = patch.name?.trim();
      if (name !== undefined && !name) return false;
      /* 乐观更新 */
      set({
        presets: prev.map((p) =>
          p.id === id ? { ...p, ...(name !== undefined ? { name } : {}), ...(patch.icon ? { icon: patch.icon } : {}) } : p
        ),
      });
      try {
        const res = await fetch(`/api/presets/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error('failed');
        return true;
      } catch {
        set({ presets: prev }); /* 回滚 */
        return false;
      }
    },

    async togglePresetStar(id) {
      const prev = get().presets;
      const target = prev.find((p) => p.id === id);
      if (!target) return false;
      const starred = !target.meta?.starred;
      const nextMeta = { ...(target.meta ?? {}), starred, starredAt: starred ? new Date().toISOString() : undefined };
      /* 乐观更新 */
      set({ presets: prev.map((p) => (p.id === id ? { ...p, meta: nextMeta } : p)) });
      try {
        const res = await fetch(`/api/presets/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ starred }),
        });
        if (!res.ok) throw new Error('failed');
        return true;
      } catch {
        set({ presets: prev }); /* 回滚 */
        return false;
      }
    },

    insertPreset(preset, anchor) {
      const page = currentPage();
      if (!page) return;
      const defs = preset.widgets.map((w) => ({ w, def: getWidget(w.type) }));
      const valid = defs.filter((d): d is { w: WidgetInstance; def: NonNullable<ReturnType<typeof getWidget>> } => !!d.def);
      if (valid.length === 0) return;
      /* 锚点：未给定时以内容底部为锚（默认 10px 边距）；拖拽释放时以释放点为组合原点 */
      const maxBottom = anchor
        ? 0
        : page.components.reduce((m, c) => Math.max(m, (c.y ?? 0) + (c.h ?? 64)), 0);
      const baseX = anchor ? anchor.x : 10;
      const baseY = anchor ? anchor.y : maxBottom + 12;
      const created: WidgetInstance[] = valid.map(({ w, def }) => {
        const inst: WidgetInstance = {
          ...deepClone(w),
          id: uid(),
          locked: undefined,
          hidden: undefined,
          group: undefined,
        };
        if (page.layout === 'free') {
          inst.x = Math.max(0, Math.min(baseX + (w.x ?? 0), 375 - (w.w ?? 355)));
          inst.y = Math.max(0, baseY + (w.y ?? 0));
          inst.w = w.w ?? (def.fullBleed ? 375 : 355);
        } else {
          delete inst.x;
          delete inst.y;
          delete inst.w;
          delete inst.h;
        }
        return inst;
      });
      commit(({ pages }) => ({
        pages: pages.map((p) =>
          p.id === page.id ? { ...p, components: [...p.components, ...created] } : p
        ),
      }));
      /* 选中整组新组件，方便紧接着拖动调整 */
      set({
        selectedWidgetId: created[created.length - 1].id,
        selectedIds: created.map((c) => c.id),
      });
    },

    async savePagePreset(name, icon, pageId) {
      const page = get().pages.find((p) => p.id === pageId);
      if (!page) return null;
      const trimmed = name.trim();
      if (!trimmed || page.components.length === 0) return null;
      /* 整页组件原样保留绝对坐标（页面模板的布局语义），剥运行时标记 */
      const widgets = page.components.map((c) => {
        const { locked: _l, hidden: _h, group: _g, ...rest } = c;
        return rest as WidgetInstance;
      });
      try {
        const res = await fetch('/api/presets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmed,
            icon: icon || '📄',
            kind: 'page',
            widgets,
            meta: { background: page.background, layout: page.layout ?? 'free' },
          }),
        });
        if (!res.ok) return null;
        const data: PresetData = await res.json();
        set({ presets: [data, ...get().presets] });
        return data;
      } catch {
        return null;
      }
    },

    addPageFromTemplate(preset) {
      const count = get().pages.length;
      const pid = uid();
      const comps: WidgetInstance[] = deepClone(preset.widgets).map((c) => ({
        ...c,
        id: uid(),
        locked: undefined,
        hidden: undefined,
        group: undefined,
      }));
      commit(({ pages }) => ({
        pages: [
          ...pages,
          {
            id: pid,
            name: preset.name,
            background: preset.meta?.background ?? '#f6f7fb',
            isHome: pages.length === 0,
            components: comps,
            layout: preset.meta?.layout ?? 'free',
            flowX: 80 + (count % 3) * 340,
            flowY: 80 + Math.floor(count / 3) * 280,
          },
        ],
      }));
      set({ currentPageId: pid, selectedWidgetId: null, selectedIds: [] });
    },
  };
});

/** 自动保存：脏状态 1.2s 后保存 */
export function bindAutosave() {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  const unsub = useBuilder.subscribe((state) => {
    if (stopped) return;
    if (state.dirty && state.view !== 'home') {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        useBuilder.getState().save();
      }, 1200);
    }
  });
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    unsub();
  };
}
