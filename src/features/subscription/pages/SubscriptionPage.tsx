import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  School,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/authStore';
import { subscriptionService } from '../services/subscriptionService';
import { PracticeSubscriptionStatus, SubscriptionTier } from '../types/subscription.types';
import { fmtDate, naira } from '../utils/format';

const TIER_LABELS: Record<SubscriptionTier, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

const TIER_HINTS: Record<SubscriptionTier, string> = {
  small: 'Up to 300 students',
  medium: '301 – 1,000 students',
  large: '1,000+ students',
};


export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState<PracticeSubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<SubscriptionTier>('small');
  const [studentCount, setStudentCount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<'initiate' | 'apply' | 'verify' | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<boolean | null>(null);

  const isStudent = user?.user_type?.toLowerCase() === 'student';

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.getStatus();
      setStatus(res.data || null);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle the return trip from Paystack: /subscription?verify=1&reference=PRAC-…
  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference) return;

    setBusy('verify');
    setVerifySuccess(null);
    subscriptionService
      .verify(reference)
      .then((res) => {
        if (res.success) {
          setVerifySuccess(true);
          setVerifyMessage(res.message || 'Payment verified — practice access is active!');
          toast.success('Payment verified — practice access is active!');
        } else {
          setVerifySuccess(false);
          setVerifyMessage(res.message || 'Payment could not be verified.');
          toast.error(res.message || 'Payment could not be verified.');
        }
      })
      .catch(() => {
        // e.g. the session expired during the Paystack round-trip — the webhook
        // may still have activated access server-side, so refresh the real status.
        setVerifySuccess(false);
        setVerifyMessage('Payment could not be verified right now — refresh to see your current access.');
        toast.error('Payment could not be verified right now.');
      })
      .finally(() => {
        setBusy(null);
        fetchStatus();
        setSearchParams({}, { replace: true });
      });
  }, [searchParams, setSearchParams, fetchStatus]);

  const callbackUrl = useMemo(
    () => `${window.location.origin}/subscription?verify=1`,
    []
  );

  const startCheckout = async () => {
    setBusy('initiate');
    try {
      const res = await subscriptionService.initiate({
        tier,
        holder_type: 'school',
        student_count: studentCount ? Number(studentCount) : undefined,
        email: user?.email || undefined,
        callback_url: callbackUrl,
      });
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
        return;
      }
      toast.error('Checkout could not be started');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Checkout could not be started');
    } finally {
      setBusy(null);
    }
  };

  const startPersonalCheckout = async () => {
    setBusy('initiate');
    try {
      const res = await subscriptionService.initiate({
        holder_type: 'student',
        admission_no: (user as any)?.admission_no || undefined,
        email: user?.email || undefined,
        callback_url: callbackUrl,
      });
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
        return;
      }
      toast.error('Checkout could not be started');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Checkout could not be started');
    } finally {
      setBusy(null);
    }
  };

  const submitApplication = async () => {
    setBusy('apply');
    try {
      const res = await subscriptionService.apply({
        tier,
        student_count: studentCount ? Number(studentCount) : undefined,
        note: note.trim() || undefined,
      });
      toast.success('Application submitted — the platform team will review it.');
      setNote('');
      fetchStatus();
      setVerifySuccess(true);
      setVerifyMessage(res.message || 'Application submitted.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Application could not be submitted');
    } finally {
      setBusy(null);
    }
  };

  const pricing = status?.pricing;
  const subscribed = !!status?.subscribed;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Practice Subscription</h2>
        <p className="text-sm text-muted-foreground">
          Manage practice-mode access to the board question banks for your school or yourself.
        </p>
      </div>

      {verifyMessage && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            verifySuccess === false
              ? 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20'
              : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/20'
          }`}
        >
          {verifySuccess === false ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          )}
          <span>{verifyMessage}</span>
        </div>
      )}

      {/* Status card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Current access</CardTitle>
            <CardDescription>
              {subscribed
                ? 'Practice mode is active'
                : status?.status === 'pending'
                ? 'Awaiting payment or review'
                : 'Practice mode is not active'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchStatus} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking subscription…
            </div>
          ) : subscribed ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                <BadgeCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
                  {status?.tier && <Badge variant="outline">{TIER_LABELS[status.tier]} plan</Badge>}
                  {status?.holder_type === 'student' && (
                    <Badge variant="outline">
                      <UserRound className="mr-1 h-3 w-3" /> Personal
                    </Badge>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  Expires {fmtDate(status?.expires_at)}
                  {status?.days_left != null && (
                    <span className="font-medium text-foreground">
                      · {status.days_left} {status.days_left === 1 ? 'day' : 'days'} left
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/20">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="text-sm">
                <p className="font-medium">No active access</p>
                <p className="mt-0.5 text-muted-foreground">
                  Choose a school plan below, or subscribe personally to unlock board practice for your
                  account right away.
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Personal path for students */}
      {isStudent && !subscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-primary" /> Personal access
            </CardTitle>
            <CardDescription>
              Pay once and practise as yourself — no school involvement needed.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {pricing && (
                <p className="text-sm">
                  <span className="text-lg font-bold tabular-nums">{naira(pricing.base)}</span>
                  <span className="text-muted-foreground"> / {pricing.period_days} days</span>
                </p>
              )}
              <Button onClick={startPersonalCheckout} disabled={busy === 'initiate'} className="gap-2">
                {busy === 'initiate' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Subscribe personally
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* School plan selection */}
      {!subscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <School className="h-4 w-4 text-primary" /> School plan
            </CardTitle>
            <CardDescription>
              One plan covers every student in your school for {pricing?.period_days ?? '90'} days.
            </CardDescription>
          </CardHeader>
          <CardBody className="space-y-5">
            {pricing && (
              <div className="grid gap-3 sm:grid-cols-3">
                {(['small', 'medium', 'large'] as SubscriptionTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${
                      tier === t
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-200 hover:border-primary/40 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{TIER_LABELS[t]}</p>
                      {tier === t && <BadgeCheck className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="mt-1 text-lg font-bold tabular-nums">{naira(pricing.tiers[t])}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{TIER_HINTS[t]}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="student-count">Approximate student count (optional)</Label>
                <Input
                  id="student-count"
                  type="number"
                  min={1}
                  placeholder="e.g. 450"
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub-note">Note to the platform team (optional)</Label>
                <Textarea
                  id="sub-note"
                  rows={1}
                  placeholder="Anything we should know…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
              <Button onClick={startCheckout} disabled={busy === 'initiate'} className="gap-2">
                {busy === 'initiate' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pay now with Paystack
              </Button>
              <Button
                variant="outline"
                onClick={submitApplication}
                disabled={busy === 'apply'}
                className="gap-2"
              >
                {busy === 'apply' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Submit application for review
              </Button>
              <p className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Payments handled securely by Paystack
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
