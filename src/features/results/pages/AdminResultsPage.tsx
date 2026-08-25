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
//   Download, 
//   Search, 
//   Filter,
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

// export default function AdminResultsPage() {
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const { selected_branch } = useAuthStore();
//   const [activeTab, setActiveTab] = useState<'all' | 'passed' | 'failed'>('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterClass, setFilterClass] = useState<string>('all');
  
//   // Get selected exam from URL or state
//   const selectedExamId = searchParams.get('exam_id');
//   const [selectedExam, setSelectedExam] = useState<any>(null);

//   // Fetch exams for selection
//   const { data: examsData, isLoading: examsLoading } = useExams({
//     branch_id: selected_branch?.branch_id || '',
//     status: 'Released', // Only show released exams
//   });

//   // Fetch results only if an exam is selected
//   const { data, isLoading: resultsLoading } = useResults({
//     branch_id: selected_branch?.branch_id || '',
//     exam_id: selectedExamId || undefined,
//   });

//   const results = data?.data || [];
//   const exams = examsData?.data || [];

//   // Set selected exam when exam_id changes in URL
//   useEffect(() => {
//     if (selectedExamId && exams.length > 0) {
//       const exam = exams.find((e: any) => (e.id || e.exam_id) === selectedExamId);
//       setSelectedExam(exam || null);
//     } else {
//       setSelectedExam(null);
//     }
//   }, [selectedExamId, exams]);

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

//   // Get unique classes from results
//   const classes = useMemo(() => {
//     const classSet = new Set<string>();
//     results.forEach((result: ExamResult) => {
//       if (result.exam?.class_name) {
//         classSet.add(result.exam.class_name);
//       }
//     });
//     return Array.from(classSet).sort();
//   }, [results]);

//   // Filter results
//   const filteredResults = useMemo(() => {
//     return results.filter((result: ExamResult) => {
//       const matchesSearch =
//         !searchTerm ||
//         result.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         result.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         result.student?.admission_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         result.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesClass = filterClass === 'all' || result.exam?.class_name === filterClass;
//       const matchesTab = 
//         activeTab === 'all' ||
//         (activeTab === 'passed' && result.status === 'Pass') ||
//         (activeTab === 'failed' && result.status === 'Fail');

//       return matchesSearch && matchesClass && matchesTab;
//     });
//   }, [results, searchTerm, filterClass, activeTab]);

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
//             <h1 className="text-3xl font-bold text-[#002a56] dark:text-white">Exam Results</h1>
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
//         ) : exams.length > 0 ? (
//           <div 
//             className="grid gap-4"
//             style={{
//               gridTemplateColumns: exams.length === 1 
//                 ? '1fr' 
//                 : exams.length === 2 
//                 ? 'repeat(2, 1fr)' 
//                 : 'repeat(auto-fit, minmax(300px, 1fr))'
//             }}
//           >
//             {exams.map((exam: any) => {
//               const examId = exam.id || exam.exam_id;
//               return (
//                 <Card 
//                   key={examId} 
//                   className="cursor-pointer hover:shadow-lg transition-shadow"
//                   onClick={() => handleSelectExam(examId)}
//                 >
//                   <CardHeader>
//                     <CardTitle className="text-lg text-[#002a56] dark:text-white">{exam.title || exam.assessment_type}</CardTitle>
//                     <div className="flex gap-2 text-[#002a56] mt-2">
//                       {exam.subject_name && (
//                         <Badge className='border-[#002a56] text-[#002a56] dark:text-white dark:border-white' variant="outline">{exam.subject_name}</Badge>
//                       )}
//                       {exam.class_name && (
//                         <Badge className='border-[#002a56] text-[#002a56] dark:text-white dark:border-white' variant="outline">{exam.class_name}</Badge>
//                       )}
//                     </div>
//                   </CardHeader>
//                   <CardBody>
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-500">Date</p>
//                         <p className="text-sm font-medium text-[#002a56] dark:text-white">
//                           {exam.commence_date ? formatDate(exam.commence_date) : 'N/A'}
//                         </p>
//                       </div>
//                       <Button className='bg-[#002a56] text-white dark:bg-white dark:text-[#002a56]' variant="outline" size="sm">
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
//           <h1 className="text-3xl font-bold text-gray-900  dark:text-white">
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
//                 <p className="text-2xl font-bold text-blue-500">{statistics.total}</p>
//               </div>
//               <Users className="h-8 w-8 text-blue-500" />
//             </div>
//           </CardBody>
//         </Card>
//         <Card>
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Passed</p>
//                 <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.passed}</p>
//               </div>
//               <CheckCircle2 className="h-8 w-8 text-green-500" />
//             </div>
//           </CardBody>
//         </Card>
//         <Card>
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Failed</p>
//                 <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statistics.failed}</p>
//               </div>
//               <XCircle className="h-8 w-8 text-red-500" />
//             </div>
//           </CardBody>
//         </Card>
//         <Card>
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Average Score</p>
//                 <p className="text-2xl font-bold text-purple-500">{statistics.average.toFixed(1)}%</p>
//               </div>
//               <TrendingUp className="h-8 w-8 text-purple-500" />
//             </div>
//           </CardBody>
//         </Card>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardBody>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="search">Search</Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <Input
//                   id="search"
//                   placeholder="Search by student name or admission no..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 "
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="class-filter">Filter by Class</Label>
//               <Select value={filterClass} onValueChange={setFilterClass} >
//                 <SelectTrigger>
//                   <SelectValue placeholder="All classes" className="text-[#002a56] dark:text-white" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All classes</SelectItem>
//                   {classes.map((className) => (
//                     <SelectItem key={className} value={className} >
//                       {className}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardBody>
//       </Card>

//       {/* Results Tabs */}
//       <Tabs value={activeTab} className="text-[#002a56] dark:text-white" onValueChange={(v) => setActiveTab(v as any)}>
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
  ArrowLeft,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate, formatTime } from '@/lib/utils/date';
import { ExamResult } from '../types/result.types';
import { useExams } from '@/features/exams/hooks/useExams';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils/cn';

export default function AdminResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selected_branch } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'passed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  
  const selectedExamId = searchParams.get('exam_id');
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const { data: examsData, isLoading: examsLoading } = useExams({
    branch_id: selected_branch?.branch_id || '',
    status: 'Released',
  });

  const { data: dataResults, isLoading: resultsLoading } = useResults({
    branch_id: selected_branch?.branch_id || '',
    exam_id: selectedExamId || undefined,
  });

  const results = dataResults?.data || [];
  const exams = examsData?.data || [];

  useEffect(() => {
    if (selectedExamId && exams.length > 0) {
      const exam = exams.find((e: any) => (e.id || e.exam_id) === selectedExamId);
      setSelectedExam(exam || null);
    } else {
      setSelectedExam(null);
    }
  }, [selectedExamId, exams]);
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

  const classes = useMemo(() => {
    const classSet = new Set<string>();
    results.forEach((result: ExamResult) => {
      if (result.exam?.class_name) {
        classSet.add(result.exam.class_name);
      }
    });
    return Array.from(classSet).sort();
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((result: ExamResult) => {
      const matchesSearch =
        !searchTerm ||
        result.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.admission_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = filterClass === 'all' || result.exam?.class_name === filterClass;
      const matchesTab = 
        activeTab === 'all' ||
        (activeTab === 'passed' && result.status === 'Pass') ||
        (activeTab === 'failed' && result.status === 'Fail');

      return matchesSearch && matchesClass && matchesTab;
    });
  }, [results, searchTerm, filterClass, activeTab]);

  const statistics = useMemo(() => {
    const total = filteredResults.length;
    const passed = filteredResults.filter(r => r.status === 'Pass').length;
    const failed = filteredResults.filter(r => r.status === 'Fail').length;
    const average = total > 0
      ? filteredResults.reduce((sum, r) => sum + r.percentage, 0) / total
      : 0;

    return { total, passed, failed, average };
  }, [filteredResults]);

  const getStatusBadge = (status: string) => {
    if (status === 'Pass') {
      return <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-none rounded-lg font-semibold px-2.5 py-0.5">Passed</Badge>;
    }
    return <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-none rounded-lg font-semibold px-2.5 py-0.5">Failed</Badge>;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600 dark:text-emerald-400 font-bold';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400 font-bold';
    if (percentage >= 40) return 'text-amber-600 dark:text-amber-400 font-bold';
    return 'text-rose-600 dark:text-rose-400 font-bold';
  };

  const handleViewDetails = (result: ExamResult) => {
    navigate(`/examresults/${result.exam_id}?student_id=${result.student_id}`);
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
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#002a56] dark:text-white tracking-tight">Exam Results Records</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Select an active published exam repository to view performance logs.</p>
          </div>
        </div>

        {examsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : exams.length > 0 ? (
          <div 
            className="grid gap-5"
            style={{
              gridTemplateColumns: exams.length === 1 
                ? '1fr' 
                : exams.length === 2 
                ? 'repeat(2, 1fr)' 
                : 'repeat(auto-fit, minmax(300px, 1fr))'
            }}
          >
            {exams.map((exam: any) => {
              const examId = exam.id || exam.exam_id;
              return (
                <Card 
                  key={examId} 
                  className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl cursor-pointer hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 select-none group"
                  onClick={() => handleSelectExam(examId)}
                >
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#002a56] dark:group-hover:text-gray-200 transition-colors">
                      {exam.title || exam.assessment_type}
                    </CardTitle>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {exam.subject_name && (
                        <Badge className="bg-[#002a56]/5 text-[#002a56] dark:bg-gray-500/10 dark:text-gray-200 border-none rounded-lg text-xs font-semibold px-2 py-0.5" variant="outline">{exam.subject_name}</Badge>
                      )}
                      {exam.class_name && (
                        <Badge className="bg-gray-50 text-gray-500 dark:bg-gray-800 border-none rounded-lg text-xs font-semibold px-2 py-0.5" variant="outline">Class {exam.class_name}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody className="p-6 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/60">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Commenced Date</p>
                        <p className="text-xs font-semibold text-[#002a56] dark:text-gray-200">
                          {exam.commence_date ? formatDate(exam.commence_date) : 'N/A'}
                        </p>
                      </div>
                      <Button className="h-8 rounded-xl bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-white dark:text-[#002a56] text-xs font-bold" variant="outline" size="sm">
                        View Results
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
            <CardBody className="text-center py-16 space-y-2">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto animate-pulse" />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No released examinations logs found in this branch.</p>
            </CardBody>
          </Card>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Action Header navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToExams}
            className="h-8 rounded-xl text-xs gap-1.5 px-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Exams
          </Button>
          <h1 className="text-3xl font-extrabold text-[#002a56] dark:text-white tracking-tight mt-1">
            {selectedExam?.title || selectedExam?.assessment_type || 'Exam Results'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Results for {selectedExam?.subject_name || ''} - {selectedExam?.class_name || ''}
          </p>
        </div>
        {filteredResults.length > 0 && (
          <Button 
            onClick={handleExportExcel} 
            className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 gap-1.5 h-10 border-none shadow-sm px-4"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export to Excel
          </Button>
        )}
      </div>

      {/* Analytics Statistics Blocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Results</p>
              <p className="text-2xl font-extrabold text-blue-500">{statistics.total}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-sky-500/10 rounded-xl text-blue-500"><Users className="h-6 w-6" /></div>
          </CardBody>
        </Card>
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Passed</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{statistics.passed}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500"><CheckCircle2 className="h-6 w-6" /></div>
          </CardBody>
        </Card>
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Failed</p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{statistics.failed}</p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500"><XCircle className="h-6 w-6" /></div>
          </CardBody>
        </Card>
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Average Score</p>
              <p className="text-2xl font-extrabold text-purple-500">{statistics.average.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-500"><TrendingUp className="h-6 w-6" /></div>
          </CardBody>
        </Card>
      </div>

      {/* Control Box Filtering Form Controls */}
      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="search" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Search</Label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by student name or admission no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-gray-100 dark:border-gray-800 text-xs focus:ring-1 focus:ring-[#002a56]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="class-filter" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Filter by Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-full h-10 rounded-xl border-gray-100 dark:border-gray-800 text-xs bg-gray-50 dark:bg-gray-800">
                  <SelectValue placeholder="All classes" className="text-[#002a56] dark:text-white" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                  <SelectItem value="all">All classes</SelectItem>
                  {classes.map((className) => (
                    <SelectItem key={className} value={className}>{className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* Results Tabs Switcher layout list Display */}
      <Tabs value={activeTab} className="w-full space-y-6" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl h-9 border-none w-full max-w-md flex gap-1">
          <TabsTrigger value="all" className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-[#002a56] data-[state=active]:text-white dark:data-[state=active]:bg-red-950/60 flex-1">All Results ({filteredResults.length})</TabsTrigger>
          <TabsTrigger value="passed" className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-[#002a56] data-[state=active]:text-white dark:data-[state=active]:bg-red-950/60 flex-1">Passed ({statistics.passed})</TabsTrigger>
          <TabsTrigger value="failed" className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-[#002a56] data-[state=active]:text-white dark:data-[state=active]:bg-red-950/60 flex-1">Failed ({statistics.failed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 m-0 focus-visible:outline-none">
          {resultsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((result: ExamResult) => (
              <Card key={result.id || `${result.exam_id}-${result.student_id}`} className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
                <CardHeader className="p-6 pb-4 border-b border-gray-50 dark:border-gray-800/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {result.exam?.title || result.exam?.assessment_type || 'Exam'}
                      </CardTitle>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {result.student?.first_name} {result.student?.last_name}
                        {result.student?.admission_no && (
                          <span className="font-mono text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-1.5 py-0.5 rounded ml-1.5">({result.student.admission_no})</span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {result.exam?.subject_name && (
                          <Badge className="bg-[#002a56]/5 text-[#002a56] dark:bg-red-500/20 dark:text-red-950 border-none rounded-lg text-[10px] font-bold px-2 py-0.5" variant="outline">{result.exam.subject_name}</Badge>
                        )}
                        {result.exam?.class_name && (
                          <Badge className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-none rounded-lg text-[10px] font-bold px-2 py-0.5" variant="outline">{result.exam.class_name}</Badge>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                </CardHeader>
                <CardBody className="p-6 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Score</span>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {result.obtained_marks} / {result.total_marks}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Percentage</span>
                      <p className={cn("text-sm font-bold", getGradeColor(result.percentage))}>
                        {result.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Grade</span>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{result.grade || 'N/A'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Submitted</span>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {result.submitted_at ? formatDate(result.submitted_at) : 'N/A'}
                      </p>
                      {result.submitted_at && (
                        <p className="text-[10px] text-gray-400 font-mono">
                          {formatTime(result.submitted_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-50 dark:border-gray-800/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(result)}
                      className="h-8 rounded-xl hover:bg-[#002a56]/10 text-[#002a56] dark:text-gray-400 dark:hover:bg-sky-500/10 gap-1.5 text-xs font-bold"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
              <CardBody className="text-center py-16">
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No results found</p>
              </CardBody>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
