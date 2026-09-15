'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Plus, Undo2, Redo2, Home, Crown, GitBranch, Play, Save, Loader2,
  Pencil, Copy, Trash2, Download, Upload, Keyboard, Ellipsis, FileCode2,
  LayoutTemplate, FilePlus2, GripVertical, FolderTree, PanelBottom, X,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { exportHtmlApp } from '@/lib/export-html';
import { PageTemplateDialog, SavePagePresetDialog } from '@/components/builder/PresetMarket';
import { PageManagerDialog } from '@/components/builder/PageManager';
import { TabManagerDialog } from '@/components/builder/TabManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SHORTCUTS: [string, string][] = [
  ['Ctrl/⌘ + Z', '撤销上一步'],
  ['Ctrl/⌘ + Shift + Z', '重做'],
  ['Delete / Backspace', '删除选中组件'],
  ['Ctrl/⌘ + C / V', '复制 / 粘贴组件（可跨页面）'],
  ['Ctrl/⌘ + D', '创建组件副本'],
  ['Ctrl/⌘ + A', '全选当前页组件'],
  ['Ctrl/⌘ + G', '编组：整组选中、整体拖动'],
  ['Ctrl/⌘ + Shift + G', '解组'],
  ['方向键', '微调选中组件位置（Shift 加速）'],
  ['Shift + 点选 / 空白处拖拽', '多选组件，支持批量对齐/分布/编组'],
  ['单击组件', '选中并在右侧编辑'],
  ['右键组件', '跳转绑定 / 编组 / 图层 / 锁定隐藏'],
  ['右键空白处', '全选 / 粘贴 / 新增页面 / 切换布局'],
  ['右键页面标签', '重命名 / 副本 / 设为主页 / 存为页面模板 / 删除'],
  ['拖拽页面标签', '调整页面顺序（流程图与预览同步）'],
  ['拖拽组件卡片', '插入画布任意位置'],
  ['拖拽我的组合', '拖到画布释放位置整组插入'],
  ['双击流程图节点', '进入该页面编辑'],
];

/** 编辑器顶部工具栏：返回 / 项目名 / 页面标签（右键管理）/ 撤销重做 / 保存 / 导出导入 / 流程 / 预览 / 上架 */
export function Toolbar() {
  const project = useBuilder((s) => s.project);
  const pages = useBuilder((s) => s.pages);
  const tabs = useBuilder((s) => s.tabs);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const dirty = useBuilder((s) => s.dirty);
  const saving = useBuilder((s) => s.saving);
  const lastSavedAt = useBuilder((s) => s.lastSavedAt);
  const pastLen = useBuilder((s) => s.past.length);
  const futureLen = useBuilder((s) => s.future.length);
  const setView = useBuilder((s) => s.setView);
  const setCurrentPage = useBuilder((s) => s.setCurrentPage);
  const addPage = useBuilder((s) => s.addPage);
  const duplicatePage = useBuilder((s) => s.duplicatePage);
  const removePage = useBuilder((s) => s.removePage);
  const updatePage = useBuilder((s) => s.updatePage);
  const setHomePage = useBuilder((s) => s.setHomePage);
  const movePage = useBuilder((s) => s.movePage);
  const renameProject = useBuilder((s) => s.renameProject);
  const allPresets = useBuilder((s) => s.presets);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const save = useBuilder((s) => s.save);
  const setPublishOpen = useBuilder((s) => s.setPublishOpen);
  const exportProject = useBuilder((s) => s.exportProject);
  const importProject = useBuilder((s) => s.importProject);

  const fileRef = useRef<HTMLInputElement>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  /** 从模板新建页面对话框 */
  const [templateOpen, setTemplateOpen] = useState(false);
  /** 存为页面模板对话框（key 重挂载重置表单） */
  const [pagePreset, setPagePreset] = useState<{ id: string; name: string } | null>(null);
  /** 页面管理器对话框 */
  const [managerOpen, setManagerOpen] = useState(false);
  /** 底部导航（TabBar）管理对话框 */
  const [tabOpen, setTabOpen] = useState(false);
  /** 一次性引导：无限画布入口提示 */
  const [showCanvasHint, setShowCanvasHint] = useState(false);
  useEffect(() => {
    try { setShowCanvasHint(localStorage.getItem('ac-canvas-hint') !== 'done'); } catch { setShowCanvasHint(true); }
  }, []);
  const dismissCanvasHint = () => {
    setShowCanvasHint(false);
    try { localStorage.setItem('ac-canvas-hint', 'done'); } catch { /* noop */ }
  };
  /** 页面标签拖拽排序状态 */
  const [dragPageId, setDragPageId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  if (!project) return null;

  const pagePresets = allPresets.filter((p) => (p.kind ?? 'combo') === 'page');

  const savedLabel = dirty
    ? '未保存'
    : lastSavedAt
      ? `已保存 ${new Date(lastSavedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
      : '已保存';

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const ok = await importProject(payload);
      if (ok) toast.success('导入成功，已打开新项目');
      else toast.error('导入失败：文件格式不正确');
    } catch {
      toast.error('导入失败：无法解析 JSON');
    }
  };

  /** 导出独立 HTML App：先保存，再生成双击即可打开的原型文件 */
  const handleExportHtml = async () => {
    const s = useBuilder.getState();
    if (!s.project) return;
    if (dirty) await save();
    setExporting(true);
    try {
      const fileName = await exportHtmlApp({
        name: s.project.name,
        description: s.project.description,
        theme: s.project.theme,
        pages: s.pages,
        connections: s.connections,
      });
      toast.success('HTML App 已导出', {
        description: `${fileName} · 双击即可在浏览器打开，包含页面跳转与切换动画`,
      });
    } catch {
      toast.error('导出失败', { description: '请重试，或使用「导出项目 JSON」' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {/* 一次性引导横幅：无限画布 */}
      {showCanvasHint && (
        <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-50 px-4 py-1.5 text-[11px] text-violet-700">
          <GitBranch className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            全新「无限画布」：俯瞰全部页面、拖拽连线、画板内点选组件直接改文字/调间距 —— 点右侧按钮体验
          </span>
          <button
            className="shrink-0 rounded-full bg-violet-500 px-2.5 py-0.5 text-[10px] font-bold text-white hover:bg-violet-600"
            onClick={() => { dismissCanvasHint(); setView('canvas'); }}
          >
            立即体验
          </button>
          <button className="shrink-0 text-violet-400 hover:text-violet-600" onClick={dismissCanvasHint} aria-label="关闭引导">
            <X className="size-3.5" />
          </button>
        </div>
      )}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-3">
      <Button variant="ghost" size="icon" className="size-8" title="返回首页" onClick={() => { save(); setView('home'); }}>
        <ArrowLeft className="size-4" />
      </Button>

      <input
        defaultValue={project.name}
        key={project.id + project.name}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v && v !== project.name) renameProject(project.id, v);
        }}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="w-36 rounded-lg px-2 py-1.5 text-sm font-bold outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
        aria-label="项目名称"
      />

      <span className="hidden h-5 w-px bg-zinc-200 md:block" />

      {/* 页面标签（可拖拽排序，右键管理） */}
      <div className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex thin-scroll">
        {pages.map((p, idx) => {
          const dragging = dragPageId === p.id;
          const showLeftBar = dragging === false && dropIndex === idx;
          const showRightBar = dragging === false && dropIndex === idx + 1;
          return (
            <ContextMenu key={p.id}>
              <ContextMenuTrigger asChild>
                <button
                  draggable
                  onDragStart={(e) => {
                    setDragPageId(p.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', `appcraft-page:${p.id}`);
                  }}
                  onDragEnd={() => { setDragPageId(null); setDropIndex(null); }}
                  onDragOver={(e) => {
                    if (!dragPageId || dragPageId === p.id) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    const rect = e.currentTarget.getBoundingClientRect();
                    const before = e.clientX < rect.left + rect.width / 2;
                    setDropIndex(before ? idx : idx + 1);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragPageId && dropIndex !== null) {
                      movePage(dragPageId, dropIndex);
                      toast.success('页面顺序已调整');
                    }
                    setDragPageId(null);
                    setDropIndex(null);
                  }}
                  onClick={() => setCurrentPage(p.id)}
                  onDoubleClick={() => setRenaming({ id: p.id, name: p.name })}
                  title={`${p.name} · 拖拽调整顺序 · 双击重命名`}
                  className={`relative flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
                    p.id === currentPageId
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:bg-zinc-100'
                  } ${dragging ? 'opacity-40' : ''}`}
                >
                  {/* 拖拽排序插入位置指示条 */}
                  {(showLeftBar || showRightBar) && (
                    <span
                      aria-hidden
                      className="absolute inset-y-0.5 w-0.5 rounded-full bg-orange-500"
                      style={showLeftBar ? { left: -2.5 } : { right: -2.5 }}
                    />
                  )}
                  <GripVertical className={`size-3 shrink-0 ${p.id === currentPageId ? 'text-white/40' : 'text-zinc-300'}`} />
                  {p.isHome && <Home className={`size-3 ${p.id === currentPageId ? 'text-amber-400' : 'text-amber-500'}`} />}
                  {p.name}
                  <span className={`rounded-full px-1.5 text-[9px] ${p.id === currentPageId ? 'bg-white/20' : 'bg-zinc-200'}`}>
                    {p.components.length}
                  </span>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => setRenaming({ id: p.id, name: p.name })}>
                  <Pencil className="mr-1.5 size-3.5" /> 重命名
                </ContextMenuItem>
                <ContextMenuItem onClick={() => { duplicatePage(p.id); toast.success('已复制页面'); }}>
                  <Copy className="mr-1.5 size-3.5" /> 创建副本
                </ContextMenuItem>
                <ContextMenuItem
                  disabled={p.isHome}
                  onClick={() => { setHomePage(p.id); toast.success(`已将「${p.name}」设为主页`, { description: 'App 启动时将首先打开这个页面' }); }}
                >
                  <Home className="mr-1.5 size-3.5 text-amber-500" /> 设为主页
                </ContextMenuItem>
                <ContextMenuItem
                  disabled={p.components.length === 0}
                  onClick={() => setPagePreset({ id: p.id, name: p.name })}
                >
                  <LayoutTemplate className="mr-1.5 size-3.5 text-violet-500" /> 存为页面模板
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  disabled={p.isHome || pages.length <= 1}
                  className="text-rose-500 focus:text-rose-600"
                  onClick={() => { removePage(p.id); toast('页面已删除'); }}
                >
                  <Trash2 className="mr-1.5 size-3.5" /> 删除页面
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
        {/* 新增页面：空白 / 从模板 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0" title="新增页面（空白 / 从模板）">
              <Plus className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => { addPage(); toast.success('已新增页面'); }}>
              <FilePlus2 className="mr-1.5 size-3.5" /> 空白页面
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={pagePresets.length === 0}
              onClick={() => setTemplateOpen(true)}
            >
              <LayoutTemplate className="mr-1.5 size-3.5 text-violet-500" />
              从模板新建…
              {pagePresets.length > 0 && (
                <span className="ml-auto rounded bg-violet-100 px-1.5 text-[10px] font-bold text-violet-600">
                  {pagePresets.length}
                </span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 页面管理器：集中添加/命名/排序/主页/连接统计 */}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          title="页面管理：添加 / 命名 / 排序 / 主页 / 连接统计"
          onClick={() => setManagerOpen(true)}
        >
          <FolderTree className="size-4" />
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1 md:flex-none">
        {/* 撤销 / 重做 */}
        <Button variant="ghost" size="icon" className="size-8" disabled={pastLen === 0} onClick={undo} title="撤销 Ctrl+Z">
          <Undo2 className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8" disabled={futureLen === 0} onClick={redo} title="重做 Ctrl+Shift+Z">
          <Redo2 className="size-4" />
        </Button>

        {/* 更多：导出 / 导入 / 快捷键 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" title="更多">
              <Ellipsis className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={exporting} onClick={() => { void handleExportHtml(); }}>
              {exporting ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <FileCode2 className="mr-1.5 size-3.5" />}
              导出 HTML App
              <span className="ml-1 rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-600">推荐</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { exportProject(); toast.success('已导出 JSON 文件'); }}>
              <Download className="mr-1.5 size-3.5" /> 导出项目 JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1.5 size-3.5" /> 导入项目 JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setHelpOpen(true)}>
              <Keyboard className="mr-1.5 size-3.5" /> 快捷键说明
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImportFile(f);
            e.target.value = '';
          }}
        />

        {/* 保存状态 */}
        <button
          className="mr-1 hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold sm:flex"
          onClick={() => save().then((ok) => ok && toast.success('已保存'))}
          title="点击立即保存"
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin text-zinc-400" />
          ) : dirty ? (
            <span className="size-1.5 rounded-full bg-amber-500" />
          ) : (
            <Save className="size-3.5 text-emerald-500" />
          )}
          <span className={dirty ? 'text-amber-600' : 'text-zinc-400'}>{savedLabel}</span>
        </button>

        <Button variant="outline" size="sm" className="hidden border-violet-200 text-violet-600 hover:bg-violet-50 hover:text-violet-700 sm:flex" onClick={() => setView('canvas')} title="无限画布：画板内直接添加/编辑内容、拖拽连线">
          <GitBranch className="size-4" /> 无限画布
        </Button>
        <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => setTabOpen(true)} title="App 级底部导航：每个图标绑定一整页">
          <PanelBottom className="size-4" />
          {tabs.length > 0 && (
            <span className="rounded-full bg-violet-100 px-1.5 text-[10px] font-bold text-violet-600">{tabs.length}</span>
          )}
        </Button>
        <Button variant="outline" size="sm" className="hidden border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 sm:flex" onClick={() => setPublishOpen(true)}>
          <Crown className="size-4" /> 上架
        </Button>
        <Button size="sm" onClick={() => setView('preview')}>
          <Play className="size-4" /> 预览
        </Button>
      </div>

      {/* 页面管理器 */}
      <PageManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />

      {/* 底部导航（TabBar）管理 */}
      <TabManagerDialog open={tabOpen} onOpenChange={setTabOpen} />

      {/* 重命名对话框 */}
      <Dialog open={!!renaming} onOpenChange={(b) => !b && setRenaming(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>重命名页面</DialogTitle>
          </DialogHeader>
          <Input
            value={renaming?.name ?? ''}
            onChange={(e) => setRenaming((r) => (r ? { ...r, name: e.target.value } : r))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renaming) {
                updatePage(renaming.id, { name: renaming.name.trim() || renaming.name });
                setRenaming(null);
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenaming(null)}>取消</Button>
            <Button
              onClick={() => {
                if (renaming) updatePage(renaming.id, { name: renaming.name.trim() || renaming.name });
                setRenaming(null);
                toast.success('已重命名');
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 从模板新建页面 */}
      <PageTemplateDialog open={templateOpen} onOpenChange={setTemplateOpen} />

      {/* 存为页面模板（key 保证每次打开重置表单） */}
      {pagePreset && (
        <SavePagePresetDialog
          key={pagePreset.id + pagePreset.name}
          open
          onOpenChange={(b) => !b && setPagePreset(null)}
          pageId={pagePreset.id}
          defaultName={pagePreset.name}
        />
      )}

      {/* 快捷键说明 */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="size-4" /> 快捷键与操作技巧
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-1">
            {SHORTCUTS.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg border bg-zinc-50 px-3 py-2">
                <span className="text-xs text-zinc-500">{v}</span>
                <kbd className="rounded-md border bg-white px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 shadow-sm">{k}</kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
    </>
  );
}
