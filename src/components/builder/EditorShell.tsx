'use client';

import { useEffect } from 'react';
import { Blocks, PanelRight, PanelLeft } from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { Toolbar } from './Toolbar';
import { WidgetLibrary } from './WidgetLibrary';
import { Canvas } from './Canvas';
import { InspectorPanel } from './InspectorPanel';
import { PublishDialog } from './PublishDialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

/** 编辑器外壳：三栏布局 + 快捷键 + 移动端抽屉（自动保存已提升到 page.tsx 全局绑定） */
export function EditorShell() {
  useEffect(() => {
    /* 组件市场（我的组合）懒加载一次 */
    if (!useBuilder.getState().presetsLoaded) useBuilder.getState().loadPresets();

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      const s = useBuilder.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        s.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && s.selectedWidgetId) {
        e.preventDefault();
        s.copyWidget(s.selectedWidgetId);
        toast('已复制组件，Ctrl+V 粘贴');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        const before = useBuilder.getState().pages.find((p) => p.id === useBuilder.getState().currentPageId)?.components.length ?? 0;
        s.pasteWidget();
        const after = useBuilder.getState().pages.find((p) => p.id === useBuilder.getState().currentPageId)?.components.length ?? 0;
        if (after > before) toast('已粘贴组件');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && s.selectedWidgetId) {
        e.preventDefault();
        s.duplicateWidget(s.selectedWidgetId);
        toast('已创建副本');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && !e.shiftKey) {
        /* 编组：多选 ≥2 时生效 */
        e.preventDefault();
        const ids = s.selectedIds;
        const gid = s.groupWidgets(ids);
        if (gid) toast.success(`已编组 ${ids.length} 个组件`, { description: '点击任一成员即可整组选中、整体拖动' });
        else toast('编组需要先多选 2 个以上未锁定组件', { description: 'Shift 点选或空白处框选' });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && e.shiftKey) {
        /* 解组：对选中成员所在组生效 */
        e.preventDefault();
        const ids = s.selectedIds.length > 0 ? s.selectedIds : s.selectedWidgetId ? [s.selectedWidgetId] : [];
        if (ids.length > 0) {
          s.ungroupWidgets(ids);
          toast('已解组');
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        /* 全选当前页可见组件 */
        e.preventDefault();
        const ids = s.pages.find((p) => p.id === s.currentPageId)?.components.filter((c) => !c.hidden).map((c) => c.id) ?? [];
        if (ids.length > 0) {
          s.selectMany(ids);
          toast(`已全选 ${ids.length} 个组件`);
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && s.selectedWidgetId) {
        const sel = s.pages.find((p) => p.id === s.currentPageId)?.components.find((c) => c.id === s.selectedWidgetId);
        if (sel?.locked) return; /* 锁定组件不响应删除键 */
        e.preventDefault();
        s.removeWidget(s.selectedWidgetId);
        toast('已删除组件');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef0f4]">
      <Toolbar />

      <div className="flex min-h-0 flex-1">
        {/* 桌面：左侧组件仓库 */}
        <div className="hidden lg:flex">
          <WidgetLibrary />
        </div>

        {/* 中央画布 */}
        <Canvas />

        {/* 桌面：右侧属性面板 */}
        <div className="hidden xl:flex">
          <InspectorPanel />
        </div>
      </div>

      {/* 移动端抽屉触发器 */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="size-11 rounded-full shadow-lg" aria-label="打开组件仓库">
              <Blocks className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>组件仓库</SheetTitle>
            </SheetHeader>
            <WidgetLibrary />
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="size-11 rounded-full bg-white shadow-lg" aria-label="打开属性面板">
              <PanelRight className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>属性面板</SheetTitle>
            </SheetHeader>
            <InspectorPanel />
          </SheetContent>
        </Sheet>
      </div>

      <PublishDialog />
    </div>
  );
}
