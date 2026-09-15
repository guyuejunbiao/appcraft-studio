/** 画布上的组件实例 */
export interface WidgetInstance {
  id: string;
  type: string;
  props: Record<string, any>;
  width?: 'full' | 'three-quarter' | 'half' | 'third';
  align?: 'left' | 'center' | 'right';
  /** 上边距 px */
  mt?: number;
  /** 下边距 px */
  mb?: number;
  /** 图层名称（默认取组件名） */
  name?: string;
  /** 锁定：不可拖动/缩放/误删（画布仅可选中查看） */
  locked?: boolean;
  /** 隐藏：画布与预览均不渲染，可在图层面板恢复 */
  hidden?: boolean;
  /** 编组 id：同组组件点击联动选中、拖拽整体移动（仅同页面有效） */
  group?: string;
  /* ---- 自由布局（page.layout === 'free' 时生效，屏幕坐标系 375 宽）---- */
  /** 横坐标 px */
  x?: number;
  /** 纵坐标 px */
  y?: number;
  /** 宽度 px */
  w?: number;
  /** 高度 px（不设则自适应内容） */
  h?: number;
  /** 不透明度 0.05~1（1/不设 = 完全不透明），编辑器/预览/导出三端生效 */
  opacity?: number;
  /** 阴影级别（drop-shadow 跟随组件实际形状），编辑器/预览/导出三端生效 */
  shadow?: WidgetShadow;
}

/** 阴影级别：sm 轻 / md 中 / lg 大 / xl 浮起 / glow 主题色光晕 */
export type WidgetShadow = 'sm' | 'md' | 'lg' | 'xl' | 'glow';

/**
 * 阴影 → CSS filter（drop-shadow 而非 box-shadow：跟随圆角/透明形状，通栏与非通栏组件都自然）。
 * glow 用主题色变量 --p，在手机屏内已定义（画布/预览/导出三端一致）。
 */
export const SHADOW_FILTER: Record<WidgetShadow, string> = {
  sm: 'drop-shadow(0 1px 2.5px rgba(24,24,27,0.14))',
  md: 'drop-shadow(0 4px 10px rgba(24,24,27,0.18))',
  lg: 'drop-shadow(0 12px 24px rgba(24,24,27,0.22))',
  xl: 'drop-shadow(0 22px 44px rgba(24,24,27,0.30))',
  glow: 'drop-shadow(0 0 12px var(--p)) drop-shadow(0 2px 6px rgba(24,24,27,0.12))',
};

/** 阴影选项（属性面板 / 批量工具条共用展示序） */
export const SHADOW_OPTS: { v?: WidgetShadow; label: string }[] = [
  { v: undefined, label: '无' },
  { v: 'sm', label: '轻' },
  { v: 'md', label: '中' },
  { v: 'lg', label: '大' },
  { v: 'xl', label: '浮' },
  { v: 'glow', label: '光晕' },
];

/** 样式刷剪辑：可跨组件粘贴的外观字段（不含内容 props 与位置 x/y） */
export interface WidgetStyleClip {
  opacity?: number;
  shadow?: WidgetShadow;
  mt?: number;
  mb?: number;
  width?: 'full' | 'three-quarter' | 'half' | 'third';
  align?: 'left' | 'center' | 'right';
  /** 自由布局宽度（px） */
  w?: number;
}

/** App 的一个界面（页面） */
export interface PageData {
  id: string;
  name: string;
  background: string;
  isHome: boolean;
  components: WidgetInstance[];
  /** 布局模式：flow 流式（默认）/ free 自由布局（可任意拖放位置与大小） */
  layout?: 'flow' | 'free';
  /** 流程图节点坐标 */
  flowX?: number | null;
  flowY?: number | null;
}

/**
 * 自由布局页面是否缺少坐标（模板种子/旧数据的组件没有 x/y）。
 * 编辑器与预览共用：缺坐标时按流式堆叠渲染，并在编辑器访问时测量升级。
 */
export function missingFreeCoords(components: WidgetInstance[] | undefined): boolean {
  return !!components?.some((c) => typeof c.x !== 'number' || typeof c.y !== 'number');
}

/** 转场动画类型：slide 右滑入（前进）/ slide-up 底部滑入（模态）/ slide-down 顶部滑入 / fade 淡入 / push 左滑入 / zoom 中心展开 / none 直切 */
export type AnimKind = 'slide' | 'slide-up' | 'slide-down' | 'fade' | 'push' | 'zoom' | 'none';

/** 转场动画选项（InspectorPanel / FlowEditor / 右键菜单 / 预览共用单一事实来源） */
export const ANIM_OPTS: { value: AnimKind; label: string; desc: string }[] = [
  { value: 'slide', label: '滑入', desc: '从右侧推入，前进感' },
  { value: 'slide-up', label: '底部滑入', desc: '从底部升起，模态感' },
  { value: 'slide-down', label: '顶部滑入', desc: '从顶部落下，下拉感' },
  { value: 'fade', label: '淡入', desc: '透明度过渡，轻量' },
  { value: 'push', label: '推入', desc: '从左侧推入，返回感' },
  { value: 'zoom', label: '展开', desc: '中心放大展开，聚焦感' },
  { value: 'none', label: '直切', desc: '无动画立即切换' },
];

/** 页面连接：某页某组件点击后跳转到目标页 */
export interface ConnectionData {
  id: string;
  fromPageId: string;
  fromWidgetId: string;
  action: 'click';
  toPageId: string;
  animation: AnimKind;
  /** 复合组件槽位（如 tabbar 第 N 个标签）：'0'/'1'…；空 = 整个组件点击 */
  slot?: string;
}

/**
 * App 级底部导航（TabBar）的一个标签。
 * 与组件库里的 fn.tabbar 不同：这是项目级导航，每页底部自动出现，
 * 每个标签绑定一整页（点击换根切换）。
 */
export interface AppTab {
  id: string;
  /** 绑定的目标页面 */
  pageId: string;
  /** 标签文字（如：首页 / 购物车） */
  label: string;
  /** lucide 图标名（见 lib/app-icons.ts 的 APP_ICONS 映射） */
  icon: string;
}

/**
 * App 级底部导航（TabBar）的整体样式（项目级）。
 * 空字段 = 使用默认（图标+文字、激活主题色、自适应底色）。
 */
export interface TabBarStyle {
  /** 展示模式：both 图标+文字（默认）/ icon 仅图标大图标模式 */
  mode?: 'both' | 'icon';
  /** 激活色；空 = 跟随主题主色 var(--p) */
  activeColor?: string;
  /** 底色风格：auto 明暗自适应（默认）/ light 白色 / dark 深色 / primary 主题色沉浸 */
  bg?: 'auto' | 'light' | 'dark' | 'primary';
}

/** 项目主题（UI/UX 自定义） */
export interface ThemeConfig {
  primary: string;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  dark: boolean;
  /** 应用图标（emoji）；空 = 用名称首字生成 */
  icon?: string;
  /** 应用图标背景色；空 = 跟随主题色渐变 */
  iconBG?: string;
  /** App 级底部导航（TabBar）整体样式；空 = 全默认 */
  tabStyle?: TabBarStyle;
}

export const DEFAULT_THEME: ThemeConfig = {
  primary: '#f97316',
  radius: 'md',
  dark: false,
};

/** 读取 TabBar 样式（带默认值兜底） */
export function tabBarStyleOf(theme: ThemeConfig | undefined | null): Required<Pick<TabBarStyle, 'mode' | 'bg'>> & { activeColor?: string } {
  const s = theme?.tabStyle ?? {};
  return {
    mode: s.mode ?? 'both',
    bg: s.bg ?? 'auto',
    activeColor: s.activeColor || undefined,
  };
}

export interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  theme: ThemeConfig;
  pages: PageData[];
  connections: ConnectionData[];
  /** App 级底部导航（可空 = 不启用） */
  tabs?: AppTab[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  template?: string | null;
  updatedAt: string;
  _count: { pages: number; connections: number };
}

export interface PublishSummary {
  id: string;
  name: string;
  description: string | null;
  version: number;
  createdAt: string;
  projectId: string;
  projectName?: string;
}

/** 组件市场：可复用资源（kind=combo 组件组合 / page 页面模板） */
export interface PresetData {
  id: string;
  name: string;
  /** emoji 图标 */
  icon: string;
  /** 组件实例（组合为相对坐标，页面模板为页面绝对坐标） */
  widgets: WidgetInstance[];
  /** 资源类型：'combo'=组件组合（默认） / 'page'=页面模板（整页复用） */
  kind?: 'combo' | 'page';
  /** 页面模板附加信息：背景色与布局模式；收藏状态跨类型共用 */
  meta?: { background?: string; layout?: 'flow' | 'free'; starred?: boolean; starredAt?: string };
}

/** 读取资源是否收藏 */
export const presetStarred = (p: PresetData): boolean => !!p.meta?.starred;

/** 组件市场排序：star 星标优先 / name 名称 / time 最近创建（默认） */
export type PresetSortMode = 'star' | 'name' | 'time';

export function sortPresets(list: PresetData[], mode: PresetSortMode): PresetData[] {
  const arr = [...list];
  if (mode === 'name') return arr.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
  if (mode === 'star') {
    return arr.sort((a, b) => {
      const sa = presetStarred(a) ? 1 : 0;
      const sb = presetStarred(b) ? 1 : 0;
      if (sa !== sb) return sb - sa;
      return (b.meta?.starredAt ?? '').localeCompare(a.meta?.starredAt ?? '');
    });
  }
  return arr;
}

/** 上架快照（完整可运行数据） */
export interface AppSnapshot {
  name: string;
  description: string | null;
  theme: ThemeConfig;
  pages: PageData[];
  connections: ConnectionData[];
  /** App 级底部导航（可空 = 不启用） */
  tabs?: AppTab[];
}

/** 生成短 id */
export const uid = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** 深拷贝 */
export const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** 根据背景色计算可读文字颜色 */
export function contrastOn(hex: string): string {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.65 ? '#18181b' : '#ffffff';
}

export const RADIUS_MAP: Record<ThemeConfig['radius'], string> = {
  none: '2px',
  sm: '6px',
  md: '12px',
  lg: '18px',
  full: '26px',
};
