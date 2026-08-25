// import React, { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useAuthStore } from "@/features/auth/store/authStore";
// import { toast } from "react-hot-toast";
// import { _post, server_url } from "../../Helper";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
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
// import { User } from "lucide-react";

// const teacherSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   email: z.string().email("Invalid email address"),
//   mobile_no: z.string().min(10, "Phone number is required"),
//   sex: z.string().min(1, "Gender is required"),
//   staff_type: z.string().min(1, "Staff type is required"),
//   staff_role: z.string().min(1, "Staff role is required"),
//   password: z.string().min(6).optional(),
// });

// type TeacherFormData = z.infer<typeof teacherSchema>;

// interface EditTeacherFormProps {
//   teacher: any;
//   onFinished: () => void;
//   onCancel: () => void;
// }

// const EditTeacherForm: React.FC<EditTeacherFormProps> = ({
//   teacher,
//   onFinished,
//   onCancel,
// }) => {
//   const [imagePreview, setImagePreview] = useState<string>(teacher?.passport_url || "");
//   const [isUploading, setIsUploading] = useState(false);

//   const { user, selected_branch } = useAuthStore();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     watch,
//     setValue,
//     reset,
//   } = useForm<TeacherFormData>({
//     resolver: zodResolver(teacherSchema),
//   });

//   useEffect(() => {
//     if (teacher) {
//       reset({
//         name: teacher.name || "",
//         email: teacher.email || "",
//         mobile_no: teacher.mobile_no || "",
//         sex: teacher.sex || "",
//         staff_type: teacher.staff_type || "Academic Staff",
//         staff_role: teacher.staff_role || "",
//         password: "",
//       });
//       setImagePreview(teacher.passport_url || "");
//     }
//   }, [teacher, reset]);

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

//   const onSubmit = async (data: TeacherFormData) => {
//     if (!selected_branch?.branch_id) {
//       toast.error("Please select a branch");
//       return;
//     }

//     if (!user?.school_id) {
//       toast.error("School ID is missing");
//       return;
//     }

//     const payload = {
//       ...data,
//       query_type: "update",
//       school_id: user.school_id,
//       branch_id: selected_branch.branch_id,
//       passport_url: imagePreview || "",
//       user_id: teacher?.user_id || teacher?.id,
//       teacher_id: teacher?.id || teacher?.user_id,
//       user_type:
//         ["Subject Teacher", "Form Master"].includes(
//           data.staff_role || teacher?.staff_role || ""
//         )
//           ? "Teacher"
//           : "Admin",
//       // Only update password if provided
//       ...(data.password && data.password.length > 0 ? { password: data.password } : {}),
//     };

//     _post("teachers", payload, (res) => {
//       if (res.success) {
//         toast.success("Teacher updated successfully");
//         onFinished();
//       } else {
//         toast.error(res.message || "Update failed");
//       }
//     }, (err) => {
//       console.error("Error updating teacher:", err);
//       toast.error(err.message || "An error occurred while updating the teacher.");
//     });
//   };

//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-gradient-primary text-2xl">Edit Teacher</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* Photo Upload */}
//           <div className="flex flex-col items-center gap-4 pb-4 border-b">
//             <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
//               {imagePreview ? (
//                 <img
//                   src={imagePreview}
//                   alt="Teacher"
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 <User className="h-12 w-12 text-gray-400" />
//               )}
//             </div>
//             <div className="w-full max-w-xs">
//               <Label htmlFor="photo">Profile Picture (Optional)</Label>
//               <div className="mt-1">
//                 <Input
//                   id="photo"
//                   type="file"
//                   accept="image/*"
//                   onChange={handleUploadChange}
//                   disabled={isUploading}
//                   className="cursor-pointer"
//                 />
//               </div>
//               {isUploading && (
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Uploading...</p>
//               )}
//             </div>
//           </div>

//           {/* Personal Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Full Name */}
//             <div>
//               <Label htmlFor="name">Full Name *</Label>
//               <Input
//                 id="name"
//                 {...register("name")}
//                 placeholder="Enter full name"
//                 className="mt-1"
//               />
//               {errors.name && (
//                 <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
//               )}
//             </div>

//             {/* Gender */}
//             <div>
//               <Label htmlFor="sex">Gender *</Label>
//               <Select
//                 value={watch("sex") || ""}
//                 onValueChange={(value) => setValue("sex", value)}
//               >
//                 <SelectTrigger className="mt-1">
//                   <SelectValue placeholder="Select gender" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Male">Male</SelectItem>
//                   <SelectItem value="Female">Female</SelectItem>
//                 </SelectContent>
//               </Select>
//               {errors.sex && (
//                 <p className="text-sm text-red-500 mt-1">{errors.sex.message}</p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <Label htmlFor="email">Email Address *</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 {...register("email")}
//                 placeholder="teacher@example.com"
//                 className="mt-1"
//               />
//               {errors.email && (
//                 <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
//               )}
//             </div>

//             {/* Phone */}
//             <div>
//               <Label htmlFor="mobile_no">Phone Number *</Label>
//               <Input
//                 id="mobile_no"
//                 {...register("mobile_no")}
//                 placeholder="08012345678"
//                 className="mt-1"
//               />
//               {errors.mobile_no && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.mobile_no.message}
//                 </p>
//               )}
//             </div>

//             {/* Staff Type */}
//             <div>
//               <Label htmlFor="staff_type">Staff Type *</Label>
//               <Select
//                 value={watch("staff_type") || "Academic Staff"}
//                 onValueChange={(value) => {
//                   setValue("staff_type", value);
//                   setValue("staff_role", "");
//                 }}
//               >
//                 <SelectTrigger className="mt-1">
//                   <SelectValue placeholder="Select staff type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Academic Staff">Academic Staff</SelectItem>
//                 </SelectContent>
//               </Select>
//               {errors.staff_type && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.staff_type.message}
//                 </p>
//               )}
//             </div>

//             {/* Staff Role */}
//             <div>
//               <Label htmlFor="staff_role">Staff Role *</Label>
//               <Select
//                 value={watch("staff_role") || ""}
//                 onValueChange={(value) => setValue("staff_role", value)}
//                 disabled={!watch("staff_type")}
//               >
//                 <SelectTrigger className="mt-1">
//                   <SelectValue placeholder="Select role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {staffRoles[watch("staff_type") || "Academic Staff"]?.map(
//                     (role) => (
//                       <SelectItem key={role.value} value={role.value}>
//                         {role.label}
//                       </SelectItem>
//                     )
//                   )}
//                 </SelectContent>
//               </Select>
//               {errors.staff_role && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.staff_role.message}
//                 </p>
//               )}
//             </div>

//             {/* Password */}
//             {/* <div className="md:col-span-2">
//               <Label htmlFor="password">Password (leave blank to keep current)</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 {...register("password")}
//                 placeholder="Enter new password to change"
//                 className="mt-1"
//               />
//               {errors.password && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.password.message}
//                 </p>
//               )}
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Leave blank if you don't want to change the password
//               </p>
//             </div> */}
//           </div>

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? "Saving..." : "Save Changes"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default EditTeacherForm;

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/features/auth/store/authStore";
import { toast } from "react-hot-toast";
import { _post, server_url } from "../../Helper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, RefreshCw, Save, Camera } from "lucide-react";

const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile_no: z.string().min(10, "Phone number is required"),
  sex: z.string().min(1, "Gender is required"),
  staff_type: z.string().min(1, "Staff type is required"),
  staff_role: z.string().min(1, "Staff role is required"),
  password: z.string().min(6).optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface EditTeacherFormProps {
  teacher: any;
  onFinished: () => void;
  onCancel: () => void;
}

const EditTeacherForm: React.FC<EditTeacherFormProps> = ({
  teacher,
  onFinished,
  onCancel,
}) => {
  const [imagePreview, setImagePreview] = useState<string>(teacher?.passport_url || "");
  const [isUploading, setIsUploading] = useState(false);

  const { user, selected_branch } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });

  useEffect(() => {
    if (teacher) {
      reset({
        name: teacher.name || "",
        email: teacher.email || "",
        mobile_no: teacher.mobile_no || "",
        sex: teacher.sex || "",
        staff_type: teacher.staff_type || "Academic Staff",
        staff_role: teacher.staff_role || "",
        password: "",
      });
      setImagePreview(teacher.passport_url || "");
    }
  }, [teacher, reset]);

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
      headers: {
        authorization: localStorage.getItem("@@auth_token") || "",
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setImagePreview(data.url);
          toast.success("Photo uploaded successfully");
        }
        setIsUploading(false);
      })
      .catch(() => {
        toast.error("Failed to upload photo");
        setIsUploading(false);
      });
  };
  const onSubmit = async (data: TeacherFormData) => {
    if (!selected_branch?.branch_id) {
      toast.error("Please select a branch");
      return;
    }
    if (!user?.school_id) {
      toast.error("School ID is missing");
      return;
    }

    const payload = {
      ...data,
      query_type: "update",
      school_id: user.school_id,
      branch_id: selected_branch.branch_id,
      passport_url: imagePreview || "",
      user_id: teacher?.user_id || teacher?.id,
      teacher_id: teacher?.id || teacher?.user_id,
      user_type: ["Subject Teacher", "Form Master"].includes(data.staff_role || teacher?.staff_role || "") ? "Teacher" : "Admin",
      ...(data.password && data.password.length > 0 ? { password: data.password } : {}),
    };

    _post("teachers", payload, (res) => {
      if (res.success) {
        toast.success("Teacher updated successfully");
        onFinished();
      } else {
        toast.error(res.message || "Update failed");
      }
    }, (err) => {
      console.error("Error updating teacher:", err);
      toast.error(err.message || "An error occurred while updating the teacher.");
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="rounded-2xl max-w-lg bg-white dark:bg-gray-900 border-none shadow-xl overflow-hidden p-0 animate-in fade-in duration-200">
        
        {/* Header Visual Setup */}
        <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500"><User className="h-3.5 w-3.5" /></div>
              Edit Instructor Profile
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto snippet-scrollbar">
          
          {/* Avatar Passport Upload Zone */}
          <div className="flex flex-col items-center gap-3 bg-gray-50/50 dark:bg-gray-800/10 p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-900 border shadow-sm flex items-center justify-center overflow-hidden relative group">
              {imagePreview ? (
                <img src={imagePreview} alt="Teacher" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <div className="w-full max-w-xs text-center">
              <Label htmlFor="photo" className="text-[11px] font-bold text-gray-400 flex items-center justify-center gap-1"><Camera className="h-3 w-3" /> Update Profile Picture</Label>
              <Input id="photo" type="file" accept="image/*" onChange={handleUploadChange} disabled={isUploading} className="mt-1 h-8 text-xs rounded-xl cursor-pointer" />
              {isUploading && <p className="text-[10px] text-amber-500 mt-1 animate-pulse">Uploading asset stream...</p>}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Full Name *</Label>
              <Input id="name" {...register("name")} placeholder="Enter name" className="h-9 text-xs rounded-xl" />
              {errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Gender *</Label>
              <Select value={watch("sex") || ""} onValueChange={(v) => setValue("sex", v)}>
                <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select context" /></SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.sex && <p className="text-[10px] text-red-500 mt-0.5">{errors.sex.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Email Address *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="teacher@example.com" className="h-9 text-xs rounded-xl" />
              {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Phone Number *</Label>
              <Input id="mobile_no" {...register("mobile_no")} placeholder="08012345678" className="h-9 text-xs rounded-xl" />
              {errors.mobile_no && <p className="text-[10px] text-red-500 mt-0.5">{errors.mobile_no.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Staff Type *</Label>
              <Select value={watch("staff_type") || "Academic Staff"} onValueChange={(v) => { setValue("staff_type", v); setValue("staff_role", ""); }}>
                <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent className="rounded-xl text-xs"><SelectItem value="Academic Staff">Academic Staff</SelectItem></SelectContent>
              </Select>
              {errors.staff_type && <p className="text-[10px] text-red-500 mt-0.5">{errors.staff_type.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Staff Role *</Label>
              <Select value={watch("staff_role") || ""} onValueChange={(v) => setValue("staff_role", v)} disabled={!watch("staff_type")}>
                <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  {staffRoles[watch("staff_type") || "Academic Staff"]?.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.staff_role && <p className="text-[10px] text-red-500 mt-0.5">{errors.staff_role.message}</p>}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="h-9 text-xs rounded-xl text-gray-400">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="h-9 text-xs font-bold rounded-xl bg-[#00356B] text-white px-4 shadow-sm gap-1.5">
              {isSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeacherForm;
