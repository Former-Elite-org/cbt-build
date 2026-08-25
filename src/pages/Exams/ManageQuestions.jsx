import React, { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { _delete, _get, _post, _put } from "../../Helper";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
} from "reactstrap";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

export default function ManageQuestions() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [exam, setExam] = useState(null);

  const { user } = useSelector((s) => s.auth);

  const params = useParams();

  const exam_id = params.id;
  const navigate = useNavigate();

  const getReg = useCallback(() => {
    _get(`exam-questions?query_type=select&exam_id=${exam_id}`, (resp) => {
      if (resp.success && resp.data.length > 0) {
        setQuestions(resp.data);
        let exam = resp.data[0].exam;
        setExam(exam);
      }
    });
  }, []);

  useEffect(() => {
    getReg();
  }, [getReg]);

  const toggleDeleteModal = () => setDeleteModal(!deleteModal);
  const toggleQuestionModal = () => setQuestionModal(!questionModal);
  const toggleCompleteModal = () => setCompleteModal(!completeModal);
  const toggleEditModal = () => {
    setEditModal(!editModal);
    if (editModal) setForm({});
  };

  const handleDelete = (id) => {
    _delete(`exam-questions?query_type=delete&id=${id}`, form, (resp) => {
      if (resp.success && resp.data && resp.data.length) {
        toast.success("Question deleted successfully");
        toggleDeleteModal();
        getReg();
      }
    });
  };
  const handleUpdate = (id) => {
    // console.log("why am i called here?:" + selectedQuestionId);
    // toast.success(id);
    _put(`exam-questions?query_type=update&id=${form.id}`, form, (resp) => {
      if (resp.success && resp.data && resp.data.length) {
        toast.success("Question updated successfully");
        getReg();
        toggleEditModal();
      }
    });
  };
  const handleComplete = (id) => {
    toast.success(id);
    _put(
      `exam_creation?query_type=status&id=${exam_id}`,
      user.user_type === "Teacher"
        ? { ...form, status: "inprogress" }
        : user.user_type === "Admin"
        ? { ...form, status: "approved" }
        : null,
      (resp) => {
        if (resp.success && resp.data && resp.data.length) {
          toast.success("Question updated successfully");
          navigate(-1);
        }
      }
    );
  };
  const handleSubmit = () => {
    _post(`exam-questions`, { ...form, exam_id: exam_id }, (resp) => {
      if (resp.success && resp.data && resp.data.length) {
        toast.success("Question Create successfully");
        getReg();
        toggleQuestionModal();
      }
    });
  };
  // const handleUpdateClick = () => {
  //   console.log(selectedQuestionId);
  //   console.log(form);
  // };

  return (
    <div>
      <div className="card shadow-sm m-2">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button
              onClick={() => {
                navigate(-1);
              }}
            >
              {"<"}Back
            </Button>
            <h5>{exam}</h5>
            {/* {JSON.stringify(user)} */}
            {user.user_type === "Teacher" && (
              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  toggleQuestionModal();
                }}
              >
                Add New Question 
              </Button>
            )}
          </div>
          {questions.map((question, index) => (
            <>
              <div
                key={question.id}
                className="question-card mb-3 p-3 border rounded"
              >
                <div className="d-flex justify-content-between">
                  <h6 className="question-number">Question {index + 1}</h6>
                  {question.status === "Pending" && user.user_type === "Teacher" ? (
                    <div>
                      <Button
                        color="info"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setForm(question);
                          // setSelectedQuestionId(question?.id);
                          toggleEditModal();
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedQuestion(question?.id);
                          toggleDeleteModal();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
                <p className="mb-2 question-text">{question.question}</p>
                <div className="options-grid">
                  <div
                    className={`option ${
                      question.answer === question.option1 ? "correct" : ""
                    }`}
                  >
                    A. {question.option1}
                  </div>
                  <div
                    className={`option ${
                      question.answer === question.option2 ? "correct" : ""
                    }`}
                  >
                    B. {question.option2}
                  </div>
                  <div
                    className={`option ${
                      question.answer === question.option3 ? "correct" : ""
                    }`}
                  >
                    C. {question.option3}
                  </div>
                  <div
                    className={`option ${
                      question.answer === question.option4 ? "correct" : ""
                    }`}
                  >
                    D. {question.option4}
                  </div>
                </div>
                <div className="mt-2 marks-display">
                  <small>
                    Marks: <span className="marks">{question.marks}</span>
                  </small>
                </div>
              </div>
            </>
          ))}
          <div className="d-flex justify-content-end">
            {user.user_type === "Teacher" &&
            questions.length > 0 &&
            questions.some((question) => question.status === "Pending") ? (
              <Button
                color="primary"
                onClick={() => {
                  // setForm();
                  // setSelectedQuestionId(question?.id);
                  toggleCompleteModal();
                }}
              >
                Send to admin
              </Button>
            ) : user.user_type === "Admin" &&
              questions.length > 0 &&
              questions.some((question) => question.status === "inprogress") ? (
              <Button
                color="primary"
                onClick={() => {
                  // setForm();
                  // setSelectedQuestionId(question?.id);
                  toggleCompleteModal();
                }}
              >
                Complete Exam
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={toggleDeleteModal} centered>
        <ModalHeader toggle={toggleDeleteModal}>Confirm Delete</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this question?
          {/* {JSON.stringify(selectedQuestion)} */}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleDeleteModal}>
            Cancel
          </Button>
          <Button color="danger" onClick={() => handleDelete(selectedQuestion)}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

  
    </div>
  );
}
