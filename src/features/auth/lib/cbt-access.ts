/**
 * CBT access gate used by the login pages.
 *
 * A school gets CBT access when the **CBT Stand-Alone** module is enabled
 * (configured in elite-core → School Setup). `cbt_center` alone does NOT
 * grant access — the elite-cbt app is only reachable for schools that have
 * the Stand-Alone module turned on.
 *
 * Deny-by-default: missing / null / undefined / non-numeric flags count as 0,
 * so schools without the module can never slip through.
 */
export interface CbtSchoolFlags {
  /** CBT Center module flag (ignored by the access gate). */
  cbt_center?: number | string | null;
  /** CBT Stand-Alone module flag — the only flag that grants access. */
  cbt_stand_alone?: number | string | null;
}

export function hasCbtAccess(school: CbtSchoolFlags | null | undefined): boolean {
  return (Number(school?.cbt_stand_alone) || 0) >= 1;
}
