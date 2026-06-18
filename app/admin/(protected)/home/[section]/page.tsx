import { notFound } from "next/navigation"
import { HomeSectionEditor } from "@/components/admin/home-section-editor"
const sections=new Set(["hero","about","counters","services","platforms","what-we-do","portfolio","testimonials","trusted-companies","contact"])
export default async function HomeSectionPage({params}:{params:Promise<{section:string}>}){const{section}=await params;if(!sections.has(section))notFound();return <HomeSectionEditor sectionType={section}/>} 
