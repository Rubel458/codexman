import { CounterGrid } from "@/components/counter-grid"
type Counter = { value: number; label: string; icon?: string }
export function CounterSection({ content }: { content?: Record<string, unknown> }) {
  const counters = Array.isArray(content?.counters) ? content.counters.filter((item): item is Counter => !!item && typeof item === "object" && typeof (item as Counter).value === "number" && typeof (item as Counter).label === "string").map(item => ({ ...item, icon: typeof item.icon === "string" ? item.icon : undefined })) : undefined
  return <section className="bg-white pb-20"><div className="mx-auto max-w-[1760px] px-6 lg:px-10"><CounterGrid stats={counters} /></div></section>
}
