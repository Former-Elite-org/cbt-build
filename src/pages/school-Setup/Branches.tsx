import React, { useCallback, useEffect, useRef, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import PredefinedDateRanges from "../../../core/common/datePicker";
import {
  acadamicTerms,
  activeList,
} from "../../../core/common/selectoption/selectoption";
import CommonSelect, { Option } from "../../../core/common/commonSelect";
import { Link, useNavigate } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../router/all_routes";
import { _get, _post } from "../../Utils/Helper";
import { toast } from "react-hot-toast";
import { DatePicker, Input, TimePicker } from "antd";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/reducers";

const Branches = () => {
  interface Branch {
    name: string;
    email: string;
    phone: string;
    password: string;
    username: string;
  }

  const _form: Branch = {
    name: "",
    email: "",
    phone: "",
    password: "",
    username: "",
  };

  const [form, setForm] = useState<Branch>(_form);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminDetails, setAdminDetails] = useState<any[]>([])
  const [showAddAdmin, setShowAddAdmin] = useState(false);
 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const navigate = useNavigate();
  const [new_data, setNewData] = useState<any[]>([]);
  const { school, user } = useSelector((state: RootState) => state.auth);

  const getBranches = () => {
    _get(
      `branches?school_id=${user.school_id}&query_type=get_all`,
      (res: any) => {
        console.log(res);
        setNewData(res.data);
      },
      (err: any) => {
        console.log(err);
      }
    );
  };
  const handleSubmit = () => {
    _post(
      `branch-admin?query_type=create&branch_id=${selectedBranch.id}`,
      { ...form},
      (res) => {
        if (res.success) {
          toast.success(`Branch added successfully`);
          branchAdmin();
          setShowAddAdmin(false);
          setForm(_form);
        }
      },
      (err) => {
        toast.error(err.message || "Error adding branch");
      }
    );
  };

  useEffect(() => {
    getBranches();
  }, [user]);
  const branchAdmin = useCallback(() => {
    if (selectedBranch) {
      _get(
        `get-branch-admin?branch_id=${selectedBranch.id}&query_type=select`,
        (res: any) => {
          // console.log(res);
          setAdminDetails(res.data);
        },
        (err: any) => {
          console.log(err);
        }
      );
    }
  }, [selectedBranch]);
  useEffect(() => {
    branchAdmin();
  }, [branchAdmin]);

  const columns = [
    {
      title: "Branch Name",
      dataIndex: "branch_name",
    },
    {
      title: "Location",
      dataIndex: "location",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <>
          {text === "Active" ? (
            <span className="badge badge-soft-success d-inline-flex align-items-center">
              <i className="ti ti-circle-filled fs-5 me-1"></i>
              {text}
            </span>
          ) : (
            <span className="badge badge-soft-danger d-inline-flex align-items-center">
              <i className="ti ti-circle-filled fs-5 me-1"></i>
              {text}
            </span>
          )}
        </>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text: string, record: any) => (
        <>
          <div className="d-flex align-items-center">
            {/* {record.admin_id ? ( */}
              <Link
                to="#"
                data-bs-toggle="modal"
                data-bs-target="#view_admin"
                className="btn btn-light"
                onClick={() => {
                    setSelectedBranch(record);
                  }}
                >
                  <i className="ti ti-square-rounded-plus-filled me-2" />
                  View Branch Admin
              </Link>
              {/* ) : ( */}
                {/* <Link
                  to="#"
                  data-bs-toggle="modal"
                  data-bs-target="#add_year"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedBranch(record);
                  }}
                >
                  <i className="ti ti-square-rounded-plus-filled me-2" />
                  Add Branch Admin
                </Link>
              {/* )} */}
         
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
        <div className="page-wrapper">
        <div className="content">
          
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Branch List</h4>
            </div>
            <div className="card-body p-0 py-3">
              <Table
                columns={columns}
                dataSource={new_data}
                Selection={false}
              />
            </div>
          </div>
        </div>
      </div>
      <>
        {/* Modal for creating new branch entries */}
       <div className="modal fade" id="view_admin">
         <div className="modal-dialog modal-dialog-centered modal-lg">
           <div className="modal-content">
             <div className="modal-header">
               <h4 className="modal-title">Admin Details</h4>
               <button
                 type="button"
                 className="btn-close custom-btn-close"
                 data-bs-dismiss="modal"
                 aria-label="Close"
               >
                 <i className="ti ti-x" />
               </button>
             </div>
             <div className="modal-body">
               <div className="row">
                 <div className="col-md-12">
                  
                   {showAddAdmin ? (
                     <form>
                       <div className="row">
                         <div className="col-md-6">
                           <div className="mb-3">
                             <label className="form-label">Name</label>
                             <input
                               className="form-control"
                               name="name"
                               value={form.name}
                               onChange={(e) =>
                                 setForm((prev) => ({
                                   ...prev,
                                   name: e.target.value,
                                 }))
                               }
                             />
                           </div>
                         </div>
                         <div className="col-md-6">
                           <div className="mb-3">
                             <label className="form-label">Email</label>
                             <input
                               className="form-control"
                               name="email"
                               value={form.email}
                               onChange={(e) =>
                                 setForm((prev) => ({
                                   ...prev,
                                   email: e.target.value,
                                 }))
                               }
                             />
                           </div>
                         </div>
                         <div className="col-md-6">
                           <div className="mb-3">
                             <label className="form-label">Phone No</label>
                             <input
                               className="form-control"
                               name="phone"
                               type="number"
                               value={form.phone}
                               onChange={(e) =>
                                 setForm((prev) => ({
                                   ...prev,
                                   phone: e.target.value,
                                 }))
                               }
                             />
                           </div>
                         </div>
                         <div className="col-md-6">
                           <div className="mb-3">
                             <label className="form-label">Password</label>
                             <input
                               className="form-control"
                               name="password"
                               value={form.password}
                               onChange={(e) =>
                                 setForm((prev) => ({
                                   ...prev,
                                   password: e.target.value,
                                 }))
                               }
                             />
                           </div>
                         </div>
                         <div className="col-md-6">
                           <div className="mb-3">
                             <label className="form-label">Username</label>
                             <input
                               className="form-control"
                               name="username"
                               value={form.username}
                               onChange={(e) =>
                                 setForm((prev) => ({
                                   ...prev,
                                   username: e.target.value,
                                 }))
                               }
                             />
                           </div>
                         </div>
                       </div>
                       <div className="modal-footer">
                         <button
                           type="button"
                           className="btn btn-light me-2"
                           onClick={() => setShowAddAdmin(false)}
                         >
                           Cancel
                         </button>
                         <button
                           type="button"
                           className="btn btn-primary"
                           onClick={handleSubmit}
                         >
                           Submit
                         </button>
                       </div>
                     </form>
                   ) : (
                    <div>
                     <table className="table">
                       <thead>
                         <tr>
                           <th>Name</th>
                           <th>Email</th>
                           <th>Phone No</th>
                           <th>Username</th>
                         </tr>
                       </thead>
                       <tbody>
                         {adminDetails.length > 0 ? (
                           adminDetails.map((details, index) => (
                             <tr key={index}>
                               <td>{details?.name}</td>
                               <td>{details?.email}</td>
                               <td>{details?.phone}</td>
                               <td>{details?.username}</td>
                             </tr>
                           ))
                         ) : (
                           <tr>
                             <td colSpan={4} className="text-center">
                               No admin added yet
                             </td>
                           </tr>
                         )}
                       </tbody>
                      
                     </table>
                     <button
                     type="button"
                     className="btn btn-primary mt-3 float-end"
                     onClick={() => setShowAddAdmin(true)} 
                     
                   >
                     Add Admin
                   </button>
                     </div>
                   )}
                 </div>
               </div>
             </div>
             <div className="modal-footer">
               <button
                 type="button"
                 className="btn btn-light"
                 data-bs-dismiss="modal"
               >
                 Close
               </button>
             </div>
           </div>
         </div>
       </div>

      </>
    </div>
  );
};

export default Branches;
