import Link from "next/link";
import { ExternalLink, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, LinkedinIcon, TwitterIcon } from "@/components/social-icons";
import { BrandLogo } from "@/components/brand-logo";
import { getFooterSettings, getSiteSettings, type FooterSocialLink } from "@/lib/cms";

function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const normalized = platform.toLowerCase();
  if (normalized.includes("facebook")) return <FacebookIcon className={className} />;
  if (normalized.includes("linkedin")) return <LinkedinIcon className={className} />;
  if (normalized.includes("twitter") || normalized === "x") return <TwitterIcon className={className} />;
  if (normalized.includes("instagram")) return <Instagram className={className} />;
  return <ExternalLink className={className} />;
}

function SocialLink({ social }: { social: FooterSocialLink }) {
  if (!social.enabled || !social.href) return null;
  return (
    <a
      href={social.href}
      aria-label={social.label}
      target={social.href.startsWith("http") ? "_blank" : undefined}
      rel={social.href.startsWith("http") ? "noreferrer" : undefined}
      className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 shadow-lg shadow-blue-950/10 transition duration-200 hover:-translate-y-1 hover:border-blue-300/70 hover:bg-blue-500/20 hover:text-white"
    >
      <SocialIcon platform={social.platform || social.label} className="size-4" />
    </a>
  );
}

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string; enabled: boolean }[] }) {
  const visibleLinks = links.filter((link) => link.enabled);
  if (!visibleLinks.length) return null;
  return (
    <div>
      <h3 className="font-heading text-2xl font-bold tracking-tight text-white">{title}</h3>
      <ul className="mt-7 grid gap-4 text-[15px] font-medium text-white/72">
        {visibleLinks.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link href={link.href || "#"} className="group inline-flex cursor-pointer items-center gap-2 transition hover:text-blue-200">
              <span className="h-px w-0 bg-blue-300 transition-all duration-200 group-hover:w-4" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SiteFooter() {
  const [settings, footer] = await Promise.all([getSiteSettings(), getFooterSettings()]);
  const footerLogoSettings = {
    ...settings,
    footer_logo_mode: footer.logoMode,
    footer_logo_image_url: footer.logoImageUrl || settings.footer_logo_image_url || settings.logo_image_url || "",
  };

  return (
    <footer className="relative overflow-hidden bg-[#080f2d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(55,31,91,.45),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(16,101,177,.28),transparent_30%),linear-gradient(135deg,#080820_0%,#0b1238_45%,#081d42_100%)]" />
      <div className="absolute right-0 top-0 h-44 w-72 rounded-bl-full bg-blue-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1760px] px-6 pt-12 pb-7 lg:px-10 lg:pt-16 lg:pb-8">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_.8fr_.8fr_1.05fr] xl:gap-16">
          <div>
            <Link href="/" className="inline-flex cursor-pointer items-center gap-3">
              <BrandLogo settings={footerLogoSettings} footer />
            </Link>
            <h2 className="mt-8 font-heading text-2xl font-bold tracking-tight text-white">{footer.aboutTitle}</h2>
            <p className="mt-5 max-w-md text-base leading-8 text-white/76">{footer.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {footer.socialLinks.map((social) => (
                <SocialLink key={`${social.platform}-${social.label}`} social={social} />
              ))}
            </div>
          </div>

          <LinkColumn title={footer.quickLinksTitle} links={footer.quickLinks} />
          <LinkColumn title={footer.resourceLinksTitle} links={footer.resourceLinks} />

          <div>
            <h3 className="font-heading text-2xl font-bold tracking-tight text-white">{footer.contactTitle}</h3>
            <div className="mt-7 grid gap-5">
              <a href={`tel:${footer.phone}`} className="group flex items-start gap-4 text-white/75 transition hover:text-white">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-orange-300 ring-1 ring-orange-300/20"><Phone className="size-4" /></span>
                <span><span className="block text-sm text-white/55">{footer.phoneLabel}</span><strong className="mt-1 block text-base font-semibold text-white group-hover:text-blue-100">{footer.phone}</strong></span>
              </a>
              <a href={`mailto:${footer.email}`} className="group flex items-start gap-4 text-white/75 transition hover:text-white">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-orange-300 ring-1 ring-orange-300/20"><Mail className="size-4" /></span>
                <span><span className="block text-sm text-white/55">{footer.emailLabel}</span><strong className="mt-1 block break-all text-base font-semibold text-white group-hover:text-blue-100">{footer.email}</strong></span>
              </a>
              <div className="flex items-start gap-4 text-white/75">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-orange-300 ring-1 ring-orange-300/20"><MapPin className="size-4" /></span>
                <span><span className="block text-sm text-white/55">{footer.addressLabel}</span><strong className="mt-1 block text-base font-semibold leading-7 text-white">{footer.address}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-center">
          <p className="text-sm font-medium text-white/55">{footer.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
