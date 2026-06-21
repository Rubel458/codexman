import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/pages/page-hero";
import { PublicShell } from "@/components/pages/public-shell";
import {
  getBlogArchives,
  getBlogCategories,
  getBlogPostBySlug,
  getPromoBanner,
  getRecentBlogPosts,
  getRelatedBlogPosts,
  getSeoMetadata,
} from "@/lib/cms";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function paragraphs(value: unknown) {
  return String(value || "")
    .split(/\n{2,}|\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
function dateLabel(value?: Date | string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recent post";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Blog post" };
  return getSeoMetadata(`/blog/${slug}`, {
    title: post.title,
    description: post.excerpt || `Read ${post.title} from IT Lab BD.`,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  const content = record(post.content);
  const [related, categories, archives, recentPosts, banner] =
    await Promise.all([
      getRelatedBlogPosts(slug),
      getBlogCategories(),
      getBlogArchives(),
      getRecentBlogPosts(slug),
      getPromoBanner("blog_sidebar"),
    ]);
  const body = paragraphs(content.body);

  return (
    <PublicShell>
      <PageHero
        eyebrow={post.category || dateLabel(post.publishedAt || post.createdAt)}
        title={post.title}
        description={post.excerpt || "IT Lab BD blog article."}
        breadcrumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />
      <article className="py-20">
        <div className="mx-auto grid max-w-[1760px] gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
          <main>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-blue-50 shadow-lg">
              <Image
                src={post.featuredImageUrl || "/placeholder.jpg"}
                alt={post.title}
                width={1400}
                height={900}
                className="aspect-[16/10] w-full object-cover"
                priority
              />
            </div>
            <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                {dateLabel(post.publishedAt || post.createdAt)}
              </p>
              <h1 className="mt-3 font-heading text-3xl font-bold text-slate-950 md:text-5xl">
                {post.title}
              </h1>
              <div className="mt-8 space-y-5 text-base leading-8 text-muted-foreground">
                {body.length ? (
                  body.map((line, index) => (
                    <p key={`${line}-${index}`}>{line}</p>
                  ))
                ) : (
                  <p>Blog content can be edited from the admin panel.</p>
                )}
              </div>
            </div>
          </main>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {categories.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                  Blog Categories
                </p>
                <div className="mt-4 grid gap-2">
                  {categories.map((category: any) => (
                    <Link
                      key={category.id}
                      href="/blog"
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <span>{category.name}</span>
                      <span className="text-xs text-slate-400">
                        {category._count?.posts || 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {archives.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                  Archives
                </p>
                <div className="mt-4 grid gap-2">
                  {archives.map((archive: any) => (
                    <div
                      key={archive.label}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      <span>{archive.label}</span>
                      <span className="text-xs text-slate-400">
                        {archive.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {recentPosts.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                  Recent Posts
                </p>
                <div className="mt-4 grid gap-3">
                  {recentPosts.map((item: any) => (
                    <Link
                      key={item.slug}
                      href={`/blog/${item.slug}`}
                      className="rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <strong className="block text-sm text-slate-900">
                        {item.title}
                      </strong>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {dateLabel(item.publishedAt || item.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {banner?.imageUrl && banner?.targetUrl ? (
              <a
                href={banner.targetUrl}
                className="block overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                target={
                  String(banner.targetUrl).startsWith("http")
                    ? "_blank"
                    : undefined
                }
                rel={
                  String(banner.targetUrl).startsWith("http")
                    ? "noreferrer"
                    : undefined
                }
                aria-label={banner.title || "Promotional banner"}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || "Promotional banner"}
                  width={760}
                  height={500}
                  className="w-full object-cover"
                />
              </a>
            ) : null}
          </aside>
        </div>
      </article>
      {related.length ? (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-[1760px] px-6 lg:px-10">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-blue-700">
              Related Posts
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-5xl">
              Keep reading
            </h2>
            <div className="mt-9 grid gap-6 md:grid-cols-3">
              {related.map((item: any) => (
                <article
                  key={item.slug}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                    {item.category ||
                      dateLabel(item.publishedAt || item.createdAt)}
                  </p>
                  <h3 className="mt-3 font-heading text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.excerpt || "Read more from the blog."}
                  </p>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700"
                  >
                    Read More
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
}
