import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Loader2, School, UserRound, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/authStore';
import { subscriptionService } from '../services/subscriptionService';
import { PracticeSubscriptionStatus, SubscriptionTier } from '../types/subscription.types';
import { naira } from '../utils/format';

const TIER_LABELS: Record<SubscriptionTier, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

/** Full-page paywall shown when practice-mode access is required but not active. */
export default function PracticePaywall() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<PracticeSubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const isStudent = user?.user_type?.toLowerCase() === 'student';

  useEffect(() => {
    subscriptionService
      .getStatus()
      .then((res) => setStatus(res.data || null))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const startPersonalCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await subscriptionService.initiate({
        holder_type: 'student',
        admission_no: (user as any)?.admission_no || undefined,
        callback_url: `${window.location.origin}/subscription?verify=1`,
      });
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
        return;
      }
      toast.error('Checkout could not be started');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Checkout could not be started');
    } finally {
      setCheckingOut(false);
    }
  };

  const pricing = status?.pricing;

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8 text-white">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight">Unlock Board Practice</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-white/85">
          Practice real past questions from JAMB, WAEC, NECO, GCE and BECE — with answers and
          explanations — to prepare for your exams.
        </p>
      </div>

      <CardBody className="space-y-6 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <UserRound className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold">Personal access</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe as a student and start practising right away — no school setup needed.
            </p>
            <Button onClick={startPersonalCheckout} disabled={checkingOut} className="mt-4 w-full gap-2">
              {checkingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {isStudent ? 'Subscribe personally' : 'Subscribe as a student'}
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <School className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold">School access</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Activate practice mode for your whole school — every student gets access under one plan.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/subscription')}
              className="mt-4 w-full gap-2"
            >
              School plans
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading plans…
          </div>
        ) : pricing ? (
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              School plans · {pricing.period_days} days
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(['small', 'medium', 'large'] as SubscriptionTier[]).map((tier) => (
                <div key={tier} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm font-semibold">{TIER_LABELS[tier]}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums">{naira(pricing.tiers[tier])}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {tier === 'small' ? '≤ 300 students' : tier === 'medium' ? '301 – 1,000 students' : '1,000+ students'}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Prices are set by the platform. Access activates immediately after payment.
            </p>
          </div>
        ) : null}

        {status && !status.subscribed && status.status === 'pending' && (
          <Badge variant="outline" className="w-full justify-center py-1.5">
            A payment for your account is pending — complete it to activate access.
          </Badge>
        )}
      </CardBody>
    </Card>
  );
}
