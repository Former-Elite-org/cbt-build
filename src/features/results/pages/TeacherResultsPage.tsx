// import { useState, useMemo, useEffect } from 'react';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { useResults } from '../hooks/useResults';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { 
//   Eye, 
//   Search, 
//   TrendingUp,
//   Users,
//   CheckCircle2,
//   XCircle,
//   FileSpreadsheet,
//   ArrowLeft
// } from 'lucide-react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { formatDate, formatTime } from '@/lib/utils/date';
// import { ExamResult } from '../types/result.types';
// import { useExams } from '@/features/exams/hooks/useExams';
// import toast from 'react-hot-toast';
// import * as XLSX from 'xlsx';

// export default function TeacherResultsPage() {
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const { selected_branch, user } = useAuthStore();
//   const [activeTab, setActiveTab] = useState<'all' | 'passed' | 'failed'>('all');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // Get selected exam from URL or state
//   const selectedExamId = searchParams.get('exam_id');
//   const [selectedExam, setSelectedExam] = useState<any>(null);

//   // Fetch teacher's exams
//   const { data: examsData, isLoading: examsLoading } = useExams({
//     branch_id: selected_branch?.branch_id || '',
//     teacher_id: (user as any)?.user_id || (user as any)?.id,
//     status: 'Released', // Only show released exams
//   });

//   // Fetch results only if an exam is selected
//   const { data, isLoading: resultsLoading } = useResults({
//     branch_id: selected_branch?.branch_id || '',
//     exam_id: selectedExamId || undefined,
//   });

//   const allResults = data?.data || [];
//   const teacherExams = examsData?.data || [];

//   // Filter results to only show those for teacher's exams
//   const results = useMemo(() => {
//     const examIds = new Set(teacherExams.map((exam: any) => exam.id || exam.exam_id));
//     return allResults.filter((result: ExamResult) => 
//       examIds.has(result.exam_id)
//     );
//   }, [allResults, teacherExams]);

//   // Set selected exam when exam_id changes in URL
//   useEffect(() => {
//     if (selectedExamId && teacherExams.length > 0) {
//       const exam = teacherExams.find((e: any) => (e.id || e.exam_id) === selectedExamId);
//       setSelectedExam(exam || null);
//     } else {
//       setSelectedExam(null);
//     }
//   }, [selectedExamId, teacherExams]);

//   const handleSelectExam = (examId: string) => {
//     if (examId === 'all') {
//       setSearchParams({});
//       setSelectedExam(null);
//     } else {
//       setSearchParams({ exam_id: examId });
//     }
//   };

//   const handleBackToExams = () => {
//     setSearchParams({});
//     setSelectedExam(null);
//   };

//   // Filter results
//   const filteredResults = useMemo(() => {
//     return results.filter((result: ExamResult) => {
//       const matchesSearch =
//         !searchTerm ||
//         result.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         result.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         result.student?.admission_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         result.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesTab = 
//         activeTab === 'all' ||
//         (activeTab === 'passed' && result.status === 'Pass') ||
//         (activeTab === 'failed' && result.status === 'Fail');

//       return matchesSearch && matchesTab;
//     });
//   }, [results, searchTerm, activeTab]);

//   // Calculate statistics
//   const statistics = useMemo(() => {
//     const total = filteredResults.length;
//     const passed = filteredResults.filter(r => r.status === 'Pass').length;
//     const failed = filteredResults.filter(r => r.status === 'Fail').length;
//     const average = total > 0
//       ? filteredResults.reduce((sum, r) => sum + r.percentage, 0) / total
//       : 0;

//     return { total, passed, failed, average };
//   }, [filteredResults]);

//   const getStatusBadge = (status: string) => {
//     if (status === 'Pass') {
//       return <Badge variant="default" className="bg-green-500">Passed</Badge>;
//     }
//     return <Badge variant="destructive">Failed</Badge>;
//   };

//   const getGradeColor = (percentage: number) => {
//     if (percentage >= 80) return 'text-green-600 dark:text-green-400 font-bold';
//     if (percentage >= 60) return 'text-blue-600 dark:text-blue-400 font-bold';
//     if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400 font-bold';
//     return 'text-red-600 dark:text-red-400 font-bold';
//   };

//   const handleViewDetails = (result: ExamResult) => {
//     navigate(`/examresults/${result.exam_id}?student_id=${result.student_id}`);
//   };

//   const handleExportExcel = () => {
//     try {
//       const exportData = filteredResults.map((result: ExamResult, index: number) => ({
//         'S/N': index + 1,
//         'Student Name': `${result.student?.first_name || ''} ${result.student?.last_name || ''}`.trim(),
//         'Admission No': result.student?.admission_no || result.student_id,
//         'Exam': result.exam?.title || 'N/A',
//         'Subject': result.exam?.subject_name || 'N/A',
//         'Class': result.exam?.class_name || 'N/A',
//         'Score': `${result.obtained_marks} / ${result.total_marks}`,
//         'Percentage': `${result.percentage.toFixed(2)}%`,
//         'Grade': result.grade || 'N/A',
//         'Status': result.status,
//         'Submitted': result.submitted_at ? formatDate(result.submitted_at) : 'N/A',
//       }));

//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Exam Results');
//       XLSX.writeFile(wb, `exam-results-${new Date().toISOString().split('T')[0]}.xlsx`);
//       toast.success('Results exported successfully');
//     } catch (error) {
//       console.error('Export error:', error);
//       toast.error('Failed to export results');
//     }
//   };

//   // If no exam is selected, show exam list
//   if (!selectedExamId) {
//     return (
//       <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-[#00356B] dark:text-white ">My Exam Results</h1>
//             <p className="text-gray-500 dark:text-gray-400 mt-1">
//               Select an exam to view results
//             </p>
//           </div>
//         </div>

//         {/* Exam List */}
//         {examsLoading ? (
//           <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
//             {[1, 2, 3, 4, 5, 6].map((i) => (
//               <Skeleton key={i} className="h-32 w-full" />
//             ))}
//           </div>
//         ) : teacherExams.length > 0 ? (
//           <div 
//             className="grid gap-4"
//             style={{
//               gridTemplateColumns: teacherExams.length === 1 
//                 ? '1fr' 
//                 : teacherExams.length === 2 
//                 ? 'repeat(2, 1fr)' 
//                 : 'repeat(auto-fit, minmax(300px, 1fr))'
//             }}
//           >
//             {teacherExams.map((exam: any) => {
//               const examId = exam.id || exam.exam_id;
//               return (
//                 <Card 
//                   key={examId} 
//                   className="cursor-pointer hover:shadow-lg transition-shadow"
//                   onClick={() => handleSelectExam(examId)}
//                 >
//                   <CardHeader>
//                     <CardTitle className="text-lg text-[#00356B] dark:text-white">{exam.title || exam.assessment_type}</CardTitle>
//                     <div className="flex gap-2 mt-2">
//                       {exam.subject_name && (
//                         <Badge variant="outline" className='text-[#00356B] dark:text-white border-2 border-[#00356B] dark:border-white/50'>{exam.subject_name}</Badge>
//                       )}
//                       {exam.class_name && (
//                         <Badge variant="outline" className='text-[#00356B] dark:text-white border-2 border-[#00356B] dark:border-white/50'>{exam.class_name}</Badge>
//                       )}
//                     </div>
//                   </CardHeader>
//                   <CardBody>
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-500">Date</p>
//                         <p className="text-sm font-medium text-[#00356B] dark:text-white">
//                           {exam.commence_date ? formatDate(exam.commence_date) : 'N/A'}
//                         </p>
//                       </div>
//                       <Button variant="outline" size="sm" className='text-[#00356B] dark:text-white border-2 border-[#00356B] dark:border-white/50'>
//                         View Results
//                       </Button>
//                     </div>
//                   </CardBody>
//                 </Card>
//               );
//             })}
//           </div>
//         ) : (
//           <Card>
//             <CardBody className="text-center py-12">
//               <p className="text-gray-500">No released exams found</p>
//             </CardBody>
//           </Card>
//         )}
//       </div>
//     );
//   }

//   // If exam is selected, show results for that exam
//   return (
//     <div className="space-y-6 p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="flex items-center gap-2 mb-2">
//             <Button variant="ghost" size="sm" onClick={handleBackToExams}>
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Exams
//             </Button>
//           </div>
//           <h1 className="text-3xl font-bold text-[#00356B] dark:text-white">
//             {selectedExam?.title || selectedExam?.assessment_type || 'Exam Results'}
//           </h1>
//           <p className="text-gray-500 dark:text-gray-400 mt-1">
//             Results for {selectedExam?.subject_name || ''} - {selectedExam?.class_name || ''}
//           </p>
//         </div>
//         {filteredResults.length > 0 && (
//           <Button onClick={handleExportExcel} className="gap-2">
//             <FileSpreadsheet className="h-4 w-4" />
//             Export to Excel
//           </Button>
//         )}
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Total Results</p>
//                 <p className="text-2xl text-blue-500 font-bold">{statistics.total}</p>
//               </div>
//               <Users className="h-8 w-8 text-blue-500" />
//             </div>
//           </CardBody>
//         </Card>
//         <Card>
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Passed</p>
//                 <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.passed}</p>
//               </div>
//               <CheckCircle2 className="h-8 w-8 text-green-500 dark:text-green-400" />
//             </div>
//           </CardBody>
//         </Card>
//         <Card>
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
//                 <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statistics.failed}</p>
//               </div>
//               <XCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
//             </div>
//           </CardBody>
//         </Card>
//         <Card>
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Average Score</p>
//                 <p className="text-2xl text-purple-500 font-bold">{statistics.average.toFixed(1)}%</p>
//               </div>
//               <TrendingUp className="h-8 w-8 text-purple-500" />
//             </div>
//           </CardBody>
//         </Card>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardBody>
//           <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="search" className="text-[#00356B] dark:text-white">Search</Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <Input
//                   id="search"
//                   placeholder="Search by student name or admission no..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//           </div>
//         </CardBody>
//       </Card>

//       {/* Results Tabs */}
//       <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4 text-[#00356B] dark:text-white">
//         <TabsList>
//           <TabsTrigger value="all">All Results ({filteredResults.length})</TabsTrigger>
//           <TabsTrigger value="passed">Passed ({statistics.passed})</TabsTrigger>
//           <TabsTrigger value="failed">Failed ({statistics.failed})</TabsTrigger>
//         </TabsList>

//         <TabsContent value={activeTab} className="space-y-4 mt-6">
//           {resultsLoading ? (
//             <div className="space-y-4">
//               {[1, 2, 3].map((i) => (
//                 <Skeleton key={i} className="h-32 w-full" />
//               ))}
//             </div>
//           ) : filteredResults.length > 0 ? (
//             filteredResults.map((result: ExamResult) => (
//               <Card key={result.id || `${result.exam_id}-${result.student_id}`}>
//                 <CardHeader>
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <CardTitle className="text-lg">
//                         {result.exam?.title || result.exam?.assessment_type || 'Exam'}
//                       </CardTitle>
//                       <p className="text-sm text-gray-500 mt-1">
//                         {result.student?.first_name} {result.student?.last_name}
//                         {result.student?.admission_no && ` (${result.student.admission_no})`}
//                       </p>
//                       <div className="flex gap-2 mt-2">
//                         {result.exam?.subject_name && (
//                           <Badge variant="outline">{result.exam.subject_name}</Badge>
//                         )}
//                         {result.exam?.class_name && (
//                           <Badge variant="outline">{result.exam.class_name}</Badge>
//                         )}
//                       </div>
//                     </div>
//                     {getStatusBadge(result.status)}
//                   </div>
//                 </CardHeader>
//                 <CardBody>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                     <div>
//                       <span className="text-sm text-gray-500">Score</span>
//                       <p className="text-lg font-semibold">
//                         {result.obtained_marks} / {result.total_marks}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-500">Percentage</span>
//                       <p className={`text-lg ${getGradeColor(result.percentage)}`}>
//                         {result.percentage.toFixed(1)}%
//                       </p>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-500">Grade</span>
//                       <p className="text-lg font-semibold">{result.grade || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-500">Submitted</span>
//                       <p className="text-sm font-medium">
//                         {result.submitted_at ? formatDate(result.submitted_at) : 'N/A'}
//                       </p>
//                       {result.submitted_at && (
//                         <p className="text-xs text-gray-500">
//                           {formatTime(result.submitted_at)}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleViewDetails(result)}
//                       className='text-[#00356B] dark:text-white border-2 border-[#00356B] dark:border-white/40'
//                     >
//                       <Eye className="w-4 h-4 mr-2" />
//                       View Details
//                     </Button>
//                   </div>
//                 </CardBody>
//               </Card>
//             ))
//           ) : (
//             <Card>
//               <CardBody className="text-center py-12">
//                 <p className="text-gray-500">No results found</p>
//               </CardBody>
//             </Card>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }


import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useResults } from '../hooks/useResults';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Search, 
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate } from '@/lib/utils/date';
import { ExamResult } from '../types/result.types';
import { useExams } from '@/features/exams/hooks/useExams';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function TeacherResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selected_branch, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'passed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedExamId = searchParams.get('exam_id');
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const { data: examsData, isLoading: examsLoading } = useExams({
    branch_id: selected_branch?.branch_id || '',
    teacher_id: (user as any)?.user_id || (user as any)?.id,
    status: 'Released',
  });

  const { data, isLoading: resultsLoading } = useResults({
    branch_id: selected_branch?.branch_id || '',
    exam_id: selectedExamId || undefined,
  });

  const allResults = data?.data || [];
  const teacherExams = examsData?.data || [];

  const results = useMemo(() => {
    const examIds = new Set(teacherExams.map((exam: any) => exam.id || exam.exam_id));
    return allResults.filter((result: ExamResult) => examIds.has(result.exam_id));
  }, [allResults, teacherExams]);

  useEffect(() => {
    if (selectedExamId && teacherExams.length > 0) {
      const exam = teacherExams.find((e: any) => (e.id || e.exam_id) === selectedExamId);
      setSelectedExam(exam || null);
    } else {
      setSelectedExam(null);
    }
  }, [selectedExamId, teacherExams]);

  const handleSelectExam = (examId: string) => {
    if (examId === 'all') {
      setSearchParams({});
      setSelectedExam(null);
    } else {
      setSearchParams({ exam_id: examId });
    }
  };

  const handleBackToExams = () => {
    setSearchParams({});
    setSelectedExam(null);
  };

  const filteredResults = useMemo(() => {
    return results.filter((result: ExamResult) => {
      const matchesSearch =
        !searchTerm ||
        result.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.admission_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab = 
        activeTab === 'all' ||
        (activeTab === 'passed' && result.status === 'Pass') ||
        (activeTab === 'failed' && result.status === 'Fail');

      return matchesSearch && matchesTab;
    });
  }, [results, searchTerm, activeTab]);

  const statistics = useMemo(() => {
    const total = filteredResults.length;
    const passed = filteredResults.filter(r => r.status === 'Pass').length;
    const failed = filteredResults.filter(r => r.status === 'Fail').length;
    const average = total > 0 ? filteredResults.reduce((sum, r) => sum + r.percentage, 0) / total : 0;
    return { total, passed, failed, average };
  }, [filteredResults]);

  const getStatusBadge = (status: string) => {
    if (status === 'Pass') {
      return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-2.5 py-0.5 text-xs font-semibold">Passed</Badge>;
    }
    return <Badge className="bg-rose-500 text-white hover:bg-rose-600 rounded-full px-2.5 py-0.5 text-xs font-semibold">Failed</Badge>;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600 dark:text-emerald-400 font-bold';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400 font-bold';
    if (percentage >= 40) return 'text-amber-600 dark:text-amber-400 font-bold';
    return 'text-rose-600 dark:text-rose-400 font-bold';
  };

  const handleExportExcel = () => {
    try {
      const exportData = filteredResults.map((result: ExamResult, index: number) => ({
        'S/N': index + 1,
        'Student Name': `${result.student?.first_name || ''} ${result.student?.last_name || ''}`.trim(),
        'Admission No': result.student?.admission_no || result.student_id,
        'Exam': result.exam?.title || 'N/A',
        'Subject': result.exam?.subject_name || 'N/A',
        'Class': result.exam?.class_name || 'N/A',
        'Score': `${result.obtained_marks} / ${result.total_marks}`,
        'Percentage': `${result.percentage.toFixed(2)}%`,
        'Grade': result.grade || 'N/A',
        'Status': result.status,
        'Submitted': result.submitted_at ? formatDate(result.submitted_at) : 'N/A',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Exam Results');
      XLSX.writeFile(wb, `exam-results-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Results exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export results');
    }
  };

  if (!selectedExamId) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div>
          <h1 data-tour="results-list" className="text-3xl font-bold text-[#00356B] dark:text-white">My Exam Results</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Select an exam to view results</p>
        </div>

        {examsLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        ) : teacherExams.length > 0 ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: teacherExams.length === 1 ? '1fr' : teacherExams.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {/* تابع لعرض بطاقات الامتحانات المتاحة للمدرس */}
            {teacherExams.map((exam: any) => {
              const examId = exam.id || exam.exam_id;
              return (
                <Card 
                  key={examId} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
                  onClick={() => handleSelectExam(examId)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-bold text-[#00356B] dark:text-white line-clamp-1">
                      {exam.title || exam.assessment_type}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {exam.subject_name && (
                        <Badge variant="outline" className='text-[#00356B] dark:text-blue-400 border border-[#00356B]/30 dark:border-blue-500/30 bg-[#00356B]/5 dark:bg-blue-500/10 rounded-full text-[10px] font-semibold px-2.5 py-0.5'>{exam.subject_name}</Badge>
                      )}
                      {exam.class_name && (
                        <Badge variant="outline" className='text-[#00356B] dark:text-blue-400 border border-[#00356B]/30 dark:border-blue-500/30 bg-[#00356B]/5 dark:bg-blue-500/10 rounded-full text-[10px] font-semibold px-2.5 py-0.5'>{exam.class_name}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody className="p-4 pt-2">
                    <div className="flex items-center justify-between border-t dark:border-gray-700/50 pt-3 mt-2">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Date</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                          {exam.commence_date ? formatDate(exam.commence_date) : 'N/A'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className='text-[#00356B] dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs h-8 rounded-lg font-semibold px-3'>
                        View Results
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
            <CardBody className="text-center py-12 p-6">
              <p className="text-gray-500 dark:text-gray-400 font-medium">No released exams found</p>
            </CardBody>
          </Card>
        )}
      </div>
    );
  }

  /* واجهة العرض الرئيسية عند اختيار امتحان محدد */
  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-gray-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToExams}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs h-8 px-2.5 rounded-lg"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Exams
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#00356B] dark:text-white tracking-tight">
            {selectedExam?.title || selectedExam?.assessment_type || 'Exam Results'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Results for {selectedExam?.subject_name || ''} {selectedExam?.class_name ? ` - ${selectedExam.class_name}` : ''}
          </p>
        </div>
        {filteredResults.length > 0 && (
          <Button 
            onClick={handleExportExcel} 
            className="gap-2 bg-[#00356B] hover:bg-[#00254B] text-white font-semibold h-10 px-4 rounded-xl shadow-sm text-sm self-start sm:self-auto"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export to Excel
          </Button>
        )}
      </div>
      {/* Search Input Box */}
      <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
        <CardBody className="p-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Search Students
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by student name or admission no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white h-10 focus-visible:ring-[#00356B]"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results Tabs Switcher */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl max-w-md border border-gray-200/50 dark:border-gray-600/50">
          <TabsTrigger value="all" className="rounded-lg text-xs font-semibold py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            All ({filteredResults.length})
          </TabsTrigger>
          <TabsTrigger value="passed" className="rounded-lg text-xs font-semibold py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            Passed ({statistics.passed})
          </TabsTrigger>
          <TabsTrigger value="failed" className="rounded-lg text-xs font-semibold py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            Failed ({statistics.failed})
          </TabsTrigger>
        </TabsList>
        {/* محتوى علامات التبويب وعرض النتائج المفلترة */}
        <TabsContent value={activeTab} className="space-y-4 mt-6 focus-visible:outline-none">
          {resultsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((result: ExamResult) => (
              <Card key={result.id || `${result.exam_id}-${result.student_id}`} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-50 dark:border-gray-700/50 p-4 bg-gray-50/30 dark:bg-gray-900/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-bold text-gray-800 dark:text-white truncate">
                        {result.exam?.title || result.exam?.assessment_type || 'Exam'}
                      </CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        Student: {result.student?.first_name} {result.student?.last_name}
                        {result.student?.admission_no && ` (${result.student.admission_no})`}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {result.exam?.subject_name && (
                          <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-full text-[10px] px-2.5 py-0.5">{result.exam.subject_name}</Badge>
                        )}
                        {result.exam?.class_name && (
                          <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-full text-[10px] px-2.5 py-0.5">{result.exam.class_name}</Badge>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                </CardHeader>
                <CardBody className="p-5 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {/* Score */}
                    <div>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Score</span>
                      <p className="text-base font-bold text-gray-800 dark:text-white mt-0.5">
                        {result.obtained_marks} <span className="text-xs font-normal text-gray-400">/ {result.total_marks}</span>
                      </p>
                    </div>

                    {/* Percentage */}
                    <div>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Percentage</span>
                      <p className={`text-base font-black mt-0.5 ${getGradeColor(result.percentage)}`}>
                        {result.percentage.toFixed(1)}%
                      </p>
                    </div>

                    {/* Grade */}
                    <div>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Grade</span>
                      <p className="text-base font-bold text-gray-800 dark:text-white mt-0.5">
                        {result.grade || 'N/A'}
                      </p>
                    </div>

                    {/* Submitted At */}
                    <div>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Submitted</span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">
                        {result.submitted_at ? formatDate(result.submitted_at) : 'N/A'}
                      </p>
                      {result.submitted_at && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {result.submitted_at ? new Date(result.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Link Controller */}
                  <div className="pt-3 border-t border-gray-50 dark:border-gray-700/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(result)}
                      className="w-full sm:w-auto border-gray-200 dark:border-gray-700 text-[#00356B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-xs h-9 px-4 font-semibold"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            /* Empty Results Block */
            <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
              <CardBody className="text-center py-12 p-6">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No results found</p>
              </CardBody>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
