import { revalidatePath } from "next/cache"
import { cacheDeleteByPrefix, type CacheDeleteResult } from "@/lib/redis"

export type CmsInvalidationResult = CacheDeleteResult & {
  reason: string
  nextCacheInvalidated: boolean
  invalidatedAt: string
}

export async function invalidateCmsCache(reason: string): Promise<CmsInvalidationResult> {
  const deleted = await cacheDeleteByPrefix("cms:")
  let nextCacheInvalidated = false
  try {
    // Invalidate the root layout to purge the Next.js client cache and mark
    // public routes beneath it for fresh rendering on the next request.
    revalidatePath("/", "layout")
    nextCacheInvalidated = true
  } catch (error) {
    console.error("[cms-invalidation] Next.js revalidation failed", { reason, error })
  }
  const result = { ...deleted, reason, nextCacheInvalidated, invalidatedAt: new Date().toISOString() }
  console.info("[cms-invalidation] completed", result)
  return result
}
