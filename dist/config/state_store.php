<?php

declare(strict_types=1);

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/bootstrap.php';

function normalizeStoreSchema(PDO $pdo): void
{
    static $isReady = false;
    if ($isReady) {
        return;
    }

    // Runtime schema auto-management is disabled by default to avoid
    // permission-related 500s on shared hosting. Enable only when needed.
    $autoSchemaRaw = strtolower(trim((string)(getenv('AUTO_SCHEMA_MANAGE') ?: '0')));
    $autoSchema = in_array($autoSchemaRaw, ['1', 'true', 'yes', 'on'], true);
    if (!$autoSchema) {
        $isReady = true;
        return;
    }

    $ddl = [
        "CREATE TABLE IF NOT EXISTS users (\n            id VARCHAR(96) PRIMARY KEY,\n            role VARCHAR(32) NOT NULL,\n            email VARCHAR(255) NULL,\n            full_name VARCHAR(255) NULL,\n            approval_status VARCHAR(32) NULL,\n            agency_id VARCHAR(96) NULL,\n            assigned_agent_id VARCHAR(96) NULL,\n            requested_agent_id VARCHAR(96) NULL,\n            application_status VARCHAR(64) NULL,\n            registration_date DATETIME NULL,\n            payload_json LONGTEXT NOT NULL,\n            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            CHECK (JSON_VALID(payload_json)),\n            INDEX idx_users_role (role),\n            INDEX idx_users_agency_id (agency_id),\n            INDEX idx_users_assigned_agent_id (assigned_agent_id),\n            INDEX idx_users_requested_agent_id (requested_agent_id),\n            INDEX idx_users_email (email)\n        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS agencies (\n            id VARCHAR(96) PRIMARY KEY,\n            owner_id VARCHAR(96) NULL,\n            name VARCHAR(255) NULL,\n            subscription_plan VARCHAR(32) NULL,\n            status VARCHAR(32) NULL,\n            joined_at DATETIME NULL,\n            revenue DECIMAL(14,2) NULL,\n            total_clients INT NULL,\n            total_agents INT NULL,\n            payload_json LONGTEXT NOT NULL,\n            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            CHECK (JSON_VALID(payload_json)),\n            INDEX idx_agencies_owner_id (owner_id),\n            INDEX idx_agencies_status (status)\n        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS documents (\n            id VARCHAR(96) PRIMARY KEY,\n            user_id VARCHAR(96) NULL,\n            uploaded_by_id VARCHAR(96) NULL,\n            name VARCHAR(255) NULL,\n            category VARCHAR(128) NULL,\n            status VARCHAR(64) NULL,\n            uploaded_at DATETIME NULL,\n            file_url TEXT NULL,\n            payload_json LONGTEXT NOT NULL,\n            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            CHECK (JSON_VALID(payload_json)),\n            INDEX idx_documents_user_id (user_id),\n            INDEX idx_documents_uploaded_by_id (uploaded_by_id),\n            INDEX idx_documents_status (status),\n            INDEX idx_documents_category (category),\n            INDEX idx_documents_uploaded_at (uploaded_at)\n        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS library_documents (\n            id VARCHAR(96) PRIMARY KEY,\n            uploaded_by_id VARCHAR(96) NULL,\n            name VARCHAR(255) NULL,\n            category VARCHAR(128) NULL,\n            uploaded_at DATETIME NULL,\n            file_url TEXT NULL,\n            payload_json LONGTEXT NOT NULL,\n            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            CHECK (JSON_VALID(payload_json)),\n            INDEX idx_library_documents_uploaded_by_id (uploaded_by_id),\n            INDEX idx_library_documents_category (category),\n            INDEX idx_library_documents_uploaded_at (uploaded_at)\n        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS messages (\n            id VARCHAR(96) PRIMARY KEY,\n            sender_id VARCHAR(96) NULL,\n            receiver_id VARCHAR(96) NULL,\n            timestamp_at DATETIME NULL,\n            is_read TINYINT(1) NULL,\n            payload_json LONGTEXT NOT NULL,\n            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            CHECK (JSON_VALID(payload_json)),\n            INDEX idx_messages_sender_id (sender_id),\n            INDEX idx_messages_receiver_id (receiver_id),\n            INDEX idx_messages_timestamp_at (timestamp_at),\n            INDEX idx_messages_is_read (is_read)\n        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS meetings (\n            id VARCHAR(96) PRIMARY KEY,\n            agent_id VARCHAR(96) NULL,\n            user_id VARCHAR(96) NULL,\n            title VARCHAR(255) NULL,\n            type VARCHAR(32) NULL,\n            status VARCHAR(64) NULL,\n            session_outcome VARCHAR(64) NULL,\n            start_time DATETIME NULL,\n            duration INT NULL,\n            payload_json LONGTEXT NOT NULL,\n            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            CHECK (JSON_VALID(payload_json)),\n            INDEX idx_meetings_agent_id (agent_id),\n            INDEX idx_meetings_user_id (user_id),\n            INDEX idx_meetings_status (status),\n            INDEX idx_meetings_start_time (start_time)\n        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS payments (\n            id VARCHAR(96) PRIMARY KEY,\n            user_id VARCHAR(96) NULL,\n            amount DECIMAL(14,2) NULL,\n            currency VARCHAR(16) NULL,\n            status VARCHAR(32) NULL,\n            method VARCHAR(32) NULL,\n            payment_date DATETIME NULL,\n            description VARCHAR(512) NULL,\n            payload_json LONGTEXT NOT NULL,\n            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            CHECK (JSON_VALID(payload_json)),\n            INDEX idx_payments_user_id (user_id),\n            INDEX idx_payments_status (status),\n            INDEX idx_payments_method (method),\n            INDEX idx_payments_currency (currency),\n            INDEX idx_payments_payment_date (payment_date)\n        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS notifications (\n            id VARCHAR(96) PRIMARY KEY,\n            user_id VARCHAR(96) NULL,\n            type VARCHAR(64) NULL,\n            title VARCHAR(255) NULL,\n            is_read TINYINT(1) NULL,\n            link_tab VARCHAR(64) NULL,\n            timestamp_at DATETIME NULL,\n            payload_json LONGTEXT NOT NULL,\n            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            CHECK (JSON_VALID(payload_json)),\n            INDEX idx_notifications_user_id (user_id),\n            INDEX idx_notifications_type (type),\n            INDEX idx_notifications_is_read (is_read),\n            INDEX idx_notifications_timestamp_at (timestamp_at)\n        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS state_kv (\n            state_key VARCHAR(128) PRIMARY KEY,\n            value_json LONGTEXT NOT NULL,\n            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            CHECK (JSON_VALID(value_json))\n        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    ];

    foreach ($ddl as $sql) {
        $pdo->exec($sql);
    }

    if (tableExists($pdo, 'app_state')) {
        $pdo->exec("INSERT INTO app_state (id, state_json) VALUES (1, JSON_OBJECT()) ON DUPLICATE KEY UPDATE id = id");
    }

    $isReady = true;
}

function tableExists(PDO $pdo, string $table): bool
{
    $dbName = (string)$pdo->query('SELECT DATABASE()')->fetchColumn();
    if ($dbName === '') {
        return false;
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = :schema AND table_name = :table');
    $stmt->execute(['schema' => $dbName, 'table' => $table]);
    return ((int)$stmt->fetchColumn()) > 0;
}

function toNullableString($value): ?string
{
    if ($value === null) {
        return null;
    }

    $text = trim((string)$value);
    return $text === '' ? null : $text;
}

function toSqlDateTime($value): ?string
{
    $text = toNullableString($value);
    if ($text === null) {
        return null;
    }

    try {
        return (new DateTimeImmutable($text))->format('Y-m-d H:i:s');
    } catch (Throwable $e) {
        return null;
    }
}

function encodeJsonValue($value): string
{
    $json = json_encode($value, JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        throw new RuntimeException('Failed to encode JSON payload');
    }
    return $json;
}

function decodeJsonObject(string $json): array
{
    $decoded = json_decode($json, true);
    return is_array($decoded) ? $decoded : [];
}

function upsertRowsAndPrune(PDO $pdo, string $table, array $rows, string $idColumn = 'id'): void
{
    if (empty($rows)) {
        $pdo->exec("DELETE FROM {$table}");
        return;
    }

    $columns = array_keys($rows[0]);
    if (!in_array($idColumn, $columns, true)) {
        throw new RuntimeException("Table {$table} requires {$idColumn} in row payload");
    }

    $insertCols = implode(', ', array_map(static function ($c) {
        return "`{$c}`";
    }, $columns));
    $insertVals = implode(', ', array_map(static function ($c) {
        return ':' . $c;
    }, $columns));

    $updateColumns = array_values(array_filter($columns, static function ($c) use ($idColumn) {
        return $c !== $idColumn;
    }));
    $onDuplicate = implode(', ', array_map(static function ($c) {
        return "`{$c}` = VALUES(`{$c}`)";
    }, $updateColumns));

    $sql = "INSERT INTO {$table} ({$insertCols}) VALUES ({$insertVals}) ON DUPLICATE KEY UPDATE {$onDuplicate}";
    $stmt = $pdo->prepare($sql);

    $ids = [];
    foreach ($rows as $row) {
        $stmt->execute($row);
        $ids[] = (string)$row[$idColumn];
    }

    if (count($ids) === 0) {
        $pdo->exec("DELETE FROM {$table}");
        return;
    }

    $placeholders = implode(', ', array_fill(0, count($ids), '?'));
    $deleteSql = "DELETE FROM {$table} WHERE `{$idColumn}` NOT IN ({$placeholders})";
    $deleteStmt = $pdo->prepare($deleteSql);
    $deleteStmt->execute($ids);
}

function saveStateKv(PDO $pdo, string $key, $value): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO state_kv (state_key, value_json) VALUES (:state_key, :value_json)
         ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)'
    );
    $stmt->execute([
        'state_key' => $key,
        'value_json' => encodeJsonValue($value),
    ]);
}

function loadStateKv(PDO $pdo, string $key, $default)
{
    $stmt = $pdo->prepare('SELECT value_json FROM state_kv WHERE state_key = :state_key LIMIT 1');
    $stmt->execute(['state_key' => $key]);
    $row = $stmt->fetch();
    if (!$row || !isset($row['value_json'])) {
        return $default;
    }

    $decoded = json_decode((string)$row['value_json'], true);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        return $default;
    }

    return $decoded;
}

function hasNormalizedData(PDO $pdo): bool
{
    $tables = [
        'users',
        'documents',
        'messages',
        'meetings',
        'payments',
        'agencies',
        'library_documents',
        'notifications',
        'state_kv',
    ];

    foreach ($tables as $table) {
        $count = (int)$pdo->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
        if ($count > 0) {
            return true;
        }
    }

    return false;
}

function loadEntityPayloads(PDO $pdo, string $table): array
{
    $stmt = $pdo->query("SELECT payload_json FROM {$table} ORDER BY updated_at ASC");
    $items = [];
    while ($row = $stmt->fetch()) {
        $payload = decodeJsonObject((string)($row['payload_json'] ?? '{}'));
        if (!empty($payload)) {
            $items[] = $payload;
        }
    }
    return $items;
}

function writeLegacyStateMirror(PDO $pdo, array $state): void
{
    if (!tableExists($pdo, 'app_state')) {
        return;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO app_state (id, state_json, updated_at) VALUES (1, :state_json, NOW())
         ON DUPLICATE KEY UPDATE state_json = VALUES(state_json), updated_at = NOW()'
    );
    $stmt->execute(['state_json' => encodeJsonValue($state)]);
}

function shouldWriteLegacyMirror(): bool
{
    $raw = strtolower(trim((string)(getenv('LEGACY_APP_STATE_MIRROR') ?: '0')));
    return in_array($raw, ['1', 'true', 'yes', 'on'], true);
}

function readLegacyState(PDO $pdo): array
{
    if (!tableExists($pdo, 'app_state')) {
        return [];
    }

    $stmt = $pdo->query('SELECT state_json FROM app_state WHERE id = 1 LIMIT 1');
    $row = $stmt->fetch();
    if (!$row || !isset($row['state_json'])) {
        return [];
    }

    $decoded = json_decode((string)$row['state_json'], true);
    return is_array($decoded) ? $decoded : [];
}

function buildNormalizedState(PDO $pdo): array
{
    return [
        'users' => loadEntityPayloads($pdo, 'users'),
        'documents' => loadEntityPayloads($pdo, 'documents'),
        'messages' => loadEntityPayloads($pdo, 'messages'),
        'meetings' => loadEntityPayloads($pdo, 'meetings'),
        'payments' => loadEntityPayloads($pdo, 'payments'),
        'agencies' => loadEntityPayloads($pdo, 'agencies'),
        'libraryDocuments' => loadEntityPayloads($pdo, 'library_documents'),
        'destinations' => loadStateKv($pdo, 'destinations', []),
        'currencies' => loadStateKv($pdo, 'currencies', []),
        'selectedCurrency' => loadStateKv($pdo, 'selectedCurrency', 'USD'),
        'visaTypes' => loadStateKv($pdo, 'visaTypes', []),
        'documentTypes' => loadStateKv($pdo, 'documentTypes', []),
        'pipelineStages' => loadStateKv($pdo, 'pipelineStages', []),
        'gateways' => loadStateKv($pdo, 'gateways', []),
        'notifications' => loadEntityPayloads($pdo, 'notifications'),
        'themePreferenceByUser' => loadStateKv($pdo, 'themePreferenceByUser', []),
        'notificationSettingsByUser' => loadStateKv($pdo, 'notificationSettingsByUser', []),
        'privacySettingsByUser' => loadStateKv($pdo, 'privacySettingsByUser', []),
        'notificationSettings' => loadStateKv($pdo, 'notificationSettings', ['email' => true, 'push' => false, 'dashboardAlerts' => true, 'emailAlerts' => true]),
        'privacySettings' => loadStateKv($pdo, 'privacySettings', ['profilePublic' => true]),
        'themePreference' => loadStateKv($pdo, 'themePreference', 'light'),
        'email_templates' => loadStateKv($pdo, 'email_templates', []),
        'emailjs_config' => loadStateKv($pdo, 'emailjs_config', ['serviceId' => '', 'templateId' => '', 'publicKey' => '', 'enabled' => false]),
        'queued_admin_notifications' => loadStateKv($pdo, 'queued_admin_notifications', []),
    ];
}

function persistNormalizedState(PDO $pdo, array $state, bool $writeLegacyMirror = false): void
{
    $users = [];
    foreach (($state['users'] ?? []) as $item) {
        if (!is_array($item) || !isset($item['id'])) {
            continue;
        }
        $users[] = [
            'id' => (string)$item['id'],
            'role' => (string)($item['role'] ?? 'USER'),
            'email' => toNullableString($item['email'] ?? null),
            'full_name' => toNullableString($item['fullName'] ?? null),
            'approval_status' => toNullableString($item['approvalStatus'] ?? null),
            'agency_id' => toNullableString($item['agencyId'] ?? null),
            'assigned_agent_id' => toNullableString($item['assignedAgentId'] ?? null),
            'requested_agent_id' => toNullableString($item['requestedAgentId'] ?? null),
            'application_status' => toNullableString($item['applicationStatus'] ?? null),
            'registration_date' => toSqlDateTime($item['registrationDate'] ?? null),
            'payload_json' => encodeJsonValue($item),
        ];
    }

    $agencies = [];
    foreach (($state['agencies'] ?? []) as $item) {
        if (!is_array($item) || !isset($item['id'])) {
            continue;
        }
        $agencies[] = [
            'id' => (string)$item['id'],
            'owner_id' => toNullableString($item['ownerId'] ?? null),
            'name' => toNullableString($item['name'] ?? null),
            'subscription_plan' => toNullableString($item['subscriptionPlan'] ?? null),
            'status' => toNullableString($item['status'] ?? null),
            'joined_at' => toSqlDateTime($item['joinedAt'] ?? null),
            'revenue' => isset($item['revenue']) ? (float)$item['revenue'] : null,
            'total_clients' => isset($item['totalClients']) ? (int)$item['totalClients'] : null,
            'total_agents' => isset($item['totalAgents']) ? (int)$item['totalAgents'] : null,
            'payload_json' => encodeJsonValue($item),
        ];
    }

    $documents = [];
    foreach (($state['documents'] ?? []) as $item) {
        if (!is_array($item) || !isset($item['id'])) {
            continue;
        }
        $documents[] = [
            'id' => (string)$item['id'],
            'user_id' => toNullableString($item['userId'] ?? null),
            'uploaded_by_id' => toNullableString($item['uploadedById'] ?? null),
            'name' => toNullableString($item['name'] ?? null),
            'category' => toNullableString($item['category'] ?? null),
            'status' => toNullableString($item['status'] ?? null),
            'uploaded_at' => toSqlDateTime($item['uploadedAt'] ?? null),
            'file_url' => toNullableString($item['fileUrl'] ?? null),
            'payload_json' => encodeJsonValue($item),
        ];
    }

    $libraryDocuments = [];
    foreach (($state['libraryDocuments'] ?? []) as $item) {
        if (!is_array($item) || !isset($item['id'])) {
            continue;
        }
        $libraryDocuments[] = [
            'id' => (string)$item['id'],
            'uploaded_by_id' => toNullableString($item['uploadedById'] ?? null),
            'name' => toNullableString($item['name'] ?? null),
            'category' => toNullableString($item['category'] ?? null),
            'uploaded_at' => toSqlDateTime($item['uploadedAt'] ?? null),
            'file_url' => toNullableString($item['fileUrl'] ?? null),
            'payload_json' => encodeJsonValue($item),
        ];
    }

    $messages = [];
    foreach (($state['messages'] ?? []) as $item) {
        if (!is_array($item) || !isset($item['id'])) {
            continue;
        }
        $messages[] = [
            'id' => (string)$item['id'],
            'sender_id' => toNullableString($item['senderId'] ?? null),
            'receiver_id' => toNullableString($item['receiverId'] ?? null),
            'timestamp_at' => toSqlDateTime($item['timestamp'] ?? null),
            'is_read' => !empty($item['isRead']) ? 1 : 0,
            'payload_json' => encodeJsonValue($item),
        ];
    }

    $meetings = [];
    foreach (($state['meetings'] ?? []) as $item) {
        if (!is_array($item) || !isset($item['id'])) {
            continue;
        }
        $meetings[] = [
            'id' => (string)$item['id'],
            'agent_id' => toNullableString($item['agentId'] ?? null),
            'user_id' => toNullableString($item['userId'] ?? null),
            'title' => toNullableString($item['title'] ?? null),
            'type' => toNullableString($item['type'] ?? null),
            'status' => toNullableString($item['status'] ?? null),
            'session_outcome' => toNullableString($item['sessionOutcome'] ?? null),
            'start_time' => toSqlDateTime($item['startTime'] ?? null),
            'duration' => isset($item['duration']) ? (int)$item['duration'] : null,
            'payload_json' => encodeJsonValue($item),
        ];
    }

    $payments = [];
    foreach (($state['payments'] ?? []) as $item) {
        if (!is_array($item) || !isset($item['id'])) {
            continue;
        }
        $payments[] = [
            'id' => (string)$item['id'],
            'user_id' => toNullableString($item['userId'] ?? null),
            'amount' => isset($item['amount']) ? (float)$item['amount'] : null,
            'currency' => toNullableString($item['currency'] ?? null),
            'status' => toNullableString($item['status'] ?? null),
            'method' => toNullableString($item['method'] ?? null),
            'payment_date' => toSqlDateTime($item['date'] ?? null),
            'description' => toNullableString($item['description'] ?? null),
            'payload_json' => encodeJsonValue($item),
        ];
    }

    $notifications = [];
    foreach (($state['notifications'] ?? []) as $item) {
        if (!is_array($item) || !isset($item['id'])) {
            continue;
        }
        $notifications[] = [
            'id' => (string)$item['id'],
            'user_id' => toNullableString($item['userId'] ?? null),
            'type' => toNullableString($item['type'] ?? null),
            'title' => toNullableString($item['title'] ?? null),
            'is_read' => !empty($item['isRead']) ? 1 : 0,
            'link_tab' => toNullableString($item['linkTab'] ?? null),
            'timestamp_at' => toSqlDateTime($item['timestamp'] ?? null),
            'payload_json' => encodeJsonValue($item),
        ];
    }

    $pdo->beginTransaction();
    try {
        upsertRowsAndPrune($pdo, 'users', $users);
        upsertRowsAndPrune($pdo, 'agencies', $agencies);
        upsertRowsAndPrune($pdo, 'documents', $documents);
        upsertRowsAndPrune($pdo, 'library_documents', $libraryDocuments);
        upsertRowsAndPrune($pdo, 'messages', $messages);
        upsertRowsAndPrune($pdo, 'meetings', $meetings);
        upsertRowsAndPrune($pdo, 'payments', $payments);
        upsertRowsAndPrune($pdo, 'notifications', $notifications);

        saveStateKv($pdo, 'destinations', is_array($state['destinations'] ?? null) ? $state['destinations'] : []);
        saveStateKv($pdo, 'currencies', is_array($state['currencies'] ?? null) ? $state['currencies'] : []);
        saveStateKv($pdo, 'selectedCurrency', $state['selectedCurrency'] ?? 'USD');
        saveStateKv($pdo, 'visaTypes', is_array($state['visaTypes'] ?? null) ? $state['visaTypes'] : []);
        saveStateKv($pdo, 'documentTypes', is_array($state['documentTypes'] ?? null) ? $state['documentTypes'] : []);
        saveStateKv($pdo, 'pipelineStages', is_array($state['pipelineStages'] ?? null) ? $state['pipelineStages'] : []);
        saveStateKv($pdo, 'gateways', is_array($state['gateways'] ?? null) ? $state['gateways'] : []);
        saveStateKv($pdo, 'themePreferenceByUser', is_array($state['themePreferenceByUser'] ?? null) ? $state['themePreferenceByUser'] : []);
        saveStateKv($pdo, 'notificationSettingsByUser', is_array($state['notificationSettingsByUser'] ?? null) ? $state['notificationSettingsByUser'] : []);
        saveStateKv($pdo, 'privacySettingsByUser', is_array($state['privacySettingsByUser'] ?? null) ? $state['privacySettingsByUser'] : []);
        saveStateKv($pdo, 'notificationSettings', is_array($state['notificationSettings'] ?? null) ? $state['notificationSettings'] : ['email' => true, 'push' => false, 'dashboardAlerts' => true, 'emailAlerts' => true]);
        saveStateKv($pdo, 'privacySettings', is_array($state['privacySettings'] ?? null) ? $state['privacySettings'] : ['profilePublic' => true]);
        saveStateKv($pdo, 'themePreference', in_array(($state['themePreference'] ?? null), ['light', 'dark', 'system'], true) ? $state['themePreference'] : 'light');
        saveStateKv($pdo, 'email_templates', is_array($state['email_templates'] ?? null) ? $state['email_templates'] : []);
        saveStateKv($pdo, 'emailjs_config', is_array($state['emailjs_config'] ?? null) ? $state['emailjs_config'] : ['serviceId' => '', 'templateId' => '', 'publicKey' => '', 'enabled' => false]);
        saveStateKv($pdo, 'queued_admin_notifications', is_array($state['queued_admin_notifications'] ?? null) ? $state['queued_admin_notifications'] : []);

        if ($writeLegacyMirror && shouldWriteLegacyMirror()) {
            writeLegacyStateMirror($pdo, buildNormalizedState($pdo));
        }

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

function migrateLegacyStateIfNeeded(PDO $pdo): void
{
    if (hasNormalizedData($pdo)) {
        return;
    }

    $legacy = readLegacyState($pdo);
    if (!is_array($legacy) || empty($legacy)) {
        return;
    }

    persistNormalizedState($pdo, $legacy, false);
}

function loadAppState(PDO $pdo): array
{
    migrateLegacyStateIfNeeded($pdo);
    return buildNormalizedState($pdo);
}

function saveAppState(PDO $pdo, array $state): void
{
    persistNormalizedState($pdo, $state, false);
}

function loadPaymentPayloadById(PDO $pdo, string $paymentId): ?array
{
    $stmt = $pdo->prepare('SELECT payload_json FROM payments WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $paymentId]);
    $row = $stmt->fetch();
    if (!$row || !isset($row['payload_json'])) {
        return null;
    }

    $decoded = json_decode((string)$row['payload_json'], true);
    return is_array($decoded) ? $decoded : null;
}

function upsertSinglePaymentPayload(PDO $pdo, array $payment): void
{
    if (!isset($payment['id']) || !is_string($payment['id']) || $payment['id'] === '') {
        throw new InvalidArgumentException('Payment id is required for upsert');
    }

    $row = [
        'id' => (string)$payment['id'],
        'user_id' => toNullableString($payment['userId'] ?? null),
        'amount' => isset($payment['amount']) ? (float)$payment['amount'] : null,
        'currency' => toNullableString($payment['currency'] ?? null),
        'status' => toNullableString($payment['status'] ?? null),
        'method' => toNullableString($payment['method'] ?? null),
        'payment_date' => toSqlDateTime($payment['date'] ?? null),
        'description' => toNullableString($payment['description'] ?? null),
        'payload_json' => encodeJsonValue($payment),
    ];

    $sql = 'INSERT INTO payments (id, user_id, amount, currency, status, method, payment_date, description, payload_json)
            VALUES (:id, :user_id, :amount, :currency, :status, :method, :payment_date, :description, :payload_json)
            ON DUPLICATE KEY UPDATE
              user_id = VALUES(user_id),
              amount = VALUES(amount),
              currency = VALUES(currency),
              status = VALUES(status),
              method = VALUES(method),
              payment_date = VALUES(payment_date),
              description = VALUES(description),
              payload_json = VALUES(payload_json)';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($row);
}

function updatePaymentStatusInState(PDO $pdo, string $paymentId, string $status, string $method, string $gatewayMessage, string $transactionId): ?array
{
    migrateLegacyStateIfNeeded($pdo);

    $payment = loadPaymentPayloadById($pdo, $paymentId);
    if ($payment === null) {
        return null;
    }

    $payment['status'] = $status;
    $payment['method'] = $method;
    $payment['gatewayMessage'] = $gatewayMessage;
    $payment['gatewayTransactionId'] = $transactionId;
    $payment['gatewayUpdatedAt'] = gmdate('c');

    upsertSinglePaymentPayload($pdo, $payment);
    return $payment;
}

function upsertPaymentInState(PDO $pdo, array $payment): void
{
    migrateLegacyStateIfNeeded($pdo);
    upsertSinglePaymentPayload($pdo, $payment);
}
