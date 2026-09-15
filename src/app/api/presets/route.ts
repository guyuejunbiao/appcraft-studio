import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/** 组合/页面模板的公共返回结构 */
function serialize(r: { id: string; name: string; icon: string; widgets: string; kind: string; meta: string; createdAt: Date }) {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    widgets: JSON.parse(r.widgets || '[]'),
    kind: r.kind === 'page' ? 'page' : 'combo',
    meta: JSON.parse(r.meta || '{}'),
    createdAt: r.createdAt,
  };
}

/** 组件市场：全部「我的组合 + 页面模板」（时间倒序） */
export async function GET() {
  const rows = await db.widgetPreset.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(rows.map(serialize));
}

/** 保存组合 / 页面模板 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const icon = typeof body?.icon === 'string' && body.icon.trim() ? body.icon.trim() : '✨';
  const kind = body?.kind === 'page' ? 'page' : 'combo';
  if (!name) return NextResponse.json({ error: '名称不能为空' }, { status: 400 });
  if (!Array.isArray(body?.widgets) || body.widgets.length === 0)
    return NextResponse.json({ error: kind === 'page' ? '页面模板至少包含一个组件' : '组合至少包含一个组件' }, { status: 400 });

  const meta =
    kind === 'page'
      ? {
          background: typeof body?.meta?.background === 'string' ? body.meta.background : '#f6f7fb',
          layout: body?.meta?.layout === 'flow' ? 'flow' : 'free',
        }
      : {};

  const row = await db.widgetPreset.create({
    data: { name, icon, widgets: JSON.stringify(body.widgets), kind, meta: JSON.stringify(meta) },
  });
  return NextResponse.json(serialize(row));
}
