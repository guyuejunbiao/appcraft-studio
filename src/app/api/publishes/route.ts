import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/** 快照页面（宽松结构：兼容旧快照 layout/components 缺失或字符串形式） */
interface SnapPage {
  background?: string;
  layout?: string | null;
  isHome?: boolean;
  components?: unknown;
}

/** 安全解析组件 JSON（快照里通常是已解析数组，旧数据可能是字符串） */
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

/** 已上架应用列表（附主页 preview 缩略数据 + theme 字符串） */
export async function GET() {
  const publishes = await db.publish.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: { project: { select: { name: true } } },
  });
  return NextResponse.json(
    publishes.map((p) => {
      /* 解析快照：取主页（isHome 优先，否则第一个页面）前 10 个组件 */
      let pages: SnapPage[] = [];
      let theme: string | null = null;
      try {
        const snap = JSON.parse(p.snapshot || 'null') as {
          theme?: unknown;
          pages?: SnapPage[];
        } | null;
        if (snap && typeof snap === 'object') {
          pages = Array.isArray(snap.pages) ? snap.pages : [];
          if (typeof snap.theme === 'string') theme = snap.theme || null;
          else if (snap.theme && typeof snap.theme === 'object') theme = JSON.stringify(snap.theme);
        }
      } catch {
        pages = [];
      }
      const home = pages.find((pg) => pg?.isHome) ?? pages[0] ?? null;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        version: p.version,
        createdAt: p.createdAt,
        projectId: p.projectId,
        projectName: p.project?.name,
        theme,
        preview: home
          ? {
              background: home.background,
              layout: home.layout ?? null,
              components: parseComponents(home.components).slice(0, 10),
            }
          : null,
      };
    })
  );
}
