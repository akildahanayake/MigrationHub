<?php

declare(strict_types=1);

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/state_store.php';

function gatewayFieldsToMap(array $gateway): array
{
    $map = [];
    $fields = $gateway['fields'] ?? [];
    if (!is_array($fields)) {
        return $map;
    }

    foreach ($fields as $field) {
        if (!is_array($field)) {
            continue;
        }
        $key = (string)($field['key'] ?? '');
        if ($key === '') {
            continue;
        }
        $map[$key] = (string)($field['value'] ?? '');
    }

    return $map;
}

function getGatewayConfigFromState(PDO $pdo, string $gatewayId): ?array
{
    $state = loadAppState($pdo);
    $gateways = $state['gateways'] ?? [];
    if (!is_array($gateways)) {
        return null;
    }

    foreach ($gateways as $gateway) {
        if (is_array($gateway) && ($gateway['id'] ?? '') === $gatewayId) {
            return $gateway;
        }
    }

    return null;
}

function httpRequestJson(string $url, string $method, array $headers = [], ?string $body = null): array
{
    $sslVerifyFlag = strtolower(trim((string)(getenv('GATEWAY_SSL_VERIFY') ?: '1')));
    $sslVerify = !in_array($sslVerifyFlag, ['0', 'false', 'off', 'no'], true);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch === false) {
            throw new RuntimeException('Failed to initialize HTTP request');
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $sslVerify);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $sslVerify ? 2 : 0);

        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }

        $raw = curl_exec($ch);
        if ($raw === false) {
            $err = curl_error($ch);
            throw new RuntimeException('Gateway request failed: ' . $err);
        }

        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);

        $decoded = json_decode($raw, true);
        return [
            'status' => $status,
            'raw' => $raw,
            'json' => is_array($decoded) ? $decoded : null,
        ];
    }

    $headerLines = $headers;
    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headerLines),
            'content' => $body ?? '',
            'ignore_errors' => true,
            'timeout' => 30,
        ],
        'ssl' => [
            'verify_peer' => $sslVerify,
            'verify_peer_name' => $sslVerify,
            'allow_self_signed' => !$sslVerify,
        ],
    ]);

    $raw = @file_get_contents($url, false, $context);
    if ($raw === false) {
        $error = error_get_last();
        throw new RuntimeException('Gateway request failed: ' . ($error['message'] ?? 'unknown error'));
    }

    $status = 0;
    $responseHeaders = $http_response_header ?? [];
    foreach ($responseHeaders as $line) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#i', $line, $m)) {
            $status = (int)$m[1];
            break;
        }
    }

    $decoded = json_decode($raw, true);
    return [
        'status' => $status,
        'raw' => $raw,
        'json' => is_array($decoded) ? $decoded : null,
    ];
}

function getPayPalAccessToken(string $baseUrl, string $clientId, string $secretKey): string
{
    $authHeader = 'Authorization: Basic ' . base64_encode($clientId . ':' . $secretKey);
    $response = httpRequestJson(
        $baseUrl . '/v1/oauth2/token',
        'POST',
        [
            $authHeader,
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json',
        ],
        'grant_type=client_credentials'
    );

    if ($response['status'] < 200 || $response['status'] >= 300 || !isset($response['json']['access_token'])) {
        $msg = $response['json']['error_description'] ?? $response['raw'];
        throw new RuntimeException('PayPal auth failed: ' . $msg);
    }

    return (string)$response['json']['access_token'];
}
