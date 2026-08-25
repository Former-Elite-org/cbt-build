// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import { toast } from "react-hot-toast";
// // import { _post } from "../../../Utils/Helper";
// import { useSelector } from "react-redux";
// import { Spinner } from "reactstrap";
// import { FaDownload } from "react-icons/fa";
// import { _post } from "../../Helper";
// // import { RootState } from "../../../../redux/reducers";
// // import { Spinner } from "react-bootstrap";
// // import FeatherIcon from "feather-icons-react";

// interface Form {
//   student_name: string;
//   current_class: string;
//   admission_no: string;
//   home_address: string;
//   date_of_birth: string;
//   sex: string;
//   religion: string;
//   tribe: string;
//   state_of_origin: string;
//   l_g_a: string;
//   special_health_needs: string;
//   blood_group: string;
//   academic_year: string;
//   primary_contact_number: string;
//   mother_tongue: string;
//   language_known: string;
//   section: string;
//   parent_id: string;
// }

// const _form: Form = {
//   student_name: "",
//   current_class: "",
//   admission_no: "",
//   home_address: "",
//   date_of_birth: "",
//   sex: "",
//   religion: "",
//   tribe: "",
//   state_of_origin: "",
//   l_g_a: "",
//   special_health_needs: "",
//   blood_group: "",
//   academic_year: "",
//   primary_contact_number: "",
//   mother_tongue: "",
//   language_known: "",
//   section: "",
//   parent_id: "",
// };

// interface compProps {
//   setStudents: any;
// }

// const BulkUploadStudents: React.FC<compProps> = ({ setStudents }) => {
//   const [formArray, setFormArray] = useState<Form[]>([]);
//   const [loading, setLoading] = useState(false);
//   const { user, selected_branch } = useSelector((state: any) => state.auth);
//   // Generate Excel Template
//   const generateTemplate = () => {
//     const fields = Object.keys(_form);
//     const ws = XLSX.utils.json_to_sheet([], { header: fields });
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Template");
//     XLSX.writeFile(wb, "Student_Template.xlsx");
//     toast.success("Template downloaded successfully!");
//   };

//   // Handle File Upload
//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) {
//       toast.error("Please select a file to upload.");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target?.result as ArrayBuffer);
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const parsedData = XLSX.utils.sheet_to_json<Form>(worksheet);

//       if (parsedData.length === 0) {
//         toast.error("The uploaded file is empty.");
//         return;
//       }

//       setFormArray(parsedData);
//       setStudents(parsedData);
//       toast.success("File uploaded successfully!");
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   // Handle Form Submit
//   const handleSubmit = () => {
//     if (formArray.length === 0) {
//       toast.error("No data to submit. Please upload a valid Excel file.");
//       return;
//     }

//     setLoading(true);
//     const data = formArray.map((item) => {
//       return {
//         ...item,
//         school_id: user.school_id,
//         branch_id: selected_branch.branch_id,
//         query_type: "create",
//       };
//     });

//     _post("students/bulk?query_type=create", data, (res) => {
//       setLoading(false);
//       if (res.success) {
//         toast.success("Data submitted successfully!");
//         setFormArray([]);
//         setLoading(false);
//       } else {
//         toast.error("Submission failed. Please try again.");
//         setLoading(false);
//       }
//     });
//   };

//   return (
//     <>
//       <div className="col-3">
//         <button className="btn btn-info btn-md" onClick={generateTemplate}><FaDownload size={20} />{" "}Excel Template</button></div>
//       <div className="col-2">
//         <input
//           className="form-control"
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUpload}
//         />
//       </div>
//       <div className="col-2 text-end">
//         <button disabled={loading} className="btn btn-success btn-md" onClick={handleSubmit}>{loading ? <Spinner /> : ""} Submit</button>
//       </div>
//     </>
//   );
// };

// export default BulkUploadStudents;

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { _post } from "../../Helper";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Upload, CheckCircle2 } from "lucide-react";

interface Form {
  student_name: string; current_class: string; admission_no: string; home_address: string;
  date_of_birth: string; sex: string; religion: string; tribe: string;
  state_of_origin: string; l_g_a: string; special_health_needs: string; blood_group: string;
  academic_year: string; primary_contact_number: string; mother_tongue: string;
  language_known: string; section: string; parent_id: string;
}

const _form: Form = {
  student_name: "", current_class: "", admission_no: "", home_address: "",
  date_of_birth: "", sex: "", religion: "", tribe: "", state_of_origin: "",
  l_g_a: "", special_health_needs: "", blood_group: "", academic_year: "",
  primary_contact_number: "", mother_tongue: "", language_known: "", section: "", parent_id: "",
};

interface compProps { setStudents: any; }

const BulkUploadStudents: React.FC<compProps> = ({ setStudents }) => {
  const [formArray, setFormArray] = useState<Form[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, selected_branch } = useSelector((state: any) => state.auth);

  const generateTemplate = () => {
    const fields = Object.keys(_form);
    const ws = XLSX.utils.json_to_sheet([], { header: fields });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Student_Template.xlsx");
    toast.success("Template downloaded successfully!");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) { toast.error("Please select a file to upload."); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json<Form>(worksheet);

      if (parsedData.length === 0) { toast.error("The uploaded file is empty."); return; }
      setFormArray(parsedData);
      setStudents(parsedData);
      toast.success(`Successfully parsed ${parsedData.length} records.`);
    };
    reader.readAsArrayBuffer(file);
  };
  const handleSubmit = () => {
    if (formArray.length === 0) {
      toast.error("No data to submit. Please upload a valid Excel file.");
      return;
    }
    setLoading(true);
    const data = formArray.map((item) => ({
      ...item,
      school_id: user?.school_id,
      branch_id: selected_branch?.branch_id,
      query_type: "create",
    }));

    _post("students/bulk?query_type=create", data, (res) => {
      setLoading(false);
      if (res.success) {
        toast.success("Bulk records deployed successfully!");
        setFormArray([]);
      } else {
        toast.error(res.message || "Bulk submission failed.");
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={generateTemplate}
          className="h-10 text-xs font-bold rounded-xl text-gray-500 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 gap-1.5 shadow-sm"
        >
          <Download className="h-3.5 w-3.5 text-[#00356B]" /> Get Excel Template
        </Button>
        
        <div className="relative h-10 flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 min-w-[200px]">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs truncate max-w-[180px]">
            <Upload className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            {formArray.length > 0 ? `Ready: ${formArray.length} Students` : "Upload Sheets Feed"}
          </div>
        </div>
      </div>

      <Button
        disabled={loading || formArray.length === 0}
        onClick={handleSubmit}
        className="h-10 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-600/90 text-white w-full sm:w-auto min-w-[130px] shadow-sm gap-1.5 disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Inserting...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" /> Deploy Records
          </>
        )}
      </Button>
    </div>
  );
};

export default BulkUploadStudents;

