const ALLOWED_EMAIL_DOMAINS = ['cuet.ac.bd', 'student.cuet.ac.bd'];
const ALLOWED_EMAIL_MESSAGE = 'Use a CUET email address ending in @cuet.ac.bd or @student.cuet.ac.bd';

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const getEmailDomain = (email = '') => {
  const normalizedEmail = normalizeEmail(email);
  const atIndex = normalizedEmail.lastIndexOf('@');

  if (atIndex === -1) {
    return '';
  }

  return normalizedEmail.slice(atIndex + 1);
};

const isAllowedInstitutionEmail = (email) => {
  return ALLOWED_EMAIL_DOMAINS.includes(getEmailDomain(email));
};

module.exports = {
  ALLOWED_EMAIL_DOMAINS,
  ALLOWED_EMAIL_MESSAGE,
  normalizeEmail,
  isAllowedInstitutionEmail,
};
