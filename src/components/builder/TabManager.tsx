'use client';

import { useEffect } from 'react';
import {
  ArrowDown, ArrowUp, LayoutPanelTop, Plus, Sparkles, Trash2, RectangleHorizontal,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { uid, type AppTab } from '@/lib/types';
import { IconPicker } from './IconPicker';

/** 一键生成默认 tab 时的图标循环（首页/发现/购物车/订单/我的…） */
const PRESET_ICONS = ['home', 'compass', 'shopping-cart', 'receipt', 'user-round'];

/**
 * App 级底部导航管理：每个 tab 绑定一整页（点击换根切换），
 * 每页底部自动出现；画布画板与预览同步渲染。
 */
export function TabManagerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const pages = useBuilder((s) => s.pages);
  const tabs = useBuilder((s) => s.tabs);
  const addTab = useBuilder((s) => s.addTab);
  const updateTab = useBuilder((s) => s.updateTab);
  const removeTab = useBuilder((s) => s.removeTab);
  const moveTab = useBuilder((s) => s.moveTab);
  const save = useBuilder((s) => s.save);

  /* 关闭时顺手保存（tabs 变更已标脏） */
  useEffect(() => {
    if (!open && useBuilder.getState().dirty) void save();
  }, [open, save]);

  const unboundPages = pages.filter((p) => !tabs.some((t) => t.pageId === p.id));

  const handleAdd = () => {
    const page = unboundPages[0] ?? pages[0];
    if (!page || tabs.length >= 5) return;
    const tab: AppTab = {
      id: uid(),
      pageId: page.id,
      label: page.name.slice(0, 4),
      icon: PRESET_ICONS[tabs.length % PRESET_ICONS.length],
    };
    addTab(tab);
    toast.success(`已添加「${tab.label}」标签`);
  };

  /** 一键按页面生成（最多取前 5 页，已有 tab 时跳过） */
  const handleAutoFill = () => {
    const picks = pages.slice(0, 5);
    if (picks.length === 0) return;
    useBuilder.getState().setTabs(
      picks.map((p, i) => ({
        id: uid(),
        pageId: p.id,
        label: p.name.slice(0, 4),
        icon: PRESET_ICONS[i % PRESET_ICONS.length],
      }))
    );
    toast.success('已按前 5 个页面生成底部导航');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutPanelTop className="size-4 text-violet-500" />
            底部导航（TabBar）
          </DialogTitle>
          <DialogDescription>
            App 级导航：每个图标绑定一整页，点击即换根切换；配置后所有页面底部自动出现，无限画布与预览实时同步。
          </DialogDescription>
        </DialogHeader>

        {/* Tab 列表 */}
        <div className="max-h-[46vh] space-y-2 overflow-y-auto thin-scroll py-1">
          {tabs.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 px-4 py-6 text-center">
              <RectangleHorizontal className="size-7 text-zinc-300" />
              <p className="text-xs text-zinc-400">还没有底部导航</p>
              <Button size="sm" variant="outline" onClick={handleAutoFill}>
                <Sparkles className="size-3.5 text-violet-500" /> 一键按页面生成
              </Button>
            </div>
          )}

          {tabs.map((tab, i) => {
            const boundPage = pages.find((p) => p.id === tab.pageId);
            return (
              <div
                key={tab.id}
                className="flex items-center gap-2 rounded-xl border bg-zinc-50/60 px-2 py-2"
              >
                <IconPicker value={tab.icon} onChange={(icon) => updateTab(tab.id, { icon })} />
                <Input
                  value={tab.label}
                  onChange={(e) => updateTab(tab.id, { label: e.target.value.slice(0, 6) })}
                  className="h-9 w-20 shrink-0 px-2 text-xs font-semibold"
                  placeholder="名称"
                  aria-label={`标签 ${i + 1} 名称`}
                />
                <span className="shrink-0 text-xs text-zinc-300">→</span>
                <Select
                  value={tab.pageId}
                  onValueChange={(pageId) => updateTab(tab.id, { pageId })}
                >
                  <SelectTrigger className="h-9 min-w-0 flex-1 text-xs">
                    <SelectValue placeholder="绑定页面" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        {p.isHome ? '（主页）' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost" size="icon" className="size-7"
                    disabled={i === 0}
                    onClick={() => moveTab(tab.id, i - 1)}
                    title="前移"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="size-7"
                    disabled={i === tabs.length - 1}
                    onClick={() => moveTab(tab.id, i + 2)}
                    title="后移"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="size-7 text-zinc-400 hover:text-rose-500"
                    onClick={() => { removeTab(tab.id); toast('已移除标签'); }}
                    title="移除标签"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 添加 + 统计 */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-zinc-400">
            {tabs.length > 0 ? `${tabs.length}/5 个标签` : '建议 2~5 个标签'}
            {boundDupExists(tabs) && (
              <span className="ml-2 text-amber-500">有多个标签指向同一页</span>
            )}
          </p>
          <Button
            size="sm"
            disabled={tabs.length >= 5 || unboundPages.length === 0}
            onClick={handleAdd}
          >
            <Plus className="size-4" /> 添加标签
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 是否存在重复绑定同一页面的标签（提示用） */
function boundDupExists(tabs: AppTab[]): boolean {
  const seen = new Set<string>();
  for (const t of tabs) {
    if (seen.has(t.pageId)) return true;
    seen.add(t.pageId);
  }
  return false;
}
