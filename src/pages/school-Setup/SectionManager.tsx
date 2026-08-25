// import { useState, useEffect, useCallback } from 'react';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import {
//   Plus,
//   School,
//   Users,
//   ChevronDown,
//   ChevronRight,
//   CheckCircle2,
//   Sparkles,
//   BookOpen,
//   Edit,
//   Trash2,
// } from 'lucide-react';
// import { _get, _post } from '@/Helper';
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

// interface Section {
//   section_id: string;
//   section_name: string;
//   section_address: string;
//   curriculum_type?: string;
// }

// interface GeneratedClass {
//   name: string;
//   section: string;
//   arms: string[];
//   selected: boolean;
// }

// interface SectionTemplate {
//   name: string;
//   classes: string[];
//   allowArms: boolean;
// }

// export default function SectionManager() {
//   const [sections, setSections] = useState<Section[]>([]);
//   const [classes, setClasses] = useState<Class[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
//   const [showGenerator, setShowGenerator] = useState(false);
  
//   // Generator state
//   const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
//   const [enableArms, setEnableArms] = useState(false);
//   const [armOptions, setArmOptions] = useState<string[]>(['A', 'B', 'C']);
//   const [generatedClasses, setGeneratedClasses] = useState<GeneratedClass[]>([]);
//   const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

//   const { user, selected_branch, classes: storeClasses } = useAuthStore();
  
//   // Get school info from user or use defaults
//   const school = {
//     school_id: user?.school_id,
//     section_type: 'nigerian_curriculum', // Default, can be updated if stored in user
//   };

//   const sectionTemplates: SectionTemplate[] = [
//     {
//       name: 'Nursery',
//       classes: ['Nursery 1', 'Nursery 2', 'Nursery 3'],
//       allowArms: true,
//     },
//     {
//       name: 'Primary',
//       classes: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
//       allowArms: true,
//     },
//     {
//       name: 'JSS',
//       classes: ['JSS1', 'JSS2', 'JSS3'],
//       allowArms: true,
//     },
//     {
//       name: 'SS',
//       classes: ['SS1', 'SS2', 'SS3'],
//       allowArms: true,
//     },
//   ];

//   const armPresets = [
//     { name: 'Alphabets', values: ['A', 'B', 'C', 'D', 'E'] },
//     { name: 'Numbers', values: ['1', '2', '3', '4', '5'] },
//     { name: 'Roman', values: ['I', 'II', 'III', 'IV', 'V'] },
//     { name: 'Colors', values: ['Gold', 'Silver', 'Bronze', 'Diamond', 'Emerald'] },
//   ];

//   // Fetch sections
//   const fetchSections = useCallback(() => {
//     if (!user?.school_id || !selected_branch?.branch_id) return;
    
//     setLoading(true);
//     _get(
//       `get-sections?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
//       (res) => {
//         if (res.success && Array.isArray(res.data)) {
//           setSections(res.data);
//         }
//         setLoading(false);
//       },
//       (err) => {
//         console.error('Error fetching sections:', err);
//         toast.error('Failed to fetch sections');
//         setLoading(false);
//       }
//     );
//   }, [user?.school_id, selected_branch?.branch_id]);

//   // Fetch classes
//   const fetchClasses = useCallback(() => {
//     if (!user?.school_id || !selected_branch?.branch_id) return;
    
//     _get(
//       `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
//       (res) => {
//         if (res.success && Array.isArray(res.data)) {
//           setClasses(res.data);
//         }
//       },
//       (err) => {
//         console.error('Error fetching classes:', err);
//         toast.error('Failed to fetch classes');
//       }
//     );
//   }, [user?.school_id, selected_branch?.branch_id]);

//   useEffect(() => {
//     fetchSections();
//     fetchClasses();
//   }, [fetchSections, fetchClasses]);

//   // Generate classes based on selection
//   const handleGenerateClasses = () => {
//     const generated: GeneratedClass[] = [];
    
//     selectedTemplates.forEach(templateName => {
//       const template = sectionTemplates.find(t => t.name === templateName);
//       if (!template) return;
      
//       template.classes.forEach(className => {
//         if (enableArms && armOptions.length > 0) {
//           // Create class with arms
//           generated.push({
//             name: className,
//             section: template.name,
//             arms: [...armOptions],
//             selected: true,
//           });
//         } else {
//           // Create standalone class
//           generated.push({
//             name: className,
//             section: template.name,
//             arms: [],
//             selected: true,
//           });
//         }
//       });
//     });
    
//     setGeneratedClasses(generated);
//     setSelectedClasses(new Set(generated.map((_, idx) => idx.toString())));
//   };

//   useEffect(() => {
//     if (selectedTemplates.size > 0) {
//       handleGenerateClasses();
//     } else {
//       setGeneratedClasses([]);
//       setSelectedClasses(new Set());
//     }
//   }, [selectedTemplates, enableArms, armOptions]);

//   // Create selected classes
//   const handleCreateClasses = async () => {
//     const classesToCreate = generatedClasses.filter((_, idx) => 
//       selectedClasses.has(idx.toString())
//     );
    
//     if (classesToCreate.length === 0) {
//       toast.error('Please select at least one class to create');
//       return;
//     }
    
//     if (!user?.school_id || !selected_branch?.branch_id) {
//       toast.error('School or branch information is missing');
//       return;
//     }
    
//     setCreating(true);
    
//     try {
//       let successCount = 0;
//       let errorCount = 0;
      
//       // Group by section
//       const sectionGroups: Record<string, GeneratedClass[]> = {};
//       classesToCreate.forEach(cls => {
//         if (!sectionGroups[cls.section]) {
//           sectionGroups[cls.section] = [];
//         }
//         sectionGroups[cls.section].push(cls);
//       });
      
//       // Create each section and its classes
//       for (const [sectionName, sectionClasses] of Object.entries(sectionGroups)) {
//         // Create section first
//         const sectionPayload = {
//           query_type: 'create',
//           school_id: user.school_id,
//           section_name: sectionName,
//           curriculum_type: school.section_type,
//           branch_id: selected_branch.branch_id,
//         };
        
//         const sectionRes: any = await new Promise((resolve) =>
//           _post('section-setup', sectionPayload, (res) => resolve(res), (err) => resolve(err))
//         );
        
//         if (sectionRes?.success) {
//           // Create classes in this section
//           for (const cls of sectionClasses) {
//             if (cls.arms.length > 0) {
//               // Create class with arms
//               const classPayload = {
//                 query_type: 'create_with_arms',
//                 class_name: cls.name,
//                 section: sectionName,
//                 school_id: user.school_id,
//                 branch_id: selected_branch.branch_id,
//                 class_arms: cls.arms.map(arm => ({
//                   arm_name: arm,
//                   status: 'Active',
//                 })),
//               };
              
//               const classRes: any = await new Promise((resolve) =>
//                 _post('classes', classPayload, (res) => resolve(res), (err) => resolve(err))
//               );
              
//               if (classRes?.success) {
//                 successCount++;
//               } else {
//                 errorCount++;
//               }
//             } else {
//               // Create standalone class
//               const classPayload = {
//                 query_type: 'create',
//                 class_name: cls.name,
//                 section: sectionName,
//                 school_id: user.school_id,
//                 branch_id: selected_branch.branch_id,
//               };
              
//               const classRes: any = await new Promise((resolve) =>
//                 _post('classes', classPayload, (res) => resolve(res), (err) => resolve(err))
//               );
              
//               if (classRes?.success) {
//                 successCount++;
//               } else {
//                 errorCount++;
//               }
//             }
//           }
//         }
//       }
      
//       if (successCount > 0) {
//         toast.success(`Successfully created ${successCount} class${successCount === 1 ? '' : 'es'}!`);
//         setShowGenerator(false);
//         setSelectedTemplates(new Set());
//         setGeneratedClasses([]);
//         fetchSections();
//         fetchClasses();
//       }
      
//       if (errorCount > 0) {
//         toast.error(`${errorCount} operation(s) failed`);
//       }
//     } catch (error) {
//       console.error('Error creating classes:', error);
//       toast.error('An error occurred while creating classes');
//     } finally {
//       setCreating(false);
//     }
//   };

//   const getClassesForSection = (sectionName: string) =>
//     classes.filter(
//       (cls) =>
//         cls.section?.toLowerCase() === sectionName.toLowerCase() &&
//         cls.parent_id === null
//     );

//   const toggleSection = (sectionId: string) => {
//     setExpandedSections(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(sectionId)) {
//         newSet.delete(sectionId);
//       } else {
//         newSet.add(sectionId);
//       }
//       return newSet;
//     });
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="animate-slide-in">
//         <h1 className="text-4xl font-bold text-[#00356B] dark:text-[#f1f1f1] mb-2">
//           Section & Class Management
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400 text-lg">
//           Manage school sections, classes, and class arms
//         </p>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//         <Card className="hover-lift">
//           <CardBody className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
//                   Total Sections
//                 </p>
//                 <p className="text-3xl font-bold text-[#00356B] dark:text-[#f1f1f1]">
//                   {sections.length}
//                 </p>
//               </div>
//               <div className="p-4 rounded-2xl bg-[#00356B]/30 dark:bg-[00356B]/30">
//                 <School className="h-7 w-7 text-[#00356B] dark:text-[#f1f1f1]/40" />
//               </div>
//             </div>
//           </CardBody>
//         </Card>

//         <Card className="hover-lift">
//           <CardBody className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
//                   Total Classes
//                 </p>
//                 <p className="text-3xl font-bold text-[#00356B] dark:text-[#f1f1f1]">
//                   {classes.filter(c => c.parent_id === null).length}
//                 </p>
//               </div>
//               <div className="p-4 rounded-2xl bg-[#fad2d9] dark:bg-[#21060a]/80">
//                 <BookOpen className="h-7 w-7 text-[#00356B] dark:text-[#f1f1f1]/40" />
//               </div>
//             </div>
//           </CardBody>
//         </Card>

//         <Card className="hover-lift">
//           <CardBody className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
//                   Total Arms
//                 </p>
//                 <p className="text-3xl font-bold text-[#00356B] dark:text-[#f1f1f1]">
//                   {classes.reduce((acc, cls) => acc + (cls.arms?.length || 0), 0)}
//                 </p>
//               </div>
//               <div className="p-4 rounded-2xl bg-[#ecfdf5] dark:bg-[#064e3b]/30 ">
//                 <Users className="h-7 w-7 text-[#00356B] dark:text-[#f1f1f1]/40" />
//               </div>
//             </div>
//           </CardBody>
//         </Card>
//       </div>

//       {/* Generator Section */}
//       {!showGenerator ? (
//         <Card className="border-2 border-dashed border-primary-300 dark:border-gray-600 hover-lift">
//           <CardBody className="p-8 text-center">
//             <div className="w-20 h-20 rounded-full gradient-primary dark:gradient-primary-dark flex items-center justify-center mx-auto mb-4 animate-float">
//               <Sparkles className="h-10 w-10 text-white dark:text-gray-200" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-900  dark:text-white mb-2">
//               Auto-Generate School Structur
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
//               Quickly set up all sections and classes based on your curriculum. 
//               Create multiple classes with arms in just a few clicks!
//             </p>
//             <Button
//               size="lg"
//               onClick={() => setShowGenerator(true)}
//               className="shadow-glow "
//             >
//               <Plus className="h-5 w-5 mr-2" />
//               Configure & Generate
//             </Button>
//           </CardBody>
//         </Card>
//       ) : (
//         <Card className="animate-scale-in">
//           <CardHeader>
//             <CardTitle className="text-2xl flex items-center gap-2">
//               <Sparkles className="h-6 w-6 text-[#00356B] dark:text-[#f1f1f1]" />
//               <span className="text-[#00356B] dark:text-[#f1f1f1]">Generate School Structure</span>
//             </CardTitle>
//           </CardHeader>
//           <CardBody className="space-y-6">
//             {/* Step 1: Select Sections */}
//             <div>
//               <h4 className="text-lg font-bold text-[#00356B] dark:text-[#f1f1f1] mb-4">
//                 Step 1: Select Sections to Create
//               </h4>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {sectionTemplates.map((template) => (
//                   <button
//                     key={template.name}
//                     onClick={() => {
//                       setSelectedTemplates(prev => {
//                         const newSet = new Set(prev);
//                         if (newSet.has(template.name)) {
//                           newSet.delete(template.name);
//                         } else {
//                           newSet.add(template.name);
//                         }
//                         return newSet;
//                       });
//                     }}
//                     className={`p-6 rounded-xl border-2 transition-all duration-300 text-center ${
//                       selectedTemplates.has(template.name)
//                         ? 'border-[#00356B] bg-[#00356B]/10 dark:bg-[#00356B]/30 shadow-glow-sm'
//                         : 'border-gray-200 dark:border-gray-700 hover:border-[#00356B]'
//                     }`}
//                   >
//                     <div className="text-2xl mb-2">
//                       {selectedTemplates.has(template.name) ? (
//                         <CheckCircle2 className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto" />
//                       ) : (
//                         <School className="h-8 w-8 text-gray-400 mx-auto" />
//                       )}
//                     </div>
//                     <p className="font-bold text-gray-900 dark:text-white dark:text-white">
//                       {template.name}
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                       {template.classes.length} classes
//                     </p>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Step 2: Configure Arms */}
//             {selectedTemplates.size > 0 && (
//               <div className="animate-slide-in">
//                 <h4 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white mb-4">
//                   Step 2: Configure Class Arms (Optional)
//                 </h4>
//                 <div className="space-y-4">
//                   <label className="flex items-center gap-3 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={enableArms}
//                       onChange={(e) => setEnableArms(e.target.checked)}
//                       className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//                     />
//                     <span className="text-gray-900 dark:text-white dark:text-white font-semibold">
//                       Enable Class Arms / Streams
//                     </span>
//                   </label>

//                   {enableArms && (
//                     <div className="pl-8 space-y-4 animate-fade-in">
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                           Select Arm Preset
//                         </label>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                           {armPresets.map((preset) => (
//                             <button
//                               key={preset.name}
//                               onClick={() => setArmOptions(preset.values.slice(0, 3))}
//                               className="px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-300 text-sm font-semibold text-gray-900 dark:text-white dark:text-white"
//                             >
//                               {preset.name}
//                             </button>
//                           ))}
//                         </div>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                           Selected Arms
//                         </label>
//                         <div className="flex gap-2 flex-wrap">
//                           {armOptions.map((arm, idx) => (
//                             <Badge key={idx} variant="default" className="text-sm px-3 py-1">
//                               {arm}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Preview */}
//             {generatedClasses.length > 0 && (
//               <div className="animate-scale-in">
//                 <h4 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white mb-4">
//                   Step 3: Review & Create ({generatedClasses.filter((_, idx) => selectedClasses.has(idx.toString())).length} selected)
//                 </h4>
//                 <div className="max-h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
//                   {Array.from(new Set(generatedClasses.map(c => c.section))).map(section => {
//                     const sectionClasses = generatedClasses
//                       .map((cls, idx) => ({ ...cls, idx }))
//                       .filter(c => c.section === section);
                    
//                     return (
//                       <div key={section} className="space-y-2">
//                         <h5 className="font-bold text-gray-900 dark:text-white dark:text-white flex items-center gap-2">
//                           <School className="h-4 w-4 text-primary-600 dark:text-primary-400" />
//                           {section} Section
//                         </h5>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
//                           {sectionClasses.map(({ idx, name, arms }) => (
//                             <label
//                               key={idx}
//                               className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 cursor-pointer transition-colors"
//                             >
//                               <input
//                                 type="checkbox"
//                                 checked={selectedClasses.has(idx.toString())}
//                                 onChange={(e) => {
//                                   setSelectedClasses(prev => {
//                                     const newSet = new Set(prev);
//                                     if (e.target.checked) {
//                                       newSet.add(idx.toString());
//                                     } else {
//                                       newSet.delete(idx.toString());
//                                     }
//                                     return newSet;
//                                   });
//                                 }}
//                                 className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//                               />
//                               <div className="flex-1">
//                                 <p className="font-semibold text-gray-900 dark:text-white dark:text-white">
//                                   {name}
//                                 </p>
//                                 {arms.length > 0 && (
//                                   <div className="flex gap-1 mt-1 flex-wrap">
//                                     {arms.map((arm, armIdx) => (
//                                       <Badge key={armIdx} variant="secondary" className="text-xs">
//                                         {arm}
//                                       </Badge>
//                                     ))}
//                                   </div>
//                                 )}
//                               </div>
//                             </label>
//                           ))}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Actions */}
//             <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setShowGenerator(false);
//                   setSelectedTemplates(new Set());
//                   setGeneratedClasses([]);
//                 }}
//                 className="flex-1 text-[#00356B] dark:text-[#f1f1f1] border-2 border-[#00356B] dark:border-[#f1f1f1] hover:bg-[#00356B]/10 dark:hover:bg-[#f1f1f1]/10"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleCreateClasses}
//                 disabled={selectedClasses.size === 0 || creating}
//                 className="flex-1"
//               >
//                 {creating ? (
//                   <>Creating...</>
//                 ) : (
//                   <>
//                     <CheckCircle2 className="h-4 w-4 mr-2" />
//                     Create {selectedClasses.size} Class{selectedClasses.size !== 1 ? 'es' : ''}
//                   </>
//                 )}
//               </Button>
//             </div>
//           </CardBody>
//         </Card>
//       )}

//       {/* Existing Sections */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl flex items-center gap-2 text-[#00356B] dark:text-[#f1f1f1]">
//             <BookOpen className="h-6 w-6 text-[#00356B] dark:text-[#f1f1f1]" />
//             Existing Sections & Classes
//           </CardTitle>
//         </CardHeader>
//         <CardBody>
//           {loading ? (
//             <div className="text-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//               <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sections...</p>
//             </div>
//           ) : sections.length === 0 ? (
//             <div className="text-center py-16">
//               <School className="h-16 w-16  text-gray-900 dark:text-white mx-auto mb-4" />
//               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
//                 No Sections Found
//               </h3>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Use the generator above to create your first section
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {sections.map((section) => {
//                 const sectionClasses = getClassesForSection(section.section_name);
//                 const isExpanded = expandedSections.has(section.section_id);
                
//                 return (
//                   <Card
//                     key={section.section_id}
//                     className="border-l-4 border-primary-500 dark:border-gray-500"
//                   >
//                     <CardBody className="p-0">
//                       <button
//                         onClick={() => toggleSection(section.section_id)}
//                         className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                       >
//                         <div className="flex items-center gap-4">
//                           <div className="p-3 rounded-xl bg-[#00456B] dark:bg-[#00356B]">
//                             <School className="h-6 w-6 text-white dark:text-white" />
//                           </div>
//                           <div className="text-left">
//                             <h4 className="text-xl font-bold text-gray-900 dark:text-white">
//                               {section.section_name}
//                             </h4>
//                             <p className="text-sm text-gray-600 dark:text-gray-400">
//                               {sectionClasses.length} class{sectionClasses.length !== 1 ? 'es' : ''}
//                             </p>
//                           </div>
//                         </div>
//                         {isExpanded ? (
//                           <ChevronDown className="h-5 w-5 text-gray-400" />
//                         ) : (
//                           <ChevronRight className="h-5 w-5 text-gray-400" />
//                         )}
//                       </button>
                      
//                       {isExpanded && (
//                         <div className="px-6 pb-6 space-y-3 animate-slide-in">
//                           {sectionClasses.length > 0 ? (
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                               {sectionClasses.map((classItem) => (
//                                 <div
//                                   key={classItem.id}
//                                   className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
//                                 >
//                                   <div className="flex items-start justify-between mb-3">
//                                     <h5 className="font-bold text-gray-900 dark:text-white dark:text-white">
//                                       {classItem.class_name}
//                                     </h5>
//                                     <Badge variant="success" className="text-xs">
//                                       Active
//                                     </Badge>
//                                   </div>
                                  
//                                   {classItem.arms && classItem.arms.length > 0 ? (
//                                     <div>
//                                       <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
//                                         Arms:
//                                       </p>
//                                       <div className="flex gap-1 flex-wrap">
//                                         {classItem.arms.map((arm) => (
//                                           <Badge key={arm.id} variant="default" className="text-xs">
//                                             {arm.class_name}
//                                           </Badge>
//                                         ))}
//                                       </div>
//                                     </div>
//                                   ) : (
//                                     <p className="text-xs text-gray-500 dark:text-gray-500">
//                                       No arms assigned
//                                     </p>
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                               No classes in this section
//                             </div>
//                           )}
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
//     </div>
//   );
// }


import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Plus,
  School,
  Users,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  XCircle,
  Loader2,
  Layers,
  Wand2,
  Grid
} from 'lucide-react';
import { _get, _post } from '@/Helper';
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

interface Section {
  section_id: string;
  section_name: string;
  section_address: string;
  curriculum_type?: string;
}

interface GeneratedClass {
  name: string;
  section: string;
  arms: string[];
  selected: boolean;
}

interface SectionTemplate {
  name: string;
  classes: string[];
  allowArms: boolean;
}

export default function SectionManager() {
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showGenerator, setShowGenerator] = useState(false);
  
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [enableArms, setEnableArms] = useState(false);
  const [armOptions, setArmOptions] = useState<string[]>(['A', 'B', 'C']);
  const [generatedClasses, setGeneratedClasses] = useState<GeneratedClass[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

  const { user, selected_branch } = useAuthStore();
  
  const school = {
    school_id: user?.school_id,
    section_type: 'nigerian_curriculum',
  };

  const sectionTemplates: SectionTemplate[] = [
    { name: 'Nursery', classes: ['Nursery 1', 'Nursery 2', 'Nursery 3'], allowArms: true },
    { name: 'Primary', classes: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'], allowArms: true },
    { name: 'JSS', classes: ['JSS1', 'JSS2', 'JSS3'], allowArms: true },
    { name: 'SS', classes: ['SS1', 'SS2', 'SS3'], allowArms: true },
  ];

  const armPresets = [
    { name: 'Alphabets', values: ['A', 'B', 'C', 'D', 'E'] },
    { name: 'Numbers', values: ['1', '2', '3', '4', '5'] },
    { name: 'Roman', values: ['I', 'II', 'III', 'IV', 'V'] },
    { name: 'Colors', values: ['Gold', 'Silver', 'Bronze', 'Diamond', 'Emerald'] },
  ];
  const fetchSections = useCallback(() => {
    if (!user?.school_id || !selected_branch?.branch_id) return;
    setLoading(true);
    _get(
      `get-sections?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
      (res) => {
        if (res.success && Array.isArray(res.data)) setSections(res.data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching sections:', err);
        toast.error('Failed to fetch sections');
        setLoading(false);
      }
    );
  }, [user?.school_id, selected_branch?.branch_id]);

  const fetchClasses = useCallback(() => {
    if (!user?.school_id || !selected_branch?.branch_id) return;
    _get(
      `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch.branch_id}`,
      (res) => {
        if (res.success && Array.isArray(res.data)) setClasses(res.data);
      },
      (err) => {
        console.error('Error fetching classes:', err);
        toast.error('Failed to fetch classes');
      }
    );
  }, [user?.school_id, selected_branch?.branch_id]);

  useEffect(() => {
    fetchSections();
    fetchClasses();
  }, [fetchSections, fetchClasses]);

  const handleGenerateClasses = useCallback(() => {
    const generated: GeneratedClass[] = [];
    selectedTemplates.forEach(templateName => {
      const template = sectionTemplates.find(t => t.name === templateName);
      if (!template) return;
      
      template.classes.forEach(className => {
        generated.push({
          name: className,
          section: template.name,
          arms: enableArms && armOptions.length > 0 ? [...armOptions] : [],
          selected: true,
        });
      });
    });
    setGeneratedClasses(generated);
    setSelectedClasses(new Set(generated.map((_, idx) => idx.toString())));
  }, [selectedTemplates, enableArms, armOptions]);

  useEffect(() => {
    if (selectedTemplates.size > 0) {
      handleGenerateClasses();
    } else {
      setGeneratedClasses([]);
      setSelectedClasses(new Set());
    }
  }, [selectedTemplates, enableArms, armOptions, handleGenerateClasses]);
  const handleCreateClasses = async () => {
    const classesToCreate = generatedClasses.filter((_, idx) => selectedClasses.has(idx.toString()));
    if (classesToCreate.length === 0) {
      toast.error('Please select at least one class to create');
      return;
    }
    if (!user?.school_id || !selected_branch?.branch_id) {
      toast.error('School or branch information is missing');
      return;
    }
    setCreating(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      const sectionGroups: Record<string, GeneratedClass[]> = {};
      classesToCreate.forEach(cls => {
        if (!sectionGroups[cls.section]) sectionGroups[cls.section] = [];
        sectionGroups[cls.section].push(cls);
      });
      
      for (const [sectionName, sectionClasses] of Object.entries(sectionGroups)) {
        const sectionPayload = {
          query_type: 'create',
          school_id: user.school_id,
          section_name: sectionName,
          curriculum_type: school.section_type,
          branch_id: selected_branch.branch_id,
        };
        const sectionRes: any = await new Promise((resolve) =>
          _post('section-setup', sectionPayload, (res) => resolve(res), (err) => resolve(err))
        );
        
        if (sectionRes?.success) {
          for (const cls of sectionClasses) {
            const hasArms = cls.arms.length > 0;
            const classPayload = {
              query_type: hasArms ? 'create_with_arms' : 'create',
              class_name: cls.name,
              section: sectionName,
              school_id: user.school_id,
              branch_id: selected_branch.branch_id,
              ...(hasArms && {
                class_arms: cls.arms.map(arm => ({ arm_name: arm, status: 'Active' }))
              })
            };
            const classRes: any = await new Promise((resolve) =>
              _post('classes', classPayload, (res) => resolve(res), (err) => resolve(err))
            );
            if (classRes?.success) successCount++; else errorCount++;
          }
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} classes!`);
        setShowGenerator(false);
        setSelectedTemplates(new Set());
        setGeneratedClasses([]);
        fetchSections();
        fetchClasses();
      }
      if (errorCount > 0) toast.error(`${errorCount} operation(s) failed`);
    } catch (error) {
      console.error('Error creating classes:', error);
      toast.error('An error occurred while creating classes');
    } finally {
      setCreating(false);
    }
  };

  const getClassesForSection = (sectionName: string) =>
    classes.filter((cls) => cls.section?.toLowerCase() === sectionName.toLowerCase() && cls.parent_id === null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) newSet.delete(sectionId); else newSet.add(sectionId);
      return newSet;
    });
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#002a56] dark:text-white tracking-tight">Section & Class Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage school sections, classes, and class arms parameters</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md">
          <CardBody className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Sections</p>
              <p className="text-2xl font-extrabold text-[#002a56] dark:text-gray-600">{sections.length}</p>
            </div>
            <div className="p-3 bg-[#002a56]/10 dark:bg-sky-500/10 rounded-xl text-[#002a56] dark:text-gray-600"><School className="h-5 w-5" /></div>
          </CardBody>
        </Card>
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md">
          <CardBody className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Classes</p>
              <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">{classes.filter(c => c.parent_id === null).length}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600"><BookOpen className="h-5 w-5" /></div>
          </CardBody>
        </Card>
        <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md">
          <CardBody className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Track Arms</p>
              <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">{classes.reduce((acc, cls) => acc + (cls.arms?.length || 0), 0)}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600"><Users className="h-5 w-5" /></div>
          </CardBody>
        </Card>
      </div>

      {/* Generator Section */}
      {!showGenerator ? (
        <Card className="border-2 border-dashed border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
          <CardBody className="p-8 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#002a56]/10 dark:bg-sky-500/10 flex items-center justify-center mx-auto text-[#002a56] dark:text-gray-600"><Sparkles className="h-8 w-8 text-amber-500" /></div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-gray-800 dark:text-white">Auto-Generate School Structure</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Quickly set up all sections and classes based on your curriculum. Create multiple classes with tracks and sub-arms in just a few clicks!</p>
            </div>
            <Button onClick={() => setShowGenerator(true)} className="rounded-xl text-xs font-bold h-10 px-5 bg-[#002a56] hover:bg-[#002a56]/90 text-white dark:bg-sky-600 dark:hover:bg-sky-600/90 border-none"><Plus className="h-4 w-4 mr-1.5" /> Configure & Generate</Button>
          </CardBody>
        </Card>
      ) : (
        <Card className="border-none bg-white dark:bg-gray-900 shadow-md rounded-2xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <CardHeader className="p-0 border-none pb-2">
            <CardTitle className="text-base font-bold text-[#002a56] dark:text-gray-600 flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /> Generate School Framework Structure</CardTitle>
          </CardHeader>
          <CardBody className="p-0 space-y-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Step 1: Select Streams to Instantiate</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sectionTemplates.map((template) => {
                  const isSelected = selectedTemplates.has(template.name);
                  return (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => {
                        setSelectedTemplates(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(template.name)) newSet.delete(template.name); else newSet.add(template.name);
                          return newSet;
                        });
                      }}
                      className={cn(
                        "p-4 rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-2 justify-center group relative overflow-hidden",
                        isSelected ? "border-[#002a56] bg-[#002a56]/5 text-[#002a56] dark:border-sky-500 dark:bg-sky-500/5 dark:text-gray-600" : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {isSelected ? <CheckCircle2 className="h-5 w-5 text-[#002a56] dark:text-gray-600" /> : <School className="h-5 w-5 text-gray-400" />}
                      <span className="font-bold text-xs">{template.name}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{template.classes.length} classes</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 */}
            {selectedTemplates.size > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800/60 animate-in fade-in duration-200">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Step 2: Configure Class Track Arms (Optional)</h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                    <input
                      type="checkbox"
                      checked={enableArms}
                      onChange={(e) => setEnableArms(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#002a56] focus:ring-[#002a56] dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Enable Sub-Class Arms / Stream Tracks</span>
                  </label>

                  {enableArms && (
                    <div className="pl-6 space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Select Tracking Preset Style</label>
                        <div className="flex flex-wrap gap-2">
                          {armPresets.map((preset) => (
                            <Button
                              key={preset.name}
                              size="sm"
                              variant="outline"
                              onClick={() => setArmOptions(preset.values.slice(0, 3))}
                              className="h-8 rounded-xl text-xs font-semibold border-gray-100 dark:border-gray-800 hover:bg-gray-50 text-gray-600 dark:text-gray-400"
                            >
                              {preset.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Configured Active Sub-Arms</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {armOptions.map((arm, idx) => (
                            <Badge key={idx} className="bg-gray-50 border border-gray-100 text-gray-500 rounded px-2.5 py-0.5 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 text-xs font-bold">{arm}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Step 3 & Preview Action Blocks */}
            {generatedClasses.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800/60 animate-in fade-in duration-200">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Step 3: Review Manifest & Complete ({generatedClasses.filter((_, idx) => selectedClasses.has(idx.toString())).length} selected)</h4>
                <div className="max-h-64 overflow-y-auto space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-2xl custom-scrollbar">
                  {Array.from(new Set(generatedClasses.map(c => c.section))).map(section => {
                    const sectionClasses = generatedClasses.map((cls, idx) => ({ ...cls, idx })).filter(c => c.section === section);
                    return (
                      <div key={section} className="space-y-2">
                        <h5 className="font-bold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><School className="h-3.5 w-3.5 text-[#002a56] dark:text-gray-600" /> {section} Stream</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                          {sectionClasses.map(({ idx, name, arms }) => (
                            <label key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 hover:border-gray-200 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={selectedClasses.has(idx.toString())}
                                onChange={(e) => {
                                  setSelectedClasses(prev => {
                                    const newSet = new Set(prev);
                                    if (e.target.checked) newSet.add(idx.toString()); else newSet.delete(idx.toString());
                                    return newSet;
                                  });
                                }}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#002a56] focus:ring-[#002a56]"
                              />
                              <div className="flex-1 space-y-0.5">
                                <p className="font-bold text-xs text-gray-700 dark:text-gray-200">{name}</p>
                                {arms.length > 0 && (
                                  <div className="flex gap-1 pt-1 flex-wrap">
                                    {arms.map((arm, armIdx) => <Badge key={armIdx} className="text-[9px] font-bold px-1 py-0 border border-gray-100 dark:border-gray-700 rounded bg-gray-50 text-gray-400 dark:bg-gray-800/40">{arm}</Badge>)}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions Form Button controllers */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800/60">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowGenerator(false);
                  setSelectedTemplates(new Set());
                  setGeneratedClasses([]);
                }}
                className="flex-1 rounded-xl text-xs font-bold h-10 border border-gray-100 text-gray-500 dark:border-gray-800 hover:bg-gray-50"
              >
                Cancel assistant
              </Button>
              <Button
                onClick={handleCreateClasses}
                disabled={selectedClasses.size === 0 || creating}
                className="flex-1 rounded-xl text-xs font-bold h-10 bg-emerald-600 text-white hover:bg-emerald-500 border-none shadow-sm flex items-center justify-center gap-1.5"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Create {selectedClasses.size} Stream Classes
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Existing Infrastructure List view Accordions */}
      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800/60">
          <CardTitle className="text-base font-bold text-[#002a56] dark:text-gray-600 flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Configured Academic Inventory Structures
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400 animate-pulse">Loading sections infrastructure...</div>
          ) : sections.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <School className="h-8 w-8 text-gray-300 mx-auto" />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No segment records found. Initialize structure sheet above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {sections.map((section) => {
                const sectionClasses = getClassesForSection(section.section_name);
                const isExpanded = expandedSections.has(section.section_id);
                return (
                  <div key={section.section_id} className="transition-all">
                    <button
                      onClick={() => toggleSection(section.section_id)}
                      className="w-full p-5 flex items-center justify-between hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors text-left outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400">
                          <School className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">{section.section_name} Segment</h4>
                          <p className="text-[11px] text-gray-400 font-medium">{sectionClasses.length} active classes logs Mapped</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-5 pb-5 bg-gray-50/20 dark:bg-gray-800/5 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        {sectionClasses.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pl-0 sm:pl-10">
                            {sectionClasses.map((classItem) => (
                              <div key={classItem.id} className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 shadow-sm flex flex-col justify-between gap-3">
                                <div className="flex items-start justify-between gap-2">
                                  <h5 className="font-bold text-xs text-gray-700 dark:text-gray-200">{classItem.class_name}</h5>
                                  <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-none rounded-md text-[9px] font-bold px-1.5 py-0">Active</Badge>
                                </div>
                                
                                {classItem.arms && classItem.arms.length > 0 ? (
                                  <div className="pt-2 border-t border-gray-50 dark:border-gray-800/60">
                                    <div className="flex gap-1 flex-wrap">
                                      {classItem.arms.map((arm) => (
                                        <Badge key={arm.id} className="text-[9px] font-bold px-1.5 py-0 bg-gray-50 border text-gray-400 rounded dark:bg-gray-800 dark:border-gray-700">{arm.class_name}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-gray-400 italic pt-2 border-t border-gray-50 dark:border-gray-800/60">Standalone Stream</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 py-4 pl-10 font-medium">No classrooms configured inside this segment profile.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
