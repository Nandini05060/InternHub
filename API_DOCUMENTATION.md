# 📡 InternHub — RESTful API Specification

## Base URL
```
Development: http://localhost:5000/api
Production:  /api
```

---

## 1. Authentication & Security Endpoints (`/api/auth`)

### 1.1 Register New Account
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@college.edu",
    "password": "Password1!",
    "role": "student"
  }
  ```
- **Password Policy:** 8–15 chars, >=1 uppercase, >=1 digit, >=1 special character (`TC_PWD_BVA`).
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 12,
      "name": "Jane Doe",
      "email": "jane.doe@college.edu",
      "role": "student"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` — Validation failure (e.g. invalid email format or password policy violation).
  - `409 Conflict` — Email already registered.

---

### 1.2 User Login & Lockout Enforcement
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Access:** Public
- **Headers:** Optional `x-mock-time` for automated lockout expiration tests.
- **Request Body:**
  ```json
  {
    "email": "testuser@email.com",
    "password": "Pass123!"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "name": "Test Candidate",
      "email": "testuser@email.com",
      "role": "student"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` — Missing email or password (`TC_LGN_05`).
  - `401 Unauthorized` — Generic `"Invalid email or password."` (`TC_LGN_03`, `TC_LGN_04`).
  - `423 Locked` — Account locked after 5 consecutive failed attempts:
    ```json
    {
      "success": false,
      "locked": true,
      "remainingMinutes": 15,
      "message": "Account locked for 15 minutes due to too many failed attempts."
    }
    ```

---

### 1.3 Get Current Authenticated User & Profile
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Access:** Protected (`Bearer <JWT>`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "user": {
      "id": 5,
      "name": "Test Candidate",
      "email": "testuser@email.com",
      "role": "student"
    },
    "profile": {
      "id": 5,
      "user_id": 5,
      "university": "State University",
      "major": "Computer Science",
      "graduation_year": 2026,
      "skills": "React, Node.js, SQL, Python",
      "preferred_location": "Bengaluru",
      "work_mode": "Hybrid",
      "profile_completeness": 90
    }
  }
  ```

---

### 1.4 Update Student Profile
- **Method:** `PUT`
- **Endpoint:** `/api/auth/profile`
- **Access:** Protected (`Bearer <JWT>`)
- **Request Body:**
  ```json
  {
    "university": "State Engineering College",
    "major": "Information Technology",
    "graduation_year": 2026,
    "skills": "React, Express, TailwindCSS, MySQL, Jest",
    "preferred_location": "Bengaluru, Hybrid",
    "work_mode": "Hybrid",
    "resume_url": "https://internhub.local/resumes/candidate-resume.pdf"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "profile": { ... }
  }
  ```

---

### 1.5 Reset Account Lockout (Evaluation / Testing)
- **Method:** `POST`
- **Endpoint:** `/api/auth/reset-lockout`
- **Access:** Public (Dev / Faculty Viva Mode)
- **Request Body:**
  ```json
  {
    "email": "testuser@email.com"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Account lockout reset successfully for testuser@email.com"
  }
  ```

---

### 1.6 Forgot Password & Reset Flow
- **Method:** `POST` `/api/auth/forgot-password`
  - Body: `{ "email": "testuser@email.com" }`
  - Response: `{ "success": true, "instructions": "..." }`
- **Method:** `POST` `/api/auth/reset-password`
  - Body: `{ "email": "testuser@email.com", "password": "NewPassword1!", "confirmPassword": "NewPassword1!" }`
  - Response: `{ "success": true, "message": "Password updated successfully" }`

---

## 2. Internship Discovery Endpoints (`/api/internships`)

### 2.1 List Verified & Active Internships
- **Method:** `GET`
- **Endpoint:** `/api/internships`
- **Access:** Public (Students & Visitors)
- **Query Parameters:**
  - `q` — Free text query searching title, company, description, or skills.
  - `category` — Filter by domain (e.g. `Software Engineering`, `AI/ML`).
  - `work_mode` — Filter by `Remote`, `Hybrid`, or `On-site`.
  - `location` — Filter by city / region.
  - `sort` — `newest` (default) or `deadline`.
- **Behavior:** Unverified (`pending`, `rejected`) and expired (`is_expired = true`) listings are strictly excluded from output (`TC_INT_02`, `TC_INT_03`).
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "count": 8,
    "data": [
      {
        "id": 1,
        "title": "Full Stack Developer Intern",
        "company": "NovaTech Solutions",
        "location": "Bengaluru, Karnataka",
        "work_mode": "Hybrid",
        "stipend": "₹25,000/month",
        "duration": "6 months",
        "required_skills": "React, Node.js, Express, MySQL",
        "application_deadline": "2026-11-30",
        "apply_url": "https://careers.google.com",
        "verification_status": "verified",
        "is_expired": false
      }
    ]
  }
  ```

---

### 2.2 Get Single Internship Details
- **Method:** `GET`
- **Endpoint:** `/api/internships/:id`
- **Access:** Public
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Error Response:** `404 Not Found` if the listing does not exist.

---

## 3. Saved Internships & Bookmarks (`/api/bookmarks`)

### 3.1 Get Student's Saved Bookmarks
- **Method:** `GET`
- **Endpoint:** `/api/bookmarks`
- **Access:** Protected (Student)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [ ... ]
  }
  ```

### 3.2 Save an Internship
- **Method:** `POST`
- **Endpoint:** `/api/bookmarks`
- **Access:** Protected (Student)
- **Request Body:** `{ "internshipId": 1 }`
- **Error Responses:**
  - `404 Not Found` — Listing does not exist (`TC_BKM_01`).
  - `409 Conflict` — Listing already saved (`TC_BKM_02`).

### 3.3 Remove Saved Internship
- **Method:** `DELETE`
- **Endpoint:** `/api/bookmarks/:internshipId`
- **Access:** Protected (Student)
- **Success Response (`200 OK`):** `{ "success": true, "message": "Bookmark removed" }`

---

## 4. Application Tracking Pipeline (`/api/applications`)

### 4.1 Apply to Internship
- **Method:** `POST`
- **Endpoint:** `/api/applications`
- **Access:** Protected (Student)
- **Request Body:** `{ "internshipId": 1 }`
- **Pre-Conditions & Validation Rules:**
  1. Profile must have major, graduation year, and technical skills (`TC_APP_01`). Returns `400 Bad Request` (`PROFILE_INCOMPLETE`).
  2. Internship must be verified (`TC_APP_02`). Returns `400 Bad Request` (`UNVERIFIED_LISTING`).
  3. Internship must not be expired (`TC_APP_03`). Returns `400 Bad Request` (`EXPIRED_LISTING`).
  4. Candidate cannot submit duplicate application (`TC_APP_04`). Returns `409 Conflict` (`DUPLICATE_APPLICATION`).
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Application tracked successfully",
    "application": {
      "id": 14,
      "student_id": 5,
      "internship_id": 1,
      "status": "Applied",
      "application_date": "2026-10-15T09:30:00.000Z"
    }
  }
  ```

### 4.2 List Student Applications
- **Method:** `GET`
- **Endpoint:** `/api/applications`
- **Access:** Protected (Student)
- **Success Response (`200 OK`):** Returns array of tracked applications with associated internship metadata.

### 4.3 Update Application Stage
- **Method:** `PATCH`
- **Endpoint:** `/api/applications/:id/stage`
- **Access:** Protected (Student)
- **Request Body:** `{ "status": "Interview", "notes": "Technical round scheduled" }`
- **Supported Stages:** `Saved`, `Applied`, `Under Review`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.

---

## 5. Administrative Moderation (`/api/admin`)

All administrative endpoints require the `Authorization: Bearer <JWT>` token with role `admin` (`requireAdmin` middleware, `TC_SEC_01`).

### 5.1 List All Internships (Including Pending & Expired)
- **Method:** `GET`
- **Endpoint:** `/api/admin/internships`

### 5.2 Create New Internship
- **Method:** `POST`
- **Endpoint:** `/api/admin/internships`
- **Request Body:**
  ```json
  {
    "title": "Cloud DevOps Intern",
    "company": "SkyHigh Systems",
    "location": "Hyderabad",
    "work_mode": "Remote",
    "stipend": "₹30,000/month",
    "duration": "3 months",
    "required_skills": "Docker, Kubernetes, AWS, Linux",
    "description": "Hands on cloud infrastructure management.",
    "application_deadline": "2026-12-15",
    "apply_url": "https://careers.google.com",
    "verification_status": "verified"
  }
  ```
- **Success Response (`201 Created`)**

### 5.3 Verify or Reject Listing
- **Method:** `PATCH`
- **Endpoint:** `/api/admin/internships/:id/verify`
- **Request Body:** `{ "status": "verified" }` or `{ "status": "rejected" }`

### 5.4 Toggle Expiration
- **Method:** `PATCH`
- **Endpoint:** `/api/admin/internships/:id/expire`
- **Request Body:** `{ "is_expired": true }`

### 5.5 Delete Listing
- **Method:** `DELETE`
- **Endpoint:** `/api/admin/internships/:id`

### 5.6 List Student Directory
- **Method:** `GET`
- **Endpoint:** `/api/admin/students`

### 5.7 Block or Unblock Student Account
- **Method:** `PATCH`
- **Endpoint:** `/api/admin/students/:id/status`
- **Request Body:** `{ "is_blocked": true }` or `{ "is_blocked": false }`

---

## 6. Notifications & Deadline Reminders (`/api/notifications`)

### 6.1 Get Unread Notifications
- **Method:** `GET`
- **Endpoint:** `/api/notifications`
- **Access:** Protected (Student)

### 6.2 Mark Notification as Read
- **Method:** `PATCH`
- **Endpoint:** `/api/notifications/:id/read`
- **Access:** Protected (Student)

### 6.3 Trigger Automated Deadline Reminders
- **Method:** `POST`
- **Endpoint:** `/api/notifications/reminders/trigger`
- **Access:** Protected (Student / Background Service)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Deadline check complete",
    "remindersCreated": 1
  }
  ```

---

## 7. Interactive Test Runner & Viva Evaluation (`/api/tests`)

### 7.1 Get Full Test Suite Results
- **Method:** `GET`
- **Endpoint:** `/api/tests/results`
- **Access:** Public
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "summary": {
      "total": 31,
      "executed": 31,
      "passed": 31,
      "failed": 0,
      "blocked": 0,
      "notExecuted": 0,
      "passRate": "100%",
      "lastRunTimestamp": "2026-10-15T09:30:00Z"
    },
    "tests": [ ... ]
  }
  ```

### 7.2 Run Test Suite
- **Method:** `POST`
- **Endpoint:** `/api/tests/run`
- **Access:** Public (Safe sandbox test runner)
