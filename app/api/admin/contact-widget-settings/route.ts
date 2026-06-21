import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { logActivity } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";
import { invalidateCmsCache } from "@/lib/cms-invalidation";
import { clientFingerprint, enforceRateLimit } from "@/lib/rate-limit";
import { isTrustedOrigin, readJsonBody, sanitizeText, sanitizeUrl } from "@/lib/security";

const keys = [
  "contact_widget_enabled",
  "contact_widget_whatsapp_enabled",
  "contact_widget_whatsapp_number",
  "contact_widget_whatsapp_display_text",
  "contact_widget_whatsapp_message",
  "contact_widget_messenger_enabled",
  "contact_widget_messenger_url",
  "contact_widget_phone_enabled",
  "contact_widget_phone_number",
] as const;

const defaults = {
  enabled: true,
  whatsappEnabled: true,
  whatsappNumber: "+8801989897646",
  whatsappDisplayText: "Chat on WhatsApp",
  whatsappMessage: "Hello IT Lab BD, I would like to know more.",
  messengerEnabled: false,
  messengerUrl: "",
  phoneEnabled: false,
  phoneNumber: "+8801989897646",
};

const schema = z.object({
  enabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  whatsappNumber: z.string().trim().max(60),
  whatsappDisplayText: z.string().trim().max(80),
  whatsappMessage: z.string().trim().max(500),
  messengerEnabled: z.boolean(),
  messengerUrl: z.string().trim().max(2048),
  phoneEnabled: z.boolean(),
  phoneNumber: z.string().trim().max(60),
});

function boolValue(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return fallback;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function mapRows(rows: Array<{ key: string; value: unknown }>) {
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  return {
    enabled: boolValue(byKey.get("contact_widget_enabled"), defaults.enabled),
    whatsappEnabled: boolValue(byKey.get("contact_widget_whatsapp_enabled"), defaults.whatsappEnabled),
    whatsappNumber: stringValue(byKey.get("contact_widget_whatsapp_number"), defaults.whatsappNumber),
    whatsappDisplayText: stringValue(byKey.get("contact_widget_whatsapp_display_text"), defaults.whatsappDisplayText),
    whatsappMessage: stringValue(byKey.get("contact_widget_whatsapp_message"), defaults.whatsappMessage),
    messengerEnabled: boolValue(byKey.get("contact_widget_messenger_enabled"), defaults.messengerEnabled),
    messengerUrl: stringValue(byKey.get("contact_widget_messenger_url"), defaults.messengerUrl),
    phoneEnabled: boolValue(byKey.get("contact_widget_phone_enabled"), defaults.phoneEnabled),
    phoneNumber: stringValue(byKey.get("contact_widget_phone_number"), defaults.phoneNumber),
  };
}

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.settings.findMany({ where: { key: { in: [...keys] } } });
  return NextResponse.json({ settings: mapRows(rows) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "Invalid security token" }, { status: 403 });
  const rate = await enforceRateLimit(`admin-contact-widget:${session.sub}:${clientFingerprint(request)}`, 90, 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });

  const parsed = schema.safeParse(await readJsonBody(request).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the contact widget fields." }, { status: 400 });

  let messengerUrl = "";
  try {
    messengerUrl = parsed.data.messengerUrl ? sanitizeUrl(parsed.data.messengerUrl) : "";
  } catch {
    return NextResponse.json({ error: "Messenger URL is not valid." }, { status: 400 });
  }

  const payload: Record<(typeof keys)[number], string> = {
    contact_widget_enabled: String(parsed.data.enabled),
    contact_widget_whatsapp_enabled: String(parsed.data.whatsappEnabled),
    contact_widget_whatsapp_number: sanitizeText(parsed.data.whatsappNumber, 60),
    contact_widget_whatsapp_display_text: sanitizeText(parsed.data.whatsappDisplayText, 80),
    contact_widget_whatsapp_message: sanitizeText(parsed.data.whatsappMessage, 500),
    contact_widget_messenger_enabled: String(parsed.data.messengerEnabled),
    contact_widget_messenger_url: messengerUrl,
    contact_widget_phone_enabled: String(parsed.data.phoneEnabled),
    contact_widget_phone_number: sanitizeText(parsed.data.phoneNumber, 60),
  };

  await prisma.$transaction(
    keys.map((key) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: payload[key], group: "contact_widget" },
        create: { key, value: payload[key], group: "contact_widget" },
      }),
    ),
  );
  const invalidation = await invalidateCmsCache("update:contact-widget-settings");
  await logActivity({ request, adminId: session.sub, username: session.username, action: "CONTACT_WIDGET_SETTINGS_UPDATED", resource: "settings", details: { keys } });
  return NextResponse.json({ ok: true, committed: true, invalidation });
}
