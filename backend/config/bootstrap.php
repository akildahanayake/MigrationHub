<?php

declare(strict_types=1);

// Lightweight .env loader for local development.
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key !== '') {
            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// Keep API responses JSON-only. Log errors instead of echoing warnings/notices.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');

function normalizeOrigins(string $originsRaw): array
{
    $parts = array_map('trim', explode(',', $originsRaw));
    return array_values(array_filter($parts, static fn ($v) => $v !== ''));
}

function isOriginAllowed(string $origin, array $allowedOrigins): bool
{
    foreach ($allowedOrigins as $allowed) {
        if ($allowed === '*') {
            return true;
        }
        if ($origin === $allowed) {
            return true;
        }
        // Support wildcard like http://localhost:* for local dev.
        if (strpos($allowed, '*') !== false && fnmatch($allowed, $origin)) {
            return true;
        }
    }
    return false;
}

$originHeader = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
$allowedOrigins = normalizeOrigins((string)(getenv('APP_ALLOWED_ORIGIN') ?: '*'));
$corsOrigin = '*';

if ($originHeader === 'null' && in_array('*', $allowedOrigins, true)) {
    $corsOrigin = 'null';
} elseif ($originHeader !== '' && isOriginAllowed($originHeader, $allowedOrigins)) {
    $corsOrigin = $originHeader;
} elseif (!in_array('*', $allowedOrigins, true) && !empty($allowedOrigins)) {
    // Fallback to first configured origin for non-browser clients.
    $corsOrigin = $allowedOrigins[0];
}

header("Access-Control-Allow-Origin: {$corsOrigin}");
header('Vary: Origin');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function jsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        jsonResponse(['success' => false, 'error' => 'Invalid JSON payload'], 400);
    }

    return $decoded;
}

function detectMimeType(string $filePath): string
{
    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = (string)$finfo->file($filePath);
        if ($mime !== '') {
            return $mime;
        }
    }

    if (function_exists('mime_content_type')) {
        $mime = (string)mime_content_type($filePath);
        if ($mime !== '') {
            return $mime;
        }
    }

    return 'application/octet-stream';
}
