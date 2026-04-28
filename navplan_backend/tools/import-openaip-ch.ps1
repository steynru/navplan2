param(
    [switch]$SkipCorrections
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$configPath = Join-Path $repoRoot "navplan_backend\php-app\config\navplan_local.ini"

if (-not (Test-Path -LiteralPath $configPath)) {
    throw "Missing $configPath. Copy navplan_local.ini.example first and set openaip_api_key."
}

$keyLine = Select-String -Path $configPath -Pattern "^openaip_api_key\s*=" | Select-Object -First 1
if (-not $keyLine) {
    throw "Missing openaip_api_key in $configPath."
}

$apiKey = ($keyLine.Line -replace "^openaip_api_key\s*=\s*", "").Trim()
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    throw "openaip_api_key is blank in $configPath. Add a local OpenAIP API key before importing."
}

Push-Location $repoRoot
try {
    Write-Host "Importing OpenAIP CH airports, navaids and airspaces into Docker..."
    docker compose exec navplan_backend php /var/www/html/php/Navplan/OpenAip/ConsoleImportOnlyCH.php

    if (-not $SkipCorrections) {
        $mariadbCommand = "mariadb -u root -p`$(cat /run/secrets/db_root_pw) tschanz_navplan"
        $correctionDir = Join-Path $repoRoot "navplan_backend\php-app\src\Navplan\OpenAip\DataCorrectionScripts"

        Get-ChildItem -Path $correctionDir -Filter "*.sql" | Sort-Object Name | ForEach-Object {
            Write-Host "Applying correction script $($_.Name)..."
            Get-Content -LiteralPath $_.FullName -Raw | docker compose exec -T navplan_persistence sh -c $mariadbCommand
        }
    }

    $countSql = @"
SELECT 'airports2' AS dataset, COUNT(*) AS rows FROM openaip_airports2
UNION ALL SELECT 'navaids2', COUNT(*) FROM openaip_navaids2
UNION ALL SELECT 'airspace2', COUNT(*) FROM openaip_airspace2
UNION ALL SELECT 'airspace_detaillevels', COUNT(*) FROM openaip_airspace_detaillevels;
"@
    $mariadbCommand = "mariadb -u root -p`$(cat /run/secrets/db_root_pw) tschanz_navplan"
    $countSql | docker compose exec -T navplan_persistence sh -c $mariadbCommand
}
finally {
    Pop-Location
}
