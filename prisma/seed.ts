import 'dotenv/config'
import { Prisma, PrismaClient } from "@prisma/client"
import { buildBootstrapHash } from "../lib/admin-password"
import { defaultDemos, defaultLogos, defaultMenuItems, defaultPages, defaultProjects, defaultServices, defaultTeamMembers } from "../lib/default-content"

type SectionType = "HERO" | "ABOUT" | "COUNTERS" | "SERVICES" | "PLATFORMS" | "WHAT_WE_DO" | "PORTFOLIO" | "TESTIMONIALS" | "TRUSTED_COMPANIES" | "CONTACT"
const prisma = new PrismaClient()

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

const sections: Array<{ type: SectionType; title: string; sortOrder: number; content: Record<string, unknown> }> = [
  { type: "HERO", title: "Hero Section", sortOrder: 10, content: { eyebrow: "Modern digital solutions", headline: "Grow Your Business More Efficiently", subtitle: "Websites, software and digital solutions designed to help your business grow with confidence.", imageUrl: "/images/hero-team.png", features: [{ label: "Ecommerce Website", icon: "ShoppingCart" }, { label: "Portfolio Website", icon: "Briefcase" }, { label: "Business Website", icon: "Building2" }, { label: "Personal Website", icon: "User" }] } },
  { type: "ABOUT", title: "About Section", sortOrder: 20, content: { eyebrow: "About IT Lab BD", headline: "Changing The Way To Do Best Business Solutions", intro: "Over 11 years working in IT services developing software applications for clients all over the world.", mission: "Our mission is to help enterprises accelerate adoption of new technologies, untangle complex issues that emerge during digital evolution, and orchestrate ongoing innovation.", closing: "If you are looking for a trustworthy and reputable company to build your digital presence or transform your systems, IT Lab BD is ready to help.", blocks: [{ title: "Our Mission", text: "Build practical digital products that help clients grow.", imageUrl: "/images/about-1.png", href: "/our-mission" }, { title: "Our Vision", text: "Make modern technology useful, clear and accessible.", imageUrl: "/images/about-2.png", href: "/our-vision" }, { title: "Our Philosophy", text: "Keep every solution focused on real business value.", imageUrl: "/images/portfolio-5.png", href: "/our-philosophy" }, { title: "Our Strategy", text: "Combine design, engineering and long-term support.", imageUrl: "/images/portfolio-3.png", href: "/our-strategy" }] } },
  { type: "COUNTERS", title: "Counter Section", sortOrder: 30, content: { counters: [{ label: "Products Sale", value: 240, icon: "CircleDollarSign" }, { label: "Clients", value: 70, icon: "Users" }, { label: "Projects Done", value: 240, icon: "CheckCircle2" }, { label: "Years Experience", value: 12, icon: "Award" }] } },
  { type: "SERVICES", title: "Services Section", sortOrder: 40, content: { eyebrow: "Our services", headline: "We run all kinds Service", subtitle: "Choose the digital service that fits your next business goal." } },
  { type: "PLATFORMS", title: "Global Platforms", sortOrder: 45, content: { eyebrow: "Where we work", headline: "We work globally on top marketplaces", subtitle: "IT Lab BD connects with international clients through trusted platforms and long-term partnerships.", platforms: [{ name: "ThemeForest", badge: "Elite Author", description: "Premium digital products and international marketplace credibility.", imageUrl: "/images/platform-themeforest.svg", href: "#" }, { name: "Fiverr", badge: "Global Services", description: "Professional services for clients looking for reliable delivery.", imageUrl: "/images/platform-fiverr.svg", href: "#" }, { name: "Upwork", badge: "Worldwide Projects", description: "International collaboration for web and software projects.", imageUrl: "/images/platform-upwork.svg", href: "#" }] } },
  { type: "WHAT_WE_DO", title: "What We Do", sortOrder: 50, content: { eyebrow: "Industry solutions", headline: "What We Actually Do", subtitle: "Focused digital experiences for industries where performance, trust and clarity matter.", items: [{ icon: "ShoppingCart", label: "Ecommerce" }, { icon: "Newspaper", label: "Newspaper" }, { icon: "Home", label: "Real Estate" }, { icon: "Plane", label: "Tour & Travel" }, { icon: "Store", label: "Buying House" }, { icon: "Layers", label: "Multivendor" }, { icon: "Briefcase", label: "Portfolio" }, { icon: "Stethoscope", label: "Hospital" }, { icon: "Shirt", label: "Fashion" }, { icon: "Scale", label: "Law Firm" }, { icon: "Handshake", label: "B2B & B2C" }, { icon: "Users", label: "Consultancy" }] } },
  { type: "PORTFOLIO", title: "Portfolio Section", sortOrder: 60, content: { eyebrow: "Latest Projects", headline: "Some of Our Web Design Sample List", subtitle: "Selected work created to support trust, clarity and business growth.", buttonLabel: "Explore Full Portfolio", buttonUrl: "/portfolio" } },
  { type: "TESTIMONIALS", title: "Testimonials", sortOrder: 70, content: { eyebrow: "User Feedback", headline: "We love our Clients & they Love us.", subtitle: "Real feedback from clients who trusted IT Lab BD with their digital growth.", displayCount: 3 } },
  { type: "TRUSTED_COMPANIES", title: "Trusted Companies", sortOrder: 80, content: { eyebrow: "Trusted Companies", headline: "12k+ Companies grow with us", subtitle: "A growing ecosystem of businesses and teams building their digital future." } },
  { type: "CONTACT", title: "Contact Section", sortOrder: 90, content: { eyebrow: "Get in touch", headline: "Have a quick question?", imageUrl: "/images/robot.png", imageEyebrow: "Let's build", imageTitle: "Turn your next idea into a fast, secure digital product." } },
]

function mergeSectionContent(type: SectionType, current: unknown, fallback: Record<string, unknown>) {
  const value = current && typeof current === "object" && !Array.isArray(current) ? { ...(current as Record<string, unknown>) } : { ...fallback }
  if (type === "ABOUT" && Array.isArray(value.blocks)) {
    const routes: Record<string, string> = { "Our Mission": "/our-mission", "Our Vision": "/our-vision", "Our Philosophy": "/our-philosophy", "Our Strategy": "/our-strategy" }
    value.blocks = value.blocks.map((block: any) => ({ ...block, href: !block?.href || block.href === "/about-us" ? routes[String(block?.title || "")] || "/about-us" : block.href }))
  }
  if (type === "COUNTERS" && Array.isArray(value.counters) && value.counters.length < 4) value.counters = [...value.counters, { label: "Years Experience", value: 12, icon: "Award" }]
  if (type === "TESTIMONIALS" && !value.displayCount) value.displayCount = 3
  return value
}

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin"
  const passwordHash = await buildBootstrapHash()
  const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || "info@itlabbd.com"
  const existingAdmin = await prisma.admin.findUnique({ where: { username } })
  if (existingAdmin) await prisma.admin.update({ where: { id: existingAdmin.id }, data: { active: true, email: adminEmail, ...(process.env.ADMIN_FORCE_PASSWORD_SYNC === "true" ? { passwordHash, sessionVersion: { increment: 1 } } : {}) } })
  else await prisma.admin.create({ data: { username, passwordHash, name: "IT Lab BD Administrator", email: adminEmail } })

  for (const section of sections) {
    const existing = await prisma.homepageSection.findUnique({ where: { type: section.type } })
    if (!existing) await prisma.homepageSection.create({ data: { ...section, content: asJson(section.content) } })
    else {
      const content = mergeSectionContent(section.type, existing.content, section.content)
      if (JSON.stringify(content) !== JSON.stringify(existing.content)) await prisma.homepageSection.update({ where: { id: existing.id }, data: { content: asJson(content) } })
    }
  }

  for (const [sortOrder, service] of defaultServices.entries()) {
    const content = { ...service.content, buttonLabel: "View More", buttonUrl: `/services/${service.slug}`, ctaLabel: "Discuss this service", ctaUrl: "/contact-us" }
    await prisma.service.upsert({ where: { slug: service.slug }, update: {}, create: { ...service, content, sortOrder } })
  }
  for (const page of defaultPages) await prisma.page.upsert({ where: { slug: page.slug }, update: {}, create: page })

  const settings = [
    { key: "site_name", value: "IT LAB BD" }, { key: "logo_text", value: "it" }, { key: "header_logo_mode", value: "text" }, { key: "header_logo_image_url", value: "" }, { key: "footer_logo_mode", value: "text" }, { key: "footer_logo_image_url", value: "" },
    { key: "phone", value: "+8801989897646" }, { key: "email", value: "info@itlabbd.com" }, { key: "address", value: "South Banasree Project, Khilgaon, Dhaka" },
    { key: "topbar_message", value: "Howdy, ITLABBD" }, { key: "twitter_url", value: "#" }, { key: "facebook_url", value: "#" }, { key: "linkedin_url", value: "#" },
  ]
  for (const setting of settings) await prisma.settings.upsert({ where: { key: setting.key }, update: {}, create: { ...setting, group: "general" } })

  for (const [sortOrder, member] of defaultTeamMembers.entries()) await prisma.teamMember.upsert({ where: { slug: member.slug }, update: {}, create: { ...member, sortOrder } })
  const portfolioCategories = ["Corporate", "eCommerce", "Personal", "Technology"]
  for (const name of portfolioCategories) await prisma.portfolioCategory.upsert({ where: { slug: name.toLowerCase() }, update: {}, create: { name, slug: name.toLowerCase() } })
  for (const [sortOrder, project] of defaultProjects.entries()) {
    const category = await prisma.portfolioCategory.findUnique({ where: { slug: project.category.toLowerCase() } })
    const data = { title: project.title, excerpt: project.excerpt, imageUrl: project.imageUrl, technologies: project.technologies, screenshots: project.screenshots, caseStudy: project.caseStudy, buttonLabel: "View case study", buttonUrl: `/portfolio/${project.slug}`, sortOrder, categoryId: category?.id }
    await prisma.portfolio.upsert({ where: { slug: project.slug }, update: {}, create: { slug: project.slug, ...data } })
  }
  const demoCategories = ["Business Websites", "Portfolio Websites", "E-Commerce Websites", "News Portals", "Corporate Websites", "Landing Pages"]
  for (const name of demoCategories) { const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-"); await prisma.demoCategory.upsert({ where: { slug }, update: {}, create: { name, slug } }) }
  for (const [sortOrder, demo] of defaultDemos.entries()) {
    const category = await prisma.demoCategory.findUnique({ where: { slug: demo.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") } })
    const data = { title: demo.title, imageUrl: demo.imageUrl, previewUrl: demo.previewUrl, liveUrl: demo.liveUrl, categoryId: category?.id, sortOrder }
    await prisma.demo.upsert({ where: { slug: demo.slug }, update: {}, create: { slug: demo.slug, ...data } })
  }
  for (const [sortOrder, name] of defaultLogos.entries()) if (!await prisma.companyLogo.findFirst({ where: { name } })) await prisma.companyLogo.create({ data: { name, sortOrder } })
  const testimonials = [
    { brand: "Trustpilot", quote: "IT Lab BD delivered a professional website with a smooth process and dependable communication.", author: "Business Client", position: "Business Owner", clientImageUrl: "/placeholder-user.jpg" },
    { brand: "Client Review", quote: "Fast delivery, clean implementation and helpful technical support from planning to launch.", author: "International Client", position: "Project Manager", clientImageUrl: "/placeholder-user.jpg" },
    { brand: "Project Feedback", quote: "A modern solution that is easy to manage and ready to grow with our business.", author: "Agency Partner", position: "Agency Partner", clientImageUrl: "/placeholder-user.jpg" },
  ]
  for (const [sortOrder, testimonial] of testimonials.entries()) if (!await prisma.testimonial.findFirst({ where: { brand: testimonial.brand } })) await prisma.testimonial.create({ data: { ...testimonial, sortOrder } })

  if (await prisma.menu.count() === 0) {
    const created = new Map<string, string>()
    for (const item of defaultMenuItems.filter(item => !("parentKey" in item))) { const menu = await prisma.menu.create({ data: { label: item.label, href: item.href, sortOrder: item.sortOrder } }); created.set(item.key, menu.id) }
    for (const item of defaultMenuItems.filter(item => "parentKey" in item)) await prisma.menu.create({ data: { label: item.label, href: item.href, sortOrder: item.sortOrder, parentId: created.get((item as { parentKey: string }).parentKey) } })
  }
  console.log(`Seed completed without overwriting CMS edits. Admin username: ${username}`)
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
