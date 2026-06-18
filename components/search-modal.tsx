"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Search, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

type SearchResult = { type: string; title: string; href: string }

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); return }
    const click = (event: MouseEvent) => { if (box.current && !box.current.contains(event.target as Node)) onClose() }
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    document.addEventListener("mousedown", click)
    document.addEventListener("keydown", key)
    return () => { document.removeEventListener("mousedown", click); document.removeEventListener("keydown", key) }
  }, [open, onClose])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json().catch(() => ({ results: [] }))
      setResults(data.results || [])
      setLoading(false)
    }, 220)
    return () => clearTimeout(timer)
  }, [query])

  return <AnimatePresence>{open && <motion.div ref={box} initial={{ opacity: 0, y: -8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .98 }} className="absolute right-6 top-[calc(100%+12px)] z-[100] w-[min(92vw,540px)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 lg:right-10">
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4">
      <Search className="size-5 text-blue-700" />
      <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search pages, services and demos..." className="w-full bg-transparent py-3.5 text-sm outline-none" />
      <button type="button" onClick={onClose} aria-label="Close search" className="cursor-pointer rounded-full p-1 text-muted-foreground transition hover:bg-slate-200 hover:text-foreground"><X className="size-4" /></button>
    </div>
    <div className="mt-3 grid max-h-80 gap-1 overflow-auto">
      {loading && <p className="px-3 py-4 text-sm text-muted-foreground">Searching...</p>}
      {!loading && query && !results.length && <p className="px-3 py-4 text-sm text-muted-foreground">No results found.</p>}
      {results.map(result => <Link key={`${result.type}-${result.href}-${result.title}`} href={result.href} onClick={onClose} className="group flex cursor-pointer items-center justify-between rounded-xl border border-transparent px-3 py-3 transition hover:border-blue-100 hover:bg-blue-50">
        <span className="text-sm font-medium">{result.title}</span><span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{result.type}</span>
      </Link>)}
    </div>
  </motion.div>}</AnimatePresence>
}
