import { AboutDetail, detailMetadata } from "@/components/pages/about-detail"
export const dynamic = "force-dynamic"
export const revalidate = 0
export function generateMetadata() { return detailMetadata("our-mission") }
export default function Page() { return <AboutDetail slug="our-mission" /> }
