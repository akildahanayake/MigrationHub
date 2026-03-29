param(
  [string]$OutputRoot = "deploy/godaddy/public_html",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (-not $SkipBuild) {
  Write-Host "Building frontend..."
  npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed. Fix the build error or rerun with -SkipBuild to package existing dist/."
  }
} else {
  Write-Host "Skipping frontend build. Packaging existing dist/ output."
}

$dest = Join-Path $repoRoot $OutputRoot
if (Test-Path $dest) {
  Remove-Item -Recurse -Force $dest
}
New-Item -ItemType Directory -Path $dest -Force | Out-Null

Write-Host "Copying frontend dist..."
Copy-Item -Path "dist/*" -Destination $dest -Recurse -Force

Write-Host "Copying backend API and runtime files..."
Copy-Item -Path "backend/api" -Destination (Join-Path $dest "api") -Recurse -Force
Copy-Item -Path "backend/config" -Destination (Join-Path $dest "config") -Recurse -Force
Copy-Item -Path "backend/install" -Destination (Join-Path $dest "install") -Recurse -Force
New-Item -ItemType Directory -Path (Join-Path $dest "uploads") -Force | Out-Null
if (Test-Path "backend/uploads/.htaccess") {
  Copy-Item -Path "backend/uploads/.htaccess" -Destination (Join-Path $dest "uploads/.htaccess") -Force
}
if (Test-Path "backend/uploads/index.html") {
  Copy-Item -Path "backend/uploads/index.html" -Destination (Join-Path $dest "uploads/index.html") -Force
}
Copy-Item -Path "backend/database.mysql.sql" -Destination (Join-Path $dest "database.mysql.sql") -Force

$rootHtaccess = @'
RewriteEngine On

# Protect environment/hidden files
<FilesMatch "^(\.env|\.git|\.htaccess)">
  Require all denied
</FilesMatch>

# Send SPA routes to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
'@
Set-Content -Path (Join-Path $dest ".htaccess") -Value $rootHtaccess -NoNewline

$envTemplate = @'
DB_HOST=localhost
DB_PORT=3306
DB_NAME=migration_crm
DB_USER=mighub
DB_PASS=mighub130581
APP_ALLOWED_ORIGIN=*
UPLOAD_MAX_MB=10
FRONTEND_APP_URL=https://your-domain.com/your-app/
GATEWAY_SSL_VERIFY=1
LEGACY_APP_STATE_MIRROR=0
AUTO_SCHEMA_MANAGE=0
'@
Set-Content -Path (Join-Path $dest ".env.example") -Value $envTemplate -NoNewline

Write-Host "Creating deployment zip..."
$zipPath = Join-Path $repoRoot "deploy/godaddy/public_html.zip"
if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}
Compress-Archive -Path (Join-Path $dest "*") -DestinationPath $zipPath

Write-Host "Done. Upload the CONTENTS of '$dest' (or public_html.zip extract) into GoDaddy public_html."
