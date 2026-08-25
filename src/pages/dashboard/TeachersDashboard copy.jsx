import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  FormGroup,
  Input,
  Label,
  ModalHeader,
  ModalBody,
  Progress,
  Collapse,
  Spinner,
} from "reactstrap";
import {
  FaGraduationCap,
  FaChartLine,
  FaUserGraduate,
} from "react-icons/fa";
import { BiPlus, BiEdit } from "react-icons/bi";
import { _get, _post, server_url } from "../../Helper";
import { toast } from "react-hot-toast";
import "../Exams/exam.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Form, message, Modal, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
const { Option } = Select;


export function CreateExam({modal, setModal,  }){
  const [form, setForm] = useState({query_type:'create'});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const {academic_calendar,user, classes, subjects, selected_branch,sections} = useSelector(s=>s.auth)
  const validateForm = (formData) => {
    let newErrors = {};
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
      newErrors.class_name = "Please fill the commence date";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Please fill the start time";
    }
    if (!formData.end_time) {
      newErrors.end_time = "Please fill the end time";
    }
    // if (!formData.total_questions) {
    //   newErrors.total_questions = "Please fill the total questions";
    // }
    // if (!formData.total_marks) {
    //   newErrors.total_marks = "Please fill the total marks";
    // }
    return newErrors;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError({ ...form, [name]: "" });
  };

  const handleExamSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm(form);
    setError(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      _post(
        "examinations",
        { ...form,
            teacher_id: user.id,
          academic_year: academic_calendar[0].academic_year,
          branch_id:selected_branch.branch_id
         },
        (resp) => {
          if(resp.success){
          setLoading(false);
          message.success("created successfully");
          }
        },
        () => {
          setLoading(false);
          message.error("error creating");
        }
      );
      console.log(form);
    } else {
      console.log("errors:", newErrors);
      message.error(Object.values(newErrors)[0]);
    }
  };

  return(
     <Modal
        visible={modal.isOpen}
        toggle={() => setModal({ isOpen: false})}
        size="lg"
        onOk={handleExamSubmit}
        okText="Submit"
        onCancel={() => setModal({ isOpen: false})}
        centered
      >
        <ModalHeader>
          Create New Exam
        </ModalHeader>
        <ModalBody>
          {loading? <Spinner />:
          <div className="exam-form">
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Assessment Type</Label>
                  <Input
                    type="select"
                    name="assessment_type"
                    value={form.assessment_type || ""}
                    onChange={handleChange}
                    invalid={!!error.assessment_type}
                  >
                    <option value="">Select Type</option>
                    <option value="Exam">Exam</option>
                    <option value="Test">Test</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Section</Label>
                  <Input
                    type="select"
                    name="section"
                    value={form.section || ""}
                    onChange={handleChange}
                    invalid={!!error.section}
                  >
                    <option value="">Select Section</option>
                    {sections.map((section) => (
                      <option
                        key={section.section_id}
                        value={section.section_name}
                      >
                        {section.section_name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Class</Label>
                  <Input
                    type="select"
                    name="class_name"
                    value={form.class_name || ""}
                    onChange={(e) => {
                      handleChange(e);
                      setForm((prevForm) => ({
                        ...prevForm,
                        class_code:
                          e.target.options[e.target.selectedIndex].getAttribute(
                            "data-classcode"
                          ),
                      }));
                    }}
                    invalid={!!error.class_name}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option
                        key={cls.id}
                        value={cls.class_name}
                        data-classcode={cls.class_code}
                      >
                        {cls.class_name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>{" "}
              <Col md={6}>
                <FormGroup>
                  <Label>Term</Label>
                  <Input
                    type="select"
                    name="term"
                    value={form.term || ""}
                    onChange={handleChange}
                    invalid={!!error.term}
                  >
                    <option value={""}>Select Term</option>
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Subject</Label>
                  <Input
                    type="select"
                    name="subject_name"
                    value={form.subject_name || ""}
                    onChange={(e) => {
                      handleChange(e);
                      setForm((prevForm) => ({
                        ...prevForm,
                        subject_code:
                          e.target.options[e.target.selectedIndex].getAttribute(
                            "data-subjectcode"
                          ),
                      }));
                    }}
                    invalid={!!error.subject_name}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((cls) => (
                      <option
                        key={cls.id}
                        value={cls.subject}
                        data-subjectcode={cls.subject_code}
                      >
                        {cls.subject}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Commence Date</Label>
                  <Input
                    type="date"
                    name="commence_date"
                    value={form.commence_date || ""}
                    onChange={handleChange}
                    invalid={!!error.commence_date}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    name="start_time"
                    value={form.start_time || ""}
                    onChange={handleChange}
                    invalid={!!error.start_time}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    name="end_time"
                    value={form.end_time || ""}
                    onChange={handleChange}
                    invalid={!!error.end_time}
                  />
                </FormGroup>
              </Col>
            </Row>
          </div>}
        </ModalBody>
      </Modal>
  )
}
export default function TeachersDashboard() {
  const [examList, setExamList] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: null });
  const [form, setForm] = useState({query_type:'create'});
  const [loading, setLoading] = useState(false);
  // const [selectedExam, setSelectedExam] = useState(null);
  const [error, setError] = useState({});
  const [page, setPage] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const isMounted = useRef(true);
  const fileReaderRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const handleQuestionSelectChange = (name, value) => {
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };
    const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };
  
    const onChangeUpload = useCallback((e) => {
    const attachmentFile = e.target.files?.[0];
    if (!attachmentFile) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (attachmentFile.size > maxSize) {
      message.error("File size exceeds the 5MB limit.");
      return;
    }

    // Abort previous reader
    if (fileReaderRef.current) {
      fileReaderRef.current.abort();
    }

    const reader = new FileReader();
    fileReaderRef.current = reader;

    reader.onloadend = () => {
      if (!isMounted.current) return;
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(attachmentFile);

    // Upload file
    setIsUploading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    formData.append("media", attachmentFile);

    fetch(server_url + "/upload_transfer_certificate-document", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        setIsUploading(false);
        setQuestion((prev) => ({ ...prev, attachment_url: data.url }));
        if (!isMounted.current) return;
        message.success("Uploaded successfully");
      })
      .catch((error) => {
        if (!isMounted.current) return;
        console.error("Error uploading:", error);
        message.error("Failed to upload file");
      })
      .finally(() => {
        if (!isMounted.current) return;
        setIsUploading(false);
      });
  }, []);
  const navigate = useNavigate();

  const { user, classes, subjects } = useSelector((s) => s.auth);
    const initialQuestion = {
    question_text: "",
    question_type: "",
    correct_answer: "",
    attachment_url: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    marks: 0,
  };

  const [question, setQuestion] = useState(initialQuestion);
  // Stats for teacher dashboard
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageScore: 0,
    pendingExams: 0,
    upcomingExams: 0,
    completionRate: 0,
    topPerformers: 0,
  });

  const fetchData = useCallback(() => {
    _get(
      `examinations?query_type=select-teacher-exams&teacher_id=${user.id}`,
      (resp) => {
        if (resp.success) setExamList(resp.data);
      }
    );
  }, []);
  // const fetchClasses = useCallback(() => {
  //   _get(
  //     `classes?query_type=select-section-classes&section=${form.section}&school_id=${user.school_id}`,
  //     (resp) => {
  //       if (resp.success && resp.data && resp.data.length) {
  //         setClasses(resp.data);
  //       }
  //     }
  //   );
  // }, [form.section]);

  // const fetchSubjects = useCallback(() => {
  //   if (form.class_code) {
  //     _get(
  //       `subjects?query_type=select-section-subjects&class_code=${form.class_code}&school_id=${user.school_id}`,
  //       (resp) => {
  //         if (resp.success && resp.data && resp.data.length) {
  //           setSubjects(resp.data);
  //         }
  //       }
  //     );
  //   }
  // }, [form.class_code]);
  useEffect(() => {
    fetchData();
  }, [user]);
  // useEffect(() => {
  //   fetchClasses();
  //   fetchSubjects();
  // }, [fetchClasses, fetchSubjects, user]);

  // const handleSubmit = () => {
  //   // e.preventDefault();
  //   const newErrors =
  //     modal.type === "exam" ? validateForm(form) : validateQuestion(form);
  //   setError(newErrors);

  //   if (Object.keys(newErrors).length === 0) {
  //     setLoading(true);
  //     _post(
  //       modal.type === "exam" ? "examinations" : "exam-questions",
  //       {
  //         ...form,
  //         teacher_id: user.id,
  //         academic_year: academic_calendar[0].academic_year,
  //         branch_id:selected_branch.branch_id
  //       },
  //       () => {
  //         setLoading(false);
  //         message.success(
  //           `${
  //             modal.type === "exam" ? "Exam" : `Question`
  //           } created successfully`
  //         );
  //         setModal({ isOpen: false, type: null });
  //         fetchData();
  //       },
  //       () => {
  //         setLoading(false);
  //         message.error("Error occurred");
  //       }
  //     );
  //   } else {
  //     console.log("errors:", newErrors);
  //     message.error(Object.values(newErrors)[0]);
  //   }
  // };
  
  const handleQuestionSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateQuestion(form);
    setError(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      _post(
        "exam-questions",
        { ...form },
        () => {
          setLoading(false);
          message.success("created successfully");
          setForm({});
        },
        () => {
          setLoading(false);
          message.error("error creating");
        }
      );
      console.log(form);
    } else message.error(Object.values(newErrors)[0]);
  };

  const validateQuestion = (question) => {
    let newQuestions = {};
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
const NewExamList = examList.filter(item => {
  const subjectMatch = selectedSubject ? item.subject_name === selectedSubject : true;
  const classMatch = selectedClass ? item.class_name === selectedClass : true;
  return subjectMatch && classMatch;
});

  return (
    <div className="modern-exam-dashboard">
      {/* Performance Overview */}
      <Row className="stats-overview">
        <Col lg={8}>
          <Card className="main-stats-card">
            <h4>Quick Overview</h4>
            <Row>
              <Col md={4}>
                <div className="stat-item">
                  <div className="stat-icon student-icon">
                    <FaUserGraduate />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalStudents}</h3>
                    <p>Active Students</p>
                  </div>
                </div>
              </Col>

              <Col md={4}>
                <div className="stat-item">
                  <div className="stat-icon score-icon">
                    <FaGraduationCap />
                  </div>
                  <div className="stat-info">
                    <h3>{examList?.length || 0}</h3>
                    <p>Total Exams</p>
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="stat-item">
                  <div className="stat-icon Pending-icon">
                    <FaChartLine />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.averageScore}%</h3>
                    <p>Average Score</p>
                  </div>
                </div>
              </Col>
            </Row>
            <div className="completion-progress mt-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Exams Completion Rate</span>
                <span>{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} color="success" />
            </div>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="quick-actions-card">
            <h4 className="text-gray-900 dark:text-white">Quick Actions</h4>
            <div className="action-buttons">
              <Button
                color="primary"
                block
                onClick={() => setModal({ isOpen: true})}
              >
                <BiPlus /> Create New Exam
              </Button>
              <Button
                color="info"
                block
                onClick={() => setQuestionModalVisible(true)}
              >
                <BiEdit /> Add Questions
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Exam List */}
      <Card className="exam-list-card mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>New Exams</h4>
          <div className="exam-filters">
            <Input
              type="select"
              className="me-2"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Select Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.subject_code} value={subject.subject_code}>
                  {subject.subject}
                </option>
              ))}
            </Input>
            <Input
              type="select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem.class_code} value={classItem.class_code}>
                  {classItem.class_name}
                </option>
              ))}
            </Input>
          </div>
        </div>
              {/* {JSON.stringify({subjects})} */}
        <div className="exam-cards">
          {NewExamList.map(({id, class_name,subject_name,total_questions,commence_date, end_time, status, assessment_type }) => (
            <Card key={id} className="exam-item">
              <div className="exam-header">
                <h5>{assessment_type}</h5>
                {/* <Badge color={status === 'active' ? 'success' : 'warning'}>
                  {status || 'Pending'}
                </Badge> */}
              </div>

              <div className="exam-details">
                <div>Subject: {subject_name}</div>
                <div>Class: {class_name}</div>
                <div>Questions: {total_questions}</div>
                <div>Date: {commence_date}</div>
              </div>

              <div className="exam-actions mt-3">
                {status === "Pending" ? (
                  <Button
                    color="primary"
                    size="sm"
                    className="w-100"
                    onClick={() => navigate(`/managequestion/${id}`)}
                  >
                    Manage Questions
                  </Button>
                ) : (status === "approved" &&
                    new Date() >= new Date(commence_date) &&
                    new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }) <= end_time) ||
                  status === "released" ? (
                  <Button
                    color="info"
                    size="sm"
                    className="w-100"
                    onClick={() => navigate(`/examresults/${id}`)}
                  >
                    View Results
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    size="sm"
                    className="w-100"
                    onClick={() => navigate(`/managequestion/${id}`)}
                  >
                    Manage Questions
                  </Button>
                )}
                {/* {status === "Pending" && (
                  <Button
                    color="primary"
                    size="sm"
                    className="w-100"
                    onClick={() => navigate(`/managequestion/${id}`)}
                  >
                    Manage Questions
                  </Button>
                )}
                {status === "inprogress" && (
                  <Button
                    color="primary"
                    size="sm"
                    className="w-100"
                    onClick={() => navigate(`/managequestion/${id}`)}
                  >
                    View Questions
                  </Button>
                )}

                {status === "Completed" && (
                  <Button
                    color="info"
                    size="sm"
                    className="w-100"
                    onClick={() => navigate(`/examresults/${id}`)}
                  >
                    View Results
                  </Button>
                )} */}
              </div>

              {/* <Collapse isOpen={selectedExam?.id === id}>
                <div className="question-manager mt-3">
                  <h6>Questions</h6>
                </div>
              </Collapse> */}
            </Card>
          ))}
        </div>
      </Card>

      {/* Create/Edit Modals */}
     <CreateExam modal={modal} setModal={setModal}/>
     
        <Modal
          title="Add New Question"
          visible={questionModalVisible}
          onCancel={() => setQuestionModalVisible(false)}
          onOk={handleQuestionSubmit}
          okText="Submit"
          size='lg'
        >
          <Form layout="vertical">
            {/* {JSON.stringify(form)} */}
            <Form.Item label="Question Type">
              <Select
                value={question.question_type}
                onChange={(val) => handleQuestionSelectChange("question_type", val)}
              >
                <Option value="Multiple Choice">Multiple Choice</Option>
                <Option value="Short Answer">Short Answer</Option>
                <Option value="True/False">True/False</Option>
                <Option value="Fill in the Blanks">Fill in the Blanks</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Question Text">
              <TextArea
                name="question_text"
                value={question.question_text}
                onChange={handleQuestionChange}
              />
            </Form.Item>
            <Row gutter={[16, 16]}>
              <Col md={12}>
                <Form.Item label="Attach Image">
                  <div className="profile-upload">
                    <div className="profile-uploader d-flex align-items-center">

                      {!question.attachment_url ? <div className="drag-upload-btn mb-3">

                        <input
                          type="file"
                          accept="image/*"
                          onChange={onChangeUpload}
                          className="form-control image-sign"
                        />
                      </div> : <Button
                        onClick={() => {
                          setQuestion((p) => ({ ...p, attachment_url: "" }));
                          setImagePreview("");
                        }}
                        className="btn btn-primary mb-3"
                      >
                        Remove
                      </Button>}
                    </div>
                    <i className="fs-12">
                      {isUploading ? (
                        <p>Uploading...</p>
                      ) : (
                        "Allowed (Max size 4MB, Format JPG, PNG, SVG)"
                      )}
                    </i>
                  </div>
                </Form.Item>
              </Col>
              <Col md={12}>
                <Form.Item label="Marks">
                  <Input
                    type="number"
                    name="marks"
                    value={question.marks}
                    onChange={handleQuestionChange}
                  />
                </Form.Item>
              </Col>
            </Row>
            {question.question_type === "Multiple Choice" && (
              <Row gutter={[16, 16]}>
                {["a", "b", "c", "d"].map((opt) => (
                  <Col span={12} key={opt}>
                    <Form.Item label={`Option ${opt.toUpperCase()}`}>
                      <Input
                        name={`option_${opt}`}
                        value={question[`option_${opt}`]}
                        onChange={handleQuestionChange}
                      />
                    </Form.Item>
                  </Col>
                ))}

                <Col span={24}>
                  <Form.Item label="Correct Answer">
                    <Select
                      value={question.correct_answer}
                      onChange={(val) =>
                        handleQuestionSelectChange("correct_answer", val)
                      }
                    >
                      {["a", "b", "c", "d"].map((key) => {
                        const optionKey = `option_${key}`;
                        const optionValue = question[optionKey];
                        return (
                          <Option key={optionKey} value={optionValue}>
                            {key.toUpperCase()}. {optionValue || ""}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}


            {/* True/False */}
            {question.question_type === "True/False" && (
              <Form.Item label="Correct Answer">
                <Select
                  value={question.correct_answer}
                  onChange={(val) => handleQuestionSelectChange("correct_answer", val)}
                >
                  <Option value="True">True</Option>
                  <Option value="False">False</Option>
                </Select>
              </Form.Item>
            )}


            {/* Short Answer */}
            {question.question_type === "Short Answer" && (
              <Form.Item label="Correct Answer">
                <Input
                  name="correct_answer"
                  value={question.correct_answer}
                  onChange={handleQuestionChange}
                />
              </Form.Item>
            )}

            {/* Fill in the Blanks */}
            {question.question_type === "Fill in the Blanks" && (
              <Form.Item label="Correct Answer">
                <Input
                  name="correct_answer"
                  value={question.correct_answer}
                  onChange={handleQuestionChange}
                />
              </Form.Item>
            )}
          </Form>
        </Modal>
    </div>
  );
}
