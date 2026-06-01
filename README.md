# 🇳🇬 JAMB CBT Portal

A full-featured Computer-Based Test platform built with **Next.js 14**, **Tailwind CSS**, **Supabase**, and **Nodemailer (Gmail)**.

Two parallel flows exist:
- **Invite flow** — Admin sends email → student clicks link → picks subjects → sits exam immediately. No account needed.
- **Registered flow** — Student creates account with JAMB reg number → picks subjects → sits exam → views results on dashboard.

---

## 📁 Complete Folder Structure

```
jamb-cbt/                              ← project root
│
├── .env.local.example                 ← copy to .env.local and fill in values
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
├── middleware.ts                      ← route protection + session refresh
│
├── types/
│   └── database.ts                   ← TypeScript types for every Supabase table
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← browser Supabase client (use in 'use client' files)
│   │   └── server.ts                 ← server Supabase client (use in Server Components only)
│   └── email/
│       ├── mailer.ts                 ← Nodemailer Gmail transporter
│       └── templates.ts              ← HTML email template (invite link email)
│
├── components/
│   ├── auth/
│   │   └── LogoutButton.tsx          ← sign-out button (client component)
│   └── exam/
│       └── ExamRegistrationCard.tsx  ← dashboard card: pick combination + start exam
│
├── app/
│   ├── globals.css                   ← Tailwind directives + custom utility classes
│   ├── layout.tsx                    ← root layout (Inter font, metadata)
│   ├── page.tsx                      ← landing page (/)
│   │
│   ├── invite/
│   │   └── page.tsx                  ← (/invite) name + email form → triggers Gmail invite
│   │
│   ├── access/
│   │   └── page.tsx                  ← (/access?token=xxx) validates token → combination picker
│   │
│   ├── guest-exam/
│   │   └── page.tsx                  ← (/guest-exam?session=xxx) full timed exam (no auth)
│   │
│   ├── guest-results/
│   │   └── page.tsx                  ← (/guest-results?session=xxx) score + breakdown (no auth)
│   │
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx              ← (/auth/login) sign in with reg number + password
│   │   ├── register/
│   │   │   └── page.tsx              ← (/auth/register) full registration form
│   │   └── callback/
│   │       └── route.ts              ← (/auth/callback) Supabase OAuth/email callback
│   │
│   ├── dashboard/
│   │   └── page.tsx                  ← (/dashboard) candidate home — profile + exam status
│   │
│   ├── exam/
│   │   └── page.tsx                  ← (/exam) registered-user timed CBT exam
│   │
│   ├── results/
│   │   └── page.tsx                  ← (/results) registered-user score + breakdown
│   │
│   └── api/
│       ├── send-invite/
│       │   └── route.ts              ← POST /api/send-invite — generates token + sends Gmail
│       ├── guest-answer/
│       │   └── route.ts              ← POST /api/guest-answer — saves one answer in real time
│       └── guest-submit/
│           └── route.ts              ← POST /api/guest-submit — scores exam + marks submitted
│
└── supabase/
    └── migrations/
        ├── 001_schema.sql            ← all tables, RLS policies, triggers
        ├── 002_seed_questions.sql    ← 96 JAMB-style questions (12 × 8 subjects)
        └── 003_invite_access_token.sql ← token columns + guest_sessions tables
```

---

## 🚀 Setup Instructions

### Step 1 — Clone and install

```bash
git clone https://github.com/your-username/jamb-cbt.git
cd jamb-cbt
npm install
```

---

### Step 2 — Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and click **New Project**
2. Once created, go to **Settings → API**
3. Copy your:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public key** (long JWT string)

---

### Step 3 — Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in every value:

```env
# ── Supabase ──────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key

# ── App URL ───────────────────────────────────────────────────────
# Use http://localhost:3000 for local dev
# Change to your real domain when deploying e.g. https://jambcbt.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Gmail / Nodemailer ────────────────────────────────────────────
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

> **How to get your Gmail App Password:**
> 1. Go to [myaccount.google.com](https://myaccount.google.com)
> 2. Security → 2-Step Verification → enable it
> 3. Security → App Passwords → select Mail → Generate
> 4. Copy the 16-character code (with or without spaces)

---

### Step 4 — Run database migrations

Open your **Supabase Dashboard → SQL Editor → New Query** and run each file below **in order**:

#### 4a. Run `supabase/migrations/001_schema.sql`
Creates all tables, Row Level Security policies, and triggers:
- `profiles` — candidate personal details
- `subjects` — available exam subjects (auto-seeded)
- `questions` — exam questions
- `exam_registrations` — registered user subject combinations
- `exam_sessions` — registered user exam sessions
- `exam_answers` — registered user answers
- `subject_results` — registered user per-subject scores
- `invite_leads` — email leads from the invite form
- `guest_sessions` — guest exam sessions (invite flow)
- `guest_answers` — guest answers
- `guest_subject_results` — guest per-subject scores

#### 4b. Run `supabase/migrations/002_seed_questions.sql`
Seeds 12 JAMB-style questions for each of these 8 subjects:
English Language, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature in English

#### 4c. Run `supabase/migrations/003_invite_access_token.sql`
Adds `access_token`, `expires_at`, `token_used_at` columns to `invite_leads` and creates the three guest tables.

---

### Step 5 — Disable email confirmation in Supabase

> ⚠️ This step is required. Without it, the registered-user sign-up will fail.

1. Supabase Dashboard → **Authentication → Settings**
2. Scroll to **Email Auth**
3. Uncheck **"Enable email confirmations"**
4. Click **Save**

This is safe because our app uses JAMB reg numbers as identifiers, not real emails — so email confirmation has no purpose here.

---

### Step 6 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗺️ Page Routes Reference

| URL | Who uses it | What it does |
|-----|------------|--------------|
| `/` | Everyone | Landing page with Register, Sign In, and invite link CTA |
| `/invite` | Public | Enter name + email → receive Gmail with exam access link |
| `/access?token=xxx` | Invite students | Validates token → subject combination picker |
| `/guest-exam?session=xxx` | Invite students | Full 30-min timed exam (no account needed) |
| `/guest-results?session=xxx` | Invite students | Score out of 400 + per-subject breakdown |
| `/auth/register` | New candidates | Create account with reg number + password + subject combo |
| `/auth/login` | Registered candidates | Sign in with JAMB reg number + password |
| `/dashboard` | Registered (logged in) | Profile, exam status, result preview |
| `/exam` | Registered (logged in) | Full 30-min timed exam |
| `/results` | Registered (logged in) | Score out of 400 + per-subject breakdown |

---

## 🔄 The Two Exam Flows

### Flow A — Invite Link (no account needed)

```
Admin visits /invite
    ↓
Enters student's name + email
    ↓
Server generates secure token → saves to Supabase → sends Gmail
    ↓
Student clicks "Start My Exam Now" in email
    ↓
/access?token=xxx
  → token valid   → subject combination picker
  → token expired → error page + "Request new link" button
  → already done  → redirect to their results
    ↓
Student picks course group (Science/Commercial/Arts) + 3 electives
    ↓
Clicks "Start 30-Minute Exam Now"
  → guest_session created in Supabase
  → redirect to /guest-exam?session=xxx
    ↓
30-minute timed exam
  → answers saved in real time to guest_answers table
  → timer expires → auto-submit
  → or student submits manually
    ↓
/guest-results?session=xxx
  → total score out of 400
  → per-subject score bars
  → JAMB cut-off comparison
  → printable result slip
```

### Flow B — Registered Candidate

```
/auth/register
  → personal details + password + subject combination
  → Supabase account created (reg_number@jambcbt.local as internal email)
  → immediate sign-in → /dashboard
    ↓
/dashboard
  → profile details
  → confirm subject combination
  → click "Start Examination Now"
    ↓
/exam
  → 30-minute timed exam
  → answers saved to exam_answers table
    ↓
/results
  → score out of 400
  → per-subject breakdown
  → printable result slip
```

---

## 🗄️ Database Tables Overview

| Table | Flow | Purpose |
|-------|------|---------|
| `profiles` | Registered | Candidate personal details (linked to auth.users) |
| `subjects` | Both | Available subjects — seeded automatically |
| `questions` | Both | Exam questions (12 per subject) |
| `exam_registrations` | Registered | Chosen subject combination |
| `exam_sessions` | Registered | Exam session — timer, score, submission |
| `exam_answers` | Registered | Per-question answers |
| `subject_results` | Registered | Computed per-subject score |
| `invite_leads` | Invite | Email leads + unique access token |
| `guest_sessions` | Invite | Guest exam session — combination, score |
| `guest_answers` | Invite | Guest per-question answers |
| `guest_subject_results` | Invite | Guest per-subject score |

---

## 🔒 Authentication Notes

- Registered users sign in with: **JAMB Reg Number + Password**
- Internally we store the auth email as `<regnumber>@jambcbt.local` — Supabase auth works normally, students never see or type an email to log in
- Invite-flow students need **no account at all** — their session is tracked by `guest_sessions.id` in the URL
- All tables have **Row Level Security (RLS)** — users can only access their own data
- Guest tables use open policies since they are written to only by server-side API routes

---

## 📧 Gmail Setup (Nodemailer)

The invite email is sent via your personal or organisational Gmail account using an **App Password** (not your regular Gmail password).

Required `.env.local` values:
```env
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

The email contains:
- A personalised greeting with the student's first name
- A large **"Start My Exam Now"** button linking to `/access?token=xxx`
- A step-by-step "what to expect" section
- A plain-text fallback link
- 7-day expiry notice

---

## 🚢 Deploying to Vercel

```bash
npm run build   # confirm it builds cleanly first
```

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Add all environment variables from `.env.local` in the Vercel project settings
4. Update **Supabase → Authentication → Settings → Site URL** to your production domain
5. Deploy

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase GoTrue |
| Email | Nodemailer + Gmail |
| Language | TypeScript |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 📝 Key Development Notes

- **Never import `lib/supabase/server.ts` inside a `'use client'` file.** It uses `next/headers` which is server-only. Use `lib/supabase/client.ts` in client components instead.
- **Guest API routes** (`/api/guest-answer`, `/api/guest-submit`) do not require Supabase auth — they write to the guest tables using the anon key. This is safe because RLS allows all operations and the session ID is validated server-side.
- **`/access`, `/guest-exam`, `/guest-results`** are intentionally excluded from auth middleware so invite students can access them without any account.
- The **30-minute timer** runs client-side but answers are saved to Supabase on every selection, so refreshing the page resumes the exam from where the student left off.