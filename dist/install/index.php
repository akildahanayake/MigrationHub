<?php

declare(strict_types=1);

const INSTALL_LOCK_FILE = __DIR__ . '/../config/install.lock';
const ENV_FILE = __DIR__ . '/../.env';

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function detectDefaultFrontendUrl(): string
{
    $https = (string)($_SERVER['HTTPS'] ?? '');
    $isHttps = $https !== '' && strtolower($https) !== 'off';
    $scheme = $isHttps ? 'https' : 'http';
    $host = (string)($_SERVER['HTTP_HOST'] ?? 'localhost');
    $path = (string)($_SERVER['SCRIPT_NAME'] ?? '/install/index.php');
    $basePath = rtrim(str_replace('\\', '/', dirname(dirname($path))), '/');
    if ($basePath === '') {
        return "{$scheme}://{$host}/";
    }
    return "{$scheme}://{$host}{$basePath}/";
}

function normalizeOrigin(string $url): string
{
    $parts = parse_url(trim($url));
    if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
        return '*';
    }

    $origin = strtolower((string)$parts['scheme']) . '://' . (string)$parts['host'];
    if (isset($parts['port'])) {
        $origin .= ':' . (int)$parts['port'];
    }
    return $origin;
}

function writeEnvFile(array $values): void
{
    $content = implode("\n", [
        'DB_HOST=' . $values['DB_HOST'],
        'DB_PORT=' . $values['DB_PORT'],
        'DB_NAME=' . $values['DB_NAME'],
        'DB_USER=' . $values['DB_USER'],
        'DB_PASS=' . $values['DB_PASS'],
        'APP_ALLOWED_ORIGIN=' . $values['APP_ALLOWED_ORIGIN'],
        'UPLOAD_MAX_MB=' . $values['UPLOAD_MAX_MB'],
        'FRONTEND_APP_URL=' . $values['FRONTEND_APP_URL'],
        'GATEWAY_SSL_VERIFY=' . $values['GATEWAY_SSL_VERIFY'],
        '',
    ]);

    if (@file_put_contents(ENV_FILE, $content, LOCK_EX) === false) {
        throw new RuntimeException('Could not write .env file. Check file permissions for public_html.');
    }
}

function createInstallLock(array $values): void
{
    $lockPayload = [
        'installed_at' => date('c'),
        'db_host' => $values['DB_HOST'],
        'db_port' => $values['DB_PORT'],
        'db_name' => $values['DB_NAME'],
        'db_user' => $values['DB_USER'],
    ];

    $json = json_encode($lockPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false || @file_put_contents(INSTALL_LOCK_FILE, $json, LOCK_EX) === false) {
        throw new RuntimeException('Install succeeded but lock file could not be created.');
    }
}

function runSqlBatch(PDO $pdo, string $sql): void
{
    $chunks = preg_split('/;\\s*(\\r?\\n|$)/', $sql);
    if (!is_array($chunks)) {
        throw new RuntimeException('Failed to parse SQL batch');
    }

    foreach ($chunks as $chunk) {
        $statement = trim($chunk);
        if ($statement === '') {
            continue;
        }
        $pdo->exec($statement);
    }
}

function installDatabase(array $values, bool $createDbIfMissing): void
{
    $host = $values['DB_HOST'];
    $port = $values['DB_PORT'];
    $name = $values['DB_NAME'];
    $user = $values['DB_USER'];
    $pass = $values['DB_PASS'];

    if ($createDbIfMissing) {
        if (!preg_match('/^[A-Za-z0-9_]+$/', $name)) {
            throw new RuntimeException('DB_NAME can only contain letters, numbers, and underscore when auto-create is enabled.');
        }

        $serverDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
        $serverPdo = new PDO($serverDsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    }

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_state (
            id TINYINT UNSIGNED PRIMARY KEY,
            state_json LONGTEXT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );

    $stmt = $pdo->prepare(
        'INSERT INTO app_state (id, state_json) VALUES (1, :state_json)
         ON DUPLICATE KEY UPDATE id = id'
    );
    $stmt->execute(['state_json' => '{}']);

    $migrationFile = __DIR__ . '/migrate_normalized.sql';
    if (is_file($migrationFile)) {
        $sql = file_get_contents($migrationFile);
        if ($sql === false) {
            throw new RuntimeException('Could not read migration file: install/migrate_normalized.sql');
        }
        runSqlBatch($pdo, $sql);
    }
}

function installDatabaseWithAdminBootstrap(
    array $values,
    bool $createDbIfMissing,
    bool $createAppDbUser,
    string $adminUser,
    string $adminPass
): void {
    $host = $values['DB_HOST'];
    $port = $values['DB_PORT'];
    $name = $values['DB_NAME'];
    $user = $values['DB_USER'];
    $pass = $values['DB_PASS'];

    $serverDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
    $serverPdo = new PDO($serverDsn, $adminUser, $adminPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    if ($createDbIfMissing) {
        if (!preg_match('/^[A-Za-z0-9_]+$/', $name)) {
            throw new RuntimeException('DB_NAME can only contain letters, numbers, and underscore when auto-create is enabled.');
        }
        $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    }

    if ($createAppDbUser) {
        if (!preg_match('/^[A-Za-z0-9_]+$/', $user)) {
            throw new RuntimeException('DB_USER can only contain letters, numbers, and underscore when auto-create user is enabled.');
        }
        if (!preg_match('/^[A-Za-z0-9_]+$/', $name)) {
            throw new RuntimeException('DB_NAME can only contain letters, numbers, and underscore when auto-grant is enabled.');
        }

        $quotedPass = $serverPdo->quote($pass);
        $serverPdo->exec("CREATE USER IF NOT EXISTS `{$user}`@`localhost` IDENTIFIED BY {$quotedPass}");
        $serverPdo->exec("GRANT ALL PRIVILEGES ON `{$name}`.* TO `{$user}`@`localhost`");
        $serverPdo->exec('FLUSH PRIVILEGES');
    }

    installDatabase($values, false);
}

$defaultFrontendUrl = detectDefaultFrontendUrl();
$defaults = [
    'DB_HOST' => 'localhost',
    'DB_PORT' => '3306',
    'DB_NAME' => 'migration_crm',
    'DB_USER' => 'mighub',
    'DB_PASS' => '',
    'UPLOAD_MAX_MB' => '10',
    'FRONTEND_APP_URL' => $defaultFrontendUrl,
    'APP_ALLOWED_ORIGIN' => normalizeOrigin($defaultFrontendUrl),
    'GATEWAY_SSL_VERIFY' => '1',
    'ADMIN_DB_USER' => '',
    'ADMIN_DB_PASS' => '',
];

$errors = [];
$success = '';
$submitted = $defaults;
$createDbIfMissing = true;
$bootstrapWithAdmin = false;
$createAppDbUser = false;

if (file_exists(INSTALL_LOCK_FILE)) {
    http_response_code(403);
    echo '<!doctype html><html><head><meta charset="utf-8"><title>Installer Locked</title></head><body>';
    echo '<h2>Installer is locked</h2>';
    echo '<p>This app has already been installed.</p>';
    echo '<p>Delete <code>config/install.lock</code> only if you intentionally want to reinstall.</p>';
    echo '</body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    foreach ($defaults as $key => $value) {
        $submitted[$key] = trim((string)($_POST[$key] ?? ''));
    }
    $createDbIfMissing = isset($_POST['CREATE_DB_IF_MISSING']);
    $bootstrapWithAdmin = isset($_POST['BOOTSTRAP_WITH_ADMIN']);
    $createAppDbUser = isset($_POST['CREATE_APP_DB_USER']);

    if ($submitted['DB_HOST'] === '') $errors[] = 'DB host is required.';
    if ($submitted['DB_PORT'] === '' || !ctype_digit($submitted['DB_PORT'])) $errors[] = 'DB port must be numeric.';
    if ($submitted['DB_NAME'] === '') $errors[] = 'DB name is required.';
    if ($submitted['DB_USER'] === '') $errors[] = 'DB user is required.';
    if ($submitted['UPLOAD_MAX_MB'] === '' || !ctype_digit($submitted['UPLOAD_MAX_MB'])) $errors[] = 'Upload max MB must be numeric.';
    if ($submitted['FRONTEND_APP_URL'] === '' || filter_var($submitted['FRONTEND_APP_URL'], FILTER_VALIDATE_URL) === false) {
        $errors[] = 'Frontend app URL must be a valid URL.';
    }
    if ($submitted['APP_ALLOWED_ORIGIN'] === '') {
        $errors[] = 'Allowed origins cannot be empty. Use * or comma-separated origins.';
    }
    if (!in_array($submitted['GATEWAY_SSL_VERIFY'], ['0', '1'], true)) {
        $errors[] = 'Gateway SSL verify must be 0 or 1.';
    }
    if ($bootstrapWithAdmin) {
        if ($submitted['ADMIN_DB_USER'] === '') $errors[] = 'Admin DB user is required when admin bootstrap is enabled.';
        if ($submitted['ADMIN_DB_PASS'] === '') $errors[] = 'Admin DB password is required when admin bootstrap is enabled.';
    }

    if (empty($errors)) {
        try {
            if ($bootstrapWithAdmin) {
                installDatabaseWithAdminBootstrap(
                    $submitted,
                    $createDbIfMissing,
                    $createAppDbUser,
                    $submitted['ADMIN_DB_USER'],
                    $submitted['ADMIN_DB_PASS']
                );
            } else {
                installDatabase($submitted, $createDbIfMissing);
            }
            // If left empty somehow, keep a sane fallback tied to the frontend URL.
            if (trim($submitted['APP_ALLOWED_ORIGIN']) === '') {
                $submitted['APP_ALLOWED_ORIGIN'] = normalizeOrigin($submitted['FRONTEND_APP_URL']);
            }
            writeEnvFile($submitted);
            createInstallLock($submitted);
            $success = 'Installation completed successfully. You can now open your app.';
        } catch (Throwable $e) {
            $errors[] = $e->getMessage();
            if ($bootstrapWithAdmin) {
                $errors[] = 'Your host may block CREATE USER/GRANT from web scripts. On GoDaddy shared hosting, create DB/user in cPanel if this persists.';
            }
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MigrateHub Installer</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f4f6f8; color: #1e2430; }
    .wrap { max-width: 760px; margin: 28px auto; background: #fff; border: 1px solid #d5dbe3; border-radius: 8px; padding: 24px; }
    h1 { margin-top: 0; }
    label { display: block; margin-top: 12px; font-weight: 600; }
    input { width: 100%; box-sizing: border-box; margin-top: 4px; padding: 10px; border: 1px solid #b8c2cf; border-radius: 6px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .hint { color: #4f5d73; font-size: 13px; margin-top: 6px; }
    .actions { margin-top: 18px; }
    button { background: #1363df; color: #fff; border: 0; border-radius: 6px; padding: 10px 16px; cursor: pointer; }
    .err { background: #fff2f2; border: 1px solid #f3b7b7; color: #8d1b1b; padding: 10px; border-radius: 6px; margin-top: 14px; }
    .ok { background: #eefcf3; border: 1px solid #91d6aa; color: #1f6b38; padding: 10px; border-radius: 6px; margin-top: 14px; }
    code { background: #f0f3f7; padding: 2px 5px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>MigrateHub First-Time Installer</h1>
    <p>Use this once on your PHP/MySQL server to configure the app and initialize the database.</p>

    <?php if (!empty($errors)): ?>
      <div class="err">
        <strong>Setup failed:</strong>
        <ul>
          <?php foreach ($errors as $error): ?>
            <li><?= h($error) ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    <?php endif; ?>

    <?php if ($success !== ''): ?>
      <div class="ok">
        <strong><?= h($success) ?></strong>
        <p>Next steps:</p>
        <p>1. Open <code>../api/health.php</code> to verify DB status.</p>
        <p>2. Open your app URL.</p>
        <p>3. Leave installer locked (default), or remove <code>install/</code> for extra hardening.</p>
      </div>
    <?php else: ?>
      <form method="post">
        <div class="row">
          <div>
            <label for="DB_HOST">DB Host</label>
            <input id="DB_HOST" name="DB_HOST" value="<?= h($submitted['DB_HOST']) ?>" autocomplete="off" required>
          </div>
          <div>
            <label for="DB_PORT">DB Port</label>
            <input id="DB_PORT" name="DB_PORT" value="<?= h($submitted['DB_PORT']) ?>" inputmode="numeric" autocomplete="off" required>
          </div>
        </div>

        <div class="row">
          <div>
            <label for="DB_NAME">DB Name</label>
            <input id="DB_NAME" name="DB_NAME" value="<?= h($submitted['DB_NAME']) ?>" autocomplete="off" required>
          </div>
          <div>
            <label for="DB_USER">DB User</label>
            <input id="DB_USER" name="DB_USER" value="<?= h($submitted['DB_USER']) ?>" autocomplete="username" required>
          </div>
        </div>

        <label for="DB_PASS">DB Password</label>
        <input id="DB_PASS" name="DB_PASS" type="password" value="<?= h($submitted['DB_PASS']) ?>" autocomplete="current-password">

        <div class="row">
          <div>
            <label for="UPLOAD_MAX_MB">Upload Max MB</label>
            <input id="UPLOAD_MAX_MB" name="UPLOAD_MAX_MB" value="<?= h($submitted['UPLOAD_MAX_MB']) ?>" inputmode="numeric" autocomplete="off" required>
          </div>
          <div>
            <label for="GATEWAY_SSL_VERIFY">Gateway SSL Verify</label>
            <input id="GATEWAY_SSL_VERIFY" name="GATEWAY_SSL_VERIFY" value="<?= h($submitted['GATEWAY_SSL_VERIFY']) ?>" inputmode="numeric" autocomplete="off" required>
          </div>
        </div>

        <label for="FRONTEND_APP_URL">Frontend App URL</label>
        <input id="FRONTEND_APP_URL" name="FRONTEND_APP_URL" value="<?= h($submitted['FRONTEND_APP_URL']) ?>" autocomplete="url" required>
        <div class="hint">Example: <code>https://your-domain.com/your-app/</code></div>

        <label for="APP_ALLOWED_ORIGIN">Allowed Origins (CORS)</label>
        <input id="APP_ALLOWED_ORIGIN" name="APP_ALLOWED_ORIGIN" value="<?= h($submitted['APP_ALLOWED_ORIGIN']) ?>" autocomplete="off" required>
        <div class="hint">Use comma-separated origins. Example: <code>https://mydomain.com,https://www.mydomain.com,https://*.mydomain.com</code></div>

        <label style="font-weight: normal; margin-top: 16px;">
          <input type="checkbox" name="CREATE_DB_IF_MISSING" <?= $createDbIfMissing ? 'checked' : '' ?> style="width:auto; margin-right:8px;">
          Attempt to create database if missing (disable if your host blocks CREATE DATABASE)
        </label>

        <label style="font-weight: normal; margin-top: 12px;">
          <input type="checkbox" name="BOOTSTRAP_WITH_ADMIN" <?= $bootstrapWithAdmin ? 'checked' : '' ?> style="width:auto; margin-right:8px;">
          Use admin MySQL account to bootstrap DB/user/password (optional)
        </label>

        <div class="row">
          <div>
            <label for="ADMIN_DB_USER">Admin DB User</label>
            <input id="ADMIN_DB_USER" name="ADMIN_DB_USER" value="<?= h($submitted['ADMIN_DB_USER']) ?>" autocomplete="username">
          </div>
          <div>
            <label for="ADMIN_DB_PASS">Admin DB Password</label>
            <input id="ADMIN_DB_PASS" name="ADMIN_DB_PASS" type="password" value="<?= h($submitted['ADMIN_DB_PASS']) ?>" autocomplete="current-password">
          </div>
        </div>

        <label style="font-weight: normal; margin-top: 12px;">
          <input type="checkbox" name="CREATE_APP_DB_USER" <?= $createAppDbUser ? 'checked' : '' ?> style="width:auto; margin-right:8px;">
          Also create app DB user and grant privileges (requires high DB privileges)
        </label>

        <div class="actions">
          <button type="submit">Install Now</button>
        </div>
      </form>
      <p class="hint">After install, this page will auto-lock using <code>config/install.lock</code>.</p>
    <?php endif; ?>
  </div>
</body>
</html>
