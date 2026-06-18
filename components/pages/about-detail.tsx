import Image from "next/image"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageHero } from "@/components/pages/page-hero"
import { PublicShell } from "@/components/pages/public-shell"
import { getPageContent, getSeoMetadata } from "@/lib/cms"

function record(value: unknown) { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {} }
export async function detailMetadata(slug: string): Promise<Metadata> { const page = await getPageContent(slug); return getSeoMetadata(`/${slug}`, { title: page?.title || "About IT Lab BD", description: page?.excerpt || "Learn more about IT Lab BD." }) }
export async function AboutDetail({ slug }: { slug: string }) {
  const page = await getPageContent(slug)
  if (!page) notFound()
  const content = record(page.content)
  return <PublicShell><PageHero eyebrow="About IT Lab BD" title={String(content.heroTitle || page.title)} description={String(content.heroDescription || page.excerpt || "")} breadcrumbs={[{ label: "About Us", href: "/about-us" }, { label: page.title }]} /><section className="bg-white py-20"><div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-10"><div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-lg"><Image src={String(content.imageUrl || "/images/about-1.png")} alt={page.title} width={1100} height={850} priority className="aspect-[4/3] w-full object-cover" /></div><article><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-700">{page.title}</p><h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-foreground md:text-5xl">A clear foundation for every digital project.</h2><p className="mt-6 whitespace-pre-line text-base leading-8 text-muted-foreground">{String(content.body || page.excerpt || "")}</p></article></div></section></PublicShell>
}
