# 🧪 InternHub — Software Engineering Test Case Specification & Execution Report

**Project Title:** InternHub — Full-Stack Internship Discovery & Application Tracking Platform  
**Evaluation:** College Software Engineering Project Viva & Demonstration  
**Testing Frameworks:** Vitest 1.6.1, Supertest 6.3.4, React Testing Library, jsdom  
**Total Automated Tests:** 73 Tests across 12 Test Suites (50 Server + 23 Client)  
**Catalog Test Cases:** 44 Rigorous Test Specifications  
**Execution Result:** 100% Passed (0 Failed, 0 Blocked, 0 Skipped)  

---

## 📊 1. Executive Test Execution Summary

| Metric | Value |
|---|---|
| **Total Test Cases Specified** | **44** |
| **Test Cases Executed** | **44 (100%)** |
| **Passed Test Cases** | **44 (100%)** |
| **Failed Test Cases** | **0 (0%)** |
| **Blocked Test Cases** | **0 (0%)** |
| **Automated Test Assertions** | **73 Passing Assertions** |
| **Test Execution Date** | October 2026 |
| **Execution Environment** | Node.js v20+, MySQL 8.0 / Mock Pool, React 18, Vitest |

---

## 🔐 2. Login & Usability Test Cases (From Specification PDF)

### TC_LGN_01 — Successful Login
- **Category:** Positive Scenarios
- **Description:** Verify that an active, registered user can authenticate with valid credentials and receive an active session.
- **Precondition:** An active, registered account exists with email `testuser@email.com` and password `Pass123!`.
- **Test Steps:**
  1. Navigate to the login page (`/login`).
  2. Enter the registered email: `testuser@email.com`.
  3. Enter the correct password: `Pass123!`.
  4. Click the "Sign In" button.
- **Test Data:**
  - Email: `testuser@email.com`
  - Password: `Pass123!`
- **Expected Result:** The user is authenticated (HTTP 200 OK with signed JWT token) and redirected to the student dashboard.
- **Actual Result:** HTTP 200 OK, token stored in `localStorage`, user state populated in `AuthContext`, redirected to `/student/dashboard`.
- **Status:** **PASS**

---

### TC_LGN_02 — Show/Hide Password
- **Category:** UI & Usability Scenarios
- **Description:** Verify that clicking the eye icon toggles the password input field between masked and plaintext states.
- **Precondition:** User is on the login page.
- **Test Steps:**
  1. Enter a password string into the password field.
  2. Click the eye icon button (`aria-label="Show password"`).
  3. Verify that the input's `type` attribute changes from `password` to `text`.
  4. Click the eye icon again (`aria-label="Hide password"`).
  5. Verify that the input's `type` attribute returns to `password`.
- **Test Data:** Password input value: `Pass123!`
- **Expected Result:** The password input switches between masked and visible states. The toggle button is accessible via keyboard and updates `aria-pressed`.
- **Actual Result:** Input switches `type="text"` and `type="password"`. Button correctly reflects `aria-pressed` and is operable via Tab and Space/Enter.
- **Status:** **PASS**

---

### TC_LGN_03 — Unregistered Username
- **Category:** Negative Scenarios
- **Description:** Verify that attempting to log in with an unregistered email address fails with a generic error message to prevent username enumeration.
- **Precondition:** No account exists with email `fakeuser@test.com`.
- **Test Steps:**
  1. Enter unregistered email: `fakeuser@test.com`.
  2. Enter arbitrary password: `Pass123!`.
  3. Click "Sign In".
- **Test Data:**
  - Email: `fakeuser@test.com`
  - Password: `Pass123!`
- **Expected Result:** Login fails with HTTP 401 Unauthorized and displays a generic message such as `"Invalid email or password."`.
- **Actual Result:** HTTP 401 Unauthorized returned with `{ success: false, message: "Invalid email or password." }`. No specific user existence leaked.
- **Status:** **PASS**

---

### TC_LGN_04 — Incorrect Password
- **Category:** Negative Scenarios
- **Description:** Verify that an invalid password for an existing account fails authentication without creating a session.
- **Precondition:** Account `testuser@email.com` exists.
- **Test Steps:**
  1. Enter registered email: `testuser@email.com`.
  2. Enter incorrect password: `WrongPass!`.
  3. Click "Sign In".
- **Test Data:**
  - Email: `testuser@email.com`
  - Password: `WrongPass!`
- **Expected Result:** Login fails with HTTP 401 Unauthorized, no JWT token is issued, and the generic error message is displayed.
- **Actual Result:** HTTP 401 Unauthorized, failed attempt counter incremented by 1, no token issued, generic message returned.
- **Status:** **PASS**

---

### TC_LGN_05 — Empty Fields & Format Validation
- **Category:** Negative Scenarios
- **Description:** Verify that submitting empty fields or invalid email formats prevents form submission and displays field-level validation errors.
- **Precondition:** User is on the login page.
- **Test Steps:**
  1. Leave email and password blank and submit.
  2. Verify that email-required and password-required validation messages appear.
  3. Enter an invalid email format (`not-an-email`) and submit.
  4. Verify that invalid email format validation appears.
- **Test Data:**
  - Scenario A: Email: `""`, Password: `""`
  - Scenario B: Email: `"invalid-email-string"`, Password: `"Pass123!"`
- **Expected Result:** Submission is prevented. Specific error text appears: `"Email is required"`, `"Password is required"`, and `"Please enter a valid email address"`.
- **Actual Result:** Client-side validation blocks network request and sets accessible error indicators. Backend also validates and returns HTTP 400 Bad Request.
- **Status:** **PASS**

---

### TC_LGN_06 — Server-Side Account Lockout (5 Failed Attempts / 15 Minutes)
- **Category:** Security & Lockout
- **Description:** Verify that 5 consecutive failed login attempts lock the account for 15 minutes, enforced on the server and resilient to page refresh.
- **Precondition:** Account `testuser@email.com` exists and is currently unlocked.
- **Test Steps:**
  1. Send 5 consecutive login requests with password `WrongPass!`.
  2. Attempt a 6th login request with the correct password `Pass123!`.
  3. Verify that access is denied with HTTP 423 Locked and message: `"Account locked for 15 minutes due to too many failed attempts."`.
  4. Advance time by 16 minutes (using `x-mock-time` header).
  5. Attempt login with valid credentials.
  6. Verify that login succeeds and lockout is cleared.
- **Test Data:**
  - Email: `testuser@email.com`
  - Attempts 1–5: `WrongPass!`
  - Attempt 6 (during lockout): `Pass123!`
  - Attempt 7 (after 16 mins): `Pass123!`
- **Expected Result:** After 5 failed attempts, HTTP 423 is returned with exact message. Server enforces lockout. Login succeeds after 15 minutes.
- **Actual Result:** HTTP 423 Locked returned on 5th and 6th attempts with exact message. With `x-mock-time` set to +16 minutes, HTTP 200 OK returned and failed attempts reset to 0.
- **Status:** **PASS**

---

### TC_LGN_07 — Accessible Keyboard Navigation Focus Sequence
- **Category:** UI & Usability Scenarios
- **Description:** Verify that pressing the Tab key traverses interactive elements in strict logical order: Email → Password → Sign In Button → Forgot Password Link.
- **Precondition:** User is on the login page with no initial field focus.
- **Test Steps:**
  1. Focus the Email input (`tabIndex="1"`).
  2. Press Tab to focus the Password input (`tabIndex="2"`).
  3. Press Tab to focus the Sign In button (`tabIndex="3"`).
  4. Press Tab to focus the Forgot Password link (`tabIndex="4"`).
- **Test Data:** Keyboard Tab key events.
- **Expected Result:** `document.activeElement` matches each element in the exact sequential order without skipping or jumping.
- **Actual Result:** Strict tabIndex sequence verified via Vitest DOM assertions: Email (`tabIndex="1"`) → Password (`tabIndex="2"`) → Submit Button (`tabIndex="3"`) → Forgot Password Link (`tabIndex="4"`).
- **Status:** **PASS**

---

### TC_LGN_08 — Enter Key Form Submission
- **Category:** UI & Usability Scenarios
- **Description:** Verify that pressing the Enter key inside the password input field submits the login form without duplicate event dispatch.
- **Precondition:** Valid credentials entered into the login fields.
- **Test Steps:**
  1. Enter `testuser@email.com` in email field.
  2. Enter `Pass123!` in password field.
  3. Focus the password field and press the Enter key (`{ key: 'Enter', code: 13 }`).
- **Test Data:** Email: `testuser@email.com`, Password: `Pass123!`, Key: `Enter`
- **Expected Result:** Form submits once, `login(email, password)` executes, and user is authenticated without accidental duplicate API calls.
- **Actual Result:** Form onSubmit handler fired cleanly, single API call dispatched, user authenticated.
- **Status:** **PASS**

---

## 📏 3. Password Boundary-Value Analysis (BVA)

**Specification:** Password length must be between 8 and 15 characters inclusive, and contain at least 1 uppercase letter (`A-Z`), 1 numeric digit (`0-9`), and 1 special character (`!@#$%^&*()_+\-=\[\]{}|;:,.<>?`).

| Test Case ID | Test Password | Length | Boundary Category | Expected Result | Actual Result | Status |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **TC_PWD_BVA_01** | `Ab1!xyz` | 7 | Lower Boundary - 1 | **Reject** (Too short) | HTTP 400 Bad Request; account not created | **PASS** |
| **TC_PWD_BVA_02** | `Ab1!xyzw` | 8 | Lower Boundary (Min) | **Accept** (Valid) | HTTP 201 Created; stored as bcrypt hash | **PASS** |
| **TC_PWD_BVA_03** | `Ab1!xyzwa` | 9 | Lower Boundary + 1 | **Accept** (Valid) | HTTP 201 Created; stored as bcrypt hash | **PASS** |
| **TC_PWD_BVA_04** | `Ab1!xyzwaBcDeF` | 14 | Upper Boundary - 1 | **Accept** (Valid) | HTTP 201 Created; stored as bcrypt hash | **PASS** |
| **TC_PWD_BVA_05** | `Ab1!xyzwaBcDeFg` | 15 | Upper Boundary (Max) | **Accept** (Valid) | HTTP 201 Created; stored as bcrypt hash | **PASS** |
| **TC_PWD_BVA_06** | `Ab1!xyzwaBcDeFgh` | 16 | Upper Boundary + 1 | **Reject** (Too long) | HTTP 400 Bad Request; account not created | **PASS** |

### Additional Cryptographic & Security Verification for BVA:
1. **Plaintext Check:** Confirmed database never stores passwords in plain text (`password.startsWith('$2b$10$')`).
2. **Registration Parity:** Confirmed identical validation logic in `client/src/pages/RegisterPage.jsx` and `server/src/utils/passwordPolicy.js`.

---

## 🛡️ 4. Additional Regression & Security Test Cases

### TC_REG_01 — Duplicate Email Registration Prevention
- **Category:** Negative Scenarios
- **Description:** Verify that attempting to register an account with an already registered email is rejected.
- **Test Data:** Email: `testuser@email.com`
- **Expected Result:** HTTP 409 Conflict with message `"An account with this email already exists."`.
- **Actual Result:** HTTP 409 Conflict returned; duplicate account prevented.
- **Status:** **PASS**

---

### TC_SEC_01 — Student Access to Admin Endpoint Blocked (RBAC)
- **Category:** Security / Authorization
- **Description:** Verify that a standard student JWT cannot access administrative moderation routes.
- **Test Steps:** Send `GET /api/admin/internships` with a valid Student JWT token.
- **Expected Result:** HTTP 403 Forbidden with `{ success: false, message: "Forbidden: Admin access required" }`.
- **Actual Result:** Express `requireAdmin` middleware intercepted request and returned HTTP 403.
- **Status:** **PASS**

---

### TC_SEC_02 — Unauthenticated Protected Route Access Blocked
- **Category:** Security / Authentication
- **Description:** Verify that accessing protected endpoints without an `Authorization` header is blocked.
- **Test Steps:** Send `GET /api/applications` without a Bearer token.
- **Expected Result:** HTTP 401 Unauthorized with `{ success: false, message: "Authentication required" }`.
- **Actual Result:** Express `verifyToken` middleware intercepted request and returned HTTP 401.
- **Status:** **PASS**

---

### TC_APP_01 — Incomplete Student Profile Blocks Application
- **Category:** Business Logic
- **Description:** Verify that a student with an incomplete profile (<60% or missing major/skills) cannot submit applications.
- **Test Steps:** Authenticate with a profile missing required fields and send `POST /api/applications` with `{ internshipId: 1 }`.
- **Expected Result:** HTTP 400 Bad Request with code `PROFILE_INCOMPLETE`.
- **Actual Result:** Server rejected application with HTTP 400 and message instructing user to complete their profile.
- **Status:** **PASS**

---

### TC_APP_02 — Applying to Unverified Listing Blocked
- **Category:** Business Logic / Integrity
- **Description:** Verify that students cannot apply to pending or unverified internships (ID 9).
- **Test Steps:** Send `POST /api/applications` with `{ internshipId: 9 }`.
- **Expected Result:** HTTP 400 Bad Request with code `UNVERIFIED_LISTING`.
- **Actual Result:** Server verified `verification_status !== 'verified'` and blocked application.
- **Status:** **PASS**

---

### TC_APP_03 — Applying to Expired Listing Blocked
- **Category:** Business Logic / Lifecycle
- **Description:** Verify that students cannot apply to expired internships (ID 10).
- **Test Steps:** Send `POST /api/applications` with `{ internshipId: 10 }`.
- **Expected Result:** HTTP 400 Bad Request with code `EXPIRED_LISTING`.
- **Actual Result:** Server verified `is_expired = true` and blocked application.
- **Status:** **PASS**

---

### TC_APP_04 — Duplicate Application Prevention
- **Category:** Data Integrity
- **Description:** Verify that submitting a second application for the same internship is rejected.
- **Test Steps:** Apply to internship ID 1 twice under the same student account.
- **Expected Result:** First attempt returns HTTP 201 Created; second attempt returns HTTP 409 Conflict (`DUPLICATE_APPLICATION`).
- **Actual Result:** Unique constraint and server check returned HTTP 409 Conflict.
- **Status:** **PASS**

---

### TC_APP_05 — Application Lifecycle Stage Transitions
- **Category:** Application Pipeline
- **Description:** Verify updating application stage from `Applied` to `Under Review` to `Interview` to `Offer`.
- **Test Steps:** Send `PATCH /api/applications/:id/stage` with new status and interview notes.
- **Expected Result:** HTTP 200 OK, stage updated in database, status history updated.
- **Actual Result:** HTTP 200 OK, updated stage persisted and reflected in Application Tracker Kanban.
- **Status:** **PASS**

---

### TC_INT_01 — Multi-Attribute Filter Query
- **Category:** Discovery / Search
- **Description:** Verify filtering by category (`Frontend`) and work mode (`Remote`).
- **Test Steps:** Send `GET /api/internships?category=Frontend&work_mode=Remote`.
- **Expected Result:** HTTP 200 OK returning only listings matching both criteria.
- **Actual Result:** HTTP 200 OK, exact filtered subset returned.
- **Status:** **PASS**

---

### TC_INT_02 — Unverified Listings Excluded from Student Discovery
- **Category:** Discovery / Security
- **Description:** Verify that unverified listings (pending review) do not appear in student discovery.
- **Test Steps:** Fetch `GET /api/internships` and verify no records with `verification_status !== 'verified'`.
- **Expected Result:** Pending internship ID 9 is absent from the response list.
- **Actual Result:** Response contains only verified listings; ID 9 excluded.
- **Status:** **PASS**

---

### TC_INT_03 — Expired Listings Excluded from Student Discovery
- **Category:** Discovery / Lifecycle
- **Description:** Verify that expired listings do not appear in active student search.
- **Test Steps:** Fetch `GET /api/internships` and verify no records with `is_expired = true`.
- **Expected Result:** Expired internship ID 10 is absent from the response list.
- **Actual Result:** Response contains only active listings; ID 10 excluded.
- **Status:** **PASS**

---

### TC_BKM_01 — Bookmark Nonexistent Internship Blocked
- **Category:** Bookmarking
- **Description:** Verify that saving an invalid internship ID returns a 404 error.
- **Test Steps:** Send `POST /api/bookmarks` with `{ internshipId: 99999 }`.
- **Expected Result:** HTTP 404 Not Found (`INTERNSHIP_NOT_FOUND`).
- **Actual Result:** HTTP 404 Not Found returned.
- **Status:** **PASS**

---

### TC_BKM_02 — Duplicate Bookmark Prevention
- **Category:** Bookmarking
- **Description:** Verify that saving an already bookmarked internship returns HTTP 409 Conflict.
- **Test Steps:** Save internship ID 1 twice.
- **Expected Result:** HTTP 409 Conflict (`DUPLICATE_BOOKMARK`).
- **Actual Result:** HTTP 409 Conflict returned; duplicate bookmark prevented.
- **Status:** **PASS**

---

### TC_ADM_01 — Admin Creates Verified Listing
- **Category:** Admin Management
- **Description:** Verify that an admin can post a new verified internship.
- **Test Steps:** Authenticate as admin and send `POST /api/admin/internships`.
- **Expected Result:** HTTP 201 Created with new listing ID.
- **Actual Result:** HTTP 201 Created, listing immediately discoverable by students.
- **Status:** **PASS**

---

### TC_ADM_02 — Admin Blocks and Unblocks Student Account
- **Category:** Admin Moderation
- **Description:** Verify that an administrator can suspend and subsequently reactivate a student account.
- **Test Steps:**
  1. Admin sends `PATCH /api/admin/students/:id/status` with `{ is_blocked: true }`.
  2. Blocked student attempts API login or action (returns HTTP 403).
  3. Admin sends `PATCH /api/admin/students/:id/status` with `{ is_blocked: false }`.
  4. Student can log in again.
- **Expected Result:** Account status toggles correctly; blocked status strictly prevents platform access.
- **Actual Result:** HTTP 200 OK on status changes; blocked student rejected with HTTP 403 Forbidden.
- **Status:** **PASS**

---

### TC_NOT_01 — Automated Approaching Deadline Reminders
- **Category:** Automated Reminders
- **Description:** Verify that the reminder service detects verified listings with deadlines within 7 days, creates notifications, and avoids duplicate reminders.
- **Test Steps:** Trigger `POST /api/notifications/reminders/trigger` twice.
- **Expected Result:** First run creates reminder notification; second run creates 0 duplicates.
- **Actual Result:** 1 reminder created on cycle 1, 0 created on cycle 2, notifications marked as read successfully.
- **Status:** **PASS**

---

### TC_DSH_01 — Test Case Dashboard Metrics & Real Execution Data
- **Category:** Faculty Demonstration
- **Description:** Verify that `/test-cases` displays accurate summary cards (31 total, 31 executed, 31 passed, 0 failed) calculated from test execution.
- **Expected Result:** Summary cards display real counts and category filters allow real-time filtering.
- **Actual Result:** Verified via Vitest in `client/src/test/TestCaseDashboard.test.jsx`.
- **Status:** **PASS**

---

### TC_DSH_02 — CSV Test Execution Report Export
- **Category:** Faculty Reporting
- **Description:** Verify that clicking "Export CSV Report" generates a downloadable CSV containing Test Case ID, Description, Category, Preconditions, Steps, Test Data, Expected Result, Actual Result, and Status.
- **Expected Result:** CSV file generated and downloaded with formatted test records.
- **Actual Result:** Browser CSV export downloads complete test matrix.
- **Status:** **PASS**

---

### TC_DSH_03 — Faculty Viva Presentation Mode
- **Category:** Faculty Evaluation
- **Description:** Verify that clicking "Viva Presentation Mode" opens a focused presentation modal with previous/next controls, keyboard arrows, and clear expected vs. actual results.
- **Expected Result:** Presentation overlay displays focused test data, numbered steps, and Green Pass badges.
- **Actual Result:** Verified via Vitest in `client/src/test/TestCaseDashboard.test.jsx`.
- **Status:** **PASS**

---

## 🚀 8. Career Tools & ATS Resume Builder Test Cases (TC_CAR_01 to TC_CAR_13 & Frontend)

### TC_CAR_01 — ATS Resume Creation with Contact & Structure Validation
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that authenticated students can construct ATS-compliant resumes containing validated contact details, education, skills, and projects conforming to single-column schema.
- **Test Steps:** Send `POST /api/career/resumes` with student resume JSON payload.
- **Expected Result:** HTTP 201 Created with generated resume ID and valid schema timestamps.
- **Actual Result:** HTTP 201 Created; validated against single-column ATS data model.
- **Status:** **PASS**

---

### TC_CAR_02 — Schema Rejection on Missing Contact Information
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that resume creation requests lacking candidate email or title return HTTP 400 Bad Request to guarantee ATS parser compatibility.
- **Test Steps:** Send `POST /api/career/resumes` with missing email and title.
- **Expected Result:** HTTP 400 Bad Request with descriptive validation error message.
- **Actual Result:** HTTP 400 Bad Request; "Resume title and candidate contact details are required."
- **Status:** **PASS**

---

### TC_CAR_03 — Resume Version Update and Template Persistence
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that students can switch templates (ATS Minimal, Software Developer, Fresher, Internship) and update draft contents.
- **Test Steps:** Send `PUT /api/career/resumes/:id` with updated title and template `"fresher"`.
- **Expected Result:** HTTP 200 OK; updated template persisted without corrupting sections.
- **Actual Result:** HTTP 200 OK; template and title updated cleanly.
- **Status:** **PASS**

---

### TC_CAR_04 — Strict Student Ownership & Cross-User Isolation
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that students cannot view, modify, or delete resumes belonging to other student accounts.
- **Test Steps:** Authenticate as User 3 and issue GET, PUT, and DELETE on User 2's resume ID 1.
- **Expected Result:** HTTP 404 Not Found (repository filter blocks foreign user ID).
- **Actual Result:** HTTP 404 Not Found; zero cross-tenant data leakage.
- **Status:** **PASS**

---

### TC_CAR_05 — One-Click Resume Cloning for Role-Specific Tailoring
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that students can duplicate existing resumes to create specialized versions (e.g. Frontend vs Backend) without re-entering history.
- **Test Steps:** Send `POST /api/career/resumes/:id/duplicate`.
- **Expected Result:** HTTP 201 Created with title suffix `(Copy)` and cloned sections.
- **Actual Result:** HTTP 201 Created; full deep-clone preserved with independent ID.
- **Status:** **PASS**

---

### TC_CAR_06 — Cascade Deletion of Resume Drafts
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that deleting a resume permanently removes it from the student account.
- **Test Steps:** Send `DELETE /api/career/resumes/:id` and subsequently query the ID.
- **Expected Result:** HTTP 200 OK on deletion; subsequent query returns HTTP 404 Not Found.
- **Actual Result:** HTTP 200 OK; resume cleanly purged.
- **Status:** **PASS**

---

### TC_CAR_07 — Upload File Type Whitelist Enforcement
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that the file upload parser strictly permits PDF and TXT documents, immediately rejecting executables, archives, and unauthorized formats.
- **Test Steps:** Send `POST /api/career/analyze-upload` with `script.sh` or `binary.exe`.
- **Expected Result:** HTTP 400 Bad Request with invalid file type error.
- **Actual Result:** HTTP 400 Bad Request; "Invalid file type. Only PDF and TXT documents are allowed."
- **Status:** **PASS**

---

### TC_CAR_08 — 5MB File Upload Threshold Enforcement
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that resume uploads exceeding the 5MB payload limit are aborted cleanly by Multer.
- **Test Steps:** Send `POST /api/career/analyze-upload` with mock 6MB payload.
- **Expected Result:** HTTP 400 Bad Request (`LIMIT_FILE_SIZE`).
- **Actual Result:** HTTP 400 Bad Request; "File size exceeds 5MB limit."
- **Status:** **PASS**

---

### TC_CAR_09 — Objective ATS Resume Scoring & Keyword Audit
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that the rule-based ATS checker computes scores (0-100), identifies matching/missing keywords from target JDs, checks action verbs, and flags quantifiable metrics.
- **Test Steps:** Send `POST /api/career/analyze` with sample resume and Software Developer JD.
- **Expected Result:** HTTP 200 OK with numerical score, section breakdown, matching keywords, and missing keywords.
- **Actual Result:** HTTP 200 OK; calculated score 82, identified missing keywords (Docker, AWS), suggested action verbs.
- **Status:** **PASS**

---

### TC_CAR_10 — Explainable Internship Compatibility Matching
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that internship matching computes transparent percentage scores based on student profile skills vs required internship skills, providing an honest breakdown of matching and missing skills.
- **Test Steps:** Send `GET /api/career/internship-match`.
- **Expected Result:** HTTP 200 OK with ranked internships, compatibility percentage, matched skills, and actionable gaps.
- **Actual Result:** HTTP 200 OK; 8 listings matched with explainable percentage and missing skill hints.
- **Status:** **PASS**

---

### TC_CAR_11 — Placement Prep Checklist State & Dynamic Progress
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that students can check off preparation milestones (DSA, Core CS, Aptitude, HR) and dynamic progress bars update in real-time.
- **Test Steps:** Send `PATCH /api/career/placement-tasks/:id/toggle`.
- **Expected Result:** HTTP 200 OK; completion state toggled and category completion recalculates.
- **Actual Result:** HTTP 200 OK; task status updated in database and state persisted.
- **Status:** **PASS**

---

### TC_CAR_12 — Document Vault Ownership & Application Linkage
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that private document storage (transcripts, certificates, recommendation letters) enforces student user isolation and links cleanly to applications.
- **Test Steps:** Send `GET /api/career/vault-documents` and verify strict `user_id` query filter.
- **Expected Result:** HTTP 200 OK; returns only documents owned by authenticated student.
- **Actual Result:** HTTP 200 OK; 2 vault documents returned, foreign access prohibited.
- **Status:** **PASS**

---

### TC_CAR_13 — Disclaimer Integrity (Explicit ATS Non-Guarantee Notice)
- **Category:** Career Tools & ATS Scenarios
- **Description:** Verify that all ATS scoring outputs include a transparent ethical disclaimer stating that scores do not guarantee interview calls or job placement.
- **Test Steps:** Inspect audit response from `POST /api/career/analyze`.
- **Expected Result:** Disclaimer contains explicit non-guarantee wording.
- **Actual Result:** Verified: disclaimer text states "ATS scores provide structured formatting guidance and keyword coverage insights; scoring high does not guarantee interview calls or job placement."
- **Status:** **PASS**

---

### TC_CAR_FE_01 to 05 — Frontend Automated Component Verification
- **Category:** Frontend UI & Interaction
- **Description:** Automated Vitest + React Testing Library verification in `client/src/test/CareerTools.test.jsx`:
  - `TC_CAR_FE_01`: Resume Preview renders ATS standard sections with candidate info.
  - `TC_CAR_FE_02`: Template switcher toggles between ATS Minimal, Software Developer, Fresher, and Internship layouts.
  - `TC_CAR_FE_03`: Live `ResumeQualityWidget` calculates score gauge and breakdown bars.
  - `TC_CAR_FE_04`: `ResumeEditorForm` handles interactive field edits and state propagation with accessibility labels.
  - `TC_CAR_FE_05`: Vector PDF generator executes without exceptions using native jsPDF drawing.
- **Status:** **PASS (All 5 Frontend Assertions Passing)**

