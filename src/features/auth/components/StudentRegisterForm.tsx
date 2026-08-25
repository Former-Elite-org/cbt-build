import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, GraduationCap, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

const BOARDS = ['JAMB', 'WAEC', 'NECO'];

interface StudentForm {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  board: string;
}

/**
 * Single-step student signup for the flagship practice school.
 * Used when visiting via practice/elite/test subdomains — the account is
 * created as a student under SCH-ELITE (Elite Practice Academy), which also
 * serves the JAMB/WAEC/NECO practice exam boards.
 */
export default function StudentRegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<StudentForm>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    board: 'JAMB',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<StudentForm & { general: string }>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.registerStudent({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        board: form.board as any,
      });
      if (res.success) {
        toast.success(res.message || 'Account created! Welcome to Elite Practice Academy.');
        // The API returns a login token and user — store them so verifyToken works.
        const token = (res as any)?.token;
        const user = (res as any)?.user;
        if (token) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token.startsWith('Bearer ') ? token : `Bearer ${token}`);
          // Persist school_id and branch_id so createAuthHeaders can inject tenant
          // context and verifyToken can scope the student lookup correctly.
          if (user?.school_id) {
            localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, user.school_id);
          }
          if (user?.branch_id) {
            localStorage.setItem(STORAGE_KEYS.BRANCH_ID, user.branch_id);
          }
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } else if (res.errors) {
        setErrors(res.errors as any);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.email || err?.response?.data?.message || err.message || 'Registration failed';
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-none bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="text-center p-6 space-y-3">
        <div className="mx-auto p-3 bg-[#002a56]/10 rounded-full w-fit">
          <GraduationCap className="h-8 w-8 text-[#002a56] dark:text-blue-400" />
        </div>
        <div>
          <CardTitle className="text-2xl font-black text-[#002a56] dark:text-white tracking-tight">
            Create Your Practice Account
          </CardTitle>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
            Elite Practice Academy — JAMB • WAEC • NECO
          </p>
        </div>
      </CardHeader>

      <CardBody className="p-6 pt-0">
        {errors.general && (
          <div className="mb-4 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 p-3 rounded-xl text-xs font-bold border border-rose-100 dark:border-none">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-xs font-bold text-gray-500 dark:text-gray-400">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="e.g. Aisha Bello"
              value={form.full_name}
              onChange={handleChange}
              className={cn('rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800', errors.full_name && 'border-rose-400')}
            />
            {errors.full_name && <p className="text-rose-500 text-[11px] font-semibold">{errors.full_name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={cn('rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800', errors.email && 'border-rose-400')}
            />
            {errors.email && <p className="text-rose-500 text-[11px] font-semibold">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <Label htmlFor="confirm_password" className="text-xs font-bold text-gray-500 dark:text-gray-400">Confirm</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Repeat password"
                value={form.confirm_password}
                onChange={handleChange}
                className={cn('rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800', errors.confirm_password && 'border-rose-400')}
              />
              {errors.confirm_password && <p className="text-rose-500 text-[11px] font-semibold">{errors.confirm_password}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="board" className="text-xs font-bold text-gray-500 dark:text-gray-400">Practice Board</Label>
            <select
              id="board"
              name="board"
              value={form.board}
              onChange={handleChange}
              className="w-full rounded-xl h-10 text-xs border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-[#002a56]/30"
            >
              {BOARDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl h-10 text-xs font-bold bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 dark:hover:bg-sky-600/90 shadow-md transition-all mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Create Practice Account
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-[11px] text-gray-400 dark:text-gray-500 font-medium">
          Your account is created as a <strong className="text-gray-500 dark:text-gray-400">student</strong> under
          Elite Practice Academy — no school setup needed. Start practising past questions immediately.
        </p>
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
  );
}
