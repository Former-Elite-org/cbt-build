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
import Datatable from "../../core/common/dataTable";

const AcademicYear = () => {
  // Define the AcademicYear interface. Fields for both new and existing entries.
  interface AcademicYear {
    id?: string;
    year: string;
    term: string;
    begin_date: string;
    end_date: string;
    query_type: string;
    school_id: string;
    section_name?: string;
    address?: string;
    school_name?: string;
    status?: string;
    academic_year: string;
  }

  // Initial form values for creating a new academic year entry.
  const _form: AcademicYear = {
    id: "",
    query_type: "create",
    school_id: "",
    section_name: "",
    address: "",
    school_name: "",
    year: "",
    begin_date: "",
    end_date: "",
    term: "",
    academic_year: "",
  };



  // State for the form used in creating new entries.
  const [form, setForm] = useState<AcademicYear>(_form);
  // State for new entries (to be created via the modal).
  // State for academic years fetched from the database.
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const navigate = useNavigate();
  const [new_data, setNewData] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);


  const { school, user } = useSelector((state: RootState) => state.auth);
  const defaultAcademicYears =[
    {
    query_type: "create",
    school_id: school?.school_id || "",
    year:`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    begin_date: `${moment().format("YYYY")}-09-01`,
    end_date: `${moment().format("YYYY")}-12-25`,
    term: "First Term",
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
    {
    query_type: "create",
    school_id: school?.school_id || "",
    year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    begin_date: `${moment().format("YYYY")}-01-01`,
    end_date: `${moment().format("YYYY")}-03-01`,
    term: "Second Term",
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
    {
    query_type: "create",
    school_id: school?.school_id || "",
    year:`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    begin_date: `${moment().format("YYYY")}-05-01`,
    end_date: `${moment().format("YYYY")}-08-01`,
    term: "Third Term",
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
  ];


  const [newAcademicYears, setNewAcademicYears] = useState<AcademicYear[]>(defaultAcademicYears);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  // For DatePicker container
  // const getModalContainer = () => {
  //   const modalElement = document.getElementById("modal-datepicker");
  //   return modalElement ? modalElement : document.body;
  // };



  // Fetch existing academic years from the database.
  const getAcademicYears = useCallback(() => {
    if (user.school_id) {
      _get(
        `get-academic-years?query_type=selectByid&school_id=${user.school_id}`,
        (res: any) => {
          console.log(res);
          setAcademicYears(res.results);
        },
        (err: any) => {
          console.log(err);
        }
      );
    }
  },[user.school_id]);

  useEffect(() => {
    // getSchools();
    getAcademicYears();
    // getSections();
  }, [getAcademicYears]);

  // For suspend functionality
  const [selectedSchool, setSelectedSchool] = useState<{
    school_id: string;
    id: string;
    status: string;
  } | null>(null);

  const handleSuspend = (id: string, newStatus: string) => {
    const payload = {
      query_type: "update-status",
      status: newStatus,
      id: id,
    };

    _post(
      "create-academic-years",
      payload,
      (res: any) => {
        if (res.success) {
          getAcademicYears();
         
          // window.location.reload();
          toast.success("Submitted successfully");
        }
      },
      (err: any) => {
        toast.error(err);
        console.error("Submission failed:", err);
      }
    );
  };

  // For modal new entries (creation) - track which index (if any) is being edited.
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleAdd = () => {
    // Validate required fields
    if (!form.term) {
      alert("Please fill out Term");
      return;
    } else if (!form.begin_date) {
      alert("Please fill out Begin Date");
      return;
    } else if (!form.end_date) {
      alert("Please fill out End Date");
      return;
    }
    if (editIndex !== null) {
      const updatedEntries = [...newAcademicYears];
      updatedEntries[editIndex] = form;
      setNewAcademicYears(updatedEntries);
      setEditIndex(null);
    } else if (newAcademicYears.length < 3) {
      setNewAcademicYears([...newAcademicYears, form]);
    } else {
      alert("You can only add up to 3 entries.");
    }
    setForm((p)=>({..._form, year:p.year}));
  };

  const handleRemove = (index: number) => {
    setNewAcademicYears(newAcademicYears.filter((_, i) => i !== index));
  };

  const handleSubmitNewEntries = async () => {
    const formattedEntries = newAcademicYears.map((entry) => ({
      ...entry,
      begin_date: entry.begin_date
        ? moment(new Date(entry.begin_date)).format("YYYY-MM-DD")
        : null,
      end_date: entry.end_date
        ? moment(new Date(entry.end_date)).format("YYYY-MM-DD")
        : null,
    }));

    try {
      for (const entry of formattedEntries) {
        await new Promise((resolve, reject) => {
          _post(
            "create-academic-years",
            entry,
            (res) => {
              if (!res.success) {
                reject(res); // Reject the promise with backend error
              } else {
                resolve(res);
              }
            },
            (err) => {
              reject(err); // Reject if there's a network error
            }
          );
        });
      }

      // Refresh the list after submission
      getAcademicYears();
      toast.success("Submitted successfully");

      // Clear the new entries after successful submission
      setNewAcademicYears([]);
    } catch (error: unknown) {
      // Type assertion to check if error is an object
      if (
        typeof error === "object" &&
        error !== null &&
        "sqlMessage" in error
      ) {
        const errObj = error as { sqlMessage: string };

        if (errObj.sqlMessage.includes("Duplicate entry")) {
          toast.error("The academic year and term already exist!");
        } else {
          toast.error("Submission failed");
        }
      } else {
        toast.error("Submission failed");
      }

      console.error("Submission failed:", error);
    }
  };

  // ---- EDIT MODAL SECTION ----

  // Create a separate state for the edit form.
  const [editForm, setEditForm] = useState<AcademicYear>(_form);

  useEffect(() => {
    if (selectedSchool) {
      // Find the record in academicYears by id.
      const record = academicYears.find((rec) => rec.id === selectedSchool.school_id);
     
      if (record) {
        setEditForm({
          ...record,
          year: record.academic_year,
          begin_date: record.begin_date
            ? moment(record.begin_date).format("YYYY-MM-DD")
            : "",
          end_date: record.end_date
            ? moment(record.end_date).format("YYYY-MM-DD")
            : "",
        });
      }
    }
  }, [selectedSchool]);

  // Handle update submission from the Edit modal.
  const handleUpdate = (id: string | undefined) => {
    const updatedPayload = {
      ...editForm,
      query_type: "update",
      begin_date: editForm.begin_date
        ? moment(editForm.begin_date).format("YYYY-MM-DD")
        : null,
      end_date: editForm.end_date
        ? moment(editForm.end_date).format("YYYY-MM-DD")
        : null,
      id: id,
    };

    _post(
      "create-academic-years",
      updatedPayload,
      (res: any) => {
        if (res.success) {
          toast.success("Updated successfully");
          getAcademicYears();
        }
      },
      (err: any) => {
        toast.error("Update failed");
        console.error("Update failed:", err.message);
      }
    );

    // Optionally clear the edit form and selectedSchool
    setEditForm({ ..._form });
    setSelectedSchool(null);
  };

  // -----------------------------

  const routes = all_routes;
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };

  const columns = [
    {
      title: "Academic Year",
      dataIndex: "academic_year",
    },
    {
      title: "Term",
      dataIndex: "term",
    },
    {
      title: "Start Date",
      dataIndex: "begin_date",
    },
    {
      title: "End Date",
      dataIndex: "end_date",
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
            <div className="dropdown">
              <Link
                to="#"
                className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="ti ti-dots-vertical fs-14" />
              </Link>
              <ul className="dropdown-menu dropdown-menu-right p-3">
                <li>
                  <Link
                    className="dropdown-item rounded-1"
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#Edit-modal"
                    onClick={() => {
                      // When editing, set the selected record.
                      setSelectedSchool(record);
                    }}
                  >
                    <i className="ti ti-edit-circle me-2" />
                    Edit
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item rounded-1"
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#suspend-modal"
                    onClick={() =>
                      setSelectedSchool({
                        school_id: record.school_id.toString(),
                        status: record.status,
                        id: record.id.toString(),
                      })
                    }
                  >
                    <i className="ti ti-suspend me-2" />
                    {record.status === "Active" ? "Suspend" : "Activate"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
      {/* Main page wrapper that displays existing academic years */}
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="d-flex my-xl-auto justify-content-right right-content align-items-center flex-wrap">
            <div className="mb-2">
                <Link
                  to="#"
                  data-bs-toggle="modal"
                  data-bs-target="#add_year"
                  className="btn btn-primary"
                >
                  <i className="ti ti-square-rounded-plus-filled me-2" />
                  Add Academic Year
                </Link>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Academic Year List</h4>
            </div>
            <div className="card-body p-0 py-3">
              <Datatable
                columns={columns}
                dataSource={academicYears}
                Selection={false}
              />
            </div>
          </div>
        </div>
      </div>
      <>
        {/* Modal for creating new academic year entries */}
        <div className="modal fade" id="add_year">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Academic Year</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Academic Year</label>
                            <input
                              className="form-control"
                              name="year"
                              value={form.year}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  year: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Term</label>
                            <CommonSelect
                              className="select"
                              options={acadamicTerms}
                              defaultValue={{
                                value: form.term,
                                label: form.term,
                              }}
                              handleChange={(newValue: Option | null) =>
                                setForm((prev) => ({
                                  ...prev,
                                  term: newValue ? newValue.value : "",
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Begin Date</label>
                            <div className="date-pic">
                              <input
                                className="form-control"
                                name="end_date"
                                type="date"
                                value={form.begin_date}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    begin_date: e.target.value,
                                  }))
                                }
                              />
                              {/* <DatePicker
                                getPopupContainer={getModalContainer}
                                placeholder="Choose Begin Date"
                                format="YYYY-MM-DD"
                                className="form-control timepicker"
                                name="begin_date"
                                value={
                                  form.begin_date
                                    ? moment(form.begin_date)
                                    : null
                                }
                                onChange={(date, dateString) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    begin_date: moment(form.begin_date),
                                  }));
                                }}
                              /> */}
                              {/* <span className="cal-icon">
                                <i className="ti ti-clock" />
                              </span> */}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Closing Date</label>
                            <div className="date-pic">
                              {/* <DatePicker
                                getPopupContainer={getModalContainer}
                                placeholder="Choose Closing Date"
                                format="YYYY-MM-DD"
                                className="form-control timepicker"
                                name="end_date"
                                value={
                                  form.end_date ? moment(form.end_date) : null
                                }
                                onChange={(date, dateString) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    end_date: date ? date.toDate() : null,
                                  }));
                                }}
                              /> */}
                              {/* <span className="cal-icon">
                                <i className="ti ti-clock" />
                              </span> */}
                              <input
                                className="form-control"
                                name="end_date"
                                type="date"
                                value={form.end_date}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    end_date: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleAdd}
                        >
                          Add
                        </button>
                      </div>

                      {/* New Entries Table for Academic Years to be created */}
                      <table className="table mt-3">
                        <thead>
                          <tr>
                            <th>Academic Year</th>
                            <th>Term</th>
                            <th>Begin Date</th>
                            <th>Closing Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newAcademicYears.map((entry, index) => (
                            <tr key={index}>
                              <td>{entry.year}</td>
                              <td>{entry.term}</td>
                              <td>
                                {entry.begin_date
                                  ? new Date(entry.begin_date).toDateString()
                                  : ""}
                              </td>
                              <td>
                                {entry.end_date
                                  ? new Date(entry.end_date).toDateString()
                                  : ""}
                              </td>
                              <td>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemove(index)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-dismiss="modal"
                    onClick={handleSubmitNewEntries}
                    disabled={newAcademicYears.length === 0}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <div className="modal fade" id="Edit-modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="row">
                        {/* {JSON.stringify(selectedSchool?.id)} */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Academic Year</label>
                            <input
                              className="form-control"
                              name="year"
                              value={editForm.year}
                              // defaultValue={editForm.academic_year}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  year: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Term</label>
                            <CommonSelect
                              className="select"
                              options={acadamicTerms}
                              defaultValue={{
                                value: editForm.term,
                                label: editForm.term,
                              }}
                              handleChange={(newValue: Option | null) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  term: newValue ? newValue.value : "",
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Begin Date</label>
                            <div className="date-pic">
                              <input
                                className="form-control"
                                name="begin_date"
                                type="date"
                                value={editForm.begin_date}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    begin_date: e.target.value,
                                  }))
                                }
                              />
                              {/* Optional icon */}
                              {/* <span className="cal-icon">
                                <i className="ti ti-clock" />
                              </span> */}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Closing Date</label>
                            <div className="date-pic">
                              <input
                                className="form-control"
                                name="end_date"
                                type="date"
                                value={editForm.end_date}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    end_date: e.target.value,
                                  }))
                                }
                              />
                              {/* <span className="cal-icon">
                                <i className="ti ti-clock" />
                              </span> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-dismiss="modal"
                    onClick={() => handleUpdate(selectedSchool?.id)}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Suspend Modal */}
        <div className="modal fade" id="suspend-modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form>
                <div className="modal-body text-center">
                  <span className="delete-icon">
                    <i className="ti ti-alert-circle fs-5" />
                  </span>
                  <h4>
                    Confirm{" "}
                    {selectedSchool?.status === "Active"
                      ? "Suspension"
                      : "Activation"}
                  </h4>
                  <p>
                    You want to{" "}
                    {selectedSchool?.status === "Active"
                      ? "suspend"
                      : "activate"}{" "}
                    this Term
                  </p>
                  <div className="d-flex justify-content-center">
                    <button
                      type="button"
                      className="btn btn-light me-3"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      data-bs-dismiss="modal"
                      onClick={() => {
                        if (selectedSchool) {
                          handleSuspend(
                            selectedSchool.id,
                            selectedSchool.status === "Active"
                              ? "Inactive"
                              : "Active"
                          );
                        }
                      }}
                    >
                      Yes,{" "}
                      {selectedSchool?.status === "Active"
                        ? "Suspend"
                        : "Activate"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default AcademicYear;
