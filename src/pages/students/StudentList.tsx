// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { _get, _post, _delete } from '@/Helper';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Users, 
//   UserPlus, 
//   Upload, 
//   Search, 
//   Grid3x3, 
//   List, 
//   MoreVertical, 
//   Edit, 
//   Trash2, 
//   Eye,
//   RefreshCw,
//   User,
//   BarChart3,
//   Filter,
//   Loader2
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import AddStudentModal from './AddStudentModal';

// interface Student {
//   admission_no: string;
//   student_name: string;
//   first_name?: string;
//   surname?: string;
//   sex: string;
//   class_name?: string;
//   current_class?: string;
//   section?: string;
//   status: string;
//   profile_picture?: string;
//   class_code?: string;
// }

// const statusOptions = [
//   { label: 'All', value: 'All' },
//   { label: 'Active', value: 'Active' },
//   { label: 'Inactive', value: 'Inactive' },
//   { label: 'Suspended', value: 'Suspended' },
//   { label: 'Withdrawn', value: 'Withdrawn' },
//   { label: 'Transferred', value: 'Transferred' },
//   { label: 'Graduated', value: 'Graduated' },
//   { label: 'Expelled', value: 'Expelled' },
// ];

// export default function StudentList() {
//   const { user, selected_branch, sections: storeSections, classes: storeClasses } = useAuthStore();
  
//   const [students, setStudents] = useState<Student[]>([]);
//   const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [sections, setSections] = useState<any[]>([]);
//   const [classes, setClasses] = useState<any[]>([]);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
//   const [showStats, setShowStats] = useState(true);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
//   const [statusLoading, setStatusLoading] = useState(false);
//   const [newStatus, setNewStatus] = useState<string>('');
  
//   // Filters
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedSection, setSelectedSection] = useState<string>('all');
//   const [selectedClass, setSelectedClass] = useState<string>('all');
//   const [selectedStatus, setSelectedStatus] = useState<string>('Active');

//   // Fetch sections
//   const fetchSections = useCallback(() => {
//     if (!user?.school_id) return;
    
//     _get(
//       `get-sections?query_type=select&school_id=${user.school_id}&branch_id=${selected_branch?.branch_id}`,
//       (res) => {
//         if (res.success && Array.isArray(res.data)) {
//           setSections(res.data);
//         } else if (storeSections && storeSections.length > 0) {
//           setSections(storeSections);
//         }
//       },
//       (err) => {
//         console.error('Error fetching sections:', err);
//         if (storeSections && storeSections.length > 0) {
//           setSections(storeSections);
//         }
//       }
//     );
//   }, [user?.school_id, selected_branch?.branch_id, storeSections]);

//   // Fetch classes based on section
//   const fetchClasses = useCallback(() => {
//     if (!selectedSection || selectedSection === 'all' || !user?.school_id) {
//       setClasses([]);
//       return;
//     }

//     _get(
//       `classes?query_type=select-section-classes&section=${selectedSection}&school_id=${user.school_id}&branch_id=${selected_branch?.branch_id}`,
//       (res) => {
//         if (res.success && Array.isArray(res.data)) {
//           setClasses(res.data);
//         } else if (storeClasses && storeClasses.length > 0) {
//           // Filter store classes by section
//           const filtered = storeClasses.filter(
//             (cls: any) => (cls.section || '').toUpperCase() === selectedSection.toUpperCase()
//           );
//           setClasses(filtered);
//         }
//       },
//       (err) => {
//         console.error('Error fetching classes:', err);
//         if (storeClasses && storeClasses.length > 0) {
//           const filtered = storeClasses.filter(
//             (cls: any) => (cls.section || '').toUpperCase() === selectedSection.toUpperCase()
//           );
//           setClasses(filtered);
//         }
//       }
//     );
//   }, [selectedSection, user?.school_id, selected_branch?.branch_id, storeClasses]);

//   // Fetch students
//   const fetchStudents = useCallback(() => {
//     if (!selected_branch?.branch_id) return;

//     setLoading(true);
//     let url = '';

//     if (selectedClass && selectedClass !== 'all') {
//       url = `students?query_type=select-class&current_class=${selectedClass}&class_code=${selectedClass}&branch_id=${selected_branch.branch_id}`;
//     } else if (selectedSection && selectedSection !== 'all') {
//       url = `students?query_type=search&section=${selectedSection}&branch_id=${selected_branch.branch_id}`;
//     } else {
//       url = `students?query_type=select-all&branch_id=${selected_branch.branch_id}`;
//     }

//     if (selectedStatus && selectedStatus !== 'All') {
//       url += `&status=${selectedStatus}`;
//     }

//     _get(
//       url,
//       (res) => {
//         setLoading(false);
//         if (res.success && Array.isArray(res.data)) {
//           setStudents(res.data);
//         } else if (Array.isArray(res.data)) {
//           setStudents(res.data);
//         } else {
//           setStudents([]);
//         }
//       },
//       (err) => {
//         setLoading(false);
//         console.error('Error fetching students:', err);
//         toast.error('Failed to fetch students');
//         setStudents([]);
//       }
//     );
//   }, [selected_branch?.branch_id, selectedClass, selectedSection, selectedStatus]);

//   useEffect(() => {
//     fetchSections();
//   }, [fetchSections]);

//   useEffect(() => {
//     fetchClasses();
//   }, [fetchClasses]);

//   useEffect(() => {
//     fetchStudents();
//   }, [fetchStudents]);

//   // Filter students by search query
//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setFilteredStudents(students);
//       return;
//     }

//     const query = searchQuery.toLowerCase();
//     const filtered = students.filter(
//       (student) =>
//         student.student_name?.toLowerCase().includes(query) ||
//         student.admission_no?.toLowerCase().includes(query) ||
//         student.first_name?.toLowerCase().includes(query) ||
//         student.surname?.toLowerCase().includes(query)
//     );
//     setFilteredStudents(filtered);
//   }, [searchQuery, students]);

//   // Calculate statistics
//   const stats = useMemo(() => {
//     const total = filteredStudents.length;
//     const male = filteredStudents.filter((s) => {
//       const gender = (s.sex || '').charAt(0).toUpperCase();
//       return gender === 'M';
//     }).length;
//     const female = filteredStudents.filter((s) => {
//       const gender = (s.sex || '').charAt(0).toUpperCase();
//       return gender === 'F';
//     }).length;
//     const other = total - male - female;

//     const statusCounts: Record<string, number> = {};
//     filteredStudents.forEach((s) => {
//       const status = s.status || 'Active';
//       statusCounts[status] = (statusCounts[status] || 0) + 1;
//     });

//     return { total, male, female, other, statusCounts };
//   }, [filteredStudents]);

//   const getStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       Active: 'bg-green-500',
//       Inactive: 'bg-gray-500',
//       Suspended: 'bg-yellow-500',
//       Withdrawn: 'bg-orange-500',
//       Transferred: 'bg-blue-500',
//       Graduated: 'bg-purple-500',
//       Expelled: 'bg-red-500',
//     };
//     return colors[status] || 'bg-gray-500';
//   };

//   const handleStatusChange = () => {
//     if (!selectedStudent || !newStatus) return;

//     setStatusLoading(true);
//     _post(
//       'students',
//       {
//         query_type: 'update',
//         admission_no: selectedStudent.admission_no,
//         status: newStatus,
//         updated_by: user?.user_id,
//         branch_id: selected_branch?.branch_id,
//       },
//       (res) => {
//         setStatusLoading(false);
//         if (res.success) {
//           toast.success('Student status updated successfully');
//           setShowStatusModal(false);
//           setSelectedStudent(null);
//           setNewStatus('');
//           fetchStudents();
//         } else {
//           toast.error(res.message || 'Failed to update status');
//         }
//       },
//       (err) => {
//         setStatusLoading(false);
//         toast.error('Network error. Please try again.');
//         console.error(err);
//       }
//     );
//   };

//   const handleDelete = (student: Student) => {
//     if (!confirm(`Are you sure you want to delete ${student.student_name}? This action cannot be undone.`)) {
//       return;
//     }

//     _post(
//       'students/soft-delete',
//       {
//         admission_no: student.admission_no,
//         deleted_by: user?.user_id,
//         branch_id: selected_branch?.branch_id,
//         school_id: user?.school_id,
//         reason: 'Student deleted by admin',
//       },
//       (res) => {
//         if (res.success) {
//           toast.success(`Student ${student.student_name} has been deleted successfully`);
//           fetchStudents();
//         } else {
//           toast.error(res.message || 'Failed to delete student');
//         }
//       },
//       (err) => {
//         toast.error('Network error. Please try again.');
//         console.error('Delete error:', err);
//       }
//     );
//   };

//   const clearFilters = () => {
//     setSearchQuery('');
//     setSelectedSection('all');
//     setSelectedClass('all');
//     setSelectedStatus('Active');
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-[#00356B] dark:text-white mb-2">Student Management</h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             Manage and organize all students in your school
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             onClick={() => setShowAddModal(true)}
//             className="gap-2 border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-[#00356B] dark:text-white"
//           >
//             <Upload className="h-4 w-4" />
//             Bulk Upload
//           </Button>
//           <Button
//             onClick={() => setShowAddModal(true)}
//             className="gap-2"
//           >
//             <UserPlus className="h-4 w-4" />
//             Add Student
//           </Button>
//         </div>
//       </div>

//       {/* Statistics */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <Card className="p-4 hover:shadow-card-hover transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
//                 <p className="text-2xl font-bold text-[#00356B] dark:text-white">{stats.total}</p>
//               </div>
//               <Users className="h-8 w-8 text-[#00356B] dark:text-white" />
//             </div>
//           </Card>
//           <Card className="p-4 hover:shadow-card-hover transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Male</p>
//                 <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.male}</p>
//               </div>
//               <User className="h-8 w-8 text-blue-500" />
//             </div>
//           </Card>
//           <Card className="p-4 hover:shadow-card-hover transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Female</p>
//                 <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.female}</p>
//               </div>
//               <User className="h-8 w-8 text-pink-500" />
//             </div>
//           </Card>
//           <Card className="p-4 hover:shadow-card-hover transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Other</p>
//                 <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.other}</p>
//               </div>
//               <User className="h-8 w-8 text-gray-500" />
//             </div>
//           </Card>
//         </div>

//       {/* Filters and Controls */}
//       <Card className="p-4">
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* View Mode Toggle */}
//           <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
//             <Button
//               variant={viewMode === 'list' ? 'default' : 'ghost'}
//               size="sm"
//               onClick={() => setViewMode('list')}
//               className={`gap-2 ${viewMode === 'list' ? 'shadow-sm' : ''}`}
//             >
//               <List className="h-4 w-4" />
//               List
//             </Button>
//             <Button
//               variant={viewMode === 'grid' ? 'default' : 'ghost'}
//               size="sm"
//               onClick={() => setViewMode('grid')}
//               className={`gap-2 ${viewMode === 'grid' ? 'shadow-sm' : ''}`}
//             >
//               <Grid3x3 className="h-4 w-4" />
//               Grid
//             </Button>
//             <Button
//               variant={showStats ? 'default' : 'ghost'}
//               size="sm"
//               onClick={() => setShowStats(!showStats)}
//               className={`gap-2 ${showStats ? 'shadow-sm' : ''}`}
//             >
//               <BarChart3 className="h-4 w-4" />
//               Stats
//             </Button>
//           </div>

//           {/* Filters */}
//           <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
//             <div>
//               <Label htmlFor="section">Section</Label>
//               <Select value={selectedSection} onValueChange={setSelectedSection} >
//                 <SelectTrigger id="section">
//                   <SelectValue placeholder="All Sections" />
//                 </SelectTrigger>
//                 <SelectContent >
//                   <SelectItem value="all" >All Sections</SelectItem>
//                   {sections.map((sec) => (
//                     <SelectItem key={sec.section_id || sec.section_name} value={sec.section_name || sec.section_id}>
//                       {sec.section_name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="class">Class</Label>
//               <Select 
//                 value={selectedClass} 
//                 onValueChange={setSelectedClass}
//                 disabled={!selectedSection || selectedSection === 'all'}
//               >
//                 <SelectTrigger id="class">
//                   <SelectValue placeholder="All Classes" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Classes</SelectItem>
//                   {classes.map((cls) => (
//                     <SelectItem key={cls.class_code} value={cls.class_code}>
//                       {cls.class_name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="status">Status</Label>
//               <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                 <SelectTrigger id="status">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {statusOptions.map((status) => (
//                     <SelectItem key={status.value} value={status.value}>
//                       {status.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="search">Search</Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="search"
//                   placeholder="Search by name or admission no..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>

//             <div className="flex items-end">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={clearFilters}
//                 className="w-full gap-2 border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-[#00356B] dark:text-white"
//                 disabled={searchQuery === '' && selectedSection === 'all' && selectedClass === 'all' && selectedStatus === 'Active'}
//               >
//                 <Filter className="h-4 w-4" />
//                 Clear Filters
//               </Button>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* Students List/Grid */}
//       {loading ? (
//         <Card className="p-12 text-center">
//           <div className="flex flex-col items-center gap-4">
//             <RefreshCw className="h-8 w-8 animate-spin text-primary-500" />
//             <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
//           </div>
//         </Card>
//       ) : filteredStudents.length === 0 ? (
//         <Card className="p-12 text-center">
//           <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white mb-2">
//             No Students Found
//           </h3>
//           <p className="text-gray-600 dark:text-gray-400 mb-4">
//             {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first student'}
//           </p>
//           <Button className='bg-[#00356B] text-white dark:bg-[#00356B] dark:text-white' onClick={() => setShowAddModal(true)}>
//             <UserPlus className="h-4 w-4 mr-2" />
//             Add Student
//           </Button>
//         </Card>
//       ) : viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {filteredStudents.map((student) => (
//             <Card key={student.admission_no} className="p-4 hover:shadow-card-hover transition-shadow">
//               <div className="flex items-start justify-between mb-3">
//                 <div className="flex items-center gap-3">
//                   <div className="h-12 w-12 rounded-full bg-[#00356B]/20 dark:bg-[#00356B] flex items-center justify-center">
//                     {student.profile_picture ? (
//                       <img
//                         src={student.profile_picture}
//                         alt={student.student_name}
//                         className="h-12 w-12 rounded-full object-cover"
//                       />
//                     ) : (
//                       <User className="h-6 w-6 text-[#00356B] dark:text-white" />
//                     )}
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 dark:text-white">
//                       {student.student_name}
//                     </h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {student.admission_no}
//                     </p>
//                   </div>
//                 </div>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" size="icon" className="h-8 w-8">
//                       <MoreVertical className="h-4 w-4 text-[#00356B] dark:text-white" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className='bg-white dark:bg-gray-900 text-[#00356B] dark:text-white'>
//                     <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
//                       <Edit className="h-4 w-4 mr-2" />
//                       Edit
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => setShowStatusModal(true)}>
//                       <RefreshCw className="h-4 w-4 mr-2" />
//                       Update Status
//                     </DropdownMenuItem>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem
//                       onClick={() => handleDelete(student)}
//                       className="text-red-600 dark:text-red-400"
//                     >
//                       <Trash2 className="h-4 w-4 mr-2" />
//                       Delete
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-gray-600 dark:text-gray-400">Class:</span>
//                   <Badge variant="outline" className='border-2 border-[#00356B] dark:border-white/30 text-gray-900 dark:text-white'>{student.class_name || student.current_class || 'N/A'}</Badge>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-gray-600 dark:text-gray-400">Gender:</span>
//                     <span className="p-4 text-gray-600 dark:text-gray-400">{student.sex || 'N/A'}</span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-gray-600 dark:text-gray-400">Status:</span>
//                   <Badge className={getStatusColor(student.status)}>
//                     {student.status || 'Active'}
//                   </Badge>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <Card>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200 dark:border-gray-700">
//                   <th className="text-left p-4 font-semibold text-[#00356B] dark:text-white">Student</th>
//                   <th className="text-left p-4 font-semibold text-[#00356B] dark:text-white">Admission No</th>
//                   <th className="text-left p-4 font-semibold text-[#00356B] dark:text-white">Class</th>
//                   <th className="text-left p-4 font-semibold text-[#00356B] dark:text-white">Gender</th>
//                   <th className="text-left p-4 font-semibold text-[#00356B] dark:text-white">Status</th>
//                   <th className="text-right p-4 font-semibold text-[#00356B] dark:text-white">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredStudents.map((student) => (
//                   <tr
//                     key={student.admission_no}
//                     className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                   >
//                     <td className="p-4">
//                       <div className="flex items-center gap-3">
//                         <div className="h-10 w-10 rounded-full bg-[#00356B]/20 dark:bg-[#00356B]/20 flex items-center justify-center">
//                           {student.profile_picture ? (
//                             <img
//                               src={student.profile_picture}
//                               alt={student.student_name}
//                               className="h-10 w-10 rounded-full object-cover"
//                             />
//                           ) : (
//                             <User className="h-5 w-5 text-[#00356B] dark:text-white/50" />
//                           )}
//                         </div>
//                         <span className="font-medium text-gray-900 dark:text-white truncate">
//                           {student.student_name}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="p-4 text-gray-600 dark:text-gray-400">{student.admission_no}</td>
//                     <td className="p-4">
//                       <Badge variant="outline" className='border-2 border-[#00356B] dark:border-white/30 text-gray-900 dark:text-white'>{student.class_name || student.current_class || 'N/A'}</Badge>
//                     </td>
//                     <td className="p-4 text-gray-600 dark:text-gray-400">{student.sex || 'N/A'}</td>
//                     <td className="p-4">
//                       <Badge className={getStatusColor(student.status)}>
//                         {student.status || 'Active'}
//                       </Badge>
//                     </td>
//                     <td className="p-4">
//                       <div className="flex justify-end">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="h-8 w-8">
//                               <MoreVertical className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent 
//                           className='text-[#00356B] dark:text-white border-2 border-[#00356B] dark:border-white/30 bg-white dark:bg-[#00356B]'
//                           align="end">
//                             <DropdownMenuItem 
//                             onClick={() => {
//                               setSelectedStudent(student);
//                               setShowAddModal(true);
//                             }}>
//                               <Edit className="h-4 w-4 mr-2" />
//                               Edit
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => {
//                               setSelectedStudent(student);
//                               setShowStatusModal(true);
//                             }}>
//                               <RefreshCw className="h-4 w-4 mr-2" />
//                               Update Status
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem
//                               onClick={() => handleDelete(student)}
//                               className="text-red-600 dark:text-red-400"
//                             >
//                               <Trash2 className="h-4 w-4 mr-2" />
//                               Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </Card>
//       )}

//       {/* Add/Edit Student Modal */}
//       <AddStudentModal
//         open={showAddModal}
//         onClose={() => {
//           setShowAddModal(false);
//           setSelectedStudent(null);
//         }}
//         student={selectedStudent}
//         onSuccess={() => {
//           fetchStudents();
//           setShowAddModal(false);
//           setSelectedStudent(null);
//         }}
//       />

//       {/* Status Change Modal */}
//       <Dialog open={showStatusModal} onOpenChange={(open) => {
//         setShowStatusModal(open);
//         if (!open) {
//           setSelectedStudent(null);
//           setNewStatus('');
//         }
//       }}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Change Student Status</DialogTitle>
//             <DialogDescription>
//               Update the status for {selectedStudent?.student_name}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <div>
//               <Label htmlFor="new-status">Select Status</Label>
//               <Select
//                 value={newStatus || selectedStudent?.status || 'Active'}
//                 onValueChange={setNewStatus}
//               >
//                 <SelectTrigger id="new-status">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {statusOptions.filter(s => s.value !== 'All').map((status) => (
//                     <SelectItem key={status.value} value={status.value}>
//                       {status.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button 
//               variant="outline" 
//               onClick={() => {
//                 setShowStatusModal(false);
//                 setSelectedStudent(null);
//                 setNewStatus('');
//               }}
//               disabled={statusLoading}
//             >
//               Cancel
//             </Button>
//             <Button 
//               onClick={handleStatusChange}
//               disabled={statusLoading || !newStatus}
//             >
//               {statusLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Update Status
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get, _post } from '@/Helper';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  UserPlus, 
  Upload,
  Download,
  Search, 
  Grid3x3, 
  List, 
  MoreVertical, 
  Edit, 
  Trash2, 
  RefreshCw,
  User,
  BarChart3,
  Filter,
  Loader2,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  CheckCircle2,
  Plus,
  School,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AddStudentModal from './AddStudentModal';
import BulkStudentUploadModal from './BulkStudentUploadModal';
import { cn } from '@/lib/utils/cn';

interface Student {
  admission_no: string;
  student_name: string;
  first_name?: string;
  surname?: string;
  sex: string;
  class_name?: string;
  current_class?: string;
  section?: string;
  status: string;
  profile_picture?: string;
  class_code?: string;
}

const statusOptions = [
  { label: 'All', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Suspended', value: 'Suspended' },
  { label: 'Withdrawn', value: 'Withdrawn' },
  { label: 'Transferred', value: 'Transferred' },
  { label: 'Graduated', value: 'Graduated' },
  { label: 'Expelled', value: 'Expelled' },
];
export default function StudentList() {
  const { user, selected_branch, sections: storeSections, classes: storeClasses } = useAuthStore();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showStats, setShowStats] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');

  // Fetch sections repository link
  const fetchSections = useCallback(() => {
    if (!user?.school_id) return;
    
    _get(
      `get-sections?query_type=select&school_id=${user.school_id}&branch_id=${selected_branch?.branch_id}`,
      (res) => {
        if (res.success && Array.isArray(res.data)) {
          setSections(res.data);
        } else if (storeSections && storeSections.length > 0) {
          setSections(storeSections);
        }
      },
      (err) => {
        console.error('Error fetching sections:', err);
        if (storeSections && storeSections.length > 0) {
          setSections(storeSections);
        }
      }
    );
  }, [user?.school_id, selected_branch?.branch_id, storeSections]);

  // Fetch classes based on chosen section log — always from API
  const fetchClasses = useCallback(() => {
    if (!user?.school_id || !selected_branch?.branch_id) {
      setClasses([]);
      return;
    }

    const url = selectedSection && selectedSection !== 'all'
      ? `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}&section=${selectedSection}`
      : `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`;

    _get(
      url,
      (res) => {
        if (res.success && Array.isArray(res.data)) {
          const mainClasses = res.data.filter((c: any) => !c.parent_id);
          const filtered = selectedSection && selectedSection !== 'all'
            ? mainClasses.filter((c: any) => (c.section || '').toUpperCase() === selectedSection.toUpperCase())
            : mainClasses;
          setClasses(filtered);
        } else {
          setClasses([]);
        }
      },
      (err) => {
        console.error('Error fetching classes:', err);
        setClasses([]);
      }
    );
  }, [selectedSection, user?.school_id, selected_branch?.branch_id]);

  // Fetch students dataset profile logs
  const fetchStudents = useCallback(() => {
    if (!selected_branch?.branch_id) return;

    setLoading(true);
    let url = '';

    if (selectedClass && selectedClass !== 'all') {
      url = `students?query_type=select-class&current_class=${selectedClass}&class_code=${selectedClass}&branch_id=${selected_branch.branch_id}`;
    } else if (selectedSection && selectedSection !== 'all') {
      url = `students?query_type=search&section=${selectedSection}&branch_id=${selected_branch.branch_id}`;
    } else {
      url = `students?query_type=select-all&branch_id=${selected_branch.branch_id}`;
    }

    if (selectedStatus && selectedStatus !== 'All') {
      url += `&status=${selectedStatus}`;
    }

    _get(
      url,
      (res) => {
        setLoading(false);
        if (res.success && Array.isArray(res.data)) {
          setStudents(res.data);
        } else if (Array.isArray(res.data)) {
          setStudents(res.data);
        } else {
          setStudents([]);
        }
      },
      (err) => {
        setLoading(false);
        console.error('Error fetching students:', err);
        toast.error('Failed to fetch students');
        setStudents([]);
      }
    );
  }, [selected_branch?.branch_id, selectedClass, selectedSection, selectedStatus]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Search filtering hook calculation
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.student_name?.toLowerCase().includes(query) ||
        student.admission_no?.toLowerCase().includes(query) ||
        student.first_name?.toLowerCase().includes(query) ||
        student.surname?.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);
  // Calculate dynamic statistics via memo hook
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const male = filteredStudents.filter((s) => {
      const gender = (s.sex || '').charAt(0).toUpperCase();
      return gender === 'M';
    }).length;
    const female = filteredStudents.filter((s) => {
      const gender = (s.sex || '').charAt(0).toUpperCase();
      return gender === 'F';
    }).length;
    const other = total - male - female;

    const statusCounts: Record<string, number> = {};
    filteredStudents.forEach((s) => {
      const status = s.status || 'Active';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return { total, male, female, other, statusCounts };
  }, [filteredStudents]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: 'bg-emerald-500 hover:bg-emerald-600 border-none text-white',
      Inactive: 'bg-gray-400 hover:bg-gray-500 border-none text-white',
      Suspended: 'bg-amber-500 hover:bg-amber-600 border-none text-white',
      Withdrawn: 'bg-orange-500 hover:bg-orange-600 border-none text-white',
      Transferred: 'bg-blue-500 hover:bg-blue-600 border-none text-white',
      Graduated: 'bg-purple-500 hover:bg-purple-600 border-none text-white',
      Expelled: 'bg-rose-500 hover:bg-rose-600 border-none text-white',
    };
    return colors[status] || 'bg-gray-400 border-none text-white';
  };

  // Dispatch student record status alteration logs
  const handleStatusChange = () => {
    if (!selectedStudent || !newStatus) return;

    setStatusLoading(true);
    _post(
      'students',
      {
        query_type: 'update',
        admission_no: selectedStudent.admission_no,
        status: newStatus,
        updated_by: user?.user_id,
        branch_id: selected_branch?.branch_id,
      },
      (res) => {
        setStatusLoading(false);
        if (res.success) {
          toast.success('Student status updated successfully');
          setShowStatusModal(false);
          setSelectedStudent(null);
          setNewStatus('');
          fetchStudents();
        } else {
          toast.error(res.message || 'Failed to update status');
        }
      },
      (err) => {
        setStatusLoading(false);
        toast.error('Network error. Please try again.');
        console.error(err);
      }
    );
  };

  // Student soft deletion diagnostic wrapper
  const handleDelete = (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.student_name}? This action cannot be undone.`)) {
      return;
    }

    _post(
      'students/soft-delete',
      {
        admission_no: student.admission_no,
        deleted_by: user?.user_id,
        branch_id: selected_branch?.branch_id,
        school_id: user?.school_id,
        reason: 'Student deleted by admin',
      },
      (res) => {
        if (res.success) {
          toast.success(`Student ${student.student_name} has been deleted successfully`);
          fetchStudents();
        } else {
          toast.error(res.message || 'Failed to delete student');
        }
      },
      (err) => {
        toast.error('Network error. Please try again.');
        console.error('Delete error:', err);
      }
    );
  };

  // 1. اذهبي إلى دالة clearFilters وقومي باستبدالها مع بداية الـ return بهذا المقطع المحكم تماماً:

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSection('all');
    setSelectedClass('all');
    setSelectedStatus('Active');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Action Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[#002a56] dark:text-white tracking-tight">Student Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage, verify metadata profiles, and organize candidate tracking structures.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setShowBulkUploadModal(true)}
            className="rounded-xl text-xs font-bold h-10 border-none bg-white hover:bg-gray-50 text-gray-700 shadow dark:bg-gray-900 dark:text-gray-200 gap-1.5 px-4"
          >
            <Upload className="h-4 w-4 text-gray-400" />
            Bulk Upload Manifest
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl text-xs font-bold h-10 bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90 gap-1.5 shadow-sm px-4 border-none"
          >
            <UserPlus className="h-4 w-4" />
            Add Single Student
          </Button>
        </div>
      </div>
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
            <CardBody className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Students</p>
                <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">{stats.total}</p>
              </div>
              <div className="p-3 bg-[#002a56]/5 dark:bg-sky-500/10 rounded-xl text-[#002a56] dark:text-sky-400"><Users className="h-5 w-5" /></div>
            </CardBody>
          </Card>

          <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
            <CardBody className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Male</p>
                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{stats.male}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500"><User className="h-5 w-5" /></div>
            </CardBody>
          </Card>

          <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
            <CardBody className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Female</p>
                <p className="text-2xl font-extrabold text-pink-600 dark:text-pink-400">{stats.female}</p>
              </div>
              <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-xl text-pink-500"><User className="h-5 w-5" /></div>
            </CardBody>
          </Card>

          <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
            <CardBody className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Active Students</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.statusCounts['Active'] || 0}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500"><Users className="h-5 w-5" /></div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Control Box Panel Filters and Grid/List Mode Toggle */}
      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
        <CardBody className="p-5 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-800 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Filtering Engine</h3>
              <p className="text-xs text-gray-400">Sort target parameters or adjust display configurations inside lists feed.</p>
            </div>
            
            {/* View Switching Button controls box */}
            <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl w-fit">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn("h-8 rounded-lg text-xs font-bold gap-1 px-3", viewMode === 'list' ? "bg-[#002a56] text-white shadow dark:bg-sky-600" : "text-gray-500")}
              >
                <List className="h-3.5 w-3.5" /> List Feed
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn("h-8 rounded-lg text-xs font-bold gap-1 px-3", viewMode === 'grid' ? "bg-[#002a56] text-white shadow dark:bg-sky-600" : "text-gray-500")}
              >
                <Grid3x3 className="h-3.5 w-3.5" /> Grid System
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className={cn("h-8 rounded-lg text-xs font-bold gap-1 px-3", showStats ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "text-gray-400")}
              >
                <BarChart3 className="h-3.5 w-3.5" /> Stats Card
              </Button>
            </div>
          </div>

          {/* Form Fields inputs select grid row elements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="section" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Academic Section</Label>
              <select
                id="section"
                value={selectedSection}
                onChange={(e) => { setSelectedSection(e.target.value); setSelectedClass('all'); }}
                className="w-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none rounded-xl px-3 py-2 h-10 outline-none focus:ring-1 focus:ring-[#002a56] cursor-pointer"
              >
                <option value="all">All Sections</option>
                {sections.map((sec) => (
                  <option key={sec.section_id || sec.section_name} value={sec.section_name || sec.section_id}>
                    {sec.section_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="class" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Target Class</Label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedSection || selectedSection === 'all'}
                className="w-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none rounded-xl px-3 py-2 h-10 outline-none focus:ring-1 focus:ring-[#002a56] disabled:opacity-40"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.class_code} value={cls.class_code}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status Badge</Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none rounded-xl px-3 py-2 h-10 outline-none focus:ring-1 focus:ring-[#002a56]"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="search" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Search Manifest</Label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Student name or index..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-xs border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="w-full h-10 text-xs font-bold gap-1.5 rounded-xl text-gray-500 hover:bg-gray-50"
                disabled={searchQuery === '' && selectedSection === 'all' && selectedClass === 'all' && selectedStatus === 'Active'}
              >
                <Filter className="h-3.5 w-3.5" /> Clear Filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card> 
              {/* 3. الجزء الثالث - أ: لوحة الإحصائيات الذكية وحالة تحميل البيانات */}
        
        {/* Stats Section Panel (Conditional Render) */}
        {/* {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
            <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
              <CardBody className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-[#002a56] dark:text-sky-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Total Filtered</p>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">{filteredStudents?.length || 0}</h4>
                </div>
              </CardBody>
            </Card>
          </div>
        )} */}

        {/* Loading and Empty State Handling */}
        {loading ? (
          <Card className="p-12 text-center border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading students...</p>
            </div>
          </Card>
        ) : !filteredStudents || filteredStudents.length === 0 ? (
          <Card className="p-12 text-center border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Students Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first student'}
            </p>
            <Button className='bg-[#00356B] text-white dark:bg-[#00356B] dark:text-white h-10 rounded-xl text-xs font-bold gap-1.5' onClick={() => setShowAddModal(true)}>
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          /* 3. الجزء الثالث - ب: العرض الشبكي المصمم بنظام البطاقات */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map((student) => (
              <Card key={student?.admission_no || student?.id} className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl hover:shadow-md transition-shadow p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[#00356B]/20 dark:bg-[#00356B] flex items-center justify-center overflow-hidden">
                      {student?.profile_picture ? (
                        <img
                          src={student.profile_picture}
                          alt={student?.student_name || 'Student'}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-[#00356B] dark:text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[120px]">
                        {student?.student_name || 'Unknown Student'}
                      </h3>
                      <p className="text-[10px] text-gray-400">
                        {student?.admission_no || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="h-4 w-4 text-[#00356B] dark:text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className='bg-white dark:bg-gray-900 text-[#00356B] dark:text-white rounded-xl shadow-lg border-gray-100 dark:border-gray-800'>
                      <DropdownMenuItem className="text-xs cursor-pointer gap-2" onClick={() => { setSelectedStudent(student); setShowAddModal(true); }}>
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs cursor-pointer gap-2 bg-blue-900 text-white" onClick={() => { setSelectedStudent(student); setShowStatusModal(true); }}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Update Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-50 dark:bg-gray-800" />
                      <DropdownMenuItem
                        onClick={() => handleDelete(student)}
                        className="text-red-600 dark:text-red-400 text-xs cursor-pointer gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Class:</span>
                    <Badge variant="outline" className='border border-[#00356B]/30 dark:border-white/30 text-gray-700 dark:text-white text-[10px] rounded-md'>{student?.class_name || student?.current_class || 'N/A'}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Gender:</span>
                    <span className="font-semibold text-gray-600 dark:text-gray-300 text-[11px]">{student?.sex || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Status:</span>
                    <Badge className={`${typeof getStatusColor === 'function' ? getStatusColor(student?.status) : 'bg-emerald-50 text-emerald-600'} text-[10px] rounded-md shadow-none border-none`}>
                      {student?.status || 'Active'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (


       

      
              /* 3. الجزء الثالث - ج: عرض القائمة التفاعلية كجدول منظم، متبوعاً بالنوافذ المنبثقة وإغلاق الملف */
          <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden border border-gray-100/50 dark:border-gray-800/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <th className="p-4 text-[10px] font-bold text-[#00356B] dark:text-white uppercase tracking-wider">Student</th>
                    <th className="p-4 text-[10px] font-bold text-[#00356B] dark:text-white uppercase tracking-wider">Admission No</th>
                    <th className="p-4 text-[10px] font-bold text-[#00356B] dark:text-white uppercase tracking-wider">Class</th>
                    <th className="p-4 text-[10px] font-bold text-[#00356B] dark:text-white uppercase tracking-wider">Gender</th>
                    <th className="p-4 text-[10px] font-bold text-[#00356B] dark:text-white uppercase tracking-wider">Status</th>
                    <th className="p-4 text-[10px] font-bold text-[#00356B] dark:text-white uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student?.admission_no || student?.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#00356B]/20 dark:bg-[#00356B]/20 flex items-center justify-center overflow-hidden">
                            {student?.profile_picture ? (
                              <img
                                src={student.profile_picture}
                                alt={student?.student_name || 'Student'}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-[#00356B] dark:text-white/50" />
                            )}
                          </div>
                          <span className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[150px]">
                            {student?.student_name || 'Unknown Student'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400">{student?.admission_no || 'N/A'}</td>
                      <td className="p-4">
                        <Badge variant="outline" className='border border-[#00356B]/30 dark:border-white/30 text-gray-700 dark:text-white text-[10px] rounded-md'>{student?.class_name || student?.current_class || 'N/A'}</Badge>
                      </td>
                      <td className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400">{student?.sex || 'N/A'}</td>
                      <td className="p-4">
                        <Badge className={`${typeof getStatusColor === 'function' ? getStatusColor(student?.status) : 'bg-emerald-50 text-emerald-600'} text-[10px] rounded-md shadow-none border-none`}>
                          {student?.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              className='text-[#00356B] dark:text-white border border-[#00356B]/20 dark:border-white/20 bg-white dark:bg-[#00356B] rounded-xl shadow-lg'
                              align="end"
                            >
                              <DropdownMenuItem 
                                className="text-xs cursor-pointer gap-2"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowAddModal(true);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-xs cursor-pointer gap-2"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowStatusModal(true);
                                }}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10" />
                              <DropdownMenuItem
                                onClick={() => handleDelete(student)}
                                className="text-red-600 dark:text-red-400 text-xs cursor-pointer gap-2"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Add/Edit Student Modal Component */}
        <AddStudentModal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          onSuccess={() => {
            if (typeof fetchStudents === 'function') fetchStudents();
            setShowAddModal(false);
            setSelectedStudent(null);
          }}
        />

        {/* Status Change Modal Dialog Box */}
        <Dialog open={showStatusModal} onOpenChange={(open) => {
          setShowStatusModal(open);
          if (!open) {
            setSelectedStudent(null);
            setNewStatus('');
          }
        }}>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">Change Student Status</DialogTitle>
              <DialogDescription className="text-xs text-gray-400">
                Update the active status configuration for {selectedStudent?.student_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-status" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Status</Label>
                <Select
                  value={newStatus || selectedStudent?.status || 'Active'}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger id="new-status" className="h-10 text-xs rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    {statusOptions?.filter(s => s.value !== 'All' && s.value !== 'all').map((status) => (
                      <SelectItem key={status.value} value={status.value} className="text-xs cursor-pointer">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="ghost" 
                className="h-10 text-xs font-bold rounded-xl text-gray-400"
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStudent(null);
                  setNewStatus('');
                }}
                disabled={statusLoading}
              >
                Cancel
              </Button>
              <Button 
                className="h-10 text-xs font-bold rounded-xl bg-[#002a56] hover:bg-[#002a56]/90 text-white"
                onClick={handleStatusChange}
                disabled={statusLoading || !newStatus}
              >
                {statusLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Update 
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Bulk Upload Modal */}
        {showBulkUploadModal && (
          <BulkStudentUploadModal
            open={showBulkUploadModal}
            onClose={() => setShowBulkUploadModal(false)}
            onSuccess={() => { setShowBulkUploadModal(false); fetchStudents(); }}
          />
        )}

      </div>
    );
}
