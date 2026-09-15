'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Signal, Wifi, BatteryFull } from 'lucide-react';
import { RADIUS_MAP, contrastOn, type ThemeConfig } from '@/lib/types';

interface PhoneFrameProps {
  theme: ThemeConfig;
  pageBg: string;
  children: ReactNode;
}

export const PHONE_W = 375;
export const PHONE_H = 812;

/** 手机外壳：刘海 + 状态栏 + 屏幕主题变量 + Home 指示条 */
export function PhoneFrame({ theme, pageBg, children }: PhoneFrameProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    tick();
    const t = setInterval(tick, 20_000);
    return () => clearInterval(t);
  }, []);

  const isDark = theme.dark;
  const bg = isDark && pageBg === '#f6f7fb' ? '#101014' : pageBg;

  return (
    <div
      className="relative rounded-[54px] bg-zinc-950 p-[10px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] ring-1 ring-zinc-800"
      style={{ width: PHONE_W + 20, height: PHONE_H + 20 }}
    >
      {/* 侧边按键 */}
      <div className="absolute -left-[3px] top-32 h-16 w-[3px] rounded-l bg-zinc-800" />
      <div className="absolute -left-[3px] top-52 h-10 w-[3px] rounded-l bg-zinc-800" />
      <div className="absolute -right-[3px] top-40 h-20 w-[3px] rounded-r bg-zinc-800" />

      <div
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-[44px] ${isDark ? 'pd' : ''}`}
        style={{
          background: bg,
          color: isDark ? '#ececf1' : '#1c1c21',
          ['--p' as string]: theme.primary,
          ['--pf' as string]: contrastOn(theme.primary),
          ['--pr' as string]: RADIUS_MAP[theme.radius],
        }}
      >
        {/* 刘海 */}
        <div className="absolute left-1/2 top-2.5 z-30 h-[26px] w-[110px] -translate-x-1/2 rounded-full bg-zinc-950" />

        {/* 状态栏 */}
        <div className="relative z-20 flex h-12 shrink-0 items-center justify-between px-7 pt-2">
          <span className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{time || '9:41'}</span>
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </div>
        </div>

        {/* 屏幕内容 */}
        <div className="relative min-h-0 flex-1">{children}</div>

        {/* Home 指示条 */}
        <div className="relative z-20 flex h-6 shrink-0 items-center justify-center">
          <div className={`h-1 w-32 rounded-full ${isDark ? 'bg-white/35' : 'bg-black/25'}`} />
        </div>
      </div>
    </div>
  );
}
