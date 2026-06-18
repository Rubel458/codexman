import { AboutDetail, detailMetadata } from "@/components/pages/about-detail"
export const dynamic = "force-dynamic"
export const revalidate = 0
export function generateMetadata() { return detailMetadata("our-strategy") }
export default function Page() { return <AboutDetail slug="our-strategy" /> }
