<?php

declare(strict_types=1);

$envFile = __DIR__ . '/.env';
if (!file_exists($envFile)) {
    die("Missing backend/.env file. Copy backend/.env.example to backend/.env and update DB credentials.\n");
}

$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if ($lines === false) {
    die("Unable to read backend/.env\n");
}

foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
        continue;
    }

    [$key, $value] = explode('=', $line, 2);
    $key = trim($key);
    $value = trim($value);

    if ($key !== '') {
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

echo "Loaded backend/.env\n";
