import { FLAGSHIP_BASE_DOMAINS } from './flagship';

const MULTI_TLDS = ['com.ng', 'co.uk', 'org.ng', 'net.ng', 'edu.ng', 'gov.ng'];
const RESERVED_LABELS = [
  'www',
  'app',
  'api',
  'admin',
  'portal',
  'staging',
  'test',
  'localhost',
];

/**
 * Tenant short name from the CBT hostname.
 *
 * Apex flagship hosts (elitecbt.com.ng) are not a school. Real school
 * subdomains need four labels on .com.ng (dkg.elitecbt.com.ng → "dkg").
 * `demo.elitecbt.com.ng` is the demo school, so "demo" is returned.
 */
export function getSchoolShortName(hostname?: string): string {
  const host = (hostname ?? (typeof window !== 'undefined' ? window.location.hostname : ''))
    .toLowerCase()
    .replace(/^www\./, '');

  if (!host || host === 'localhost' || host === '127.0.0.1') return '';
  if (FLAGSHIP_BASE_DOMAINS.some((d) => host === d)) return '';

  const parts = host.split('.').filter(Boolean);
  const lastTwo = parts.slice(-2).join('.');
  const minParts = MULTI_TLDS.includes(lastTwo) ? 4 : 3;
  if (parts.length < minParts) return '';

  const sub = parts[0];
  if (!sub || RESERVED_LABELS.includes(sub)) return '';
  return sub;
}

export const short_name = getSchoolShortName();
