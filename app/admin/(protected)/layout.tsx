import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { getSession } from "@/lib/auth"
export default async function ProtectedAdminLayout({children}:{children:React.ReactNode}){const session=await getSession();if(!session)redirect("/admin/login");return <AdminShell username={session.username}>{children}</AdminShell>}
