'use client';

/**
 * 通用「文字命中」解析器 —— 画布双击改字 / 右键单件编辑的统一数据层。
 *
 * 设计目标：不依赖逐组件埋点（data-* 标记可选增强），仅凭「用户双击/右键的文字」
 * 与组件字段值的匹配，就能定位到任意组件里任意一条文字的数据位置：
 *
 *   - text/textarea 字段（含逗号分隔列表）→ 按分隔符切段，命中第 i 段
 *   - products 字段（items 存档）→ 命中第 i 个商品的 name/price/original/sales
 *   - cells 字段（宫格存档）→ 命中第 i 格的 label/badge
 *
 * 匹配规则（宽容度递减）：
 *   exact    叶子文字 === 存储值（绝大多数场景）
 *   prefix   存储值以叶子文字开头（如 "腾讯新闻 98万" 渲染出 "腾讯新闻"）
 *   includes 叶子文字包含存储值（如价格渲染成 "¥199" 而存储值是 "199"）
 *
 * 提交规则 applyReplace：
 *   exact/prefix → 在存储值上原位替换命中片段（保留其余部分，如热度 " 98万"）
 *   includes     → 整段替换（存储值只是叶子文字的装饰子串）
 */

import type { PropField, WidgetDef } from '@/lib/widget-types';
import type { WidgetInstance } from '@/lib/types';
import { productsFieldValue, cellsFieldValue } from '@/components/builder/InspectorPanel';
import type { GridCell, ProductItem } from '@/components/widgets/grid-kit';

/** 列表段分隔符：半角/全角逗号、顿号 */
const SEG_RE = /[,，、]/;

const normText = (s: string) => String(s ?? '').replace(/\s+/g, ' ').trim();

/** 读取对象字段为字符串（容忍脏数据类型，避免 ProductItem/GridCell 的索引签名断言） */
const fieldVal = (obj: unknown, key: string): string => {
  if (!obj || typeof obj !== 'object') return '';
  return String((obj as Record<string, unknown>)[key] ?? '').trim();
};

type MatchType = 'exact' | 'prefix' | 'includes';

const rankOf = (mt: MatchType) => (mt === 'exact' ? 3 : mt === 'prefix' ? 2 : 1);

function matchTypeOf(seg: string, leafText: string): MatchType | null {
  if (!seg || !leafText) return null;
  if (seg === leafText) return 'exact';
  if (leafText.length >= 2 && seg.startsWith(leafText)) return 'prefix';
  if (seg.length >= 2 && leafText.includes(seg)) return 'includes';
  return null;
}

/* ==================== DOM 工具 ==================== */

/**
 * 向下找「直接持有文字」的最深元素：双击目标本身没有文字（图标/容器）时，
 * 顺延到第一个带文字的子孙——即用户视觉上想改的那行字。
 */
export function textLeafOf(el: HTMLElement | null): HTMLElement | null {
  let cur = el;
  let guard = 0;
  while (cur && guard++ < 12) {
    const hasDirectText = Array.from(cur.childNodes).some(
      (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim()
    );
    if (hasDirectText) return cur;
    const next = Array.from(cur.children).find((c) => (c.textContent ?? '').trim()) as HTMLElement | undefined;
    if (!next) return null;
    cur = next;
  }
  return null;
}

/** 在容器内找文字匹配的叶子元素（内联输入框的定位兜底：双击图片时改名字要覆盖到名字上） */
export function findLeafByText(root: HTMLElement | null, text: string): HTMLElement | null {
  const T = normText(text);
  if (!root || !T) return null;
  let exact: HTMLElement | null = null;
  let partial: HTMLElement | null = null;
  const walk = (el: HTMLElement) => {
    for (const child of Array.from(el.children)) walk(child as HTMLElement);
    const hasDirect = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim());
    if (!hasDirect) return;
    const t = normText(el.textContent ?? '');
    if (!exact && t === T) exact = el;
    if (!partial && t && (t.includes(T) || T.includes(t))) partial = el;
  };
  walk(root);
  return exact ?? partial;
}

/* ==================== 命中结构 ==================== */

export interface TextHit {
  /** list = 逗号列表的第 index 段；products/cells = 条目数组的第 index 项 */
  kind: 'list' | 'products' | 'cells';
  /** 数据所在字段 key（提交时写回 { [fieldKey]: patch }） */
  fieldKey: string;
  index: number;
  /** products/cells 的子键：name/price/original/sales | label/badge */
  subkey?: string;
  /** 被编辑的存储值（内联输入框的初值） */
  seg: string;
  /** 命中元素的原始文字（trim，提交替换用） */
  rawLeaf: string;
  matchType: MatchType;
  /** 内联输入框的定位元素（不参与提交） */
  posEl: HTMLElement;
}

/** 提交：在存储值上原位替换（exact/prefix），或整段替换（includes/兜底） */
function applyReplace(cur: string, hit: Pick<TextHit, 'rawLeaf' | 'matchType'>, next: string): string {
  if (hit.matchType === 'includes' || !hit.rawLeaf || !cur.includes(hit.rawLeaf)) return next;
  return cur.replace(hit.rawLeaf, next);
}

/* ==================== 标记（data-*）结构命中 ==================== */

/** 条目标记元素 → { kind, index }；无标记返回 null */
export function markerInfo(marker: HTMLElement | null): { kind: 'products' | 'cells'; index: number } | null {
  if (!marker) return null;
  const isItem = marker.hasAttribute('data-item-index');
  const raw = marker.getAttribute(isItem ? 'data-item-index' : 'data-cell-index');
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return { kind: isItem ? 'products' : 'cells', index: n };
}

const PRODUCT_SUBKEYS = ['name', 'price', 'original', 'sales'] as const;

/** 标记条目内的候选子值（商品：名称/价格/原价/销量；格子：文案/角标） */
function subValuesOf(def: WidgetDef, widget: WidgetInstance, kind: 'products' | 'cells', fieldKey: string, index: number): { subkey: string; value: string }[] {
  const f = def.fields.find((x) => x.key === fieldKey) as PropField | undefined;
  if (!f) return [];
  const out: { subkey: string; value: string }[] = [];
  try {
    if (kind === 'products') {
      const items = productsFieldValue(f, widget, def) as ProductItem[];
      const it = items[index];
      if (!it) return out;
      for (const k of PRODUCT_SUBKEYS) {
        const v = fieldVal(it, k);
        if (v) out.push({ subkey: k, value: v });
      }
    } else {
      const cells = cellsFieldValue(f, widget, def) as GridCell[];
      const c = cells[index];
      if (!c) return out;
      const label = String(c.label ?? '').trim();
      if (label) out.push({ subkey: 'label', value: label });
      const badge = String(c.badge ?? '').trim();
      if (badge) out.push({ subkey: 'badge', value: badge });
    }
  } catch {
    /* 脏数据兜底：当作没有候选 */
  }
  return out;
}

/* ==================== 主入口 ==================== */

export interface HitResult {
  /** 文字命中（products/cells 标记条目必然给出默认子值命中；无标记时按全局文字匹配） */
  hit: TextHit | null;
  /** 命中的条目标记元素（双击非文字区 → 打开该件单件面板用） */
  marker: HTMLElement | null;
}

/**
 * 统一解析一次点击/双击/右键：
 * 1. 命中 data-item-index / data-cell-index → 在该条目的子值里匹配文字
 *    （双击价格改价格、双击名称改名称；纯图标双击默认改名称）
 * 2. 无标记但有文字 → 全局匹配组件全部字段（text/textarea 分段 + products + cells）
 * 3. 都没有 → hit 为 null（调用方可仅凭 marker 打开单件面板）
 */
export function resolveHitAt(def: WidgetDef, widget: WidgetInstance, target: EventTarget | null): HitResult {
  const el = target as HTMLElement | null;
  if (!el || typeof el.closest !== 'function') return { hit: null, marker: null };
  const marker = el.closest('[data-item-index],[data-cell-index]') as HTMLElement | null;
  const info = markerInfo(marker);
  const leaf = textLeafOf(el);

  if (info && marker) {
    const f = def.fields.find((x) => x.type === info.kind);
    if (f) {
      const subs = subValuesOf(def, widget, info.kind, f.key, info.index);
      const T = leaf ? normText(leaf.textContent ?? '') : '';
      let best: { subkey: string; value: string; mt: MatchType } | null = null;
      if (T) {
        for (const s of subs) {
          const mt = matchTypeOf(normText(s.value), T);
          if (!mt) continue;
          if (!best || rankOf(mt) > rankOf(best.mt) || (rankOf(mt) === rankOf(best.mt) && s.value.length > best.value.length)) {
            best = { subkey: s.subkey, value: s.value, mt };
          }
        }
      }
      const chosen = best ?? subs.find((s) => s.subkey === (info.kind === 'products' ? 'name' : 'label')) ?? subs[0];
      if (chosen) {
        const posEl: HTMLElement = (best ? leaf : findLeafByText(marker, chosen.value) ?? leaf) ?? marker;
        return {
          hit: {
            kind: info.kind,
            fieldKey: f.key,
            index: info.index,
            subkey: chosen.subkey,
            seg: chosen.value,
            rawLeaf: (posEl.textContent ?? '').trim(),
            matchType: best?.mt ?? 'exact',
            posEl,
          },
          marker,
        };
      }
    }
    /* 标记存在但字段解析失败（脏数据）→ 继续走全局文字匹配 */
  }

  if (leaf) {
    const hit = resolveGlobalTextHit(def, widget, leaf);
    return { hit, marker };
  }
  return { hit: null, marker };
}

/** 无标记场景：在整个组件的字段值里匹配叶子文字 */
function resolveGlobalTextHit(def: WidgetDef, widget: WidgetInstance, leaf: HTMLElement): TextHit | null {
  const T = normText(leaf.textContent ?? '');
  if (!T) return null;
  const merged = { ...def.defaultProps, ...widget.props };
  let best: { hit: Omit<TextHit, 'posEl' | 'rawLeaf'>; score: number } | null = null;
  const consider = (cand: Omit<TextHit, 'posEl' | 'rawLeaf' | 'matchType'>) => {
    const s = normText(cand.seg);
    if (!s) return;
    const mt = matchTypeOf(s, T);
    if (!mt) return;
    const score = rankOf(mt) * 10000 + Math.min(s.length, 9999);
    if (!best || score > best.score) best = { hit: { ...cand, matchType: mt }, score };
  };
  for (const f of def.fields) {
    if (f.type === 'text' || f.type === 'textarea') {
      const raw = String(merged[f.key] ?? '');
      raw.split(SEG_RE).forEach((seg, i) => consider({ kind: 'list', fieldKey: f.key, index: i, seg }));
    } else if (f.type === 'products') {
      try {
        const items = productsFieldValue(f as PropField, widget, def) as ProductItem[];
        items.forEach((it, i) => {
          for (const k of PRODUCT_SUBKEYS) {
            const v = fieldVal(it, k);
            if (v) consider({ kind: 'products', fieldKey: f.key, index: i, subkey: k, seg: v });
          }
        });
      } catch {
        /* 脏数据兜底 */
      }
    } else if (f.type === 'cells') {
      try {
        const cells = cellsFieldValue(f as PropField, widget, def) as GridCell[];
        cells.forEach((c, i) => {
          const label = String(c.label ?? '').trim();
          if (label) consider({ kind: 'cells', fieldKey: f.key, index: i, subkey: 'label', seg: label });
          const badge = String(c.badge ?? '').trim();
          if (badge) consider({ kind: 'cells', fieldKey: f.key, index: i, subkey: 'badge', seg: badge });
        });
      } catch {
        /* 脏数据兜底 */
      }
    }
  }
  if (!best) return null;
  const b = best as { hit: Omit<TextHit, 'posEl' | 'rawLeaf'>; score: number };
  return { ...b.hit, rawLeaf: (leaf.textContent ?? '').trim(), posEl: leaf };
}

/* ==================== 提交 ==================== */

/** 把内联编辑的新文字写回组件数据，返回 props patch（调用方 updateWidgetProps(id, patch)） */
export function commitTextHit(def: WidgetDef, widget: WidgetInstance, hit: TextHit, nextText: string): Record<string, unknown> | null {
  const next = String(nextText ?? '');
  if (hit.kind === 'list') {
    const merged = { ...def.defaultProps, ...widget.props };
    const raw = String(merged[hit.fieldKey] ?? '');
    const segs = raw.split(SEG_RE);
    if (hit.index >= segs.length) return null;
    segs[hit.index] = applyReplace(segs[hit.index], hit, next);
    const joiner = raw.includes('，') ? '，' : ',';
    return { [hit.fieldKey]: segs.join(joiner) };
  }
  if (hit.kind === 'products') {
    const f = def.fields.find((x) => x.key === hit.fieldKey) as PropField | undefined;
    if (!f || !hit.subkey) return null;
    let items: ProductItem[] = [];
    try {
      items = productsFieldValue(f, widget, def) as ProductItem[];
    } catch {
      return null;
    }
    if (hit.index >= items.length) return null;
    const subkey = hit.subkey;
    const items2 = items.map((it, i) => {
      if (i !== hit.index) return it;
      const cur = fieldVal(it, subkey);
      return { ...it, [subkey]: applyReplace(cur, hit, next) };
    });
    return { [hit.fieldKey]: items2 };
  }
  /* cells */
  const f = def.fields.find((x) => x.key === hit.fieldKey) as PropField | undefined;
  if (!f || !hit.subkey) return null;
  let cells: GridCell[] = [];
  try {
    cells = cellsFieldValue(f, widget, def) as GridCell[];
  } catch {
    return null;
  }
  if (hit.index >= cells.length) return null;
  const subkey = hit.subkey;
  const cells2 = cells.map((c, i) => {
    if (i !== hit.index) return c;
    const cur = fieldVal(c, subkey);
    return { ...c, [subkey]: applyReplace(cur, hit, next) };
  });
  return { [hit.fieldKey]: cells2 };
}

/** 逗号列表分段（SegmentEditor 用）：保留空段对齐索引 */
export function listSegments(value: unknown): string[] {
  return String(value ?? '').split(SEG_RE);
}

/** 分段回拼：原值含全角逗号则沿用全角（保持用户书写习惯） */
export function joinSegments(segs: string[], original: unknown): string {
  const raw = String(original ?? '');
  return segs.join(raw.includes('，') ? '，' : ',');
}

/**
 * 主列表字段：条目标记（data-item-index 等）落在纯文本列表组件（菜名+价格横滑等，
 * 无 products/cells 字段）上时，右键单件面板按此字段做分段编辑。
 * 优先取值里真正含分隔符的字段（items 优先于 prices 这类配对字段）。
 */
export function primaryListField(def: WidgetDef, widget: WidgetInstance): PropField | null {
  const fields = def.fields.filter((f) => f.type === 'text' || f.type === 'textarea');
  if (!fields.length) return null;
  const merged = { ...def.defaultProps, ...widget.props };
  return fields.find((f) => SEG_RE.test(String(merged[f.key] ?? ''))) ?? fields[0];
}
