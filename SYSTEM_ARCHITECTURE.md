# 🏛️ InternHub — System Architecture & Database Design

## 1. High-Level Architectural Overview
InternHub is engineered as a three-tier, decoupled client-server architecture following modern Software Engineering principles. The system enforces strict separation of concerns between presentation, business logic, data access, and persistent storage.

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (React 18 + Vite)"]
        UI["Landing & Discovery UI"]
        AuthUI["Login / Register / Lockout Alert"]
        AppTrack["Application Tracker & Kanban"]
        AdminUI["Admin Moderation Console"]
        TestUI["Faculty Viva Test Dashboard"]
        State["Context State (Auth, Toast, Filters)"]
    end

    subgraph APILayer ["API Layer (Express.js 4.19)"]
        Router["Express Router & Dispatcher"]
        CORS["CORS & Request Parsers"]
        Morgan["HTTP Request Logging"]
        
        subgraph Middleware ["Security & Validation Middleware"]
            AuthMid["verifyToken (JWT Bearer)"]
            AdminMid["requireAdmin (Role Authorization)"]
            ValMid["validateRequest (Joi / RegEx)"]
            LockoutMid["Account Lockout Enforcer"]
            ClockMid["Mock Time Controller (Testing)"]
        end
    end

    subgraph ServiceLayer ["Service & Business Logic Layer"]
        AuthSvc["Auth Service (Bcrypt, Lockout)"]
        IntSvc["Internship Discovery Service"]
        AppSvc["Application Pipeline Service"]
        RemindSvc["Deadline Reminder Scheduler"]
        TestRunner["Safe Test Execution Engine"]
    end

    subgraph DataLayer ["Data Access & Storage Layer"]
        Repo["Repository Layer (Parameterized SQL)"]
        Pool["mysql2 Connection Pool (Max 10)"]
        MySQL[("MySQL 8.0 Relational Database")]
        Fallback[("In-Memory Repository Fallback")]
    end

    ClientLayer <-->|HTTP / JSON (REST)| APILayer
    APILayer --> Middleware
    Middleware --> ServiceLayer
    ServiceLayer --> DataLayer
    Repo --> Pool
    Pool --> MySQL
    Repo -.->|If MySQL offline| Fallback
```

---

## 2. Entity-Relationship (ER) Diagram

The database schema utilizes relational constraints, foreign keys with cascading rules, and unique indices to prevent duplicate entries and maintain referential integrity.

```mermaid
erDiagram
    USERS ||--o| STUDENT_PROFILES : "has profile"
    USERS ||--o{ APPLICATIONS : "submits"
    USERS ||--o{ SAVED_INTERNSHIPS : "bookmarks"
    USERS ||--o{ NOTIFICATIONS : "receives"
    INTERNSHIPS ||--o{ APPLICATIONS : "associated with"
    INTERNSHIPS ||--o{ SAVED_INTERNSHIPS : "saved under"

    USERS {
        int id PK "Auto Increment"
        string name "VARCHAR(100)"
        string email "VARCHAR(150) UNIQUE"
        string password "VARCHAR(255) Bcrypt Hash"
        enum role "ENUM('student', 'admin')"
        boolean is_blocked "DEFAULT FALSE"
        int failed_login_attempts "DEFAULT 0"
        datetime lockout_until "NULLABLE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    STUDENT_PROFILES {
        int id PK "Auto Increment"
        int user_id FK "REFERENCES users(id) ON DELETE CASCADE"
        string university "VARCHAR(150)"
        string major "VARCHAR(100)"
        int graduation_year "YEAR"
        text skills "JSON / Comma Separated"
        string resume_url "VARCHAR(255)"
        string preferred_location "VARCHAR(100)"
        string work_mode "ENUM('Remote', 'Hybrid', 'On-site')"
        int profile_completeness "INT DEFAULT 0"
        timestamp updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    INTERNSHIPS {
        int id PK "Auto Increment"
        string title "VARCHAR(150)"
        string company "VARCHAR(100)"
        string location "VARCHAR(100)"
        enum work_mode "ENUM('Remote', 'Hybrid', 'On-site')"
        string stipend "VARCHAR(50)"
        string duration "VARCHAR(50)"
        text required_skills "TEXT"
        text description "TEXT"
        date application_deadline "DATE"
        string apply_url "VARCHAR(255)"
        enum verification_status "ENUM('pending', 'verified', 'rejected')"
        boolean is_expired "DEFAULT FALSE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    APPLICATIONS {
        int id PK "Auto Increment"
        int student_id FK "REFERENCES users(id) ON DELETE CASCADE"
        int internship_id FK "REFERENCES internships(id) ON DELETE CASCADE"
        enum status "ENUM('Saved', 'Applied', 'Under Review', 'Interview', 'Offer', 'Rejected', 'Withdrawn')"
        text notes "TEXT"
        timestamp application_date "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    SAVED_INTERNSHIPS {
        int id PK "Auto Increment"
        int student_id FK "REFERENCES users(id) ON DELETE CASCADE"
        int internship_id FK "REFERENCES internships(id) ON DELETE CASCADE"
        timestamp saved_at "DEFAULT CURRENT_TIMESTAMP"
    }

    NOTIFICATIONS {
        int id PK "Auto Increment"
        int user_id FK "REFERENCES users(id) ON DELETE CASCADE"
        string title "VARCHAR(150)"
        text message "TEXT"
        enum type "ENUM('info', 'deadline', 'status_change', 'alert')"
        boolean is_read "DEFAULT FALSE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }
```

---

## 3. Security Architecture & Guardrails

### 3.1 Password Policy & Cryptographic Hashing
- **Specification:** Minimum 8 characters, maximum 15 characters, at least 1 uppercase letter (`A-Z`), at least 1 numeric digit (`0-9`), and at least 1 special character (`!@#$%^&*()_+\-=\[\]{}|;:,.<>?`).
- **Storage:** Passwords are never stored in plain text. When accepted, passwords are salted and hashed using **bcrypt** with a cost factor of 10 (`bcrypt.hash(password, 10)`).
- **Parity:** The exact regular expression and validation rules are shared symmetrically across `server/src/utils/passwordPolicy.js` and `client/src/pages/RegisterPage.jsx`.

### 3.2 Account Lockout Mechanism (TC_LGN_06)
- **Threshold:** 5 consecutive failed login attempts for any account.
- **Lockout Duration:** 15 minutes (`15 * 60 * 1000` ms).
- **Server Enforcement:** Stored persistently in MySQL `failed_login_attempts` and `lockout_until`.
- **Response:** Returns HTTP `423 Locked` with message:  
  `"Account locked for 15 minutes due to too many failed attempts."`
- **Tamper Resistance:** Page refresh, clearing client cookies, or restarting the browser cannot bypass the server lockout.
- **Controllable Testing Clock:** Supports the `x-mock-time` HTTP header during automated tests to test lockout expiration without sleeping for 15 real minutes.
- **Viva Demo Reset:** Provides `POST /api/auth/reset-lockout` for rapid presentation during academic evaluation.

### 3.3 Authorization & Role-Based Access Control (RBAC)
- **Token Format:** Signed JSON Web Token (JWT) with HMAC SHA-256 (`HS256`).
- **Middleware Hierarchy:**
  1. `verifyToken`: Validates Bearer token in the `Authorization` header. Decodes payload (`id`, `email`, `role`).
  2. `requireAdmin`: Rejects non-admin users with HTTP `403 Forbidden` (`ADMIN_ACCESS_REQUIRED`).
  3. `requireActive`: Rejects suspended/blocked student accounts with HTTP `403 Forbidden` (`ACCOUNT_BLOCKED`).

### 3.4 Application Business Rules & Guardrails
- **Incomplete Profile Gate:** Before creating an application record, the server verifies `student_profiles` has non-empty values for required fields. Incomplete profiles receive HTTP `400 Bad Request` (`PROFILE_INCOMPLETE`).
- **Unverified Listing Protection:** Applying to listings with `verification_status != 'verified'` is rejected with HTTP `400 Bad Request` (`UNVERIFIED_LISTING`).
- **Expired Listing Protection:** Applying to listings with `is_expired = TRUE` or past deadlines is rejected with HTTP `400 Bad Request` (`EXPIRED_LISTING`).
- **Duplicate Prevention:** Unique composite constraint on `(student_id, internship_id)` in `applications` and `saved_internships`.

---

## 4. End-to-End Core Data Workflows

### 4.1 Student Application Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as React Frontend
    participant API as Express Router
    participant Val as Middleware / Validator
    participant DB as MySQL Database

    Student->>UI: Clicks "Apply on Company Site"
    UI->>API: POST /api/applications { internshipId }
    API->>Val: Check Auth Token & Profile Completeness
    alt Profile Incomplete (<60% or missing major/year)
        Val-->>UI: 400 Bad Request (PROFILE_INCOMPLETE)
        UI-->>Student: Prompts to complete profile first
    else Profile Complete
        Val->>DB: Query Internship (is_expired, verification_status)
        alt Listing Unverified or Expired
            DB-->>API: Status 'pending' OR Expired
            API-->>UI: 400 Bad Request (UNVERIFIED_LISTING / EXPIRED_LISTING)
            UI-->>Student: Displays warning alert
        else Listing Verified & Active
            DB-->>API: Listing Valid
            API->>DB: INSERT INTO applications (status: 'Applied')
            DB-->>API: Created record ID
            API-->>UI: 201 Created { application }
            UI->>Student: Opens official career link in new tab
            UI->>UI: Refreshes Application Tracker Kanban
        end
    end
```

### 4.2 Automated Deadline Reminder Scheduler
```mermaid
sequenceDiagram
    autonumber
    participant Cron as Background Scheduler / Timer
    participant Svc as Reminder Service
    participant DB as MySQL Database
    participant UI as Notification Bell

    Cron->>Svc: Trigger scan (Interval: Configurable / Daily)
    Svc->>DB: SELECT active, verified internships with deadline <= 7 days
    DB-->>Svc: Returns matching internships
    loop For Each Matched Internship
        Svc->>DB: Check if reminder notification already sent
        alt Notification Already Exists
            Svc->>Svc: Skip (Prevent duplicate spam)
        else No Existing Notification
            Svc->>DB: INSERT INTO notifications (type: 'deadline', user_id: student)
            DB-->>Svc: Notification recorded
        end
    end
    UI->>DB: GET /api/notifications
    DB-->>UI: Returns unread reminder alerts
    UI->>UI: Displays badge count and toast prompt
```
