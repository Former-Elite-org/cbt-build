export type SubscriptionTier = 'small' | 'medium' | 'large';

export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'none';

export interface SubscriptionPricing {
  base: number;
  tiers: Record<SubscriptionTier, number>;
  period_days: number;
  currency: string;
}

export interface PracticeSubscriptionStatus {
  subscribed: boolean;
  status: SubscriptionStatus;
  plan: string;
  tier: SubscriptionTier | null;
  holder_type: 'school' | 'student' | null;
  admission_no: string | null;
  expires_at: string | null;
  started_at: string | null;
  period_days: number | null;
  days_left: number;
  pricing: SubscriptionPricing;
}

export interface InitiateResult {
  authorization_url: string;
  reference: string;
  plan_code: string | null;
  tier: SubscriptionTier | null;
}

export interface ApplyResult {
  status: string;
  tier: SubscriptionTier;
  note: string | null;
  amount: number;
}

export interface VerifyResultData {
  id: string;
  status: string;
  tier: string | null;
  expires_at: string | null;
  holder_type: string | null;
}
