import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uid } from '@/lib/types';
import { getTemplate, DEFAULT_THEME } from '@/lib/templates';

/** 安全解析组件 JSON */
function parseComponents(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** 项目列表（附主页 preview 缩略数据；theme 沿用原字符串字段） */
export async function GET() {
  const projects = await db.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { pages: true, connections: true } } },
  });

  /* 页面元数据（不含 components，避免把所有页面的组件 JSON 拉进内存） */
  const ids = projects.map((p) => p.id);
  const metas = ids.length
    ? await db.page.findMany({
        where: { projectId: { in: ids } },
        orderBy: { order: 'asc' },
        select: { id: true, projectId: true, isHome: true },
      })
    : [];

  /* 每个项目的主页：isHome 优先，否则第一个页面 */
  const firstByProject = new Map<string, string>();
  const homeByProject = new Map<string, string>();
  for (const m of metas) {
    if (!firstByProject.has(m.projectId)) firstByProject.set(m.projectId, m.id);
    if (m.isHome && !homeByProject.has(m.projectId)) homeByProject.set(m.projectId, m.id);
  }
  const homeIds = [
    ...new Set(
      projects
        .map((p) => homeByProject.get(p.id) ?? firstByProject.get(p.id))
        .filter((v): v is string => !!v)
    ),
  ];

  /* 只取主页的缩略所需字段 */
  const homePages = homeIds.length
    ? await db.page.findMany({
        where: { id: { in: homeIds } },
        select: { id: true, projectId: true, background: true, layout: true, components: true },
      })
    : [];
  const pageByProject = new Map(homePages.map((pg) => [pg.projectId, pg]));

  return NextResponse.json(
    projects.map((p) => {
      const hp = pageByProject.get(p.id);
      return {
        ...p,
        theme: p.theme || null,
        preview: hp
          ? {
              background: hp.background,
              layout: hp.layout ?? null,
              components: parseComponents(hp.components).slice(0, 10),
            }
          : null,
      };
    })
  );
}

/** 创建项目（可按模板种子页面与连接） */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name: string = (body.name || '').toString().trim() || '未命名 App';
  const description = (body.description || '').toString().trim() || null;
  const templateId: string = body.templateId || 'blank';
  const tpl = getTemplate(templateId);

  const project = await db.project.create({
    data: {
      name,
      description,
      template: templateId,
      theme: JSON.stringify(tpl ? { ...DEFAULT_THEME, primary: tpl.accent } : DEFAULT_THEME),
    },
  });

  if (tpl) {
    const pageIdMap: Record<string, string> = {};
    for (let i = 0; i < tpl.pages.length; i++) {
      const p = tpl.pages[i];
      const pageId = uid();
      pageIdMap[p.key] = pageId;
      await db.page.create({
        data: {
          id: pageId,
          projectId: project.id,
          name: p.name,
          order: i,
          background: p.background || '#f6f7fb',
          isHome: !!p.isHome,
          /* 新建项目默认自由布局：添加组件后即可任意拖放位置 */
          layout: 'free',
          flowX: 80 + (i % 4) * 280,
          flowY: 80 + Math.floor(i / 4) * 260,
          components: JSON.stringify(
            p.components.map((c) => ({ id: c.id || uid(), type: c.type, props: c.props || {}, width: 'full', align: 'left', mt: 0, mb: 8 }))
          ),
        },
      });
    }
    for (const c of tpl.connections) {
      const fromPageId = pageIdMap[c.fromPage];
      const toPageId = pageIdMap[c.toPage];
      if (!fromPageId || !toPageId) continue;
      await db.connection.create({
        data: {
          id: uid(),
          projectId: project.id,
          fromPageId,
          fromWidgetId: c.fromWidget,
          action: 'click',
          toPageId,
          animation: c.animation || 'slide',
          /* 槽位连接（tabbar 标签 / 宫格格子级跳转）：模板缺省则不写 */
          ...(c.slot ? { slot: c.slot } : {}),
        },
      });
    }
  }

  return NextResponse.json({ id: project.id });
}
