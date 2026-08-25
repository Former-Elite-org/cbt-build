// import { useState, useEffect, useCallback } from 'react';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Plus,
//   BookOpen,
//   Edit,
//   Trash2,
//   School,
//   ChevronDown,
//   ChevronRight,
//   X,
//   Check,
//   Eye,
//   EyeOff,
//   Settings,
// } from 'lucide-react';
// import { _get, _post } from '@/Helper';
// import toast from 'react-hot-toast';

// interface Subject {
//   subject: string;
//   section: string;
//   subject_code: string;
//   class_name: string;
//   class_code: string;
//   status: string;
//   type?: string;
// }

// interface ClassItem {
//   class_code: string;
//   class_name: string;
//   section: string;
// }

// interface Section {
//   section_id: string;
//   section_name: string;
// }

// const predefinedSubjects: Record<string, { name: string; type: string }[]> = {
//   Nursery: [
//     { name: 'English Language', type: 'core' },
//     { name: 'Mathematics', type: 'core' },
//     { name: 'Basic Science', type: 'core' },
//     { name: 'Social Studies', type: 'core' },
//     { name: 'Creative Arts', type: 'art' },
//     { name: 'Physical Education', type: 'health' },
//   ],
//   Primary: [
//     { name: 'English Language', type: 'core' },
//     { name: 'Mathematics', type: 'core' },
//     { name: 'Basic Science & Technology', type: 'science' },
//     { name: 'Social Studies', type: 'core' },
//     { name: 'Civic Education', type: 'core' },
//     { name: 'Agricultural Science', type: 'science' },
//     { name: 'Computer Studies', type: 'technology' },
//     { name: 'Creative Arts', type: 'art' },
//     { name: 'Physical & Health Education', type: 'health' },
//     { name: 'Home Economics', type: 'vocational' },
//     { name: 'Christian Religious Studies', type: 'selective' },
//     { name: 'Islamic Religious Studies', type: 'selective' },
//   ],
//   JSS: [
//     { name: 'English Studies', type: 'core' },
//     { name: 'Mathematics', type: 'core' },
//     { name: 'Basic Science', type: 'science' },
//     { name: 'Basic Technology', type: 'technology' },
//     { name: 'Business Studies', type: 'commercial' },
//     { name: 'Social Studies', type: 'core' },
//     { name: 'Civic Education', type: 'core' },
//     { name: 'Agricultural Science', type: 'science' },
//     { name: 'Computer Studies', type: 'technology' },
//     { name: 'Home Economics', type: 'vocational' },
//     { name: 'Creative Arts', type: 'art' },
//     { name: 'Physical & Health Education', type: 'health' },
//   ],
//   SS: [
//     { name: 'English Language', type: 'core' },
//     { name: 'Mathematics', type: 'core' },
//     { name: 'Physics', type: 'science' },
//     { name: 'Chemistry', type: 'science' },
//     { name: 'Biology', type: 'science' },
//     { name: 'Further Mathematics', type: 'science' },
//     { name: 'Agricultural Science', type: 'science' },
//     { name: 'Economics', type: 'commercial' },
//     { name: 'Accounting', type: 'commercial' },
//     { name: 'Commerce', type: 'commercial' },
//     { name: 'Literature-in-English', type: 'art' },
//     { name: 'Government', type: 'art' },
//     { name: 'History', type: 'art' },
//     { name: 'Geography', type: 'art' },
//     { name: 'Christian Religious Studies', type: 'selective' },
//     { name: 'Islamic Religious Studies', type: 'selective' },
//   ],
// };

// const getSubjectTypeColor = (type?: string): string => {
//   switch (type) {
//     case 'core': return 'default';
//     case 'science': return 'success';
//     case 'art': return 'warning';
//     case 'commercial': return 'default';
//     case 'technology': return 'default';
//     case 'vocational': return 'warning';
//     case 'health': return 'success';
//     case 'selective': return 'default';
//     default: return 'default';
//   }
// };

// const getSectionKey = (sectionName: string): string => {
//   const lower = sectionName.toLowerCase();
//   if (lower.includes('nursery')) return 'Nursery';
//   if (lower.includes('primary')) return 'Primary';
//   if (lower.includes('jss') || lower.includes('junior')) return 'JSS';
//   if (lower.includes('ss') || lower.includes('senior')) return 'SS';
//   return 'Primary'; // Default
// };

// export default function SubjectsManager() {
//   const { user, selected_branch, classes: storeClasses, sections: storeSections } = useAuthStore();
  
//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [classes, setClasses] = useState<ClassItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
//   const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
//   const [showInactive, setShowInactive] = useState(false);
  
//   // Modal states
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showManageModal, setShowManageModal] = useState(false);
//   const [activeSection, setActiveSection] = useState('');
//   const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
//   const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
//   const [customSubjectName, setCustomSubjectName] = useState('');
//   const [customSubjectType, setCustomSubjectType] = useState('core');
//   const [customSubjects, setCustomSubjects] = useState<{ name: string; type: string }[]>([]);

//   // Fetch subjects
//   const fetchSubjects = useCallback(() => {
//     if (!selected_branch?.branch_id) {
//       console.log('No branch_id available');
//       return;
//     }
    
//     setLoading(true);
//     _get(
//       `subjects?query_type=select-all&branch_id=${selected_branch.branch_id}`,
//       (res) => {
//         console.log('Subjects API Response:', res);
//         // Handle different response structures
//         if (res.success) {
//           // Response has success: true
//           if (Array.isArray(res.data)) {
//             setSubjects(res.data);
//             console.log(`Loaded ${res.data.length} subjects`);
//           } else if (Array.isArray(res)) {
//             // Sometimes API returns array directly
//             setSubjects(res);
//             console.log(`Loaded ${res.length} subjects`);
//           } else {
//             console.warn('Unexpected response structure:', res);
//             setSubjects([]);
//           }
//         } else if (Array.isArray(res)) {
//           // API might return array directly without success wrapper
//           setSubjects(res);
//           console.log(`Loaded ${res.length} subjects (direct array)`);
//         } else if (res.data && Array.isArray(res.data)) {
//           // Response might have data property without success
//           setSubjects(res.data);
//           console.log(`Loaded ${res.data.length} subjects (from data property)`);
//         } else {
//           console.warn('Unexpected response structure:', res);
//           setSubjects([]);
//         }
//         setLoading(false);
//       },
//       (err) => {
//         console.error('Error fetching subjects:', err);
//         toast.error('Failed to fetch subjects');
//         setLoading(false);
//         setSubjects([]);
//       }
//     );
//   }, [selected_branch?.branch_id]);

//   // Fetch classes if not in store
//   const fetchClasses = useCallback(() => {
//     if (!user?.school_id || !selected_branch?.branch_id) return;
    
//     // Only fetch if storeClasses is empty
//     if (!storeClasses || storeClasses.length === 0) {
//       _get(
//         `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
//         (res) => {
//           if (res.success && Array.isArray(res.data)) {
//             const mainClasses = res.data.filter(
//               (cls: ClassItem) => !cls.parent_id || cls.parent_id === null
//             );
//             setClasses(mainClasses);
//             console.log(`📚 Loaded ${mainClasses.length} classes`);
//           }
//         },
//         (err) => {
//           console.error('Error fetching classes:', err);
//         }
//       );
//     } else {
//       setClasses(storeClasses);
//     }
//   }, [user?.school_id, selected_branch?.branch_id, storeClasses]);

//   useEffect(() => {
//     fetchSubjects();
//     fetchClasses();
//   }, [fetchSubjects, fetchClasses]);

//   // Group classes by section (normalize section names for matching)
//   const groupedClasses = (classes || []).reduce((acc, cls: ClassItem) => {
//     const section = cls.section || 'Uncategorized';
//     // Normalize section name (uppercase for consistency)
//     const normalizedSection = section.toUpperCase();
//     if (!acc[normalizedSection]) {
//       acc[normalizedSection] = [];
//     }
//     acc[normalizedSection].push(cls);
//     return acc;
//   }, {} as Record<string, ClassItem[]>);

//   // Also create a map of all class codes for quick lookup
//   const classCodeMap = new Map<string, ClassItem>();
//   (classes || []).forEach((cls: ClassItem) => {
//     const code = String(cls.class_code || '');
//     classCodeMap.set(code, cls);
//     // Also store with normalized section
//     const normalizedSection = (cls.section || '').toUpperCase();
//     classCodeMap.set(`${code}_${normalizedSection}`, cls);
//   });

//   // Get subjects grouped by section (for display) - MUST be defined before useEffect
//   const subjectsBySection = subjects.reduce((acc, subject) => {
//     const section = (subject.section || 'Uncategorized').toUpperCase();
//     if (!acc[section]) {
//       acc[section] = [];
//     }
//     acc[section].push(subject);
//     return acc;
//   }, {} as Record<string, Subject[]>);

 
//   // Get subjects for a class
//   const getClassSubjects = (classCode: string, className?: string) => {
//     const all = subjects.filter(s => {
//       // Try matching by class_code first (normalize both)
//       const subjectClassCode = String(s.class_code || '').trim();
//       const targetClassCode = String(classCode || '').trim();
      
//       if (subjectClassCode === targetClassCode) {
//         return true;
//       }
      
//       // Also try case-insensitive match
//       if (subjectClassCode.toLowerCase() === targetClassCode.toLowerCase()) {
//         return true;
//       }
      
//       // Fallback: try matching by class_name if available
//       if (className && s.class_name) {
//         return s.class_name.toLowerCase() === className.toLowerCase();
//       }
      
//       return false;
//     });
//     const filtered = showInactive ? all : all.filter(s => s.status !== 'Inactive');
//     if (all.length > 0) {
//       console.log(`📚 Subjects for class ${classCode} (${className}):`, {
//         total: all.length,
//         filtered: filtered.length,
//         subjects: filtered.map(s => s.subject),
//         sampleSubject: all[0] ? { 
//           class_code: all[0].class_code, 
//           class_name: all[0].class_name,
//           section: all[0].section 
//         } : null,
//         allSubjectCodes: all.map(s => s.class_code).slice(0, 5),
//       });
//     }
//     return filtered;
//   };

//   // Get available subjects for section
//   const getAvailableSubjects = (sectionName: string) => {
//     const sectionKey = getSectionKey(sectionName);
//     const predefined = predefinedSubjects[sectionKey] || [];
//     return [...predefined, ...customSubjects];
//   };

//   // Handle add subjects
//   const handleAddSubjects = () => {
//     if (!activeSection) {
//       toast.error('Please select a section');
//       return;
//     }

//     if (selectedSubjects.length === 0) {
//       toast.error('Please select at least one subject');
//       return;
//     }

//     if (!user?.school_id || !selected_branch?.branch_id) {
//       toast.error('School or branch information is missing');
//       return;
//     }

//     const availableSubjects = getAvailableSubjects(activeSection);
//     const subjectsToAdd = selectedSubjects.map(subjectName => {
//       const subjectObj = availableSubjects.find(s => s.name === subjectName);
//       return {
//         subject: subjectName,
//         status: 'Active',
//         type: subjectObj?.type || 'core',
//       };
//     });

//     // const payload = {
//     //   school_id: user.school_id,
//     //   branch_id: selected_branch.branch_id,
//     //   section: activeSection,
//     //   subject: subjectsToAdd,
//     //   classes: Object.values(groupedClasses[activeSection] || []).map(c => c.class_code),
//     //   query_type: 'create_bulk',
//     // };
//     const payload = {
//   school_id: user.school_id,
//   branch_id: selected_branch.branch_id,
//   section: activeSection,
//   subject: subjectsToAdd,
//   classes,
//   query_type: 'create_bulk',
// };

// console.log("ACTIVE SECTION:", activeSection);
// console.log("GROUPED CLASSES:", groupedClasses);
// console.log("CLASSES SENT:", classes);

//     _post(
//       'subjects',
//       payload,
//       (res) => {
//         if (res.success) {
//           toast.success(`Successfully added ${selectedSubjects.length} subject(s)`);
//           fetchSubjects();
//           setShowAddModal(false);
//           setSelectedSubjects([]);
//           setCustomSubjects([]);
//         } else {
//           toast.error(res.message || 'Failed to add subjects');
//         }
//       },
//       (err) => {
//         console.error(err);
//         toast.error('Error adding subjects');
//       }
//     );
//   };

//   // Handle manage subjects for a class
//   const handleManageSubjects = () => {
//     if (!selectedClass) {
//       toast.error('No class selected');
//       return;
//     }

//     const existingSubjects = getClassSubjects(selectedClass.class_code).map(s => s.subject);
//     const toAdd = selectedSubjects.filter(s => !existingSubjects.includes(s));
//     const toRemove = existingSubjects.filter(s => !selectedSubjects.includes(s));

//     if (toAdd.length === 0 && toRemove.length === 0) {
//       setShowManageModal(false);
//       setSelectedClass(null);
//       return;
//     }

//     if (!user?.school_id || !selected_branch?.branch_id) {
//       toast.error('School or branch information is missing');
//       return;
//     }

//     const promises = [];

//     if (toAdd.length > 0) {
//       const availableSubjects = getAvailableSubjects(selectedClass.section);
//       const subjectsToAdd = toAdd.map(subjectName => {
//         const subjectObj = availableSubjects.find(s => s.name === subjectName);
//         return {
//           subject: subjectName,
//           status: 'Active',
//           type: subjectObj?.type || 'core',
//         };
//       });

//       promises.push(
//         new Promise((resolve, reject) =>
//           _post(
//             'subjects',
//             {
//               school_id: user.school_id,
//               branch_id: selected_branch.branch_id,
//               class_code: selectedClass.class_code,
//               subjects: subjectsToAdd,
//               query_type: 'assign_to_class',
//             },
//             (res) => (res.success ? resolve(res) : reject(res)),
//             reject
//           )
//         )
//       );
//     }

//     if (toRemove.length > 0) {
//       promises.push(
//         new Promise((resolve, reject) =>
//           _post(
//             'subjects',
//             {
//               school_id: user.school_id,
//               branch_id: selected_branch.branch_id,
//               class_code: selectedClass.class_code,
//               subjects: toRemove.map(s => ({ subject: s })),
//               query_type: 'remove_from_class',
//             },
//             (res) => (res.success ? resolve(res) : reject(res)),
//             reject
//           )
//         )
//       );
//     }

//     Promise.all(promises)
//       .then(() => {
//         toast.success('Subjects updated successfully');
//         fetchSubjects();
//         setShowManageModal(false);
//         setSelectedClass(null);
//         setSelectedSubjects([]);
//         setCustomSubjects([]);
//       })
//       .catch((err) => {
//         toast.error(err?.message || 'Error updating subjects');
//       });
//   };

//   // Add custom subject
//   const handleAddCustomSubject = () => {
//     if (!customSubjectName.trim()) {
//       toast.error('Please enter a subject name');
//       return;
//     }

//     if (customSubjects.some(s => s.name.toLowerCase() === customSubjectName.toLowerCase())) {
//       toast.error('This subject already exists');
//       return;
//     }

//     setCustomSubjects(prev => [...prev, { name: customSubjectName.trim(), type: customSubjectType }]);
//     setCustomSubjectName('');
//     setCustomSubjectType('core');
//     toast.success('Custom subject added');
//   };

//   // Delete subject
//   const handleDeleteSubject = (subjectCode: string, subjectName: string) => {
//     if (!confirm(`Disable "${subjectName}"? This will mark it as inactive but preserve all data.`)) {
//       return;
//     }

//     if (!user?.school_id || !selected_branch?.branch_id) {
//       toast.error('School or branch information is missing');
//       return;
//     }

//     _post(
//       'subjects',
//       {
//         school_id: user.school_id,
//         branch_id: selected_branch.branch_id,
//         subject_code: subjectCode,
//         status: 'Inactive',
//         query_type: 'soft_delete_subject',
//       },
//       (res) => {
//         if (res.success) {
//           toast.success('Subject disabled successfully');
//           fetchSubjects();
//         } else {
//           toast.error(res.message || 'Failed to disable subject');
//         }
//       },
//       (err) => {
//         console.error(err);
//         toast.error('Error disabling subject');
//       }
//     );
//   };

//   // Re-enable subject
//   const handleReEnableSubject = (subjectCode: string) => {
//     if (!user?.school_id || !selected_branch?.branch_id) {
//       toast.error('School or branch information is missing');
//       return;
//     }

//     _post(
//       'subjects',
//       {
//         school_id: user.school_id,
//         branch_id: selected_branch.branch_id,
//         subject_code: subjectCode,
//         status: 'Active',
//         query_type: 'enable_subject',
//       },
//       (res) => {
//         if (res.success) {
//           toast.success('Subject re-enabled successfully');
//           fetchSubjects();
//         } else {
//           toast.error(res.message || 'Failed to re-enable subject');
//         }
//       },
//       (err) => {
//         console.error(err);
//         toast.error('Error re-enabling subject');
//       }
//     );
//   };

//   const toggleSection = (section: string) => {
//     setExpandedSections(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(section)) {
//         newSet.delete(section);
//       } else {
//         newSet.add(section);
//       }
//       return newSet;
//     });
//   };

//   const toggleClass = (classCode: string) => {
//     setExpandedClasses(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(classCode)) {
//         newSet.delete(classCode);
//       } else {
//         newSet.add(classCode);
//       }
//       return newSet;
//     });
//   };

//   const handleOpenManageModal = (classItem: ClassItem) => {
//     setSelectedClass(classItem);
//     const classSubjects = getClassSubjects(classItem.class_code).map(s => s.subject);
//     setSelectedSubjects(classSubjects);
//     setCustomSubjects([]);
//     setShowManageModal(true);
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="animate-slide-in">
//         <h1 className="text-4xl font-bold text-gray-700 dark:text-gray-300 mb-2">
//           Subjects Management
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400 text-lg">
//           Manage subjects for classes and organize your curriculum
//         </p>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//         <Card className="hover-lift">
//           <CardBody className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
//                   Total Subjects
//                 </p>
//                 <p className="text-3xl font-bold text-[#00356B] dark:text-white">
//                   {subjects.filter(s => s.status !== 'Inactive').length}
//                 </p>
//               </div>
//               <div className="p-4 rounded-2xl bg-[#00356B]/30 dark:bg-[#00356B]">
//                 <BookOpen className="h-7 w-7 text-[#00356B] dark:text-white" />
//               </div>
//             </div>
//           </CardBody>
//         </Card>

//         <Card className="hover-lift">
//           <CardBody className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
//                   Active Classes
//                 </p>
//                 <p className="text-3xl font-bold text-[#00345B] dark:text-white">
//                   {Object.keys(groupedClasses).length}
//                 </p>
//               </div>
//               <div className="p-4 rounded-2xl bg-[#fad2d9] dark:bg-[#21060a]/80">
//                 <School className="h-7 w-7 text-[#00345B] dark:text-white" />
//               </div>
//             </div>
//           </CardBody>
//         </Card>

//         <Card className="hover-lift">
//           <CardBody className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
//                   Disabled Subjects
//                 </p>
//                 <p className="text-3xl font-bold text-[#00356B] dark:text-white">
//                   {subjects.filter(s => s.status === 'Inactive').length}
//                 </p>
//               </div>
//               <div className="p-4 rounded-2xl bg-[#ecfdf5] dark:bg-[#064e3b]/30">
//                 <Settings className="h-7 w-7 text-[#00356B] dark:text-white" />
//               </div>
//             </div>
//           </CardBody>
//         </Card>
//       </div>

//       {/* Actions */}
//       <Card>
//         <CardBody className="p-6">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div>
//               <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white mb-1">
//                 Subject Management
//               </h3>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Add subjects to classes or manage existing assignments
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 className='border-[#00356B] text-[#00356B] hover:bg-[#00356B]/10 dark:border-white dark:text-white dark:hover:bg-white/10'
//                 onClick={() => setShowInactive(!showInactive)}
//               >
//                 {showInactive ? (
//                   <>
//                     <EyeOff className="h-4 w-4 mr-2" />
//                     Hide Disabled
//                   </>
//                 ) : (
//                   <>
//                     <Eye className="h-4 w-4 mr-2" />
//                     Show Disabled
//                   </>
//                 )}
//               </Button>
//               <Button
//                 onClick={() => {
//                   setShowAddModal(true);
//                   setActiveSection(storeSections?.[0]?.section_name || '');
//                   setSelectedSubjects([]);
//                   setCustomSubjects([]);
//                 }}
//                 className="shadow-glow-sm text-white border-[#00356B] hover:bg-[#00356B]/10 dark:border-white dark:text-white dark:hover:bg-white/10"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Subjects
//               </Button>
//             </div>
//           </div>
//         </CardBody>
//       </Card>

     

//       {/* Subjects by Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl flex items-center gap-2">
//             <BookOpen className="h-6 w-6 text-[#00356B] dark:text-white" />
//             <span className="text-[#00356B] dark:text-white">Subjects by Section</span>
//           </CardTitle>
//         </CardHeader>
//         <CardBody>
//           {loading ? (
//             <div className="text-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//               <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subjects...</p>
//             </div>
//           ) : subjects.length === 0 ? (
//             <div className="text-center py-16">
//               <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
//                 No Subjects Found
//               </h3>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 Add subjects to classes to get started
//               </p>
//               <Button
//                 onClick={() => {
//                   setShowAddModal(true);
//                   setActiveSection(storeSections?.[0]?.section_name || '');
//                 }}
//                 size="lg"
//               >
//                 <Plus className="h-5 w-5 mr-2" />
//                 Add Subjects
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {/* Show subjects - prioritize showing by classes if available, otherwise show by section */}
//               {Object.keys(groupedClasses).length > 0 ? (
//                 // Show subjects organized by classes
//                 Object.entries(groupedClasses).map(([section, classes]) => {
//                 // Normalize section for matching
//                 const normalizedSection = section.toUpperCase();
//                 const isSectionExpanded = expandedSections.has(normalizedSection);
                
//                 return (
//                   <Card
//                     key={section}
//                     className="border-l-4 border-[#00356B] dark:border-gray-500"
//                   >
//                     <CardBody className="p-0">
//                       <button
//                         onClick={() => toggleSection(normalizedSection)}
//                         className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                       >
//                         <div className="flex items-center gap-4">
//                           <div className="p-3 rounded-xl bg-[#00456B] dark:bg-[#00356B]">
//                             <School className="h-6 w-6 text-white dark:text-white" />
//                           </div>
//                           <div className="text-left">
//                             <h4 className="text-xl font-bold text-gray-900 dark:text-white">
//                               {section} Section
//                             </h4>
//                             <p className="text-sm text-gray-600 dark:text-gray-400">
//                               {classes.length} class{classes.length !== 1 ? 'es' : ''}
//                               {subjectsBySection[normalizedSection] && (
//                                 <span className="ml-2 text-primary-600 dark:text-primary-400">
//                                   • {subjectsBySection[normalizedSection].length} subject{subjectsBySection[normalizedSection].length !== 1 ? 's' : ''}
//                                 </span>
//                               )}
//                             </p>
//                           </div>
//                         </div>
//                         {isSectionExpanded ? (
//                           <ChevronDown className="h-5 w-5 text-gray-400" />
//                         ) : (
//                           <ChevronRight className="h-5 w-5 text-gray-400" />
//                         )}
//                       </button>
                      
//                       {isSectionExpanded && (
//                         <div className="px-6 pb-6 space-y-3 animate-slide-in">
//                           {classes.length === 0 ? (
//                             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                               No classes in this section
//                             </div>
//                           ) : (
//                             classes.map((classItem) => {
//                               const classSubjects = getClassSubjects(classItem.class_code, classItem.class_name);
//                               const isClassExpanded = expandedClasses.has(classItem.class_code);
                              
//                               // Also show subjects that belong to this section but don't have a matching class
//                               const orphanSubjects = subjectsBySection[normalizedSection]?.filter(s => {
//                                 const subjectClassCode = String(s.class_code || '').trim();
//                                 const targetClassCode = String(classItem.class_code || '').trim();
//                                 return subjectClassCode === targetClassCode || 
//                                        subjectClassCode.toLowerCase() === targetClassCode.toLowerCase();
//                               }) || [];
                              
//                               const allClassSubjects = classSubjects.length > 0 
//                                 ? classSubjects 
//                                 : orphanSubjects.length > 0 
//                                   ? orphanSubjects 
//                                   : [];
                            
//                             return (
//                               <Card
//                                 key={classItem.class_code}
//                                 className="border-2 border-gray-200 dark:border-gray-700"
//                               >
//                                 <CardBody className="p-4">
//                                   <div className="flex items-center justify-between mb-3">
//                                     <button
//                                       onClick={() => toggleClass(classItem.class_code)}
//                                       className="flex items-center gap-2 flex-1 text-left"
//                                     >
//                                       <h5 className="font-bold text-[#00356B] dark:text-white">
//                                         {classItem.class_name}
//                                       </h5>
//                                       <Badge variant="default" className="text-xs bg-[#00356B]">
//                                         {classSubjects.length} subjects
//                                       </Badge>
//                                       {isClassExpanded ? (
//                                         <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
//                                       ) : (
//                                         <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
//                                       )}
//                                     </button>
//                                     <Button
//                                       size="sm"
//                                       variant="outline"
//                                       className='border-2 border-[#00356B] dark:border-white text-[#00356B] dark:text-white'
//                                       onClick={() => handleOpenManageModal(classItem)}
//                                     >
//                                       <Settings className="h-3 w-3 mr-1" />
//                                       Manage
//                                     </Button>
//                                   </div>
                                  
//                                   {isClassExpanded && (
//                                     <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 animate-fade-in">
//                                       {allClassSubjects.length > 0 ? (
//                                         <div className="flex flex-wrap gap-2">
//                                           {allClassSubjects.map((subject) => (
//                                             <Badge
//                                               key={subject.subject_code || `${subject.subject}-${subject.class_code}`}
//                                               variant={getSubjectTypeColor(subject.type) as any}
//                                               className="text-sm px-3 py-1 flex items-center gap-2"
//                                             >
//                                               <span className={subject.status === 'Inactive' ? 'line-through opacity-60' : ''}>
//                                                 {subject.subject}
//                                               </span>
//                                               {subject.status === 'Inactive' && (
//                                                 <span className="text-xs">(Disabled)</span>
//                                               )}
//                                               {subject.status === 'Inactive' ? (
//                                                 <Button
//                                                   variant="ghost"
//                                                   size="sm"
//                                                   onClick={() => handleReEnableSubject(subject.subject_code)}
//                                                   className="h-5 w-5 p-0 text-success-600 hover:text-success-700"
//                                                 >
//                                                   <Check className="h-3 w-3" />
//                                                 </Button>
//                                               ) : (
//                                                 <Button
//                                                   variant="ghost"
//                                                   size="sm"
//                                                   onClick={() => handleDeleteSubject(subject.subject_code, subject.subject)}
//                                                   className="h-5 w-5 p-0 text-red-500 hover:text-red-600"
//                                                 >
//                                                   <X className="h-3 w-3" />
//                                                 </Button>
//                                               )}
//                                             </Badge>
//                                           ))}
//                                         </div>
//                                       ) : (
//                                         <div className="space-y-2">
//                                           <p className="text-sm text-gray-500 dark:text-gray-500 italic">
//                                             No {showInactive ? '' : 'active '}subjects assigned to this class
//                                           </p>
//                                           <Button
//                                             size="sm"
//                                             variant="outline"
//                                             className='border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-[#00356B] dark:text-white'
//                                             onClick={() => handleOpenManageModal(classItem)}
//                                           >
//                                             <Plus className="h-3 w-3 mr-1 " />
//                                             Add Subjects
//                                           </Button>
//                                         </div>
//                                       )}
//                                     </div>
//                                   )}
//                                 </CardBody>
//                               </Card>
//                             );
//                           }))}
//                         </div>
//                       )}
//                     </CardBody>
//                   </Card>
//                 );
//               })) : (
//                 // Fallback: Show all subjects grouped by section if no classes exist or don't match
//                 Object.entries(subjectsBySection).map(([section, sectionSubjects]) => {
//                   const isSectionExpanded = expandedSections.has(section);
//                   const activeSubjects = showInactive 
//                     ? sectionSubjects 
//                     : sectionSubjects.filter(s => s.status !== 'Inactive');
                  
//                   // Group subjects by class_code
//                   const subjectsByClass = activeSubjects.reduce((acc, subject) => {
//                     const classCode = String(subject.class_code || 'Unassigned');
//                     if (!acc[classCode]) {
//                       acc[classCode] = [];
//                     }
//                     acc[classCode].push(subject);
//                     return acc;
//                   }, {} as Record<string, Subject[]>);
                  
//                   return (
//                     <Card
//                       key={section}
//                       className="border-l-4 border-primary-500 dark:border-primary-400"
//                     >
//                       <CardBody className="p-0">
//                         <button
//                           onClick={() => toggleSection(section)}
//                           className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                         >
//                           <div className="flex items-center gap-4">
//                             <div className="p-3 rounded-xl bg-[#00356B] dark:bg-[#00356B]">
//                               <School className="h-6 w-6 text-white dark:text-white" />
//                             </div>
//                             <div className="text-left">
//                               <h4 className="text-xl font-bold text-gray-900 dark:text-white">
//                                 {section} Section
//                               </h4>
//                               <p className="text-sm text-gray-600 dark:text-gray-400">
//                                 {activeSubjects.length} subject{activeSubjects.length !== 1 ? 's' : ''}
//                               </p>
//                             </div>
//                           </div>
//                           {isSectionExpanded ? (
//                             <ChevronDown className="h-5 w-5 text-gray-400" />
//                           ) : (
//                             <ChevronRight className="h-5 w-5 text-gray-400" />
//                           )}
//                         </button>
                        
//                         {isSectionExpanded && (
//                           <div className="px-6 pb-6 space-y-3 animate-slide-in">
//                             {Object.entries(subjectsByClass).map(([classCode, classSubjects]) => {
//                               const classItem = classCodeMap.get(classCode);
//                               const className = classItem?.class_name || `Class ${classCode}`;
//                               const isClassExpanded = expandedClasses.has(classCode);
                              
//                               return (
//                                 <Card
//                                   key={classCode}
//                                   className="border-2 border-gray-200 dark:border-gray-700"
//                                 >
//                                   <CardBody className="p-4">
//                                     <div className="flex items-center justify-between mb-3">
//                                       <button
//                                         onClick={() => toggleClass(classCode)}
//                                         className="flex items-center gap-2 flex-1 text-left"
//                                       >
//                                         <h5 className="font-bold text-gray-900 dark:text-white">
//                                           {className}
//                                         </h5>
//                                         <Badge variant="default" className="text-xs">
//                                           {classSubjects.length} subjects
//                                         </Badge>
//                                         {isClassExpanded ? (
//                                           <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
//                                         ) : (
//                                           <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
//                                         )}
//                                       </button>
//                                       {classItem && (
//                                         <Button
//                                           size="sm"
//                                           variant="outline"
//                                           className="text-[#00356B] dark:text-white border-2 border-[#00356B] dark:border-white"
//                                           onClick={() => handleOpenManageModal(classItem)}
//                                         >
//                                           <Settings className="h-3 w-3 mr-1" />
//                                           Manage
//                                         </Button>
//                                       )}
//                                     </div>
                                    
//                                     {isClassExpanded && (
//                                       <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 animate-fade-in">
//                                         <div className="flex flex-wrap gap-2">
//                                           {classSubjects.map((subject) => (
//                                             <Badge
//                                               key={subject.subject_code || `${subject.subject}-${subject.class_code}`}
//                                               variant={getSubjectTypeColor(subject.type) as any}
//                                               className="text-sm px-3 py-1 flex items-center gap-2"
//                                             >
//                                               <span className={subject.status === 'Inactive' ? 'line-through opacity-60' : ''}>
//                                                 {subject.subject}
//                                               </span>
//                                               {subject.status === 'Inactive' && (
//                                                 <span className="text-xs">(Disabled)</span>
//                                               )}
//                                               {subject.status === 'Inactive' ? (
//                                                 <Button
//                                                   variant="ghost"
//                                                   size="sm"
//                                                   onClick={() => handleReEnableSubject(subject.subject_code)}
//                                                   className="h-5 w-5 p-0 text-success-600 hover:text-success-700"
//                                                 >
//                                                   <Check className="h-3 w-3" />
//                                                 </Button>
//                                               ) : (
//                                                 <Button
//                                                   variant="ghost"
//                                                   size="sm"
//                                                   onClick={() => handleDeleteSubject(subject.subject_code, subject.subject)}
//                                                   className="h-5 w-5 p-0 text-red-500 hover:text-red-600"
//                                                 >
//                                                   <X className="h-3 w-3" />
//                                                 </Button>
//                                               )}
//                                             </Badge>
//                                           ))}
//                                         </div>
//                                       </div>
//                                     )}
//                                   </CardBody>
//                                 </Card>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </CardBody>
//                     </Card>
//                   );
//                 })
//               )}
//             </div>
//           )}
//         </CardBody>
//       </Card>

//       {/* Add Subjects Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
//           <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-xl text-[#00356B] dark:text-white flex items-center gap-2">
//                   <Plus className="h-5 w-5  text-[#00356B] dark:text-white" />
//                   Add Subjects to Section
//                 </CardTitle>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => {
//                     setShowAddModal(false);
//                     setSelectedSubjects([]);
//                     setCustomSubjects([]);
//                   }}
//                 >
//                   <X className="h-4 w-4 text-[#00356B] dark:text-white" />
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardBody className="space-y-6">
//               {/* Section Selection */}
//               <div className="space-y-2">
//                 <Label>Select Section *</Label>
//                 <select
//                   value={activeSection}
//                   onChange={(e) => {
//                     setActiveSection(e.target.value);
//                     setSelectedSubjects([]);
//                   }}
//                   className="w-full h-11 px-4 rounded-xl border-2 dark:border-gray-200 border-[#00356B] bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
//                 >
//                   <option value="">Choose a section</option>
//                   {(storeSections || []).map((section: Section) => (
//                     <option key={section.section_id} value={section.section_name}>
//                       {section.section_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Subjects List */}
//               {activeSection && (
//                 <div className="space-y-4 animate-slide-in">
//                   <div>
//                     <Label className="mb-3 block">Select Subjects *</Label>
//                     <div className="max-h-96 overflow-y-auto space-y-2 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
//                       {getAvailableSubjects(activeSection).map((subject) => {
//                         const isSelected = selectedSubjects.includes(subject.name);
//                         const exists = subjects.some(
//                           s => s.subject.toLowerCase() === subject.name.toLowerCase() &&
//                                s.status !== 'Inactive'
//                         );
                        
//                         return (
//                           <label
//                             key={subject.name}
//                             className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
//                               isSelected
//                             ? 'border-[#00356B] bg-[#00356B]/30 dark:bg-[#00356B]/30'
//                                 : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
//                             } ${exists ? 'opacity-60' : ''}`}
//                           >
//                             <input
//                               type="checkbox"
//                               checked={isSelected}
//                               onChange={(e) => {
//                                 if (exists) return;
//                                 if (e.target.checked) {
//                                   setSelectedSubjects(prev => [...prev, subject.name]);
//                                 } else {
//                                   setSelectedSubjects(prev => prev.filter(s => s !== subject.name));
//                                 }
//                               }}
//                               disabled={exists}
//                               className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//                             />
//                             <div className="flex-1">
//                               <p className="font-semibold text-gray-900 dark:text-white dark:text-white">
//                                 {subject.name}
//                               </p>
//                             </div>
//                             <Badge variant={getSubjectTypeColor(subject.type) as any} className="text-xs">
//                               {subject.type}
//                             </Badge>
//                             {exists && (
//                               <Badge variant="success" className="text-xs">
//                                 Exists
//                               </Badge>
//                             )}
//                           </label>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {/* Custom Subject */}
//                   <div className="space-y-2">
//                     <Label>Add Custom Subject</Label>
//                     <div className="flex gap-3">
//                       <Input
//                         value={customSubjectName}
//                         onChange={(e) => setCustomSubjectName(e.target.value)}
//                         placeholder="Enter custom subject name"
//                         className="flex-1 border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-[#00356B] dark:text-white"
//                       />
//                       <select
//                         value={customSubjectType}
//                         onChange={(e) => setCustomSubjectType(e.target.value)}
//                         className="w-32 h-11 px-4 rounded-xl border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-[#00356B] dark:text-white"
//                       >
//                         <option value="core">Core</option>
//                         <option value="science">Science</option>
//                         <option value="art">Art</option>
//                         <option value="commercial">Commercial</option>
//                         <option value="technology">Technology</option>
//                         <option value="vocational">Vocational</option>
//                         <option value="health">Health</option>
//                         <option value="selective">Selective</option>
//                       </select>
//                       <Button onClick={handleAddCustomSubject} variant="outline" className="border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-[#00356B] dark:text-white">
//                         Add
//                       </Button>
//                     </div>
//                     {customSubjects.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mt-2">
//                         {customSubjects.map((subject) => (
//                           <Badge key={subject.name} variant="default" className="text-xs">
//                             {subject.name}
//                           </Badge>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setShowAddModal(false);
//                     setSelectedSubjects([]);
//                     setCustomSubjects([]);
//                   }}
//                   className="flex-1 border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-[#00356B] dark:text-white"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleAddSubjects}
//                   disabled={selectedSubjects.length === 0 || !activeSection}
//                   className="flex-1 border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-[white dark:text-white"
//                 >
//                   <Check className="h-4 w-4 mr-2" />
//                   Add {selectedSubjects.length} Subject{selectedSubjects.length !== 1 ? 's' : ''}
//                 </Button>
//               </div>
//             </CardBody>
//           </Card>
//         </div>
//       )}

//       {/* Manage Subjects Modal */}
//       {showManageModal && selectedClass && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
//           <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-xl flex items-center gap-2 text-[#00356B] dark:text-white">
//                   <Settings className="h-5 w-5 text-[#00356B] dark:text-white" />
//                   Manage Subjects for {selectedClass.class_name}
//                 </CardTitle>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => {
//                     setShowManageModal(false);
//                     setSelectedClass(null);
//                     setSelectedSubjects([]);
//                     setCustomSubjects([]);
//                   }}
//                 >
//                   <X className="h-4 w-4 text-[#00356B] dark:text-white" />
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardBody className="space-y-6">
//               <div>
//                 <Label className="mb-3 block text-[#003] dark:text-white/60 ">Select Subjects</Label>
//                 <div className="max-h-96 overflow-y-auto space-y-2 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
//                   {getAvailableSubjects(selectedClass.section).map((subject) => {
//                     const isSelected = selectedSubjects.includes(subject.name);
//                     const exists = subjects.some(
//                       s => s.class_code === selectedClass.class_code &&
//                            s.subject.toLowerCase() === subject.name.toLowerCase() &&
//                            s.status !== 'Inactive'
//                     );
                    
//                     return (
//                       <label
//                         key={subject.name}
//                         className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
//                           isSelected
//                             ? 'border-[#00356B] bg-[#00356B]/30 dark:bg-[#00356B]/30'
//                             : 'border-gray-200 dark:border-gray-700 hover:border-[#00356B]/60'
//                         }`}
//                       >
//                         <input
//                           type="checkbox"
//                           checked={isSelected}
//                           onChange={(e) => {
//                             if (e.target.checked) {
//                               setSelectedSubjects(prev => [...prev, subject.name]);
//                             } else {
//                               setSelectedSubjects(prev => prev.filter(s => s !== subject.name));
//                             }
//                           }}
//                           className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//                         />
//                         <div className="flex-1">
//                           <p className="font-semibold text-gray-900 dark:text-white">
//                             {subject.name}
//                           </p>
//                         </div>
//                         <Badge variant={getSubjectTypeColor(subject.type) as any} className="text-xs">
//                           {subject.type}
//                         </Badge>
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Custom Subject */}
//               <div className="space-y-2">
//                 <Label>Add Custom Subject</Label>
//                 <div className="flex gap-3">
//                   <Input
//                     value={customSubjectName}
//                     onChange={(e) => setCustomSubjectName(e.target.value)}
//                     placeholder="Enter custom subject name"
//                     className="flex-1 border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10"
//                   />
//                   <select
//                     value={customSubjectType}
//                     onChange={(e) => setCustomSubjectType(e.target.value)}
//                     className="w-32 h-11 px-4 rounded-xl border-2 border-[#00356B] dark:border-white/50 bg-white dark:bg-gray-800 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-gray-900 dark:text-white"
//                   >
//                     <option value="core">Core</option>
//                     <option value="science">Science</option>
//                     <option value="art">Art</option>
//                     <option value="commercial">Commercial</option>
//                     <option value="technology">Technology</option>
//                     <option value="vocational">Vocational</option>
//                     <option value="health">Health</option>
//                     <option value="selective">Selective</option>
//                   </select>
//                   <Button onClick={handleAddCustomSubject} variant="outline" className="border-2 border-[#00356B] dark:border-white/50 text-[#00356B] dark:text-white hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/30">
//                     Add
//                   </Button>
//                 </div>
//                 {customSubjects.length > 0 && (
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {customSubjects.map((subject) => (
//                       <Badge key={subject.name} variant="default" className="text-xs">
//                         {subject.name}
//                       </Badge>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setShowManageModal(false);
//                     setSelectedClass(null);
//                     setSelectedSubjects([]);
//                     setCustomSubjects([]);
//                   }}
//                   className="flex-1 border-2 border-[#00356B] dark:border-white/50 hover:bg-[#00356B]/30 dark:hover:bg-[#00356B]/10 text-[#00356B] dark:text-white"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleManageSubjects}
//                   className="flex-1"
//                 >
//                   <Check className="h-4 w-4 mr-2" />
//                   Save Changes
//                 </Button>
//               </div>
//             </CardBody>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  School,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react';
import { _get, _post } from '@/Helper';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

interface Subject {
  subject: string;
  section: string;
  subject_code: string;
  class_name: string;
  class_code: string;
  status: string;
  type?: string;
}

interface ClassItem {
  class_code: string;
  class_name: string;
  section: string;
  parent_id?: string | null;
}

interface Section {
  section_id: string;
  section_name: string;
}

const predefinedSubjects: Record<string, { name: string; type: string }[]> = {
  Nursery: [
    { name: 'English Language', type: 'core' },
    { name: 'Mathematics', type: 'core' },
    { name: 'Basic Science', type: 'core' },
    { name: 'Social Studies', type: 'core' },
    { name: 'Creative Arts', type: 'art' },
    { name: 'Physical Education', type: 'health' },
  ],
  Primary: [
    { name: 'English Language', type: 'core' },
    { name: 'Mathematics', type: 'core' },
    { name: 'Basic Science & Technology', type: 'science' },
    { name: 'Social Studies', type: 'core' },
    { name: 'Civic Education', type: 'core' },
    { name: 'Agricultural Science', type: 'science' },
    { name: 'Computer Studies', type: 'technology' },
    { name: 'Creative Arts', type: 'art' },
    { name: 'Physical & Health Education', type: 'health' },
    { name: 'Home Economics', type: 'vocational' },
    { name: 'Christian Religious Studies', type: 'selective' },
    { name: 'Islamic Religious Studies', type: 'selective' },
  ],
  JSS: [
    { name: 'English Studies', type: 'core' },
    { name: 'Mathematics', type: 'core' },
    { name: 'Basic Science', type: 'science' },
    { name: 'Basic Technology', type: 'technology' },
    { name: 'Business Studies', type: 'commercial' },
    { name: 'Social Studies', type: 'core' },
    { name: 'Civic Education', type: 'core' },
    { name: 'Agricultural Science', type: 'science' },
    { name: 'Computer Studies', type: 'technology' },
    { name: 'Home Economics', type: 'vocational' },
    { name: 'Creative Arts', type: 'art' },
    { name: 'Physical & Health Education', type: 'health' },
  ],
  SS: [
    { name: 'English Language', type: 'core' },
    { name: 'Mathematics', type: 'core' },
    { name: 'Physics', type: 'science' },
    { name: 'Chemistry', type: 'science' },
    { name: 'Biology', type: 'science' },
    { name: 'Further Mathematics', type: 'science' },
    { name: 'Agricultural Science', type: 'science' },
    { name: 'Economics', type: 'commercial' },
    { name: 'Accounting', type: 'commercial' },
    { name: 'Commerce', type: 'commercial' },
    { name: 'Literature-in-English', type: 'art' },
    { name: 'Government', type: 'art' },
    { name: 'History', type: 'art' },
    { name: 'Geography', type: 'art' },
    { name: 'Christian Religious Studies', type: 'selective' },
    { name: 'Islamic Religious Studies', type: 'selective' },
  ],
};

const getSubjectTypeColor = (type?: string): string => {
  switch (type) {
    case 'core': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    case 'science': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
    case 'art': return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    case 'commercial': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400';
    case 'technology': return 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400';
    case 'vocational': return 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400';
    case 'health': return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
    case 'selective': return 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';
    default: return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getSectionKey = (sectionName: string): string => {
  const lower = sectionName.toLowerCase();
  if (lower.includes('nursery')) return 'Nursery';
  if (lower.includes('primary')) return 'Primary';
  if (lower.includes('jss') || lower.includes('junior')) return 'JSS';
  if (lower.includes('ss') || lower.includes('senior')) return 'SS';
  return 'Primary';
};
export default function SubjectsManager() {
  const { user, selected_branch, classes: storeClasses, sections: storeSections } = useAuthStore();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [showInactive, setShowInactive] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [customSubjectType, setCustomSubjectType] = useState('core');
  const [customSubjects, setCustomSubjects] = useState<{ name: string; type: string }[]>([]);

  // Fetch subjects from server
  const fetchSubjects = useCallback(() => {
    if (!selected_branch?.branch_id) {
      console.log('No branch_id available');
      return;
    }

    setLoading(true);
    _get(
      `subjects?query_type=select-all&branch_id=${selected_branch.branch_id}`,
      (res) => {
        console.log('Subjects API Response:', res);
        if (res.success) {
          if (Array.isArray(res.data)) {
            setSubjects(res.data);
          } else if (Array.isArray(res)) {
            setSubjects(res);
          } else {
            setSubjects([]);
          }
        } else if (Array.isArray(res)) {
          setSubjects(res);
        } else if (res.data && Array.isArray(res.data)) {
          setSubjects(res.data);
        } else {
          setSubjects([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching subjects:', err);
        toast.error('Failed to fetch subjects');
        setLoading(false);
        setSubjects([]);
      }
    );
  }, [selected_branch?.branch_id]);

  // Fetch classes if not in store
  const fetchClasses = useCallback(() => {
    if (!user?.school_id || !selected_branch?.branch_id) return;
    
    if (!storeClasses || storeClasses.length === 0) {
      _get(
        `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
        (res) => {
          if (res.success && Array.isArray(res.data)) {
            const mainClasses = res.data.filter(
              (cls: ClassItem) => !cls.parent_id || cls.parent_id === null
            );
            setClasses(mainClasses);
          }
        },
        (err) => {
          console.error('Error fetching classes:', err);
        }
      );
    } else {
      setClasses(storeClasses);
    }
  }, [user?.school_id, selected_branch?.branch_id, storeClasses]);

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, [fetchSubjects, fetchClasses]);
  // Group classes by section (normalize section names for matching)
  const groupedClasses = useMemo(() => {
    return (classes || []).reduce((acc, cls: ClassItem) => {
      const section = cls.section || 'Uncategorized';
      const normalizedSection = section.toUpperCase();
      if (!acc[normalizedSection]) {
        acc[normalizedSection] = [];
      }
      acc[normalizedSection].push(cls);
      return acc;
    }, {} as Record<string, ClassItem[]>);
  }, [classes]);

  // Create a map of all class codes for quick lookup
  const classCodeMap = useMemo(() => {
    const map = new Map<string, ClassItem>();
    (classes || []).forEach((cls: ClassItem) => {
      const code = String(cls.class_code || '');
      map.set(code, cls);
      const normalizedSection = (cls.section || '').toUpperCase();
      map.set(`${code}_${normalizedSection}`, cls);
    });
    return map;
  }, [classes]);

  // Get subjects grouped by section (for display)
  const subjectsBySection = useMemo(() => {
    return subjects.reduce((acc, subject) => {
      const section = (subject.section || 'Uncategorized').toUpperCase();
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(subject);
      return acc;
    }, {} as Record<string, Subject[]>);
  }, [subjects]);

  // Get subjects for a class
  const getClassSubjects = (classCode: string, className?: string) => {
    const all = subjects.filter(s => {
      const subjectClassCode = String(s.class_code || '').trim();
      const targetClassCode = String(classCode || '').trim();
      
      if (subjectClassCode === targetClassCode) return true;
      if (subjectClassCode.toLowerCase() === targetClassCode.toLowerCase()) return true;
      if (className && s.class_name) {
        return s.class_name.toLowerCase() === className.toLowerCase();
      }
      return false;
    });
    return showInactive ? all : all.filter(s => s.status !== 'Inactive');
  };

  // Get available subjects for section
  const getAvailableSubjects = (sectionName: string) => {
    const sectionKey = getSectionKey(sectionName);
    const predefined = predefinedSubjects[sectionKey] || [];
    return [...predefined, ...customSubjects];
  };

  // Handle add subjects bulk operation
  const handleAddSubjects = () => {
    if (!activeSection) {
      toast.error('Please select a section');
      return;
    }
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }
    if (!user?.school_id || !selected_branch?.branch_id) {
      toast.error('School or branch information is missing');
      return;
    }

    const availableSubjects = getAvailableSubjects(activeSection);
    const subjectsToAdd = selectedSubjects.map(subjectName => {
      const subjectObj = availableSubjects.find(s => s.name === subjectName);
      return {
        subject: subjectName,
        status: 'Active',
        type: subjectObj?.type || 'core',
      };
    });

    const payload = {
      school_id: user.school_id,
      branch_id: selected_branch.branch_id,
      section: activeSection,
      subject: subjectsToAdd,
      classes,
      query_type: 'create_bulk',
    };

    _post(
      'subjects',
      payload,
      (res) => {
        if (res.success) {
          toast.success(`Successfully added ${selectedSubjects.length} subject(s)`);
          fetchSubjects();
          setShowAddModal(false);
          setSelectedSubjects([]);
          setCustomSubjects([]);
        } else {
          toast.error(res.message || 'Failed to add subjects');
        }
      },
      (err) => {
        console.error(err);
        toast.error('Error adding subjects');
      }
    );
  };
  // Handle manage subjects for an individual class
  const handleManageSubjects = () => {
    if (!selectedClass) {
      toast.error('No class selected');
      return;
    }

    const existingSubjects = getClassSubjects(selectedClass.class_code).map(s => s.subject);
    const toAdd = selectedSubjects.filter(s => !existingSubjects.includes(s));
    const toRemove = existingSubjects.filter(s => !selectedSubjects.includes(s));

    if (toAdd.length === 0 && toRemove.length === 0) {
      setShowManageModal(false);
      setSelectedClass(null);
      return;
    }

    if (!user?.school_id || !selected_branch?.branch_id) {
      toast.error('School or branch information is missing');
      return;
    }

    const promises = [];

    if (toAdd.length > 0) {
      const availableSubjects = getAvailableSubjects(selectedClass.section);
      const subjectsToAdd = toAdd.map(subjectName => {
        const subjectObj = availableSubjects.find(s => s.name === subjectName);
        return {
          subject: subjectName,
          status: 'Active',
          type: subjectObj?.type || 'core',
        };
      });

      promises.push(
        new Promise((resolve, reject) =>
          _post(
            'subjects',
            {
              school_id: user.school_id,
              branch_id: selected_branch.branch_id,
              class_code: selectedClass.class_code,
              subjects: subjectsToAdd,
              query_type: 'assign_to_class',
            },
            (res) => (res.success ? resolve(res) : reject(res)),
            reject
          )
        )
      );
    }

    if (toRemove.length > 0) {
      promises.push(
        new Promise((resolve, reject) =>
          _post(
            'subjects',
            {
              school_id: user.school_id,
              branch_id: selected_branch.branch_id,
              class_code: selectedClass.class_code,
              subjects: toRemove.map(s => ({ subject: s })),
              query_type: 'remove_from_class',
            },
            (res) => (res.success ? resolve(res) : reject(res)),
            reject
          )
        )
      );
    }

    Promise.all(promises)
      .then(() => {
        toast.success('Subjects updated successfully');
        fetchSubjects();
        setShowManageModal(false);
        setSelectedClass(null);
        setSelectedSubjects([]);
        setCustomSubjects([]);
      })
      .catch((err) => {
        toast.error(err?.message || 'Error updating subjects');
      });
  };

  // Add custom typed subject locally before dispatching
  const handleAddCustomSubject = () => {
    if (!customSubjectName.trim()) {
      toast.error('Please enter a subject name');
      return;
    }
    if (customSubjects.some(s => s.name.toLowerCase() === customSubjectName.toLowerCase())) {
      toast.error('This subject already exists');
      return;
    }

    setCustomSubjects(prev => [...prev, { name: customSubjectName.trim(), type: customSubjectType }]);
    setCustomSubjectName('');
    setCustomSubjectType('core');
    toast.success('Custom subject added');
  };

  // Disable subject (Soft delete workflow)
  const handleDeleteSubject = (subjectCode: string, subjectName: string) => {
    if (!confirm(`Disable "${subjectName}"? This will mark it as inactive but preserve all data.`)) {
      return;
    }
    if (!user?.school_id || !selected_branch?.branch_id) {
      toast.error('School or branch information is missing');
      return;
    }

    _post(
      'subjects',
      {
        school_id: user.school_id,
        branch_id: selected_branch.branch_id,
        subject_code: subjectCode,
        status: 'Inactive',
        query_type: 'soft_delete_subject',
      },
      (res) => {
        if (res.success) {
          toast.success('Subject disabled successfully');
          fetchSubjects();
        } else {
          toast.error(res.message || 'Failed to disable subject');
        }
      },
      (err) => {
        console.error(err);
        toast.error('Error disabling subject');
      }
    );
  };

  // Re-enable subject
  const handleReEnableSubject = (subjectCode: string) => {
    if (!user?.school_id || !selected_branch?.branch_id) {
      toast.error('School or branch information is missing');
      return;
    }

    _post(
      'subjects',
      {
        school_id: user.school_id,
        branch_id: selected_branch.branch_id,
        subject_code: subjectCode,
        status: 'Active',
        query_type: 'enable_subject',
      },
      (res) => {
        if (res.success) {
          toast.success('Subject re-enabled successfully');
          fetchSubjects();
        } else {
          toast.error(res.message || 'Failed to re-enable subject');
        }
      },
      (err) => {
        console.error(err);
        toast.error('Error re-enabling subject');
      }
    );
  };

  // Toggle helpers
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) newSet.delete(section); else newSet.add(section);
      return newSet;
    });
  };

  const toggleClass = (classCode: string) => {
    setExpandedClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classCode)) newSet.delete(classCode); else newSet.add(classCode);
      return newSet;
    });
  };

  const handleOpenManageModal = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    const classSubjects = getClassSubjects(classItem.class_code).map(s => s.subject);
    setSelectedSubjects(classSubjects);
    setCustomSubjects([]);
    setShowManageModal(true);
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#002a56] dark:text-white tracking-tight mb-1">
          Subjects Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage subjects for classes and organize your school curriculum
        </p>
      </div>

      {/* Quick Stats Grid Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
          <CardBody className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Subjects</p>
              <p className="text-2xl font-extrabold text-[#002a56] dark:text-sky-400">
                {subjects.filter(s => s.status !== 'Inactive').length}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#002a56]/10 dark:bg-sky-500/10 text-[#002a56] dark:text-sky-400">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
          <CardBody className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Active Mapped Sections</p>
              <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                {Object.keys(groupedClasses).length}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <School className="h-6 w-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
          <CardBody className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Disabled Subjects</p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {subjects.filter(s => s.status === 'Inactive').length}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Settings className="h-6 w-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Action Filters Panel Card */}
      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Subject Control Deck</h3>
              <p className="text-xs text-gray-400">Filter parameters or instantiate curriculum assignments inside grade streams.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
                className="h-8 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 gap-1"
              >
                {showInactive ? (
                  <>
                    <EyeOff className="h-4 w-4" /> Hide Disabled Items
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" /> Show Disabled Records
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowAddModal(true);
                  setActiveSection(storeSections?.[0]?.section_name || '');
                  setSelectedSubjects([]);
                  setCustomSubjects([]);
                }}
                className="rounded-xl text-xs font-bold h-9 bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90 gap-1.5 shadow-sm px-3.5 border-none"
              >
                <Plus className="h-4 w-4" /> Add Section Subjects
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* Subjects Organized by Section & Classes Grid Framework */}
      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800/60">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#002a56] dark:text-sky-400" />
            <CardTitle className="text-base font-bold text-gray-800 dark:text-gray-200">Curriculum Inventory Sheet</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400 animate-pulse">Loading curriculum schema...</div>
          ) : subjects.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-sm mx-auto">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No Subjects Found</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Map initial training structures or instantiate parameters via deck portal.</p>
              </div>
              <Button onClick={() => { setShowAddModal(true); setActiveSection(storeSections?.[0]?.section_name || ''); }} className="rounded-xl text-xs font-bold h-9 bg-[#002a56] text-white dark:bg-sky-600 px-4">
                <Plus className="h-4 w-4 mr-1.5" /> Initialize Subjects Catalog
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60 p-4 space-y-4">
              {Object.keys(groupedClasses).length > 0 ? (
                Object.entries(groupedClasses).map(([section, sectionClasses]) => {
                  const normalizedSection = section.toUpperCase();
                  const isSectionExpanded = expandedSections.has(normalizedSection);
                  
                  return (
                    <Card key={section} className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden border-l-4 border-[#002a56] dark:border-gray-500 mb-3">
                      <CardBody className="p-0">
                        <button
                          type="button"
                          onClick={() => toggleSection(normalizedSection)}
                          className="w-full p-5 flex items-center justify-between hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors text-left outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#002a56]/10 dark:bg-sky-500/10 text-[#002a56] dark:text-sky-400">
                              <School className="h-5 w-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{section} Section</h4>
                              <p className="text-xs text-gray-400 font-medium">
                                {sectionClasses.length} class{sectionClasses.length !== 1 ? 'es' : ''}
                                {subjectsBySection[normalizedSection] && (
                                  <span className="ml-1.5 text-[#002a56] dark:text-sky-400 font-semibold">
                                    • {subjectsBySection[normalizedSection].length} subject{subjectsBySection[normalizedSection].length !== 1 ? 's' : ''} Mapped
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          {isSectionExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                        </button>
                        
                        {isSectionExpanded && (
                          <div className="px-5 pb-5 bg-gray-50/20 dark:bg-gray-800/5 pt-2 animate-in fade-in duration-200 pl-0 sm:pl-11 space-y-3">
                            {sectionClasses.map((classItem) => {
                              const classSubjects = getClassSubjects(classItem.class_code, classItem.class_name);
                              const isClassExpanded = expandedClasses.has(classItem.class_code);
                              const orphanSubjects = subjectsBySection[normalizedSection]?.filter(s => String(s.class_code || '').trim() === String(classItem.class_code || '').trim()) || [];
                              const allClassSubjects = classSubjects.length > 0 ? classSubjects : orphanSubjects;
                              
                              return (
                                <Card key={classItem.class_code} className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 space-y-3">
                                  <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <button type="button" onClick={() => toggleClass(classItem.class_code)} className="flex items-center gap-2 flex-1 text-left outline-none">
                                      <h5 className="font-bold text-xs text-gray-700 dark:text-gray-200">{classItem.class_name}</h5>
                                      <Badge className="bg-[#002a56]/5 text-[#002a56] dark:bg-sky-500/10 dark:text-sky-400 border-none rounded-md text-[10px] font-bold px-2 py-0.5">{allClassSubjects.length} subjects</Badge>
                                      {isClassExpanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-auto" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400 ml-auto" />}
                                    </button>
                                    <Button size="sm" variant="ghost" onClick={() => handleOpenManageModal(classItem)} className="h-7 text-[10px] rounded-lg px-2 bg-gray-50 border text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-bold gap-1"><Settings className="h-3 w-3" /> Manage</Button>
                                  </div>
                                  
                                  {isClassExpanded && (
                                    <div className="pt-3 border-t border-gray-50 dark:border-gray-800/60 animate-in fade-in duration-200">
                                      {allClassSubjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                          {allClassSubjects.map((subject) => (
                                            <Badge key={subject.subject_code || `${subject.subject}-${subject.class_code}`} className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-lg border-none flex items-center gap-1.5 shadow-none", getSubjectTypeColor(subject.type))}>
                                              <span className={subject.status === 'Inactive' ? 'line-through opacity-50 font-normal' : ''}>{subject.subject}</span>
                                              {subject.status === 'Inactive' && <span className="text-[9px] font-medium text-rose-600">(Disabled)</span>}
                                              {subject.status === 'Inactive' ? (
                                                <Button variant="ghost" size="sm" onClick={() => handleReEnableSubject(subject.subject_code)} className="h-4 w-4 p-0 text-emerald-600 hover:bg-emerald-50 rounded-full"><Check className="h-2.5 w-2.5" /></Button>
                                              ) : (
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteSubject(subject.subject_code, subject.subject)} className="h-4 w-4 p-0 text-rose-500 hover:bg-rose-50 rounded-full"><X className="h-2.5 w-2.5" /></Button>
                                              )}
                                            </Badge>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100/50 dark:border-gray-800/80 rounded-xl">
                                          <p className="text-[11px] text-gray-400 italic font-medium">No {showInactive ? '' : 'active '}subjects linked inside this classroom index.</p>
                                          <Button size="sm" variant="ghost" onClick={() => handleOpenManageModal(classItem)} className="h-6 text-[10px] rounded-lg px-2 text-[#002a56] bg-[#002a56]/5 dark:text-sky-400 dark:bg-sky-500/10 font-bold">+ Include Subjects</Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  );
                })
                       ) : (
                Object.entries(subjectsBySection).map(([section, sectionSubjects]) => {
                  const isSectionExpanded = expandedSections.has(section);
                  const activeSubjects = showInactive 
                    ? sectionSubjects 
                    : sectionSubjects.filter(s => s.status !== 'Inactive');
                  
                  const subjectsByClass = activeSubjects.reduce((acc, subject) => {
                    const classCode = String(subject.class_code || 'Unassigned');
                    if (!acc[classCode]) acc[classCode] = [];
                    acc[classCode].push(subject);
                    return acc;
                  }, {} as Record<string, Subject[]>);
                  
                  return (
                    <Card key={section} className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden border-l-4 border-[#002a56] dark:border-gray-500 mb-3">
                      <CardBody className="p-0">
                        <button
                          type="button"
                          onClick={() => toggleSection(section)}
                          className="w-full p-5 flex items-center justify-between hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors text-left outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#002a56]/10 dark:bg-sky-500/10 text-[#002a56] dark:text-sky-400">
                              <School className="h-5 w-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{section} Section</h4>
                              <p className="text-xs text-gray-400 font-medium">{activeSubjects.length} subject{activeSubjects.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          {isSectionExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                        </button>
                        
                        {isSectionExpanded && (
                          <div className="px-5 pb-5 bg-gray-50/20 dark:bg-gray-800/5 pt-2 animate-in fade-in duration-200 pl-0 sm:pl-11 space-y-3">
                            {Object.entries(subjectsByClass).map(([classCode, classSubjects]) => {
                              const classItem = classCodeMap.get(classCode);
                              const className = classItem?.class_name || `Class ${classCode}`;
                              const isClassExpanded = expandedClasses.has(classCode);
                              
                              return (
                                <Card key={classCode} className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 space-y-3">
                                  <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <button type="button" onClick={() => toggleClass(classCode)} className="flex items-center gap-2 flex-1 text-left outline-none">
                                      <h5 className="font-bold text-xs text-gray-700 dark:text-gray-200">{className}</h5>
                                      <Badge className="bg-[#002a56]/5 text-[#002a56] dark:bg-sky-500/10 dark:text-sky-400 border-none rounded-md text-[10px] font-bold px-2 py-0.5">{classSubjects.length} subjects</Badge>
                                      {isClassExpanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-auto" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400 ml-auto" />}
                                    </button>
                                    {classItem && (
                                      <Button size="sm" variant="ghost" onClick={() => handleOpenManageModal(classItem)} className="h-7 text-[10px] rounded-lg px-2 bg-gray-50 border text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-bold gap-1"><Settings className="h-3 w-3" /> Manage</Button>
                                    )}
                                  </div>
                                  
                                  {isClassExpanded && (
                                    <div className="pt-3 border-t border-gray-50 dark:border-gray-800/60 animate-in fade-in duration-200">
                                      <div className="flex flex-wrap gap-1.5">
                                        {classSubjects.map((subject) => (
                                          <Badge key={subject.subject_code || `${subject.subject}-${subject.class_code}`} className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-lg border-none flex items-center gap-1.5 shadow-none", getSubjectTypeColor(subject.type))}>
                                            <span className={subject.status === 'Inactive' ? 'line-through opacity-50 font-normal' : ''}>{subject.subject}</span>
                                            {subject.status === 'Inactive' && <span className="text-[9px] font-medium text-rose-600">(Disabled)</span>}
                                            {subject.status === 'Inactive' ? (
                                              <Button variant="ghost" size="sm" onClick={() => handleReEnableSubject(subject.subject_code)} className="h-4 w-4 p-0 text-emerald-600 hover:bg-emerald-50 rounded-full"><Check className="h-2.5 w-2.5" /></Button>
                                            ) : (
                                              <Button variant="ghost" size="sm" onClick={() => handleDeleteSubject(subject.subject_code, subject.subject)} className="h-4 w-4 p-0 text-rose-500 hover:bg-rose-50 rounded-full"><X className="h-2.5 w-2.5" /></Button>
                                            )}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Subjects Custom Pop-up Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-none bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden animate-in scale-in-95 duration-200 custom-scrollbar">
            <CardHeader className="p-6 pb-4 border-b border-gray-50 dark:border-gray-800/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#002a56] dark:text-sky-400 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Subjects to Section
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => { setShowAddModal(false); setSelectedSubjects([]); setCustomSubjects([]); }} className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Select Target Section *</Label>
                <select
                  value={activeSection}
                  onChange={(e) => { setActiveSection(e.target.value); setSelectedSubjects([]); }}
                  className="w-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none rounded-xl px-3 py-2 h-10 outline-none focus:ring-1 focus:ring-[#002a56] cursor-pointer"
                >
                  <option value="">Choose a section</option>
                  {(storeSections || []).map((section: Section) => (
                    <option key={section.section_id} value={section.section_name}>{section.section_name}</option>
                  ))}
                </select>
              </div>

              {activeSection && (
                <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Choose Subjects Catalog *</Label>
                    <div className="max-h-60 overflow-y-auto space-y-2 p-4 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl custom-scrollbar pr-1">
                      {getAvailableSubjects(activeSection).map((subject) => {
                        const isSelected = selectedSubjects.includes(subject.name);
                        const exists = subjects.some(s => s.subject.toLowerCase() === subject.name.toLowerCase() && s.status !== 'Inactive');
                        return (
                          <label key={subject.name} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer select-none text-xs font-medium", isSelected ? 'border-[#002a56] bg-[#002a56]/5 dark:border-sky-500 dark:gradient-to-r dark:from-sky-500/5' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900', exists && 'opacity-45')}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={exists}
                              onChange={(e) => {
                                if (exists) return;
                                if (e.target.checked) setSelectedSubjects(prev => [...prev, subject.name]);
                                else setSelectedSubjects(prev => prev.filter(s => s !== subject.name));
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-[#002a56] focus:ring-[#002a56]"
                            />
                            <div className="flex-1 font-bold text-gray-700 dark:text-gray-200">{subject.name}</div>
                            <Badge className={cn("text-[9px] font-bold uppercase border-none rounded-md px-1.5 shadow-none", getSubjectTypeColor(subject.type))}>{subject.type}</Badge>
                            {exists && <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-none rounded-md text-[9px] font-bold px-1.5">Linked</Badge>}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Include Custom Subject elements options */}
                  <div className="space-y-2 p-4 bg-gray-50/40 dark:bg-gray-800/20 border border-gray-100/50 dark:border-gray-800 rounded-2xl">
                    <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Include Custom Subject Row</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input value={customSubjectName} onChange={(e) => setCustomSubjectName(e.target.value)} placeholder="Enter unique subject title" className="flex-1 rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900" />
                      <select value={customSubjectType} onChange={(e) => setCustomSubjectType(e.target.value)} className="w-full sm:w-36 text-xs font-semibold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 h-10 outline-none focus:ring-1 focus:ring-[#002a56]">
                        <option value="core">Core</option>
                        <option value="science">Science</option>
                        <option value="art">Art</option>
                        <option value="commercial">Commercial</option>
                        <option value="technology">Technology</option>
                        <option value="vocational">Vocational</option>
                        <option value="health">Health</option>
                        <option value="selective">Selective</option>
                      </select>
                      <Button onClick={handleAddCustomSubject} variant="ghost" className="h-10 text-xs font-bold rounded-xl px-4 bg-gray-100 hover:bg-gray-200 border-none text-[#002a56] dark:bg-gray-800 dark:text-sky-400 shrink-0">Add Item</Button>
                    </div>
                    {customSubjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {customSubjects.map((sub) => <Badge key={sub.name} className="text-[10px] font-bold px-2 py-0.5 rounded-lg border-none bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">{sub.name}</Badge>)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 pt-4 border-t border-gray-50 dark:border-gray-800/60">
                <Button variant="ghost" size="sm" onClick={() => { setShowAddModal(false); setSelectedSubjects([]); setCustomSubjects([]); }} className="flex-1 h-10 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50">Cancel</Button>
                <Button onClick={handleAddSubjects} disabled={selectedSubjects.length === 0 || !activeSection} className="flex-1 h-10 rounded-xl text-xs font-bold bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90 border-none shadow-sm"><Check className="h-4 w-4 mr-1.5" /> Save Catalog ({selectedSubjects.length} Items)</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
      {/* Manage Subjects Individual Class Custom Modal Overlay */}
      {showManageModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-none bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden animate-in scale-in-95 duration-200 custom-scrollbar">
            <CardHeader className="p-6 pb-4 border-b border-gray-50 dark:border-gray-800/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#002a56] dark:text-sky-400 flex items-center gap-1.5">
                  <Settings className="h-4 w-4" /> Manage Subjects for {selectedClass.class_name}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => { setShowManageModal(false); setSelectedClass(null); setSelectedSubjects([]); setCustomSubjects([]); }} className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Modify Target Classroom Mapping</Label>
                <div className="max-h-60 overflow-y-auto space-y-2 p-4 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl custom-scrollbar pr-1">
                  {getAvailableSubjects(selectedClass.section).map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.name);
                    return (
                      <label key={subject.name} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer select-none text-xs font-medium", isSelected ? 'border-[#002a56] bg-[#002a56]/5 dark:border-sky-500 dark:gradient-to-r dark:from-sky-500/5' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900')}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSubjects(prev => [...prev, subject.name]);
                            else setSelectedSubjects(prev => prev.filter(s => s !== subject.name));
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#002a56] focus:ring-[#002a56]"
                        />
                        <div className="flex-1 font-bold text-gray-700 dark:text-gray-200">{subject.name}</div>
                        <Badge className={cn("text-[9px] font-bold uppercase border-none rounded-md px-1.5 shadow-none", getSubjectTypeColor(subject.type))}>{subject.type}</Badge>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom Subject section for single classroom edit window */}
              <div className="space-y-2 p-4 bg-gray-50/40 dark:bg-gray-800/20 border border-gray-100/50 dark:border-gray-800 rounded-2xl">
                <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Include Custom Subject Row</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input value={customSubjectName} onChange={(e) => setCustomSubjectName(e.target.value)} placeholder="Enter unique subject title" className="flex-1 rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900" />
                  <select value={customSubjectType} onChange={(e) => setCustomSubjectType(e.target.value)} className="w-full sm:w-36 text-xs font-semibold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 h-10 outline-none focus:ring-1 focus:ring-[#002a56]">
                    <option value="core">Core</option>
                    <option value="science">Science</option>
                    <option value="art">Art</option>
                    <option value="commercial">Commercial</option>
                    <option value="technology">Technology</option>
                    <option value="vocational">Vocational</option>
                    <option value="health">Health</option>
                    <option value="selective">Selective</option>
                  </select>
                  <Button onClick={handleAddCustomSubject} variant="ghost" className="h-10 text-xs font-bold rounded-xl px-4 bg-gray-100 hover:bg-gray-200 border-none text-[#002a56] dark:bg-gray-800 dark:text-sky-400 shrink-0">Add Item</Button>
                </div>
                {customSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {customSubjects.map((sub) => <Badge key={sub.name} className="text-[10px] font-bold px-2 py-0.5 rounded-lg border-none bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">{sub.name}</Badge>)}
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-gray-50 dark:border-gray-800/60">
                <Button variant="ghost" size="sm" onClick={() => { setShowManageModal(false); setSelectedClass(null); setSelectedSubjects([]); setCustomSubjects([]); }} className="flex-1 h-10 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50">Cancel</Button>
                <Button onClick={handleManageSubjects} className="flex-1 h-10 rounded-xl text-xs font-bold bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90 border-none shadow-sm"><Check className="h-4 w-4 mr-1.5" /> Synchronize Matrix Changes</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
