// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { authService } from '../services/authService';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { short_name } from '@/lib/utils/school';
// import { Loader2, GraduationCap, User as UserIcon } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function LoginPage() {
//   const [form, setForm] = useState({
//     school_id: '',
//     email: '',
//     password: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [isSchoolLoading, setIsSchoolLoading] = useState(false);
//   const [isStudentLogin, setIsStudentLogin] = useState(false);
//   const [schoolDetails, setSchoolDetails] = useState<any>(null);
//   const [error, setError] = useState('');

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   // Fetch school details
//   useEffect(() => {
//     setIsSchoolLoading(true);
//     authService
//       .getSchoolDetails(short_name)
//       .then((res) => {
//         setIsSchoolLoading(false);
//         if (res.success && res.data && res.data.length > 0) {
//           setSchoolDetails(res.data[0]);
//           setForm((p) => ({ ...p, school_id: res.data[0].school_id }));
//         }
//       })
//       .catch((err) => {
//         setIsSchoolLoading(false);
//         console.error('Error fetching school details:', err);
//       });
//   }, [short_name, isStudentLogin]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     setError('');
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const result = await login({
//         username: form.email,
//         password: form.password,
//         school_id: form.school_id,
//         type: isStudentLogin ? 'students' : 'users',
//       });

//       if (result.success) {
//         navigate('/dashboard');
//       }
//     } catch (err: any) {
//       setError(err.message || 'Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show access restricted if CBT center is not enabled
//   if (schoolDetails && schoolDetails?.cbt_center < 1) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-800 px-4 animate-fade-in">
//         <Card className="w-full max-w-md shadow-card-lg hover:shadow-card-hover transition-all">
//           <CardHeader className="text-center">
//             {/* <div className="mx-auto mb-4">
//               <img
//                 src={schoolDetails?.badge_url || '/logo192.png'}
//                 alt="School Logo"
//                 className="w-24 h-24 mx-auto rounded-full object-cover shadow-glow border-4 border-white animate-float"
//               />
//             </div> */}
//             {/* <CardTitle className="text-3xl ">Elite CBT</CardTitle> */}
//             {/* <p className="text-sm text-gray-600 mt-2 font-medium">
//               Computer Based Testing Platform
//             </p> */}
//           </CardHeader>
//           <CardBody>
//             <div className="bg-gradient-to-r from-accent-50 to-red-50 border-2 border-accent-300 rounded-xl p-6 text-center shadow-md">
//               <h3 className="font-bold text-accent-800 mb-3 text-lg">
//                 Access Restricted
//               </h3>
//               <p className="text-sm text-accent-700 leading-relaxed">
//                 Your school doesn't subscribe to the CBT module. Please contact
//                 your administrator.
//               </p>
//             </div>
//           </CardBody>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950  px-4 py-12 animate-fade-in">
//       <Card className="w-full max-w-md shadow-card-lg hover:shadow-card-hover transition-all animate-scale-in">
//         <CardHeader className="text-center space-y-4">
//           <div className="mx-auto">
//             <div className="relative inline-block">
//               <img
//                 src={schoolDetails?.badge_url || '/logo192.png'}
//                 alt="School Logo"
//                 className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-[#002a56] dark:border-white shadow-glow animate-float"
//               />
//               <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-400/20 to-primary-200/20 animate-pulse"></div>
//             </div>
//           </div>
//           <div className="animate-slide-in">
//             <CardTitle className="text-4xl font-bold dark:text-white">
//               Elite CBT
//             </CardTitle>
//             <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-semibold">
//               Computer Based Testing Platform
//             </p>
//           </div>
//         </CardHeader>

//         <CardBody className="space-y-5">
//           {/* Login Type Toggle */}
//           <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
//             <Button
//               type="button"
//               variant={!isStudentLogin ? 'default' : 'ghost'}
//               onClick={() => {
//                 setIsStudentLogin(false);
//                 setForm({ school_id: form.school_id, email: '', password: '' });
//                 setError('');
//               }}
//               className="w-full"
//               size="lg"
//             >
//               <UserIcon className="w-5 h-5 mr-2" />
//               Staff
//             </Button>
//             <Button
//               type="button"
//               variant={isStudentLogin ? 'default' : 'ghost'}
//               onClick={() => {
//                 setIsStudentLogin(true);
//                 setForm({ school_id: form.school_id, email: '', password: '' });
//                 setError('');
//               }}
//               className="w-full"
//               size="lg"
//             >
//               <GraduationCap className="w-5 h-5 mr-2" />
//               Student
//             </Button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* School ID (only if localhost or no short_name) */}
//             {(!short_name || short_name === 'localhost') && (
//               <div className="space-y-2">
//                 <Label htmlFor="school_id">School Short Name</Label>
//                 <Input
//                   id="school_id"
//                   name="school_id"
//                   type="text"
//                   placeholder="Enter School Short Name"
//                   value={form.school_id}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//             )}

//             {/* Email/Username */}
//             <div className="space-y-2">
//               <Label htmlFor="email">
//                 {isStudentLogin ? 'Admission Number' : 'Email Address'}
//               </Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type={isStudentLogin ? 'text' : 'email'}
//                 placeholder={
//                   isStudentLogin
//                     ? 'Enter your admission number'
//                     : 'Enter your email address'
//                 }
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             {/* Password */}
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={form.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             {error && (
//               <div className="gradient-danger text-white px-5 py-4 rounded-xl text-sm font-semibold shadow-md animate-scale-in">
//                 {error}
//               </div>
//             )}

//             <Button
//               type="submit"
//               className="w-full"
//               size="lg"
//               disabled={loading || isSchoolLoading}
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                   Signing In...
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </Button>
//           </form>
//         </CardBody>

//         <CardFooter className="justify-center text-center text-sm text-gray-600 dark:text-gray-400 font-semibold bg-gray-100 dark:bg-gray-700 pt-3.5">
//           <p>Powered by Elite Scholar</p>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, GraduationCap, User as UserIcon, Building2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { isFlagshipSubdomain } from '@/lib/utils/flagship';
import type { SchoolOption } from '../types/auth.types';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isStudentLogin, setIsStudentLogin] = useState(false);
  const [error, setError] = useState('');

  // Multi-school selection state
  const [schoolSelectionData, setSchoolSelectionData] = useState<{
    schools: SchoolOption[];
    selection_token: string;
  } | null>(null);

  const { login, selectSchool } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login({
        username: form.email,
        password: form.password,
        type: isStudentLogin ? 'students' : 'users',
      });

      if ((result as any).requiresSchoolSelection) {
        setSchoolSelectionData({
          schools: (result as any).schools,
          selection_token: (result as any).selection_token,
        });
        return;
      }

      if (result.success) {
        navigate((result as any).needsOnboarding ? '/onboarding' : '/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchool = async (school_id: string) => {
    if (!schoolSelectionData) return;
    setLoading(true);
    setError('');
    try {
      const result = await selectSchool(schoolSelectionData.selection_token, school_id);
      if (result.success) {
        navigate((result as any).needsOnboarding ? '/onboarding' : '/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to select school');
    } finally {
      setLoading(false);
    }
  };

  // ── School selection screen ────────────────────────────────────────────────
  if (schoolSelectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 animate-in fade-in duration-300">
        <Card className="w-full max-w-sm border-none bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center p-6 space-y-2">
            <div className="mx-auto p-3 bg-[#002a56]/10 rounded-full w-fit">
              <Building2 className="h-7 w-7 text-[#002a56] dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg font-black text-[#002a56] dark:text-white">Select School</CardTitle>
            <p className="text-xs text-gray-400">Your account is linked to multiple schools. Choose one to continue.</p>
          </CardHeader>
          <CardBody className="p-5 pt-0 space-y-2">
            {error && (
              <div className="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 p-3 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}
            {schoolSelectionData.schools.map(school => (
              <button key={school.school_id} type="button" disabled={loading}
                onClick={() => handleSelectSchool(school.school_id)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-[#002a56] hover:bg-[#002a56]/5 dark:hover:border-sky-600 dark:hover:bg-sky-600/5 transition-all text-left group disabled:opacity-50">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                  {school.badge_url
                    ? <img src={school.badge_url} alt="" className="w-10 h-10 object-cover rounded-full"/>
                    : <Building2 className="h-5 w-5 text-gray-400"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{school.school_name}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{school.user_type}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-gray-200 dark:text-gray-700 group-hover:text-[#002a56] dark:group-hover:text-sky-400 transition-colors shrink-0" />
              </button>
            ))}
          </CardBody>
          <CardFooter className="justify-center p-4 border-t border-gray-50 dark:border-gray-800/50 bg-gray-50/60 dark:bg-gray-800/40">
            <button type="button" onClick={() => setSchoolSelectionData(null)}
              className="text-[11px] text-gray-400 hover:text-gray-600 font-bold transition-colors">
              ← Back to login
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ── Main login screen ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden animate-in scale-in-95 duration-300">
        <CardHeader className="text-center p-6 space-y-4">
          <div className="mx-auto">
            <div className="relative inline-block group">
              <img src="/logo192.png" alt="Elite CBT"
                className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-gray-100 dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform duration-300"/>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-[#002a56] dark:bg-blue-950 p-1.5 text-white shadow">
                {isStudentLogin ? <GraduationCap className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-[#002a56] dark:text-white tracking-tight">Elite CBT</CardTitle>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
              Computer Based Testing Platform
            </p>
          </div>
        </CardHeader>

        <CardBody className="p-6 pt-0 space-y-5">
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60">
            <Button type="button" variant="ghost"
              onClick={() => { setIsStudentLogin(false); setForm(p => ({ ...p, email: '', password: '' })); setError(''); }}
              className={cn('w-full rounded-lg text-xs font-bold transition-all h-9',
                !isStudentLogin ? 'bg-[#002a56] text-white shadow dark:bg-[#00345A] dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50')}>
              <UserIcon className="w-4 h-4 mr-1.5 shrink-0" />Staff Portal
            </Button>
            <Button type="button" variant="ghost"
              onClick={() => { setIsStudentLogin(true); setForm(p => ({ ...p, email: '', password: '' })); setError(''); }}
              className={cn('w-full rounded-lg text-xs font-bold transition-all h-9',
                isStudentLogin ? 'bg-[#002a56] text-white shadow dark:bg-[#00345A] dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50')}>
              <GraduationCap className="w-4 h-4 mr-1.5 shrink-0" />Student Portal
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {isStudentLogin ? 'Admission Number' : 'Email Address'}
              </Label>
              <Input id="email" name="email"
                type={isStudentLogin ? 'text' : 'email'}
                placeholder={isStudentLogin ? 'Enter admission reference' : 'name@school.com'}
                value={form.email} onChange={handleChange}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                required autoComplete="username" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-gray-500 dark:text-gray-400">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••"
                value={form.password} onChange={handleChange}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                required autoComplete="current-password" />
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 p-3 rounded-xl text-xs font-bold border border-rose-100 dark:border-none animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <Button type="submit"
              className="w-full rounded-xl h-10 text-xs font-bold bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 dark:hover:bg-sky-600/90 shadow-md transition-all mt-2"
              disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Signing in...</> : 'Sign In'}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="justify-center text-center text-[11px] text-gray-400 dark:text-gray-500 font-bold bg-gray-50/60 dark:bg-gray-800/40 p-4 border-t border-gray-50 dark:border-gray-800/50">
          <div className="space-y-1.5">
            <p>Powered by Elite Scholar</p>
            {isFlagshipSubdomain() ? (
              <div className="flex items-center justify-center gap-1 flex-wrap">
                <span>Student?</span>
                <Link to="/student-register" className="text-[#002a56] dark:text-sky-400 hover:underline">Create an account</Link>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span>Parent?</span>
                <Link to="/parent-register" className="text-[#002a56] dark:text-sky-400 hover:underline">Create an account</Link>
              </div>
            ) : (
              <p>New school?{' '}
                <Link to="/register" className="text-[#002a56] dark:text-sky-400 hover:underline">Onboard your school</Link>
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
