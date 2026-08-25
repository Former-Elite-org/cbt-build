import { describe, expect, it } from '@jest/globals';
import { hasCbtAccess } from './cbt-access';

describe('hasCbtAccess', () => {
  describe('cbt_center / cbt_stand_alone combinations', () => {
    const cases: Array<{ cbt_center: number; cbt_stand_alone: number; expected: boolean }> = [
      { cbt_center: 0, cbt_stand_alone: 0, expected: false }, // neither module → blocked
      { cbt_center: 1, cbt_stand_alone: 0, expected: false }, // CBT Center alone → does NOT grant access
      { cbt_center: 0, cbt_stand_alone: 1, expected: true }, // CBT Stand-Alone school → granted (the reported bug)
      { cbt_center: 1, cbt_stand_alone: 1, expected: true }, // both modules → granted
    ];

    for (const { cbt_center, cbt_stand_alone, expected } of cases) {
      it(`cbt_center=${cbt_center}, cbt_stand_alone=${cbt_stand_alone} → ${expected}`, () => {
        expect(hasCbtAccess({ cbt_center, cbt_stand_alone })).toBe(expected);
      });
    }
  });

  it('grants access when cbt_stand_alone=1 even if cbt_center is absent', () => {
    expect(hasCbtAccess({ cbt_stand_alone: 1 })).toBe(true);
  });

  it('blocks access when only cbt_center=1 is set', () => {
    expect(hasCbtAccess({ cbt_center: 1, cbt_stand_alone: 0 })).toBe(false);
  });

  it('handles string flags returned by MySQL drivers', () => {
    expect(hasCbtAccess({ cbt_stand_alone: '1' })).toBe(true);
    expect(hasCbtAccess({ cbt_stand_alone: '0' })).toBe(false);
  });

  it('denies access by default when flags are missing, null, or the school is absent', () => {
    expect(hasCbtAccess({})).toBe(false);
    expect(hasCbtAccess({ cbt_stand_alone: null })).toBe(false);
    expect(hasCbtAccess(null)).toBe(false);
    expect(hasCbtAccess(undefined)).toBe(false);
  });

  it('denies access for non-numeric values', () => {
    expect(hasCbtAccess({ cbt_stand_alone: 'true' })).toBe(false);
  });
});
