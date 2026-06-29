"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArchiveRestore,
  BarChart3,
  BookOpen,
  Building2,
  ChevronRight,
  ClipboardList,
  Download,
  FolderKanban,
  Gauge,
  Image,
  Images,
  LayoutTemplate,
  LineChart,
  Mail,
  MessageCircle,
  MessageSquareQuote,
  MonitorPlay,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { CacheClearButton } from "@/components/admin/cache-clear-button";
import { LogoutButton } from "@/components/admin/logout-button";
import { NotificationBell } from "@/components/admin/notification-bell";

type AdminNavItem = {
  label: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  children?: AdminNavItem[];
};

type AdminNavGroup = { label: string; items: AdminNavItem[] };

const groups: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: Gauge }],
  },
  {
    label: "Home Page",
    items: [
      {
        label: "Homepage",
        icon: LayoutTemplate,
        children: [
          {
            label: "Hero Section",
            href: "/admin/home/hero",
            icon: LayoutTemplate,
          },
          {
            label: "About Section",
            href: "/admin/home/about",
            icon: LayoutTemplate,
          },
          {
            label: "Counter Section",
            href: "/admin/home/counters",
            icon: LayoutTemplate,
          },
          {
            label: "Services Section",
            href: "/admin/home/services",
            icon: LayoutTemplate,
          },
          {
            label: "Global Platforms",
            href: "/admin/home/platforms",
            icon: LayoutTemplate,
          },
          {
            label: "What We Do",
            href: "/admin/home/what-we-do",
            icon: LayoutTemplate,
          },
          {
            label: "Portfolio Section",
            href: "/admin/home/portfolio",
            icon: LayoutTemplate,
          },
          {
            label: "Testimonials Section",
            href: "/admin/home/testimonials",
            icon: LayoutTemplate,
          },
          {
            label: "Trusted Companies",
            href: "/admin/home/trusted-companies",
            icon: LayoutTemplate,
          },
          {
            label: "Contact Section",
            href: "/admin/home/contact",
            icon: LayoutTemplate,
          },
        ],
      },
    ],
  },
  {
    label: "Pages",
    items: [
      {
        label: "About",
        icon: BookOpen,
        children: [
          {
            label: "About Page",
            href: "/admin/page-content/about-us",
            icon: BookOpen,
          },
          {
            label: "Our Mission",
            href: "/admin/page-content/our-mission",
            icon: BookOpen,
          },
          {
            label: "Our Vision",
            href: "/admin/page-content/our-vision",
            icon: BookOpen,
          },
          {
            label: "Our Philosophy",
            href: "/admin/page-content/our-philosophy",
            icon: BookOpen,
          },
          {
            label: "Our Strategy",
            href: "/admin/page-content/our-strategy",
            icon: BookOpen,
          },
          {
            label: "Our Team",
            href: "/admin/page-content/our-team",
            icon: UsersRound,
          },
        ],
      },
      {
        label: "Contact Page",
        href: "/admin/page-content/contact-us",
        icon: Mail,
      },
      { label: "All CMS Pages", href: "/admin/pages", icon: BookOpen },
      { label: "SEO Settings", href: "/admin/seo", icon: Search },
    ],
  },
  {
    label: "Website",
    items: [
      { label: "Branding & Contact", href: "/admin/branding", icon: Settings },
      { label: "Floating Contact", href: "/admin/contact-widget", icon: MessageCircle },
      { label: "Advanced Settings", href: "/admin/settings", icon: Settings },
      { label: "Header Menus", href: "/admin/menus", icon: LayoutTemplate },
      { label: "Footer Settings", href: "/admin/footer-settings", icon: LayoutTemplate },
      { label: "Sidebar Banners", href: "/admin/promo-banners", icon: Image },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Services", href: "/admin/services", icon: Building2 },
      { label: "Team Members", href: "/admin/team-members", icon: UsersRound },
      {
        label: "Portfolio",
        icon: FolderKanban,
        children: [
          {
            label: "Portfolio Categories",
            href: "/admin/portfolio-categories",
            icon: BarChart3,
          },
          {
            label: "Portfolio Projects",
            href: "/admin/portfolios",
            icon: FolderKanban,
          },
        ],
      },
      {
        label: "Demo",
        icon: MonitorPlay,
        children: [
          {
            label: "Demo Categories",
            href: "/admin/demo-categories",
            icon: BarChart3,
          },
          { label: "Demo Items", href: "/admin/demos", icon: MonitorPlay },
        ],
      },
      {
        label: "Downloads",
        icon: Download,
        children: [
          {
            label: "Categories",
            href: "/admin/download-categories",
            icon: BarChart3,
          },
          {
            label: "Download Files",
            href: "/admin/download-items",
            icon: Download,
          },
        ],
      },
      { label: "Gallery", href: "/admin/gallery-items", icon: Images },
      {
        label: "Blog",
        icon: BookOpen,
        children: [
          {
            label: "Categories",
            href: "/admin/blog-categories",
            icon: BarChart3,
          },
          { label: "Posts", href: "/admin/blog-posts", icon: BookOpen },
        ],
      },
      {
        label: "Testimonials",
        href: "/admin/testimonials",
        icon: MessageSquareQuote,
      },
      { label: "Trusted Companies", href: "/admin/logos", icon: ShieldCheck },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Operations",
        icon: LineChart,
        children: [
          { label: "Website Analytics", href: "/admin/analytics", icon: LineChart },
          { label: "Contact Leads", href: "/admin/leads", icon: Mail },
          { label: "Media Manager", href: "/admin/media", icon: Image },
          {
            label: "Activity Logs",
            href: "/admin/activity-logs",
            icon: ClipboardList,
          },
          { label: "System Backup", href: "/admin/backups", icon: ArchiveRestore },
          { label: "Profile & Security", href: "/admin/security", icon: UserRound },
        ],
      },
    ],
  },
];

function isHrefActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getItemKey(item: AdminNavItem) {
  return item.href ?? item.label;
}

function itemContainsActivePath(item: AdminNavItem, pathname: string): boolean {
  if (isHrefActive(pathname, item.href)) return true;
  return item.children?.some((child) => itemContainsActivePath(child, pathname)) ?? false;
}

function findActiveParentKey(items: AdminNavItem[], pathname: string): string | null {
  for (const item of items) {
    if (item.children?.length && itemContainsActivePath(item, pathname)) {
      return getItemKey(item);
    }
  }
  return null;
}

function NavItem({
  item,
  pathname,
  openKey,
  setOpenKey,
}: {
  item: AdminNavItem;
  pathname: string;
  openKey: string | null;
  setOpenKey: (key: string | null) => void;
}) {
  const hasChildren = Boolean(item.children?.length);
  const itemKey = getItemKey(item);
  const isOpen = hasChildren && openKey === itemKey;
  const isDirectActive = isHrefActive(pathname, item.href);
  const isChildActive = hasChildren && itemContainsActivePath(item, pathname);
  const isParentHighlighted = Boolean(hasChildren && (isOpen || isChildActive));
  const commonClass =
    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 hover:bg-white/10 hover:text-sky-100";
  const activeClass =
    isDirectActive || isParentHighlighted
      ? "bg-sky-500/15 text-sky-100 ring-1 ring-sky-400/20"
      : "text-white/70";

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenKey(isOpen ? null : itemKey)}
          aria-expanded={isOpen}
          className={`${commonClass} ${activeClass}`}
        >
          <item.icon className="size-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronRight
            className={`size-4 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </button>
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="ml-6 mt-1 grid gap-1 border-l border-white/10 pl-3">
              {item.children?.map((child) => {
                const childActive = itemContainsActivePath(child, pathname);
                return (
                  <Link
                    key={getItemKey(child)}
                    href={child.href ?? "#"}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition duration-200 hover:bg-white/10 hover:text-sky-100 ${
                      childActive
                        ? "bg-white/10 text-white ring-1 ring-white/10"
                        : "text-white/55"
                    }`}
                  >
                    <child.icon className="size-3.5 shrink-0" />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={item.href ?? "#"} className={`${commonClass} ${activeClass}`}>
      <item.icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const activeParentKey = useMemo(
    () => findActiveParentKey(groups.flatMap((group) => group.items), pathname),
    [pathname],
  );
  const [openKey, setOpenKey] = useState<string | null>(activeParentKey);

  useEffect(() => {
    setOpenKey(activeParentKey);
  }, [activeParentKey]);

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-[300px]">
      <aside className="cms-scroll bg-slate-950 p-5 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-[300px] lg:overflow-y-auto">
        <Link href="/admin" className="flex cursor-pointer items-center gap-3">
          <span className="brand-button flex size-11 items-center justify-center rounded-xl font-heading font-bold">
            it
          </span>
          <span>
            <strong className="block">IT LAB BD</strong>
            <small className="text-white/50">Custom CMS</small>
          </span>
        </Link>
        <nav className="mt-7 grid gap-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[.2em] text-white/35">
                {group.label}
              </p>
              <div className="grid gap-1">
                {group.items.map((item) => (
                  <NavItem
                    key={getItemKey(item)}
                    item={item}
                    pathname={pathname}
                    openKey={openKey}
                    setOpenKey={setOpenKey}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-8 border-t border-white/10 pt-4">
          <p className="px-3 pb-3 text-xs text-white/45">
            Signed in as <strong className="text-white/80">{username}</strong>
          </p>
          <LogoutButton />
        </div>
      </aside>
      <div>
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-[1760px] flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">
                IT Lab BD CMS
              </p>
              <p className="font-heading text-lg font-semibold">
                Website Administration
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <CacheClearButton />
              <Link
                href="/"
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                View website
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1760px] p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
