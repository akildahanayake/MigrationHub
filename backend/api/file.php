<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$name = (string)($_GET['name'] ?? '');
$name = trim(str_replace("\0", '', $name));
$safeName = basename($name);
if ($safeName === '' || $safeName !== $name) {
    jsonResponse(['success' => false, 'error' => 'Invalid file identifier.'], 400);
}

if (!preg_match('/^[A-Za-z0-9 _.\-()]+$/', $safeName)) {
    jsonResponse(['success' => false, 'error' => 'Invalid file identifier.'], 400);
}

$uploadDir = __DIR__ . '/../uploads';
$uploadReal = realpath($uploadDir);
if ($uploadReal === false) {
    jsonResponse(['success' => false, 'error' => 'Uploads directory not found.'], 500);
}

$filePath = realpath($uploadReal . DIRECTORY_SEPARATOR . $safeName);
if ($filePath === false || !is_file($filePath) || strpos($filePath, $uploadReal) !== 0) {
    jsonResponse(['success' => false, 'error' => 'File not found.'], 404);
}

$mimeType = detectMimeType($filePath);
$download = strtolower((string)($_GET['download'] ?? ''));
$forceDownload = in_array($download, ['1', 'true', 'yes'], true);

header('Content-Type: ' . $mimeType);
header('X-Content-Type-Options: nosniff');
header('Content-Length: ' . (string)filesize($filePath));
if ($forceDownload) {
    header('Content-Disposition: attachment; filename="' . basename($safeName) . '"');
} else {
    header('Content-Disposition: inline; filename="' . basename($safeName) . '"');
}

readfile($filePath);
exit;
