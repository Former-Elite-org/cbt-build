import { useCallback, useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Modal,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import "./exam.css";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import TextArea from "antd/es/input/TextArea";
import {
  _get,
  _post,
  convertTo24HourFormat,
  convertToAmPM,
  server_url,
} from "../../Helper";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  ModalBody,
  ModalHeader,
  Spinner,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import EditQuestionForm from "./EditQuestionForm";
import { MdCheck, MdEdit } from "react-icons/md";
import Datatable from "../../core/common/dataTable/index.tsx";
import moment from "moment";
import { motion } from "framer-motion";
const { Option } = Select;

const CBTExamsForm = () => {
  const {
    user,
    subjects,
    classes,
    sections,
    selected_branch,
    academic_calendar,
  } = useSelector((state) => state.auth);
  const exam_id = useParams().id;
  // const [error, setError] = useState({});
  const initialQuestion = {
    question_text: "",
    question_type: "",
    attachment_url: "",
    question_hint: "",
    is_correct: false,
    correct_answer: "",
    commence_date: "",
    marks: 0,
    options: [{ id: 0, option: "", is_correct: false, marks: "" }],
  };
  const _exam = {
    commence_date: "",
    start_time: "",
    end_time: "",
    status: "",
  };
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(_exam);
  // const [error, setError] = useState({});
  const handleChange = ({ target: { name, value } }) => {
    // const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleDateChange = (date) => {
    setForm((p) => ({
      ...p,
      commence_date: moment(date).format("YYYY-MM-DD"),
    }));
  };

  const handleChangeTime = (name, value) => {
    // alert(JSON.stringify(value))
    setForm((p) => ({ ...p, [name]: convertToAmPM(value) }));
  };

  const [modal, setModal] = useState({ isOpen: false });

  const isMounted = useRef(true);
  const fileReaderRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [examQuestions, setExamQuestions] = useState([]);
  const [examination, setExamination] = useState({});
  const [question, setQuestion] = useState(initialQuestion);
  const [questions, setQuestions] = useState([]);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);

  const navigate = useNavigate();

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionSelectChange = (name, value) => {
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = () => {
    const {
      question_type,
      question_text,
      marks,
      attachment_url,
      question_hint,
      options,
    } = question;
    // alert(JSON.stringify(question))
    if (!question_text || !question_type) {
      message.error("Please complete the question form.");
      return;
    }
    let optionsArray = [];
    const validOptions = (options || []).filter((opt) => opt.option);

    if (question_type === "Multiple Choice" && options.length <= 2) {
      message.error("At least 3 options are required for multiple choice.");
      return;
    }

    const hasCorrectAnswer = options.some((opt) => opt.is_correct);
    if (!hasCorrectAnswer && question_type !== "Essay") {
      message.error("Please mark at least one option as correct.");
      return;
    }

    // ✅ Assign optionsArray here
    optionsArray = validOptions.map(({ id, option, is_correct, marks }) => ({
      option: option,
      is_correct,
      marks: marks || 0,
      id,
    }));

    const newQuestion = {
      question_text,
      question_type,
      options, //: optionsArray,
      attachment_url,
      question_hint,
      exam_id,
      marks: validOptions.length
        ? validOptions.reduce(
            (sum, option) =>
              option.is_correct ? sum + Number(option.marks) : sum,
            0
          )
        : parseFloat(marks) || 0,

      ...(question_type === "Fill in the Blanks" && {
        case_sensitive: question.case_sensitive,
      }),
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setQuestion(initialQuestion);
    setQuestionModalVisible(false);
    message.success("Question added.");
  };

  const handleSubmitExamination = () => {
    const formattedQuestions = questions.map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      attachment_url: q.attachment_url,
      marks: q.marks,
      exam_id,
      query_type: "insert",
      question_hint: q.question_hint,
      ...(q.is_case_sensitive && { is_case_sensitive: q.is_case_sensitive }),
      ...(q.partial_credit && { partial_credit: q.partial_credit }),
      branch_id: selected_branch.branch_id,
    }));

    _post(
      "exam-questions",
      formattedQuestions,
      (res) => {
        if (res.success) {
          getData();
          message.success("Exam submitted!");
          setQuestions([]);
        }
      },
      () => {
        message.error("Error submitting Exam.");
      }
    );
  };

  const getData = useCallback(() => {
    if (exam_id) {
      setLoading(true);
      _get(
        `examinations?query_type=by_id&id=${exam_id}`,

        (resp) => {
          if (resp.success && resp.data && resp.data.length) {
            setLoading(false);
            setExamination(resp.data[0]);
          }
        },
        (err) => {
          setLoading(false);
          console.error(err);
          message.error("Fail to fetch examinations Details");
        }
      );
    }
    if (user.id && exam_id) {
      _get(
        `examinations?query_type=select-question-options&id=${exam_id}`,
        (res) => {
          if (res.success && res.data && res.data.length) {
            setExamQuestions(res.data);
          }
        },
        (err) => {
          console.error("Error fetching exams:", err);
        }
      );
    }
  }, [user.id, exam_id]);

  useEffect(() => {
    getData();
  }, [getData]);

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
      // setImagePreview(reader.result);
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

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => <p>{index + 1}</p>,
    },
    {
      title: "Question Text",
      dataIndex: "question_text",
      key: "question_text",
    },
    {
      title: "Question Type",
      dataIndex: "question_type",
      key: "question_type",
    },
    {
      title: "Marks",
      dataIndex: "marks",
      key: "marks",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record, index) => (
        <>
          <Button type="link" onClick={() => handleEdit(record, index)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this question?"
            onConfirm={() => handleDelete(record, index)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleEdit = (record, index) => {
    setCurrentQuestion(record);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleDelete = (record, index) => {
    _post(
      "exam-questions",
      { query_type: "delete", id: record.question_id },
      (res) => {
        if (res.success) {
          getData();
          message.success("Exam question updated!");
          setQuestions([]);
        }
      },
      () => {
        message.error("Error updating exam question.");
      }
    );
  };

  const handleUpdate = (q) => {
    // alert(JSON.stringify(q.options));// result  not as expected
    // [{"value":"10","id":5},{"value":"15","id":6},{"value":"5","id":7},{"value":"20","id":8}]
    const formattedOptions = Array.isArray(q.options)
      ? q.options.map((opt) => ({
          is_correct: opt.is_correct,
          option: opt.value,
          marks: opt.marks,
          id: opt.id,
        }))
      : []; // X empty options

    //  alert(JSON.stringify({formattedOptions}));
    // {"formattedOptions":[]}
    const formattedQuestions = {
      question_text: q.question_text,
      question_type: q.question_type,
      options: formattedOptions,
      attachment_url: q.attachment_url,
      marks: q.marks,
      id: q.question_id,
      exam_id,
      query_type: "update",
    };

    _post(
      "exam-questions",
      formattedQuestions,
      (res) => {
        if (res.success) {
          getData();
          message.success("Exam question updated!");
          setQuestions([]);
        }
      },
      () => {
        message.error("Error updating exam question.");
      }
    );
  };

  const handleUpdateExam = (status = "Pending") => {
    setLoading(true);

    const payload = {
      ...form,
      id: exam_id, // add exam ID for updating
      query_type: "update", // important: tells backend to update
      teacher_id: user.id,
      commence_date: form.commence_date,
      start_time: form.start_time,
      end_time: form.end_time,
      status,
    };

    _post(
      "examinations",
      payload,
      (res) => {
        if (res.success) {
          setLoading(false);
          message.success("Exam updated successfully");
          setModal({ isOpen: false, type: null });
          getData(); // Refresh data to reflect changes
        }
      },
      () => {
        setLoading(false);
        message.error("Error occurred while updating exam");
      }
    );
  };
  const toggleModal = () => setModal({ isOpen: !modal.isOpen });

  useEffect(() => {
    if (examination && examination.assessment_type) {
      setForm({
        assessment_type: examination.assessment_type || "",
        section: examination.section || "",
        class_name: examination.class_name || "",
        term: examination.term || "",
        subject_name: examination.subject_name || "",
        commence_date: examination.commence_date?.split("T")[0] || "", // for date input
        start_time: examination.start_time?.slice(0, 5) || "", // for time input
        end_time: examination.end_time?.slice(0, 5) || "", // for time input
      });
    }
  }, [examination]);

  const options = [{ option: "", marks: "", is_correct: true }];

  const handleMarksChange = (value, index) => {
    setQuestion((prev) => ({
      ...prev,
      options: [
        {
          ...prev.options[index],
          marks: value === "" ? "" : Number(value),
        },
      ],
    }));
  };

  const now = moment();

  const examStartDate = moment(examination.commence_date, "YYYY-MM-DD");

  return (
    <div className="elite-admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header mb-5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="dashboard-title">Manage exam</h2>
          {/* <p className="dashboard-subtitle">Manage exams, monitor performance, and oversee CBT operations</p> */}
        </motion.div>
      </div>
      <Container style={{ paddingTop: "50px" }}>
        <Button type="primary" className="mt-3" onClick={() => navigate(-1)}>
          Back
        </Button>
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <Spinner animation="border" />
            </div>
            <div className="mt-3">Loading exam...</div>
          </div>
        )}
        {examination?.status === "Pending" ||
        examination?.status === "Rejected" ||
        examination?.status === "Draft" ? (
          <Col span={24} className="my-3 text-end">
            <Button
              type="primary"
              onClick={() => setQuestionModalVisible(true)}
              style={{ padding: "10px 20px" }} // better padding
            >
              Add Question
            </Button>
          </Col>
        ) : null}
        {questions.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <h4>New Questions Preview</h4>
              </CardHeader>
              <CardBody>
                <Datatable
                  dataSource={questions}
                  columns={columns}
                  rowKey="id"
                />
              </CardBody>
            </Card>
            <Row>
              <Col md={24} className="mt-3 text-center">
                <Button type="primary" onClick={handleSubmitExamination}>
                  Submit
                </Button>
              </Col>
            </Row>
          </>
        )}

        <Card className="mt-4">
          {
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div>
                  <h3 className="text-lg font-semibold">
                    {examination.assessment_type}: {examination.subject_name} -{" "}
                    {examination.class_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Term: {examination.term} | Academic Year:{" "}
                    {examination.academic_year}
                  </p>
                </div>
                {examination?.status === "Pending" ||
                examination?.status === "Rejected" ||
                examination?.status === "Draft" ? (
                  <>
                    <Button
                      title="Update Exam"
                      onClick={() => {
                        setForm({
                          assessment_type: examination.assessment_type || "",
                          section: examination.section || "",
                          class_name: examination.class_name || "",
                          term: examination.term || "",
                          subject_name: examination.subject_name || "",
                          commence_date: examination.commence_date || "",
                          start_time: examination.start_time?.slice(0, 5) || "",
                          end_time: examination.end_time?.slice(0, 5) || "",
                        });
                        setModal({ isOpen: true });
                      }}
                    >
                      <MdEdit /> Edit
                    </Button>
                  </>
                ) : null}
                {examStartDate.isSameOrAfter(now, "day") &&
                moment(examination.end_time, "h:mm a").add(1, "hour") <= now &&
                examination.status === "Approved" ? (
                  <Button
                    title="Update Exam"
                    onClick={() => {
                      setTimeout(() => {
                        handleUpdateExam("Completed");
                      }, 1000);
                    }}
                  >
                    <MdCheck /> Mark as Completed
                  </Button>
                ) : null}
              </div>
            </CardHeader>
          }

          <CardBody>
            <Row className="mb-2" justify="space-between">
              <Col>
                <strong>Subject:</strong> {examination.subject_name || "N/A"}
              </Col>
              <Col>
                <strong>Commencement Date:</strong> {examination.commence_date}
              </Col>
            </Row>
            <Row className="mb-4" justify="space-between">
              <Col>
                <strong>Commencement Time:</strong> {examination.start_time} -{" "}
                {examination.end_time}
              </Col>
              <Col>
                <strong>Status:</strong> {examination.status}
              </Col>
            </Row>
            <Row className="mb-2" justify="space-between">
              <Col span={24}>
                <Datatable
                  dataSource={examQuestions}
                  columns={columns}
                  rowKey="id"
                />
              </Col>
              {/* <Col>
                <Button
                  type="primary"
                  onClick={() => setQuestionModalVisible(true)}
                  style={{ padding: "10px 20px" }} // better padding
                >
                  Add Question
                </Button>
              </Col> */}
            </Row>
          </CardBody>
        </Card>

        <Modal
          title="Add New Question"
          visible={questionModalVisible}
          onCancel={() => setQuestionModalVisible(false)}
          onOk={handleAddQuestion}
          okText="Add To Qustions"
          size="lg"
        >
          <Form layout="vertical">
            <Form.Item label="Question Type">
              <Select
                value={question.question_type}
                onChange={(val) =>
                  handleQuestionSelectChange("question_type", val)
                }
              >
                <Option value="Multiple Choice">Multiple Choice</Option>
                <Option value="Short Answer">Short Answer</Option>
                <Option value="True/False">True/False</Option>
                <Option value="Fill in the Blanks">Fill in the Blanks</Option>
                <Option value="Essay">Essay</Option>
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
                <Form.Item
                  label={
                    <em>
                      Image (Optional){" "}
                      <Tooltip
                        title="Image attachement can serve for Question Diagrams, Mathematical Equetions, Scientific Formulars and Graph ploting Pad."
                        placement="right"
                      >
                        <QuestionCircleOutlined
                          style={{ marginLeft: 1, color: "#999", with: "40%" }}
                        />
                      </Tooltip>
                    </em>
                  }
                >
                  <div className="profile-upload">
                    <div className="profile-uploader d-flex align-items-center">
                      {!question.attachment_url ? (
                        <div className="drag-upload-btn mb-1  d-flex align-items-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onChangeUpload}
                            className="form-control image-sign"
                          />{" "}
                          <em>
                            <Tooltip
                              title="Allowed (Max size 4MB, Format JPG, PNG, SVG)"
                              placement="right"
                            >
                              <QuestionCircleOutlined
                                style={{
                                  marginLeft: 1,
                                  color: "#999",
                                  with: "40%",
                                }}
                              />
                            </Tooltip>
                          </em>
                        </div>
                      ) : (
                        <div className="d-flex direction-column">
                          <img
                            src={question.attachment_url}
                            width={200}
                            height={200}
                          />
                          <Button
                            onClick={() => {
                              setQuestion((p) => ({
                                ...p,
                                attachment_url: "",
                              }));
                            }}
                            danger
                          >
                            X
                          </Button>
                        </div>
                      )}
                    </div>
                    <i className="fs-12">
                      {isUploading ? <p>Uploading...</p> : ""}
                    </i>
                  </div>
                </Form.Item>
              </Col>
            </Row>
            {question.question_type === "Multiple Choice" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="dashed"
                    onClick={() => {
                      setQuestion((prev) => ({
                        ...prev,
                        options: [
                          ...(prev.options || []),
                          {
                            id: Date.now(),
                            option: "",
                            is_correct: false,
                            marks: 0,
                          },
                        ],
                      }));
                    }}
                    block
                  >
                    + Add Option
                  </Button>
                </div>

                {/* Render dynamic response rows */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <Col>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span>
                        Is Partial Credit?
                        <Tooltip
                          title="Should the response match all correct answers?"
                          placement="right"
                        >
                          <QuestionCircleOutlined
                            style={{
                              marginLeft: 8,
                              color: "#999",
                              cursor: "pointer",
                            }}
                          />
                        </Tooltip>
                      </span>
                      <input
                        type="checkbox"
                        checked={question.partial_credit ?? true}
                        onChange={(e) =>
                          setQuestion({
                            ...question,
                            partial_credit: e.target.checked,
                          })
                        }
                      />
                      <span>
                        {question.partial_credit ?? true ? "Yes" : "No"}
                      </span>
                    </div>
                  </Col>
                  {(question.options || []).map((option, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                      }}
                    >
                      <Input
                        placeholder="Option Text"
                        value={option.option}
                        onChange={(e) => {
                          const updatedOptions = [...(question.options || [])];
                          updatedOptions[index].option = e.target.value;
                          setQuestion({ ...question, options: updatedOptions });
                        }}
                        style={{ flex: 1 }}
                      />

                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          alignItems: "center",
                        }}
                      >
                        <Input
                          type="checkbox"
                          style={{ width: "20px", height: "20px" }}
                          checked={option.is_correct || false}
                          onChange={(e) => {
                            const updatedOptions = [
                              ...(question.options || []),
                            ];
                            updatedOptions[index].is_correct = e.target.checked;
                            setQuestion({
                              ...question,
                              options: updatedOptions,
                            });
                          }}
                        />
                        <span>Correct</span>
                      </div>

                      <Input
                        type="number"
                        placeholder="Marks"
                        value={option.marks || "0"}
                        onChange={(e) => {
                          const updatedOptions = [...(question.options || [])];
                          updatedOptions[index].marks =
                            parseFloat(e.target.value) || 0;
                          updatedOptions[index].is_correct =
                            parseFloat(e.target.value) > 0 ? 1 : 0;

                          setQuestion({ ...question, options: updatedOptions });
                        }}
                        style={{ width: 80 }}
                      />

                      <Button
                        danger
                        size="small"
                        onClick={() => {
                          const updatedOptions = [...(question.options || [])];
                          updatedOptions.splice(index, 1);
                          setQuestion({ ...question, options: updatedOptions });
                        }}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {question.question_type === "True/False" && (
              <>
                <p style={{ marginBottom: 12 }}>
                  <strong>Options:</strong> Fixed to <code>True</code> and{" "}
                  <code>False</code>
                </p>
                {/* {JSON.stringify(question)} */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      padding: "10px",
                      border: "1px solid #eee",
                      borderRadius: "6px",
                      backgroundColor: "#fafafa",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* True Option */}
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <input
                        type="radio"
                        name="true-false"
                        checked={question.options[0]?.option === "True"}
                        onChange={() => {
                          setQuestion((q) => ({
                            ...q,
                            options: [
                              {
                                option: "True",
                                is_correct: true,
                                marks: q.options[0]?.marks || 0,
                              },
                            ],
                          }));
                        }}
                      />
                      True
                    </label>

                    {/* False Option */}
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <input
                        type="radio"
                        name="true-false"
                        checked={question.options[0]?.option === "False"}
                        onChange={() => {
                          setQuestion((q) => ({
                            ...q,
                            options: [
                              {
                                option: "False",
                                is_correct: true,
                                marks: q.options[0]?.marks || 0,
                              },
                            ],
                          }));
                        }}
                      />
                      False
                    </label>

                    {/* Marks Input */}
                    <Input
                      type="number"
                      placeholder="Marks"
                      value={question.options[0]?.marks || ""}
                      onChange={(e) => {
                        const marks = parseFloat(e.target.value);
                        setQuestion((q) => ({
                          ...q,
                          options: [
                            {
                              option: q.options[0]?.option || "True",
                              is_correct: true,
                              marks,
                            },
                          ],
                        }));
                      }}
                      style={{ width: 100 }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Short Answer */}
            {question.question_type === "Short Answer" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="dashed"
                    onClick={() => {
                      setQuestion((prev) => ({
                        ...prev,
                        options: [
                          ...(prev.options || []),
                          {
                            id: Date.now(),
                            option: "",
                            is_correct: false,
                            marks: 0,
                          },
                        ],
                      }));
                    }}
                    block
                  >
                    + Add Option
                  </Button>
                </div>

                {/* Render dynamic response rows */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {(question.options || []).map((option, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                      }}
                    >
                      <Input
                        placeholder="Option Text"
                        value={option.option}
                        onChange={(e) => {
                          const updatedOptions = [...(question.options || [])];
                          updatedOptions[index].option = e.target.value;
                          setQuestion({ ...question, options: updatedOptions });
                        }}
                        style={{ flex: 1 }}
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={option.is_correct || true}
                          onChange={(e) => {
                            const updatedOptions = [
                              ...(question.options || []),
                            ];
                            updatedOptions[index].is_correct = true;
                            setQuestion({
                              ...question,
                              options: updatedOptions,
                            });
                          }}
                        />
                        <span>Correct</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="Marks"
                        value={option.marks || "0"}
                        onChange={(e) => {
                          const updatedOptions = [...(question.options || [])];
                          updatedOptions[index].marks =
                            parseFloat(e.target.value) || 0;
                          setQuestion({ ...question, options: updatedOptions });
                        }}
                        style={{ width: 80 }}
                      />
                      <Button
                        danger
                        size="small"
                        onClick={() => {
                          const updatedOptions = [...(question.options || [])];
                          updatedOptions.splice(index, 1);
                          setQuestion({ ...question, options: updatedOptions });
                        }}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* Fill in the Essay */}
            {question.question_type === "Fill in the Blanks" && (
              <>
                <Row gutter={16}>
                  <Col span={10}>
                    <Form.Item label="Correct Answer">
                      <Input
                        value={question.options?.[0]?.option || ""}
                        onChange={(e) => {
                          const updatedOptions = [
                            {
                              option: e.target.value,
                              is_correct: true,
                            },
                          ];
                          setQuestion({
                            ...question,
                            options: updatedOptions,
                          });
                        }}
                        placeholder="Enter correct answer"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={
                        <span>
                          Case Sensitive?
                          <Tooltip
                            title="Should the answer match case exactly?"
                            placement="right"
                          >
                            <QuestionCircleOutlined
                              style={{
                                marginLeft: 1,
                                color: "#999",
                                with: "40%",
                              }}
                            />
                          </Tooltip>
                        </span>
                      }
                    >
                      <input
                        type="checkbox"
                        checked={question.is_case_sensitive || false}
                        onChange={(e) =>
                          setQuestion({
                            ...question,
                            is_case_sensitive: e.target.checked,
                          })
                        }
                      />
                      <span>{question.is_case_sensitive ? "Yes" : "No"}</span>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    {/* Marks input */}
                    <Form.Item label="Marks">
                      <Input
                        type="number"
                        min="0"
                        value={question.marks || 1}
                        onChange={(e) =>
                          setQuestion({
                            ...question,
                            marks: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="Enter marks"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
            {/* Essay */}
            {question.question_type === "Essay" && (
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    label={
                      <span>
                        Question Hint (Optional)
                        <Tooltip
                          title="Provide optional hint or marking guide for essay"
                          placement="right"
                        >
                          <QuestionCircleOutlined
                            style={{
                              marginLeft: 8,
                              color: "#999",
                              cursor: "pointer",
                            }}
                          />
                        </Tooltip>
                      </span>
                    }
                  >
                    <TextArea
                      rows={4}
                      name="question_hint"
                      value={question.question_hint || ""}
                      onChange={(e) =>
                        setQuestion({
                          ...question,
                          question_hint: e.target.value,
                        })
                      }
                      placeholder="Provide optional hint or marking guide for essay"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item rules={[{ required: true }]} label="Marks">
                    <Input
                      type="number"
                      min="1"
                      value={question.marks || 0}
                      onChange={(e) => {
                        setQuestion((prev) => ({
                          ...prev,
                          marks: parseFloat(e.target.value) || 0,
                        }));
                      }}
                      placeholder="Enter marks"
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Form>
        </Modal>

        <Modal
          visible={isModalOpen}
          onCancel={handleModalClose}
          footer={null}
          title="Edit Question"
          size="lg"
        >
          {currentQuestion && (
            <EditQuestionForm
              question={(() => {
                // Format question for edit form
                const q = { ...currentQuestion };

                if (q.question_type === "Multiple Choice") {
                  q.options =
                    q.options?.map((opt, i) => ({
                      id: opt.id,
                      option: opt.option || opt.value,
                      is_correct: !!opt.is_correct,
                      marks: opt.marks || 0,
                    })) || [];
                }

                if (q.question_type === "True/False") {
                  const correctOption = q.correct_answer === "True" ? 0 : 1;
                  q.options = [
                    {
                      id: Date.now(),
                      option: "True",
                      is_correct: correctOption === 0,
                      marks: 1,
                    },
                    {
                      id: Date.now() + 1,
                      option: "False",
                      is_correct: correctOption === 1,
                      marks: 0,
                    },
                  ];
                }

                if (
                  ["Short Answer", "Fill in the Blanks"].includes(
                    q.question_type
                  )
                ) {
                  q.options = [
                    {
                      id: Date.now(),
                      option: q.correct_answer,
                      is_correct: true,
                      marks: q.marks,
                    },
                  ];
                }

                if (q.question_type === "Essay") {
                  q.question_hint = q.correct_answer || "";
                }

                return q;
              })()}
              onUpdate={handleUpdate}
              onCancel={handleModalClose}
            />
          )}
        </Modal>

        <Modal
          visible={modal.isOpen}
          onCancel={toggleModal}
          onOk={() => handleUpdateExam("Pending")}
          size="lg"
          okText="Submit"
          centered
        >
          <ModalHeader>Update Exam</ModalHeader>
          <ModalBody>
            {/* {JSON.stringify(form)} */}
            {/* {"assessment_type":"Exam","section":"","class_name":"Just 2s","term":"First Term","subject_name":"NUMERACY","commence_date":"2025-05-14","start_time":"8:30 ","end_time":"9:30 "} */}
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Assessment Type" name="assessment_type">
                    <Select
                      placeholder="Select Assessment Type"
                      value={form.assessment_type}
                      defaultValue={form.assessment_type}
                      onChange={(value) =>
                        handleChange({
                          target: { name: "assessment_type", value },
                        })
                      }
                    >
                      <Select.Option value="Exam">Exam</Select.Option>
                      <Select.Option value="Test">Test</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Section" name="section">
                    <Select
                      placeholder="Select School Section"
                      value={form.section || ""}
                      defaultValue={form.section || ""}
                      onChange={(value) =>
                        handleChange({ target: { name: "section", value } })
                      }
                    >
                      {sections.map((section) => (
                        <Select.Option
                          key={section.section_id}
                          value={section.section_name}
                        >
                          {section.section_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Class" name="class_name">
                    <Select
                      placeholder="Select Exam Class"
                      showSearch
                      value={form.class_name || undefined}
                      defaultValue={form.class_name || undefined}
                      onChange={(value) => {
                        const selectedClass = classes.find(
                          (cls) => cls.class_name === value
                        );
                        if (selectedClass) {
                          setForm((prev) => ({
                            ...prev,
                            class_name: selectedClass.class_name,
                            class_code: selectedClass.class_code,
                          }));
                        }
                      }}
                    >
                      {classes.map((cls, idx) => (
                        <Select.Option key={idx} value={cls.class_name}>
                          {cls.class_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Term" name="term">
                    <Select
                      placeholder="Select Exam Term"
                      value={form.term || ""}
                      defaultValue={form.term || ""}
                      onChange={(value) =>
                        handleChange({ target: { name: "term", value } })
                      }
                    >
                      <Select.Option value="First Term">
                        First Term
                      </Select.Option>
                      <Select.Option value="Second Term">
                        Second Term
                      </Select.Option>
                      <Select.Option value="Third Term">
                        Third Term
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Subject" name="subject_name">
                    <Select
                      showSearch
                      value={form.subject_name || ""}
                      defaultValue={form.subject_name || ""}
                      name={"subject_name"}
                      placeholder="Select Exam Subject"
                      onChange={(value) => {
                        const selectedSubject = subjects.find(
                          (cls) => cls.subject_name === value
                        );
                        if (selectedSubject) {
                          setForm((prev) => ({
                            ...prev,
                            subject_name: selectedSubject.subject_name,
                            subject_code: selectedSubject.subject_code,
                          }));
                        }
                      }}
                    >
                      {subjects.map((subject, idx) => (
                        <Select.Option key={idx} value={subject.subject}>
                          {subject.subject}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Commencement Date" name="commence_date">
                    <Input
                      placeholder="Choose Commencement Date"
                      type="date"
                      value={form.commence_date || ""}
                      defaultValue={form.commence_date || ""}
                      onChange={({ target: { value } }) =>
                        handleDateChange(value)
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Start Time" name="start_time">
                    <Input
                      placeholder="Choose Exam's Start Time"
                      type="time"
                      value={convertTo24HourFormat(form.start_time) || ""}
                      defaultValue={
                        convertTo24HourFormat(form.start_time) || ""
                      }
                      name="start_time"
                      onChange={({ target: { name, value } }) =>
                        handleChangeTime("start_time", value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="End Time" name="end_time">
                    <Input
                      placeholder="Choose Exam's Closing Time"
                      type="time"
                      value={convertTo24HourFormat(form.end_time)}
                      defaultValue={convertTo24HourFormat(form.end_time)}
                      name="end_time"
                      onChange={({ target: { name, value } }) =>
                        handleChangeTime(name, value)
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      </Container>
    </div>
  );
};

export default CBTExamsForm;
