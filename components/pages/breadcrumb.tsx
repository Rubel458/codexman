import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export type BreadcrumbItem = { label: string; href?: string }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/70">
    <Link href="/" aria-label="Home" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-white transition hover:bg-white/20">
      <Home className="size-4" /><span>Home</span>
    </Link>
    {items.map((item, index) => <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
      <ChevronRight className="size-4 text-white/40" />
      {item.href ? <Link href={item.href} className="transition hover:text-white">{item.label}</Link> : <span className="font-semibold text-white">{item.label}</span>}
    </span>)}
  </nav>
}
