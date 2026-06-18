import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { JsonLd } from "@/components/seo/json-ld"
import { getSiteSettings } from "@/lib/cms"

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const organization = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: settings.site_name || "IT LAB BD", url: siteUrl, logo: settings.header_logo_image_url || settings.logo_image_url || undefined, email: settings.email || undefined, telephone: settings.phone || undefined, address: settings.address ? { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "BD" } : undefined },
      { "@type": "LocalBusiness", "@id": `${siteUrl}/#localbusiness`, name: settings.site_name || "IT LAB BD", url: siteUrl, image: settings.header_logo_image_url || settings.logo_image_url || undefined, email: settings.email || undefined, telephone: settings.phone || undefined, address: settings.address ? { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "BD" } : undefined, parentOrganization: { "@id": `${siteUrl}/#organization` } },
    ],
  }
  return <main className="min-h-screen bg-background"><JsonLd data={organization}/><SiteHeader />{children}<SiteFooter /></main>
}
