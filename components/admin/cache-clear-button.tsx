"use client"
import { useState } from "react"
import { RefreshCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { notifyCmsUpdated } from "@/components/admin/cms-updated"
import { getCsrf } from "@/components/admin/csrf"
export function CacheClearButton(){const router=useRouter();const[busy,setBusy]=useState(false);async function clear(){setBusy(true);const csrf=await getCsrf();const response=await fetch("/api/admin/cache",{method:"POST",headers:{"x-csrf-token":csrf}});setBusy(false);if(!response.ok)alert("Unable to clear cache");else{notifyCmsUpdated();router.refresh()}};return <button onClick={clear} disabled={busy} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"><RefreshCcw className={`size-4 ${busy?"animate-spin":""}`}/>{busy?"Clearing...":"Clear cache"}</button>}
