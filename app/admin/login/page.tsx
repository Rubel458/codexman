import { redirect } from "next/navigation"
import { LoginForm } from "@/components/admin/login-form"
import { getSession } from "@/lib/auth"
export default async function LoginPage(){if(await getSession())redirect("/admin");return <main className="grid min-h-screen place-items-center bg-slate-100 p-5"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"><div className="flex items-center gap-3"><span className="brand-button flex size-12 items-center justify-center rounded-xl font-heading text-lg font-bold text-white">it</span><div><h1 className="font-heading text-2xl font-bold">IT LAB BD</h1><p className="text-sm text-muted-foreground">Secure CMS login</p></div></div><div className="mt-8"><LoginForm /></div></section></main>}
