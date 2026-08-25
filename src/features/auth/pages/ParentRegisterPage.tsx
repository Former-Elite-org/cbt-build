import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { isFlagshipSubdomain } from '@/lib/utils/flagship';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';

export default function ParentRegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    child_admission_no: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  if (!isFlagshipSubdomain()) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await apiClient.post('/auth/parent-register', {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        child_admission_no: form.child_admission_no || undefined,
      });

      localStorage.setItem('@@auth_token', data.token);
      if (data.school_id) {
        localStorage.setItem('@@school_id', data.school_id);
      }

      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden animate-in scale-in-95 duration-300">
        <CardHeader className="text-center p-6 space-y-4">
          <div className="mx-auto">
            <div className="relative inline-block group">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#002a56]/10 dark:bg-sky-600/10 flex items-center justify-center border-4 border-gray-100 dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Users className="h-10 w-10 text-[#002a56] dark:text-sky-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-[#002a56] dark:bg-sky-600 p-1.5 text-white shadow">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-[#002a56] dark:text-white tracking-tight">
              Parent Registration
            </CardTitle>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
              Elite Practice Academy
            </p>
          </div>
        </CardHeader>

        <CardBody className="p-6 pt-0 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                value={form.full_name}
                onChange={handleChange}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="child_admission_no" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Child's Admission Number <span className="text-gray-300 dark:text-gray-600">(optional)</span>
              </Label>
              <Input
                id="child_admission_no"
                name="child_admission_no"
                type="text"
                placeholder="Helps link you to your child"
                value={form.child_admission_no}
                onChange={handleChange}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
              />
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 p-3 rounded-xl text-xs font-bold border border-rose-100 dark:border-none animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl h-10 text-xs font-bold bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 dark:hover:bg-sky-600/90 shadow-md transition-all mt-2"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Creating Account...</>
              ) : (
                'Create Parent Account'
              )}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="justify-center text-center text-[11px] text-gray-400 dark:text-gray-500 font-bold bg-gray-50/60 dark:bg-gray-800/40 p-4 border-t border-gray-50 dark:border-gray-800/50">
          <div className="space-y-1.5">
            <p>Powered by Elite Scholar</p>
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-[#002a56] dark:text-sky-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
