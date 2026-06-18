"use client"
import Link from "next/link"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole, LogIn, User } from "lucide-react"
import { getCsrf } from "@/components/admin/csrf"

async function readJsonSafe(response: Response) {
  const type = response.headers.get("content-type") || ""
  if (type.includes("application/json")) return response.json().catch(() => ({}))
  const text = await response.text().catch(() => "")
  return { error: text.startsWith("<!DOCTYPE") ? "The API returned an HTML page. Check that the Next.js server is running and /api routes are proxied correctly." : text.slice(0, 180) }
}

export function LoginForm(){
  const router=useRouter();const [error,setError]=useState("");const [loading,setLoading]=useState(false)
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setLoading(true);setError("")
    const data=Object.fromEntries(new FormData(event.currentTarget))
    const headers: Record<string,string>={"content-type":"application/json","accept":"application/json"}
    try { headers["x-csrf-token"] = await getCsrf() } catch (csrfError) { console.warn("[login] CSRF preflight failed; trying same-origin guarded login.", csrfError) }
    try {
      const response=await fetch("/api/auth/login",{method:"POST",headers,body:JSON.stringify(data),credentials:"same-origin",cache:"no-store"})
      const json=await readJsonSafe(response)
      if(response.ok){router.push("/admin");router.refresh()}else setError(json.error||"Login failed.")
    } catch (err) { setError(err instanceof Error ? err.message : "Login request failed.") }
    finally { setLoading(false) }
  }
  return <form onSubmit={submit} className="grid gap-5"><label className="grid gap-2 text-sm font-semibold">Username<div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4"><User className="size-4 text-muted-foreground"/><input name="username" required autoComplete="username" className="w-full bg-transparent py-3 outline-none" /></div></label><label className="grid gap-2 text-sm font-semibold">Password<div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4"><LockKeyhole className="size-4 text-muted-foreground"/><input name="password" type="password" required autoComplete="current-password" minLength={8} className="w-full bg-transparent py-3 outline-none" /></div></label><button disabled={loading} className="inline-flex items-center justify-center gap-2 gradient-button cursor-pointer rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><LogIn className="size-4" />{loading?"Signing in...":"Secure Login"}</button>{error&&<p role="alert" className="text-sm font-medium text-red-600">{error}</p>}<Link href="/admin/forgot-password" className="text-center text-sm font-semibold text-blue-700 hover:underline">Forgot password?</Link></form>
}
