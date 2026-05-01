/**
 * Validation utilities for API inputs
 */

export function validateUUID(value) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateProjectName(name) {
  return name && typeof name === 'string' && name.trim().length > 0 && name.length <= 255;
}

export function validateRiskTolerance(value) {
  return ['AGGRESSIVE', 'BALANCED', 'CONSERVATIVE'].includes(value);
}

export function validateArray(value, minLength = 0) {
  return Array.isArray(value) && value.length >= minLength;
}

export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
}
