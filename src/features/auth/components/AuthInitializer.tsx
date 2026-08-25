import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '@/lib/utils/constants';

/**
 * Component to initialize auth state on app load
 * This runs once and prevents infinite loading
 */
export function AuthInitializer() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      // No token = user not logged in, stop loading
      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Try to verify token
      setLoading(true);
      try {
        const userData = await authService.verifyToken(storedToken);
        if (userData.success && userData.user) {
          setAuth(userData.user, storedToken, {
            school_locations: userData.school_locations || [],
            classes: userData.classes || [],
            subjects: userData.subjects || [],
            sections: userData.sections || [],
            selected_branch: userData.school_locations?.[0] || null,
          });
        } else {
          clearAuth();
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuth();
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setAuth, clearAuth, setLoading]);

  return null; // This component doesn't render anything
}

