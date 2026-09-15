import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/** 删除组合 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.widgetPreset.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

/** 重命名 / 换图标 / 收藏（组件市场资源管理） */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const data: { name?: string; icon?: string; meta?: string } = {};
  if (typeof body?.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if (typeof body?.icon === 'string' && body.icon.trim()) data.icon = body.icon.trim();
  /* 收藏：与现有 meta JSON 合并（页面模板的 background/layout 保留） */
  if (typeof body?.starred === 'boolean') {
    const row = await db.widgetPreset.findUnique({ where: { id } }).catch(() => null);
    if (!row) return NextResponse.json({ error: '资源不存在' }, { status: 404 });
    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(row.meta || '{}');
    } catch {
      meta = {};
    }
    meta.starred = body.starred;
    if (body.starred) meta.starredAt = new Date().toISOString();
    else delete meta.starredAt;
    data.meta = JSON.stringify(meta);
  }
  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: '没有可更新的字段' }, { status: 400 });
  const row = await db.widgetPreset.update({ where: { id }, data }).catch(() => null);
  if (!row) return NextResponse.json({ error: '资源不存在' }, { status: 404 });
  return NextResponse.json({ ok: true, id: row.id, name: row.name, icon: row.icon });
}
