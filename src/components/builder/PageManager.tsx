'use client';

import { useState } from 'react';
import {
  Plus, Pencil, Copy, Trash2, Home, ArrowUp, ArrowDown, LayoutTemplate,
  FolderTree, Check, X, LayoutGrid, Rows3, GitBranch, MousePointerClick,
  ArrowRight, ArrowLeft,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { getWidget } from '@/components/widgets/registry';
import { PageTemplateDialog } from './PresetMarket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ANIM_OPTS } from '@/lib/types';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * 页面管理器：集中管理所有页面
 * 添加（空白/模板）/ 行内重命名 / 上下排序 / 设为主页 / 副本 / 删除（含连接统计与删除确认）
 */
export function PageManagerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const pages = useBuilder((s) => s.pages);
  const connections = useBuilder((s) => s.connections);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const setCurrentPage = useBuilder((s) => s.setCurrentPage);
  const addPage = useBuilder((s) => s.addPage);
  const updatePage = useBuilder((s) => s.updatePage);
  const movePage = useBuilder((s) => s.movePage);
  const setHomePage = useBuilder((s) => s.setHomePage);
  const duplicatePage = useBuilder((s) => s.duplicatePage);
  const removePage = useBuilder((s) => s.removePage);

  const allPresets = useBuilder((s) => s.presets);
  const pagePresetCount = allPresets.filter((p) => (p.kind ?? 'combo') === 'page').length;

  /** 行内重命名状态 */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  /** 待确认删除的页面 */
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  /** 展开连接明细的页面 id */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);

  const homePage = pages.find((p) => p.isHome);
  const deleteTarget = pages.find((p) => p.id === pendingDelete);
  const deleteOutgoing = pendingDelete ? connections.filter((c) => c.fromPageId === pendingDelete).length : 0;
  const deleteIncoming = pendingDelete ? connections.filter((c) => c.toPageId === pendingDelete).length : 0;

  const commitRename = () => {
    if (editingId && editingName.trim()) {
      updatePage(editingId, { name: editingName.trim() });
      toast.success('已重命名');
    }
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="size-4 text-violet-500" /> 页面管理
          </DialogTitle>
          <DialogDescription>
            添加页面、命名、调整顺序、设置启动主页，并查看页面间的跳转连接
          </DialogDescription>
        </DialogHeader>

        {/* 统计条 */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1 font-semibold">
            <LayoutGrid className="size-3.5 text-zinc-400" /> {pages.length} 个页面
          </span>
          <span className="h-3 w-px bg-zinc-200" />
          <span className="flex items-center gap-1 font-semibold">
            <GitBranch className="size-3.5 text-violet-400" /> {connections.length} 条连接
          </span>
          <span className="h-3 w-px bg-zinc-200" />
          <span className="flex min-w-0 items-center gap-1">
            <Home className="size-3.5 shrink-0 text-amber-500" />
            <span className="truncate">启动页：{homePage?.name ?? '—'}</span>
          </span>
        </div>

        {/* 页面列表 */}
        <div className="thin-scroll max-h-96 space-y-2 overflow-y-auto pr-1">
          {pages.map((p, idx) => {
            const pageConns = connections.filter((c) => c.fromPageId === p.id || c.toPageId === p.id);
            const outgoing = pageConns.filter((c) => c.fromPageId === p.id).length;
            const incoming = pageConns.filter((c) => c.toPageId === p.id).length;
            const isEditing = editingId === p.id;
            const isCurrent = p.id === currentPageId;
            return (
              <div
                key={p.id}
                className={`group/row rounded-xl border p-3 transition-colors ${
                  isCurrent ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* 序号 */}
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[11px] font-bold text-zinc-500">
                    {idx + 1}
                  </span>

                  {/* 名称（行内编辑） */}
                  {isEditing ? (
                    <div className="flex min-w-0 flex-1 items-center gap-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="h-8 text-xs"
                        autoFocus
                        aria-label="页面名称"
                      />
                      <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={commitRename} title="保存（Enter）">
                        <Check className="size-3.5 text-emerald-500" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={() => setEditingId(null)} title="取消（Esc）">
                        <X className="size-3.5 text-zinc-400" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="min-w-0 flex-1 truncate text-left text-sm font-bold hover:underline"
                      title="双击进入编辑该页面"
                      onDoubleClick={() => { setCurrentPage(p.id); onOpenChange(false); }}
                      onClick={() => setCurrentPage(p.id)}
                    >
                      {p.name}
                    </button>
                  )}

                  {/* 徽章区 */}
                  {!isEditing && (
                    <div className="flex shrink-0 items-center gap-1">
                      {p.isHome && (
                        <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">
                          <Home className="size-2.5" /> 主页
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-500">
                        {p.layout === 'free' ? <LayoutGrid className="size-2.5" /> : <Rows3 className="size-2.5" />}
                        {p.layout === 'free' ? '自由' : '流式'}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-500">
                        {p.components.length} 组件
                      </span>
                      {outgoing + incoming > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold transition-colors ${
                            expandedId === p.id ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                          }`}
                          title="点击查看连接明细（谁指向本页 / 本页指向谁）"
                        >
                          <MousePointerClick className="size-2.5" />
                          {[
                            outgoing > 0 ? `出 ${outgoing}` : '',
                            incoming > 0 ? `入 ${incoming}` : '',
                          ].filter(Boolean).join(' · ')}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 操作区 */}
                {!isEditing && (
                  <div className="mt-2 flex items-center gap-1 border-t pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-zinc-500"
                      disabled={isEditing}
                      onClick={() => { setEditingId(p.id); setEditingName(p.name); }}
                    >
                      <Pencil className="size-3" /> 重命名
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-1.5 text-[11px] text-zinc-500"
                      disabled={idx === 0}
                      onClick={() => { movePage(p.id, idx - 1); }}
                      title="上移"
                    >
                      <ArrowUp className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-1.5 text-[11px] text-zinc-500"
                      disabled={idx === pages.length - 1}
                      onClick={() => { movePage(p.id, idx + 2); }}
                      title="下移"
                    >
                      <ArrowDown className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-amber-600 hover:text-amber-700"
                      disabled={p.isHome}
                      onClick={() => {
                        setHomePage(p.id);
                        toast.success(`已将「${p.name}」设为启动主页`, { description: 'App 启动时首先打开这个页面' });
                      }}
                      title={p.isHome ? '已是主页' : '设为启动主页'}
                    >
                      <Home className="size-3" /> 主页
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-zinc-500"
                      onClick={() => { duplicatePage(p.id); toast.success('已复制页面'); }}
                    >
                      <Copy className="size-3" /> 副本
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-7 px-2 text-[11px] text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      disabled={p.isHome || pages.length <= 1}
                      onClick={() => setPendingDelete(p.id)}
                      title={p.isHome ? '主页不可删除' : '删除页面'}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                )}

                {/* 连接明细：直观呈现「一个页面可以被多个触发组件指向」（多对一） */}
                {expandedId === p.id && (
                  <div className="mt-2 space-y-1 rounded-lg bg-violet-50/70 p-2">
                    <p className="px-1 text-[10px] font-bold text-violet-700">
                      连接明细 · {pageConns.length} 条（多个入口可指向同一页面）
                    </p>
                    {pageConns.length === 0 && (
                      <p className="px-1 py-0.5 text-[10px] text-zinc-400">本页还没有跳转连接</p>
                    )}
                    {pageConns.map((c) => {
                      const isOut = c.fromPageId === p.id;
                      const otherId = isOut ? c.toPageId : c.fromPageId;
                      const other = pages.find((q) => q.id === otherId);
                      const srcPage = pages.find((q) => q.id === c.fromPageId);
                      const srcWidget = srcPage?.components.find((x) => x.id === c.fromWidgetId);
                      const wd = srcWidget ? getWidget(srcWidget.type) : null;
                      const slotLabel =
                        c.slot && wd
                          ? wd.slots?.({ ...wd.defaultProps, ...srcWidget?.props })?.find((s) => s.key === c.slot)?.label ?? `槽位 ${c.slot}`
                          : null;
                      const animLabel = ANIM_OPTS.find((a) => a.value === c.animation)?.label ?? c.animation;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[10px] transition-colors hover:bg-white"
                          onClick={() => { setCurrentPage(otherId); onOpenChange(false); }}
                          title={`点击打开「${other?.name ?? '未知页面'}」`}
                        >
                          {isOut ? (
                            <ArrowRight className="size-3 shrink-0 text-violet-500" />
                          ) : (
                            <ArrowLeft className="size-3 shrink-0 text-emerald-500" />
                          )}
                          <span className="shrink-0 font-semibold text-zinc-700">
                            {isOut
                              ? `「${wd?.name ?? '未知组件'}」${slotLabel ? `（${slotLabel}）` : ''}`
                              : `「${srcPage?.name ?? '?'}」·「${wd?.name ?? '未知组件'}」${slotLabel ? `（${slotLabel}）` : ''}`}
                          </span>
                          <span className="min-w-0 truncate text-zinc-500">
                            {isOut ? '→' : '→ 本页'}「{other?.name ?? '未知页面'}」
                          </span>
                          <span className="ml-auto shrink-0 rounded bg-white px-1 text-[9px] text-zinc-400">{animLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 底部：添加页面 */}
        <DialogFooter className="flex-row items-center gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { addPage(); toast.success('已新增页面，可在列表中重命名'); }}
            >
              <Plus className="size-4" /> 空白页面
            </Button>
            <Button variant="outline" size="sm" disabled={pagePresetCount === 0} onClick={() => setTemplateOpen(true)}>
              <LayoutTemplate className="size-4 text-violet-500" /> 从模板新建
              {pagePresetCount > 0 && (
                <span className="ml-1 rounded bg-violet-100 px-1.5 text-[10px] font-bold text-violet-600">{pagePresetCount}</span>
              )}
            </Button>
          </div>
          <Button size="sm" onClick={() => onOpenChange(false)}>完成</Button>
        </DialogFooter>
      </DialogContent>

      {/* 从模板新建页面 */}
      <PageTemplateDialog open={templateOpen} onOpenChange={setTemplateOpen} />

      {/* 删除确认（提示将一并删除的连接数） */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(b) => !b && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除页面「{deleteTarget?.name}」？</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteOutgoing + deleteIncoming > 0
                ? `将同时删除与该页面相关的 ${deleteOutgoing + deleteIncoming} 条跳转连接（出 ${deleteOutgoing} / 入 ${deleteIncoming}），此操作可通过撤销恢复。`
                : '该页面没有跳转连接，删除后可通过撤销恢复。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600"
              onClick={() => {
                if (pendingDelete) {
                  removePage(pendingDelete);
                  toast('页面已删除', { description: 'Ctrl+Z 可撤销' });
                }
                setPendingDelete(null);
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
