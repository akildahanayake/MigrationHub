<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/state_store.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

try {
    $body = getJsonBody();

    $gateway = strtoupper((string)($body['gateway'] ?? ''));
    $paymentId = (string)($body['paymentId'] ?? '');
    $statusRaw = strtoupper((string)($body['status'] ?? ''));
    $transactionId = (string)($body['transactionId'] ?? ('evt_' . bin2hex(random_bytes(4))));
    $message = (string)($body['message'] ?? 'Gateway status received');

    if (!in_array($gateway, ['STRIPE', 'PAYPAL'], true)) {
        jsonResponse(['success' => false, 'error' => 'Unsupported gateway'], 422);
    }

    if ($paymentId === '') {
        jsonResponse(['success' => false, 'error' => 'paymentId is required'], 422);
    }

    if (!in_array($statusRaw, ['APPROVED', 'DECLINED'], true)) {
        jsonResponse(['success' => false, 'error' => 'status must be APPROVED or DECLINED'], 422);
    }

    $appStatus = $statusRaw === 'APPROVED' ? 'PAID' : 'FAILED';

    $pdo = db();
    $updatedPayment = updatePaymentStatusInState($pdo, $paymentId, $appStatus, $gateway, $message, $transactionId);

    if ($updatedPayment === null) {
        jsonResponse(['success' => false, 'error' => 'Payment not found in app state'], 404);
    }

    jsonResponse([
        'success' => true,
        'gateway' => $gateway,
        'gatewayStatus' => $statusRaw,
        'appStatus' => $appStatus,
        'transactionId' => $transactionId,
        'message' => $message,
        'payment' => $updatedPayment,
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'success' => false,
        'error' => 'Server error',
        'details' => $e->getMessage(),
    ], 500);
}
