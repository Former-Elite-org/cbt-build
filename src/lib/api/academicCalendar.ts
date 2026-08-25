import { _get } from '@/Helper';
import { getSchoolContext } from '@/lib/utils/school';

// Mirrors elite-core: get-academic-years?query_type=select&school_id=...&branch_id=...
// The active term is the calendar row with status === 'Active' for the branch.
export interface AcademicCalendarEntry {
  term: string;
  academic_year: string;
  begin_date?: string;
  end_date?: string;
  status: string;
  branch_id?: string;
  id?: string;
  [key: string]: any;
}

export interface ActiveTerm {
  term: string;
  academic_year: string;
  termLabel: string; // "First Term 2024/2025"
}

export const fetchAcademicCalendar = (
  school_id?: string,
  branch_id?: string
): Promise<AcademicCalendarEntry[]> => {
  return new Promise((resolve) => {
    const ctx = getSchoolContext();
    const schoolId = school_id || ctx.school_id;
    const branchId = branch_id || ctx.branch_id;

    if (!schoolId || !branchId) {
      resolve([]);
      return;
    }

    _get(
      `get-academic-years?query_type=select&school_id=${schoolId}&branch_id=${branchId}`,
      (res: any) => {
        if (res?.success) {
          const dataArray = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.results)
              ? res.results
              : [];
          resolve(dataArray);
        } else {
          resolve([]);
        }
      },
      () => resolve([])
    );
  });
};

export const findActiveTerm = (
  calendar: AcademicCalendarEntry[]
): AcademicCalendarEntry | undefined =>
  (Array.isArray(calendar) ? calendar : []).find(
    (c) =>
      c.status?.toLowerCase() === 'active' &&
      c.branch_id === (getSchoolContext().branch_id || c.branch_id)
  ) ||
  (Array.isArray(calendar) ? calendar : []).find(
    (c) => c.status?.toLowerCase() === 'active'
  );

export const getActiveTerm = async (
  school_id?: string,
  branch_id?: string
): Promise<ActiveTerm | null> => {
  const calendar = await fetchAcademicCalendar(school_id, branch_id);
  const active = findActiveTerm(calendar);
  if (!active) return null;

  const term = active.term || '';
  const academic_year = active.academic_year || '';
  return {
    term,
    academic_year,
    termLabel: [term, academic_year].filter(Boolean).join(' • '),
  };
};
