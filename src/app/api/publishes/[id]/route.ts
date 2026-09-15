import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/** 上架快照详情（用于预览已上架应用） */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publish = await db.publish.findUnique({
    where: { id },
    include: { project: { select: { name: true } } },
  });
  if (!publish) return NextResponse.json({ error: 'not found' }, { status: 404 });

  let snapshot = null;
  try {
    snapshot = JSON.parse(publish.snapshot || 'null');
  } catch {
    snapshot = null;
  }

  return NextResponse.json({
    id: publish.id,
    name: publish.name,
    description: publish.description,
    version: publish.version,
    createdAt: publish.createdAt,
    projectName: publish.project?.name,
    snapshot,
  });
}
