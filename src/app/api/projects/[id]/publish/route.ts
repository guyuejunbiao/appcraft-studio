import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_THEME } from '@/lib/types';

/** 上架应用：生成版本快照 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const project = await db.project.findUnique({
    where: { id },
    include: {
      pages: { orderBy: { order: 'asc' } },
      connections: true,
      publishes: { orderBy: { version: 'desc' }, take: 1, select: { version: true } },
    },
  });
  if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const version = (project.publishes[0]?.version ?? 0) + 1;
  const name = (body.name || '').toString().trim() || project.name;
  const description = (body.description ?? project.description ?? '') || null;

  let theme = DEFAULT_THEME;
  try {
    theme = { ...DEFAULT_THEME, ...JSON.parse(project.theme || '{}') };
  } catch {
    /* 使用默认主题 */
  }

  let tabs: unknown = [];
  try {
    tabs = JSON.parse(project.tabs || '[]');
  } catch {
    /* 使用空 tabs */
  }

  const snapshot = {
    name,
    description,
    theme,
    tabs,
    pages: project.pages.map((p) => ({
      id: p.id,
      name: p.name,
      background: p.background,
      isHome: p.isHome,
      layout: p.layout === 'free' || p.layout === 'flow' ? p.layout : undefined,
      flowX: p.flowX,
      flowY: p.flowY,
      components: JSON.parse(p.components || '[]'),
    })),
    connections: project.connections.map((c) => ({
      id: c.id,
      fromPageId: c.fromPageId,
      fromWidgetId: c.fromWidgetId,
      action: 'click',
      toPageId: c.toPageId,
      animation: c.animation,
      slot: c.slot ?? undefined,
    })),
  };

  const publish = await db.publish.create({
    data: {
      projectId: id,
      name,
      description,
      version,
      snapshot: JSON.stringify(snapshot),
    },
  });

  return NextResponse.json({
    id: publish.id,
    version,
    createdAt: publish.createdAt,
    pageCount: project.pages.length,
  });
}
