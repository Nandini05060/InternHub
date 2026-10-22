-- =======================================================
-- InternHub Database Schema
-- Internship Discovery and Application Management Platform
-- =======================================================

CREATE DATABASE IF NOT EXISTS internhub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE internhub_db;

-- 1. Users Table (Supports Student and Admin roles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    is_blocked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    lockout_until TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    university VARCHAR(150) DEFAULT 'University Institute of Technology',
    degree VARCHAR(100) DEFAULT 'B.Tech Computer Science',
    graduation_year INT DEFAULT 2026,
    skills TEXT,
    resume_url VARCHAR(255) DEFAULT 'https://example.com/resumes/demo-student.pdf',
    github_url VARCHAR(255) DEFAULT 'https://github.com/demostudent',
    linkedin_url VARCHAR(255) DEFAULT 'https://linkedin.com/in/demostudent',
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Internships Table
CREATE TABLE IF NOT EXISTS internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    company_logo VARCHAR(255),
    location VARCHAR(100) NOT NULL,
    work_type ENUM('remote', 'hybrid', 'on-site') DEFAULT 'remote',
    category VARCHAR(80) NOT NULL,
    stipend VARCHAR(80) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    application_link VARCHAR(500) NOT NULL,
    deadline DATE NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    perks TEXT,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'verified',
    is_expired BOOLEAN DEFAULT FALSE,
    posted_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_internship_posted_by FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_work_type (work_type),
    INDEX idx_verification (verification_status),
    INDEX idx_deadline (deadline),
    INDEX idx_expired (is_expired)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Saved Internships (Bookmarks)
CREATE TABLE IF NOT EXISTS saved_internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    internship_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_internship (user_id, internship_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_internship FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Applications (Student Application Status Tracking)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    internship_id INT NOT NULL,
    status ENUM('Saved', 'Applied', 'In Review', 'Interviewing', 'Offered', 'Rejected') DEFAULT 'Applied',
    applied_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_application (user_id, internship_id),
    CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_internship FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    INDEX idx_app_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('deadline', 'verification', 'status_update', 'system') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Resumes Table (ATS Resume Builder)
CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    target_role VARCHAR(150),
    target_company VARCHAR(150),
    template_id VARCHAR(50) DEFAULT 'ats_minimal',
    personal_info JSON,
    summary TEXT,
    education JSON,
    experience JSON,
    projects JSON,
    skills JSON,
    certifications JSON,
    achievements JSON,
    extracurriculars JSON,
    version_status ENUM('draft', 'tailored', 'final') DEFAULT 'draft',
    quality_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resume_user (user_id),
    INDEX idx_resume_status (version_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Resume Analyses Table (Resume Quality & JD Match)
CREATE TABLE IF NOT EXISTS resume_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    resume_id INT NULL,
    resume_title VARCHAR(150),
    target_role VARCHAR(150),
    job_description TEXT,
    score INT DEFAULT 0,
    breakdown JSON,
    skills_identified JSON,
    matching_keywords JSON,
    missing_keywords JSON,
    suggestions JSON,
    extracted_text MEDIUMTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_analysis_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
    INDEX idx_analysis_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Placement Preparation Tasks Table
CREATE TABLE IF NOT EXISTS placement_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(80) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    deadline DATE NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_placement_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_user (user_id),
    INDEX idx_task_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Student Certifications & Target Skills Table
CREATE TABLE IF NOT EXISTS student_certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    provider VARCHAR(150),
    skill_name VARCHAR(100),
    skill_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
    status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'In Progress',
    target_date DATE NULL,
    completed_date DATE NULL,
    credential_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cert_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_cert_user (user_id),
    INDEX idx_cert_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Interview Practice Progress Table
CREATE TABLE IF NOT EXISTS interview_practice_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    user_answer TEXT,
    notes TEXT,
    is_practiced BOOLEAN DEFAULT FALSE,
    practiced_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_practice_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_practice_user (user_id),
    INDEX idx_practice_qid (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Application Document Vault Table
CREATE TABLE IF NOT EXISTS vault_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    document_type ENUM('resume', 'cover_letter', 'certificate', 'portfolio_link', 'project_link', 'interview_notes', 'other') DEFAULT 'resume',
    file_url VARCHAR(500),
    file_size INT DEFAULT 0,
    mime_type VARCHAR(100),
    application_id INT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vault_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_vault_app FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
    INDEX idx_vault_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

