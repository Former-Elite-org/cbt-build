import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();
  const navigate = useNavigate();

  const login = async (credentials: {
    username: string;
    password: string;
    type: 'users' | 'students';
    short_name?: string;
    school_id?: string;
  }) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);

      // Multi-school: user has accounts in multiple schools
      if (response.requires_school_selection) {
        setLoading(false);
        return { success: true, requiresSchoolSelection: true, schools: response.schools, selection_token: response.selection_token };
      }

      if (response.success && response.token) {
        return await _completeLogin(response.token);
      } else {
        const errorMessage = response.message || Object.values(response.errors || {})[0] || 'Login failed';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      if (!error.message?.includes('requires_school_selection')) toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectSchool = async (selection_token: string, school_id: string) => {
    setLoading(true);
    try {
      const response = await authService.selectSchool(selection_token, school_id);
      if (response.success && response.token) {
        return await _completeLogin(response.token);
      }
      throw new Error(response.message || 'School selection failed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to select school');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const _completeLogin = async (token: string) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token.startsWith('Bearer ') ? token : `Bearer ${token}`);
    const userData = await authService.verifyToken(token);
    if (userData.success && userData.user) {
      setAuth(userData.user, token, {
        school: userData.school || null,
        school_locations: userData.school_locations || [],
        classes: userData.classes || [],
        subjects: userData.subjects || [],
        sections: userData.sections || [],
        selected_branch: userData.school_locations?.[0] || null,
      });
      toast.success('Login successful!');
      const isAdmin = (userData.user.user_type || '').toLowerCase().includes('admin');
      const needsOnboarding = isAdmin && (userData.user.first_login_completed === 0 || userData.user.first_login_completed === '0');
      return { success: true, user: userData.user, needsOnboarding };
    }
    throw new Error('Failed to fetch user profile');
  };

  const logout = async () => {
    await authService.logout();
    clearAuth();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    selectSchool,
  };
};
