import { FLAGSHIP_BASE_DOMAINS } from './flagship';

const MULTI_TLDS = ['com.ng', 'co.uk', 'org.ng', 'net.ng', 'edu.ng', 'gov.ng'];
const RESERVED_LABELS = new Set([
  'www',
  'app',
  'api',
  'admin',
  'portal',
  'staging',
  'test',
  'localhost',
]);
const PRODUCT_LABELS = new Set([
  'elitesms',
  'elitecbt',
  'elitecore',
  'elitefin',
  'elitekids',
  'elscholar',
]);

function isIpHost(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':') || host.startsWith('[');
}

function isValidTenantLabel(label: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label);
}

/**
 * Tenant short name from the CBT hostname.
 *
 * Match the longest flagship base (elitecbt.com.ng before elitecbt.com), then
 * take the label immediately before it. Product labels such as `elitesms`
 * are skipped so a mis-built host like demo.elitesms.elitecbt.com.ng still
 * resolves to `demo`. Apex flagship hosts are not a school.
 */
export function getSchoolShortName(hostname?: string): string {
  const host = (hostname ?? (typeof window !== 'undefined' ? window.location.hostname : ''))
    .toLowerCase()
    .replace(/^www\./, '')
    .split(':')[0]
    .trim();

  if (!host || host === 'localhost' || host === '127.0.0.1' || isIpHost(host)) return '';

  const bases = [...FLAGSHIP_BASE_DOMAINS].sort((a, b) => b.length - a.length);
  for (const base of bases) {
    if (host === base) return '';
    if (!host.endsWith(`.${base}`)) continue;

    const labels = host
      .slice(0, -(base.length + 1))
      .split('.')
      .filter((label) => label && label !== 'www');
    while (labels.length && PRODUCT_LABELS.has(labels[labels.length - 1])) {
      labels.pop();
    }
    const tenant = labels[labels.length - 1] || '';
    if (!tenant || RESERVED_LABELS.has(tenant) || PRODUCT_LABELS.has(tenant)) return '';
    return isValidTenantLabel(tenant) ? tenant : '';
  }

  const parts = host.split('.').filter(Boolean);
  const lastTwo = parts.slice(-2).join('.');
  const minParts = MULTI_TLDS.includes(lastTwo) ? 4 : 3;
  if (parts.length < minParts) return '';

  const sub = parts[0];
  if (!sub || RESERVED_LABELS.has(sub) || PRODUCT_LABELS.has(sub)) return '';
  return isValidTenantLabel(sub) ? sub : '';
}

export const short_name = getSchoolShortName();
