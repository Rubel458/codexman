import type { Metadata } from "next"
import { PageHero } from "@/components/pages/page-hero"
import { PublicShell } from "@/components/pages/public-shell"
import { ServicesSection } from "@/components/services-section"
import { JsonLd } from "@/components/seo/json-ld"
import { getSeoMetadata, getServices } from "@/lib/cms"
export const dynamic="force-dynamic"
export const revalidate=0
const faqs=[
  {question:"Which website service should I choose?",answer:"Choose a business website for a professional company presence, an e-commerce website for online sales, or custom development when your workflow needs tailored features."},
  {question:"Can IT Lab BD manage an existing website?",answer:"Yes. IT Lab BD can review, improve and maintain an existing website, including performance, SEO and server-management tasks."},
  {question:"Are websites responsive and SEO-friendly?",answer:"Projects are designed for mobile devices, clear navigation, fast loading and a technical foundation that supports search visibility."},
  {question:"Do you provide ongoing support after launch?",answer:"Yes. Ongoing support, updates and server-management options can be included according to the project requirements."},
]
export async function generateMetadata():Promise<Metadata>{return getSeoMetadata("/services",{title:"Services",description:"Explore IT Lab BD website development, e-commerce, SEO, server management and IT consultancy services."})}
export default async function ServicesPage(){const services=await getServices();const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(item=>({"@type":"Question",name:item.question,acceptedAnswer:{"@type":"Answer",text:item.answer}}))};return <PublicShell><JsonLd data={faqSchema}/><PageHero eyebrow="Services" title="Web and IT services built for sustainable growth." description="Choose a focused service or combine them into a complete digital solution." breadcrumbs={[{label:"Services"}]} /><ServicesSection services={services} /><section className="bg-white py-20"><div className="mx-auto max-w-5xl px-6 lg:px-10"><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-700">Frequently Asked Questions</p><h2 className="mt-3 font-heading text-3xl font-bold md:text-5xl">Clear answers before your project begins.</h2><div className="mt-8 grid gap-4">{faqs.map(item=><article key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><h3 className="font-heading text-xl font-semibold">{item.question}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p></article>)}</div></div></section></PublicShell>}
