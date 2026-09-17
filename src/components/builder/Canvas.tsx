'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ChevronUp, ChevronDown, Copy, Trash2, ZoomIn, ZoomOut, Scan,
  Move3d, Rows3, Info, X, Lock, Link2, Boxes, Ungroup, PackagePlus,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  StretchHorizontal, StretchVertical,
  Grid3x3, Magnet, Droplet, Check, Moon, Paintbrush, WandSparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBuilder } from '@/lib/store';
import { useDnd } from '@/lib/dnd-store';
import { useCanvasSettings } from '@/lib/canvas-settings';
import { getWidget } from '@/components/widgets/registry';
import { PhoneFrame } from './PhoneFrame';
import { WidgetRenderer, WidgetInner } from './WidgetRenderer';
import { BusScopeProvider } from '@/lib/interaction-bus';
import { WidgetToast } from '@/lib/widget-toast';
import { DragGhost } from './DragGhost';
import { WidgetContextMenu } from './WidgetContextMenu';
import { CanvasBlankMenu } from './CanvasBlankMenu';
import { SavePresetDialog } from './PresetMarket';
import { CanvasStarterGuide } from './StarterKits';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { SHADOW_FILTER, SHADOW_OPTS, missingFreeCoords, type WidgetInstance, type WidgetShadow } from '@/lib/types';

const SNAP = 4;
const MIN_W = 48;
const MIN_H = 32;
const SCREEN_W = 375;
const SCREEN_H = 812;
const EMPTY_GUIDES: { v: number[]; h: number[] } = { v: [], h: [] };
const HANDLE_DIRS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;
const HANDLE_CLASS: Record<string, string> = {
  n: 'left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize',
  s: 'left-1/2 -bottom-1.5 -translate-x-1/2 cursor-ns-resize',
  e: '-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize',
  w: '-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize',
  ne: '-right-1.5 -top-1.5 cursor-nesw-resize',
  sw: '-left-1.5 -bottom-1.5 cursor-nesw-resize',
  nw: '-left-1.5 -top-1.5 cursor-nwse-resize',
  se: '-right-1.5 -bottom-1.5 cursor-nwse-resize',
};

/**
 * 编辑画布（指针拖拽系统）：
 * - 从组件仓库拖入（Pointer Events，鼠标/触屏通吃，替代不可靠的 HTML5 DnD）
 * - 流式布局：拖拽排序 + 插入指示线
 * - 自由布局：任意摆放位置 + 8 向手柄调整大小 + 对齐吸附线 + 4px 网格吸附
 * - 多选：Shift 点选 + 空白处框选，批量拖动/对齐/分布/复制/删除
 * - 旧页面自动升级为自由布局（视觉无感迁移）；新建页面默认自由布局
 * - 流式布局下拖动时浮出提示，可一键切换自由布局
 */

/** 本次会话只提示一次自动迁移 */
let freeMigrateToastShown = false;

/** 编组徽章配色（按组 id 稳定取色，无蓝靶） */
const GROUP_COLORS = ['#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16', '#f43f5e'];
export function groupColor(gid: string): string {
  let h = 0;
  for (let i = 0; i < gid.length; i++) h = (h * 31 + gid.charCodeAt(i)) >>> 0;
  return GROUP_COLORS[h % GROUP_COLORS.length];
}

export function Canvas() {
  const pages = useBuilder((s) => s.pages);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const selectedWidgetId = useBuilder((s) => s.selectedWidgetId);
  const selectedIds = useBuilder((s) => s.selectedIds);
  const theme = useBuilder((s) => s.project?.theme);
  const select = useBuilder((s) => s.select);
  const removeWidget = useBuilder((s) => s.removeWidget);
  const duplicateWidget = useBuilder((s) => s.duplicateWidget);
  const connections = useBuilder((s) => s.connections);

  const [zoom, setZoom] = useState(0.85);
  const [indicator, setIndicator] = useState<{ index: number; y: number } | null>(null);
  const [freePreview, setFreePreview] = useState<{ x: number; y: number; w: number } | null>(null);
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>(EMPTY_GUIDES);
  const [sizeBadge, setSizeBadge] = useState<string | null>(null);
  const [posBadge, setPosBadge] = useState<string | null>(null);
  const [freeHeight, setFreeHeight] = useState(700);
  /** 框选矩形（画布坐标系） */
  const [marquee, setMarquee] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [marqueeCount, setMarqueeCount] = useState(0);
  const marqueeStartRef = useRef({ x: 0, y: 0 });
  const marqueeHitRef = useRef<string[]>([]);
  const [showFlowTip, setShowFlowTip] = useState(true);
  const [flowDragHint, setFlowDragHint] = useState(false);
  const flowHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 空白处右键菜单（视口坐标） */
  const [blankMenu, setBlankMenu] = useState<{ x: number; y: number } | null>(null);
  /** 存为组合对话框 */
  const [presetOpen, setPresetOpen] = useState(false);
  /** 我的组合拖拽悬停提示（拖到画布释放插入） */
  const [presetHover, setPresetHover] = useState(false);
  /** 多选包围盒（画布坐标系，随选中集/拖拽实时刷新） */
  const [bbox, setBbox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  /** 画布辅助设置（网格/吸附） */
  const canvasCfg = useCanvasSettings();
  const hydrateCanvasCfg = useCanvasSettings((s) => s.hydrate);
  useEffect(() => { hydrateCanvasCfg(); }, [hydrateCanvasCfg]);
  /** 批量透明度弹层 */
  const [opacityOpen, setOpacityOpen] = useState(false);
  const [opacityVal, setOpacityVal] = useState(100);
  /** 批量阴影弹层（初值 = 主选中组件的阴影） */
  const [shadowOpen, setShadowOpen] = useState(false);
  const [shadowRefVal, setShadowRefVal] = useState<WidgetShadow | undefined>(undefined);
  /** 样式刷剪贴板是否有内容（copy 端通过 CustomEvent 通知） */
  const [hasClip, setHasClip] = useState(false);
  useEffect(() => {
    const h = () => setHasClip(true);
    window.addEventListener('appcraft-style-clip', h);
    return () => window.removeEventListener('appcraft-style-clip', h);
  }, []);

  /* ---------- 画布标尺（顶部 + 左侧刻度，跟随缩放与滚动） ---------- */

  const scrollerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  /** 手机屏幕内容坐标系原点（内容 x=0/y=0）在滚动视口中的位置 + 视口尺寸 */
  const [rulerPos, setRulerPos] = useState<{ ox: number; oy: number; vw: number; vh: number } | null>(null);
  const rulerRafRef = useRef(0);
  const updateRuler = useCallback(() => {
    const sc = scrollerRef.current;
    const ph = phoneRef.current;
    if (!sc || !ph) return;
    const sr = sc.getBoundingClientRect();
    const pr = ph.getBoundingClientRect();
    const z = zoomRef.current;
    const next = {
      ox: pr.left - sr.left + 10 * z,  /* 手机壳左内边距 10px */
      oy: pr.top - sr.top + 58 * z,    /* 手机壳上内边距 10px + 状态栏 48px */
      vw: sc.clientWidth,
      vh: sc.clientHeight,
    };
    setRulerPos((cur) =>
      cur && Math.abs(cur.ox - next.ox) < 0.5 && Math.abs(cur.oy - next.oy) < 0.5 &&
      cur.vw === next.vw && cur.vh === next.vh
        ? cur
        : next
    );
  }, []);
  const scheduleRuler = useCallback(() => {
    cancelAnimationFrame(rulerRafRef.current);
    rulerRafRef.current = requestAnimationFrame(updateRuler);
  }, [updateRuler]);
  useEffect(() => {
    if (!canvasCfg.showRuler) return;
    scheduleRuler();
    const sc = scrollerRef.current;
    if (!sc || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => scheduleRuler());
    ro.observe(sc);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rulerRafRef.current);
    };
  }, [canvasCfg.showRuler, scheduleRuler, zoom]);

  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const freeLayerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  const dragMetaRef = useRef<{ offX: number; offY: number; batch: boolean }>({ offX: 0, offY: 0, batch: false });
  /** 多选组拖拽：所有选中组件的起始坐标 + 指针起点 */
  const groupStartRef = useRef<{ map: Record<string, { x: number; y: number }>; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<null | {
    id: string; dir: string; startX: number; startY: number;
    rect: { x: number; y: number; w: number; h: number };
    /** 拖拽开始时高度是否为「自动」（h 未设）：纯东西向拖拽时保持自动，不再固化实测高度 */
    autoH: boolean;
    /** 拖拽开始时的基线裁剪量：组件固有 overflow-hidden 装饰不算在内，只提示本次拖矮新增的裁剪 */
    baselineClipped: number;
  }>(null);

  /** 测量组件内最大垂直裁剪量（含内部 overflow-hidden 层，如卡片根自身裁内容） */
  const measureClipped = useCallback((id: string) => {
    const el = itemRefs.current.get(id);
    if (!el) return 0;
    let m = el.scrollHeight - el.clientHeight;
    el.querySelectorAll<HTMLElement>('*').forEach((n) => {
      const d = n.scrollHeight - n.clientHeight;
      if (d > m) m = d;
    });
    return m;
  }, []);
  const freePreviewRef = useRef<{ x: number; y: number; w: number } | null>(null);
  const isFreeRef = useRef(false);

  /**
   * 多选包围盒：订阅 store 变化（拖拽瞬态更新也触发），用选中组件真实 DOM
   * 尺寸计算（兼容自适应高度）。setState 全部发生在订阅/RAF 回调中（lint 规范）。
   */
  const recomputeBboxRef = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    const recompute = () => {
      const b = useBuilder.getState();
      const pg = b.pages.find((p) => p.id === b.currentPageId);
      const free = pg?.layout === 'free' && !missingFreeCoords(pg?.components ?? []);
      const ids = b.selectedIds;
      if (!free || ids.length < 2) {
        setBbox((cur) => (cur === null ? cur : null));
        return;
      }
      const layer = freeLayerRef.current;
      if (!layer) return;
      const lr = layer.getBoundingClientRect();
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const id of ids) {
        const el = itemRefs.current.get(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        x0 = Math.min(x0, (r.left - lr.left) / zoomRef.current);
        y0 = Math.min(y0, (r.top - lr.top) / zoomRef.current);
        x1 = Math.max(x1, (r.right - lr.left) / zoomRef.current);
        y1 = Math.max(y1, (r.bottom - lr.top) / zoomRef.current);
      }
      if (x0 === Infinity) {
        setBbox((cur) => (cur === null ? cur : null));
        return;
      }
      const next = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      setBbox((cur) =>
        cur && Math.abs(cur.x - next.x) < 0.5 && Math.abs(cur.y - next.y) < 0.5 &&
        Math.abs(cur.w - next.w) < 0.5 && Math.abs(cur.h - next.h) < 0.5
          ? cur
          : next
      );
    };
    recomputeBboxRef.current = recompute;
    const raf = requestAnimationFrame(recompute);
    const unsub = useBuilder.subscribe(recompute);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      recomputeBboxRef.current = () => {};
    };
  }, []);
  useEffect(() => {
    const b = useBuilder.getState();
    const pg = b.pages.find((p) => p.id === b.currentPageId);
    isFreeRef.current = pg?.layout === 'free' && !missingFreeCoords(pg?.components ?? []);
  }, [pages, currentPageId]);
  useEffect(() => () => { useDnd.getState().end(); }, []);

  const page = pages.find((p) => p.id === currentPageId);
  const isFreeMode = page?.layout === 'free';
  const isFree = isFreeMode && !missingFreeCoords(page?.components ?? []);
  const t = theme ?? { primary: '#f97316', radius: 'md' as const, dark: false };
  const dndActive = useDnd((s) => s.active);

  /** 编组感知选中：组内成员点击 → 整组选中（Shift 加选仍走单个） */
  const selectGroupAware = useCallback((id: string) => {
    const b = useBuilder.getState();
    const members = b.groupMembersOf(id);
    if (members) b.selectMany(members);
    else b.select(id);
  }, []);

  /** 空白处右键：仅当命中点不在组件内时打开 */
  const handleBlankContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-wid]')) return; /* 组件区：交给组件右键菜单 */
    e.preventDefault();
    setBlankMenu({ x: e.clientX, y: e.clientY });
  }, []);

  /* ---------- 坐标与落点计算 ---------- */

  const toLocal = useCallback((clientX: number, clientY: number) => {
    const el = contentRef.current;
    const rect = el?.getBoundingClientRect();
    if (!el || !rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left) / zoomRef.current,
      y: (clientY - rect.top) / zoomRef.current + el.scrollTop,
    };
  }, []);

  const insideContent = useCallback((clientX: number, clientY: number) => {
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const pad = 8;
    return (
      clientX >= rect.left - pad && clientX <= rect.right + pad &&
      clientY >= rect.top - pad && clientY <= rect.bottom + pad
    );
  }, []);

  const computeDrop = useCallback((clientY: number) => {
    const b = useBuilder.getState();
    const list = b.pages.find((p) => p.id === b.currentPageId)?.components ?? [];
    const origin = contentRef.current?.getBoundingClientRect();
    const scrollTop = contentRef.current?.scrollTop ?? 0;
    for (let i = 0; i < list.length; i++) {
      const rect = itemRefs.current.get(list[i].id)?.getBoundingClientRect();
      if (!rect) continue;
      if (clientY < rect.top + rect.height / 2) {
        return { index: i, y: origin ? (rect.top - origin.top) / zoomRef.current + scrollTop : 0 };
      }
    }
    const last = list.length > 0 ? itemRefs.current.get(list[list.length - 1].id)?.getBoundingClientRect() : null;
    return { index: list.length, y: origin && last ? (last.bottom - origin.top) / zoomRef.current + scrollTop : 0 };
  }, []);

  /** 自由布局吸附：其它组件边缘/中心 + 屏幕边缘/水平中心 + 4px 网格（均可由画布设置关闭） */
  const snapPos = useCallback((x: number, y: number, movingId: string | null, w: number, h: number) => {
    const b = useBuilder.getState();
    const cs = useCanvasSettings.getState();
    const comps = b.pages.find((p) => p.id === b.currentPageId)?.components ?? [];
    const T = 6;
    const vCands: { p: number; line: number }[] = [];
    const hCands: { p: number; line: number }[] = [];
    if (cs.snapGuides) {
      vCands.push(
        { p: 0, line: 0 },
        { p: (SCREEN_W - w) / 2, line: SCREEN_W / 2 },
        { p: SCREEN_W - w, line: SCREEN_W }
      );
      hCands.push({ p: 0, line: 0 });
      comps.forEach((c) => {
        if (c.id === movingId) return;
        const cx = c.x ?? 0, cy = c.y ?? 0, cw = c.w ?? 355, ch = c.h ?? 56;
        vCands.push({ p: cx, line: cx }, { p: cx + cw / 2 - w / 2, line: cx + cw / 2 }, { p: cx + cw - w, line: cx + cw });
        hCands.push({ p: cy, line: cy }, { p: cy + ch / 2 - h / 2, line: cy + ch / 2 }, { p: cy + ch - h, line: cy + ch }, { p: cy + ch, line: cy + ch });
      });
    }
    let nx = x, ny = y;
    const g: { v: number[]; h: number[] } = { v: [], h: [] };
    for (const c of vCands) {
      if (Math.abs(x - c.p) <= T) { nx = Math.max(0, Math.min(c.p, SCREEN_W - w)); g.v.push(c.line); break; }
    }
    for (const c of hCands) {
      if (Math.abs(y - c.p) <= T) { ny = Math.max(0, c.p); g.h.push(c.line); break; }
    }
    if (cs.snapGrid) {
      if (g.v.length === 0) nx = Math.round(x / SNAP) * SNAP;
      if (g.h.length === 0) ny = Math.round(y / SNAP) * SNAP;
    }
    return { x: Math.max(0, Math.min(nx, SCREEN_W - w)), y: Math.max(0, ny), guides: g };
  }, []);

  /* ---------- 拖拽过程 ---------- */

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    const st = useDnd.getState();

    /* 缩放手柄拖拽中 */
    if (resizeRef.current) {
      const r = resizeRef.current;
      setPosBadge(null);
      const dx = (clientX - r.startX) / zoomRef.current;
      const dy = (clientY - r.startY) / zoomRef.current;
      const vertical = r.dir.includes('n') || r.dir.includes('s');
      let { x, y, w, h } = r.rect;
      if (r.dir.includes('e')) w = r.rect.w + dx;
      if (r.dir.includes('s')) h = r.rect.h + dy;
      if (r.dir.includes('w')) { w = r.rect.w - dx; x = r.rect.x + dx; }
      if (r.dir.includes('n')) { h = r.rect.h - dy; y = r.rect.y + dy; }
      if (dirClampWest(r.dir) && x < 0) { w = r.rect.w + r.rect.x; x = 0; }
      if (dirClampNorth(r.dir) && y < 0) { h = r.rect.h + r.rect.y; y = 0; }
      w = Math.max(MIN_W, w);
      h = Math.max(MIN_H, h);
      if (x + w > SCREEN_W) w = SCREEN_W - x;
      if (useCanvasSettings.getState().snapGrid) {
        x = Math.round(x / SNAP) * SNAP;
        y = Math.round(Math.max(0, y) / SNAP) * SNAP;
        w = Math.round(w / SNAP) * SNAP;
        if (vertical) h = Math.round(h / SNAP) * SNAP;
      }
      /* 自适应关键：纯东西向拖拽只改宽度，高度语义保持原样 ——
         原本「自动高度」的组件绝不写 h（此前会把实测高度固化成固定值，
         导致之后内容增减/字号变化时组件被 overflow 裁剪、不再自适应）；
         南北向/对角拖拽 = 用户显式设定高度，允许固化 h（含原固定值保持） */
      const patch = vertical
        ? { x, y, w, h }
        : r.autoH
          ? { x, y, w }
          : { x, y, w, h: r.rect.h };
      useBuilder.getState().setWidgetRect(r.id, patch, true);
      setSizeBadge(vertical ? `${Math.round(w)} × ${Math.round(h)}` : `${Math.round(w)} × 自动`);
      return;
    }

    if (!insideContent(clientX, clientY)) {
      setIndicator(null);
      setFreePreview(null);
      freePreviewRef.current = null;
      setGuides(EMPTY_GUIDES);
      setPosBadge(null);
      return;
    }

    if (isFreeRef.current) {
      setIndicator(null);
      setPosBadge(null);
      if (st.kind === 'marquee') {
        /* 框选：更新矩形 + 实时命中 */
        const { x, y } = toLocal(clientX, clientY);
        const rect = { x0: marqueeStartRef.current.x, y0: marqueeStartRef.current.y, x1: x, y1: y };
        setMarquee(rect);
        const bx0 = Math.min(rect.x0, rect.x1), bx1 = Math.max(rect.x0, rect.x1);
        const by0 = Math.min(rect.y0, rect.y1), by1 = Math.max(rect.y0, rect.y1);
        const b = useBuilder.getState();
        const hits: string[] = [];
        b.pages
          .find((p) => p.id === b.currentPageId)
          ?.components.forEach((c) => {
            if (c.hidden || c.locked) return;
            const el = itemRefs.current.get(c.id);
            const cw = c.w ?? el?.offsetWidth ?? 355;
            const ch = c.h ?? el?.offsetHeight ?? 56;
            const cx = c.x ?? 0, cy = c.y ?? 0;
            if (cx < bx1 && cx + cw > bx0 && cy < by1 && cy + ch > by0) hits.push(c.id);
          });
        marqueeHitRef.current = hits;
        setMarqueeCount(hits.length);
        if (hits.length > 0) b.selectMany(hits);
        else b.select(null);
        return;
      }
      if (st.kind === 'new') {
        const def = getWidget(st.widgetType ?? '');
        const w0 = def?.fullBleed ? SCREEN_W : 355;
        const { x, y } = toLocal(clientX, clientY);
        const snapped = snapPos(x - w0 / 2, y - 24, null, w0, 56);
        const preview = { x: snapped.x, y: snapped.y, w: w0 };
        freePreviewRef.current = preview;
        setFreePreview(preview);
        setGuides(snapped.guides);
      } else if (st.kind === 'move') {
        const id = st.moveId!;
        const b = useBuilder.getState();
        const comp = b.pages
          .find((p) => p.id === b.currentPageId)
          ?.components.find((c) => c.id === id);
        if (!comp) return;
        if (!dragMetaRef.current.batch) {
          b.beginBatch();
          dragMetaRef.current.batch = true;
        }
        const { x, y } = toLocal(clientX, clientY);
        const gs = groupStartRef.current;
        if (gs && Object.keys(gs.map).length > 1) {
          /* 组拖拽：所有选中组件整体平移（网格吸附可关，不做边缘吸附） */
          const dx = x - gs.ox;
          const dy = y - gs.oy;
          const snap = useCanvasSettings.getState().snapGrid;
          const map: Record<string, { x: number; y: number }> = {};
          for (const [wid, s0] of Object.entries(gs.map)) {
            const cw = useBuilder
              .getState()
              .pages.find((p) => p.id === b.currentPageId)
              ?.components.find((c) => c.id === wid)?.w ?? 355;
            map[wid] = {
              x: Math.max(0, Math.min(snap ? Math.round((s0.x + dx) / SNAP) * SNAP : s0.x + dx, SCREEN_W - cw)),
              y: Math.max(0, snap ? Math.round((s0.y + dy) / SNAP) * SNAP : s0.y + dy),
            };
          }
          b.setWidgetsRects(map, true);
          setPosBadge(`${Math.round(dx)} · ${Math.round(dy)}`);
          setGuides(EMPTY_GUIDES);
          setFreePreview(null);
          freePreviewRef.current = null;
          return;
        }
        const cw = comp.w ?? 355;
        const ch = comp.h ?? 56;
        const snapped = snapPos(x - dragMetaRef.current.offX, y - dragMetaRef.current.offY, id, cw, ch);
        b.setWidgetRect(id, { x: snapped.x, y: snapped.y }, true);
        setPosBadge(`${Math.round(snapped.x)} · ${Math.round(snapped.y)}`);
        setGuides(snapped.guides);
        setFreePreview(null);
        freePreviewRef.current = null;
      }
    } else {
      setFreePreview(null);
      freePreviewRef.current = null;
      setGuides(EMPTY_GUIDES);
      setPosBadge(null);
      setIndicator(computeDrop(clientY));
      /* 流式拖动：浮出提示（结束后再保留 6 秒，方便点击切换） */
      if (st.started && st.kind === 'move') {
        if (flowHintTimer.current) clearTimeout(flowHintTimer.current);
        setFlowDragHint(true);
      }
    }
  }, [computeDrop, insideContent, snapPos, toLocal]);

  const handleUp = useCallback((clientX: number, clientY: number) => {
    const st = useDnd.getState();
    const b = useBuilder.getState();
    const pageNow = b.pages.find((p) => p.id === b.currentPageId);
    const freeNow = pageNow?.layout === 'free';

    /* 框选结束：命中集已在移动中实时写入 selectedIds；全部落空则清空。
       同时抑制紧随的 click，避免容器 onClick 把框选结果清空 */
    if (st.kind === 'marquee') {
      if (st.started) {
        suppressClickRef.current = true;
        useDnd.setState({ suppressNextClick: true });
        setTimeout(() => { suppressClickRef.current = false; }, 90);
      }
      if (marqueeHitRef.current.length === 0) b.select(null);
      setMarquee(null);
      setMarqueeCount(0);
      marqueeHitRef.current = [];
      useDnd.getState().end();
      return;
    }

    /* 缩放结束：合并历史 */
    if (resizeRef.current) {
      const r = resizeRef.current;
      if (dragMetaRef.current.batch) b.endBatch();
      resizeRef.current = null;
      setSizeBadge(null);
      dragMetaRef.current = { offX: 0, offY: 0, batch: false };
      useDnd.getState().end();
      /* 南北向/对角拖拽会固化高度：若本次拖拽新增内容裁剪（组件内部 overflow-hidden 层也算），
         提示恢复自适应的路径；与拖拽开始时的基线比较，固有装饰性裁剪不误报 */
      if (r.dir.includes('n') || r.dir.includes('s')) {
        requestAnimationFrame(() => {
          if (measureClipped(r.id) - r.baselineClipped > 8) {
            toast('组件高度小于内容，超出部分被隐藏', {
              description: '拖动手柄调高，或在右侧「布局」面板点「恢复自动高度」让内容自适应',
            });
          }
        });
      }
      return;
    }

    if (st.started) {
      suppressClickRef.current = true;
      useDnd.setState({ suppressNextClick: true });
      setTimeout(() => { suppressClickRef.current = false; }, 90);
    }

    if (st.started && st.kind === 'new' && st.widgetType) {
      if (insideContent(clientX, clientY)) {
        if (freeNow) {
          const { x, y } = toLocal(clientX, clientY);
          const def = getWidget(st.widgetType);
          const w0 = def?.fullBleed ? SCREEN_W : 355;
          const fp = freePreviewRef.current;
          const rx = fp?.x ?? Math.max(0, Math.round((x - w0 / 2) / SNAP) * SNAP);
          const ry = fp?.y ?? Math.max(0, Math.round((y - 24) / SNAP) * SNAP);
          b.addWidget(st.widgetType, undefined, { x: rx, y: ry, w: w0 }, st.preset?.props);
        } else {
          b.addWidget(st.widgetType, computeDrop(clientY).index, undefined, st.preset?.props);
        }
      }
    } else if (st.started && st.kind === 'move' && st.moveId) {
      if (freeNow) {
        if (dragMetaRef.current.batch) b.endBatch();
      } else if (insideContent(clientX, clientY)) {
        /* 仅画布内松手才排序；拖出画布松手视为取消 */
        b.moveWidget(st.moveId, computeDrop(clientY).index);
      }
    }

    dragMetaRef.current = { offX: 0, offY: 0, batch: false };
    groupStartRef.current = null;
    setIndicator(null);
    setFreePreview(null);
    freePreviewRef.current = null;
    setGuides(EMPTY_GUIDES);
    setSizeBadge(null);
    setPosBadge(null);
    /* 流式拖动结束后：提示再保留 6 秒，之后自动隐藏 */
    if (flowHintTimer.current) clearTimeout(flowHintTimer.current);
    flowHintTimer.current = setTimeout(() => setFlowDragHint(false), 6000);
    useDnd.getState().end();
  }, [computeDrop, insideContent, toLocal]);

  /* 拖拽期间挂全局指针监听 */
  useEffect(() => {
    if (!dndActive) return;
    const onMove = (e: PointerEvent) => {
      useDnd.getState().move(e.clientX, e.clientY);
      if (!useDnd.getState().started) return;
      handleDragMove(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => handleUp(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onUp, true);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
    };
  }, [dndActive, handleDragMove, handleUp]);

  /* ---------- 布局切换 ---------- */

  /** 启用自由布局：已有坐标直接切；缺坐标（旧数据）先按当前渲染堆叠生成坐标 */
  const enableFree = useCallback(() => {
    const b = useBuilder.getState();
    const pg = b.pages.find((p) => p.id === b.currentPageId);
    if (!pg || pg.layout === 'free') return;
    if (!missingFreeCoords(pg.components)) {
      b.updatePage(pg.id, { layout: 'free' });
      setFlowDragHint(false);
      return;
    }
    const rects: Record<string, { x: number; y: number; w: number }> = {};
    let y = 12;
    pg.components.forEach((c) => {
      const el = itemRefs.current.get(c.id);
      const h = el ? el.offsetHeight : 64;
      const full = getWidget(c.type)?.fullBleed;
      rects[c.id] = { x: full ? 0 : 10, y, w: full ? SCREEN_W : 355 };
      y += h + 12;
    });
    b.convertToFreeLayout(rects);
    setFlowDragHint(false);
    toast('已启用自由布局', { description: '拖动组件任意摆放，选中后拖手柄调整大小' });
  }, []);

  /** 拖拽进行中一键切换：先干净结束拖拽，避免状态错乱 */
  const enableFreeNow = useCallback(() => {
    useDnd.getState().end();
    setIndicator(null);
    setFreePreview(null);
    freePreviewRef.current = null;
    setGuides(EMPTY_GUIDES);
    setPosBadge(null);
    dragMetaRef.current = { offX: 0, offY: 0, batch: false };
    resizeRef.current = null;
    enableFree();
  }, [enableFree]);

  const setLayoutMode = useCallback(
    (mode: 'flow' | 'free') => {
      const b = useBuilder.getState();
      const pg = b.pages.find((p) => p.id === b.currentPageId);
      if (!pg) return;
      if (mode === 'free') {
        enableFree();
      } else if (pg.layout !== 'flow') {
        b.updatePage(pg.id, { layout: 'flow' });
      }
    },
    [enableFree]
  );

  /* 旧页面自动升级为自由布局（显式选择流式的页面除外），视觉无感、不记历史
     - 旧数据 layout 为空：直接采用自由布局（已有坐标则原样保留，还原之前的自由排版） */
  useEffect(() => {
    if (!page || page.layout === 'flow') return;
    if (page.layout === 'free' && !missingFreeCoords(page.components)) return;
    const comps = page.components;
    const b = useBuilder.getState();
    if (comps.length === 0 || !missingFreeCoords(comps)) {
      b.migrateToFree(page.id);
      return;
    }
    const rects: Record<string, { x: number; y: number; w: number }> = {};
    let y = 12;
    comps.forEach((c) => {
      const el = itemRefs.current.get(c.id);
      const h = el ? el.offsetHeight : 64;
      const full = getWidget(c.type)?.fullBleed;
      rects[c.id] = { x: full ? 0 : 10, y, w: full ? SCREEN_W : 355 };
      y += h + 12;
    });
    b.migrateToFree(page.id, rects);
    if (!freeMigrateToastShown) {
      freeMigrateToastShown = true;
      toast('已自动启用自由布局', { description: '页面上的组件现在可以任意拖放位置了' });
    }
  }, [page?.id, page?.layout, page?.components]);

  /* 自由布局：方向键微调选中组件（Shift = 10px 步进） */
  useEffect(() => {
    if (!isFreeMode) return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      const dv: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
      };
      const d = dv[e.key];
      if (!d) return;
      const b = useBuilder.getState();
      if (useDnd.getState().active || !b.selectedWidgetId) return;
      const comp = b.pages
        .find((p) => p.id === b.currentPageId)
        ?.components.find((c) => c.id === b.selectedWidgetId);
      if (!comp) return;
      e.preventDefault();
      const step = e.shiftKey ? 10 : 2;
      const w = comp.w ?? 355;
      const nx = Math.max(0, Math.min((comp.x ?? 0) + d[0] * step, SCREEN_W - w));
      const ny = Math.max(0, (comp.y ?? 0) + d[1] * step);
      b.setWidgetRect(comp.id, { x: nx, y: ny });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFreeMode]);

  /* 切到自由布局后立即收起流式拖动提示 */
  useEffect(() => () => { if (flowHintTimer.current) clearTimeout(flowHintTimer.current); }, []);

  /* 自由布局内容总高（含未被 h 固定的自适应组件）— ResizeObserver 订阅式测量 */
  useEffect(() => {
    if (!isFree) return;
    const measure = () => {
      let max = 700;
      const b = useBuilder.getState();
      const comps = b.pages.find((p) => p.id === b.currentPageId)?.components ?? [];
      comps.forEach((c) => {
        const el = itemRefs.current.get(c.id);
        if (el) max = Math.max(max, (c.y ?? 0) + el.offsetHeight + 24);
      });
      setFreeHeight((prev) => (Math.abs(prev - max) > 2 ? Math.max(700, max) : prev));
    };
    const ro = new ResizeObserver(measure);
    itemRefs.current.forEach((el) => ro.observe(el));
    /* 总线驱动的显隐（如联动组件切 tab）只会增删 DOM 节点，不触发 ResizeObserver：
     * MutationObserver 兑底重新挂观察 + 重测，避免底部组件恢复显示后内容高度被截断 */
    const mo = new MutationObserver(() => {
      itemRefs.current.forEach((el) => ro.observe(el));
      measure();
    });
    if (scrollerRef.current) {
      mo.observe(scrollerRef.current, { childList: true, subtree: true });
    }
    measure();
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [isFree, page?.components, zoom]);

  /* ---------- 渲染 ---------- */

  if (!page) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
        正在加载画布…
      </div>
    );
  }

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
    <div
      ref={scrollerRef}
      onScroll={scheduleRuler}
      className="flex h-full w-full flex-col items-center overflow-auto bg-dot bg-[#eef0f4] py-8 thin-scroll"
    >
      <DragGhost />

      {/* 流式布局拖动提示：拖动仅排序；结束后保留 6 秒，可一键切换自由布局 */}
      {flowDragHint && !isFree && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-[70] -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-zinc-900/92 py-1.5 pl-3 pr-1.5 text-white shadow-2xl backdrop-blur">
            <Info className="size-3.5 shrink-0 text-amber-300" />
            <span className="whitespace-nowrap text-xs font-medium">流式布局下拖动仅调整上下顺序</span>
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                enableFreeNow();
                setFlowDragHint(false);
              }}
              onClick={enableFreeNow}
              className="shrink-0 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-zinc-900 transition-colors hover:bg-amber-300"
            >
              切换自由布局
            </button>
          </div>
        </div>
      )}

      {/* 画布信息 */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
        <div
          className="flex items-center rounded-full bg-white p-0.5 shadow-sm ring-1 ring-zinc-200"
          role="group"
          aria-label="布局模式"
        >
          <button
            onClick={() => setLayoutMode('flow')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-semibold transition-all ${
              !isFreeMode ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'
            }`}
            title="流式布局：组件自上而下自动排列，拖动调整上下顺序"
          >
            <Rows3 className="size-3.5" />
            流式布局
          </button>
          <button
            onClick={() => setLayoutMode('free')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-semibold transition-all ${
              isFreeMode ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'
            }`}
            title="自由布局：组件可任意拖放位置、8 向手柄调整大小"
          >
            <Move3d className="size-3.5" />
            自由布局
          </button>
        </div>
        <span className="rounded-full bg-white px-3 py-1 shadow-sm">
          {isFree ? '拖动摆放位置 · 手柄调大小 · 方向键微调' : '拖入左侧组件 · 点击选中 · 拖动排序'}
        </span>
        <span className="rounded-full bg-white px-3 py-1 shadow-sm">
          {page.name} · {page.components.filter((c) => !c.hidden).length} 个组件
        </span>
      </div>

      {/* 流式布局提示横幅（可关闭） */}
      {!isFreeMode && showFlowTip && (
        <div className="mb-3 flex max-w-[395px] items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm">
          <Info className="size-4 shrink-0 text-amber-500" />
          <p className="flex-1 text-[11px] leading-4 text-amber-800">
            流式布局下组件只能上下排列。启用<b>自由布局</b>后可任意拖放位置、自由调整大小。
          </p>
          <button
            onClick={enableFree}
            className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-amber-600"
          >
            启用自由布局
          </button>
          <button
            onClick={() => setShowFlowTip(false)}
            className="shrink-0 text-amber-400 transition-colors hover:text-amber-600"
            aria-label="关闭提示"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div ref={phoneRef} style={{ width: 395 * zoom, height: 832 * zoom }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: 395, height: 832 }}>
          <PhoneFrame theme={t} pageBg={page.background} liveTheme>
            {/* 总线按页面作用域；编辑器也实时联动（login-tabs 可点击切换互斥组件显隐） */}
            <BusScopeProvider value={page?.id ?? ''}>
            <div
              ref={contentRef}
              className="relative h-full overflow-y-auto thin-scroll"
              onContextMenu={handleBlankContextMenu}
              onDragOver={(e) => {
                /* 我的组合拖入：高亮画布，提示可释放插入 */
                if (!e.dataTransfer.types.includes('application/x-appcraft-preset')) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                setPresetHover(true);
              }}
              onDragLeave={(e) => {
                if (!e.dataTransfer.types.includes('application/x-appcraft-preset')) return;
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setPresetHover(false);
              }}
              onDrop={(e) => {
                const pid = e.dataTransfer.getData('application/x-appcraft-preset');
                setPresetHover(false);
                if (!pid) return;
                e.preventDefault();
                const st = useBuilder.getState();
                const preset = st.presets.find((x) => x.id === pid);
                if (!preset) return;
                const pt = toLocal(e.clientX, e.clientY);
                st.insertPreset(preset, { x: Math.round(pt.x), y: Math.round(pt.y) });
                toast.success(`已插入组合「${preset.name}」`, { description: `${preset.widgets.length} 个组件已放到释放位置，可整体拖动` });
              }}
              onClick={() => {
                /* 拖拽/框选刚结束时抑制本次 click，避免误清空多选结果 */
                const d = useDnd.getState();
                if (suppressClickRef.current || d.suppressNextClick) {
                  if (d.suppressNextClick) useDnd.setState({ suppressNextClick: false });
                  return;
                }
                select(null);
              }}
            >
              <WidgetToast />
              {isFree && canvasCfg.showGrid && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: t.dark
                      ? 'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)'
                      : 'radial-gradient(circle, rgba(0,0,0,0.09) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                    minHeight: freeHeight,
                  }}
                />
              )}

              {/* 我的组合拖入提示层 */}
              {presetHover && (
                <div className="pointer-events-none absolute inset-0 z-50 flex items-start justify-center ring-2 ring-inset ring-amber-400" style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <span className="mt-12 flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xl">
                    <PackagePlus className="size-3.5" /> 松手插入到此处
                  </span>
                </div>
              )}

              {/* 插入指示线（流式） */}
              {indicator && (
                <div
                  className="pointer-events-none absolute left-1 right-1 z-40 flex items-center"
                  style={{ top: indicator.y }}
                >
                  <span className="h-[3px] flex-1 rounded-full" style={{ background: t.primary }} />
                  <span
                    className="absolute -left-0.5 size-2.5 rounded-full border-2 border-white shadow"
                    style={{ background: t.primary }}
                  />
                </div>
              )}

              {/* 自由布局吸附线 */}
              {guides.v.map((v, i) => (
                <div
                  key={`gv${i}`}
                  className="pointer-events-none absolute z-30 border-l border-dashed"
                  style={{ left: v, top: 0, height: Math.max(freeHeight, 700), borderColor: '#ec4899' }}
                />
              ))}
              {guides.h.map((v, i) => (
                <div
                  key={`gh${i}`}
                  className="pointer-events-none absolute z-30 border-t border-dashed"
                  style={{ top: v, left: 0, right: 0, borderColor: '#ec4899' }}
                />
              ))}

              {/* 自由布局：仓库拖入预览框 */}
              {freePreview && (
                <div
                  className="pointer-events-none absolute z-40 flex items-center justify-center rounded-xl border-2 border-dashed"
                  style={{
                    left: freePreview.x, top: freePreview.y, width: freePreview.w, height: 52,
                    borderColor: t.primary, background: `${t.primary}14`,
                  }}
                >
                  <span className="text-[10px] font-bold" style={{ color: t.primary }}>放置到这里</span>
                </div>
              )}

              {/* 空状态：小白 3 步引导 + 示例套装一键铺满 */}
              {page.components.length === 0 && !indicator && !freePreview && (
                <CanvasStarterGuide />
              )}

              {isFree ? (
                /* ---------- 自由布局：绝对定位 + 拖拽移动 + 8 向缩放 + 框选 ---------- */
                <div
                  ref={freeLayerRef}
                  className="relative w-full"
                  style={{ minHeight: freeHeight }}
                  onPointerDown={(e) => {
                    /* 空白处按下：启动框选（子组件均已 stopPropagation） */
                    if (e.button !== 0) return;
                    const local = toLocal(e.clientX, e.clientY);
                    marqueeStartRef.current = { x: local.x, y: local.y };
                    marqueeHitRef.current = [];
                    setMarquee({ x0: local.x, y0: local.y, x1: local.x, y1: local.y });
                    useDnd.getState().begin({ kind: 'marquee', px: e.clientX, py: e.clientY });
                  }}
                >
                  {/* 框选矩形 */}
                  {marquee && (
                    <div
                      className="pointer-events-none absolute z-40 rounded-md border-2"
                      style={{
                        left: Math.min(marquee.x0, marquee.x1),
                        top: Math.min(marquee.y0, marquee.y1),
                        width: Math.abs(marquee.x1 - marquee.x0),
                        height: Math.abs(marquee.y1 - marquee.y0),
                        borderColor: t.primary,
                        background: `${t.primary}12`,
                      }}
                    >
                      <span
                        className="absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
                        style={{ background: t.primary }}
                      >
                        框选 {marqueeCount}
                      </span>
                    </div>
                  )}
                  {/* 多选包围盒：虚线框 + 四角点 + 尺寸标签 */}
                  {bbox && (
                    <div
                      className="pointer-events-none absolute z-30 rounded-lg border-2 border-dashed"
                      style={{
                        left: bbox.x,
                        top: bbox.y,
                        width: bbox.w,
                        height: bbox.h,
                        borderColor: `${t.primary}b3`,
                        background: `${t.primary}0a`,
                      }}
                    >
                      <span
                        className="absolute -top-6 left-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white shadow"
                        style={{ background: t.primary }}
                      >
                        {Math.round(bbox.w)} × {Math.round(bbox.h)}
                      </span>
                      {[
                        '-left-1 -top-1', '-right-1 -top-1', '-left-1 -bottom-1', '-right-1 -bottom-1',
                      ].map((pos) => (
                        <span
                          key={pos}
                          className={`absolute z-10 size-2 rounded-full border-2 bg-white shadow ${pos}`}
                          style={{ borderColor: t.primary }}
                        />
                      ))}
                    </div>
                  )}
                  {page.components.filter((w: WidgetInstance) => !w.hidden).map((w: WidgetInstance) => {
                    const def = getWidget(w.type);
                    const selected = selectedWidgetId === w.id;
                    const resizing = sizeBadge !== null && selected;
                    const linkConn = connections.find((c) => c.fromPageId === page.id && c.fromWidgetId === w.id && !c.slot);
                    const slotLinkCount = connections.filter((c) => c.fromPageId === page.id && c.fromWidgetId === w.id && c.slot).length;
                    const linkName = linkConn ? pages.find((p) => p.id === linkConn.toPageId)?.name : null;
                    return (
                      <WidgetContextMenu key={w.id} widget={w} layout="free">
                      <div
                        data-wid={w.id}
                        ref={(el) => {
                          if (el) itemRefs.current.set(w.id, el);
                          else itemRefs.current.delete(w.id);
                        }}
                        onPointerDown={(e) => {
                          if (e.button !== 0) return;
                          e.stopPropagation();
                          e.preventDefault();
                          const b = useBuilder.getState();
                          /* Shift：加入/移出多选，不启动拖拽 */
                          if (e.shiftKey) {
                            select(w.id, true);
                            return;
                          }
                          /* 编组感知：点未选中的组成员 → 先整组选中再组拖 */
                          const members = b.groupMembersOf(w.id);
                          if (members && !(b.selectedIds.length > 1 && b.selectedIds.includes(w.id))) {
                            b.selectMany(members);
                          }
                          const st = useBuilder.getState();
                          const groupDrag = st.selectedIds.length > 1 && st.selectedIds.includes(w.id);
                          if (groupDrag) {
                            const pageNow = st.pages.find((p) => p.id === st.currentPageId);
                            const map: Record<string, { x: number; y: number }> = {};
                            pageNow?.components.forEach((c) => {
                              if (st.selectedIds.includes(c.id) && !c.locked) map[c.id] = { x: c.x ?? 0, y: c.y ?? 0 };
                            });
                            const local = toLocal(e.clientX, e.clientY);
                            groupStartRef.current = { map, ox: local.x, oy: local.y };
                          } else {
                            groupStartRef.current = null;
                          }
                          /* 点按未入选中集的非编组组件 → 重置为单选；
                             已在多选中（即将组拖）则保持多选不塌缩 */
                          if (!members && !groupDrag) select(w.id);
                          if (w.locked) return; /* 锁定：只选中，不启动拖拽 */
                          const local = toLocal(e.clientX, e.clientY);
                          dragMetaRef.current = {
                            offX: local.x - (w.x ?? 0),
                            offY: local.y - (w.y ?? 0),
                            batch: false,
                          };
                          useDnd.getState().begin({ kind: 'move', moveId: w.id, px: e.clientX, py: e.clientY });
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (suppressClickRef.current || useDnd.getState().suppressNextClick) return;
                          if (!e.shiftKey) selectGroupAware(w.id);
                        }}
                        className={`group absolute rounded-xl${
                          typeof w.h === 'number' ? ' flex flex-col' : ''
                        } ${
                          selected ? 'z-20 ring-2' : selectedIds.includes(w.id) ? 'z-20 ring-2 ring-dashed' : 'z-10 hover:ring-1'
                        }`}
                        style={{
                          left: w.x ?? 0,
                          top: w.y ?? 0,
                          width: w.w ?? 355,
                          height: w.h,
                          opacity: w.opacity ?? 1,
                          filter: w.shadow ? SHADOW_FILTER[w.shadow] : undefined,
                          cursor: 'grab',
                          touchAction: 'none',
                          '--tw-ring-color': selected
                            ? t.primary
                            : selectedIds.includes(w.id)
                              ? `${t.primary}88`
                              : 'rgba(0,0,0,0.12)',
                        } as React.CSSProperties}
                      >
                        <WidgetInner w={w} canvasLive />

                        {/* 坐标/尺寸徽标（拖动或缩放中） */}
                        {(resizing || posBadge !== null) && (
                          <span
                            className="pointer-events-none absolute -top-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
                            style={{ background: t.primary }}
                          >
                            {posBadge !== null ? `${posBadge}` : sizeBadge}
                          </span>
                        )}

                        {/* 多选中的非主选组件：序号徽标（主选显示类型名） */}
                        {selectedIds.includes(w.id) && !selected && (
                          <span
                            className="pointer-events-none absolute -left-1 -top-6 z-30 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow"
                            style={{ background: `${t.primary}b3` }}
                          >
                            多选 · {def?.name ?? w.type}
                          </span>
                        )}

                        {/* 类型徽标 */}
                        {selected && def && !resizing && (
                          <span
                            className="pointer-events-none absolute -left-1 -top-6 z-30 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow"
                            style={{ background: t.primary }}
                          >
                            {def.name}
                          </span>
                        )}

                        {/* 悬浮操作条（自由布局：复制/删除；锁定时不显示） */}
                        {!w.locked && (
                          <div
                            className={`absolute -top-2.5 right-2 z-30 flex items-center gap-0.5 rounded-lg bg-zinc-900/90 p-0.5 shadow-lg transition-opacity ${
                              selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <ItemBtn title="复制" onClick={() => duplicateWidget(w.id)}>
                              <Copy className="size-3.5" />
                            </ItemBtn>
                            <ItemBtn title="删除" danger onClick={() => removeWidget(w.id)}>
                              <Trash2 className="size-3.5" />
                            </ItemBtn>
                          </div>
                        )}

                        {/* 锁定徽标 */}
                        {w.locked && selected && (
                          <span className="pointer-events-none absolute -right-1 -top-6 z-30 flex items-center gap-1 rounded-md bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                            <Lock className="size-2.5" /> 已锁定
                          </span>
                        )}

                        {/* 8 向缩放手柄（锁定时不显示） */}
                        {selected && !w.locked && (
                          <>
                            {HANDLE_DIRS.map((dir) => (
                              <span
                                key={dir}
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const el = itemRefs.current.get(w.id);
                                  resizeRef.current = {
                                    id: w.id,
                                    dir,
                                    startX: e.clientX,
                                    startY: e.clientY,
                                    autoH: w.h == null,
                                    baselineClipped: measureClipped(w.id),
                                    rect: {
                                      x: w.x ?? 0,
                                      y: w.y ?? 0,
                                      w: w.w ?? 355,
                                      h: w.h ?? (el ? el.offsetHeight : 56),
                                    },
                                  };
                                  dragMetaRef.current.batch = false;
                                  useBuilder.getState().beginBatch();
                                  dragMetaRef.current.batch = true;
                                  useDnd.getState().begin({ kind: 'move', moveId: w.id, px: e.clientX, py: e.clientY });
                                  useDnd.getState().markStarted();
                                }}
                                className={`absolute z-30 size-3 rounded-full border-2 bg-white shadow ${HANDLE_CLASS[dir]}`}
                                style={{ borderColor: t.primary, touchAction: 'none' }}
                                title={`拖动调整大小（${dir}）`}
                              />
                            ))}
                          </>
                        )}

                        {/* 已绑定跳转徽标（右上角内嵌，避免被 overflow 裁剪） */}
                        {(linkConn || slotLinkCount > 0) && (
                          <span
                            className="pointer-events-none absolute right-1 top-1 z-30 flex max-w-[70%] items-center gap-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md"
                            title={linkConn ? `点击跳转到「${linkName}」` : `${slotLinkCount} 个标签已绑定页面跳转`}
                          >
                            <Link2 className="size-2.5 shrink-0" />
                            <span className="truncate">{linkConn ? `→ ${linkName}` : `${slotLinkCount} 标签已绑定`}</span>
                          </span>
                        )}

                        {/* 编组徽章（左上角，hover/选中时显示） */}
                        {w.group && (
                          <span
                            className={`pointer-events-none absolute left-1 top-1 z-30 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md transition-opacity ${
                              selected || selectedIds.includes(w.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            style={{ background: groupColor(w.group) }}
                            title="已编组：点击任一成员即可整组选中、整体拖动"
                          >
                            <Boxes className="size-2.5 shrink-0" /> 组
                          </span>
                        )}
                      </div>
                      </WidgetContextMenu>
                    );
                  })}
                </div>
              ) : (
                /* ---------- 流式布局：垂直排列 + 拖拽排序 ---------- */
                <>
                  {(() => {
                    const visibleList = page.components.filter((w: WidgetInstance) => !w.hidden);
                    const visibleCount = visibleList.length;
                    return visibleList.map((w: WidgetInstance, idx: number) => {
                    const def = getWidget(w.type);
                    const selected = selectedWidgetId === w.id;
                    const linkConn = connections.find((c) => c.fromPageId === page.id && c.fromWidgetId === w.id && !c.slot);
                    const slotLinkCount = connections.filter((c) => c.fromPageId === page.id && c.fromWidgetId === w.id && c.slot).length;
                    const linkName = linkConn ? pages.find((p) => p.id === linkConn.toPageId)?.name : null;
                    return (
                      <WidgetContextMenu key={w.id} widget={w} layout="flow">
                      <div
                        data-wid={w.id}
                        ref={(el) => {
                          if (el) itemRefs.current.set(w.id, el);
                          else itemRefs.current.delete(w.id);
                        }}
                        onPointerDown={(e) => {
                          if (e.button !== 0) return;
                          e.stopPropagation();
                          if (w.locked) { selectGroupAware(w.id); return; } /* 锁定：只选中，不启动排序拖拽 */
                          selectGroupAware(w.id);
                          dragMetaRef.current = { offX: 0, offY: 0, batch: false };
                          useDnd.getState().begin({ kind: 'move', moveId: w.id, px: e.clientX, py: e.clientY });
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (suppressClickRef.current || useDnd.getState().suppressNextClick) return;
                          selectGroupAware(w.id);
                        }}
                        className={`group relative cursor-grab touch-none rounded-xl active:cursor-grabbing ${
                          selected ? 'ring-2' : 'hover:ring-1'
                        }`}
                        style={{
                          opacity: w.opacity ?? 1,
                          filter: w.shadow ? SHADOW_FILTER[w.shadow] : undefined,
                          '--tw-ring-color': selected ? t.primary : 'rgba(0,0,0,0.12)',
                        } as React.CSSProperties}
                      >
                        <WidgetRenderer w={w} canvasLive />

                        {/* 悬浮操作条 */}
                        {!w.locked && (
                        <div
                          className={`absolute -top-2.5 right-2 z-30 flex items-center gap-0.5 rounded-lg bg-zinc-900/90 p-0.5 shadow-lg transition-opacity ${
                            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <ItemBtn
                            title="上移"
                            disabled={idx === 0}
                            onClick={() => useBuilder.getState().moveWidgetRelative(w.id, -1)}
                          >
                            <ChevronUp className="size-3.5" />
                          </ItemBtn>
                          <ItemBtn
                            title="下移"
                            disabled={idx === visibleCount - 1}
                            onClick={() => useBuilder.getState().moveWidgetRelative(w.id, 1)}
                          >
                            <ChevronDown className="size-3.5" />
                          </ItemBtn>
                          <ItemBtn title="复制" onClick={() => duplicateWidget(w.id)}>
                            <Copy className="size-3.5" />
                          </ItemBtn>
                          <ItemBtn title="删除" danger onClick={() => removeWidget(w.id)}>
                            <Trash2 className="size-3.5" />
                          </ItemBtn>
                        </div>
                        )}
                        {w.locked && selected && (
                          <span className="absolute -right-1 -top-6 z-30 flex items-center gap-1 rounded-md bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                            <Lock className="size-2.5" /> 已锁定
                          </span>
                        )}

                        {/* 类型徽标 */}
                        {selected && def && (
                          <span
                            className="pointer-events-none absolute -left-1 -top-6 z-30 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow"
                            style={{ background: t.primary }}
                          >
                            {def.name}
                          </span>
                        )}

                        {/* 已绑定跳转徽标 */}
                        {(linkConn || slotLinkCount > 0) && (
                          <span
                            className="pointer-events-none absolute -bottom-1.5 right-1 z-30 flex max-w-[70%] items-center gap-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md"
                            title={linkConn ? `点击跳转到「${linkName}」` : `${slotLinkCount} 个标签已绑定页面跳转`}
                          >
                            <Link2 className="size-2.5 shrink-0" />
                            <span className="truncate">{linkConn ? `→ ${linkName}` : `${slotLinkCount} 标签已绑定`}</span>
                          </span>
                        )}

                        {/* 编组徽章 */}
                        {w.group && (
                          <span
                            className={`pointer-events-none absolute -left-1 bottom-2 z-30 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md transition-opacity ${
                              selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            style={{ background: groupColor(w.group) }}
                            title="已编组：点击任一成员即可整组选中"
                          >
                            <Boxes className="size-2.5 shrink-0" /> 组
                          </span>
                        )}
                      </div>
                      </WidgetContextMenu>
                    );
                    });
                  })()}
                </>
              )}

              {/* 底部留白便于拖入 */}
              <div className="h-16" />
            </div>
            </BusScopeProvider>
          </PhoneFrame>
        </div>
      </div>
    </div>

      {/* 画布标尺：顶部 + 左侧刻度（showRuler 开关；刻度 = 组件内容坐标系，跟随缩放与滚动） */}
      {canvasCfg.showRuler && rulerPos && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-5 border-b border-zinc-300/60 bg-white/80 backdrop-blur-sm">
            <svg width={rulerPos.vw} height={20} className="block" aria-hidden>
              {Array.from({ length: SCREEN_W / 10 + 1 }, (_, i) => i * 10).map((c) => {
                const x = rulerPos.ox + c * zoom;
                if (x < -2 || x > rulerPos.vw + 2) return null;
                const major = c % 100 === 0;
                const mid = c % 50 === 0;
                return (
                  <g key={c}>
                    <line x1={x} y1={major ? 5 : mid ? 9 : 13} x2={x} y2={20} stroke={major ? '#a1a1aa' : '#d4d4d8'} strokeWidth={1} />
                    {major && c > 0 && (
                      <text x={x + 3} y={11} fontSize={8.5} fontWeight={600} fill="#a1a1aa">{c}</text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-40 w-5 border-r border-zinc-300/60 bg-white/80 backdrop-blur-sm">
            <svg width={20} height={rulerPos.vh} className="block" aria-hidden>
              {Array.from({ length: SCREEN_H / 10 + 1 }, (_, i) => i * 10).map((c) => {
                const y = rulerPos.oy + c * zoom;
                if (y < -2 || y > rulerPos.vh + 2) return null;
                const major = c % 100 === 0;
                const mid = c % 50 === 0;
                return (
                  <g key={c}>
                    <line x1={major ? 5 : mid ? 9 : 13} y1={y} x2={20} y2={y} stroke={major ? '#a1a1aa' : '#d4d4d8'} strokeWidth={1} />
                    {major && c > 0 && (
                      <text x={2.5} y={y - 2} fontSize={8.5} fontWeight={600} fill="#a1a1aa">{c}</text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="pointer-events-none absolute left-0 top-0 z-40 size-5 border-b border-r border-zinc-300/60 bg-white/90" />
        </>
      )}

      {/* 多选批量操作工具条（自由布局） */}
      {isFreeMode && selectedIds.length > 1 && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2">
          <div className="flex items-center gap-0.5 rounded-2xl border border-zinc-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-top-2 duration-200">
            <span
              className="mr-1 flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white"
              style={{ background: t.primary }}
            >
              <Scan className="size-3.5" />
              已选 {selectedIds.length}
            </span>
            {bbox && (
              <span className="mr-1 hidden items-center rounded-xl bg-zinc-100 px-2 py-1.5 text-[11px] font-bold tabular-nums text-zinc-500 sm:flex">
                包围盒 {Math.round(bbox.w)} × {Math.round(bbox.h)}
              </span>
            )}
            <ToolbarBtn title="左对齐" onClick={() => useBuilder.getState().alignWidgets('left')}>
              <AlignStartVertical className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn title="水平居中" onClick={() => useBuilder.getState().alignWidgets('hcenter')}>
              <AlignCenterVertical className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn title="右对齐" onClick={() => useBuilder.getState().alignWidgets('right')}>
              <AlignEndVertical className="size-4" />
            </ToolbarBtn>
            <span className="mx-0.5 h-5 w-px bg-zinc-200" />
            <ToolbarBtn title="顶对齐" onClick={() => useBuilder.getState().alignWidgets('top')}>
              <AlignStartHorizontal className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn title="垂直居中" onClick={() => useBuilder.getState().alignWidgets('vcenter')}>
              <AlignCenterHorizontal className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn title="底对齐" onClick={() => useBuilder.getState().alignWidgets('bottom')}>
              <AlignEndHorizontal className="size-4" />
            </ToolbarBtn>
            <span className="mx-0.5 h-5 w-px bg-zinc-200" />
            <ToolbarBtn
              title="横向等间距分布"
              disabled={selectedIds.length < 3}
              onClick={() => {
                const sizes: Record<string, { w?: number; h?: number }> = {};
                selectedIds.forEach((id) => {
                  const el = itemRefs.current.get(id);
                  if (el) sizes[id] = { w: el.offsetWidth, h: el.offsetHeight };
                });
                useBuilder.getState().distributeWidgets('h', sizes);
              }}
            >
              <AlignHorizontalSpaceAround className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn
              title="纵向等间距分布"
              disabled={selectedIds.length < 3}
              onClick={() => {
                const sizes: Record<string, { w?: number; h?: number }> = {};
                selectedIds.forEach((id) => {
                  const el = itemRefs.current.get(id);
                  if (el) sizes[id] = { w: el.offsetWidth, h: el.offsetHeight };
                });
                useBuilder.getState().distributeWidgets('v', sizes);
              }}
            >
              <AlignVerticalSpaceAround className="size-4" />
            </ToolbarBtn>
            <span className="mx-0.5 h-5 w-px bg-zinc-200" />
            <ToolbarBtn
              title="统一宽度：以主选中组件（属性面板当前显示）为基准"
              onClick={() => {
                const sizes: Record<string, { w?: number; h?: number }> = {};
                selectedIds.forEach((id) => {
                  const el = itemRefs.current.get(id);
                  if (el) sizes[id] = { w: el.offsetWidth, h: el.offsetHeight };
                });
                useBuilder.getState().unifyWidgetsSize('w', sizes);
              }}
            >
              <StretchHorizontal className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn
              title="统一高度：以主选中组件实测高度为基准"
              onClick={() => {
                const sizes: Record<string, { w?: number; h?: number }> = {};
                selectedIds.forEach((id) => {
                  const el = itemRefs.current.get(id);
                  if (el) sizes[id] = { w: el.offsetWidth, h: el.offsetHeight };
                });
                useBuilder.getState().unifyWidgetsSize('h', sizes);
              }}
            >
              <StretchVertical className="size-4" />
            </ToolbarBtn>
            <span className="mx-0.5 h-5 w-px bg-zinc-200" />
            {/* 批量统一透明度 */}
            <Popover open={opacityOpen} onOpenChange={(o) => {
              setOpacityOpen(o);
              if (o) {
                /* 打开时以主选中组件的透明度为初值 */
                const b = useBuilder.getState();
                const refId = b.selectedWidgetId && b.selectedIds.includes(b.selectedWidgetId) ? b.selectedWidgetId : b.selectedIds[0];
                const ref = b.pages.find((p) => p.id === b.currentPageId)?.components.find((c) => c.id === refId);
                setOpacityVal(Math.round((ref?.opacity ?? 1) * 100));
              }
            }}>
              <PopoverTrigger asChild>
                <button
                  title="统一透明度"
                  aria-label="统一透明度"
                  className="flex size-8 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Droplet className="size-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="center" className="w-64 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                    <Droplet className="size-3.5 text-pink-500" /> 统一透明度
                  </p>
                  <span className="text-xs font-bold tabular-nums text-zinc-500">{opacityVal}%</span>
                </div>
                <Slider
                  value={[opacityVal]}
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={([v]) => setOpacityVal(v)}
                />
                <div className="mt-1.5 flex justify-between text-[10px] text-zinc-400">
                  <span>半透明</span>
                  <span>完全不透明</span>
                </div>
                <button
                  className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-105"
                  style={{ background: t.primary }}
                  onClick={() => {
                    const op = opacityVal >= 100 ? undefined : opacityVal / 100;
                    const map: Record<string, Partial<WidgetInstance>> = {};
                    selectedIds.forEach((id) => { map[id] = { opacity: op }; });
                    useBuilder.getState().patchWidgets(map);
                    toast.success(`已统一 ${selectedIds.length} 个组件透明度为 ${opacityVal}%`, { description: 'Ctrl+Z 可撤销' });
                    setOpacityOpen(false);
                  }}
                >
                  <Check className="size-3.5" /> 应用到 {selectedIds.length} 个组件
                </button>
              </PopoverContent>
            </Popover>
            {/* 批量统一阴影 */}
            <Popover open={shadowOpen} onOpenChange={(o) => {
              setShadowOpen(o);
              if (o) {
                /* 打开时以主选中组件的阴影为初值 */
                const b = useBuilder.getState();
                const refId = b.selectedWidgetId && b.selectedIds.includes(b.selectedWidgetId) ? b.selectedWidgetId : b.selectedIds[0];
                const ref = b.pages.find((p) => p.id === b.currentPageId)?.components.find((c) => c.id === refId);
                setShadowRefVal(ref?.shadow ?? undefined);
              }
            }}>
              <PopoverTrigger asChild>
                <button
                  title="统一阴影"
                  aria-label="统一阴影"
                  className="flex size-8 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Moon className="size-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="center" className="w-64 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                  <Moon className="size-3.5 text-violet-500" /> 统一阴影
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {SHADOW_OPTS.map((o) => {
                    const activeNow = (o.v ?? undefined) === shadowRefVal;
                    return (
                      <button
                        key={o.label}
                        onClick={() => setShadowRefVal(o.v)}
                        title={o.v ? `阴影 ${o.v}` : '无阴影'}
                        aria-pressed={activeNow}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-0.5 py-1.5 transition-all ${
                          activeNow ? 'border-zinc-900 bg-zinc-50' : 'border-transparent hover:bg-zinc-50'
                        }`}
                      >
                        <span
                          className="flex h-5 w-full items-center justify-center rounded-md bg-white ring-1 ring-zinc-200"
                          style={{ filter: o.v ? SHADOW_FILTER[o.v] : undefined, ['--p' as string]: t.primary }}
                        >
                          <span className="block size-2 rounded-sm" style={{ background: activeNow ? t.primary : '#d4d4d8' }} />
                        </span>
                        <span className="text-[9px] font-semibold text-zinc-500">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-105"
                  style={{ background: t.primary }}
                  onClick={() => {
                    const map: Record<string, Partial<WidgetInstance>> = {};
                    selectedIds.forEach((id) => { map[id] = { shadow: shadowRefVal }; });
                    useBuilder.getState().patchWidgets(map);
                    toast.success(
                      shadowRefVal ? `已统一 ${selectedIds.length} 个组件阴影为「${SHADOW_OPTS.find((o) => o.v === shadowRefVal)?.label}」` : `已移除 ${selectedIds.length} 个组件的阴影`,
                      { description: 'Ctrl+Z 可撤销' }
                    );
                    setShadowOpen(false);
                  }}
                >
                  <Check className="size-3.5" /> 应用到 {selectedIds.length} 个组件
                </button>
              </PopoverContent>
            </Popover>
            {/* 样式刷：粘贴已复制的组件样式 */}
            <ToolbarBtn
              title={hasClip ? '应用样式刷：把复制的样式（透明度/阴影/边距/宽度）应用到选中组件' : '样式刷为空：先右键组件「复制样式」'}
              disabled={!hasClip}
              onClick={() => {
                const n = useBuilder.getState().pasteWidgetStyle(selectedIds);
                if (n > 0) toast.success(`样式已应用到 ${n} 个组件`, { description: 'Ctrl+Z 可撤销' });
                else toast('没有可应用的组件（可能已锁定）');
              }}
            >
              <Paintbrush className="size-4" />
            </ToolbarBtn>
            <span className="mx-0.5 h-5 w-px bg-zinc-200" />
            <ToolbarBtn
              title="编组（Ctrl+G）：整组选中/整体拖动"
              onClick={() => {
                const gid = useBuilder.getState().groupWidgets(selectedIds);
                if (gid) toast.success(`已编组 ${selectedIds.length} 个组件`, { description: '点击任一成员即可整组选中；Ctrl+Shift+G 解组' });
              }}
            >
              <Boxes className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn
              title="解组（Ctrl+Shift+G）"
              disabled={!selectedIds.some((id) => page.components.find((c) => c.id === id)?.group)}
              onClick={() => {
                useBuilder.getState().ungroupWidgets(selectedIds);
                toast('已解组');
              }}
            >
              <Ungroup className="size-4" />
            </ToolbarBtn>
            <span className="mx-0.5 h-5 w-px bg-zinc-200" />
            <ToolbarBtn
              title="存为组合：保存到组件市场，随时整组复用"
              onClick={() => setPresetOpen(true)}
            >
              <PackagePlus className="size-4" />
            </ToolbarBtn>
            <span className="mx-0.5 h-5 w-px bg-zinc-200" />
            <ToolbarBtn
              title="批量复制"
              onClick={() => {
                const n = useBuilder.getState().duplicateWidgets(selectedIds).length;
                if (n > 0) toast(`已复制 ${n} 个组件`);
              }}
            >
              <Copy className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn
              title="批量删除"
              danger
              onClick={() => {
                const n = selectedIds.length;
                useBuilder.getState().removeWidgets(selectedIds);
                toast(`已删除 ${n} 个组件`);
              }}
            >
              <Trash2 className="size-4" />
            </ToolbarBtn>
          </div>
        </div>
      )}

      {/* 缩放控制 */}
      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur">
        <button
          className="flex size-7 items-center justify-center rounded-full hover:bg-zinc-100 disabled:opacity-30"
          onClick={() => {
            setZoom((z) => Math.max(0.5, +(z - 0.05).toFixed(2)));
            requestAnimationFrame(() => recomputeBboxRef.current());
          }}
          disabled={zoom <= 0.5}
          aria-label="缩小"
        >
          <ZoomOut className="size-4" />
        </button>
        <span className="w-12 text-center text-xs font-semibold tabular-nums">{Math.round(zoom * 100)}%</span>
        <button
          className="flex size-7 items-center justify-center rounded-full hover:bg-zinc-100 disabled:opacity-30"
          onClick={() => {
            setZoom((z) => Math.min(1.2, +(z + 0.05).toFixed(2)));
            requestAnimationFrame(() => recomputeBboxRef.current());
          }}
          disabled={zoom >= 1.2}
          aria-label="放大"
        >
          <ZoomIn className="size-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-zinc-200" />
        <span className="flex h-7 items-center gap-1 px-2 text-xs text-zinc-500">
          <Scan className="size-3.5" /> {page.components.filter((c) => !c.hidden).length} 组件
        </span>
        <span className="mx-1 h-4 w-px bg-zinc-200" />
        {/* 一键整理（对标 m3e-canvas Tidy）：通栏贴边、其余按行归位，一条历史可撤销 */}
        {isFree && page.components.length > 0 && (
          <button
            className="flex h-7 items-center gap-1 rounded-full px-2 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-50"
            title="一键整理：通栏组件贴边，其余按行归位对齐"
            aria-label="一键整理"
            onClick={() => {
              const sizes: Record<string, { w?: number; h?: number }> = {};
              page.components.forEach((c) => {
                const el = itemRefs.current.get(c.id);
                if (el) sizes[c.id] = { w: el.offsetWidth, h: el.offsetHeight };
              });
              const n = page.components.filter((c) => !c.locked && !c.hidden).length;
              useBuilder.getState().tidyPage(sizes);
              useBuilder.getState().clearMulti();
              toast.success(`已整理 ${n} 个组件`, { description: '通栏贴边 · 按行归位 · Ctrl+Z 可撤销' });
            }}
          >
            <WandSparkles className="size-3.5" /> 整理
          </button>
        )}
        {isFree && page.components.length > 0 && <span className="mx-1 h-4 w-px bg-zinc-200" />}
        {/* 画布辅助设置：网格显示 / 对齐吸附线 / 网格吸附 */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex size-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              title="画布辅助设置"
              aria-label="画布辅助设置"
            >
              <Grid3x3 className="size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" className="w-64 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-700">
              <Magnet className="size-3.5 text-pink-500" /> 画布辅助
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between rounded-lg px-1 py-1.5">
                <div>
                  <p className="text-xs font-semibold">显示网格</p>
                  <p className="text-[10px] text-zinc-400">自由布局下的点阵背景</p>
                </div>
                <Switch
                  checked={canvasCfg.showGrid}
                  onCheckedChange={(v) => {
                    useCanvasSettings.getState().update({ showGrid: v });
                    requestAnimationFrame(() => recomputeBboxRef.current());
                  }}
                  aria-label="显示网格"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg px-1 py-1.5">
                <div>
                  <p className="text-xs font-semibold">智能对齐线</p>
                  <p className="text-[10px] text-zinc-400">拖动时吸附其它组件边缘/中心</p>
                </div>
                <Switch
                  checked={canvasCfg.snapGuides}
                  onCheckedChange={(v) => useCanvasSettings.getState().update({ snapGuides: v })}
                  aria-label="智能对齐线"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg px-1 py-1.5">
                <div>
                  <p className="text-xs font-semibold">网格吸附</p>
                  <p className="text-[10px] text-zinc-400">移动/缩放按 4px 取整</p>
                </div>
                <Switch
                  checked={canvasCfg.snapGrid}
                  onCheckedChange={(v) => useCanvasSettings.getState().update({ snapGrid: v })}
                  aria-label="网格吸附"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg px-1 py-1.5">
                <div>
                  <p className="text-xs font-semibold">显示标尺</p>
                  <p className="text-[10px] text-zinc-400">顶部与左侧刻度，跟随缩放滚动</p>
                </div>
                <Switch
                  checked={canvasCfg.showRuler}
                  onCheckedChange={(v) => {
                    useCanvasSettings.getState().update({ showRuler: v });
                    if (v) scheduleRuler();
                  }}
                  aria-label="显示标尺"
                />
              </div>
            </div>
            {!canvasCfg.snapGuides && !canvasCfg.snapGrid && (
              <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-[10px] leading-4 text-amber-700">
                吸附已全部关闭：组件将完全跟随指针自由摆放
              </p>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* 空白处右键菜单 */}
      <CanvasBlankMenu menu={blankMenu} onClose={() => setBlankMenu(null)} />

      {/* 存为组件组合对话框 */}
      <SavePresetDialog open={presetOpen} onOpenChange={setPresetOpen} ids={selectedIds} />
    </div>
  );
}

function dirClampWest(dir: string) {
  return dir.includes('w');
}
function dirClampNorth(dir: string) {
  return dir.includes('n');
}

/** 多选批量工具条按钮 */
function ToolbarBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className={`flex size-8 items-center justify-center rounded-xl text-zinc-600 transition-colors disabled:opacity-25 ${
        danger ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-zinc-100 hover:text-zinc-900'
      }`}
    >
      {children}
    </button>
  );
}

function ItemBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className={`flex size-6 items-center justify-center rounded-md text-white transition-colors disabled:opacity-30 ${
        danger ? 'hover:bg-rose-500' : 'hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  );
}
