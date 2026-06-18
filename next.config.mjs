/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production"
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? " https://va.vercel-scripts.com" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://vitals.vercel-insights.com${isProduction ? "" : " ws: http: https:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }] : []),
]

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }] },
      { source: "/api/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }] },
      { source: "/api/auth/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }] },
      { source: "/", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/about-us", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/our-mission", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/our-vision", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/our-philosophy", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/our-strategy", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/our-team", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/services", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/services/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/portfolio", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/portfolio/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/demo", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/contact-us", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
      { source: "/pages/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }] },
    ]
  },
}
export default nextConfig
