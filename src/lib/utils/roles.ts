export function normalizeUserType(userType?: string | null): string {
  return String(userType || '')
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

export function isAdminRole(userType?: string | null): boolean {
  const t = normalizeUserType(userType);
  return (
    t.includes('admin') ||
    t === 'proprietor' ||
    t === 'principal' ||
    t === 'director' ||
    t === 'owner'
  );
}

export function isTeacherRole(userType?: string | null): boolean {
  const t = normalizeUserType(userType);
  return t === 'teacher' || t === 'formmaster' || t === 'examofficer';
}

export function isStudentRole(userType?: string | null): boolean {
  return normalizeUserType(userType) === 'student';
}

export function withBearer(token: string): string {
  const value = String(token || '').trim();
  if (!value) return value;
  return /^bearer\s+/i.test(value) ? value : `Bearer ${value}`;
}
