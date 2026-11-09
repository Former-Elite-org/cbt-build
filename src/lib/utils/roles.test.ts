import { describe, expect, it } from '@jest/globals';
import { isAdminRole, isStudentRole, isTeacherRole, withBearer } from './roles';

describe('role helpers', () => {
  it('matches admin variants', () => {
    expect(isAdminRole('Admin')).toBe(true);
    expect(isAdminRole('branch_admin')).toBe(true);
    expect(isAdminRole('Teacher')).toBe(false);
  });

  it('matches teacher and form master, ignoring case', () => {
    expect(isTeacherRole('teacher')).toBe(true);
    expect(isTeacherRole('FormMaster')).toBe(true);
    expect(isTeacherRole('exam_officer')).toBe(true);
    expect(isTeacherRole('Student')).toBe(false);
  });

  it('matches students ignoring case', () => {
    expect(isStudentRole('Student')).toBe(true);
    expect(isStudentRole('student')).toBe(true);
    expect(isStudentRole('Admin')).toBe(false);
  });

  it('prefixes Bearer once', () => {
    expect(withBearer('abc')).toBe('Bearer abc');
    expect(withBearer('Bearer abc')).toBe('Bearer abc');
  });
});
