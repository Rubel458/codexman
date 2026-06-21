import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type BlogPost = {
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  publishedAt?: Date | string | null;
  createdAt?: Date | string | null;
  category?: string | null;
};

function dateLabel(value?: Date | string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recent post";
}

export function BlogList({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1760px] px-6 lg:px-10">
        {posts.length ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block overflow-hidden bg-blue-50"
                >
                  <Image
                    src={post.featuredImageUrl || "/placeholder.jpg"}
                    alt={post.title}
                    width={900}
                    height={675}
                    className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </Link>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                    {post.category ||
                      dateLabel(post.publishedAt || post.createdAt)}
                  </p>
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="mt-3 font-heading text-2xl font-semibold transition group-hover:text-blue-700">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt || "Read the latest insight from IT Lab BD."}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-blue-700"
                  >
                    Read More
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground">
            No blog posts are published yet.
          </p>
        )}
      </div>
    </section>
  );
}
