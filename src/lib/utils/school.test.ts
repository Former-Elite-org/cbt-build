import { describe, expect, it } from '@jest/globals';
import { getSchoolShortName } from './school';

describe('getSchoolShortName', () => {
  it('treats the flagship apex as no school', () => {
    expect(getSchoolShortName('elitecbt.com.ng')).toBe('');
    expect(getSchoolShortName('www.elitecbt.com.ng')).toBe('');
    expect(getSchoolShortName('localhost')).toBe('');
    expect(getSchoolShortName('127.0.0.1')).toBe('');
  });

  it('reads the tenant from a school subdomain', () => {
    expect(getSchoolShortName('dkg.elitecbt.com.ng')).toBe('dkg');
    expect(getSchoolShortName('demo.elitecbt.com.ng')).toBe('demo');
    expect(getSchoolShortName('pts.elitecbt.com.ng')).toBe('pts');
    expect(getSchoolShortName('DEMO.EliteCBT.com.ng')).toBe('demo');
  });

  it('keeps flagship practice hosts as their alias short names', () => {
    expect(getSchoolShortName('elite.elitecbt.com.ng')).toBe('elite');
    expect(getSchoolShortName('practice.elitecbt.com.ng')).toBe('practice');
  });

  it('ignores infrastructure and product labels', () => {
    expect(getSchoolShortName('api.elitecbt.com.ng')).toBe('');
    expect(getSchoolShortName('admin.elitecbt.com.ng')).toBe('');
    expect(getSchoolShortName('elitesms.elitecbt.com.ng')).toBe('');
  });

  it('recovers the tenant from a nested AppSwitcher host', () => {
    expect(getSchoolShortName('demo.elitesms.elitecbt.com.ng')).toBe('demo');
  });

  it('does not treat LAN IPs as a school short name', () => {
    expect(getSchoolShortName('192.168.1.5')).toBe('');
  });
});
