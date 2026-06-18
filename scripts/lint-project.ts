import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const errors: string[] = []
function walk(dir: string): string[] { return readdirSync(dir).flatMap(name => { const full = path.join(dir, name); const rel = path.relative(root, full); if (["node_modules", ".next", ".git"].includes(name)) return []; return statSync(full).isDirectory() ? walk(full) : [rel] }) }
const files = walk(root)
if (files.some(file => file.endsWith(".tsbuildinfo"))) errors.push("Remove stale *.tsbuildinfo files from the release.")
if (files.includes(".env")) errors.push("Do not package .env credentials.")
const lock = readFileSync(path.join(root, "package-lock.json"), "utf8")
if (lock.includes("packages.applied-caas") || lock.includes("artifactory/api/npm")) errors.push("package-lock.json contains an internal registry URL.")
if (!existsSync(path.join(root, "app", "sitemap.xml", "route.ts"))) errors.push("Runtime sitemap route is missing.")
if (existsSync(path.join(root, "app", "sitemap.ts"))) errors.push("Remove static sitemap metadata route; it can block builds when external services are slow.")
if (!existsSync(path.join(root, "docker", "postgres", "init", "001-permissions.sh"))) errors.push("Parameterized PostgreSQL bootstrap script is missing.")
if (errors.length) { console.error(errors.map(error => `- ${error}`).join("\n")); process.exit(1) }
console.log(`Project lint preflight passed (${files.length} tracked files checked).`)
