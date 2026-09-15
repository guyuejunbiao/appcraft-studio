'use client';

import { Blocks } from 'lucide-react';
import { WidgetRenderer } from './WidgetRenderer';
import {
  DEFAULT_THEME, RADIUS_MAP, contrastOn,
  type ThemeConfig, type WidgetInstance,
} from '@/lib/types';

/** 列表接口返回的缩略数据（preview 字段），字段缺失时组件自行兜底 */
export interface ThumbData {
  background?: string;
  layout?: 'flow' | 'free' | null;
  theme?: ThemeConfig | null;
  components?: WidgetInstance[] | null;
}

/** 把列表接口的 theme（JSON 字符串或已解析对象）安全解析为 ThemeConfig */
export function parseThemeConfig(raw: unknown): ThemeConfig | null {
  if (!raw) return null;
  let obj: unknown = raw;
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== 'object') return null;
  const t = obj as Partial<ThemeConfig>;
  return {
    primary: typeof t.primary === 'string' ? t.primary : DEFAULT_THEME.primary,
    radius: t.radius ?? DEFAULT_THEME.radius,
    dark: !!t.dark,
    icon: typeof t.icon === 'string' ? t.icon : undefined,
    iconBG: typeof t.iconBG === 'string' ? t.iconBG : undefined,
  };
}

interface ProjectThumbProps extends ThumbData {
  /** 项目名（空项目占位显示首字） */
  name?: string;
  /** 缩略图显示宽度 px（高度按 375:812 等比换算） */
  width?: number;
  className?: string;
}

/** 内容视口尺寸（与 PhoneFrame 屏幕一致） */
const VIEW_W = 375;
const VIEW_H = 812;

/**
 * 项目卡片迷你实时封面：按 375×812 内容坐标真实渲染主页前 10 个组件，
 * 再整体 transform: scale() 缩到卡片尺寸。纯静态展示，不可交互。
 */
export function ProjectThumb({
  background, layout, theme, components, name, width = 86, className = '',
}: ProjectThumbProps) {
  const widgets = Array.isArray(components) ? components : [];
  const dark = !!theme?.dark;
  const isFree = layout === 'free';
  const scale = width / VIEW_W;
  const primary = theme?.primary || DEFAULT_THEME.primary;
  /* 暗色模式下默认浅灰底置换为深底（与 PhoneFrame 行为一致） */
  const bg = dark && (!background || background === '#f6f7fb') ? '#101014' : background || '#f6f7fb';

  return (
    <div
      className={`relative select-none overflow-hidden ${dark ? 'pd' : ''} ${className}`}
      style={{
        width,
        height: Math.round(VIEW_H * scale),
        background: bg,
        color: dark ? '#ececf1' : '#1c1c21',
        ['--p' as string]: primary,
        ['--pf' as string]: contrastOn(primary),
        ['--pr' as string]: RADIUS_MAP[theme?.radius ?? DEFAULT_THEME.radius],
      }}
      aria-hidden="true"
    >
      {widgets.length === 0 ? (
        /* 空项目占位：浅灰 App 图标 + 项目名首字 */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
          <div className="w-card flex size-14 items-center justify-center rounded-2xl shadow-sm">
            <Blocks className="size-7 opacity-35" />
          </div>
          {name && (
            <span className="max-w-[80%] truncate text-sm font-black tracking-widest opacity-25">
              {name.slice(0, 4)}
            </span>
          )}
        </div>
      ) : (
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: VIEW_W, height: VIEW_H, transform: `scale(${scale})` }}
        >
          {widgets.map((w) => {
            if (!w || typeof w !== 'object' || !w.id) return null;
            if (isFree) {
              /* 与 PreviewPlayer 的 free 渲染一致：外层绝对定位 + WidgetRenderer free 包装 */
              return (
                <div
                  key={w.id}
                  className="absolute"
                  style={{ left: w.x ?? 0, top: w.y ?? 0, width: w.w ?? 355 }}
                >
                  <WidgetRenderer w={w} free />
                </div>
              );
            }
            /* 流式：按数组顺序垂直堆叠（含宽度/对齐/边距包装） */
            return <WidgetRenderer key={w.id} w={w} />;
          })}
        </div>
      )}
    </div>
  );
}
