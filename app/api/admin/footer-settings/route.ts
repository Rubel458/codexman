import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { logActivity } from "@/lib/activity-log";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { invalidateCmsCache } from "@/lib/cms-invalidation";
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit";
import { getFooterSettings } from "@/lib/cms";
import { isTrustedOrigin, readJsonBody, sanitizeText, sanitizeUrl } from "@/lib/security";

const retiredFooterNewsletterKeys = [
  "footer_newsletter_title",
  "footer_newsletter_description",
  "footer_newsletter_placeholder",
  "footer_newsletter_button_text",
] as const;

const footerKeys = [
  "footer_about_title",
  "footer_description",
  "footer_logo_mode",
  "footer_logo_image_url",
  "footer_quick_links_title",
  "footer_quick_links",
  "footer_resource_links_title",
  "footer_resource_links",
  "footer_contact_title",
  "footer_phone_label",
  "footer_phone",
  "footer_email_label",
  "footer_email",
  "footer_address_label",
  "footer_address",
  "footer_copyright_text",
  "footer_social_links",
] as const;

const linkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  href: z.string().trim().max(2048),
  enabled: z.boolean().default(true),
});

const socialSchema = z.object({
  platform: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(80),
  href: z.string().trim().max(2048),
  enabled: z.boolean().default(true),
});

const schema = z.object({
  aboutTitle: z.string().trim().max(90),
  description: z.string().trim().max(700),
  logoMode: z.enum(["text", "image"]),
  logoImageUrl: z.string().trim().max(2048),
  quickLinksTitle: z.string().trim().max(80),
  quickLinks: z.array(linkSchema).max(40),
  resourceLinksTitle: z.string().trim().max(80),
  resourceLinks: z.array(linkSchema).max(40),
  contactTitle: z.string().trim().max(80),
  phoneLabel: z.string().trim().max(60),
  phone: z.string().trim().max(80),
  emailLabel: z.string().trim().max(60),
  email: z.string().trim().max(180),
  addressLabel: z.string().trim().max(60),
  address: z.string().trim().max(320),
  copyrightText: z.string().trim().max(180),
  socialLinks: z.array(socialSchema).max(20),
});

function cleanUrl(value: string) {
  return value ? sanitizeUrl(value) : "";
}

function cleanLinks<T extends { label: string; href: string; enabled: boolean }>(links: T[]) {
  return links.map((link) => ({
    ...link,
    label: sanitizeText(link.label, 80),
    href: cleanUrl(link.href || "#") || "#",
    enabled: Boolean(link.enabled),
  }));
}

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await getFooterSettings() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "Invalid security token" }, { status: 403 });
  const rate = await enforceRateLimit(`admin-footer-settings:${session.sub}:${clientFingerprint(request)}`, 90, 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });

  const parsed = schema.safeParse(await readJsonBody(request).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the footer fields." }, { status: 400 });

  let logoImageUrl = "";
  try {
    logoImageUrl = cleanUrl(parsed.data.logoImageUrl);
  } catch {
    return NextResponse.json({ error: "Footer logo URL is not valid." }, { status: 400 });
  }

  let quickLinks;
  let resourceLinks;
  let socialLinks;
  try {
    quickLinks = cleanLinks(parsed.data.quickLinks);
    resourceLinks = cleanLinks(parsed.data.resourceLinks);
    socialLinks = cleanLinks(parsed.data.socialLinks).map((social) => ({
      ...social,
      platform: sanitizeText(social.platform.toLowerCase(), 40),
    }));
  } catch {
    return NextResponse.json({ error: "One of the footer links is not valid." }, { status: 400 });
  }

  const payload: Record<(typeof footerKeys)[number], Prisma.InputJsonValue> = {
    footer_about_title: sanitizeText(parsed.data.aboutTitle, 90),
    footer_description: sanitizeText(parsed.data.description, 700),
    footer_logo_mode: parsed.data.logoMode,
    footer_logo_image_url: logoImageUrl,
    footer_quick_links_title: sanitizeText(parsed.data.quickLinksTitle, 80),
    footer_quick_links: quickLinks,
    footer_resource_links_title: sanitizeText(parsed.data.resourceLinksTitle, 80),
    footer_resource_links: resourceLinks,
    footer_contact_title: sanitizeText(parsed.data.contactTitle, 80),
    footer_phone_label: sanitizeText(parsed.data.phoneLabel, 60),
    footer_phone: sanitizeText(parsed.data.phone, 80),
    footer_email_label: sanitizeText(parsed.data.emailLabel, 60),
    footer_email: sanitizeText(parsed.data.email, 180),
    footer_address_label: sanitizeText(parsed.data.addressLabel, 60),
    footer_address: sanitizeText(parsed.data.address, 320),
    footer_copyright_text: sanitizeText(parsed.data.copyrightText, 180),
    footer_social_links: socialLinks,
  };

  await prisma.$transaction([
    ...footerKeys.map((key) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: payload[key], group: "footer" },
        create: { key, value: payload[key], group: "footer" },
      }),
    ),
    prisma.settings.deleteMany({ where: { key: { in: [...retiredFooterNewsletterKeys] } } }),
  ]);

  const invalidation = await invalidateCmsCache("update:footer-settings");
  await logActivity({ request, adminId: session.sub, username: session.username, action: "FOOTER_SETTINGS_UPDATED", resource: "settings", details: { keys: footerKeys } });
  return NextResponse.json({ ok: true, committed: true, invalidation });
}
