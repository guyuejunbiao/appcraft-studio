'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Search, Blocks, Sparkles, Blocks as BlocksIcon } from 'lucide-react';
import { categories, widgetsByCategory, getWidget, allWidgets } from '@/components/widgets/registry';
import type { CategoryId, WidgetDef } from '@/lib/widget-types';
import { useBuilder } from '@/lib/store';
import { useDnd } from '@/lib/dnd-store';
import { allPresets, presetsByCategory, searchPresets, totalModules, mergedPresetProps, type PresetDef } from '@/lib/presets';
import { PresetLibrarySection, PresetManagerDialog } from './PresetMarket';

/** 分类点缀色（避开蓝/靛色系） */
export const CATEGORY_COLOR: Record<CategoryId, string> = {
  login: '#10b981',
  mall: '#f43f5e',
  shopping: '#f59e0b',
  chat: '#22c55e',
  food: '#f97316',
  social: '#ec4899',
  media: '#a855f7',
  news: '#ef4444',
  charts: '#14b8a6',
  profile: '#f59e0b',
  fitness: '#84cc16',
  functional: '#8b5cf6',
  buttons: '#0d9488',
};

type LibraryTab = 'presets' | 'widgets';

/** 基础组件卡片（原组件仓库网格单元，抽出复用） */
function WidgetCard({ w, color, onAdd, onDragBegin }: {
  w: WidgetDef;
  color: string;
  onAdd: () => void;
  onDragBegin: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      onPointerDown={onDragBegin}
      onClick={onAdd}
      title={`${w.name} · ${w.desc}`}
      className="group flex cursor-grab touch-manipulation flex-col items-center gap-1.5 rounded-xl border border-transparent bg-white p-2.5 text-center transition-all hover:border-zinc-200 hover:shadow-md active:cursor-grabbing active:scale-95"
    >
      <span
        className="flex size-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
        style={{ background: `${color}14`, color }}
      >
        <w.icon className="size-4.5" />
      </span>
      <span className="w-full truncate text-[11px] font-semibold text-zinc-700">{w.name}</span>
    </button>
  );
}

/**
 * 精选预设卡片：缩略实渲（render(props) 缩小 24.5%）+ 名称，拖入画布即成品。
 * 缩略渲染 pointer-events-none 防交互泄漏；随类目展开/搜索命中才渲染（性能）。
 */
function PresetCard({ preset, color, onAdd, onDragBegin }: {
  preset: PresetDef;
  color: string;
  onAdd: () => void;
  onDragBegin: (e: React.PointerEvent) => void;
}) {
  const def = useMemo(() => getWidget(preset.baseType), [preset.baseType]);
  // 注意：外层不能用 <button>——预设缩略实渲内部含 <button>（如登录按钮），
  // button 嵌套 button 是非法 HTML 且触发 hydration 警告，改用 div[role=button]。
  const activate = () => onAdd();
  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={onDragBegin}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }}
      title={`${preset.name} · 基于「${def?.name ?? preset.baseType}」`}
      aria-label={`添加预设 ${preset.name}`}
      className="group flex cursor-grab touch-manipulation flex-col overflow-hidden rounded-xl border border-transparent bg-white text-center transition-all hover:border-zinc-200 hover:shadow-md active:cursor-grabbing active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
      <span
        className="relative flex h-[62px] w-full items-start justify-center overflow-hidden pt-1"
        style={{ background: `linear-gradient(180deg, ${color}0d, transparent)` }}
        aria-hidden
      >
        <span
          className="pointer-events-none w-[375px] origin-top shrink-0 select-none"
          style={{ transform: 'scale(0.245)' }}
        >
          {def?.render(mergedPresetProps(preset) as never)}
        </span>
      </span>
      <span className="flex w-full items-center gap-1 border-t border-zinc-100 px-1.5 py-1.5">
        <span className="min-w-0 flex-1 truncate text-left text-[11px] font-semibold text-zinc-700">{preset.name}</span>
      </span>
    </div>
  );
}

/** 左侧组件仓库：搜索 + 「精选预设 / 基础组件」双 tab + 分类目录 + 可拖拽卡片 */
export function WidgetLibrary() {
  const addWidget = useBuilder((s) => s.addWidget);
  const pages = useBuilder((s) => s.pages);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<LibraryTab>('presets');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  /** 组件市场资源管理器 */
  const [manageOpen, setManageOpen] = useState(false);

  const page = pages.find((p) => p.id === currentPageId);

  /** 预设搜索结果（跨类目平铺） */
  const presetHits = useMemo(() => (tab === 'presets' ? searchPresets(query) : []), [tab, query]);

  /** 组件搜索结果（按类目分组，原逻辑） */
  const widgetGroups = useMemo(() => {
    if (tab !== 'widgets') return [];
    const q = query.trim().toLowerCase();
    return categories
      .map((cat) => ({
        cat,
        widgets: widgetsByCategory(cat.id).filter(
          (w) => !q || w.name.toLowerCase().includes(q) || w.desc.toLowerCase().includes(q) || w.type.includes(q)
        ),
      }))
      .filter((g) => g.widgets.length > 0);
  }, [tab, query]);

  /** 无搜索词时按类目分组的预设（折叠目录形态）；有搜索词时平铺 */
  const presetGroups = useMemo(
    () =>
      categories
        .map((cat) => ({ cat, presets: presetsByCategory(cat.id) }))
        .filter((g) => g.presets.length > 0),
    []
  );

  const beginPresetDrag = (preset: PresetDef) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    useDnd.getState().begin({
      kind: 'new',
      widgetType: preset.baseType,
      preset: { name: preset.name, props: mergedPresetProps(preset) },
      px: e.clientX,
      py: e.clientY,
    });
  };

  const addPreset = (preset: PresetDef) => () => {
    const d = useDnd.getState();
    if (d.started || d.suppressNextClick) {
      if (d.suppressNextClick) useDnd.setState({ suppressNextClick: false });
      return;
    }
    addWidget(preset.baseType, undefined, undefined, mergedPresetProps(preset));
  };

  const beginWidgetDrag = (type: string) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    useDnd.getState().begin({ kind: 'new', widgetType: type, px: e.clientX, py: e.clientY });
  };

  const addWidgetByType = (type: string) => () => {
    const d = useDnd.getState();
    if (d.started || d.suppressNextClick) {
      if (d.suppressNextClick) useDnd.setState({ suppressNextClick: false });
      return;
    }
    addWidget(type);
  };

  return (
    <aside className="flex w-[292px] shrink-0 flex-col border-r bg-white" aria-label="组件仓库">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Blocks className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold">组件仓库</h2>
            <p className="truncate text-[11px] text-zinc-400">{totalModules} 个可用模块 · 拖拽或点击添加</p>
          </div>
        </div>

        {/* 双 tab：精选预设（小白拿成品）/ 基础组件（进阶自由配） */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1" role="tablist" aria-label="组件库模式">
          <button
            role="tab"
            aria-selected={tab === 'presets'}
            onClick={() => setTab('presets')}
            className={`flex h-7 items-center justify-center gap-1 rounded-md text-[12px] font-bold transition-all ${
              tab === 'presets' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Sparkles className="size-3.5" />
            精选预设
            <span className="rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-700">{allPresets.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'widgets'}
            onClick={() => setTab('widgets')}
            className={`flex h-7 items-center justify-center gap-1 rounded-md text-[12px] font-bold transition-all ${
              tab === 'widgets' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <BlocksIcon className="size-3.5" />
            基础组件
            <span className="rounded-full bg-zinc-200 px-1 text-[10px] font-bold text-zinc-600">{allWidgets.length}</span>
          </button>
        </div>

        <div className="relative mt-2.5">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'presets' ? '搜索预设，如：奶茶店、签到' : '搜索组件，如：验证码'}
            className="h-8 w-full rounded-lg border bg-zinc-50 pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2.5 thin-scroll">
        {/* 我的组合：用户保存的可复用组件组合 + 资源管理入口 */}
        <PresetLibrarySection query={query} onManage={() => setManageOpen(true)} />

        {tab === 'presets' && (
          <>
            <p className="px-1 pb-1 pt-0.5 text-[10.5px] leading-4 text-zinc-400">
              预设 = 调好文案样式的成品，拖进画布直接用，改字即可。
            </p>
            {query.trim() ? (
              <div className="grid grid-cols-2 gap-1.5 px-1 pt-1">
                {presetHits.slice(0, 80).map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    color={CATEGORY_COLOR[preset.category]}
                    onAdd={addPreset(preset)}
                    onDragBegin={beginPresetDrag(preset)}
                  />
                ))}
              </div>
            ) : (
              presetGroups.map(({ cat, presets }) => {
                const isCollapsed = collapsed[`ps-${cat.id}`];
                const color = CATEGORY_COLOR[cat.id];
                return (
                  <section key={cat.id} className="rounded-xl">
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-zinc-50"
                      onClick={() => setCollapsed((c) => ({ ...c, [`ps-${cat.id}`]: !c[`ps-${cat.id}`] }))}
                      aria-expanded={!isCollapsed}
                    >
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${color}1a`, color }}
                      >
                        <cat.icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-bold leading-4">{cat.name}</span>
                        <span className="block truncate text-[10px] text-zinc-400">{presets.length} 个成品预设</span>
                      </span>
                      <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                        {presets.length}
                      </span>
                      <ChevronDown className={`size-3.5 text-zinc-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    </button>

                    {!isCollapsed && (
                      <div className="grid grid-cols-2 gap-1.5 px-1 pb-2 pt-1">
                        {presets.map((preset) => (
                          <PresetCard
                            key={preset.id}
                            preset={preset}
                            color={color}
                            onAdd={addPreset(preset)}
                            onDragBegin={beginPresetDrag(preset)}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })
            )}
            {query.trim() && presetHits.length === 0 && (
              <div className="py-10 text-center text-xs text-zinc-400">没有匹配的预设，试试「基础组件」tab</div>
            )}
          </>
        )}

        {tab === 'widgets' &&
          widgetGroups.map(({ cat, widgets }) => {
            const isCollapsed = collapsed[cat.id] && !query;
            const color = CATEGORY_COLOR[cat.id];
            return (
              <section key={cat.id} className="rounded-xl">
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-zinc-50"
                  onClick={() => setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))}
                  aria-expanded={!isCollapsed}
                >
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${color}1a`, color }}
                  >
                    <cat.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold leading-4">{cat.name}</span>
                    <span className="block truncate text-[10px] text-zinc-400">{cat.desc}</span>
                  </span>
                  <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                    {widgets.length}
                  </span>
                  <ChevronDown className={`size-3.5 text-zinc-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>

                {!isCollapsed && (
                  <div className="grid grid-cols-2 gap-1.5 px-1 pb-2 pt-1">
                    {widgets.map((w) => (
                      <WidgetCard
                        key={w.type}
                        w={w}
                        color={color}
                        onAdd={addWidgetByType(w.type)}
                        onDragBegin={beginWidgetDrag(w.type)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}

        {tab === 'widgets' && widgetGroups.length === 0 && (
          <div className="py-10 text-center text-xs text-zinc-400">没有匹配的组件</div>
        )}
      </div>

      {page && (
        <div className="border-t px-4 py-2.5 text-[11px] text-zinc-400">
          当前页面「{page.name}」已有 {page.components.filter((c) => !c.hidden).length} 个组件
          {page.components.length === 0 && <span className="ml-1 inline-flex items-center text-emerald-600"><Plus className="size-3" /> 从上面开始添加</span>}
        </div>
      )}

      {/* 组件市场资源管理器（组合/页面模板 双 tab） */}
      <PresetManagerDialog open={manageOpen} onOpenChange={setManageOpen} />
    </aside>
  );
}
