<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/state_store.php';
require_once __DIR__ . '/../../config/gateway_helpers.php';

function resolveFrontendBaseUrl(): string
{
    $candidates = [];

    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '' && strtolower($origin) !== 'null') {
        $candidates[] = $origin;
    }

    $frontendEnv = (string)(getenv('FRONTEND_APP_URL') ?: '');
    if ($frontendEnv !== '') {
        $candidates[] = $frontendEnv;
    }

    $appUrl = (string)(getenv('APP_URL') ?: '');
    if ($appUrl !== '' && $appUrl !== 'MY_APP_URL') {
        $candidates[] = $appUrl;
    }

    $candidates[] = 'http://localhost:5173';

    foreach ($candidates as $candidate) {
        $candidate = trim($candidate);
        if ($candidate === '') {
            continue;
        }
        if (filter_var($candidate, FILTER_VALIDATE_URL)) {
            return rtrim($candidate, '/');
        }
    }

    throw new RuntimeException('No valid frontend URL available for PayPal return/cancel URLs.');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

try {
    $body = getJsonBody();

    $paymentId = (string)($body['paymentId'] ?? '');
    $amount = (float)($body['amount'] ?? 0);
    $currency = strtoupper((string)($body['currency'] ?? 'USD'));
    $flow = strtolower((string)($body['flow'] ?? 'redirect'));

    if ($paymentId === '' || $amount <= 0) {
        jsonResponse(['success' => false, 'error' => 'paymentId and amount are required'], 422);
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

    $frontendBaseUrl = resolveFrontendBaseUrl();
    $returnUrl = $frontendBaseUrl . '/?gateway=paypal&payment_id=' . rawurlencode($paymentId);
    $cancelUrl = $frontendBaseUrl . '/?gateway=paypal&payment_id=' . rawurlencode($paymentId) . '&cancelled=1';

    $safePaymentId = preg_replace('/[^a-zA-Z0-9_-]/', '_', $paymentId) ?: 'payment';
    $safePaymentId = substr($safePaymentId, 0, 120);
    $amountValue = number_format($amount, 2, '.', '');

    $orderPayload = [
        'intent' => 'CAPTURE',
        'purchase_units' => [[
            'reference_id' => $safePaymentId,
            'custom_id' => $safePaymentId,
            'amount' => [
                'currency_code' => $currency,
                'value' => $amountValue,
            ],
        ]],
    ];

    if ($flow !== 'card') {
        $orderPayload['payment_source'] = [
            'paypal' => [
                'experience_context' => [
                    'return_url' => $returnUrl,
                    'cancel_url' => $cancelUrl,
                    'user_action' => 'PAY_NOW',
                    'shipping_preference' => 'NO_SHIPPING',
                ],
            ],
        ];
    }

    $createOrderResponse = httpRequestJson(
        $baseUrl . '/v2/checkout/orders',
        'POST',
        [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        json_encode($orderPayload, JSON_UNESCAPED_SLASHES)
    );

    $order = $createOrderResponse['json'] ?? [];
    if ($createOrderResponse['status'] < 200 || $createOrderResponse['status'] >= 300 || !isset($order['id'])) {
        $details = '';
        if (isset($order['details']) && is_array($order['details'])) {
            $parts = [];
            foreach ($order['details'] as $d) {
                if (!is_array($d)) {
                    continue;
                }
                $parts[] = trim(((string)($d['issue'] ?? '')) . ' ' . ((string)($d['field'] ?? '')));
            }
            $details = implode('; ', array_filter($parts));
        }
        $msg = trim(((string)($order['message'] ?? '')) . ($details !== '' ? " ({$details})" : ''));
        if ($msg === '') {
            $msg = $createOrderResponse['raw'];
        }
        jsonResponse(['success' => false, 'error' => 'PayPal order creation failed: ' . $msg], 500);
    }

    $approveUrl = '';
    foreach (($order['links'] ?? []) as $link) {
        if (!is_array($link)) {
            continue;
        }
        $rel = strtolower((string)($link['rel'] ?? ''));
        if ($rel === 'approve' || $rel === 'payer-action') {
            $approveUrl = (string)($link['href'] ?? '');
            break;
        }
    }

    if ($approveUrl === '') {
        jsonResponse(['success' => false, 'error' => 'PayPal approval URL not returned'], 500);
    }

    jsonResponse([
        'success' => true,
        'orderId' => (string)$order['id'],
        'approveUrl' => $approveUrl,
        'sandboxMode' => $isSandbox,
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'success' => false,
        'error' => 'Server error',
        'details' => $e->getMessage(),
    ], 500);
}
