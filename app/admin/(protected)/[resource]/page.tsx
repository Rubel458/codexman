import { notFound } from "next/navigation"
import { ResourceManager } from "@/components/admin/resource-manager"
import { getResource } from "@/lib/admin-resources"
export const dynamic="force-dynamic"
export default async function ResourcePage({params}:{params:Promise<{resource:string}>}){const {resource}=await params;const config=getResource(resource);if(!config)notFound();return <ResourceManager resource={resource} label={config.label} />}
