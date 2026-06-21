import type { Metadata } from "next"
import { HomepageRenderer } from "@/components/home/homepage-renderer"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { FloatingContactWidget } from "@/components/floating-contact-widget"
import { JsonLd } from "@/components/seo/json-ld"
import { getCompanyLogos, getContactWidgetSettings, getHomepageSections, getProjects, getSeoMetadata, getServices, getSiteSettings, getTestimonials } from "@/lib/cms"
import { getSiteUrl } from "@/lib/site-url"
export const dynamic="force-dynamic"
export const revalidate=0
export async function generateMetadata():Promise<Metadata>{return getSeoMetadata("/",{title:"IT Lab BD - Web Development & IT Solutions",description:"IT Lab BD builds fast, secure and SEO-friendly business websites, e-commerce platforms and custom web solutions for clients worldwide."})}
export default async function Page(){const[sections,services,projects,testimonials,logos,settings,contactWidgetSettings]=await Promise.all([getHomepageSections(),getServices(),getProjects(),getTestimonials(),getCompanyLogos(),getSiteSettings(),getContactWidgetSettings()]);const siteUrl=getSiteUrl();const organization={"@context":"https://schema.org","@type":"Organization",name:settings.site_name||"IT LAB BD",url:siteUrl,logo:settings.header_logo_image_url||undefined,email:settings.email||undefined,telephone:settings.phone||undefined};return <main className="min-h-screen bg-background"><JsonLd data={organization}/><SiteHeader/><HomepageRenderer sections={sections} services={services} projects={projects} testimonials={testimonials} logos={logos}/><SiteFooter/><FloatingContactWidget settings={contactWidgetSettings}/></main>}
