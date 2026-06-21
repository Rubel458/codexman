import type { Metadata } from "next"
import { PageHero } from "@/components/pages/page-hero"
import { BlogList } from "@/components/pages/blog-list"
import { PublicShell } from "@/components/pages/public-shell"
import { getBlogPosts, getSeoMetadata } from "@/lib/cms"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/blog", { title: "Blog", description: "Read IT Lab BD articles, updates and practical web development insights." })
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <PublicShell>
    <PageHero eyebrow="Blog" title="Insights for better digital growth." description="Articles, updates and practical notes from IT Lab BD. Blog posts stay here only — not on the homepage." breadcrumbs={[{ label: "Blog" }]} />
    <BlogList posts={posts} />
  </PublicShell>
}
