import React, { useCallback, useEffect, useRef, useState } from "react";
// import { StudentTable } from "../../../core/data/json/class_home_work";
import Table from "../../core/common/dataTable/index";
import CommonSelect, { Option } from "../../core/common/commonSelect";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import { _get, _post, server_url } from "../../Utils/Helper";
// import { SingleValue } from "react-select";
import { toast } from "react-hot-toast";
import { Button } from "antd";
import { useSelector } from "react-redux";
import useQuery from "../../Helper";

const ExamQuestions = () => {
  const { user, selected_branch, academic_calendar } = useSelector((state) => state.auth)
  const q = useQuery();
  const exam_id = q.get('exam_id')||"";
  const _form = {
    assignment_date: "",
    class_name: "",
    submission_date: "",
    attachment: "",
    subject: "",
    content: "",
    query_type: 'create',
    teacher_name: user.name,
    student_name: "",
    admission_no: "",
  };

  const navigate = useNavigate()
  const [cbtExams, setCbtExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  const onChangeMedicalCondition = (e) => {
    const attachmentFile = e.target.files[0];
    const formData = new FormData();
    formData.append("media", attachmentFile);
    console.log(formData, "LLSS");

    fetch(server_url + "/upload_transfer_certificate-document", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Uploaded Image URL:", data.url);
        setForm((p) => ({ ...p, upload: data.url }));
        alert("Uploaded successfully");
      })
      .catch((error) => {
        console.error("Error uploading attachment:", error);
      });
  };

  const [form, setForm] = useState(_form);
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    if (!form.assignment_date) {
      toast.error("Please select assignment date");
      return;
    }
    if (!form.submission_date) {
      toast.error("Please select submissoin date");
      return;
    }
    if (!form.subject) {
      toast.error("Please select subject");
      return;
    }
    if (!form.content) {
      toast.error("Please write content");
      return;
    }
    if (!form.class_name) {
      toast.error("Please select class");
      return;
    }

    e.preventDefault();
    _post(
      "cbtExams?query_type=create",
      { ...form, student_name: user.student_name, admission_no: user.admission_no },
      (res) => {
        getCbtExams()
        // setLoading(false);
        toast.success("Created Assignment successfully");
      },
      (err) => {
        // setLoading(false);
        console.error("Error creating Assignment:", err);
      }
    );
  };

  const getCbtExams = useCallback(() => {
    if (user.class_name &&academic_calendar.length) {
      _get(`exam-questions?query_type=select&exam_id=${exam_id}`,
             (res) => {
          setCbtExams(res.data);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }, [user.class_name, selected_branch,academic_calendar.length,exam_id]);

  const [subjectClasses, setSubjectClasses] = useState({
    subject: "",
    class_name: "",
    section: "",
  });
  useEffect(() => {
    // getSecScl();
    _get(
      "subjects?query_type=select-subject",
      (res) => {
        //   navigate(`/agent`)
        console.log(res);
        setSubjects(res.results);
      },
      (err) => {
        // setLoading(false)
        console.log(err);
      }
    );
  }, [0]);

  const getClasses = useCallback(() => {
    _get(
      `classes?query_type=select-all`,
      (res) => {
        //   navigate(`/agent`)
        console.log(res);
        setClasses(res.data);
      },
      (err) => {
        // setLoading(false)
        console.log(err);
      }
    );
    // console.log(form)
  }, [form]);

  useEffect(() => {
    getClasses()
    getCbtExams()
  }, [getCbtExams])
  const classOptions = classes?.length ? classes?.map((i) => ({
    label: i.class_name,
    value: i.class_name,
  })) : [];


  const columns = [
    {
      title: "#",
      dataIndex: "id",
      render: (text, record, index) => (
        <>
          <Link to="#" className="link-primary">
            {index + 1}
          </Link>
        </>
      )
    },
    // {
    //   title: "Class",
    //   dataIndex: "class_name",
    //   render: (text: string) => (
    //     <div className="d-flex align-items-center">
    //       {text}
    //     </div>
    //   ),
    // },
    {
      title: "Subject",
      dataIndex: "subject",
      render: (text) => (
        <div className="d-flex align-items-center">
          {text}
        </div>
      ),
    },
    {
      title: "Teacher Name",
      dataIndex: "teacher_name",
      render: (text) => (
        <div className="d-flex align-items-center">
          {text}
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      render: (text) => (
        <div className="d-flex align-items-center">
          {text}
        </div>
      ),
    },
    {
      title: "CbtExams Date",
      dataIndex: "assignment_date",
      render: (text) => (
        <div className="d-flex align-items-center">
          {text}
        </div>
      ),
    },
    {
      title: "Submission Date",
      dataIndex: "submission_date",
      render: (text) => (
        <div className="d-flex align-items-center">
          {text}
        </div>
      ),
    },
    // {
    //   title: "Attachment",
    //   dataIndex: "attachment",
    //   render: (text: string) => (
    //     <div className="d-flex align-items-center">
    //       {text?.length > 10 && (<Link to={text} className="avatar avatar-md">
    //         <i style={{ fontSize: 20 }} className="ti ti-files" />
    //       </Link>)}

    //     </div>
    //   )
    // },

    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <>
          <Button onClick={() => navigate(`${all_routes.viewStudentAssignment}?id=${record.id}`)}>View</Button>
        </>
      ),
    },
  ];
  return (
      <div className="page-wrapper">
        <div className="content-two">
         
          <div className="row">
            {/* <StudentBreadcrumb /> */}
          </div>
          <div className="row">
            {/* Student Information */}
            {/* <StudentSidebar /> */}
            <div className="col-12">
            {/* <StudentNavBar /> */}
              <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                 <h4>{user.class_name} - cbtExams  </h4>
                </div>
                <div className="card-body p-0 py-3">
                  {/* Guardians List */}
                  <Table
                    dataSource={cbtExams}
                    columns={columns}
                    Selection={false}
                  />

                  {/* /Guardians List */}
                </div>
              </div>
              {/* /Guardians List */}
            </div>
          </div>
        </div>
        {/* /Page Wrapper */}
        {/* Add Home Work */}
        {/* {JSON.stringify(cbtExams)} */}
        <div className="modal fade" id="add_home_work">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Assignment</h4>
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
                  {/* {JSON.stringify(form)} */}
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-12">
                        {/* <div className="mb-3">
                        <label className="form-label">Class</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Class"
                          defaultValue="I"
                        />
                      </div> */}
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">class</label>
                              <CommonSelect
                                className="select"
                                options={classOptions}
                                handleChange={(newValue) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    class_name: newValue ? newValue.value : "",
                                  }))
                                }
                                defaultValue={{
                                  label: form.class_name,
                                  value: form.class_name,
                                }}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Subject</label>
                              <CommonSelect
                                handleChange={(newValue) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    subject: newValue ? newValue.value : "",
                                  }))
                                }
                                defaultValue={{
                                  label: form.subject,
                                  value: form.subject,
                                }}
                                options={subjects}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Assignment Date
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                placeholder="10 May 2024"
                                name="assignment_date"
                                value={form.assignment_date}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Submission Date
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                placeholder="12 May 2024"
                                name="submission_date"
                                value={form.submission_date}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Attachment</label>
                          <input
                            type="file"
                            className="form-control image-sign"
                            multiple
                            disabled={form.attachment?.length > 10}
                            name="upload"
                            onChange={onChangeMedicalCondition}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Content</label>
                          <textarea
                            className="form-control"
                            placeholder="Add Comment"
                            rows={4}
                            defaultValue={""}
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                          />
                        </div>
                        {/* <div className="d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>Status</h5>
                          <p>Change the Status by toggle </p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="switch-sm2"
                          />
                        </div>
                      </div> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Link
                    to="#"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-primary"
                    data-bs-dismiss="modal"
                    onClick={handleSubmit}
                  >
                    Add Assignment
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Home Work */}
        {/* Edit Home Work */}

        <div className="modal fade" id="edit_home_work">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Assignment</h4>
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
                      {/* <div className="mb-3">
                        <label className="form-label">Class</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Class"
                          defaultValue="I"
                        />
                      </div> */}
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">class</label>
                            <CommonSelect
                              className="select"
                              options={classOptions}
                              handleChange={(newValue) =>
                                setSubjectClasses((prev) => ({
                                  ...prev,
                                  class_name: newValue ? newValue.value : "",
                                }))
                              }
                              defaultValue={{
                                label: subjectClasses.class_name,
                                value: subjectClasses.class_name,
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Subject</label>

                            <CommonSelect
                              handleChange={(newValue) =>
                                setSubjectClasses((prev) => ({
                                  ...prev,
                                  subject: newValue ? newValue.value : "",
                                }))
                              }
                              defaultValue={{
                                label: subjectClasses.subject,
                                value: subjectClasses.subject,
                              }}
                              options={subjects}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Assignment Date
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="10 May 2024"
                              name="assignment_date"
                              value={form.assignment_date}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Submission Date
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="12 May 2024"
                              name="submission_date"
                              value={form.submission_date}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Attachment</label>
                        <input
                          type="file"
                          className="form-control"
                          placeholder="Placeholders"
                          name="attachment"
                          value={form.attachment}
                          onChange={onChangeMedicalCondition}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Content</label>
                        <textarea
                          className="form-control"
                          placeholder="Add Comment"
                          rows={4}
                          defaultValue={""}
                          name="content"
                          value={form.content}
                          onChange={handleChange}
                        />
                      </div>
                      {/* <div className="d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>Status</h5>
                          <p>Change the Status by toggle </p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="switch-sm2"
                          />
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Link
                    to="#"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-primary"
                    data-bs-dismiss="modal"
                  >
                    Save Changes
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Edit Home Work */}
        {/* Delete Modal */}
        <div className="modal fade" id="delete-modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form>
                <div className="modal-body text-center">
                  <span className="delete-icon">
                    <i className="ti ti-trash-x" />
                  </span>
                  <h4>Confirm Deletion</h4>
                  <p>
                    You want to delete all the marked items, this cant be undone
                    once you delete.
                  </p>
                  <div className="d-flex justify-content-center">
                    <Link
                      to="#"
                      className="btn btn-light me-3"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-danger"
                      data-bs-dismiss="modal"
                    >
                      Yes, Delete
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Delete Modal */}
        </div>
      );
};

export default ExamQuestions;
