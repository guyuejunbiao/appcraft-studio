'use client';

import { useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 可滑动图组（SwipeDeck）：横向拖拽/触摸滑动翻页 + 弹簧回弹，丝滑跟手。
 * - 占满父容器（size-full 由调用方给定），自适应任意宽高比；
 * - renderItem(i) 渲染每页内容（图片 object-cover/contain 由调用方决定）；
 * - 干净点击（拖动距离 < 8px）触发 onTap——供"主图点击查看大图"等场景；
 * - showDots 圆点指示 / showArrows 桌面端悬停左右箭头。
 * 组件目录（预览画布/编辑弹窗）通用，不依赖任何业务组件。
 */
export function SwipeDeck({
  count,
  index,
  onIndexChange,
  renderItem,
  className = '',
  onTap,
  showDots = false,
  showArrows = true,
  dotsTone = 'light',
}: {
  count: number;
  index: number;
  onIndexChange: (i: number) => void;
  renderItem: (i: number) => React.ReactNode;
  className?: string;
  /** 干净点击（非拖动）回调 */
  onTap?: () => void;
  showDots?: boolean;
  showArrows?: boolean;
  /** 圆点色调：light=深色底上的白点 / dark=浅色底上的深点 */
  dotsTone?: 'light' | 'dark';
}) {
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const clamp = (i: number) => Math.max(0, Math.min(Math.max(count - 1, 0), i));
  const safeIdx = clamp(index);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -48 || velocity.x < -420) onIndexChange(clamp(index + 1));
    else if (offset.x > 48 || velocity.x > 420) onIndexChange(clamp(index - 1));
  };

  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      onPointerDown={(e) => { downRef.current = { x: e.clientX, y: e.clientY }; }}
      onClick={(e) => {
        const d = downRef.current;
        downRef.current = null;
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) return; /* 拖动不触发点击 */
        onTap?.();
      }}
    >
      {count > 0 ? (
        <motion.div
          className="flex h-full w-full"
          style={{ touchAction: 'pan-y' }} /* 横向拖拽自持，纵向滚动放行给页面 */
          animate={{ x: `-${safeIdx * 100}%` }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={handleDragEnd}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="relative h-full w-full shrink-0 grow-0 basis-full overflow-hidden">
              {renderItem(i)}
            </div>
          ))}
        </motion.div>
      ) : null}

      {/* 桌面端左右箭头（悬停显现） */}
      {showArrows && count > 1 && (
        <>
          {safeIdx > 0 && (
            <button
              type="button"
              aria-label="上一张"
              onClick={(e) => { e.stopPropagation(); onIndexChange(safeIdx - 1); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute left-1.5 top-1/2 z-20 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/55 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          {safeIdx < count - 1 && (
            <button
              type="button"
              aria-label="下一张"
              onClick={(e) => { e.stopPropagation(); onIndexChange(safeIdx + 1); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute right-1.5 top-1/2 z-20 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/55 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </>
      )}

      {/* 圆点指示 */}
      {showDots && count > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === safeIdx ? 12 : 6,
                background: i === safeIdx
                  ? (dotsTone === 'light' ? '#fff' : 'rgba(24,24,27,0.72)')
                  : (dotsTone === 'light' ? 'rgba(255,255,255,0.45)' : 'rgba(24,24,27,0.22)'),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
