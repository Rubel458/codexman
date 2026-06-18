import { createClient } from "redis"

let redisClient: ReturnType<typeof createClient> | null = null
let redisConnectPromise: Promise<ReturnType<typeof createClient> | null> | null = null
let redisDisabled = false
const memory = new Map<string, { value: string; expiresAt: number }>()

const connectTimeoutMs = positiveNumber(process.env.REDIS_CONNECT_TIMEOUT_MS, 700)
const operationTimeoutMs = positiveNumber(process.env.REDIS_OPERATION_TIMEOUT_MS, 700)
const cacheDisabled = process.env.CMS_CACHE_DISABLED === "true"
const rateLimitFailClosed = process.env.NODE_ENV === "production" && process.env.RATE_LIMIT_FAIL_CLOSED !== "false"

export type CacheDeleteResult = { redisDeleted: number; memoryDeleted: number; cacheDisabled: boolean }

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function timeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), timeoutMs)
    promise.then(value => { clearTimeout(timer); resolve(value) }, error => { clearTimeout(timer); reject(error) })
  })
}

function disableRedis() {
  redisDisabled = true
  redisConnectPromise = null
  if (redisClient) {
    try { redisClient.destroy() } catch { /* Redis is optional: memory cache remains available. */ }
  }
  redisClient = null
}

async function getClient() {
  if (redisDisabled || !process.env.REDIS_URL) return null
  if (redisClient?.isOpen) return redisClient
  if (!redisConnectPromise) {
    redisConnectPromise = (async () => {
      try {
        if (!redisClient) {
          redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
              connectTimeout: connectTimeoutMs,
              reconnectStrategy: false,
            },
          })
          redisClient.on("error", () => undefined)
        }
        if (!redisClient.isOpen) await timeout(redisClient.connect(), connectTimeoutMs, "REDIS_CONNECT")
        return redisClient
      } catch {
        disableRedis()
        return null
      } finally {
        redisConnectPromise = null
      }
    })()
  }
  return redisConnectPromise
}

function memoryGet(key: string) {
  const entry = memory.get(key)
  if (!entry || entry.expiresAt < Date.now()) {
    memory.delete(key)
    return null
  }
  return entry.value
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (cacheDisabled) return null
  try {
    const client = await getClient()
    const raw = client ? await timeout(client.get(key), operationTimeoutMs, "REDIS_GET") : memoryGet(key)
    if (!raw) return null
    try { return JSON.parse(raw) as T } catch { return null }
  } catch {
    disableRedis()
    const raw = memoryGet(key)
    if (!raw) return null
    try { return JSON.parse(raw) as T } catch { return null }
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 10) {
  if (cacheDisabled) return
  const raw = JSON.stringify(value)
  try {
    const client = await getClient()
    if (client) await timeout(client.set(key, raw, { EX: ttlSeconds }), operationTimeoutMs, "REDIS_SET")
    else memory.set(key, { value: raw, expiresAt: Date.now() + ttlSeconds * 1000 })
  } catch {
    disableRedis()
    memory.set(key, { value: raw, expiresAt: Date.now() + ttlSeconds * 1000 })
  }
}

export async function cacheDeleteByPrefix(prefix: string): Promise<CacheDeleteResult> {
  let redisDeleted = 0
  let memoryDeleted = 0
  if (!cacheDisabled) {
    try {
      const client = await getClient()
      if (client) {
        await timeout((async () => {
          const batch: string[] = []
          for await (const key of client.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
            batch.push(String(key))
            if (batch.length >= 100) redisDeleted += await client.del(batch.splice(0, batch.length))
          }
          if (batch.length) redisDeleted += await client.del(batch)
        })(), Math.max(operationTimeoutMs * 3, 1500), "REDIS_SCAN")
      }
    } catch {
      disableRedis()
    }
  }
  for (const key of memory.keys()) {
    if (key.startsWith(prefix)) { memory.delete(key); memoryDeleted += 1 }
  }
  return { redisDeleted, memoryDeleted, cacheDisabled }
}

function isSensitiveRateLimit(key: string) {
  return /^ratelimit:(?:login|forgot|reset|contact|admin-|backup-|lead-reply)/.test(key)
}

export async function incrementWithExpiry(key: string, ttlSeconds: number) {
  try {
    const client = await getClient()
    if (client) {
      const count = await timeout(client.incr(key), operationTimeoutMs, "REDIS_INCR")
      if (count === 1) await timeout(client.expire(key, ttlSeconds), operationTimeoutMs, "REDIS_EXPIRE")
      return count
    }
  } catch {
    disableRedis()
  }
  if (rateLimitFailClosed && isSensitiveRateLimit(key)) return Number.MAX_SAFE_INTEGER
  const entry = memory.get(key)
  const current = entry && entry.expiresAt > Date.now() ? Number(entry.value) : 0
  const next = current + 1
  memory.set(key, { value: String(next), expiresAt: Date.now() + ttlSeconds * 1000 })
  return next
}
