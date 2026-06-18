import Image from "next/image"
type Logo = { id: string; name: string; imageUrl?: string | null; website?: string | null }
function LogoRow({ logos, reverse = false }: { logos: Logo[]; reverse?: boolean }) {
  const entries = [...logos, ...logos]
  return <div className="overflow-hidden py-1"><div className={`flex w-max gap-3 ${reverse ? "animate-marquee-ltr" : "animate-marquee-rtl"}`}>{entries.map((logo, index) => {
    const card = <div className="relative flex h-24 min-w-52 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-base font-bold text-muted-foreground shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">{logo.imageUrl ? <Image src={logo.imageUrl} alt={logo.name} fill sizes="208px" className="object-cover" /> : <span className="px-4 text-center">{logo.name}</span>}</div>
    return logo.website ? <a key={`${logo.id}-${index}`} href={logo.website} target="_blank" rel="noreferrer" aria-label={logo.name}>{card}</a> : <div key={`${logo.id}-${index}`}>{card}</div>
  })}</div></div>
}
export function IntegrationsSection({ logos, content }: { logos: Logo[]; content?: Record<string, unknown> }) {
  const eyebrow = typeof content?.eyebrow === "string" ? content.eyebrow : "Trusted Companies"
  const headline = typeof content?.headline === "string" ? content.headline : "12k+ Companies grow with us"
  const subtitle = typeof content?.subtitle === "string" ? content.subtitle : "A growing ecosystem of businesses and teams building their digital future."
  return <section className="bg-white py-20"><div className="mx-auto max-w-[1760px] px-6 lg:px-10"><div className="text-center"><span className="text-sm font-bold uppercase tracking-[.2em] text-blue-700">{eyebrow}</span><h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-5xl">{headline}</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{subtitle}</p></div><div className="mt-9 grid gap-2"><LogoRow logos={logos} /><LogoRow logos={logos} reverse /></div></div></section>
}
