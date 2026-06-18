export async function getCsrf() {
  const response = await fetch("/api/auth/csrf", {
    credentials: "same-origin",
    cache: "no-store",
    headers: { accept: "application/json" },
  })
  const contentType = response.headers.get("content-type") || ""
  if (!response.ok || !contentType.includes("application/json")) {
    const preview = await response.text().catch(() => "")
    throw new Error(`CSRF endpoint failed (${response.status}). ${preview.slice(0, 80)}`)
  }
  const data = await response.json()
  if (!data?.token) throw new Error("CSRF endpoint did not return a token.")
  return data.token as string
}
