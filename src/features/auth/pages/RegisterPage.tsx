import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

type Step = 'account' | 'school';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  school_name: string;
  short_name: string;
  state: string;
  primary_contact_number: string;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('account');
  const [loading, setLoading] = useState(false);
  const [shortNameStatus, setShortNameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [shortNameTimer, setShortNameTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [errors, setErrors] = useState<Partial<FormState & { general: string }>>({});

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    school_name: '',
    short_name: '',
    state: '',
    primary_contact_number: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));

    // Auto-generate short name from school name
    if (name === 'school_name') {
      const words = value.trim().split(/\s+/).filter(Boolean);
      const generated = words.map((w) => w[0]).join('').toLowerCase().slice(0, 10);
      // Only auto-fill if user hasn't manually edited it
      setForm((p) => ({
        ...p,
        school_name: value,
        short_name: p.short_name === autoShortName(p.school_name) || p.short_name === '' ? generated : p.short_name,
      }));
      // Trigger availability check for new generated value
      if (generated.length >= 2) {
        if (shortNameTimer) clearTimeout(shortNameTimer);
        setShortNameStatus('checking');
        const timer = setTimeout(async () => {
          try {
            const res = await authService.checkShortName(generated);
            setShortNameStatus(res.available ? 'available' : 'taken');
          } catch { setShortNameStatus('idle'); }
        }, 600);
        setShortNameTimer(timer);
      }
      return;
    }

    if (name === 'short_name') {
      const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      setForm((p) => ({ ...p, short_name: cleaned }));

      if (shortNameTimer) clearTimeout(shortNameTimer);
      if (cleaned.length >= 2) {
        setShortNameStatus('checking');
        const timer = setTimeout(async () => {
          try {
            const res = await authService.checkShortName(cleaned);
            setShortNameStatus(res.available ? 'available' : 'taken');
            if (!res.available) {
              setErrors((p) => ({ ...p, short_name: 'This short name is already taken' }));
            }
          } catch {
            setShortNameStatus('idle');
          }
        }, 600);
        setShortNameTimer(timer);
      } else {
        setShortNameStatus('idle');
      }
    }
  };

  const autoShortName = (name: string) =>
    name.trim().split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toLowerCase().slice(0, 10);

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    if (!form.school_name.trim()) e.school_name = 'School name is required';
    if (!form.short_name.trim()) e.short_name = 'Short name is required';
    if (shortNameStatus === 'taken') e.short_name = 'This short name is already taken';
    if (shortNameStatus === 'checking') e.short_name = 'Still checking availability…';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) setStep('school');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const res = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        school_name: form.school_name,
        short_name: form.short_name,
        state: form.state || undefined,
        primary_contact_number: form.primary_contact_number || undefined,
      });

      if (res.success) {
        toast.success('Account created! Please log in to complete your school setup.');
        navigate('/login');
      } else if (res.errors) {
        setErrors(res.errors as any);
        // If it's an account field error, go back to step 1
        if (res.errors.email || res.errors.password) setStep('account');
        toast.error('Please fix the errors below.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="text-center p-6 space-y-3">
          <div className="mx-auto p-3 bg-[#002a56]/10 rounded-full w-fit">
            <Building2 className="h-8 w-8 text-[#002a56] dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-[#002a56] dark:text-white tracking-tight">
              Create Your Account
            </CardTitle>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
              Elite CBT — School Registration
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className={cn(
              'flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-all',
              step === 'account'
                ? 'bg-[#002a56] text-white'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            )}>
              {step !== 'account' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px]">1</span>}
              Account
            </div>
            <div className="h-px w-6 bg-gray-200 dark:bg-gray-700" />
            <div className={cn(
              'flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-all',
              step === 'school'
                ? 'bg-[#002a56] text-white'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
            )}>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              School Info
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-6 pt-0">
          {errors.general && (
            <div className="mb-4 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 p-3 rounded-xl text-xs font-bold border border-rose-100 dark:border-none">
              {errors.general}
            </div>
          )}

          {/* ── Step 1: Account Details ── */}
          {step === 'account' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-gray-500 dark:text-gray-400">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className={cn('rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800', errors.name && 'border-rose-400')}
                />
                {errors.name && <p className="text-rose-500 text-[11px] font-semibold">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@yourschool.com"
                  value={form.email}
                  onChange={handleChange}
                  className={cn('rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800', errors.email && 'border-rose-400')}
                />
                {errors.email && <p className="text-rose-500 text-[11px] font-semibold">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-gray-500 dark:text-gray-400">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className={cn('rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800', errors.password && 'border-rose-400')}
                />
                {errors.password && <p className="text-rose-500 text-[11px] font-semibold">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-xs font-bold text-gray-500 dark:text-gray-400">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  className={cn('rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800', errors.confirm_password && 'border-rose-400')}
                />
                {errors.confirm_password && <p className="text-rose-500 text-[11px] font-semibold">{errors.confirm_password}</p>}
              </div>

              <Button
                type="button"
                onClick={handleNextStep}
                className="w-full rounded-xl h-10 text-xs font-bold bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 dark:hover:bg-sky-600/90 shadow-md transition-all mt-2"
              >
                Continue to School Info →
              </Button>
            </div>
          )}

          {/* ── Step 2: School Info ── */}
          {step === 'school' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="school_name" className="text-xs font-bold text-gray-500 dark:text-gray-400">School Name</Label>
                <Input
                  id="school_name"
                  name="school_name"
                  type="text"
                  placeholder="Elite Academy International"
                  value={form.school_name}
                  onChange={handleChange}
                  className={cn('rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800', errors.school_name && 'border-rose-400')}
                />
                {errors.school_name && <p className="text-rose-500 text-[11px] font-semibold">{errors.school_name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="short_name" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  School Short Name
                  <span className="ml-1 text-gray-400 font-normal">(used as login keyword)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="short_name"
                    name="short_name"
                    type="text"
                    placeholder="eliteacademy"
                    value={form.short_name}
                    onChange={handleChange}
                    maxLength={10}
                    className={cn(
                      'rounded-xl h-10 text-xs pr-8 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800',
                      errors.short_name && 'border-rose-400',
                      shortNameStatus === 'available' && 'border-green-400'
                    )}
                  />
                  <div className="absolute right-2.5 top-2.5">
                    {shortNameStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    {shortNameStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {shortNameStatus === 'taken' && <XCircle className="w-4 h-4 text-rose-500" />}
                  </div>
                </div>
                {shortNameStatus === 'available' && (
                  <p className="text-green-600 dark:text-green-400 text-[11px] font-semibold">"{form.short_name}" is available</p>
                )}
                {errors.short_name && <p className="text-rose-500 text-[11px] font-semibold">{errors.short_name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-bold text-gray-500 dark:text-gray-400">State</Label>
                  <select
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full rounded-xl h-10 text-xs border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-[#002a56]/30"
                  >
                    <option value="">Select state</option>
                    {nigerianStates.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="primary_contact_number" className="text-xs font-bold text-gray-500 dark:text-gray-400">Phone Number</Label>
                  <Input
                    id="primary_contact_number"
                    name="primary_contact_number"
                    type="tel"
                    placeholder="08012345678"
                    value={form.primary_contact_number}
                    onChange={handleChange}
                    className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('account')}
                  className="flex-1 rounded-xl h-10 text-xs font-bold border border-gray-200 dark:border-gray-700"
                >
                  ← Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading || shortNameStatus === 'taken' || shortNameStatus === 'checking'}
                  className="flex-1 rounded-xl h-10 text-xs font-bold bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 dark:hover:bg-sky-600/90 shadow-md transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardBody>

        <CardFooter className="justify-center text-center p-4 border-t border-gray-50 dark:border-gray-800/50 bg-gray-50/60 dark:bg-gray-800/40">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold">
            Already have an account?{' '}
            <Link to="/login" className="text-[#002a56] dark:text-sky-400 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
