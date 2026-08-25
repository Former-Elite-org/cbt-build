// import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import toast from "react-hot-toast";
// import { _get, _post, server_url } from "../../Helper";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { ArrowLeft, Save, User, X, Plus } from "lucide-react";

// const teacherSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   email: z.string().email("Invalid email address"),
//   mobile_no: z.string().min(10, "Phone number is required"),
//   sex: z.string().min(1, "Gender is required"),
//   staff_type: z.string().min(1, "Staff type is required"),
//   staff_role: z.string().min(1, "Staff role is required"),
//   password: z.string().min(6, "Password must be at least 6 characters").optional(),
// });

// type TeacherFormData = z.infer<typeof teacherSchema>;

// const TeacherForm = () => {
//   const navigate = useNavigate();
//   const { user, selected_branch, subjects, classes, sections } = useSelector(
//     (state: any) => state.auth
//   );

//   const [subjectAssignments, setSubjectAssignments] = useState<any[]>([]);
//   const [formMasterClasses, setFormMasterClasses] = useState<any[]>([]);
//   const [isSubjectModalVisible, setIsSubjectModalVisible] = useState(false);
//   const [isFormMasterModalVisible, setIsFormMasterModalVisible] = useState(false);
//   const [currentAssignment, setCurrentAssignment] = useState<any>({});
//   const [imagePreview, setImagePreview] = useState<string>("");
//   const [isUploading, setIsUploading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     watch,
//     setValue,
//   } = useForm<TeacherFormData>({
//     resolver: zodResolver(teacherSchema),
//     defaultValues: {
//       staff_type: "Academic Staff",
//       password: "123456",
//     },
//   });

//   const staffRole = watch("staff_role");
//   const staffType = watch("staff_type");

//   const mapped_sections = useMemo(
//     () =>
//       sections?.map((i: any) => ({
//         label: i.section_name,
//         value: i.section_name,
//       })) || [],
//     [sections]
//   );

//   const staffRoles: Record<string, { label: string; value: string }[]> = {
//     "Academic Staff": [
//       { label: "School Head", value: "School Head" },
//       { label: "Vice School Head", value: "Vice School Head" },
//       { label: "Subject Teacher", value: "Subject Teacher" },
//       { label: "Form Master", value: "Form Master" },
//     ],
//   };

//   const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setIsUploading(true);
//     const formData = new FormData();
//     formData.append("media", file);

//     fetch(`${server_url}/upload_transfer_certificate-document`, {
//       method: "POST",
//       headers: {
//         authorization: localStorage.getItem("@@auth_token") || "",
//       },
//       body: formData,
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.url) {
//           setImagePreview(data.url);
//           toast.success("Photo uploaded successfully");
//         }
//         setIsUploading(false);
//       })
//       .catch(() => {
//         toast.error("Failed to upload photo");
//         setIsUploading(false);
//       });
//   };

//   const renderClassOptions = (section: string) => {
//     if (!section) return [];
//     return classes
//       .filter((cls: any) => cls.section === section)
//       .map((c: any) => ({ label: c.class_name, value: c.class_code }));
//   };

//   const renderSubjectOptions = (classCode: string) => {
//     if (!classCode) return [];
//     return subjects
//       .filter((sub: any) => sub.class_code === classCode)
//       .map((s: any) => ({ label: s.subject, value: s.subject_code }));
//   };

//   const handleAddSubjectAssignment = (values: any) => {
//     const classObj = classes.find(
//       (c: any) => c.class_code === values.class_code
//     );
//     const subjectObj = subjects.find(
//       (s: any) => s.subject_code === values.subject_code
//     );
//     setSubjectAssignments([
//       ...subjectAssignments,
//       {
//         ...values,
//         class_name: classObj?.class_name,
//         subject: subjectObj?.subject,
//       },
//     ]);
//     setIsSubjectModalVisible(false);
//     setCurrentAssignment({});
//   };

//   const removeSubjectAssignment = (index: number) => {
//     setSubjectAssignments(subjectAssignments.filter((_, i) => i !== index));
//   };

//   const handleAddFormMasterClass = (values: any) => {
//     const classObj = classes.find(
//       (c: any) => c.class_code === values.class_code
//     );
//     setFormMasterClasses([
//       ...formMasterClasses,
//       {
//         ...values,
//         class_name: classObj?.class_name,
//       },
//     ]);
//     setIsFormMasterModalVisible(false);
//     setCurrentAssignment({});
//   };

//   const removeFormMasterClass = (index: number) => {
//     setFormMasterClasses(formMasterClasses.filter((_, i) => i !== index));
//   };

//   const onSubmit = async (data: TeacherFormData) => {
//     const teacherSubjects = subjectAssignments.map((asgn) => ({
//       query_type: "create",
//       id: 0,
//       subject: asgn.subject,
//       subject_code: asgn.subject_code,
//       class_name: asgn.class_name,
//       class_code: asgn.class_code,
//       section: asgn.section,
//       branch_id: selected_branch.branch_id,
//     }));

//     const teacherRoles =
//       staffRole === "Form Master"
//         ? formMasterClasses.map((asgn) => ({
//             query_type: "create",
//             class_role_id: null,
//             section: asgn.section,
//             class_name: asgn.class_name,
//             class_code: asgn.class_code,
//             role: "Form Master",
//             branch_id: selected_branch.branch_id,
//           }))
//         : [];

//     const payload = {
//       ...data,
//       query_type: "create",
//       teacherSubjects,
//       teacherRoles,
//       school_id: user.school_id,
//       branch_id: selected_branch.branch_id,
//       passport_url: imagePreview,
//       password: data.password || "123456",
//       user_type:
//         ["Subject Teacher", "Form Master"].includes(staffRole)
//           ? "Teacher"
//           : "Admin",
//     };

//     _post(
//       "teachers",
//       payload,
//       (res) => {
//         if (res.success) {
//           toast.success("Teacher created successfully!");
//           navigate("/teachers/list");
//         } else {
//           toast.error(res.message || "Failed to create teacher");
//         }
//       },
//       (err) => {
//         toast.error("An error occurred while creating the teacher.");
//       }
//     );
//   };

//   return (
//     <div className="space-y-6 p-6">
//       <div className="flex items-center gap-4">
//         <Button variant="ghost" onClick={() => navigate("/teachers/list")}>
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Teacher</h1>
//           <p className="text-gray-600 mt-1">Add a new teacher to the system</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Personal Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Personal Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex flex-col items-center gap-4">
//                 <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
//                   {imagePreview ? (
//                     <img
//                       src={imagePreview}
//                       alt="Teacher"
//                       className="h-full w-full object-cover"
//                     />
//                   ) : (
//                     <User className="h-12 w-12 text-gray-400" />
//                   )}
//                 </div>
//                 <div>
//                   <Label htmlFor="photo">Photo (Optional)</Label>
//                   <Input
//                     id="photo"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleUploadChange}
//                     disabled={isUploading}
//                     className="mt-1"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="name">Full Name *</Label>
//                 <Input
//                   id="name"
//                   {...register("name")}
//                   placeholder="Enter full name"
//                 />
//                 {errors.name && (
//                   <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="sex">Gender *</Label>
//                 <Select
//                   value={watch("sex")}
//                   onValueChange={(value) => setValue("sex", value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select gender" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Male">Male</SelectItem>
//                     <SelectItem value="Female">Female</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.sex && (
//                   <p className="text-sm text-red-500 mt-1">{errors.sex.message}</p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Contact & Appointment */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Contact & Appointment</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <Label htmlFor="email">Email Address *</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   {...register("email")}
//                   placeholder="teacher@example.com"
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="mobile_no">Phone Number *</Label>
//                 <Input
//                   id="mobile_no"
//                   {...register("mobile_no")}
//                   placeholder="08012345678"
//                 />
//                 {errors.mobile_no && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.mobile_no.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="staff_type">Staff Type *</Label>
//                 <Select
//                   value={watch("staff_type")}
//                   onValueChange={(value) => {
//                     setValue("staff_type", value);
//                     setValue("staff_role", "");
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select staff type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Academic Staff">Academic Staff</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.staff_type && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.staff_type.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="staff_role">Staff Role *</Label>
//                 <Select
//                   value={watch("staff_role")}
//                   onValueChange={(value) => setValue("staff_role", value)}
//                   disabled={!staffType}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select role" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {staffRoles[staffType || "Academic Staff"]?.map((role) => (
//                       <SelectItem key={role.value} value={role.value}>
//                         {role.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.staff_role && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.staff_role.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="password">Password *</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   {...register("password")}
//                   placeholder="Default: 123456"
//                 />
//                 {errors.password && (
//                   <p className="text-sm text-red-500 mt-1">
//                     {errors.password.message}
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Assignments */}
//         {["Subject Teacher", "Form Master"].includes(staffRole || "") && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Class & Subject Assignments</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {staffRole === "Subject Teacher" && (
//                 <div>
//                   <div className="flex justify-between items-center mb-4">
//                     <Label>Subject Assignments</Label>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setIsSubjectModalVisible(true)}
//                     >
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add Subject
//                     </Button>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {subjectAssignments.map((asgn, index) => (
//                       <Badge key={index} variant="outline" className="p-2">
//                         {asgn.section} - {asgn.class_name}: {asgn.subject}
//                         <button
//                           type="button"
//                           onClick={() => removeSubjectAssignment(index)}
//                           className="ml-2"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </Badge>
//                     ))}
//                     {subjectAssignments.length === 0 && (
//                       <p className="text-sm text-gray-500">No subjects assigned</p>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {staffRole === "Form Master" && (
//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex justify-between items-center mb-4">
//                       <Label>Form Master Classes</Label>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={() => setIsFormMasterModalVisible(true)}
//                       >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Assign Class
//                       </Button>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       {formMasterClasses.map((asgn, index) => (
//                         <Badge key={index} variant="outline" className="p-2">
//                           {asgn.section} - {asgn.class_name}
//                           <button
//                             type="button"
//                             onClick={() => removeFormMasterClass(index)}
//                             className="ml-2"
//                           >
//                             <X className="h-3 w-3" />
//                           </button>
//                         </Badge>
//                       ))}
//                       {formMasterClasses.length === 0 && (
//                         <p className="text-sm text-gray-500">No classes assigned</p>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <div className="flex justify-between items-center mb-4">
//                       <Label>Subject Assignments</Label>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={() => setIsSubjectModalVisible(true)}
//                       >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add Subject
//                       </Button>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       {subjectAssignments.map((asgn, index) => (
//                         <Badge key={index} variant="outline" className="p-2">
//                           {asgn.section} - {asgn.class_name}: {asgn.subject}
//                           <button
//                             type="button"
//                             onClick={() => removeSubjectAssignment(index)}
//                             className="ml-2"
//                           >
//                             <X className="h-3 w-3" />
//                           </button>
//                         </Badge>
//                       ))}
//                       {subjectAssignments.length === 0 && (
//                         <p className="text-sm text-gray-500">No subjects assigned</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}

//         <div className="flex justify-end gap-4">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => navigate("/teachers/list")}
//           >
//             Cancel
//           </Button>
//           <Button type="submit" disabled={isSubmitting}>
//             <Save className="h-4 w-4 mr-2" />
//             {isSubmitting ? "Creating..." : "Create Teacher"}
//           </Button>
//         </div>
//       </form>

//       {/* Subject Assignment Modal */}
//       <Dialog open={isSubjectModalVisible} onOpenChange={setIsSubjectModalVisible}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add Subject Assignment</DialogTitle>
//           </DialogHeader>
//           <SubjectAssignmentForm
//             sections={mapped_sections}
//             classOptions={renderClassOptions(currentAssignment.section)}
//             subjectOptions={renderSubjectOptions(currentAssignment.class_code)}
//             onAdd={handleAddSubjectAssignment}
//             currentAssignment={currentAssignment}
//             setCurrentAssignment={setCurrentAssignment}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* Form Master Assignment Modal */}
//       <Dialog
//         open={isFormMasterModalVisible}
//         onOpenChange={setIsFormMasterModalVisible}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Assign Class to Form Master</DialogTitle>
//           </DialogHeader>
//           <FormMasterAssignmentForm
//             sections={mapped_sections}
//             classOptions={renderClassOptions(currentAssignment.section)}
//             onAdd={handleAddFormMasterClass}
//             currentAssignment={currentAssignment}
//             setCurrentAssignment={setCurrentAssignment}
//           />
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// // Helper components for modals
// const SubjectAssignmentForm = ({ sections, classOptions, subjectOptions, onAdd, currentAssignment, setCurrentAssignment }: any) => {
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (currentAssignment.section && currentAssignment.class_code && currentAssignment.subject_code) {
//       onAdd(currentAssignment);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <Label>Section</Label>
//         <Select
//           value={currentAssignment.section || ""}
//           onValueChange={(value) =>
//             setCurrentAssignment({ section: value, class_code: "", subject_code: "" })
//           }
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select section" />
//           </SelectTrigger>
//           <SelectContent>
//             {sections.map((sec: any) => (
//               <SelectItem key={sec.value} value={sec.value}>
//                 {sec.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <div>
//         <Label>Class</Label>
//         <Select
//           value={currentAssignment.class_code || ""}
//           onValueChange={(value) =>
//             setCurrentAssignment({ ...currentAssignment, class_code: value, subject_code: "" })
//           }
//           disabled={!currentAssignment.section}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select class" />
//           </SelectTrigger>
//           <SelectContent>
//             {classOptions.map((cls: any) => (
//               <SelectItem key={cls.value} value={cls.value}>
//                 {cls.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <div>
//         <Label>Subject</Label>
//         <Select
//           value={currentAssignment.subject_code || ""}
//           onValueChange={(value) =>
//             setCurrentAssignment({ ...currentAssignment, subject_code: value })
//           }
//           disabled={!currentAssignment.class_code}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select subject" />
//           </SelectTrigger>
//           <SelectContent>
//             {subjectOptions.map((subj: any) => (
//               <SelectItem key={subj.value} value={subj.value}>
//                 {subj.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <Button type="submit" className="w-full">Add Assignment</Button>
//     </form>
//   );
// };

// const FormMasterAssignmentForm = ({ sections, classOptions, onAdd, currentAssignment, setCurrentAssignment }: any) => {
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (currentAssignment.section && currentAssignment.class_code) {
//       onAdd(currentAssignment);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <Label>Section</Label>
//         <Select
//           value={currentAssignment.section || ""}
//           onValueChange={(value) =>
//             setCurrentAssignment({ section: value, class_code: "" })
//           }
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select section" />
//           </SelectTrigger>
//           <SelectContent>
//             {sections.map((sec: any) => (
//               <SelectItem key={sec.value} value={sec.value}>
//                 {sec.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <div>
//         <Label>Class</Label>
//         <Select
//           value={currentAssignment.class_code || ""}
//           onValueChange={(value) =>
//             setCurrentAssignment({ ...currentAssignment, class_code: value })
//           }
//           disabled={!currentAssignment.section}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select class" />
//           </SelectTrigger>
//           <SelectContent>
//             {classOptions.map((cls: any) => (
//               <SelectItem key={cls.value} value={cls.value}>
//                 {cls.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <Button type="submit" className="w-full">Assign Class</Button>
//     </form>
//   );
// };

// export default TeacherForm;

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { _get, _post, server_url } from "../../Helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, User, X, Plus, RefreshCw, Eye } from "lucide-react";

const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile_no: z.string().min(10, "Phone number is required"),
  sex: z.string().min(1, "Gender is required"),
  staff_type: z.string().min(1, "Staff type is required"),
  staff_role: z.string().min(1, "Staff role is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

const TeacherForm = () => {
  const navigate = useNavigate();
  const { user, selected_branch, subjects, classes, sections } = useSelector((state: any) => state.auth);

  const [subjectAssignments, setSubjectAssignments] = useState<any[]>([]);
  const [formMasterClasses, setFormMasterClasses] = useState<any[]>([]);
  const [isSubjectModalVisible, setIsSubjectModalVisible] = useState(false);
  const [isFormMasterModalVisible, setIsFormMasterModalVisible] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<any>({});
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const {
    register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { staff_type: "Academic Staff", password: "123456" },
  });

  const staffRole = watch("staff_role");
  const staffType = watch("staff_type");

  const mapped_sections = useMemo(() => 
    sections?.map((i: any) => ({ label: i.section_name, value: i.section_name })) || [], [sections]
  );

  const staffRoles: Record<string, { label: string; value: string }[]> = {
    "Academic Staff": [
      { label: "School Head", value: "School Head" },
      { label: "Vice School Head", value: "Vice School Head" },
      { label: "Subject Teacher", value: "Subject Teacher" },
      { label: "Form Master", value: "Form Master" },
    ],
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("media", file);

    fetch(`${server_url}/upload_transfer_certificate-document`, {
      method: "POST",
      headers: { authorization: localStorage.getItem("@@auth_token") || "" },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) { setImagePreview(data.url); toast.success("Photo uploaded successfully"); }
        setIsUploading(false);
      })
      .catch(() => { toast.error("Failed to upload photo"); setIsUploading(false); });
  };

  const renderClassOptions = (section: string) => {
    if (!section) return [];
    return classes.filter((cls: any) => cls.section === section).map((c: any) => ({ label: c.class_name, value: c.class_code }));
  };

  const renderSubjectOptions = (classCode: string) => {
    if (!classCode) return [];
    return subjects.filter((sub: any) => sub.class_code === classCode).map((s: any) => ({ label: s.subject, value: s.subject_code }));
  };

  const handleAddSubjectAssignment = (values: any) => {
    const classObj = classes.find((c: any) => c.class_code === values.class_code);
    const subjectObj = subjects.find((s: any) => s.subject_code === values.subject_code);
    setSubjectAssignments([...subjectAssignments, { ...values, class_name: classObj?.class_name, subject: subjectObj?.subject }]);
    setIsSubjectModalVisible(false);
    setCurrentAssignment({});
  };

  const removeSubjectAssignment = (index: number) => {
    setSubjectAssignments(subjectAssignments.filter((_, i) => i !== index));
  };
  // 2. واجهة الـ JSX وعناصر الاستمارات المقاومة للاقتطاع
  const handleAddFormMasterClass = (values: any) => {
    const classObj = classes.find((c: any) => c.class_code === values.class_code);
    setFormMasterClasses([...formMasterClasses, { ...values, class_name: classObj?.class_name }]);
    setIsFormMasterModalVisible(false); setCurrentAssignment({});
  };

  const removeFormMasterClass = (index: number) => {
    setFormMasterClasses(formMasterClasses.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TeacherFormData) => {
    const teacherSubjects = subjectAssignments.map((asgn) => ({
      query_type: "create", id: 0, subject: asgn.subject, subject_code: asgn.subject_code,
      class_name: asgn.class_name, class_code: asgn.class_code, section: asgn.section, branch_id: selected_branch.branch_id,
    }));
    const teacherRoles = staffRole === "Form Master" ? formMasterClasses.map((asgn) => ({
      query_type: "create", class_role_id: null, section: asgn.section, class_name: asgn.class_name, class_code: asgn.class_code, role: "Form Master", branch_id: selected_branch.branch_id,
    })) : [];

    const payload = {
      ...data, query_type: "create", teacherSubjects, teacherRoles, school_id: user.school_id, branch_id: selected_branch.branch_id, passport_url: imagePreview, password: data.password || "123456",
      user_type: ["Subject Teacher", "Form Master"].includes(staffRole) ? "Teacher" : "Admin",
    };
    _post("teachers", payload, (res) => {
      if (res.success) { toast.success("Teacher created successfully!"); navigate("/teachers/list"); }
      else { toast.error(res.message || "Failed to create teacher"); }
    }, (err) => { toast.error("An error occurred while creating the teacher."); });
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50/30 dark:bg-gray-950 min-h-screen">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" onClick={() => navigate("/teachers/list")} className="h-9 text-xs font-bold rounded-xl border"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
        <div><h1 className="text-xl font-black text-gray-800 dark:text-gray-100">Create New Teacher</h1></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none bg-white dark:bg-gray-900 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Personal Information</h3>
            <div className="flex flex-col items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-dashed">
              <div className="h-16 w-16 rounded-full bg-white border flex items-center justify-center overflow-hidden">
                {imagePreview ? <img src={imagePreview} alt="Teacher" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-gray-300" />}
              </div>
              <Input id="photo" type="file" accept="image/*" onChange={handleUploadChange} disabled={isUploading} className="h-8 text-xs rounded-xl max-w-xs" />
            </div>
            <div><Label className="text-xs">Full Name *</Label><Input {...register("name")} placeholder="Enter name" className="h-9 text-xs rounded-xl" /></div>
            <div><Label className="text-xs">Gender *</Label>
              <Select value={watch("sex")} onValueChange={(v) => setValue("sex", v)}><SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="text-xs rounded-xl"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
          </Card>

          <Card className="border-none bg-white dark:bg-gray-900 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact & Appointment</h3>
            <div><Label className="text-xs">Email *</Label><Input type="email" {...register("email")} placeholder="teacher@example.com" className="h-9 text-xs rounded-xl" /></div>
            <div><Label className="text-xs">Phone Number *</Label><Input {...register("mobile_no")} placeholder="08012345678" className="h-9 text-xs rounded-xl" /></div>
            <div><Label className="text-xs">Staff Type *</Label>
              <Select value={watch("staff_type")} onValueChange={(v) => { setValue("staff_type", v); setValue("staff_role", ""); }}><SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="text-xs rounded-xl"><SelectItem value="Academic Staff">Academic Staff</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs">Staff Role *</Label>
              <Select value={watch("staff_role")} onValueChange={(v) => setValue("staff_role", v)} disabled={!staffType}><SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="text-xs rounded-xl">{staffRoles[staffType || "Academic Staff"]?.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}</SelectContent></Select></div>
            <div><Label className="text-xs">Password *</Label><Input type="password" {...register("password")} placeholder="Default: 123456" className="h-9 text-xs rounded-xl" /></div>
          </Card>
        </div>

        {["Subject Teacher", "Form Master"].includes(staffRole || "") && (
          <Card className="border-none bg-white dark:bg-gray-900 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Class & Subject Assignments</h3>
            {staffRole === "Subject Teacher" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center"><Label className="text-xs">Subject Assignments</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsSubjectModalVisible(true)} className="h-8 text-xs rounded-xl"><Plus className="h-3 w-3 mr-1" /> Add Subject</Button></div>
                <div className="flex flex-wrap gap-1.5">{subjectAssignments.map((asgn, index) => (<Badge key={index} variant="secondary" className="text-[10px] gap-1">{asgn.section} - {asgn.class_name}: {asgn.subject}<X className="h-3 w-3 cursor-pointer text-red-500" onClick={() => removeSubjectAssignment(index)} /></Badge>))}</div>
              </div>
            )}
            {staffRole === "Form Master" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><Label className="text-xs">Form Master Classes</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsFormMasterModalVisible(true)} className="h-8 text-xs rounded-xl"><Plus className="h-3 w-3 mr-1" /> Assign Class</Button></div>
                  <div className="flex flex-wrap gap-1.5">{formMasterClasses.map((asgn, index) => (<Badge key={index} variant="secondary" className="text-[10px] gap-1">{asgn.section} - {asgn.class_name}<X className="h-3 w-3 cursor-pointer text-red-500" onClick={() => removeFormMasterClass(index)} /></Badge>))}</div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center"><Label className="text-xs">Subject Assignments</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsSubjectModalVisible(true)} className="h-8 text-xs rounded-xl"><Plus className="h-3 w-3 mr-1" /> Add Subject</Button></div>
                  <div className="flex flex-wrap gap-1.5">{subjectAssignments.map((asgn, index) => (<Badge key={index} variant="secondary" className="text-[10px] gap-1">{asgn.section} - {asgn.class_name}: {asgn.subject}<X className="h-3 w-3 cursor-pointer text-red-500" onClick={() => removeSubjectAssignment(index)} /></Badge>))}</div>
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate("/teachers/list")} className="h-9 text-xs rounded-xl">Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="h-9 text-xs rounded-xl bg-[#00356B] text-white px-4">{isSubmitting ? "Creating..." : "Create Teacher"}</Button>
        </div>
      </form>

      <Dialog open={isSubjectModalVisible} onOpenChange={setIsSubjectModalVisible}>
        <DialogContent className="rounded-2xl max-w-sm"><DialogHeader><DialogTitle className="text-sm font-bold">Add Subject Assignment</DialogTitle></DialogHeader>
          <SubjectAssignmentForm sections={mapped_sections} classOptions={renderClassOptions(currentAssignment.section)} subjectOptions={renderSubjectOptions(currentAssignment.class_code)} onAdd={handleAddSubjectAssignment} currentAssignment={currentAssignment} setCurrentAssignment={setCurrentAssignment} />
        </DialogContent></Dialog>

      <Dialog open={isFormMasterModalVisible} onOpenChange={setIsFormMasterModalVisible}>
        <DialogContent className="rounded-2xl max-w-sm"><DialogHeader><DialogTitle className="text-sm font-bold">Assign Class to Form Master</DialogTitle></DialogHeader>
          <FormMasterAssignmentForm sections={mapped_sections} classOptions={renderClassOptions(currentAssignment.section)} onAdd={handleAddFormMasterClass} currentAssignment={currentAssignment} setCurrentAssignment={setCurrentAssignment} />
        </DialogContent></Dialog>
    </div>
  );
};

const SubjectAssignmentForm = ({ sections, classOptions, subjectOptions, onAdd, currentAssignment, setCurrentAssignment }: any) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAssignment.section && currentAssignment.class_code && currentAssignment.subject_code) onAdd(currentAssignment);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1"><Label className="text-xs">Section</Label>
        <Select value={currentAssignment.section || ""} onValueChange={(v) => setCurrentAssignment({ section: v, class_code: "", subject_code: "" })}>
          <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent className="rounded-xl text-xs">{sections.map((s: any) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent></Select></div>
      <div className="space-y-1"><Label className="text-xs">Class</Label>
        <Select value={currentAssignment.class_code || ""} onValueChange={(v) => setCurrentAssignment({ ...currentAssignment, class_code: v, subject_code: "" })} disabled={!currentAssignment.section}>
          <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent className="rounded-xl text-xs">{classOptions.map((c: any) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent></Select></div>
      <div className="space-y-1"><Label className="text-xs">Subject</Label>
        <Select value={currentAssignment.subject_code || ""} onValueChange={(v) => setCurrentAssignment({ ...currentAssignment, subject_code: v })} disabled={!currentAssignment.class_code}>
          <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent className="rounded-xl text-xs">{subjectOptions.map((s: any) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent></Select></div>
      <Button type="submit" className="w-full h-9 text-xs font-bold rounded-xl bg-[#00356B] text-white">Add Assignment</Button>
    </form>
  );
};

const FormMasterAssignmentForm = ({ sections, classOptions, onAdd, currentAssignment, setCurrentAssignment }: any) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAssignment.section && currentAssignment.class_code) onAdd(currentAssignment);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1"><Label className="text-xs">Section</Label>
        <Select value={currentAssignment.section || ""} onValueChange={(v) => setCurrentAssignment({ section: v, class_code: "" })}>
          <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent className="rounded-xl text-xs">{sections.map((s: any) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent></Select></div>
      <div className="space-y-1"><Label className="text-xs">Class</Label>
        <Select value={currentAssignment.class_code || ""} onValueChange={(v) => setCurrentAssignment({ ...currentAssignment, class_code: v })} disabled={!currentAssignment.section}>
          <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent className="rounded-xl text-xs">{classOptions.map((c: any) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent></Select></div>
      <Button type="submit" className="w-full h-9 text-xs font-bold rounded-xl bg-[#00356B] text-white">Assign Class</Button>
    </form>
  );
};

export default TeacherForm;
