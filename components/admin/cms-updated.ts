"use client"

export const CMS_UPDATED_STORAGE_KEY = "itlabbd:cms-updated"
export const CMS_UPDATED_CHANNEL = "itlabbd-cms"

export function notifyCmsUpdated() {
  const stamp = String(Date.now())
  try { localStorage.setItem(CMS_UPDATED_STORAGE_KEY, stamp) } catch { /* Storage can be disabled by the browser. */ }
  try {
    const channel = new BroadcastChannel(CMS_UPDATED_CHANNEL)
    channel.postMessage({ type: "cms-updated", stamp })
    channel.close()
  } catch { /* BroadcastChannel is optional. */ }
}
