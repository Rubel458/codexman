import type { Metadata } from "next"
import { PageHero } from "@/components/pages/page-hero"
import { PublicShell } from "@/components/pages/public-shell"
import { DownloadsShowcase } from "@/components/pages/downloads-showcase"
import { getDownloads, getSeoMetadata } from "@/lib/cms"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/downloads", { title: "Free Downloads", description: "Download free WordPress plugins, templates and resources from IT Lab BD." })
}

export default async function DownloadsPage() {
  const items = await getDownloads()
  return <PublicShell>
    <PageHero eyebrow="Free Downloads" title="Useful resources, ready to download." description="Browse free plugins, templates and practical resources. No login, no friction — just click and download." breadcrumbs={[{ label: "Free Downloads" }]} />
    <DownloadsShowcase items={items} />
  </PublicShell>
}
