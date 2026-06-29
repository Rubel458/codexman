import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { VisitorTracker } from "@/components/visitor-tracker"
import { CmsRefreshListener } from "@/components/cms-refresh-listener"
import { ScrollRevealInit } from "@/components/scroll-reveal-init"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "IT Lab BD - Web Development & IT Solutions", template: "%s | IT Lab BD" },
  description: "IT Lab BD builds fast, secure and SEO-friendly business websites, e-commerce platforms and custom web solutions for clients worldwide.",
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  openGraph: { type: "website", title: "IT Lab BD - Web Development & IT Solutions", description: "IT Lab BD builds fast, secure and SEO-friendly business websites, e-commerce platforms and custom web solutions for clients worldwide.", images: ["/images/hero-team.png"] },
  twitter: { card: "summary_large_image", title: "IT Lab BD - Web Development & IT Solutions", description: "Fast, secure and SEO-friendly websites and custom digital solutions.", images: ["/images/hero-team.png"] },
}

export const viewport: Viewport = { themeColor: "#1769e0", colorScheme: "light" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        {children}
        <VisitorTracker />
        <CmsRefreshListener />
        <ScrollRevealInit />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
