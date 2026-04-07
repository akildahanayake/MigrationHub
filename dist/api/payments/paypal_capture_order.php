<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/state_store.php';
require_once __DIR__ . '/../../config/gateway_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

try {
    $body = getJsonBody();

    $orderId = (string)($body['orderId'] ?? '');
    $paymentId = (string)($body['paymentId'] ?? '');

    if ($orderId === '' || $paymentId === '') {
        jsonResponse(['success' => false, 'error' => 'orderId and paymentId are required'], 422);
    }

    $pdo = db();
    $paypal = getGatewayConfigFromState($pdo, 'paypal');
    if (!$paypal || !($paypal['enabled'] ?? false)) {
        jsonResponse(['success' => false, 'error' => 'PayPal gateway is not enabled'], 422);
    }

    $fieldMap = gatewayFieldsToMap($paypal);
    $clientId = (string)($fieldMap['client_id'] ?? '');
    $secretKey = (string)($fieldMap['secret_key'] ?? '');

    if ($clientId === '' || $secretKey === '') {
        jsonResponse(['success' => false, 'error' => 'PayPal Client ID / Secret Key not configured'], 422);
    }

    $isSandbox = (bool)($paypal['sandboxMode'] ?? true);
    $baseUrl = $isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

    $accessToken = getPayPalAccessToken($baseUrl, $clientId, $secretKey);

    $captureResponse = httpRequestJson(
        $baseUrl . '/v2/checkout/orders/' . rawurlencode($orderId) . '/capture',
        'POST',
        [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        '{}'
    );

    $captureJson = $captureResponse['json'] ?? [];
    if ($captureResponse['status'] < 200 || $captureResponse['status'] >= 300) {
        $msg = $captureJson['message'] ?? $captureResponse['raw'];
        jsonResponse(['success' => false, 'error' => 'PayPal capture failed: ' . $msg], 500);
    }

    $statusRaw = strtoupper((string)($captureJson['status'] ?? ''));
    $approved = $statusRaw === 'COMPLETED';
    $appStatus = $approved ? 'PAID' : 'FAILED';

    $transactionId = '';
    $message = $approved ? 'PAYPAL approved payment.' : 'PAYPAL declined payment.';

    $captures = $captureJson['purchase_units'][0]['payments']['captures'][0] ?? null;
    if (is_array($captures)) {
        $transactionId = (string)($captures['id'] ?? '');
        $sellerStatus = strtoupper((string)($captures['status'] ?? ''));
        if ($sellerStatus !== '') {
            $message = 'PAYPAL capture status: ' . $sellerStatus;
        }
    }

    if ($transactionId === '') {
        $transactionId = 'paypal_' . bin2hex(random_bytes(6));
    }

    $updatedPayment = updatePaymentStatusInState($pdo, $paymentId, $appStatus, 'PAYPAL', $message, $transactionId);
    if ($updatedPayment === null) {
        jsonResponse(['success' => false, 'error' => 'Payment not found in app state'], 404);
    }

    jsonResponse([
        'success' => true,
        'gateway' => 'PAYPAL',
        'gatewayStatus' => $approved ? 'APPROVED' : 'DECLINED',
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
