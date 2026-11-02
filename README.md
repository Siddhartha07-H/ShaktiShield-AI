# 🛡️ SHAKTISHIELD AI - Women's Safety & Emergency Intelligence Platform

> **An intelligent, responsive, full-stack women's safety web platform equipped with one-tap emergency SOS, real-time GPS tracking, cryptographic SHA-256 tamper-proof incident ledgers, and AI-assisted situational hazard assessment.**

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Executive Overview

**SHAKTISHIELD AI** is designed from scratch to solve the critical friction points women face during personal emergencies:
1. **Seconds Count:** In panic, unlocking phones, dialing numbers, and reading street addresses is impossible. One tap captures coordinates, logs cryptographic evidence, and activates emergency protocols.
2. **Evidentiary Rigor:** Many legal cases falter because digital logs are questioned. Every incident in ShaktiShield AI is stamped with a canonical **SHA-256 cryptographic digest** and anchored to an audit chain to guarantee digital evidence integrity.
3. **Situational Intelligence:** A heuristic AI risk evaluation engine assesses ambient variables (time of day, lighting, pedestrian density, reported distress) to provide tactical precautions and safety checklists.
4. **Transparent Governance:** Never misrepresents automated police dispatch. Clear Demo Mode banners explain system status, while direct click-to-dial links immediately connect users to India's unified **112** helpline.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **🚨 One-Tap Emergency SOS** | High-precision browser geolocation capture, sub-second incident code generation, audio-visual feedback, and cancellation options. |
| **👥 Trusted Guardian Circle** | Add, edit, and designate primary emergency contacts with one-touch phone dialer links. |
| **📍 Live Location Sharing** | Time-limited (15m, 30m, 1h, 2h) auto-expiring GPS tracking sessions with shareable URLs and Google Maps links. |
| **🧠 AI Situational Risk Engine** | Evaluates lighting, crowd density, location type, and user feelings to output risk tiers (LOW, MODERATE, HIGH, CRITICAL), hazards, and actionable checklists. |
| **🔒 SHA-256 Tamper Detection** | Canonical JSON hashing ensures database records cannot be altered post-incident without triggering cryptographic mismatch warnings. |
| **⛓️ Modular Blockchain Layer** | Decoupled blockchain service interface ready for EVM (Polygon Amoy / Ethereum) smart contract anchoring. |
| **🇮🇳 India Emergency Directory** | Comprehensive directory of verified official helplines: **112** (National Emergency), **1091** (Women Helpline), **181** (Women in Distress), **1930** (Cyber Crime), state-wise police cells, and statutory legal rights under Indian law. |
| **🛡️ Admin Command Center** | Executive dashboard displaying platform metrics, registered user roster, incident status triage controls, and immutable audit logs. |

---

## 🛠️ Technology Stack

### Frontend
- **Library:** React 18 with TypeScript
- **Tooling:** Vite 5
- **Styling:** Vanilla Tailwind CSS (Custom Purple & Deep Navy Glassmorphic Design System)
- **Icons:** Lucide React
- **Routing:** React Router v6 (Public, Protected, and Admin route guards)

### Backend
- **Framework:** Python FastAPI
- **Validation:** Pydantic v2 & Pydantic-Settings
- **ORM:** SQLAlchemy 2.0 with connection pooling
- **Password Security:** Argon2id (`argon2-cffi`)
- **Token Security:** PyJWT with HS256 digital signatures
- **Rate Limiting:** Sliding-window in-memory rate limiter on sensitive endpoints

### Database & Deployment
- **Database:** PostgreSQL (Production on Supabase, zero-friction local SQLite fallback)
- **Migrations:** Alembic versioned migrations
- **Frontend Hosting:** Vercel (Single-Page Application rewrite rules)
- **Backend Hosting:** Vercel Python Serverless Runtime (`@vercel/python`)
- **Containers:** Docker and Docker Compose

---

## 📁 Project Folder Structure

```
ShaktiShield-AI/
├── frontend/
│   ├── public/
│   │   └── logo.svg                 # Brand SVG logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Responsive navigation header
│   │   │   ├── Footer.tsx           # Footer with helpline ticker
│   │   │   ├── DemoBanner.tsx       # Hackathon demo disclaimer banner
│   │   │   ├── ProtectedRoute.tsx   # Auth guard
│   │   │   ├── AdminRoute.tsx       # Admin role guard
│   │   │   ├── Modal.tsx            # Accessible modal dialog
│   │   │   └── RiskBadge.tsx        # Risk level indicator
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # Global auth & session management
│   │   │   └── ToastContext.tsx     # Animated notifications
│   │   ├── pages/                   # All 17 platform pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── FeaturesPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── EmergencySOSPage.tsx
│   │   │   ├── TrustedContactsPage.tsx
│   │   │   ├── LiveLocationPage.tsx
│   │   │   ├── IncidentHistoryPage.tsx
│   │   │   ├── SafetyResourcesPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── PrivacyPolicyPage.tsx
│   │   │   ├── TermsPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   └── AdminDashboardPage.tsx
│   │   ├── services/
│   │   │   └── api.ts               # Fetch client with JWT injection
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── App.tsx                  # Master routing configuration
│   │   ├── index.css                # Tailwind directives & design tokens
│   │   └── main.tsx                 # React DOM mount
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── vercel.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py              # Register, login, me, profile
│   │   │   ├── contacts.py          # Trusted contacts CRUD
│   │   │   ├── sos.py               # SOS trigger, cancel, history
│   │   │   ├── location.py          # Live tracking sessions & pings
│   │   │   ├── ai_safety.py         # Environmental risk scoring
│   │   │   ├── integrity.py         # SHA-256 verification & tamper tests
│   │   │   └── admin.py             # Telemetry, triage, audit logs
│   │   ├── core/
│   │   │   ├── config.py            # App settings (Pydantic v2)
│   │   │   ├── security.py          # Argon2id hashing & JWT tokens
│   │   │   ├── rate_limit.py        # Sliding-window rate limiter
│   │   │   └── audit.py             # Audit log utility
│   │   ├── database/
│   │   │   ├── session.py           # SQLAlchemy engine & sessionmaker
│   │   │   └── base.py              # Models registry
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── ai_service.py        # Heuristic risk calculation engine
│   │   │   ├── integrity_service.py # SHA-256 canonical hashing
│   │   │   ├── blockchain_service.py# Modular Web3 anchor interface
│   │   │   └── notification_service.py # Alert dispatcher
│   │   └── main.py                  # FastAPI entrypoint with auto-seeding
│   ├── tests/                       # Complete Pytest test suite
│   ├── alembic/                     # Alembic database migrations
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── vercel.json                  # Vercel backend serverless config
│   └── api/
│       └── index.py                 # Vercel serverless entrypoint
│
├── docs/                            # Deep-dive engineering guides
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_VERCEL_SUPABASE.md
│   └── BLOCKCHAIN_INTEGRITY.md
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server with live reload
uvicorn app.main:app --reload --port 8000
```
Backend will start on `http://localhost:8000`.  
API documentation is available at `http://localhost:8000/docs`.

> **Note on Seeding:** Upon first run, the backend automatically creates tables and safely seeds demo accounts so you can immediately explore the platform without manually setting up test data:
> - **Demo User:** `demo@shaktishield.ai` / `DemoPass123!`
> - **Safety Admin:** `admin@shaktishield.ai` / `AdminPass123!`

### 3. Frontend Setup

In a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing and Quality Verification

### Run Backend Test Suite
The backend contains a test suite covering authentication, contacts, SOS triggers, SHA-256 tamper verification, AI risk scoring, and admin authorization:

```bash
cd backend
python -m pytest tests/
```
All tests execute and pass in ~1.3 seconds.

### Verify Frontend Production Build
To verify TypeScript compilation and asset bundling:

```bash
cd frontend
npm run build
```
Generates a minified, production-ready bundle in `frontend/dist/`.

---

## 🐳 Running via Docker Compose

Run the entire full-stack platform (PostgreSQL database, FastAPI backend, and Nginx frontend) with one command:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🌐 Supabase & Vercel Deployment

For complete step-by-step instructions with environment variable lists, see [docs/DEPLOYMENT_VERCEL_SUPABASE.md](docs/DEPLOYMENT_VERCEL_SUPABASE.md).

### Summary:
1. **Database:** Create a project on [Supabase](https://supabase.com). Copy connection string:
   `postgresql+psycopg2://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres`
2. **Backend (Vercel):** Deploy `backend/` with `@vercel/python`. Set `DATABASE_URL`, `JWT_SECRET`, and `DEMO_MODE=True`.
3. **Frontend (Vercel):** Deploy `frontend/` as a Vite app. Set `VITE_API_URL` to your backend Vercel URL.
4. **Database Migrations:** Run `alembic upgrade head` from `backend/`.

---

## 🔐 Security Principles

1. **Password Hashing:** Passwords are never stored in plain-text. Hashed using **Argon2id** (`time_cost=2`, `memory_cost=19456`, `parallelism=1`).
2. **Access Control:** Role-Based Access Control (RBAC) separates regular users from platform administrators.
3. **Rate Limiting:** Sliding-window rate limiters prevent brute-force attacks on login and spam triggers on emergency SOS.
4. **Data Minimization:** Location tracking is initiated only with explicit user permission and automatically terminated upon session expiration.
5. **Safe Logging:** Sensitive tokens and passwords are never output to audit logs.

---

## ⚠️ Known Limitations & Future Roadmap

- **External Telecom Integration:** Real SMS and WhatsApp alerts to emergency contacts require verified third-party API credentials (e.g. Twilio or Fast2SMS). The platform clearly displays Demo Mode when credentials are not configured.
- **Smart Contract Deployment:** The blockchain layer produces cryptographic roots and hashes today; future releases will anchor these directly to the Polygon Amoy testnet contract.
- **Audio Distress Triggers:** Future iterations will incorporate client-side Web Audio API models for offline panic keyword detection ("Help", "Bachao").

---

## 📜 License & Acknowledgments

Built with dedication to women's safety and technological empowerment.  
Released under the **MIT License**.
