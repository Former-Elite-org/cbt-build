// import { useState, useCallback, useEffect } from 'react';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { useExams, useUpdateExamStatus, useUpdateExam } from '../hooks/useExams';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Eye, Check, X, Send, Hourglass, CheckCircle, Send as SendIcon, Calendar, Clock, Edit } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { Exam, ExamStatus } from '../types/exam.types';
// import { formatDate } from '@/lib/utils/date';
// import toast from 'react-hot-toast';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';

// // Helper function to format time strings (HH:mm:ss or HH:mm)
// const formatTimeString = (timeStr: string | null | undefined): string => {
//   if (!timeStr) return 'N/A';
  
//   // If it's already a simple time string like "14:30" or "14:30:00", extract just HH:mm
//   const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})/);
//   if (timeMatch) {
//     const [, hour, minute] = timeMatch;
//     const hourNum = parseInt(hour, 10);
//     const min = minute.padStart(2, '0');
//     return `${hourNum.toString().padStart(2, '0')}:${min}`;
//   }
  
//   return timeStr;
// };

// export default function ExamsManagerPage() {
//   const { selected_branch, user } = useAuthStore();
//   const [activeTab, setActiveTab] = useState<ExamStatus>('Pending');
//   const navigate = useNavigate();
  
//   // Get school_id and branch_id for updates
//   const school_id = user?.school_id;
//   const branch_id = selected_branch?.branch_id;

//   const isAdmin = user?.user_type === 'Admin' || user?.user_type === 'BranchAdmin';

//   const { data: pendingData, isLoading: pendingLoading } = useExams({
//     status: 'Pending',
//     branch_id: isAdmin ? undefined : selected_branch?.branch_id || undefined,
//   });

//   const { data: approvedData, isLoading: approvedLoading } = useExams({
//     status: 'Approved',
//     branch_id: isAdmin ? undefined : selected_branch?.branch_id || undefined,
//   });

//   const { data: rejectedData, isLoading: rejectedLoading } = useExams({
//     status: 'Rejected',
//     branch_id: isAdmin ? undefined : selected_branch?.branch_id || undefined,
//   });

//   const { data: releasedData, isLoading: releasedLoading } = useExams({
//     status: 'Released',
//     branch_id: isAdmin ? undefined : selected_branch?.branch_id || undefined,
//   });

//   const updateStatus = useUpdateExamStatus();
//   const updateExam = useUpdateExam();
  
//   const [editingExam, setEditingExam] = useState<Exam | null>(null);
//   const [editFormData, setEditFormData] = useState({
//     commence_date: '',
//     start_time: '',
//     end_time: '',
//     duration: 0,
//   });

//   // Get counts for each tab
//   const pendingCount = pendingData?.data?.length || 0;
//   const approvedCount = approvedData?.data?.length || 0;
//   const rejectedCount = rejectedData?.data?.length || 0;
//   const releasedCount = releasedData?.data?.length || 0;

//   const handleApprove = async (exam: Exam) => {
//     if (confirm('Are you sure you want to approve this exam?')) {
//       const examId = exam.exam_id || exam.id;
//       if (!examId) {
//         toast.error('Exam ID is missing');
//         return;
//       }
//       await updateStatus.mutateAsync({
//         id: examId,
//         status: 'Approved',
//       });
//     }
//   };

//   const handleReject = async (exam: Exam) => {
//     const reason = prompt('Enter rejection reason:');
//     if (reason) {
//       const examId = exam.exam_id || exam.id;
//       if (!examId) {
//         toast.error('Exam ID is missing');
//         return;
//       }
//       await updateStatus.mutateAsync({
//         id: examId,
//         status: 'Rejected',
//         rejection_reason: reason,
//       });
//     }
//   };

//   const handleRelease = async (exam: Exam) => {
//     if (confirm('Are you sure you want to release this exam?')) {
//       const examId = exam.exam_id || exam.id;
//       if (!examId) {
//         toast.error('Exam ID is missing');
//         return;
//       }
//       await updateStatus.mutateAsync({
//         id: examId,
//         status: 'Released',
//       });
//     }
//   };

//   const getStatusBadge = (status: ExamStatus) => {
//     const variants = {
//       Pending: 'warning',
//       Approved: 'success',
//       Rejected: 'destructive',
//       Released: 'default',
//     } as const;

//     return <Badge variant={variants[status]}>{status}</Badge>;
//   };

//   const handleEditSchedule = (exam: Exam) => {
//     setEditingExam(exam);
//     setEditFormData({
//       commence_date: exam.commence_date || '',
//       start_time: exam.start_time || '',
//       end_time: exam.end_time || '',
//       duration: exam.duration || 0,
//     });
//   };

//   const handleSaveSchedule = async () => {
//     if (!editingExam) return;

//     const examId = editingExam.exam_id || editingExam.id;
//     if (!examId) {
//       toast.error('Exam ID is missing');
//       return;
//     }

//     // Get branch_id from exam data or selected branch (for admins, use exam's branch_id)
//     const examBranchId = (editingExam as any).branch_id || branch_id;

//     if (!school_id || !examBranchId) {
//       toast.error('School ID and branch ID are required. Please ensure you have the correct permissions.');
//       return;
//     }

//     try {
//       await updateExam.mutateAsync({
//         id: examId,
//         data: {
//           commence_date: editFormData.commence_date,
//           start_time: editFormData.start_time,
//           end_time: editFormData.end_time,
//           duration: editFormData.duration,
//           school_id: school_id,
//           branch_id: examBranchId,
//           status: editingExam.status, // Preserve the current status
//         },
//       });
//       setEditingExam(null);
//       toast.success('Exam schedule updated successfully!');
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to update exam schedule');
//     }
//   };

//   const calculateEndTime = (startTime: string, duration: number) => {
//     if (!startTime || !duration) return '';
    
//     const [hours, minutes] = startTime.split(':').map(Number);
//     const startDate = new Date();
//     startDate.setHours(hours, minutes, 0, 0);
//     startDate.setMinutes(startDate.getMinutes() + duration);
    
//     const endHours = startDate.getHours().toString().padStart(2, '0');
//     const endMinutes = startDate.getMinutes().toString().padStart(2, '0');
//     return `${endHours}:${endMinutes}`;
//   };

//   const calculateDuration = (startTime: string, endTime: string) => {
//     if (!startTime || !endTime) return 0;
    
//     const [startHours, startMinutes] = startTime.split(':').map(Number);
//     const [endHours, endMinutes] = endTime.split(':').map(Number);
    
//     const startDate = new Date();
//     startDate.setHours(startHours, startMinutes, 0, 0);
    
//     const endDate = new Date();
//     endDate.setHours(endHours, endMinutes, 0, 0);
    
//     // Handle case where end time is next day
//     if (endDate < startDate) {
//       endDate.setDate(endDate.getDate() + 1);
//     }
    
//     const diffMs = endDate.getTime() - startDate.getTime();
//     const diffMinutes = Math.round(diffMs / (1000 * 60));
    
//     return diffMinutes > 0 ? diffMinutes : 0;
//   };

//   const handleDurationChange = (duration: number) => {
//     setEditFormData(prev => {
//       const newData = { ...prev, duration };
//       if (newData.start_time) {
//         newData.end_time = calculateEndTime(newData.start_time, duration);
//       }
//       return newData;
//     });
//   };

//   const handleStartTimeChange = (startTime: string) => {
//     setEditFormData(prev => {
//       const newData = { ...prev, start_time: startTime };
//       if (newData.duration) {
//         newData.end_time = calculateEndTime(startTime, newData.duration);
//       }
//       return newData;
//     });
//   };

//   const handleEndTimeChange = (endTime: string) => {
//     setEditFormData(prev => {
//       const newData = { ...prev, end_time: endTime };
//       if (newData.start_time && endTime) {
//         newData.duration = calculateDuration(newData.start_time, endTime);
//       }
//       return newData;
//     });
//   };

//   const renderExamCard = (exam: Exam) => {
//     const examId = exam.exam_id || exam.id;
//     if (!examId) {
//       console.error('Exam missing ID:', exam);
//       return null;
//     }

//     return (
//       <Card key={examId} className="mb-4">
//         <CardHeader>
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <CardTitle className="text-lg">{exam.title || exam.assessment_type}</CardTitle>
//               <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
//             </div>
//             {getStatusBadge(exam.status)}
//           </div>
//         </CardHeader>
//         <CardBody>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
//             <div>
//               <span className="text-gray-500">Date:</span>
//               <p className="font-medium">{exam.commence_date ? formatDate(exam.commence_date) : 'N/A'}</p>
//             </div>
//             <div>
//               <span className="text-gray-500">Time:</span>
//               <p className="font-medium">
//                 {exam.start_time && exam.end_time 
//                   ? `${formatTimeString(exam.start_time)} - ${formatTimeString(exam.end_time)}`
//                   : 'N/A'}
//               </p>
//             </div>
//             <div>
//               <span className="text-gray-500">Duration:</span>
//               <p className="font-medium">{exam.duration || 0} minutes</p>
//             </div>
//             <div>
//               <span className="text-gray-500">Total Marks:</span>
//               <p className="font-medium">{exam.total_marks || 0}</p>
//             </div>
//           </div>

//           <div className="flex gap-2 flex-wrap">
//             <Button
//               variant="outline"
//               className='border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
//               size="sm"
//               onClick={() => navigate(`/exams/${examId}/questions`)}
//             >
//               <Eye className="w-4 h-4 mr-2" />
//               View Questions
//             </Button>

//             <Button
//               variant="outline"
//               size="sm"
//               className="text-purple-600 border-purple-600"
//               onClick={() => handleEditSchedule(exam)}
//               disabled={updateExam.isPending}
//             >
//               <Edit className="w-4 h-4 mr-2" />
//               Edit Schedule
//             </Button>

//             {exam.status === 'Pending' && (
//               <>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-green-600 border-green-600"
//                   onClick={() => handleApprove(exam)}
//                   disabled={updateStatus.isPending}
//                 >
//                   <Check className="w-4 h-4 mr-2" />
//                   Approve
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-red-600 border-red-600"
//                   onClick={() => handleReject(exam)}
//                   disabled={updateStatus.isPending}
//                 >
//                   <X className="w-4 h-4 mr-2" />
//                   Reject
//                 </Button>
//               </>
//             )}

//             {exam.status === 'Approved' && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="text-blue-600 border-blue-600"
//                 onClick={() => handleRelease(exam)}
//                 disabled={updateStatus.isPending}
//               >
//                 <Send className="w-4 h-4 mr-2" />
//                 Release
//               </Button>
//             )}
//           </div>

//           {exam.rejection_reason && (
//             <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
//               <p className="text-sm text-red-700">{exam.rejection_reason}</p>
//             </div>
//           )}
//         </CardBody>
//       </Card>
//     );
//   };

//   return (
//     <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
//       <div>
//         <h1 className="text-3xl font-bold text-[#002a56] dark:text-white ">Exam Management</h1>
//         <p className="text-gray-500 mt-1">Manage and approve exams</p>
//       </div>

//       <Tabs
//         className='text-[#002a56] dark:text-white'
//         value={activeTab}
//         onValueChange={(value) => setActiveTab(value as ExamStatus)}
//       >
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="Pending" className="gap-2">
//             <Hourglass className="h-4 w-4" />
//             Pending ({pendingCount})
//           </TabsTrigger>
//           <TabsTrigger value="Approved" className="gap-2">
//             <CheckCircle className="h-4 w-4" />
//             Approved ({approvedCount})
//           </TabsTrigger>
//           <TabsTrigger value="Rejected" className="gap-2">
//             <X className="h-4 w-4" />
//             Rejected ({rejectedCount})
//           </TabsTrigger>
//           <TabsTrigger value="Released" className="gap-2">
//             <SendIcon className="h-4 w-4" />
//             Released ({releasedCount})
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="Pending" className="space-y-4">
//           {pendingLoading ? (
//             <div className="space-y-4">
//               {[1, 2, 3].map((i) => (
//                 <Skeleton key={i} className="h-48 w-full" />
//               ))}
//             </div>
//           ) : pendingData?.data && pendingData.data.length > 0 ? (
//             pendingData.data.map(renderExamCard).filter(Boolean)
//           ) : (
//             <Card>
//               <CardBody className="text-center py-12">
//                 <p className="text-gray-500">No pending exams</p>
//               </CardBody>
//             </Card>
//           )}
//         </TabsContent>

//         <TabsContent value="Approved" className="space-y-4">
//           {approvedLoading ? (
//             <div className="space-y-4">
//               {[1, 2, 3].map((i) => (
//                 <Skeleton key={i} className="h-48 w-full" />
//               ))}
//             </div>
//           ) : approvedData?.data && approvedData.data.length > 0 ? (
//             approvedData.data.map(renderExamCard).filter(Boolean)
//           ) : (
//             <Card>
//               <CardBody className="text-center py-12">
//                 <p className="text-gray-500">No approved exams</p>
//               </CardBody>
//             </Card>
//           )}
//         </TabsContent>

//         <TabsContent value="Rejected" className="space-y-4">
//           {rejectedLoading ? (
//             <div className="space-y-4">
//               {[1, 2, 3].map((i) => (
//                 <Skeleton key={i} className="h-48 w-full" />
//               ))}
//             </div>
//           ) : rejectedData?.data && rejectedData.data.length > 0 ? (
//             rejectedData.data.map(renderExamCard).filter(Boolean)
//           ) : (
//             <Card>
//               <CardBody className="text-center py-12">
//                 <p className="text-gray-500">No rejected exams</p>
//               </CardBody>
//             </Card>
//           )}
//         </TabsContent>

//         <TabsContent value="Released" className="space-y-4">
//           {releasedLoading ? (
//             <div className="space-y-4">
//               {[1, 2, 3].map((i) => (
//                 <Skeleton key={i} className="h-48 w-full" />
//               ))}
//             </div>
//           ) : releasedData?.data && releasedData.data.length > 0 ? (
//             releasedData.data.map(renderExamCard).filter(Boolean)
//           ) : (
//             <Card>
//               <CardBody className="text-center py-12">
//                 <p className="text-gray-500">No released exams</p>
//               </CardBody>
//             </Card>
//           )}
//         </TabsContent>
//       </Tabs>

//       {/* Edit Schedule Dialog */}
//       <Dialog open={!!editingExam} onOpenChange={(open) => !open && setEditingExam(null)}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <Calendar className="h-5 w-5" />
//               Edit Exam Schedule
//             </DialogTitle>
//             <DialogDescription>
//               Update the exam date, time, or duration. Changes will be saved immediately.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="commence_date">
//                   <Calendar className="h-4 w-4 inline mr-2" />
//                   Exam Date <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="commence_date"
//                   type="date"
//                   value={editFormData.commence_date}
//                   onChange={(e) => setEditFormData(prev => ({ ...prev, commence_date: e.target.value }))}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="duration">
//                   <Clock className="h-4 w-4 inline mr-2" />
//                   Duration (minutes) <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="duration"
//                   type="number"
//                   min="1"
//                   value={editFormData.duration}
//                   onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="start_time">
//                   Start Time <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="start_time"
//                   type="time"
//                   value={editFormData.start_time}
//                   onChange={(e) => handleStartTimeChange(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="end_time">
//                   End Time <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="end_time"
//                   type="time"
//                   value={editFormData.end_time}
//                   onChange={(e) => handleEndTimeChange(e.target.value)}
//                   required
//                 />
//                 <p className="text-xs text-gray-500">
//                   Auto-calculated from start time + duration, or set manually (duration will auto-update)
//                 </p>
//               </div>
//             </div>

//             {editingExam && (
//               <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
//                 <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
//                   Current Schedule:
//                 </p>
//                 <p className="text-sm text-blue-800 dark:text-blue-200">
//                   Date: {formatDate(editingExam.commence_date)} | 
//                   Time: {formatTimeString(editingExam.start_time)} - {formatTimeString(editingExam.end_time)} | 
//                   Duration: {editingExam.duration} minutes
//                 </p>
//               </div>
//             )}
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setEditingExam(null)}
//               disabled={updateExam.isPending}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSaveSchedule}
//               disabled={updateExam.isPending || !editFormData.commence_date || !editFormData.start_time || !editFormData.end_time || !editFormData.duration}
//               className="gap-2"
//             >
//               {updateExam.isPending ? (
//                 <>
//                   <Clock className="w-4 h-4 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Check className="w-4 h-4" />
//                   Save Changes
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { isAdminRole } from '@/lib/utils/roles';
import { useExams, useUpdateExamStatus, useUpdateExam } from '../hooks/useExams';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Check, X, Send, Hourglass, Calendar, Clock, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Exam, ExamStatus } from '../types/exam.types';
import { formatDate } from '@/lib/utils/date';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formatTimeString = (timeStr: string | null | undefined): string => {
  if (!timeStr) return 'N/A';
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const [, hour, minute] = timeMatch;
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  return timeStr;
};

export default function ExamsManagerPage() {
  const { selected_branch, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ExamStatus>('Pending');
  const navigate = useNavigate();
  
  const school_id = user?.school_id;
  const branch_id = selected_branch?.branch_id;
  const isAdmin = isAdminRole(user?.user_type);

  const { data: pendingData, isLoading: pendingLoading } = useExams({
    status: 'Pending',
    branch_id: isAdmin ? undefined : selected_branch?.branch_id || undefined,
  });

  const { data: approvedData, isLoading: approvedLoading } = useExams({
    status: 'Approved',
    branch_id: isAdmin ? undefined : selected_branch?.branch_id || undefined,
  });

  const { data: rejectedData, isLoading: rejectedLoading } = useExams({
    status: 'Rejected',
    branch_id: isAdmin ? undefined : selected_branch?.branch_id || undefined,
  });

  const { data: releasedData, isLoading: releasedLoading } = useExams({
    status: 'Released',
    branch_id: isAdmin ? undefined : selected_branch?.branch_id || undefined,
  });

  const updateStatus = useUpdateExamStatus();
  const updateExam = useUpdateExam();
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editFormData, setEditFormData] = useState({
    commence_date: '',
    start_time: '',
    end_time: '',
    duration: 0,
  });

  const pendingCount = pendingData?.data?.length || 0;
  const approvedCount = approvedData?.data?.length || 0;
  const rejectedCount = rejectedData?.data?.length || 0;
  const releasedCount = releasedData?.data?.length || 0;

  const handleApprove = async (exam: Exam) => {
    if (confirm('Are you sure you want to approve this exam?')) {
      const examId = exam.exam_id || exam.id;
      if (!examId) {
        toast.error('Exam ID is missing');
        return;
      }
      await updateStatus.mutateAsync({ id: examId, status: 'Approved' });
    }
  };

  const handleReject = async (exam: Exam) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      const examId = exam.exam_id || exam.id;
      if (!examId) {
        toast.error('Exam ID is missing');
        return;
      }
      await updateStatus.mutateAsync({ id: examId, status: 'Rejected', rejection_reason: reason });
    }
  };

  const handleRelease = async (exam: Exam) => {
    if (confirm('Are you sure you want to release this exam?')) {
      const examId = exam.exam_id || exam.id;
      if (!examId) {
        toast.error('Exam ID is missing');
        return;
      }
      await updateStatus.mutateAsync({ id: examId, status: 'Released' });
    }
  };

  const getStatusBadge = (status: ExamStatus) => {
    const colors = {
      Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
      Approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
      Rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
      Released: 'bg-blue-50 text-[#002a56] dark:bg-sky-500/10 dark:text-gray-600',
    };
    return <Badge className={cn("border-none rounded-lg px-2.5 py-1", colors[status])}>{status}</Badge>;
  };

  const handleEditSchedule = (exam: Exam) => {
    setEditingExam(exam);
    setEditFormData({
      commence_date: exam.commence_date || '',
      start_time: exam.start_time || '',
      end_time: exam.end_time || '',
      duration: exam.duration || 0,
    });
  };

  const handleSaveSchedule = async () => {
    if (!editingExam) return;
    const examId = editingExam.exam_id || editingExam.id;
    if (!examId) {
      toast.error('Exam ID is missing');
      return;
    }
    const examBranchId = (editingExam as any).branch_id || branch_id;
    if (!school_id || !examBranchId) {
      toast.error('School ID and branch ID are required.');
      return;
    }
    try {
      await updateExam.mutateAsync({
        id: examId,
        data: {
          commence_date: editFormData.commence_date,
          start_time: editFormData.start_time,
          end_time: editFormData.end_time,
          duration: editFormData.duration,
          school_id: school_id,
          branch_id: examBranchId,
          status: editingExam.status,
        },
      });
      setEditingExam(null);
      toast.success('Exam schedule updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update exam schedule');
    }
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime || !duration) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + duration);
    return `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);
    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
    const diffMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    return diffMinutes > 0 ? diffMinutes : 0;
  };

  const handleDurationChange = (duration: number) => {
    setEditFormData(prev => {
      const newData = { ...prev, duration };
      if (newData.start_time) newData.end_time = calculateEndTime(newData.start_time, duration);
      return newData;
    });
  };

  const handleStartTimeChange = (startTime: string) => {
    setEditFormData(prev => {
      const newData = { ...prev, start_time: startTime };
      if (newData.duration) newData.end_time = calculateEndTime(startTime, newData.duration);
      return newData;
    });
  };

  const handleEndTimeChange = (endTime: string) => {
    setEditFormData(prev => {
      const newData = { ...prev, end_time: endTime };
      if (newData.start_time && endTime) newData.duration = calculateDuration(newData.start_time, endTime);
      return newData;
    });
  };
  const renderExamList = (exams: any, isLoading: boolean, currentStatus: ExamStatus) => {
    if (isLoading) {
      return (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-20 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      );
    }

    const list = exams?.data || [];
    if (list.length === 0) {
      return (
        <div className="text-center py-16 space-y-2">
          <Hourglass className="h-8 w-8 text-gray-300 mx-auto animate-pulse" />
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No {currentStatus.toLowerCase()} examinations found.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100 dark:border-gray-800">
              <th className="py-4 px-6">Exam Info</th>
              <th className="py-4 px-6">Branch / Class</th>
              <th className="py-4 px-6">Schedule Window</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {list.map((exam: any) => {
              const examId = exam.exam_id || exam.id;
              return (
                <tr key={examId} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">{exam.subject_name}</p>
                    <span className="text-xs text-gray-400 capitalize">{exam.assessment_type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{exam.branch_name || 'Main Branch'}</p>
                    <span className="text-xs text-gray-400">{exam.class_name}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {exam.commence_date ? formatDate(exam.commence_date) : 'Unscheduled'}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatTimeString(exam.start_time)} - {formatTimeString(exam.end_time)} ({exam.duration}m)
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(currentStatus)}
                  </td>
                  <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/exams/${examId}/questions`)}
                      className="h-8 rounded-xl hover:bg-[#002a56]/10 text-[#002a56] dark:text-gray-600 dark:hover:bg-sky-500/10"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Questions
                    </Button>
                    
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSchedule(exam)}
                          className="h-8 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        
                        {currentStatus === 'Pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(exam)}
                              className="h-8 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(exam)}
                              className="h-8 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}

                        {currentStatus === 'Approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRelease(exam)}
                            className="h-8 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 gap-1"
                          >
                            <Send className="h-3.5 w-3.5" /> Release
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-[#002a56] dark:text-white tracking-tight">
          Examinations Quality & Schedules Manager
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Review submissions, configure time windows, and release active test banks.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExamStatus)} className="w-full space-y-6">
        <TabsList data-tour="exam-tabs" className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex flex-wrap h-auto gap-1 border-none max-w-2xl">
          <TabsTrigger value="Pending" className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-[#002a56] data-[state=active]:text-white dark:data-[state=active]:bg-red-950/50 flex items-center gap-1.5 flex-1">
            Pending <Badge className="bg-amber-500/30 text-white rounded-md px-1.5 py-0 text-[10px]">{pendingCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="Approved" className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-[#002a56] data-[state=active]:text-white dark:data-[state=active]:bg-red-950/50 flex items-center gap-1.5 flex-1">
            Approved <Badge className="bg-emerald-500/30 text-white rounded-md px-1.5 py-0 text-[10px]">{approvedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="Released" className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-[#002a56] data-[state=active]:text-white dark:data-[state=active]:bg-red-950/50 flex items-center gap-1.5 flex-1">
            Released <Badge className="bg-blue-500/30 text-white rounded-md px-1.5 py-0 text-[10px]">{releasedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="Rejected" className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-[#002a56] data-[state=active]:text-white dark:data-[state=active]:bg-red-950/50 flex items-center gap-1.5 flex-1">
            Rejected <Badge className="bg-rose-500/30 text-white rounded-md px-1.5 py-0 text-[10px]">{rejectedCount}</Badge>
          </TabsTrigger>
        </TabsList>

        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden">
          <CardBody className="p-0">
            <TabsContent value="Pending" className="m-0 focus-visible:outline-none">
              {renderExamList(pendingData, pendingLoading, 'Pending')}
            </TabsContent>
            <TabsContent value="Approved" className="m-0 focus-visible:outline-none">
              {renderExamList(approvedData, approvedLoading, 'Approved')}
            </TabsContent>
            <TabsContent value="Released" className="m-0 focus-visible:outline-none">
              {renderExamList(releasedData, releasedLoading, 'Released')}
            </TabsContent>
            <TabsContent value="Rejected" className="m-0 focus-visible:outline-none">
              {renderExamList(rejectedData, rejectedLoading, 'Rejected')}
            </TabsContent>
          </CardBody>
        </Card>
      </Tabs>

      <Dialog open={editingExam !== null} onOpenChange={(open) => !open && setEditingExam(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white dark:bg-gray-900 border-none shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#002a56] dark:text-white font-bold">Edit Exam Windows</DialogTitle>
            <DialogDescription className="text-gray-400 text-xs">Update the custom commencement dates and duration parameters.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-xs font-bold text-gray-500">Commence Date</Label>
              <Input id="date" type="date" value={editFormData.commence_date} onChange={(e) => setEditFormData(p => ({ ...p, commence_date: e.target.value }))} className="rounded-xl border-gray-100 dark:border-gray-800 text-sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration" className="text-xs font-bold text-gray-500">Duration (Minutes)</Label>
              <Input id="duration" type="number" value={editFormData.duration} onChange={(e) => handleDurationChange(parseInt(e.target.value, 10) || 0)} className="rounded-xl border-gray-100 dark:border-gray-800 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="start" className="text-xs font-bold text-gray-500">Start Window</Label>
                <Input id="start" type="time" value={editFormData.start_time} onChange={(e) => handleStartTimeChange(e.target.value)} className="rounded-xl border-gray-100 dark:border-gray-800 text-sm" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end" className="text-xs font-bold text-gray-500">End Window</Label>
                <Input id="end" type="time" value={editFormData.end_time} onChange={(e) => handleEndTimeChange(e.target.value)} className="rounded-xl border-gray-100 dark:border-gray-800 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setEditingExam(null)} className="rounded-xl text-xs font-semibold">Cancel</Button>
            <Button onClick={handleSaveSchedule} className="rounded-xl text-xs font-semibold bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


