/**
 * 图片值工具：组件图片属性（轮播图 / SKU 效果图 / 商品图）的统一识别与导入。
 *
 * 图片属性值支持三种形态（全部存为字符串，数据库/导出零压力）：
 *  1. dataURL —— 本地上传（FileReader / canvas 压缩后内联）
 *  2. http(s) 链接 —— 外链效果图
 *  3. 短文本（≤4 字符）—— 表情/色块文字占位（如 🌙 / 白色），渲染在渐变底上
 */

/** 是否为可渲染的图片地址（dataURL 或 http 链接） */
export const isImageSrc = (v: unknown): v is string =>
  typeof v === 'string' && /^(data:image\/|https?:\/\/)/.test(v.trim());

/** 是否为表情/短文字占位（用户在图片字段里手动输入的非链接短文本） */
export const isInlineEmoji = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.trim().length <= 4 && !isImageSrc(v);

/** 图片值 → 可直接给 <img src> 的地址；非图片值返回空 */
export const imageSrcOf = (v: unknown): string => (isImageSrc(v) ? v.trim() : '');

/**
 * 本地图片文件 → dataURL（超大图先经 canvas 压缩，控制 SQLite/导出体积）：
 *  - ≤ 400KB 原样读取（保留 PNG 透明通道）
 *  - 更大则等比缩到最长边 1280px、JPEG 0.82 质量（透明底垫白）
 */
export async function fileToDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error('读取文件失败'));
    fr.readAsDataURL(file);
  });
  if (file.size <= 400 * 1024) return raw;

  /* canvas 压缩：大图缩放 + JPEG 重编码 */
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('图片解码失败'));
    el.src = raw;
  });
  const MAX = 1280;
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return raw;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.82);
}
