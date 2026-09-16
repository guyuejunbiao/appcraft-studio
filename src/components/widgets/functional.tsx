'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MoreHorizontal, PanelTop, MousePointerClick, AlignLeft,
  Image as ImageIcon, Settings2, CircleCheck, List, TextCursorInput,
  ChartColumn, CloudSun, Sun, Moon, Droplets, Wind, Target, PanelBottom,
  Home, LayoutGrid, Compass, UserRound, Settings, Bell, PackageOpen,
  Play, Plus, Pencil, Camera, MessageCircle, Crown, ChevronRight,
  Volume2, Palette, Shield, Info, Globe, CircleUserRound,
  CircleHelp, ChevronDown, Timer, Trophy, QrCode, Share2, CalendarDays, MoveVertical,
  LogOut,
} from 'lucide-react';
import type { WidgetDef, InteractiveCtx } from '@/lib/widget-types';
import { useBusScope, useUserValue } from '@/lib/interaction-bus';
import { fireToast } from '@/lib/widget-toast';
import { FnTabbarInteractive, InputFieldInteractive, BigButtonInteractive } from './interactive';

/**
 * 功能通用 组件库（目录：functional）
 * 与 login.tsx 同一套规范：只使用 Tailwind + CSS 变量（--p 主色 / --pr 圆角 / --pf 主色上文字）
 * 表面类：w-card(卡片) w-input(输入底) w-chip(浅色块) w-line(分割线颜色)
 * 主文字继承画布颜色，次要文字用 opacity-*，保证暗色模式自适应；渲染为纯函数，无 hooks / 无请求。
 */

/** 逗号（中英文）分隔的列表解析 */
const toList = (v: unknown): string[] =>
  String(v ?? '').split(/[,，]/).map((s) => s.trim()).filter(Boolean);

/** fn.list-item 左侧图标预设（按文案字符码循环取用） */
const LIST_ICONS = [Bell, Volume2, Palette, Shield, Info, Globe];

/** fn.tabbar 底部导航图标预设（按下标循环取用） */
const TAB_ICONS = [Home, LayoutGrid, Compass, UserRound, Bell, Settings];

/** fn.fab 图标映射 */
const FAB_ICONS: Record<string, typeof Plus> = {
  plus: Plus, edit: Pencil, camera: Camera, message: MessageCircle,
};

/* ------------------------------------------------------------------ */
/* 导航栏共享视图：onBack 存在时返回箭头可点（预览真实回退页面栈）       */
/* 修复：原 navbar 无 Interactive，预览中二级页返回箭头点击无反应 ——    */
/* 用户进入注册/短信登录等二级页后被困死，只能靠预览工具条退出。         */
/* ------------------------------------------------------------------ */
function NavbarBody({ title, showBack, onBack }: { title: string; showBack: boolean; onBack?: () => void }) {
  return (
    <div className="relative flex h-12 items-center border-b w-line px-3">
      <span className="flex w-8 justify-start">
        {showBack &&
          (onBack ? (
            <button
              type="button"
              aria-label="返回上一页"
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="-ml-1 rounded-md p-1 transition-transform active:scale-90"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <ArrowLeft className="size-5" />
          ))}
      </span>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[15px] font-bold">
        {title}
      </span>
      <span className="ml-auto flex w-8 justify-end">
        <MoreHorizontal className="size-5 opacity-70" />
      </span>
    </div>
  );
}

/** 预览交互：返回箭头点击 → 页面栈回退（navBack 由预览容器注入） */
function NavbarInteractive({ props, navBack }: InteractiveCtx) {
  return (
    <NavbarBody
      title={String(props.title ?? '')}
      showBack={props.showBack !== false}
      onBack={() => navBack?.()}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 单行列表项：退出登录语义（正常 App 的会话注销闭环）                  */
/* 文案匹配「退出/注销/登出」的项在预览中弹出确认面板，确认后：          */
/* 清空会话数据（手机号/密码/验证码/协议勾选）+ 页面栈重置回首页。       */
/* 修复：原退出登录项点击无任何反应，登录闭环断在最后一步。             */
/* ------------------------------------------------------------------ */
const LOGOUT_RE = /退出|注销|登出/;

function ListItemRow({ label, value, onActivate }: { label: string; value: string; onActivate?: () => void }) {
  const sum = [...label].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const Icon = LIST_ICONS[sum % LIST_ICONS.length] || Bell;
  return (
    <div
      className={`w-card flex h-12 items-center gap-3 px-3.5 ${onActivate ? 'cursor-pointer transition-transform active:scale-[0.99]' : ''}`}
      onClick={onActivate}
      role={onActivate ? 'button' : undefined}
      aria-label={onActivate ? label : undefined}
    >
      <Icon className={`size-4 shrink-0 ${onActivate ? 'text-rose-500' : 'opacity-55'}`} />
      <span className={`flex-1 truncate text-sm ${onActivate ? 'font-medium text-rose-500' : ''}`}>{label}</span>
      <span className="text-xs opacity-45">{value}</span>
      {onActivate ? <LogOut className="size-4 shrink-0 text-rose-400" /> : <ChevronRight className="size-4 shrink-0 opacity-35" />}
    </div>
  );
}

/** 预览交互：退出登录项 → 确认弹窗 → onLogout（由预览容器注入） */
function ListItemInteractive({ props, onLogout }: InteractiveCtx) {
  const label = String(props.label || '');
  const [ask, setAsk] = useState(false);
  const isLogout = !!onLogout && LOGOUT_RE.test(label);
  if (!isLogout) return <ListItemRow label={label} value={String(props.value ?? '')} />;
  const dialog =
    ask && typeof document !== 'undefined'
      ? createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-[85] flex flex-col justify-end bg-black/50"
            onClick={() => setAsk(false)}
            role="dialog"
            aria-modal="true"
            aria-label="退出登录确认"
          >
            <motion.div
              initial={{ y: 220 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="rounded-t-3xl bg-white px-5 pb-8 pt-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-200" />
              <h3 className="text-center text-base font-bold text-zinc-900">退出登录？</h3>
              <p className="mt-2 text-center text-xs leading-5 text-zinc-500">
                退出后将清除本次登录状态，需要重新登录才能继续使用
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAsk(false)}
                  className="h-11 flex-1 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-500 transition-transform active:scale-[0.97]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAsk(false);
                    onLogout?.();
                  }}
                  className="flex h-11 flex-[1.6] items-center justify-center gap-1.5 rounded-full bg-rose-500 text-sm font-bold text-white shadow-md transition-transform active:scale-[0.97]"
                >
                  <LogOut className="size-4" /> 退出登录
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.getElementById('phone-screen') ?? document.body
        )
      : null;
  return (
    <>
      <ListItemRow label={label} value={String(props.value ?? '')} onActivate={() => setAsk(true)} />
      {dialog}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 空状态：行动按钮预览真实反馈（演示 toast），不再点了没反应           */
/* ------------------------------------------------------------------ */
function EmptyStateBody({ title, desc, btn, onBtn }: { title: string; desc: string; btn: string; onBtn?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <span className="w-chip flex size-16 items-center justify-center rounded-full">
        <PackageOpen className="size-7 opacity-45" />
      </span>
      <span className="mt-1 text-sm font-bold">{title}</span>
      <span className="text-xs opacity-50">{desc}</span>
      <button
        type="button"
        onClick={
          onBtn
            ? (e) => {
                e.stopPropagation();
                onBtn();
              }
            : undefined
        }
        className="mt-2 flex h-8 items-center px-4 text-xs font-semibold active:scale-[0.97]"
        style={{ borderRadius: 'var(--pr)', border: '1.5px solid var(--p)', color: 'var(--p)' }}
      >
        {btn}
      </button>
    </div>
  );
}

function EmptyStateInteractive({ props }: InteractiveCtx) {
  const scope = useBusScope();
  return (
    <EmptyStateBody
      title={String(props.title ?? '')}
      desc={String(props.desc ?? '')}
      btn={String(props.btn ?? '')}
      onBtn={() => fireToast(scope, `已触发「${props.btn}」（演示环境）`, 'info')}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 个人中心头部共享视图：name/uid 可被会话身份覆盖                       */
/* 正常 App 行为：登录后首页/个人中心显示「当前登录用户」而非写死的假数据 */
/* ------------------------------------------------------------------ */
function AvatarProfileBody({ name, uid, vip }: { name: string; uid: string; vip: boolean }) {
  return (
    <div
      className="flex items-center gap-3 p-4"
      style={{
        background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 62%, #fff))',
        color: 'var(--pf)',
      }}
    >
      <span
        className="flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-bold"
        style={{ background: 'color-mix(in srgb, #fff 22%, transparent)' }}
      >
        {String(name || '游').slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-base font-bold">{name}</span>
          {vip && (
            <span
              className="flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-amber-300"
              style={{ background: 'color-mix(in srgb, #000 18%, transparent)' }}
            >
              <Crown className="size-2.5" /> VIP
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-[11px] opacity-70">{uid}</div>
      </div>
      <span
        className="flex shrink-0 items-center gap-0.5 rounded-full px-2.5 py-1 text-xs"
        style={{ background: 'color-mix(in srgb, #fff 20%, transparent)' }}
      >
        个人主页 <ChevronRight className="size-3.5" />
      </span>
    </div>
  );
}

/** 手机号脱敏：13812345678 → 138****5678 */
const maskPhone = (v: string) => v.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');

/** 预览交互：绑定登录会话身份（手机号 → 脱敏展示；第三方 → 品牌身份） */
function AvatarProfileInteractive({ props }: InteractiveCtx) {
  const phone = useUserValue('phone');
  const social = useUserValue('social');
  const name = phone
    ? `用户${phone.slice(-4)}`
    : social
      ? `${social}用户`
      : String(props.name ?? '云间漫步者');
  const uid = phone
    ? `账号：${maskPhone(phone)}`
    : social
      ? `${social}授权 · 本次登录有效`
      : String(props.uid ?? '');
  return <AvatarProfileBody name={name} uid={uid} vip={props.vip !== false} />;
}

export const widgets: WidgetDef[] = [
  {
    type: 'fn.navbar',
    category: 'functional',
    name: '页面导航',
    desc: '顶部导航栏：返回 + 居中标题 + 更多（预览中返回箭头真实可用）',
    icon: PanelTop,
    fullBleed: true,
    defaultProps: { title: '通知中心', showBack: true },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'showBack', label: '显示返回箭头', type: 'switch' },
    ],
    Interactive: NavbarInteractive,
    render: (p) => (
      <NavbarBody title={String(p.title ?? '')} showBack={p.showBack !== false} />
    ),
  },
  {
    type: 'fn.big-button',
    category: 'functional',
    name: '主按钮',
    desc: '全宽主操作按钮：主色底 / 描边 / 浅底',
    icon: MousePointerClick,
    defaultProps: { text: '立即开始', style: 'primary', radius: 'full' },
    fields: [
      { key: 'text', label: '按钮文案', type: 'text' },
      { key: 'style', label: '风格', type: 'select', options: [{ label: '主色底', value: 'primary' }, { label: '主色描边', value: 'outline' }, { label: '浅底', value: 'ghost' }] },
      { key: 'radius', label: '圆角', type: 'select', options: [{ label: '全圆', value: 'full' }, { label: '主题圆角', value: 'normal' }] },
    ],
    Interactive: BigButtonInteractive,
    render: (p) => {
      const variant = p.style === 'outline' || p.style === 'ghost' ? p.style : 'primary';
      const br = p.radius === 'normal' ? 'var(--pr)' : '999px';
      const skin = variant === 'primary'
        ? { background: 'var(--p)', color: 'var(--pf)' }
        : variant === 'outline'
          ? { border: '1.5px solid var(--p)', color: 'var(--p)' }
          : { color: 'var(--p)' };
      return (
        <button
          className={`flex h-12 w-full items-center justify-center text-[15px] font-bold active:scale-[0.98] ${variant === 'primary' ? 'shadow-md' : variant === 'ghost' ? 'w-chip' : ''}`}
          style={{ borderRadius: br, ...skin }}
        >
          {p.text}
        </button>
      );
    },
  },
  {
    type: 'fn.text-block',
    category: 'functional',
    name: '富文本段落',
    desc: '标题 + 多行正文段落',
    icon: AlignLeft,
    defaultProps: {
      title: '产品介绍',
      content: '我们致力于把复杂的流程变得简单直观，让每一位用户都能快速上手、高效完成每天的工作。\n持续迭代，只为给你更好的使用体验。',
    },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'content', label: '正文', type: 'textarea' },
    ],
    render: (p) => (
      <div className="py-1">
        <h2 className="text-base font-bold">{p.title}</h2>
        <p className="mt-2 whitespace-pre-line text-[13px] leading-[1.7] opacity-60">{p.content}</p>
      </div>
    ),
  },
  {
    type: 'fn.image-block',
    category: 'functional',
    name: '图片块',
    desc: '渐变占位图，可设高度与角标文字',
    icon: ImageIcon,
    defaultProps: { height: 160, label: '封面图片' },
    fields: [
      { key: 'height', label: '高度 (px)', type: 'number', min: 120, max: 260, step: 4 },
      { key: 'label', label: '角标文字', type: 'text' },
    ],
    render: (p) => (
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: Math.min(320, Math.max(60, Number(p.height) || 160)),
          borderRadius: 'var(--pr)',
          background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #fff))',
        }}
      >
        <ImageIcon className="size-8" style={{ color: 'var(--pf)', opacity: 0.85 }} />
        <span className="absolute bottom-2 right-2.5 text-[10px]" style={{ color: 'var(--pf)', opacity: 0.75 }}>
          {p.label}
        </span>
      </div>
    ),
  },
  {
    type: 'fn.settings-group',
    category: 'functional',
    name: '设置分组',
    desc: '多行开关设置项卡片，行间细线分割',
    icon: Settings2,
    defaultProps: { labels: '开启推送通知,深色模式,自动播放视频,省流模式', onCount: 3 },
    fields: [
      { key: 'labels', label: '设置项（逗号分隔）', type: 'textarea' },
      { key: 'onCount', label: '前 N 项开启', type: 'number', min: 0, max: 8, step: 1 },
    ],
    render: (p) => {
      const rows = toList(p.labels);
      const onCount = Math.min(rows.length, Math.max(0, Math.round(Number(p.onCount) || 0)));
      return (
        <div className="w-card py-1">
          {rows.map((label, i) => {
            const on = i < onCount;
            return (
              <div
                key={i}
                className={`flex h-12 items-center gap-3 px-3.5 ${i < rows.length - 1 ? 'border-b w-line' : ''}`}
              >
                <CircleCheck
                  className={`size-4 shrink-0 ${on ? '' : 'opacity-30'}`}
                  style={on ? { color: 'var(--p)' } : undefined}
                />
                <span className="flex-1 truncate text-sm">{label}</span>
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full ${on ? '' : 'w-chip border w-line'}`}
                  style={on ? { background: 'var(--p)' } : undefined}
                >
                  <span
                    className="absolute top-0.5 size-4 rounded-full bg-white shadow-sm"
                    style={{ left: on ? '18px' : '2px' }}
                  />
                </span>
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    type: 'fn.list-item',
    category: 'functional',
    name: '单行列表项',
    desc: '图标 + 文字 + 右侧值与箭头的入口行（预览中「退出登录」项带确认弹窗）',
    icon: List,
    defaultProps: { label: '消息通知', value: '已开启' },
    fields: [
      { key: 'label', label: '标题', type: 'text' },
      { key: 'value', label: '右侧值', type: 'text' },
    ],
    Interactive: ListItemInteractive,
    render: (p) => {
      const label = String(p.label || '');
      return <ListItemRow label={label} value={String(p.value ?? '')} />;
    },
  },
  {
    type: 'fn.input-field',
    category: 'functional',
    name: '表单输入',
    desc: '带标签的圆角输入框',
    icon: TextCursorInput,
    defaultProps: { label: '邮箱地址', placeholder: '请输入邮箱地址' },
    fields: [
      { key: 'label', label: '标签', type: 'text' },
      { key: 'placeholder', label: '提示文案', type: 'text' },
    ],
    Interactive: InputFieldInteractive,
    render: (p) => (
      <div>
        <label className="mb-1.5 block text-xs font-bold">{p.label}</label>
        <div className="w-input flex h-11 items-center px-3" style={{ borderRadius: 'var(--pr)' }}>
          <span className="text-sm opacity-40">{p.placeholder}</span>
        </div>
      </div>
    ),
  },
  {
    type: 'fn.stat-card',
    category: 'functional',
    name: '数据统计卡',
    desc: '2×2 数据概览格子',
    icon: ChartColumn,
    defaultProps: { items: '1280 访问量,328 新用户,86 订单,96.2% 好评率' },
    fields: [
      { key: 'items', label: '数据项（值 空格 标签，逗号分隔）', type: 'textarea' },
    ],
    render: (p) => (
      <div className="w-card grid grid-cols-2 gap-x-2 gap-y-4 p-4">
        {toList(p.items).map((raw, i) => {
          const [value, ...rest] = raw.split(/\s+/);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--p)' }}>
                {value}
              </span>
              <span className="text-[11px] opacity-50">{rest.join(' ')}</span>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    type: 'fn.weather-card',
    category: 'functional',
    name: '天气卡',
    desc: '渐变主色的城市天气卡片',
    icon: CloudSun,
    defaultProps: { city: '上海市', date: '10月24日 周五', temp: '23°', desc: '多云转晴' },
    fields: [
      { key: 'city', label: '城市', type: 'text' },
      { key: 'date', label: '日期', type: 'text' },
      { key: 'temp', label: '温度', type: 'text' },
      { key: 'desc', label: '天气描述', type: 'text' },
    ],
    render: (p) => {
      const night = /夜|晚|月/.test(String(p.desc || ''));
      return (
        <div
          className="flex items-center justify-between p-4"
          style={{
            borderRadius: 'var(--pr)',
            background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #fff))',
            color: 'var(--pf)',
          }}
        >
          <div>
            <div className="text-base font-bold">{p.city}</div>
            <div className="mt-0.5 text-[11px] opacity-70">{p.date}</div>
            <div className="mt-2.5 text-4xl font-extrabold leading-none tracking-tight">{p.temp}</div>
            <div className="mt-1.5 text-xs opacity-80">{p.desc}</div>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            {night ? <Moon className="size-9 opacity-90" /> : <Sun className="size-9 opacity-90" />}
            <div className="flex flex-col items-end gap-1 text-[11px] opacity-75">
              <span className="flex items-center gap-1"><Droplets className="size-3" /> 湿度 62%</span>
              <span className="flex items-center gap-1"><Wind className="size-3" /> 风速 3 级</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    type: 'fn.progress-card',
    category: 'functional',
    name: '目标进度卡',
    desc: '标题 + 百分比 + 进度条卡片',
    icon: Target,
    defaultProps: { title: '本月阅读目标', percent: 68, sub: '已完成 17 本 / 总目标 25 本' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'percent', label: '进度 (%)', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'sub', label: '底部小字', type: 'text' },
    ],
    render: (p) => {
      const pct = Math.max(0, Math.min(100, Math.round(Number(p.percent) || 0)));
      return (
        <div className="w-card p-4">
          <div className="flex items-end justify-between">
            <span className="text-sm font-bold">{p.title}</span>
            <span className="text-2xl font-extrabold leading-none" style={{ color: 'var(--p)' }}>
              {pct}%
            </span>
          </div>
          <div className="w-chip mt-3 h-2 overflow-hidden" style={{ borderRadius: '999px' }}>
            <div className="h-full" style={{ width: `${pct}%`, borderRadius: '999px', background: 'var(--p)' }} />
          </div>
          <div className="mt-2 text-[11px] opacity-50">{p.sub}</div>
        </div>
      );
    },
  },
  {
    type: 'fn.tabbar',
    category: 'functional',
    name: '底部导航',
    desc: 'App 底部标签栏（通栏，激活项带顶部圆点）',
    icon: PanelBottom,
    fullBleed: true,
    defaultProps: { items: '首页,分类,发现,我的', active: 0, channel: 'tab' },
    fields: [
      { key: 'items', label: '标签（逗号分隔）', type: 'text' },
      { key: 'active', label: '激活项序号', type: 'number', min: 0, max: 5, step: 1 },
      { key: 'channel', label: '联动频道（高级）', type: 'text', placeholder: '其他组件订阅后可随标签切换显隐' },
    ],
    Interactive: FnTabbarInteractive,
    slots: (p) => toList(p.items).map((label, i) => ({ key: String(i), label: `「${label}」标签` })),
    render: (p) => {
      const tabs = toList(p.items);
      const active = Math.max(0, Math.min(tabs.length - 1, Math.round(Number(p.active) || 0)));
      return (
        <div className="w-card flex border-t w-line" style={{ borderRadius: 'var(--pr) var(--pr) 0 0' }}>
          {tabs.map((label, i) => {
            const on = i === active;
            const Icon = TAB_ICONS[i % TAB_ICONS.length] || Home;
            return (
              <span key={i} className="flex flex-1 flex-col items-center gap-1 pb-2 pt-1.5">
                <span className="size-1 rounded-full" style={{ background: on ? 'var(--p)' : 'transparent' }} />
                <Icon
                  className={`size-5 shrink-0 ${on ? '' : 'opacity-45'}`}
                  style={on ? { color: 'var(--p)' } : undefined}
                />
                <span
                  className={`text-[10px] ${on ? 'font-semibold' : 'opacity-45'}`}
                  style={on ? { color: 'var(--p)' } : undefined}
                >
                  {label}
                </span>
              </span>
            );
          })}
        </div>
      );
    },
  },
  {
    type: 'fn.empty-state',
    category: 'functional',
    name: '空状态',
    desc: '无数据占位：图标 + 文案 + 行动按钮（预览中按钮带演示反馈）',
    icon: PackageOpen,
    defaultProps: { title: '暂无数据', desc: '这里还没有内容，去看看别的吧', btn: '去逛逛' },
    fields: [
      { key: 'title', label: '主文字', type: 'text' },
      { key: 'desc', label: '副文字', type: 'text' },
      { key: 'btn', label: '按钮文案', type: 'text' },
    ],
    Interactive: EmptyStateInteractive,
    render: (p) => (
      <EmptyStateBody
        title={String(p.title ?? '')}
        desc={String(p.desc ?? '')}
        btn={String(p.btn ?? '')}
      />
    ),
  },
  {
    type: 'fn.video-card',
    category: 'functional',
    name: '视频卡',
    desc: '16:9 封面 + 时长角标 + 标题与播放量',
    icon: Play,
    defaultProps: { title: '三分钟看懂设计系统', duration: '12:36', views: '3.2万次播放' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'duration', label: '时长', type: 'text' },
      { key: 'views', label: '播放量', type: 'text' },
    ],
    render: (p) => (
      <div>
        <div
          className="relative flex aspect-video items-center justify-center overflow-hidden"
          style={{
            borderRadius: 'var(--pr)',
            background: 'linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #fff))',
          }}
        >
          <span
            className="flex size-12 items-center justify-center rounded-full bg-black/30 active:scale-95"
            style={{ color: '#fff' }}
          >
            <Play className="size-5" fill="currentColor" />
          </span>
          <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {p.duration}
          </span>
        </div>
        <div className="mt-2 truncate text-sm font-semibold">{p.title}</div>
        <div className="mt-1 text-[11px] opacity-50">{p.views}</div>
      </div>
    ),
  },
  {
    type: 'fn.fab',
    category: 'functional',
    name: '悬浮按钮',
    desc: '右下角悬浮操作圆钮（56px）',
    icon: Plus,
    defaultProps: { icon: 'plus' },
    fields: [
      { key: 'icon', label: '图标', type: 'select', options: [{ label: '加号', value: 'plus' }, { label: '编辑', value: 'edit' }, { label: '相机', value: 'camera' }, { label: '消息', value: 'message' }] },
    ],
    render: (p) => {
      const Icon = FAB_ICONS[p.icon] || Plus;
      return (
        <div className="flex justify-end p-1">
          <button
            className="flex size-14 items-center justify-center shadow-lg transition-transform active:scale-90"
            style={{ borderRadius: '999px', background: 'var(--p)', color: 'var(--pf)' }}
          >
            <Icon className="size-6" />
          </button>
        </div>
      );
    },
  },
  {
    type: 'fn.avatar-profile',
    category: 'functional',
    name: '个人中心头部',
    desc: '渐变头像信息栏：昵称 / ID / VIP / 主页入口（预览中自动显示登录身份）',
    icon: CircleUserRound,
    fullBleed: true,
    defaultProps: { name: '云间漫步者', uid: 'ID: 88239012', vip: true },
    fields: [
      { key: 'name', label: '昵称', type: 'text' },
      { key: 'uid', label: 'UID', type: 'text' },
      { key: 'vip', label: '显示 VIP 徽标', type: 'switch' },
    ],
    Interactive: AvatarProfileInteractive,
    render: (p) => (
      <AvatarProfileBody
        name={String(p.name ?? '云间漫步者')}
        uid={String(p.uid ?? '')}
        vip={p.vip !== false}
      />
    ),
  },
  {
    type: 'fn.faq',
    category: 'functional',
    name: 'FAQ 折叠面板',
    desc: '常见问题列表（首条展开）',
    icon: CircleHelp,
    defaultProps: {
      items: '如何修改绑定手机号？\n会员如何自动续费？\n忘记密码怎么办？\n如何注销账号？',
      answer: '请在「账号与安全」中选择更换手机号，验证身份后即可完成换绑。',
    },
    fields: [
      { key: 'items', label: '问题列表（每行一个）', type: 'textarea' },
      { key: 'answer', label: '展开的答案示例', type: 'textarea' },
    ],
    render: (p) => {
      const items = String(p.items ?? '').split(/\n/).map((s) => s.trim()).filter(Boolean).slice(0, 6);
      return (
        <div className="w-card overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
          {items.map((q, i) => (
            <div key={i} className={`px-3 py-2.5 ${i > 0 ? 'border-t w-line' : ''}`}>
              <div className="flex items-center gap-2">
                <CircleHelp className="size-3.5 shrink-0" style={{ color: 'var(--p)' }} />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold">{q}</span>
                <ChevronDown className={`size-3.5 shrink-0 opacity-40 transition-transform ${i === 0 ? 'rotate-180' : ''}`} />
              </div>
              {i === 0 && (
                <p className="mt-1.5 pl-6 text-[11px] leading-4 opacity-55">{p.answer}</p>
              )}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'fn.countdown',
    category: 'functional',
    name: '倒计时卡片',
    desc: '活动 / 纪念日倒计时',
    icon: Timer,
    defaultProps: { title: '距离双十一开场', days: 12, hours: 8, mins: 36, sub: '定好闹钟准时开抢' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'sub', label: '右侧小字', type: 'text' },
      { key: 'days', label: '天', type: 'number', min: 0, max: 99 },
      { key: 'hours', label: '时', type: 'number', min: 0, max: 23 },
      { key: 'mins', label: '分', type: 'number', min: 0, max: 59 },
    ],
    render: (p) => (
      <div className="w-card p-3.5" style={{ borderRadius: 'var(--pr)' }}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold">
            <Timer className="size-3.5" style={{ color: 'var(--p)' }} /> {p.title}
          </span>
          <span className="text-[10px] opacity-45">{p.sub}</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1">
        {[[p.days, '天'], [p.hours, '时'], [p.mins, '分']].map(([v, u], i) => (
            <div key={i} className="flex items-center gap-1">
              <span
                className="flex h-11 w-10 items-center justify-center text-lg font-extrabold tabular-nums"
                style={{ background: '#18181b', color: '#fff', borderRadius: 'calc(var(--pr) - 2px)' }}
              >
                {String(Number(v) || 0).padStart(2, '0')}
              </span>
              <span className="text-[11px] opacity-50">{u}</span>
              {i < 2 && <span className="ml-1 text-lg font-bold opacity-25">:</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    type: 'fn.ranking',
    category: 'functional',
    name: '排行榜',
    desc: '金银铜牌排名列表',
    icon: Trophy,
    defaultProps: { title: '本周步数榜', unit: '步', items: '星云旅人 28616\n阿岚 25410\n小张 23188\n产品君 19802' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'items', label: '条目（每行：名字 值）', type: 'textarea' },
      { key: 'unit', label: '单位', type: 'text' },
    ],
    render: (p) => {
      const medal = ['bg-amber-400', 'bg-zinc-300', 'bg-amber-600'];
      const rows = String(p.items ?? '').split(/\n/).map((s) => s.trim()).filter(Boolean).slice(0, 5)
        .map((line) => {
          const idx = line.lastIndexOf(' ');
          return idx > 0 ? [line.slice(0, idx), line.slice(idx + 1)] : [line, ''];
        });
      return (
        <div className="w-card overflow-hidden" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center gap-1.5 border-b w-line px-3 py-2">
            <Trophy className="size-3.5 text-amber-500" />
            <span className="text-xs font-bold">{p.title}</span>
          </div>
          {rows.map(([name, val], i) => (
            <div key={i} className={`flex items-center gap-2.5 px-3 py-2 ${i > 0 ? 'border-t w-line' : ''}`}>
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${i < 3 ? `${medal[i]} text-white` : 'w-chip opacity-70'}`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-semibold">{name}</span>
              <span className="shrink-0 text-xs font-extrabold tabular-nums" style={{ color: 'var(--p)' }}>
                {val}
                <span className="ml-0.5 text-[9px] font-normal opacity-50">{p.unit}</span>
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    type: 'fn.qrcode',
    category: 'functional',
    name: '二维码卡片',
    desc: '邀请 / 名片二维码 + 分享按钮',
    icon: QrCode,
    defaultProps: { title: '邀请好友赚奖励', sub: '扫码加入星云，双方各得 30 积分', seed: 7 },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'sub', label: '副文案', type: 'text' },
      { key: 'seed', label: '码样变化', type: 'number', min: 1, max: 99 },
    ],
    render: (p) => {
      const n = 11;
      const cells = Array.from({ length: n * n }, (_, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        const corner = (x < 3 && y < 3) || (x > n - 4 && y < 3) || (x < 3 && y > n - 4);
        if (corner) return x % 3 !== 1 || y % 3 !== 1 ? 1 : 0;
        return (i * 73 + Number(p.seed || 7) * 131) % 97 > 47 ? 1 : 0;
      });
      return (
        <div className="w-card p-4 text-center" style={{ borderRadius: 'var(--pr)' }}>
          <p className="text-sm font-bold">{p.title}</p>
          <p className="mt-1 text-[11px] opacity-55">{p.sub}</p>
          <div className="mx-auto mt-3 w-fit rounded-xl border-2 p-2" style={{ borderColor: 'var(--p)' }}>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, 7px)` }}>
              {cells.map((c, i) => (
                <span key={i} className="size-[7px]" style={{ background: c ? '#18181b' : 'transparent' }} />
              ))}
            </div>
          </div>
          <button
            className="mt-3 inline-flex h-8 items-center gap-1.5 px-4 text-xs font-bold"
            style={{ background: 'var(--p)', color: 'var(--pf)', borderRadius: '999px' }}
          >
            <Share2 className="size-3.5" /> 立即分享
          </button>
        </div>
      );
    },
  },
  {
    type: 'fn.calendar',
    category: 'functional',
    name: '日历卡片',
    desc: '月历视图 + 今日高亮',
    icon: CalendarDays,
    defaultProps: { month: '2026年9月', today: 4, start: 2 },
    fields: [
      { key: 'month', label: '月份标题', type: 'text' },
      { key: 'today', label: '今日日期', type: 'number', min: 1, max: 28 },
      { key: 'start', label: '首日星期偏移', type: 'number', min: 0, max: 6 },
    ],
    render: (p) => {
      const start = Math.min(6, Math.max(0, Number(p.start) || 0));
      const cells = [...Array(start).fill(0), ...Array.from({ length: 28 }, (_, i) => i + 1)];
      return (
        <div className="w-card p-3" style={{ borderRadius: 'var(--pr)' }}>
          <div className="flex items-center justify-between px-1">
            <ChevronDown className="size-3.5 -rotate-90 opacity-40" />
            <span className="text-xs font-bold">{p.month}</span>
            <ChevronDown className="size-3.5 rotate-90 opacity-40" />
          </div>
          <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-[10px] opacity-40">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-y-0.5 text-center">
            {cells.map((d, i) =>
              d === 0 ? (
                <span key={i} />
              ) : (
                <span
                  key={i}
                  className="mx-auto flex size-6 items-center justify-center rounded-full text-[11px] tabular-nums"
                  style={
                    d === Number(p.today)
                      ? { background: 'var(--p)', color: 'var(--pf)', fontWeight: 700 }
                      : { opacity: i % 7 === 0 || i % 7 === 6 ? 0.4 : 0.85 }
                  }
                >
                  {d}
                </span>
              )
            )}
          </div>
        </div>
      );
    },
  },
  {
    type: 'fn.spacer',
    category: 'functional',
    name: '间距占位',
    desc: '调整页面留白高度',
    icon: MoveVertical,
    defaultProps: { height: 40, hint: true },
    fields: [
      { key: 'height', label: '高度', type: 'number', min: 8, max: 160, step: 4 },
      { key: 'hint', label: '显示占位提示', type: 'switch' },
    ],
    render: (p) => (
      <div className="flex items-center justify-center" style={{ height: Number(p.height) || 40 }}>
        {p.hint !== false && (
          <span className="flex items-center gap-1 text-[9px] opacity-30">
            <MoveVertical className="size-3" /> 间距 {p.height}px
          </span>
        )}
      </div>
    ),
  },
];
