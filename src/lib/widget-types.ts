import type { LucideIcon } from 'lucide-react';

/** 组件实例属性（编辑器面板根据 fields 自动生成表单） */
export type WidgetProps = Record<string, any>;

/** 属性面板控件类型 */
export type PropFieldType = 'text' | 'textarea' | 'select' | 'color' | 'number' | 'switch' | 'cells' | 'products';

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
  /**
   * 槽位压栈导航（宫格逐格跳页等）：与 tabNav 的区别在于这是「推入页面栈」
   * 的层级导航——详情页按返回箭头/预览返回可回到来源页（真实 App 的
   * 金刚区→分类页语义）；tabbar 用换根式，宫格用压栈式。
   * 返回 true = 已跳转；false = 该槽位未绑定页面（调用方可给未绑定提示）。
   */
  slotPush?: (slot: string) => boolean;
  /** 槽位绑定提示：slot key → 目标页名 */
  slotHints?: Record<string, string>;
  /**
   * 页面栈回退（正常 App 的导航栏返回箭头语义）：预览容器注入。
   * 栈底时调用只给 toast 提示、不重复弹栈。
   */
  navBack?: () => void;
  /**
   * 退出登录（正常 App 的会话注销语义）：清空会话数据（手机号/密码/验证码/协议勾选）
   * 并把页面栈重置回首页。由 fn.list-item 的「退出登录」等入口触发。
   */
  onLogout?: () => void;
}

export interface PropField {
  key: string;
  label: string;
  type: PropFieldType;
  /** select 的选项 */
  options?: { label: string; value: string }[];
  /** number 类型（滑杆）范围；cells 类型兼作最大格数 */
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  /** cells 类型：每格是否含角标数量输入（如订单宫格的待付款数） */
  withBadge?: boolean;
  /** cells 类型：每格是否含「默认开启」开关（设置分组的开关型行） */
  withOn?: boolean;
}

/** 组件大类 */
export type CategoryId =
  | 'login'
  | 'mall'
  | 'shopping'
  | 'chat'
  | 'food'
  | 'functional'
  | 'buttons'
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
  /**
   * 网格布局槽位数（如双列商品网格 cols:2）：静态导出 HTML 的点击分区
   * 改用 grid 均分（cols 列 × N 行），而非默认的竖向均分条；
   * 缺省 = 竖向均分（tabbar 等横向条状槽位）。
   */
  cols?: number;
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
