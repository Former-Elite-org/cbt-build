"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  Progress,
  Badge,
} from "reactstrap";
import {
  FaGraduationCap,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaUserGraduate,
  FaPlus,
  FaEdit,
  FaEye,
  FaCalendarAlt,
  FaBookOpen,
  FaUsers,
  FaTasks,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { _get, _post } from "../../Helper";
import { toast } from "react-hot-toast";
import "./admin-dashboard.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DatePicker, message } from "antd";
const { RangePicker } = DatePicker;
export default function AdminDashboard() {
  const [examList, setExamList] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: null });
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  // const [selectedExam, setSelectedExam] = useState(null)
  // const [questionCollapse, setQuestionCollapse] = useState({})
  // const [subjects, setSubjects] = useState([])
  // const [classes, setClasses] = useState([])
  const [section, setSection] = useState([]);
  const [error, setError] = useState({});
  // const [page, setPage] = useState(1)
  const navigate = useNavigate();

  const { user, classes, subjects, selected_branch } = useSelector(
    (s) => s.auth
  );

  const [dates, setDates] = useState({ start_date: "", end_date: "" });

  const onRangeChange = (date, dateStrings) => {
    setDates({ start_date: dateStrings[0], end_date: dateStrings[1] });
  };

  // Stats for admin dashboard
  const [stats, setStats] = useState({
    total_students: 0,
    averageScore: 0,
    pending_exams: 0,
    upcoming_exams: 0,
    completionRate: 0,
    topPerformers: 0,
  });

  // Fetch data
  // const fetchData = useCallback(() => {
  //   if (selected_branch.branch_id) {
  //     _get(
  //       `dashboard_query?query_type=Select CBT Dashboard&branch_id=${selected_branch.branch_id}&start_date=${dates.start_date}&end_date=${dates.end_date}`,
  //       (res) => {
  //         setLoading(false);
  //         if (res.success) {
  //           setStats(res.data[0]);
  //         }
  //       },
  //       (err) => {
  //         console.error(err);
  //         setLoading(false);
  //         message.error("Failed to load Dashboard analitics");
  //       }
  //     );
  //   }
  // }, [dates, selected_branch]);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  // Fetch data
  const fetchData = useCallback(() => {
    _get(`examinations?query_type=select-all`, (resp) => {
      if (resp.success) setExamList(resp.data);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = () => {
    const newErrors =
      modal.type === "exam" ? validateForm(form) : validateQuestion(form);
    setError(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      _post(
        modal.type === "exam" ? "exam_creation" : "exam-questions",
        { ...form, teacher_id: user.id },
        () => {
          setLoading(false);
          toast.success(
            `${
              modal.type === "exam" ? "Exam" : `Question`
            } created successfully`
          );
          setModal({ isOpen: false, type: null });
          setForm({});
          // fetchData()
        },
        () => {
          setLoading(false);
          toast.error("Error occurred");
        }
      );
    } else {
      console.log("errors:", newErrors);
      toast.error(Object.values(newErrors)[0]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError({ ...error, [name]: "" });
  };

  const validateForm = (formData) => {
    const newErrors = {};
    if (!formData.assessment_type) {
      newErrors.assessment_type = "Please fill the assessment type";
    }
    if (!formData.class_name) {
      newErrors.class_name = "Please fill the class name";
    }
    if (!formData.term) {
      newErrors.term = "Please fill the term";
    }
    if (!formData.subject_name) {
      newErrors.subject_name = "Please fill the subject name";
    }
    if (!formData.commence_date) {
      newErrors.commence_date = "Please fill the commence date";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Please fill the start time";
    }
    if (!formData.end_time) {
      newErrors.end_time = "Please fill the end time";
    }
    return newErrors;
  };

  const validateQuestion = (question) => {
    const newQuestions = {};
    if (!question.exam_id) {
      newQuestions.exam_id = "Please fill the Assessment Type";
    }
    if (!question.question) {
      newQuestions.question = "Please fill the question";
    }
    if (!question.option1) {
      newQuestions.option1 = "Please fill option 1";
    }
    if (!question.option2) {
      newQuestions.option2 = "Please fill option 2";
    }
    if (!question.option3) {
      newQuestions.option3 = "Please fill option 3";
    }
    if (!question.option4) {
      newQuestions.option4 = "Please fill option 4";
    }
    if (!question.answer) {
      newQuestions.answer = "Please fill the answer";
    }
    if (!question.marks) {
      newQuestions.marks = "Please fill the marks";
    }
    return newQuestions;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "active":
        return "primary";
      default:
        return "secondary";
    }
  };
  const [filter, setFilter] = useState({});
  const classOption =
    classes?.map((i) => ({
      label: i.class_name,
      value: i.class_code,
    })) || [];

  const subjectOption =
    subjects
      ?.filter((i) => i.class_code === filter.class)
      .map((i) => ({
        label: i.subject,
        value: i.subject,
      })) || [];

  return (
    <div className="elite-admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h4 className="stats-title d-flex align-items-center">
            Dashboard Overview
          </h4>
          {/* <p className="dashboard-subtitle">Manage exams, monitor performance, and oversee CBT operations</p> */}
        </motion.div>
      </div>
      <br />
      <br />
      <br />
      {/* Quick Actions */}
      {/* <Row className="quick-actions-section mb-4 mt-8">
        <Col lg={6} className="mb-3">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Button
              className="action-btn create-exam-btn"
              block
              onClick={() => setModal({ isOpen: true, type: "exam" })}
            >
              <FaPlus className="me-2" />
              Create New Exam
            </Button>
          </motion.div>
        </Col>
        <Col lg={6} className="mb-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Button
              className="action-btn add-question-btn"
              block
              onClick={() => setModal({ isOpen: true, type: "question" })}
            >
              <FaEdit className="me-2" />
              Add Questions
            </Button>
          </motion.div>
        </Col>
      </Row> */}

      {/* Performance Overview */}
      <Row className="stats-overview mb-4">
        <Col lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="stats-card">
              <CardBody>
                <div className="stats-header">
                  <div className="stats-header d-flex flex-row justify-content-between align-items-center">
                    <h4 className="stats-title d-flex align-items-center">
                      <FaChartLine className="me-2" />
                      Dashboard Overview
                    </h4>
                    <RangePicker onChange={onRangeChange} />
                  </div>
                </div>
                <Row className="stats-grid">
                  <Col
                    lg={3}
                    md={6}
                    className="mb-3 ponter-cusor"
                    onClick={() => navigate("/exams")}
                  >
                    <div className="stat-item total-exams">
                      <div className="stat-icon">
                        <FaGraduationCap />
                      </div>

                      <div className="stat-content">
                        <h3 className="stat-number">
                          {stats.pending_exams || 0}
                        </h3>
                        <p className="stat-label">New Created Exams</p>
                      </div>
                    </div>
                  </Col>
                  <Col
                    lg={3}
                    md={6}
                    className="mb-3"
                    onClick={() => navigate("/exams")}
                  >
                    <div className="stat-item pending-exams">
                      <div className="stat-icon">
                        <FaClock />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">
                          {stats.upcoming_exams || 0}
                        </h3>
                        <p className="stat-label">Ongoing Exams</p>
                      </div>
                    </div>
                  </Col>
                  <Col
                    lg={3}
                    md={6}
                    className="mb-3"
                    onClick={() => navigate("/students/list")}
                  >
                    <div className="stat-item active-students">
                      <div className="stat-icon">
                        <FaUserGraduate />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">{stats.total_students}</h3>
                        <p className="stat-label">Active Students</p>
                      </div>
                    </div>
                  </Col>
                  <Col lg={3} md={6} className="mb-3">
                    <div className="stat-item completion-rate">
                      <div className="stat-icon">
                        <FaCheckCircle />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-number">{stats.completionRate}%</h3>
                        <p className="stat-label">Completion Rate</p>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className="progress-section">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="progress-label">
                      Overall Exam Completion
                    </span>
                    <span className="progress-value">
                      {stats.completionRate}%
                    </span>
                  </div>
                  <Progress
                    value={stats.completionRate}
                    className="elite-progress"
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Exam List */}
      <Card className="exam-list-card">
        <CardBody>
          <div className="exam-list-header">
            <h4 className="section-title">
              <FaBookOpen className="me-2" />
              Active Exams
            </h4>
            <div className="exam-filters">
              <Input
                type="select"
                value={filter.class}
                onChange={(e) =>
                  setFilter({ ...filter, class: e.target.value })
                }
                className="filter-select"
              >
                <option>All Classes</option>
                {classOption.map((cls, idx) => (
                  <option key={idx} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </Input>
              <Input
                type="select"
                value={filter.subject}
                onChange={(e) =>
                  setFilter({ ...filter, subject: e.target.value })
                }
                className="filter-select me-2"
              >
                <option>All Subjects</option>
                {subjectOption.map((subject, idx) => (
                  <option key={idx} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </Input>
            </div>
          </div>

          <div className="exam-cards-grid">
            {/* {JSON.stringify(subjects)} */}
            {examList?.length > 0 ? (
              examList.map((exam, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="exam-card">
                    <CardBody>
                      <div className="exam-card-header">
                        <h5 className="exam-title">{exam.assessment_type}</h5>
                        <Badge
                          color={getStatusColor(exam.status)}
                          className="status-badge"
                        >
                          {exam.status || "Active"}
                        </Badge>
                      </div>

                      <div className="exam-details">
                        <div className="detail-item">
                          <FaBookOpen className="detail-icon" />
                          <span>Subject: {exam.subject_name}</span>
                        </div>
                        <div className="detail-item">
                          <FaUsers className="detail-icon" />
                          <span>Class: {exam.class_name}</span>
                        </div>
                        <div className="detail-item">
                          <FaTasks className="detail-icon" />
                          <span>
                            Questions: {exam.total_questions || "N/A"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <FaCalendarAlt className="detail-icon" />
                          <span>Date: {exam.commence_date}</span>
                        </div>
                        <div className="detail-item">
                          <FaClock className="detail-icon" />
                          <span>
                            Time: {exam.start_time} - {exam.end_time}
                          </span>
                        </div>
                      </div>

                      <div className="exam-actions">
                        {exam.status === "Completed" ||
                        exam.status === "Released" ? (
                          <Button
                            className="results-btn"
                            size="sm"
                            onClick={() => navigate(`/examresults/${exam.id}`)}
                          >
                            <FaEye className="me-1" />
                            View Results
                          </Button>
                        ) : (
                          <Button
                            className="view-questions-btn"
                            size="sm"
                            onClick={() =>
                              navigate(`/managequestion/${exam.id}`)
                            }
                          >
                            <FaEye className="me-1" />
                            View Questions
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h5 className="empty-title">No Exams Found</h5>
                <p className="empty-message">
                  Create your first exam to get started
                </p>
                {/* <Button className="create-first-exam-btn" onClick={() => setModal({ isOpen: true, type: "exam" })}>
                  <FaPlus className="me-2" />
                  Create First Exam
                </Button> */}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Create Exam Modal */}
      <Modal
        isOpen={modal.type === "exam"}
        toggle={() => setModal({ isOpen: false, type: null })}
        size="lg"
        centered
        className="elite-modal"
      >
        <ModalHeader
          toggle={() => setModal({ isOpen: false, type: null })}
          className="modal-header-custom"
        >
          <FaPlus className="me-2" />
          Create New Exam
        </ModalHeader>
        <ModalBody className="modal-body-custom">
          <div className="exam-form">
            <Row>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Assessment Type</Label>
                  <Input
                    type="select"
                    name="assessment_type"
                    value={form.assessment_type || ""}
                    onChange={handleChange}
                    invalid={!!error.assessment_type}
                    className="form-input-custom"
                  >
                    <option value="">Select Type</option>
                    <option value="Exam">Exam</option>
                    <option value="Test">Test</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Section</Label>
                  <Input
                    type="select"
                    name="section"
                    value={form.section || ""}
                    onChange={handleChange}
                    invalid={!!error.section}
                    className="form-input-custom"
                  >
                    <option value="">Select Section</option>
                    {section.map((section, idx) => (
                      <option key={idx} value={section.id}>
                        {section.section}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Class</Label>
                  <Input
                    type="select"
                    name="class_name"
                    value={form.class_name || ""}
                    onChange={handleChange}
                    invalid={!!error.class_name}
                    className="form-input-custom"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls, idx) => (
                      <option key={idx} value={cls.class_name}>
                        {cls.class_name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Term</Label>
                  <Input
                    type="select"
                    name="term"
                    value={form.term || ""}
                    onChange={handleChange}
                    invalid={!!error.term}
                    className="form-input-custom"
                  >
                    <option value="">Select Term</option>
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Subject</Label>
                  <Input
                    type="select"
                    name="subject_name"
                    value={form.subject_name || ""}
                    onChange={handleChange}
                    invalid={!!error.subject_name}
                    className="form-input-custom"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject, idx) => (
                      <option key={idx} value={subject.subject}>
                        {subject.subject}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Commence Date</Label>
                  <Input
                    type="date"
                    name="commence_date"
                    value={form.commence_date || ""}
                    onChange={handleChange}
                    invalid={!!error.commence_date}
                    className="form-input-custom"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Start Time</Label>
                  <Input
                    type="time"
                    name="start_time"
                    value={form.start_time || ""}
                    onChange={handleChange}
                    invalid={!!error.start_time}
                    className="form-input-custom"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">End Time</Label>
                  <Input
                    type="time"
                    name="end_time"
                    value={form.end_time || ""}
                    onChange={handleChange}
                    invalid={!!error.end_time}
                    className="form-input-custom"
                  />
                </FormGroup>
              </Col>
            </Row>

            <div className="modal-actions">
              <Button
                color="secondary"
                className="cancel-btn"
                onClick={() => setModal({ isOpen: false, type: null })}
              >
                Cancel
              </Button>
              <Button
                className="submit-btn"
                disabled={loading}
                onClick={() => {
                  setForm({ ...form, teacher_id: user.id });
                  handleSubmit();
                }}
              >
                {loading ? "Creating..." : "Create Exam"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Add Question Modal */}
      <Modal
        isOpen={modal.type === "question"}
        toggle={() => setModal({ isOpen: false, type: null })}
        size="lg"
        centered
        className="elite-modal"
      >
        <ModalHeader
          toggle={() => setModal({ isOpen: false, type: null })}
          className="modal-header-custom"
        >
          <FaEdit className="me-2" />
          Add New Question
        </ModalHeader>
        <ModalBody className="modal-body-custom">
          <div className="question-form">
            <FormGroup className="form-group-custom">
              <Label className="form-label-custom">Assessment</Label>
              <Input
                name="exam_id"
                value={form.exam_id || ""}
                type="select"
                onChange={handleChange}
                className="form-input-custom"
              >
                <option value="">Select Assessment</option>
                {examList?.map((data, idx) => (
                  <option key={idx} value={data.id}>
                    {data.assessment_type} - {data.subject_name}
                  </option>
                ))}
              </Input>
            </FormGroup>

            <FormGroup className="form-group-custom">
              <Label className="form-label-custom">Question</Label>
              <Input
                name="question"
                value={form.question || ""}
                onChange={handleChange}
                type="textarea"
                rows="3"
                placeholder="Enter your question here..."
                className="form-input-custom"
              />
            </FormGroup>

            <FormGroup className="form-group-custom">
              <Label className="form-label-custom">Marks</Label>
              <Input
                name="marks"
                value={form.marks || ""}
                onChange={handleChange}
                type="number"
                placeholder="Enter marks for this question"
                className="form-input-custom"
              />
            </FormGroup>

            <Row>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Option A</Label>
                  <Input
                    name="option1"
                    value={form.option1 || ""}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter option A"
                    className="form-input-custom"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Option B</Label>
                  <Input
                    name="option2"
                    value={form.option2 || ""}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter option B"
                    className="form-input-custom"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Option C</Label>
                  <Input
                    name="option3"
                    value={form.option3 || ""}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter option C"
                    className="form-input-custom"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="form-group-custom">
                  <Label className="form-label-custom">Option D</Label>
                  <Input
                    name="option4"
                    value={form.option4 || ""}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter option D"
                    className="form-input-custom"
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup className="form-group-custom">
              <Label className="form-label-custom">Correct Answer</Label>
              <Input
                name="answer"
                value={form.answer || ""}
                type="select"
                onChange={handleChange}
                className="form-input-custom"
              >
                <option value="">Select Correct Answer</option>
                <option value={form.option1}>{form.option1}</option>
                <option value={form.option2}>{form.option2}</option>
                <option value={form.option3}>{form.option3}</option>
                <option value={form.option4}>{form.option4}</option>
              </Input>
            </FormGroup>

            <div className="modal-actions">
              <Button
                color="secondary"
                className="cancel-btn"
                onClick={() => setModal({ isOpen: false, type: null })}
              >
                Cancel
              </Button>
              <Button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Add Question"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
