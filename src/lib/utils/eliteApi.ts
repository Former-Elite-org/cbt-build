/** Shared Elite SMS API (handoff tickets, suite apps). Not the CBT prefix. */
export function eliteApiUrl(): string {
  const explicit = String(import.meta.env.VITE_ELITE_API_URL || '').replace(/\/$/, '');
  if (explicit) return explicit;
  const cbt = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (cbt.includes('/elite-cbt')) return cbt.replace(/\/elite-cbt$/, '/elite-api');
  return 'https://server.brainstorm.ng/elite-api';
}
