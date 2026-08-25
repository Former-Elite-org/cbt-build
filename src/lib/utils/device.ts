import { STORAGE_KEYS } from './constants';

/**
 * Stable per-device identifier used to enforce the "one free practice
 * subject per device" rule.
 *
 * Persisted in localStorage so it survives logout and re-login on the same
 * browser/device — a student can't clear it by switching accounts, and the
 * backend keys the free grant on this value.
 */
const generateDeviceId = (): string => {
  const rand = () =>
    Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  return `dev_${rand()}${rand()}`;
};

export const getDeviceId = (): string => {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (existing) return existing;

    const fresh = generateDeviceId();
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, fresh);
    return fresh;
  } catch {
    // Storage unavailable (private mode / SSR) — fall back to a session value.
    return generateDeviceId();
  }
};
