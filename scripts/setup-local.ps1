$ErrorActionPreference = "Stop"
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example for local development."
}
Write-Host "Starting local PostgreSQL and Redis..."
docker compose up -d
Write-Host "Waiting for PostgreSQL..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  docker compose exec -T postgres pg_isready -U postgres -d itlabbd | Out-Null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  docker compose exec -T postgres pg_isready -U itlabbd -d itlabbd | Out-Null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  Start-Sleep -Seconds 2
}
if (-not $ready) { throw "PostgreSQL did not become ready in time." }
npm run db:repair
npm run db:generate
npm run db:deploy
npm run db:seed
npm run backend:check
Write-Host "Local backend is ready. Start the website with: npm run dev"
