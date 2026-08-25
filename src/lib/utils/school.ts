// School utility functions

export const getSchoolShortName = (): string => {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return ''; // No default — let the login form show the school input
  }

  // On a real subdomain like "sac.elitecbt.com", return "sac"
  const parts = hostname.split('.');
  if (parts.length >= 3) return parts[0];

  return '';
};

export const short_name = getSchoolShortName();
