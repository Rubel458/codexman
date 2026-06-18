"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const VISITOR_KEY = "itlabbd_visitor_id"

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

export function VisitorTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return
    const pageKey = `itlabbd_visit:${pathname}`
    if (sessionStorage.getItem(pageKey)) return
    const visitorId = localStorage.getItem(VISITOR_KEY) || createVisitorId()
    localStorage.setItem(VISITOR_KEY, visitorId)
    sessionStorage.setItem(pageKey, "1")
    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId, path: pathname }),
      keepalive: true,
    }).catch(() => undefined)
  }, [pathname])
  return null
}
