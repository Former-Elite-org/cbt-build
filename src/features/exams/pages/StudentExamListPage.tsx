// import { useState, useCallback, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { useAuth } from '@/features/auth/hooks/useAuth';
// import { _get } from '@/Helper';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Skeleton } from '@/components/ui/skeleton';
// import { 
//   Clock, 
//   BookOpen, 
//   Play, 
//   CheckCircle, 
//   Hourglass,
//   LogOut,
//   FileText,
//   AlertCircle,
//   Bell,
//   X,
//   Zap
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import moment from 'moment';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// interface Exam {
//   id: string;
//   exam_id?: string;
//   assessment_type: string;
//   title?: string;
//   subject_name?: string;
//   subject_code?: string;
//   class_name?: string;
//   class_code?: string;
//   commence_date: string;
//   start_time?: string;
//   end_time?: string;
//   duration: number;
//   total_marks: number;
//   total_questions: number;
//   status: string;
//   student_exam_status?: string;
//   description?: string;
// }

// export default function StudentExamListPage() {
//   const navigate = useNavigate();
//   const { user } = useAuthStore();
//   const { logout } = useAuth();
//   const [allExams, setAllExams] = useState<Exam[]>([]); // Store all exams
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState<'Pending' | 'Ongoing' | 'Submitted'>('Pending');
//   const [currentTime, setCurrentTime] = useState(moment()); // Track current time for real-time updates
//   const [showExamStartModal, setShowExamStartModal] = useState(false);
//   const [newlyStartedExam, setNewlyStartedExam] = useState<Exam | null>(null);
//   const [previousOngoingCount, setPreviousOngoingCount] = useState(0);
//   const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

//   // Helper function to check if exam time is active (uses currentTime state for real-time updates)
//   const isExamTimeActive = useCallback((exam: Exam): boolean => {
//     if (!exam.commence_date || !exam.start_time || !exam.end_time) return false;
    
//     const today = currentTime.format('YYYY-MM-DD');
//     const examDate = moment(exam.commence_date).format('YYYY-MM-DD');
    
//     // If exam is not today, it's not active
//     if (examDate !== today) return false;
    
//     const now = currentTime; // Use currentTime state instead of moment()
//     const startTime = moment(`${today} ${exam.start_time}`, 'YYYY-MM-DD HH:mm:ss');
//     const endTime = moment(`${today} ${exam.end_time}`, 'YYYY-MM-DD HH:mm:ss');
    
//     // Handle case where end time is next day
//     if (endTime.isBefore(startTime)) {
//       endTime.add(1, 'day');
//     }
    
//     return now.isBetween(startTime, endTime, null, '[]'); // inclusive
//   }, [currentTime]);

//   // Categorize exams based on current time (computed/derived state)
//   const { pendingExams, ongoingExams, submittedExams } = useMemo(() => {
//     const pending: Exam[] = [];
//     const ongoing: Exam[] = [];
//     const submitted: Exam[] = [];
    
//     allExams.forEach((exam: Exam) => {
//       // Check if exam is submitted/completed (has a result record)
//       const isSubmitted = exam.student_exam_status === 'Completed' || exam.student_exam_status === 'Submitted';
      
//       if (isSubmitted) {
//         submitted.push(exam);
//       } 
//       // Check if exam is ongoing (time is active and not completed)
//       else if (isExamTimeActive(exam) && !isSubmitted) {
//         ongoing.push(exam);
//       }
//       // Otherwise it's pending (approved exams available to take)
//       else {
//         pending.push(exam);
//       }
//     });
    
//     return { pendingExams: pending, ongoingExams: ongoing, submittedExams: submitted };
//   }, [allExams, isExamTimeActive]);

//   // Helper function to check if exam is upcoming (uses currentTime state for real-time updates)
//   const isExamUpcoming = (exam: Exam): boolean => {
//     if (!exam.commence_date || !exam.start_time) return false;
    
//     const today = currentTime.format('YYYY-MM-DD');
//     const examDate = moment(exam.commence_date).format('YYYY-MM-DD');
    
//     // If exam date is in the future
//     if (examDate > today) return true;
    
//     // If exam is today but start time hasn't arrived
//     if (examDate === today && exam.start_time) {
//       const now = currentTime; // Use currentTime state instead of moment()
//       const startTime = moment(`${today} ${exam.start_time}`, 'YYYY-MM-DD HH:mm:ss');
//       return now.isBefore(startTime);
//     }
    
//     return false;
//   };

//   const fetchStudentExams = useCallback(() => {
//     // Get student info - check both user object and any additional properties
//     const admissionNo = (user as any)?.admission_no || user?.id;
//     const currentClass = (user as any)?.current_class || (user as any)?.class_code;
    
//     if (!admissionNo || !currentClass) {
//       console.log('Missing student info:', { admission_no: admissionNo, current_class: currentClass, user });
//       setLoading(false);
//       toast.error('Student information is missing. Please contact administrator.');
//       return;
//     }
    
//     setLoading(true);
//     // Use select with status=Approved or Released and class_code to get all approved/released exams for student's class
//     // Include admission_no so backend can determine student_exam_status
//     // Note: Backend will filter by status, so we need to make two calls or update backend to accept multiple statuses
//     _get(
//       `examinations?query_type=select&class_code=${currentClass}&admission_no=${admissionNo}`,
//       (resp: any) => {
//         setLoading(false);
//         console.log('Student exams response:', resp);
//         if (resp.success && Array.isArray(resp.data)) {
//           const exams = resp.data;
          
//           // Store all exams - categorization will be done by useMemo based on currentTime
//           setAllExams(exams);
//         } else {
//           console.log('No exams data or unsuccessful response:', resp);
//           setAllExams([]);
//         }
//       },
//       (err: any) => {
//         setLoading(false);
//         console.error('Error fetching student exams:', err);
//         toast.error('Failed to fetch exams');
//         setAllExams([]);
//       }
//     );
//   }, [user, isExamTimeActive]);

//   useEffect(() => {
//     fetchStudentExams();
//   }, [fetchStudentExams]);

//   // Update current time every 10 seconds to check if exams become active (more responsive)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTime(moment());
//     }, 10000); // Update every 10 seconds for better responsiveness

//     return () => clearInterval(interval);
//   }, []);

//   // Detect when exams become active and show notification
//   useEffect(() => {
//     const currentOngoingCount = ongoingExams.length;
    
//     // If we have new ongoing exams that weren't there before
//     if (currentOngoingCount > previousOngoingCount && previousOngoingCount > 0) {
//       // Find the newly started exam
//       const newExam = ongoingExams.find(exam => {
//         const examId = exam.exam_id || exam.id;
//         return examId && !dismissedAlerts.has(examId);
//       });
      
//       if (newExam) {
//         setNewlyStartedExam(newExam);
//         setShowExamStartModal(true);
        
//         // Request browser notification permission and show notification
//         if ('Notification' in window && Notification.permission === 'granted') {
//           new Notification('📝 Exam Started!', {
//             body: `${newExam.title || newExam.assessment_type} has started. Click to begin!`,
//             icon: '/favicon.ico',
//             tag: `exam-${newExam.exam_id || newExam.id}`,
//             requireInteraction: true,
//           });
//         } else if ('Notification' in window && Notification.permission !== 'denied') {
//           Notification.requestPermission().then(permission => {
//             if (permission === 'granted') {
//               new Notification('📝 Exam Started!', {
//                 body: `${newExam.title || newExam.assessment_type} has started. Click to begin!`,
//                 icon: '/favicon.ico',
//                 tag: `exam-${newExam.exam_id || newExam.id}`,
//                 requireInteraction: true,
//               });
//             }
//           });
//         }
        
//         // Auto-switch to Ongoing tab
//         setActiveTab('Ongoing');
        
//         // Show toast notification
//         toast.success(
//           `🎉 ${newExam.title || newExam.assessment_type} has started! Click "Start Exam" to begin.`,
//           {
//             duration: 10000,
//             icon: '📝',
//             style: {
//               fontSize: '16px',
//               padding: '16px',
//             }
//           }
//         );
//       }
//     }
    
//     // Update previous count
//     setPreviousOngoingCount(currentOngoingCount);
//   }, [ongoingExams, previousOngoingCount, dismissedAlerts]);

//   // Request notification permission on mount
//   useEffect(() => {
//     if ('Notification' in window && Notification.permission === 'default') {
//       // Don't request immediately, wait for user interaction or exam start
//     }
//   }, []);

//   const handleStartExam = (exam: Exam) => {
//     const examId = exam.exam_id || exam.id;
//     if (!examId) {
//       toast.error('Exam ID is missing');
//       return;
//     }
    
//     // Check if exam is already submitted
//     const isSubmitted = exam.student_exam_status === 'Completed' || exam.student_exam_status === 'Submitted';
//     if (isSubmitted) {
//       toast.error('You have already submitted this exam. You cannot take it again.');
//       return;
//     }
    
//     if (!isExamTimeActive(exam)) {
//       if (isExamUpcoming(exam)) {
//         toast.error('Exam has not started yet. Please wait for the scheduled time.');
//       } else {
//         toast.error('Exam time has expired.');
//       }
//       return;
//     }
    
//     navigate(`/exams/${examId}/take`);
//   };

//   const handleViewResult = (exam: Exam) => {
//     const examId = exam.exam_id || exam.id;
//     if (!examId) {
//       toast.error('Exam ID is missing');
//       return;
//     }
//     navigate(`/studentresult/${examId}`);
//   };

//   const handleLogout = async () => {
//     if (confirm('Are you sure you want to logout?')) {
//       await logout();
//     }
//   };

//   const getStatusBadge = (exam: Exam) => {
//     const isSubmitted = exam.student_exam_status === 'Completed' || exam.student_exam_status === 'Submitted';
    
//     if (isSubmitted) {
//       return <Badge variant="success" className="bg-green-500">Submitted</Badge>;
//     }
    
//     if (isExamTimeActive(exam)) {
//       return <Badge variant="default" className="bg-blue-500 animate-pulse">Active Now</Badge>;
//     }
    
//     if (isExamUpcoming(exam)) {
//       return <Badge variant="warning" className="bg-yellow-500">Upcoming</Badge>;
//     }
    
//     return <Badge variant="default">Pending</Badge>;
//   };

//   const formatTimeString = (timeStr: string | null | undefined): string => {
//     if (!timeStr) return 'N/A';
//     const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})/);
//     if (timeMatch) {
//       const [, hour, minute] = timeMatch;
//       const hourNum = parseInt(hour, 10);
//       const min = minute.padStart(2, '0');
//       return `${hourNum.toString().padStart(2, '0')}:${min}`;
//     }
//     return timeStr;
//   };

//   const renderExamCard = (exam: Exam, index: number) => {
//     const examId = exam.exam_id || exam.id;
//     if (!examId) return null;

//     const isActive = isExamTimeActive(exam);
//     const isUpcoming = isExamUpcoming(exam);
//     const isSubmitted = exam.student_exam_status === 'Completed' || exam.student_exam_status === 'Submitted';
//     const isReleased = exam.status === 'Released';

//     return (
//       <Card 
//         key={examId} 
//         className="hover:scale-[1.01] transition-all duration-300 border-l-4 border-[#002a56] dark:border-white/50"
//         style={{ animationDelay: `${index * 50}ms` }}
//       >
//         <CardHeader>
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <CardTitle className="text-lg mb-2">
//                 {exam.title || exam.assessment_type}
//               </CardTitle>
//               <div className="flex gap-2 flex-wrap items-center">
//                 {exam.subject_name && (
//                   <Badge variant="default">{exam.subject_name}</Badge>
//                 )}
//                 {exam.class_name && (
//                   <Badge variant="outline" className="border-[#002a56] dark:border-gray-500 text-[#002a56] dark:text-white">{exam.class_name}</Badge>
//                 )}
//                 {getStatusBadge(exam)}
//               </div>
//             </div>
//           </div>
//         </CardHeader>
//         <CardBody>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
//             <div>
//               <span className="text-gray-500 dark:text-gray-400">Date:</span>
//               <p className="font-medium text-gray-900 dark:text-gray-100">
//                 {exam.commence_date ? moment(exam.commence_date).format('MMM DD, YYYY') : 'N/A'}
//               </p>
//             </div>
//             <div>
//               <span className="text-gray-500 dark:text-gray-400">Time:</span>
//               <p className="font-medium text-gray-900 dark:text-gray-100">
//                 {exam.start_time && exam.end_time 
//                   ? `${formatTimeString(exam.start_time)} - ${formatTimeString(exam.end_time)}`
//                   : 'N/A'}
//               </p>
//             </div>
//             <div>
//               <span className="text-gray-500 dark:text-gray-400">Duration:</span>
//               <p className="font-medium text-gray-900 dark:text-gray-100">{exam.duration || 0} minutes</p>
//             </div>
//             <div>
//               <span className="text-gray-500 dark:text-gray-400">Questions:</span>
//               <p className="font-medium text-gray-900 dark:text-gray-100">{exam.total_questions || 0}</p>
//             </div>
//           </div>

//           {exam.description && (
//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//               {exam.description}
//             </p>
//           )}

//           <div className="flex gap-2 flex-wrap">
//             {isSubmitted ? (
//               // Only show View Results button if exam is released
//               isReleased ? (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handleViewResult(exam)}
//                   className="w-full border border-[#002a56] dark:border-white/50 sm:w-auto"
//                 >
//                   <CheckCircle className="w-4 h-4 mr-2 text-[#002a56] dark:text-white" />
//                  <div className="text-[#002a56] dark:text-white">
//                    View Results
//                  </div>
                
//                 </Button>
//               ) : (
//                 <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
//                   <CheckCircle className="w-4 h-4" />
//                   <span className="text-sm font-medium">Submitted - Results pending release</span>
//                 </div>
//               )
//             ) : isActive ? (
//               <Button
//                 size="sm"
//                 onClick={() => handleStartExam(exam)}
//                 className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 animate-pulse"
//               >
//                 <Play className="w-4 h-4 mr-2" />
//                 Start Exam
//               </Button>
//             ) : isUpcoming ? (
//               <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
//                 <Clock className="w-4 h-4" />
//                 <span className="text-sm font-medium">Starts at {formatTimeString(exam.start_time)}</span>
//               </div>
//             ) : (
//               <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
//                 <AlertCircle className="w-4 h-4" />
//                 <span className="text-sm font-medium">Exam time has passed</span>
//               </div>
//             )}
//           </div>
//         </CardBody>
//       </Card>
//     );
//   };

//   // Get student name and admission number
//   const studentName = (user as any)?.student_name || 
//                       (user as any)?.full_name || 
//                       ((user as any)?.first_name && (user as any)?.last_name 
//                         ? `${(user as any).first_name} ${(user as any).last_name}` 
//                         : (user as any)?.first_name || (user as any)?.name || 'Student');
//   const admissionNo = (user as any)?.admission_no || (user as any)?.user_id || 'N/A';

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
//       {/* Student Info Card */}
//       <Card className="dark:from-gray-800 dark:to-gray-800 border-gray-200 dark:border-gray-700">
//         <CardBody className="p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="h-12 w-12 rounded-full bg-gray-200 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-gray-300 font-bold text-lg">
//                 {studentName.charAt(0).toUpperCase()}
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
//                   {studentName}
//                 </h2>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Admission Number: <span className="font-medium text-primary-600 dark:text-primary-400">{admissionNo}</span>
//                 </p>
//               </div>
//             </div>
//             <Button
//               variant="outline"
//               onClick={handleLogout}
//               className="gap-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
//             >
//               <LogOut className="h-4 w-4" />
//               Logout
//             </Button>
//           </div>
//         </CardBody>
//       </Card>

//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-[#00356B] dark:text-gray-300">My Exams</h1>
//         <p className="text-gray-500 dark:text-gray-400 mt-1">
//           View and take your available exams
//         </p>
//       </div>

//       {/* Prominent Alert Banner when exams are active */}
//       {ongoingExams.length > 0 && activeTab !== 'Ongoing' && (
//         <Alert className="border-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 animate-pulse shadow-lg">
//           <Zap className="h-6 w-6 text-green-600 dark:text-green-400 animate-bounce" />
//           <AlertTitle className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
//             <Bell className="h-5 w-5" />
//             {ongoingExams.length === 1 
//               ? '📝 Exam Started - Click "Ongoing" Tab Above!'
//               : `📝 ${ongoingExams.length} Exams Started - Click "Ongoing" Tab Above!`}
//           </AlertTitle>
//           <AlertDescription className="text-base text-green-700 dark:text-green-300 mt-2">
//             {ongoingExams.length === 1 
//               ? `Your exam "${ongoingExams[0].title || ongoingExams[0].assessment_type}" has started! Click the "Ongoing" tab above to start taking it.`
//               : `You have ${ongoingExams.length} active exams! Click the "Ongoing" tab above to see and start them.`}
//           </AlertDescription>
//           <div className="mt-4 flex gap-2">
//             <Button
//               onClick={() => setActiveTab('Ongoing')}
//               className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2"
//             >
//               <Play className="w-4 h-4 mr-2" />
//               Go to Ongoing Exams
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 ongoingExams.forEach(exam => {
//                   const examId = exam.exam_id || exam.id;
//                   if (examId) {
//                     setDismissedAlerts(prev => new Set(prev).add(examId));
//                   }
//                 });
//               }}
//               className="border-green-600 text-green-700 hover:bg-green-100"
//             >
//               <X className="w-4 h-4 mr-2" />
//               Dismiss
//             </Button>
//           </div>
//         </Alert>
//       )}

//       {/* Exam Start Modal - Very Prominent */}
//       <Dialog open={showExamStartModal} onOpenChange={setShowExamStartModal}>
//         <DialogContent className="sm:max-w-md border-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
//           <DialogHeader>
//             <div className="flex items-center justify-center mb-4">
//               <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
//                 <Bell className="h-12 w-12 text-white animate-bounce" />
//               </div>
//             </div>
//             <DialogTitle className="text-2xl font-bold text-center text-green-800 dark:text-green-200">
//               🎉 EXAM HAS STARTED!
//             </DialogTitle>
//             <DialogDescription className="text-center text-lg text-green-700 dark:text-green-300 mt-2">
//               {newlyStartedExam && (
//                 <>
//                   <p className="font-bold text-xl mb-2">
//                     {newlyStartedExam.title || newlyStartedExam.assessment_type}
//                   </p>
//                   <p className="text-base">
//                     The exam time has started. Click the button below to begin taking your exam now!
//                   </p>
//                 </>
//               )}
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter className="flex-col gap-2 sm:flex-row">
//             {newlyStartedExam && (
//               <Button
//                 onClick={() => {
//                   const examId = newlyStartedExam.exam_id || newlyStartedExam.id;
//                   if (examId) {
//                     setDismissedAlerts(prev => new Set(prev).add(examId));
//                   }
//                   setShowExamStartModal(false);
//                   handleStartExam(newlyStartedExam);
//                 }}
//                 className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-6 animate-pulse"
//                 size="lg"
//               >
//                 <Play className="w-6 h-6 mr-2" />
//                 START EXAM NOW
//               </Button>
//             )}
//             <Button
//               variant="outline"
//               onClick={() => {
//                 if (newlyStartedExam) {
//                   const examId = newlyStartedExam.exam_id || newlyStartedExam.id;
//                   if (examId) {
//                     setDismissedAlerts(prev => new Set(prev).add(examId));
//                   }
//                 }
//                 setShowExamStartModal(false);
//                 setActiveTab('Ongoing');
//               }}
//               className="w-full sm:w-auto border-green-600 text-green-700 hover:bg-green-100"
//             >
//               View in Ongoing Tab
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Tabs */}
//       <Card>
//         <CardBody className="p-2">
//           <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="Pending" className="gap-2">
//                 <Hourglass className="h-4 w-4 text-[#002a56] dark:text-white" />
//                 <div className="text-sm text-[#002a56] dark:text-white">Pending ({pendingExams.length})</div>
//               </TabsTrigger>
//               <TabsTrigger 
//                 value="Ongoing" 
//                 className={`gap-2 relative ${
//                   ongoingExams.length > 0 && activeTab !== 'Ongoing' 
//                     ? 'bg-green-100 dark:bg-green-900/30 border-green-500 animate-pulse' 
//                     : ''
//                 }`}
//               >
//                 <Clock className="h-4 w-4 text-[#002a56] dark:text-white" />
//                 <div className="text-sm text-[#002a56] dark:text-white">Ongoing ({ongoingExams.length})</div>
//                 {ongoingExams.length > 0 && activeTab !== 'Ongoing' && (
//                   <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
//                     <span className="text-white text-xs font-bold">!</span>
//                   </span>
//                 )}
//               </TabsTrigger>
//               <TabsTrigger value="Submitted" className="gap-2 text-[#002a56] dark:text-white">
//                 <CheckCircle className="h-4 w-4 text-[#002a56] dark:text-white" />
//                 <div className="text-sm text-[#002a56] dark:text-white">Submitted ({submittedExams.length})</div>
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="Pending" className="space-y-4 mt-6 p-6">
//               {loading ? (
//                 <div className="space-y-4">
//                   {[1, 2, 3].map((i) => (
//                     <Skeleton key={i} className="h-48 w-full" />
//                   ))}
//                 </div>
//               ) : pendingExams.length > 0 ? (
//                 pendingExams.map((exam, index) => renderExamCard(exam, index))
//               ) : (
//                 <Card>
//                   <CardBody className="text-center py-12">
//                     <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//                     <p className="text-gray-500 dark:text-gray-400">No pending exams</p>
//                   </CardBody>
//                 </Card>
//               )}
//             </TabsContent>

//             <TabsContent value="Ongoing" className="space-y-4 mt-6 p-6">
//               {loading ? (
//                 <div className="space-y-4">
//                   {[1, 2, 3].map((i) => (
//                     <Skeleton key={i} className="h-48 w-full" />
//                   ))}
//                 </div>
//               ) : ongoingExams.length > 0 ? (
//                 ongoingExams.map((exam, index) => renderExamCard(exam, index))
//               ) : (
//                 <Card>
//                   <CardBody className="text-center py-12">
//                     <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//                     <p className="text-gray-500 dark:text-gray-400">No ongoing exams</p>
//                   </CardBody>
//                 </Card>
//               )}
//             </TabsContent>

//             <TabsContent value="Submitted" className="space-y-4 mt-6 p-6">
//               {loading ? (
//                 <div className="space-y-4">
//                   {[1, 2, 3].map((i) => (
//                     <Skeleton key={i} className="h-48 w-full" />
//                   ))}
//                 </div>
//               ) : submittedExams.length > 0 ? (
//                 submittedExams.map((exam, index) => renderExamCard(exam, index))
//               ) : (
//                 <Card>
//                   <CardBody className="text-center py-12">
//                     <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//                     <p className="text-gray-500 dark:text-gray-400">No submitted exams</p>
//                   </CardBody>
//                 </Card>
//               )}
//             </TabsContent>
//           </Tabs>
//         </CardBody>
//       </Card>

//       {/* Instructions Card - Only show in Ongoing tab */}
//       {activeTab === 'Ongoing' && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-gradient-primary flex  text-[#002a56] dark:text-white items-center gap-2">
//               <BookOpen className="h-5 w-5 text-[#002a56] dark:text-white" />
//               <div className="text-[#002a56] dark:text-white">
//                 Exam Instructions
//               </div>
//             </CardTitle>
//           </CardHeader>
//           <CardBody>
//             <ul className="space-y-3 text-gray-700 dark:text-gray-300">
//               <li className="flex items-start gap-3">
//                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
//                 <span>Click "Start Exam" only when you're ready to begin. The timer will start immediately.</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
//                 <span>You must complete the exam within the allocated time. The exam will auto-submit when time expires.</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
//                 <span>Make sure you have a stable internet connection before starting the exam.</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
//                 <span>Do not refresh or close the browser tab during the exam.</span>
//               </li>
//             </ul>
//           </CardBody>
//         </Card>
//       )}
//     </div>
//   );
// }


import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { _get } from '@/Helper';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Hourglass,
  LogOut,
  FileText,
  AlertCircle,
  Bell,
  X,
  Zap,
  GraduationCap,
  User,
  Calendar,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DarkModeToggle from "@/components/layout/DarkModeToggle";

interface Exam {
  id: string;
  exam_id?: string;
  assessment_type: string;
  title?: string;
  subject_name?: string;
  subject_code?: string;
  class_name?: string;
  class_code?: string;
  commence_date: string;
  start_time?: string;
  end_time?: string;
  duration: number;
  total_marks: number;
  total_questions: number;
  status: string;
  student_exam_status?: string;
  description?: string;
}

export default function StudentExamListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  
  // State variables
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Ongoing' | 'Submitted'>('Pending');
  const [currentTime, setCurrentTime] = useState(moment());
  const [showExamStartModal, setShowExamStartModal] = useState(false);
  const [newlyStartedExam, setNewlyStartedExam] = useState<Exam | null>(null);
  const [previousOngoingCount, setPreviousOngoingCount] = useState(0);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Helper function to check if exam time is active
  const isExamTimeActive = useCallback((exam: Exam): boolean => {
    if (!exam.commence_date || !exam.start_time || !exam.end_time) return false;
    
    const today = currentTime.format('YYYY-MM-DD');
    const examDate = moment(exam.commence_date).format('YYYY-MM-DD');
    
    if (examDate !== today) return false;
    
    const now = currentTime;
    const startTime = moment(`${today} ${exam.start_time}`, 'YYYY-MM-DD HH:mm:ss');
    const endTime = moment(`${today} ${exam.end_time}`, 'YYYY-MM-DD HH:mm:ss');
    
    if (endTime.isBefore(startTime)) {
      endTime.add(1, 'day');
    }
    
    return now.isBetween(startTime, endTime, null, '[]');
  }, [currentTime]);
  // Categorize exams based on current time (computed/derived state)
  const { pendingExams, ongoingExams, submittedExams } = useMemo(() => {
    const pending: Exam[] = [];
    const ongoing: Exam[] = [];
    const submitted: Exam[] = [];
    
    allExams.forEach((exam: Exam) => {
      const isSubmitted = exam.student_exam_status === 'Completed' || exam.student_exam_status === 'Submitted';
      
      if (isSubmitted) {
        submitted.push(exam);
      } 
      else if (isExamTimeActive(exam) && !isSubmitted) {
        ongoing.push(exam);
      }
      else {
        pending.push(exam);
      }
    });
    
    return { pendingExams: pending, ongoingExams: ongoing, submittedExams: submitted };
  }, [allExams, isExamTimeActive]);

  // Helper function to check if exam is upcoming
  const isExamUpcoming = (exam: Exam): boolean => {
    if (!exam.commence_date || !exam.start_time) return false;
    
    const today = currentTime.format('YYYY-MM-DD');
    const examDate = moment(exam.commence_date).format('YYYY-MM-DD');
    
    if (examDate > today) return true;
    
    if (examDate === today && exam.start_time) {
      const now = currentTime;
      const startTime = moment(`${today} ${exam.start_time}`, 'YYYY-MM-DD HH:mm:ss');
      return now.isBefore(startTime);
    }
    
    return false;
  };

  // Fetch student examinations from backend
  const fetchStudentExams = useCallback(() => {
    const admissionNo = (user as any)?.admission_no || user?.id;
    const currentClass = (user as any)?.current_class || (user as any)?.class_code;
    
    if (!admissionNo || !currentClass) {
      console.log('Missing student info:', { admission_no: admissionNo, current_class: currentClass, user });
      setLoading(false);
      toast.error('Student information is missing. Please contact administrator.');
      return;
    }
    
    setLoading(true);
    _get(
      `examinations?query_type=select&class_code=${currentClass}&admission_no=${admissionNo}`,
      (resp: any) => {
        setLoading(false);
        if (resp.success && Array.isArray(resp.data)) {
          setAllExams(resp.data);
        } else {
          setAllExams([]);
        }
      },
      (err: any) => {
        setLoading(false);
        console.error('Error fetching student exams:', err);
        toast.error('Failed to fetch exams');
        setAllExams([]);
      }
    );
  }, [user]);

  useEffect(() => {
    fetchStudentExams();
  }, [fetchStudentExams]);

  // Update current time every 10 seconds for real-time responsiveness
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Detect when exams become active and trigger real-time notifications
  useEffect(() => {
    const currentOngoingCount = ongoingExams.length;
    
    if (currentOngoingCount > previousOngoingCount && previousOngoingCount > 0) {
      const newExam = ongoingExams.find(exam => {
        const examId = exam.exam_id || exam.id;
        return examId && !dismissedAlerts.has(examId);
      });
      
      if (newExam) {
        setNewlyStartedExam(newExam);
        setShowExamStartModal(true);

        // Browser Native Notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('📝 Exam Started!', {
            body: `${newExam.title || newExam.assessment_type} has started. Click to begin!`,
            icon: '/favicon.ico',
            tag: `exam-${newExam.exam_id || newExam.id}`,
            requireInteraction: true,
          });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('📝 Exam Started!', {
                body: `${newExam.title || newExam.assessment_type} has started. Click to begin!`,
                icon: '/favicon.ico',
                tag: `exam-${newExam.exam_id || newExam.id}`,
                requireInteraction: true,
              });
            }
          });
        }
        
        setActiveTab('Ongoing');
        
        toast.success(
          `🎉 ${newExam.title || newExam.assessment_type} has started! Click "Start Exam" to begin.`,
          {
            duration: 10000,
            icon: '📝',
            style: {
              fontSize: '16px',
              padding: '16px',
            }
          }
        );
      }
    }
    
    setPreviousOngoingCount(currentOngoingCount);
  }, [ongoingExams, previousOngoingCount, dismissedAlerts]);

  // Request notification permission on mount safely
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Logic placeholder for permission on user gesture if needed
    }
  }, []);
  const handleStartExam = (exam: Exam) => {
    const examId = exam.exam_id || exam.id;
    if (!examId) {
      toast.error('Exam ID is missing');
      return;
    }
    
    const isSubmitted = exam.student_exam_status === 'Completed' || exam.student_exam_status === 'Submitted';
    if (isSubmitted) {
      toast.error('You have already submitted this exam. You cannot take it again.');
      return;
    }
    
    if (!isExamTimeActive(exam)) {
      if (isExamUpcoming(exam)) {
        toast.error('Exam has not started yet. Please wait for the scheduled time.');
      } else {
        toast.error('Exam time has expired.');
      }
      return;
    }
    
    navigate(`/exams/${examId}/take`);
  };

  const handleViewResult = (exam: Exam) => {
    const examId = exam.exam_id || exam.id;
    if (!examId) {
      toast.error('Exam ID is missing');
      return;
    }
    navigate(`/studentresult/${examId}`);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const formatTimeString = (timeStr: string | null | undefined): string => {
    if (!timeStr) return 'N/A';
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const [, hour, minute] = timeMatch;
      const hourNum = parseInt(hour, 10);
      const min = minute.padStart(2, '0');
      return `${hourNum.toString().padStart(2, '0')}:${min}`;
    }
    return timeStr;
  };

  // Modernized & animated status badges
  const getStatusBadge = (exam: Exam) => {
    const isSubmitted = exam.student_exam_status === 'Completed' || exam.student_exam_status === 'Submitted';
    
    if (isSubmitted) {
      return (
        <Badge className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Submitted
        </Badge>
      );
    }
    
    if (isExamTimeActive(exam)) {
      return (
        <Badge className="bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full font-semibold animate-pulse flex items-center gap-1.5 dashboard-pulse">
          <span className="h-2 w-2 rounded-full bg-rose-500 relative flex">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          </span>
          Active Now
        </Badge>
      );
    }

    if (isExamUpcoming(exam)) {
      return (
        <Badge className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Upcoming
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
        Pending
      </Badge>
    );
  };
  const renderExamCard = (exam: Exam, index: number) => {
    const examId = exam.exam_id || exam.id;
    if (!examId) return null;

    const isActive = isExamTimeActive(exam);
    const isUpcoming = isExamUpcoming(exam);
    const isSubmitted = exam.student_exam_status === 'Completed' || exam.student_exam_status === 'Submitted';
    const isReleased = exam.status === 'Released';

    return (
      <Card 
        key={examId} 
        className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300 rounded-xl"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Top Accent Line Indicator */}
        <div className={`absolute top-0 left-0 right-0 h-[4px] transition-colors duration-300 ${
          isSubmitted ? 'bg-emerald-500' : isActive ? 'bg-rose-500' : 'bg-[#00356b]'
        }`} />

        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-2.5">
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-[#00356b] dark:group-hover:text-blue-400 transition-colors duration-200">
                {exam.title || exam.assessment_type}
              </CardTitle>
              
              <div className="flex flex-wrap gap-2 items-center">
                {exam.subject_name && (
                  <Badge className="bg-blue-50 dark:bg-blue-950/40 text-[#00356B] dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-2.5 py-0.5 rounded-md font-medium text-xs">
                    {exam.subject_name}
                  </Badge>
                )}
                {exam.class_name && (
                  <Badge className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-md font-medium text-xs">
                    {exam.class_name}
                  </Badge>
                )}
                {getStatusBadge(exam)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-5 pt-2">
          {/* Info Dashboard Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900/50 mb-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-[#00356b] dark:text-blue-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Date</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {exam.commence_date ? moment(exam.commence_date).format('MMM DD, YYYY') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Time Window</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {exam.start_time && exam.end_time 
                    ? `${formatTimeString(exam.start_time)} - ${formatTimeString(exam.end_time)}`
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Hourglass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Duration</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{exam.duration || 0} mins</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Questions</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{exam.total_questions || 0} Qs</p>
              </div>
            </div>
          </div>

          {exam.description && (
            <div className="flex gap-2 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 text-sm mb-5 border border-slate-200/20">
              <Info className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
              <p className="leading-relaxed">{exam.description}</p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800/60">
            {isSubmitted ? (
              isReleased ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewResult(exam)}
                  className="w-full sm:w-auto border-blue-200 dark:border-slate-700 text-[#00356b] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-semibold px-4 rounded-xl group/btn transition-all flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Results
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-200" />
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50 py-2 px-4 rounded-xl w-full sm:w-auto">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium tracking-wide">Submitted • Awaiting Result Release</span>
                </div>
              )
            ) : isActive ? (
              <Button
                size="sm"
                onClick={() => handleStartExam(exam)}
                className="w-full sm:w-auto bg-gradient-to-r from-red-950 to-red-900 hover:from-rose-800 hover:to-orange-900 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 border-0 flex items-center justify-center gap-2 tracking-wide group/run transition-all duration-300"
              >
                <Play className="w-4 h-4 fill-current animate-pulse" />
                Start Exam Now
                <ArrowRight className="w-4 h-4 group-hover/run:translate-x-1 transition-transform" />
              </Button>
            ) : isUpcoming ? (
              <div className="flex items-center justify-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 py-2 px-4 rounded-xl w-full sm:w-auto font-medium text-xs">
                <Clock className="w-4 h-4 animate-spin-slow" />
                <span>Starts at {formatTimeString(exam.start_time)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-2 px-4 rounded-xl w-full sm:w-auto font-medium text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Examination Window Closed</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  };
  // Get student name and admission number
  const studentName = (user as any)?.student_name || 
                      (user as any)?.full_name || 
                      ((user as any)?.first_name && (user as any)?.last_name 
                        ? `${(user as any).first_name} ${(user as any).last_name}` 
                        : (user as any)?.first_name || (user as any)?.name || 'Student');
  const admissionNo = (user as any)?.admission_no || (user as any)?.user_id || 'N/A';

  return (
    <div className="space-y-8 p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      
      {/* Premium Student Profile Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/80 shadow-sm rounded-2xl overflow-hidden">
        <CardBody className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#00356b] to-red-900 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {studentName}
                  </h2>
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 font-medium text-xs rounded-full">
                    Student
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <GraduationCap className="h-4 w-4 text-[#00356b]" />
                  <span>Admission No:</span>
                  <span className="font-semibold text-[#00356b] dark:text-blue-400">{admissionNo}</span>
                </div>
              </div>
            </div>

<div className="flex items-stretch gap-3 w-full md:w-auto justify-end">
  <div className="flex items-center justify-center h-10 px-3 rounded-xl ">
    <DarkModeToggle />
  </div>

  <Button
    variant="outline"
    onClick={handleLogout}
    className="h-10 gap-2 rounded-xl"
  >
    <LogOut className="h-4 w-4" />
    Logout
  </Button>
</div>

          
          </div>
        </CardBody>
      </Card>

      {/* Main Header Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text">
          My Examinations
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
          Monitor your academic evaluation schedule and initiate examinations.
        </p>
      </div>

      {/* Prominent Alert Banner when exams are active but student is on another tab */}
   {ongoingExams.length > 0 && activeTab !== 'Ongoing' && (
  <Alert className="border border-indigo-500/20 dark:border-indigo-500/30 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 shadow-xl shadow-indigo-500/5 rounded-2xl p-5 relative overflow-hidden transition-all duration-300">
    {/* Subtle soft blur background indicator */}
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
    
    <div className="flex items-start gap-4 relative z-10">
      <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl hidden sm:block">
        <Zap className="h-5 w-5 animate-pulse" />
      </div>
      
      <div className="space-y-3 flex-1">
        <AlertTitle className="text-base md:text-lg font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
          <Bell className="h-4 w-4 text-indigo-500 fill-indigo-500/20" />
          {ongoingExams.length === 1 
            ? 'Active Examination Portal Available'
            : `${ongoingExams.length} Active Examination Sessions Available`}
        </AlertTitle>
        <AlertDescription className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-3xl">
          {ongoingExams.length === 1 
            ? `Your scheduled session "${ongoingExams[0].title || ongoingExams[0].assessment_type}" is currently live. Please navigate to the ongoing panel to initialize your evaluation.`
            : `You have ${ongoingExams.length} active exam sessions ready. Select the ongoing section below to review them.`}
        </AlertDescription>
        
        <div className="pt-1 flex flex-wrap gap-2.5">
          <Button
            onClick={() => setActiveTab('Ongoing')}
            className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-600/10 transition-all active:scale-95 flex items-center gap-1.5 border-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Open Ongoing Tab
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              ongoingExams.forEach(exam => {
                const examId = exam.exam_id || exam.id;
                if (examId) {
                  setDismissedAlerts(prev => new Set(prev).add(examId));
                }
              });
            }}
            className="border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs px-3.5 rounded-xl transition-colors"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Dismiss Note
          </Button>
        </div>
      </div>
    </div>
  </Alert>
)}

      {/* Premium Exam Start Modal - Urgent Action Required */}
      <Dialog open={showExamStartModal} onOpenChange={setShowExamStartModal}>
        <DialogContent className="sm:max-w-md border-0 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden p-0">
          {/* Top Decorative Alert Bar */}
          <div className="bg-gradient-to-r from-rose-600 to-orange-500 h-2 w-full" />
          
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center dashboard-pulse relative">
                  <span className="animate-ping absolute inline-flex h-12 w-12 rounded-xl bg-rose-400/20 opacity-75"></span>
                  <Bell className="h-8 w-8 animate-bounce" />
                </div>
              </div>
              <DialogTitle className="text-2xl font-black text-center text-slate-800 dark:text-slate-100 tracking-tight">
                EXAMINATION STARTED
              </DialogTitle>
              <DialogDescription className="text-center text-slate-500 dark:text-slate-400 mt-2">
                {newlyStartedExam && (
                  <div className="space-y-3">
                    <p className="font-extrabold text-lg text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                      {newlyStartedExam.title || newlyStartedExam.assessment_type}
                    </p>
                    <p className="text-sm leading-relaxed">
                      The official examination session is now active. Please launch the session immediately. Timer is currently running.
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {newlyStartedExam && (
                <Button
                  onClick={() => {
                    const examId = newlyStartedExam.exam_id || newlyStartedExam.id;
                    if (examId) {
                      setDismissedAlerts(prev => new Set(prev).add(examId));
                    }
                    setShowExamStartModal(false);
                    handleStartExam(newlyStartedExam);
                  }}
                  className="w-full sm:flex-1 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-base py-5 rounded-xl shadow-lg shadow-rose-500/20 transition-all transform active:scale-98 flex items-center justify-center gap-2 border-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  START EXAMINATION NOW
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  if (newlyStartedExam) {
                    const examId = newlyStartedExam.exam_id || newlyStartedExam.id;
                    if (examId) {
                      setDismissedAlerts(prev => new Set(prev).add(examId));
                    }
                  }
                  setShowExamStartModal(false);
                  setActiveTab('Ongoing');
                }}
                className="w-full sm:w-auto border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium px-4 rounded-xl"
              >
                View in Dashboard
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modern Dashboard Navigation Tabs */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/80 shadow-sm rounded-2xl overflow-hidden">
        <CardBody className="p-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl h-auto">
              <TabsTrigger 
                value="Pending" 
                className="gap-2 rounded-lg py-2.5 transition-all text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#00356b] dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm font-semibold text-sm"
              >
                <Hourglass className="h-4 w-4" />
                <span>Pending ({pendingExams.length})</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="Ongoing" 
                className={`gap-2 rounded-lg py-2.5 transition-all relative font-semibold text-sm ${
                  ongoingExams.length > 0 && activeTab !== 'Ongoing' 
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                    : 'text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-sm'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Ongoing ({ongoingExams.length})</span>
                {ongoingExams.length > 0 && activeTab !== 'Ongoing' && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    <span className="text-white text-[10px] font-black">!</span>
                  </span>
                )}
              </TabsTrigger>
              
              <TabsTrigger 
                value="Submitted" 
                className="gap-2 rounded-lg py-2.5 transition-all text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm font-semibold text-sm"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Submitted ({submittedExams.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Pending Exams Section */}
            <TabsContent value="Pending" className="space-y-5 mt-6 outline-none p-1">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-44 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              ) : pendingExams.length > 0 ? (
                pendingExams.map((exam, index) => renderExamCard(exam, index))
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/30">
                  <FileText className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">All Clear!</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">No pending or upcoming examinations assigned.</p>
                </div>
              )}
            </TabsContent>

            {/* Ongoing Exams Section */}
            <TabsContent value="Ongoing" className="space-y-5 mt-6 outline-none p-1">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-44 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              ) : ongoingExams.length > 0 ? (
                ongoingExams.map((exam, index) => renderExamCard(exam, index))
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/30">
                  <Clock className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-700 mb-4 animate-spin-slow" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Active Sessions</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">There are no live examinations running at this moment.</p>
                </div>
              )}
            </TabsContent>

            {/* Submitted Exams Section */}
            <TabsContent value="Submitted" className="space-y-5 mt-6 outline-none p-1">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-44 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              ) : submittedExams.length > 0 ? (
                submittedExams.map((exam, index) => renderExamCard(exam, index))
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/30">
                  <CheckCircle className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Submission History</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">You haven't finalized or submitted any exams during this session.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>

      {/* Rules & Examination Instructions Policy Card */}
      {activeTab === 'Ongoing' && (
        <Card className="bg-slate-900 text-slate-100 dark:bg-slate-900 border-0 shadow-lg rounded-2xl overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-white/[0.02] pointer-events-none rounded-r-2xl" />
          
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-200">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <span>Official Examination Code of Conduct</span>
            </CardTitle>
          </CardHeader>
          <CardBody className="p-6 pt-2">
            <ul className="space-y-4 text-sm text-slate-300/90 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                <span>Do not engage the <strong>"Start Exam"</strong> prompt until you are fully prepared to answer. Once engaged, the structural countdown protocol initiates instantly.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                <span>All operations must be concluded within the predefined duration. The evaluation system enforces an <strong>auto-submit routine</strong> upon countdown expiration.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                <span>Ensure your network connection infrastructure remains fully functional and robust prior to establishing connection to the active paper portal.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">4</span>
                <span>Strictly avoid executing browser window operations such as <strong>Reload (F5)</strong>, closing tabs, or navigating away. Deviation may lock your attempt credentials.</span>
              </li>
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

