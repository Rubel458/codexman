import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/pages/page-hero";
import { PublicShell } from "@/components/pages/public-shell";
import {
  getDownloadBySlug,
  getDownloadCategories,
  getPromoBanner,
  getRelatedDownloads,
  getSeoMetadata,
} from "@/lib/cms";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function paragraphs(value: unknown) {
  return String(value || "")
    .split(/\n{2,}|\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatSize(value?: number | null) {
  if (!value) return "File";
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function categoryName(item: any) {
  return item.category || "Uncategorized";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getDownloadBySlug(slug);
  if (!item) return { title: "Download" };
  return getSeoMetadata(`/downloads/${slug}`, {
    title: item.title,
    description: item.description || `Download ${item.title} from IT Lab BD.`,
  });
}

export default async function DownloadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getDownloadBySlug(slug);
  if (!item) notFound();
  const [categories, related, banner] = await Promise.all([
    getDownloadCategories(),
    getRelatedDownloads(slug, item.categoryId),
    getPromoBanner("download_sidebar"),
  ]);
  const details = paragraphs(item.additionalInfo || item.description);

  return (
    <PublicShell>
      <PageHero
        eyebrow={categoryName(item)}
        title={item.title}
        description={
          item.description || "Free resource available for immediate download."
        }
        breadcrumbs={[
          { label: "Free Downloads", href: "/downloads" },
          { label: item.title },
        ]}
      />
      <section className="py-20">
        <div className="mx-auto grid max-w-[1760px] gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
          <main>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-blue-50 shadow-lg">
              <Image
                src={item.thumbnailUrl || "/placeholder.jpg"}
                alt={item.title}
                width={1400}
                height={900}
                className="aspect-[16/10] w-full object-cover"
                priority
              />
            </div>
            <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                Download Details
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-slate-950">
                {item.title}
              </h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
                {details.length ? (
                  details.map((line, index) => (
                    <p key={`${line}-${index}`}>{line}</p>
                  ))
                ) : (
                  <p>More information can be added from the admin panel.</p>
                )}
              </div>
            </div>
          </main>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                Resource Info
              </p>
              <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-4">
                  <span>Category</span>
                  <strong className="text-slate-900">
                    {categoryName(item)}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>File size</span>
                  <strong className="text-slate-900">
                    {formatSize(item.fileSizeBytes)}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Downloads</span>
                  <strong className="text-slate-900">
                    {item.downloadCount || 0}
                  </strong>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <a
                  href={`/api/downloads/${item.id}`}
                  className="brand-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
                >
                  <Download className="size-4" />
                  Download File
                </a>
                {item.livePreviewUrl && (
                  <a
                    href={item.livePreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    Live Preview
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </div>
            {categories.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                  Categories
                </p>
                <div className="mt-4 grid gap-2">
                  {categories.map((category: any) => (
                    <Link
                      key={category.id}
                      href="/downloads"
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <span>{category.name}</span>
                      <span className="text-xs text-slate-400">
                        {category._count?.items || 0}
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
            {related.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                  Related Downloads
                </p>
                <div className="mt-4 grid gap-3">
                  {related.map((relatedItem: any) => (
                    <Link
                      key={relatedItem.id}
                      href={`/downloads/${relatedItem.slug}`}
                      className="rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <strong className="block text-sm text-slate-900">
                        {relatedItem.title}
                      </strong>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {relatedItem.category || "Uncategorized"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
