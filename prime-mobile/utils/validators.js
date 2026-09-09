// PRIME System — Validation functions

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Invalid email address format';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateRequired = (val, fieldName = 'Field') => {
  if (val === null || val === undefined || String(val).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateNumber = (val, fieldName = 'Field', { min, max } = {}) => {
  const reqErr = validateRequired(val, fieldName);
  if (reqErr) return reqErr;

  const num = Number(val);
  if (isNaN(num)) return `${fieldName} must be a valid number`;
  if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
  if (max !== undefined && num > max) return `${fieldName} cannot exceed ${max}`;
  return null;
};
