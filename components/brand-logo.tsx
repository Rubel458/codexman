import Image from "next/image"

type Props = { settings: Record<string, string>; footer?: boolean }
export function BrandLogo({ settings, footer = false }: Props) {
  const prefix = footer ? "footer" : "header"
  const mode = settings[`${prefix}_logo_mode`] || settings.logo_mode || "text"
  const imageUrl = settings[`${prefix}_logo_image_url`] || settings.logo_image_url || ""
  if (mode === "image" && imageUrl) return <Image src={imageUrl} alt={settings.site_name || "IT LAB BD"} width={footer ? 280 : 240} height={footer ? 92 : 78} priority={!footer} className={`${footer ? "max-h-20" : "max-h-16"} w-auto object-contain`} />
  return <><span className={`brand-button flex items-center justify-center rounded-2xl font-heading font-bold text-white ${footer ? "size-14 text-xl" : "size-13 text-lg"}`}>{settings.logo_text || "it"}</span><span className={`font-heading font-bold leading-tight ${footer ? "text-xl text-white" : "text-xl text-foreground"}`}>{settings.site_name || "IT LAB BD"}</span></>
}
