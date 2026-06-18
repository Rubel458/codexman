import { prisma } from "@/lib/prisma"

type ResourceConfig = { label: string; delegate: () => any; allowed: readonly string[]; readOnly?: boolean }

export const adminResources = {
  settings: { label: "Website Settings", delegate: () => prisma.settings, allowed: ["key", "value", "group"] },
  menus: { label: "Menus", delegate: () => prisma.menu, allowed: ["label", "href", "parentId", "sortOrder", "enabled"] },
  pages: { label: "Pages", delegate: () => prisma.page, allowed: ["slug", "title", "excerpt", "content", "published"] },
  "homepage-sections": { label: "Homepage Sections", delegate: () => prisma.homepageSection, allowed: ["type", "title", "enabled", "sortOrder", "content"] },
  services: { label: "Services", delegate: () => prisma.service, allowed: ["slug", "title", "excerpt", "content", "icon", "sortOrder", "published"] },
  "team-members": { label: "Team Members", delegate: () => prisma.teamMember, allowed: ["slug", "name", "role", "bio", "imageUrl", "skills", "experience", "email", "published", "sortOrder"] },
  portfolios: { label: "Portfolio Projects", delegate: () => prisma.portfolio, allowed: ["slug", "title", "excerpt", "imageUrl", "screenshots", "technologies", "liveUrl", "buttonLabel", "buttonUrl", "caseStudy", "published", "sortOrder", "categoryId"] },
  "portfolio-categories": { label: "Portfolio Categories", delegate: () => prisma.portfolioCategory, allowed: ["name", "slug"] },
  demos: { label: "Demo Items", delegate: () => prisma.demo, allowed: ["slug", "title", "imageUrl", "previewUrl", "liveUrl", "published", "sortOrder", "categoryId"] },
  "demo-categories": { label: "Demo Categories", delegate: () => prisma.demoCategory, allowed: ["name", "slug"] },
  testimonials: { label: "Testimonials", delegate: () => prisma.testimonial, allowed: ["brand", "brandImageUrl", "quote", "author", "position", "clientImageUrl", "rating", "published", "sortOrder"] },
  logos: { label: "Trusted Companies", delegate: () => prisma.companyLogo, allowed: ["name", "imageUrl", "website", "published", "sortOrder"] },
  leads: { label: "Contact Leads", delegate: () => prisma.contactLead, allowed: ["status"] },
  media: { label: "Media Library", delegate: () => prisma.media, allowed: ["altText"] },
  seo: { label: "SEO Settings", delegate: () => prisma.sEOSettings, allowed: ["route", "title", "description", "keywords", "ogImage", "noIndex"] },
  "activity-logs": { label: "Activity Logs", delegate: () => prisma.activityLog, allowed: [], readOnly: true },
} as const satisfies Record<string, ResourceConfig>

export type AdminResource = keyof typeof adminResources
export function getResource(name: string): ResourceConfig | undefined { return adminResources[name as AdminResource] }
