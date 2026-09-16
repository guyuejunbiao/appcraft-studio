# 🎨 AppCraft Studio · 拖拽式 DIY App 制作工坊

一个运行在浏览器里的**可视化 App 搭建平台**：像搭积木一样拖拽组件、创建页面、连线跳转，几分钟拼出一款属于自己的 App 原型。

## ✨ 核心功能

- **📱 手机画布编辑器** —— 从组件库拖拽 130+ 精选组件（社交 / 电商 / 媒体 / 工具等 13 个分类）到手机页面中自由排版
- **🗺️ 无限画布（流程视图）** —— 以画板形式俯瞰全部页面，页面间拖拽连线表达跳转关系，支持缩放 / 平移 / 组件直接投放到任意画板
- **🔗 页面管理** —— 新建 / 重命名 / 排序 / 复制页面，配置页面间跳转连接
- **👁️ 实时预览** —— 手机壳内即时预览交互效果，明暗主题自适应
- **💾 项目持久化** —— Prisma + SQLite 存储，多项目管理

## 🛠️ 技术栈

| 领域 | 技术 |
| --- | --- |
| 框架 | Next.js 16（App Router）+ TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui + Lucide Icons |
| 状态 | Zustand |
| 拖拽 | 自研 Pointer Events 拖拽引擎 + @dnd-kit |
| 数据库 | Prisma ORM + SQLite |

## 🚀 本地开发

```bash
# 1. 安装依赖（推荐 bun，也可用 npm/pnpm）
bun install

# 2. 初始化数据库
cp .env.example .env        # 配置 DATABASE_URL（见 .env.example）
bun run db:push             # 按 schema 建库

# 3. 启动开发服务器
bun run dev                 # http://localhost:3000

# 4. 代码检查 / 类型检查
bun run lint
bunx tsc --noEmit
```

## 📤 部署到 GitHub

```bash
# 1. 在 GitHub 网页上新建一个空仓库（不要勾选 README/.gitignore）

# 2. 关联远程仓库并推送（把 <你的用户名>/<仓库名> 换成自己的）
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> 💡 首次推送时 GitHub 会要求登录：使用 **Personal Access Token**（Settings → Developer settings → Tokens）作为密码，或配置 SSH Key。

## ☁️ 上线部署（可选）

推荐 **Vercel**（Next.js 官方出品，对 GitHub 仓库一键部署）：

1. 访问 [vercel.com](https://vercel.com) → 用 GitHub 账号登录 → **Import Project** 选择刚推送的仓库
2. 在 Environment Variables 中添加 `DATABASE_URL=file:/tmp/custom.db`
3. Build Command 保持默认，点击 Deploy 即可获得公网地址，此后每次 `git push` 自动重新部署

> ⚠️ 注意：Vercel 服务器文件系统是临时的，SQLite 数据会在实例重启后清空，适合演示原型。
> 若需要持久化正式数据，建议把 Prisma 数据源切换为 [Turso](https://turso.tech)（libSQL）或 Neon / Supabase 托管数据库。

## 📂 目录结构

```
src/
├── app/                 # Next.js App Router 页面
├── components/
│   ├── builder/         # 编辑器：画布、无限画布、页面管理、连线编辑
│   ├── widgets/         # 130+ 组件库（13 大分类）
│   └── ui/              # shadcn/ui 基础组件
├── lib/                 # store、工具函数
prisma/schema.prisma     # 数据模型（Project / Page / Widget / Connection）
```

---

Made with ❤️ by AppCraft Studio
