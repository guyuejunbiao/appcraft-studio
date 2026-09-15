'use client';

import { useState } from 'react';
import {
  Copy, CopyPlus, Pencil, Lock, LockOpen, EyeOff, Trash2, Link2,
  ArrowUpToLine, ArrowUp, ArrowDown, ArrowDownToLine,
  CornerDownRight, Home, Check, Boxes, Ungroup, Paintbrush, ClipboardPaste,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBuilder } from '@/lib/store';
import { getWidget } from '@/components/widgets/registry';
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuLabel, ContextMenuSub,
  ContextMenuSubTrigger, ContextMenuSubContent, ContextMenuShortcut,
} from '@/components/ui/context-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { WidgetInstance } from '@/lib/types';
import { ANIM_OPTS } from '@/lib/types';


interface WidgetContextMenuProps {
  widget: WidgetInstance;
  /** 布局模式：free 显示图层操作，flow 显示位置操作 */
  layout: 'free' | 'flow';
  children: React.ReactNode;
}

/**
 * 画布组件右键菜单：
 * - 添加跳转到…（整个组件 / tabbar 槽位级，目标页面二级子菜单）
 * - 已有跳转：点击移除
 * - 复制 / 副本 / 重命名 / 图层置顶底 / 锁定 / 隐藏 / 删除
 * 右键即选中组件，与点击行为一致。
 */
export function WidgetContextMenu({ widget, layout, children }: WidgetContextMenuProps) {
  const pages = useBuilder((s) => s.pages);
  const connections = useBuilder((s) => s.connections);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const selectedIds = useBuilder((s) => s.selectedIds);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const def = getWidget(widget.type);
  const page = pages.find((p) => p.id === currentPageId);
  const targets = pages.filter((p) => p.id !== currentPageId);
  const mergedProps = def ? { ...def.defaultProps, ...widget.props } : {};
  const slots = def?.slots?.(mergedProps) ?? [];
  const fromLinks = connections.filter(
    (c) => c.fromPageId === currentPageId && c.fromWidgetId === widget.id
  );

  if (!def || !page) return <>{children}</>;

  const pageName = (id: string) => pages.find((p) => p.id === id)?.name ?? '未知页面';
  const slotLabel = (key?: string) =>
    key ? (slots.find((s) => s.key === key)?.label ?? `标签 ${key}`) : null;

  /** 添加跳转：同组件同槽位替换旧绑定（一个按钮只有一个跳转行为） */
  const addLink = (toPageId: string, slot?: string) => {
    const existing = connections.find(
      (c) =>
        c.fromPageId === page.id &&
        c.fromWidgetId === widget.id &&
        (c.slot || undefined) === slot
    );
    useBuilder.getState().addConnection({
      fromPageId: page.id,
      fromWidgetId: widget.id,
      toPageId,
      animation: 'slide',
      slot,
    });
    const targetName = pageName(toPageId);
    const sLabel = slotLabel(slot);
    if (existing) {
      toast.success('跳转路径已更新', {
        description: `「${def.name}」${sLabel ? `的「${sLabel}」标签` : ''}现在跳转到「${targetName}」`,
      });
    } else {
      toast.success('跳转路径已添加', {
        description: `「${def.name}」${sLabel ? `的「${sLabel}」标签` : ''} → 「${targetName}」，预览中点击即可跳转`,
      });
    }
  };

  const removeLink = (id: string, label: string) => {
    useBuilder.getState().removeConnection(id);
    toast('已移除跳转路径', { description: label });
  };

  const openRename = () => {
    setRenameValue(widget.name ?? def.name);
    setRenameOpen(true);
  };

  const saveRename = () => {
    const v = renameValue.trim();
    useBuilder.getState().updateWidget(widget.id, { name: v || undefined });
    setRenameOpen(false);
    toast.success('已重命名', { description: v || def.name });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          asChild
          onContextMenu={() => {
            /* 右键即选中；组内成员则整组选中（不破坏已有整组多选） */
            const b = useBuilder.getState();
            if (b.selectedIds.length > 1 && b.selectedIds.includes(widget.id)) return;
            const members = b.groupMembersOf(widget.id);
            if (members) b.selectMany(members);
            else b.select(widget.id);
          }}
        >
          {children}
        </ContextMenuTrigger>

        <ContextMenuContent className="w-60">
          <ContextMenuLabel className="flex items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-zinc-900 text-white">
              <def.icon className="size-3" />
            </span>
            <span className="truncate">{def.name}</span>
            {fromLinks.length > 0 && (
              <span className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                <Link2 className="size-2.5" />
                {fromLinks.length} 跳转
              </span>
            )}
          </ContextMenuLabel>

          {/* 已有跳转路径：点击移除 */}
          {fromLinks.map((c) => {
            const sLabel = slotLabel(c.slot);
            return (
              <ContextMenuItem
                key={c.id}
                title="点击移除这条跳转路径"
                onClick={() =>
                  removeLink(
                    c.id,
                    `「${def.name}」${sLabel ? `「${sLabel}」标签` : ''} → 「${pageName(c.toPageId)}」`
                  )
                }
              >
                <CornerDownRight className="text-emerald-500" />
                <span className="truncate">→ {pageName(c.toPageId)}</span>
                {sLabel && (
                  <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-semibold text-emerald-600">
                    {sLabel}
                  </span>
                )}
                <ContextMenuShortcut>{ANIM_OPTS.find((a) => a.value === c.animation)?.label ?? c.animation}</ContextMenuShortcut>
              </ContextMenuItem>
            );
          })}

          {/* 添加跳转到… */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Link2 className="text-emerald-500" />
              <span className="text-emerald-600 font-semibold">添加跳转到…</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="max-h-80 w-48 overflow-y-auto thin-scroll">
              {targets.length === 0 ? (
                <ContextMenuLabel className="text-xs text-zinc-400">
                  当前只有一页，请先添加新页面
                </ContextMenuLabel>
              ) : slots.length > 0 ? (
                <>
                  <ContextMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-400">
                    整个组件（任意点击）
                  </ContextMenuLabel>
                  {targets.map((p) => (
                    <ContextMenuItem key={p.id} onClick={() => addLink(p.id)}>
                      {p.isHome ? <Home className="text-amber-500" /> : <span className="size-3.5" />}
                      <span className="truncate">{p.name}</span>
                    </ContextMenuItem>
                  ))}
                  <ContextMenuSeparator />
                  <ContextMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-400">
                    按标签绑定（槽位）
                  </ContextMenuLabel>
                  {slots.map((s) => (
                    <ContextMenuSub key={s.key}>
                      <ContextMenuSubTrigger className="text-xs">
                        <span className="truncate">{s.label}</span>
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="max-h-64 w-40 overflow-y-auto thin-scroll">
                        {targets.map((p) => (
                          <ContextMenuItem key={p.id} onClick={() => addLink(p.id, s.key)}>
                            <span className="truncate">{p.name}</span>
                          </ContextMenuItem>
                        ))}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                  ))}
                </>
              ) : (
                targets.map((p) => (
                  <ContextMenuItem key={p.id} onClick={() => addLink(p.id)}>
                    {p.isHome ? <Home className="text-amber-500" /> : <span className="size-3.5" />}
                    <span className="truncate">{p.name}</span>
                    {p.isHome && (
                      <span className="ml-auto rounded bg-amber-100 px-1 text-[9px] font-semibold text-amber-600">
                        主页
                      </span>
                    )}
                  </ContextMenuItem>
                ))
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => {
              useBuilder.getState().copyWidget(widget.id);
              toast('已复制组件', { description: 'Ctrl+V 粘贴（可跨页面）' });
            }}
          >
            <Copy /> 复制 <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={widget.locked}
            onClick={() => {
              useBuilder.getState().duplicateWidget(widget.id);
              toast('已创建副本');
            }}
          >
            <CopyPlus /> 创建副本 <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={openRename}>
            <Pencil /> 重命名…
          </ContextMenuItem>

          {/* 样式刷：复制外观 / 粘贴外观（透明度/阴影/边距/宽度对齐） */}
          <ContextMenuItem
            onClick={() => {
              if (useBuilder.getState().copyWidgetStyle(widget.id)) {
                window.dispatchEvent(new CustomEvent('appcraft-style-clip'));
                toast('已复制样式', { description: '透明度/阴影/边距/宽度对齐已入剪贴板，右键其它组件「粘贴样式」' });
              }
            }}
          >
            <Paintbrush /> 复制样式
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!useBuilder.getState().hasStyleClip() || widget.locked}
            onClick={() => {
              const n = useBuilder.getState().pasteWidgetStyle([widget.id]);
              if (n > 0) toast.success('已粘贴样式', { description: 'Ctrl+Z 可撤销；多选后可用批量工具条批量应用' });
            }}
          >
            <ClipboardPaste /> 粘贴样式
          </ContextMenuItem>

          {/* 编组：多选（≥2 且含自己）时可编组；已编组时可解组 */}
          {selectedIds.length >= 2 && selectedIds.includes(widget.id) && (
            <ContextMenuItem
              onClick={() => {
                const gid = useBuilder.getState().groupWidgets(selectedIds);
                if (gid) toast.success(`已编组 ${selectedIds.length} 个组件`);
              }}
            >
              <Boxes className="text-violet-500" /> 编组（{selectedIds.length} 个）
              <ContextMenuShortcut>Ctrl+G</ContextMenuShortcut>
            </ContextMenuItem>
          )}
          {widget.group && (
            <ContextMenuItem
              onClick={() => {
                const members = useBuilder.getState().groupMembersOf(widget.id) ?? [widget.id];
                useBuilder.getState().ungroupWidgets(members);
                toast('已解组');
              }}
            >
              <Ungroup className="text-violet-500" /> 解组
              <ContextMenuShortcut>Ctrl+Shift+G</ContextMenuShortcut>
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          {layout === 'free' ? (
            <>
              <ContextMenuItem onClick={() => useBuilder.getState().reorderWidget(widget.id, 'front')}>
                <ArrowUpToLine /> 置顶
              </ContextMenuItem>
              <ContextMenuItem onClick={() => useBuilder.getState().reorderWidget(widget.id, 'up')}>
                <ArrowUp /> 上移一层
              </ContextMenuItem>
              <ContextMenuItem onClick={() => useBuilder.getState().reorderWidget(widget.id, 'down')}>
                <ArrowDown /> 下移一层
              </ContextMenuItem>
              <ContextMenuItem onClick={() => useBuilder.getState().reorderWidget(widget.id, 'back')}>
                <ArrowDownToLine /> 置底
              </ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem onClick={() => useBuilder.getState().reorderWidget(widget.id, 'down')}>
                <ArrowUp /> 上移一格
              </ContextMenuItem>
              <ContextMenuItem onClick={() => useBuilder.getState().reorderWidget(widget.id, 'up')}>
                <ArrowDown /> 下移一格
              </ContextMenuItem>
            </>
          )}

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => {
              useBuilder.getState().updateWidget(widget.id, { locked: !widget.locked });
              toast(widget.locked ? '已解锁' : '已锁定', {
                description: widget.locked ? '组件恢复可拖动、缩放、删除' : '组件不可拖动/缩放/删除，可在图层或此处解锁',
              });
            }}
          >
            {widget.locked ? <LockOpen className="text-amber-500" /> : <Lock />} {widget.locked ? '解锁' : '锁定'}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              useBuilder.getState().updateWidget(widget.id, { hidden: true });
              toast('组件已隐藏', { description: '画布与预览不再显示，可在「图层」面板恢复' });
            }}
          >
            <EyeOff /> 隐藏
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            variant="destructive"
            disabled={widget.locked}
            onClick={() => {
              useBuilder.getState().removeWidget(widget.id);
              toast('已删除组件');
            }}
          >
            <Trash2 /> 删除 <ContextMenuShortcut>Del</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* 重命名对话框 */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-xs" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-base">重命名组件</DialogTitle>
            <DialogDescription className="sr-only">输入新的组件名称</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={renameValue}
            placeholder={def.name}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveRename();
            }}
          />
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setRenameOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={saveRename}>
              <Check className="mr-1 size-3.5" /> 保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
