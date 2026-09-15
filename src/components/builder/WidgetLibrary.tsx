'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Search, Blocks } from 'lucide-react';
import { categories, widgetsByCategory } from '@/components/widgets/registry';
import type { CategoryId } from '@/lib/widget-types';
import { useBuilder } from '@/lib/store';
import { useDnd } from '@/lib/dnd-store';
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
};

/** 左侧组件仓库：搜索 + 分类目录 + 可拖拽组件卡片 */
export function WidgetLibrary() {
  const addWidget = useBuilder((s) => s.addWidget);
  const pages = useBuilder((s) => s.pages);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  /** 组件市场资源管理器 */
  const [manageOpen, setManageOpen] = useState(false);

  const page = pages.find((p) => p.id === currentPageId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((cat) => ({
        cat,
        widgets: widgetsByCategory(cat.id).filter(
          (w) => !q || w.name.toLowerCase().includes(q) || w.desc.toLowerCase().includes(q) || w.type.includes(q)
        ),
      }))
      .filter((g) => g.widgets.length > 0);
  }, [query]);

  return (
    <aside className="flex w-[292px] shrink-0 flex-col border-r bg-white" aria-label="组件仓库">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Blocks className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold">组件仓库</h2>
            <p className="truncate text-[11px] text-zinc-400">拖拽或点击添加到画布</p>
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索组件，如：验证码"
            className="h-8 w-full rounded-lg border bg-zinc-50 pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2.5 thin-scroll">
        {/* 我的组合：用户保存的可复用组件组合 + 资源管理入口 */}
        <PresetLibrarySection query={query} onManage={() => setManageOpen(true)} />

        {filtered.map(({ cat, widgets }) => {
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
                    <button
                      key={w.type}
                      onPointerDown={(e) => {
                        /* 指针拖拽：按下即记录，移动超过阈值后由画布接管渲染指示 */
                        if (e.pointerType === 'mouse' && e.button !== 0) return;
                        useDnd.getState().begin({
                          kind: 'new',
                          widgetType: w.type,
                          px: e.clientX,
                          py: e.clientY,
                        });
                      }}
                      onClick={() => {
                        /* 拖拽结束后抑制本次 click，未拖动则视为点击添加 */
                        const d = useDnd.getState();
                        if (d.started || d.suppressNextClick) {
                          if (d.suppressNextClick) useDnd.setState({ suppressNextClick: false });
                          return;
                        }
                        addWidget(w.type);
                      }}
                      title={`${w.name} · ${w.desc}`}
                      className="group flex cursor-grab touch-manipulation flex-col items-center gap-1.5 rounded-xl border border-transparent bg-white p-2.5 text-center transition-all hover:border-zinc-200 hover:shadow-md active:cursor-grabbing active:scale-95"
                    >
                      <span
                        className="flex size-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                        style={{ background: `${CATEGORY_COLOR[cat.id]}14`, color: CATEGORY_COLOR[cat.id] }}
                      >
                        <w.icon className="size-4.5" />
                      </span>
                      <span className="w-full truncate text-[11px] font-semibold text-zinc-700">{w.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
        {filtered.length === 0 && (
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
