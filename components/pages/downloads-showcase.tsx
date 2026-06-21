"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

type DownloadItem = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  category?: string | null;
  livePreviewUrl?: string | null;
  downloadCount: number;
  fileSizeBytes?: number | null;
};

function formatSize(value?: number | null) {
  if (!value) return "File";
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function categoryLabel(value?: string | null) {
  return value || "Uncategorized";
}

export function DownloadsShowcase({ items }: { items: DownloadItem[] }) {
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(items.map((item) => categoryLabel(item.category)))),
    ],
    [items],
  );
  const [active, setActive] = useState("All");
  const shown =
    active === "All"
      ? items
      : items.filter((item) => categoryLabel(item.category) === active);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1760px] px-6 lg:px-10">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActive(category)}
              className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 ${active === category ? "bg-blue-700 text-white shadow-md" : "border border-slate-200 bg-white text-muted-foreground hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"}`}
            >
              {category}
            </button>
          ))}
        </div>
        {shown.length ? (
          <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
              >
                <Link
                  href={`/downloads/${item.slug}`}
                  className="block overflow-hidden bg-blue-50"
                >
                  <Image
                    src={item.thumbnailUrl || "/placeholder.jpg"}
                    alt={item.title}
                    width={900}
                    height={675}
                    className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </Link>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                    <span>{categoryLabel(item.category)}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 tracking-normal">
                      {formatSize(item.fileSizeBytes)}
                    </span>
                  </div>
                  <Link href={`/downloads/${item.slug}`}>
                    <h2 className="mt-3 font-heading text-2xl font-semibold transition group-hover:text-blue-700">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="mt-3 min-h-14 text-sm leading-relaxed text-muted-foreground">
                    {item.description ||
                      "Free resource available for immediate download."}
                  </p>
                  <p className="mt-4 text-xs font-semibold text-slate-500">
                    {item.downloadCount || 0} downloads
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {item.livePreviewUrl && (
                      <a
                        href={item.livePreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                      >
                        Live Preview
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    <a
                      href={`/api/downloads/${item.id}`}
                      className="brand-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
                    >
                      <Download className="size-4" />
                      Download
                    </a>
                    <Link
                      href={`/downloads/${item.slug}`}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Details
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground">
            No free downloads are available yet.
          </p>
        )}
      </div>
    </section>
  );
}
