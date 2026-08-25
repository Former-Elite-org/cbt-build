import { create } from 'zustand';
import { getActiveTerm, ActiveTerm } from '@/lib/api/academicCalendar';

interface ActiveTermState {
  activeTerm: ActiveTerm | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  refresh: (school_id?: string, branch_id?: string) => Promise<ActiveTerm | null>;
  clear: () => void;
}

export const useActiveTermStore = create<ActiveTermState>((set) => ({
  activeTerm: null,
  loading: false,
  loaded: false,
  error: null,

  refresh: async (school_id?, branch_id?) => {
    set({ loading: true, error: null });
    try {
      const activeTerm = await getActiveTerm(school_id, branch_id);
      set({ activeTerm, loading: false, loaded: true });
      return activeTerm;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load academic term', loading: false, loaded: true });
      return null;
    }
  },

  clear: () => set({ activeTerm: null, loading: false, loaded: false, error: null }),
}));
