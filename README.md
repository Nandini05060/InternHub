# 🎓 InternHub — Internship Discovery & Tracking Platform
> A production-grade college Software Engineering full-stack web application designed to eliminate fake, duplicate, and expired internship listings with verified applications and an interactive faculty test demonstration suite.

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-73%2F73%20Passing%20(100%25)-emerald.svg)](TEST_CASES_DOCUMENT.md)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 📌 Problem Statement & Core Value Proposition

**The Problem:** College students struggle to find legitimate internships and convert them into placements because listings are scattered, applications are tracked chaotically, and resumes fail automated ATS screeners due to poor formatting, missing keywords, and unquantified bullet points.

**The Solution:** **InternHub** is a comprehensive student career preparation and verified internship platform:
1. **Administrative Verification Gate:** Listings are vetted by administrators before appearing in student search.
2. **Direct Official Career Links:** Students apply exclusively through verified employer career portals.
3. **Interactive Kanban Application Tracker:** Real-time stage tracking (`Saved`, `Applied`, `Under Review`, `Interview`, `Offer`, `Rejected`, `Withdrawn`) with personal notes.
4. **ATS-Friendly Resume Builder:** 4 compliant single-column templates (ATS Minimal, Software Developer, Fresher, Internship) with single-page fitting and selectable-text vector PDF export.
5. **Objective Resume Analyzer & Keyword Matcher:** 0–100 ATS readiness audit assessing contact details, section completeness, action verbs, XYZ measurable impact, and JD keyword coverage.
6. **Multi-Version Resume Management:** Create, clone, customize, and link specific resume versions to individual internship applications.
7. **Transparent Internship Compatibility Index:** Explainable match score calculating exact skill overlap and listing skills to develop.
8. **Placement Preparation Hub:** Categorized checklists for DSA, Core CS, Aptitude, and HR interviews with dynamic progress tracking.
9. **Skills & Certifications Tracker:** Track credentials, verify license URLs, and access curated free roadmaps.
10. **Interview Practice Rehearsal:** Curated role-specific technical and behavioral questions with model answers and answer drafting.
11. **Private Document Vault:** Secure student storage for transcripts, recommendation letters, and certificates.
12. **Automated Approaching Deadline Reminders:** In-app notification engine alerting students without spam.
13. **Faculty Test Case Dashboard (`/test-cases`):** Live execution dashboard displaying 44 cataloged test cases (73 automated assertions), Pass/Fail metrics, CSV export, and Viva Presentation Mode.

---

## 📑 Software Engineering Project Documentation

Complete documentation is available in the workspace:

| Document | Description |
|---|---|
| **[TRACEABILITY_MATRIX.md](TRACEABILITY_MATRIX.md)** | Bidirectional matrix mapping Requirements → Frontend Page → Backend API → Database Table → Test Case ID |
| **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** | High-level architecture, 3-tier diagrams, Mermaid ER diagram, and security architecture |
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | Complete RESTful API specification with request schemas, responses, and status codes |
| **[TEST_CASES_DOCUMENT.md](TEST_CASES_DOCUMENT.md)** | Complete test catalog preserving exact specification PDF requirements, BVA analysis, and actual results |

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18.3, Vite 5.4, JavaScript (ES6+), React Router DOM v6 |
| **Styling & UI** | Tailwind CSS v3.4, Lucide React Icons, Inter Typography |
| **Backend API** | Node.js (ES Modules), Express.js 4.19, CORS, Morgan |
| **Database** | MySQL 8.0 with `mysql2/promise` connection pooling & prepared statements (plus in-memory fallback) |
| **Authentication** | Bcrypt password hashing + JSON Web Tokens (JWT) with HTTP Bearer Auth |
| **Frontend Testing** | Vitest + React Testing Library + `@testing-library/jest-dom` + jsdom |
| **Backend Testing** | Vitest + Supertest integration tests |

---

## 🔑 Demo & Faculty Evaluation Accounts

For rapid demonstration during college faculty viva, pre-seeded accounts are ready to use with 1-click quick-fill buttons on the login page:

| Role | Email | Password | Pre-configured Data & Role |
|---|---|---|---|
| **PDF Test User** | `testuser@email.com` | `Pass123!` | Exact account from faculty test specification PDF |
| **Demo Student** | `student@internhub.com` | `Student@123` | B.Tech CSE, 3 Applications, 4 Bookmarks, Deadline Alerts |
| **Demo Admin** | `admin@internhub.com` | `Admin@123` | Full administrative moderation, review queue, student controls |

---

## 🚀 Installation & Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MySQL**: 8.0+ (Optional; built-in high-fidelity in-memory store activates if MySQL is offline)

### 2. Install Dependencies
From the repository root:
```bash
npm run install:all
```

### 3. Environment Variables
Verify or edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=internhub_super_secret_jwt_key_2026_college_se_project
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=internhub_db
DB_CONNECTION_LIMIT=10
CLIENT_URL=http://localhost:5173
```

### 4. Database Setup (If using MySQL)
```bash
npm run db:init
npm run db:seed
```

### 5. Launch Application
```bash
npm run dev
```
- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Faculty Test Dashboard**: [http://localhost:5173/test-cases](http://localhost:5173/test-cases)

---

## 🧪 Automated Testing & Faculty Demonstration Suite

InternHub includes 12 automated test suites with **73 passing automated test assertions** (100% pass rate).

### Run All Tests
```bash
npm test
```

### Run Individual Suites
```bash
# Run 50 Backend API & Security Tests (Supertest)
npm run test:server

# Run 23 Frontend Component & Spec Tests (React Testing Library)
npm run test:client
```

### Build for Production
```bash
npm run build
```

---

## 🎯 Faculty Viva Demonstration Guide

Follow this recommended 5-step walkthrough during your evaluation:

### Step 1: Open the Test Case Dashboard (`/test-cases`)
1. Click **"Test Cases"** in the top navigation bar.
2. Review the summary metrics cards: **31 Total Tests, 31 Executed, 31 Passed (100%), 0 Regressions**.
3. Use category filters: *Positive Scenarios*, *Negative Scenarios*, *UI & Usability*, *Boundary Value Analysis*.
4. Click **"Export CSV Report"** to demonstrate downloadable faculty reporting.
5. Click **"Viva Presentation Mode"** to demonstrate the focused, distraction-free test case viewer with keyboard navigation (`Left`/`Right` arrow keys).

### Step 2: Demonstrate Login & Usability Spec Cases (`TC_LGN_01` – `08`)
1. Navigate to `/login`.
2. **`TC_LGN_02` (Password Visibility Toggle):** Type a password and click the eye icon to switch between masked and plaintext.
3. **`TC_LGN_07` (Keyboard Focus Order):** Press the `Tab` key sequentially: Email (`tabIndex 1`) → Password (`tabIndex 2`) → Sign In (`tabIndex 3`) → Forgot Password (`tabIndex 4`).
4. **`TC_LGN_05` (Empty & Format Validation):** Click "Sign In" with empty fields to show required validation; enter an invalid email format to show pattern validation.
5. **`TC_LGN_06` (15-Minute Account Lockout):** Enter wrong passwords 5 consecutive times to trigger the server-enforced security lockout:
   - Alert displays: *"Account locked for 15 minutes due to too many failed attempts."*
   - Shows dev reset button for rapid evaluation reset.
6. **`TC_LGN_01` & `08` (Valid Login & Enter Submission):** Use the 1-click **PDF Test User** button (`testuser@email.com` / `Pass123!`) and press Enter to authenticate.

### Step 3: Demonstrate Password Boundary Value Analysis (`TC_PWD_BVA_01` – `06`)
1. Navigate to `/register`.
2. Demonstrate real-time password policy validation (8–15 characters, uppercase, number, symbol):
   - Length 7 (`Ab1!xyz`): **Rejected** (Lower boundary - 1)
   - Length 8 (`Ab1!xyzw`): **Accepted** (Lower boundary)
   - Length 9 (`Ab1!xyzwa`): **Accepted** (Lower boundary + 1)
   - Length 14 (`Ab1!xyzwaBcDeF`): **Accepted** (Upper boundary - 1)
   - Length 15 (`Ab1!xyzwaBcDeFg`): **Accepted** (Upper boundary)
   - Length 16 (`Ab1!xyzwaBcDeFgh`): **Rejected** (Upper boundary + 1)
3. Confirm that accepted passwords are stored as cryptographic bcrypt hashes, never plaintext.

### Step 4: Demonstrate Student Workflow & Guardrails
1. **Explore Internships (`/internships`):** Search by keyword, filter by work mode (Remote/Hybrid/On-site), filter by domain.
2. Note that unverified listings (ID 9) and expired listings (ID 10) are strictly excluded from student discovery.
3. **Profile Completeness Gate (`TC_APP_01`):** Check profile completion percentage. Students cannot apply if required fields are missing.
4. **Application Pipeline (`/student/dashboard`):** Apply to an active internship; open official career link; transition status (`Applied` → `Under Review` → `Interview` → `Offer`).

### Step 5: Demonstrate Admin Moderation Console (`/admin`)
1. Log in as `admin@internhub.com` / `Admin@123`.
2. Inspect executive metrics (Active listings, pending reviews, expired count, student registrations).
3. Post a new internship and verify it.
4. Suspend a student account (`TC_ADM_02`) to verify instant access revocation.

---

## 📂 Project Directory Structure

```
SE/
├── package.json               # Root monorepo scripts (dev, test, build)
├── README.md                  # Project documentation & viva guide
├── TRACEABILITY_MATRIX.md     # Requirements Traceability Matrix (RTM)
├── SYSTEM_ARCHITECTURE.md     # System architecture & Mermaid ER diagrams
├── API_DOCUMENTATION.md       # Complete REST API specification
├── TEST_CASES_DOCUMENT.md     # Test case specifications & execution report
├── server/
│   ├── package.json           # Express, mysql2, bcryptjs, jsonwebtoken, supertest
│   ├── .env                   # Configuration & environment variables
│   ├── database/
│   │   ├── schema.sql         # Relational MySQL DDL schema
│   │   └── seed.sql           # Initial dataset with testuser@email.com / Pass123!
│   ├── src/
│   │   ├── utils/
│   │   │   └── passwordPolicy.js # Shared 8-15 char password policy
│   │   ├── services/
│   │   │   └── reminderService.js# Automated approaching deadline reminder engine
│   │   ├── db/
│   │   │   ├── mysql.js       # MySQL connection pool
│   │   │   ├── repository.js  # Clean data repository pattern
│   │   │   └── mockData.js    # Pre-seeded dataset
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT token verification & RBAC
│   │   │   └── validator.js   # Request validation & lockout rules
│   │   └── routes/
│   │       ├── auth.routes.js        # Auth, lockout, reset endpoints
│   │       ├── internship.routes.js  # Discovery & filter endpoints
│   │       ├── application.routes.js # Pipeline tracking endpoints
│   │       ├── bookmark.routes.js    # Save/unsave bookmarks
│   │       ├── notification.routes.js# Deadline reminders
│   │       ├── admin.routes.js       # Moderation & student directory
│   │       └── testRunner.routes.js  # Live test results & execution API
│   └── tests/
│       ├── auth.test.js          # TC_LGN_01, 03, 04, 05, 06 (Lockout)
│       ├── password-bva.test.js  # TC_PWD_BVA_01 to 06
│       ├── applications.test.js  # TC_APP_01 to 05, Bookmarks
│       ├── admin.test.js         # TC_SEC_01, TC_ADM_01, 02
│       ├── internships.test.js   # TC_INT_01, 02, 03
│       └── notifications.test.js # TC_NOT_01
└── client/
    ├── package.json           # React 18, Vite 5, TailwindCSS, Vitest
    ├── vite.config.js         # Vite configuration with proxy & vitest
    ├── tailwind.config.js     # Warm white palette & shadow tokens
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx  # User session & profile state
    │   │   └── ToastContext.jsx # Toast notification alert system
    │   ├── pages/
    │   │   ├── LandingPage.jsx         # Hero, features, FAQs
    │   │   ├── LoginPage.jsx           # Spec tests TC_LGN_01 to 08
    │   │   ├── RegisterPage.jsx        # Live BVA password validator
    │   │   ├── ExplorePage.jsx         # Search & filter discovery
    │   │   ├── InternshipDetailPage.jsx# Role specifications & apply link
    │   │   ├── StudentDashboardPage.jsx# Application pipeline & Kanban
    │   │   ├── ProfilePage.jsx         # Completeness percentage & resume
    │   │   ├── AdminDashboardPage.jsx  # Moderation console
    │   │   └── TestCaseDashboardPage.jsx# Interactive Faculty Viva Dashboard
    │   └── test/
    │       ├── App.test.jsx
    │       ├── Login.test.jsx
    │       ├── PasswordBVA.test.jsx
    │       └── TestCaseDashboard.test.jsx
```

---

## 🔒 Known Limitations & Future Enhancements

1. **Email SMTP Adapter:** The project currently implements a development-mode notification adapter. For real-world production deployment, configure SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) to enable external email delivery.
2. **OAuth 2.0 Social Login:** Future updates can integrate Google / GitHub Single Sign-On (SSO) alongside JWT authentication.
3. **Resume Parsing via NLP:** Future iterations could leverage AI/NLP parsing to automatically extract skills from uploaded PDF resumes.

---

## 📜 License & Academic Integrity
Developed as a Software Engineering College Capstone Project. Released under the [MIT License](LICENSE).
