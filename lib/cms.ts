import { cacheGet, cacheSet } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { defaultDemos, defaultLogos, defaultMenuItems, defaultPages, defaultProjects, defaultServices, defaultTeamMembers } from "@/lib/default-content"
import { sanitizeUrl } from "@/lib/security"

const cmsQueryTimeoutMs = positiveNumber(process.env.CMS_QUERY_TIMEOUT_MS, 1500)
const cmsCacheTtlSeconds = positiveNumber(process.env.CMS_CACHE_TTL_SECONDS, 10)
const cmsFallbackCacheTtlSeconds = positiveNumber(process.env.CMS_FALLBACK_CACHE_TTL_SECONDS, 5)
const cmsCacheDisabled = process.env.CMS_CACHE_DISABLED === "true"

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), timeoutMs)
    promise.then(value => { clearTimeout(timer); resolve(value) }, error => { clearTimeout(timer); reject(error) })
  })
}

async function cached<T>(key: string, factory: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const existing = cmsCacheDisabled ? null : await withTimeout(cacheGet<T>(key), Math.min(cmsQueryTimeoutMs, 900), "CMS_CACHE_GET")
    if (existing !== null && existing !== undefined) return existing
  } catch {
    // Redis is an optimization only. Database fallback remains available.
  }
  try {
    const value = await withTimeout(factory(), cmsQueryTimeoutMs, "CMS_DATABASE_QUERY")
    const result = value === null || value === undefined || (Array.isArray(value) && value.length === 0) ? fallback : value
    if (!cmsCacheDisabled) void cacheSet(key, result, cmsCacheTtlSeconds)
    return result
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error(`[cms] ${key}`, error)
    // Cache the bundled fallback briefly so a temporary infrastructure outage
    // cannot slow down every public request.
    if (!cmsCacheDisabled) void cacheSet(key, fallback, cmsFallbackCacheTtlSeconds)
    return fallback
  }
}

export function getServices() { return cached<any[]>("cms:services", async () => prisma.service.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }), defaultServices) }
export function getServiceBySlug(slug: string) { const fallback = defaultServices.find(service => service.slug === slug) || null; return cached<any | null>(`cms:service:${slug}`, async () => prisma.service.findFirst({ where: { slug, published: true } }), fallback) }
export function getProjects() { return cached<any[]>("cms:projects", async () => (await prisma.portfolio.findMany({ where: { published: true }, include: { category: true }, orderBy: { sortOrder: "asc" } })).map((project: any) => ({ ...project, category: project.category?.name || "Other" })), defaultProjects) }
export function getProjectBySlug(slug: string) { const fallback = defaultProjects.find(project => project.slug === slug) || null; return cached<any | null>(`cms:project:${slug}`, async () => { const project = await prisma.portfolio.findFirst({ where: { slug, published: true }, include: { category: true } }); return project ? { ...project, category: project.category?.name || "Other" } : null }, fallback) }
export function getDemos() { return cached<any[]>("cms:demos", async () => (await prisma.demo.findMany({ where: { published: true }, include: { category: true }, orderBy: { sortOrder: "asc" } })).map((demo: any) => ({ ...demo, category: demo.category?.name || "Other" })), defaultDemos) }
export function getCompanyLogos() { return cached<any[]>("cms:logos", async () => prisma.companyLogo.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }), defaultLogos.map(name => ({ id: name, name, imageUrl: null, website: null }))) }
export function getTestimonials() { return cached<any[]>("cms:testimonials", async () => prisma.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }), [
  { id: "1", brand: "Trustpilot", brandImageUrl: null, quote: "IT Lab BD delivered a professional website with a smooth process and dependable communication.", author: "Business Client", position: "Business Owner", clientImageUrl: "/placeholder-user.jpg", rating: 5 },
  { id: "2", brand: "Client Review", brandImageUrl: null, quote: "Fast delivery, clean implementation and helpful technical support from planning to launch.", author: "International Client", position: "Project Manager", clientImageUrl: "/placeholder-user.jpg", rating: 5 },
  { id: "3", brand: "Project Feedback", brandImageUrl: null, quote: "A modern solution that is easy to manage and ready to grow with our business.", author: "Agency Partner", position: "Agency Partner", clientImageUrl: "/placeholder-user.jpg", rating: 5 },
]) }
export function getTeamMembers() { return cached<any[]>("cms:team-members", async () => prisma.teamMember.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }), defaultTeamMembers) }
export function getPublishedPages() { return cached<any[]>("cms:pages", async () => prisma.page.findMany({ where: { published: true }, orderBy: { title: "asc" } }), defaultPages) }

export async function getSiteSettings() {
  const fallback: Record<string, string> = { site_name: "IT LAB BD", logo_text: "it", header_logo_mode: "text", header_logo_image_url: "", footer_logo_mode: "text", footer_logo_image_url: "", logo_mode: "text", logo_image_url: "", phone: "+8801989897646", email: "info@itlabbd.com", address: "South Banasree Project, Khilgaon, Dhaka", topbar_message: "Howdy, ITLABBD", twitter_url: "#", facebook_url: "#", linkedin_url: "#" }
  const rows = await cached("cms:settings", async () => prisma.settings.findMany({ where: { group: "general" } }), [] as Array<{ key: string; value: unknown }>)
  const settings = (rows as Array<{ key: string; value: unknown }>).reduce<Record<string, string>>((current, row) => { current[row.key] = typeof row.value === "string" ? row.value : String(row.value ?? ""); return current }, { ...fallback })
  if (!settings.header_logo_image_url && settings.logo_image_url) settings.header_logo_image_url = settings.logo_image_url
  if (!settings.footer_logo_image_url && settings.logo_image_url) settings.footer_logo_image_url = settings.logo_image_url
  if (settings.logo_mode === "image") { if (settings.header_logo_image_url) settings.header_logo_mode = "image"; if (settings.footer_logo_image_url) settings.footer_logo_mode = "image" }
  for (const key of ["header_logo_image_url", "footer_logo_image_url", "logo_image_url", "twitter_url", "facebook_url", "linkedin_url"]) { try { settings[key] = sanitizeUrl(settings[key] || "") } catch { settings[key] = fallback[key] || "" } }
  return settings
}

export function getPageContent(slug: string) { const fallback = defaultPages.find(page => page.slug === slug) || null; return cached<any | null>(`cms:page:${slug}`, async () => prisma.page.findFirst({ where: { slug, published: true } }), fallback) }

export type HeaderMenuItem = { id: string; label: string; href: string; sortOrder: number; children: HeaderMenuItem[] }
type FlatMenu = { id: string; label: string; href: string; parentId: string | null; sortOrder: number }
function buildMenuTree(items: FlatMenu[]): HeaderMenuItem[] { const nodes = new Map<string, HeaderMenuItem>(); items.forEach(item => nodes.set(item.id, { id: item.id, label: item.label, href: item.href, sortOrder: item.sortOrder, children: [] })); const roots: HeaderMenuItem[] = []; items.forEach(item => { const node = nodes.get(item.id)!; const parent = item.parentId ? nodes.get(item.parentId) : null; if (parent) parent.children.push(node); else roots.push(node) }); const sort = (entries: HeaderMenuItem[]) => entries.sort((a, b) => a.sortOrder - b.sortOrder).forEach(entry => sort(entry.children)); sort(roots); return roots }
function defaultMenus(): FlatMenu[] { const ids = new Map(defaultMenuItems.map(item => [item.key, item.key])); return defaultMenuItems.map(item => ({ id: item.key, label: item.label, href: item.href, parentId: "parentKey" in item && item.parentKey ? ids.get(item.parentKey) || null : null, sortOrder: item.sortOrder })) }
export function getMenus() { return cached("cms:menus", async () => buildMenuTree(await prisma.menu.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } })), buildMenuTree(defaultMenus())) }

export async function getSearchResults(query: string) {
  const term = query.toLowerCase().trim(); if (!term) return []
  const [services, demos, projects] = await Promise.all([getServices(), getDemos(), getProjects()])
  const pages = [["About Us", "/about-us"], ["Our Mission", "/our-mission"], ["Our Vision", "/our-vision"], ["Our Philosophy", "/our-philosophy"], ["Our Strategy", "/our-strategy"], ["Our Team", "/our-team"], ["Services", "/services"], ["Demo", "/demo"], ["Portfolio", "/portfolio"], ["Contact Us", "/contact-us"]]
  return [...pages.map(([title, href]) => ({ type: "Page", title, href })), ...services.map((service: any) => ({ type: "Service", title: service.title, href: `/services/${service.slug}` })), ...demos.map((demo: any) => ({ type: "Demo", title: demo.title, href: "/demo" })), ...projects.map((project: any) => ({ type: "Portfolio", title: project.title, href: `/portfolio/${project.slug}` }))].filter(item => item.title.toLowerCase().includes(term)).slice(0, 20)
}

export type HomeSectionRecord = { type: "HERO" | "ABOUT" | "COUNTERS" | "SERVICES" | "PLATFORMS" | "WHAT_WE_DO" | "PORTFOLIO" | "TESTIMONIALS" | "TRUSTED_COMPANIES" | "CONTACT"; title: string; enabled: boolean; sortOrder: number; content: Record<string, unknown> }
const defaultHomeSections: HomeSectionRecord[] = [
  { type: "HERO", title: "Hero Section", enabled: true, sortOrder: 10, content: { eyebrow: "Modern digital solutions", headline: "Grow Your Business More Efficiently", subtitle: "Websites, software and digital solutions designed to help your business grow with confidence.", imageUrl: "/images/hero-team.png", features: [{ label: "Ecommerce Website", icon: "ShoppingCart" }, { label: "Portfolio Website", icon: "Briefcase" }, { label: "Business Website", icon: "Building2" }, { label: "Personal Website", icon: "User" }] } },
  { type: "ABOUT", title: "About Section", enabled: true, sortOrder: 20, content: { eyebrow: "About IT Lab BD", headline: "Changing The Way To Do Best Business Solutions", intro: "Over 11 years working in IT services developing software applications for clients all over the world.", mission: "Our mission is to help enterprises accelerate adoption of new technologies, untangle complex issues that emerge during digital evolution, and orchestrate ongoing innovation.", closing: "If you are looking for a trustworthy and reputable company to build your digital presence or transform your systems, IT Lab BD is ready to help.", blocks: [{ title: "Our Mission", text: "Build practical digital products that help clients grow.", imageUrl: "/images/about-1.png", href: "/our-mission" }, { title: "Our Vision", text: "Make modern technology useful, clear and accessible.", imageUrl: "/images/about-2.png", href: "/our-vision" }, { title: "Our Philosophy", text: "Keep every solution focused on real business value.", imageUrl: "/images/portfolio-5.png", href: "/our-philosophy" }, { title: "Our Strategy", text: "Combine design, engineering and long-term support.", imageUrl: "/images/portfolio-3.png", href: "/our-strategy" }] } },
  { type: "COUNTERS", title: "Counter Section", enabled: true, sortOrder: 30, content: { counters: [{ label: "Products Sale", value: 240, icon: "CircleDollarSign" }, { label: "Clients", value: 70, icon: "Users" }, { label: "Projects Done", value: 240, icon: "CheckCircle2" }, { label: "Years Experience", value: 12, icon: "Award" }] } },
  { type: "SERVICES", title: "Services Section", enabled: true, sortOrder: 40, content: { eyebrow: "Our services", headline: "We run all kinds Service", subtitle: "Choose the digital service that fits your next business goal." } },
  { type: "PLATFORMS", title: "Global Platforms", enabled: true, sortOrder: 45, content: { eyebrow: "Where we work", headline: "We work globally on top marketplaces", subtitle: "IT Lab BD connects with international clients through trusted platforms and long-term partnerships.", platforms: [{ name: "ThemeForest", badge: "Elite Author", description: "Premium digital products and international marketplace credibility.", imageUrl: "/images/platform-themeforest.svg", href: "#" }, { name: "Fiverr", badge: "Global Services", description: "Professional services for clients looking for reliable delivery.", imageUrl: "/images/platform-fiverr.svg", href: "#" }, { name: "Upwork", badge: "Worldwide Projects", description: "International collaboration for web and software projects.", imageUrl: "/images/platform-upwork.svg", href: "#" }] } },
  { type: "WHAT_WE_DO", title: "What We Do", enabled: true, sortOrder: 50, content: { eyebrow: "Industry solutions", headline: "What We Actually Do", subtitle: "Focused digital experiences for industries where performance, trust and clarity matter.", items: [{ icon: "ShoppingCart", label: "Ecommerce" }, { icon: "Newspaper", label: "Newspaper" }, { icon: "Home", label: "Real Estate" }, { icon: "Plane", label: "Tour & Travel" }, { icon: "Store", label: "Buying House" }, { icon: "Layers", label: "Multivendor" }, { icon: "Briefcase", label: "Portfolio" }, { icon: "Stethoscope", label: "Hospital" }, { icon: "Shirt", label: "Fashion" }, { icon: "Scale", label: "Law Firm" }, { icon: "Handshake", label: "B2B & B2C" }, { icon: "Users", label: "Consultancy" }] } },
  { type: "PORTFOLIO", title: "Portfolio", enabled: true, sortOrder: 60, content: { eyebrow: "Latest Projects", headline: "Some of Our Web Design Sample List", subtitle: "Selected work created to support trust, clarity and business growth.", buttonLabel: "Explore Full Portfolio", buttonUrl: "/portfolio" } },
  { type: "TESTIMONIALS", title: "Testimonials", enabled: true, sortOrder: 70, content: { eyebrow: "User Feedback", headline: "We love our Clients & they Love us.", subtitle: "Real feedback from clients who trusted IT Lab BD with their digital growth.", displayCount: 3 } },
  { type: "TRUSTED_COMPANIES", title: "Trusted Companies", enabled: true, sortOrder: 80, content: { eyebrow: "Trusted Companies", headline: "12k+ Companies grow with us", subtitle: "A growing ecosystem of businesses and teams building their digital future." } },
  { type: "CONTACT", title: "Contact", enabled: true, sortOrder: 90, content: { eyebrow: "Get in touch", headline: "Have a quick question?", imageUrl: "/images/robot.png", imageEyebrow: "Let's build", imageTitle: "Turn your next idea into a fast, secure digital product." } },
]
export function getHomepageSections() { return cached("cms:homepage-sections", async () => (await prisma.homepageSection.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } })).map((section: any) => ({ type: section.type, title: section.title, enabled: section.enabled, sortOrder: section.sortOrder, content: section.content as Record<string, unknown> })), defaultHomeSections) }

export async function getSeoMetadata(route: string, fallback: { title: string; description?: string }) {
  const seo = await cached(`cms:seo:${route}`, async () => prisma.sEOSettings.findUnique({ where: { route } }), null as null | { title: string; description: string; keywords: string | null; ogImage: string | null; noIndex: boolean })
  if (!seo) return fallback
  return { title: seo.title, description: seo.description, keywords: seo.keywords || undefined, robots: seo.noIndex ? { index: false, follow: false } : { index: true, follow: true }, openGraph: { title: seo.title, description: seo.description, images: seo.ogImage ? [seo.ogImage] : undefined }, twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: seo.ogImage ? [seo.ogImage] : undefined } }
}
