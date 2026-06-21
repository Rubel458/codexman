"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { useState } from "react"

type GalleryItem = { id: string; title?: string | null; imageUrl: string; altText?: string | null }

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<GalleryItem | null>(null)
  return <section className="py-20">
    <div className="mx-auto max-w-[1760px] px-6 lg:px-10">
      {items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {items.map(item => <button key={item.id} type="button" onClick={() => setActive(item)} className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
          <Image src={item.imageUrl} alt={item.altText || item.title || "Gallery image"} width={900} height={675} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
          {item.title && <span className="block px-5 py-4 text-sm font-bold text-slate-800">{item.title}</span>}
        </button>)}
      </div> : <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground">No gallery images are published yet.</p>}
    </div>
    {active && <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/85 p-4" onClick={() => setActive(null)}>
      <button type="button" onClick={() => setActive(null)} aria-label="Close image" className="absolute right-5 top-5 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white text-slate-950 shadow-lg"><X className="size-5" /></button>
      <div className="max-h-[90vh] max-w-6xl overflow-hidden rounded-3xl bg-white p-2 shadow-2xl" onClick={event => event.stopPropagation()}>
        <Image src={active.imageUrl} alt={active.altText || active.title || "Gallery image"} width={1600} height={1100} className="max-h-[84vh] w-auto object-contain" />
        {active.title && <p className="px-4 py-3 text-sm font-semibold text-slate-700">{active.title}</p>}
      </div>
    </div>}
  </section>
}
