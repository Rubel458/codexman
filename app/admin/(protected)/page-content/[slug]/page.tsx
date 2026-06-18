import { notFound } from "next/navigation"
import { PageContentEditor } from "@/components/admin/page-content-editor"

const pages = new Set([
  "about-us",
  "our-team",
  "contact-us",
  "our-mission",
  "our-vision",
  "our-philosophy",
  "our-strategy",
])

export default async function PageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!pages.has(slug)) notFound()
  return <PageContentEditor slug={slug} />
}
