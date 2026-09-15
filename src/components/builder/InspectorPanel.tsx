'use client';

import { useMemo, useState } from 'react';
import {
  SlidersHorizontal, LayoutPanelLeft, Zap, X, Trash2, Copy, Palette,
  Home, Plus, Link2, ArrowRight, CheckCircle2, Crown, Move3d, Maximize2,
  Layers, LockOpen,
} from 'lucide-react';
import { useBuilder } from '@/lib/store';
import { getWidget } from '@/components/widgets/registry';
import { SHADOW_FILTER, SHADOW_OPTS, ANIM_OPTS } from '@/lib/types';
import type { AnimKind } from '@/lib/types';
import { LayerList } from './LayerPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { PropField } from '@/lib/widget-types';
import type { WidgetInstance } from '@/lib/types';
import { AppIconPicker } from './AppIconBadge';

const THEME_COLORS = [
  '#f97316', '#f43f5e', '#10b981', '#22c55e', '#8b5cf6',
  '#f59e0b', '#e11d48', '#14b8a6', '#a855f7', '#64748b',
];

const BG_PRESETS = ['#f6f7fb', '#ffffff', '#fdf6ec', '#f0fdf4', '#faf5ff', '#101014'];

/** 右侧面板：属性 / 布局 / 交互 / 页面设置 / 主题 */
export function InspectorPanel() {
  const pages = useBuilder((s) => s.pages);
  const currentPageId = useBuilder((s) => s.currentPageId);
  const selectedWidgetId = useBuilder((s) => s.selectedWidgetId);
  const theme = useBuilder((s) => s.project?.theme);
  const connections = useBuilder((s) => s.connections);
  const select = useBuilder((s) => s.select);
  const updateWidget = useBuilder((s) => s.updateWidget);
  const updateWidgetProps = useBuilder((s) => s.updateWidgetProps);
  const removeWidget = useBuilder((s) => s.removeWidget);
  const duplicateWidget = useBuilder((s) => s.duplicateWidget);
  const updatePage = useBuilder((s) => s.updatePage);
  const removePage = useBuilder((s) => s.removePage);
  const addConnection = useBuilder((s) => s.addConnection);
  const removeConnection = useBuilder((s) => s.removeConnection);
  const updateTheme = useBuilder((s) => s.updateTheme);

  const page = pages.find((p) => p.id === currentPageId);
  const widget = page?.components.find((c) => c.id === selectedWidgetId) ?? null;
  const def = widget ? getWidget(widget.type) : null;

  if (!page || !theme) return null;

  /* ---------- 选中组件：属性 / 布局 / 交互 ---------- */
  if (widget && def) {
    const fromConnections = connections.filter(
      (c) => c.fromPageId === page.id && c.fromWidgetId === widget.id
    );
    const mergedProps = { ...def.defaultProps, ...widget.props };
    const widgetSlots = def.slots?.(mergedProps) ?? [];
    return (
      <aside className="flex w-[320px] shrink-0 flex-col border-l bg-white" aria-label="属性面板">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <def.icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{def.name}</p>
            <p className="truncate text-[10px] text-zinc-400">{def.type}</p>
          </div>
          <Button variant="ghost" size="icon" className="size-7" title="复制" onClick={() => duplicateWidget(widget.id)}>
            <Copy className="size-3.5" />
          </Button>
          {widget.locked && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
              title="解锁（当前已锁定：不可拖动/缩放/删除）"
              onClick={() => updateWidget(widget.id, { locked: false })}
            >
              <LockOpen className="size-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="size-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600" title="删除" onClick={() => removeWidget(widget.id)}>
            <Trash2 className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7" title="取消选中" onClick={() => select(null)}>
            <X className="size-3.5" />
          </Button>
        </div>

        {/* key 强制在「组件选中⇄未选中」两分支间切换时重新挂载 Tabs，避免 Radix 内部 value 残留导致全部 tab 未选中 */}
        <Tabs key="widget-tabs" defaultValue="props" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-4 mt-3 grid grid-cols-4">
            <TabsTrigger value="props" className="text-xs"><SlidersHorizontal className="mr-1 size-3" />属性</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs"><LayoutPanelLeft className="mr-1 size-3" />布局</TabsTrigger>
            <TabsTrigger value="action" className="text-xs"><Zap className="mr-1 size-3" />交互</TabsTrigger>
            <TabsTrigger value="layers" className="text-xs"><Layers className="mr-1 size-3" />图层</TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 thin-scroll">
            <TabsContent value="props" className="mt-0 space-y-4">
              {def.fields.map((f) => (
                <FieldControl
                  key={f.key}
                  field={f}
                  value={widget.props[f.key]}
                  onChange={(v) => updateWidgetProps(widget.id, { [f.key]: v })}
                />
              ))}
              {def.fields.length === 0 && <p className="text-xs text-zinc-400">该组件没有可配置属性</p>}
            </TabsContent>

            <TabsContent value="layout" className="mt-0 space-y-5">
              {page.layout === 'free' ? (
                <>
                  <div className="rounded-xl bg-zinc-50 p-3 text-[11px] leading-4 text-zinc-500">
                    当前页面为<span className="font-bold text-zinc-700">自由布局</span>：在画布上直接拖动组件任意摆放，
                    选中后拖动四角/四边手柄调整大小，自动吸附网格与相邻组件。
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumField label="X 位置" value={widget.x ?? 0} min={0} max={375} onChange={(v) => updateWidget(widget.id, { x: v })} />
                    <NumField label="Y 位置" value={widget.y ?? 0} min={0} max={4000} onChange={(v) => updateWidget(widget.id, { y: v })} />
                    <NumField label="宽度" value={widget.w ?? 355} min={48} max={375} onChange={(v) => updateWidget(widget.id, { w: v })} />
                    <div>
                      <Label>高度（空 = 自动）</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={typeof widget.h === 'number' ? widget.h : ''}
                        placeholder="自动"
                        onChange={(e) => updateWidget(widget.id, { h: e.target.value === '' ? undefined : Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => updateWidget(widget.id, { h: undefined })}
                  >
                    <Maximize2 className="mr-1 size-3.5" /> 恢复自动高度
                  </Button>
                  <AppearanceFields widget={widget} onUpdate={updateWidget} />
                </>
              ) : (
                <>
              <div>
                <Label>宽度</Label>
                <Select
                  value={widget.width ?? 'full'}
                  onValueChange={(v) => updateWidget(widget.id, { width: v as never })}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">通栏 100%</SelectItem>
                    <SelectItem value="three-quarter">四分之三 75%</SelectItem>
                    <SelectItem value="half">一半 50%</SelectItem>
                    <SelectItem value="third">三分之一 33%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>对齐（非通栏时生效）</Label>
                <Select
                  value={widget.align ?? 'left'}
                  onValueChange={(v) => updateWidget(widget.id, { align: v as never })}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">居左</SelectItem>
                    <SelectItem value="center">居中</SelectItem>
                    <SelectItem value="right">居右</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>上边距</Label>
                  <span className="text-xs font-semibold tabular-nums text-zinc-500">{widget.mt ?? 0}px</span>
                </div>
                <Slider
                  value={[widget.mt ?? 0]}
                  min={0} max={32} step={2}
                  onValueChange={([v]) => updateWidget(widget.id, { mt: v })}
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>下边距</Label>
                  <span className="text-xs font-semibold tabular-nums text-zinc-500">{widget.mb ?? 8}px</span>
                </div>
                <Slider
                  value={[widget.mb ?? 8]}
                  min={0} max={32} step={2}
                  onValueChange={([v]) => updateWidget(widget.id, { mb: v })}
                />
              </div>
              <AppearanceFields widget={widget} onUpdate={updateWidget} />
                </>
              )}
            </TabsContent>

            <TabsContent value="action" className="mt-0 space-y-4">
              <ConnectionEditor
                pageId={page.id}
                widgetId={widget.id}
                widgetName={def.name}
                fromConnections={fromConnections}
                slots={widgetSlots}
                onAdd={addConnection}
                onRemove={removeConnection}
              />
            </TabsContent>

            <TabsContent value="layers" className="mt-0">
              <LayerList />
            </TabsContent>
          </div>
        </Tabs>
      </aside>
    );
  }

  /* ---------- 未选中：页面设置 + 主题 ---------- */
  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l bg-white" aria-label="页面与主题">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
          <Palette className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">页面 & 主题</p>
          <p className="text-[10px] text-zinc-400">选中画布组件可编辑属性</p>
        </div>
      </div>

      <Tabs key="page-tabs" defaultValue="page" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-4 mt-3 grid grid-cols-3">
          <TabsTrigger value="page" className="text-xs"><Home className="mr-1 size-3" />页面</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs"><Palette className="mr-1 size-3" />主题</TabsTrigger>
          <TabsTrigger value="layers" className="text-xs"><Layers className="mr-1 size-3" />图层</TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 thin-scroll">
          {/* 页面设置 */}
          <TabsContent value="page" className="mt-0 space-y-4">
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">页面设置</h3>
            <div>
              <Label>页面名称</Label>
              <Input
                className="h-8 text-xs"
                value={page.name}
                onChange={(e) => updatePage(page.id, { name: e.target.value })}
              />
            </div>
          <div>
            <Label>页面背景</Label>
            <div className="flex flex-wrap items-center gap-1.5">
              {BG_PRESETS.map((c) => (
                <button
                  key={c}
                  title={c}
                  onClick={() => updatePage(page.id, { background: c })}
                  className={`size-7 rounded-lg border-2 transition-transform hover:scale-110 ${page.background === c ? 'border-zinc-900' : 'border-zinc-200'}`}
                  style={{ background: c }}
                />
              ))}
              <label className="relative size-7 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-zinc-300">
                <input
                  type="color"
                  value={page.background}
                  onChange={(e) => updatePage(page.id, { background: e.target.value })}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <span className="flex size-full items-center justify-center text-[9px] text-zinc-400">自定</span>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border bg-zinc-50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Move3d className="size-4 text-violet-500" />
              <div>
                <p className="text-xs font-semibold">
                  {page.layout === 'free' ? '自由布局' : '流式布局'}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {page.layout === 'free' ? '组件可任意拖放位置与大小' : '组件自上而下排列，拖动仅调整顺序'}
                </p>
              </div>
            </div>
            <Switch
              checked={page.layout === 'free'}
              onCheckedChange={(v) => updatePage(page.id, { layout: v ? 'free' : 'flow' })}
              aria-label="切换自由布局"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border bg-zinc-50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Home className="size-4 text-amber-500" />
              <div>
                <p className="text-xs font-semibold">设为主页</p>
                <p className="text-[10px] text-zinc-400">App 启动时打开的页面</p>
              </div>
            </div>
            <Switch
              checked={page.isHome}
              onCheckedChange={(v) => {
                if (!v || page.isHome) return;
                pages.forEach((p) => {
                  if (p.isHome) updatePage(p.id, { isHome: false });
                });
                updatePage(page.id, { isHome: true });
              }}
            />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                disabled={pages.length <= 1 || page.isHome}
              >
                <Trash2 className="mr-1 size-3.5" /> 删除此页面
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除页面「{page.name}」？</AlertDialogTitle>
                <AlertDialogDescription>
                  将同时删除与该页面相关的所有跳转连接，此操作不可撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction className="bg-rose-500 hover:bg-rose-600" onClick={() => removePage(page.id)}>
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </section>

          {/* 项目统计（页面页底部） */}
          <section className="grid grid-cols-3 gap-2">
            <Stat label="页面" value={pages.length} />
            <Stat label="组件" value={pages.reduce((n, p) => n + p.components.length, 0)} />
            <Stat label="连接" value={connections.length} />
          </section>
        </TabsContent>

        {/* 主题 */}
        <TabsContent value="theme" className="mt-0 space-y-4">
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">UI / UX 主题</h3>
          <div>
            <Label>主题色</Label>
            <div className="flex flex-wrap items-center gap-1.5">
              {THEME_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateTheme({ primary: c })}
                  className={`flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${theme.primary === c ? 'ring-2 ring-zinc-900 ring-offset-2' : ''}`}
                  style={{ background: c }}
                  aria-label={`主题色 ${c}`}
                >
                  {theme.primary === c && <CheckCircle2 className="size-4 text-white" />}
                </button>
              ))}
              <label className="relative size-8 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-zinc-300">
                <input
                  type="color"
                  value={theme.primary}
                  onChange={(e) => updateTheme({ primary: e.target.value })}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <span className="flex size-full items-center justify-center text-[9px] text-zinc-400">+</span>
              </label>
            </div>
          </div>
          <div>
            <Label>圆角风格</Label>
            <div className="grid grid-cols-5 gap-1">
              {([
                { v: 'none', label: '无' },
                { v: 'sm', label: '小' },
                { v: 'md', label: '中' },
                { v: 'lg', label: '大' },
                { v: 'full', label: '全圆' },
              ] as const).map((r) => (
                <button
                  key={r.v}
                  onClick={() => updateTheme({ radius: r.v })}
                  className={`rounded-lg border py-1.5 text-[11px] font-semibold transition-colors ${
                    theme.radius === r.v ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border bg-zinc-50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-amber-500" />
              <div>
                <p className="text-xs font-semibold">暗色模式</p>
                <p className="text-[10px] text-zinc-400">预览界面整体变暗</p>
              </div>
            </div>
            <Switch checked={theme.dark} onCheckedChange={(v) => updateTheme({ dark: v })} />
          </div>
          <div>
            <Label>应用图标</Label>
            <AppIconPicker
              value={theme.icon}
              primary={theme.primary}
              bg={theme.iconBG}
              onChange={(emoji) => updateTheme({ icon: emoji || undefined })}
              onBgChange={(color) => updateTheme({ iconBG: color || undefined })}
            />
          </div>
          </section>
        </TabsContent>

        {/* 图层 */}
        <TabsContent value="layers" className="mt-0">
          <LayerList />
        </TabsContent>
      </div>
      </Tabs>
    </aside>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-[11px] font-semibold text-zinc-500">{children}</p>;
}

/** 外观通用字段（布局 tab 底部，流式/自由共用）：透明度 + 阴影 */
function AppearanceFields({
  widget,
  onUpdate,
}: {
  widget: WidgetInstance;
  onUpdate: (id: string, patch: Partial<WidgetInstance>) => void;
}) {
  const pct = Math.round((widget.opacity ?? 1) * 100);
  const primary = useBuilder((s) => s.project?.theme.primary) ?? '#f97316';
  return (
    <div className="border-t border-dashed pt-4">
      <div className="mb-1.5 flex items-center justify-between">
        <Label>透明度</Label>
        <span className="text-xs font-semibold tabular-nums text-zinc-500">{pct}%</span>
      </div>
      <Slider
        value={[pct]}
        min={10}
        max={100}
        step={5}
        onValueChange={([v]) => onUpdate(widget.id, { opacity: v >= 100 ? undefined : v / 100 })}
      />
      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
        <span>半透明</span>
        <span>不透明</span>
      </div>

      <div className="mt-4">
        <Label>阴影</Label>
        <div className="grid grid-cols-6 gap-1.5">
          {SHADOW_OPTS.map((o) => {
            const active = (o.v ?? undefined) === (widget.shadow ?? undefined);
            return (
              <button
                key={o.label}
                onClick={() => onUpdate(widget.id, { shadow: o.v })}
                title={o.v ? `阴影 ${o.v}` : '无阴影'}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1 rounded-lg border px-0.5 py-1.5 transition-all ${
                  active ? 'border-zinc-900 bg-zinc-50' : 'border-transparent hover:bg-zinc-50'
                }`}
              >
                <span
                  className="flex h-5 w-full items-center justify-center rounded-md bg-white ring-1 ring-zinc-200"
                  style={{ filter: o.v ? SHADOW_FILTER[o.v] : undefined, ['--p' as string]: primary }}
                >
                  <span className="block size-2 rounded-sm" style={{ background: active ? primary : '#d4d4d8' }} />
                </span>
                <span className="text-[9px] font-semibold text-zinc-500">{o.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[10px] leading-4 text-zinc-400">
          阴影跟随组件形状渲染，导出与预览同步生效
        </p>
      </div>
    </div>
  );
}

/** 自由布局数值输入（X/Y/W/H） */
function NumField({
  label, value, min, max, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        className="h-8 text-xs tabular-nums"
        value={Math.round(value)}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-zinc-50 px-2 py-2.5 text-center">
      <p className="text-lg font-extrabold tabular-nums">{value}</p>
      <p className="text-[10px] text-zinc-400">{label}</p>
    </div>
  );
}

/** 属性字段控件 */
function FieldControl({
  field, value, onChange,
}: {
  field: PropField;
  value: any;
  onChange: (v: any) => void;
}) {
  if (field.type === 'switch') {
    return (
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <Switch checked={value !== false} onCheckedChange={onChange} />
      </div>
    );
  }
  if (field.type === 'textarea') {
    return (
      <div>
        <Label>{field.label}</Label>
        <Textarea
          className="min-h-16 text-xs"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div>
        <Label>{field.label}</Label>
        <Select value={String(value ?? '')} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.type === 'color') {
    return (
      <div>
        <Label>{field.label}</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={String(value ?? '#000000')}
            onChange={(e) => onChange(e.target.value)}
            className="size-8 cursor-pointer rounded-lg border"
          />
          <Input className="h-8 flex-1 font-mono text-xs" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
    );
  }
  if (field.type === 'number') {
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label>{field.label}</Label>
          <span className="text-xs font-semibold tabular-nums text-zinc-500">{Number(value ?? 0)}</span>
        </div>
        <Slider
          value={[Number(value ?? 0)]}
          min={field.min ?? 0}
          max={field.max ?? 100}
          step={field.step ?? 1}
          onValueChange={([v]) => onChange(v)}
        />
      </div>
    );
  }
  return (
    <div>
      <Label>{field.label}</Label>
      <Input
        className="h-8 text-xs"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
      />
    </div>
  );
}

/** 交互（连接）编辑器 */
function ConnectionEditor({
  pageId, widgetId, widgetName, fromConnections, slots, onAdd, onRemove,
}: {
  pageId: string;
  widgetId: string;
  widgetName: string;
  fromConnections: { id: string; toPageId: string; animation: string; slot?: string }[];
  slots: { key: string; label: string }[];
  onAdd: (c: { fromPageId: string; fromWidgetId: string; toPageId: string; animation: AnimKind; slot?: string }) => void;
  onRemove: (id: string) => void;
}) {
  const pages = useBuilder((s) => s.pages);
  const [toPage, setToPage] = useState('');
  const [anim, setAnim] = useState<AnimKind>('slide');
  const [slot, setSlot] = useState('widget');

  const targets = useMemo(() => pages.filter((p) => p.id !== pageId), [pages, pageId]);
  const slotLabel = (key?: string) =>
    key ? (slots.find((s) => s.key === key)?.label ?? `槽位 ${key}`) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link2 className="size-3.5" />
        「{widgetName}」被点击后跳转到
      </div>

      {fromConnections.length > 0 && (
        <div className="space-y-1.5">
          {fromConnections.map((c) => {
            const target = pages.find((p) => p.id === c.toPageId);
            const animLabel = ANIM_OPTS.find((a) => a.value === c.animation)?.label ?? c.animation;
            const sLabel = slotLabel(c.slot);
            return (
              <div key={c.id} className="flex items-center gap-2 rounded-xl border bg-zinc-50 px-2.5 py-2">
                <ArrowRight className="size-3.5 shrink-0 text-emerald-500" />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                  {sLabel && <span className="mr-1 rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-semibold text-emerald-600">{sLabel}</span>}
                  {target?.name ?? '未知页面'}
                  <span className="ml-1.5 rounded bg-zinc-200 px-1 py-0.5 text-[9px] font-normal text-zinc-500">{animLabel}</span>
                </span>
                <button
                  className="text-zinc-400 hover:text-rose-500"
                  onClick={() => onRemove(c.id)}
                  title="删除连接"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2 rounded-xl border border-dashed p-3">
        {slots.length > 0 && (
          <div>
            <Label>绑定目标</Label>
            <Select value={slot} onValueChange={setSlot}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="widget">整个组件（任意点击）</SelectItem>
                {slots.map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {slot !== 'widget' && (
              <p className="mt-1 text-[10px] leading-3.5 text-zinc-400">
                预览中点击该标签即跳转，适合底部导航切换页面
              </p>
            )}
          </div>
        )}
        <Select value={toPage} onValueChange={setToPage}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="选择目标页面" /></SelectTrigger>
          <SelectContent>
            {targets.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
                {p.isHome ? '（主页）' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={anim} onValueChange={(v) => setAnim(v as AnimKind)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ANIM_OPTS.map((a) => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="flex items-center gap-1 text-[10px] leading-3.5 text-zinc-400">
          <Zap className="size-3 shrink-0 text-amber-500" />
          {ANIM_OPTS.find((a) => a.value === anim)?.desc}
        </p>
        <Button
          size="sm"
          className="w-full"
          disabled={!toPage}
          onClick={() => {
            if (!toPage) return;
            onAdd({
              fromPageId: pageId,
              fromWidgetId: widgetId,
              toPageId: toPage,
              animation: anim,
              slot: slot === 'widget' ? undefined : slot,
            });
            setToPage('');
          }}
        >
          <Plus className="mr-1 size-3.5" /> 添加跳转连接
        </Button>
      </div>

      {targets.length === 0 && (
        <p className="text-center text-[11px] text-zinc-400">只有一页，先添加新页面才能建立连接</p>
      )}
    </div>
  );
}
