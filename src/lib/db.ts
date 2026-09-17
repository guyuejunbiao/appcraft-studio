import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

/**
 * 数据库客户端工厂：
 * - 配置了 TURSO_DATABASE_URL（libsql://...，托管 Turso/libSQL 数据库）时，
 *   通过 Prisma driver adapter 连接远程数据库 —— 用于 Vercel 等 serverless 部署
 *   （serverless 文件系统不持久，本地 SQLite 文件不可用）；
 * - 未配置时回退本地 SQLite 文件（DATABASE_URL=file:./db/...）—— 本地开发零改动。
 *
 * Turso 环境变量（Vercel 项目设置里配置同名变量即可）：
 *   TURSO_DATABASE_URL=libsql://<db>-<org>.turso.io
 *   TURSO_AUTH_TOKEN=<token>
 * 建库与建表步骤见 README「部署到 Vercel」章节。
 */
function createDb(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  if (tursoUrl) {
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query'] : undefined,
    })
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : undefined,
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createDb()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
