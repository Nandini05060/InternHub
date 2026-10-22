import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { CATEGORIES } from '../internships/InternshipFilter.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { internshipApi } from '../../api/internshipApi.js';

export function AddEditInternshipModal({ isOpen, onClose, internship, onSaveSuccess }) {
  const toast = useToast();
  const isEditing = Boolean(internship && internship.id);

  const initialForm = {
    title: '',
    company_name: '',
    company_logo: '',
    location: '',
    work_type: 'remote',
    category: 'Software Engineering',
    stipend: '₹30,000 / month',
    duration: '3 Months',
    application_link: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    requirements: '',
    perks: 'Certificate of completion, Flexible work hours, Mentorship',
    verification_status: 'verified'
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (internship) {
      setFormData({
        title: internship.title || '',
        company_name: internship.company_name || '',
        company_logo: internship.company_logo || '',
        location: internship.location || '',
        work_type: internship.work_type || 'remote',
        category: internship.category || 'Software Engineering',
        stipend: internship.stipend || '',
        duration: internship.duration || '3 Months',
        application_link: internship.application_link || '',
        deadline: internship.deadline ? internship.deadline.split('T')[0] : '',
        description: internship.description || '',
        requirements: internship.requirements || '',
        perks: internship.perks || '',
        verification_status: internship.verification_status || 'verified'
      });
    } else {
      setFormData(initialForm);
    }
  }, [internship, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await internshipApi.updateInternship(internship.id, formData);
        toast.success('Internship updated successfully!');
      } else {
        await internshipApi.createInternship(formData);
        toast.success('Internship published successfully!');
      }
      onClose();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save internship');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Internship Listing' : 'Post New Verified Internship'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Title and Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Role Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Backend Developer Intern"
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="company_name"
              required
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g. Razorpay"
              className="input-base"
            />
          </div>
        </div>

        {/* Row 2: Category and Work Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category / Domain *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-base cursor-pointer"
            >
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Work Mode *
            </label>
            <select
              name="work_type"
              value={formData.work_type}
              onChange={handleChange}
              className="input-base cursor-pointer"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru, India or Remote"
              className="input-base"
            />
          </div>
        </div>

        {/* Row 3: Stipend, Duration, Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Stipend *
            </label>
            <input
              type="text"
              name="stipend"
              required
              value={formData.stipend}
              onChange={handleChange}
              placeholder="e.g. ₹40,000 / month"
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Duration *
            </label>
            <input
              type="text"
              name="duration"
              required
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 6 Months"
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Application Deadline *
            </label>
            <input
              type="date"
              name="deadline"
              required
              value={formData.deadline}
              onChange={handleChange}
              className="input-base"
            />
          </div>
        </div>

        {/* Application Link */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Official Career Application URL *
          </label>
          <input
            type="url"
            name="application_link"
            required
            value={formData.application_link}
            onChange={handleChange}
            placeholder="https://company.com/careers/job-id-123"
            className="input-base"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Direct URL where students submit their application. No spam links allowed.
          </span>
        </div>

        {/* Company Logo URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Company Logo Image URL
          </label>
          <input
            type="url"
            name="company_logo"
            value={formData.company_logo}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/... or company logo CDN"
            className="input-base"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Role Description & Team Overview *
          </label>
          <textarea
            name="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Detail the daily responsibilities, product area, and learning outcomes..."
            className="input-base"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Requirements & Tech Stack *
          </label>
          <textarea
            name="requirements"
            rows={3}
            required
            value={formData.requirements}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, Express, MySQL. Year of study requirement..."
            className="input-base"
          />
        </div>

        {/* Perks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Perks & Benefits
          </label>
          <input
            type="text"
            name="perks"
            value={formData.perks}
            onChange={handleChange}
            placeholder="e.g. PPO opportunity, Certificate, Flexible hours, Remote stipend"
            className="input-base"
          />
        </div>

        {/* Verification Status */}
        <div className="flex items-center gap-4 pt-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Verification Status:
          </label>
          <div className="flex items-center gap-3">
            {['verified', 'pending', 'rejected'].map(st => (
              <label key={st} className="flex items-center gap-1.5 text-xs font-medium text-slate-700 capitalize cursor-pointer">
                <input
                  type="radio"
                  name="verification_status"
                  value={st}
                  checked={formData.verification_status === st}
                  onChange={handleChange}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                {st}
              </label>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary text-xs shadow-sm">
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
