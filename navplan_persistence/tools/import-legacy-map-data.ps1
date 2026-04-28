param(
    [string]$SqlPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

if ([string]::IsNullOrWhiteSpace($SqlPath)) {
    $SqlPath = Join-Path $repoRoot "navplan_persistence\local_import\navplan_v1_map_data.sql"
}

if (-not (Test-Path -LiteralPath $SqlPath)) {
    throw "SQL dump not found: $SqlPath"
}

$resolvedSqlPath = (Resolve-Path -LiteralPath $SqlPath).Path
$mariadbCommand = "mariadb -u root -p`$(cat /run/secrets/db_root_pw) tschanz_navplan"

Push-Location $repoRoot
try {
    Write-Host "Importing local map data dump into Docker: $resolvedSqlPath"
    Get-Content -LiteralPath $resolvedSqlPath -Raw | docker compose exec -T navplan_persistence sh -c $mariadbCommand

    $countSql = @"
SELECT 'airports2' AS dataset, COUNT(*) AS rows FROM openaip_airports2
UNION ALL SELECT 'runways2', COUNT(*) FROM openaip_runways2
UNION ALL SELECT 'radios2', COUNT(*) FROM openaip_radios2
UNION ALL SELECT 'navaids2', COUNT(*) FROM openaip_navaids2
UNION ALL SELECT 'airspace2', COUNT(*) FROM openaip_airspace2
UNION ALL SELECT 'airspace_detaillevels', COUNT(*) FROM openaip_airspace_detaillevels
UNION ALL SELECT 'reporting_points', COUNT(*) FROM reporting_points
UNION ALL SELECT 'webcams', COUNT(*) FROM webcams;
"@
    $countSql | docker compose exec -T navplan_persistence sh -c $mariadbCommand
}
finally {
    Pop-Location
}
