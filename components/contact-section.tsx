"use client"
import Image from "next/image"
import { FormEvent, useState } from "react"
import { Send } from "lucide-react"

export function ContactSection({ content, standalone = false }: { content?: Record<string, unknown>; standalone?: boolean }) {
  const eyebrow = typeof content?.eyebrow === "string" ? content.eyebrow : "Get in touch"
  const headline = typeof content?.headline === "string" ? content.headline : typeof content?.formHeadline === "string" ? content.formHeadline : "Have a quick question?"
  const imageUrl = typeof content?.imageUrl === "string" ? content.imageUrl : "/images/robot.png"
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setStatus("")
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) })
    const json = await response.json().catch(() => ({}))
    setLoading(false)
    if (response.ok) { form.reset(); setStatus("Thanks! Your message has been sent.") }
    else setStatus(json.error || "Unable to send your message.")
  }

  const inputClass = "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-400/25 transition focus:border-blue-300 focus:ring-2"
  return <section id="contact" className={`${standalone ? "bg-white" : "bg-slate-50"} py-20`}><div className="mx-auto max-w-[1760px] px-6 lg:px-10"><div className="text-center"><span className="text-sm font-bold uppercase tracking-[.2em] text-blue-700">{eyebrow}</span><h2 className="mt-3 font-heading text-3xl font-bold text-foreground md:text-5xl">{headline}</h2></div><div className="mx-auto mt-10 grid max-w-5xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[.88fr_1.12fr]"><div className="relative hidden min-h-[470px] overflow-hidden bg-slate-900 lg:block"><Image src={imageUrl} fill sizes="42vw" alt="Contact IT Lab BD" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" /></div><form onSubmit={submit} className="grid gap-4 p-7 md:grid-cols-2 md:p-9"><label className="grid gap-2 text-sm font-semibold">Name<input name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Your name" className={inputClass} /></label><label className="grid gap-2 text-sm font-semibold">Email<input name="email" type="email" required maxLength={180} autoComplete="email" placeholder="you@example.com" className={inputClass} /></label><label className="grid gap-2 text-sm font-semibold md:col-span-2">Phone<input name="phone" required minLength={5} maxLength={60} autoComplete="tel" placeholder="Phone number" className={inputClass} /></label><label className="grid gap-2 text-sm font-semibold md:col-span-2">Message<textarea name="message" required rows={7} minLength={10} maxLength={3000} placeholder="Tell us about your project..." className={inputClass} /></label><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" /><div className="md:col-span-2"><button disabled={loading} className="brand-button inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-60"><Send className="size-4" />{loading ? "Sending..." : "Send Message"}</button>{status && <p role="status" className="mt-3 text-sm font-semibold text-blue-700">{status}</p>}</div></form></div></div></section>
}
