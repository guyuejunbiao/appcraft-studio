'use client';

import type { LucideIcon } from 'lucide-react';
import { APP_ICONS, iconByName } from '@/lib/app-icons';
import { useBusScope, useScene } from '@/lib/interaction-bus';
import { fireToast } from '@/lib/widget-toast';

/**
 * 宫格组合组件共享工具（九宫格 / 四宫格 / 金刚区…）：
 * ① 逐格数据结构 { label, icon, act, badge }——属性面板按格编辑，
 *    旧版「labels 逗号分隔」的项目自动回退解析，零破坏兼容；
 * ② 单元动作系统：预览/画布联动中点击格子可真实生效——
 *    - theme：切换整个手机屏幕的白天/黑夜场景（写总线 themeOverride）
 *    - toast：屏内轻提示
 *    - 其余格子若在「交互」面板绑定了页面（slots 槽位）则真实跳页。
 */

/** 宫格单元动作（'none' 仅用于面板 Select 占位，存档时归一为 ''） */
export type CellAct = '' | 'theme' | 'toast';

export interface GridCell {
  label: string;
  /** APP_ICONS 的图标 name；缺省按序取池内默认图标 */
  icon?: string;
  act: CellAct;
  /** 角标数量（订单宫格等待办数），'0'/空 = 不显示 */
  badge?: string;
  /** 开关型行（设置分组）的默认开关态；theme 行运行时以真实场景为准 */
  on?: boolean;
}

/** 属性面板「格动作」选项（Select）：'none' = 无内置动作，走槽位跳页/整卡跳页 */
export const CELL_ACT_OPTIONS: { label: string; value: 'none' | CellAct }[] = [
  { label: '无动作（可绑页面跳转）', value: 'none' },
  { label: '切换白天/黑夜场景', value: 'theme' },
  { label: '屏内轻提示', value: 'toast' },
];

export const CELL_ACT_LABEL: Record<CellAct, string> = {
  '': '跳页',
  theme: '昼夜',
  toast: '提示',
};

const ICON_NAME_SET = new Set(APP_ICONS.map((i) => i.name));

/** 图标名 → 组件；空/未知名返回 null（调用方自行回退），避免 iconByName 的 User 兜底误展示 */
export function iconByNameSafe(name?: string): LucideIcon | null {
  return name && ICON_NAME_SET.has(name) ? iconByName(name) : null;
}

/** 归档数据 → 规范 GridCell[]（容忍脏数据/缺字段；过滤空文案格） */
export function normalizeCells(raw: unknown): GridCell[] {
  return sanitizeCells(raw).filter((c) => c.label);
}

/** 编辑器用轻量清洗：保留空文案格（避免用户清空重打时整格消失），仅保证字段类型安全 */
export function sanitizeCells(raw: unknown): GridCell[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .map((c) => ({
      label: String(c.label ?? ''),
      icon: c.icon ? String(c.icon) : undefined,
      act: c.act === 'theme' || c.act === 'toast' ? (c.act as CellAct) : '',
      badge: c.badge != null && String(c.badge).trim() !== '' ? String(c.badge).trim() : undefined,
      on: c.on === true ? true : c.on === false ? false : undefined,
    }));
}

/** 逗号 / 中文逗号分隔 → 字符串数组（去空白项） */
export function splitList(raw: unknown): string[] {
  return String(raw ?? '')
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * 宫格单元解析：cells 存档优先；否则回退旧版 labels 逗号分隔文案 + 图标池按序取用。
 * 返回带解析好图标组件的单元列表（渲染直接用，未知图标名安全回退）。
 */
export function parseCells(
  cellsRaw: unknown,
  labelsRaw: unknown,
  pool: LucideIcon[]
): (GridCell & { Icon: LucideIcon })[] {
  const cells = normalizeCells(cellsRaw);
  if (cells.length) {
    return cells.map((c, i) => ({ ...c, Icon: iconByNameSafe(c.icon) ?? pool[i % pool.length] }));
  }
  return splitList(labelsRaw).map((label, i) => ({
    label,
    Icon: pool[i % pool.length],
    act: '' as CellAct,
    badge: undefined,
  }));
}

/** 槽位定义（交互面板逐格绑定页面用）：宫格通用 */
export const cellsToSlots = (cells: { label: string }[]) =>
  cells.map((c, i) => ({ key: String(i), label: `「${c.label || `格 ${i + 1}`}」格` }));

/**
 * 宫格单元点击 hook：处理「格动作」分支（theme/toast），
 * 返回 true 表示动作已消费（调用方不再走跳页逻辑）。
 */
export function useCellAct(cells: (GridCell & { Icon: LucideIcon })[]) {
  const scope = useBusScope();
  const { dark, canToggle, toggle } = useScene();
  return (i: number): boolean => {
    const cell = cells[i];
    if (!cell) return false;
    if (cell.act === 'theme') {
      if (!canToggle) {
        fireToast(scope, '当前环境不支持切换场景', 'info');
        return true;
      }
      toggle();
      fireToast(scope, dark ? '☀️ 已切换到白天场景' : '🌙 已切换到夜间场景', 'success');
      return true;
    }
    if (cell.act === 'toast') {
      fireToast(scope, cell.label ? `「${cell.label}」` : '演示提示', 'info');
      return true;
    }
    return false;
  };
}
