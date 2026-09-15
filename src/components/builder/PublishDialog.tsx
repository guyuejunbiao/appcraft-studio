'use client';

import { useState } from 'react';
import { Crown, Layers, GitCommitHorizontal, Boxes } from 'lucide-react';
import { useBuilder } from '@/lib/store';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppIconBadge, AppIconPicker } from './AppIconBadge';
import { toast } from 'sonner';

/** 上架对话框：应用图标 + 名称 + 简介 → 生成版本快照 */
export function PublishDialog() {
  const open = useBuilder((s) => s.publishOpen);
  const setOpen = useBuilder((s) => s.setPublishOpen);
  const publish = useBuilder((s) => s.publish);
  const project = useBuilder((s) => s.project);
  const pages = useBuilder((s) => s.pages);
  const connections = useBuilder((s) => s.connections);
  const updateTheme = useBuilder((s) => s.updateTheme);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const widgetCount = pages.reduce((n, p) => n + p.components.length, 0);

  if (!open || !project) return null;

  const displayName = name.trim() || project.name;

  const submit = async () => {
    setLoading(true);
    const version = await publish(name.trim() || project.name, desc !== '' ? desc : project.description ?? '');
    setLoading(false);
    if (version) {
      toast.success(`🎉 上架成功！${displayName} v1.${version}`, {
        description: '可在首页「已上架应用」中打开预览',
      });
      setOpen(false);
    } else {
      toast.error('上架失败，请重试');
    }
  };

  return (
    <Dialog open onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="size-5 text-amber-500" /> 上架我的 App
          </DialogTitle>
          <DialogDescription>
            将自动保存当前项目并生成版本快照，可随时在首页打开预览。
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto py-2 thin-scroll">
          <div className="grid grid-cols-3 gap-2">
            <Stat icon={Layers} label="页面" value={pages.length} />
            <Stat icon={Boxes} label="组件" value={widgetCount} />
            <Stat icon={GitCommitHorizontal} label="连接" value={connections.length} />
          </div>

          {/* 应用图标 + 名称：App Store 风格预览行 */}
          <div className="flex items-center gap-3 rounded-xl border bg-zinc-50/70 p-3">
            <AppIconBadge primary={project.theme.primary} icon={project.theme.icon} bg={project.theme.iconBG} name={displayName} size={56} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-zinc-900">{displayName}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-zinc-400">
                {desc.trim() || project.description || '暂无简介'}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-500">应用图标</label>
            <AppIconPicker
              value={project.theme.icon}
              primary={project.theme.primary}
              bg={project.theme.iconBG}
              onChange={(emoji) => updateTheme({ icon: emoji || undefined })}
              onBgChange={(color) => updateTheme({ iconBG: color || undefined })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-500">应用名称</label>
            <Input defaultValue={project.name} onChange={(e) => setName(e.target.value)} placeholder="给 App 起个名字" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-500">应用简介</label>
            <Textarea defaultValue={project.description ?? ''} onChange={(e) => setDesc(e.target.value)} placeholder="一句话介绍你的 App" className="min-h-16 text-xs" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={submit} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Crown className="mr-1 size-4" /> {loading ? '上架中…' : '确认上架'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-zinc-50 px-3 py-2.5 text-center">
      <Icon className="mx-auto mb-1 size-4 text-zinc-400" />
      <p className="text-lg font-extrabold tabular-nums leading-5">{value}</p>
      <p className="text-[10px] text-zinc-400">{label}</p>
    </div>
  );
}
