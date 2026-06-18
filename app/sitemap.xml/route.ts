import { NextResponse } from "next/server"
import { getProjects, getPublishedPages, getServices } from "@/lib/cms"
import { defaultPages, defaultProjects, defaultServices } from "@/lib/default-content"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function withTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs = 1200): Promise<T> { return new Promise(resolve => { const timer = setTimeout(() => resolve(fallback), timeoutMs); promise.then(value => { clearTimeout(timer); resolve(value) }, () => { clearTimeout(timer); resolve(fallback) }) }) }
function xmlEscape(value: string) { const entities: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }; return value.replace(/[<>&'"]/g, character => entities[character] || character) }
function lastmod(value: unknown) { if (!value) return ""; const date = value instanceof Date ? value : new Date(String(value)); return Number.isNaN(date.getTime()) ? "" : `\n    <lastmod>${date.toISOString()}</lastmod>` }

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")
  const [services, projects, pages] = await withTimeout(Promise.all([getServices(), getProjects(), getPublishedPages()]), [defaultServices, defaultProjects, defaultPages] as [any[], any[], any[]])
  const direct = new Set(["about-us", "our-mission", "our-vision", "our-philosophy", "our-strategy", "our-team", "contact-us"])
  const routes: Array<{ route: string; updatedAt?: unknown }> = [
    { route: "" }, { route: "/about-us" }, { route: "/our-mission" }, { route: "/our-vision" }, { route: "/our-philosophy" }, { route: "/our-strategy" }, { route: "/our-team" }, { route: "/services" }, { route: "/demo" }, { route: "/portfolio" }, { route: "/contact-us" },
    ...pages.filter((page: any) => !direct.has(page.slug)).map((page: any) => ({ route: `/pages/${page.slug}`, updatedAt: page.updatedAt })),
    ...services.map((item: any) => ({ route: `/services/${item.slug}`, updatedAt: item.updatedAt })),
    ...projects.map((item: any) => ({ route: `/portfolio/${item.slug}`, updatedAt: item.updatedAt })),
  ]
  const unique = [...new Map(routes.map(item => [item.route, item])).values()]
  const urls = unique.map(item => `  <url>\n    <loc>${xmlEscape(`${base}${item.route}`)}</loc>${lastmod(item.updatedAt)}\n    <changefreq>${item.route ? "monthly" : "weekly"}</changefreq>\n    <priority>${item.route ? "0.8" : "1.0"}</priority>\n  </url>`).join("\n")
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=10, stale-while-revalidate=60" } })
}
