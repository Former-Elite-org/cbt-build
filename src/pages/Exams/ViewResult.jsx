import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Container } from "reactstrap";
import { _get, _post } from "../../Helper";
import { toast } from "react-hot-toast";
import MarkAssignmentModal from "./MarkAssignmentModal";
import { Form, message, Spin } from "antd";
import Datatable from "../../core/common/dataTable/index.tsx";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";

export default function ViewResult() {
  const [form] = Form.useForm();
  const [admission_no, setAdmissionNo] = useState(null);
  const [exam, setExam] = useState("General");
  const [result, setResult] = useState([]);
  const [studentExam, setStudentExam] = useState([]);
  const [tableShow, setTableShow] = useState("results");
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [curExam, setCurExam] = useState({});
  const [loading, setLoading] = useState(false);

  const { selected_branch } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const params = useParams();
  const exam_id = params.id;

  const getReg = useCallback(() => {
    setLoading(true);

    _get(`exam-responses?query_type=get_results&exam_id=${exam_id}`, (resp) => {
      if (resp.success && resp.data.length > 0) {
        setResult(resp.data);
        setExam(resp.data[0].assessment_type);
      }
      setLoading(false);
    });

    _get(
      `examinations?query_type=by_id&id=${exam_id}&branch_id=${selected_branch?.branch_id}`,
      (resp) => {
        if (resp.success && resp.data.length) {
          setCurExam(resp.data[0]);
        }
      },
      (err) => {
        console.error(err);
        setCurExam({});
      }
    );
  }, [exam_id, selected_branch?.branch_id]);

  useEffect(() => {
    getReg();
  }, [getReg]);

  useEffect(() => {
    if (admission_no) {
      _get(
        `exam-responses?query_type=get_student_exam&exam_id=${exam_id}&admission_no=${admission_no}`,
        (resp) => {
          if (resp.success && resp.data.length > 0) {
            setStudentExam(resp.data);
          }
        }
      );
    }
  }, [admission_no, exam_id]);

  const getStudentResponse = (item) => {
    const { admission_no } = item;
    setAdmissionNo(admission_no);

    _get(
      `exam-responses?query_type=get_student_exam&exam_id=${exam_id}&admission_no=${admission_no}`,
      (res) => {
        if (res.success && res.data?.length && res.data[0].question_id) {
          setSelectedAssignments(res.data);
          setModalVisible(true);
          setStudentExam(res.data);
        }
      },
      (err) => {
        console.error("Error fetching exams:", err);
      }
    );
  };

  const handleMarkAssignment = (values) => {
    if (!values) return;

    const payload = values.map((val) => ({
      ...val,
      query_type: "update",
      id: val.id,
    }));

    _post(
      "exam-responses",
      payload,
      (res) => {
        if (res.success) {
          message.success("Assignment marked successfully!");
          setModalVisible(false);
          form.resetFields();
          getReg();
        }
      },
      () => {
        message.error("Error marking exam. Please try again.");
      }
    );
  };

  const handleReleased = () => {
    _post(
      `examinations?query_type=status&id=${exam_id}`,
      {
        query_type: "status",
        id: exam_id,
        status: "Released",
      },
      (resp) => {
        if (resp.success) {
          toast.success("Result released successfully!");
          navigate(-1);
        }
      }
    );
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      result.map((item) => ({
        "Admission No": item.admission_no,
        "Student Name": item.student_name,
        "Total Questions": item.total_questions,
        "Total Marks": item.total_earnable_marks,
        Score: item.total_scores,
        Percentage:
          ((item.total_scores / item.total_earnable_marks) * 100).toFixed(2) +
          "%",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(
      workbook,
      `${result[0]?.class_name || ""} ${result[0]?.academic_year || ""} / ${
        result[0]?.term || ""
      } - ${exam} Result.xlsx`
    );
  };

  const exportToPDF = async () => {
    const jsPDFModule = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const { jsPDF } = jsPDFModule;
    const doc = new jsPDF();

    const title = `${result[0]?.class_name || ""} ${
      result[0]?.academic_year || ""
    } / ${result[0]?.term || ""} - ${exam} Result`;

    // Title
    doc.setFontSize(16);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);

    // Table
    const tableColumn = [
      "#",
      "Admission No",
      "Student Name",
      "Questions",
      "Total Marks",
      "Score",
      "Percentage",
    ];
    const tableRows = result.map((item, index) => [
      index + 1,
      item.admission_no,
      item.student_name,
      item.total_questions,
      item.total_earnable_marks,
      item.total_scores,
      ((item.total_scores / item.total_earnable_marks) * 100).toFixed(2) + "%",
    ]);

    // Add the table using the imported autoTable function
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "middle",
        halign: "center",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 25 },
    });

    // Page footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Save the file
    doc.save(
      `${result[0]?.class_name || ""} ${result[0]?.academic_year || ""} / ${
        result[0]?.term || ""
      } - ${exam} Result.pdf`
    );
  };

  const examTable = [
    { title: "S/N", custom: true, render: (i, item, index) => index + 1 },
    { title: "Admission No", dataIndex: "admission_no" },
    { title: "Student Name", dataIndex: "student_name" },
    { title: "Total Questions", dataIndex: "total_questions" },
    { title: "Total Marks", dataIndex: "total_earnable_marks" },
    { title: "Score", dataIndex: "total_scores" },
    {
      title: "Action",
      custom: true,
      render: (text, student) => (
        <div className="place-center">
          <Button color="info" onClick={() => getStudentResponse(student)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  const studentExamTable = [
    { title: "S/N", custom: true, render: (i, index) => index + 1 },
    { title: "Student Name", dataIndex: "student_name" },
    { title: "Question", dataIndex: "question" },
    { title: "Answer", dataIndex: "response" },
    { title: "Correct Answer", dataIndex: "answer" },
    { title: "Score", dataIndex: "total_score" },
    {
      title: "Action",
      custom: true,
      render: (text, i) => (
        <div className="place-center">
          <Button
            disabled
            className="text-capitalize"
            color={i.remarks === "correct" ? "success" : "danger"}
          >
            {i?.remarks}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="elite-admin-dashboard">
      <div className="dashboard-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="dashboard-title mb-5">Exam Results</h2>
        </motion.div>
      </div>

      <Container className="dashboard-container mt-5">
        {loading ? (
          <div className="text-center my-5">
            <Spin size="large" tip="Loading exams..." />
          </div>
        ) : (
          <div className="card-body">
            {tableShow === "studentResult" ? (
              <>
                <Button onClick={() => setTableShow("results")}>Back</Button>
                <Datatable
                  columns={studentExamTable}
                  dataSource={studentExam}
                  size="sm"
                  title={`${exam} - ${studentExam[0]?.student_name || ""}`}
                />
              </>
            ) : (
              <>
                <div className="d-flex justify-content-between mb-3">
                  <Button
                    onClick={() => navigate(-1)}
                    className="manage-btn"
                    style={{ width: "100px" }}
                  >
                    Back
                  </Button>

                  <div className="">
                    <Button
                      color="primary"
                      className="blue-btn me-3"
                      onClick={exportToExcel}
                      style={{ width: "200px" }}
                    >
                      <i className="fas fa-file-excel me-1"></i> Export to Excel
                    </Button>
                    <Button
                      color="danger"
                      className="red-btn"
                      onClick={exportToPDF}
                      style={{ width: "200px" }}
                    >
                      <i className="fas fa-file-pdf me-1"></i> Export to PDF
                    </Button>
                  </div>
                </div>
                <Datatable
                  columns={examTable}
                  dataSource={result}
                  size="sm"
                  title={`${result[0]?.class_name || ""} ${
                    result[0]?.academic_year || ""
                  } / ${result[0]?.term || ""} - ${exam} Result`}
                />
                {curExam.status === "Released" ? (
                  ""
                ) : (
                  <Button
                    color="success"
                    className="float-end"
                    onClick={handleReleased}
                  >
                    Release Results
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        <MarkAssignmentModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          selectedAssignments={selectedAssignments}
          onSubmit={handleMarkAssignment}
          examStatus={curExam.status}
        />
      </Container>
    </div>
  );
}
