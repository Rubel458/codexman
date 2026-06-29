import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { verifyCsrf } from "@/lib/csrf"
import { logActivity } from "@/lib/activity-log"
import { prisma } from "@/lib/prisma"
import { invalidateCmsCache } from "@/lib/cms-invalidation"
import { isTrustedOrigin, readJsonBody, sanitizeText, sanitizeUrl } from "@/lib/security"

const keys = [
  "site_name",
  "logo_text",
  "header_logo_mode",
  "header_logo_image_url",
  "footer_logo_mode",
  "footer_logo_image_url",
  "phone",
  "email",
  "address",
  "topbar_message",
  "header_info_text",
  "header_button_text",
  "header_button_url",
  "header_icon_1_name",
  "header_icon_1_text",
  "header_icon_1_url",
  "header_icon_2_name",
  "header_icon_2_text",
  "header_icon_2_url",
  "header_icon_3_name",
  "header_icon_3_text",
  "header_icon_3_url",
  "twitter_url",
  "facebook_url",
  "linkedin_url",
] as const

const schema = z.object({
  site_name: z.string().max(120),
  logo_text: z.string().max(12),
  header_logo_mode: z.enum(["text", "image"]),
  header_logo_image_url: z.string().max(2048),
  footer_logo_mode: z.enum(["text", "image"]),
  footer_logo_image_url: z.string().max(2048),
  phone: z.string().max(60),
  email: z.string().email().max(180),
  address: z.string().max(260),
  topbar_message: z.string().max(120),
  header_info_text: z.string().max(120),
  header_button_text: z.string().max(60),
  header_button_url: z.string().max(2048),
  header_icon_1_name: z.string().max(40).default("twitter"),
  header_icon_1_text: z.string().max(80).default("Twitter/X"),
  header_icon_1_url: z.string().max(2048).default("#"),
  header_icon_2_name: z.string().max(40).default("facebook"),
  header_icon_2_text: z.string().max(80).default("Facebook"),
  header_icon_2_url: z.string().max(2048).default("#"),
  header_icon_3_name: z.string().max(40).default("linkedin"),
  header_icon_3_text: z.string().max(80).default("LinkedIn"),
  header_icon_3_url: z.string().max(2048).default("#"),
  twitter_url: z.string().max(2048),
  facebook_url: z.string().max(2048),
  linkedin_url: z.string().max(2048),
})

const defaults: Record<(typeof keys)[number], string> = {
  site_name: "IT LAB BD",
  logo_text: "it",
  header_logo_mode: "text",
  header_logo_image_url: "",
  footer_logo_mode: "text",
  footer_logo_image_url: "",
  phone: "+8801989897646",
  email: "info@itlabbd.com",
  address: "South Banasree Project, Khilgaon, Dhaka",
  topbar_message: "Howdy, ITLABBD",
  header_info_text: "Have Any Questions?",
  header_button_text: "DEMOS",
  header_button_url: "/demo",
  header_icon_1_name: "twitter",
  header_icon_1_text: "Twitter/X",
  header_icon_1_url: "#",
  header_icon_2_name: "facebook",
  header_icon_2_text: "Facebook",
  header_icon_2_url: "#",
  header_icon_3_name: "linkedin",
  header_icon_3_text: "LinkedIn",
  header_icon_3_url: "#",
  twitter_url: "#",
  facebook_url: "#",
  linkedin_url: "#",
}

function safeSettingUrl(value: string) {
  return sanitizeUrl(value || "#") || "#"
}

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await prisma.settings.findMany({ where: { key: { in: [...keys, "logo_mode", "logo_image_url"] } } })
  const settings = { ...defaults }
  for (const row of rows) {
    if (row.key in settings) settings[row.key as keyof typeof settings] = typeof row.value === "string" ? row.value : String(row.value ?? "")
  }

  const legacyMode = rows.find((row: { key: string; value: unknown }) => row.key === "logo_mode")?.value
  const legacyUrl = rows.find((row: { key: string; value: unknown }) => row.key === "logo_image_url")?.value
  if (!settings.header_logo_image_url && typeof legacyUrl === "string") settings.header_logo_image_url = legacyUrl
  if (!settings.footer_logo_image_url && typeof legacyUrl === "string") settings.footer_logo_image_url = legacyUrl
  if (typeof legacyMode === "string" && legacyMode === "image") {
    if (settings.header_logo_image_url) settings.header_logo_mode = "image"
    if (settings.footer_logo_image_url) settings.footer_logo_mode = "image"
  }

  if (settings.header_icon_1_url === "#" && settings.twitter_url !== "#") settings.header_icon_1_url = settings.twitter_url
  if (settings.header_icon_2_url === "#" && settings.facebook_url !== "#") settings.header_icon_2_url = settings.facebook_url
  if (settings.header_icon_3_url === "#" && settings.linkedin_url !== "#") settings.header_icon_3_url = settings.linkedin_url

  return NextResponse.json({ settings }, { headers: { "Cache-Control": "no-store" } })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!isTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 })
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "Invalid security token" }, { status: 403 })

  const parsed = schema.safeParse(await readJsonBody(request).catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Please check the branding fields." }, { status: 400 })

  let clean: Record<(typeof keys)[number], string>
  try {
    clean = {
      ...parsed.data,
      header_logo_image_url: sanitizeUrl(parsed.data.header_logo_image_url),
      footer_logo_image_url: sanitizeUrl(parsed.data.footer_logo_image_url),
      header_button_url: safeSettingUrl(parsed.data.header_button_url),
      header_icon_1_url: safeSettingUrl(parsed.data.header_icon_1_url),
      header_icon_2_url: safeSettingUrl(parsed.data.header_icon_2_url),
      header_icon_3_url: safeSettingUrl(parsed.data.header_icon_3_url),
      twitter_url: safeSettingUrl(parsed.data.twitter_url),
      facebook_url: safeSettingUrl(parsed.data.facebook_url),
      linkedin_url: safeSettingUrl(parsed.data.linkedin_url),
    }
  } catch {
    return NextResponse.json({ error: "Please check the URL fields." }, { status: 400 })
  }

  await prisma.$transaction(
    keys.map((key) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: sanitizeText(clean[key], 2048), group: "general" },
        create: { key, value: sanitizeText(clean[key], 2048), group: "general" },
      }),
    ),
  )

  const invalidation = await invalidateCmsCache("update:site-settings")
  await logActivity({ request, adminId: session.sub, username: session.username, action: "SETTINGS_UPDATED", resource: "settings", details: { keys } })
  return NextResponse.json({ ok: true, committed: true, invalidation })
}
