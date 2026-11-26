import 'dotenv/config'
import { PrismaClient } from '@/generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createOfflinePrismaProxy(): PrismaClient {
  const emptyModel = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'findMany' || prop === 'groupBy') return async () => []
        if (prop === 'count') return async () => 0
        if (prop === 'aggregate') return async () => ({ _sum: {}, _count: { _all: 0 }, _avg: {}, _min: {}, _max: {} })
        if (prop === 'findUnique' || prop === 'findFirst') return async () => null
        if (prop === 'create' || prop === 'update' || prop === 'upsert' || prop === 'delete') {
          return async () => ({})
        }
        if (prop === 'createMany' || prop === 'updateMany' || prop === 'deleteMany') {
          return async () => ({ count: 0 })
        }
        return async () => null
      },
    }
  )

  return new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === '$transaction') {
        return async (ops: unknown) => {
          if (Array.isArray(ops)) return Promise.all(ops)
          if (typeof ops === 'function') return (ops as (tx: PrismaClient) => unknown)(createOfflinePrismaProxy())
          return []
        }
      }
      if (prop === '$connect' || prop === '$disconnect') return async () => {}
      if (prop === '$executeRaw' || prop === '$executeRawUnsafe') return async () => 0
      if (prop === '$queryRaw' || prop === '$queryRawUnsafe') return async () => []
      if (typeof prop === 'symbol') return undefined
      return emptyModel
    },
  })
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    return createOfflinePrismaProxy()
  }
  const adapter = new PrismaNeon({
    connectionString,
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
