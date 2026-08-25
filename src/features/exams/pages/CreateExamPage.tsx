// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { _get, _post } from '@/Helper';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { ArrowLeft, Save, Loader2, Calendar, Clock, BookOpen, Users, Calculator, BookOpenCheck } from 'lucide-react';
// import { formatDate } from '@/lib/utils/date';
// import toast from 'react-hot-toast';

// const examSchema = z.object({
//   title: z.string().min(3, 'Title must be at least 3 characters'),
//   description: z.string().optional(),
//   instructions: z.string().optional(),
//   commence_date: z.string().min(1, 'Commencement date is required'),
//   start_time: z.string().min(1, 'Start time is required'),
//   end_time: z.string().min(1, 'End time is required'),
//   duration: z.number().min(1, 'Duration must be at least 1 minute'),
//   subject_id: z.string().min(1, 'Subject is required'),
//   class_id: z.string().min(1, 'Class is required'),
//   section_id: z.string().optional(),
//   allow_calculator: z.boolean().optional(),
//   allow_dictionary: z.boolean().optional(),
//   randomize_questions: z.boolean().optional(),
// });

// type ExamFormData = z.infer<typeof examSchema>;

// export default function CreateExamPage() {
//   const navigate = useNavigate();
//   const { user, selected_branch } = useAuthStore();
//   const [loading, setLoading] = useState(false);
//   const [selectedSubject, setSelectedSubject] = useState<string>('');
//   const [selectedClass, setSelectedClass] = useState<string>('');
//   const [selectedSection, setSelectedSection] = useState<string>('');
  
//   // Local state for fetched data
//   const [sections, setSections] = useState<any[]>([]);
//   const [classes, setClasses] = useState<any[]>([]);
//   const [subjects, setSubjects] = useState<any[]>([]);
//   const [fetchingSections, setFetchingSections] = useState(false);
//   const [fetchingClasses, setFetchingClasses] = useState(false);
//   const [fetchingSubjects, setFetchingSubjects] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     setValue,
//     watch,
//   } = useForm<ExamFormData>({
//     resolver: zodResolver(examSchema),
//     defaultValues: {
//       commence_date: formatDate(new Date(), 'yyyy-MM-dd'),
//       allow_calculator: false,
//       allow_dictionary: false,
//       randomize_questions: false,
//     },
//   });

//   const startTime = watch('start_time');
//   const endTime = watch('end_time');
//   const commenceDate = watch('commence_date');

//   // Fetch sections
//   const fetchSections = useCallback(() => {
//     if (!user?.school_id || !selected_branch?.branch_id) return;
    
//     setFetchingSections(true);
//     _get(
//       `get-sections?query_type=select&school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
//       (res) => {
//         setFetchingSections(false);
//         if (res.success && Array.isArray(res.data)) {
//           setSections(res.data);
//         } else {
//           setSections([]);
//         }
//       },
//       (err) => {
//         setFetchingSections(false);
//         console.error('Error fetching sections:', err);
//         setSections([]);
//       }
//     );
//   }, [user?.school_id, selected_branch?.branch_id]);

//   // Fetch classes based on selected section
//   const fetchClasses = useCallback(() => {
//     if (!user?.school_id || !selected_branch?.branch_id) {
//       setClasses([]);
//       return;
//     }

//     if (!selectedSection || selectedSection === 'all') {
//       // Fetch all classes if no section selected
//       setFetchingClasses(true);
//       _get(
//         `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
//         (res) => {
//           setFetchingClasses(false);
//           if (res.success && Array.isArray(res.data)) {
//             setClasses(res.data);
//           } else {
//             setClasses([]);
//           }
//         },
//         (err) => {
//           setFetchingClasses(false);
//           console.error('Error fetching classes:', err);
//           setClasses([]);
//         }
//       );
//     } else {
//       // Fetch classes filtered by section
//       setFetchingClasses(true);
//       _get(
//         `classes?query_type=select-section-classes&section=${selectedSection}&school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
//         (res) => {
//           setFetchingClasses(false);
//           if (res.success && Array.isArray(res.data)) {
//             setClasses(res.data);
//           } else {
//             setClasses([]);
//           }
//         },
//         (err) => {
//           setFetchingClasses(false);
//           console.error('Error fetching classes:', err);
//           setClasses([]);
//         }
//       );
//     }
//   }, [selectedSection, user?.school_id, selected_branch?.branch_id]);

//   // Fetch subjects based on selected class
//   const fetchSubjects = useCallback(() => {
//     if (!user?.school_id || !selectedClass || !selected_branch?.branch_id) {
//       setSubjects([]);
//       return;
//     }

//     setFetchingSubjects(true);
//     _get(
//       `subjects?query_type=select-section-subjects&class_code=${selectedClass}&school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
//       (res) => {
//         setFetchingSubjects(false);
//         if (res.success && Array.isArray(res.data)) {
//           setSubjects(res.data);
//         } else {
//           setSubjects([]);
//         }
//       },
//       (err) => {
//         setFetchingSubjects(false);
//         console.error('Error fetching subjects:', err);
//         toast.error(err.message || 'Failed to fetch subjects');
//         setSubjects([]);
//       }
//     );
//   }, [selectedClass, user?.school_id, selected_branch?.branch_id]);

//   // Fetch sections on mount
//   useEffect(() => {
//     fetchSections();
//   }, [fetchSections]);

//   // Fetch classes when section changes
//   useEffect(() => {
//     fetchClasses();
//   }, [fetchClasses]);

//   // Fetch subjects when class changes
//   useEffect(() => {
//     if (selectedClass) {
//       fetchSubjects();
//     } else {
//       setSubjects([]);
//     }
//   }, [selectedClass, fetchSubjects]);

//   // Calculate duration in minutes
//   const calculateDuration = () => {
//     if (!startTime || !endTime) return 0;

//     const [startH, startM] = startTime.split(':').map(Number);
//     const [endH, endM] = endTime.split(':').map(Number);

//     const startMinutes = startH * 60 + startM;
//     const endMinutes = endH * 60 + endM;

//     let duration = endMinutes - startMinutes;
//     if (duration < 0) duration += 24 * 60; // Handle next day

//     setValue('duration', duration);
//     return duration;
//   };

//   const onSubmit = async (data: ExamFormData) => {
//     if (!selected_branch?.branch_id) {
//       toast.error('Please select a branch');
//       return;
//     }

//     if (!user?.user_id && !user?.id) {
//       toast.error('User information is missing');
//       return;
//     }

//     setLoading(true);

//     const duration = calculateDuration() || data.duration;
    
//     const payload = {
//       query_type: 'insert',
//       assessment_type: data.title,
//       description: data.description || '',
//       instructions: data.instructions || '',
//       commence_date: data.commence_date,
//       start_time: data.start_time,
//       end_time: data.end_time,
//       duration: duration,
//       subject_id: data.subject_id,
//       class_id: data.class_id,
//       section_id: data.section_id || '',
//       branch_id: selected_branch.branch_id,
//       school_id: user.school_id,
//       teacher_id: user.id,
//       status: 'Draft', // Start as Draft, teacher will send to admin after adding questions
//       total_marks: 0, // Will be calculated after questions are added
//       total_questions: 0, // Will be updated after questions are added
//       allow_calculator: Boolean(data.allow_calculator),
//       allow_dictionary: Boolean(data.allow_dictionary),
//       randomize_questions: Boolean(data.randomize_questions),
//       randomize_options: false, // Always false - options should never be shuffled for answer integrity
//     };

//     _post(
//       'examinations',
//       payload,
//       (res) => {
//         setLoading(false);
//         if (res.success && res.data) {
//           const examId = res.data.id || res.data.exam_id || res.data[0]?.id || res.data[0]?.exam_id;
//           toast.success('Exam created successfully!');
//           navigate(`/exams/${examId}/questions`);
//         } else {
//           toast.error(res.message || 'Failed to create exam');
//         }
//       },
//       (err) => {
//         setLoading(false);
//         console.error('Error creating exam:', err);
//         toast.error(err.message || 'An error occurred while creating the exam');
//       }
//     );
//   };

//   return (
//     <div className="space-y-6 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <Button
//             variant="ghost"
//             onClick={() => navigate('/exams')}
//             className="mb-4"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Exams
//           </Button>
//           <h1 className="text-3xl font-bold text-[#00356B] dark:text-white">Create New Exam</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Fill in the exam details below. You'll add questions after creating the exam.
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Main Form */}
//           <div className="lg:col-span-2 space-y-6">
//             <Card className="shadow-lg animate-fade-in">
//               <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-800 dark:to-gray-800 rounded-t-lg">
//                 <CardTitle className="text-[#00356B] dark:text-gray-100  flex items-center gap-2">
//                   <BookOpen className="h-5 w-5 dark:text-gray-200 text-[#00356B]"/>
//                   Basic Information
//                 </CardTitle>
//               </CardHeader>
//               <CardBody className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">
//                     Exam Title <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="title"
//                     {...register('title')}
//                     placeholder="e.g., First Term Mathematics Examination"
//                     className={errors.title ? 'border-red-500' : ''}
//                   />
//                   {errors.title && (
//                     <p className="text-sm text-red-500">{errors.title.message}</p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description (Optional)</Label>
//                   <Textarea
//                     id="description"
//                     {...register('description')}
//                     placeholder="Optional description for internal use"
//                     rows={3}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="instructions">Instructions for Students</Label>
//                   <Textarea
//                     id="instructions"
//                     {...register('instructions')}
//                     placeholder="Instructions that will be shown to students before they start the exam"
//                     rows={4}
//                   />
//                   <p className="text-xs text-gray-500">
//                     These instructions will be displayed to students before they begin the exam.
//                   </p>
//                 </div>

//                 {/* Section Selection */}
//                 <div className="space-y-2">
//                   <Label htmlFor="section_id">
//                     Section <span className="text-gray-500 text-xs">(Optional - helps filter classes)</span>
//                   </Label>
//                   <Select
//                     value={selectedSection}
//                     onValueChange={(value) => {
//                       setSelectedSection(value === 'all' ? '' : value);
//                       setValue('section_id', value === 'all' ? '' : value);
//                       setSelectedClass('');// Reset class when section changes
//                       setValue('class_id', '');
//                       setSelectedSubject(''); // Reset subject when section changes
//                       setValue('subject_id', '');
//                     }}
//                     disabled={fetchingSections}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder={fetchingSections ? "Loading sections..." : "Select section (optional)"} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Sections</SelectItem>
//                       {sections.map((section: any) => (
//                         <SelectItem
//                           key={section.section_id || section.id || section.section_name}
//                           value={section.section_name || section.section_id}
//                         >
//                           {section.section_name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {fetchingSections && (
//                     <p className="text-xs text-gray-500">Loading sections...</p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="class_id">
//                       Class <span className="text-red-500">*</span>
//                     </Label>
//                     <Select
//                       value={selectedClass}
//                       onValueChange={(value) => {
//                         setSelectedClass(value);
//                         setValue('class_id', value);
//                         setSelectedSubject(''); // Reset subject when class changes
//                         setValue('subject_id', '');
//                       }}
//                       disabled={fetchingClasses}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={fetchingClasses ? "Loading classes..." : "Select class"} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {classes.map((cls: any) => (
//                           <SelectItem
//                             key={cls.class_code || cls.class_id || cls.id}
//                             value={cls.class_code || cls.class_id || cls.id}
//                           >
//                             {cls.class_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.class_id && (
//                       <p className="text-sm text-red-500">
//                         {errors.class_id.message}
//                       </p>
//                     )}
//                     {fetchingClasses && (
//                       <p className="text-xs text-gray-500">Loading classes...</p>
//                     )}
//                     {!fetchingClasses && selectedSection && classes.length === 0 && (
//                       <p className="text-xs text-gray-500">No classes found for selected section</p>
//                     )}
//                     {!fetchingClasses && !selectedSection && classes.length === 0 && (
//                       <p className="text-xs text-gray-500">No classes available. Please select a section or ensure classes are set up.</p>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="subject_id">
//                       Subject <span className="text-red-500">*</span>
//                     </Label>
//                     <Select
//                       value={selectedSubject}
//                       onValueChange={(value) => {
//                         setSelectedSubject(value);
//                         setValue('subject_id', value);
//                       }}
//                       disabled={!selectedClass || fetchingSubjects}
//                     >
//                       <SelectTrigger>
//                         <SelectValue 
//                           placeholder={
//                             fetchingSubjects 
//                               ? "Loading subjects..." 
//                               : selectedClass 
//                                 ? "Select subject" 
//                                 : "Select class first"
//                           } 
//                         />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {subjects.map((subject: any) => (
//                           <SelectItem
//                             className='text-[#00356B] dark:text-white'
//                             key={subject.subject_code || subject.subject_id || subject.id}
//                             value={subject.subject_code || subject.subject_id || subject.id}
//                           >
//                             {subject.subject || subject.subject_name || subject.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.subject_id && (
//                       <p className="text-sm text-red-500">
//                         {errors.subject_id.message}
//                       </p>
//                     )}
//                     {fetchingSubjects && (
//                       <p className="text-xs text-gray-500">Loading subjects...</p>
//                     )}
//                     {!fetchingSubjects && selectedClass && subjects.length === 0 && (
//                       <p className="text-xs text-gray-500">No subjects found for selected class</p>
//                     )}
//                   </div>
//                 </div>
//               </CardBody>
//             </Card>

//             <Card className="shadow-lg animate-fade-in">
//               <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-800 dark:to-gray-800 rounded-t-lg">
//                 <CardTitle className="text-[#00356B] dark:text-white flex items-center gap-2 ">
//                   <Calendar className="h-5 w-5" />
//                   Schedule & Timing
//                 </CardTitle>
//               </CardHeader>
//               <CardBody className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="commence_date" className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4" />
//                     Commencement Date <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="commence_date"
//                     type="date"
//                     {...register('commence_date')}
//                     min={formatDate(new Date(), 'yyyy-MM-dd')}
//                     className={errors.commence_date ? 'border-red-500' : ''}
//                   />
//                   {errors.commence_date && (
//                     <p className="text-sm text-red-500">
//                       {errors.commence_date.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="start_time" className="flex items-center gap-2">
//                       <Clock className="h-4 w-4" />
//                       Start Time <span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       id="start_time"
//                       type="time"
//                       {...register('start_time')}
//                       onChange={(e) => {
//                         setValue('start_time', e.target.value);
//                         calculateDuration();
//                       }}
//                       className={errors.start_time ? 'border-red-500' : ''}
//                     />
//                     {errors.start_time && (
//                       <p className="text-sm text-red-500">
//                         {errors.start_time.message}
//                       </p>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="end_time" className="flex items-center gap-2">
//                       <Clock className="h-4 w-4" />
//                       End Time <span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       id="end_time"
//                       type="time"
//                       {...register('end_time')}
//                       onChange={(e) => {
//                         setValue('end_time', e.target.value);
//                         calculateDuration();
//                       }}
//                       className={errors.end_time ? 'border-red-500' : ''}
//                     />
//                     {errors.end_time && (
//                       <p className="text-sm text-red-500">
//                         {errors.end_time.message}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {startTime && endTime && calculateDuration() > 0 && (
//                   <div className="p-4 border-2 border-[#00356B] dark:border-gray-700 text-[#00356B] dark:text-white rounded-lg">
//                     <div className="flex items-center gap-2">
//                       <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
//                       <div>
//                         <p className="text-sm font-semibold text-primary-900 dark:text-primary-100">
//                           Exam Duration
//                         </p>
//                         <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
//                           {calculateDuration()} minutes ({Math.floor(calculateDuration() / 60)}h{' '}
//                           {calculateDuration() % 60}m)
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </CardBody>
//             </Card>

//             <Card className="shadow-lg animate-fade-in">
//               <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-800 dark:to-gray-800 rounded-t-lg">
//                 <CardTitle className="text-[#00356B] dark:text-white flex items-center gap-2">
//                   <BookOpenCheck className="h-5 w-5" />
//                   Exam Settings
//                 </CardTitle>
//               </CardHeader>
//               <CardBody className="space-y-4">
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between p-4 border rounded-lg">
//                     <div className="flex items-center gap-3">
//                       <Calculator className="h-5 w-5 text-gray-600 dark:text-gray-400" />
//                       <div>
//                         <Label htmlFor="allow_calculator" className="text-base font-medium cursor-pointer">
//                           Allow Calculator
//                         </Label>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           Students can use calculator during the exam
//                         </p>
//                       </div>
//                     </div>
//                     <input
//                       type="checkbox"
//                       id="allow_calculator"
//                       {...register('allow_calculator')}
//                       className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
//                     />
//                   </div>

//                   <div className="flex items-center justify-between p-4 border rounded-lg">
//                     <div className="flex items-center gap-3">
//                       <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
//                       <div>
//                         <Label htmlFor="allow_dictionary" className="text-base font-medium cursor-pointer">
//                           Allow Dictionary
//                         </Label>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           Students can use dictionary during the exam
//                         </p>
//                       </div>
//                     </div>
//                     <input
//                       type="checkbox"
//                       id="allow_dictionary"
//                       {...register('allow_dictionary')}
//                       className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
//                     />
//                   </div>

//                   <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
//                     <div className="flex items-center gap-3">
//                       <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                       <div>
//                         <Label htmlFor="randomize_questions" className="text-base font-medium cursor-pointer">
//                           Randomize Question Order
//                         </Label>
//                         <p className="text-sm text-gray-600 dark:text-gray-300">
//                           Each student will see questions in a different random order (options remain in original order)
//                         </p>
//                         <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
//                           ✓ Recommended for exam security
//                         </p>
//                       </div>
//                     </div>
//                     <input
//                       type="checkbox"
//                       id="randomize_questions"
//                       {...register('randomize_questions')}
//                       className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
//                     />
//                   </div>
//                 </div>
//               </CardBody>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             <Card className="shadow-lg animate-fade-in sticky top-6">
//               <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-800 dark:to-gray-800 rounded-t-lg">
//                 <CardTitle className="text-[#00356B] dark:text-white">Actions</CardTitle>
//               </CardHeader>
//               <CardBody className="space-y-3">
//                 <Button
//                   type="submit"
//                   className="w-full"
//                   disabled={isSubmitting || loading}
//                 >
//                   {isSubmitting || loading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Creating...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-4 h-4 mr-2" />
//                       Create Exam
//                     </>
//                   )}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="w-full border-gray-300 dark:border-gray-600 text-[#00356B] dark:text-white"
//                   onClick={() => navigate('/exams')}
//                   disabled={isSubmitting || loading}
//                 >
//                   Cancel
//                 </Button>
//               </CardBody>
//             </Card>

//             <Card className="shadow-lg animate-fade-in">
//               <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-800 dark:to-gray-800 rounded-t-lg">
//                 <CardTitle className="text-[#00356B] dark:text-white flex items-center gap-2">
//                   <Users className="h-5 w-5" />
//                   Information
//                 </CardTitle>
//               </CardHeader>
//               <CardBody>
//                 <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
//                   <li className="flex items-start gap-2">
//                     <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
//                     <span>After creating the exam, you'll be redirected to add questions</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
//                     <span>Exam will start as "Draft" status</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
//                     <span>After adding questions, you can send it to admin for approval</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
//                     <span>You can edit the exam before sending for approval</span>
//                   </li>
//                 </ul>
//               </CardBody>
//             </Card>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get, _post } from '@/Helper';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Calendar, Clock, BookOpen, Users, Calculator, BookOpenCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import toast from 'react-hot-toast';

const examSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  commence_date: z.string().min(1, 'Commencement date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  subject_id: z.string().min(1, 'Subject is required'),
  class_id: z.string().min(1, 'Class is required'),
  section_id: z.string().optional(),
  allow_calculator: z.boolean().optional(),
  allow_dictionary: z.boolean().optional(),
  randomize_questions: z.boolean().optional(),
});

type ExamFormData = z.infer<typeof examSchema>;

export default function CreateExamPage() {
  const navigate = useNavigate();
  const { user, selected_branch } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  // Local state for fetched data
  const [sections, setSections] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [fetchingSections, setFetchingSections] = useState(false);
  const [fetchingClasses, setFetchingClasses] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      commence_date: formatDate(new Date(), 'yyyy-MM-dd'),
      allow_calculator: false,
      allow_dictionary: false,
      randomize_questions: false,
    },
  });

  const startTime = watch('start_time');
  const endTime = watch('end_time');

  // Fetch sections
  const fetchSections = useCallback(() => {
    if (!user?.school_id || !selected_branch?.branch_id) return;
    
    setFetchingSections(true);
    _get(
      `get-sections?query_type=select&school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
      (res) => {
        setFetchingSections(false);
        if (res.success && Array.isArray(res.data)) {
          setSections(res.data);
        } else {
          setSections([]);
        }
      },
      (err) => {
        setFetchingSections(false);
        console.error('Error fetching sections:', err);
        setSections([]);
      }
    );
  }, [user?.school_id, selected_branch?.branch_id]);

  // Fetch classes based on selected section
  const fetchClasses = useCallback(() => {
    if (!user?.school_id || !selected_branch?.branch_id) {
      setClasses([]);
      return;
    }

    if (!selectedSection || selectedSection === 'all') {
      setFetchingClasses(true);
      _get(
        `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
        (res) => {
          setFetchingClasses(false);
          if (res.success && Array.isArray(res.data)) {
            setClasses(res.data);
          } else {
            setClasses([]);
          }
        },
        (err) => {
          setFetchingClasses(false);
          console.error('Error fetching classes:', err);
          setClasses([]);
        }
      );
    } else {
      setFetchingClasses(true);
      _get(
        `classes?query_type=select-section-classes&section=${selectedSection}&school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
        (res) => {
          setFetchingClasses(false);
          if (res.success && Array.isArray(res.data)) {
            setClasses(res.data);
          } else {
            setClasses([]);
          }
        },
        (err) => {
          setFetchingClasses(false);
          console.error('Error fetching classes:', err);
          setClasses([]);
        }
      );
    }
  }, [selectedSection, user?.school_id, selected_branch?.branch_id]);

  // Fetch subjects based on selected class
  const fetchSubjects = useCallback(() => {
    if (!user?.school_id || !selectedClass || !selected_branch?.branch_id) {
      setSubjects([]);
      return;
    }

    setFetchingSubjects(true);
    _get(
      `subjects?query_type=select-section-subjects&class_code=${selectedClass}&school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
      (res) => {
        setFetchingSubjects(false);
        if (res.success && Array.isArray(res.data)) {
          setSubjects(res.data);
        } else {
          setSubjects([]);
        }
      },
      (err) => {
        setFetchingSubjects(false);
        console.error('Error fetching subjects:', err);
        toast.error(err.message || 'Failed to fetch subjects');
        setSubjects([]);
      }
    );
  }, [selectedClass, user?.school_id, selected_branch?.branch_id]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedClass, fetchSubjects]);

  const calculateDuration = useCallback(() => {
    if (!startTime || !endTime) return 0;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    let duration = endMinutes - startMinutes;
    if (duration < 0) duration += 24 * 60;

    setValue('duration', duration);
    return duration;
  }, [startTime, endTime, setValue]);

  const onSubmit = async (data: ExamFormData) => {
    if (!selected_branch?.branch_id) {
      toast.error('Please select a branch');
      return;
    }

    if (!user?.id) {
      toast.error('User information is missing');
      return;
    }

    setLoading(true);
    const duration = calculateDuration() || data.duration;
    
    const payload = {
      query_type: 'insert',
      assessment_type: data.title,
      description: data.description || '',
      instructions: data.instructions || '',
      commence_date: data.commence_date,
      start_time: data.start_time,
      end_time: data.end_time,
      duration: duration,
      subject_id: data.subject_id,
      class_id: data.class_id,
      section_id: data.section_id || '',
      branch_id: selected_branch.branch_id,
      school_id: user.school_id,
      teacher_id: user.id,
      status: 'Draft',
      total_marks: 0,
      total_questions: 0,
      allow_calculator: Boolean(data.allow_calculator),
      allow_dictionary: Boolean(data.allow_dictionary),
      randomize_questions: Boolean(data.randomize_questions),
      randomize_options: false,
    };

    _post(
      'examinations',
      payload,
      (res) => {
        setLoading(false);
        if (res.success && res.data) {
          const examId = res.data.id || res.data.exam_id || res.data[0]?.id || res.data[0]?.exam_id;
          toast.success('Exam created successfully!');
          navigate(`/exams/${examId}/questions`);
        } else {
          toast.error(res.message || 'Failed to create exam');
        }
      },
      (err) => {
        setLoading(false);
        console.error('Error creating exam:', err);
        toast.error(err.message || 'An error occurred while creating the exam');
      }
    );
  };
    return (
    <div className="space-y-6 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/exams')}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Button>
          <h1 className="text-3xl font-bold text-[#00356B] dark:text-white">Create New Exam</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fill in the exam details below. You'll add questions after creating the exam.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* الحاوية اليسرى الأساسية */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information Card */}
            <Card className="shadow-lg bg-white dark:bg-gray-800 border-none rounded-xl">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-700 dark:to-gray-700 rounded-t-xl border-b dark:border-gray-700">
                <CardTitle className="text-[#00356B] dark:text-gray-100 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#00356B] dark:text-gray-200" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                    Exam Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="e.g., First Term Mathematics Examination"
                    className={`rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Optional description for internal use"
                    rows={3}
                    className="rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-gray-700 dark:text-gray-300">Instructions for Students</Label>
                  <Textarea
                    id="instructions"
                    {...register('instructions')}
                    placeholder="Instructions that will be shown to students before they start the exam"
                    rows={4}
                    className="rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    These instructions will be displayed to students before they begin the exam.
                  </p>
                </div>

                {/* Section Selection */}
                <div className="space-y-2">
                  <Label htmlFor="section_id" className="text-gray-700 dark:text-gray-300">
                    Section <span className="text-gray-500 dark:text-gray-400 text-xs">(Optional - helps filter classes)</span>
                  </Label>
                  <Select
                    value={selectedSection}
                    onValueChange={(value) => {
                      setSelectedSection(value === 'all' ? '' : value);
                      setValue('section_id', value === 'all' ? '' : value);
                      setSelectedClass('');
                      setValue('class_id', '');
                      setSelectedSubject('');
                      setValue('subject_id', '');
                    }}
                    disabled={fetchingSections}
                  >
                    <SelectTrigger className="rounded-lg dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder={fetchingSections ? "Loading sections..." : "Select section (optional)"} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map((section: any) => (
                        <SelectItem
                          key={section.section_id || section.id || section.section_name}
                          value={section.section_name || section.section_id}
                        >
                          {section.section_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fetchingSections && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Loading sections...</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Class Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="class_id" className="text-gray-700 dark:text-gray-300">
                      Class <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedClass}
                      onValueChange={(value) => {
                        setSelectedClass(value);
                        setValue('class_id', value);
                        setSelectedSubject('');
                        setValue('subject_id', '');
                      }}
                      disabled={fetchingClasses}
                    >
                      <SelectTrigger className="rounded-lg dark:border-gray-700 text-gray-900 dark:text-white">
                        <SelectValue placeholder={fetchingClasses ? "Loading classes..." : "Select class"} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {classes.map((cls: any) => (
                          <SelectItem
                            key={cls.class_code || cls.class_id || cls.id}
                            value={cls.class_code || cls.class_id || cls.id}
                          >
                            {cls.class_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.class_id && (
                      <p className="text-sm text-red-500">{errors.class_id.message}</p>
                    )}
                  </div>
                  {/* Subject Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="subject_id" className="text-gray-700 dark:text-gray-300">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedSubject}
                      onValueChange={(value) => {
                        setSelectedSubject(value);
                        setValue('subject_id', value);
                      }}
                      disabled={!selectedClass || fetchingSubjects}
                    >
                      <SelectTrigger className="rounded-lg dark:border-gray-700 text-gray-900 dark:text-white">
                        <SelectValue 
                          placeholder={
                            fetchingSubjects 
                              ? "Loading subjects..." 
                              : selectedClass 
                                ? "Select subject" 
                                : "Select class first"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {subjects.map((subject: any) => (
                          <SelectItem
                            key={subject.subject_code || subject.subject_id || subject.id}
                            value={subject.subject_code || subject.subject_id || subject.id}
                            className="text-[#00356B] dark:text-white"
                          >
                            {subject.subject || subject.subject_name || subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject_id && (
                      <p className="text-sm text-red-500">{errors.subject_id.message}</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Schedule & Timing Card */}
            <Card className="shadow-lg bg-white dark:bg-gray-800 border-none rounded-xl">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-700 dark:to-gray-700 rounded-t-xl border-b dark:border-gray-700">
                <CardTitle className="text-[#00356B] dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule & Timing
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="commence_date" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4" />
                    Commencement Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="commence_date"
                    type="date"
                    {...register('commence_date')}
                    min={formatDate(new Date(), 'yyyy-MM-dd')}
                    className={`rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white ${errors.commence_date ? 'border-red-500' : ''}`}
                  />
                  {errors.commence_date && (
                    <p className="text-sm text-red-500">{errors.commence_date.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="h-4 w-4" />
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="start_time"
                      type="time"
                      {...register('start_time')}
                      onChange={(e) => {
                        setValue('start_time', e.target.value);
                        calculateDuration();
                      }}
                      className={`rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white ${errors.start_time ? 'border-red-500' : ''}`}
                    />
                    {errors.start_time && (
                      <p className="text-sm text-red-500">{errors.start_time.message}</p>
                    )}
                  </div>
                  {/* حقل وقت النهاية وحساب المدة */}
                  <div className="space-y-2">
                    <Label htmlFor="end_time" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="h-4 w-4" />
                      End Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="end_time"
                      type="time"
                      {...register('end_time')}
                      onChange={(e) => {
                        setValue('end_time', e.target.value);
                        calculateDuration();
                      }}
                      className={`rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white ${errors.end_time ? 'border-red-500' : ''}`}
                    />
                    {errors.end_time && (
                      <p className="text-sm text-red-500">{errors.end_time.message}</p>
                    )}
                  </div>
                </div>

                {startTime && endTime && calculateDuration() > 0 && (
                  <div className="p-4 border-2 border-[#00356B] dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/30 text-[#00356B] dark:text-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#00356B] dark:text-gray-300" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Exam Duration</p>
                        <p className="text-lg font-bold text-[#00356B] dark:text-white">
                          {calculateDuration()} minutes ({Math.floor(calculateDuration() / 60)}h {calculateDuration() % 60}m)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Exam Settings Card */}
            <Card className="shadow-lg bg-white dark:bg-gray-800 border-none rounded-xl">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-700 dark:to-gray-700 rounded-t-xl border-b dark:border-gray-700">
                <CardTitle className="text-[#00356B] dark:text-white flex items-center gap-2">
                  <BookOpenCheck className="h-5 w-5" />
                  Exam Settings
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-4 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calculator className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <Label htmlFor="allow_calculator" className="text-base font-medium cursor-pointer text-gray-900 dark:text-white">Allow Calculator</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Students can use calculator during the exam</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="allow_calculator"
                      {...register('allow_calculator')}
                      className="w-5 h-5 text-[#00356B] rounded border-gray-300 dark:border-gray-700 focus:ring-[#00356B] bg-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <Label htmlFor="allow_dictionary" className="text-base font-medium cursor-pointer text-gray-900 dark:text-white">Allow Dictionary</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Students can use dictionary during the exam</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="allow_dictionary"
                      {...register('allow_dictionary')}
                      className="w-5 h-5 text-[#00356B] rounded border-gray-300 dark:border-gray-700 focus:ring-[#00356B] bg-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-blue-100 dark:border-blue-900/30 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <Label htmlFor="randomize_questions" className="text-base font-medium cursor-pointer text-gray-900 dark:text-white">Randomize Question Order</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Each student will see questions in a different random order</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">✓ Recommended for exam security</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="randomize_questions"
                      {...register('randomize_questions')}
                      className="w-5 h-5 text-[#00356B] rounded border-gray-300 dark:border-gray-700 focus:ring-[#00356B] bg-transparent"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          {/* الحاوية اليمنى للـ Sidebar */}
          <div className="space-y-6">
            
            {/* Actions Card */}
            <Card className="shadow-lg bg-white dark:bg-gray-800 border-none rounded-xl sticky top-6">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-700 dark:to-gray-700 rounded-t-xl border-b dark:border-gray-700">
                <CardTitle className="text-[#00356B] dark:text-white">Actions</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3 p-5">
                <Button
                  type="submit"
                  className="w-full bg-[#00356B] text-white hover:bg-[#00254B]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Exam
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 text-[#00356B] dark:text-white"
                  onClick={() => navigate('/exams')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </CardBody>
            </Card>

            {/* Information Card */}
            <Card className="shadow-lg bg-white dark:bg-gray-800 border-none rounded-xl">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-background-100 dark:from-gray-700 dark:to-gray-700 rounded-t-xl border-b dark:border-gray-700">
                <CardTitle className="text-[#00356B] dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Information
                </CardTitle>
              </CardHeader>
              <CardBody className="p-5">
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                    <span>After creating the exam, you'll be redirected to add questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                    <span>Exam will start as "Draft" status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                    <span>After adding questions, you can send it to admin for approval</span>
                  </li>
                </ul>
              </CardBody>
            </Card>

          </div> {/* إغلاق شريط الحاوية الجانبية Sidebar Area */}
        </div> {/* إغلاق شبكة العرض grid الرئيسية */}
      </form>
    </div>
  );
}
