"use client"
import { FormEvent, useState } from "react"
import { getCsrf } from "@/components/admin/csrf"

export function ForgotForm() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    setLoading(true)
    setMessage("")
    const csrf = await getCsrf()
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": csrf }, body: JSON.stringify(payload) })
    const json = await response.json().catch(() => ({}))
    setLoading(false)
    setMessage(response.ok ? "If the email belongs to an administrator and SMTP is configured, a reset link has been sent." : json.error || "Unable to request a reset link.")
  }
  return <form onSubmit={submit} className="grid gap-4">
    <label className="grid gap-2 text-sm font-semibold">Administrator email<input name="email" type="email" required autoComplete="email" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" /></label>
    <button disabled={loading} className="brand-button cursor-pointer rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? "Sending..." : "Send reset link"}</button>
    {message && <p role="status" className="text-sm text-blue-700">{message}</p>}
  </form>
}
