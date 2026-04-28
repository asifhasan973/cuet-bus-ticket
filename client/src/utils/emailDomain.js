const ALLOWED_EMAIL_DOMAINS = ['cuet.ac.bd', 'student.cuet.ac.bd'];

export const ALLOWED_EMAIL_MESSAGE = 'Use a CUET email address ending in @cuet.ac.bd or @student.cuet.ac.bd';

export const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

export const isAllowedInstitutionEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  const atIndex = normalizedEmail.lastIndexOf('@');

  if (atIndex === -1) {
    return false;
  }

  return ALLOWED_EMAIL_DOMAINS.includes(normalizedEmail.slice(atIndex + 1));
};
