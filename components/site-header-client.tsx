"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ChevronDown, Headphones, Mail, Menu, Phone, Search, X } from "lucide-react"
import { FacebookIcon, LinkedinIcon, TwitterIcon } from "@/components/social-icons"
import { BrandLogo } from "@/components/brand-logo"
import type { HeaderMenuItem } from "@/lib/cms"

const SearchModal = dynamic(() => import("@/components/search-modal").then(module => module.SearchModal), { ssr: false })

function Dropdown({ item }: { item: HeaderMenuItem }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true) }
  const delayClose = () => { closeTimer.current = setTimeout(() => setOpen(false), 320) }
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  return <div className="relative" onMouseEnter={cancelClose} onMouseLeave={delayClose}>
    <Link href={item.href} className="flex cursor-pointer items-center gap-1.5 rounded-lg px-1 py-3 text-[15px] font-semibold text-foreground transition duration-200 hover:text-blue-700">
      {item.label}<ChevronDown className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
    </Link>
    <div className={`absolute left-0 top-full w-80 pt-4 transition duration-200 ${open ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"}`}>
      <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl shadow-slate-900/10">
        {item.children.map(link => <Link key={link.id} href={link.href} className="block cursor-pointer rounded-xl px-4 py-3.5 text-[15px] font-medium text-slate-700 transition duration-200 hover:bg-blue-50 hover:text-blue-700">
          {link.label}
        </Link>)}
      </div>
    </div>
  </div>
}

export function SiteHeaderClient({ menus, settings }: { menus: HeaderMenuItem[]; settings: Record<string, string> }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const closeMobile = () => { setMobileOpen(false); setExpanded({}) }
  const toggleMobileMenu = () => { setMobileOpen(value => { if (value) setExpanded({}); return !value }) }
  const toggleSubmenu = (id: string) => setExpanded(current => ({ ...current, [id]: !current[id] }))

  return <>
    <header className="relative z-50 w-full">
      <div className="hidden bg-slate-950 text-white/80 md:block">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-3 text-[15px] lg:px-10">
          <div className="flex items-center gap-6">
            <a href={`tel:${settings.phone}`} className="flex items-center gap-2 font-semibold transition hover:text-sky-200"><Phone className="size-[18px]" />{settings.phone}</a>
            <a href={`mailto:${settings.email}`} className="flex items-center gap-2 font-semibold transition hover:text-sky-200"><Mail className="size-[18px]" />{settings.email}</a>
          </div>
          <div className="flex items-center gap-3"><span className="font-medium">{settings.topbar_message || "Howdy, ITLABBD"}</span><span className="h-4 w-px bg-white/20" /><a href={settings.twitter_url || "#"} aria-label="Twitter" className="transition hover:text-sky-200"><TwitterIcon className="size-4" /></a><a href={settings.facebook_url || "#"} aria-label="Facebook" className="transition hover:text-sky-200"><FacebookIcon className="size-4" /></a><a href={settings.linkedin_url || "#"} aria-label="LinkedIn" className="transition hover:text-sky-200"><LinkedinIcon className="size-4" /></a></div>
        </div>
      </div>
      <div className="relative bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-[18px] sm:px-6 lg:px-10">
          <Link href="/" className="flex cursor-pointer items-center gap-2.5"><BrandLogo settings={settings} /></Link>
          <nav className="hidden items-center gap-6 xl:flex">{menus.map(item => item.children.length ? <Dropdown key={item.id} item={item} /> : <Link key={item.id} href={item.href} className="cursor-pointer rounded-lg px-1 py-3 text-[15px] font-semibold transition duration-200 hover:text-blue-700">{item.label}</Link>)}</nav>
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setSearchOpen(value => !value)} aria-label="Toggle search" className="cursor-pointer rounded-full p-2 text-foreground transition duration-200 hover:bg-blue-50 hover:text-blue-700">{searchOpen ? <X className="size-5" /> : <Search className="size-5" />}</button>
            <div className="hidden items-center gap-2 2xl:flex"><span className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Headphones className="size-4" /></span><div className="text-xs leading-tight"><p className="text-muted-foreground">Have Any Questions?</p><p className="font-semibold">{settings.phone}</p></div></div>
            <Link href="/demo" className="brand-button hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white sm:inline-block">DEMOS</Link>
            <button className="cursor-pointer rounded-lg border border-transparent p-1 text-foreground transition hover:border-blue-200 hover:bg-blue-50 xl:hidden" aria-label="Toggle menu" onClick={toggleMobileMenu}>{mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}</button>
          </div>
        </div>
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        {mobileOpen && <nav className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 shadow-xl xl:hidden">
          <div className="grid gap-1">{menus.map(item => {
            const isOpen = !!expanded[item.id]
            return <div key={item.id} className="rounded-xl">
              <div className="flex items-center gap-1">
                <Link href={item.href} onClick={closeMobile} className="block flex-1 cursor-pointer rounded-lg px-3 py-3 text-[15px] font-semibold transition hover:bg-blue-50 hover:text-blue-700">{item.label}</Link>
                {item.children.length > 0 && <button type="button" onClick={() => toggleSubmenu(item.id)} aria-label={`${isOpen ? "Close" : "Open"} ${item.label} submenu`} aria-expanded={isOpen} className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"><ChevronDown className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} /></button>}
              </div>
              {item.children.length > 0 && isOpen && <div className="ml-4 mt-1 grid border-l border-blue-100 pl-3">{item.children.map(child => <Link key={child.id} href={child.href} onClick={closeMobile} className="block cursor-pointer rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-blue-50 hover:text-blue-700">{child.label}</Link>)}</div>}
            </div>
          })}</div>
        </nav>}
      </div>
    </header>
  </>
}
