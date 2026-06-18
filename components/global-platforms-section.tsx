import Image from "next/image"
import { ArrowUpRight, Globe2 } from "lucide-react"

type Platform = { name: string; description?: string; imageUrl: string; href?: string; badge?: string }
const fallbackPlatforms: Platform[] = [
  { name: "ThemeForest", badge: "Elite Author", description: "Premium digital products and international marketplace credibility.", imageUrl: "/images/platform-themeforest.svg", href: "#" },
  { name: "Fiverr", badge: "Global Services", description: "Professional services for clients looking for reliable delivery.", imageUrl: "/images/platform-fiverr.svg", href: "#" },
  { name: "Upwork", badge: "Worldwide Projects", description: "International collaboration for web and software projects.", imageUrl: "/images/platform-upwork.svg", href: "#" },
]
function platforms(value: unknown): Platform[] {
  if (!Array.isArray(value)) return fallbackPlatforms
  const rows = value.map((item: any) => ({ name: String(item?.name || ""), description: String(item?.description || ""), imageUrl: String(item?.imageUrl || ""), href: String(item?.href || "#"), badge: String(item?.badge || "") })).filter(item => item.name && item.imageUrl)
  return rows.length ? rows.slice(0, 12) : fallbackPlatforms
}
export function GlobalPlatformsSection({ content }: { content?: Record<string, unknown> }) {
  const eyebrow = typeof content?.eyebrow === "string" ? content.eyebrow : "Where we work"
  const headline = typeof content?.headline === "string" ? content.headline : "We work globally on top marketplaces"
  const subtitle = typeof content?.subtitle === "string" ? content.subtitle : "IT Lab BD connects with international clients through trusted platforms and long-term partnerships."
  const rows = platforms(content?.platforms)
  return <section className="bg-white py-18 md:py-20"><div className="mx-auto max-w-[1760px] px-6 lg:px-10"><div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef8ff_48%,#f5f3ff_100%)] p-6 shadow-sm md:p-10 lg:p-12"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-blue-700 shadow-sm"><Globe2 className="size-4" />{eyebrow}</span><h2 className="mt-5 max-w-xl font-heading text-3xl font-bold leading-tight text-foreground md:text-5xl">{headline}</h2><p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{subtitle}</p></div><div className="grid gap-5 md:grid-cols-3">{rows.map((platform, index) => <a key={`${platform.name}-${index}`} href={platform.href || "#"} target={platform.href && platform.href !== "#" ? "_blank" : undefined} rel={platform.href && platform.href !== "#" ? "noreferrer" : undefined} className="group cursor-pointer overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"><div className="relative aspect-[16/9] overflow-hidden bg-slate-100"><Image src={platform.imageUrl} alt={platform.name} fill sizes="(max-width:768px) 90vw, 28vw" className="object-cover transition duration-700 group-hover:scale-105" /></div><div className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">{platform.badge || "Global marketplace"}</p><h3 className="mt-2 font-heading text-xl font-bold">{platform.name}</h3></div><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white"><ArrowUpRight className="size-4" /></span></div>{platform.description && <p className="mt-3 text-sm leading-6 text-muted-foreground">{platform.description}</p>}</div></a>)}</div></div></div></div></section>
}
