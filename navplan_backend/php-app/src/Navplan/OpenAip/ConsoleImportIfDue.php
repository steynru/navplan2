<?php declare(strict_types=1);

namespace Navplan\OpenAip;

use Exception;
use Navplan\OpenAip\ApiAdapter\Service\OpenAipImportFilter;

require_once __DIR__ . "/../ConsoleBootstrap.php";


const SOURCE_OPENAIP = "openaip";


function envInt(string $name, int $default): int
{
    $value = getenv($name);
    if ($value === false || trim($value) === "" || !is_numeric($value)) {
        return $default;
    }

    return max(1, intval($value));
}


function getArgValue(array $argv, string $name): ?string
{
    $prefix = "--" . $name . "=";
    foreach ($argv as $arg) {
        if (str_starts_with($arg, $prefix)) {
            return substr($arg, strlen($prefix));
        }
    }

    return null;
}


function hasArg(array $argv, string $name): bool
{
    return in_array("--" . $name, $argv, true);
}


function getStatusFile(string $logDir, string $country): string
{
    $safeCountry = preg_replace("/[^A-Z0-9_-]/", "_", $country);
    return rtrim($logDir, "/") . "/openaip_auto_import_" . $safeCountry . ".json";
}


function readStatus(string $statusFile): array
{
    if (!is_file($statusFile)) {
        return [];
    }

    $statusJson = file_get_contents($statusFile);
    if ($statusJson === false) {
        return [];
    }

    $status = json_decode($statusJson, true);
    return is_array($status) ? $status : [];
}


function writeStatus(
    string $statusFile,
    string $country,
    string $status,
    ?string $startedAt,
    ?string $finishedAt,
    ?string $nextDueAt,
    string $message
): void
{
    $statusDir = dirname($statusFile);
    if (!is_dir($statusDir)) {
        mkdir($statusDir, 0777, true);
    }

    file_put_contents($statusFile, json_encode([
        "source" => SOURCE_OPENAIP,
        "country" => $country,
        "status" => $status,
        "startedAt" => $startedAt,
        "finishedAt" => $finishedAt,
        "nextDueAt" => $nextDueAt,
        "message" => $message,
        "updatedAt" => date("Y-m-d H:i:s"),
    ], JSON_PRETTY_PRINT));
}


function isDue(array $status, int $intervalSeconds): bool
{
    if (($status["status"] ?? "") !== "success") {
        return true;
    }

    $lastSuccess = $status["finishedAt"] ?? null;
    if ($lastSuccess === null) {
        return true;
    }

    $lastSuccessTs = strtotime($lastSuccess);
    if ($lastSuccessTs === false) {
        return true;
    }

    return (time() - $lastSuccessTs) >= $intervalSeconds;
}


global $diContainer, $argv;

$country = strtoupper(trim(getArgValue($argv, "country") ?: (getenv("NAVPLAN_AUTO_IMPORT_COUNTRY") ?: "CH")));
$intervalSeconds = intval(getArgValue($argv, "interval-seconds") ?: envInt("NAVPLAN_AUTO_IMPORT_INTERVAL_SECONDS", 604800));
$force = hasArg($argv, "force");
$logDir = $diContainer->getConfigDiContainer()->getLogDir();
$statusFile = getStatusFile($logDir, $country);
$startedAt = date("Y-m-d H:i:s");

try {
    $apiKey = trim($diContainer->getConfigDiContainer()->getOpenAipApiKey());
    if ($apiKey === "") {
        writeStatus($statusFile, $country, "skipped", $startedAt, date("Y-m-d H:i:s"), null, "OpenAIP API key is not configured");
        echo "OpenAIP auto import skipped: API key is not configured\n";
        exit(0);
    }

    $status = readStatus($statusFile);
    if (!$force && !isDue($status, $intervalSeconds)) {
        echo "OpenAIP auto import is current for " . $country . "; next due at " . ($status["nextDueAt"] ?? "unknown") . "\n";
        exit(0);
    }

    writeStatus($statusFile, $country, "running", $startedAt, null, null, "OpenAIP import started");

    $importFilter = $country === "" || $country === "ALL" ? null : new OpenAipImportFilter($country);
    $importer = $diContainer->getOpenAipDiContainer()->getOpenAipImporter();
    $importer->setImportFilter($importFilter);

    $navaids = $importer->importNavaids();
    $airports = $importer->importAirports();
    $airspaces = $importer->importAirspaces();
    $results = [
        "navaids" => $navaids,
        "airports" => $airports,
        "airspaces" => $airspaces,
    ];

    foreach ($results as $dataset => $result) {
        if (!$result->isSuccess) {
            throw new Exception("OpenAIP " . $dataset . " import failed");
        }
    }

    $finishedAt = date("Y-m-d H:i:s");
    $nextDueAt = date("Y-m-d H:i:s", time() + $intervalSeconds);
    $message = "Imported navaids=" . $navaids->insertCount
        . ", airports=" . $airports->insertCount
        . ", airspaces=" . $airspaces->insertCount;
    writeStatus($statusFile, $country, "success", $startedAt, $finishedAt, $nextDueAt, $message);
    echo "OpenAIP auto import successful for " . $country . ": " . $message . "\n";
} catch (Exception $e) {
    writeStatus($statusFile, $country, "failed", $startedAt, date("Y-m-d H:i:s"), null, $e->getMessage());
    echo "OpenAIP auto import failed: " . $e->getMessage() . "\n";
    exit(1);
}
