# AI-Powered CSC Reviewer
**Product & Development Plan Roadmap & Technical Specification**

---

## 🗺️ Development Roadmap

### Phase 1: MVP Core (Completed / Actively Refining)
*   **Authentication & Access:** NextAuth implementation with role-based routing (Admin vs. User).
*   **Test Center:** Realistic CSE simulators covering Professional and Subprofessional levels, offline capability, and strict timers.
*   **Scoring Engine:** Deterministic grading isolated completely from AI hallucinations.
*   **AI Integration:** Weakness detection and Personalized Reviewer generation via the Groq API.
*   **Export Capabilities:** Downloadable PDF generation for offline study.

### Phase 2: Targeted Remediation (Current Focus)
*   **Admin QA Gatekeeper:** Internal dashboard to draft, review, and verify the question bank before public release.
*   **Targeted Practice:** Dynamic quizzes generated specifically from a user's `PRIORITY_REVIEW` topics.
*   **Mistake Notebook:** Aggregation of incorrectly answered questions for focused review.
*   **Offline Sync Queue:** Background synchronization pushing local Dexie.js data to Supabase.

### Phase 3: Engagement & Scaling (Pending)
*   **Curated Resources:** Searchable repository of CSC learning materials and cheat sheets.
*   **Gamification:** Study streaks, achievement badges, and readiness scores.
*   **Advanced AI:** AI Tutor chat, spaced repetition algorithms, and voice study modes.

---

## 🏗️ Technical Specification & Architecture

| Architectural Layer | Technology Stack | Implementation Status |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), TypeScript | Active |
| **UI & Styling** | Tailwind CSS, Shadcn UI, Custom Palette | Active |
| **State Management** | Zustand (Client timers), React Query | Active |
| **Offline Persistence** | Dexie.js (IndexedDB local caching) | Active |
| **Database & ORM** | Supabase (PostgreSQL), Prisma (Multi-schema) | Active |
| **Authentication** | NextAuth.js (Credentials Provider) | Active |
| **AI Processing** | Groq API (`openai/gpt-oss-20b`) | Active |
| **Document Export** | `@react-pdf/renderer` (Dynamic Import) | Active |

---

## ⚙️ I. Core Architecture & Infrastructure
*   **Progressive Web App (PWA) Foundation:** Offline-first architecture allowing users to take exams and view reviewers without an active internet connection, utilizing Service Workers and IndexedDB (Dexie.js).
*   **Database & ORM Layer:** Hosted on Supabase (PostgreSQL) and queried via Prisma ORM for type-safe relational data.
*   **Authentication & Security:** NextAuth.js credentials flow with bcrypt password hashing and Role-Based Access Control (RBAC) separating `USER` and `ADMIN` routes.
*   **State Management:** Zustand for high-frequency client state (exam timers, offline answer selection) and React Query/Next.js router for server-state caching.

---

## 📱 II. The Frontend Application (User Facing)

### 1. Authentication & Onboarding Flow
*   **Registration & Login (`LoginForm`, `RegisterForm`):** Secure entry points styled with the custom `csc-blue-light` palette.
*   **Exam Configuration (`OnboardingForm`):** The crucial onboarding step where users configure their Exam Level (Professional vs. Subprofessional) and Target Exam Date to tailor the question bank.

### 2. Central Dashboard
*   **Welcome Header:** Displays user name, target exam date, and a dynamic Offline Sync Status badge indicating pending local data.
*   **Performance Summary:** High-level metrics including overall average score, total tests completed, and current study streak.
*   **Subject Mastery List:** Visual progress bars categorizing subjects into Mastered, Strong, Needs Improvement, or Priority Review.
*   **AI Action Card:** A prominent module surfacing the AI's top study recommendation and the "Practice Weak Areas" trigger.

### 3. Test Center (The Exam Engine)
*   **Exam Layout (`ExamClientRunner`):** The primary offline-capable interface integrating the Zustand timer and auto-submit logic.
*   **Question Display (`QuestionDisplay`):** Renders the active question text, dynamic choices via fully-controlled Shadcn RadioGroup, and handles offline selection buffering.
*   **Exam Sidebar/Navigation (`ExamSidebar`):** A mobile-responsive palette displaying the countdown timer, mid-exam exit controls, and a dynamic grid of all questions color-coded by "Answered", "Unanswered", and "Current".
*   **Exam Controls (`ExamControls`):** Next/Previous navigation and the primary "Submit Exam" execution button.

### 4. Test Results & Analytics
*   **Score Overview:** Displays the deterministic final percentage, Pass/Fail status (target: 80%), and time management statistics.
*   **Granular Subject Breakdown:** Visualizing exactly which subjects dragged the score down or propelled it up.

### 5. AI Personalized Reviewer
*   **Reviewer Display (`AIReviewerDisplay`):** A tabbed interface rendering the LLM-generated JSON payload. Includes Topic Overviews, Key Concepts, Examples, and Common Traps. Features a graceful degradation "Retry AI Analysis" fallback.
*   **Targeted Practice Accordion:** A collapsible UI containing the AI-generated follow-up questions specific to the user's mistakes.
*   **Offline PDF Exporter:** Client-side dynamic generation of a printable study guide using `@react-pdf/renderer`.

### 6. Targeted Learning Tools
*   **Targeted Practice Mode:** A specialized mock exam generator that bypasses the full 170-item test and serves a concentrated 15-item quiz pulled exclusively from `PRIORITY_REVIEW` topics.
*   **Mistake Notebook:** An aggregated UI where users can review all historically failed questions, grouped by topic, featuring the correct answer and a detailed explanation.

---

## 🛠️ III. Administrative & Content Tools

### 1. Content QA Dashboard
*   **Verification Table (`QuestionQATable`):** A dynamic data grid allowing admins to bulk-select and verify incoming `DRAFT` questions.
*   **Inspection Modal (`QAInspectModal`):** A detailed, scroll-constrained view of a proposed question with "Approve & Verify" or "Reject" actions.
*   **Manual Uploader (`QuestionUploadForm`):** A secure form for administrators to manually input new CSC questions into the database.

### 2. AI Question Generator
*   **Generator Modal:** A tool allowing admins to request batches of new questions from the Groq API by specifying a Subject, Difficulty, and Level, injecting them directly into the `DRAFT` queue.

---

## 🧠 IV. Background Engines & Services
*   **Deterministic Scoring Engine:** A strict, non-AI TypeScript utility (`evaluateExamPerformance`) that calculates percentages, pass/fail booleans, and adjusts mastery thresholds objectively based on database records.
*   **RAG AI Pipeline:** The backend endpoint that passes the deterministic performance data and verified context from the database to the Groq API (`openai/gpt-oss-20b`) with strict JSON response schema enforcements.
*   **Offline Background Sync Manager:** A resilient service worker and React hook (`useOfflineSync`) combo that detects `navigator.onLine` events, securely pushing IndexedDB exam payloads to Supabase and handling database idempotency via upsert transactions.