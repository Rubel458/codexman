import type { Metadata } from "next"
import { PageHero } from "@/components/pages/page-hero"
import { PublicShell } from "@/components/pages/public-shell"
import { GalleryGrid } from "@/components/pages/gallery-grid"
import { getGalleryItems, getSeoMetadata } from "@/lib/cms"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/gallery", { title: "Gallery", description: "Explore IT Lab BD gallery images in a responsive lightbox grid." })
}

export default async function GalleryPage() {
  const items = await getGalleryItems()
  return <PublicShell>
    <PageHero eyebrow="Gallery" title="A visual look at our digital work." description="A clean image gallery managed from the admin panel with responsive grid and lightbox preview." breadcrumbs={[{ label: "Gallery" }]} />
    <GalleryGrid items={items} />
  </PublicShell>
}
