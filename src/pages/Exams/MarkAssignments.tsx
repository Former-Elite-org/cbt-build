import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Row,
  Typography,
  message,
} from "antd";
// import useQuery, { _get, _post } from "../../Utils/Helper";
import { useSelector } from "react-redux";
// import { RootState } from "../../../redux/reducers";
import dayjs from "dayjs";
import MarkAssignmentModal from "./MarkAssignmentModal";
import { toast } from "react-hot-toast";
import UpdateAssignmentQuestionsTable from "./UpdateAssignmentQuestionsTable";
import Table from "../../../core/common/dataTable/index";
import useQuery, { _get, _post } from "../../Helper";
const { Title, Paragraph } = Typography;

export interface StudentResponses {
  id?:number;
  student_name: string;
  assignment_id: string;
  admission_no: string | null;
  marks: number;
  score: number;
  remark: string;
  question_id: number;
  answer_id: number;
  submitted_on: string;
  response: string;
  question_type: string;
  question_text: string;
  correct_answer: string;
}

export interface StudentAssignment {
  id: number;
  assignment_id: string;
  admission_no: string | null;
  class_name: string;
  subject: string;
  teacher_name: string;
  student_name: string;
  attachment: string | null;
  title: string | null;
  submission_date: string | null;
  content: string;
  total_questions?: number;
  total_marks?: number;
}
interface AssignmentQuestion {
  id: number;
  question_text: string;
  question_type: string;
  correct_answer: string;
  marks: number
  // Add other fields if needed
}
const MarkAssignments = () => {
  const studentAssignment = {
    id: 0,
    assignment_id: "",
    student_name: "",
    admission_no: "",
    class_name: "",
    subject: "",
    teacher_name: "",
    attachment: "",
    content: "",
    marks: null,
    score: null,
    remark: null,
    submission_date: "",
    title: "",
    total_questions: 0,
    total_marks: 0,
  }
  const [assignments, setAssignments] = useState([]);
  const [assignment, setAssignment] = useState<StudentAssignment>(studentAssignment);
  const [assignmentQuestions, setAssignmentQuestions] = useState<AssignmentQuestion[]>([])
  // const [studentResponses, setStudentResponses] = useState([]);
  // const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useSelector((state:any) => state.auth);
  const q = useQuery();
  const assignment_id = q.get('assignment_id');

  const [form] = Form.useForm();

  const getGivenAssignments = useCallback(() => {
    if (assignment_id) {
      _get(
        `assignments?query_type=select&id=${assignment_id}`,
        (res) => {
          if (res.success && res.data) {
            setAssignment(res.data[0]);
          }
        },
        (err) => {
          console.error("Error fetching assignments:", err);
        }
      );
    }
  }, [assignment_id]);


  const getAssignments = useCallback(() => {
    if (user.id && assignment.class_name && user.school_id) {
      _get(
        `assignments?query_type=select-responses&teacher_id=${user.id}&id=${assignment_id}&class_name=${assignment.class_name}&school_id=${user.school_id}`,
        (res) => {
          if (res.success && res.data && res.data.length && res.data[0].admission_no) {
            setAssignments(res.data);
          }
        },
        (err) => {
          console.error("Error fetching assignments:", err);
        }
      );
    }
  }, [user.id, user.school_id, assignment.class_name]);

  const getAssignmentQuestions = useCallback(() => {
    if (user.id && assignment_id) {
      _get(
        `assignments?query_type=select-questions&teacher_id=${user.id}&id=${assignment_id}`,
        (res) => {
          if (res.success && res.data && res.data.length && res.data[0].id) {
            setAssignmentQuestions(res.data);
          }
        },
        (err) => {
          console.error("Error fetching assignments:", err);
        }
      );
    }
  }, [user.id, assignment_id]);

  const getStudentResponse = (item) => {
    if (item.admission_no && item.assignment_id) {
      _get(
        `assignments?query_type=select-submitted&content=${item.admission_no}&id=${item.assignment_id}`,
        (res) => {
          if (res.success && res.data && res.data.length && res.data[0].assignment_id) {
            openMarkingModal(res.data);
          }
        },
        (err) => {
          console.error("Error fetching assignments:", err);
        }
      );
    }
  }

  const handleMarkAssignment = async (values:any) => {
    alert(JSON.stringify(values,"Inside Parent"))
    if (!values) return;
    const payload = values.map((val) => ({ ...val, query_type: 'update', id: val.id }))

    _post(
      "exam-responses",
       payload,
      (res) => {
        if (res.success) {
          message.success("Assignment marked successfully!");
          setModalVisible(false);
          form.resetFields();
          getAssignments();
        }
      },
      (err) => {
        toast.error("Error marking assignment.\r\n Please try again");
        message.error("Failed to mark assignment.");
      }
    );
  };

  // const handleDeleteAssignment = (question) => {
  //   if (question.id) {

  //     _post(
  //       "exam-responses",
  //       { query_type: "delete", id: question.id },
  //       (res) => {
  //         if (res.success) {
  //           message.success("Assignment deleted successfully!");
  //           getAssignments();
  //         }
  //       },
  //       () => {
  //         message.error("Error deleting assignment.");
  //       }
  //     );
  //   }
  // };

  const handleSubmitAssignment = (assignment, question) => {
    // const total_marks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);

    // if (!form.title || !form.class_name || !form.subject || questions.length === 0) {
    //   message.error("Please complete the form and add questions.");
    //   return;
    // }

    const formattedQuestions = {
      id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      correct_answer: question.correct_answer,
      marks: question.marks,
      query_type: question.id ? "update" : "insert",
      options: question.options = [
        { value: question.option_a,  is_correct: question.option_a == question.correct_answer},
        { value: question.option_b, is_correct: question.option_b == question.correct_answer },
        { value: question.option_c, is_correct: question.option_c == question.correct_answer },
        { value: question.option_d, is_correct: question.option_d == question.correct_answer },
      ],
    };

    _post(
      "assignments",
      {
        ...form,
        query_type: "update",
        id: assignment.id,
        assignment_id: assignment.assignment_id,
        questions: [formattedQuestions],
        branch_id: assignment?.branch_id,
      },
      (res) => {

        if (res.success) {
          getAssignmentQuestions();
          message.success("Assignment Updated!");
        }
      },
      () => {
        message.error("Error submitting assignment.");
      }
    );
  };
  const openMarkingModal = (assignments) => {
    if (assignments.length) {
      setSelectedAssignments(assignments);
      setModalVisible(true);
    }
  };

  useEffect(() => {
    getGivenAssignments();
    getAssignments();
    getAssignmentQuestions();
  }, [getAssignments, getGivenAssignments, getAssignmentQuestions]);


  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => <p>{index + 1}</p>,
    },
    {
      title: "Admission No.",
      dataIndex: "admission_no",
      key: "admission_no",
    },
    {
      title: "Student Name",
      dataIndex: "student_name",
      key: "student_name",
    },
    // {
    //   title: "Subject",
    //   dataIndex: "subject",
    //   key: "subject",
    // },
    // {
    //   title: "Content",
    //   dataIndex: "content",
    //   key: "content",
    // },
    {
      title: "Submitted at",
      dataIndex: "created_at",
      key: "created_at",
      render: (text:string, record:any) => { return record?.response_count > 0 ? dayjs(text).format("DD/MM/YYYY HH:mm:ss") : <p className="text-center"> - </p> },
    },
    {
      title: "Q. Answered",
      dataIndex: "response_count",
      key: "response_count",
      render: (text:string, record:any) => <p>{record?.response_count}</p>
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      render: (text:string, record:any) =>
        record?.response_count
          ? (record?.score !== undefined && record?.marks !== undefined
            ? <span>{record?.score} / {record?.marks}</span>
            : <span>-</span>)
          : <span>-</span>
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="primary" onClick={() => getStudentResponse(record)}>
          Preview
        </Button>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">

        <Title level={3}
          style={{
            paddingTop: '20px',
            display: "flex",
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between'
          }}>
          <Paragraph>
            <b>Class:</b> {assignment.class_name}
          </Paragraph>
          <Paragraph>
            <b>Subject:</b> {assignment.subject}
          </Paragraph>
        </Title>

        {assignment.id ? (
          <div style={{ border: "1px solid #f0f0f0", borderRadius: "8px", padding: "16px", marginBottom: "14px" }}>
            <Row gutter={16}>
              <Col span={16}>
                <Paragraph>
                  <b>Assignment Topic:</b>  {assignment.title}
                </Paragraph>
                <Paragraph>
                  <b>Teacher:</b> {assignment.teacher_name}
                </Paragraph>
                <Paragraph>
                  <b>Assignment Date:</b> {assignment.submission_date}
                </Paragraph>
                <Paragraph>
                  <b>Submission Date:</b> {assignment.submission_date}
                </Paragraph>
              </Col>
              <Col className="text-end">
                <Paragraph>
                  <b>No. of Question:</b>  {assignmentQuestions.length}
                </Paragraph>
                <Paragraph>
                  <b>Total Marks:</b> {assignmentQuestions.reduce((sum, q) => sum + Number(q.marks || 0), 0)}
                </Paragraph>
              </Col>
            </Row>
            {assignment.attachment ? <Paragraph>
              <b>Attachment:</b>  <a href={assignment.attachment} target="_blank" rel="noopener noreferrer">
                View Attachment
              </a>
            </Paragraph> : null}
            <Paragraph>
              <UpdateAssignmentQuestionsTable
                questions={assignmentQuestions}
                onUpdate={(text) => {
                  handleSubmitAssignment(assignment, text)
                  toast.success('Updated')
                }}
                onDelete={(q) => {()=>{}}}
              />
            </Paragraph>
          </div>
        ) : null}
        <h3>Assignment Responses!</h3>
        <Table
          columns={columns}
          dataSource={assignments}
        />

        <MarkAssignmentModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          selectedAssignments={selectedAssignments}
          onSubmit={handleMarkAssignment}
        />

      </div>
    </div>
  );
};

export default MarkAssignments;
