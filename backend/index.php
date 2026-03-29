<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'service' => 'MigrateHub PHP Backend',
    'status' => 'ok',
    'endpoints' => [
        '/api/health.php',
        '/api/state.php',
        '/api/upload.php',
        '/api/file.php?name=<storedName>',
        '/api/payments/gateway.php',
        '/api/payments/webhook.php',
        '/api/payments/paypal_create_order.php',
        '/api/payments/paypal_capture_order.php',
    ],
]);
