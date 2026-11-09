// import { useState, useCallback, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { _get, _post, _put } from '@/Helper';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { 
//   Plus, 
//   FileText, 
//   Clock, 
//   Edit, 
//   Eye, 
//   Calendar,
//   CheckCircle,
//   Hourglass,
//   FileEdit,
//   Loader2,
//   Trash2,
// } from 'lucide-react';
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

// interface Exam {
//   id: string;
//   exam_id?: string;
//   assessment_type: string;
//   title?: string;
//   commence_date: string;
//   start_time?: string;
//   end_time?: string;
//   duration: number;
//   total_marks: number;
//   total_questions: number;
//   status: string;
//   subject_id?: string;
//   class_id?: string;
//   section_id?: string;
//   description?: string;
// }

// export default function TeachersExamPage() {
//   const navigate = useNavigate();
//   const { selected_branch } = useAuthStore();
//   const [draftExams, setDraftExams] = useState<Exam[]>([]);
//   const [pendingExams, setPendingExams] = useState<Exam[]>([]);
//   const [approvedExams, setApprovedExams] = useState<Exam[]>([]);
//   const [rejectedExams, setRejectedExams] = useState<Exam[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState<'Draft' | 'Pending' | 'Approved' | 'Rejected'>('Draft');
//   const [showDiscardDialog, setShowDiscardDialog] = useState(false);
//   const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
//   const [discardReason, setDiscardReason] = useState('');
//   const [discarding, setDiscarding] = useState(false);

//   const fetchExams = useCallback(
//     (status: string) => {
//       if (!selected_branch?.branch_id) return;
      
//       setLoading(true);
//       _get(
//         `examinations?query_type=select&status=${status}&branch_id=${selected_branch.branch_id}`,
//         (resp) => {
//           setLoading(false);
//           if (resp.success && Array.isArray(resp.data)) {
//             if (status === 'Draft') setDraftExams(resp.data);
//             else if (status === 'Pending') setPendingExams(resp.data);
//             else if (status === 'Approved') setApprovedExams(resp.data);
//             else if (status === 'Rejected') setRejectedExams(resp.data);
//           } else {
//             if (status === 'Draft') setDraftExams([]);
//             else if (status === 'Pending') setPendingExams([]);
//             else if (status === 'Approved') setApprovedExams([]);
//             else if (status === 'Rejected') setRejectedExams([]);
//           }
//         },
//         (err) => {
//           setLoading(false);
//           console.error(`Error fetching ${status} exams:`, err);
//           if (status === 'Draft') setDraftExams([]);
//           else if (status === 'Pending') setPendingExams([]);
//           else if (status === 'Approved') setApprovedExams([]);
//           else if (status === 'Rejected') setRejectedExams([]);
//         }
//       );
//     },
//     [selected_branch?.branch_id]
//   );

//   useEffect(() => {
//     fetchExams('Draft');
//     fetchExams('Pending');
//     fetchExams('Approved');
//     fetchExams('Rejected');
//   }, [fetchExams]);

//   const handleDiscard = () => {
//     if (!selectedExam) return;

//     const examId = selectedExam.id || selectedExam.exam_id;
//     if (!examId) {
//       toast.error('Exam ID is missing');
//       return;
//     }

//     setDiscarding(true);
//     // Use PUT with query_type=status to update exam status
//     _put(
//       `examinations?query_type=status&id=${examId}`,
//       {
//         status: 'Draft',
//         rejection_reason: discardReason || undefined, // Only include if provided
//       },
//       (res) => {
//         setDiscarding(false);
//         if (res.success) {
//           toast.success('Exam discarded successfully');
//           setShowDiscardDialog(false);
//           setSelectedExam(null);
//           setDiscardReason('');
//           fetchExams('Draft');
//           fetchExams('Pending');
//           fetchExams('Approved');
//           fetchExams('Rejected');
//         } else {
//           toast.error(res.message || 'Failed to discard exam');
//         }
//       },
//       (err) => {
//         setDiscarding(false);
//         console.error('Error discarding exam:', err);
//         toast.error(err.message || 'An error occurred while discarding the exam');
//       }
//     );
//   };

//   const getStatusColor = (status: string) => {
//     const statusLower = (status || '').toLowerCase();
//     if (statusLower === 'approved') return 'bg-green-500 text-white';
//     if (statusLower === 'pending') return 'bg-yellow-500 text-white';
//     if (statusLower === 'draft') return 'bg-gray-500 text-white';
//     if (statusLower === 'rejected') return 'bg-red-500 text-white';
//     return 'bg-gray-500 text-white';
//   };

//   const getStatusIcon = (status: string) => {
//     const statusLower = (status || '').toLowerCase();
//     if (statusLower === 'approved') return <CheckCircle className="h-4 w-4" />;
//     if (statusLower === 'pending') return <Hourglass className="h-4 w-4" />;
//     if (statusLower === 'draft') return <FileEdit className="h-4 w-4" />;
//     return <FileText className="h-4 w-4" />;
//   };


//   return (
//     <div className="space-y-6 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-[#00356B] dark:text-white">My Exams</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             View and manage all your created exams
//           </p>
//         </div>
//         <Button 
//           onClick={() => navigate('/exams/create')}
//           className="gap-2"
//         >
//           <Plus className="h-4 w-4" />
//           Create New Exam
//         </Button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card className="hover:shadow-card-hover transition-shadow">
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Draft Exams</p>
//                 <p className="text-2xl font-bold text-[#00356B] dark:text-white">{draftExams.length}</p>
//               </div>
//               <FileEdit className="h-8 w-8 text-[#00356B] dark:text-white" />
//             </div>
//           </CardBody>
//         </Card>
//         <Card className="hover:shadow-card-hover transition-shadow">
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
//                 <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingExams.length}</p>
//               </div>
//               <Hourglass className="h-8 w-8 text-yellow-500" />
//             </div>
//           </CardBody>
//         </Card>
//         <Card className="hover:shadow-card-hover transition-shadow">
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Approved Exams</p>
//                 <p className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedExams.length}</p>
//               </div>
//               <CheckCircle className="h-8 w-8 text-green-500" />
//             </div>
//           </CardBody>
//         </Card>
//         <Card className="hover:shadow-card-hover transition-shadow">
//           <CardBody className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Rejected Exams</p>
//                 <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedExams.length}</p>
//               </div>
//               <Trash2 className="h-8 w-8 text-red-500" />
//             </div>
//           </CardBody>
//         </Card>
//       </div>

//       {/* Exams Tabs */}
//       <Card className="shadow-lg text-[#00356B]">
//          <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-800 dark:to-gray-800 rounded-t-lg">
//           <CardTitle className="text-gray-900 dark:text-white">Exams List</CardTitle>
//         </CardHeader>
//         <CardBody>
//           <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
//             <TabsList className="grid w-full grid-cols-4">
//               <TabsTrigger value="Draft" className="gap-2">
//                 <FileEdit className="h-4 w-4" />
//                 Draft ({draftExams.length})
//               </TabsTrigger>
//               <TabsTrigger value="Pending" className="gap-2">
//                 <Hourglass className="h-4 w-4" />
//                 Pending ({pendingExams.length})
//               </TabsTrigger>
//               <TabsTrigger value="Approved" className="gap-2">
//                 <CheckCircle className="h-4 w-4" />
//                 Approved ({approvedExams.length})
//               </TabsTrigger>
//               <TabsTrigger value="Rejected" className="gap-2">
//                 <Trash2 className="h-4 w-4" />
//                 Rejected ({rejectedExams.length})
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="Draft" className="space-y-4 mt-6">
//               {loading ? (
//                 <div className="text-center py-12">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
//                   <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
//                 </div>
//               ) : draftExams.length === 0 ? (
//                 <div className="text-center py-12">
//                   <FileEdit className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white mb-2">
//                     No Draft Exams
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-400 mb-4">
//                     Get started by creating your first exam
//                   </p>
//                   <Button onClick={() => navigate('/exams/create')}>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Create Exam
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {draftExams.map((exam) => (
//                     <Card 
//                       key={exam.id || exam.exam_id} 
//                       className="hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02]"
//                     >
//                       <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-800 dark:to-gray-800 rounded-t-lg">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <CardTitle className="text-lg mb-2 line-clamp-2">
//                               {exam.assessment_type || exam.title}
//                             </CardTitle>
//                             <Badge className={getStatusColor(exam.status)}>
//                               {getStatusIcon(exam.status)}
//                               <span className="ml-1">{exam.status}</span>
//                             </Badge>
//                           </div>
//                         </div>
//                       </CardHeader>
//                       <CardBody className="space-y-4">
//                         <div className="grid grid-cols-2 gap-3 text-sm">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Date:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.commence_date}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Duration:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.duration} min
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Questions:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.total_questions || 0}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Marks:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.total_marks || 0}
//                             </span>
//                           </div>
//                         </div>
                        
//                         <div className="flex gap-2 pt-2 border-t">
//                           <Button 
//                             variant="outline" 
//                             size="sm" 
//                             className="flex-1 gap-2"
//                             onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}
//                           >
//                             <Edit className="h-4 w-4" />
//                             Manage
//                           </Button>
//                           <Button 
//                             variant="ghost" 
//                             size="sm"
//                             onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </CardBody>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="Pending" className="space-y-4 mt-6">
//               {loading ? (
//                 <div className="text-center py-12">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
//                   <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
//                 </div>
//               ) : pendingExams.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Hourglass className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white mb-2">
//                     No Pending Exams
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     Exams sent for approval will appear here
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {pendingExams.map((exam) => (
//                     <Card 
//                       key={exam.id || exam.exam_id} 
//                       className="hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02]"
//                     >
//                       <CardHeader className="bg-gradient-to-r from-yellow-50 to-background-100 dark:from-yellow-900/20 dark:to-gray-900 rounded-t-lg">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <CardTitle className="text-lg mb-2 line-clamp-2">
//                               {exam.assessment_type || exam.title}
//                             </CardTitle>
//                             <Badge className={getStatusColor(exam.status)}>
//                               {getStatusIcon(exam.status)}
//                               <span className="ml-1">{exam.status}</span>
//                             </Badge>
//                           </div>
//                         </div>
//                       </CardHeader>
//                       <CardBody className="space-y-4">
//                         <div className="grid grid-cols-2 gap-3 text-sm">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Date:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.commence_date}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Duration:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.duration} min
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Questions:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.total_questions || 0}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Marks:</span>
//                             <span className="font-medium text-gray-900 dark:text-white">
//                               {exam.total_marks || 0}
//                             </span>
//                           </div>
//                         </div>
                        
//                         <div className="flex gap-2 pt-2 border-t">
//                           <Button 
//                             variant="outline" 
//                             size="sm" 
//                             className="flex-1 gap-2"
//                             onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}
//                           >
//                             <Eye className="h-4 w-4" />
//                             View
//                           </Button>
//                           <Button 
//                             variant="outline" 
//                             size="sm"
//                             onClick={() => {
//                               setSelectedExam(exam);
//                               setShowDiscardDialog(true);
//                             }}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </CardBody>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="Approved" className="space-y-4 mt-6">
//               {loading ? (
//                 <div className="text-center py-12">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
//                   <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
//                 </div>
//               ) : approvedExams.length === 0 ? (
//                 <div className="text-center py-12">
//                   <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white mb-2">
//                     No Approved Exams
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     Approved exams will appear here
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {approvedExams.map((exam) => (
//                     <Card 
//                       key={exam.id || exam.exam_id} 
//                       className="hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02]"
//                     >
//                       <CardHeader className="bg-gradient-to-r from-green-50 to-background-100 dark:from-green-900/20 dark:to-gray-900 rounded-t-lg">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <CardTitle className="text-lg mb-2 line-clamp-2">
//                               {exam.assessment_type || exam.title}
//                             </CardTitle>
//                             <Badge className={getStatusColor(exam.status)}>
//                               {getStatusIcon(exam.status)}
//                               <span className="ml-1">{exam.status}</span>
//                             </Badge>
//                           </div>
//                         </div>
//                       </CardHeader>
//                       <CardBody className="space-y-4">
//                         <div className="grid grid-cols-2 gap-3 text-sm">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Date:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.commence_date}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Duration:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.duration} min
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Questions:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.total_questions || 0}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Marks:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.total_marks || 0}
//                             </span>
//                           </div>
//                         </div>
                        
//                         <div className="flex gap-2 pt-2 border-t">
//                           <Button 
//                             variant="outline" 
//                             size="sm" 
//                             className="flex-1 gap-2"
//                             onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}
//                           >
//                             <Eye className="h-4 w-4" />
//                             View Questions
//                           </Button>
//                         </div>
//                       </CardBody>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="Rejected" className="space-y-4 mt-6">
//               {loading ? (
//                 <div className="text-center py-12">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
//                   <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
//                 </div>
//               ) : rejectedExams.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Trash2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white mb-2">
//                     No Rejected Exams
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     Exams rejected by admin will appear here
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {rejectedExams.map((exam) => (
//                     <Card 
//                       key={exam.id || exam.exam_id} 
//                       className="hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02]"
//                     >
//                       <CardHeader className="bg-gradient-to-r from-red-50 to-background-100 dark:from-red-900/20 dark:to-gray-900 rounded-t-lg">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <CardTitle className="text-lg mb-2 line-clamp-2">
//                               {exam.assessment_type || exam.title}
//                             </CardTitle>
//                             <Badge className={getStatusColor(exam.status)}>
//                               {getStatusIcon(exam.status)}
//                               <span className="ml-1">{exam.status}</span>
//                             </Badge>
//                           </div>
//                         </div>
//                       </CardHeader>
//                       <CardBody className="space-y-4">
//                         <div className="grid grid-cols-2 gap-3 text-sm">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Date:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.commence_date}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Duration:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.duration} min
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Questions:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.total_questions || 0}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                             <span className="text-gray-600 dark:text-gray-400">Marks:</span>
//                             <span className="font-medium text-gray-900 dark:text-white dark:text-white">
//                               {exam.total_marks || 0}
//                             </span>
//                           </div>
//                         </div>
                        
//                         {(exam as any).rejection_reason && (
//                           <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                             <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
//                               Rejection Reason:
//                             </p>
//                             <p className="text-sm text-red-700 dark:text-red-300">
//                               {(exam as any).rejection_reason}
//                             </p>
//                           </div>
//                         )}
                        
//                         <div className="flex gap-2 pt-2 border-t">
//                           <Button 
//                             variant="outline" 
//                             size="sm" 
//                             className="flex-1 gap-2"
//                             onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}
//                           >
//                             <Eye className="h-4 w-4" />
//                             View Details
//                           </Button>
//                           <Button 
//                             variant="outline" 
//                             size="sm"
//                             onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </CardBody>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>
//         </CardBody>
//       </Card>

//       {/* Discard Exam Dialog */}
//       <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className="text-gradient-primary">Discard Exam</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to discard this exam? This will move it back to Draft status. Please provide a reason.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="py-4">
//             <Label htmlFor="reason">Reason (Optional)</Label>
//             <Input
//               id="reason"
//               value={discardReason}
//               onChange={(e) => setDiscardReason(e.target.value)}
//               placeholder="Enter reason for discarding..."
//               className="mt-1"
//             />
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowDiscardDialog(false);
//                 setSelectedExam(null);
//                 setDiscardReason('');
//               }}
//               disabled={discarding}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={handleDiscard}
//               disabled={discarding}
//               className="gap-2"
//             >
//               {discarding ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Discarding...
//                 </>
//               ) : (
//                 <>
//                   <Trash2 className="w-4 h-4" />
//                   Discard Exam
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
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get, _post, _put } from '@/Helper';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Clock, 
  Edit, 
  Eye, 
  Calendar,
  CheckCircle,
  Hourglass,
  FileEdit,
  Loader2,
  Trash2,
  XCircle,
  LayoutDashboard
} from 'lucide-react';
import toast from 'react-hot-toast';
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

interface Exam {
  id: string;
  exam_id?: string;
  assessment_type: string;
  title?: string;
  commence_date: string;
  start_time?: string;
  end_time?: string;
  duration: number;
  total_marks: number;
  total_questions: number;
  status: string;
  subject_id?: string;
  class_id?: string;
  section_id?: string;
  description?: string;
}

export default function TeachersExamPage() {
  const navigate = useNavigate();
  const { user, selected_branch } = useAuthStore();

  // Use selected_branch if available, otherwise fall back to user's branch_id
  const effectiveBranchId = selected_branch?.branch_id || user?.branch_id || '';

  const [draftExams, setDraftExams] = useState<Exam[]>([]);
  const [pendingExams, setPendingExams] = useState<Exam[]>([]);
  const [approvedExams, setApprovedExams] = useState<Exam[]>([]);
  const [rejectedExams, setRejectedExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'Draft' | 'Pending' | 'Approved' | 'Rejected'>('Draft');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [discardReason, setDiscardReason] = useState('');
  const [discarding, setDiscarding] = useState(false);

  const fetchExams = useCallback(
    (status: string) => {
      if (!effectiveBranchId) return;

      setLoading(true);
      _get(
        `examinations?query_type=select&status=${status}&branch_id=${effectiveBranchId}`,
        (resp) => {
          setLoading(false);
          if (resp.success && Array.isArray(resp.data)) {
            if (status === 'Draft') setDraftExams(resp.data);
            else if (status === 'Pending') setPendingExams(resp.data);
            else if (status === 'Approved') setApprovedExams(resp.data);
            else if (status === 'Rejected') setRejectedExams(resp.data);
          } else {
            if (status === 'Draft') setDraftExams([]);
            else if (status === 'Pending') setPendingExams([]);
            else if (status === 'Approved') setApprovedExams([]);
            else if (status === 'Rejected') setRejectedExams([]);
          }
        },
        (err) => {
          setLoading(false);
          console.error(`Error fetching ${status} exams:`, err);
          if (status === 'Draft') setDraftExams([]);
          else if (status === 'Pending') setPendingExams([]);
          else if (status === 'Approved') setApprovedExams([]);
          else if (status === 'Rejected') setRejectedExams([]);
        }
      );
    },
    [effectiveBranchId]
  );

  useEffect(() => {
    fetchExams('Draft');
    fetchExams('Pending');
    fetchExams('Approved');
    fetchExams('Rejected');
  }, [fetchExams]);

  const handleDiscard = () => {
    if (!selectedExam) return;

    const examId = selectedExam.id || selectedExam.exam_id;
    if (!examId) {
      toast.error('Exam ID is missing');
      return;
    }

    setDiscarding(true);
    _put(
      `examinations?query_type=status&id=${examId}`,
      {
        status: 'Draft',
        rejection_reason: discardReason || undefined,
      },
      (res) => {
        setDiscarding(false);
        if (res.success) {
          toast.success('Exam discarded successfully');
          setShowDiscardDialog(false);
          setSelectedExam(null);
          setDiscardReason('');
          fetchExams('Draft');
          fetchExams('Pending');
          fetchExams('Approved');
          fetchExams('Rejected');
        } else {
          toast.error(res.message || 'Failed to discard exam');
        }
      },
      (err) => {
        setDiscarding(false);
        console.error('Error discarding exam:', err);
        toast.error(err.message || 'An error occurred while discarding the exam');
      }
    );
  };

  const getStatusColor = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'approved') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (statusLower === 'draft') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    if (statusLower === 'rejected') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'approved') return <CheckCircle className="h-4 w-4" />;
    if (statusLower === 'pending') return <Hourglass className="h-4 w-4" />;
    if (statusLower === 'draft') return <FileEdit className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };
   return (
    <div className="space-y-6 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#00356B] dark:text-white flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-[#00356B] dark:text-white" />
            My Exams
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all your created exams
          </p>
        </div>
        <Button 
          onClick={() => navigate('/exams/create')}
          data-tour="teacher-create-exam"
          className="gap-2 bg-[#00356B] hover:bg-[#00254B] text-white"
        >
          <Plus className="h-4 w-4" />
          Create New Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-card-hover transition-shadow bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Draft Exams</p>
                <p className="text-2xl font-bold text-[#00356B] dark:text-white">{draftExams.length}</p>
              </div>
              <FileEdit className="h-8 w-8 text-[#00356B] dark:text-white" />
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-card-hover transition-shadow bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingExams.length}</p>
              </div>
              <Hourglass className="h-8 w-8 text-yellow-500" />
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-card-hover transition-shadow bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved Exams</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedExams.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-card-hover transition-shadow bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rejected Exams</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedExams.length}</p>
              </div>
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Exams Tabs Container */}
      <Card className="shadow-lg text-[#00356B] bg-white dark:bg-gray-800 border-none rounded-xl">
        <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-700 dark:to-gray-700 rounded-t-xl border-b dark:border-gray-700">
          <CardTitle className="text-gray-900 dark:text-white">Exams List</CardTitle>
        </CardHeader>
        <CardBody className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-6">
              <TabsTrigger value="Draft" className="gap-2">
                <FileEdit className="h-4 w-4" />
                Draft ({draftExams.length})
              </TabsTrigger>
              <TabsTrigger value="Pending" className="gap-2">
                <Hourglass className="h-4 w-4" />
                Pending ({pendingExams.length})
              </TabsTrigger>
              <TabsTrigger value="Approved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved ({approvedExams.length})
              </TabsTrigger>
              <TabsTrigger value="Rejected" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Rejected ({rejectedExams.length})
              </TabsTrigger>
            </TabsList>
            {/* Draft Tab Content */}
            <TabsContent value="Draft" className="space-y-4 focus-visible:outline-none">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
                </div>
              ) : draftExams.length === 0 ? (
                <div className="text-center py-12">
                  <FileEdit className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Draft Exams</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first exam</p>
                  <Button onClick={() => navigate('/exams/create')} className="bg-[#00356B] text-white">
                    <Plus className="h-4 w-4 mr-2" /> Create Exam
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftExams.map((exam) => (
                    <Card key={exam.id || exam.exam_id} className="hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-800 dark:to-gray-800 p-4 border-b dark:border-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white">
                              {exam.assessment_type || exam.title}
                            </CardTitle>
                            <Badge className={getStatusColor(exam.status)}>
                              {getStatusIcon(exam.status)}
                              <span className="ml-1">{exam.status}</span>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Date:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{exam.commence_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{exam.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{exam.total_questions || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Marks:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{exam.total_marks || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t dark:border-gray-800">
                          <Button variant="outline" size="sm" className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300" onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}>
                            <Edit className="h-4 w-4" /> Manage
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300" onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            {/* Pending Tab Content */}
            <TabsContent value="Pending" className="space-y-4 focus-visible:outline-none">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
                </div>
              ) : pendingExams.length === 0 ? (
                <div className="text-center py-12">
                  <Hourglass className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Pending Exams</h3>
                  <p className="text-gray-600 dark:text-gray-400">Exams sent for approval will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingExams.map((exam) => (
                    <Card key={exam.id || exam.exam_id} className="hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-yellow-50 to-background-100 dark:from-yellow-900/20 dark:to-gray-900 p-4 border-b dark:border-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white">
                              {exam.assessment_type || exam.title}
                            </CardTitle>
                            <Badge className={getStatusColor(exam.status)}>
                              {getStatusIcon(exam.status)}
                              <span className="ml-1">{exam.status}</span>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Date:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{exam.commence_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{exam.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{exam.total_questions || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Marks:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{exam.total_marks || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t dark:border-gray-800">
                          <Button variant="outline" size="sm" className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300" onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}>
                            <Eye className="h-4 w-4" /> View
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300" onClick={() => { setSelectedExam(exam); setShowDiscardDialog(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            {/* Approved Tab Content */}
            <TabsContent value="Approved" className="space-y-4 focus-visible:outline-none">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
                </div>
              ) : approvedExams.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Approved Exams</h3>
                  <p className="text-gray-600 dark:text-gray-400">Approved exams will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedExams.map((exam) => (
                    <Card key={exam.id || exam.exam_id} className="hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-background-100 dark:from-green-900/20 dark:to-gray-900 p-4 border-b dark:border-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white">
                              {exam.assessment_type || exam.title}
                            </CardTitle>
                            <Badge className={getStatusColor(exam.status)}>
                              {getStatusIcon(exam.status)}
                              <span className="ml-1">{exam.status}</span>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Date:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{exam.commence_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{exam.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{exam.total_questions || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Marks:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{exam.total_marks || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t dark:border-gray-800">
                          <Button variant="outline" size="sm" className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300" onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}>
                            <Eye className="h-4 w-4" /> View Questions
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            {/* Rejected Tab Content */}
            <TabsContent value="Rejected" className="space-y-4 focus-visible:outline-none">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
                </div>
              ) : rejectedExams.length === 0 ? (
                <div className="text-center py-12">
                  <Trash2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Rejected Exams</h3>
                  <p className="text-gray-600 dark:text-gray-400">Exams rejected by admin will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejectedExams.map((exam) => (
                    <Card key={exam.id || exam.exam_id} className="hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-red-50 to-background-100 dark:from-red-900/20 dark:to-gray-900 p-4 border-b dark:border-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white">
                              {exam.assessment_type || exam.title}
                            </CardTitle>
                            <Badge className={getStatusColor(exam.status)}>
                              {getStatusIcon(exam.status)}
                              <span className="ml-1">{exam.status}</span>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Date:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{exam.commence_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{exam.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{exam.total_questions || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-gray-600 dark:text-gray-400">Marks:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{exam.total_marks || 0}</span>
                          </div>
                        </div>
                        
                        {(exam as any).rejection_reason && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                              Rejection Reason:
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              {(exam as any).rejection_reason}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2 border-t dark:border-gray-800">
                          <Button variant="outline" size="sm" className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300" onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}>
                            <Eye className="h-4 w-4" /> View Details
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300" onClick={() => navigate(`/exams/${exam.id || exam.exam_id}/questions`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>
      {/* Discard Exam Dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 bg-white dark:bg-gray-900 border dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Discard Exam
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Are you sure you want to discard this exam? This will move it back to Draft status. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-2">
            <Label htmlFor="reason" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Reason (Optional)
            </Label>
            <Input
              id="reason"
              value={discardReason}
              onChange={(e) => setDiscardReason(e.target.value)}
              placeholder="Enter reason for discarding..."
              className="mt-1 rounded-lg text-sm border-gray-200 dark:border-gray-800 bg-transparent focus-visible:ring-primary h-10 text-gray-900 dark:text-white"
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDiscardDialog(false);
                setSelectedExam(null);
                setDiscardReason('');
              }}
              disabled={discarding}
              className="rounded-lg text-xs font-medium h-9 border-gray-200 dark:border-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscard}
              disabled={discarding}
              className="gap-2 rounded-lg text-xs font-medium h-9 bg-rose-600 hover:bg-rose-700 text-white"
            >
              {discarding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Discarding...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Discard Exam
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
