"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { getCsrf } from "@/components/admin/csrf";
import { notifyCmsUpdated } from "@/components/admin/cms-updated";

type FooterLink = { label: string; href: string; enabled: boolean };
type FooterSocialLink = { platform: string; label: string; href: string; enabled: boolean };
type FooterSettings = {
  aboutTitle: string;
  description: string;
  logoMode: "text" | "image";
  logoImageUrl: string;
  quickLinksTitle: string;
  quickLinks: FooterLink[];
  resourceLinksTitle: string;
  resourceLinks: FooterLink[];
  contactTitle: string;
  phoneLabel: string;
  phone: string;
  emailLabel: string;
  email: string;
  addressLabel: string;
  address: string;
  copyrightText: string;
  socialLinks: FooterSocialLink[];
};

const initial: FooterSettings = {
  aboutTitle: "About Company",
  description: "IT Lab BD is a trusted IT solution agency helping businesses launch modern websites, digital products and automation systems.",
  logoMode: "text",
  logoImageUrl: "",
  quickLinksTitle: "Quick Links",
  quickLinks: [
    { label: "About us", href: "/about-us", enabled: true },
    { label: "Services", href: "/services", enabled: true },
    { label: "Portfolios", href: "/portfolio", enabled: true },
    { label: "Blogs", href: "/blog", enabled: true },
  ],
  resourceLinksTitle: "Resources",
  resourceLinks: [
    { label: "Request Demo", href: "/demo", enabled: true },
    { label: "Free Website", href: "/contact-us", enabled: true },
    { label: "Free Templates", href: "/downloads", enabled: true },
  ],
  contactTitle: "Contact Us",
  phoneLabel: "Call Us:",
  phone: "+8801989897646",
  emailLabel: "Mail Us:",
  email: "info@itlabbd.com",
  addressLabel: "Address",
  address: "South Banasree Project, Khilgaon, Dhaka",
  copyrightText: "© 2026 IT Lab. All Rights Reserved.",
  socialLinks: [
    { platform: "facebook", label: "Facebook", href: "#", enabled: true },
    { platform: "linkedin", label: "LinkedIn", href: "#", enabled: true },
    { platform: "twitter", label: "Twitter/X", href: "#", enabled: true },
    { platform: "instagram", label: "Instagram", href: "#", enabled: true },
  ],
};

export function FooterSettingsEditor() {
  const router = useRouter();
  const [settings, setSettings] = useState<FooterSettings>(initial);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/footer-settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setSettings({ ...initial, ...(data.settings || {}) }))
      .catch(() => setMessage("Unable to load footer settings."));
  }, []);

  function change<K extends keyof FooterSettings>(key: K, value: FooterSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    const csrf = await getCsrf();
    const body = new FormData();
    body.append("file", file);
    body.append("altText", "IT Lab BD footer logo");
    const response = await fetch("/api/admin/media/upload", { method: "POST", headers: { "x-csrf-token": csrf }, body });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(json.error || "Footer logo upload failed.");
      return;
    }
    change("logoImageUrl", json.media?.url || json.item?.url || "");
    change("logoMode", "image");
    setMessage("Footer logo uploaded. Save footer settings to publish it.");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const csrf = await getCsrf();
    const response = await fetch("/api/admin/footer-settings", {
      method: "PUT",
      headers: { "content-type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify(settings),
    });
    const json = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage(json.error || "Unable to save footer settings.");
      return;
    }
    notifyCmsUpdated();
    router.refresh();
    setMessage("Footer settings saved. Frontend footer cache invalidated immediately.");
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">Footer Management</p>
      <h1 className="mt-1 font-heading text-3xl font-bold">Dynamic Footer Settings</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        Manage the footer logo, about text, link columns, contact details, social icons and copyright without editing code.
      </p>

      <form onSubmit={submit} className="mt-7 grid max-w-6xl gap-6">
        <Section title="About Us & Logo">
          <Input label="Section title" value={settings.aboutTitle} onChange={(value) => change("aboutTitle", value)} />
          <Select label="Footer logo type" value={settings.logoMode} onChange={(value) => change("logoMode", value as "text" | "image")} />
          <label className="grid gap-2 text-sm font-semibold md:col-span-2">
            Footer logo image URL
            <div className="flex gap-2">
              <input value={settings.logoImageUrl} onChange={(event) => change("logoImageUrl", event.target.value)} placeholder="/uploads/footer-logo.webp" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" />
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100">
                <Upload className="size-4" /> Upload
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => uploadLogo(event.target.files?.[0])} />
              </label>
            </div>
          </label>
          <Textarea label="Company description" value={settings.description} onChange={(value) => change("description", value)} />
        </Section>

        <Section title="Footer Link Columns">
          <Input label="Quick Links title" value={settings.quickLinksTitle} onChange={(value) => change("quickLinksTitle", value)} />
          <Input label="Resources title" value={settings.resourceLinksTitle} onChange={(value) => change("resourceLinksTitle", value)} />
          <LinkList title="Quick Links" links={settings.quickLinks} onChange={(links) => change("quickLinks", links)} />
          <LinkList title="Additional / Resource Links" links={settings.resourceLinks} onChange={(links) => change("resourceLinks", links)} />
        </Section>

        <Section title="Contact Information">
          <Input label="Contact section title" value={settings.contactTitle} onChange={(value) => change("contactTitle", value)} />
          <Input label="Phone label" value={settings.phoneLabel} onChange={(value) => change("phoneLabel", value)} />
          <Input label="Phone number" value={settings.phone} onChange={(value) => change("phone", value)} />
          <Input label="Email label" value={settings.emailLabel} onChange={(value) => change("emailLabel", value)} />
          <Input label="Email address" value={settings.email} onChange={(value) => change("email", value)} />
          <Input label="Address label" value={settings.addressLabel} onChange={(value) => change("addressLabel", value)} />
          <Textarea label="Office address" value={settings.address} onChange={(value) => change("address", value)} />
        </Section>

        <Section title="Social Media">
          <SocialList links={settings.socialLinks} onChange={(links) => change("socialLinks", links)} />
        </Section>

        <Section title="Copyright">
          <Input label="Copyright text" value={settings.copyrightText} onChange={(value) => change("copyrightText", value)} />
        </Section>

        <div>
          <button disabled={saving} className="brand-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
            <Save className={`size-4 ${saving ? "animate-pulse" : ""}`} /> {saving ? "Saving..." : "Save footer settings"}
          </button>
          {message ? <p className="mt-4 text-sm font-semibold text-blue-700">{message}</p> : null}
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" data-no-scroll-reveal>
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold md:col-span-2">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" />
    </label>
  );
}

function Select({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200">
        <option value="text">Text logo / site name</option>
        <option value="image">Uploaded image logo</option>
      </select>
    </label>
  );
}

function LinkList({ title, links, onChange }: { title: string; links: FooterLink[]; onChange: (links: FooterLink[]) => void }) {
  function update(index: number, patch: Partial<FooterLink>) {
    onChange(links.map((link, itemIndex) => (itemIndex === index ? { ...link, ...patch } : link)));
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-heading font-bold">{title}</h3>
        <button type="button" onClick={() => onChange([...links, { label: "New Link", href: "#", enabled: true }])} className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">
          <Plus className="size-3.5" /> Add
        </button>
      </div>
      <div className="grid gap-3">
        {links.map((link, index) => (
          <div key={`${link.label}-${index}`} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={link.label} onChange={(event) => update(index, { label: event.target.value })} placeholder="Label" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
              <input value={link.href} onChange={(event) => update(index, { href: event.target.value })} placeholder="/link" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={link.enabled} onChange={(event) => update(index, { enabled: event.target.checked })} /> Enabled</label>
              <button type="button" onClick={() => onChange(links.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /> Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialList({ links, onChange }: { links: FooterSocialLink[]; onChange: (links: FooterSocialLink[]) => void }) {
  function update(index: number, patch: Partial<FooterSocialLink>) {
    onChange(links.map((link, itemIndex) => (itemIndex === index ? { ...link, ...patch } : link)));
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-heading font-bold">Social media links</h3>
        <button type="button" onClick={() => onChange([...links, { platform: "link", label: "New Social", href: "#", enabled: true }])} className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">
          <Plus className="size-3.5" /> Add
        </button>
      </div>
      <div className="grid gap-3">
        {links.map((link, index) => (
          <div key={`${link.platform}-${index}`} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[.7fr_.8fr_1.3fr_auto_auto] md:items-center">
            <input value={link.platform} onChange={(event) => update(index, { platform: event.target.value })} placeholder="facebook" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            <input value={link.label} onChange={(event) => update(index, { label: event.target.value })} placeholder="Facebook" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            <input value={link.href} onChange={(event) => update(index, { href: event.target.value })} placeholder="https://..." className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={link.enabled} onChange={(event) => update(index, { enabled: event.target.checked })} /> Enabled</label>
            <button type="button" onClick={() => onChange(links.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /> Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
