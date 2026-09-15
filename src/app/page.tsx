'use client';

import { useEffect } from 'react';
import { useBuilder } from '@/lib/store';
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
