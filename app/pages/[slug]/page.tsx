import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageHero } from "@/components/pages/page-hero"
import { PublicShell } from "@/components/pages/public-shell"
import { getPageContent, getSeoMetadata } from "@/lib/cms"
function content(value:unknown){return value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{} as Record<string,unknown>}
export const dynamic="force-dynamic"
export const revalidate=0
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const page=await getPageContent(slug);if(!page)return{title:"Page"};return getSeoMetadata(`/pages/${slug}`,{title:page.title,description:page.excerpt||undefined})}
export default async function CmsPage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const page=await getPageContent(slug);if(!page)notFound();const data=content(page.content);return <PublicShell><PageHero eyebrow={page.title} title={String(data.heroTitle||page.title)} description={String(data.heroDescription||page.excerpt||"")} breadcrumbs={[{label:page.title}]} /><section className="py-20"><div className="mx-auto max-w-4xl px-6"><div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12"><p className="whitespace-pre-line text-base leading-8 text-muted-foreground">{String(data.body||"Add the page body from the CMS editor using the Page body field.")}</p></div></div></section></PublicShell>}
