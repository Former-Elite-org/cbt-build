import { describe, expect, it } from '@jest/globals';
import { getSchoolShortName } from './school';

describe('getSchoolShortName', () => {
  it('treats the flagship apex as no school', () => {
    expect(getSchoolShortName('elitecbt.com.ng')).toBe('');
    expect(getSchoolShortName('www.elitecbt.com.ng')).toBe('');
    expect(getSchoolShortName('localhost')).toBe('');
  });

  it('reads the tenant from a school subdomain', () => {
    expect(getSchoolShortName('dkg.elitecbt.com.ng')).toBe('dkg');
    expect(getSchoolShortName('demo.elitecbt.com.ng')).toBe('demo');
    expect(getSchoolShortName('pts.elitecbt.com.ng')).toBe('pts');
  });

  it('ignores infrastructure labels', () => {
    expect(getSchoolShortName('api.elitecbt.com.ng')).toBe('');
    expect(getSchoolShortName('admin.elitecbt.com.ng')).toBe('');
  });
});
