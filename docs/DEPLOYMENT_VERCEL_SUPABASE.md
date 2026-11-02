# SHAKTISHIELD AI - VERCEL & SUPABASE DEPLOYMENT GUIDE

This guide provides exact step-by-step instructions for deploying the ShaktiShield AI full-stack platform.

---

## Part 1: Provision Supabase PostgreSQL Database

1. Sign in to [Supabase](https://supabase.com).
2. Click **New Project** and name it `shaktishield-db`.
3. Choose a strong database password and select your preferred region (e.g. `ap-south-1` for Mumbai).
4. Go to **Project Settings** &rarr; **Database** &rarr; **Connection String**.
5. Copy the **URI** connection string (select **Direct Connection** or **Transaction Pooler**):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
6. Update the scheme for SQLAlchemy:
   ```
   postgresql+psycopg2://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

---

## Part 2: Backend Deployment on Vercel

The backend includes a pre-configured `backend/vercel.json` and `backend/api/index.py` serverless entrypoint.

### Option A: Via Vercel CLI
```bash
cd backend
vercel login
vercel link
vercel env add DATABASE_URL
# Paste your Supabase connection string
vercel env add JWT_SECRET
# Paste a generated 64-char key (e.g. openssl rand -hex 32)
vercel env add DEMO_MODE
# Value: True
vercel --prod
```

### Option B: Via Vercel Web Dashboard
1. Push your repository to GitHub.
2. In Vercel, click **Add New Project** and import the GitHub repository.
3. Set **Root Directory** to `backend`.
4. Add the following **Environment Variables**:
   - `DATABASE_URL`: `postgresql+psycopg2://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - `JWT_SECRET`: `[YOUR-STRONG-RANDOM-SECRET]`
   - `DEMO_MODE`: `True`
5. Click **Deploy**.
6. Copy your deployed backend URL: `https://shaktishield-backend.vercel.app`.

---

## Part 3: Frontend Deployment on Vercel

1. In Vercel, click **Add New Project** and import the same repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://shaktishield-backend.vercel.app` (your backend URL from Part 2).
5. Click **Deploy**.
6. Your production frontend will be live at: `https://shaktishield.vercel.app`.

---

## Part 4: Running Database Migrations on Supabase

To apply versioned schema migrations to your Supabase instance:
```bash
cd backend
# Set DATABASE_URL to your Supabase PostgreSQL URI
set DATABASE_URL=postgresql+psycopg2://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
alembic upgrade head
```

The database tables (`users`, `trusted_contacts`, `sos_incidents`, `location_sessions`, `audit_logs`, `notifications`) and initial indexes are now deployed!
