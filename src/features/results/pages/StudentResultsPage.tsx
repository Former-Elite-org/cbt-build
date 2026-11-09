// import { useAuthStore } from '@/features/auth/store/authStore';
// import { useStudentResults } from '../hooks/useResults';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Eye, TrendingUp, ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { formatDate } from '@/lib/utils/date';
// import { ExamResult } from '../types/result.types';

// export default function StudentResultsPage() {
//   const { user } = useAuthStore();
//   const navigate = useNavigate();
  
//   // Get admission number from user
//   const admissionNo = (user as any)?.admission_no || (user as any)?.id || (user as any)?.user_id;
//   const { data, isLoading } = useStudentResults(admissionNo);

//   const results = data?.data || [];

//   const getScoreColor = (percentage: number) => {
//     if (percentage >= 80) return 'text-green-600 dark:text-green-400';
//     if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
//     if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
//     return 'text-red-600 dark:text-red-400';
//   };

//   const calculateAverage = () => {
//     if (results.length === 0) return 0;
//     const sum = results.reduce((acc, r) => acc + r.percentage, 0);
//     return sum / results.length;
//   };

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
//       <div>
//         <Button
//           variant="ghost"
//           onClick={() => navigate('/exams')}
//           className="mb-4"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Exams
//         </Button>
//         <h1 className="text-3xl font-bold text-gray-900  dark:text-white">My Results</h1>
//         <p className="text-gray-500 dark:text-gray-400 mt-1">View all your exam results</p>
//       </div>

//       {/* Statistics */}
//       {results.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Card>
//             <CardBody>
//               <p className="text-sm text-gray-500">Total Exams</p>
//               <p className="text-2xl text-yellow-200 font-bold">{results.length}</p>
//             </CardBody>
//           </Card>
//           <Card>
//             <CardBody>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
//               <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                 {calculateAverage().toFixed(1)}%
//               </p>
//             </CardBody>
//           </Card>
//           <Card>
//             <CardBody>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Passed</p>
//               <p className="text-2xl font-bold text-green-600 dark:text-green-400">
//                 {results.filter((r) => r.status === 'Pass').length}
//               </p>
//             </CardBody>
//           </Card>
//           <Card>
//             <CardBody>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
//               <p className="text-2xl font-bold text-red-600 dark:text-red-400">
//                 {results.filter((r) => r.status === 'Fail').length}
//               </p>
//             </CardBody>
//           </Card>
//         </div>
//       )}

//       {/* Results List */}
//       {isLoading ? (
//         <div className="space-y-4">
//           {[1, 2, 3].map((i) => (
//             <Skeleton key={i} className="h-32 w-full" />
//           ))}
//         </div>
//       ) : results.length > 0 ? (
//         <div className="space-y-4">
//           {results.map((result: ExamResult) => (
//             <Card key={result.result_id || result.id} className="hover:shadow-md transition-shadow">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <CardTitle className="text-lg">{result.exam?.title || 'Exam'}</CardTitle>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {formatDate(result.submitted_at)}
//                     </p>
//                   </div>
//                   <Badge
//                     variant={result.status === 'Pass' ? 'success' : 'destructive'}
//                   >
//                     {result.status}
//                   </Badge>
//                 </div>
//               </CardHeader>
//               <CardBody>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Score</p>
//                     <p className="text-lg text-[#002a56] dark:text-white font-semibold">
//                       {result.obtained_marks} / {result.total_marks}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Percentage</p>
//                     <p className={`text-lg text-[#002a56] dark:text-white font-bold ${getScoreColor(result.percentage)}`}>
//                       {result.percentage.toFixed(1)}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Grade</p>
//                     <p className="text-lg text-[#002a56] dark:text-white font-semibold">{result.grade || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Time Taken</p>
//                     <p className="text-sm text-[#002a56] dark:text-white font-medium">{result.time_taken} minutes</p>
//                   </div>
//                 </div>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => navigate(`/examresults/${result.exam_id}?admission_no=${admissionNo}`)}
//                   className="w-full border border-[#002a56] dark:border-gray-700 sm:w-auto"
//                 >
//                   <Eye className="w-4 h-4 mr-2 text-[#002a56] dark:text-white" />
//                   <div className="text-[#002a56] dark:text-white">
//                     View Details
//                   </div>
//                 </Button>
//               </CardBody>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <Card>
//           <CardBody className="text-center py-12">
//             <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No results yet</p>
//             <p className="text-sm text-gray-400 mt-1">
//               Your exam results will appear here after you take exams
//             </p>
//           </CardBody>
//         </Card>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useStudentResults } from '../hooks/useResults';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils/date';
import { ExamResult } from '../types/result.types';

export default function StudentResultsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const admissionNo = (user as any)?.admission_no || (user as any)?.id || (user as any)?.user_id;
  const { data, isLoading } = useStudentResults(admissionNo);

  const results = data?.data || [];

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const calculateAverage = () => {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + r.percentage, 0);
    return sum / results.length;
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div data-tour="student-results-list">
        <Button
          variant="ghost"
          onClick={() => navigate('/exams')}
          className="mb-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Exams
        </Button>
        <h1 className="text-3xl font-bold text-[#00356B] dark:text-white">My Results</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View all your exam results</p>
      </div>

      {/* Statistics Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm">
            <CardBody className="p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Exams</p>
              <p className="text-2xl font-black text-[#00356B] dark:text-blue-400 mt-1">{results.length}</p>
            </CardBody>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm">
            <CardBody className="p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Score</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {calculateAverage().toFixed(1)}%
              </p>
            </CardBody>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm">
            <CardBody className="p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Passed</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {results.filter((r) => r.status === 'Pass').length}
              </p>
            </CardBody>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm">
            <CardBody className="p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Failed</p>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {results.filter((r) => r.status === 'Fail').length}
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Results List or Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result: ExamResult) => (
            <Card key={result.result_id || result.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-50 dark:border-gray-700/50 p-4 bg-gray-50/30 dark:bg-gray-900/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold text-gray-800 dark:text-white truncate">
                      {result.exam?.title || 'Untitled Exam'}
                    </CardTitle>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatDate(result.submitted_at)}
                    </p>
                  </div>
                  <Badge
                    className={`font-semibold rounded-full px-2.5 py-0.5 text-xs text-white ${
                      result.status === 'Pass' 
                        ? 'bg-emerald-500 hover:bg-emerald-600' 
                        : 'bg-rose-500 hover:bg-rose-600'
                    }`}
                  >
                    {result.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody className="p-5 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {/* Score */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Score</p>
                    <p className="text-base font-bold text-gray-800 dark:text-white mt-0.5">
                      {result.obtained_marks} <span className="text-xs font-normal text-gray-400">/ {result.total_marks}</span>
                    </p>
                  </div>

                  {/* Percentage */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Percentage</p>
                    <p className={`text-base font-black mt-0.5 ${getScoreColor(result.percentage)}`}>
                      {result.percentage.toFixed(1)}%
                    </p>
                  </div>

                  {/* Grade */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Grade</p>
                    <p className="text-base font-bold text-gray-800 dark:text-white mt-0.5">
                      {result.grade || 'N/A'}
                    </p>
                  </div>

                  {/* Time Taken */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Time Taken</p>
                    <p className="text-base font-semibold text-gray-800 dark:text-white mt-0.5">
                      {result.time_taken} <span className="text-xs font-normal text-gray-400">mins</span>
                    </p>
                  </div>
                </div>

                {/* View Button Link */}
                <div className="pt-2 border-t border-gray-50 dark:border-gray-700/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/examresults/${result.exam_id}?admission_no=${admissionNo}`)}
                    className="w-full sm:w-auto border-gray-200 dark:border-gray-700 text-[#00356B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-xs h-9 px-4 font-semibold"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty Results Block */
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-xl">
          <CardBody className="text-center py-16 p-6">
            <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 dark:text-white text-lg">No results yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
              Your exam results will appear here after you complete your assigned tests.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

