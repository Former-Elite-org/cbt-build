// import { useState, useCallback, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { _get } from '@/Helper';
// import { cn } from '@/lib/utils/cn';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import { Skeleton } from '@/components/ui/skeleton';
// import {
//   BookOpen,
//   CheckCircle,
//   FileEdit,
//   Plus,
//   TrendingUp,
//   Calendar,
//   BarChart3,
//   Eye,
//   Hourglass,
//   ArrowRight
// } from 'lucide-react';

// interface Stats {
//   total_exams: number;
//   draft_exams: number;
//   pending_exams: number;
//   approved_exams: number;
//   total_students: number;
// }

// export default function TeacherDashboardPage() {
//   const navigate = useNavigate();
//   const { user, selected_branch } = useAuthStore();
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState<Stats>({
//     total_exams: 0,
//     draft_exams: 0,
//     pending_exams: 0,
//     approved_exams: 0,
//     total_students: 0,
//   });

//   const fetchStats = useCallback(() => {
//     if (!selected_branch?.branch_id || !user?.id) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
    
//     // Use user_id if available, otherwise use id (matching how exams are created)
//     const teacherId = (user as any).user_id || user.id;
    
//     // Fetch all teacher exams once and separate by status
//     _get(
//       `examinations?query_type=select-teacher-exams&teacher_id=${user.id}&branch_id=${selected_branch.branch_id}`,
//       (resp: any) => {
//         setLoading(false);
//         if (resp.success && Array.isArray(resp.data)) {
//           const allExams = resp.data;
          
//           // Separate exams by status
//           const draftExams = allExams.filter((exam: any) => exam.status === 'Draft');
//           const pendingExams = allExams.filter((exam: any) => exam.status === 'Pending');
//           const approvedExams = allExams.filter((exam: any) => exam.status === 'Approved');
          
//           setStats({
//             total_exams: allExams.length,
//             draft_exams: draftExams.length,
//             pending_exams: pendingExams.length,
//             approved_exams: approvedExams.length,
//             total_students: 0, // Can be added later if needed
//           });
//         } else {
//           setStats({
//             total_exams: 0,
//             draft_exams: 0,
//             pending_exams: 0,
//             approved_exams: 0,
//             total_students: 0,
//           });
//         }
//       },
//       (err: any) => {
//         console.error('Error fetching teacher exams:', err);
//         setLoading(false);
//         setStats({
//           total_exams: 0,
//           draft_exams: 0,
//           pending_exams: 0,
//           approved_exams: 0,
//           total_students: 0,
//         });
//       }
//     );
//   }, [selected_branch?.branch_id, user?.id]);

//   useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);

//   const statsData = [
//     {
//       icon: BookOpen,
//       label: 'Total Exams',
//       value: stats.total_exams.toString(),
//       change: 'All time',
//       color: 'text-[#00356B] dark:text-white',
//       bgColor: 'bg-[#00356B]/20 dark:bg-[#00356B]/30',
//       iconBg: 'bg-[#00356B]/30 dark:bg-[#00356B]/50',
//       onClick: () => navigate('/exams'),
//     },
//     {
//       icon: FileEdit,
//       label: 'Draft Exams',
//       value: stats.draft_exams.toString(),
//       change: 'In progress',
//       color: 'text-[#21060a] dark:text-[#f9d1d7]',
//       bgColor: 'bg-[#21060a] dark:bg-primary-900/20',
//       iconBg: 'bg-[#f9d1d7] dark:bg-[#21060a]/50',
//       onClick: () => navigate('/exams'),
//     },
//     {
//       icon: Hourglass,
//       label: 'Pending Approval',
//       value: stats.pending_exams.toString(),
//       change: 'Awaiting review',
//       color: 'text-yellow-600 dark:text-yellow-300',
//       bgColor: 'bg-yellow-50 dark:bg-yellow-700/20',
//       iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
//       onClick: () => navigate('/exams'),
//     },
//     {
//       icon: CheckCircle,
//       label: 'Approved Exams',
//       value: stats.approved_exams.toString(),
//       change: 'Active',
//       color: 'text-green-600 dark:text-green-400',
//       bgColor: 'bg-green-50 dark:bg-green-900/20',
//       iconBg: 'bg-green-100 dark:bg-green-900/50',
//       onClick: () => navigate('/exams'),
//     },
//   ];

//   const quickActions = [
//     {
//       icon: Plus,
//       label: 'Create New Exam',
//       description: 'Set up a new examination',
//       onClick: () => navigate('/exams/create'),
//       color: 'bg-[#00356B] hover:bg-[#00357A] text-white',
//     },
//     {
//       icon: Eye,
//       label: 'View All Exams',
//       description: 'Manage your examinations',
//       onClick: () => navigate('/exams'),
//       color: 'bg-[#A51C30] hover:bg-[#841626] text-white',
//     },
//     {
//       icon: BarChart3,
//       label: 'View Results',
//       description: 'Check exam results',
//       onClick: () => navigate('/results'),
//       color: 'bg-[#10b981] hover:bg-[#059669] text-white',
//     },
//   ];

//   return (
//     <div className="space-y-8 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
//       {/* Header */}
//       <div className="animate-slide-in">
//         <h1 className="text-4xl font-bold text-[#00356B] dark:text-white">Teacher Dashboard</h1>
//         <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
//           Manage your exams and track student performance
//         </p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {loading ? (
//           Array.from({ length: 4 }).map((_, i) => (
//             <Skeleton key={i} className="h-32 w-full" />
//           ))
//         ) : (
//           statsData.map((stat, index) => {
//             const Icon = stat.icon;
//             return (
//               <Card
//                 key={stat.label}
//                 className="hover-lift cursor-pointer group animate-scale-in"
//                 style={{ animationDelay: `${index * 100}ms` }}
//                 onClick={stat.onClick}
//               >
//                 <CardBody className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <p className={cn("text-sm font-medium mb-1", stat.color)}>
//                         {stat.label}
//                       </p>
//                       <p className={cn("text-3xl font-bold mb-1", stat.color)}>
//                         {stat.value}
//                       </p>
//                       <p className="text-xs text-gray-500 dark:text-gray-500">
//                         {stat.change}
//                       </p>
//                     </div>
//                     <div className={`p-4 rounded-2xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
//                       <Icon className={`h-7 w-7 ${stat.color}`} />
//                     </div>
//                   </div>
//                 </CardBody>
//               </Card>
//             );
//           })
//         )}
//       </div>

//       {/* Quick Actions */}
//       <Card className="animate-scale-in">
//         <CardHeader>
//           <CardTitle className="text-2xl text-[#00356B] dark:text-white flex items-center gap-2">
//             <TrendingUp className="h-6 w-6" />
//             <span>Quick Actions</span>
//           </CardTitle>
//         </CardHeader>
//         <CardBody>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {quickActions.map((action, index) => {
//               const Icon = action.icon;
//               return (
//                 <Button
//                   key={action.label}
//                   variant="outline"
//                   className="h-auto p-6 border-2 border-[#00356B] dark:border-white/50 flex flex-col items-start gap-3 hover:scale-105 transition-transform "
//                   onClick={action.onClick}
//                   style={{ animationDelay: `${index * 50}ms` }}
//                 >
//                   <div className={`p-3 rounded-lg ${action.color} dark:text-white`}>
//                     <Icon className="h-6 w-6" />
//                   </div>
//                   <div className="text-left">
//                     <p className="font-semibold text-gray-900 dark:text-white">
//                       {action.label}
//                     </p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       {action.description}
//                     </p>
//                   </div>
//                   <ArrowRight className="h-4 w-4 ml-auto text-[#00356B] dark:text-white/50" />
//                 </Button>
//               );
//             })}
//           </div>
//         </CardBody>
//       </Card>

//       {/* Recent Activity / Instructions */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card className="animate-scale-in">
//           <CardHeader>
//             <CardTitle className="text-xl flex items-center gap-2 text-[#00356B] dark:text-white">
//               <Calendar className="h-5 w-5 text-[#00356B] dark:text-white" />
//               Exam Management Tips
//             </CardTitle>
//           </CardHeader>
//           <CardBody>
//             <ul className="space-y-3 text-gray-700 dark:text-gray-300">
//               <li className="flex items-start gap-3">
//                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
//                 <span>Create exams with clear instructions and appropriate time limits</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
//                 <span>Review and send exams to admin for approval before release</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
//                 <span>Monitor exam status and student submissions regularly</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
//                 <span>Use the question bank or AI generator for efficient question creation</span>
//               </li>
//             </ul>
//           </CardBody>
//         </Card>

//         <Card className="animate-scale-in">
//           <CardHeader>
//             <CardTitle className="text-xl flex items-center gap-2 text-[#00356B] dark:text-white">
//               <BarChart3 className="h-5 w-5 text-[#00356B] dark:text-white" />
//               Exam Status Overview
//             </CardTitle>
//           </CardHeader>
//           <CardBody>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex justify-between text-sm mb-2">
//                   <span className="text-gray-600 dark:text-gray-400">Draft Exams</span>
//                   <span className="font-semibold">{stats.draft_exams}</span>
//                 </div>
//                 <Progress 
//                   value={stats.total_exams > 0 ? (stats.draft_exams / stats.total_exams) * 100 : 0} 
//                   className="h-2"
//                 />
//               </div>
//               <div>
//                 <div className="flex justify-between text-sm mb-2">
//                   <span className="text-gray-600 dark:text-gray-400">Pending Approval</span>
//                   <span className="font-semibold">{stats.pending_exams}</span>
//                 </div>
//                 <Progress 
//                   value={stats.total_exams > 0 ? (stats.pending_exams / stats.total_exams) * 100 : 0} 
//                   className="h-2"
//                 />
//               </div>
//               <div>
//                 <div className="flex justify-between text-sm mb-2">
//                   <span className="text-gray-600 dark:text-gray-400">Approved Exams</span>
//                   <span className="font-semibold">{stats.approved_exams}</span>
//                 </div>
//                 <Progress 
//                   value={stats.total_exams > 0 ? (stats.approved_exams / stats.total_exams) * 100 : 0} 
//                   className="h-2"
//                 />
//               </div>
//             </div>
//           </CardBody>
//         </Card>
//       </div>
//     </div>
//   );
// }


import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get } from '@/Helper';
import { cn } from '@/lib/utils/cn';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen, CheckCircle, FileEdit, Plus, TrendingUp, Calendar, BarChart3, Eye, Hourglass, ArrowRight
} from 'lucide-react';

interface Stats {
  total_exams: number; draft_exams: number; pending_exams: number; approved_exams: number; total_students: number;
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { user, selected_branch } = useAuthStore();
  const effectiveBranchId = selected_branch?.branch_id || (user as any)?.branch_id || '';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total_exams: 0, draft_exams: 0, pending_exams: 0, approved_exams: 0, total_students: 0,
  });

  const fetchStats = useCallback(() => {
    if (!effectiveBranchId || !user?.id) { setLoading(false); return; }
    setLoading(true);
    _get(`examinations?query_type=select-teacher-exams&teacher_id=${user.id}&branch_id=${effectiveBranchId}`,
      (resp: any) => {
        setLoading(false);
        if (resp.success && Array.isArray(resp.data)) {
          const allExams = resp.data;
          const draftExams = allExams.filter((exam: any) => exam.status === 'Draft');
          const pendingExams = allExams.filter((exam: any) => exam.status === 'Pending');
          const approvedExams = allExams.filter((exam: any) => exam.status === 'Approved');
          
          setStats({
            total_exams: allExams.length, draft_exams: draftExams.length,
            pending_exams: pendingExams.length, approved_exams: approvedExams.length, total_students: 0,
          });
        } else {
          setStats({ total_exams: 0, draft_exams: 0, pending_exams: 0, approved_exams: 0, total_students: 0 });
        }
      },
      (err: any) => {
        console.error('Error fetching teacher exams:', err);
        setLoading(false);
        setStats({ total_exams: 0, draft_exams: 0, pending_exams: 0, approved_exams: 0, total_students: 0 });
      }
    );
  }, [effectiveBranchId, user?.id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statsData = [
    { icon: BookOpen, label: 'Total Exams', value: stats.total_exams.toString(), change: 'All time', color: 'text-[#00356B] dark:text-white', iconBg: 'bg-[#00356B]/10 dark:bg-[#00356B]/30', onClick: () => navigate('/exams') },
    { icon: FileEdit, label: 'Draft Exams', value: stats.draft_exams.toString(), change: 'In progress', color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-500/10', onClick: () => navigate('/exams') },
    { icon: Hourglass, label: 'Pending Approval', value: stats.pending_exams.toString(), change: 'Awaiting review', color: 'text-yellow-600 dark:text-yellow-400', iconBg: 'bg-yellow-500/10', onClick: () => navigate('/exams') },
    { icon: CheckCircle, label: 'Approved Exams', value: stats.approved_exams.toString(), change: 'Active', color: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-500/10', onClick: () => navigate('/exams') },
  ];

  const quickActions = [
    { icon: Plus, label: 'Create New Exam', description: 'Set up a new examination', onClick: () => navigate('/exams/create'), color: 'bg-[#00356B] hover:bg-[#00356B]/90 text-white' },
    { icon: Eye, label: 'View All Exams', description: 'Manage your examinations', onClick: () => navigate('/exams'), color: 'bg-[#A51C30] hover:bg-[#A51C30]/90 text-white' },
    { icon: BarChart3, label: 'View Results', description: 'Check exam results', onClick: () => navigate('/results'), color: 'bg-emerald-600 hover:bg-emerald-600/90 text-white' },
  ];
  return (
    <div className="space-y-6 p-6 bg-gray-50/30 dark:bg-gray-950 min-h-screen">
      
      {/* Dashboard Headline Bar Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4" data-tour="dashboard-overview">
        <h1 className="text-2xl font-black tracking-tight text-gray-800 dark:text-gray-100">Teacher Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage institutional faculties, construct examinations or monitor student logs parameters feed.</p>
      </div>

      {/* Grid Analytics Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : (
          statsData.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl hover:shadow-md transition-shadow cursor-pointer" onClick={stat.onClick}>
                <CardBody className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    <p className={cn("text-xl font-black mt-1", stat.color)}>{stat.value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{stat.change}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-xl flex items-center justify-center", stat.iconBg)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Dashboard Action Cards Panel */}
      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
        <CardHeader className="p-4 border-b border-gray-50 dark:border-gray-800">
          <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#00356B]" /> Command Quick Actions
          </CardTitle>
        </CardHeader>
        <CardBody className="p-4" data-tour="teacher-quick-actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={action.onClick}
                  className="h-auto p-4 border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 hover:bg-gray-50 rounded-2xl flex items-start gap-3 transition-all text-left shadow-none"
                >
                  <div className={cn("p-2 rounded-xl shrink-0 shadow-sm", action.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{action.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 whitespace-normal line-clamp-2">{action.description}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0 self-center ml-auto" />
                </Button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Secondary Dashboard Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tips Section Panel */}
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
          <CardHeader className="p-4 border-b border-gray-50 dark:border-gray-800">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#00356B]" /> Management Strategy Guidelines
            </CardTitle>
          </CardHeader>
          <CardBody className="p-4">
            <ul className="space-y-3.5 text-xs font-medium text-gray-600 dark:text-gray-300">
              {[
                "Create exams with clear instructions and appropriate time limits",
                "Review and send exams to admin for approval before release",
                "Monitor exam status and student submissions regularly",
                "Use the question bank or AI generator for efficient question creation"
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00356B] mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* State Status Overview Bars Panel */}
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
          <CardHeader className="p-4 border-b border-gray-50 dark:border-gray-800">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#00356B]" /> Manifest Allocation Logs
            </CardTitle>
          </CardHeader>
          <CardBody className="p-4 space-y-4">
            {[
              { label: "Draft Exams", val: stats.draft_exams, color: "bg-amber-500" },
              { label: "Pending Approval", val: stats.pending_exams, color: "bg-yellow-500" },
              { label: "Approved Exams", val: stats.approved_exams, color: "bg-emerald-500" }
            ].map((bar, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">{bar.label}</span>
                  <span className="text-gray-700 dark:text-gray-300">{bar.val}</span>
                </div>
                <Progress 
                  value={stats.total_exams > 0 ? (bar.val / stats.total_exams) * 100 : 0} 
                  className="h-1.5 rounded-full bg-gray-50"
                  indicatorClassName={bar.color}
                />
              </div>
            ))}
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
