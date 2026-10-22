import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ResumePreview } from '../components/resume/ResumePreview.jsx';
import { ResumeQualityWidget } from '../components/resume/ResumeQualityWidget.jsx';
import { ResumeEditorForm } from '../components/resume/ResumeEditorForm.jsx';
import { generateResumePdf } from '../utils/pdfGenerator.js';

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    jsPDF: vi.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          getWidth: () => 595.28,
          getHeight: () => 841.89
        }
      },
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      setTextColor: vi.fn(),
      setDrawColor: vi.fn(),
      setLineWidth: vi.fn(),
      text: vi.fn(),
      line: vi.fn(),
      addPage: vi.fn(),
      getTextWidth: vi.fn().mockReturnValue(100),
      splitTextToSize: vi.fn((text) => [text]),
      link: vi.fn(),
      save: vi.fn()
    }))
  };
});

describe('Career Tools & Resume Builder Frontend Test Suite', () => {
  const sampleResume = {
    title: 'Alex Sharma - SWE Intern',
    target_role: 'Full Stack Developer',
    template_name: 'ats-minimal',
    personal_info: {
      fullName: 'Alex Sharma',
      email: 'alex.sharma@example.com',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      linkedin: 'https://linkedin.com/in/alexsharma',
      github: 'https://github.com/alexsharma',
      portfolio: 'https://alexsharma.dev'
    },
    summary: 'Proactive Computer Science student experienced in React, Node.js, and SQL with proven record of delivering responsive web applications.',
    education: [
      {
        institution: 'National Institute of Technology Karnataka',
        degree: 'B.Tech in Information Technology',
        location: 'Surathkal, India',
        startDate: '2023-08',
        endDate: '2027-05',
        score: '8.8 / 10 CGPA'
      }
    ],
    experience: [
      {
        company: 'CloudScale Technologies',
        role: 'Software Engineering Intern',
        location: 'Remote',
        startDate: '2025-05',
        endDate: '2025-07',
        bulletPoints: [
          'Engineered RESTful microservices reducing API latency by 28%.',
          'Collaborated with a cross-functional team of 6 engineers.'
        ]
      }
    ],
    projects: [
      {
        title: 'InternHub Platform',
        techStack: 'React, Node.js, MySQL, Tailwind CSS',
        link: 'https://github.com/alexsharma/internhub',
        bulletPoints: [
          'Architected role-based authentication and real-time application pipeline.',
          'Increased user engagement by 40% through intuitive UI.'
        ]
      }
    ],
    skills: {
      languages: 'JavaScript, Python, C++, SQL',
      frameworks: 'React, Express.js, Node.js, Tailwind CSS',
      tools: 'Git, Docker, Postman, Vite',
      core: 'Data Structures & Algorithms, Object-Oriented Design, DBMS'
    },
    certifications: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Coursera',
        date: '2025-04',
        url: 'https://coursera.org/verify/123'
      }
    ]
  };

  it('TC_CAR_FE_01: Renders Resume Preview with ATS standard sections and candidate info', () => {
    render(<ResumePreview resume={sampleResume} templateName="ats-minimal" />);

    expect(screen.getByText('Alex Sharma')).toBeInTheDocument();
    expect(screen.getByText(/alex.sharma@example.com/i)).toBeInTheDocument();
    expect(screen.getByText('National Institute of Technology Karnataka')).toBeInTheDocument();
    expect(screen.getByText('CloudScale Technologies')).toBeInTheDocument();
    expect(screen.getByText('InternHub Platform')).toBeInTheDocument();
    expect(screen.getByText(/JavaScript, Python, C\+\+, SQL/i)).toBeInTheDocument();
  });

  it('TC_CAR_FE_02: Switches template rendering seamlessly across styles', () => {
    const { rerender } = render(<ResumePreview resume={sampleResume} templateName="ats-minimal" />);
    expect(screen.getByText('Alex Sharma')).toBeInTheDocument();

    rerender(<ResumePreview resume={sampleResume} templateName="software-developer" />);
    expect(screen.getByText('Alex Sharma')).toBeInTheDocument();

    rerender(<ResumePreview resume={sampleResume} templateName="fresher" />);
    expect(screen.getByText('Alex Sharma')).toBeInTheDocument();

    rerender(<ResumePreview resume={sampleResume} templateName="internship" />);
    expect(screen.getByText('Alex Sharma')).toBeInTheDocument();
  });

  it('TC_CAR_FE_03: Live ResumeQualityWidget computes high score and shows section completion', () => {
    const sampleAudit = {
      score: 85,
      breakdown: {
        contactScore: 15,
        sectionCompletenessScore: 25,
        actionVerbsScore: 20,
        metricScore: 12,
        formattingScore: 13
      },
      strengths: ['Great action verbs', 'Complete contact details'],
      issues: [],
      suggestions: [{ type: 'action_verbs', message: 'Enhance metrics' }]
    };

    render(<ResumeQualityWidget audit={sampleAudit} />);

    // Score gauge and sections
    expect(screen.getByText(/Resume Quality Checker/i)).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText(/Audit Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Section Completeness/i)).toBeInTheDocument();
    expect(screen.getByText(/Action Verbs/i)).toBeInTheDocument();
  });

  it('TC_CAR_FE_04: ResumeEditorForm allows field editing and communicates state changes', () => {
    const handleUpdate = vi.fn();
    render(<ResumeEditorForm resume={sampleResume} onChange={handleUpdate} />);

    const fullNameInput = screen.getByLabelText(/Full Name/i);
    expect(fullNameInput).toBeInTheDocument();
    expect(fullNameInput.value).toBe('Alex Sharma');

    fireEvent.change(fullNameInput, { target: { value: 'Alex Sharma II' } });
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        personal_info: expect.objectContaining({
          fullName: 'Alex Sharma II'
        })
      })
    );
  });

  it('TC_CAR_FE_05: Native vector PDF generator executes without exceptions', () => {
    const doc = generateResumePdf(sampleResume, { filename: 'test_resume.pdf' });
    expect(doc).toBeDefined();
    expect(doc.save).toHaveBeenCalled();
  });
});
