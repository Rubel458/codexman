import type { Metadata } from "next"
import { DemoShowcase } from "@/components/pages/demo-showcase"
import { PageHero } from "@/components/pages/page-hero"
import { PublicShell } from "@/components/pages/public-shell"
import { getDemos, getSeoMetadata } from "@/lib/cms"
export const dynamic="force-dynamic"
export const revalidate=0
export async function generateMetadata():Promise<Metadata>{return getSeoMetadata("/demo",{title:"Demo",description:"Browse IT Lab BD website demo categories and preview selected layouts."})}
export default async function DemoPage(){return <PublicShell><PageHero eyebrow="Demo" title="Explore website concepts for your next project." description="Filter demo categories, open previews and choose the direction that fits your business." breadcrumbs={[{label:"Demo"}]} /><DemoShowcase demos={await getDemos()} /></PublicShell>}
