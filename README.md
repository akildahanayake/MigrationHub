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
- **Super Admin:** Username: `akil` | Password: `eternals`
- **Clients/Agents:** Use the "Register" feature on the login screen.

---
Built by Expert Coding Assistant
