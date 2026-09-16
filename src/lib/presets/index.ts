/**
 * 精选预设聚合器：组件库「预设」tab 的数据源。
 *
 * 小白体验的核心：不用理解属性面板，直接拿成品。
 * 144 个基础组件 + 900+ 精选预设 ≈ 1000+ 可用模块。
 */
import type { CategoryId } from '@/lib/widget-types';
import { getWidget } from '@/components/widgets/registry';
import type { PresetDef } from './types';
import { loginPresets } from './login';
import { functionalPresets } from './functional';
import { mallPresets } from './mall';
import { shoppingPresets } from './shopping';
import { foodPresets } from './food';
import { chatPresets } from './chat';
import { socialPresets } from './social';
import { mediaPresets } from './media';
import { newsPresets } from './news';
import { profilePresets } from './profile';
import { fitnessPresets } from './fitness';
import { chartsPresets } from './charts';

export type { PresetDef } from './types';
export { p, T } from './types';

export const allPresets: PresetDef[] = [
  ...loginPresets,
  ...functionalPresets,
  ...mallPresets,
  ...shoppingPresets,
  ...foodPresets,
  ...chatPresets,
  ...socialPresets,
  ...mediaPresets,
  ...newsPresets,
  ...profilePresets,
  ...fitnessPresets,
  ...chartsPresets,
];

/** 组件库总数（基础组件 + 精选预设），用于「1000+ 可用模块」展示 */
export const totalModules = allPresets.length + 144;

/** 按类目分组（组件库分组渲染用，保持类目声明顺序） */
export function presetsByCategory(cat: CategoryId): PresetDef[] {
  return allPresets.filter((pr) => pr.category === cat);
}

/** 预设搜索：name/tags/baseType 全字段包含匹配 */
export function searchPresets(query: string): PresetDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return allPresets;
  return allPresets.filter(
    (pr) =>
      pr.name.toLowerCase().includes(q) ||
      pr.baseType.includes(q) ||
      pr.tags.some((t) => t.toLowerCase().includes(q))
  );
}

/** 合并预设 props 与基础组件 defaultProps（渲染/落库统一入口） */
export function mergedPresetProps(preset: PresetDef): Record<string, unknown> {
  const def = getWidget(preset.baseType);
  return { ...(def?.defaultProps ?? {}), ...preset.props };
}

/** 按 id 找预设 */
export function presetById(id: string): PresetDef | undefined {
  return allPresets.find((pr) => pr.id === id);
}
