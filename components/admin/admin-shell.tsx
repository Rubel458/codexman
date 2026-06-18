import Link from "next/link"
import { ArchiveRestore, BarChart3, BookOpen, Building2, ClipboardList, FolderKanban, Gauge, Image, LayoutTemplate, LineChart, Mail, MessageSquareQuote, MonitorPlay, Search, Settings, ShieldCheck, UserRound, UsersRound } from "lucide-react"
import { CacheClearButton } from "@/components/admin/cache-clear-button"
import { LogoutButton } from "@/components/admin/logout-button"
import { NotificationBell } from "@/components/admin/notification-bell"

const groups = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin", icon: Gauge }] },
  { label: "Home Page", items: [
    { label: "Hero Section", href: "/admin/home/hero", icon: LayoutTemplate },
    { label: "About Section", href: "/admin/home/about", icon: LayoutTemplate },
    { label: "Counter Section", href: "/admin/home/counters", icon: LayoutTemplate },
    { label: "Services Section", href: "/admin/home/services", icon: LayoutTemplate },
    { label: "Global Platforms", href: "/admin/home/platforms", icon: LayoutTemplate },
    { label: "What We Do", href: "/admin/home/what-we-do", icon: LayoutTemplate },
    { label: "Portfolio Section", href: "/admin/home/portfolio", icon: LayoutTemplate },
    { label: "Testimonials Section", href: "/admin/home/testimonials", icon: LayoutTemplate },
    { label: "Trusted Companies", href: "/admin/home/trusted-companies", icon: LayoutTemplate },
    { label: "Contact Section", href: "/admin/home/contact", icon: LayoutTemplate },
  ] },
  { label: "Pages", items: [
    { label: "About Page", href: "/admin/page-content/about-us", icon: BookOpen },
    { label: "Our Mission", href: "/admin/page-content/our-mission", icon: BookOpen },
    { label: "Our Vision", href: "/admin/page-content/our-vision", icon: BookOpen },
    { label: "Our Philosophy", href: "/admin/page-content/our-philosophy", icon: BookOpen },
    { label: "Our Strategy", href: "/admin/page-content/our-strategy", icon: BookOpen },
    { label: "Our Team Page", href: "/admin/page-content/our-team", icon: UsersRound },
    { label: "Contact Page", href: "/admin/page-content/contact-us", icon: Mail },
    { label: "All CMS Pages", href: "/admin/pages", icon: BookOpen },
    { label: "SEO Settings", href: "/admin/seo", icon: Search },
  ] },
  { label: "Website", items: [
    { label: "Branding & Contact", href: "/admin/branding", icon: Settings },
    { label: "Advanced Settings", href: "/admin/settings", icon: Settings },
    { label: "Header Menus", href: "/admin/menus", icon: LayoutTemplate },
  ] },
  { label: "Content", items: [
    { label: "Services", href: "/admin/services", icon: Building2 },
    { label: "Team Members", href: "/admin/team-members", icon: UsersRound },
    { label: "Portfolio Projects", href: "/admin/portfolios", icon: FolderKanban },
    { label: "Portfolio Categories", href: "/admin/portfolio-categories", icon: BarChart3 },
    { label: "Demo Items", href: "/admin/demos", icon: MonitorPlay },
    { label: "Demo Categories", href: "/admin/demo-categories", icon: BarChart3 },
    { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
    { label: "Trusted Companies", href: "/admin/logos", icon: ShieldCheck },
  ] },
  { label: "Operations", items: [
    { label: "Website Analytics", href: "/admin/analytics", icon: LineChart },
    { label: "Contact Leads", href: "/admin/leads", icon: Mail },
    { label: "Media Library", href: "/admin/media", icon: Image },
    { label: "Activity Logs", href: "/admin/activity-logs", icon: ClipboardList },
    { label: "System Backup", href: "/admin/backups", icon: ArchiveRestore },
    { label: "Profile & Security", href: "/admin/security", icon: UserRound },
  ] },
]

export function AdminShell({ username, children }: { username: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50 lg:pl-[300px]">
    <aside className="cms-scroll bg-slate-950 p-5 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-[300px] lg:overflow-y-auto">
      <Link href="/admin" className="flex cursor-pointer items-center gap-3"><span className="brand-button flex size-11 items-center justify-center rounded-xl font-heading font-bold">it</span><span><strong className="block">IT LAB BD</strong><small className="text-white/50">Custom CMS</small></span></Link>
      <nav className="mt-7 grid gap-6">{groups.map(group => <div key={group.label}><p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[.2em] text-white/35">{group.label}</p><div className="grid gap-1">{group.items.map(item => <Link key={item.href} href={item.href} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition duration-200 hover:bg-white/10 hover:text-sky-100"><item.icon className="size-4" />{item.label}</Link>)}</div></div>)}</nav>
      <div className="mt-8 border-t border-white/10 pt-4"><p className="px-3 pb-3 text-xs text-white/45">Signed in as <strong className="text-white/80">{username}</strong></p><LogoutButton /></div>
    </aside>
    <div><header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur"><div className="mx-auto flex max-w-[1760px] flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">IT Lab BD CMS</p><p className="font-heading text-lg font-semibold">Website Administration</p></div><div className="flex items-center gap-2"><NotificationBell/><CacheClearButton/><Link href="/" className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">View website</Link></div></div></header><main className="mx-auto max-w-[1760px] p-6 lg:p-8">{children}</main></div>
  </div>
}
