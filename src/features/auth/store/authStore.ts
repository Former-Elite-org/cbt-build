import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selected_branch: any | null;
  school_locations: any[];
  classes: any[];
  subjects: any[];
  sections: any[];
  setAuth: (user: User, token: string, additionalData?: any) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  setSelectedBranch: (branch: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      selected_branch: null,
      school_locations: [],
      classes: [],
      subjects: [],
      sections: [],
      setAuth: (user, token, additionalData = {}) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          selected_branch: additionalData.selected_branch || additionalData.school_locations?.[0] || null,
          school_locations: additionalData.school_locations || [],
          classes: additionalData.classes || [],
          subjects: additionalData.subjects || [],
          sections: additionalData.sections || [],
        }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          selected_branch: null,
          school_locations: [],
          classes: [],
          subjects: [],
          sections: [],
        }),
      setLoading: (isLoading) => set({ isLoading }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setSelectedBranch: (branch) => set({ selected_branch: branch }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        selected_branch: state.selected_branch,
      }),
    }
  )
);

