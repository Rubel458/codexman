import { getMenus, getSiteSettings } from "@/lib/cms"
import { SiteHeaderClient } from "@/components/site-header-client"

export async function SiteHeader() {
  const [menus, settings] = await Promise.all([getMenus(), getSiteSettings()])
  return <SiteHeaderClient menus={menus} settings={settings} />
}
