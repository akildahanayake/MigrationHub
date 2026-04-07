<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/state_store.php';

try {
    $pdo = db();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $state = null;
        $updatedAt = gmdate('c');
        $mode = 'normalized';

        try {
            $state = loadAppState($pdo);
        } catch (Throwable $e) {
            // Shared-hosting DB privilege differences can break normalized reads.
            // Fall back to legacy mirror to keep app functional.
            error_log('state.php normalized GET failed: ' . $e->getMessage());
            $mode = 'legacy_fallback';

            $stmt = $pdo->query('SELECT state_json, updated_at FROM app_state WHERE id = 1 LIMIT 1');
            $row = $stmt->fetch();
            if ($row && isset($row['state_json'])) {
                $decoded = json_decode((string)$row['state_json'], true);
                $state = is_array($decoded) ? $decoded : null;
                $updatedAt = (string)($row['updated_at'] ?? $updatedAt);
            }
        }

        jsonResponse([
            'success' => true,
            'data' => !empty($state) ? $state : null,
            'updatedAt' => $updatedAt,
            'mode' => $mode,
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
        $body = getJsonBody();
        $data = $body['data'] ?? null;

        if (!is_array($data)) {
            jsonResponse(['success' => false, 'error' => 'Expected body shape: { "data": { ... } }'], 422);
        }

        $mode = 'normalized';
        try {
            saveAppState($pdo, $data);
        } catch (Throwable $e) {
            // Fall back to legacy app_state writes so production remains usable.
            error_log('state.php normalized POST failed: ' . $e->getMessage());
            $mode = 'legacy_fallback';

            $json = json_encode($data, JSON_UNESCAPED_SLASHES);
            if ($json === false) {
                jsonResponse(['success' => false, 'error' => 'Failed to encode state payload'], 500);
            }

            $stmt = $pdo->prepare(
                'INSERT INTO app_state (id, state_json, updated_at) VALUES (1, :state_json, NOW())
                 ON DUPLICATE KEY UPDATE state_json = VALUES(state_json), updated_at = NOW()'
            );
            $stmt->execute(['state_json' => $json]);
        }

        jsonResponse(['success' => true, 'mode' => $mode]);
    }

    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
} catch (Throwable $e) {
    jsonResponse([
        'success' => false,
        'error' => 'Server error',
        'details' => $e->getMessage(),
    ], 500);
}
