'use client';

import { useEffect } from 'react';
import { useBuilder, bindAutosave } from '@/lib/store';
import { ProjectHome } from '@/components/builder/ProjectHome';
import { EditorShell } from '@/components/builder/EditorShell';
import { FlowEditor } from '@/components/builder/FlowEditor';
import { InfiniteCanvas } from '@/components/builder/InfiniteCanvas';
import { PreviewPlayer } from '@/components/builder/PreviewPlayer';

export default function Page() {
  const view = useBuilder((s) => s.view);
  const loadHome = useBuilder((s) => s.loadHome);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  /* 自动保存必须全局绑定：此前在 EditorShell 内绑定，切到无限画布/流程图/预览
   * 视图时 EditorShell 卸载 → 自动保存停止 → 画布中的修改（拖动画板/连线/就地编辑）
   * 不回编辑器就关页 = 静默丢失。bindAutosave 自带 view!=='home' 判断，首页不触发 */
  useEffect(() => bindAutosave(), []);

  return (
    <main className="min-h-screen">
      {view === 'home' && <ProjectHome />}
      {view === 'editor' && <EditorShell />}
      {view === 'flow' && <FlowEditor />}
      {view === 'canvas' && <InfiniteCanvas />}
      {view === 'preview' && <PreviewPlayer />}
    </main>
  );
}
