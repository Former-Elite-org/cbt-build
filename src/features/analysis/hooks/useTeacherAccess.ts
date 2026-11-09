import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { isTeacherRole } from '@/lib/utils/roles';

export interface AccessSubjectOption {
  value: string;
  label: string;
}

export function useTeacherAccess() {
  const { user, selected_branch, classes, subjects } = useAuthStore();

  const isTeacher = isTeacherRole(user?.user_type);

  // Subject codes the user has access to (from verifyToken: teacher_classes for
  // teachers, the subjects table for admins/officers).
  const subjectCodes = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s: any) => {
      const code = s.subject_code || s.code || '';
      if (code) set.add(code);
    });
    return set;
  }, [subjects]);

  // Distinct subjects for dropdown selectors — real data from the store
  const subjectOptions = useMemo<AccessSubjectOption[]>(() => {
    const seen = new Set<string>();
    const opts: AccessSubjectOption[] = [];
    subjects.forEach((s: any) => {
      const value = s.subject_code || s.code || '';
      const label = s.subject || s.subject_name || s.name || value;
      if (value && !seen.has(value)) {
        seen.add(value);
        opts.push({ value, label });
      }
    });
    return opts;
  }, [subjects]);

  // Class codes the user has access to (from verifyToken: class_role for
  // teachers, the classes table for admins/officers).
  const classCodes = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c: any) => {
      const code = c.class_code || c.class_name || '';
      if (code) set.add(code);
    });
    return set;
  }, [classes]);

  // Distinct classes (by class name) for dropdown selectors — real data from the store
  const classOptions = useMemo<AccessSubjectOption[]>(() => {
    const seen = new Set<string>();
    const opts: AccessSubjectOption[] = [];
    classes.forEach((c: any) => {
      const name = c.class_name || '';
      if (name && !seen.has(name)) {
        seen.add(name);
        opts.push({ value: name, label: name });
      }
    });
    return opts;
  }, [classes]);

  // Classes the teacher is assigned for a specific subject (class × subject combos).
  // For non-teachers this is not constrained — all classes are available.
  const getClassesForSubject = (subjectCode: string | undefined | null): AccessSubjectOption[] => {
    if (!isTeacher || !subjectCode) return classOptions;
    const seen = new Set<string>();
    const opts: AccessSubjectOption[] = [];
    subjects.forEach((s: any) => {
      const code = s.subject_code || s.code || '';
      if (code !== subjectCode) return;
      const name = s.class_name || '';
      if (name && !seen.has(name)) {
        seen.add(name);
        opts.push({ value: name, label: name });
      }
    });
    return opts;
  };

  // Subjects assigned/available for a specific class. Teachers get their own
  // assignments; admins get the branch subjects belonging to that class.
  const getSubjectsForClass = (classValue: string | undefined | null): AccessSubjectOption[] => {
    if (!classValue) return subjectOptions;
    const classCodesForName = new Set(
      classes
        .filter((c: any) => c.class_name === classValue)
        .map((c: any) => c.class_code)
        .filter(Boolean)
    );
    const seen = new Set<string>();
    const opts: AccessSubjectOption[] = [];
    subjects.forEach((s: any) => {
      const matches =
        s.class_name === classValue ||
        (s.class_code && classCodesForName.has(s.class_code)) ||
        s.classCode === classValue;
      if (!matches) return;
      const value = s.subject_code || s.code || '';
      const label = s.subject || s.subject_name || s.name || value;
      if (value && !seen.has(value)) {
        seen.add(value);
        opts.push({ value, label });
      }
    });
    return opts;
  };

  const isAssignedSubject = (subjectCode: string | undefined | null): boolean => {
    if (!isTeacher) return true;
    return subjectCodes.has(subjectCode || '');
  };

  const isAssignedClass = (classCode: string | undefined | null): boolean => {
    if (!isTeacher) return true;
    return classCodes.has(classCode || '');
  };

  return {
    user,
    selected_branch,
    isTeacher,
    assignedClasses: classes,
    assignedSubjects: subjects,
    subjectCodes,
    classCodes,
    subjectOptions,
    classOptions,
    getClassesForSubject,
    getSubjectsForClass,
    isAssignedSubject,
    isAssignedClass,
  };
}
