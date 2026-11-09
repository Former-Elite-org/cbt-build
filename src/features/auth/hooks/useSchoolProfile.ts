import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { getSchoolShortName } from '@/lib/utils/school';

export type SchoolProfile = {
  school_id?: string;
  school_name: string;
  badge_url: string | null;
  short_name?: string;
};

function normalizeSchool(row: any): SchoolProfile | null {
  if (!row) return null;
  const school_name = String(row.school_name || row.name || '').trim();
  const badge_url = row.badge_url || null;
  if (!school_name && !badge_url) return null;
  return {
    school_id: row.school_id,
    school_name: school_name || 'Elite CBT',
    badge_url,
    short_name: row.short_name ? String(row.short_name).toLowerCase() : undefined,
  };
}

/** School branding for the current tenant (session first, then hostname lookup). */
export function useSchoolProfile(): SchoolProfile | null {
  const stored = useAuthStore((s) => s.school);
  const user = useAuthStore((s) => s.user);
  const [fetched, setFetched] = useState<SchoolProfile | null>(null);
  const fromStore = normalizeSchool(stored);
  const hostShort = getSchoolShortName();
  const userShort = String((user as any)?.short_name || '').trim().toLowerCase();

  useEffect(() => {
    if (normalizeSchool(stored)) return;
    const sn = hostShort || userShort;
    if (!sn) return;
    let cancelled = false;
    authService
      .getSchoolDetails(sn)
      .then((res) => {
        if (cancelled) return;
        const row = res.success && Array.isArray(res.data) ? res.data[0] : null;
        setFetched(normalizeSchool(row));
      })
      .catch(() => {
        if (!cancelled) setFetched(null);
      });
    return () => {
      cancelled = true;
    };
  }, [stored, hostShort, userShort]);

  return fromStore || fetched;
}
