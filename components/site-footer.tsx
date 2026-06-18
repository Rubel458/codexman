import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { FacebookIcon, LinkedinIcon, TwitterIcon } from "@/components/social-icons"
import { BrandLogo } from "@/components/brand-logo"
import { getSiteSettings } from "@/lib/cms"

export async function SiteFooter() {
  const settings = await getSiteSettings()
  const contactInfo = [
    { icon: MapPin, title: "Our Address", value: settings.address, color: "text-amber-300", bg: "bg-amber-400/10" },
    { icon: Mail, title: "Our Mailbox", value: settings.email, color: "text-sky-300", bg: "bg-sky-400/10" },
    { icon: Phone, title: "Our Phone", value: settings.phone, color: "text-emerald-300", bg: "bg-emerald-400/10" },
  ]
  const socials = [{ Icon: TwitterIcon, href: settings.twitter_url || "#", label: "Twitter" }, { Icon: FacebookIcon, href: settings.facebook_url || "#", label: "Facebook" }, { Icon: LinkedinIcon, href: settings.linkedin_url || "#", label: "LinkedIn" }]
  return <footer className="bg-slate-950 text-white">
    <div className="mx-auto max-w-[1760px] px-6 py-14 lg:px-10">
      <div className="grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <Link href="/" className="flex cursor-pointer items-center gap-3"><BrandLogo settings={settings} footer /></Link>
          <p className="mt-5 max-w-md text-base leading-7 text-white/65">Professional websites, software solutions and practical support for businesses that want to grow with confidence.</p>
          <div className="mt-6 flex gap-3">{socials.map(({ Icon, href, label }) => <a key={label} href={href} aria-label={label} className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-sky-300/60 hover:bg-sky-400/15"><Icon className="size-4 text-sky-200" /></a>)}</div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">{contactInfo.map(info => <div key={info.title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><span className={`flex size-12 items-center justify-center rounded-xl ${info.bg}`}><info.icon className={`size-5 ${info.color}`} /></span><p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-white/45">{info.title}</p><p className="mt-2 text-lg font-medium leading-7 text-white/85">{info.value}</p></div>)}</div>
      </div>
      <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-7 lg:flex-row lg:items-center lg:justify-between">
        <nav className="flex flex-wrap items-center gap-6 text-[15px] font-semibold text-white/65"><Link className="transition hover:text-sky-200" href="/">Home</Link><Link className="transition hover:text-sky-200" href="/services">Services</Link><Link className="transition hover:text-sky-200" href="/about-us">About</Link><Link className="transition hover:text-sky-200" href="/portfolio">Portfolio</Link><Link className="transition hover:text-sky-200" href="/contact-us">Contact Us</Link></nav>
        <p className="text-sm text-white/50">Copyright © 2026 by {settings.site_name || "IT Lab BD"}. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
}
