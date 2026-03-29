<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'multipart/form-data') === false) {
    jsonResponse(['success' => false, 'error' => 'Content-Type must be multipart/form-data'], 415);
}

if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
    jsonResponse(['success' => false, 'error' => 'Missing file field. Use form-data key: file'], 422);
}

$file = $_FILES['file'];
$error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
if ($error !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE => 'File exceeds php.ini upload_max_filesize.',
        UPLOAD_ERR_FORM_SIZE => 'File exceeds form MAX_FILE_SIZE.',
        UPLOAD_ERR_PARTIAL => 'File upload was incomplete.',
        UPLOAD_ERR_NO_FILE => 'No file uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary upload directory.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write uploaded file to disk.',
        UPLOAD_ERR_EXTENSION => 'Upload stopped by a PHP extension.',
    ];

    jsonResponse([
        'success' => false,
        'error' => $errors[$error] ?? 'Unknown upload error.',
    ], 400);
}

$maxUploadMb = (int)(getenv('UPLOAD_MAX_MB') ?: 10);
$maxUploadBytes = max(1, $maxUploadMb) * 1024 * 1024;
$fileSize = (int)($file['size'] ?? 0);
if ($fileSize <= 0 || $fileSize > $maxUploadBytes) {
    jsonResponse([
        'success' => false,
        'error' => "File size must be between 1 byte and {$maxUploadMb} MB.",
    ], 413);
}

$tmpName = (string)($file['tmp_name'] ?? '');
if ($tmpName === '' || !is_uploaded_file($tmpName)) {
    jsonResponse(['success' => false, 'error' => 'Invalid uploaded file source.'], 400);
}

$allowedMimeToExt = [
    'application/pdf' => 'pdf',
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'text/plain' => 'txt',
    'application/msword' => 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
];

$allowedExtToMime = array_flip($allowedMimeToExt);
$originalName = basename((string)($file['name'] ?? 'file'));
$originalName = trim(str_replace("\0", '', $originalName));
$originalExt = strtolower((string)pathinfo($originalName, PATHINFO_EXTENSION));
$mimeType = detectMimeType($tmpName);

if ($originalName === '' || $originalName === '.' || $originalName === '..') {
    jsonResponse(['success' => false, 'error' => 'Invalid file name.'], 422);
}

if (!preg_match('/^[A-Za-z0-9 _.\-()]+$/', $originalName)) {
    jsonResponse(['success' => false, 'error' => 'File name contains unsupported characters.'], 422);
}

// If MIME detection is limited on this server, fall back to strict extension allow-list.
if (($mimeType === '' || $mimeType === 'application/octet-stream') && isset($allowedExtToMime[$originalExt])) {
    $mimeType = $allowedExtToMime[$originalExt];
}

$extraAllowed = array_filter(array_map('trim', explode(',', (string)(getenv('UPLOAD_ALLOWED_MIME') ?: ''))));
if (!empty($extraAllowed) && !in_array($mimeType, $extraAllowed, true)) {
    jsonResponse(['success' => false, 'error' => 'MIME type not allowed by server policy.'], 415);
}

if (!isset($allowedMimeToExt[$mimeType])) {
    jsonResponse(['success' => false, 'error' => "Unsupported file type: {$mimeType}"], 415);
}

$expectedExt = $allowedMimeToExt[$mimeType];
$allowedExtPairs = [
    'jpg' => ['jpg', 'jpeg'],
    'doc' => ['doc'],
    'docx' => ['docx'],
    'pdf' => ['pdf'],
    'png' => ['png'],
    'webp' => ['webp'],
    'txt' => ['txt'],
];
$allowedOriginalExt = $allowedExtPairs[$expectedExt] ?? [$expectedExt];
if ($originalExt === '' || !in_array($originalExt, $allowedOriginalExt, true)) {
    jsonResponse(['success' => false, 'error' => 'File extension does not match file type.'], 415);
}

$uploaderRaw = trim((string)($_POST['uploader'] ?? ''));
if ($uploaderRaw === '') {
    jsonResponse(['success' => false, 'error' => 'Missing uploader name.'], 422);
}

$uploaderPrefix = preg_replace('/[^A-Za-z0-9]+/', '_', $uploaderRaw);
$uploaderPrefix = trim((string)$uploaderPrefix, '_');
if ($uploaderPrefix === '') {
    jsonResponse(['success' => false, 'error' => 'Invalid uploader name.'], 422);
}

if (strlen($uploaderPrefix) > 60) {
    $uploaderPrefix = substr($uploaderPrefix, 0, 60);
}

$uploadDir = __DIR__ . '/../uploads';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
    jsonResponse(['success' => false, 'error' => 'Could not initialize uploads directory.'], 500);
}

$uploadReal = realpath($uploadDir);
if ($uploadReal === false) {
    jsonResponse(['success' => false, 'error' => 'Could not resolve uploads directory path.'], 500);
}

$storedName = $uploaderPrefix . '_' . $originalName;
$targetPath = $uploadReal . DIRECTORY_SEPARATOR . $storedName;

if (is_file($targetPath)) {
    jsonResponse(['success' => false, 'error' => 'You already uploaded a file with this name. Rename the file and upload again.'], 409);
}

if (!move_uploaded_file($tmpName, $targetPath)) {
    jsonResponse(['success' => false, 'error' => 'Failed to move uploaded file to destination.'], 500);
}

@chmod($targetPath, 0640);

$scriptName = (string)($_SERVER['SCRIPT_NAME'] ?? '/api/upload.php');
$apiBasePath = str_replace('\\', '/', dirname($scriptName));
$apiBasePath = rtrim($apiBasePath, '/');
if ($apiBasePath === '') {
    $apiBasePath = '/api';
}
$fileUrl = $apiBasePath . '/file.php?name=' . rawurlencode($storedName);

jsonResponse([
    'success' => true,
    'file' => [
        'originalName' => $originalName,
        'storedName' => $storedName,
        'size' => $fileSize,
        'mimeType' => $mimeType,
        'url' => $fileUrl,
    ],
], 201);
