import { PrismaClient } from "@prisma/client"

/**
 * Global Prisma Client instance
 */
declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined
}

export let db: PrismaClient
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }
  db = global.cachedPrisma
} 