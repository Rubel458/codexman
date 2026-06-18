"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CMS_UPDATED_CHANNEL, CMS_UPDATED_STORAGE_KEY } from "@/components/admin/cms-updated"

export function CmsRefreshListener() {
  const router = useRouter()
  useEffect(() => {
    const refresh = () => router.refresh()
    const onStorage = (event: StorageEvent) => { if (event.key === CMS_UPDATED_STORAGE_KEY) refresh() }
    window.addEventListener("storage", onStorage)
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel(CMS_UPDATED_CHANNEL)
      channel.addEventListener("message", refresh)
    } catch { /* Older browsers still receive the storage event. */ }
    return () => {
      window.removeEventListener("storage", onStorage)
      channel?.removeEventListener("message", refresh)
      channel?.close()
    }
  }, [router])
  return null
}
