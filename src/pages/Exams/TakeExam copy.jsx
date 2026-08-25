import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { json, Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { _get, _post, formatDuration, getAlpha, server_url } from "../../Helper";
import moment from "moment";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import CountdownTimer from "./Countdown";
import { Popconfirm } from "antd";

export default function TakeExam() {

  const navigate = useNavigate();
  const [takeExam, setTakeExam] = useState({
    status: "examDetails",
    isEditted: false,
  });
  const [iconShow, setIconShow] = useState(false);

  const setIcon = (question, option) => {
    setIconShow(
      answers.find((a) => a.id === question.id && a.answer === option)
    );

    return answers.find((a) => a.id === question.id && a.answer === option);
  };

  const { user } = useSelector((s) => s.auth);

  const _question = {
    exam_id: null,
    id: null,
    question_text: null,
    options_json: {},
    mark: null,
    page: null,
    // admission_no: user.id,
  };

  const [questions, setQuestions] = useState([]); //STATE FOR STORING QUESTIONS DATA

  const [exam, setExam] = useState([]);
  const [modal, setModal] = useState(false); //EXAM SUBMITTING COMFIRMATIOM MODAL
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [answers, setAnswers] = useState([]); //STATE STORING Answer DATA
  const [timer, setTimer] = useState("00:00:00"); //STATE DISPLAYING TIMER
  const [timerValue, setTimerValue] = useState(""); //STATE GETTING TIMER VALUE
  const [start_time, setStartTime] = useState("00:00:00");
  const [end_time, setEndTime] = useState("00:00:00");
  const [timeStart, setTimeStart] = useState(""); //STATE FOR SETTING TIMER VALUE
  const [page, setPage] = useState(1);
  let limit = 1;
  const [currQuestion, setCurrQuestion] = useState(_question);
  const params = useParams();

  const exam_id = params.id;

  // ============================================ time duration function ====================================================
  const Ref = useRef(null);

  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    return {
      total,
      hours,
      minutes,
      seconds,
    };
  };

  const startTimer = (e) => {
    let { total, hours, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      setTimer(
        `${hours > 9 ? hours : "0" + hours}:${minutes > 9 ? minutes : "0" + minutes
        }:${seconds > 9 ? seconds : "0" + seconds}`
      );
    }
  };

  const clearTimer = (e) => {
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    let deadline = new Date();
    deadline.setHours(deadline.getHours() + timerValue);
    return deadline;
  };

  useEffect(() => {
    if (timerValue) {
      clearTimer(getDeadTime());
    }

    return () => {
      if (Ref.current) clearInterval(Ref.current);
    };
  }, [timerValue]);

  // ================================getting data====================================================

  const getReg = useCallback(() => {
    setLoading(true);
    _get(`exam-questions?query_type=select&exam_id=${exam_id}`, (resp) => {
      if (resp.success && resp.data.length > 0) {
        if (resp.data[0].result && resp.data[0].result.length > 0) {
          setQuestions(resp.data[0].result);
        }
      }
    });
  }, []);
  useEffect(() => {
    if (questions && questions.length) {
      _get(`examinations?query_type=by_id&id=${exam_id}`, (resp) => {
        if (resp.success && resp.data && resp.data.length) {
          setExam(resp.data);

          const start_time = moment(resp.data[0]?.start_time, "HH:mm");
          const end_time = moment(resp.data[0]?.end_time, "HH:mm");

          let duration = end_time.diff(start_time, "minutes");
          setTimeStart(duration);

          setStartTime(start_time);
          setEndTime(end_time);
        }
      });
    }
  }, [questions]);
  useEffect(() => {
    getReg();
  }, [getReg]);

  const toggle = () => setModal(!modal);

  // ===========================================pagination and next questions handle================================================
  const paginationList = questions.slice((page - 1) * limit, page * limit);

  const handleNextPage = () => {
    if (page < Math.ceil(questions.length / limit)) {
      if (!currQuestion.id) {
        toast.error("Select answer");
      } else {
        setPage((prevPage) => prevPage + 1);
        setCurrQuestion((prev) => ({
          ...prev,
          id: null,
          response: null
        }));
      }
    }
  };
  // const handleSkipPage = () => {
  //   if (page < Math.ceil(questions.length / limit)) {
  //     setPage((prevPage) => prevPage + 1);
  //     setCurrQuestion((prev) => ({
  //       ...prev,
  //       id: null,
  //       response: null
  //     }));
  //   } else {
  //     setTakeExam((prev) => ({
  //       ...prev,
  //       status: "finishedExam",
  //       isEditted: false,
  //     }));
  //   }
  // };
  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  const handleAnswer = ({ id, question_text, response, selected_option = null, attachment_url = null }) => {
    let updatedAnswers = answers.filter(ans => ans.id !== id);

    const newAnswer = {
      exam_id,
      id,
      class_name: exam[0].class_name,
      class_code: exam[0].class_code,
      question_text,
      response,
      selected_option,
      page,
      admission_no: user.admission_no,
      subject_name: exam[0].subject_name,
      subject_code: exam[0].subject_code,
      attachment_url
    };

    updatedAnswers.push(newAnswer);
    setAnswers(updatedAnswers);
    setCurrQuestion(newAnswer);
  };

  const finishedExam = () => {
    if (!currQuestion.id) {
      toast.error("Select answer");
    } else {
      setTakeExam((prev) => ({
        ...prev,
        status: "finishedExam",
        isEditted: false,
      }));
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    let responses = answers.map((x) => ({
      ...x,
      query_type: 'insert',
      question_id: x.id
    }))
    _post(
      "exam-responses",
      responses,
      (resp) => {
        if (resp.success) {
          setLoading(false);
          toast.success("created successfully");
          navigate("/exams");
        }
      },
      () => {
        setLoading(false);
        toast.error("error creating");
        toggle();
      }
    );
  };

  const handleFileChange = (e, id) => {
    const attachmentFile = e.target.files ? e.target.files[0] : null;
    if (!attachmentFile) return;

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (attachmentFile.size > maxSize) {
      toast.error("File size exceeds the 5MB limit.");
      return;
    }
    const file = attachmentFile;
    if (file) {
      // Create a new FileReader to read the file
      const reader = new FileReader();

      // Set up onload event to update the preview when the file is read
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set the result as the image URL
      };

      setIsUploading(true); // Set uploading state

      // Read the image file as a data URL
      reader.readAsDataURL(file);
    }
    // Prepare form data for upload
    setIsUploading(true);
    const formData = new FormData();
    formData.append("media", attachmentFile);

    // Upload the file
    fetch(server_url + "/upload_transfer_certificate-document", {
      method: "POST",
      body: formData
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // setForm((prevForm: any) => ({ ...prevForm, badge_url: data.url }));
        const updatedQuestions = answers.map((question) => {
          if (question.id === id) {
            return {
              ...question,
              id: question.id,
              attachment_url: data.url
            };
          }
          return question;
        });

        setAnswers(updatedQuestions);
        toast.success("Uploaded successfully");
      })
      .catch((error) => {
        console.error("Error uploading attachment:", error);
        toast.error("Failed to upload the file.");
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <div>
      {takeExam.status === "examDetails" && (
        <div style={{ height: "100vh" }}>
          {/* {JSON.stringify(questions)} */}
          <h4 className="text-center mt-5 text-primary">
            Before you start the exam, here are the rules
          </h4>
          <div className="ms-5">
            <h5
              style={{
                fontSize: "17px",
                marginTop: "30px",
                marginBottom: "15px",
              }}
            >
              Exam Details:
            </h5>
            {/* {JSON.stringify(exam)} */}
            {exam?.map((item, id) => (
              <div key={id}>
                <ol style={{ fontSize: "18px" }}>
                  <li>Exam Name: {item.subject_name}</li>
                  <li>Total Marks: {item.total_marks}marks</li>
                  <li>Total Questions: {item.total_questions}questions</li>
                  <li>Time: {formatDuration(timeStart)}</li>
                </ol>

                <h5
                  style={{
                    fontSize: "17px",
                    marginTop: "30px",
                    marginBottom: "15px",
                  }}
                >
                  Rules:
                </h5>
                <ol style={{ fontSize: "18px" }}>
                  <li>Every question carry diffrent marks </li>
                  <li>Try to answer quickly as you can</li>
                  <li>Do not refresh the page</li>
                  <li>Every question carry diffrent marks</li>
                  <li>
                    When your time is up it automatically submit ur answers
                  </li>
                </ol>
              </div>
            ))}
            <Button
              color="primary"
              onClick={() => {
                setTakeExam((prev) => ({
                  ...prev,
                  status: "exam",
                  isEditted: false,
                }));
                setTimerValue(timeStart);
              }}
            >
              Start Exam
            </Button>

            <h5 className="mt-2">Best of Luck</h5>
          </div>
        </div>
      )}
      {takeExam.status === "exam" && (
        <div style={{ height: "100vh" }} className="px-3">
          {/* {JSON.stringify(paginationList)} */}
          <header className="d-flex justify-content-between mt-4">
            <h4 style={{ fontSize: "18px", fontWeight: "600" }}>
              Questions {page}/{questions ? questions?.length : 0}
            </h4>
            <h4 style={{ fontSize: "18px", fontWeight: "600" }}>
              <CountdownTimer timerValue={timerValue} />
            </h4>
          </header>
          <Card className="mt-4">
            <CardBody style={{ height: "200px", borderRadius: "5px" }}>
              {paginationList.map((question, id) => (<>
                <p style={{ fontWeight: "600" }} key={id}>
                  {question.question_text}
                  <br />
                </p>
                <p className="text-right"><span>({question.marks} marks)</span></p>
              </>))}
            </CardBody>
          </Card>
          <div className="container">

            {/* {JSON.stringify(answers)} */}
            {paginationList.map((question, index) => {
              const options_json = question.options_json ? JSON.parse(question.options_json) : [];
              const answer = answers.find(ans => ans.id === question.id);
              return (
                <div className="row mt-5" key={question.id}>
                  <div className="col-lg-6 col-md-6 col-sm-12 mt-4">
                    <div className="question-container">
                      <h4>
                        Question {index + 1}: {question.question_text} ({question.marks} marks)
                      </h4>
                      <p><img src={question.attachment_url} width="200px" height="200px" /></p>
                      {/* Multiple Choice */}
                      {question.question_type === "Multiple Choice" ? (
                        <div className="row">
                          {options_json.map((option, idx) => (
                            <div key={idx} className="col-12 col-sm-6 mb-3">
                              <div className="form-check">
                                ({getAlpha(idx)}). &nbsp;
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  id={`q${question.id}_option${idx}`}
                                  name={`question_${question.id}`}
                                  value={option.value}
                                  checked={answer?.response === option.value}
                                  onChange={() =>
                                    handleAnswer({
                                      ...question,
                                      response: option.value,
                                      selected_option: getAlpha(idx),
                                    })
                                  }
                                />
                                <label className="form-check-label" htmlFor={`q${question.id}_option${idx}`}>
                                  {option.value}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : ""}

                      {/* True/False */}
                      {question.question_type === "True/False" && (
                        <div className="row p-3">
                          {["True", "False"].map((val, idx) => (
                            <div key={idx} className="col-12 col-sm-6 mb-3">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  id={`q${question.id}_tf${idx}`}
                                  name={`question_${question.id}`}
                                  value={val}
                                  checked={answer?.response === val} // ✅ using the value from `answers`
                                  onChange={() => handleAnswer({ ...question, response: val })}
                                />
                                <label className="form-check-label" htmlFor={`q${question.id}_tf${idx}`}>
                                  {val}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Short Answer / Fill in the Blank */}
                      {["Short Answer", "Fill in the Blanks"].includes(question.question_type) && (
                        <div className="mb-3 p-3">
                          <label htmlFor={`q${question.id}_short`} className="form-label">Answer:</label>
                          <input
                            className="form-control"
                            type="text"
                            id={`q${question.id}_short`}
                            value={answer?.response || ''}
                            onChange={(e) => handleAnswer({ ...question, response: e.target.value })}
                          />
                        </div>
                      )}

                      {/* Essay */}
                      {question.question_type === "Essay" && (
                        <div className="mb-3 p-3">
                          <label htmlFor={`q${question.id}_essay`} className="form-label">Answer:</label>
                          <textarea
                            className="form-control"
                            id={`q${question.id}_essay`}
                            rows={5}
                            value={answer?.response || ''}
                            onChange={(e) => handleAnswer({
                              ...question,
                              response: e.target.value
                            })}
                          />

                          <label htmlFor={`q${question.id}_file`} className="form-label mt-3">Attach a file (optional):</label>
                          <input
                            type="file"
                            className="form-control"
                            id={`q${question.id}_file`}
                            onChange={(e) => handleFileChange(e, question.id)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <hr />

            <div className="col-md-12 text-center">
              <Popconfirm
                title="Are you sure you want to submit? Please note: Once submitted, your session will end and you will not be able to continue the exam."
                onConfirm={handleSubmit}
                okText="Confirm"
                cancelText="Cancel"
              >
                <Button type="primary" className="btn btn-success">Submit</Button>
              </Popconfirm>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Button color="primary" onClick={handlePrevPage} disabled={page === 1}>Previous Question</Button>

              {page >= Math.ceil(questions.length / limit) || takeExam.isEditted ? (
                <Button color="danger" onClick={finishedExam}>Finish Exam</Button>
              ) : (
                <Button color="danger" onClick={handleNextPage}>Next Question</Button>
              )}
            </div>
          </div>
        </div>)}
      {takeExam.status === "finishedExam" && (
        <div style={{ height: "100vh" }} className="p-3">
          <div className="row">
            <div className="col-md-8">
              <table
                className="table bg-transparent mt-5"
                style={{ backgroundColor: "transparent" }}
              >
                <thead>
                  <tr>
                    <th className="bg-transparent">S/N</th>
                    <th className="bg-transparent">QUESTION</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {JSON.stringify({ answers })} */}
                  {answers.map((answer, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td
                        onClick={() => {
                          setTakeExam((prev) => ({
                            ...prev,
                            status: "exam",
                            isEditted: true,
                          }));
                          setPage(answer.page);
                        }}
                      >
                        <Link to="" style={{ color: "black" }}>
                          {answer.question_text}
                        </Link>
                      </td>
                    </tr>
                  )
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-4">
              <table
                className="table  mt-5"
                style={{ backgroundColor: "transparent" }}
              >
                <thead className="pb-2">
                  <tr>
                    <th className="bg-transparent">SELECTED ANSWER</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {JSON.stringify(teachers)} */}
                  {Object.entries(answers).map(
                    ([key, { response, selected_option }], index) => (
                      <tr key={key}>
                        {/* <td>{index + 1}</td> */}
                        <td className="bg-success text-light">
                          {!selected_option
                            ? null
                            : `${selected_option})`}
                          {response}
                        </td>
                      </tr>
                    )
                  )}
                  {/* {answer?.map((data, idx) => (
                    <tr key={idx}>
                      <td className="bg-success text-light">{data.answer}</td>
                    </tr>
                  ))} */}
                </tbody>
              </table>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <Button
              color="primary"
              className="w-25  mt-5"
              onClick={() => {
                setTakeExam((prev) => ({
                  ...prev,
                  status: "exam",
                  isEditted: true,
                }));
              }}
            >
              Go back
            </Button>
            <Button color="success" className="w-25  mt-5" onClick={toggle}>
              Submit
            </Button>
          </div>
        </div>
      )}
      <Modal isOpen={modal} toggle={toggle} centered={true}>
        <ModalHeader toggle={toggle}></ModalHeader>
        <ModalBody>Are you sure you want to submit?</ModalBody>
        <ModalFooter className="d-flex justify-content-between">
          <Button color="primary" onClick={toggle}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleSubmit}>
            Submit
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
