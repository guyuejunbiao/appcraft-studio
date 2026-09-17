'use client';

import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fileToDataUrl, imageSrcOf } from '@/lib/image-value';

/**
 * 单图选择器（紧凑行内版）：缩略图点击上传 / 粘贴外链 / 表情占位 / 一键清除。
 * 供 ImagesEditor（轮播图 / SKU 效果图）等图片列表编辑器复用。
 *
 * 值形态见 src/lib/image-value.ts：dataURL / http 链接 / ≤4 字符表情占位 / 空。
 */
export function ImagePicker({
  value,
  onChange,
  label,
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  /** 行首标签（如选项名「月光白」或「图 1」） */
  label?: string;
  /** 紧凑模式（SKU 对齐行）：缩略图更小、无标签重排 */
  compact?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const src = imageSrcOf(value);
  const isData = value.trim().startsWith('data:');

  const pick = async (file?: File | null) => {
    if (!file) return;
    try {
      onChange(await fileToDataUrl(file));
    } catch {
      /* 读取失败静默——用户可改用链接方式 */
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* 缩略图（点击=上传） */}
      <button
        type="button"
        title="点击上传本地图片"
        aria-label={label ? `上传 ${label} 的图片` : '上传图片'}
        onClick={() => fileRef.current?.click()}
        className={`shrink-0 cursor-pointer overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-violet-400 hover:bg-violet-50${compact ? ' size-7' : ' size-9'}`}
      >
        {src ? (
           
          <img src={src} alt={label || '图片'} className="size-full object-cover" />
        ) : value.trim() ? (
          <span className={`flex size-full items-center justify-center${compact ? ' text-[11px]' : ' text-sm'}`}>{value.trim()}</span>
        ) : (
          <span className="flex size-full items-center justify-center text-zinc-400">
            <ImagePlus className={compact ? 'size-3' : 'size-3.5'} />
          </span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {/* 链接/表情输入（dataURL 不回显进输入框，避免超长字符串卡顿） */}
      <Input
        className={`min-w-0 flex-1 text-[11px]${compact ? ' h-7' : ' h-8'}`}
        value={isData ? '' : value}
        placeholder={isData ? '已上传本地图片' : '粘贴图片链接或表情'}
        aria-label={label ? `${label} 图片地址` : '图片地址'}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* 清除 */}
      {value && (
        <button
          type="button"
          title="清除图片"
          aria-label={label ? `清除 ${label} 的图片` : '清除图片'}
          onClick={() => onChange('')}
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
