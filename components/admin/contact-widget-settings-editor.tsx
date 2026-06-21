"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Save } from "lucide-react";
import { getCsrf } from "@/components/admin/csrf";
import { notifyCmsUpdated } from "@/components/admin/cms-updated";

type ContactWidgetSettings = {
  enabled: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappDisplayText: string;
  whatsappMessage: string;
  messengerEnabled: boolean;
  messengerUrl: string;
  phoneEnabled: boolean;
  phoneNumber: string;
};

const initial: ContactWidgetSettings = {
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

export function ContactWidgetSettingsEditor() {
  const router = useRouter();
  const [settings, setSettings] = useState<ContactWidgetSettings>(initial);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/contact-widget-settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setSettings({ ...initial, ...(data.settings || {}) }))
      .catch(() => setMessage("Unable to load contact widget settings."));
  }, []);

  function change<K extends keyof ContactWidgetSettings>(key: K, value: ContactWidgetSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const csrf = await getCsrf();
    const response = await fetch("/api/admin/contact-widget-settings", {
      method: "PUT",
      headers: { "content-type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify(settings),
    });
    const json = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage(json.error || "Unable to save contact widget settings.");
      return;
    }
    notifyCmsUpdated();
    router.refresh();
    setMessage("Floating contact settings saved and frontend cache invalidated.");
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">Lead Generation</p>
      <h1 className="mt-1 font-heading text-3xl font-bold">Floating Contact / WhatsApp Widget</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        Manage the bottom-right contact button shown across public pages. WhatsApp is the primary option; Messenger and phone calls are optional.
      </p>

      <form onSubmit={submit} className="mt-7 grid max-w-5xl gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
        <Toggle label="Enable floating contact button" checked={settings.enabled} onChange={(value) => change("enabled", value)} />
        <Toggle label="Enable WhatsApp" checked={settings.whatsappEnabled} onChange={(value) => change("whatsappEnabled", value)} />
        <Input label="WhatsApp number" value={settings.whatsappNumber} onChange={(value) => change("whatsappNumber", value)} help="Use international format, for example +8801989897646." />
        <Input label="WhatsApp display text" value={settings.whatsappDisplayText} onChange={(value) => change("whatsappDisplayText", value)} />
        <Textarea label="Default WhatsApp message" value={settings.whatsappMessage} onChange={(value) => change("whatsappMessage", value)} />

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
          <div className="grid gap-5 md:grid-cols-2">
            <Toggle label="Enable Messenger" checked={settings.messengerEnabled} onChange={(value) => change("messengerEnabled", value)} />
            <Input label="Messenger URL" value={settings.messengerUrl} onChange={(value) => change("messengerUrl", value)} placeholder="https://m.me/yourpage" />
            <Toggle label="Enable phone call" checked={settings.phoneEnabled} onChange={(value) => change("phoneEnabled", value)} />
            <Input label="Phone number" value={settings.phoneNumber} onChange={(value) => change("phoneNumber", value)} />
          </div>
        </div>

        <div className="md:col-span-2">
          <button disabled={saving} className="brand-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? <MessageCircle className="size-4 animate-pulse" /> : <Save className="size-4" />}
            {saving ? "Saving..." : "Save contact widget settings"}
          </button>
          {message ? <p className="mt-4 text-sm font-semibold text-blue-700">{message}</p> : null}
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, help }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; help?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" />
      {help ? <span className="text-xs font-normal text-muted-foreground">{help}</span> : null}
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-blue-700" />
    </label>
  );
}
