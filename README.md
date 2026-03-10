# Migration CRM - MigrateHub

Enterprise Migration Agency CRM built with React, Vite, Express, and PostgreSQL (Supabase).

## 🚀 Getting Started

### 1. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `src/db/schema.sql` and run it to set up your tables and initial data.
4. Go to **Project Settings > Database** and copy your **Connection String** (URI).

### 2. Environment Variables
Create a `.env` file in the root directory (or use the AI Studio Secrets panel):
```env
DATABASE_URL="your_supabase_postgresql_connection_string"
JWT_SECRET="your_random_secret_key"
```

### 3. Local Development
```bash
npm install
npm run dev
```

### 4. Vercel Deployment
This app is ready for Vercel deployment.
1. Push your code to GitHub.
2. Connect your repo to [Vercel](https://vercel.com/).
3. Add your environment variables (`DATABASE_URL`, `JWT_SECRET`) in the Vercel dashboard.
4. Vercel will automatically detect the build settings.

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Lucide Icons, Motion
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT & Bcrypt
