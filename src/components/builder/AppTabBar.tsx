'use client';

import { iconByName } from '@/lib/app-icons';
import type { AppTab } from '@/lib/types';

/**
 * App 级底部导航（TabBar）渲染。
 * 与组件库里的 fn.tabbar 组件不同：这是项目级导航——
 * 配置一次，每页底部自动出现；每个标签绑定一整页，点击换根切换。
 * 纯展示：画板（无限画布）与预览共用，交互由调用方通过 onSelect 注入。
 */
export function AppTabBar({
  tabs,
  activePageId,
  onSelect,
}: {
  tabs: AppTab[];
  /** 当前激活页（对应标签高亮） */
  activePageId?: string | null;
  /** 点击标签回调（预览=换根切页；画板=聚焦画板） */
  onSelect?: (tab: AppTab) => void;
}) {
  if (tabs.length === 0) return null;
  return (
    <nav
      aria-label="底部导航"
      className="app-tabbar relative z-20 flex h-[54px] shrink-0 items-stretch border-t w-line backdrop-blur-md"
    >
      {tabs.map((tab) => {
        const Icon = iconByName(tab.icon);
        const active = tab.pageId === activePageId;
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
              className={`absolute inset-x-4 top-0 h-[2.5px] rounded-b-full bg-[var(--p)] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
            />
            <Icon
              className={`size-[22px] shrink-0 transition-colors ${active ? 'text-[var(--p)]' : 'opacity-45'}`}
              strokeWidth={active ? 2.4 : 2}
            />
            <span
              className={`max-w-full truncate px-0.5 text-[10px] leading-[13px] font-medium transition-colors ${
                active ? 'text-[var(--p)] font-semibold' : 'opacity-45'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
