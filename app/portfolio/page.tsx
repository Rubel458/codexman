import type { Metadata } from "next"
import { PageHero } from "@/components/pages/page-hero"
import { PortfolioShowcase } from "@/components/pages/portfolio-showcase"
import { PublicShell } from "@/components/pages/public-shell"
import { getProjects, getSeoMetadata } from "@/lib/cms"
export const dynamic="force-dynamic"
export const revalidate=0
export async function generateMetadata():Promise<Metadata>{return getSeoMetadata("/portfolio",{title:"Portfolio",description:"Explore IT Lab BD web design and development projects."})}
export default async function PortfolioPage(){return <PublicShell><PageHero eyebrow="Portfolio" title="Digital work designed to earn attention and trust." description="Browse projects, categories and technologies used across selected IT Lab BD work." breadcrumbs={[{label:"Portfolio"}]} /><PortfolioShowcase projects={await getProjects()} /></PublicShell>}
