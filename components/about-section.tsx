import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

type AboutBlock = { title: string; text?: string; imageUrl: string; href?: string }
const fallbackBlocks: AboutBlock[] = [
  { title: "Our Mission", text: "Build practical digital products that help clients grow.", imageUrl: "/images/about-1.png", href: "/our-mission" },
  { title: "Our Vision", text: "Make modern technology useful, clear and accessible.", imageUrl: "/images/about-2.png", href: "/our-vision" },
  { title: "Our Philosophy", text: "Keep every solution focused on real business value.", imageUrl: "/images/portfolio-5.png", href: "/our-philosophy" },
  { title: "Our Strategy", text: "Combine design, engineering and long-term support.", imageUrl: "/images/portfolio-3.png", href: "/our-strategy" },
]
function blocks(value: unknown): AboutBlock[] { return Array.isArray(value) ? value.map((item: any) => ({ title: String(item?.title || ""), text: String(item?.text || ""), imageUrl: String(item?.imageUrl || ""), href: String(item?.href || "/about-us") })).filter(item => item.title && item.imageUrl).slice(0, 4) : fallbackBlocks }
const offsets = ["lg:-translate-y-7", "lg:translate-y-3", "lg:-translate-y-3", "lg:translate-y-8"]
export function AboutSection({ content }: { content?: Record<string, unknown> }) {
  const eyebrow = typeof content?.eyebrow === "string" ? content.eyebrow : "About IT Lab BD"
  const headline = typeof content?.headline === "string" ? content.headline : "Changing The Way To Do Best Business Solutions"
  const intro = typeof content?.intro === "string" ? content.intro : "Over 11 years working in IT services developing software applications for clients all over the world."
  const mission = typeof content?.mission === "string" ? content.mission : "Our mission is to help enterprises accelerate adoption of new technologies, untangle complex issues that emerge during digital evolution, and orchestrate ongoing innovation."
  const closing = typeof content?.closing === "string" ? content.closing : "If you are looking for a trustworthy and reputable company to build your digital presence or transform your systems, IT Lab BD is ready to help."
  const cards = blocks(content?.blocks)
  return <section id="about" className="bg-white py-20"><div className="mx-auto max-w-[1760px] px-6 lg:px-10"><div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
    <div className="relative"><div className="mb-6 grid w-fit grid-cols-5 gap-1.5" aria-hidden="true">{Array.from({ length: 15 }).map((_, i) => <span key={i} className="size-2 rounded-full bg-blue-500 opacity-35" />)}</div><p className="text-sm font-bold uppercase tracking-[.22em] text-blue-700">{eyebrow}</p><h2 className="mt-3 max-w-3xl font-heading text-3xl font-bold leading-tight text-foreground text-balance md:text-5xl">{headline}</h2><p className="mt-6 text-base leading-relaxed text-muted-foreground">{intro}</p><p className="mt-5 text-base font-semibold leading-relaxed text-slate-700">{mission}</p><p className="mt-5 text-base leading-relaxed text-muted-foreground">{closing}</p></div>
    <div className="grid grid-cols-2 gap-5 py-8 lg:gap-6">{cards.map((card, index) => <Link href={card.href || "/about-us"} key={`${card.title}-${index}`} className={`${offsets[index] || ""} group relative min-h-[245px] cursor-pointer overflow-hidden rounded-3xl shadow-lg transition duration-500 hover:-translate-y-2 hover:shadow-2xl`}><Image src={card.imageUrl} alt={card.title} fill sizes="(max-width:768px) 45vw, 24vw" className="object-cover transition duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-slate-950/58 transition duration-300 group-hover:bg-blue-950/70" /><div className="absolute inset-0 flex flex-col justify-end p-6 text-white"><div className="flex items-center justify-between gap-4"><h3 className="font-heading text-2xl font-bold">{card.title}</h3><span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 opacity-0 transition duration-300 group-hover:opacity-100"><ArrowUpRight className="size-4" /></span></div>{card.text && <p className="mt-2 text-sm leading-6 text-white/78">{card.text}</p>}</div></Link>)}</div>
  </div></div></section>
}
