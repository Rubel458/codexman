"use client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCsrf } from "@/components/admin/csrf"
export function LogoutButton(){const router=useRouter();return <button onClick={async()=>{const csrf=await getCsrf();await fetch("/api/auth/logout",{method:"POST",headers:{"x-csrf-token":csrf}});router.push("/admin/login");router.refresh()}} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"><LogOut className="size-4" />Logout</button>}
