'use client';

import { getWidget } from '@/components/widgets/registry';
import { contrastOn, RADIUS_MAP, missingFreeCoords, SHADOW_FILTER, type ConnectionData, type PageData, type ThemeConfig, type WidgetInstance } from './types';

/**
 * 导出独立 HTML App：
 * - 把画布上所有页面渲染成静态 HTML（renderToStaticMarkup，浏览器端执行）
 * - 内联当前文档全部样式（Tailwind + w-* 表面类），离线可用、双击即开
 * - 保留「点击跳转」与「tabbar 槽位分区跳转」两类交互 + 页面切换动画
 * - 手机壳外观（刘海/状态栏/Home 条）与主题变量一并带入
 */

const WIDTH_MAP: Record<string, string> = { full: '100%', 'three-quarter': '75%', half: '50%', third: '33.33%' };
const ALIGN_MAP: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** 收集当前文档全部 CSS（dev 为 style 标签；prod 为同源 link，fetch 后拼接） */
async function collectCss(): Promise<string> {
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const node = sheet.ownerNode as HTMLElement | null;
      if (node && node.tagName === 'STYLE') {
        parts.push(node.textContent ?? '');
        continue;
      }
      const href = (sheet as CSSStyleSheet).href;
      if (href && !href.startsWith('data:')) {
        const res = await fetch(href);
        if (res.ok) parts.push(await res.text());
      }
    } catch {
      /* 跨域样式表跳过 */
    }
  }
  return parts.join('\n');
}

/** 组件体 → HTML（与编辑器 WidgetInner 同构：非通栏补 10px 左右内边距） */
function widgetBodyHtml(w: WidgetInstance, render: (node: React.ReactNode) => string): string {
  const def = getWidget(w.type);
  if (!def) return '';
  const merged = { ...def.defaultProps, ...w.props };
  let body: React.ReactNode;
  try {
    body = def.render(merged);
  } catch {
    return `<div style="margin:8px 10px;padding:12px;border:1px dashed #d4d4d8;border-radius:12px;text-align:center;font-size:12px;color:#a1a1aa">组件 ${esc(w.type)} 渲染失败</div>`;
  }
  let html = render(body);
  if (!def.fullBleed) html = `<div style="padding:0 10px">${html}</div>`;
  return html;
}

/** 十六进制色向黑/白混合（生成渐变终点色） */
function mixHex(hex: string, target: number, ratio: number): string {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const ch = (i: number) => parseInt(full.slice(i, i + 2), 16) || 0;
  const mix = (c: number) => Math.round(c + (target - c) * ratio).toString(16).padStart(2, '0');
  return `#${mix(ch(0))}${mix(ch(2))}${mix(ch(4))}`;
}

/** 生成应用图标 SVG（主题渐变 / 自定义纯色圆角方块 + emoji / 首字） */
function appIconSvg(theme: ThemeConfig, name: string): string {
  const p = theme.primary || '#f97316';
  const bg = theme.iconBG?.trim();
  const emoji = theme.icon?.trim() || '';
  const label = emoji || name.trim().slice(0, 1).toUpperCase() || 'A';
  const base = bg || p;
  const textFill = emoji ? (bg ? contrastOn(bg) : '#ffffff') : contrastOn(base);
  const body = bg
    ? `<rect width="512" height="512" rx="118" fill="${bg}"/>`
    : `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p}"/><stop offset="1" stop-color="${mixHex(p, emoji ? 40 : 255, 0.28)}"/></linearGradient></defs><rect width="512" height="512" rx="118" fill="url(#g)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${body}<text x="256" y="272" font-size="${emoji ? 290 : 250}" text-anchor="middle" dominant-baseline="central" font-family="system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif" font-weight="800" fill="${textFill}">${esc(label)}</text></svg>`;
}

/** 单个组件的完整包装层（定位 + 点击跳转 + 槽位分区） */
function widgetShellHtml(
  w: WidgetInstance,
  conns: ConnectionData[],
  pageId: string,
  render: (node: React.ReactNode) => string
): string {
  const def = getWidget(w.type);
  if (!def) return '';
  const merged = { ...def.defaultProps, ...w.props };
  const links = conns.filter((c) => c.fromPageId === pageId && c.fromWidgetId === w.id);
  const whole = links.find((c) => !c.slot);
  const slotLinks = links.filter((c) => c.slot);

  const bodyHtml = widgetBodyHtml(w, render);
  /* 点击跳转包裹层（整组件） */
  let inner = bodyHtml;
  if (whole) {
    inner = `<div class="ac-tap" data-goto="${whole.toPageId}" data-anim="${whole.animation}" style="cursor:pointer;width:100%;height:100%">${inner}</div>`;
  }

  /* 槽位分区（tabbar 均分覆盖层 / 商品网格等 cols 网格均分） */
  let zones = '';
  if (slotLinks.length > 0) {
    const slots = def.slots?.(merged) ?? [];
    const n = Math.max(slots.length, slotLinks.length);
    if (n > 0) {
      const cols = slots.find((s) => s?.cols)?.cols;
      if (cols && cols > 1) {
        /* 网格槽位（如双列商品网格）：cols 列 × N 行逐格覆盖，与卡片一一对应 */
        zones = `<div style="position:absolute;inset:0;z-index:5;display:grid;grid-template-columns:repeat(${cols},1fr);grid-auto-rows:1fr">`;
        for (let i = 0; i < n; i++) {
          const key = slots[i]?.key ?? String(i);
          const conn = slotLinks.find((c) => c.slot === key);
          zones += conn
            ? `<span data-goto="${conn.toPageId}" data-anim="${conn.animation}" style="cursor:pointer" title="${esc(slots[i]?.label ?? key)}"></span>`
            : `<span></span>`;
        }
        zones += `</div>`;
      } else {
        zones = `<div style="position:absolute;inset:0;z-index:5;display:flex">`;
        for (let i = 0; i < n; i++) {
          const key = slots[i]?.key ?? String(i);
          const conn = slotLinks.find((c) => c.slot === key);
          if (conn) {
            zones += `<span data-goto="${conn.toPageId}" data-anim="${conn.animation}" style="flex:1;cursor:pointer" title="${esc(slots[i]?.label ?? key)}"></span>`;
          } else {
            zones += `<span style="flex:1"></span>`;
          }
        }
        zones += `</div>`;
      }
    }
  }

  return inner + zones;
}

/** 页面 → HTML section（free 页面缺坐标时与编辑器一致：按流式堆叠渲染） */
function pageHtml(page: PageData, conns: ConnectionData[], isHome: boolean, render: (node: React.ReactNode) => string): string {
  const visible = page.components.filter((c) => !c.hidden);
  const asFree = page.layout === 'free' && !missingFreeCoords(page.components);
  const inner = asFree
    ? freePageInner(visible, conns, page, render)
    : flowPageInner(visible, conns, page, render);
  return `<section class="ac-page${isHome ? ' ac-cur' : ''}" data-page="${page.id}"${asFree ? ' data-free="1"' : ''}>${inner}</section>`;
}

function freePageInner(list: WidgetInstance[], conns: ConnectionData[], page: PageData, render: (node: React.ReactNode) => string): string {
  let maxBottom = 700;
  const items = list.map((w) => {
    const h = typeof w.h === 'number' ? w.h : undefined;
    maxBottom = Math.max(maxBottom, (w.y ?? 0) + (h ?? 72) + 24);
    const shell = widgetShellHtml(w, conns, page.id, render);
    const hStyle = h !== undefined ? `height:${h}px;overflow:hidden;` : '';
    const opStyle = typeof w.opacity === 'number' ? `opacity:${Math.max(0.05, Math.min(1, w.opacity))};` : '';
    const shStyle = w.shadow ? `filter:${SHADOW_FILTER[w.shadow]};` : '';
    return `<div data-wid="${w.id}" style="position:absolute;left:${w.x ?? 0}px;top:${w.y ?? 0}px;width:${w.w ?? 355}px;${hStyle}${opStyle}${shStyle}">${shell}</div>`;
  });
  return `<div class="ac-free" style="position:relative;width:375px;min-height:${maxBottom}px">${items.join('')}</div>`;
}

function flowPageInner(list: WidgetInstance[], conns: ConnectionData[], page: PageData, render: (node: React.ReactNode) => string): string {
  const items = list.map((w) => {
    const shell = widgetShellHtml(w, conns, page.id, render);
    const width = WIDTH_MAP[w.width ?? 'full'] ?? '100%';
    const isNarrow = (w.width ?? 'full') !== 'full';
    const op = typeof w.opacity === 'number' ? `opacity:${Math.max(0.05, Math.min(1, w.opacity))};` : '';
    const sh = w.shadow ? `filter:${SHADOW_FILTER[w.shadow]};` : '';
    const wrapStyle = `margin-top:${w.mt ?? 0}px;margin-bottom:${w.mb ?? 8}px;${op}${sh}`;
    if (isNarrow) {
      return `<div style="${wrapStyle}display:flex;justify-content:${ALIGN_MAP[w.align ?? 'left']}"><div style="width:${width};max-width:100%">${shell}</div></div>`;
    }
    return `<div style="${wrapStyle}">${shell}</div>`;
  });
  return `<div style="position:relative;width:375px">${items.join('')}</div>`;
}

/** 运行时脚本：页面切换动画 + 点击委托 + 自适应缩放 */
const RUNTIME_JS = `
(function(){
  var cur = document.querySelector('.ac-page.ac-cur');
  var curId = cur ? cur.getAttribute('data-page') : null;
  var screen = document.querySelector('.ac-screen');
  function show(id, anim){
    if (!id || id === curId) return;
    var to = document.querySelector('.ac-page[data-page="'+id+'"]');
    var from = cur;
    if (!to) return;
    if (from) { from.classList.remove('ac-cur','ac-in-slide','ac-in-slide-up','ac-in-slide-down','ac-in-fade','ac-in-push','ac-in-zoom','ac-in-none'); }
    to.classList.add('ac-cur');
    to.classList.remove('ac-in-slide','ac-in-slide-up','ac-in-slide-down','ac-in-fade','ac-in-push','ac-in-zoom','ac-in-none');
    void to.offsetWidth;
    to.classList.add('ac-in-' + (anim || 'slide'));
    to.scrollTop = 0;
    curId = id;
  }
  document.addEventListener('click', function(e){
    var t = e.target;
    var hit = t.closest ? t.closest('[data-goto]') : null;
    if (hit) {
      try { if (navigator.vibrate) navigator.vibrate(8); } catch(_) {}
      show(hit.getAttribute('data-goto'), hit.getAttribute('data-anim'));
    }
  });
  function fit(){
    var stage = document.querySelector('.ac-stage');
    if (!stage) return;
    var s = Math.min(1, (window.innerHeight - 56) / 892, (window.innerWidth - 16) / 415);
    stage.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  fit();
})();
`;

/** 主题注入的运行时样式（动画/手机壳/ac-* 类，独立于项目 CSS） */
const RUNTIME_CSS = `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 20px 8px;
  background: #eceef2 radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  font-family: ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
}
.ac-stage { transform-origin: top center; }
.ac-phone {
  position: relative; width: 395px; height: 852px; padding: 10px; border-radius: 54px;
  background: #09090b; box-shadow: 0 30px 80px -20px rgba(0,0,0,0.45), 0 0 0 1px #27272a inset;
  display: flex; flex-direction: column;
}
.ac-side { position: absolute; width: 3px; background: #27272a; }
.ac-notch { position: absolute; left: 50%; top: 20px; transform: translateX(-50%); width: 110px; height: 26px; border-radius: 999px; background: #09090b; z-index: 30; }
.ac-status { position: relative; z-index: 20; height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 8px 28px 0; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.ac-screen { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; border-radius: 44px; }
.ac-pages { position: relative; flex: 1; min-height: 0; }
.ac-page { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; display: none; scrollbar-width: none; }
.ac-page::-webkit-scrollbar { display: none; }
.ac-page.ac-cur { display: block; }
.ac-homebar { position: relative; z-index: 20; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ac-homebar i { display: block; width: 128px; height: 4px; border-radius: 999px; background: rgba(0,0,0,0.25); }
.pd .ac-homebar i { background: rgba(255,255,255,0.35); }
.ac-tap { transition: transform 0.12s ease; }
.ac-tap:active { transform: scale(0.97); }
@keyframes acSlideIn { from { transform: translateX(40%); opacity: 0.4; } to { transform: translateX(0); opacity: 1; } }
@keyframes acFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes acPushIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes acSlideUpIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes acSlideDownIn { from { transform: translateY(-100%); } to { transform: translateY(0); } }
@keyframes acZoomIn { from { transform: scale(0.55); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.ac-in-slide { animation: acSlideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
.ac-in-fade { animation: acFadeIn 0.25s ease; }
.ac-in-push { animation: acPushIn 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.ac-in-slide-up { animation: acSlideUpIn 0.34s cubic-bezier(0.32, 0.72, 0, 1); }
.ac-in-slide-down { animation: acSlideDownIn 0.34s cubic-bezier(0.32, 0.72, 0, 1); }
.ac-in-zoom { animation: acZoomIn 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.ac-in-none { animation: none; }
.ac-credit { font-size: 11px; color: #a1a1aa; }
.ac-credit b { color: #52525b; font-weight: 700; }
`;

export interface ExportHtmlPayload {
  name: string;
  description?: string | null;
  theme: ThemeConfig;
  pages: PageData[];
  connections: ConnectionData[];
}

/* ---------------------------------- 通用工具 ---------------------------------- */

/** 文件名安全化（过滤路径非法字符） */
const safeName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-').trim() || 'appcraft-app';

/** 触发浏览器下载 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** SVG 字符串 → data URL */
const svgToDataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** SVG 字符串 → PNG（浏览器 canvas 光栅化，供 PWA manifest / apple-touch-icon 使用） */
function svgToPngBytes(svg: string, size: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('canvas 2d 不可用');
        ctx.drawImage(img, 0, 0, size, size);
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
        if (!blob) throw new Error('PNG 编码失败');
        resolve(new Uint8Array(await blob.arrayBuffer()));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('图标渲染失败'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/** PWA manifest 对象（icons 由调用方按模式传入：单文件=SVG data URL / 安装包=PNG 文件） */
function buildManifestObj(
  payload: ExportHtmlPayload,
  icons: { src: string; sizes: string; type: string; purpose: string }[]
) {
  const { theme, name } = payload;
  const home = payload.pages.find((p) => p.isHome) ?? payload.pages[0];
  const bg = theme.dark && home?.background === '#f6f7fb' ? '#101014' : home?.background ?? '#f6f7fb';
  return {
    name: name || 'AppCraft App',
    short_name: name || 'App',
    description: payload.description || '',
    start_url: './',
    scope: './',
    display: 'standalone',
    orientation: 'portrait',
    background_color: bg,
    theme_color: theme.primary,
    icons,
  };
}

/* --------------------------------- PWA 安装包资源 --------------------------------- */

/** Service Worker：cache-first 离线缓存（安装后无网可用） */
const SW_JS = `/* AppCraft Studio 生成 —— 离线缓存 */
var CACHE = 'appcraft-app-v1';
var ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(e.request).then(function (res) {
      try { caches.open(CACHE).then(function (c) { c.put(e.request, res.clone()); }); } catch (_) {}
      return res;
    }).catch(function () { return caches.match('./index.html'); });
  }));
});
`;

const SW_REGISTER_HTML = `<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').catch(function(){})})}</script>`;

/** PWA 安装包内 README（中文安装测试指南） */
function buildReadme(name: string): string {
  return `《${name || '我的 App'}》PWA 安装包 —— 来自 AppCraft Studio
====================================================

【包内容】
  index.html        App 主体（双击即可在浏览器打开体验，离线可用）
  manifest.json     应用信息（名称 / 图标 / 主题色，安装到桌面时使用）
  sw.js             离线缓存脚本（安装后无网也能用）
  icon-192.png      应用图标（Android / 桌面快捷方式）
  icon-512.png      应用图标（高清启动屏 / 应用商店粒度）
  README.txt        本说明

【方式一 · 电脑本地体验（最简单）】
  直接双击 index.html，任何现代浏览器都能打开，无需联网。

【方式二 · 手机真机安装测试（推荐）】
  前提：手机与电脑连同一个 Wi-Fi。
  1. 电脑在本文件夹打开终端，任选一条命令启动静态服务器：
       Python:  python -m http.server 8080
       Node.js: npx serve -l 8080 .
  2. 查看电脑局域网 IP：
       Windows: ipconfig    macOS: ifconfig    Linux: hostname -I
  3. 手机浏览器访问  http://电脑IP:8080
  4. 安装到桌面：
       Android (Chrome)  →  右上角菜单 →「添加到主屏幕」/「安装应用」
       iPhone  (Safari)  →  底部分享按钮 →「添加到主屏幕」
  5. 桌面出现 App 图标，打开即为全屏独立应用（无浏览器地址栏）。

【方式三 · 公网发布（可发给朋友安装，体验最完整）】
  把整个文件夹上传到任意静态托管，即可获得 https 链接：
  · GitHub Pages：建仓库上传 → Settings → Pages → 选择分支
  · Vercel / Netlify：官网拖拽上传本文件夹
  得到 https:// 链接后，手机打开 → 按方式二第 4 步安装。
  Android Chrome 在 https 下会显示完整的「安装应用」弹窗。

【小贴士】
  · 「安装到桌面」需要 http(s) 环境：直接双击 index.html（file:// 协议）
    能正常浏览，但浏览器不会出现「安装」选项，属于正常现象。
  · 所有页面跳转、切换动画、主题配色已内置，无需任何后端服务。
  · 由 AppCraft Studio 生成。
`;
}

/* --------------------------------- HTML 生成核心 --------------------------------- */

interface ExportHtmlOptions {
  /** manifest 引用：data URL（单文件模式）或 './manifest.json'（PWA 安装包模式） */
  manifestHref: string;
  /** 图标引用（favicon + apple-touch-icon） */
  iconHref: string;
  /** 是否注册 sw.js（PWA 安装包模式） */
  registerSw: boolean;
}

/** 生成导出 HTML 字符串（单文件导出与 PWA 安装包共用） */
async function buildExportHtml(payload: ExportHtmlPayload, opts: ExportHtmlOptions): Promise<string> {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { pages, connections, theme, name } = payload;

  if (pages.length === 0) throw new Error('empty');

  const home = pages.find((p) => p.isHome) ?? pages[0];
  const dark = theme.dark;
  const bg = dark && home.background === '#f6f7fb' ? '#101014' : home.background;

  const statusColor = dark ? '#ffffff' : '#18181b';

  /* 状态栏右侧图标（内联 SVG，不依赖文档 CSS） */
  const signalSvg = '<svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor"><rect x="0" y="7" width="2.5" height="4" rx="0.8"/><rect x="4" y="5" width="2.5" height="6" rx="0.8"/><rect x="8" y="2.5" width="2.5" height="8.5" rx="0.8"/><rect x="12" y="0" width="2.5" height="11" rx="0.8"/></svg>';
  const wifiSvg = '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 9.6a1.4 1.4 0 1 1 0 2.4 1.4 1.4 0 0 1 0-2.4z"/><path d="M4.9 8.2a4.6 4.6 0 0 1 6.2 0l-1.2 1.3a2.9 2.9 0 0 0-3.8 0L4.9 8.2z"/><path d="M2.2 5.5a8.3 8.3 0 0 1 11.6 0l-1.2 1.3a6.6 6.6 0 0 0-9.2 0L2.2 5.5z"/></svg>';
  const battSvg = '<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4"/><rect x="2" y="2" width="18" height="8" rx="1.6" fill="currentColor"/><path d="M23 4v4c1-0.3 1.6-1 1.6-2S24 4.3 23 4z" fill="currentColor" opacity="0.4"/></svg>';

  const sections = pages.map((p) => pageHtml(p, connections, p.id === home.id, (node) => renderToStaticMarkup(node))).join('\n');

  const css = await collectCss();

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(name)}</title>
${payload.description ? `<meta name="description" content="${esc(payload.description)}" />` : ''}
<meta name="theme-color" content="${esc(theme.primary)}" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="${dark ? 'black-translucent' : 'default'}" />
<meta name="apple-mobile-web-app-title" content="${esc(name)}" />
<link rel="icon" href="${opts.iconHref}" />
<link rel="apple-touch-icon" href="${opts.iconHref}" />
<link rel="manifest" href="${opts.manifestHref}" />
<style>${css}</style>
<style>${RUNTIME_CSS}</style>
</head>
<body>
<div class="ac-stage">
  <div class="ac-phone">
    <span class="ac-side" style="left:-3px;top:128px;height:64px;border-radius:3px 0 0 3px"></span>
    <span class="ac-side" style="left:-3px;top:208px;height:40px;border-radius:3px 0 0 3px"></span>
    <span class="ac-side" style="right:-3px;top:160px;height:80px;border-radius:0 3px 3px 0"></span>
    <div class="ac-screen${dark ? ' pd' : ''}" style="background:${esc(bg)};color:${dark ? '#ececf1' : '#1c1c21'};--p:${esc(theme.primary)};--pf:${esc(contrastOn(theme.primary))};--pr:${esc(RADIUS_MAP[theme.radius])}">
      <span class="ac-notch"></span>
      <div class="ac-status" style="color:${statusColor}">
        <span>9:41</span>
        <span style="display:flex;align-items:center;gap:6px">${signalSvg}${wifiSvg}${battSvg}</span>
      </div>
      <div class="ac-pages">${sections}</div>
      <div class="ac-homebar"><i></i></div>
    </div>
  </div>
</div>
<p class="ac-credit">由 <b>AppCraft Studio</b> 导出 · ${esc(name)} · ${pages.length} 个页面 · ${connections.length} 条跳转</p>
<script>${RUNTIME_JS}</script>
${opts.registerSw ? SW_REGISTER_HTML : ''}
</body>
</html>`;

  return html;
}

/* --------------------------------- 两个导出入口 --------------------------------- */

/** 导出单文件 HTML App（双击即开；manifest 内联 data URL，离线可用；返回文件名；失败抛错） */
export async function exportHtmlApp(payload: ExportHtmlPayload): Promise<string> {
  const { theme, name } = payload;
  const iconSvg = appIconSvg(theme, name);
  const iconDataUrl = svgToDataUrl(iconSvg);
  const manifest = buildManifestObj(payload, [
    { src: iconDataUrl, sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
  ]);
  const html = await buildExportHtml(payload, {
    manifestHref: `data:application/manifest+json,${encodeURIComponent(JSON.stringify(manifest))}`,
    iconHref: iconDataUrl,
    registerSw: false,
  });
  const filename = `${safeName(name)}.html`;
  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), filename);
  return filename;
}

/** 导出 PWA 安装包 ZIP：解压后经 http(s) 访问即可「安装到手机桌面」（返回文件名；失败抛错） */
export async function exportPwaZip(payload: ExportHtmlPayload): Promise<string> {
  const { zipSync, strToU8 } = await import('fflate');
  const { theme, name } = payload;

  const iconSvg = appIconSvg(theme, name);
  const [icon192, icon512] = await Promise.all([svgToPngBytes(iconSvg, 192), svgToPngBytes(iconSvg, 512)]);
  const manifest = buildManifestObj(payload, [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ]);
  const html = await buildExportHtml(payload, { manifestHref: './manifest.json', iconHref: 'icon-192.png', registerSw: true });

  const zip = zipSync({
    'index.html': strToU8(html),
    'manifest.json': strToU8(JSON.stringify(manifest, null, 2)),
    'sw.js': strToU8(SW_JS),
    'icon-192.png': icon192,
    'icon-512.png': icon512,
    'README.txt': strToU8(buildReadme(name)),
  });

  const filename = `${safeName(name)}-PWA.zip`;
  downloadBlob(new Blob([zip], { type: 'application/zip' }), filename);
  return filename;
}
