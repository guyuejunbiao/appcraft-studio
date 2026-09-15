import type { LucideIcon } from 'lucide-react';

/** 组件实例属性（编辑器面板根据 fields 自动生成表单） */
export type WidgetProps = Record<string, any>;

/** 属性面板控件类型 */
export type PropFieldType = 'text' | 'textarea' | 'select' | 'color' | 'number' | 'switch';

/** 交互组件共享的运行时上下文（仅在预览模式传入） */
export interface InteractiveCtx {
  /** 合并后的组件属性 */
  props: WidgetProps;
  /** 点击后跳转已绑定的目标页（无连接时为空） */
  onTap?: () => void;
  /** 目标页名称（提示用） */
  targetHint?: string | null;
  /**
   * 槽位导航（tabbar 等）：传入槽位 key，若该槽位绑定了页面则跳转（换根式）。
   * 未绑定时为空函数。
   */
  tabNav?: (slot: string) => void;
  /** 槽位绑定提示：slot key → 目标页名 */
  slotHints?: Record<string, string>;
}

export interface PropField {
  key: string;
  label: string;
  type: PropFieldType;
  /** select 的选项 */
  options?: { label: string; value: string }[];
  /** number 类型（滑杆）范围 */
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

/** 组件大类 */
export type CategoryId =
  | 'login'
  | 'mall'
  | 'shopping'
  | 'chat'
  | 'food'
  | 'functional'
  | 'social'
  | 'media'
  | 'news'
  | 'charts'
  | 'profile'
  | 'fitness';

/** 标签栏（tabbar）等复合组件的可绑定槽位 */
export interface WidgetSlot {
  /** 槽位标识（存入 Connection.slot，如 '0' / '1'） */
  key: string;
  /** 属性面板展示的槽位名（如标签文字） */
  label: string;
}

/**
 * 小组件定义（组件仓库里的每一张卡片）
 * render 为纯展示函数：只允许使用 Tailwind、CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 与明暗自适应表面类（w-card / w-input / w-chip / w-line），禁止使用 hooks 与外部请求。
 * Interactive 为可选的交互实现（仅预览模式渲染，可使用 hooks/状态）。
 */
export interface WidgetDef {
  /** 全局唯一类型，如 'login.phone-input' */
  type: string;
  category: CategoryId;
  name: string;
  desc: string;
  icon: LucideIcon;
  defaultProps: WidgetProps;
  fields: PropField[];
  /** 通栏组件（banner/导航/底部栏等，画布不为其加水平内边距） */
  fullBleed?: boolean;
  render: (p: WidgetProps) => React.ReactNode;
  /** 预览模式下的可交互实现（未提供则预览也用静态 render） */
  Interactive?: React.ComponentType<InteractiveCtx>;
  /**
   * 画布联动开关：配合渲染器的 canvasLive 模式，编辑画板内也挂载
   * Interactive 实现（如 login-tabs 在画板内点击即可切换联动状态，
   * 实时预览「密码/短信」两组互斥组件的显隐效果）。
   */
  canvasInteractive?: boolean;
  /**
   * 复合组件的可绑定槽位（如 tabbar 的每个标签可分别绑定页面）。
   * 提供后属性面板的交互页可为每个槽位单独建立连接。
   */
  slots?: (p: WidgetProps) => WidgetSlot[];
}

/** 组件大类元数据（组件仓库目录标题） */
export interface CategoryMeta {
  id: CategoryId;
  name: string;
  desc: string;
  icon: LucideIcon;
}
