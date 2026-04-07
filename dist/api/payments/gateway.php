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
    $amount = (float)($body['amount'] ?? 0);
    $currency = strtoupper((string)($body['currency'] ?? 'USD'));
    $simulateStatus = strtoupper((string)($body['simulateStatus'] ?? 'AUTO'));
    $paymentPayload = $body['payment'] ?? null;

    if (!in_array($gateway, ['STRIPE', 'PAYPAL'], true)) {
        jsonResponse(['success' => false, 'error' => 'Unsupported gateway'], 422);
    }

    if ($paymentId === '' || $amount <= 0) {
        jsonResponse(['success' => false, 'error' => 'paymentId and amount are required'], 422);
    }

    if (!in_array($simulateStatus, ['AUTO', 'APPROVED', 'DECLINED'], true)) {
        jsonResponse(['success' => false, 'error' => 'simulateStatus must be AUTO, APPROVED or DECLINED'], 422);
    }

    $gatewayStatus = $simulateStatus;
    if ($gatewayStatus === 'AUTO') {
        $gatewayStatus = random_int(1, 100) <= 85 ? 'APPROVED' : 'DECLINED';
    }

    $transactionId = strtolower($gateway) . '_' . bin2hex(random_bytes(6));
    $appStatus = $gatewayStatus === 'APPROVED' ? 'PAID' : 'FAILED';
    $message = $gatewayStatus === 'APPROVED'
        ? "{$gateway} approved payment of {$amount} {$currency}."
        : "{$gateway} declined payment of {$amount} {$currency}.";

    $pdo = db();
    $updatedPayment = updatePaymentStatusInState($pdo, $paymentId, $appStatus, $gateway, $message, $transactionId);

    if ($updatedPayment === null) {
        // If frontend state sync is slightly behind, allow upsert using payload.
        if (is_array($paymentPayload) && ($paymentPayload['id'] ?? '') === $paymentId) {
            upsertPaymentInState($pdo, $paymentPayload);
            $updatedPayment = updatePaymentStatusInState($pdo, $paymentId, $appStatus, $gateway, $message, $transactionId);
        }
    }

    if ($updatedPayment === null) {
        jsonResponse(['success' => false, 'error' => 'Payment not found in app state'], 404);
    }

    jsonResponse([
        'success' => true,
        'gateway' => $gateway,
        'gatewayStatus' => $gatewayStatus,
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
