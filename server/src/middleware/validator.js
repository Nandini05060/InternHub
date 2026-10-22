import { validatePasswordPolicy } from '../utils/passwordPolicy.js';

export function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  // Password Boundary Value and Complexity Policy (8-15 chars, uppercase, number, special char)
  const pwdValidation = validatePasswordPolicy(password);
  if (!pwdValidation.valid) {
    errors.push(pwdValidation.message);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || (typeof email === 'string' && email.trim() === '')) {
    errors.push('Email is required.');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address.');
    }
  }

  if (!password || (typeof password === 'string' && password === '')) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' '),
      errors
    });
  }

  next();
}

export function validateInternship(req, res, next) {
  const { title, company_name, location, category, stipend, duration, application_link, deadline, description, requirements } = req.body;
  const missing = [];

  if (!title) missing.push('title');
  if (!company_name) missing.push('company_name');
  if (!location) missing.push('location');
  if (!category) missing.push('category');
  if (!stipend) missing.push('stipend');
  if (!duration) missing.push('duration');
  if (!application_link) missing.push('application_link');
  if (!deadline) missing.push('deadline');
  if (!description) missing.push('description');
  if (!requirements) missing.push('requirements');

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required internship fields: ${missing.join(', ')}`,
      missing
    });
  }

  next();
}
