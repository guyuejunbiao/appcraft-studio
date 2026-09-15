'use client';

import { contrastOn } from '@/lib/types';

/**
 * 应用图标体系（零 schema 迁移：icon/iconBG 存于 ThemeConfig JSON）：
 * - AppIconBadge：主题渐变 / 自定义纯色圆角方块 + emoji / 名称首字
 * - AppIconPicker：emoji 选择网格 + 背景色选择行（发布对话框 / 主题面板共用）
 */

/** 精选 emoji 图标库（覆盖电商/社交/效率/生活等常见 App 类型，无蓝靛倾向） */
export const APP_EMOJIS: string[] = [
  '🛍️', '🛒', '👗', '💎', '🍜', '🍕', '🛵', '☕',
  '💬', '📣', '🎧', '🎬', '🎵', '📰', '📊', '📈',
  '💪', '🏃', '⚽', '🏆', '🌙', '🌱', '📚', '✈️',
  '🏨', '🚗', '💰', '📷', '🎮', '🏠', '❤️', '⭐',
  '🔥', '🎯', '🧩', '🗂️', '🔔', '🩺', '🐾', '🎨',
];

/** 图标背景预设色（无蓝靛） */
export const ICON_BG_PRESETS: { color: string; label: string }[] = [
  { color: '', label: '跟随主题色' },
  { color: '#18181b', label: '墨黑' },
  { color: '#f43f5e', label: '玫红' },
  { color: '#f97316', label: '暖橙' },
  { color: '#f59e0b', label: '琥珀' },
  { color: '#10b981', label: '翠绿' },
  { color: '#14b8a6', label: '青碧' },
  { color: '#8b5cf6', label: '紫葡萄' },
  { color: '#ec4899', label: '粉樱' },
  { color: '#faf5ef', label: '米白' },
];

interface BadgeProps {
  /** 主题色（渐变底色） */
  primary: string;
  /** emoji 图标；空则用 name 首字 */
  icon?: string;
  /** 自定义背景色；空 = 跟随主题色渐变 */
  bg?: string;
  /** 应用名（首字 fallback） */
  name?: string;
  /** 边长 px */
  size?: number;
  className?: string;
}

/** 应用图标徽章：主题色渐变 / 自定义纯色底 + emoji / 首字，任何列表卡片可复用 */
export function AppIconBadge({ primary, icon, bg, name, size = 24, className = '' }: BadgeProps) {
  const label = icon?.trim() || name?.trim()?.slice(0, 1)?.toUpperCase() || 'A';
  const custom = !!bg?.trim();
  const dark = custom ? contrastOn(bg!.trim()) === '#ffffff' : contrastOn(primary) === '#ffffff';
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center overflow-hidden shadow-sm ring-1 ring-black/5 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(6, Math.round(size * 0.28)),
        fontSize: Math.round(size * (icon ? 0.58 : 0.5)),
        fontWeight: 800,
        lineHeight: 1,
        color: dark ? '#ffffff' : '#3f3f46',
        background: custom
          ? bg!.trim()
          : `linear-gradient(135deg, ${primary} 0%, color-mix(in srgb, ${primary} 72%, ${dark ? '#7c1d1d' : '#f5f0e8'}) 100%)`,
      }}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

interface PickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  /** 主色（选中描边/预览底） */
  primary: string;
  /** 当前自定义背景色（空 = 跟随主题） */
  bg?: string;
  /** 背景色变更回调；不传则隐藏背景色行 */
  onBgChange?: (color: string) => void;
}

/** emoji 图标选择器：首字选项 + 精选网格 + 背景色行（40 个），多处入口共用 */
export function AppIconPicker({ value, onChange, primary, bg, onBgChange }: PickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <AppIconBadge primary={primary} icon={value} bg={bg} name="A" size={48} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-zinc-700">
            {value ? `图标 ${value}` : '使用名称首字'}
          </p>
          <p className="text-[10px] leading-4 text-zinc-400">
            图标显示在首页卡片、上架列表与导出文件中
          </p>
        </div>
        {value && (
          <button
            onClick={() => onChange('')}
            className="rounded-lg border border-zinc-200 px-2 py-1 text-[10px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-50"
          >
            恢复首字
          </button>
        )}
      </div>
      <div className="grid grid-cols-10 gap-1 rounded-xl border bg-zinc-50/60 p-2">
        {APP_EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => onChange(e)}
            className={`flex aspect-square items-center justify-center rounded-lg text-base transition-all hover:scale-110 hover:bg-white ${
              value === e ? 'bg-white shadow ring-2' : ''
            }`}
            style={value === e ? { ['--tw-ring-color' as string]: primary } : undefined}
            aria-label={`选择图标 ${e}`}
          >
            {e}
          </button>
        ))}
      </div>
      {onBgChange && (
        <div className="rounded-xl border bg-zinc-50/60 p-2">
          <p className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">图标背景</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {ICON_BG_PRESETS.map(({ color, label }) => {
              const active = (bg?.trim() || '') === color;
              return (
                <button
                  key={label}
                  onClick={() => onBgChange(color)}
                  title={label}
                  aria-label={`背景色 ${label}`}
                  className={`flex size-7 items-center justify-center rounded-lg ring-1 ring-black/10 transition-all hover:scale-110 ${
                    active ? 'ring-2 ring-offset-1' : ''
                  }`}
                  style={
                    color
                      ? { background: color, ...(active ? { ['--tw-ring-color' as string]: primary } : {}) }
                      : {
                          background: `linear-gradient(135deg, ${primary}, color-mix(in srgb, ${primary} 70%, white))`,
                          ...(active ? { ['--tw-ring-color' as string]: primary } : {}),
                        }
                  }
                >
                  {!color && <span className="text-[8px] font-black text-white">主题</span>}
                  {active && color && (
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke={contrastOn(color)} strokeWidth="3">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
