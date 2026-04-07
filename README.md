# MigrateHub - Enterprise Migration Agency CRM (SaaS)

MigrateHub is a professional, production-ready SaaS platform designed for Migration Agencies. It connects clients (students/migrants) with migration agents, providing secure document sharing, real-time communication, consultation scheduling, and financial management.

## 🚀 Key Features

- **Multi-Role RBAC:** Super Admin, Agency Admin, Agent (Instructor), and Client.
- **Vibrant Glassmorphism UI:** Modern SaaS aesthetic with full Light/Dark mode support.
- **Visa Pipeline Tracker:** Visual 7-stage progress tracking for visa applications.
- **Secure Document Center:** Categorized uploads with formal verification workflow.
- **Payment Gateway Integration:** Support for Stripe, PayPal, Bank Transfer, and Cash.
- **Consultation Scheduler:** Integrated meeting management for Zoom, Google Meet, and WhatsApp.
- **Full Agency Management:** Super Admin can manage multiple agencies and high-level settings.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **Icons:** Lucide React
- **Persistence:** SQL-Mock Engine (LocalStorage for Demo) / Ready for PostgreSQL
- **Design:** Glassmorphism with HSL Variable Theme System

## 📦 Production Deployment Instructions

### 1. Prerequisites
- Node.js (v18+)
- NPM or Yarn
- A web server (Nginx, Apache) or a hosting provider (Vercel, Netlify, AWS)

### 2. Environment Configuration
Create a `.env` file in the root directory for production credentials:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_PAYPAL_CLIENT_ID=...
```

### 3. Build for Production
Run the following command to generate the optimized `dist/` folder:
```bash
npm run build
```
This now prepares a deployable `dist/` that includes frontend output plus backend runtime files (`api/`, `config/`, `install/`, `uploads/`, `.htaccess`, `database.mysql.sql`, `.env.example`).

Important:
- If `backend/.env` exists, build packaging now also copies it to `dist/.env`.
- If you deploy manually, ensure a real `.env` file is present in your deployed app root (same level as `api/` and `config/`), otherwise DB defaults will be used.

### 4. Database Setup
1. Use the provided `database.sql` file located in the root directory.
2. Import the schema into your PostgreSQL database (e.g., Supabase, AWS RDS).
3. Update your backend connection string (Node.js/Express) to point to your live DB.

### 5. Hosting the Frontend
Upload the contents of the `dist/` folder to your web server. 
- **Nginx Config Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/migratehub/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔒 Security & Compliance
- **RBAC:** Strict role-based access control at the component and state level.
- **Audit Logs:** System activity is tracked (simulated in demo).
- **HTTPS:** Ensure your production server has an SSL certificate (Let's Encrypt).

## 🔑 Access Credentials (Demo)
- **Default Admin Login:** Username: `admin@admin.com` | Password: `admin123`
- **Clients/Agents:** Use the "Register" feature on the login screen.

---
Built by Expert Coding Assistant

## PHP + MySQL Backend Setup (New)

This project now includes a PHP backend in `backend/` that persists app state to MySQL.

1. Create the database/table:
```sql
SOURCE backend/database.mysql.sql;
```

2. Configure backend env:
- Copy `backend/.env.example` to `backend/.env`
- Update DB credentials (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`)

3. Start PHP API server from project root:
```bash
php -S localhost:8000 -t backend
```

4. Configure frontend env:
- Copy `.env.example` to `.env`
- Ensure:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

5. Start frontend:
```bash
npm run dev
```

Your React app will now:
- Load initial state from MySQL via `GET /api/state.php`
- Auto-save state changes to MySQL via `POST /api/state.php`

## File Upload API (New)

- `POST /api/upload.php`
  - Content-Type: `multipart/form-data`
  - Form field: `file`
  - Returns stored file metadata and safe file URL
- `GET /api/file.php?name=<storedName>`
  - Streams uploaded file securely by generated file id

Uploads are stored in `backend/uploads/` with randomized names and MIME/size validation.

## Database Architecture (Updated)

- The backend now uses **normalized MySQL tables** for core entities:
  - `users`, `agencies`, `documents`, `library_documents`, `messages`, `meetings`, `payments`, `notifications`, `state_kv`
- Legacy table `app_state` is kept as a compatibility mirror.
- API contract is unchanged (`GET/POST /api/state.php` still works), so frontend scope and behavior remain the same.

### Upgrade Existing Installations

If you already deployed with only `app_state`, run:

```sql
SOURCE backend/install/migrate_normalized.sql;
```

Then deploy the latest `backend/` files. On first request, the backend auto-migrates legacy JSON state into normalized tables.

## GoDaddy Shared Hosting

Use the deployment helper to produce a ready-to-upload `public_html` package:

```powershell
powershell -ExecutionPolicy Bypass -File .\\scripts\\prepare-godaddy.ps1
```

Then follow [deploy/godaddy/README.md](deploy/godaddy/README.md).

## Multi-Domain Hosting (Root, Subfolder, Subdomain)

This app supports hosting under all common URL structures with the same codebase:
- `https://www.mydomain.com`
- `https://www.mydomain.com/app/`
- `https://app.mydomain.com`

Use these settings in deployed `.env`:

```env
APP_ALLOWED_ORIGIN=https://mydomain.com,https://www.mydomain.com,https://*.mydomain.com
FRONTEND_APP_URL=https://www.mydomain.com/app/
```

Notes:
- `APP_ALLOWED_ORIGIN` accepts comma-separated origins and wildcard subdomains.
- `FRONTEND_APP_URL` is used as a fallback (for payment return URLs); when requests include `Origin`, backend prefers that dynamically.
- If you host in `/app/`, upload your built files into that subdirectory so `api/` is available under the same base path.

