/**
 * InternHub Password Security Policy
 * Length requirement: 8–15 characters inclusive
 * Complexity requirement: At least 1 uppercase letter, 1 number, and 1 special character
 */

export const PASSWORD_CONSTRAINTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 15,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true
};

export function validatePasswordPolicy(password) {
  if (typeof password !== 'string') {
    return {
      valid: false,
      length: 0,
      message: 'Password is required and must be a string.'
    };
  }

  const length = password.length;

  if (length < PASSWORD_CONSTRAINTS.MIN_LENGTH || length > PASSWORD_CONSTRAINTS.MAX_LENGTH) {
    return {
      valid: false,
      length,
      message: `Password length must be between 8 and 15 characters inclusive (provided: ${length}).`
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      length,
      message: 'Password must contain at least one uppercase letter.'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      length,
      message: 'Password must contain at least one number.'
    };
  }

  // Special characters: common symbols
  if (!/[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/`~]/.test(password)) {
    return {
      valid: false,
      length,
      message: 'Password must contain at least one special character (!@#$%^&* etc.).'
    };
  }

  return {
    valid: true,
    length,
    message: 'Password satisfies all security policy criteria.'
  };
}
