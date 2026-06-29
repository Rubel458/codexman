"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Upload } from "lucide-react"
import { getCsrf } from "@/components/admin/csrf"
import { notifyCmsUpdated } from "@/components/admin/cms-updated"

type LogoMode = "text" | "image"

type Settings = {
  site_name: string
  logo_text: string
  header_logo_mode: LogoMode
  header_logo_image_url: string
  footer_logo_mode: LogoMode
  footer_logo_image_url: string
  phone: string
  email: string
  address: string
  topbar_message: string
  header_info_text: string
  header_button_text: string
  header_button_url: string
  header_icon_1_name: string
  header_icon_1_text: string
  header_icon_1_url: string
  header_icon_2_name: string
  header_icon_2_text: string
  header_icon_2_url: string
  header_icon_3_name: string
  header_icon_3_text: string
  header_icon_3_url: string
  twitter_url: string
  facebook_url: string
  linkedin_url: string
}

const initial: Settings = {
  site_name: "IT LAB BD",
  logo_text: "it",
  header_logo_mode: "text",
  header_logo_image_url: "",
  footer_logo_mode: "text",
  footer_logo_image_url: "",
  phone: "",
  email: "",
  address: "",
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

const iconOptions = [
  "twitter",
  "facebook",
  "linkedin",
  "instagram",
  "youtube",
  "github",
  "whatsapp",
  "mail",
  "phone",
  "external",
]

export function BrandingSettingsEditor() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>(initial)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/admin/site-settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setSettings({ ...initial, ...(data.settings || {}) }))
      .catch(() => setMessage("Unable to load website settings."))
  }, [])

  function change<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  async function upload(key: "header_logo_image_url" | "footer_logo_image_url", file?: File) {
    if (!file) return
    const csrf = await getCsrf()
    const body = new FormData()
    body.append("file", file)
    body.append("altText", key === "header_logo_image_url" ? "IT Lab BD header logo" : "IT Lab BD footer logo")
    const response = await fetch("/api/admin/media/upload", { method: "POST", headers: { "x-csrf-token": csrf }, body })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) return setMessage(json.error || "Upload failed")
    change(key, json.media?.url || json.item?.url || "")
    setMessage("Logo uploaded. Save settings to publish it.")
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const csrf = await getCsrf()
    const response = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "content-type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify(settings),
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) return setMessage(json.error || "Unable to save settings.")
    notifyCmsUpdated()
    router.refresh()
    setMessage("Website settings saved. Database committed and frontend cache invalidated immediately.")
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">Website Settings</p>
      <h1 className="mt-1 font-heading text-3xl font-bold">Branding, header controls and contact details</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        Manage logos, header text, header button, top-bar icons, contact details and social links without editing code.
      </p>

      <form onSubmit={submit} className="mt-7 grid max-w-6xl gap-6">
        <Section title="Logo & Brand Identity">
          <Input label="Website name" value={settings.site_name} onChange={(value) => change("site_name", value)} />
          <Input label="Text logo initials" value={settings.logo_text} onChange={(value) => change("logo_text", value)} />
          <LogoControl title="Header logo" mode={settings.header_logo_mode} imageUrl={settings.header_logo_image_url} changeMode={(value) => change("header_logo_mode", value)} changeUrl={(value) => change("header_logo_image_url", value)} upload={(file) => upload("header_logo_image_url", file)} />
          <LogoControl title="Footer logo" mode={settings.footer_logo_mode} imageUrl={settings.footer_logo_image_url} changeMode={(value) => change("footer_logo_mode", value)} changeUrl={(value) => change("footer_logo_image_url", value)} upload={(file) => upload("footer_logo_image_url", file)} />
        </Section>

        <Section title="Header Text & Button">
          <Input label="Top bar message" value={settings.topbar_message} onChange={(value) => change("topbar_message", value)} />
          <Input label="Header info text" value={settings.header_info_text} onChange={(value) => change("header_info_text", value)} />
          <Input label="Header button text" value={settings.header_button_text} onChange={(value) => change("header_button_text", value)} />
          <Input label="Header button URL" value={settings.header_button_url} onChange={(value) => change("header_button_url", value)} />
        </Section>

        <Section title="Header Icon Management">
          <HeaderIconControl index={1} settings={settings} change={change} />
          <HeaderIconControl index={2} settings={settings} change={change} />
          <HeaderIconControl index={3} settings={settings} change={change} />
        </Section>

        <Section title="Contact Information">
          <Input label="Phone number" value={settings.phone} onChange={(value) => change("phone", value)} />
          <Input label="Email address" type="email" value={settings.email} onChange={(value) => change("email", value)} />
          <Input label="Address" value={settings.address} onChange={(value) => change("address", value)} />
        </Section>

        <Section title="Legacy Social Links">
          <Input label="Twitter/X URL" value={settings.twitter_url} onChange={(value) => change("twitter_url", value)} />
          <Input label="Facebook URL" value={settings.facebook_url} onChange={(value) => change("facebook_url", value)} />
          <Input label="LinkedIn URL" value={settings.linkedin_url} onChange={(value) => change("linkedin_url", value)} />
        </Section>

        <div>
          <button className="brand-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white">
            <Save className="size-4" />Save website settings
          </button>
          {message && <p className="mt-4 text-sm font-semibold text-blue-700">{message}</p>}
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" data-no-scroll-reveal>
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  )
}

function HeaderIconControl({ index, settings, change }: { index: 1 | 2 | 3; settings: Settings; change: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  const iconKey = `header_icon_${index}_name` as keyof Settings
  const textKey = `header_icon_${index}_text` as keyof Settings
  const urlKey = `header_icon_${index}_url` as keyof Settings
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
      <h3 className="font-heading text-lg font-bold">Header Icon {index}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Select label="Icon" value={settings[iconKey]} onChange={(value) => change(iconKey, value)} options={iconOptions} />
        <Input label="Associated text / label" value={settings[textKey]} onChange={(value) => change(textKey, value)} />
        <Input label="Icon link / URL" value={settings[urlKey]} onChange={(value) => change(urlKey, value)} />
      </div>
    </div>
  )
}

function LogoControl({ title, mode, imageUrl, changeMode, changeUrl, upload }: { title: string; mode: LogoMode; imageUrl: string; changeMode: (value: LogoMode) => void; changeUrl: (value: string) => void; upload: (file?: File) => void }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Logo type" value={mode} onChange={(value) => changeMode(value as LogoMode)} options={["text", "image"]} />
        <label className="grid gap-2 text-sm font-semibold">
          Uploaded image
          <div className="flex gap-2">
            <input value={imageUrl} onChange={(event) => changeUrl(event.target.value)} placeholder="/uploads/company-logo.webp" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" />
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100">
              <Upload className="size-4" />Upload
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
            </label>
          </div>
        </label>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" />
    </label>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}
