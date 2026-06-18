import Image from "next/image"
import { Briefcase, Building2, Code2, Globe2, Lightbulb, Newspaper, Search, Server, ShoppingCart, Store, User, type LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = { Briefcase, Building2, Code2, Globe2, Lightbulb, Newspaper, Search, Server, ShoppingCart, Store, User }
const fallbackTags = [
  { label: "Ecommerce Website", icon: "ShoppingCart" },
  { label: "Portfolio Website", icon: "Briefcase" },
  { label: "Business Website", icon: "Building2" },
  { label: "Personal Website", icon: "User" },
]
function tags(value: unknown) { return Array.isArray(value) ? value.map((item: any) => ({ label: String(item?.label || ""), icon: String(item?.icon || "Code2") })).filter(item => item.label).slice(0, 8) : fallbackTags }
export function HeroSection({ content }: { content?: Record<string, unknown> }) {
  const eyebrow = typeof content?.eyebrow === "string" ? content.eyebrow : "Modern digital solutions"
  const headline = typeof content?.headline === "string" ? content.headline : "Grow Your Business More Efficiently"
  const subtitle = typeof content?.subtitle === "string" ? content.subtitle : "Websites, software and digital solutions designed to help your business grow with confidence."
  const imageUrl = typeof content?.imageUrl === "string" ? content.imageUrl : "/images/hero-team.png"
  const features = tags(content?.features)
  return <section id="home" className="relative overflow-hidden">
    <div className="absolute inset-0"><Image src={imageUrl} alt="IT Lab BD team collaborating in a modern office" fill priority sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-blue-950/82 to-sky-900/68" /><div className="absolute inset-0 opacity-35 [background:radial-gradient(circle_at_85%_15%,#38bdf8,transparent_30%)]" /></div>
    <div className="relative mx-auto flex max-w-[1760px] flex-col items-center px-6 py-28 text-center md:py-40 lg:px-10">
      <p className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.22em] text-sky-100 backdrop-blur">{eyebrow}</p>
      <h1 className="mt-6 max-w-5xl font-heading text-4xl font-extrabold uppercase leading-tight tracking-wide text-white text-balance md:text-7xl">{headline}</h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-white/78 md:text-lg">{subtitle}</p>
      <div className="mt-11 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">{features.map(feature => { const Icon = iconMap[feature.icon] || Code2; return <div key={`${feature.icon}-${feature.label}`} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-base font-semibold text-white/95 backdrop-blur"><span className="flex size-12 items-center justify-center rounded-full bg-sky-500/90"><Icon className="size-6 text-white" /></span>{feature.label}</div> })}</div>
    </div>
  </section>
}
