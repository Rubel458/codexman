"use client"
import { useEffect, useRef, useState } from "react"
import { Award, CheckCircle2, CircleDollarSign, Globe2, Layers3, TrendingUp, Users, type LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = { Award, CheckCircle2, CircleDollarSign, Globe2, Layers3, TrendingUp, Users }
const iconStyles = ["bg-blue-50 text-blue-700", "bg-sky-50 text-sky-700", "bg-emerald-50 text-emerald-700", "bg-violet-50 text-violet-700", "bg-amber-50 text-amber-700", "bg-rose-50 text-rose-700"]

type Stat = { value: number; label: string; icon?: string }

function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const start = performance.now()
      const duration = 1400
      const animate = (time: number) => {
        const progress = Math.min((time - start) / duration, 1)
        setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
      observer.disconnect()
    }, { threshold: .35 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])
  return <span ref={ref}>{display}+</span>
}

const defaults: Stat[] = [
  { value: 240, label: "Products Sale", icon: "CircleDollarSign" },
  { value: 70, label: "Clients", icon: "Users" },
  { value: 240, label: "Projects Done", icon: "CheckCircle2" },
  { value: 12, label: "Years Experience", icon: "Award" },
]

export function CounterGrid({ stats = defaults }: { stats?: Stat[] }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">{stats.map((stat, index) => {
    const Icon = iconMap[stat.icon || ""] || [CircleDollarSign, Users, CheckCircle2, Award][index % 4]
    return <div key={`${stat.label}-${index}`} className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"><div className="flex items-center gap-5"><span className={`flex size-15 items-center justify-center rounded-2xl ${iconStyles[index % iconStyles.length]}`}><Icon className="size-7" /></span><div><p className="font-heading text-3xl font-bold text-foreground"><Counter value={stat.value} /></p><p className="mt-1 text-sm font-semibold text-muted-foreground">{stat.label}</p></div></div></div>
  })}</div>
}
