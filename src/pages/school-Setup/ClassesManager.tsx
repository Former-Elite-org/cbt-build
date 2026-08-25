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
//   Users,
//   School,
//   ChevronDown,
//   ChevronRight,
//   X,
//   Check,
//   AlertCircle,
// } from 'lucide-react';
// import { _get, _post, _put, _delete } from '@/Helper';
// import toast from 'react-hot-toast';

// interface ClassArm {
//   id: number;
//   class_name: string;
//   class_code: string;
//   status: string;
// }

// interface Class {
//   id: number;
//   class_name: string;
//   class_code: string;
//   section: string;
//   branch_id: string;
//   school_id: string;
//   status: string;
//   parent_id: string | null;
//   arms: ClassArm[];
// }

// export default function ClassesManager() {
//   const { user, selected_branch, sections: storeSections } = useAuthStore();
  
//   const [classesData, setClassesData] = useState<Class[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
//   // Modal states
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showArmModal, setShowArmModal] = useState(false);
//   const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  
//   // Form states
//   const [form, setForm] = useState({
//     class_name: '',
//     section: '',
//   });
//   const [armForm, setArmForm] = useState({
//     arm_name: '',
//   });

//   // Fetch classes
//   const fetchClasses = useCallback(() => {
//     if (!user?.school_id || !selected_branch?.branch_id) return;
    
//     setLoading(true);
//     _get(
//       `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
//       (res) => {
//         if (res.success && Array.isArray(res.data)) {
//           // Filter only main classes (parent_id is null)
//           const mainClasses = res.data.filter(
//             (cls: Class) => cls.parent_id === null
//           );
//           setClassesData(mainClasses);
//         }
//         setLoading(false);
//       },
//       (err) => {
//         console.error('Error fetching classes:', err);
//         toast.error('Failed to fetch classes');
//         setLoading(false);
//       }
//     );
//   }, [user?.school_id, selected_branch?.branch_id]);

//   useEffect(() => {
//     fetchClasses();
//   }, [fetchClasses]);

//   // Group classes by section
//   const groupedClasses = classesData.reduce((acc, cls) => {
//     if (!acc[cls.section]) {
//       acc[cls.section] = [];
//     }
//     acc[cls.section].push(cls);
//     return acc;
//   }, {} as Record<string, Class[]>);

//   // Modal handlers
//   const handleOpenAddModal = () => {
//     setForm({ class_name: '', section: '' });
//     setShowAddModal(true);
//   };

//   const handleOpenEditModal = (classItem: Class) => {
//     setSelectedClass(classItem);
//     setForm({
//       class_name: classItem.class_name,
//       section: classItem.section,
//     });
//     setShowEditModal(true);
//   };

//   const handleOpenArmModal = (classItem: Class) => {
//     setSelectedClass(classItem);
//     setArmForm({ arm_name: '' });
//     setShowArmModal(true);
//   };

//   // Submit handlers
//   const handleSubmitAdd = () => {
//     if (!form.class_name.trim() || !form.section) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     if (!user?.school_id || !selected_branch?.branch_id) {
//       toast.error('School or branch information is missing');
//       return;
//     }

//     _post(
//       'classes',
//       {
//         class_name: form.class_name,
//         section: form.section,
//         school_id: user.school_id,
//         branch_id: selected_branch.branch_id,
//       },
//       (res) => {
//         if (res.success) {
//           toast.success('Class created successfully!');
//           fetchClasses();
//           setShowAddModal(false);
//           setForm({ class_name: '', section: '' });
//         } else {
//           toast.error('Failed to create class');
//         }
//       },
//       (err) => {
//         console.error(err);
//         toast.error('Error creating class');
//       }
//     );
//   };

//   const handleSubmitEdit = () => {
//     if (!form.class_name.trim() || !selectedClass) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     if (!user?.school_id || !selected_branch?.branch_id) {
//       toast.error('School or branch information is missing');
//       return;
//     }

//     _put(
//       `classes?class_code=${selectedClass.class_code}`,
//       {
//         class_name: form.class_name,
//         section: form.section,
//         school_id: user.school_id,
//         branch_id: selected_branch.branch_id,
//       },
//       (res) => {
//         if (res.success) {
//           toast.success('Class updated successfully!');
//           fetchClasses();
//           setShowEditModal(false);
//           setSelectedClass(null);
//         } else {
//           toast.error('Failed to update class');
//         }
//       },
//       (err) => {
//         console.error(err);
//         toast.error('Error updating class');
//       }
//     );
//   };

//   // const handleSubmitArm = () => {


//   //   if (!armForm.arm_name.trim() || !selectedClass) {
//   //     toast.error('Please enter arm name');
//   //     return;
//   //   }

//   //   if (!user?.school_id || !selected_branch?.branch_id) {
//   //     toast.error('School or branch information is missing');
//   //     return;
//   //   }

//   //   const payload = {
//   //     class_name: selectedClass.class_name,
//   //     section: selectedClass.section,
//   //     school_id: user.school_id,
//   //     branch_id: selected_branch.branch_id,
//   //     class_arms: [
//   //       {
//   //         arm_name: armForm.arm_name,
//   //         status: 'Active',
//   //       },
//   //     ],
//   //   };

//   //   _post(
//   //     'classes',
//   //     payload,
//   //     (res) => {
//   //       if (res.success) {
//   //         toast.success('Class arm added successfully!');
//   //         fetchClasses();
//   //         setShowArmModal(false);
//   //         setSelectedClass(null);
//   //         setArmForm({ arm_name: '' });
//   //       } else {
//   //         toast.error('Failed to add class arm');
//   //       }
//   //     },
//   //     (err) => {
//   //       console.error(err);
//   //       toast.error('Error adding class arm');
//   //     }
//   //   );
//   // };

//   // Delete handlers
  
//   const handleSubmitArm = () => {
//   if (!armForm.arm_name?.trim()) {
//     toast.error('Please enter arm name');
//     return;
//   }

//   if (!selectedClass?.class_name) {
//     toast.error('Please select a class');
//     return;
//   }

//   if (!user?.school_id || !selected_branch?.branch_id) {
//     toast.error('School or branch information is missing');
//     return;
//   }

//   const payload = {
//     class_name: selectedClass.class_name,
//     section: selectedClass.section,
//     school_id: user.school_id,
//     branch_id: selected_branch.branch_id,
//     class_arms: [
//       {
//         arm_name: armForm.arm_name.trim(),
//         status: 'Active',
//       },
//     ],
//   };

//   // DEBUGGING
//   console.log('Selected Class:', selectedClass);
//   console.log('Payload:', JSON.stringify(payload, null, 2));

//   _post(
//     'classes',
//     payload,
//     (res) => {
//       console.log('API RESPONSE:', res);

//       if (res?.success) {
//         toast.success('Class arm added successfully!');

//         fetchClasses();
//         setShowArmModal(false);
//         setSelectedClass(null);
//         setArmForm({ arm_name: '' });
//       } else {
//         toast.error(res?.message || 'Failed to add class arm');
//       }
//     },
//     (err) => {
//       console.error('API ERROR:', err);

//       toast.error(
//         err?.response?.data?.message ||
//           err?.message ||
//           'Error adding class arm'
//       );
//     }
//   );
// };
//   const handleDeleteClass = (classItem: Class) => {
//     if (!confirm(`Are you sure you want to delete ${classItem.class_name}${classItem.arms.length > 0 ? ` and its ${classItem.arms.length} arm(s)` : ''}?`)) {
//       return;
//     }

//     _delete(
//       `classes?class_code=${classItem.class_code}`,
//       {},
//       (res) => {
//         if (res.success) {
//           toast.success('Class deleted successfully!');
//           fetchClasses();
//         } else {
//           toast.error('Failed to delete class');
//         }
//       },
//       (err) => {
//         console.error(err);
//         toast.error('Error deleting class');
//       }
//     );
//   };

//   const handleDeleteArm = (arm: ClassArm) => {
//     if (!confirm(`Are you sure you want to delete arm ${arm.class_name}?`)) {
//       return;
//     }

//     _delete(
//       `classes?class_code=${arm.class_code}`,
//       {},
//       (res) => {
//         if (res.success) {
//           toast.success('Class arm deleted successfully!');
//           fetchClasses();
//         } else {
//           toast.error('Failed to delete class arm');
//         }
//       },
//       (err) => {
//         console.error(err);
//         toast.error('Error deleting class arm');
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

//   const handleExpandAll = () => {
//     setExpandedSections(new Set(Object.keys(groupedClasses)));
//   };

//   const handleCollapseAll = () => {
//     setExpandedSections(new Set());
//   };

//   const getSpecialization = (className: string) => {
//     if (className.includes('Science')) return { name: 'Science', color: 'success' };
//     if (className.includes('Art')) return { name: 'Art', color: 'warning' };
//     if (className.includes('Commercial')) return { name: 'Commercial', color: 'default' };
//     return null;
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="animate-slide-in">
//         <h1 className="text-4xl font-bold text-[#00356B] dark:text-[#f1f1f1] mb-2">
//           Classes Management
//         </h1>
//         <p className="text-gray-400 dark:text-gray-400 text-lg">
//           Manage classes, add arms, and organize your academic structure
//         </p>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//         <Card className="hover-lift">
//           <CardBody className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-400 dark:text-gray-400 mb-1">
//                   Total Classes
//                 </p>
//                 <p className="text-3xl font-bold text-[#00356B] dark:text-[#f1f1f1]">
//                   {classesData.length}
//                 </p>
//               </div>
//               <div className="p-4 rounded-2xl bg-[#00356B]/30 dark:bg-[#00356B]">
//                 <BookOpen className="h-7 w-7 text-[#00356B] dark:text-[#f1f1f1]" />
//               </div>
//             </div>
//           </CardBody>
//         </Card>

//         <Card className="hover-lift">
//           <CardBody className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-400 dark:text-gray-400 mb-1">
//                   Total Arms
//                 </p>
//                 <p className="text-3xl font-bold text-[#00356B] dark:text-[#f1f1f1]">
//                   {classesData.reduce((acc, cls) => acc + (cls.arms?.length || 0), 0)}
//                 </p>
//               </div>
//               <div className="p-4 rounded-2xl bg-[#fad2d9] dark:bg-[#21060a]/30">
//                 <Users className="h-7 w-7 text-[#00356B] dark:text-[#f1f1f1]" />
//               </div>
//             </div>
//           </CardBody>
//         </Card>

//         <Card className="hover-lift">
//           <CardBody className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-400 dark:text-gray-400 mb-1">
//                   Sections
//                 </p>
//                 <p className="text-3xl font-bold text-[#00356B] dark:text-[#f1f1f1]">
//                   {Object.keys(groupedClasses).length}
//                 </p>
//               </div>
//               <div className="p-4 rounded-2xl bg-[#ecfdf5] dark:bg-[#064e3b]/30">
//                 <School className="h-7 w-7 text-[#00356B] dark:text-[#f1f1f1]" />
//               </div>
//             </div>
//           </CardBody>
//         </Card>
//       </div>

//       {/* Main Content */}
//       <Card>
//         <CardHeader>
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <CardTitle className="text-2xl flex items-center gap-2">
//               <BookOpen className="h-6 w-6 text-[#00356B] dark:text-[#f1f1f1]" />
//               <span className="text-[#00356B] dark:text-[#f1f1f1]">All Classes</span>
//             </CardTitle>
            
//             <div className="flex gap-3 text-[#00356B] dark:text-[#f1f1f1] flex-wrap">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={handleExpandAll}
//                 className="shadow-glow-sm border-[#00356B] dark:border-[#f1f1f1]/40"
//               >
//                 <ChevronDown className="h-4 w-4 mr-2 text-[#00356B] dark:text-[#f1f1f1]/40" />
//                 Expand All
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={handleCollapseAll}
//                 className="shadow-glow-sm border-[#00356B] dark:border-[#f1f1f1]/40"
//               >
//                 <ChevronRight className="h-4 w-4 mr-2 text-[#00356B] dark:text-[#f1f1f1]/40" />
//                 Collapse All
//               </Button>
//               <Button
//                 onClick={handleOpenAddModal}
//                 size="sm"
//                 className="shadow-glow-sm"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Class
//               </Button>
//             </div>
//           </div>
//         </CardHeader>
        
//         <CardBody>
//           {loading ? (
//             <div className="text-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//               <p className="mt-4 text-gray-400 dark:text-gray-400">Loading classes...</p>
//             </div>
//           ) : Object.keys(groupedClasses).length === 0 ? (
//             <div className="text-center py-16">
//               <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white mb-2">
//                 No Classes Found
//               </h3>
//               <p className="text-gray-400 dark:text-gray-400 mb-6">
//                 Create your first class to get started
//               </p>
//               <Button onClick={handleOpenAddModal} size="lg">
//                 <Plus className="h-5 w-5 mr-2" />
//                 Create First Class
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {Object.entries(groupedClasses).map(([section, classes]) => {
//                 const isExpanded = expandedSections.has(section);
                
//                 return (
//                   <Card
//                     key={section}
//                     className="border-l-4 border-primary-500 dark:border-gray-400"
//                   >
//                     <CardBody className="p-0 text-[#00356B] dark:text-[#f1f1f1]">
//                       <button
//                         onClick={() => toggleSection(section)}
//                         className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                       >
//                         <div className="flex items-center gap-4">
//                           <div className="p-3 rounded-xl bg-[#00356A] dark:bg-[#00356A]">
//                             <School className="h-6 w-6 text-white dark:text-[#f1f1f1]" />
//                           </div>
//                           <div className="text-left">
//                             <h4 className="text-xl font-bold text-[#00356B] dark:text-[#f1f1f1]">
//                               {section} Section
//                             </h4>
//                             <p className="text-sm text-[#00356B] dark:text-[#f1f1f1]">
//                               {classes.length} class{classes.length !== 1 ? 'es' : ''}
//                             </p>
//                           </div>
//                           <Badge variant="default" className="ml-2">
//                             {classes.length}
//                           </Badge>
//                         </div>
//                         {isExpanded ? (
//                           <ChevronDown className="h-5 w-5 text-gray-400" />
//                         ) : (
//                           <ChevronRight className="h-5 w-5 text-gray-400" />
//                         )}
//                       </button>
                      
//                       {isExpanded && (
//                         <div className="px-6 pb-6 space-y-4 animate-slide-in">
//                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                             {classes.map((classItem) => {
//                               const specialization = getSpecialization(classItem.class_name);
                              
//                               return (
//                                 <Card
//                                   key={classItem.id}
//                                   className="hover-lift border-2 border-gray-500 dark:border-gray-700"
//                                 >
//                                   <CardBody className="p-5">
//                                     <div className="flex items-start justify-between mb-4">
//                                       <div className="flex-1">
//                                         <h5 className="font-bold text-[#00356B] dark:text-[#f1f1f1] mb-1 flex items-center gap-2">
//                                           {classItem.class_name}
//                                           {specialization && (
//                                             <Badge variant={specialization.color as any} className="text-xs">
//                                               {specialization.name}
//                                             </Badge>
//                                           )}
//                                         </h5>
//                                         <p className="text-xs text-gray-500 dark:text-gray-500">
//                                           Code: {classItem.class_code}
//                                         </p>
//                                       </div>
//                                     </div>
                                    
//                                     {classItem.arms && classItem.arms.length > 0 ? (
//                                       <div className="space-y-2">
//                                         <p className="text-xs font-semibold text-gray-400 dark:text-gray-400">
//                                           Arms ({classItem.arms.length}):
//                                         </p>
//                                         <div className="space-y-1">
//                                           {classItem.arms.map((arm) => (
//                                             <div
//                                               key={arm.id}
//                                               className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
//                                             >
//                                               <Badge variant="default" className="text-xs">
//                                                 {arm.class_name}
//                                               </Badge>
//                                               <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 onClick={() => handleDeleteArm(arm)}
//                                                 className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
//                                               >
//                                                 <Trash2 className="h-3 w-3" />
//                                               </Button>
//                                             </div>
//                                           ))}
//                                         </div>
//                                       </div>
//                                     ) : (
//                                       <p className="text-xs text-gray-500 dark:text-gray-500 py-2">
//                                         No arms assigned
//                                       </p>
//                                     )}
                                    
//                                     <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                                       <Button
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={() => handleOpenArmModal(classItem)}
//                                         className="flex-1 dark:bg-gray-400 text-[#00356B] dark:text-[#f1f1f1]"
//                                       >
//                                         <Users className="h-3 w-3 mr-1" />
//                                         Add Arm
//                                       </Button>
//                                       <Button
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={() => handleOpenEditModal(classItem)}
//                                         className=" dark:bg-gray-700/50 border text-[#00356B] dark:text-[#f1f1f1] dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
//                                       >
//                                         <Edit className="h-3 w-3" />
//                                       </Button>
//                                       <Button
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={() => handleDeleteClass(classItem)}
//                                         className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:bg-red-900/20 border dark:border-red-700"
//                                       >
//                                         <Trash2 className="h-3 w-3" />
//                                       </Button>
//                                     </div>
//                                   </CardBody>
//                                 </Card>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       )}
//                     </CardBody>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}
//         </CardBody>
//       </Card>

//       {/* Add Class Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
//           <Card className="w-full max-w-md animate-scale-in">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-xl flex items-center gap-2">
//                   <Plus className="h-5 w-5 text-primary-600 dark:text-primary-400" />
//                   Add New Class
//                 </CardTitle>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => setShowAddModal(false)}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardBody className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="section">Select Section *</Label>
//                 <select
//                   id="section"
//                   value={form.section}
//                   onChange={(e) => setForm({ ...form, section: e.target.value })}
//                   className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
//                 >
//                   <option value="">Choose a section</option>
//                   {storeSections.map((section: any) => (
//                     <option key={section.section_id} value={section.section_name}>
//                       {section.section_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="class_name">Class Name *</Label>
//                 <Input
//                   id="class_name"
//                   value={form.class_name}
//                   onChange={(e) => setForm({ ...form, class_name: e.target.value })}
//                   placeholder="e.g., SS1 Science, JSS2, Primary 3"
//                 />
//               </div>
              
//               <div className="flex gap-3 pt-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => setShowAddModal(false)}
//                   className="flex-1 text-[#00356B] dark:text-[#f1f1f1] dark:bg-gray-700/50 border dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSubmitAdd}
//                   className="flex-1"
//                 >
//                   <Check className="h-4 w-4 mr-2" />
//                   Add Class
//                 </Button>
//               </div>
//             </CardBody>
//           </Card>
//         </div>
//       )}

//       {/* Edit Class Modal */}
//       {showEditModal && selectedClass && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
//           <Card className="w-full max-w-md animate-scale-in">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-xl flex items-center gap-2">
//                   <Edit className="h-5 w-5 text-primary-600 dark:text-primary-400" />
//                   Edit Class
//                 </CardTitle>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => {
//                     setShowEditModal(false);
//                     setSelectedClass(null);
//                   }}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardBody className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="edit_class_name">Class Name *</Label>
//                 <Input
//                   id="edit_class_name"
//                   value={form.class_name}
//                   onChange={(e) => setForm({ ...form, class_name: e.target.value })}
//                   placeholder="Class name"
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="edit_section">Section</Label>
//                 <Input
//                   id="edit_section"
//                   value={form.section}
//                   disabled
//                   className="bg-gray-50 dark:bg-gray-900"
//                 />
//               </div>
              
//               <div className="flex gap-3 pt-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setShowEditModal(false);
//                     setSelectedClass(null);
//                   }}
//                   className="flex-1 text-[#00356B] dark:text-[#f1f1f1] dark:bg-gray-700/50 border dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSubmitEdit}
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

//       {/* Add Arm Modal */}
//       {showArmModal && selectedClass && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
//           <Card className="w-full max-w-md animate-scale-in">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-xl flex items-center gap-2">
//                   <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
//                   Add Arm to {selectedClass.class_name}
//                 </CardTitle>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => {
//                     setShowArmModal(false);
//                     setSelectedClass(null);
//                   }}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardBody className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="arm_name">Arm Name *</Label>
//                 <Input
//                   id="arm_name"
//                   value={armForm.arm_name}
//                   onChange={(e) => setArmForm({ arm_name: e.target.value })}
//                   placeholder="e.g., A, B, C or I, II, III"
//                 />
//               </div>
              
//               <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
//                 <p className="text-sm text-gray-400 dark:text-gray-400">
//                   <strong>Preview:</strong> {selectedClass.class_name} {armForm.arm_name}
//                 </p>
//               </div>
              
//               <div className="flex gap-3 pt-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setShowArmModal(false);
//                     setSelectedClass(null);
//                   }}
//                   className="flex-1 text-[#00356B] dark:text-[#f1f1f1]"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSubmitArm}
//                   className="flex-1"
//                 >
//                   <Check className="h-4 w-4 mr-2" />
//                   Add Arm
//                 </Button>
//               </div>
//             </CardBody>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect, useCallback } from 'react';
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
  Users,
  School,
  ChevronDown,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { _get, _post, _put, _delete } from '@/Helper';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

interface ClassArm {
  id: number;
  class_name: string;
  class_code: string;
  status: string;
}

interface Class {
  id: number;
  class_name: string;
  class_code: string;
  section: string;
  branch_id: string;
  school_id: string;
  status: string;
  parent_id: string | null;
  arms: ClassArm[];
}

export default function ClassesManager() {
  const { user, selected_branch, sections: storeSections } = useAuthStore();
  
  const [classesData, setClassesData] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArmModal, setShowArmModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  
  // Form states
  const [form, setForm] = useState({
    class_name: '',
    section: '',
  });
  const [armForm, setArmForm] = useState({
    arm_name: '',
  });
  // Fetch classes from database
  const fetchClasses = useCallback(() => {
    if (!user?.school_id || !selected_branch?.branch_id) return;
    
    setLoading(true);
    _get(
      `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
      (res) => {
        if (res.success && Array.isArray(res.data)) {
          // Filter only main classes (parent_id is null)
          const mainClasses = res.data.filter(
            (cls: Class) => cls.parent_id === null
          );
          setClassesData(mainClasses);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching classes:', err);
        toast.error('Failed to fetch classes');
        setLoading(false);
      }
    );
  }, [user?.school_id, selected_branch?.branch_id]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Group classes by section name
  const groupedClasses = classesData.reduce((acc, cls) => {
    if (!acc[cls.section]) {
      acc[cls.section] = [];
    }
    acc[cls.section].push(cls);
    return acc;
  }, {} as Record<string, Class[]>);

  // Modal openness controllers
  const handleOpenAddModal = () => {
    setForm({ class_name: '', section: '' });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setForm({
      class_name: classItem.class_name,
      section: classItem.section,
    });
    setShowEditModal(true);
  };

  const handleOpenArmModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setArmForm({ arm_name: '' });
    setShowArmModal(true);
  };
  // Submit handler to add a new class
  const handleSubmitAdd = () => {
    if (!form.class_name.trim() || !form.section) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!user?.school_id || !selected_branch?.branch_id) {
      toast.error('School or branch information is missing');
      return;
    }

    _post(
      'classes',
      {
        class_name: form.class_name,
        section: form.section,
        school_id: user.school_id,
        branch_id: selected_branch.branch_id,
      },
      (res) => {
        if (res.success) {
          toast.success('Class created successfully!');
          fetchClasses();
          setShowAddModal(false);
          setForm({ class_name: '', section: '' });
        } else {
          toast.error('Failed to create class');
        }
      },
      (err) => {
        console.error(err);
        toast.error('Error creating class');
      }
    );
  };

  // Submit handler to update an existing class
  const handleSubmitEdit = () => {
    if (!form.class_name.trim() || !selectedClass) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!user?.school_id || !selected_branch?.branch_id) {
      toast.error('School or branch information is missing');
      return;
    }

    _put(
      `classes?class_code=${selectedClass.class_code}`,
      {
        class_name: form.class_name,
        section: form.section,
        school_id: user.school_id,
        branch_id: selected_branch.branch_id,
      },
      (res) => {
        if (res.success) {
          toast.success('Class updated successfully!');
          fetchClasses();
          setShowEditModal(false);
          setSelectedClass(null);
        } else {
          toast.error('Failed to update class');
        }
      },
      (err) => {
        console.error(err);
        toast.error('Error updating class');
      }
    );
  };

  // Submit handler to add a class arm branch
  const handleSubmitArm = () => {
    if (!armForm.arm_name?.trim()) {
      toast.error('Please enter arm name');
      return;
    }
    if (!selectedClass?.class_name) {
      toast.error('Please select a class');
      return;
    }
    if (!user?.school_id || !selected_branch?.branch_id) {
      toast.error('School or branch information is missing');
      return;
    }

    const payload = {
      class_name: selectedClass.class_name,
      section: selectedClass.section,
      school_id: user.school_id,
      branch_id: selected_branch.branch_id,
      class_arms: [
        {
          arm_name: armForm.arm_name.trim(),
          status: 'Active',
        },
      ],
    };

    _post(
      'classes',
      payload,
      (res) => {
        if (res?.success) {
          toast.success('Class arm added successfully!');
          fetchClasses();
          setShowArmModal(false);
          setSelectedClass(null);
          setArmForm({ arm_name: '' });
        } else {
          toast.error(res?.message || 'Failed to add class arm');
        }
      },
      (err) => {
        console.error(err);
        toast.error('Error adding class arm');
      }
    );
  };

  // Delete handlers
  const handleDeleteClass = (classItem: Class) => {
    if (!confirm(`Are you sure you want to delete ${classItem.class_name}${classItem.arms.length > 0 ? ` and its ${classItem.arms.length} arm(s)` : ''}?`)) {
      return;
    }
    _delete(
      `classes?class_code=${classItem.class_code}`,
      {},
      (res) => {
        if (res.success) {
          toast.success('Class deleted successfully!');
          fetchClasses();
        } else {
          toast.error('Failed to delete class');
        }
      },
      (err) => {
        console.error(err);
        toast.error('Error deleting class');
      }
    );
  };

  const handleDeleteArm = (arm: ClassArm) => {
    if (!confirm(`Are you sure you want to delete arm ${arm.class_name}?`)) {
      return;
    }
    _delete(
      `classes?class_code=${arm.class_code}`,
      {},
      (res) => {
        if (res.success) {
          toast.success('Class arm deleted successfully!');
          fetchClasses();
        } else {
          toast.error('Failed to delete class arm');
        }
      },
      (err) => {
        console.error(err);
        toast.error('Error deleting class arm');
      }
    );
  };

  // Collapsible accordion controllers
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) newSet.delete(section); else newSet.add(section);
      return newSet;
    });
  };

  const handleExpandAll = () => {
    setExpandedSections(new Set(Object.keys(groupedClasses)));
  };

  const handleCollapseAll = () => {
    setExpandedSections(new Set());
  };

  // Get dynamic specialization track labels
  const getSpecialization = (className: string) => {
    if (className.includes('Science')) return { name: 'Science', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' };
    if (className.includes('Art')) return { name: 'Art', color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' };
    if (className.includes('Commercial')) return { name: 'Commercial', color: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-400' };
    return null;
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header controls layout components */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[#002a56] dark:text-white tracking-tight">
            Classes Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage classes, add tracking arms, and organize your academic structure
          </p>
        </div>
      </div>

      {/* Quick Stats Block Grid component layouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
          <CardBody className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Classes</p>
              <p className="text-2xl font-extrabold text-[#002a56] dark:text-gray-400">
                {loading ? '...' : classesData.length}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#002a56]/10 dark:bg-sky-500/10 text-[#002a56] dark:text-gray-400">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
          <CardBody className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Track Arms</p>
              <p className="text-2xl font-extrabold text-[#002a56] dark:text-gray-400">
                {classesData.reduce((acc, cls) => acc + (cls.arms?.length || 0), 0)}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#fad2d9] dark:bg-[#21060a]/30 text-rose-600 dark:text-rose-400">
              <Users className="h-6 w-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl select-none transition-all duration-300 hover:shadow-md">
          <CardBody className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sections</p>
              <p className="text-2xl font-extrabold text-[#002a56] dark:text-gray-400">
                {Object.keys(groupedClasses).length}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#ecfdf5] dark:bg-[#064e3b]/30 text-emerald-600 dark:text-emerald-400">
              <School className="h-6 w-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Render Frame Wrapper */}
      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-[#002a56] dark:text-gray-400" />
              <CardTitle className="text-base font-bold text-gray-800 dark:text-gray-200">All Classes</CardTitle>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandAll}
                className="h-8 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 gap-1"
              >
                <ChevronDown className="h-3.5 w-3.5" /> Expand All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseAll}
                className="h-8 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 gap-1"
              >
                <ChevronRight className="h-3.5 w-3.5" /> Collapse All
              </Button>
              <Button
                onClick={handleOpenAddModal}
                className="rounded-xl text-xs font-bold h-9 bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90 gap-1 border-none shadow-sm px-3.5"
              >
                <Plus className="h-4 w-4" /> Add Class
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400 animate-pulse">Loading classes...</div>
          ) : Object.keys(groupedClasses).length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-sm mx-auto">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No Classes Found</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Create your first class to get started</p>
              </div>
              <Button onClick={handleOpenAddModal} className="rounded-xl text-xs font-bold h-9 bg-[#002a56] text-white dark:bg-sky-600 border-none px-4">
                <Plus className="h-4 w-4 mr-1.5" /> Create First Class
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60 p-4 space-y-4">
              {Object.entries(groupedClasses).map(([section, classes]) => {
                const isExpanded = expandedSections.has(section);
                return (
                  <Card
                    key={section}
                    className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden mb-3 border-l-4 border-[#002a56] dark:border-gray-500"
                  >
                    <CardBody className="p-0">
                      {/* Collapsible Section Switch Strip Bar */}
                      <button
                        type="button"
                        onClick={() => toggleSection(section)}
                        className="w-full p-5 flex items-center justify-between hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors text-left outline-none"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl bg-[#002a56]/10 dark:bg-sky-500/10 text-[#002a56] dark:text-gray-400">
                            <School className="h-5 w-5" />
                          </div>
                          <div className="text-left space-y-0.5">
                            <h4 className="text-base font-bold text-[#002a56] dark:text-[#f1f1f1]">
                              {section} Section
                            </h4>
                            <p className="text-[11px] text-gray-400 font-medium">
                              {classes.length} class{classes.length !== 1 ? 'es' : ''}
                            </p>
                          </div>
                          <Badge className="bg-[#002a56]/5 text-[#002a56] dark:bg-sky-500/10 dark:text-gray-400 border-none rounded-lg text-[10px] font-bold px-2 py-0.5 ml-2">
                            {classes.length}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      
                      {/* Nested Sub-Grid for Classes Items Cards view */}
                      {isExpanded && (
                        <div className="px-5 pb-5 bg-gray-50/20 dark:bg-gray-800/5 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 sm:pl-11">
                            {classes.map((classItem) => {
                              const specialization = getSpecialization(classItem.class_name);
                              
                              return (
                                <Card
                                  key={classItem.id}
                                  className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between group relative"
                                >
                                  <CardBody className="p-5 flex flex-col justify-between h-full gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 space-y-1">
                                        <h5 className="font-bold text-xs text-[#002a56] dark:text-[#f1f1f1] flex items-center gap-1.5 flex-wrap">
                                          {classItem.class_name}
                                          {specialization && (
                                            <Badge className={cn("border-none rounded-md text-[9px] font-bold px-1.5 py-0 shadow-none", specialization.color)}>
                                              {specialization.name}
                                            </Badge>
                                          )}
                                        </h5>
                                        <p className="text-[10px] text-gray-400 font-mono">
                                          Code: {classItem.class_code}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Arms layout parameters view */}
                                    {classItem.arms && classItem.arms.length > 0 ? (
                                      <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-800/60">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                                          Arms ({classItem.arms.length}):
                                        </p>
                                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                                          {classItem.arms.map((arm) => (
                                            <div
                                              key={arm.id}
                                              className="flex items-center justify-between p-1.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100/40 dark:border-gray-800 text-xs font-medium"
                                            >
                                              <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-none rounded-md text-[10px] font-bold px-1.5 py-0">
                                                {arm.class_name}
                                              </Badge>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteArm(arm)}
                                                className="h-6 w-6 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-[10px] text-gray-400 italic font-medium pt-2 border-t border-gray-50 dark:border-gray-800/60">
                                        No arms assigned
                                      </p>
                                    )}
                                    
                                    {/* Component buttons control footer bar */}
                                    <div className="flex gap-1.5 mt-2 pt-3 border-t border-gray-100 dark:border-gray-700 shrink-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenArmModal(classItem)}
                                        className="flex-1 h-8 rounded-xl text-[10px] font-bold text-[#002a56] dark:bg-gray-400 dark:text-[#f1f1f1] border border-gray-100 dark:border-gray-700 gap-1"
                                      >
                                        <Users className="h-3 w-3" />
                                        Add Arm
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenEditModal(classItem)}
                                        className="h-8 w-8 p-0 rounded-xl border border-gray-100 text-gray-400 hover:text-gray-400 dark:bg-gray-700/50 dark:border-gray-700 dark:text-[#f1f1f1] dark:hover:bg-gray-700"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteClass(classItem)}
                                        className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:bg-rose-900/20 border dark:border-rose-700"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </CardBody>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
      {/* Add Class Custom Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-none bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden animate-in scale-in-95 duration-200">
            <CardHeader className="p-6 pb-4 border-b border-gray-50 dark:border-gray-800/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#002a56] dark:text-gray-400 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Class
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                  className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="section" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Select Section *</Label>
                <select
                  id="section"
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  className="w-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-300 border-none rounded-xl px-3 py-2 h-10 outline-none focus:ring-1 focus:ring-[#002a56] cursor-pointer"
                >
                  <option value="">Choose a section</option>
                  {(storeSections || []).map((section: any) => (
                    <option key={section.section_id || section.id} value={section.section_name}>
                      {section.section_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="class_name" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Class Name *</Label>
                <Input
                  id="class_name"
                  value={form.class_name}
                  onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                  placeholder="e.g., SS1 Science, JSS2, Primary 3"
                  className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                />
              </div>
              
              <div className="flex gap-2.5 pt-4 border-t border-gray-800/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-9 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAdd}
                  className="flex-1 h-9 rounded-xl text-xs font-bold bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90 border-none shadow-sm"
                >
                  <Check className="h-4 w-4 mr-1.5 inline" />
                  Add Class
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Edit Class Custom Modal Overlay */}
      {showEditModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-none bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden animate-in scale-in-95 duration-200">
            <CardHeader className="p-6 pb-4 border-b border-gray-50 dark:border-gray-800/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#002a56] dark:text-gray-400 flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Class
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedClass(null);
                  }}
                  className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit_class_name" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Class Name *</Label>
                <Input
                  id="edit_class_name"
                  value={form.class_name}
                  onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                  placeholder="Class name"
                  className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="edit_section" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Section</Label>
                <Input
                  id="edit_section"
                  value={form.section}
                  disabled
                  className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60 font-semibold"
                />
              </div>
              
              <div className="flex gap-2.5 pt-4 border-t border-gray-800/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedClass(null);
                  }}
                  className="flex-1 h-9 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitEdit}
                  className="flex-1 h-9 rounded-xl text-xs font-bold bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90 border-none shadow-sm"
                >
                  <Check className="h-4 w-4 mr-1.5 inline" />
                  Save Changes
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
      {/* Add Arm Custom Live-Preview Modal Overlay */}
      {showArmModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-none bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden animate-in scale-in-95 duration-200">
            <CardHeader className="p-6 pb-4 border-b border-gray-50 dark:border-gray-800/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#002a56] dark:text-gray-400 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Add Arm to {selectedClass.class_name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowArmModal(false);
                    setSelectedClass(null);
                  }}
                  className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="arm_name" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Arm Name *</Label>
                <Input
                  id="arm_name"
                  value={armForm.arm_name}
                  onChange={(e) => setArmForm({ arm_name: e.target.value })}
                  placeholder="e.g., A, B, C or I, II, III"
                  className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
                />
              </div>
              
              {/* Live Preview Display Card component box */}
              <div className="p-3 rounded-xl bg-[#002a56]/5 dark:bg-sky-500/10 border border-[#002a56]/10 dark:border-sky-500/20">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-300">
                  <strong className="text-[#002a56] dark:text-gray-400">Preview:</strong> {selectedClass.class_name} {armForm.arm_name || '___'}
                </p>
              </div>
              
              <div className="flex gap-2.5 pt-4 border-t border-gray-50 dark:border-gray-800/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowArmModal(false);
                    setSelectedClass(null);
                  }}
                  className="flex-1 h-9 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:text-[#f1f1f1]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitArm}
                  className="flex-1 h-9 rounded-xl text-xs font-bold bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90 border-none shadow-sm"
                >
                  <Check className="h-4 w-4 mr-1.5 inline" />
                  Add Arm
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
