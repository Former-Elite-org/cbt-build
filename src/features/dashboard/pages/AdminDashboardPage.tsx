// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import {
//   Users,
//   FileText,
//   BookOpen,
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   Eye,
//   Calendar,
//   ChevronRight,
//   GraduationCap,
//   BarChart3,
// } from 'lucide-react';
// import { _get } from '@/Helper';
// import toast from 'react-hot-toast';

// interface Stats {
//   total_students: number;
//   pending_exams: number;
//   upcoming_exams: number;
//   completionRate: number;
//   averageScore?: number;
//   topPerformers?: number;
// }

// interface Exam {
//   id: number;
//   assessment_type: string;
//   subject_name: string;
//   class_name: string;
//   commence_date: string;
//   start_time: string;
//   end_time: string;
//   total_questions?: number;
//   status?: string;
// }

// export default function AdminDashboardPage() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [examList, setExamList] = useState<Exam[]>([]);
//   const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
//   const [filter, setFilter] = useState({ class: '', subject: '' });
  
//   const [stats, setStats] = useState<Stats>({
//     total_students: 0,
//     pending_exams: 0,
//     upcoming_exams: 0,
//     completionRate: 0,
//     averageScore: 0,
//     topPerformers: 0,
//   });

//   // Fetch dashboard data
//   const fetchData = useCallback(() => {
//     setLoading(true);
//     _get(
//       'examinations?query_type=select-all',
//       (resp) => {
//         if (resp.success) {
//           // Filter out Draft exams - admins should not see exams still being created by teachers
//           const nonDraftExams = (resp.data || []).filter((e: Exam) => 
//             e.status?.toLowerCase() !== 'draft'
//           );
          
//           setExamList(nonDraftExams);
//           setFilteredExams(nonDraftExams);
          
//           // Calculate stats from exam data (excluding drafts)
//           const totalExams = nonDraftExams.length;
//           const activeExams = nonDraftExams.filter((e: Exam) => 
//             e.status?.toLowerCase() === 'active' || !e.status
//           ).length;
          
//           setStats(prev => ({
//             ...prev,
//             pending_exams: totalExams,
//             upcoming_exams: activeExams,
//           }));
//         }
//         setLoading(false);
//       },
//       (err) => {
//         console.error(err);
//         setLoading(false);
//         toast.error('Failed to load dashboard data');
//       }
//     );
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // Filter exams
//   useEffect(() => {
//     let filtered = examList;
    
//     if (filter.class) {
//       filtered = filtered.filter(exam => exam.class_name === filter.class);
//     }
    
//     if (filter.subject) {
//       filtered = filtered.filter(exam => exam.subject_name === filter.subject);
//     }
    
//     setFilteredExams(filtered);
//   }, [filter, examList]);

//   // Get unique classes and subjects for filters
//   const uniqueClasses = [...new Set(examList.map(exam => exam.class_name))];
//   const uniqueSubjects = [...new Set(examList.map(exam => exam.subject_name))];

//   const statsData = [
//     {
//       icon: GraduationCap,
//       label: 'Total Exams',
//       value: stats.pending_exams.toString(),
//       change: 'All time',
//       color: 'text-primary-600 dark:text-white',
//       bgColor: 'bg-[#0d70c5] dark:bg-[#0d70c5]/30',
//       gradient: 'gradient-primary',
//       onClick: () => navigate('/exams'),
//     },
//     {
//       icon: Clock,
//       label: 'Active Exams',
//       value: stats.upcoming_exams.toString(),
//       change: 'Ongoing',
//       color: 'text-secondary-600 dark:text-secondary-400',
//       bgColor: 'bg-[#fad2d9] dark:bg-[#fad2d9]/30',
//       gradient: 'gradient-accent',
//       onClick: () => navigate('/exams'),
//     },
//     {
//       icon: Users,
//       label: 'Total Students',
//       value: stats.total_students.toString(),
//       change: 'Registered',
//       color: 'text-primary-600 dark:text-primary-400',
//       bgColor: 'bg-[#6699be] dark:bg-[#6699be]/30',
//       gradient: 'gradient-primary',
//       onClick: () => navigate('/students/list'),
//     },
//     {
//       icon: CheckCircle,
//       label: 'Completion Rate',
//       value: `${stats.completionRate}%`,
//       change: 'Average',
//       color: 'text-success-600 dark:text-success-400',
//       bgColor: 'bg-[#059669] dark:bg-[#059669]/30',
//       gradient: 'gradient-success',
//     },
//   ];

//   const getStatusBadge = (status?: string) => {
//     const statusLower = status?.toLowerCase() || 'active';
    
//     if (statusLower === 'completed' || statusLower === 'released') {
//       return <Badge variant="success">{status || 'Active'}</Badge>;
//     } else if (statusLower === 'pending') {
//       return <Badge variant="warning">{status}</Badge>;
//     } else {
//       return <Badge variant="default">{status || 'Active'}</Badge>;
//     }
//   };

//   return (
//     <div className="space-y-8 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
//       {/* Header */}
//       <div className="animate-slide-in">
//         <h1 className="text-4xl font-bold text-gray-700 dark:text-gray-300 mb-2">
//           Dashboard Overview
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400 text-lg">
//           Monitor exams, track performance, and manage your CBT operations
//         </p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statsData.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <Card
//               key={index}
//               className="hover-lift cursor-pointer group"
//               style={{ animationDelay: `${index * 100}ms` }}
//               onClick={stat.onClick}
//             >
//               <CardBody className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">
//                     <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
//                       {stat.label}
//                     </p>
//                     <p className="text-4xl font-bold text-gray-700 dark:text-gray-300 mb-1">
//                       {loading ? '...' : stat.value}
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-500">
//                       {stat.change}
//                     </p>
//                   </div>
//                   <div className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
//                     <Icon className={`h-7 w-7 ${stat.color}`} />
//                   </div>
//                 </div>
//               </CardBody>
//             </Card>
//           );
//         })}
//       </div>

//       {/* Completion Rate Progress */}
//       <Card className="animate-scale-in bg-white dark:bg-gray-800">
//         <CardBody className="p-6">
//           <div className="flex items-center justify-between  mb-4">
//             <div>
//               <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
//                 <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
//                 Overall Exam Completion
//               </h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Track completion rates across all exams
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">
//                 {stats.completionRate}%
//               </p>
//             </div>
//           </div>
//           <Progress value={stats.completionRate} className="h-3 text-gray-700 dark:text-gray-300" />
//         </CardBody>
//       </Card>

//       {/* Active Exams Section */}
//       <Card className="animate-scale-in">
//         <CardHeader>
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <CardTitle className="text-2xl flex items-center gap-2">
//               <BookOpen className="h-6 w-6 text-gray-700 dark:text-gray-300" />
//               <span className="text-gray-700 dark:text-gray-300">Active Exams</span>
//             </CardTitle>
            
//             {/* Filters */}
//             <div className="flex flex-col sm:flex-row gap-3">
//               <select
//                 value={filter.class}
//                 onChange={(e) => setFilter({ ...filter, class: e.target.value })}
//                 className="w-full sm:w-48 h-11 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-sm font-medium cursor-pointer hover:border-primary-300"
//               >
//                 <option value="" className="text-gray-700 dark:text-gray-300">
//                   All Classes
//                 </option>
//                 {uniqueClasses.map((cls, idx) => (
//                   <option key={idx} value={cls}>
//                     {cls}
//                   </option>
//                 ))}
//               </select>
//               <select
//                 value={filter.subject}
//                 onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
//                 className="w-full sm:w-48 h-11 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-sm font-medium cursor-pointer hover:border-primary-300"
//               >
//                 <option value="" className="text-gray-700 dark:text-gray-300">All Subjects</option>
//                 {uniqueSubjects.map((subject, idx) => (
//                   <option key={idx} value={subject}>
//                     {subject}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </CardHeader>
        
//         <CardBody>
//           {loading ? (
//             <div className="text-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//               <p className="mt-4 text-gray-600 dark:text-gray-400">Loading exams...</p>
//             </div>
//           ) : filteredExams.length > 0 ? (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {filteredExams.map((exam, index) => {
//                 const examId = exam.exam_id || exam.id;
//                 if (!examId) return null;
                
//                 return (
//                 <Card
//                   key={examId}
//                   className="hover-lift cursor-pointer border-l-4 border-[#002a56] dark:border-white/40"
//                   style={{ animationDelay: `${index * 50}ms` }}
//                 >
//                   <CardBody className="p-6">
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex-1">
//                         <h4 className="text-lg font-bold text-gray-700 dark:text-white mb-2">
//                           {exam.assessment_type}
//                         </h4>
//                         {getStatusBadge(exam.status)}
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
//                         <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
//                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{exam.subject_name}</span>
//                       </div>
                      
//                       <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
//                         <Users className="h-4 w-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
//                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{exam.class_name}</span>
//                       </div>
                      
//                       <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
//                         <Calendar className="h-4 w-4 text-success-600 dark:text-success-400 flex-shrink-0" />
//                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{exam.commence_date}</span>
//                       </div>
                      
//                       <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
//                         <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
//                         <span className="text-sm font-medium">
//                           {exam.start_time} - {exam.end_time}
//                         </span>
//                       </div>

//                       {exam.total_questions && (
//                         <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
//                           <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
//                           <span className="text-sm font-medium">
//                             {exam.total_questions} Questions
//                           </span>
//                         </div>
//                       )}
//                     </div>

//                     <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
//                       <Button
//                         variant={exam.status === 'Completed' || exam.status === '' ? 'success' : 'default'}
//                         size="sm"
//                         className="w-full group"
//                         onClick={() => {
//                           if (!examId) {
//                             toast.error('Exam ID is missing');
//                             return;
//                           }
//                           if (exam.status === 'Completed' || exam.status === 'Released') {
//                             // Navigate to results page filtered by this exam
//                             navigate(`/results?exam_id=${examId}`);
//                           } else {
//                             navigate(`/exams/${examId}/questions`);
//                           }
//                         }}
//                       >
//                         <Eye className="h-4 w-4 mr-2" />
//                         {exam.status === 'Completed' || exam.status === 'Released' 
//                           ? 'View Results' 
//                           : 'Manage Questions'}
//                         <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
//                       </Button>
//                     </div>
//                   </CardBody>
//                 </Card>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="text-center py-16">
//               <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <BookOpen className="h-12 w-12 text-primary-600 dark:text-primary-400" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white mb-2">
//                 No Exams Found
//               </h3>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 {filter.class || filter.subject 
//                   ? 'Try adjusting your filters'
//                   : 'Create your first exam to get started'}
//               </p>
//               <Button onClick={() => navigate('/exams')} size="lg">
//                 View All Exams
//                 <ChevronRight className="h-4 w-4 ml-2" />
//               </Button>
//             </div>
//           )}
//         </CardBody>
//       </Card>
//     </div>
//   );
// }


import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  GraduationCap,
  BarChart3,
  FilterX,
} from 'lucide-react';
import { _get } from '@/Helper';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

interface Stats {
  total_students: number;
  pending_exams: number;
  upcoming_exams: number;
  completionRate: number;
  averageScore?: number;
  topPerformers?: number;
}

interface Exam {
  id: number;
  assessment_type: string;
  subject_name: string;
  class_name: string;
  commence_date: string;
  start_time: string;
  end_time: string;
  total_questions?: number;
  status?: string;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [examList, setExamList] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [filter, setFilter] = useState({ class: '', subject: '' });
  
  const [stats, setStats] = useState<Stats>({
    total_students: 0,
    pending_exams: 0,
    upcoming_exams: 0,
    completionRate: 0,
    averageScore: 0,
    topPerformers: 0,
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    _get(
      'examinations?query_type=select-all',
      (resp) => {
        if (resp.success) {
          const nonDraftExams = (resp.data || []).filter((e: Exam) => 
            e.status?.toLowerCase() !== 'draft'
          );
          
          setExamList(nonDraftExams);
          setFilteredExams(nonDraftExams);
          
          const totalExams = nonDraftExams.length;
          const activeExams = nonDraftExams.filter((e: Exam) => 
            e.status?.toLowerCase() === 'active' || !e.status
          ).length;
          
          setStats(prev => ({
            ...prev,
            pending_exams: totalExams,
            upcoming_exams: activeExams,
          }));
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
        toast.error('Failed to load dashboard data');
      }
    );
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = examList;
    if (filter.class) {
      filtered = filtered.filter(exam => exam.class_name === filter.class);
    }
    if (filter.subject) {
      filtered = filtered.filter(exam => exam.subject_name === filter.subject);
    }
    setFilteredExams(filtered);
  }, [filter, examList]);

  const uniqueClasses = [...new Set(examList.map(exam => exam.class_name))];
  const uniqueSubjects = [...new Set(examList.map(exam => exam.subject_name))];

  const statsData = [
    {
      icon: GraduationCap,
      label: 'Total Exams',
      value: stats.pending_exams.toString(),
      change: 'All time',
      color: 'text-[#002a56] dark:text-gray-600',
      bgColor: 'bg-[#002a56]/10 dark:bg-sky-500/10',
      onClick: () => navigate('/exams'),
    },
    {
      icon: Clock,
      label: 'Active Exams',
      value: stats.upcoming_exams.toString(),
      change: 'Ongoing',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      onClick: () => navigate('/exams'),
    },
    {
      icon: Users,
      label: 'Total Students',
      value: stats.total_students.toString(),
      change: 'Registered',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      onClick: () => navigate('/students/list'),
    },
    {
      icon: CheckCircle,
      label: 'Completion Rate',
      value: `${stats.completionRate}%`,
      change: 'Average',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
  ];

  const getStatusBadge = (status?: string) => {
    const statusLower = status?.toLowerCase() || 'active';
    if (statusLower === 'completed' || statusLower === 'released') {
      return <Badge className="bg-emerald-900 text-gray-200 dark:bg-emerald-500/10 dark:text-gray-100 border-none rounded-lg px-2.5 py-1">Completed</Badge>;
    } else if (statusLower === 'pending') {
      return <Badge className="bg-amber-900 text-gray-200 dark:bg-amber-500/10 dark:text-gray-100 border-none rounded-lg px-2.5 py-1">Pending</Badge>;
    } else {
      return <Badge className="bg-blue-950 text-gray-200 dark:bg-sky-500/10 dark:text-gray-100 border-none rounded-lg px-2.5 py-1">Active</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div data-tour="dashboard-overview">
        <h1 className="text-3xl font-extrabold text-[#002a56] dark:text-white tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Monitor exams, track performance, and manage your CBT operations
        </p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={cn(
                "border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl transition-all duration-300 group select-none",
                stat.onClick && "cursor-pointer hover:shadow-md hover:translate-y-[-2px]"
              )}
              onClick={stat.onClick}
            >
              <CardBody className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {stat.label}
                  </span>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {loading ? (
                      <span className="h-7 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse block" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    {stat.change}
                  </span>
                </div>
                <div className={cn("p-3.5 rounded-xl transition-transform duration-300 group-hover:scale-110", stat.bgColor)}>
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Progress Chart Card */}
      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
        <CardBody className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <BarChart3 className="h-5 w-5 text-[#002a56] dark:text-sky-800" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                  Overall Exam Completion
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Track dynamic metrics across live test completion rates
                </p>
              </div>
            </div>
            <span className="text-2xl font-bold text-[#002a56] dark:text-sky-800">
              {stats.completionRate}%
            </span>
          </div>
          <Progress value={stats.completionRate} className="h-2.5 bg-gray-100 dark:bg-gray-800" />
        </CardBody>
      </Card>

      {/* الجزء الثاني يتم إضافته مباشرة هنا في السطر التالي */}
            {/* Filter and Content Table */}
          <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <BookOpen className="h-5 w-5 text-[#002a56] dark:text-gray-600" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Active Dashboard Examinations
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter.class}
              onChange={(e) => setFilter(prev => ({ ...prev, class: e.target.value }))}
              className="text-xs font-medium bg-gray-50  dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#002a56] outline-none cursor-pointer"
            >
              <option value="" className=''>All Classes</option>
              {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filter.subject}
              onChange={(e) => setFilter(prev => ({ ...prev, subject: e.target.value }))}
              className="text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#002a56] outline-none cursor-pointer"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {(filter.class || filter.subject) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter({ class: '', subject: '' })}
                className="h-8 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl gap-1"
              >
                <FilterX className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400 animate-pulse">Loading list content...</div>
          ) : filteredExams.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <BookOpen className="h-8 w-8 text-gray-300 mx-auto" />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No active examinations match your filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100 dark:border-gray-800">
                      <th className="py-3.5 px-6">Subject / Type</th>
                      <th className="py-3.5 px-6">Target Class</th>
                      <th className="py-3.5 px-6">Schedule Date</th>
                      <th className="py-3.5 px-6">Timing Window</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {filteredExams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors group">
                        <td className="py-4 px-6">
                          <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">{exam.subject_name}</p>
                          <span className="text-xs text-gray-400 capitalize">{exam.assessment_type}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {exam.class_name}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(exam.commence_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 font-mono text-xs">
                          {exam.start_time.substring(0, 5)} - {exam.end_time.substring(0, 5)}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(exam.status)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant={exam.status?.toLowerCase() === 'completed' || exam.status?.toLowerCase() === 'released' ? 'success' : 'default'}
                            size="sm"
                            className="rounded-xl hover:shadow-sm font-semibold transition-all"
                            onClick={() => {
                              if (!exam.id) {
                                toast.error('Exam ID is missing');
                                return;
                              }
                              if (exam.status?.toLowerCase() === 'completed' || exam.status?.toLowerCase() === 'released') {
                                navigate(`/results?exam_id=${exam.id}`);
                              } else {
                                navigate(`/exams/${exam.id}/questions`);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1.5 inline" />
                            {exam.status?.toLowerCase() === 'completed' || exam.status?.toLowerCase() === 'released' 
                              ? 'View Results' 
                              : 'Manage Questions'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800 p-4 space-y-4">
                {filteredExams.map((exam) => (
                  <div key={exam.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{exam.subject_name}</h4>
                        <span className="text-xs text-gray-400 capitalize">{exam.assessment_type} ({exam.class_name})</span>
                      </div>
                      {getStatusBadge(exam.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {exam.commence_date}
                      </span>
                      <span>{exam.start_time.substring(0, 5)} - {exam.end_time.substring(0, 5)}</span>
                    </div>
                    <Button
                      variant={exam.status?.toLowerCase() === 'completed' || exam.status?.toLowerCase() === 'released' ? 'success' : 'default'}
                      className="w-full text-xs h-9 rounded-xl font-semibold"
                      onClick={() => {
                        if (!exam.id) {
                          toast.error('Exam ID is missing');
                          return;
                        }
                        if (exam.status?.toLowerCase() === 'completed' || exam.status?.toLowerCase() === 'released') {
                          navigate(`/results?exam_id=${exam.id}`);
                        } else {
                          navigate(`/exams/${exam.id}/questions`);
                        }
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5 inline" />
                      {exam.status?.toLowerCase() === 'completed' || exam.status?.toLowerCase() === 'released' 
                        ? 'View Results' 
                        : 'Manage Questions'}
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

