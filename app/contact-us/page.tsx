import type { Metadata } from "next"
import { ContactSection } from "@/components/contact-section"
import { PageHero } from "@/components/pages/page-hero"
import { PublicShell } from "@/components/pages/public-shell"
import { getPageContent, getSeoMetadata } from "@/lib/cms"
export const dynamic="force-dynamic"
export const revalidate=0
export async function generateMetadata():Promise<Metadata>{return getSeoMetadata("/contact-us",{title:"Contact Us",description:"Contact IT Lab BD and share your website or software project requirements."})}
export default async function ContactPage(){const page=await getPageContent("contact-us");const content=(page?.content||{}) as Record<string,unknown>;return <PublicShell><PageHero eyebrow="Contact Us" title={String(content.heroTitle||"Tell us what you want to build.")} description={String(content.heroDescription||"Share your project requirements and our team will get back to you.")} breadcrumbs={[{label:"Contact Us"}]} showActions={false}/><ContactSection content={content} standalone /></PublicShell>}
