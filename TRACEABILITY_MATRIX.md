# 📋 InternHub — Software Engineering Traceability Matrix (RTM)

## 1. Overview & Purpose
This Requirements Traceability Matrix (RTM) establishes bi-directional traceability across all phases of the **InternHub — Internship Discovery Platform** engineering lifecycle. It maps each software requirement from the initial project problem statement through user-facing UI components, Express.js backend endpoints, MySQL relational database tables, and automated test cases.

---

## 2. Requirement Traceability Matrix Table

| Req ID | Requirement Description | Category | Frontend Page / Component | Backend API Endpoint | Database Table | Test Case ID | Status |
|:---:|:---|:---:|:---|:---|:---|:---:|:---:|
| **REQ-AUTH-01** | Student & User Registration with field validation | Authentication | `RegisterPage.jsx` (`/register`) | `POST /api/auth/register` | `users`, `student_profiles` | `TC_REG_01`, `TC_REG_02` | **Verified Pass** |
| **REQ-AUTH-02** | Secure Student Authentication via JWT | Authentication | `LoginPage.jsx` (`/login`) | `POST /api/auth/login` | `users` | `TC_LGN_01` | **Verified Pass** |
| **REQ-AUTH-03** | Generic Invalid Credentials message for bad email/password | Security | `LoginPage.jsx` (`/login`) | `POST /api/auth/login` | `users` | `TC_LGN_03`, `TC_LGN_04` | **Verified Pass** |
| **REQ-AUTH-04** | Client & Server Required Field Validations | Validation | `LoginPage.jsx`, `RegisterPage.jsx` | `POST /api/auth/login`, `POST /api/auth/register` | `users` | `TC_LGN_05` | **Verified Pass** |
| **REQ-AUTH-05** | 5 Consecutive Failed Attempts Account Lockout (15 mins) | Security / Lockout | `LoginPage.jsx` (`/login`) | `POST /api/auth/login`, `POST /api/auth/reset-lockout` | `users` (`failed_login_attempts`, `lockout_until`) | `TC_LGN_06` | **Verified Pass** |
| **REQ-AUTH-06** | Password Visibility Toggle (Masked / Text) | UI / Usability | `LoginPage.jsx`, `RegisterPage.jsx` | N/A (Client-side state) | N/A | `TC_LGN_02` | **Verified Pass** |
| **REQ-AUTH-07** | Strict Accessible Focus Sequence | Usability / A11y | `LoginPage.jsx` (`tabIndex 1-4`) | N/A (Client DOM focus) | N/A | `TC_LGN_07` | **Verified Pass** |
| **REQ-AUTH-08** | Enter Key Form Submission Prevention of Dupes | Usability | `LoginPage.jsx` (Form handler) | `POST /api/auth/login` | `users` | `TC_LGN_08` | **Verified Pass** |
| **REQ-AUTH-09** | Password Boundary Value Analysis (8-15 chars, Upper, Num, Special) | Validation / BVA | `RegisterPage.jsx`, `passwordPolicy.js` | `POST /api/auth/register` | `users` (bcrypt hash) | `TC_PWD_BVA_01` to `06` | **Verified Pass** |
| **REQ-AUTH-10** | Current Authenticated User Endpoint & Auto-Logout | Security | `AuthContext.jsx` | `GET /api/auth/me` | `users`, `student_profiles` | `TC_SEC_02` | **Verified Pass** |
| **REQ-AUTH-11** | Password Reset & Forgot Password Flow | Security | `LoginPage.jsx` (Forgot modal) | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` | `users` | `TC_AUTH_03` | **Verified Pass** |
| **REQ-PROF-01** | Student Profile Viewing & Editing | Profile | `ProfilePage.jsx` (`/student/profile`) | `GET /api/auth/me`, `PUT /api/auth/profile` | `student_profiles` | `TC_PRF_01` | **Verified Pass** |
| **REQ-PROF-02** | Profile Completeness Calculation & Mandatory Gate | Business Logic | `ProfilePage.jsx`, `InternshipCard.jsx` | `POST /api/applications` | `student_profiles` | `TC_APP_01` | **Verified Pass** |
| **REQ-PROF-03** | Resume Upload & Format/Size Validation | Storage / File | `ProfilePage.jsx` (PDF, 5MB limit) | `PUT /api/auth/profile` | `student_profiles` (`resume_url`) | `TC_PRF_02` | **Verified Pass** |
| **REQ-DISC-01** | Verified Internship Discovery Listing | Discovery | `ExplorePage.jsx`, `LandingPage.jsx` | `GET /api/internships` | `internships` | `TC_INT_01` | **Verified Pass** |
| **REQ-DISC-02** | Search by Title, Company, Description & Skills | Discovery | `ExplorePage.jsx`, `SearchBar.jsx` | `GET /api/internships?q=...` | `internships` | `TC_INT_04` | **Verified Pass** |
| **REQ-DISC-03** | Multi-attribute Filters (Category, Work Mode, Location) | Discovery | `FilterSidebar.jsx`, `ExplorePage.jsx` | `GET /api/internships?category=...&work_mode=...` | `internships` | `TC_INT_01` | **Verified Pass** |
| **REQ-DISC-04** | Hide Unverified Listings from Discovery | Discovery / Security | `ExplorePage.jsx`, `LandingPage.jsx` | `GET /api/internships` (`verification_status='verified'`) | `internships` | `TC_INT_02` | **Verified Pass** |
| **REQ-DISC-05** | Hide Expired Listings from Active Student Discovery | Discovery / Lifecycle | `ExplorePage.jsx`, `LandingPage.jsx` | `GET /api/internships` (`is_expired=FALSE`) | `internships` | `TC_INT_03` | **Verified Pass** |
| **REQ-DISC-06** | Detailed Internship View & Official Employer Link | Discovery | `InternshipDetailPage.jsx` | `GET /api/internships/:id` | `internships` | `TC_INT_05` | **Verified Pass** |
| **REQ-BOOK-01** | Save / Bookmark Internship | Bookmarking | `InternshipCard.jsx`, `SavedInternshipsPage.jsx` | `POST /api/bookmarks` | `saved_internships` | `TC_BKM_01` | **Verified Pass** |
| **REQ-BOOK-02** | Prevent Duplicate Saves | Data Integrity | `SavedInternshipsPage.jsx` | `POST /api/bookmarks` | `saved_internships` (UNIQUE key) | `TC_BKM_02` | **Verified Pass** |
| **REQ-BOOK-03** | Remove Saved Internship | Bookmarking | `SavedInternshipsPage.jsx` | `DELETE /api/bookmarks/:internshipId` | `saved_internships` | `TC_BKM_03` | **Verified Pass** |
| **REQ-APPL-01** | Apply to Internship & Track Progress | Application Tracking | `ApplicationTracker.jsx`, `StudentDashboardPage.jsx` | `POST /api/applications` | `applications` | `TC_APP_05` | **Verified Pass** |
| **REQ-APPL-02** | Block Applying to Unverified Listings | Business Rules | `InternshipCard.jsx`, `InternshipDetailPage.jsx` | `POST /api/applications` | `applications`, `internships` | `TC_APP_02` | **Verified Pass** |
| **REQ-APPL-03** | Block Applying to Expired Listings | Business Rules | `InternshipCard.jsx`, `InternshipDetailPage.jsx` | `POST /api/applications` | `applications`, `internships` | `TC_APP_03` | **Verified Pass** |
| **REQ-APPL-04** | Prevent Duplicate Applications for Same Listing | Data Integrity | `InternshipCard.jsx` | `POST /api/applications` | `applications` (UNIQUE student_id + internship_id) | `TC_APP_04` | **Verified Pass** |
| **REQ-APPL-05** | Real-time Lifecycle Stage Updates (Saved to Offer) | Pipeline | `ApplicationTracker.jsx` | `PATCH /api/applications/:id/stage` | `applications` (`status`, `status_history`) | `TC_APP_05` | **Verified Pass** |
| **REQ-ADMN-01** | Admin Authentication & RBAC Route Protection | Authorization | `AdminLayout.jsx`, `ProtectedRoute.jsx` | Express `requireAdmin` middleware | `users` (`role='admin'`) | `TC_SEC_01` | **Verified Pass** |
| **REQ-ADMN-02** | Admin Create New Internship Listing | Admin Management | `AdminInternshipsPage.jsx` | `POST /api/admin/internships` | `internships` | `TC_ADM_01` | **Verified Pass** |
| **REQ-ADMN-03** | Admin Verify or Reject Internship Listing | Moderation | `InternshipManagerTable.jsx` | `PATCH /api/admin/internships/:id/verify` | `internships` | `TC_ADM_03` | **Verified Pass** |
| **REQ-ADMN-04** | Admin Toggle Listing Expiration | Expiry Control | `InternshipManagerTable.jsx` | `PATCH /api/admin/internships/:id/expire` | `internships` | `TC_ADM_04` | **Verified Pass** |
| **REQ-ADMN-05** | Admin Delete Internship Listing | Admin Management | `InternshipManagerTable.jsx` | `DELETE /api/admin/internships/:id` | `internships` | `TC_ADM_05` | **Verified Pass** |
| **REQ-ADMN-06** | Admin Student Directory & Block/Unblock Control | Moderation | `AdminStudentsPage.jsx`, `StudentManagerTable.jsx` | `PATCH /api/admin/students/:id/status` | `users` (`is_blocked`) | `TC_ADM_02` | **Verified Pass** |
| **REQ-NOTF-01** | In-App Notification Center | Notifications | `NotificationCenter.jsx`, `NotificationsPage.jsx` | `GET /api/notifications` | `notifications` | `TC_NOT_01` | **Verified Pass** |
| **REQ-NOTF-02** | Automated Approaching Deadline Reminders | Automated Service | `NotificationCenter.jsx` | `POST /api/notifications/reminders/trigger` | `notifications`, `internships` | `TC_NOT_01` | **Verified Pass** |
| **REQ-TEST-01** | Interactive Faculty Viva Test Case Execution Dashboard | QA / Viva | `TestCaseDashboardPage.jsx` (`/test-cases`) | `GET /api/tests/results`, `POST /api/tests/run` | Mock / Test Runner API | `TC_DSH_01` to `03` | **Verified Pass** |
| **REQ-TEST-02** | CSV Test Execution Report Export | QA Reporting | `TestCaseDashboardPage.jsx` | Client-side CSV generation | N/A | `TC_DSH_02` | **Verified Pass** |
| **REQ-TEST-03** | Faculty Viva Presentation Mode | Faculty Evaluation | `TestCaseDashboardPage.jsx` | In-memory presentation state | N/A | `TC_DSH_03` | **Verified Pass** |

---

## 3. Verification Summary by Test Suite

| Test Suite | File Location | Tests | Status |
|---|---|:---:|:---:|
| **Authentication & Lockout** | `server/tests/auth.test.js` | 9 | **100% Pass** |
| **Password Boundary Value Analysis** | `server/tests/password-bva.test.js` | 6 | **100% Pass** |
| **Application Lifecycle & Guardrails** | `server/tests/applications.test.js` | 10 | **100% Pass** |
| **Admin RBAC & Student Moderation** | `server/tests/admin.test.js` | 5 | **100% Pass** |
| **Internship Discovery & Visibility** | `server/tests/internships.test.js` | 5 | **100% Pass** |
| **Automated Deadline Reminders** | `server/tests/notifications.test.js` | 2 | **100% Pass** |
| **Frontend App Shell & Routing** | `client/src/test/App.test.jsx` | 4 | **100% Pass** |
| **Frontend Login & Usability Spec** | `client/src/test/Login.test.jsx` | 5 | **100% Pass** |
| **Frontend Password BVA UI Validation** | `client/src/test/PasswordBVA.test.jsx` | 6 | **100% Pass** |
| **Frontend Test Dashboard & Viva Mode** | `client/src/test/TestCaseDashboard.test.jsx` | 3 | **100% Pass** |
| **TOTAL AUTOMATED VERIFICATIONS** | **All 10 Test Suites** | **55 Tests** | **100% Pass** |
