"use client"

import Link from "next/link"
import { Bell, CheckCheck, Mail, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { getCsrf } from "@/components/admin/csrf"

type Notification = { id: string; type: string; title: string; message: string; href?: string | null; read: boolean; createdAt: string }

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/notifications", { cache: "no-store" })
    if (!response.ok) return
    const data = await response.json()
    setItems(data.items || [])
    setUnread(Number(data.unread || 0))
  }, [])
  useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer) }, [load])
  async function markRead(id?: string) {
    const csrf = await getCsrf()
    await fetch("/api/admin/notifications", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": csrf }, body: JSON.stringify(id ? { id } : { markAllRead: true }) })
    load()
  }
  return <div className="relative">
    <button type="button" onClick={() => setOpen(value => !value)} aria-label="Admin notifications" className="relative flex size-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
      <Bell className="size-4.5" />
      {unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-5 text-white shadow-sm">{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && <div className="absolute right-0 top-12 z-50 w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"><div><p className="text-sm font-bold">Notifications</p><p className="text-xs text-muted-foreground">{unread} unread update{unread === 1 ? "" : "s"}</p></div><div className="flex items-center gap-1"><button type="button" onClick={() => markRead()} className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50"><CheckCheck className="size-3.5" />Read all</button><button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"><X className="size-4" /></button></div></div>
      <div className="cms-scroll max-h-[390px] overflow-y-auto">{items.length ? items.map(item => <Link key={item.id} href={item.href || "/admin/leads"} onClick={() => { if (!item.read) markRead(item.id); setOpen(false) }} className={`flex cursor-pointer gap-3 border-b border-slate-100 px-4 py-3.5 transition hover:bg-blue-50 ${item.read ? "bg-white" : "bg-blue-50/50"}`}><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Mail className="size-4" /></span><span className="min-w-0"><strong className="block truncate text-sm">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.message}</span><span className="mt-1 block text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</span></span></Link>) : <p className="px-4 py-7 text-center text-sm text-muted-foreground">No notifications yet.</p>}</div>
      <Link href="/admin/leads" onClick={() => setOpen(false)} className="block cursor-pointer px-4 py-3 text-center text-xs font-bold text-blue-700 transition hover:bg-blue-50">Open contact leads</Link>
    </div>}
  </div>
}
