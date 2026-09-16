'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles, LockKeyhole, ShoppingBag, MessageCircle, UtensilsCrossed, LayoutGrid,
  Plus, Play, GitBranch, Pencil, Crown, Trash2, MoreVertical, Clock, Boxes, Layers3,
  PenLine,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { templates } from '@/lib/templates';
import { categories } from '@/components/widgets/registry';
import { totalModules } from '@/lib/presets';
import { ProjectThumb, parseThemeConfig, type ThumbData } from './ProjectThumb';
import { AppIconBadge } from './AppIconBadge';
import type { ThemeConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const TEMPLATE_ICONS: Record<string, typeof Sparkles> = {
  Sparkles, LockKeyhole, ShoppingBag, MessageCircle, UtensilsCrossed, LayoutGrid,
};

/** 组件库总模块数（基础组件 + 精选预设，1000+） */
const WIDGET_TOTAL = totalModules;

const GRADIENTS: Record<string, string> = {
  blank: 'from-zinc-400 to-zinc-600',
  'login-demo': 'from-emerald-400 to-teal-500',
  'mall-demo': 'from-rose-400 to-pink-500',
  'chat-demo': 'from-green-400 to-emerald-500',
  'food-demo': 'from-orange-400 to-amber-500',
  'tool-demo': 'from-violet-400 to-purple-500',
};

/** 三步上手（小白引导） */
const STEPS = [
  { icon: Pencil, title: '第 1 步 · 选起点', desc: '选套模板一键套用，或空白自己搭' },
  { icon: Boxes, title: '第 2 步 · 拖拽加内容', desc: '上千个成品组件点一下就进页面，改字即用' },
  { icon: Play, title: '第 3 步 · 预览与上架', desc: '随时预览真实效果，一键上架生成可分享版本' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d} 天前` : new Date(iso).toLocaleDateString('zh-CN');
}

/* 列表项上的缩略扩展字段（API 新增，类型未动） */
type WithPreview = { theme?: string | null; preview?: ThumbData | null };
const previewOf = <T extends object>(item: T): ThumbData | null =>
  (item as T & WithPreview).preview ?? null;
const themeOf = <T extends object>(item: T): ThemeConfig | null =>
  parseThemeConfig((item as T & WithPreview).theme);

/** 首页：我的应用 + 模板中心 + 已上架应用 */
export function ProjectHome() {
  const projects = useBuilder((s) => s.projects);
  const publishes = useBuilder((s) => s.publishes);
  const homeLoading = useBuilder((s) => s.homeLoading);
  const homeLoaded = useBuilder((s) => s.homeLoaded);
  const loadHome = useBuilder((s) => s.loadHome);
  const createProject = useBuilder((s) => s.createProject);
  const deleteProject = useBuilder((s) => s.deleteProject);
  const renameProject = useBuilder((s) => s.renameProject);
  const openProject = useBuilder((s) => s.openProject);
  const setView = useBuilder((s) => s.setView);
  const openPublishPreview = useBuilder((s) => s.openPublishPreview);

  const [createOpen, setCreateOpen] = useState(false);
  const [tplId, setTplId] = useState('blank');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!homeLoaded) loadHome();
  }, [homeLoaded, loadHome]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('先给 App 起个名字吧');
      return;
    }
    setCreating(true);
    await createProject(name.trim(), '', tplId);
    setCreating(false);
    setCreateOpen(false);
    setName('');
    toast.success('创建成功，开始搭建吧！');
  };

  const totalWidgets = projects.reduce((n, p) => n + (p._count?.pages ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-16">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="size-3.5" /> 拖拽式 · 零代码 · 所见即所得
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">AppCraft Studio</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/90 sm:text-base">
            像搭积木一样 DIY 你的专属 App：{WIDGET_TOTAL} 个成品模块（可用的组件 + 调好文案的预设）
            、{categories.length} 大功能目录，不用懂代码，拖一拖就能搓出能用的 App。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur">{WIDGET_TOTAL} 可用模块</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur">{categories.length} 大目录</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur">{templates.length} 套模板</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur">流程图连接</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur">暗色主题</span>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-5" /> 立即创建我的 App
            </Button>
            <span className="hidden items-center gap-1.5 text-xs font-semibold text-white/90 sm:flex">
              <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">① 选模板/空白</span>
              <span className="text-white/60">→</span>
              <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">② 拖组件改文案</span>
              <span className="text-white/60">→</span>
              <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">③ 预览上架</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* 我的应用 */}
        <section className="pt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Boxes className="size-5 text-orange-500" /> 我的应用
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-500">{projects.length}</span>
            </h2>
            <span className="hidden text-xs text-zinc-400 sm:block">共 {totalWidgets} 个页面</span>
          </div>

          {homeLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[210px] rounded-2xl" />)}
            </div>
          ) : projects.length === 0 ? (
            /* 空状态：三步上手引导 + 模板直达（小白第一次进来就能看懂怎么开始） */
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-rose-50 p-5 ring-1 ring-orange-100">
                <p className="text-base font-black text-zinc-800">还没有应用，3 步开始：</p>
                <ol className="mt-3 space-y-3">
                  {STEPS.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-orange-100">
                        <s.icon className="size-3.5 text-orange-500" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-zinc-700">{s.title}</span>
                        <span className="block text-[11px] leading-4 text-zinc-400">{s.desc}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <Button size="sm" className="mt-4 w-full bg-orange-500 hover:bg-orange-600" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-4" /> 从下面挑一套模板开始
                </Button>
              </div>
              {templates.filter((t) => t.id !== 'blank').map((t) => {
                const Icon = TEMPLATE_ICONS[t.icon] ?? Sparkles;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setTplId(t.id); setCreateOpen(true); }}
                    className="group flex min-h-[210px] flex-col rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-zinc-200 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENTS[t.id]} text-white shadow-sm`}>
                      <Icon className="size-5" />
                    </span>
                    <span className="mt-3 flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                      {t.name}
                      <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">一键套用</span>
                    </span>
                    <span className="mt-1 line-clamp-2 flex-1 text-xs leading-5 text-zinc-400">{t.desc}</span>
                    <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-orange-500">
                      含 {t.pages.length} 个预置页面，套用即得完整 App →
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* 新建卡片 */}
              <button
                onClick={() => setCreateOpen(true)}
                className="flex min-h-[210px] min-w-11 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-white/50 text-zinc-400 transition-all hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-500"
              >
                <Plus className="size-8" />
                <span className="text-sm font-semibold">新建空白 / 模板 App</span>
              </button>

              {projects.map((p) => {
                const tpl = templates.find((t) => t.id === p.template);
                const grad = GRADIENTS[p.template ?? 'blank'] ?? 'from-orange-400 to-rose-500';
                const Icon = TEMPLATE_ICONS[tpl?.icon ?? 'Sparkles'] ?? Sparkles;
                const pv = previewOf(p);
                return (
                  <div
                    key={p.id}
                    className="group flex gap-3.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-zinc-300"
                  >
                    {/* 左：迷你实时封面（预览数据缺失时回退模板渐变块） */}
                    <div className="shrink-0">
                      {pv ? (
                        <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-zinc-200">
                          <ProjectThumb
                            background={pv.background}
                            layout={pv.layout}
                            components={pv.components}
                            theme={themeOf(p)}
                            name={p.name}
                            width={86}
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex h-[186px] w-[86px] flex-col items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br ${grad} text-white shadow-sm ring-1 ring-black/5`}
                        >
                          <Icon className="size-7 opacity-90" />
                          <span className="text-base font-black opacity-80">{p.name.slice(0, 1)}</span>
                        </div>
                      )}
                    </div>
                    {/* 右：信息列 */}
                    <div className="flex min-w-0 flex-1 flex-col py-0.5">
                      <div className="flex items-start gap-1.5">
                        <AppIconBadge
                          primary={themeOf(p)?.primary ?? '#f97316'}
                          icon={themeOf(p)?.icon}
                          bg={themeOf(p)?.iconBG}
                          name={p.name}
                          size={24}
                          className="mt-0.5"
                        />
                        <h3 className="min-w-0 flex-1 truncate text-[15px] font-bold text-zinc-900">{p.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" aria-label="更多操作">
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setRenameTarget({ id: p.id, name: p.name })}>
                              <PenLine className="mr-1.5 size-3.5" /> 重命名
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-500 focus:text-rose-600" onClick={() => setDeleteTarget({ id: p.id, name: p.name })}>
                              <Trash2 className="mr-1.5 size-3.5" /> 删除应用
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-zinc-400">{p.description || tpl?.desc || '暂无简介'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1"><Layers3 className="size-3 text-zinc-400" /> {p._count?.pages ?? 0} 页面</span>
                        <span className="flex items-center gap-1"><GitBranch className="size-3 text-zinc-400" /> {p._count?.connections ?? 0} 连接</span>
                        <span className="flex items-center gap-1 text-zinc-400"><Clock className="size-3" /> {p.updatedAt ? timeAgo(p.updatedAt) : ''}</span>
                      </div>
                      <div className="mt-auto flex items-center gap-1.5 pt-2.5">
                        <Button size="sm" className="h-8 flex-1" onClick={() => openProject(p.id)}>
                          <Pencil className="size-3.5" /> 编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 border-violet-200 px-3 text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          title="无限画布：俯瞰全部页面、画板内直接编辑、拖拽连线"
                          onClick={async () => { await openProject(p.id); setView('canvas'); }}
                        >
                          <GitBranch className="size-3.5" /> <span className="hidden sm:inline">无限画布</span>
                        </Button>
                        <Button size="sm" variant="outline" className="h-8" title="预览" aria-label="预览" onClick={async () => { await openProject(p.id); setView('preview'); }}>
                          <Play className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 已上架应用 */}
        <section className="pt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Crown className="size-5 text-amber-500" /> 已上架应用
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-500">{publishes.length}</span>
          </h2>
          {publishes.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white/60 px-6 py-10 text-center text-sm text-zinc-400">
              还没有上架的应用 —— 编辑器里点击「上架」即可生成版本快照
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publishes.map((pub) => {
                const pv = previewOf(pub);
                return (
                  <div
                    key={pub.id}
                    className="flex gap-3.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-zinc-300"
                  >
                    {/* 左：迷你实时封面（快照缺失时回退 Crown 渐变块） */}
                    <div className="shrink-0">
                      {pv ? (
                        <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-zinc-200">
                          <ProjectThumb
                            background={pv.background}
                            layout={pv.layout}
                            components={pv.components}
                            theme={themeOf(pub)}
                            name={pub.name}
                            width={72}
                          />
                        </div>
                      ) : (
                        <div className="flex h-[156px] w-[72px] items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm ring-1 ring-black/5">
                          <Crown className="size-6 opacity-90" />
                        </div>
                      )}
                    </div>
                    {/* 右：信息列 */}
                    <div className="flex min-w-0 flex-1 flex-col py-0.5">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                        <AppIconBadge
                          primary={themeOf(pub)?.primary ?? '#f59e0b'}
                          icon={themeOf(pub)?.icon}
                          bg={themeOf(pub)?.iconBG}
                          name={pub.name}
                          size={22}
                        />
                        <span className="min-w-0 flex-1 truncate">{pub.name}</span>
                        <span className="shrink-0 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-600">v1.{pub.version}</span>
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-zinc-400">{pub.description || '暂无简介'}</p>
                      <p className="mt-auto truncate text-[10px] text-zinc-300">
                        {timeAgo(pub.createdAt)} 上架{pub.projectName ? ` · ${pub.projectName}` : ''}
                      </p>
                      <Button size="sm" variant="outline" className="mt-2 h-8 w-fit" onClick={() => openPublishPreview(pub.id)}>
                        <Play className="size-3.5" /> 预览
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 创建对话框 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>创建新 App</DialogTitle>
            <DialogDescription>选择一个模板或从空白开始，创建后进入编辑器</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500">App 名称</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：星云商城" onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500">选择模板（可选）</label>
              <div className="grid max-h-64 gap-2 overflow-y-auto thin-scroll sm:grid-cols-3">
                {templates.map((t) => {
                  const Icon = TEMPLATE_ICONS[t.icon] ?? Sparkles;
                  const active = tplId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTplId(t.id)}
                      className={`flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 text-left transition-all ${
                        active ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <span className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${GRADIENTS[t.id]} text-white`}>
                        <Icon className="size-4.5" />
                      </span>
                      <span className="text-xs font-bold">{t.name}</span>
                      <span className="line-clamp-2 text-[10px] leading-4 text-zinc-400">{t.desc}</span>
                      <span className="text-[10px] text-zinc-300">{t.pages.length} 个预置页面</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-orange-500 text-white hover:bg-orange-600">
              {creating ? '创建中…' : '创建并进入编辑器'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重命名对话框 */}
      <Dialog open={!!renameTarget} onOpenChange={(b) => !b && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>重命名应用</DialogTitle>
            <DialogDescription>修改后自动保存</DialogDescription>
          </DialogHeader>
          <Input
            value={renameTarget?.name ?? ''}
            onChange={(e) => setRenameTarget((t) => (t ? { ...t, name: e.target.value } : t))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renameTarget) {
                renameProject(renameTarget.id, renameTarget.name.trim() || renameTarget.name);
                setRenameTarget(null);
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>取消</Button>
            <Button
              onClick={() => {
                if (renameTarget) renameProject(renameTarget.id, renameTarget.name.trim() || renameTarget.name);
                setRenameTarget(null);
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(b) => !b && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除「{deleteTarget?.name}」？</AlertDialogTitle>
            <AlertDialogDescription>
              应用及其所有页面、连接、上架记录将被永久删除，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600"
              onClick={async () => {
                if (deleteTarget) await deleteProject(deleteTarget.id);
                setDeleteTarget(null);
                toast.success('已删除');
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
