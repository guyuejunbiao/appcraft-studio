'use client';

import { useMemo, useState } from 'react';
import {
  Sparkles, Trash2, Plus, PackagePlus, Layers, LayoutTemplate,
  Rows3, PanelsTopLeft, Settings2, Pencil, Search, Check, X, Star, ArrowUpDown,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { getWidget } from '@/components/widgets/registry';
import { toast } from 'sonner';
import {
  presetStarred, sortPresets,
  type PresetData, type PresetSortMode,
} from '@/lib/types';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/** 组合/页面模板可选 emoji 图标（避免蓝靛倾向） */
export const PRESET_EMOJIS = [
  '✨', '🛒', '💳', '🍔', '💬', '🎵', '📰', '📊', '💪', '👤',
  '🔥', '⭐', '🎁', '🏆', '📱', '🧩', '🎯', '❤️', '🌙', '☕',
  '📄', '🏠', '🗂️', '🧱',
];

/**
 * 「存为页面模板」对话框：把当前页面的全部组件（含绝对坐标/背景/布局）存为可复用页面模板。
 * 由父组件用 key 控制重挂载（每次打开重置表单）。
 */
export function SavePagePresetDialog({
  open,
  onOpenChange,
  pageId,
  defaultName,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  pageId: string;
  defaultName: string;
}) {
  const savePagePreset = useBuilder((s) => s.savePagePreset);
  const pages = useBuilder((s) => s.pages);
  const page = pages.find((p) => p.id === pageId);
  const [name, setName] = useState(defaultName ? `${defaultName}模板` : '');
  const [icon, setIcon] = useState('📄');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    const saved = await savePagePreset(name, icon, pageId);
    setSaving(false);
    if (saved) {
      toast.success(`页面模板「${saved.name}」已存入市场`, { description: '点「+」→ 从模板新建即可整页复用' });
      onOpenChange(false);
    } else {
      toast.error('保存失败：请检查名称（页面需至少 1 个组件）');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex size-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <LayoutTemplate className="size-4" />
            </span>
            存为页面模板
          </DialogTitle>
          <DialogDescription>
            保存整页 {page?.components.length ?? 0} 个组件（含位置、背景与布局），跨项目复用
          </DialogDescription>
        </DialogHeader>

        {page && (
          <div className="flex items-center gap-2 rounded-lg border bg-zinc-50 px-3 py-2 text-[11px] font-semibold text-zinc-600">
            <span className="size-3.5 rounded-full border border-zinc-200" style={{ background: page.background }} />
            {page.layout === 'flow' ? (
              <span className="flex items-center gap-1"><Rows3 className="size-3" /> 流式布局</span>
            ) : (
              <span className="flex items-center gap-1"><PanelsTopLeft className="size-3" /> 自由布局</span>
            )}
            <span className="ml-auto text-zinc-400">{page.components.length} 组件</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-500">模板名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：商城商品详情页"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-500">图标</label>
            <div className="grid grid-cols-12 gap-1">
              {PRESET_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  aria-label={`图标 ${e}`}
                  className={`flex size-7 items-center justify-center rounded-lg text-base transition-all hover:bg-zinc-100 ${
                    icon === e ? 'ring-2 ring-violet-400 bg-violet-50' : ''
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>取消</Button>
          <Button size="sm" disabled={!name.trim() || saving} onClick={submit} className="bg-violet-500 hover:bg-violet-600 text-white">
            {saving ? '保存中…' : '存为页面模板'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 「从模板新建页面」选择器：网格展示全部页面模板，点击即创建新页。
 */
export function PageTemplateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const presets = useBuilder((s) => s.presets);
  const addPageFromTemplate = useBuilder((s) => s.addPageFromTemplate);
  const deletePreset = useBuilder((s) => s.deletePreset);
  const pagePresets = useMemo(
    () => presets.filter((p) => (p.kind ?? 'combo') === 'page'),
    [presets]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex size-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <LayoutTemplate className="size-4" />
            </span>
            从模板新建页面
          </DialogTitle>
          <DialogDescription>选择一个页面模板，整页组件、背景与布局一并复用</DialogDescription>
        </DialogHeader>

        {pagePresets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 px-4 py-8 text-center">
            <LayoutTemplate className="mx-auto size-6 text-violet-400" />
            <p className="mt-2 text-xs font-bold text-violet-700">还没有页面模板</p>
            <p className="mt-1 text-[11px] leading-4 text-violet-600/80">
              右键页面标签 → 「存为页面模板」即可创建
            </p>
          </div>
        ) : (
          <div className="grid max-h-[55vh] grid-cols-2 gap-2 overflow-y-auto p-1 thin-scroll">
            {pagePresets.map((p) => (
              <PageTemplateCard
                key={p.id}
                preset={p}
                onUse={() => {
                  addPageFromTemplate(p);
                  toast.success(`已从「${p.name}」创建新页面`, { description: `${p.widgets.length} 个组件已就位，可继续编辑` });
                  onOpenChange(false);
                }}
                onDelete={() => {
                  deletePreset(p.id);
                  toast(`已删除模板「${p.name}」`);
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** 页面模板卡片：图标 + 名称 + 概要 + 使用/删除 */
function PageTemplateCard({
  preset,
  onUse,
  onDelete,
}: {
  preset: PresetData;
  onUse: () => void;
  onDelete: () => void;
}) {
  const bg = preset.meta?.background ?? '#f6f7fb';
  const isFlow = preset.meta?.layout === 'flow';
  return (
    <div className="group relative">
      <button
        onClick={onUse}
        title={`使用模板「${preset.name}」`}
        className="flex w-full cursor-pointer flex-col items-start gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-all hover:border-violet-300 hover:shadow-md active:scale-[0.97]"
      >
        <span className="flex w-full items-center gap-2">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-lg"
            style={{ background: bg }}
          >
            {preset.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block w-full truncate text-xs font-bold text-zinc-700">{preset.name}</span>
            <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
              {isFlow ? <Rows3 className="size-2.5" /> : <PanelsTopLeft className="size-2.5" />}
              {isFlow ? '流式' : '自由'} · {preset.widgets.length} 组件
            </span>
          </span>
        </span>
        {/* 组件类型摘要（最多 3 个） */}
        <span className="flex w-full flex-wrap gap-1">
          {preset.widgets.slice(0, 3).map((w, i) => (
            <span key={i} className="truncate rounded bg-zinc-100 px-1 py-0.5 text-[9px] font-semibold text-zinc-500">
              {getWidget(w.type)?.name ?? w.type}
            </span>
          ))}
          {preset.widgets.length > 3 && (
            <span className="rounded bg-zinc-100 px-1 py-0.5 text-[9px] font-bold text-zinc-400">
              +{preset.widgets.length - 3}
            </span>
          )}
        </span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="删除模板"
        aria-label={`删除模板 ${preset.name}`}
        className="absolute -right-1 -top-1 hidden size-5 items-center justify-center rounded-full bg-white text-rose-500 shadow-md ring-1 ring-zinc-200 transition-colors hover:bg-rose-50 group-hover:flex"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  );
}
/**
 * 「存为组合」对话框：把当前多选的组件保存到组件市场。
 * 保存时按画布顺序提取、坐标归一化为组合内相对坐标。
 */
export function SavePresetDialog({
  open,
  onOpenChange,
  ids,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  ids: string[];
}) {
  const savePreset = useBuilder((s) => s.savePreset);
  const pages = useBuilder((s) => s.pages);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✨');
  const [saving, setSaving] = useState(false);

  const page = pages.find((p) => p.id === currentPageId);
  /** 预览：选中的组件类型摘要 */
  const summary = useMemo(() => {
    if (!page) return [];
    return page.components
      .filter((c) => ids.includes(c.id))
      .map((c) => getWidget(c.type)?.name ?? c.type)
      .filter(Boolean) as string[];
  }, [page, ids]);

  const handleOpen = (b: boolean) => {
    if (b) {
      /* 打开时重置为默认推荐名 */
      setName(summary.length > 0 ? `${summary[0]}等 ${summary.length} 个组件` : '');
      setIcon('✨');
    }
    onOpenChange(b);
  };

  const submit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    const saved = await savePreset(name, icon, ids);
    setSaving(false);
    if (saved) {
      toast.success(`组合「${saved.name}」已存入组件市场`, { description: '在左侧组件仓库顶部「我的组合」可随时复用' });
      onOpenChange(false);
    } else {
      toast.error('保存失败，请检查组合名称');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <PackagePlus className="size-4" />
            </span>
            存为组件组合
          </DialogTitle>
          <DialogDescription>
            把选中的 {ids.length} 个组件（含样式与相对位置）保存为可复用组合
          </DialogDescription>
        </DialogHeader>

        {/* 选中组件摘要 */}
        {summary.length > 0 && (
          <div className="max-h-20 overflow-y-auto rounded-lg border bg-zinc-50 px-3 py-2 thin-scroll">
            <div className="flex flex-wrap gap-1">
              {summary.map((n, i) => (
                <span key={i} className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 shadow-sm">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-500">组合名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：商城首页头部"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-500">图标</label>
            <div className="grid grid-cols-10 gap-1">
              {PRESET_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  aria-label={`图标 ${e}`}
                  className={`flex size-7 items-center justify-center rounded-lg text-base transition-all hover:bg-zinc-100 ${
                    icon === e ? 'ring-2 ring-amber-400 bg-amber-50' : ''
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>取消</Button>
          <Button size="sm" disabled={!name.trim() || saving} onClick={submit} className="bg-amber-500 hover:bg-amber-600 text-white">
            {saving ? '保存中…' : '存入组件市场'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 组件仓库顶部「我的组合」目录：点击插入画布 / 拖拽到画布指定位置插入，hover 删除；onManage 打开资源管理器。星标资源永远置顶 */
export function PresetLibrarySection({ query, onManage }: { query: string; onManage?: () => void }) {
  const presets = useBuilder((s) => s.presets);
  const insertPreset = useBuilder((s) => s.insertPreset);
  const deletePreset = useBuilder((s) => s.deletePreset);

  const filtered = useMemo(
    () =>
      sortPresets(
        presets
          .filter((p) => (p.kind ?? 'combo') === 'combo')
          .filter((p) => {
            const q = query.trim().toLowerCase();
            return !q || p.name.toLowerCase().includes(q);
          }),
        'star'
      ),
    [presets, query]
  );
  const pageCount = useMemo(() => presets.filter((p) => (p.kind ?? 'combo') === 'page').length, [presets]);

  return (
    <section className="rounded-xl" data-testid="preset-section">
      <div className="flex items-center gap-1">
        <button
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-zinc-50"
          aria-label="我的组合目录"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Sparkles className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold leading-4">我的组合</span>
            <span className="block truncate text-[10px] text-zinc-400">点击插入底部，或拖到画布任意位置</span>
          </span>
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
            {filtered.length}
          </span>
        </button>
        {onManage && (
          <button
            onClick={onManage}
            title="管理资源（组合 / 页面模板 · 重命名）"
            aria-label="管理组件市场资源"
            className="mr-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
          >
            <Settings2 className="size-3.5" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mx-1 mb-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 px-3 py-3 text-center">
          <p className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-700">
            <Layers className="size-3.5" /> 还没有保存的组合
          </p>
          <p className="mt-1 text-[10px] leading-4 text-amber-600/80">
            在画布多选组件后，点批量工具条的
            <PackagePlus className="mx-0.5 inline size-3" />
            即可存入
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 px-1 pb-2 pt-1">
          {filtered.map((p) => {
            const starred = presetStarred(p);
            return (
              <div key={p.id} className="group relative">
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-appcraft-preset', p.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => {
                    insertPreset(p);
                    toast.success(`已插入组合「${p.name}」`, { description: `${p.widgets.length} 个组件已添加到内容底部，可整体拖动` });
                  }}
                  title={`${p.name} · ${p.widgets.length} 个组件，点击插入或拖到画布`}
                  className={`flex w-full cursor-grab flex-col items-center gap-1.5 rounded-xl border bg-white p-2.5 text-center transition-all hover:shadow-md active:scale-95 active:cursor-grabbing ${
                    starred ? 'border-amber-200' : 'border-transparent hover:border-amber-200'
                  }`}
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-lg">
                    {p.icon}
                  </span>
                  <span className="w-full truncate text-[11px] font-semibold text-zinc-700">{p.name}</span>
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600">
                    {starred && <Star className="size-2.5 fill-amber-400 text-amber-400" />}
                    <Plus className="size-2.5" /> {p.widgets.length} 组件
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePreset(p.id);
                    toast(`已删除组合「${p.name}」`);
                  }}
                  title="删除组合"
                  aria-label={`删除组合 ${p.name}`}
                  className="absolute -right-1 -top-1 hidden size-5 items-center justify-center rounded-full bg-white text-rose-500 shadow-md ring-1 ring-zinc-200 transition-colors hover:bg-rose-50 group-hover:flex"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {onManage && pageCount > 0 && (
        <button
          onClick={onManage}
          className="mx-1 mb-1 flex w-[calc(100%-8px)] items-center justify-center gap-1 rounded-lg border border-dashed border-violet-200 bg-violet-50/40 py-1.5 text-[10px] font-semibold text-violet-600 transition-colors hover:bg-violet-50"
        >
          <LayoutTemplate className="size-3" />
          还有 {pageCount} 个页面模板 · 点击管理
        </button>
      )}
    </section>
  );
}

/** 排序模式文案 */
const SORT_LABEL: Record<PresetSortMode, string> = { time: '最近创建', name: '名称 A-Z', star: '星标优先' };

/**
 * 组件市场资源管理器：组合 / 页面模板双 tab + 搜索 + 排序 + 收藏 + 重命名 + 删除 + 插入/使用。
 * 从组件仓库「我的组合」目录右上角齿轮进入。
 */
export function PresetManagerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const presets = useBuilder((s) => s.presets);
  const renamePreset = useBuilder((s) => s.renamePreset);
  const togglePresetStar = useBuilder((s) => s.togglePresetStar);
  const deletePreset = useBuilder((s) => s.deletePreset);
  const insertPreset = useBuilder((s) => s.insertPreset);
  const addPageFromTemplate = useBuilder((s) => s.addPageFromTemplate);

  const [tab, setTab] = useState<'combo' | 'page'>('combo');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<PresetSortMode>('time');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const q = query.trim().toLowerCase();
  const combos = useMemo(
    () => sortPresets(presets.filter((p) => (p.kind ?? 'combo') === 'combo' && (!q || p.name.toLowerCase().includes(q))), sortMode),
    [presets, q, sortMode]
  );
  const pageTemplates = useMemo(
    () => sortPresets(presets.filter((p) => (p.kind ?? 'combo') === 'page' && (!q || p.name.toLowerCase().includes(q))), sortMode),
    [presets, q, sortMode]
  );

  const startRename = (p: PresetData) => {
    setEditingId(p.id);
    setEditName(p.name);
  };
  const commitRename = async () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name || name === presets.find((p) => p.id === editingId)?.name) {
      setEditingId(null);
      return;
    }
    const ok = await renamePreset(editingId, { name });
    if (ok) toast.success(`已重命名为「${name}」`);
    else toast.error('重命名失败：名称不能为空或网络异常');
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Settings2 className="size-4" />
            </span>
            组件市场资源管理
          </DialogTitle>
          <DialogDescription>
            搜索、重命名、删除或直接使用已保存的组合与页面模板（全局共享，不隶属单个项目）
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索名称…"
              className="h-8 pl-8 text-xs"
              aria-label="搜索组件市场资源"
            />
          </div>
          {/* 排序：最近创建 / 名称 / 星标优先 */}
          <div className="flex items-center gap-1 rounded-lg border bg-zinc-50 px-2 py-1">
            <ArrowUpDown className="size-3 text-zinc-400" />
            {(['time', 'name', 'star'] as PresetSortMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setSortMode(m)}
                aria-pressed={sortMode === m}
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                  sortMode === m ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {SORT_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'combo' | 'page')} className="min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="combo" className="text-xs">
              <PackagePlus className="mr-1 size-3" /> 组件组合 {combos.length}
            </TabsTrigger>
            <TabsTrigger value="page" className="text-xs">
              <LayoutTemplate className="mr-1 size-3" /> 页面模板 {pageTemplates.length}
            </TabsTrigger>
          </TabsList>

          <div className="mt-2 max-h-[46vh] min-h-[180px] overflow-y-auto p-0.5 thin-scroll">
            <TabsContent value="combo" className="mt-0">
              {combos.length === 0 ? (
                <EmptyHint kind="combo" searching={!!q} />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {combos.map((p) => (
                    <ManagerCard
                      key={p.id}
                      preset={p}
                      editing={editingId === p.id}
                      editName={editName}
                      onEditNameChange={setEditName}
                      onCommitRename={commitRename}
                      onCancelRename={() => setEditingId(null)}
                      onRename={() => startRename(p)}
                      onToggleStar={() => {
                        void togglePresetStar(p.id).then((ok) => {
                          if (!ok) toast.error('收藏操作失败：网络异常');
                        });
                      }}
                      onDelete={() => {
                        deletePreset(p.id);
                        toast(`已删除组合「${p.name}」`);
                      }}
                      onUse={() => {
                        insertPreset(p);
                        toast.success(`已插入组合「${p.name}」`, { description: `${p.widgets.length} 个组件已放到当前页面底部` });
                        onOpenChange(false);
                      }}
                      useLabel="插入页面"
                      accent="amber"
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="page" className="mt-0">
              {pageTemplates.length === 0 ? (
                <EmptyHint kind="page" searching={!!q} />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {pageTemplates.map((p) => (
                    <ManagerCard
                      key={p.id}
                      preset={p}
                      editing={editingId === p.id}
                      editName={editName}
                      onEditNameChange={setEditName}
                      onCommitRename={commitRename}
                      onCancelRename={() => setEditingId(null)}
                      onRename={() => startRename(p)}
                      onToggleStar={() => {
                        void togglePresetStar(p.id).then((ok) => {
                          if (!ok) toast.error('收藏操作失败：网络异常');
                        });
                      }}
                      onDelete={() => {
                        deletePreset(p.id);
                        toast(`已删除模板「${p.name}」`);
                      }}
                      onUse={() => {
                        addPageFromTemplate(p);
                        toast.success(`已从「${p.name}」创建新页面`, { description: `${p.widgets.length} 个组件已就位` });
                        onOpenChange(false);
                      }}
                      useLabel="新建页面"
                      accent="violet"
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="items-center gap-2 sm:justify-between">
          <span className="text-[10px] text-zinc-400">
            共 {presets.length} 项 · 命中 组合 {combos.length} / 模板 {pageTemplates.length}
          </span>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>完成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmptyHint({ kind, searching }: { kind: 'combo' | 'page'; searching?: boolean }) {
  const isCombo = kind === 'combo';
  if (searching) {
    return (
      <div className="flex min-h-[170px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-6 text-center">
        <Search className="size-6 text-zinc-300" />
        <p className="text-xs font-bold text-zinc-500">没有匹配的资源</p>
        <p className="text-[11px] text-zinc-400">换个关键词试试，或清空搜索查看全部</p>
      </div>
    );
  }
  return (
    <div
      className={`flex min-h-[170px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center ${
        isCombo ? 'border-amber-200 bg-amber-50/40' : 'border-violet-200 bg-violet-50/40'
      }`}
    >
      {isCombo ? <PackagePlus className="size-6 text-amber-400" /> : <LayoutTemplate className="size-6 text-violet-400" />}
      <p className={`text-xs font-bold ${isCombo ? 'text-amber-700' : 'text-violet-700'}`}>
        {isCombo ? '还没有组件组合' : '还没有页面模板'}
      </p>
      <p className={`text-[11px] leading-4 ${isCombo ? 'text-amber-600/80' : 'text-violet-600/80'}`}>
        {isCombo ? '画布多选组件 → 批量工具条「存为组合」即可创建' : '页面标签右键 →「存为页面模板」即可创建'}
      </p>
    </div>
  );
}

/** 管理卡片：点击使用 / 铅笔重命名 / 星标收藏 / 叉删除 */
function ManagerCard({
  preset,
  editing,
  editName,
  onEditNameChange,
  onCommitRename,
  onCancelRename,
  onRename,
  onToggleStar,
  onDelete,
  onUse,
  useLabel,
  accent,
}: {
  preset: PresetData;
  editing: boolean;
  editName: string;
  onEditNameChange: (v: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onRename: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
  onUse: () => void;
  useLabel: string;
  accent: 'amber' | 'violet';
}) {
  const isCombo = (preset.kind ?? 'combo') === 'combo';
  const bg = preset.meta?.background ?? '#f6f7fb';
  const starred = presetStarred(preset);

  if (editing) {
    return (
      <div className="rounded-xl border-2 border-zinc-300 bg-white p-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-lg"
            style={{ background: isCombo ? '#fffbeb' : bg }}
          >
            {preset.icon}
          </span>
          <Input
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename();
              if (e.key === 'Escape') onCancelRename();
            }}
            className="h-7 min-w-0 flex-1 text-xs"
            autoFocus
            aria-label="资源名称"
          />
          <button
            onClick={onCommitRename}
            title="确认"
            aria-label="确认重命名"
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
          >
            <Check className="size-3.5" />
          </button>
          <button
            onClick={onCancelRename}
            title="取消"
            aria-label="取消重命名"
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-300"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-zinc-200 bg-white p-2.5 transition-all hover:shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-lg"
          style={{ background: isCombo ? '#fffbeb' : bg }}
        >
          {preset.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-zinc-700" title={preset.name}>{preset.name}</p>
          <p className="text-[10px] font-semibold text-zinc-400">
            {isCombo
              ? `${preset.widgets.length} 组件`
              : `${preset.meta?.layout === 'flow' ? '流式' : '自由'} · ${preset.widgets.length} 组件`}
          </p>
        </div>
        <button
          onClick={onToggleStar}
          title={starred ? '取消收藏' : '收藏（星标优先展示）'}
          aria-label={starred ? `取消收藏 ${preset.name}` : `收藏 ${preset.name}`}
          aria-pressed={starred}
          className={`flex size-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-amber-50 ${
            starred ? 'text-amber-500' : 'text-zinc-300 hover:text-amber-500'
          }`}
        >
          <Star className={`size-3.5 ${starred ? 'fill-amber-400' : ''}`} />
        </button>
        <button
          onClick={onRename}
          title="重命名"
          aria-label={`重命名 ${preset.name}`}
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Pencil className="size-3" />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <button
          onClick={onUse}
          className={`flex h-7 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg text-[11px] font-bold text-white shadow-sm transition-all hover:brightness-105 active:scale-95 ${
            accent === 'amber' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-500 hover:bg-violet-600'
          }`}
        >
          <Plus className="size-3 shrink-0" /> {useLabel}
        </button>
        <button
          onClick={onDelete}
          title="删除"
          aria-label={`删除 ${preset.name}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
