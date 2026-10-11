const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+234\d{10,}$/;
const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const STRIP_HTML_REGEX = /<[^>]*>/g;

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName || 'This field'} is required.`;
  }
  return null;
}

export function validateEmail(value) {
  if (!value || !value.trim()) return 'Email is required.';
  if (!EMAIL_REGEX.test(value.trim())) return 'Enter a valid email address.';
  return null;
}

export function validatePhone(value) {
  if (!value || !value.trim()) return 'Phone number is required.';
  if (!PHONE_REGEX.test(value.trim())) return 'Enter a valid Nigerian phone number (e.g. +234 812 345 6789).';
  return null;
}

export function validateAmount(value) {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return 'Enter a valid amount greater than 0.';
  return null;
}

export function sanitizeInput(value) {
  if (!value || typeof value !== 'string') return value;
  return value
    .replace(SCRIPT_TAG_REGEX, '')
    .replace(STRIP_HTML_REGEX, '')
    .trim();
}

export function validateLength(value, max, fieldName) {
  if (value && value.length > max) {
    return `${fieldName || 'This field'} cannot exceed ${max} characters.`;
  }
  return null;
}

export function validateForm(rules) {
  const errors = {};
  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const error = validator();
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
