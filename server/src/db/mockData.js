import bcrypt from 'bcryptjs';

// Passwords:
// Student@123 -> $2a$10$w...
// Admin@123 -> $2a$10$w...
// Pass123! -> exact test password from PDF specification
const DEFAULT_STUDENT_HASH = bcrypt.hashSync('Student@123', 10);
const DEFAULT_ADMIN_HASH = bcrypt.hashSync('Admin@123', 10);
const DEFAULT_TESTUSER_HASH = bcrypt.hashSync('Pass123!', 10);

export function getInitialData() {
  const users = [
    {
      id: 1,
      name: 'System Administrator',
      email: 'admin@internhub.com',
      password: DEFAULT_ADMIN_HASH,
      role: 'admin',
      is_blocked: false,
      failed_login_attempts: 0,
      lockout_until: null,
      created_at: new Date('2026-09-01T08:00:00Z').toISOString()
    },
    {
      id: 2,
      name: 'Alex Sharma',
      email: 'student@internhub.com',
      password: DEFAULT_STUDENT_HASH,
      role: 'student',
      is_blocked: false,
      failed_login_attempts: 0,
      lockout_until: null,
      created_at: new Date('2026-09-15T10:00:00Z').toISOString()
    },
    {
      id: 3,
      name: 'Priya Patel',
      email: 'priya.patel@student.edu',
      password: DEFAULT_STUDENT_HASH,
      role: 'student',
      is_blocked: false,
      failed_login_attempts: 0,
      lockout_until: null,
      created_at: new Date('2026-09-20T11:00:00Z').toISOString()
    },
    {
      id: 4,
      name: 'Rohan Verma',
      email: 'rohan.verma@college.edu',
      password: DEFAULT_STUDENT_HASH,
      role: 'student',
      is_blocked: true, // Sample blocked student for admin testing
      failed_login_attempts: 0,
      lockout_until: null,
      created_at: new Date('2026-10-01T14:00:00Z').toISOString()
    },
    {
      id: 5,
      name: 'Test Candidate',
      email: 'testuser@email.com',
      password: DEFAULT_TESTUSER_HASH,
      role: 'student',
      is_blocked: false,
      failed_login_attempts: 0,
      lockout_until: null,
      created_at: new Date('2026-10-05T09:00:00Z').toISOString()
    }
  ];

  const profiles = [
    {
      id: 1,
      user_id: 2,
      university: 'National Institute of Technology',
      degree: 'B.Tech in Computer Science and Engineering',
      graduation_year: 2026,
      skills: 'React, Node.js, Express, MySQL, TypeScript, Tailwind CSS, Git',
      resume_url: 'https://raw.githubusercontent.com/internhub/resumes/main/alex_sharma_resume.pdf',
      github_url: 'https://github.com/alexsharma-dev',
      linkedin_url: 'https://linkedin.com/in/alexsharma-cs',
      bio: 'Passionate junior full-stack developer with strong foundational knowledge in web applications, REST APIs, and database engineering. Looking for summer 2026 internships.'
    },
    {
      id: 2,
      user_id: 3,
      university: 'Delhi Technological University',
      degree: 'B.Tech in Information Technology',
      graduation_year: 2025,
      skills: 'Python, PyTorch, SQL, Pandas, Scikit-learn, React, FastAPI',
      resume_url: 'https://raw.githubusercontent.com/internhub/resumes/main/priya_patel_resume.pdf',
      github_url: 'https://github.com/priyapatel-ai',
      linkedin_url: 'https://linkedin.com/in/priyapatel-ml',
      bio: 'Aspiring Machine Learning engineer with hands-on experience in NLP, tabular data pipelines, and predictive modeling.'
    },
    {
      id: 3,
      user_id: 5,
      university: 'Indian Institute of Technology, Bombay',
      degree: 'B.Tech in Computer Science',
      graduation_year: 2026,
      skills: 'React, Node.js, Express, MySQL, Vitest, Git',
      resume_url: 'https://raw.githubusercontent.com/internhub/resumes/main/testuser_resume.pdf',
      github_url: 'https://github.com/testuser-cs',
      linkedin_url: 'https://linkedin.com/in/testuser-cs',
      bio: 'Full stack student developer ready for software engineering internship demonstration.'
    }
  ];

  const internships = [
    {
      id: 1,
      title: 'Software Engineer Intern - Frontend',
      company_name: 'Razorpay',
      company_logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop',
      location: 'Bengaluru, India',
      work_type: 'hybrid',
      category: 'Frontend',
      stipend: '₹45,000 / month',
      duration: '6 Months',
      application_link: 'https://razorpay.com/jobs/intern-frontend',
      deadline: '2026-11-30',
      description: 'Join Razorpay Core Checkout team to build delightful and lightning-fast payment flows used by millions of merchants daily. You will collaborate closely with product managers, UX designers, and senior engineers to craft responsive, accessible interfaces.',
      requirements: 'Proficiency in React.js, JavaScript (ES6+), CSS3/Tailwind, and REST APIs. Familiarity with state management, web performance optimization, and browser debugging tools.',
      perks: 'Certificate, Letter of Recommendation, Pre-Placement Offer (PPO) opportunity, flexible work hours, complimentary catered meals and snacks.',
      verification_status: 'verified',
      is_expired: false,
      posted_by: 1,
      created_at: new Date('2026-10-01T09:00:00Z').toISOString()
    },
    {
      id: 2,
      title: 'Backend Developer Intern',
      company_name: 'Postman',
      company_logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop',
      location: 'Remote',
      work_type: 'remote',
      category: 'Backend',
      stipend: '₹50,000 / month',
      duration: '3 Months',
      application_link: 'https://postman.com/careers/intern-backend-platform',
      deadline: '2026-11-15',
      description: 'Help design and scale the next generation of API collaboration infrastructure supporting over 30 million global developers. Work with distributed databases, caching tiers, and event queues.',
      requirements: 'Strong hands-on experience in Node.js, Express, relational databases (MySQL/PostgreSQL), and writing comprehensive unit tests. Good understanding of HTTP and REST conventions.',
      perks: 'Competitive stipend, 100% remote work setup allowance, weekly tech brown bags with Principal Architects, potential PPO consideration.',
      verification_status: 'verified',
      is_expired: false,
      posted_by: 1,
      created_at: new Date('2026-10-02T10:30:00Z').toISOString()
    },
    {
      id: 3,
      title: 'Full Stack Web Developer Intern',
      company_name: 'CRED',
      company_logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&h=128&fit=crop',
      location: 'Bengaluru, India',
      work_type: 'on-site',
      category: 'Software Engineering',
      stipend: '₹60,000 / month',
      duration: '6 Months',
      application_link: 'https://cred.club/careers/fullstack-intern',
      deadline: '2026-12-05',
      description: 'Work alongside senior engineering leads on high-throughput microservices, design systems, and seamless user experiences for high-trust financial rewards platform.',
      requirements: 'Knowledge of React, Node.js, TypeScript, SQL databases, and Redis caching. Strong understanding of clean architecture, data structures, and algorithms.',
      perks: 'Top-tier stipend, MacBook Pro provided during internship, comprehensive health insurance coverage, gourmet breakfast and lunch.',
      verification_status: 'verified',
      is_expired: false,
      posted_by: 1,
      created_at: new Date('2026-10-03T11:00:00Z').toISOString()
    },
    {
      id: 4,
      title: 'Data Science & Machine Learning Intern',
      company_name: 'Zomato',
      company_logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=128&h=128&fit=crop',
      location: 'Gurugram, India',
      work_type: 'hybrid',
      category: 'Data Science & AI',
      stipend: '₹40,000 / month',
      duration: '4 Months',
      application_link: 'https://zomato.com/careers/data-science-intern',
      deadline: '2026-11-20',
      description: 'Build machine learning algorithms to optimize delivery dispatch routing, demand forecasting, and personalized restaurant recommendations across thousands of cities.',
      requirements: 'Proficiency in Python, SQL, Pandas, NumPy, Scikit-Learn, and basic deep learning frameworks (PyTorch or TensorFlow). Sound foundation in statistics and linear algebra.',
      perks: 'Hands-on mentorship from Senior Staff Data Scientists, free Zomato Gold membership, office game lounge and fitness center access.',
      verification_status: 'verified',
      is_expired: false,
      posted_by: 1,
      created_at: new Date('2026-10-04T12:00:00Z').toISOString()
    },
    {
      id: 5,
      title: 'UI/UX Product Design Intern',
      company_name: 'Swiggy',
      company_logo: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=128&h=128&fit=crop',
      location: 'Bengaluru, India',
      work_type: 'hybrid',
      category: 'UI/UX Design',
      stipend: '₹35,000 / month',
      duration: '3 Months',
      application_link: 'https://swiggy.com/careers/product-design-intern',
      deadline: '2026-10-31',
      description: 'Craft user-centric wireframes, interactive prototypes, and design systems for millions of daily active grocery and food delivery consumers on mobile and desktop apps.',
      requirements: 'Strong portfolio demonstrating UX research methodology, Figma proficiency, component design systems, and rapid prototyping capabilities.',
      perks: 'Mentorship by Design Directors, portfolio review sessions, PPO interview fast-track, vibrant campus culture.',
      verification_status: 'verified',
      is_expired: false,
      posted_by: 1,
      created_at: new Date('2026-10-05T14:00:00Z').toISOString()
    },
    {
      id: 6,
      title: 'Cloud & DevOps Intern',
      company_name: 'PhonePe',
      company_logo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=128&h=128&fit=crop',
      location: 'Bengaluru, India',
      work_type: 'on-site',
      category: 'DevOps & Cloud',
      stipend: '₹42,000 / month',
      duration: '6 Months',
      application_link: 'https://phonepe.com/careers/devops-intern',
      deadline: '2026-11-25',
      description: 'Assist in operating high-availability cloud infrastructure handling billions of real-time UPI financial transactions per month. Gain deep insight into container orchestration and telemetry.',
      requirements: 'Familiarity with Linux command line, Docker containers, CI/CD pipelines (GitHub Actions/Jenkins), and AWS basics (EC2, S3, IAM).',
      perks: 'Certificate of completion, comprehensive health coverage, subsidized executive housing near office campus.',
      verification_status: 'verified',
      is_expired: false,
      posted_by: 1,
      created_at: new Date('2026-10-06T15:30:00Z').toISOString()
    },
    {
      id: 7,
      title: 'Associate Product Manager (APM) Intern',
      company_name: 'Urban Company',
      company_logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=128&h=128&fit=crop',
      location: 'Gurugram, India',
      work_type: 'on-site',
      category: 'Product Management',
      stipend: '₹38,000 / month',
      duration: '3 Months',
      application_link: 'https://urbancompany.com/careers/apm-intern',
      deadline: '2026-11-18',
      description: 'Collaborate with engineering, analytics, and operations teams to discover user pain points and launch high-impact product features across home services.',
      requirements: 'Strong analytical mindset, data-driven reasoning, clear written communication, and ability to construct PRDs and user journeys.',
      perks: 'Fast-track full-time APM offer for top performers, executive mentorship, leadership shadowing sessions.',
      verification_status: 'verified',
      is_expired: false,
      posted_by: 1,
      created_at: new Date('2026-10-07T16:00:00Z').toISOString()
    },
    {
      id: 8,
      title: 'Mobile App Developer Intern (React Native)',
      company_name: 'Groww',
      company_logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&h=128&fit=crop',
      location: 'Bengaluru, India',
      work_type: 'hybrid',
      category: 'Mobile Development',
      stipend: '₹45,000 / month',
      duration: '6 Months',
      application_link: 'https://groww.in/careers/mobile-intern',
      deadline: '2026-12-15',
      description: 'Build smooth, accessible, 60fps mobile investment interfaces using React Native for stocks, mutual funds, and IPO investments.',
      requirements: 'Experience with React Native, TypeScript, mobile state management, and understanding of Android/iOS platform nuances.',
      perks: 'PPO opportunity, state-of-the-art developer tooling, book allowance, free health and wellness programs.',
      verification_status: 'verified',
      is_expired: false,
      posted_by: 1,
      created_at: new Date('2026-10-08T09:30:00Z').toISOString()
    },
    {
      id: 9,
      title: 'Pending Verification: AI Prompt Engineer Intern',
      company_name: 'StartupX AI Labs',
      company_logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=128&h=128&fit=crop',
      location: 'Remote',
      work_type: 'remote',
      category: 'Data Science & AI',
      stipend: '₹20,000 / month',
      duration: '2 Months',
      application_link: 'https://startupx.ai/careers/intern-apply',
      deadline: '2026-11-10',
      description: 'Help benchmark LLM outputs and design system prompts for agentic customer service workflows.',
      requirements: 'Familiarity with OpenAI / Anthropic APIs, Python, and systematic evaluation techniques.',
      perks: 'Remote flexibility, certificate, high learning velocity.',
      verification_status: 'pending',
      is_expired: false,
      posted_by: 1,
      created_at: new Date('2026-10-09T10:00:00Z').toISOString()
    },
    {
      id: 10,
      title: 'Expired Listing: Summer Web Intern 2025',
      company_name: 'Legacy Systems Inc',
      company_logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&h=128&fit=crop',
      location: 'Pune, India',
      work_type: 'on-site',
      category: 'Software Engineering',
      stipend: '₹15,000 / month',
      duration: '2 Months',
      application_link: 'https://legacysystems.com/careers',
      deadline: '2025-06-30',
      description: 'Historical internship archive listing for verification and administrative filter demonstration.',
      requirements: 'HTML, CSS, JavaScript basics.',
      perks: 'Certificate of completion.',
      verification_status: 'verified',
      is_expired: true,
      posted_by: 1,
      created_at: new Date('2025-05-01T08:00:00Z').toISOString()
    }
  ];

  const savedInternships = [
    { id: 1, user_id: 2, internship_id: 1, saved_at: new Date().toISOString() },
    { id: 2, user_id: 2, internship_id: 2, saved_at: new Date().toISOString() },
    { id: 3, user_id: 2, internship_id: 3, saved_at: new Date().toISOString() },
    { id: 4, user_id: 2, internship_id: 4, saved_at: new Date().toISOString() }
  ];

  const applications = [
    {
      id: 1,
      user_id: 2,
      internship_id: 1,
      status: 'In Review',
      applied_date: '2026-10-10',
      notes: 'Submitted resume and portfolio. Received confirmation email from Razorpay Talent Acquisition team.',
      created_at: new Date('2026-10-10T09:00:00Z').toISOString()
    },
    {
      id: 2,
      user_id: 2,
      internship_id: 2,
      status: 'Applied',
      applied_date: '2026-10-12',
      notes: 'Applied via Postman career portal. Solved initial screening questions.',
      created_at: new Date('2026-10-12T10:00:00Z').toISOString()
    },
    {
      id: 3,
      user_id: 2,
      internship_id: 3,
      status: 'Saved',
      applied_date: '2026-10-13',
      notes: 'Need to polish fullstack MERN project before submitting application before Dec 5 deadline.',
      created_at: new Date('2026-10-13T11:00:00Z').toISOString()
    }
  ];

  const notifications = [
    {
      id: 1,
      user_id: 2,
      title: 'Application Status Update: Razorpay',
      message: 'Your application for "Software Engineer Intern - Frontend" has progressed to "In Review".',
      type: 'status_update',
      is_read: false,
      link: '/student/dashboard',
      created_at: new Date('2026-10-12T08:30:00Z').toISOString()
    },
    {
      id: 2,
      user_id: 2,
      title: 'Upcoming Deadline Reminder: Swiggy',
      message: 'The deadline for "UI/UX Product Design Intern" is approaching on October 31, 2026.',
      type: 'deadline',
      is_read: false,
      link: '/internships',
      created_at: new Date('2026-10-13T09:00:00Z').toISOString()
    },
    {
      id: 3,
      user_id: 2,
      title: 'New Verified Listing in Your Domain',
      message: 'CRED just published a new verified listing: "Full Stack Web Developer Intern". Check it out!',
      type: 'verification',
      is_read: true,
      link: '/internships',
      created_at: new Date('2026-10-13T14:00:00Z').toISOString()
    }
  ];

  const resumes = [
    {
      id: 1,
      user_id: 2,
      title: 'Full-Stack Software Engineer Resume',
      target_role: 'Full Stack Developer',
      target_company: 'Razorpay',
      template_id: 'software_dev',
      personal_info: {
        fullName: 'Alex Sharma',
        email: 'student@internhub.com',
        phone: '+91 98765 43210',
        location: 'Bengaluru, Karnataka, India',
        linkedin: 'https://linkedin.com/in/alexsharma',
        github: 'https://github.com/alexsharma',
        portfolio: 'https://alexsharma.dev'
      },
      summary: 'Results-driven Final Year Computer Science student proficient in React, Node.js, and Distributed Systems. Built high-concurrency microservices processing 10k+ requests/min. Seeking Summer 2026 Software Development Engineer Internship.',
      education: [
        {
          id: 'edu-1',
          institution: 'University Institute of Technology',
          degree: 'Bachelor of Engineering',
          fieldOfStudy: 'Computer Science and Engineering',
          startDate: '2022',
          endDate: '2026',
          gpa: '8.85 / 10.0',
          coursework: 'Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks'
        }
      ],
      experience: [
        {
          id: 'exp-1',
          company: 'ZetaTech Labs',
          role: 'Software Engineering Intern',
          location: 'Bengaluru, India',
          startDate: 'Jun 2024',
          endDate: 'Aug 2024',
          isCurrent: false,
          bullets: [
            'Architected high-throughput REST APIs using Node.js & Express, decreasing median endpoint latency by 32%.',
            'Implemented Redis caching layer handling 15,000+ cache hits daily, reducing database load by 40%.',
            'Configured Docker containers and automated CI/CD pipeline using GitHub Actions, cutting release turnaround by 50%.'
          ]
        }
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'CloudTask — Distributed Task Queue',
          role: 'Lead Architect',
          techStack: 'Node.js, Redis, Docker, React, TailwindCSS',
          liveUrl: 'https://cloudtask.example.com',
          githubUrl: 'https://github.com/alexsharma/cloudtask',
          bullets: [
            'Engineered persistent distributed message queue handling 5,000 background jobs/sec with at-least-once delivery guarantees.',
            'Constructed real-time WebSocket dashboard in React visualizing node health, latency histograms, and failure retries.'
          ]
        },
        {
          id: 'proj-2',
          title: 'DevConnect — Developer Portfolio Platform',
          role: 'Full Stack Engineer',
          techStack: 'React, Express, MySQL, TailwindCSS',
          liveUrl: 'https://devconnect.example.com',
          githubUrl: 'https://github.com/alexsharma/devconnect',
          bullets: [
            'Implemented secure JWT authentication and role-based access control for 1,200+ registered university developers.',
            'Optimized MySQL queries with composite indexing, achieving sub-25ms response times across 20,000 profile records.'
          ]
        }
      ],
      skills: {
        languages: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'C++', 'SQL'],
        frameworks: ['React.js', 'Node.js', 'Express', 'TailwindCSS', 'Next.js'],
        tools: ['Docker', 'Git', 'GitHub Actions', 'Redis', 'MySQL', 'Postman', 'Linux'],
        softSkills: ['System Design', 'Agile Collaboration', 'Technical Writing', 'Problem Solving']
      },
      certifications: [
        {
          id: 'cert-1',
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: '2024',
          url: 'https://aws.amazon.com/verification'
        }
      ],
      achievements: [
        {
          id: 'ach-1',
          title: '1st Place Winner — National University Hackathon 2024',
          description: 'Led 4-member team to construct high-speed accessibility platform out of 320 competing teams.',
          date: 'Feb 2024'
        }
      ],
      extracurriculars: [
        {
          id: 'extra-1',
          role: 'Technical Committee Head',
          organization: 'ACM Student Chapter',
          description: 'Organized 12 hands-on workshops on Data Structures & Web Development for 400+ junior students.'
        }
      ],
      version_status: 'tailored',
      quality_score: 94,
      created_at: new Date('2026-10-10T10:00:00Z').toISOString(),
      updated_at: new Date('2026-10-15T15:30:00Z').toISOString()
    },
    {
      id: 2,
      user_id: 2,
      title: 'Frontend Specialist Resume',
      target_role: 'Frontend Engineer',
      target_company: 'Swiggy',
      template_id: 'ats_minimal',
      personal_info: {
        fullName: 'Alex Sharma',
        email: 'student@internhub.com',
        phone: '+91 98765 43210',
        location: 'Bengaluru, India',
        linkedin: 'https://linkedin.com/in/alexsharma',
        github: 'https://github.com/alexsharma',
        portfolio: 'https://alexsharma.dev'
      },
      summary: 'Frontend-focused Computer Science student specializing in React, TypeScript, and modern UI engineering with strong focus on performance and WCAG accessibility standards.',
      education: [
        {
          id: 'edu-2',
          institution: 'University Institute of Technology',
          degree: 'Bachelor of Engineering',
          fieldOfStudy: 'Computer Science and Engineering',
          startDate: '2022',
          endDate: '2026',
          gpa: '8.85 / 10.0',
          coursework: 'Human-Computer Interaction, Web Development, Object-Oriented Design'
        }
      ],
      experience: [],
      projects: [
        {
          id: 'proj-f1',
          title: 'Accessible Component System',
          role: 'Frontend Author',
          techStack: 'React, TypeScript, TailwindCSS',
          liveUrl: 'https://ui.example.com',
          githubUrl: 'https://github.com/alexsharma/accessible-ui',
          bullets: [
            'Built 25+ fully accessible, keyboard-navigable components adhering to WCAG 2.1 AA benchmarks.',
            'Reduced bundle footprint by 45% using tree-shakable ESM modules and rollup optimization.'
          ]
        }
      ],
      skills: {
        languages: ['JavaScript', 'TypeScript', 'HTML5', 'CSS3'],
        frameworks: ['React', 'TailwindCSS', 'Vite', 'Redux Toolkit'],
        tools: ['Git', 'Figma', 'Jest', 'React Testing Library'],
        softSkills: ['UI/UX Design', 'Cross-functional Communication']
      },
      certifications: [],
      achievements: [],
      extracurriculars: [],
      version_status: 'draft',
      quality_score: 82,
      created_at: new Date('2026-10-12T09:00:00Z').toISOString(),
      updated_at: new Date('2026-10-12T09:00:00Z').toISOString()
    }
  ];

  const resumeAnalyses = [
    {
      id: 1,
      user_id: 2,
      resume_id: 1,
      resume_title: 'Full-Stack Software Engineer Resume',
      target_role: 'Full Stack Developer',
      job_description: 'Looking for a Full Stack Developer Intern proficient in React, Node.js, Express, REST APIs, and SQL. Experience with Docker, Redis, and automated unit testing is a plus.',
      score: 88,
      breakdown: {
        contactScore: 100,
        sectionCompletenessScore: 95,
        formattingScore: 90,
        actionVerbsScore: 85,
        metricScore: 80,
        keywordMatchScore: 82
      },
      skills_identified: ['React', 'Node.js', 'Express', 'JavaScript', 'TypeScript', 'Docker', 'Redis', 'MySQL', 'REST APIs', 'Git'],
      matching_keywords: ['React', 'Node.js', 'Express', 'REST APIs', 'SQL', 'Docker', 'Redis'],
      missing_keywords: ['Automated Unit Testing', 'Jest', 'CI/CD Pipelines'],
      suggestions: [
        {
          type: 'keyword',
          priority: 'high',
          title: 'Add Automated Testing Keywords',
          description: 'The job description explicitly mentions automated unit testing. Highlight Vitest, Jest, or Supertest in your Technical Skills.'
        },
        {
          type: 'metric',
          priority: 'medium',
          title: 'Quantify Secondary Project Outcomes',
          description: 'Project DevConnect has great technical depth; add measurable user acquisition or speedup metrics.'
        }
      ],
      extracted_text: 'Alex Sharma | student@internhub.com | Full Stack Developer with React, Node.js, Redis, Docker experience.',
      created_at: new Date('2026-10-16T12:00:00Z').toISOString()
    }
  ];

  const placementTasks = [
    {
      id: 1,
      user_id: 2,
      category: 'DSA',
      title: 'Complete Two Pointers & Sliding Window Mediums (15 problems)',
      description: 'Practice 3Sum, Container With Most Water, Minimum Window Substring on LeetCode.',
      priority: 'high',
      deadline: '2026-11-05',
      is_completed: true,
      completed_at: new Date('2026-10-14T10:00:00Z').toISOString(),
      created_at: new Date('2026-10-01T10:00:00Z').toISOString()
    },
    {
      id: 2,
      user_id: 2,
      category: 'DSA',
      title: 'Binary Trees & Graph BFS/DFS traversal practice',
      description: 'Solve Level Order Traversal, Lowest Common Ancestor, Number of Islands.',
      priority: 'high',
      deadline: '2026-11-12',
      is_completed: false,
      completed_at: null,
      created_at: new Date('2026-10-02T10:00:00Z').toISOString()
    },
    {
      id: 3,
      user_id: 2,
      category: 'Technical',
      title: 'Revise DBMS Indexing (B-Trees, Hash Index) & ACID properties',
      description: 'Understand isolation levels (Read Committed, Repeatable Read, Serializable) and transaction locks.',
      priority: 'high',
      deadline: '2026-11-02',
      is_completed: true,
      completed_at: new Date('2026-10-18T16:00:00Z').toISOString(),
      created_at: new Date('2026-10-03T10:00:00Z').toISOString()
    },
    {
      id: 4,
      user_id: 2,
      category: 'Technical',
      title: 'Review Operating Systems Virtual Memory & Paging concepts',
      description: 'Brush up Page Replacement Algorithms (LRU, FIFO), Thrashing, and Process Scheduling.',
      priority: 'medium',
      deadline: '2026-11-08',
      is_completed: false,
      completed_at: null,
      created_at: new Date('2026-10-04T10:00:00Z').toISOString()
    },
    {
      id: 5,
      user_id: 2,
      category: 'Aptitude',
      title: 'Practice 30 Time, Speed & Distance quantitative problems',
      description: 'Focus on relative speed, trains, and boats & streams formula drills.',
      priority: 'medium',
      deadline: '2026-11-15',
      is_completed: false,
      completed_at: null,
      created_at: new Date('2026-10-05T10:00:00Z').toISOString()
    },
    {
      id: 6,
      user_id: 2,
      category: 'HR',
      title: 'Draft STAR method responses for 5 behavioral leadership questions',
      description: 'Prepare structured answers for conflict resolution, failure, deadline crunch, and team leadership.',
      priority: 'high',
      deadline: '2026-11-04',
      is_completed: true,
      completed_at: new Date('2026-10-20T11:00:00Z').toISOString(),
      created_at: new Date('2026-10-06T10:00:00Z').toISOString()
    },
    {
      id: 7,
      user_id: 2,
      category: 'Communication',
      title: 'Rehearse 90-second technical elevator pitch',
      description: 'Record video practicing pacing, voice modulation, and clear articulation of core projects.',
      priority: 'medium',
      deadline: '2026-11-10',
      is_completed: false,
      completed_at: null,
      created_at: new Date('2026-10-07T10:00:00Z').toISOString()
    },
    {
      id: 8,
      user_id: 2,
      category: 'Projects',
      title: 'Deploy Live Demo of CloudTask and write OpenAPI specs',
      description: 'Ensure Swagger/Postman docs are publicly accessible and clean up README setup instructions.',
      priority: 'high',
      deadline: '2026-10-30',
      is_completed: true,
      completed_at: new Date('2026-10-16T14:00:00Z').toISOString(),
      created_at: new Date('2026-10-08T10:00:00Z').toISOString()
    }
  ];

  const studentCertifications = [
    {
      id: 1,
      user_id: 2,
      title: 'AWS Certified Cloud Practitioner',
      provider: 'Amazon Web Services',
      skill_name: 'Cloud Computing',
      skill_level: 'Intermediate',
      status: 'Completed',
      target_date: '2024-05-01',
      completed_date: '2024-05-15',
      credential_url: 'https://aws.amazon.com/verify/12345',
      created_at: new Date('2024-05-15T10:00:00Z').toISOString()
    },
    {
      id: 2,
      user_id: 2,
      title: 'Meta React Developer Professional Certificate',
      provider: 'Coursera',
      skill_name: 'React.js',
      skill_level: 'Advanced',
      status: 'Completed',
      target_date: '2024-08-15',
      completed_date: '2024-08-20',
      credential_url: 'https://coursera.org/verify/react123',
      created_at: new Date('2024-08-20T10:00:00Z').toISOString()
    },
    {
      id: 3,
      user_id: 2,
      title: 'Docker & Kubernetes Mastery Bootcamp',
      provider: 'Udemy',
      skill_name: 'DevOps & Containers',
      skill_level: 'Intermediate',
      status: 'In Progress',
      target_date: '2026-11-20',
      completed_date: null,
      credential_url: '',
      created_at: new Date('2026-09-01T10:00:00Z').toISOString()
    },
    {
      id: 4,
      user_id: 2,
      title: 'System Design for High Scalability',
      provider: 'Educative',
      skill_name: 'Distributed Systems',
      skill_level: 'Beginner',
      status: 'Not Started',
      target_date: '2026-12-15',
      completed_date: null,
      credential_url: '',
      created_at: new Date('2026-09-15T10:00:00Z').toISOString()
    }
  ];

  const interviewPracticeRecords = [
    {
      id: 1,
      user_id: 2,
      question_id: 'tech_1',
      category: 'technical',
      question_text: 'Explain the difference between SQL indexing with B-Trees and Hash Tables. When would you prefer one over the other?',
      user_answer: 'B-Trees support range queries (BETWEEN, >, <) and equality queries efficiently in O(log N) time because keys are kept sorted. Hash indexes provide O(1) average lookup for point equality (=) but cannot handle range queries or order by operations.',
      notes: 'Make sure to mention clustered vs non-clustered indexes as well.',
      is_practiced: true,
      practiced_at: new Date('2026-10-18T14:00:00Z').toISOString(),
      created_at: new Date('2026-10-18T14:00:00Z').toISOString()
    },
    {
      id: 2,
      user_id: 2,
      question_id: 'hr_1',
      category: 'hr',
      question_text: 'Describe a situation where you had a disagreement with a teammate regarding technical architecture. How was it resolved?',
      user_answer: 'During our hackathon, my teammate wanted to use MongoDB while I advocated for PostgreSQL because our relational schema required strict foreign keys. We benchmarked mock queries and agreed Postgres prevented data anomalies.',
      notes: 'Emphasize that the decision was data-driven rather than personal.',
      is_practiced: true,
      practiced_at: new Date('2026-10-19T11:00:00Z').toISOString(),
      created_at: new Date('2026-10-19T11:00:00Z').toISOString()
    }
  ];

  const vaultDocuments = [
    {
      id: 1,
      user_id: 2,
      name: 'FullStack_Software_Engineer_Razorpay.pdf',
      document_type: 'resume',
      file_url: 'https://example.com/vault/alex-sharma-razorpay.pdf',
      file_size: 142500,
      mime_type: 'application/pdf',
      application_id: 1,
      notes: 'Tailored specifically for Razorpay SDE intern role with Redis caching emphasis.',
      created_at: new Date('2026-10-12T10:00:00Z').toISOString()
    },
    {
      id: 2,
      user_id: 2,
      name: 'AWS_Cloud_Practitioner_Certificate.pdf',
      document_type: 'certificate',
      file_url: 'https://example.com/vault/alex-aws-cert.pdf',
      file_size: 210000,
      mime_type: 'application/pdf',
      application_id: null,
      notes: 'Official AWS verification score report.',
      created_at: new Date('2026-10-13T10:00:00Z').toISOString()
    },
    {
      id: 3,
      user_id: 2,
      name: 'Swiggy_Design_System_Cover_Letter.pdf',
      document_type: 'cover_letter',
      file_url: 'https://example.com/vault/swiggy-cover-letter.pdf',
      file_size: 85000,
      mime_type: 'application/pdf',
      application_id: 2,
      notes: 'Cover letter emphasizing frontend component design and WCAG accessibility.',
      created_at: new Date('2026-10-14T11:00:00Z').toISOString()
    }
  ];

  return {
    users,
    profiles,
    internships,
    savedInternships,
    applications,
    notifications,
    resumes,
    resumeAnalyses,
    placementTasks,
    studentCertifications,
    interviewPracticeRecords,
    vaultDocuments
  };
}

