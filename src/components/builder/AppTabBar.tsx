'use client';

import { iconByName } from '@/lib/app-icons';
import { tabBarStyleOf, type AppTab, type TabBarStyle } from '@/lib/types';

/**
 * App 级底部导航（TabBar）渲染。
 * 与组件库里的 fn.tabbar 组件不同：这是项目级导航——
 * 配置一次，每页底部自动出现；每个标签绑定一整页，点击换根切换。
 * 纯展示：画板（无限画布）与预览共用，交互由调用方通过 onSelect 注入。
 * 样式（mode/bg/activeColor）来自主题 tabStyle，TabManager 可调整。
 */
export function AppTabBar({
  tabs,
  activePageId,
  onSelect,
  style,
}: {
  tabs: AppTab[];
  /** 当前激活页（对应标签高亮） */
  activePageId?: string | null;
  /** 点击标签回调（预览=换根切页；画板=聚焦画板） */
  onSelect?: (tab: AppTab) => void;
  /** 整体样式（theme.tabStyle；缺省全默认） */
  style?: TabBarStyle;
}) {
  if (tabs.length === 0) return null;
  const st = tabBarStyleOf({ tabStyle: style } as never);
  const isIconOnly = st.mode === 'icon';
  const bg = st.bg;
  const useAuto = bg === 'auto';
  const bgStyle =
    bg === 'light'
      ? 'rgba(255,255,255,0.95)'
      : bg === 'dark'
        ? 'rgba(18,18,24,0.97)'
        : bg === 'primary'
          ? 'var(--p)'
          : undefined;
  /* 激活 / 未激活前景色（primary 沉浸底用白色系） */
  const activeCls =
    bg === 'primary' ? '#ffffff' : st.activeColor || 'var(--p)';
  const dimStyle =
    bg === 'primary'
      ? { color: 'rgba(255,255,255,0.72)' }
      : bg === 'dark'
        ? { color: 'rgba(255,255,255,0.5)' }
        : undefined;
  const topBar =
    bg === 'primary' ? 'rgba(255,255,255,0.25)' : undefined;

  return (
    <nav
      aria-label="底部导航"
      className={`relative z-20 flex shrink-0 items-stretch border-t backdrop-blur-md ${useAuto ? 'app-tabbar w-line' : 'border-transparent'}`}
      style={{
        height: isIconOnly ? 58 : 54,
        ...(bgStyle ? { background: bgStyle } : {}),
        ...(topBar ? { borderTopColor: topBar } : {}),
      }}
    >
      {tabs.map((tab) => {
        const Icon = iconByName(tab.icon);
        const active = tab.pageId === activePageId;
        const color = active ? activeCls : undefined;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(tab);
            }}
            aria-label={`切换到 ${tab.label}`}
            aria-current={active ? 'page' : undefined}
            className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 transition-transform active:scale-95"
            title={tab.label}
          >
            {/* 激活顶部指示条 */}
            <span
              aria-hidden
              className={`absolute inset-x-4 top-0 h-[2.5px] rounded-b-full transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
              style={{ background: activeCls }}
            />
            {/* 激活底衬（仅图标模式的胶囊高亮） */}
            {isIconOnly && active && (
              <span
                aria-hidden
                className="absolute size-9 rounded-2xl opacity-15"
                style={{ background: activeCls }}
              />
            )}
            <Icon
              className={`relative shrink-0 transition-colors ${isIconOnly ? 'size-[26px]' : 'size-[22px]'}`}
              strokeWidth={active ? 2.4 : 2}
              style={color ? { color } : dimStyle}
            />
            {!isIconOnly && (
              <span
                className={`relative max-w-full truncate px-0.5 text-[10px] leading-[13px] transition-colors ${
                  active ? 'font-semibold' : 'font-medium'
                }`}
                style={
                  active
                    ? { color: activeCls }
                    : dimStyle ?? undefined
                }
              >
                {tab.label}
              </span>
            )}
            {!isIconOnly && !active && !dimStyle && (
              <span aria-hidden className="sr-only">未激活</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
