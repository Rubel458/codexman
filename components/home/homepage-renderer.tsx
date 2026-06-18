import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { CounterSection } from "@/components/counter-section"
import { HeroSection } from "@/components/hero-section"
import { GlobalPlatformsSection } from "@/components/global-platforms-section"
import { IntegrationsSection } from "@/components/integrations-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { WhatWeDoSection } from "@/components/what-we-do-section"
import type { HomeSectionRecord } from "@/lib/cms"
type Props={sections:HomeSectionRecord[];services:any[];projects:any[];testimonials:any[];logos:any[]}
export function HomepageRenderer({sections,services,projects,testimonials,logos}:Props){return <>{sections.map(section=>{switch(section.type){case"HERO":return <HeroSection key={section.type} content={section.content}/>;case"ABOUT":return <AboutSection key={section.type} content={section.content}/>;case"COUNTERS":return <CounterSection key={section.type} content={section.content}/>;case"SERVICES":return <ServicesSection key={section.type} services={services} content={section.content}/>;case"PLATFORMS":return <GlobalPlatformsSection key={section.type} content={section.content}/>;case"WHAT_WE_DO":return <WhatWeDoSection key={section.type} content={section.content}/>;case"PORTFOLIO":return <PortfolioSection key={section.type} projects={projects} content={section.content}/>;case"TESTIMONIALS":return <TestimonialsSection key={section.type} testimonials={testimonials} content={section.content}/>;case"TRUSTED_COMPANIES":return <IntegrationsSection key={section.type} logos={logos} content={section.content}/>;case"CONTACT":return <ContactSection key={section.type} content={section.content}/>;default:return null}})}</>}
