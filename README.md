# 🎓 TuonTa — AI-Powered Civil Service Examination (CSE) Reviewer

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Groq AI](https://img.shields.io/badge/AI-Groq_Cloud-F55036?style=flat)](https://groq.com/)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?style=flat&logo=playwright)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **TuonTa** (Cebuano/Visayan for *"Let's Study"*) is an intelligent, offline-resilient Civil Service Examination (CSE) preparation platform. Engineered for Filipino civil service examinees, TuonTa combines deterministic exam grading, offline-first execution, and pedagogical AI remediation into a fast, accessible, and delightful study companion.

---

## ✨ Key Features

### 🎯 1. Realistic CSE Mock Exam Simulators
- **Official Examination Levels:** Full support for both **Professional** (170 items, 3 hours 10 minutes) and **Subprofessional** (165 items, 2 hours 40 minutes) exam formats.
- **Strict Timers & Auto-Submit:** Client-side countdown timers powered by Zustand with background interval synchronization and automatic submission upon expiry.
- **Deterministic Grading Engine:** Non-AI, deterministic scoring logic (`evaluateExamPerformance`) ensuring objective scoring, percentile computation, and strict adherence to the 80% passing threshold.

### ⚡ 2. Offline-First Resilience
- **IndexedDB via Dexie.js:** Complete local offline persistence for active exam sessions, question buffers, and user answers.
- **Zero Data Loss on Dropouts:** Resume exams seamlessly during network interruptions.
- **Background Sync Queue:** Automatically detects online reconnection and securely flushes local cached exam attempts to Supabase with transactional idempotency.

### 🤖 3. AI Personalized Reviewer & Weakness Diagnostic
- **Powered by Groq Cloud:** High-throughput LLM reasoning analyzing test attempts, item difficulties, and subject competencies.
- **Topic Mastery Classification:** Automatically categorizes domains into `Mastered`, `Strong`, `Needs Improvement`, or `Priority Review`.
- **Pedagogical Remediation:** Step-by-step conceptual breakdowns (identifying principles, applying formulas, explaining traps) without simply giving away raw answers.
- **Resilient AI Fallbacks:** Built-in retry loops and graceful degradation if upstream LLM services experience rate limits or outages.

### 📓 4. Mistake Notebook & Targeted Practice
- **Deduplicated Question Review:** Mistake aggregation grouping multiple failed attempts on the same question, displaying attempt history and explanations.
- **Targeted Practice Mode:** Quick, high-impact 15-question diagnostic quizzes focused strictly on topics flagged for `PRIORITY_REVIEW`.
- **Spaced Review Tracking:** Tracks ease factors, repetition counts, and scheduled review intervals.

### 📑 5. Offline Study Guide PDF Exporter
- Client-side dynamic PDF compilation via `@react-pdf/renderer`.
- Generate and download structured, printable revision kits containing key concepts, examples, and diagnostic analysis.

### 🛡️ 6. Admin QA Gatekeeper & Question Bank
- **Role-Based Access Control (RBAC):** Dedicated administrative routes guarded by NextAuth middleware.
- **Zod-Validated AI Generator:** Automated question drafting with strict Zod schema validation before saving to the database.
- **QA Workflow:** Inspect, approve, reject, or edit draft questions before they enter the public question pool.

### 🐱 7. Engagement & Gamification
- **WebGL Animated Mascot:** Hardware-accelerated 2D waving cat companion rendered with Pixi.js.
- **Study Streaks & Badges:** Gamified badges for consistency, high scores, and topic mastery.
- **Motivational Context:** Randomized, hydration-safe study hacks and motivational quotes to ease exam anxiety.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | React Server Components, server actions, dynamic routing |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict static type checking |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) | Accessible components with custom glassmorphism design |
| **Masot & Graphics** | [Pixi.js](https://pixijs.com/) & [Framer Motion](https://www.framer.com/motion/) | WebGL hardware acceleration & smooth micro-interactions |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Client-side timer state and offline answer buffering |
| **Offline DB** | [Dexie.js](https://dexie.org/) | IndexedDB wrapper for offline exam caching |
| **Database & ORM** | [Supabase](https://supabase.com/) & [Prisma ORM](https://www.prisma.io/) | PostgreSQL multi-schema database (`auth` and `public`) |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) | Session handling, bcrypt hashing, and role guards |
| **AI Inference** | [Groq SDK](https://console.groq.com/) | High-speed LLM processing with structured Zod schemas |
| **PDF Generation** | [@react-pdf/renderer](https://react-pdf.org/) | Client-side vector PDF document rendering |
| **Testing** | [Playwright](https://playwright.dev/) | End-to-end user flows, exam journeys, and resilience tests |

---

## 📂 Project Structure

```text
TuonTa/
├── prisma/
│   ├── schema.prisma              # Database schema (auth & public schemas)
│   └── prisma.config.ts           # Prisma configuration
├── public/                        # Static assets, icons, and illustrations
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── admin/                 # Admin QA Gatekeeper & Question Bank
│   │   ├── api/                   # REST API routes (auth, exams, ai, questions)
│   │   ├── dashboard/             # Learner dashboard & progress overview
│   │   ├── login/ & register/     # Authentication flows
│   │   ├── onboarding/            # Exam level & target date setup
│   │   ├── resources/             # Civil service reference materials
│   │   └── test-center/           # Full exam runner, targeted practice, results
│   ├── components/
│   │   ├── admin/                 # QA dashboard tables, modals, uploaders
│   │   ├── dashboard/             # Badges, streak metrics, WebGL cat mascot
│   │   ├── exam/                  # Timer, question display, navigation sidebar
│   │   ├── mistakes/              # Deduplicated mistake notebook & AI tutor
│   │   ├── pdf/                   # React-PDF printable study guide templates
│   │   └── ui/                    # Shadcn UI primitives & interaction wrappers
│   ├── hooks/                     # Custom hooks (timer, offline sync, media query)
│   ├── lib/                       # Utility libraries, Prisma client, scoring engine
│   ├── store/                     # Zustand state stores (exam session, timer)
│   └── types/                     # Shared TypeScript interfaces & types
├── tests/                         # Playwright E2E and resilience test suites
├── .env.example                   # Sanitized environment variable template
├── .gitignore                     # Git ignore rules for build, secrets, and cache
├── LICENSE                        # MIT Open Source License
├── package.json                   # Project scripts and dependencies
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.17.0 or higher
- **npm** (v9+), **pnpm**, or **yarn**
- **PostgreSQL Database** (recommended: [Supabase](https://supabase.com/))
- **Groq Cloud API Key** (register at [console.groq.com](https://console.groq.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/TuonTa.git
cd TuonTa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your connection details:

```bash
cp .env.example .env
```

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Transaction-mode pooled connection URL (IPv4 / Supabase pgBouncer) | `postgresql://postgres.[REF]:[PASS]@...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct connection URL for migrations and schema synchronization | `postgresql://postgres.[REF]:[PASS]@...:5432/postgres` |
| `AUTH_SECRET` | NextAuth secret used to encrypt session tokens (`npx auth secret`) | 32-character random string |
| `NEXTAUTH_URL` | Public base URL of the application | `http://localhost:3000` |
| `GROQ_API_KEY` | Groq API Key for LLM-powered diagnostics and question drafting | `gsk_...` |

### 4. Initialize Database & Generate Prisma Client

Push the schema to your PostgreSQL database and generate the Prisma Client:

```bash
npx prisma generate
npx prisma db push
```

### 5. Launch the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js local development server with Turbopack/HMR |
| `npm run build` | Compiles the production build |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs Next.js ESLint rules across all files |
| `npx tsc --noEmit` | Runs strict TypeScript type checking without emitting files |
| `npx playwright test` | Executes the end-to-end test suite |
| `npx playwright show-report` | Opens the interactive HTML test report |

---

## 🧪 Testing & Quality Assurance

TuonTa includes comprehensive end-to-end tests using Playwright:

```bash
# Run all tests headlessly
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Test the exam simulation flow
npx playwright test tests/exam-flow.spec.ts

# Test AI service resilience and fallback handling
npx playwright test tests/ai-resilience.spec.ts
```

---

## 🔒 Security & Privacy

- **Environment Hygiene:** Private keys, secrets, and connection strings are strictly kept in `.env` and excluded from version control via `.gitignore`.
- **Role-Based Access Control:** Administrative endpoints (`/admin/*` and `/api/admin/*`) require verified `ADMIN` role privileges validated server-side.
- **LLM Boundary Protection:** AI tutors are constrained with strict prompt guards and Zod schema validations to prevent prompt injections and off-topic outputs.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
