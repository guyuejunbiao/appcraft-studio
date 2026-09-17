import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AppCraft Studio · 拖拽式 DIY App 制作工坊",
  description: "像搭积木一样 DIY 你的专属 App：64+ 精选小组件、6 大功能目录、自由组建页面、自定义页面跳转，一键上架生成可交互预览。",
  keywords: ["DIY App", "拖拽", "低代码", "App 制作", "组件仓库", "页面流程"],
  authors: [{ name: "AppCraft Studio" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AppCraft Studio",
    description: "拖拽式 DIY App 制作工坊",
    siteName: "AppCraft Studio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        {/* sonner：画布/面板大量 toast() 调用的渲染出口（此前缺失导致提示静默丢失） */}
        <SonnerToaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
