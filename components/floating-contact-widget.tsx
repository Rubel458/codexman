"use client";

import { MessageCircle, Phone, Send, X } from "lucide-react";
import { useMemo, useState } from "react";

type FloatingContactSettings = {
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

function digitsOnly(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function phoneHref(value: string) {
  const clean = value.trim();
  if (!clean) return "";
  return `tel:${clean.replace(/[^+0-9]/g, "")}`;
}

export function FloatingContactWidget({ settings }: { settings: FloatingContactSettings }) {
  const [open, setOpen] = useState(false);

  const whatsappUrl = useMemo(() => {
    const number = digitsOnly(settings.whatsappNumber || "");
    if (!settings.enabled || !settings.whatsappEnabled || !number) return "";
    const message = encodeURIComponent(
      settings.whatsappMessage || "Hello IT Lab BD, I would like to know more.",
    );
    return `https://wa.me/${number}?text=${message}`;
  }, [settings.enabled, settings.whatsappEnabled, settings.whatsappNumber, settings.whatsappMessage]);

  const messengerUrl = settings.enabled && settings.messengerEnabled ? settings.messengerUrl.trim() : "";
  const callUrl = settings.enabled && settings.phoneEnabled ? phoneHref(settings.phoneNumber) : "";
  const hasOptions = Boolean(whatsappUrl || messengerUrl || callUrl);

  if (!settings.enabled || !hasOptions) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      <div
        className={`grid origin-bottom-right gap-2 transition-all duration-200 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        {messengerUrl ? (
          <a
            href={messengerUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-xl transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Send className="size-4" />
            Messenger
          </a>
        ) : null}
        {callUrl ? (
          <a
            href={callUrl}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-xl transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Phone className="size-4" />
            Phone Call
          </a>
        ) : null}
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            <MessageCircle className="size-4" />
            {settings.whatsappDisplayText || "WhatsApp"}
          </a>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close contact options" : "Open contact options"}
        className="brand-button flex size-14 cursor-pointer items-center justify-center rounded-full text-white shadow-2xl ring-4 ring-white/80 transition duration-200 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
