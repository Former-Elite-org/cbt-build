// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import { useAuthStore } from "@/features/auth/store/authStore";
// import { _get, _put } from "../../Helper";
// import toast from "react-hot-toast";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Plus,
//   Search,
//   Edit,
//   Upload,
//   Users,
//   User,
//   Lock,
//   Unlock,
// } from "lucide-react";
// import EditTeacherForm from "./EditTeacher";
// import BulkUpload from "./BulkUpload";
// import CreateTeacherModal from "./CreateTeacherModal";

// const TeacherList = () => {
//   const [teachers, setTeachers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [staffTypeFilter, setStaffTypeFilter] = useState("all");
//   const [staffRoleFilter, setStaffRoleFilter] = useState("all");
//   const [bulkUploadVisible, setBulkUploadVisible] = useState(false);
//   const [createModalVisible, setCreateModalVisible] = useState(false);

//   const { user, selected_branch } = useAuthStore();

//   const fetchTeachers = useCallback(() => {
//     if (!selected_branch?.branch_id || !user?.school_id) {
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     _get(
//       `teachers?query_type=select-all&branch_id=${selected_branch.branch_id}&school_id=${user.school_id}`,
//       (res) => {
//         setLoading(false);
//         if (res.success && Array.isArray(res.data)) {
//           setTeachers(res.data);
//         } else if (Array.isArray(res.data)) {
//           setTeachers(res.data);
//         } else {
//           setTeachers([]);
//         }
//       },
//       (err) => {
//         console.error("Error fetching teachers:", err);
//         toast.error("Failed to fetch teachers");
//         setTeachers([]);
//         setLoading(false);
//       }
//     );
//   }, [selected_branch?.branch_id, user?.school_id]);

//   useEffect(() => {
//     fetchTeachers();
//   }, [fetchTeachers]);

//   const handleEdit = (teacher: any) => {
//     setSelectedTeacher(teacher);
//     setEditModalVisible(true);
//   };

//   const handleModalClose = () => {
//     setEditModalVisible(false);
//     setSelectedTeacher(null);
//   };

//   const handleUpdateFinished = () => {
//     handleModalClose();
//     fetchTeachers();
//   };

//   const updateTeacher = (data: any) => {
//     if (!data.user_id) {
//       toast.error("Teacher ID is missing");
//       return;
//     }

//     const newStatus = data.status === "Active" ? "Inactive" : "Active";
//     const payload = {
//       query_type: "update",
//       user_id: data.user_id,
//       status: newStatus,
//       branch_id: selected_branch?.branch_id,
//       school_id: user?.school_id,
//     };

//     _put(
//       "update/user",
//       payload,
//       (res: any) => {
//         if (res.success) {
//           toast.success(
//             data.status === "Active"
//               ? "Teacher disabled successfully"
//               : "Teacher enabled successfully"
//           );
//           fetchTeachers();
//         } else {
//           toast.error(res.message || "Failed to update teacher status");
//         }
//       },
//       (err) => {
//         console.error("Error updating teacher:", err);
//         toast.error(
//           err.message ||
//             "Failed to " +
//               (data.status === "Active" ? "disable" : "enable") +
//               " teacher"
//         );
//       }
//     );
//   };

//   const filteredTeachers = useMemo(() => {
//     return teachers
//       .filter((teacher) => {
//         const searchLower = searchQuery.toLowerCase();
//         return (
//           teacher.name?.toLowerCase().includes(searchLower) ||
//           teacher.email?.toLowerCase().includes(searchLower)
//         );
//       })
//       .filter((teacher) => {
//         if (staffTypeFilter === "all") return true;
//         return teacher.staff_type === staffTypeFilter;
//       })
//       .filter((teacher) => {
//         if (staffRoleFilter === "all") return true;
//         return teacher.staff_role === staffRoleFilter;
//       });
//   }, [teachers, searchQuery, staffTypeFilter, staffRoleFilter]);

//   const { genderStats, totalTeachers } = useMemo(() => {
//     const genderCount: Record<string, number> = {
//       Male: 0,
//       Female: 0,
//       Other: 0,
//     };

//     teachers.forEach((teacher) => {
//       const gender = teacher.sex || "Other";
//       const firstChar = gender.charAt(0).toUpperCase();

//       if (firstChar === "M") {
//         genderCount.Male += 1;
//       } else if (firstChar === "F") {
//         genderCount.Female += 1;
//       } else {
//         genderCount.Other += 1;
//       }
//     });

//     return {
//       genderStats: genderCount,
//       totalTeachers: teachers.length,
//     };
//   }, [teachers]);

//   const staffTypes = Array.from(
//     new Set(teachers.map((t) => t.staff_type).filter(Boolean))
//   );
//   const staffRoles = Array.from(
//     new Set(teachers.map((t) => t.staff_role).filter(Boolean))
//   );

//   return (
//     <div className="space-y-6 p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-[#00356B] dark:text-white">Teachers</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">Manage school teachers</p>
//         </div>
//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             className="border-2 border-[#00356B] dark:border-white/30 text-[#00356B] dark:text-white"
//             onClick={() => setBulkUploadVisible(true)}
//           >
//             <Upload className="h-4 w-4 mr-2" />
//             Bulk Upload
//           </Button>
//           <Button onClick={() => setCreateModalVisible(true)}>
//             <Plus className="h-4 w-4 mr-2" />
//             Add Teacher
//           </Button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total Teachers</p>
//                 <p className="text-2xl font-bold text-[#00356B] dark:text-white">{totalTeachers}</p>
//               </div>
//               <Users className="h-8 w-8 text-[#00356B] dark:text-white" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Male</p>
//                 <p className="text-2xl font-bold text-blue-500">{genderStats.Male}</p>
//               </div>
//               <User className="h-8 w-8 text-blue-500" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Female</p>
//                 <p className="text-2xl font-bold text-pink-500">{genderStats.Female}</p>
//               </div>
//               <User className="h-8 w-8 text-pink-500" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Other</p>
//                 <p className="text-2xl font-bold text-gray-500">{genderStats.Other}</p>
//               </div>
//               <User className="h-8 w-8 text-gray-500" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 placeholder="Search by name or email..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Select value={staffTypeFilter} onValueChange={setStaffTypeFilter}>
//               <SelectTrigger className="w-full md:w-[200px]">
//                 <SelectValue placeholder="All Staff Types" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Staff Types</SelectItem>
//                 {staffTypes.map((type) => (
//                   <SelectItem key={type} value={type}>
//                     {type}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={staffRoleFilter} onValueChange={setStaffRoleFilter}>
//               <SelectTrigger className="w-full md:w-[200px]">
//                 <SelectValue placeholder="All Roles" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Roles</SelectItem>
//                 {staffRoles.map((role) => (
//                   <SelectItem key={role} value={role}>
//                     {role}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Teachers Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-[#00356B] dark:text-white">Teachers List</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="text-center py-8">
//               <div className="flex flex-col items-center gap-4">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00356B]"></div>
//                 <p className="text-gray-600 dark:text-gray-400">Loading teachers...</p>
//               </div>
//             </div>
//           ) : filteredTeachers.length === 0 ? (
//             <div className="text-center py-12">
//               <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-bold text-gray-900  dark:text-white mb-2">
//                 No Teachers Found
//               </h3>
//               <p className="text-gray-600 dark:text-gray-400 mb-4">
//                 {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first teacher'}
//               </p>
//               <Button onClick={() => setCreateModalVisible(true)}>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Teacher
//               </Button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200 dark:border-gray-700">
//                     <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Name</th>
//                     <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Email</th>
//                     <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Phone</th>
//                     <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Role</th>
//                     <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Status</th>
//                     <th className="text-right p-4 font-semibold text-gray-900 dark:text-white">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredTeachers.map((teacher) => (
//                     <tr key={teacher.user_id || teacher.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
//                       <td className="p-4">
//                         <div className="flex items-center gap-3">
//                           <div className="h-10 w-10 rounded-full bg-[#00356B] dark:bg-primary-900 flex items-center justify-center">
//                             {teacher.passport_url ? (
//                               <img
//                                 src={teacher.passport_url}
//                                 alt={teacher.name}
//                                 className="h-10 w-10 rounded-full object-cover"
//                               />
//                             ) : (
//                               <User className="h-5 w-5 text-gray-100 dark:text-white" />
//                             )}
//                           </div>
//                           <span className="font-medium text-gray-900 dark:text-white ">{teacher.name}</span>
//                         </div>
//                       </td>
//                       <td className="p-4 text-gray-600 dark:text-gray-400">{teacher.email}</td>
//                       <td className="p-4 text-gray-600 dark:text-gray-400">{teacher.mobile_no || 'N/A'}</td>
//                       <td className="p-4">
//                         <Badge variant="outline" className="border-2 border-[#00356B] dark:border-white/30 text-gray-900 dark:text-white">{teacher.staff_role || 'N/A'}</Badge>
//                       </td>
//                       <td className="p-4">
//                         <Badge
//                           className={
//                             teacher.status === "Active" 
//                               ? "bg-green-500 text-white" 
//                               : "bg-gray-500 text-white"
//                           }
//                         >
//                           {teacher.status || "Active"}
//                         </Badge>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex gap-2">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleEdit(teacher)}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => updateTeacher(teacher)}
//                             title={
//                               teacher.status === "Active"
//                                 ? "Disable"
//                                 : "Enable"
//                             }
//                           >
//                             {teacher.status === "Active" ? (
//                               <Lock className="h-4 w-4" />
//                             ) : (
//                               <Unlock className="h-4 w-4" />
//                             )}
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {selectedTeacher && (
//         <EditTeacherForm
//           teacher={selectedTeacher}
//           onFinished={handleUpdateFinished}
//           onCancel={handleModalClose}
//         />
//       )}

//       <BulkUpload
//         visible={bulkUploadVisible}
//         onClose={() => setBulkUploadVisible(false)}
//         onSuccess={() => {
//           setBulkUploadVisible(false);
//           fetchTeachers();
//         }}
//       />

//       <CreateTeacherModal
//         visible={createModalVisible}
//         onClose={() => setCreateModalVisible(false)}
//         onSuccess={() => {
//           fetchTeachers();
//         }}
//       />
//     </div>
//   );
// };

// export default TeacherList;

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { _get, _put } from "../../Helper";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Upload,
  Users,
  User,
  Lock,
  Unlock,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";
import EditTeacherForm from "./EditTeacher";
import BulkUpload from "./BulkUpload";
import CreateTeacherModal from "./CreateTeacherModal";

const TeacherList = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffTypeFilter, setStaffTypeFilter] = useState("all");
  const [staffRoleFilter, setStaffRoleFilter] = useState("all");
  const [bulkUploadVisible, setBulkUploadVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { user, selected_branch } = useAuthStore();

  const fetchTeachers = useCallback(() => {
    if (!selected_branch?.branch_id || !user?.school_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    _get(
      `teachers?query_type=select-all&branch_id=${selected_branch.branch_id}&school_id=${user.school_id}`,
      (res) => {
        setLoading(false);
        if (res.success && Array.isArray(res.data)) {
          setTeachers(res.data);
        } else {
          setTeachers([]);
        }
      },
      (err) => {
        console.error("Error fetching teachers:", err);
        toast.error("Failed to fetch teachers");
        setTeachers([]);
        setLoading(false);
      }
    );
  }, [selected_branch?.branch_id, user?.school_id]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setEditModalVisible(true);
  };

  const handleModalClose = () => {
    setEditModalVisible(false);
    setSelectedTeacher(null);
  };

  const handleUpdateFinished = () => {
    handleModalClose();
    fetchTeachers();
  };

  const updateTeacher = (data: any) => {
    const teacherId = data.id || data.user_id;
    if (!teacherId) {
      toast.error("Teacher ID is missing");
      return;
    }
    // status from backend can be 'active' or 'Active' — handle both
    const isCurrentlyActive = ['active','Active'].includes(data.status || '');
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    const payload = {
      user_id: teacherId,
      status: newStatus,
      branch_id: selected_branch?.branch_id,
      school_id: user?.school_id,
    };

    _put("update/user", payload,
      (res: any) => {
        if (res.success) {
          toast.success(isCurrentlyActive ? "Teacher disabled" : "Teacher enabled");
          fetchTeachers();
        } else {
          toast.error(res.message || "Failed to update teacher status");
        }
      },
      () => { toast.error("Failed to change teacher status"); }
    );
  };

  const filteredTeachers = useMemo(() => {
    return teachers
      .filter((teacher) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          teacher.name?.toLowerCase().includes(searchLower) ||
          teacher.email?.toLowerCase().includes(searchLower)
        );
      })
      .filter((teacher) => staffTypeFilter === "all" ? true : teacher.staff_type === staffTypeFilter)
      .filter((teacher) => staffRoleFilter === "all" ? true : teacher.staff_role === staffRoleFilter);
  }, [teachers, searchQuery, staffTypeFilter, staffRoleFilter]);

  const { genderStats, totalTeachers } = useMemo(() => {
    const genderCount = { Male: 0, Female: 0, Other: 0 };
    teachers.forEach((teacher) => {
      const firstChar = (teacher.sex || "Other").charAt(0).toUpperCase();
      if (firstChar === "M") genderCount.Male += 1;
      else if (firstChar === "F") genderCount.Female += 1;
      else genderCount.Other += 1;
    });
    return { genderStats: genderCount, totalTeachers: teachers.length };
  }, [teachers]);

  const staffTypes = Array.from(new Set(teachers.map((t) => t.staff_type).filter(Boolean)));
  const staffRoles = Array.from(new Set(teachers.map((t) => t.staff_role).filter(Boolean)));
  /* 2. واجهة الـ JSX، بطاقات الإحصائيات، الفلاتر والجدول العصري المدمج */
  return (
    <div className="space-y-6 p-6 bg-gray-50/30 dark:bg-gray-950 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-800 dark:text-gray-100">Instructors Manifest</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage institutional faculties, assign credential state protocols or bulk inject logs feed.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setBulkUploadVisible(true)} className="h-10 text-xs font-bold rounded-xl text-gray-500 bg-white dark:bg-gray-900 border gap-1.5 shadow-sm">
            <Upload className="h-3.5 w-3.5 text-[#00356B]" /> Bulk Upload
          </Button>
          <Button onClick={() => setCreateModalVisible(true)} className="h-10 text-xs font-bold rounded-xl bg-[#00356B] text-white shadow-sm gap-1.5">
            <Plus className="h-4 w-4" /> Add Teacher
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Teachers", val: totalTeachers, icon: Users, cls: "text-[#00356B] bg-blue-500/10" },
          { title: "Male", val: genderStats.Male, icon: User, cls: "text-blue-500 bg-blue-500/10" },
          { title: "Female", val: genderStats.Female, icon: User, cls: "text-pink-500 bg-pink-500/10" },
          { title: "Active", val: teachers.filter(t => t.status === 'Active').length, icon: Users, cls: "text-emerald-500 bg-emerald-500/10" }
        ].map((c, i) => (
          <Card key={i} className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{c.title}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{c.val}</p></div>
              <div className={`p-2.5 rounded-xl ${c.cls}`}><c.icon className="h-5 w-5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          {/* <div className="w-full md:flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
             setSearchQuery(e.target.value)} className="pl-10 h-10 text-xs border-none bg-gray-50/50 rounded-xl" />
          </div> */}
              
<div className="w-full md:flex-1 relative">
  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />

  <Input
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-10 h-10 text-xs border-none bg-gray-50/50 rounded-xl"
   placeholder="Search..."
  />
</div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Select value={staffTypeFilter} onValueChange={setStaffTypeFilter}>
              <SelectTrigger className="w-full sm:w-[170px] h-10 text-xs rounded-xl bg-gray-50/50"><SelectValue placeholder="Staff Type" /></SelectTrigger>
              <SelectContent className="rounded-xl text-xs"><SelectItem value="all">All Staff Types</SelectItem>
                {staffTypes.map((t: any) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={staffRoleFilter} onValueChange={setStaffRoleFilter}>
              <SelectTrigger className="w-full sm:w-[170px] h-10 text-xs rounded-xl bg-gray-50/50"><SelectValue placeholder="Staff Role" /></SelectTrigger>
              <SelectContent className="rounded-xl text-xs"><SelectItem value="all">All Roles</SelectItem>
                {staffRoles.map((r: any) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[300px]"><RefreshCw className="h-7 w-7 animate-spin text-[#00356B]" /><p className="text-xs text-gray-400">Syncing remote instructor logs...</p></div>
          ) : filteredTeachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 mb-3"><Users className="h-6 w-6" /></div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">No instructors found</h3>
              <Button onClick={() => setCreateModalVisible(true)} className="h-9 text-xs font-bold rounded-xl bg-[#00356B] text-white mt-4"><Plus className="h-3.5 w-3.5 mr-1" /> Add Teacher</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50/50 dark:bg-gray-800/20">
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instructor Profile</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Route</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Log</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role Manifest</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Access State</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.user_id || teacher.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                      <td className="p-4"><div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#00356B]/10 flex items-center justify-center overflow-hidden">
                            {teacher.passport_url ? ( <img src={teacher.passport_url} alt={teacher.name} className="h-9 w-9 object-cover" /> ) : ( <User className="h-4 w-4 text-[#00356B]" /> )}
                          </div><span className="font-bold text-xs text-gray-800 dark:text-gray-200">{teacher.name}</span>
                        </div></td>
                      <td className="p-4 text-xs font-semibold text-gray-500">{teacher.email}</td>
                      <td className="p-4 text-xs font-semibold text-gray-500">{teacher.mobile_no || 'N/A'}</td>
                      <td className="p-4"><Badge variant="outline" className="border text-gray-700 dark:text-white text-[10px] rounded-md">{teacher.staff_role || 'N/A'}</Badge></td>
                      <td className="p-4"><span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${['active','Active'].includes(teacher.status) ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{teacher.status || "active"}</span></td>
                      <td className="p-4 text-right"><div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(teacher)} className="h-8 w-8 p-0 text-gray-500"><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => updateTeacher(teacher)} className={`h-8 w-8 p-0 ${['active','Active'].includes(teacher.status) ? "text-amber-500" : "text-emerald-500"}`}>{['active','Active'].includes(teacher.status) ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}</Button>
                        </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <BulkUpload visible={bulkUploadVisible} onClose={() => setBulkUploadVisible(false)} onSuccess={() => { setBulkUploadVisible(false); fetchTeachers(); }} />
      <CreateTeacherModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} onSuccess={() => { fetchTeachers(); }} />
      <CreateTeacherModal visible={editModalVisible} teacher={selectedTeacher} onClose={handleModalClose} onSuccess={handleUpdateFinished} />
    </div>
  );
};

export default TeacherList;
