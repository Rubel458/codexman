import { Suspense } from "react"
import { ResetForm } from "@/components/admin/reset-form"
export default function ResetPage(){return <main className="grid min-h-screen place-items-center bg-slate-100 p-5"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl"><h1 className="font-heading text-2xl font-bold">Reset password</h1><p className="mt-2 text-sm text-muted-foreground">Choose a strong password with at least 12 characters.</p><div className="mt-6"><Suspense fallback={<p>Loading...</p>}><ResetForm /></Suspense></div></section></main>}
