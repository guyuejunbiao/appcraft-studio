'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, GitBranch, Home, Layers3, LayoutGrid, MousePointerClick, Pencil, Plus, Trash2,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Save, PanelBottom, Type,
  ArrowUpDown, Search, ChevronDown, ChevronUp, Loader2, X, ChevronRight,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { BusScopeProvider } from '@/lib/interaction-bus';
import { WidgetToast } from '@/lib/widget-toast';
import { allWidgets, categories, getWidget } from '@/components/widgets/registry';
import { PhoneFrame, PHONE_W, PHONE_H } from './PhoneFrame';
import { WidgetRenderer } from './WidgetRenderer';
import { AppTabBar } from './AppTabBar';
import { ConnectionDialog } from './FlowEditor';
import { PageManagerDialog } from './PageManager';
import { TabManagerDialog } from './TabManager';
import { ProductsEditor } from './ProductsEditor';
import { CellsEditor, cellsFieldValue, productsFieldValue } from './InspectorPanel';
import type { PropField } from '@/lib/widget-types';
import { normalizeProducts } from '@/components/widgets/grid-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { ConnectionData, PageData, WidgetInstance } from '@/lib/types';

/* ==================== 布局常量 ==================== */
/** 画板内手机缩放比例（PhoneFrame 原始 395×832） */
const AB_SCALE = 0.42;
const FRAME_W = PHONE_W + 20; /* 395 */
const FRAME_H = PHONE_H + 20; /* 832 */
/** 缩放后机身视觉尺寸 */
const AB_W = Math.round(FRAME_W * AB_SCALE); /* ≈166 */
const AB_H = Math.round(FRAME_H * AB_SCALE); /* ≈349 */
/** 画板顶部 chrome 条高度（不缩放） */
const CHROME_H = 40;
/** 画板视觉总高 */
const CARD_H = CHROME_H + AB_H;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 1.6;

/** 页面画板默认网格位置 */
const defaultPos = (i: number) => ({ x: 80 + (i % 4) * 260, y: 80 + Math.floor(i / 4) * 470 });

/* ==================== 组件选择器（画板「+」弹层） ==================== */
function WidgetPickerPopover({ pageId, children }: { pageId: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('all');
  const addWidgetToPage = useBuilder((s) => s.addWidgetToPage);

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return allWidgets.filter((w) => {
      if (cat !== 'all' && w.category !== cat) return false;
      if (!kw) return true;
      return w.name.toLowerCase().includes(kw) || w.desc.toLowerCase().includes(kw) || w.type.includes(kw);
    });
  }, [q, cat]);

  return (
    <Popover open={open} onOpenChange={(b) => { setOpen(b); if (!b) setQ(''); }}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80 p-2.5">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索组件…"
            className="h-8 pl-8 text-xs"
            autoFocus
          />
        </div>
        <div className="mb-2 flex gap-1 overflow-x-auto thin-scroll pb-1">
          <button
            onClick={() => setCat('all')}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              cat === 'all' ? 'bg-violet-500 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                cat === c.id ? 'bg-violet-500 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="grid max-h-64 grid-cols-3 gap-1 overflow-y-auto thin-scroll">
          {list.map((w) => (
            <button
              key={w.type}
              onClick={() => {
                addWidgetToPage(pageId, w.type);
                toast.success(`已添加「${w.name}」到「${useBuilder.getState().pages.find((p) => p.id === pageId)?.name ?? '页面'}」`);
              }}
              title={w.desc}
              className="flex flex-col items-center gap-1 rounded-lg border border-transparent p-2 text-center transition-all hover:border-violet-200 hover:bg-violet-50/50 active:scale-95"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-violet-50 text-violet-500">
                <w.icon className="size-4" />
              </span>
              <span className="w-full truncate text-[10px] font-semibold text-zinc-600">{w.name}</span>
            </button>
          ))}
          {list.length === 0 && (
            <p className="col-span-3 py-6 text-center text-xs text-zinc-400">没有匹配的组件</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ==================== 选中组件快捷编辑（文字就地 / 间距 / 布局） ==================== */
/** focusItem：画布上点击的具体条目索引（商品/格子）——点谁编谁，弹窗只呈现那一个个体 */
function QuickEditor({ widget, onDone, focusItem }: { widget: WidgetInstance; onDone: () => void; focusItem: number | null }) {
  const def = getWidget(widget.type);
  const updateWidgetProps = useBuilder((s) => s.updateWidgetProps);
  const updateWidget = useBuilder((s) => s.updateWidget);
  if (!def) return null;
  const merged = { ...def.defaultProps, ...widget.props };
  const textFields = def.fields.filter((f) => f.type === 'text' || f.type === 'textarea');
  const productFields = def.fields.filter((f) => f.type === 'products');
  const cellFields = def.fields.filter((f) => f.type === 'cells');
  /* 单件模式（点中具体条目）时隐藏普通文字区，只保留该条目——「单个」语义不掺其他内容 */
  const showText = textFields.length > 0 && (focusItem == null || (productFields.length === 0 && cellFields.length === 0));

  return (
    <div className="w-64 space-y-3 p-3">
      <div className="flex items-center gap-1.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-violet-50 text-violet-500">
          <def.icon className="size-3.5" />
        </span>
        <span className="text-xs font-bold">{def.name}</span>
        {focusItem != null ? (
          <span className="ml-auto rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">单件编辑 · 第 {focusItem + 1} 个</span>
        ) : (
          <span className="ml-auto rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold text-violet-500">就地编辑</span>
        )}
      </div>

      {/* 文字内容就地编辑（实时生效，无需跳回编辑器）；单件模式且有条目编辑时让位给条目 */}
      {showText && textFields.slice(0, 3).map((f) => (
        <div key={f.key}>
          <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
            <Type className="size-3" /> {f.label}
          </p>
          {f.type === 'textarea' ? (
            <Textarea
              value={String(merged[f.key] ?? '')}
              onChange={(e) => updateWidgetProps(widget.id, { [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="min-h-[52px] text-xs"
              rows={2}
              autoFocus={f === textFields[0]}
            />
          ) : (
            <Input
              value={String(merged[f.key] ?? '')}
              onChange={(e) => updateWidgetProps(widget.id, { [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="h-8 text-xs"
              autoFocus={f === textFields[0]}
            />
          )}
        </div>
      ))}
      {textFields.length === 0 && productFields.length === 0 && cellFields.length === 0 && (
        <p className="rounded-lg bg-zinc-50 px-2.5 py-2 text-[11px] text-zinc-400">
          该组件没有可编辑文字，可在编辑器属性面板配置
        </p>
      )}

      {/* 商品逐个就地编辑：点中具体商品 → 只编辑那一件（单件模式）；点组件整体 → 全列表管理。
          key 含 focusItem：点击另一个商品时组件重挂载，单件/全列表视图自动归位 */}
      {productFields.slice(0, 1).map((f) => (
        <ProductsEditor
          key={`${f.key}-${focusItem ?? 'all'}`}
          value={productsFieldValue(f as PropField, widget, def)}
          onChange={(v) => updateWidgetProps(widget.id, { [f.key]: v })}
          max={f.max ?? 6}
          focusIndex={focusItem}
        />
      ))}

      {/* 宫格逐格就地编辑：点中具体格子 → 只编辑那一格（金刚区/设置行/个人页宫格）。
          key 含 focusItem：点击另一个格子时组件重挂载，单格/全列表视图自动归位 */}
      {cellFields.slice(0, 1).map((f) => (
        <CellsEditor
          key={`${f.key}-${focusItem ?? 'all'}`}
          value={cellsFieldValue(f as PropField, widget, def)}
          onChange={(v) => updateWidgetProps(widget.id, { [f.key]: v })}
          max={f.max ?? 8}
          withBadge={f.withBadge}
          withOn={f.withOn}
          focusIndex={focusItem}
        />
      ))}

      {/* 间距（上/下边距）+ 宽度 + 对齐 */}
      <div className="space-y-2 rounded-lg border bg-zinc-50/70 p-2">
        <p className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
          <ArrowUpDown className="size-3" /> 间距与布局
        </p>
        {([
          ['mt', '上间距'],
          ['mb', '下间距'],
        ] as const).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-11 shrink-0 text-[11px] text-zinc-500">{label}</span>
            <input
              type="range"
              min={0}
              max={48}
              step={2}
              value={widget[key] ?? 0}
              onChange={(e) => updateWidget(widget.id, { [key]: Number(e.target.value) })}
              className="h-1 flex-1 accent-violet-500"
              aria-label={label}
            />
            <span className="w-6 text-right text-[10px] font-semibold tabular-nums text-zinc-500">
              {widget[key] ?? 0}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Select
            value={widget.width ?? 'full'}
            onValueChange={(v) => updateWidget(widget.id, { width: v as WidgetInstance['width'] })}
          >
            <SelectTrigger className="h-7 flex-1 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full">通栏</SelectItem>
              <SelectItem value="three-quarter">3/4 宽</SelectItem>
              <SelectItem value="half">半宽</SelectItem>
              <SelectItem value="third">1/3 宽</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={widget.align ?? 'left'}
            onValueChange={(v) => updateWidget(widget.id, { align: v as WidgetInstance['align'] })}
          >
            <SelectTrigger className="h-7 flex-1 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">靠左</SelectItem>
              <SelectItem value="center">居中</SelectItem>
              <SelectItem value="right">靠右</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button size="sm" variant="outline" className="w-full" onClick={onDone}>完成</Button>
    </div>
  );
}

/* ==================== 单个画板 ==================== */
function Artboard({
  page,
  index,
  zoom,
  theme,
  focused,
  selWidgetId,
  linkDragging,
  onWidgetPointerDown,
  onBodyPointerDown,
  onOpenEditor,
  onLinkStart,
}: {
  page: PageData;
  index: number;
  zoom: number;
  theme: { primary: string; radius: 'none' | 'sm' | 'md' | 'lg' | 'full'; dark: boolean; icon?: string; iconBG?: string };
  focused: boolean;
  selWidgetId: string | null;
  linkDragging: boolean;
  /** 点击组件：选中（pageId, widgetId）；widgetId 为空 = 清除选择 */
  onWidgetPointerDown: (pageId: string, widgetId: string, e?: React.PointerEvent) => void;
  onBodyPointerDown: (pageId: string) => void;
  onOpenEditor: (pageId: string) => void;
  onLinkStart: (pageId: string, e: React.PointerEvent) => void;
}) {
  const tabs = useBuilder((s) => s.tabs);
  const allPages = useBuilder((s) => s.pages);
  const allPageIds = useMemo(() => new Set(allPages.map((p) => p.id)), [allPages]);
  const setFlowPosLive = useBuilder((s) => s.setFlowPosLive);
  const updatePage = useBuilder((s) => s.updatePage);
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(page.name);

  const pos = {
    x: page.flowX ?? defaultPos(index).x,
    y: page.flowY ?? defaultPos(index).y,
  };
  const isFree = page.layout === 'free' && page.components.every((c) => typeof c.x === 'number');
  const visible = page.components.filter((w) => !w.hidden);

  /* 拖动画板位置（按住 chrome 条；delta 方案：起点快照 + 屏幕位移 / zoom，修复自反馈坐标错乱）。
     监听器在 pointerdown 内同步注册：快速拖动（首帧前）也不丢 move 事件 */
  const startDrag = (e: React.PointerEvent) => {
    if (linkDragging || renaming || e.button !== 0) return;
    const s = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, pushed: false };
    setDragging(true);
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - s.sx;
      const dy = ev.clientY - s.sy;
      if (!s.pushed) {
        /* 位移超阈值才算真正拖动：此刻压一次历史（整段拖动 = 一条可撤销记录） */
        if (Math.abs(dx) + Math.abs(dy) < 3) return;
        s.pushed = true;
        useBuilder.getState().pushHistory();
      }
      setFlowPosLive(page.id, s.ox + dx / zoom, s.oy + dy / zoom);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <div
      ref={boardRef}
      className={`absolute select-none ${dragging ? 'z-30' : 'z-10'}`}
      style={{ left: pos.x, top: pos.y, width: AB_W }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 连线起点（右侧圆点，拖到目标画板建立连接） */}
      <button
        aria-label={`从「${page.name}」拖出连线`}
        title="按住拖到目标画板建立跳转连接"
        className="absolute -right-3 top-[52%] z-40 flex size-6 -translate-y-1/2 cursor-crosshair items-center justify-center rounded-full border-2 border-white bg-violet-500 text-white shadow-md transition-all hover:scale-125 hover:bg-violet-600"
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
          onLinkStart(page.id, e);
        }}
      >
        <Plus className="size-3.5" />
      </button>

      {/* chrome 标题条 */}
      <div
        className={`flex items-center gap-1 rounded-t-xl border border-b-0 bg-white px-2 ${dragging ? 'cursor-grabbing shadow-lg' : 'cursor-grab hover:bg-zinc-50'}`}
        style={{ height: CHROME_H }}
        onPointerDown={startDrag}
        onDoubleClick={() => { setRenaming(true); setNameDraft(page.name); }}
        title="拖动移动画板位置 · 双击重命名"
      >
        {page.isHome && <Home className="size-3 shrink-0 text-amber-500" />}
        {renaming ? (
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => { setRenaming(false); if (nameDraft.trim() && nameDraft !== page.name) updatePage(page.id, { name: nameDraft.trim() }); }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenaming(false); }}
            className="min-w-0 flex-1 rounded border border-violet-300 px-1 text-[11px] font-bold outline-none"
            autoFocus
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-[11px] font-bold">{page.name}</span>
        )}
        <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 text-[9px] font-semibold text-zinc-400">
          {page.components.length}
        </span>
        <WidgetPickerPopover pageId={page.id}>
          <button
            className="flex size-5 shrink-0 items-center justify-center rounded bg-violet-500 text-white transition-transform hover:scale-110"
            title="添加组件到该页"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Plus className="size-3" />
          </button>
        </WidgetPickerPopover>
        <button
          className="flex size-5 shrink-0 items-center justify-center rounded border text-zinc-500 hover:bg-zinc-900 hover:text-white"
          title="在编辑器中打开此页"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onOpenEditor(page.id)}
        >
          <Pencil className="size-2.5" />
        </button>
      </div>

      {/* 机身（缩放渲染，内容可点击选中组件） */}
      <div
        className={`relative overflow-hidden rounded-b-xl border border-t-0 bg-white shadow-md transition-shadow ${
          focused ? 'ring-[3px] ring-amber-400' : selWidgetId ? 'ring-2 ring-violet-300' : 'hover:shadow-lg'
        }`}
        style={{ width: AB_W, height: AB_H }}
        onPointerDown={(e) => {
          e.stopPropagation();
          /* 命中机身空白（未被组件拦截）= 清除选择 */
          if (e.target === e.currentTarget) onWidgetPointerDown(page.id, '', e);
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: `scale(${AB_SCALE})`, width: FRAME_W, height: FRAME_H }}
        >
          <PhoneFrame theme={theme} pageBg={page.background} liveTheme>
            {/* 总线按页面作用域隔离：多画板同屏互不串扰；画板内联动源头可点击切换 */}
            <BusScopeProvider value={page.id}>
            <div className="flex h-full flex-col">
              <div
                className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${tabs.length > 0 ? '' : 'pb-2'}`}
                onPointerDown={(e) => {
                  /* 内容空白点击 = 清除选择（组件内部会 stopPropagation） */
                  if (e.target === e.currentTarget || (e.target as HTMLElement).dataset?.canvasBlank) {
                    onWidgetPointerDown(page.id, '', e);
                  }
                }}
                data-canvas-blank="true"
              >
                <WidgetToast />
                {isFree ? (
                  <div className="relative w-full" style={{ minHeight: 700 }}>
                    {visible.map((w) => (
                      <div
                        key={w.id}
                        data-widget-host={w.id}
                        className="absolute"
                        style={{ left: w.x ?? 0, top: w.y ?? 0, width: w.w ?? 355 }}
                        onPointerDown={(e) => { e.stopPropagation(); onWidgetPointerDown(page.id, w.id, e); }}
                      >
                        <div className={selWidgetId === w.id ? 'rounded outline outline-2 outline-offset-1 outline-violet-500' : 'rounded hover:outline hover:outline-1 hover:outline-violet-300'}>
                          <WidgetRenderer w={w} canvasLive />
                        </div>
                      </div>
                    ))}
                    {visible.length === 0 && (
                      <div className="m-3 flex h-32 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-zinc-300 text-zinc-400">
                        <p className="text-xs font-semibold">「{page.name}」还是空的</p>
                        <p className="text-[10px]">点画板上方 + 添加组件</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative pb-6">
                    {visible.map((w) => (
                      <div
                        key={w.id}
                        data-widget-host={w.id}
                        onPointerDown={(e) => { e.stopPropagation(); onWidgetPointerDown(page.id, w.id, e); }}
                      >
                        <div className={selWidgetId === w.id ? 'rounded outline outline-2 outline-offset-[-1px] outline-violet-500' : ''}>
                          <WidgetRenderer w={w} canvasLive />
                        </div>
                      </div>
                    ))}
                    {visible.length === 0 && (
                      <div className="m-3 flex h-32 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-zinc-300 text-zinc-400">
                        <p className="text-xs font-semibold">「{page.name}」还是空的</p>
                        <p className="text-[10px]">点画板上方 + 添加组件</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* App 级底部导航：点击 = 聚焦目标画板（悬空 tab 过滤：页面删除后不再显示死标签） */}
              {tabs.some((t) => allPageIds.has(t.pageId)) && (
                <AppTabBar
                  tabs={tabs.filter((t) => allPageIds.has(t.pageId))}
                  activePageId={page.id}
                  onSelect={(tab) => onBodyPointerDown(tab.pageId)}
                />
              )}
            </div>
            </BusScopeProvider>
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}

/* ==================== 无限画布主组件 ==================== */
export function InfiniteCanvas() {
  /* 调试便捷入口（只读检查用） */
  useEffect(() => {
    (window as unknown as { __acStore: typeof useBuilder }).__acStore = useBuilder;
  }, []);
  const pages = useBuilder((s) => s.pages);
  const connections = useBuilder((s) => s.connections);

  /* 同一对页面的多条连接扇出参数（多个入口 → 同一页）：n = 组内序号，k = 组内总数 */
  const fanConns = useMemo(() => {
    const counts = new Map<string, number>();
    connections.forEach((c) => {
      const key = `${c.fromPageId}->${c.toPageId}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const seen = new Map<string, number>();
    return connections.map((c) => {
      const key = `${c.fromPageId}->${c.toPageId}`;
      const n = seen.get(key) ?? 0;
      seen.set(key, n + 1);
      return { c, n, k: counts.get(key) ?? 1 };
    });
  }, [connections]);
  const tabs = useBuilder((s) => s.tabs);
  const project = useBuilder((s) => s.project);
  const theme = project?.theme ?? { primary: '#f97316', radius: 'md' as const, dark: false };
  const setView = useBuilder((s) => s.setView);
  const setCurrentPage = useBuilder((s) => s.setCurrentPage);
  const addPage = useBuilder((s) => s.addPage);
  const removeWidget = useBuilder((s) => s.removeWidget);
  const reorderWidget = useBuilder((s) => s.reorderWidget);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const pastLen = useBuilder((s) => s.past.length);
  const futureLen = useBuilder((s) => s.future.length);
  const dirty = useBuilder((s) => s.dirty);
  const saving = useBuilder((s) => s.saving);
  const save = useBuilder((s) => s.save);

  const boardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* 视口状态 */
  const [zoom, setZoom] = useState(0.7);
  const [offset, setOffset] = useState({ x: 40, y: 20 });
  const [panning, setPanning] = useState<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  /* 选中组件（画板内就地编辑）；focusItem = 点击命中的具体条目（商品/格子）索引：点谁编谁 */
  const [sel, setSel] = useState<{ pageId: string; widgetId: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [focusItem, setFocusItem] = useState<number | null>(null);
  const focusItemRef = useRef<number | null>(null);

  /* 连线 */
  const [linkDrag, setLinkDrag] = useState<{ fromPageId: string; x: number; y: number } | null>(null);
  const [dialog, setDialog] = useState<{ prefill?: { fromPageId: string; toPageId?: string }; edit?: ConnectionData } | null>(null);

  /* TabBar 点击聚焦的画板（临时高亮 + 平移可见） */
  const [focusPageId, setFocusPageId] = useState<string | null>(null);

  const [managerOpen, setManagerOpen] = useState(false);
  const [tabOpen, setTabOpen] = useState(false);

  /* 画板位置表 */
  const positions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    pages.forEach((p, i) => {
      map[p.id] = { x: p.flowX ?? defaultPos(i).x, y: p.flowY ?? defaultPos(i).y };
    });
    return map;
  }, [pages]);

  /* 内容尺寸（随画板动态扩展） */
  const contentSize = useMemo(() => {
    let w = 1600;
    let h = 1000;
    pages.forEach((p) => {
      const pos = positions[p.id];
      w = Math.max(w, pos.x + AB_W + 300);
      h = Math.max(h, pos.y + CARD_H + 300);
    });
    return { w, h };
  }, [pages, positions]);

  /* ======= 选中组件 => 复用 store 的当前页 API ======= */
  const selWidget = useMemo(() => {
    if (!sel) return null;
    const page = pages.find((p) => p.id === sel.pageId);
    const w = page?.components.find((c) => c.id === sel.widgetId);
    return w ? { page, widget: w } : null;
  }, [sel, pages]);

  const selRef = useRef<{ pageId: string; widgetId: string } | null>(null);
  /** 从 pointerdown 目标向上找条目标记（data-item-index / data-cell-index），提取单件索引 */
  const hitItemIndex = (e?: React.PointerEvent): number | null => {
    const el = e?.target as HTMLElement | null | undefined;
    const marker = el?.closest?.('[data-item-index],[data-cell-index]');
    if (!marker) return null;
    const v = marker.getAttribute('data-item-index') ?? marker.getAttribute('data-cell-index');
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const setFocus = (i: number | null) => {
    focusItemRef.current = i;
    setFocusItem(i);
  };
  const handleWidgetPointerDown = useCallback((pageId: string, widgetId: string, e?: React.PointerEvent) => {
    if (!widgetId) {
      selRef.current = null;
      setSel(null);
      setEditing(false);
      setFocus(null);
      return;
    }
    setCurrentPage(pageId); /* store 的 update/remove API 作用于 currentPage */
    useBuilder.setState({ selectedWidgetId: widgetId, selectedIds: [widgetId] });
    const itemIdx = hitItemIndex(e);
    if (selRef.current?.pageId === pageId && selRef.current.widgetId === widgetId) {
      /* 再点已选中的组件 = 打开就地编辑；命中具体条目则弹窗内直接切到那一个个体（点谁编谁）。
         preventDefault 阻止浏览器把焦点抢给画布内按钮（focusin 落在弹层外会触发
         Radix DismissableLayer 的 onFocusOutside 自动关闭弹层 → 弹窗一闪而过） */
      e?.preventDefault();
      setFocus(itemIdx);
      setEditing(true);
      return;
    }
    selRef.current = { pageId, widgetId };
    setFocus(itemIdx); /* 首次选中也记录命中的条目，下一次点击打开时即单件模式 */
    setEditing(false);
    setSel({ pageId, widgetId });
  }, [setCurrentPage]);

  /* 关闭编辑弹层时同步清除 store 选中 */
  const clearSel = useCallback(() => {
    selRef.current = null;
    setSel(null);
    setEditing(false);
    setFocus(null);
    useBuilder.setState({ selectedWidgetId: null, selectedIds: [] });
  }, []);

  /* ======= 平移 / 缩放 ======= */
  const onBoardPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    clearSel();
    setPanning({ sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y });
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
  };
  useEffect(() => {
    if (!panning) return;
    const onMove = (e: PointerEvent) => {
      setOffset({ x: panning.ox + (e.clientX - panning.sx), y: panning.oy + (e.clientY - panning.sy) });
    };
    const onUp = () => setPanning(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [panning]);

  /* wheel：滚轮平移 / Ctrl+滚轮缩放 */
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z - e.deltaY * 0.0022)));
      } else {
        setOffset((o) => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }));
      }
    };
    board.addEventListener('wheel', onWheel, { passive: false });
    return () => board.removeEventListener('wheel', onWheel);
  }, []);

  /* 缩放到适合全部画板 */
  const fitView = useCallback(() => {
    const board = boardRef.current;
    if (!board || pages.length === 0) return;
    const minX = Math.min(...pages.map((p) => positions[p.id].x));
    const minY = Math.min(...pages.map((p) => positions[p.id].y));
    const maxX = Math.max(...pages.map((p) => positions[p.id].x + AB_W));
    const maxY = Math.max(...pages.map((p) => positions[p.id].y + CARD_H));
    const bw = board.clientWidth;
    const bh = board.clientHeight;
    const z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.min((bw - 80) / (maxX - minX), (bh - 80) / (maxY - minY), 1)));
    setZoom(z);
    setOffset({ x: (bw - (maxX - minX) * z) / 2 - minX * z, y: (bh - (maxY - minY) * z) / 2 - minY * z });
  }, [pages, positions]);

  /* 首次进入自动 fit（等一轮布局） */
  const fittedRef = useRef(false);
  useEffect(() => {
    if (fittedRef.current || pages.length === 0) return;
    fittedRef.current = true;
    const t = setTimeout(fitView, 60);
    return () => clearTimeout(t);
  }, [pages.length, fitView]);

  /* TabBar 点击：聚焦目标画板（高亮 + 平移到中心） */
  const focusPage = useCallback((pageId: string) => {
    const board = boardRef.current;
    const pos = positions[pageId];
    if (!board || !pos) return;
    setFocusPageId(pageId);
    setOffset({
      x: board.clientWidth / 2 - (pos.x + AB_W / 2) * zoom,
      y: board.clientHeight / 2 - (pos.y + CARD_H / 2) * zoom,
    });
    window.setTimeout(() => setFocusPageId((cur) => (cur === pageId ? null : cur)), 2400);
  }, [positions, zoom]);

  /* ======= 连线拖拽创建 ======= */
  const onLinkStart = useCallback((pageId: string, e: React.PointerEvent) => {
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / zoom;
    const py = (e.clientY - rect.top) / zoom;
    setLinkDrag({ fromPageId: pageId, x: px, y: py });
  }, [zoom]);

  useEffect(() => {
    if (!linkDrag) return;
    const onMove = (e: PointerEvent) => {
      const rect = contentRef.current?.getBoundingClientRect();
      if (!rect) return;
      setLinkDrag((d) => (d ? { ...d, x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom } : d));
    };
    const onUp = (e: PointerEvent) => {
      const rect = contentRef.current?.getBoundingClientRect();
      const x = (e.clientX - (rect?.left ?? 0)) / zoom;
      const y = (e.clientY - (rect?.top ?? 0)) / zoom;
      const from = linkDrag.fromPageId;
      setLinkDrag(null);
      const hit = pages.find((p) => {
        if (p.id === from) return false;
        const pos = positions[p.id];
        return x >= pos.x - 6 && x <= pos.x + AB_W + 6 && y >= pos.y - 6 && y <= pos.y + CARD_H + 6;
      });
      if (hit) setDialog({ prefill: { fromPageId: from, toPageId: hit.id } });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [linkDrag, pages, positions, zoom]);

  /* 悬停命中的连线目标（高亮） */
  const linkHover = useMemo(() => {
    if (!linkDrag) return null;
    return pages.find((p) => {
      if (p.id === linkDrag.fromPageId) return false;
      const pos = positions[p.id];
      return linkDrag.x >= pos.x - 6 && linkDrag.x <= pos.x + AB_W + 6 && linkDrag.y >= pos.y - 6 && linkDrag.y <= pos.y + CARD_H + 6;
    })?.id ?? null;
  }, [linkDrag, pages, positions]);

  const openEditor = (pageId: string) => {
    setCurrentPage(pageId);
    setView('editor');
  };

  /* 一键整理：画板按网格重排（旧版拖拽 bug 弄乱布局后可一键恢复） */
  const tidyCanvas = () => {
    if (pages.length === 0) return;
    useBuilder.getState().pushHistory();
    useBuilder.setState({
      pages: pages.map((p, i) => ({ ...p, flowX: defaultPos(i).x, flowY: defaultPos(i).y })),
      dirty: true,
    });
    toast.success('画板已按网格整理');
  };

  /* 选中组件快捷操作 */
  const selPage = selWidget?.page;
  const selDef = selWidget ? getWidget(selWidget.widget.type) : null;
  const selIndex = selPage && selWidget ? selPage.components.findIndex((c) => c.id === selWidget.widget.id) : -1;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef0f4]">
      {/* ===== 顶栏 ===== */}
      <header className="z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-white px-3 shadow-sm">
        <Button variant="ghost" size="icon" className="size-8" title="返回编辑器" onClick={() => setView('editor')}>
          <ArrowLeft className="size-4" />
        </Button>
        <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500 text-white">
          <GitBranch className="size-4" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold leading-4">无限画布</h1>
          <p className="truncate text-[10px] text-zinc-400">
            画板内点击组件就地编辑 · 点 + 添加组件 · 右侧圆点拖拽连线 · 空白处拖动平移 · Ctrl+滚轮缩放
          </p>
        </div>

        <span className="ml-2 hidden items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-500 md:flex">
          <Layers3 className="size-3.5" /> {pages.length} 页面
        </span>
        <span className="hidden items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-500 md:flex">
          <MousePointerClick className="size-3.5" /> {connections.length} 连接
        </span>

        <div className="ml-auto flex items-center gap-1">
          {/* 缩放控件 */}
          <div className="mr-1 hidden items-center rounded-lg border bg-zinc-50 sm:flex">
            <button className="flex size-7 items-center justify-center text-zinc-500 hover:text-zinc-900 disabled:opacity-30" disabled={zoom <= ZOOM_MIN} onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - 0.1))} title="缩小"><ZoomOut className="size-3.5" /></button>
            <button className="w-10 text-center text-[11px] font-bold tabular-nums text-zinc-600" onClick={fitView} title="适应全部画板">{Math.round(zoom * 100)}%</button>
            <button className="flex size-7 items-center justify-center text-zinc-500 hover:text-zinc-900 disabled:opacity-30" disabled={zoom >= ZOOM_MAX} onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + 0.1))} title="放大"><ZoomIn className="size-3.5" /></button>
            <button className="flex size-7 items-center justify-center border-l text-zinc-500 hover:text-zinc-900" onClick={fitView} title="适应视图"><Maximize2 className="size-3.5" /></button>
          </div>

          <Button variant="ghost" size="icon" className="size-8" disabled={pastLen === 0} onClick={() => undo()} title="撤销">
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" disabled={futureLen === 0} onClick={() => redo()} title="重做">
            <Redo2 className="size-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={() => setTabOpen(true)} title="App 级底部导航：每个图标绑定一整页">
            <PanelBottom className="size-4" /> <span className="hidden lg:inline">底部导航</span>
            {tabs.length > 0 && (
              <span className="ml-1 rounded-full bg-violet-100 px-1.5 text-[10px] font-bold text-violet-600">{tabs.length}</span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={tidyCanvas} title="把所有画板按网格重新排列（拖乱后一键恢复）">
            <LayoutGrid className="size-4" /> <span className="hidden lg:inline">整理</span>
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => setManagerOpen(true)}>
            页面管理
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => addPage()} title="新增页面（画布自动落位）">
            <Plus className="size-4" /> 页面
          </Button>

          <button
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold"
            onClick={() => save().then((ok) => ok && toast.success('已保存'))}
            title="保存项目"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin text-zinc-400" /> : dirty ? <Save className="size-3.5 text-amber-500" /> : <Save className="size-3.5 text-emerald-500" />}
            <span className={dirty ? 'text-amber-600' : 'text-zinc-400'}>{dirty ? '未保存' : '已保存'}</span>
          </button>
        </div>
      </header>

      {/* ===== 画板区 ===== */}
      <div
        ref={boardRef}
        className={`relative min-h-0 flex-1 overflow-hidden bg-dot ${panning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={onBoardPointerDown}
        role="application"
        aria-label="无限画布"
      >
        <div
          ref={contentRef}
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: contentSize.w,
            height: contentSize.h,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          }}
        >
          {/* 连线 SVG 层 */}
          <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
            <defs>
              <marker id="cv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
              </marker>
              <marker id="cv-arrow-orange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
              </marker>
            </defs>
            {fanConns.map(({ c, n }) => {
              const from = positions[c.fromPageId];
              const to = positions[c.toPageId];
              if (!from || !to) return null;
              const sx = from.x + AB_W;
              const sy = from.y + CHROME_H + AB_H / 2;
              const tx = to.x;
              const ty = to.y + CHROME_H + AB_H / 2;
              /* 同一对页面多条连接：曲率逐条增大，扇形展开不重叠 */
              const dx = Math.max(40, Math.abs(tx - sx) * 0.45) + n * 24;
              return (
                <path
                  key={c.id}
                  d={`M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx - 8} ${ty}`}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  markerEnd="url(#cv-arrow)"
                  strokeDasharray={c.animation === 'none' ? '6 4' : undefined}
                />
              );
            })}
            {linkDrag && (
              <path
                d={`M ${positions[linkDrag.fromPageId].x + AB_W} ${positions[linkDrag.fromPageId].y + CHROME_H + AB_H / 2} C ${positions[linkDrag.fromPageId].x + AB_W + 60} ${linkDrag.y}, ${Math.max(positions[linkDrag.fromPageId].x + AB_W + 20, linkDrag.x - 60)} ${linkDrag.y}, ${linkDrag.x} ${linkDrag.y}`}
                fill="none"
                stroke="#f97316"
                strokeWidth={2.5}
                strokeDasharray="7 5"
                markerEnd="url(#cv-arrow-orange)"
              />
            )}
          </svg>

          {/* 连线标签：槽位级连接附槽位名；同对页面多条连接纵向错开 */}
          {fanConns.map(({ c, n, k }) => {
            const from = positions[c.fromPageId];
            const to = positions[c.toPageId];
            if (!from || !to) return null;
            const widget = pages.find((p) => p.id === c.fromPageId)?.components.find((w) => w.id === c.fromWidgetId);
            const widgetDef = widget ? getWidget(widget.type) : null;
            const widgetName = widget ? widgetDef?.name ?? widget.type : '未知组件';
            const slotLabel =
              c.slot && widget && widgetDef
                ? widgetDef.slots?.({ ...widgetDef.defaultProps, ...widget.props })?.find((s) => s.key === c.slot)?.label ?? `槽位 ${c.slot}`
                : null;
            const targetName = pages.find((p) => p.id === c.toPageId)?.name ?? '';
            return (
              <div
                key={`lb-${c.id}`}
                className="group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-[10px] font-semibold shadow-sm transition-shadow hover:shadow-md hover:ring-2 hover:ring-violet-200"
                style={{ left: (from.x + AB_W + to.x) / 2, top: (from.y + to.y) / 2 + CHROME_H + AB_H / 2 + (n - (k - 1) / 2) * 24 }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setDialog({ edit: c })}
                role="button"
                title="点击编辑这条连接"
              >
                <span className="max-w-20 truncate text-violet-500">{widgetName}</span>
                {slotLabel && (
                  <span className="max-w-16 truncate rounded bg-emerald-100 px-1 text-[9px] font-semibold text-emerald-600">{slotLabel}</span>
                )}
                <ChevronRight className="size-3 text-zinc-300" />
                <span className="max-w-20 truncate">{targetName}</span>
                <button
                  className="text-zinc-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    useBuilder.getState().removeConnection(c.id);
                    toast('连接已删除');
                  }}
                  title="删除连接"
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}

          {/* 页面画板 */}
          {pages.map((p, i) => (
            <Artboard
              key={p.id}
              page={p}
              index={i}
              zoom={zoom}
              theme={theme}
              focused={focusPageId === p.id || linkHover === p.id}
              selWidgetId={sel?.pageId === p.id ? sel.widgetId : null}
              linkDragging={!!linkDrag}
              onWidgetPointerDown={handleWidgetPointerDown}
              onBodyPointerDown={focusPage}
              onOpenEditor={openEditor}
              onLinkStart={onLinkStart}
            />
          ))}

          {pages.length === 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-zinc-400">
              <GitBranch className="mx-auto mb-2 size-10" />
              <p className="text-sm">还没有页面，点右上角「页面」新增</p>
            </div>
          )}
        </div>

        {/* 选中组件浮动工具条（不缩放，固定在画布左下） */}
        {selWidget && selDef && (
          <div
            className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border bg-white/95 p-1.5 shadow-xl backdrop-blur"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="flex items-center gap-1.5 pl-1.5 pr-1">
              <selDef.icon className="size-3.5 text-violet-500" />
              <span className="max-w-24 truncate text-[11px] font-bold">{selDef.name}</span>
            </span>
            <span className="h-5 w-px bg-zinc-200" />
            {/* 就地编辑（文字/内容） */}
            <Popover open={editing} onOpenChange={setEditing}>
              <PopoverTrigger asChild>
                <button
                  className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-violet-600 hover:bg-violet-50 disabled:opacity-30"
                  disabled={selDef.fields.every((f) => f.type !== 'text' && f.type !== 'textarea' && f.type !== 'cells' && f.type !== 'products')}
                  title="点击编辑内容（商品/格子可逐个编辑）"
                >
                  <Type className="size-3.5" /> 编辑内容
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="center"
                className="w-auto p-0"
                /* 焦点移出弹层不关闭：画布内点按钮/弹层内下拉展开都会把焦点带出弹层，
                   若不阻止会误触发「焦点在外面 → 自动关闭」，弹窗一闪而过。
                   点击落在当前选中组件内部（如同一网格的另一商品/另一格）也不关闭——
                   由 handleWidgetPointerDown 切换单件编辑目标（Radix 的 dismiss 是
                   flushSync 同步执行，pointerdown 上的 preventDefault 拦不住它，
                   必须在 onPointerDownOutside 的自定义事件上阻止） */
                onFocusOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => {
                  const wid = selWidget?.widget.id;
                  const t = e.target as HTMLElement | null;
                  if (wid && t?.closest?.(`[data-widget-host="${wid}"]`)) e.preventDefault();
                }}
              >
                <QuickEditor widget={selWidget.widget} onDone={() => setEditing(false)} focusItem={focusItem} />
              </PopoverContent>
            </Popover>
            {/* 上移 / 下移 */}
            <button
              className="flex size-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
              disabled={selIndex <= 0}
              title="上移一层"
              onClick={() => reorderWidget(selWidget.widget.id, 'up')}
            >
              <ChevronUp className="size-3.5" />
            </button>
            <button
              className="flex size-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
              disabled={selIndex < 0 || selIndex >= (selPage?.components.length ?? 0) - 1}
              title="下移一层"
              onClick={() => reorderWidget(selWidget.widget.id, 'down')}
            >
              <ChevronDown className="size-3.5" />
            </button>
            <span className="h-5 w-px bg-zinc-200" />
            <button
              className="flex size-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
              title="删除组件"
              onClick={() => {
                const name = selDef.name;
                removeWidget(selWidget.widget.id);
                clearSel();
                toast.success(`已删除「${name}」`);
              }}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}

        {/* TabBar 空提示（右下） */}
        {tabs.length === 0 && pages.length > 0 && (
          <button
            className="absolute bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-violet-600 shadow-md backdrop-blur transition-colors hover:bg-violet-50"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setTabOpen(true)}
          >
            <PanelBottom className="size-3.5" /> 添加底部导航（TabBar）
          </button>
        )}
      </div>

      {/* 连接对话框（新建预填 / 编辑） */}
      {(dialog?.prefill || dialog?.edit) && (
        <ConnectionDialog
          key={`${dialog.edit?.id ?? 'new'}|${dialog.prefill?.fromPageId ?? ''}|${dialog.prefill?.toPageId ?? ''}`}
          open
          onOpenChange={(b) => { if (!b) setDialog(null); }}
          editConn={dialog.edit ?? null}
          prefill={dialog.prefill ?? null}
        />
      )}

      <PageManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />
      <TabManagerDialog open={tabOpen} onOpenChange={setTabOpen} />
    </div>
  );
}
