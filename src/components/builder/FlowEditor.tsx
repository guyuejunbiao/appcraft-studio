'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Home, Plus, Pencil, Wand2, Trash2, GitBranch, MousePointerClick, Layers3,
  FolderTree, MoveRight,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { getWidget } from '@/components/widgets/registry';
import { PageManagerDialog } from './PageManager';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { PageData, AnimKind, ConnectionData } from '@/lib/types';
import { ANIM_OPTS } from '@/lib/types';
import { toast } from 'sonner';

const NODE_W = 208;
const NODE_H = 132;

/** 新建/编辑连接对话框：editConn 给定为编辑模式（触发页锁定），否则新建（无限画布复用） */
export function ConnectionDialog({
  open,
  onOpenChange,
  editConn,
  prefill,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editConn: ConnectionData | null;
  /** 拖拽连线预填：源页 + 目标页 */
  prefill: { fromPageId: string; toPageId?: string } | null;
}) {
  const pages = useBuilder((s) => s.pages);
  const addConnection = useBuilder((s) => s.addConnection);
  const updateConnection = useBuilder((s) => s.updateConnection);

  const fromPageId = editConn?.fromPageId ?? prefill?.fromPageId ?? '';
  const [fromWidget, setFromWidget] = useState('');
  const [toPage, setToPage] = useState('');
  const [anim, setAnim] = useState('slide');
  /** 编辑时是否改了触发组件（组件变了，槽位绑定随之失效需清除） */
  const widgetChanged = editConn ? fromWidget !== editConn.fromWidgetId : false;

  const isEdit = !!editConn;
  /* 每次打开时用 editConn / prefill 重置表单（key 由父组件保证重挂载，此 effect 兜底） */
  const [lastKey, setLastKey] = useState('');
  const openKey = `${open}|${editConn?.id ?? ''}|${prefill?.fromPageId ?? ''}|${prefill?.toPageId ?? ''}`;
  if (open && openKey !== lastKey) {
    setLastKey(openKey);
    setFromWidget(editConn?.fromWidgetId ?? '');
    setToPage(editConn?.toPageId ?? prefill?.toPageId ?? '');
    setAnim(editConn?.animation ?? 'slide');
  }
  if (!open && lastKey !== '') setLastKey('');

  const fromPage = pages.find((p) => p.id === fromPageId);
  const widgets = fromPage?.components ?? [];
  const targets = pages.filter((p) => p.id !== fromPageId);
  const valid = fromPageId && fromWidget && toPage;

  const close = (b: boolean) => {
    onOpenChange(b);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="size-4 text-violet-500" />
            {isEdit ? '编辑页面连接' : '新建页面连接'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `调整「${fromPage?.name ?? ''}」里这个组件的跳转目标或转场动画`
              : '选择触发页面与组件，绑定点击跳转的目标页面'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-zinc-500">触发页面</p>
            <Select value={fromPageId} disabled>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="选择页面" /></SelectTrigger>
              <SelectContent>
                {pages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isEdit && (
              <p className="mt-1 text-[10px] text-zinc-400">新建连接请从流程图节点右侧圆点拖到目标页面，或用组件右键「跳转绑定」</p>
            )}
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-zinc-500">触发组件（点击后跳转）</p>
            <Select value={fromWidget} onValueChange={setFromWidget}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={fromPageId ? '选择组件' : '先选择页面'} /></SelectTrigger>
              <SelectContent>
                {widgets.map((w) => {
                  const def = getWidget(w.type);
                  return (
                    <SelectItem key={w.id} value={w.id}>{def?.name ?? w.type}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-zinc-500">目标页面</p>
            <Select value={toPage} onValueChange={setToPage}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="选择目标页面" /></SelectTrigger>
              <SelectContent>
                {targets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.isHome ? '（主页）' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-zinc-500">转场动画</p>
            <Select value={anim} onValueChange={setAnim}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ANIM_OPTS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[10px] text-amber-600">
              {ANIM_OPTS.find((a) => a.value === anim)?.desc}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>取消</Button>
          <Button
            disabled={!valid}
            onClick={() => {
              if (isEdit && editConn) {
                updateConnection(editConn.id, {
                  fromWidgetId: fromWidget,
                  toPageId: toPage,
                  animation: anim as AnimKind,
                  /* 触发组件变了，槽位绑定（tabbar 标签 N）不再成立 */
                  ...(widgetChanged ? { slot: undefined } : {}),
                });
                toast.success('连接已更新');
              } else {
                addConnection({
                  fromPageId,
                  fromWidgetId: fromWidget,
                  toPageId: toPage,
                  animation: anim as AnimKind,
                });
                toast.success('连接已建立');
              }
              close(false);
            }}
          >
            <GitBranch className="mr-1 size-4" /> {isEdit ? '保存修改' : '建立连接'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 页面流程图：节点可拖拽、连线可视化、拖拽连线 / 点击编辑连接 */
export function FlowEditor() {
  const pages = useBuilder((s) => s.pages);
  const connections = useBuilder((s) => s.connections);
  const project = useBuilder((s) => s.project);
  const setView = useBuilder((s) => s.setView);
  const setCurrentPage = useBuilder((s) => s.setCurrentPage);
  const addPage = useBuilder((s) => s.addPage);
  const setFlowPos = useBuilder((s) => s.setFlowPos);
  const removeConnection = useBuilder((s) => s.removeConnection);

  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  /** 正在拖拽的连线：源页固定，坐标跟随指针（内容坐标系） */
  const [linkDrag, setLinkDrag] = useState<{ fromPageId: string; fx: number; fy: number; x: number; y: number } | null>(null);
  /** 新建连接对话框（拖拽落点预填） */
  const [createPrefill, setCreatePrefill] = useState<{ fromPageId: string; toPageId?: string } | null>(null);
  /** 编辑中的连接 */
  const [editing, setEditing] = useState<ConnectionData | null>(null);
  /** 页面管理器 */
  const [managerOpen, setManagerOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const positions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    pages.forEach((p, i) => {
      map[p.id] = {
        x: p.flowX ?? 80 + (i % 3) * 340,
        y: p.flowY ?? 80 + Math.floor(i / 3) * 280,
      };
    });
    return map;
  }, [pages]);

  /** 拖拽连线时指针悬停命中的目标页（高亮提示） */
  const hoverTarget = useMemo(() => {
    if (!linkDrag) return null;
    const { x, y, fromPageId } = linkDrag;
    const hit = pages.find((p) => {
      if (p.id === fromPageId) return false;
      const pos = positions[p.id];
      return x >= pos.x - 4 && x <= pos.x + NODE_W + 4 && y >= pos.y - 4 && y <= pos.y + NODE_H + 4;
    });
    return hit?.id ?? null;
  }, [linkDrag, pages, positions]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (drag) {
      const board = boardRef.current?.getBoundingClientRect();
      if (!board) return;
      setFlowPos(drag.id, e.clientX - board.left - drag.dx, e.clientY - board.top - drag.dy);
      return;
    }
    /* 兜底：未启用指针捕获时（触屏外）也跟随更新连线 */
    if (linkDrag) {
      const rect = contentRef.current?.getBoundingClientRect();
      if (!rect) return;
      setLinkDrag((d) => (d ? { ...d, x: e.clientX - rect.left, y: e.clientY - rect.top } : d));
    }
  };

  /** 结束拖拽连线：命中目标页则弹出预填对话框 */
  const finishLink = (e: React.PointerEvent) => {
    if (!linkDrag) return;
    const rect = contentRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left ?? 0);
    const y = e.clientY - (rect?.top ?? 0);
    const target = pages.find((p) => {
      if (p.id === linkDrag.fromPageId) return false;
      const pos = positions[p.id];
      return x >= pos.x - 4 && x <= pos.x + NODE_W + 4 && y >= pos.y - 4 && y <= pos.y + NODE_H + 4;
    });
    setLinkDrag(null);
    if (target) setCreatePrefill({ fromPageId: linkDrag.fromPageId, toPageId: target.id });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef0f4]">
      {/* 顶栏 */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-white px-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setView('editor')} title="返回编辑器">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500 text-white">
            <GitBranch className="size-4" />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-4">页面流程图</h1>
            <p className="text-[10px] text-zinc-400">拖动节点排布 · 从节点圆点拖到目标页连线 · 点击连线可编辑</p>
          </div>
        </div>

        <span className="ml-2 hidden items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-500 sm:flex">
          <MousePointerClick className="size-3.5" /> {connections.length} 条连接
        </span>
        <span className="hidden items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-500 sm:flex">
          <Layers3 className="size-3.5" /> {pages.length} 个页面
        </span>
        <span className="hidden text-[11px] text-zinc-400 lg:block">{project?.name}</span>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              pages.forEach((p, i) => {
                setFlowPos(p.id, 80 + (i % 3) * 340, 80 + Math.floor(i / 3) * 280);
              });
            }}
          >
            <Wand2 className="size-4" /> 自动布局
          </Button>
          <Button variant="outline" size="sm" onClick={() => setManagerOpen(true)} title="页面管理：添加 / 命名 / 排序 / 主页 / 连接统计">
            <FolderTree className="size-4" /> <span className="hidden sm:inline">页面管理</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => addPage()}>
            <Plus className="size-4" /> 页面
          </Button>
          <Button size="sm" onClick={() => setCreatePrefill({ fromPageId: pages[0]?.id ?? '' })} disabled={pages.length < 2}>
            <Plus className="size-4" /> 新建连接
          </Button>
        </div>
      </header>

      {/* 画板 */}
      <div
        ref={boardRef}
        className="relative min-h-0 flex-1 overflow-auto bg-dot thin-scroll"
        onPointerMove={onPointerMove}
        onPointerUp={finishLink}
        onPointerLeave={() => { setDrag(null); setLinkDrag(null); }}
      >
        <div
          ref={contentRef}
          className={`relative ${linkDrag ? 'cursor-crosshair select-none' : ''}`}
          style={{ width: 2000, height: 1200 }}
        >
          {/* 连线 */}
          <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
            <defs>
              <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
              </marker>
              <marker id="flow-arrow-orange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
              </marker>
            </defs>
            {connections.map((c) => {
              const from = positions[c.fromPageId];
              const to = positions[c.toPageId];
              if (!from || !to) return null;
              const sx = from.x + NODE_W;
              const sy = from.y + 46;
              const tx = to.x;
              const ty = to.y + 46;
              const dx = Math.max(46, Math.abs(tx - sx) * 0.45);
              return (
                <g key={c.id}>
                  <path
                    d={`M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx - 8} ${ty}`}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    markerEnd="url(#flow-arrow)"
                    strokeDasharray={c.animation === 'none' ? '6 4' : undefined}
                  />
                </g>
              );
            })}
            {/* 拖拽连线预览（虚线橙色） */}
            {linkDrag && (
              <path
                d={`M ${linkDrag.fx} ${linkDrag.fy} C ${linkDrag.fx + 60} ${linkDrag.fy}, ${Math.max(linkDrag.fx + 20, linkDrag.x - 60)} ${linkDrag.y}, ${linkDrag.x} ${linkDrag.y}`}
                fill="none"
                stroke="#f97316"
                strokeWidth={2.5}
                strokeDasharray="7 5"
                markerEnd="url(#flow-arrow-orange)"
              />
            )}
          </svg>

          {/* 连线标签（可点击编辑） */}
          {connections.map((c) => {
            const from = positions[c.fromPageId];
            const to = positions[c.toPageId];
            if (!from || !to) return null;
            const widget = pages
              .find((p) => p.id === c.fromPageId)
              ?.components.find((w) => w.id === c.fromWidgetId);
            const widgetName = widget ? getWidget(widget.type)?.name ?? widget.type : '未知组件';
            const animLabel = ANIM_OPTS.find((a) => a.value === c.animation)?.label ?? c.animation;
            const target = pages.find((p) => p.id === c.toPageId);
            return (
              <div
                key={`label-${c.id}`}
                className="group absolute z-20 flex -translate-x-1/2 -translate-y-full cursor-pointer items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-[10px] font-semibold shadow-md transition-shadow hover:shadow-lg hover:ring-2 hover:ring-violet-200"
                style={{ left: (from.x + NODE_W + to.x) / 2, top: (from.y + to.y) / 2 + 46 - 8 }}
                onClick={() => setEditing(c)}
                role="button"
                title="点击编辑这条连接"
                aria-label={`连接：${widgetName} 跳转到 ${target?.name}，点击编辑`}
              >
                <span className="text-violet-500">{widgetName}</span>
                <MoveRight className="size-3 text-zinc-300" />
                <span>{target?.name}</span>
                <span className="rounded bg-zinc-100 px-1 text-[9px] text-zinc-400">{animLabel}</span>
                <span className="hidden items-center group-hover:flex" aria-hidden>
                  <Pencil className="size-3 text-zinc-400" />
                </span>
                <button
                  className="text-zinc-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); removeConnection(c.id); }}
                  title="删除连接"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })}

          {/* 页面节点 */}
          {pages.map((p: PageData) => {
            const isHoverTarget = hoverTarget === p.id;
            return (
              <div
                key={p.id}
                className={`group/node absolute select-none rounded-2xl border-2 bg-white shadow-lg transition-shadow ${
                  p.isHome ? 'border-amber-400' : 'border-white'
                } ${drag?.id === p.id ? 'shadow-2xl' : 'hover:shadow-xl'} ${
                  isHoverTarget ? 'ring-4 ring-orange-400/60 border-orange-400' : ''
                }`}
                style={{ left: positions[p.id].x, top: positions[p.id].y, width: NODE_W, height: NODE_H }}
                onPointerDown={(e) => {
                  /* 连线拖拽中忽略节点拖拽 */
                  if (linkDrag) return;
                  const board = boardRef.current?.getBoundingClientRect();
                  if (!board) return;
                  setDrag({
                    id: p.id,
                    dx: e.clientX - board.left - positions[p.id].x,
                    dy: e.clientY - board.top - positions[p.id].y,
                  });
                }}
                onDoubleClick={() => {
                  setCurrentPage(p.id);
                  setView('editor');
                }}
                role="button"
                aria-label={`页面 ${p.name}，双击进入编辑`}
              >
                <div className="flex items-center gap-1.5 border-b bg-zinc-50/80 px-3 py-2.5 rounded-t-2xl">
                  {p.isHome && <Home className="size-3.5 text-amber-500" />}
                  <span className="min-w-0 flex-1 truncate text-xs font-bold">{p.name}</span>
                  <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[9px] text-zinc-500">{p.components.length} 组件</span>
                </div>
                <div className="space-y-1 px-3 py-2">
                  {p.components.slice(0, 3).map((w) => {
                    const def = getWidget(w.type);
                    return (
                      <div key={w.id} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                        {def ? <def.icon className="size-3 shrink-0 text-zinc-400" /> : <span className="size-3" />}
                        <span className="truncate">{def?.name ?? w.type}</span>
                      </div>
                    );
                  })}
                  {p.components.length > 3 && (
                    <p className="text-[10px] text-zinc-300">…还有 {p.components.length - 3} 个组件</p>
                  )}
                  {p.components.length === 0 && <p className="text-[10px] text-zinc-300">空页面</p>}
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <button
                    className="flex size-6 items-center justify-center rounded-md border text-zinc-500 hover:bg-zinc-900 hover:text-white"
                    title="编辑此页面"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(p.id);
                      setView('editor');
                    }}
                  >
                    <Pencil className="size-3" />
                  </button>
                </div>

                {/* 连线起点（拖到目标页建立连接） */}
                <button
                  aria-label={`从「${p.name}」拖出连线`}
                  title="按住拖到目标页面建立跳转连接"
                  className={`absolute -right-3 top-1/2 z-30 flex size-6 -translate-y-1/2 cursor-crosshair items-center justify-center rounded-full border-2 border-white bg-violet-500 text-white shadow-md transition-all hover:scale-125 hover:bg-violet-600 ${
                    linkDrag?.fromPageId === p.id ? 'scale-125 opacity-100' : 'opacity-0 group-hover/node:opacity-100'
                  }`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    /* 指针捕获：移出按钮/画板也能持续收到 move/up（合成事件无活动指针时忽略） */
                    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
                    const pos = positions[p.id];
                    setLinkDrag({ fromPageId: p.id, fx: pos.x + NODE_W, fy: pos.y + NODE_H / 2, x: pos.x + NODE_W, y: pos.y + NODE_H / 2 });
                  }}
                  onPointerMove={(e) => {
                    if (linkDrag?.fromPageId !== p.id) return;
                    const rect = contentRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setLinkDrag((d) => (d ? { ...d, x: e.clientX - rect.left, y: e.clientY - rect.top } : d));
                  }}
                  onPointerUp={(e) => {
                    if (linkDrag?.fromPageId !== p.id) return;
                    finishLink(e);
                  }}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            );
          })}

          {pages.length === 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-zinc-400">
              <GitBranch className="mx-auto mb-2 size-10" />
              <p className="text-sm">还没有页面，点击右上角新增</p>
            </div>
          )}
        </div>
      </div>

      {/* 新建（可预填）/ 编辑连接 共用对话框 */}
      {(createPrefill || editing) && (
        <ConnectionDialog
          key={`${editing?.id ?? 'new'}|${createPrefill?.fromPageId ?? ''}|${createPrefill?.toPageId ?? ''}`}
          open
          onOpenChange={(b) => {
            if (!b) { setCreatePrefill(null); setEditing(null); }
          }}
          editConn={editing}
          prefill={createPrefill}
        />
      )}

      <PageManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />
    </div>
  );
}
