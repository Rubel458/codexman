import { BarChart3, CalendarDays, CalendarRange, Eye, TrendingUp } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { startOfUtcMonth, startOfUtcWeek, startOfUtcYear, uniqueVisitorsSince, utcDateKey } from "@/lib/visitor-analytics"
export const dynamic = "force-dynamic"
async function safe<T>(factory: () => Promise<T>, fallback: T) { try { return await factory() } catch { return fallback } }
type DailyRow = { dateKey: string; uniqueVisitors: number; pageViews: number }
async function recentTraffic(): Promise<DailyRow[]> {
  const rows = await prisma.visitorDaily.findMany({ select: { dateKey: true, pageViews: true }, orderBy: { dateKey: "desc" } })
  const grouped = new Map<string, DailyRow>()
  for (const row of rows) { const current = grouped.get(row.dateKey) || { dateKey: row.dateKey, uniqueVisitors: 0, pageViews: 0 }; current.uniqueVisitors += 1; current.pageViews += row.pageViews; grouped.set(row.dateKey, current) }
  return [...grouped.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey)).slice(0, 14)
}
export default async function AnalyticsPage() {
  const [today, weekly, monthly, yearly, recent] = await Promise.all([
    safe(() => prisma.visitorDaily.count({ where: { dateKey: utcDateKey() } }), 0),
    safe(() => uniqueVisitorsSince(startOfUtcWeek()), 0),
    safe(() => uniqueVisitorsSince(startOfUtcMonth()), 0),
    safe(() => uniqueVisitorsSince(startOfUtcYear()), 0),
    safe(() => recentTraffic(), [] as DailyRow[]),
  ])
  const cards = [{ label: "Today's visitors", value: today, icon: Eye }, { label: "Weekly visitors", value: weekly, icon: CalendarDays }, { label: "Monthly visitors", value: monthly, icon: CalendarRange }, { label: "Yearly visitors", value: yearly, icon: TrendingUp }]
  return <div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">Private Analytics</p><h1 className="mt-1 font-heading text-3xl font-bold">Website visitor overview</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Visitor metrics are visible only in the CMS. A privacy-friendly anonymous identifier is stored as a hash; no public counter is displayed on the website.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><card.icon className="size-7 text-blue-700" /><p className="mt-5 font-heading text-3xl font-bold">{card.value}</p><p className="mt-1 text-sm font-semibold text-slate-700">{card.label}</p></article>)}</div><section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><BarChart3 className="text-blue-700" /><h2 className="font-heading text-xl font-bold">Recent daily traffic</h2></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Date</th><th className="px-3 py-3">Unique visitors</th><th className="px-3 py-3">Page views</th></tr></thead><tbody>{recent.map((row: DailyRow) => <tr key={row.dateKey} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold">{row.dateKey}</td><td className="px-3 py-3">{row.uniqueVisitors}</td><td className="px-3 py-3">{row.pageViews}</td></tr>)}{!recent.length && <tr><td className="px-3 py-5 text-muted-foreground" colSpan={3}>No visits recorded yet. Open the public website to start collecting private analytics.</td></tr>}</tbody></table></div></section></div>
}
