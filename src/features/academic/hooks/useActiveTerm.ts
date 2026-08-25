import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useActiveTermStore } from '@/features/academic/store/activeTermStore';

// Keeps the active term/year in sync with the logged-in user's school + branch.
// Mirrors elite-core's header behavior: fetch the academic calendar and pick
// the row with status === 'Active'.
export const useActiveTerm = () => {
  const { user, selected_branch } = useAuthStore();
  const { activeTerm, loading, loaded, error, refresh } = useActiveTermStore();

  useEffect(() => {
    const school_id = user?.school_id || selected_branch?.school_id;
    const branch_id = selected_branch?.branch_id || user?.branch_id;
    if (school_id && branch_id) {
      refresh(school_id, branch_id);
    }
  }, [user?.school_id, selected_branch?.branch_id, selected_branch?.school_id, refresh]);

  return { activeTerm, loading, loaded, error };
};
