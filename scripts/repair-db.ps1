$ErrorActionPreference = "Stop"
Write-Host "Repairing local PostgreSQL permissions..."

$users = @("postgres", "itlabbd")
$repaired = $false
foreach ($user in $users) {
  docker compose exec -T postgres psql -U $user -d itlabbd -f /docker-entrypoint-initdb.d/001-permissions.sql
  if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL permissions repaired with database administrator role: $user"
    $repaired = $true
    break
  }
}

if (-not $repaired) {
  throw "Database permission repair failed. For a disposable local database run: docker compose down -v ; docker compose up -d"
}
