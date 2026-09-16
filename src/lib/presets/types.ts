/**
 * 精选预设（Style Presets）：基础组件的「拿来即用」预配置变体。
 *
 * 产品定位：小白用户不关心「属性面板里 20 个字段怎么调」——他们要的是
 * 「点一下就得到一张成品卡片」。每个预设 = 基础组件 + 精心调好的 props 覆盖，
 * 拖入画布即是可直接预览的成品（文案/图标/颜色/布局全部就位）。
 *
 * 与「我的组合」（PresetMarket，用户自存组合）的区别：
 * - 本文件体系是平台内置的精选变体，随版本发布，只读；
 * - PresetMarket 是用户运行时保存的个人资产。
 *
 * 数据约定：props 只写「覆盖项」，渲染时与 baseType 的 defaultProps 浅合并；
 * id 全局唯一（`<baseType>::<slug>` 规范，自动生成）；name 面向小白说人话。
 */
import type { LucideIcon } from 'lucide-react';
import type { CategoryId } from '@/lib/widget-types';

export interface PresetDef {
  /** 全局唯一：`<baseType>::<slug>` */
  id: string;
  /** 预设名（面向小白，说人话，不出现"组件"字样） */
  name: string;
  /** 所属类目（与基础组件 CategoryId 对齐，用于组件库分组展示） */
  category: CategoryId;
  /** 基础组件 type（WidgetDef.type） */
  baseType: string;
  /** props 覆盖（与基础组件 defaultProps 浅合并） */
  props: Record<string, unknown>;
  /** 搜索关键词（含场景/行业/同义词） */
  tags: string[];
  /** 图标（可选；缺省用基础组件的 icon） */
  icon?: LucideIcon;
}

/** 预设工厂：自动生成 id 与 category（category 从 baseType 前缀推导失败时显式传入） */
export function p(
  baseType: string,
  name: string,
  props: Record<string, unknown>,
  tags: string[] = [],
  category?: CategoryId
): PresetDef {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  const cat = (category ?? (baseType.split('.')[0] as CategoryId)) as CategoryId;
  return {
    id: `${baseType}::${slug || 'preset'}`,
    name,
    category: cat,
    baseType,
    props,
    tags: [name, baseType, ...tags],
  };
}

/** 便捷标签常量（保持数据文件简洁） */
export const T = {
  dianShang: '电商',
  canYin: '餐饮',
  jianShen: '健身',
  jiaoYu: '教育',
  lvXing: '旅行',
  sheJiao: '社交',
  yinYue: '音乐',
  shiPin: '视频',
  gongJu: '工具',
  jinRong: '金融',
  yiLiao: '医疗',
  chongWu: '宠物',
  duWu: '阅读',
  zhiBo: '直播',
  tuanGou: '团购',
  yuYue: '预约',
  qianDao: '签到',
  huiYuan: '会员',
  cuXiao: '促销',
  xinShou: '新手引导',
  anSe: '深色',
  qianSe: '浅色',
} as const;
