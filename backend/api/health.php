<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/database.php';

try {
    $host = (string)(getenv('DB_HOST') ?: 'localhost');
    $port = (string)(getenv('DB_PORT') ?: '3306');
    $name = (string)(getenv('DB_NAME') ?: 'migration_crm');
    $user = (string)(getenv('DB_USER') ?: 'mighub');
    $appOrigin = (string)(getenv('APP_ALLOWED_ORIGIN') ?: '*');
    $frontendUrl = (string)(getenv('FRONTEND_APP_URL') ?: '');
    $legacyMirror = strtolower(trim((string)(getenv('LEGACY_APP_STATE_MIRROR') ?: '0')));

    $pdo = db();
    $dbName = (string)$pdo->query('SELECT DATABASE()')->fetchColumn();

    $expectedTables = [
        'users',
        'agencies',
        'documents',
        'library_documents',
        'messages',
        'meetings',
        'payments',
        'notifications',
        'state_kv',
    ];

    $placeholders = implode(', ', array_fill(0, count($expectedTables), '?'));
    $stmt = $pdo->prepare(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name IN ({$placeholders})"
    );
    $stmt->execute(array_merge([$dbName], $expectedTables));
    $presentTables = array_map('strval', $stmt->fetchAll(PDO::FETCH_COLUMN) ?: []);
    $missingTables = array_values(array_diff($expectedTables, $presentTables));

    $legacyStmt = $pdo->prepare(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = :schema AND table_name = 'app_state'"
    );
    $legacyStmt->execute(['schema' => $dbName]);
    $hasLegacyAppState = ((int)$legacyStmt->fetchColumn()) > 0;

    jsonResponse([
        'success' => true,
        'service' => 'MigrateHub PHP Backend',
        'db' => [
            'connected' => true,
            'host' => $host,
            'port' => $port,
            'database' => $dbName,
            'user' => $user,
            'normalized_tables_ready' => count($missingTables) === 0,
            'normalized_tables_missing' => $missingTables,
            'legacy_app_state_table_exists' => $hasLegacyAppState,
        ],
        'config' => [
            'app_allowed_origin' => $appOrigin,
            'frontend_app_url' => $frontendUrl,
            'legacy_app_state_mirror' => in_array($legacyMirror, ['1', 'true', 'yes', 'on'], true),
        ],
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'success' => false,
        'service' => 'MigrateHub PHP Backend',
        'db' => [
            'connected' => false,
        ],
        'error' => 'Database connection failed',
        'details' => $e->getMessage(),
    ], 500);
}
