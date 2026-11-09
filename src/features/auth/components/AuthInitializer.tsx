import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { eliteApiUrl } from '@/lib/utils/eliteApi';
import { withBearer } from '@/lib/utils/roles';

function stripHandoffParams() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.delete('handoff_ticket');
  params.delete('token');
  const search = params.toString();
  const next = window.location.pathname + (search ? `?${search}` : '') + window.location.hash;
  window.history.replaceState({}, '', next);
}

/**
 * Restore session on load. Elite SMS opens this app with ?handoff_ticket=
 * (legacy links used ?token=). Neither must be left in the address bar.
 */
export function AuthInitializer() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const ticket = params.get('handoff_ticket');
      const urlToken = params.get('token');

      setLoading(true);
      try {
        if (ticket) {
          stripHandoffParams();
          const res = await fetch(`${eliteApiUrl()}/api/apps/cbt/redeem-ticket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket }),
          });
          const data = await res.json().catch(() => null);
          if (data?.ok && data?.token) {
            await hydrate(withBearer(data.token));
            return;
          }
          clearAuth();
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          return;
        }

        const storedToken = urlToken
          ? withBearer(urlToken)
          : localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (urlToken) stripHandoffParams();

        if (!storedToken) {
          setLoading(false);
          return;
        }

        await hydrate(storedToken);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuth();
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      } finally {
        setLoading(false);
      }
    };

    const hydrate = async (token: string) => {
      const bearer = withBearer(token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, bearer);
      const userData = await authService.verifyToken(bearer);
      if (userData.success && userData.user) {
        setAuth(userData.user, bearer, {
          school: userData.school || null,
          school_locations: userData.school_locations || [],
          classes: userData.classes || [],
          subjects: userData.subjects || [],
          sections: userData.sections || [],
          selected_branch: userData.school_locations?.[0] || null,
        });
        if (userData.user.school_id) {
          localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, userData.user.school_id);
        }
      } else {
        clearAuth();
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    };

    initAuth();
  }, [setAuth, clearAuth, setLoading]);

  return null;
}
