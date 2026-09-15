import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_THEME, type ThemeConfig } from '@/lib/types';

/** 项目详情（页面 + 连接） */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      pages: { orderBy: { order: 'asc' } },
      connections: true,
    },
  });
  if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 });

  let theme: ThemeConfig = DEFAULT_THEME;
  try {
    theme = { ...DEFAULT_THEME, ...JSON.parse(project.theme || '{}') };
  } catch {
    /* 使用默认主题 */
  }

  return NextResponse.json({
    id: project.id,
    name: project.name,
    description: project.description,
    template: project.template,
    theme,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
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
  });
}

/** 保存整个项目（客户端为唯一事实来源，全量替换页面与连接） */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.pages) || !Array.isArray(body.connections)) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await db.$transaction([
    db.project.update({
      where: { id },
      data: {
        name: (body.name || existing.name).toString(),
        description: body.description ?? existing.description,
        theme: JSON.stringify(body.theme || DEFAULT_THEME),
      },
    }),
    db.page.deleteMany({ where: { projectId: id } }),
    db.page.createMany({
      data: body.pages.map((p: any, i: number) => ({
        id: p.id,
        projectId: id,
        name: p.name || `页面 ${i + 1}`,
        order: i,
        background: p.background || '#f6f7fb',
        isHome: !!p.isHome,
        layout: p.layout === 'free' || p.layout === 'flow' ? p.layout : null,
        flowX: p.flowX ?? null,
        flowY: p.flowY ?? null,
        components: JSON.stringify(p.components || []),
      })),
    }),
    db.connection.deleteMany({ where: { projectId: id } }),
    db.connection.createMany({
      data: body.connections.map((c: any) => ({
        id: c.id,
        projectId: id,
        fromPageId: c.fromPageId,
        fromWidgetId: c.fromWidgetId,
        action: 'click',
        toPageId: c.toPageId,
        animation: c.animation || 'slide',
        slot: typeof c.slot === 'string' && c.slot !== '' ? c.slot : null,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}

/** 删除项目 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
