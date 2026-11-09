import { describe, expect, it } from '@jest/globals';
import { stepsFor, tourRole, tourStorageKey } from './tourConfig';

describe('flow tour roles', () => {
  it('maps admin variants to the admin tour', () => {
    expect(tourRole('Admin')).toBe('admin');
    expect(tourRole('branch_admin')).toBe('admin');
    expect(stepsFor('Admin')?.[0].href).toBe('/dashboard');
  });

  it('maps teacher and form master to the teacher tour', () => {
    expect(tourRole('Teacher')).toBe('teacher');
    expect(tourRole('FormMaster')).toBe('teacher');
    expect(stepsFor('teacher')?.some((s) => s.target === 'teacher-create-exam')).toBe(true);
  });

  it('maps students to the student tour', () => {
    expect(tourRole('Student')).toBe('student');
    expect(stepsFor('student')?.some((s) => s.target === 'student-exam-tabs')).toBe(true);
  });

  it('keys storage per user and role', () => {
    expect(tourStorageKey('u1', 'admin')).toBe('cbt.tour.v1:u1:admin');
  });
});
