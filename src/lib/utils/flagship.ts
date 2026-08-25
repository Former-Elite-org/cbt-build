// Flagship practice academy helpers.
//
// The subdomains here are reserved for our own in-app school — "Elite Practice
// Academy" (SCH-ELITE) — which runs the JAMB/WAEC/NECO past-question practice
// portal. Visitors on these hosts sign up as *students* (no school creation).
//
//   • elite.elitecbt.com.ng  → "elite"     → flagship ✓
//   • practice.elitecbt.com.ng → "practice" → flagship ✓
//   • elitecbt.com.ng         → no sub but flagship domain → flagship ✓
//   • localhost (dev)         → flagship ✓ (so you can test locally)
//   • test.elitecbt.com.ng    → staging host → NOT a live flagship ✗
//   • pts.elitecbt.com.ng     → "pts"      → subscribing (SaaS) school ✗
export const FLAGSHIP_SUBDOMAINS = ['elite', 'practice'];
export const FLAGSHIP_BASE_DOMAINS = ['elitecbt.com.ng', 'elitecore.com.ng', 'elitecbt.com', 'elitecore.com'];

export const isFlagshipSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();

  // Always treat localhost as flagship so devs can register test students
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

  // Check if one of the known flagship subdomains is the leftmost label
  const subdomain = hostname.split('.')[0] || '';
  if (FLAGSHIP_SUBDOMAINS.includes(subdomain)) return true;

  // Check if the hostname itself (no subdomain) is a flagship base domain,
  // e.g. navigating to https://elitecbt.com.ng directly
  if (FLAGSHIP_BASE_DOMAINS.some((d) => hostname === d)) return true;

  return false;
};
