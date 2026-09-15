import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uid, DEFAULT_THEME, type ThemeConfig } from '@/lib/types';

interface ImportPage {
  id?: string;
  name?: string;
  background?: string;
  isHome?: boolean;
  layout?: string;
  flowX?: number | null;
  flowY?: number | null;
  components?: unknown[];
}

interface ImportPayload {
  name?: string;
  description?: string;
  theme?: Partial<ThemeConfig>;
  pages?: ImportPage[];
  connections?: {
    fromPageId?: string;
    fromWidgetId?: string;
    toPageId?: string;
    animation?: string;
    slot?: string;
  }[];
}

/** 导入项目 JSON：创建新项目（重新分配 id，并按页面引用重建连接） */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as ImportPayload | null;
  if (!body || !Array.isArray(body.pages) || body.pages.length === 0) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const theme: ThemeConfig = { ...DEFAULT_THEME, ...(body.theme || {}) };
  const project = await db.project.create({
    data: {
      name: (body.name || '导入的 App').toString().slice(0, 50),
      description: body.description ? String(body.description).slice(0, 200) : null,
      template: 'imported',
      theme: JSON.stringify(theme),
    },
  });

  // 重新分配页面与组件 id，建立 旧id → 新id 映射
  const pageIdMap: Record<string, string> = {};
  const widgetIdMap: Record<string, string> = {};
  const pageRows: {
    id: string; projectId: string; name: string; order: number;
    background: string; isHome: boolean; layout: string | null;
    flowX: number | null; flowY: number | null; components: string;
  }[] = [];

  body.pages.forEach((p, i) => {
    const newPageId = uid();
    if (p && typeof p === 'object' && typeof p.id === 'string') {
      pageIdMap[p.id] = newPageId;
    }
    const comps = (Array.isArray(p.components) ? p.components : []).map((raw) => {
      const c = (raw ?? {}) as { id?: string; type?: string; props?: Record<string, unknown>; width?: string; align?: string; mt?: number; mb?: number; x?: number; y?: number; w?: number; h?: number };
      const newWidgetId = uid();
      if (c.id) widgetIdMap[c.id] = newWidgetId;
      return {
        id: newWidgetId,
        type: String(c.type || 'fn.text-block'),
        props: c.props || {},
        width: c.width || 'full',
        align: c.align || 'left',
        mt: Number(c.mt) || 0,
        mb: c.mb === undefined ? 8 : Number(c.mb) || 0,
        /* 自由布局坐标透传 */
        ...(typeof c.x === 'number' ? { x: c.x } : {}),
        ...(typeof c.y === 'number' ? { y: c.y } : {}),
        ...(typeof c.w === 'number' ? { w: c.w } : {}),
        ...(typeof c.h === 'number' ? { h: c.h } : {}),
      };
    });
    pageRows.push({
      id: newPageId,
      projectId: project.id,
      name: String(p.name || `页面 ${i + 1}`).slice(0, 30),
      order: i,
      background: String(p.background || '#f6f7fb'),
      isHome: !!p.isHome,
      layout: p.layout === 'free' || p.layout === 'flow' ? p.layout : null,
      flowX: typeof p.flowX === 'number' ? p.flowX : 80 + (i % 3) * 340,
      flowY: typeof p.flowY === 'number' ? p.flowY : 80 + Math.floor(i / 3) * 280,
      components: JSON.stringify(comps),
    });
  });

  await db.page.createMany({ data: pageRows });
  if (!pageRows.some((p) => p.isHome) && pageRows[0]) {
    await db.page.update({ where: { id: pageRows[0].id }, data: { isHome: true } });
  }

  // 重建连接（仅当引用的页面/组件都能映射上）
  const connRows = (Array.isArray(body.connections) ? body.connections : [])
    .map((c) => {
      const fromPageId = c.fromPageId ? pageIdMap[c.fromPageId] : undefined;
      const toPageId = c.toPageId ? pageIdMap[c.toPageId] : undefined;
      const fromWidgetId = c.fromWidgetId ? widgetIdMap[c.fromWidgetId] : undefined;
      if (!fromPageId || !toPageId || !fromWidgetId || fromPageId === toPageId) return null;
      return {
        id: uid(),
        projectId: project.id,
        fromPageId,
        fromWidgetId,
        action: 'click',
        toPageId,
        animation: ['slide', 'fade', 'push', 'none'].includes(c.animation || '') ? c.animation! : 'slide',
        slot: typeof c.slot === 'string' && c.slot !== '' ? c.slot : null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (connRows.length > 0) {
    await db.connection.createMany({ data: connRows });
  }

  return NextResponse.json({ id: project.id, pages: pageRows.length, connections: connRows.length });
}
