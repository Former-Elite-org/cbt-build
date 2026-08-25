// import React, { useEffect, useState, useCallback } from 'react';
// import { useAuthStore } from '@/features/auth/store/authStore';
// import { _get, _post } from '@/Helper';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import toast from 'react-hot-toast';
// import { Loader2 } from 'lucide-react';

// interface Student {
//   admission_no?: string;
//   student_name?: string;
//   first_name?: string;
//   surname?: string;
//   sex?: string;
//   class_name?: string;
//   current_class?: string;
//   section?: string;
//   status?: string;
//   password?: string;
// }

// interface AddStudentModalProps {
//   open: boolean;
//   onClose: () => void;
//   student?: Student | null;
//   onSuccess: () => void;
// }

// export default function AddStudentModal({ open, onClose, student, onSuccess }: AddStudentModalProps) {
//   const { user, selected_branch, sections: storeSections, classes: storeClasses } = useAuthStore();
//   const isEdit = !!student;

//   const [loading, setLoading] = useState(false);
//   const [sections, setSections] = useState<any[]>([]);
//   const [classes, setClasses] = useState<any[]>([]);

//   // Form state
//   const [formData, setFormData] = useState({
//     first_name: '',
//     surname: '',
//     sex: '',
//     section: '',
//     current_class: '',
//     admission_no: '',
//     password: '123456', // Default password
//   });

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
//     if (!formData.section || !user?.school_id) {
//       setClasses([]);
//       return;
//     }

//     _get(
//       `classes?query_type=select-section-classes&section=${formData.section}&school_id=${user.school_id}&branch_id=${selected_branch?.branch_id}`,
//       (res) => {
//         if (res.success && Array.isArray(res.data)) {
//           setClasses(res.data);
//         } else if (storeClasses && storeClasses.length > 0) {
//           const filtered = storeClasses.filter(
//             (cls: any) => (cls.section || '').toUpperCase() === formData.section.toUpperCase()
//           );
//           setClasses(filtered);
//         }
//       },
//       (err) => {
//         console.error('Error fetching classes:', err);
//         if (storeClasses && storeClasses.length > 0) {
//           const filtered = storeClasses.filter(
//             (cls: any) => (cls.section || '').toUpperCase() === formData.section.toUpperCase()
//           );
//           setClasses(filtered);
//         }
//       }
//     );
//   }, [formData.section, user?.school_id, selected_branch?.branch_id, storeClasses]);

//   useEffect(() => {
//     if (open) {
//       fetchSections();
//       if (isEdit && student) {
//         // Populate form with student data
//         setFormData({
//           first_name: student.first_name || student.student_name?.split(' ')[0] || '',
//           surname: student.surname || student.student_name?.split(' ').slice(1).join(' ') || '',
//           sex: student.sex || '',
//           section: student.section || '',
//           current_class: student.current_class || student.class_code || '',
//           admission_no: student.admission_no || '',
//           password: student.password || '123456',
//         });
//       } else {
//         // Reset form
//         setFormData({
//           first_name: '',
//           surname: '',
//           sex: '',
//           section: '',
//           current_class: '',
//           admission_no: '',
//           password: '123456',
//         });
//       }
//     }
//   }, [open, isEdit, student, fetchSections]);

//   useEffect(() => {
//     fetchClasses();
//   }, [fetchClasses]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validation
//     if (!formData.first_name || !formData.surname) {
//       toast.error('Please enter first name and surname');
//       return;
//     }

//     if (!formData.sex) {
//       toast.error('Please select gender');
//       return;
//     }

//     if (!formData.section) {
//       toast.error('Please select section');
//       return;
//     }

//     if (!formData.current_class) {
//       toast.error('Please select class');
//       return;
//     }

//     setLoading(true);

//     const studentName = `${formData.first_name} ${formData.surname}`.trim();
//     const selectedClass = classes.find((cls) => cls.class_code === formData.current_class);

//     const payload = {
//       ...formData,
//       student_name: studentName,
//       class_name: selectedClass?.class_name || formData.current_class,
//       class_code: formData.current_class,
//       section: formData.section,
//       branch_id: selected_branch?.branch_id,
//       school_id: user?.school_id,
//       status: 'Active',
//       query_type: isEdit ? 'update' : 'returning_student',
//     };

//     if (isEdit && student?.admission_no) {
//       payload.admission_no = student.admission_no;
//     }

//     _post(
//       isEdit ? 'students' : 'students/v2',
//       payload,
//       (res) => {
//         setLoading(false);
//         if (res.success) {
//           toast.success(isEdit ? 'Student updated successfully' : 'Student added successfully');
//           onSuccess();
//         } else {
//           toast.error(res.message || 'Failed to save student');
//         }
//       },
//       (err) => {
//         setLoading(false);
//         console.error('Error saving student:', err);
//         toast.error('Network error. Please try again.');
//       }
//     );
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-gradient-primary text-2xl">
//             {isEdit ? 'Edit Student' : 'Add New Student'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEdit
//               ? 'Update student information'
//               : 'Fill in the required information to add a new student'}
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Personal Information */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white">
//               Personal Information
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="first_name">First Name *</Label>
//                 <Input
//                   id="first_name"
//                   value={formData.first_name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, first_name: e.target.value })
//                   }
//                   placeholder="Enter first name"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="surname">Surname *</Label>
//                 <Input
//                   id="surname"
//                   value={formData.surname}
//                   onChange={(e) =>
//                     setFormData({ ...formData, surname: e.target.value })
//                   }
//                   placeholder="Enter surname"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="sex">Gender *</Label>
//                 <Select
//                   value={formData.sex}
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, sex: value })
//                   }
//                 >
//                   <SelectTrigger id="sex">
//                     <SelectValue placeholder="Select gender" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Male">Male</SelectItem>
//                     <SelectItem value="Female">Female</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="admission_no">Admission Number (Optional)</Label>
//                 <Input
//                   id="admission_no"
//                   value={formData.admission_no}
//                   onChange={(e) =>
//                     setFormData({ ...formData, admission_no: e.target.value })
//                   }
//                   placeholder="Auto-generated if left empty"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Academic Information */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white">
//               Academic Information
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="section">Section *</Label>
//                 <Select
//                   value={formData.section}
//                   onValueChange={(value) => {
//                     setFormData({
//                       ...formData,
//                       section: value,
//                       current_class: '', // Reset class when section changes
//                     });
//                   }}
//                 >
//                   <SelectTrigger id="section">
//                     <SelectValue placeholder="Select section" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {sections.map((sec) => (
//                       <SelectItem
//                         key={sec.section_id || sec.section_name}
//                         value={sec.section_name || sec.section_id}
//                       >
//                         {sec.section_name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="current_class">Class *</Label>
//                 <Select
//                   value={formData.current_class}
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, current_class: value })
//                   }
//                   disabled={!formData.section}
//                 >
//                   <SelectTrigger id="current_class">
//                     <SelectValue placeholder="Select class" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {classes.map((cls) => (
//                       <SelectItem key={cls.class_code} value={cls.class_code}>
//                         {cls.class_name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {!formData.section && (
//                   <p className="text-xs text-gray-500 mt-1">
//                     Please select a section first
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Account Information */}
//           {!isEdit && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white">
//                 Account Information
//               </h3>

//               <div>
//                 <Label htmlFor="password">Default Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   placeholder="Default: 123456"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Student can change this password after first login
//                 </p>
//               </div>
//             </div>
//           )}

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               {isEdit ? 'Update Student' : 'Add Student'}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _get, _post } from '@/Helper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { Loader2, User, Eye, EyeOff } from 'lucide-react';

interface Student {
  admission_no?: string;
  student_name?: string;
  first_name?: string;
  surname?: string;
  sex?: string;
  class_name?: string;
  current_class?: string;
  section?: string;
  status?: string;
  password?: string;
  class_code?: string;
}

interface AddStudentModalProps {
  open: boolean;
  onClose: () => void;
  student?: Student | null;
  onSuccess: () => void;
}

export default function AddStudentModal({ open, onClose, student, onSuccess }: AddStudentModalProps) {
  const { user, selected_branch, sections: storeSections, classes: storeClasses } = useAuthStore();
  const isEdit = !!student;

  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Form state configuration
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    sex: '',
    section: '',
    current_class: '',
    admission_no: '',
    password: '',   // blank on edit means "don't change"
  });

  // Fetch academic sections from local engine or store
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

  // Fetch specific classes inside selected section — include arms
  const fetchClasses = useCallback(() => {
    if (!formData.section || !user?.school_id) {
      setClasses([]);
      return;
    }

    _get(
      `getAllClasses?school_id=${user.school_id}&branch_id=${selected_branch?.branch_id}`,
      (res) => {
        if (res.success && Array.isArray(res.data)) {
          // All classes in this section (parents + arms)
          const inSection = res.data.filter(
            (cls: any) => (cls.section || '').toUpperCase() === formData.section.toUpperCase()
          );
          // Build flat list: parent then its arms
          const parents = inSection.filter((c: any) => !c.parent_id);
          const flat: any[] = [];
          parents.forEach((p: any) => {
            flat.push(p);
            inSection.filter((c: any) => c.parent_id === p.class_code).forEach((arm: any) => {
              flat.push({ ...arm, class_name: `↳ ${arm.class_name}` });
            });
          });
          setClasses(flat);
        } else if (storeClasses && storeClasses.length > 0) {
          const filtered = storeClasses.filter(
            (cls: any) => (cls.section || '').toUpperCase() === formData.section.toUpperCase()
          );
          setClasses(filtered);
        }
      },
      (err) => {
        console.error('Error fetching classes:', err);
        if (storeClasses && storeClasses.length > 0) {
          const filtered = storeClasses.filter(
            (cls: any) => (cls.section || '').toUpperCase() === formData.section.toUpperCase()
          );
          setClasses(filtered);
        }
      }
    );
  }, [formData.section, user?.school_id, selected_branch?.branch_id, storeClasses]);

  useEffect(() => {
    if (open) {
      fetchSections();
      if (isEdit && student) {
        setFormData({
          first_name: student.first_name || student.student_name?.split(' ')[0] || '',
          surname: student.surname || student.student_name?.split(' ').slice(1).join(' ') || '',
          sex: student.sex || '',
          section: student.section || '',
          current_class: student.current_class || student.class_code || '',
          admission_no: student.admission_no || '',
          password: '',  // blank — only update if user types a new one
        });
      } else {
        setFormData({
          first_name: '',
          surname: '',
          sex: '',
          section: '',
          current_class: '',
          admission_no: '',
          password: '123456',
        });
      }
    }
  }, [open, isEdit, student, fetchSections]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);
  // 1. معالجة البيانات وإرسالها للسيرفر
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.surname || !formData.sex || !formData.section || !formData.current_class) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    const studentName = `${formData.first_name} ${formData.surname}`.trim();
    const selectedClass = classes.find((cls) => cls.class_code === formData.current_class);

    const payload: any = {
      ...formData,
      student_name: studentName,
      class_name: selectedClass?.class_name?.replace('↳ ', '') || formData.current_class,
      class_code: formData.current_class,
      section: formData.section,
      branch_id: selected_branch?.branch_id,
      school_id: user?.school_id,
      status: 'Active',
      query_type: isEdit ? 'update' : 'returning_student',
    };
    if (isEdit && student?.admission_no) payload.admission_no = student.admission_no;
    // Skip password update if editing and field was left blank
    if (isEdit && !formData.password.trim()) {
      delete payload.password;
    }

    _post(isEdit ? 'students' : 'students/v2', payload, 
      (res) => {
        setLoading(false);
        if (res.success) {
          toast.success(isEdit ? 'Student updated successfully' : 'Student added successfully');
          onSuccess();
        } else { toast.error(res.message || 'Failed to save student'); }
      },
      (err) => { setLoading(false); toast.error('Network error. Please try again.'); }
    );
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg bg-white dark:bg-gray-900 border-none shadow-xl overflow-hidden p-0">
        <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <User className="h-4 w-4 text-[#00356B]" /> {isEdit ? 'Modify Profile' : 'Register New Student'}
            </DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-xs">First Name *</Label>
              <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="h-9 text-xs rounded-xl" required />
            </div>
            <div className="space-y-1"><Label className="text-xs">Surname *</Label>
              <Input value={formData.surname} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} className="h-9 text-xs rounded-xl" required />
            </div>
            <div className="space-y-1"><Label className="text-xs">Gender *</Label>
              <Select value={formData.sex} onValueChange={(v) => setFormData({ ...formData, sex: v })}>
                <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Admission Number</Label>
              <Input value={formData.admission_no} onChange={(e) => setFormData({ ...formData, admission_no: e.target.value })} disabled={isEdit} className="h-9 text-xs rounded-xl" />
            </div>
            <div className="space-y-1"><Label className="text-xs">Section *</Label>
              <Select value={formData.section} onValueChange={(v) => setFormData({ ...formData, section: v, current_class: '' })}>
                <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{sections.map((s) => (<SelectItem key={s.section_id || s.section_name} value={s.section_name || s.section_id}>{s.section_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Class *</Label>
              <Select value={formData.current_class} onValueChange={(v) => setFormData({ ...formData, current_class: v })} disabled={!formData.section}>
                <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{classes.map((c) => (<SelectItem key={c.class_code} value={c.class_code}>{c.class_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          {/* Password field — always visible, blank on edit = don't change */}
          <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Label className="text-xs">
              {isEdit ? 'New Password' : 'Default Password'}
              {isEdit && <span className="ml-1 font-normal text-gray-400">(leave blank to keep current)</span>}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isEdit ? 'Leave blank to keep unchanged' : 'Default: 123456'}
                className="h-9 text-xs rounded-xl pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
              </button>
            </div>
          </div>
          <div className="pt-3 border-t flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="h-9 text-xs rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading} className="h-9 text-xs rounded-xl bg-[#00356B] text-white">
              {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />} {isEdit ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
