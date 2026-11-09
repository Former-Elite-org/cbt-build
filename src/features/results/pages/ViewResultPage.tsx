// import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
// import { useDetailedResult } from '../hooks/useResults';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { ArrowLeft, Download, CheckCircle2, XCircle } from 'lucide-react';
// import { formatDate, formatTime } from '@/lib/utils/date';
// import { getAlpha } from '@/lib/utils/format';

// export default function ViewResultPage() {
//   const { id } = useParams<{ id: string }>();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const { user } = useAuthStore();
  
//   // Get student ID from query params or from user (for students viewing their own)
//   const studentId = searchParams.get('student_id') || 
//                     searchParams.get('admission_no') ||
//                     (user as any)?.admission_no || 
//                     (user as any)?.id;

//   const userType = user?.user_type?.toLowerCase() || '';

//   // If no student_id and user is admin/teacher, redirect to results page filtered by exam
//   if (!studentId && (userType === 'admin' || userType === 'branchadmin' || userType === 'teacher')) {
//     if (id) {
//       navigate(`/results?exam_id=${id}`);
//       return null;
//     }
//   }

//   // For students, they must have a student_id (their own)
//   if (!studentId && userType === 'student') {
//     return (
//       <div className="text-center py-12 p-6">
//         <p className="text-gray-500">Result not found</p>
//         <Button onClick={() => navigate('/my-results')} className="mt-4">
//           Back to My Results
//         </Button>
//       </div>
//     );
//   }

//   const { data, isLoading } = useDetailedResult(id || null, studentId || null);

//   const result = data?.data;

//   if (isLoading) {
//     return (
//       <div className="space-y-4 p-6">
//         <Skeleton className="h-8 w-64" />
//         <Skeleton className="h-64 w-full" />
//       </div>
//     );
//   }

//   if (!result) {
//     return (
//       <div className="text-center py-12 p-6">
//         <p className="text-gray-500">Result not found</p>
//         <Button onClick={() => navigate('/results')} className="mt-4">
//           Back to Results
//         </Button>
//       </div>
//     );
//   }

//   const getStatusColor = (isCorrect: boolean) => {
//     return isCorrect
//       ? 'border-green-200 bg-green-50'
//       : 'border-red-200 bg-red-50';
//   };

//   const getScoreColor = (percentage: number) => {
//     if (percentage >= 80) return 'text-green-600 dark:text-green-400';
//     if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
//     if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
//     return 'text-red-600 dark:text-red-400';
//   };

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <Button
//             variant="ghost"
//             onClick={() => navigate(userType === 'student' ? '/my-results' : '/results')}
//             className="mb-4"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             {userType === 'student' ? 'Back to My Results' : 'Back to Results'}
//           </Button>
//           <h1 className="text-3xl font-bold text-[#002a56] dark:text-white ">Exam Result Details</h1>
//         </div>
//         <Button className='text-[#002a56] dark:text-white dark:border-gray-700 border-[#002a56]' variant="outline">
//           <Download className="w-4 h-4 mr-2" />
//           Download PDF
//         </Button>
//       </div>

//       {/* Summary Card */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-[#002a56] dark:text-white">{result.exam?.title || 'Exam Result'}</CardTitle>
//         </CardHeader>
//         <CardBody>
//           <div className="grid grid-cols-2  md:grid-cols-4 gap-6 mb-6">
//             <div>
//               <p className="text-sm text-gray-500">Student</p>
//               <p className="font-semibold text-lg text-[#002a56] dark:text-white">
//                 {result.student?.first_name} {result.student?.last_name}
//               </p>
//               {result.student?.admission_no && (
//                 <p className="text-sm text-gray-500">
//                   {result.student.admission_no}
//                 </p>
//               )}
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Score</p>
//               <p className="font-semibold text-lg text-[#002a56] dark:text-white">
//                 {result.obtained_marks} / {result.total_marks}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Percentage</p>
//               <p className={`font-bold text-2xl ${getScoreColor(result.percentage)}`}>
//                 {result.percentage.toFixed(1)}%
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Status</p>
//               <Badge
//                 variant={result.status === 'Pass' ? 'success' : 'destructive'}
//                 className="text-lg px-3 py-1"
//               >
//                 {result.status}
//               </Badge>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//             <div>
//               <p className="text-sm text-gray-500">Grade</p>
//               <p className="font-medium text-[#002a56] dark:text-white">{result.grade || 'N/A'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Time Taken</p>
//               <p className="font-medium text-[#002a56] dark:text-white">
//                 {result.time_taken ? `${Math.round(result.time_taken)} minutes` : 'N/A'}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Submitted</p>
//               <p className="font-medium text-[#002a56] dark:text-white">{formatDate(result.submitted_at)}</p>
//               <p className="text-xs text-gray-500">{formatTime(result.submitted_at)}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Correct Answers</p>
//               <p className="font-medium text-[#002a56] dark:text-white">
//                 {result.question_results?.filter((q) => q.is_correct).length || 0} /{' '}
//                 {result.question_results?.length || 0}
//               </p>
//             </div>
//           </div>
//         </CardBody>
//       </Card>

//       {/* Question Results */}
//       {result.question_results && result.question_results.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-[#002a56] dark:text-white">Question Breakdown</CardTitle>
//           </CardHeader>
//           <CardBody className="space-y-4">
//             {result.question_results.map((qResult, index) => (
//               <div
//                 key={qResult.question_id}
//                 className={`p-4 border-2 dark:border-gray-700 dark:bg-gray-900 rounded-lg ${getStatusColor(qResult.is_correct)}`}
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-2">
//                       <span className="font-semibold text-[#021c37] dark:text-white">Question {index + 1}</span>
//                       <Badge variant="outline" className="text-xs px-2 py-0.5 text-[#040f1a] dark:text-white/80">
//                         {qResult.question_type === 'multiple_choice' ? 'Multiple Choice' :
//                          qResult.question_type === 'true_false' ? 'True/False' :
//                          qResult.question_type === 'short_answer' ? 'Short Answer' :
//                          qResult.question_type}
//                       </Badge>
//                       {qResult.is_correct ? (
//                         <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
//                       ) : (
//                         <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
//                       )}
//                     </div>
//                     <p className="text-gray-900 dark:text-white mb-3">{qResult.question_text}</p>
//                   </div>
//                   <div className="text-right ml-4">
//                     <p className="text-sm text-gray-500">Score</p>
//                     <p
//                       className={`font-bold ${
//                         qResult.is_correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
//                       }`}
//                     >
//                       {qResult.obtained_marks} / {qResult.marks}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Options (for multiple choice) */}
//                 {qResult.options && qResult.options.length > 0 && (
//                   <div className="space-y-2 mb-3 text-[#002a56] dark:text-white">
//                     {qResult.options.map((option, optIdx) => {
//                       const optionLabel = option.option_label || getAlpha(optIdx);
//                       const isSelected = qResult.selected_option === optionLabel || 
//                                         qResult.answer === option.option ||
//                                         qResult.answer === optionLabel;
//                       const isCorrect = option.is_correct;

//                       return (
//                         <div
//                           key={optIdx}
//                           className={`p-2 rounded border ${
//                             isCorrect
//                               ? 'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-800'
//                               : isSelected
//                               ? 'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-800'
//                               : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
//                           }`}
//                         >
//                           <div className="flex items-center gap-2">
//                             <span className="font-semibold">{optionLabel}.</span>
//                             <span>{option.option}</span>
//                             {isCorrect && (
//                               <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />
//                             )}
//                             {isSelected && !isCorrect && (
//                               <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 ml-auto" />
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}

//                 {/* Answers */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//                   <div className="p-2 bg-gray-50 dark:bg-gray-600/80 border border-gray-200 dark:border-gray-500 rounded">
//                     <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Answer:</p>
//                     <p className="text-gray-900 dark:text-white">
//                       {qResult.answer || qResult.selected_option || 'Not answered'}
//                     </p>
//                   </div>
//                   <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
//                     <p className="font-semibold text-[#00356B] dark:text-blue-300 mb-1">Correct Answer:</p>
//                     <p className="text-blue-900 dark:text-blue-300">
//                       {qResult.correct_answer || 
//                        (qResult.options?.find(opt => opt.is_correct) 
//                          ? `${qResult.options.find(opt => opt.is_correct).option_label}. ${qResult.options.find(opt => opt.is_correct).option}`
//                          : 'N/A')}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </CardBody>
//         </Card>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDetailedResult } from '../hooks/useResults';
import { useAuthStore } from '@/features/auth/store/authStore';
import { isAdminRole, isStudentRole, isTeacherRole } from '@/lib/utils/roles';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, CheckCircle2, XCircle, Calendar, Clock, Award, ShieldCheck, FileText } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils/date';
import { getAlpha } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export default function ViewResultPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const studentId = searchParams.get('student_id') || 
                    searchParams.get('admission_no') ||
                    (user as any)?.admission_no || 
                    (user as any)?.id;

  const studentView = isStudentRole(user?.user_type);

  if (!studentId && (isAdminRole(user?.user_type) || isTeacherRole(user?.user_type))) {
    if (id) {
      navigate(`/results?exam_id=${id}`);
      return null;
    }
  }

  if (!studentId && studentView) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center space-y-4">
        <XCircle className="h-12 w-12 text-rose-500 animate-pulse" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Result log not found or session expired.</p>
        <Button onClick={() => navigate('/my-results')} className="rounded-xl text-xs font-bold bg-[#002a56] text-white dark:bg-sky-600">
          Back to My Results
        </Button>
      </div>
    );
  }

  const { data, isLoading } = useDetailedResult(id || null, studentId || null);
  const result = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-950 min-h-screen animate-pulse">
        <Skeleton className="h-8 w-64 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <Skeleton className="h-64 w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center space-y-4">
        <XCircle className="h-12 w-12 text-rose-500 animate-pulse" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Result details could not be retrieved from records.</p>
        <Button onClick={() => navigate('/results')} className="rounded-xl text-xs font-bold bg-[#002a56] text-white dark:bg-sky-600">
          Back to Results
        </Button>
      </div>
    );
  }

  const getStatusColor = (isCorrect: boolean) => {
    return isCorrect
      ? 'border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/50 dark:bg-emerald-500/5'
      : 'border-rose-200 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-500/5';
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-gray-50 dark:bg-gray-950 min-h-screen p-6">
      {/* Header Info Dashboard Top navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(studentView ? '/my-results' : '/results')}
            className="h-8 rounded-xl text-xs gap-1.5 px-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {studentView ? 'Back to My Results' : 'Back to Results'}
          </Button>
          <h1 className="text-2xl font-extrabold text-[#002a56] dark:text-white tracking-tight mt-1">Exam Result Details</h1>
          <p className="text-xs text-gray-400 font-medium">Diagnostic profile overview for candidate answers and academic evaluation grading.</p>
        </div>
        
        <Button className="rounded-xl text-xs font-bold h-10 border-none bg-white hover:bg-gray-50 text-gray-700 shadow dark:bg-gray-900 dark:text-gray-200 gap-1.5 px-4" variant="outline">
          <Download className="w-3.5 h-3.5" /> Download PDF Transcript
        </Button>
      </div>

      {/* Summary Card Layout parameters */}
      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/40 dark:bg-gray-800/10">
          <CardTitle className="text-base font-bold text-[#002a56] dark:text-gray-600">{result.exam?.title || 'Examination Metrics Summary'}</CardTitle>
        </CardHeader>
        <CardBody className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Student Profile</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {result.student?.first_name} {result.student?.last_name}
              </p>
              {result.student?.admission_no && (
                <p className="text-xs font-mono text-gray-400">({result.student.admission_no})</p>
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Score Obtained</p>
              <p className="text-sm font-extrabold text-gray-800 dark:text-gray-100">
                {result.obtained_marks} <span className="text-gray-400 text-xs font-normal">/ {result.total_marks} pts</span>
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Percentage Rating</p>
              <p className={cn("text-xl font-black", getScoreColor(result.percentage))}>
                {result.percentage.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Verdict Status</p>
              <Badge
                className={cn(
                  "border-none rounded-lg px-2.5 py-1 text-xs font-bold mt-0.5",
                  result.status === 'Pass' 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                    : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                )}
              >
                {result.status || 'Evaluated'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Letter Grade</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{result.grade || 'N/A'}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time Duration Taken</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                {result.time_taken ? `${Math.round(result.time_taken)} minutes` : 'N/A'}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Submitted Date Log</p>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-gray-400" /> {formatDate(result.submitted_at)}</p>
              <p className="text-[10px] text-gray-400 font-mono ml-4.5">{formatTime(result.submitted_at)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Correct Answers</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {result.question_results?.filter((q: any) => q.is_correct).length || 0} <span className="text-gray-400 font-normal text-xs">/ {result.question_results?.length || 0}</span>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* Question Breakdown Details Feed Container */}
      {result.question_results && result.question_results.length > 0 && (
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800/60">
            <CardTitle className="text-base font-bold text-[#002a56] dark:text-gray-600">Itemized Performance Breakdown</CardTitle>
          </CardHeader>
          <CardBody className="p-6 space-y-5">
            {result.question_results.map((qResult: any, index: number) => (
              <div
                key={qResult.question_id || index}
                className={cn("p-5 border-2 rounded-2xl space-y-4 transition-all duration-200", getStatusColor(qResult.is_correct))}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#021c37] dark:text-gray-100">Question {index + 1}</span>
                      <Badge className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-none rounded-md">
                        {qResult.question_type === 'multiple_choice' ? 'Multiple Choice' :
                         qResult.question_type === 'true_false' ? 'True / False' :
                         qResult.question_type === 'short_answer' ? 'Short Answer' :
                         qResult.question_type || 'Test Item'}
                      </Badge>
                      {qResult.is_correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">{qResult.question_text}</p>
                  </div>
                  
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Weight</p>
                    <p className={cn("text-sm font-black", qResult.is_correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      {qResult.obtained_marks} <span className="text-gray-400 text-xs font-normal">/ {qResult.marks} pts</span>
                    </p>
                  </div>
                </div>
                {/* Options mapping block conditionally for MCQ test banks */}
                {qResult.options && qResult.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {qResult.options.map((option: any, optIdx: number) => {
                      const optionLabel = option.option_label || getAlpha(optIdx);
                      const isSelected = qResult.selected_option === optionLabel || 
                                        qResult.answer === option.option ||
                                        qResult.answer === optionLabel;
                      const isOptionCorrect = option.is_correct;

                      return (
                        <div
                          key={optIdx}
                          className={cn(
                            "p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-colors",
                            isOptionCorrect
                              ? "bg-emerald-500/10 border-emerald-400 text-emerald-800 dark:text-emerald-400"
                              : isSelected
                              ? "bg-rose-500/10 border-rose-400 text-rose-800 dark:text-rose-400"
                              : "bg-gray-50/40 border-gray-100 dark:bg-gray-800/20 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                          )}
                        >
                          <div className="flex items-center gap-2 leading-relaxed">
                            <span className="font-bold uppercase font-mono">{optionLabel}.</span>
                            <span>{option.option}</span>
                          </div>
                          <div className="shrink-0 pl-2">
                            {isOptionCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                            {isSelected && !isOptionCorrect && <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Response Textual verification diagnostics comparison box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-medium">
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Candidate Submitted Response:</p>
                    <p className="text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                      {qResult.answer || qResult.selected_option || 'Not answered / Skipped'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/60 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">Correct System Reference Key:</p>
                    <p className="text-blue-900 dark:text-blue-400 font-mono leading-relaxed">
                      {qResult.correct_answer || 
                       (qResult.options?.find((opt: any) => opt.is_correct) 
                         ? `${qResult.options.find((opt: any) => opt.is_correct).option_label}. ${qResult.options.find((opt: any) => opt.is_correct).option}`
                         : 'N/A — Reference Key Missing')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
