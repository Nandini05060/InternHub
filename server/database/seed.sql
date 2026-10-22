-- =======================================================
-- InternHub Initial Seed Data
-- =======================================================

USE internhub_db;

-- Insert Default Admin and Student Users
-- Passwords:
-- admin@internhub.com -> Admin@123 ($2a$10$w8.gUeY69l91aJz9q5Yq7eJp8y/zJ.y4gH7tQh9xHk/bH2rBw4tqW or dynamically generated)
-- student@internhub.com -> Student@123 ($2a$10$tZ2y1Pq6y8B/0yZ0yZ0yZe/xZ0yZ0yZ0yZ0yZ0yZ0yZ0yZ0yZ0yZ0)

INSERT INTO users (id, name, email, password, role, is_blocked, failed_login_attempts, lockout_until) VALUES
(1, 'System Administrator', 'admin@internhub.com', '$2a$10$QO0k4r70W.aCq9e19G1p6exyE9yH7gH9tQh9xHk/bH2rBw4tqW9zS', 'admin', FALSE, 0, NULL),
(2, 'Alex Sharma', 'student@internhub.com', '$2a$10$wI5f67H55gH7tQh9xHk/bH2rBw4tqW9zSQO0k4r70W.aCq9e19G1p6', 'student', FALSE, 0, NULL),
(3, 'Priya Patel', 'priya.patel@student.edu', '$2a$10$wI5f67H55gH7tQh9xHk/bH2rBw4tqW9zSQO0k4r70W.aCq9e19G1p6', 'student', FALSE, 0, NULL),
(5, 'Test Candidate', 'testuser@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student', FALSE, 0, NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Student Profiles
INSERT INTO student_profiles (user_id, university, degree, graduation_year, skills, resume_url, github_url, linkedin_url, bio) VALUES
(2, 'National Institute of Technology', 'B.Tech in Computer Science and Engineering', 2026, 'React, Node.js, Express, MySQL, TypeScript, Tailwind CSS, Git', 'https://raw.githubusercontent.com/internhub/resumes/main/alex_sharma_resume.pdf', 'https://github.com/alexsharma-dev', 'https://linkedin.com/in/alexsharma-cs', 'Passionate junior full-stack developer with strong foundational knowledge in web applications, REST APIs, and database engineering. Looking for summer 2026 internships.')
ON DUPLICATE KEY UPDATE university=VALUES(university);

INSERT INTO student_profiles (user_id, university, degree, graduation_year, skills, resume_url, github_url, linkedin_url, bio) VALUES
(3, 'Delhi Technological University', 'B.Tech in Information Technology', 2025, 'Python, PyTorch, SQL, Pandas, Scikit-learn, React, FastAPI', 'https://raw.githubusercontent.com/internhub/resumes/main/priya_patel_resume.pdf', 'https://github.com/priyapatel-ai', 'https://linkedin.com/in/priyapatel-ml', 'Aspiring Machine Learning engineer with hands-on experience in NLP, tabular data pipelines, and predictive modeling.')
ON DUPLICATE KEY UPDATE university=VALUES(university);

-- Insert Diverse Realistic Internships
INSERT INTO internships (id, title, company_name, company_logo, location, work_type, category, stipend, duration, application_link, deadline, description, requirements, perks, verification_status, is_expired, posted_by) VALUES
(1, 'Software Engineer Intern - Frontend', 'Razorpay', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop', 'Bengaluru, India', 'hybrid', 'Frontend', '₹45,000 / month', '6 Months', 'https://razorpay.com/jobs/intern-frontend', '2026-11-30', 'Join Razorpay Core Checkout team to build delightful and lightning-fast payment flows used by millions of merchants daily.', 'Proficiency in React.js, JavaScript (ES6+), CSS3/Tailwind, and REST APIs. Familiarity with state management and web performance metrics.', 'Certificate, Letter of Recommendation, Pre-Placement Offer (PPO) opportunity, flexible work hours, complimentary catered meals.', 'verified', FALSE, 1),

(2, 'Backend Developer Intern', 'Postman', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop', 'Remote', 'remote', 'Backend', '₹50,000 / month', '3 Months', 'https://postman.com/careers/intern-backend-platform', '2026-11-15', 'Help design and scale the next generation of API collaboration infrastructure supporting over 30 million global developers.', 'Strong hands-on experience in Node.js, Express, relational databases (MySQL/PostgreSQL), and writing comprehensive unit tests.', 'Competitive stipend, 100% remote work setup allowance, weekly tech brown bags with Principal Architects, potential PPO.', 'verified', FALSE, 1),

(3, 'Full Stack Web Developer Intern', 'CRED', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&h=128&fit=crop', 'Bengaluru, India', 'on-site', 'Software Engineering', '₹60,000 / month', '6 Months', 'https://cred.club/careers/fullstack-intern', '2026-12-05', 'Work alongside senior engineering leads on high-throughput microservices, design systems, and seamless user experiences.', 'Knowledge of React, Node.js, TypeScript, SQL databases, and Redis caching. Strong understanding of clean architecture.', 'Top-tier stipend, MacBook Pro provided during internship, health insurance coverage, gourmet breakfast and lunch.', 'verified', FALSE, 1),

(4, 'Data Science & Machine Learning Intern', 'Zomato', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=128&h=128&fit=crop', 'Gurugram, India', 'hybrid', 'Data Science & AI', '₹40,000 / month', '4 Months', 'https://zomato.com/careers/data-science-intern', '2026-11-20', 'Build machine learning algorithms to optimize delivery dispatch routing, demand forecasting, and personalized restaurant recommendations.', 'Proficiency in Python, SQL, Pandas, Scikit-Learn, and basic deep learning frameworks (PyTorch or TensorFlow).', 'Hands-on mentorship from Senior Staff Data Scientists, free Zomato Gold membership, office game lounge and gym access.', 'verified', FALSE, 1),

(5, 'UI/UX Product Design Intern', 'Swiggy', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=128&h=128&fit=crop', 'Bengaluru, India', 'hybrid', 'UI/UX Design', '₹35,000 / month', '3 Months', 'https://swiggy.com/careers/product-design-intern', '2026-10-31', 'Craft user-centric wireframes, interactive prototypes, and design systems for millions of daily active grocery and food delivery consumers.', 'Strong portfolio demonstrating UX research, Figma proficiency, component design systems, and rapid prototyping.', 'Mentorship by Design Directors, portfolio review sessions, PPO interview fast-track, vibrant campus culture.', 'verified', FALSE, 1),

(6, 'Cloud & DevOps Intern', 'PhonePe', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=128&h=128&fit=crop', 'Bengaluru, India', 'on-site', 'DevOps & Cloud', '₹42,000 / month', '6 Months', 'https://phonepe.com/careers/devops-intern', '2026-11-25', 'Assist in operating high-availability cloud infrastructure handling billions of real-time UPI financial transactions per month.', 'Familiarity with Linux command line, Docker containers, CI/CD pipelines (GitHub Actions/Jenkins), and AWS basics.', 'Certificate of completion, comprehensive health coverage, subsidized executive housing near office campus.', 'verified', FALSE, 1),

(7, 'Associate Product Manager (APM) Intern', 'Urban Company', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=128&h=128&fit=crop', 'Gurugram, India', 'on-site', 'Product Management', '₹38,000 / month', '3 Months', 'https://urbancompany.com/careers/apm-intern', '2026-11-18', 'Collaborate with engineering, analytics, and operations teams to discover user pain points and launch high-impact product features.', 'Strong analytical mindset, data-driven reasoning, clear written communication, and ability to construct PRDs and user journeys.', 'Fast-track full-time APM offer for top performers, executive mentorship, leadership shadowing sessions.', 'verified', FALSE, 1),

(8, 'Mobile App Developer Intern (React Native)', 'Groww', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&h=128&fit=crop', 'Bengaluru, India', 'hybrid', 'Mobile Development', '₹45,000 / month', '6 Months', 'https://groww.in/careers/mobile-intern', '2026-12-15', 'Build smooth, accessible, 60fps mobile investment interfaces using React Native for stocks, mutual funds, and IPO investments.', 'Experience with React Native, TypeScript, mobile state management, and understanding of Android/iOS platform nuances.', 'PPO opportunity, state-of-the-art developer tooling, book allowance, free health and wellness programs.', 'verified', FALSE, 1),

(9, 'Cybersecurity & Threat Analyst Intern', 'Jio Platforms', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=128&h=128&fit=crop', 'Navi Mumbai, India', 'on-site', 'Cybersecurity', '₹35,000 / month', '6 Months', 'https://jio.com/careers/cybersecurity-intern', '2026-11-28', 'Assist in vulnerability assessments, security audit automation, and threat intelligence monitoring for massive digital ecosystems.', 'Knowledge of network protocols, OWASP Top 10 vulnerabilities, penetration testing tools, and Python scripting.', 'Industry recognized training, direct exposure to national scale security infrastructure, PPO opportunities.', 'verified', FALSE, 1),

(10, 'Pending Verification: AI Prompt Engineer Intern', 'StartupX AI Labs', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=128&h=128&fit=crop', 'Remote', 'remote', 'Data Science & AI', '₹20,000 / month', '2 Months', 'https://startupx.ai/careers/intern-apply', '2026-11-10', 'Help benchmark LLM outputs and design system prompts for agentic customer service workflows.', 'Familiarity with OpenAI / Anthropic APIs, Python, and systematic evaluation techniques.', 'Remote flexibility, certificate, high learning velocity.', 'pending', FALSE, 1),

(11, 'Expired Listing: Summer Web Intern 2025', 'Legacy Systems Inc', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&h=128&fit=crop', 'Pune, India', 'on-site', 'Software Engineering', '₹15,000 / month', '2 Months', 'https://legacysystems.com/careers', '2025-06-30', 'Historical internship archive listing for verification and administrative filter demonstration.', 'HTML, CSS, JavaScript basics.', 'Certificate of completion.', 'verified', TRUE, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert Sample Applications for Student 2
INSERT INTO applications (user_id, internship_id, status, applied_date, notes) VALUES
(2, 1, 'In Review', '2026-10-10', 'Submitted resume and portfolio. Received confirmation email from Razorpay Talent Acquisition team.'),
(2, 2, 'Applied', '2026-10-12', 'Applied via Postman career portal. Solved initial screening questions.'),
(2, 3, 'Saved', '2026-10-13', 'Need to polish fullstack MERN project before submitting application before Dec 5 deadline.')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Insert Saved Internships
INSERT INTO saved_internships (user_id, internship_id) VALUES
(2, 1),
(2, 2),
(2, 3),
(2, 4)
ON DUPLICATE KEY UPDATE saved_at=CURRENT_TIMESTAMP;

-- Insert Notifications for Student 2
INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES
(2, 'Application Status Update: Razorpay', 'Your application for "Software Engineer Intern - Frontend" has progressed to "In Review".', 'status_update', FALSE, '/student/dashboard'),
(2, 'Upcoming Deadline Reminder: Swiggy', 'The deadline for "UI/UX Product Design Intern" is approaching on October 31, 2026.', 'deadline', FALSE, '/internships'),
(2, 'New Verified Listing in Your Domain', 'Cred just published a new verified listing: "Full Stack Web Developer Intern". Check it out!', 'verification', TRUE, '/internships')
ON DUPLICATE KEY UPDATE title=VALUES(title);
