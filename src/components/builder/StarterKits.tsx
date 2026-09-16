'use client';

/**
 * 空画布小白引导（产品体验重设计核心件）：
 * 小白第一次进来最怕"空"——不知道从哪下手。
 * 这里给出 3 步说明 + 3 套「一键铺满」示例套装：
 * 点一下即得一个调好文案的成品页面，改字就能变成自己的 App。
 */
import { useState } from 'react';
import {
  ShoppingBag, Users, BarChart3, MousePointerClick, Smartphone, Eye, WandSparkles, ChevronRight,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { getWidget } from '@/components/widgets/registry';
import { toast } from 'sonner';

interface KitItem {
  type: string;
  presetId: string;
}

interface StarterKit {
  id: string;
  name: string;
  desc: string;
  icon: typeof ShoppingBag;
  color: string;
  items: KitItem[];
}

/** 预设 props 从 presets 模块按 id 查找（避免直接 import 造成循环依赖，走运行时查表） */
import { allPresets } from '@/lib/presets';

const KITS: StarterKit[] = [
  {
    id: 'mall',
    name: '商城首页',
    desc: '搜索 + 大促 Banner + 金刚区 + 商品卡',
    icon: ShoppingBag,
    color: '#f43f5e',
    items: [
      { type: 'mall.search', presetId: 'mall.search::商城通用搜索栏' },
      { type: 'mall.banner', presetId: 'mall.banner::618-年中大促-banner' },
      { type: 'mall.notice-bar', presetId: 'mall.notice-bar::上新公告' },
      { type: 'mall.category-grid', presetId: 'mall.category-grid::美妆护肤金刚区' },
      { type: 'mall.section-header', presetId: 'mall.section-header::热卖推荐标题行' },
      { type: 'mall.product-card', presetId: 'mall.product-card::法式连衣裙商品卡' },
      { type: 'mall.product-card', presetId: 'mall.product-card::降噪耳机商品卡' },
      { type: 'fn.tabbar', presetId: 'fn.tabbar::电商四标签底栏' },
    ],
  },
  {
    id: 'social',
    name: '社区动态',
    desc: '标题栏 + 动态卡 + 点赞栏 + 底栏',
    icon: Users,
    color: '#ec4899',
    items: [
      { type: 'fn.navbar', presetId: 'fn.navbar::首页标题栏' },
      { type: 'social.feed-card', presetId: 'social.feed-card::旅行博主动态卡' },
      { type: 'social.action-bar', presetId: 'social.action-bar::常规动态互动栏' },
      { type: 'social.feed-card', presetId: 'social.feed-card::美食探店笔记卡' },
      { type: 'social.action-bar', presetId: 'social.action-bar::爆款笔记互动栏' },
      { type: 'fn.tabbar', presetId: 'fn.tabbar::社交四标签底栏' },
    ],
  },
  {
    id: 'dashboard',
    name: '经营看板',
    desc: 'KPI 指标卡 + 经营数据 + 订单行',
    icon: BarChart3,
    color: '#14b8a6',
    items: [
      { type: 'fn.navbar', presetId: 'fn.navbar::首页标题栏' },
      { type: 'chart.kpi-card', presetId: 'chart.kpi-card::今日销售额指标' },
      { type: 'chart.kpi-card', presetId: 'chart.kpi-card::下单转化率' },
      { type: 'chart.kpi-card', presetId: 'chart.kpi-card::今日新增用户' },
      { type: 'fn.stat-card', presetId: 'fn.stat-card::店铺月度经营卡' },
      { type: 'fn.list-item', presetId: 'fn.list-item::订单状态行' },
    ],
  },
];

const STEPS = [
  { icon: WandSparkles, text: '挑一套下面喜欢的，点一下铺满页面' },
  { icon: MousePointerClick, text: '点组件改文案，拖动换位置' },
  { icon: Eye, text: '点右上「预览」，立刻变成能用的 App' },
];

/** 空画布引导卡：3 步说明 + 示例套装一键铺满 */
export function CanvasStarterGuide() {
  const addWidget = useBuilder((s) => s.addWidget);
  const pages = useBuilder((s) => s.pages);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const [busyKit, setBusyKit] = useState<string | null>(null);

  const page = pages.find((p) => p.id === currentPageId);
  const isFree = page?.layout === 'free';

  /** 一键铺满：按套装顺序把预设成品写入画布（自由布局自动向下排列） */
  const applyKit = (kit: StarterKit) => {
    if (busyKit) return;
    setBusyKit(kit.id);
    let ok = 0;
    for (const item of kit.items) {
      const def = getWidget(item.type);
      if (!def) continue;
      const preset = allPresets.find((pr) => pr.id === item.presetId);
      addWidget(item.type, undefined, undefined, preset?.props);
      ok += 1;
    }
    setBusyKit(null);
    if (ok > 0) {
      toast.success(`已放入 ${ok} 个组件！点组件改文案，就是你自己的了`, { duration: 3500 });
    } else {
      toast.error('放入失败，请从左侧组件仓库手动添加');
    }
  };

  return (
    <div className="m-3 rounded-2xl border-2 border-dashed border-orange-200 bg-gradient-to-b from-orange-50/80 to-white px-4 py-5 text-center">
      <p className="text-base font-black text-zinc-800">3 步搓出你的专属 App</p>
      <ol className="mx-auto mt-3 max-w-[300px] space-y-1.5 text-left">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-xs leading-5 text-zinc-500">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
              {i + 1}
            </span>
            <s.icon className="size-3.5 shrink-0 text-orange-400" />
            <span className="min-w-0 flex-1">{s.text}</span>
          </li>
        ))}
      </ol>

      <p className="mt-4 mb-2 flex items-center justify-center gap-1 text-[11px] font-semibold text-zinc-400">
        <Smartphone className="size-3" /> 选个场景，一键铺满：
      </p>
      <div className="grid grid-cols-3 gap-2">
        {KITS.map((kit) => {
          const busy = busyKit === kit.id;
          return (
            <button
              key={kit.id}
              onClick={() => applyKit(kit)}
              disabled={!!busyKit}
              aria-label={`一键铺满${kit.name}示例`}
              className="group flex min-h-[44px] flex-col items-center gap-1 rounded-xl border border-zinc-200 bg-white px-1.5 py-2.5 transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              <span
                className="flex size-8 items-center justify-center rounded-lg text-white shadow-sm transition-transform group-hover:scale-110"
                style={{ background: kit.color }}
              >
                <kit.icon className="size-4" />
              </span>
              <span className="text-[11px] font-bold text-zinc-700">{kit.name}</span>
              <span className="line-clamp-1 text-[9px] leading-3 text-zinc-400">{kit.desc}</span>
              <span
                className="mt-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
                style={{ background: kit.color }}
              >
                <WandSparkles className="size-2.5" /> {busy ? '放入中…' : '一键铺满'}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] leading-4 text-zinc-400">
        也可以从左侧组件仓库挑选 {isFree ? '拖入' : '点击添加'} —— 上千个成品模块任你挑
        <ChevronRight className="inline size-3" />
      </p>
    </div>
  );
}
