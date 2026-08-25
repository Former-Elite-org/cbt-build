"use client"

import { useCallback, useEffect, useState } from "react"
import { FaBook, FaChevronLeft, FaDownload, FaEye } from "react-icons/fa"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Container } from "reactstrap"
import { _get } from "../../Helper"
import { motion } from "framer-motion"
import * as XLSX from "xlsx"
import UnifiedDatatable from "../../core/common/dataTable/index.tsx"
import { useSelector } from "react-redux"

const ExamsAdminReports = () => {
  // const [subjects, setSubjects] = useState([])
  // const [classes, setClasses] = useState([])
  const [examList, setExamList] = useState([])
  // const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)
  // const [error, setError] = useState({})
  const { selected_branch } = useSelector((state) => state.auth)
  const [selectedExam, setSelectedExam] = useState(null)
  const [examResults, setExamResults] = useState([])
  const [viewType, setViewType] = useState("exams")
  const [selectedResult, setSelectedResult] = useState(null)
  const [modal, setModal] = useState(false)
  const [gradingSystem, setGradingSystem] = useState({
    A: { min: 70, max: 100, grade: "A" },
    B: { min: 60, max: 69, grade: "B" },
    C: { min: 50, max: 59, grade: "C" },
    D: { min: 40, max: 49, grade: "D" },
    F: { min: 0, max: 39, grade: "F" },
  })

  const getReg = useCallback(() => {
    if (selected_branch?.branch_id) {
      setLoading(true)
      _get(`examinations?query_type=Select Released Exams&branch_id=${selected_branch.branch_id}`,
        (resp) => {
          if (resp.success && resp.data && resp.data.length) {
            setLoading(false)
            // Add unique keys for the datatable
            const examsWithKeys = resp.data.map((exam, index) => ({
              ...exam,
              key: exam.id || index,
            }))
            setExamList(examsWithKeys)
          }
        }, (err) => {
          setLoading(false)
          console.error("Error fetching exams:", err)
        })
    }
  }, [])

  useEffect(() => {
    getReg()
  }, [getReg])

  const fetchResults = (examId) => {
    _get(`exam-responses?query_type=get_results&exam_id=${examId}`, (resp) => {
      if (resp.success && resp.data && resp.data.length) {
        // Add unique keys for the datatable
        const resultsWithKeys = resp.data.map((result, index) => ({
          ...result,
          key: result.id || `${result.admission_no}_${index}` || index,
        }))
        setExamResults(resultsWithKeys)
      }
    })
  }

  // Exam table columns configuration
  const examColumns = [
    {
      title: "S/N",
      key: "serial",
      render: (text, record, index) => <div className="fw-bold text-primary">{index + 1}</div>,
    },
    {
      title: "Assessment Type",
      dataIndex: "assessment_type",
      key: "assessment_type",
      render: (text, record) => <strong className="">{record.assessment_type}</strong>,
    },
    {
      title: "Subject",
      dataIndex: "subject_name",
      key: "subject_name",
      render: (text, record) => <strong className="">{record.subject_name}</strong>,
    },
    {
      title: "Class",
      dataIndex: "class_name",
      key: "class_name",
      render: (text, record) => <strong className="">{record.class_name}</strong>,
    },

    {
      title: "Date",
      dataIndex: "commence_date",
      key: "commence_date",
      render: (date) => (
        <div className="text-muted">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
    // {
    //   title: "Total Marks",
    //   dataIndex: "total_marks",
    //   key: "total_marks",
    //   render: (marks) => <div className="fw-semibold text-success">{marks || "N/A"}</div>,
    // },
    {
      title: "Total Questions",
      dataIndex: "total_questions",
      key: "total_questions",
      render: (questions) => <div className="fw-semibold text-info">{questions || "N/A"}</div>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, exam) => (
        <Button
          color="primary"
          size="sm"
          className="btn-gradient-primary"
          onClick={() => {
            setSelectedExam(exam)
            setViewType("results")
            fetchResults(exam.id)
          }}
        >
          <FaEye className="me-1" />
          View Results
        </Button>
      ),
    },
  ]

  // Results table columns configuration
  const resultsColumns = [
    {
      title: "S/N",
      key: "serial",
      render: (text, record, index) => <div className="fw-bold text-primary">{index + 1}</div>,
    },
    {
      title: "Student Name",
      dataIndex: "student_name",
      key: "student_name",
      render: (name) => <div className="fw-semibold text-dark">{name}</div>,
    },
    {
      title: "Admission No",
      dataIndex: "admission_no",
      key: "admission_no",
      render: (admissionNo) => <div className="badge bg-light text-dark border px-2 py-1">{admissionNo}</div>,
    },

    {
      title: "Total Score",
      dataIndex: "total_score",
      key: "total_score",
      render: (score, record) => {
        const percentage = record.total_earnable_marks ? Math.round((score / record.total_earnable_marks) * 100) : 0

        let colorClass = "text-danger"
        if (percentage >= 70) colorClass = "text-success"
        else if (percentage >= 50) colorClass = "text-warning"

        return (
          <div className={`fw-bold ${colorClass}`}>
            {score} ({percentage}%)
          </div>
        )
      },
    },
    {
      title: "Total Questions",
      dataIndex: "total_questions",
      key: "total_questions",
    },
    // {
    //   title: "Scores",
    //   dataIndex: "correct_answers",
    //   key: "correct_answers",
    //   render: (correct, record) => (
    //     <div className="text-success fw-semibold">
    //       {correct}/{record.total_questions}
    //     </div>
    //   ),
    // },

    {
      title: "Actions",
      key: "actions",
      render: (text, result) => (
        <Button
          color="info"
          size="sm"
          className="btn-gradient-info"
          onClick={() => {
            setSelectedResult(result)
            setModal(true)
          }}
        >
          <FaBook className="me-1" />
          View Details
        </Button>
      ),
    },
  ]

  const downloadAllExcel = () => {
    if (!examResults.length) return

    // Prepare data for Excel
    const excelData = examResults.map((result, index) => ({
      "S/N": index + 1,
      "Student Name": result.student_name,
      "Admission No": result.admission_no,
      Class: result.class_name,
      Term: result.term,
      "Academic Year": result.academic_year,
      "Total Score": result.total_score,
      "Total Questions": result.total_questions,
      "Correct Answers": result.correct_answers,
      "Total Earnable Marks": result.total_earnable_marks,
      Percentage: result.total_earnable_marks
        ? Math.round((result.total_score / result.total_earnable_marks) * 100) + "%"
        : "0%",
    }))

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()

    // Set column widths
    const colWidths = [
      { wch: 5 }, // S/N
      { wch: 25 }, // Student Name
      { wch: 15 }, // Admission No
      { wch: 15 }, // Class
      { wch: 12 }, // Term
      { wch: 15 }, // Academic Year
      { wch: 12 }, // Total Score
      { wch: 15 }, // Total Questions
      { wch: 15 }, // Correct Answers
      { wch: 18 }, // Total Earnable Marks
      { wch: 12 }, // Percentage
    ]
    ws["!cols"] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, "Exam Results")

    // Generate filename
    const examTitle = selectedExam?.assessment_type || "Exam"
    const className = selectedExam?.class_name || ""
    const subject = selectedExam?.subject_name || ""
    const filename = `${examTitle}_${className}_${subject}_Results.xlsx`.replace(/\s+/g, "_")

    XLSX.writeFile(wb, filename)
  }

  return (
    <div className="elite-admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header mb-5">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="dashboard-title">Exam Reports</h2>
          {/* <p className="dashboard-subtitle">Manage exams, monitor performance, and oversee CBT operations</p> */}
        </motion.div>
      </div>
      <Container style={{ paddingTop: "50px" }}>
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status"><Spinner animation="border" /></div>
            <div className="mt-3">Loading exams...</div>
          </div>
        )}
        {viewType === "exams" ? (
          <UnifiedDatatable
            title="📊 Exam Reports"
            columns={examColumns}
            dataSource={examList}
            withSearch={true}
            withPagination={true}
            striped={true}
            defaultPageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
            emptyMessage="No exams found. Create an exam to get started!"
            showFilters={true}
            showExport={false}
            className="exam-reports-table"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="results-view"
          >
            <div className="d-flex flex-column gap-4">
              {/* Header with Back Button and Download All */}
              <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 border">
                <Button
                  color="secondary"
                  className="btn-gradient-secondary"
                  onClick={() => {
                    setViewType("exams")
                    setSelectedExam(null)
                    setExamResults([])
                  }}
                >
                  <FaChevronLeft className="me-2" />
                  Back to Exams
                </Button>

                <div className="text-center">
                  <h4 className="mb-1 text-primary fw-bold">📋 {selectedExam?.assessment_type} Results</h4>
                  <div className="text-muted small">
                    {selectedExam?.subject_name} • {selectedExam?.class_name} • {selectedExam?.commence_date}
                  </div>
                </div>

                <Button
                  color="success"
                  className="btn-gradient-success"
                  onClick={downloadAllExcel}
                  disabled={!examResults.length}
                >
                  <FaDownload className="me-1" />
                  Download All Results
                </Button>
              </div>

              {/* Results Table */}
              <UnifiedDatatable
                title={`📈 Total Responses (${examResults.length} Students)`}
                columns={resultsColumns}
                dataSource={examResults}
                withSearch={true}
                withPagination={true}
                striped={true}
                defaultPageSize={15}
                pageSizeOptions={[10, 15, 25, 50]}
                emptyMessage="No results found for this exam."
                showFilters={true}
                showExport={false}
                className="results-table"
              />
            </div>
          </motion.div>
        )}
      </Container>
      {/* Student Result Details Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" className="result-details-modal">
        <ModalHeader toggle={() => setModal(false)} className="bg-gradient-primary text-white">
          <div className="d-flex align-items-center">
            <FaBook className="me-2" />
            {selectedResult?.student_name}'s Detailed Results
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          {selectedResult && (
            <div className="result-details">
              {/* Student Information Card */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card border-primary h-100">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">👤 Student Information</h6>
                    </div>
                    <div className="card-body">
                      <div className="info-item mb-2">
                        <strong>Name:</strong> {selectedResult.student_name}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Admission No:</strong>
                        <span className="badge bg-light text-dark ms-2">{selectedResult.admission_no}</span>
                      </div>
                      <div className="info-item mb-2">
                        <strong>Class:</strong> {selectedResult.class_name}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Term:</strong> {selectedResult.term}
                      </div>
                      <div className="info-item">
                        <strong>Academic Year:</strong> {selectedResult.academic_year}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card border-success h-100">
                    <div className="card-header bg-success text-white">
                      <h6 className="mb-0">📊 Exam Performance</h6>
                    </div>
                    <div className="card-body">
                      <div className="performance-metrics">
                        <div className="metric-item mb-3">
                          <div className="d-flex justify-content-between">
                            <strong>Total Score:</strong>
                            <span className="badge bg-primary fs-6">{selectedResult.total_score}</span>
                          </div>
                        </div>
                        <div className="metric-item mb-3">
                          <div className="d-flex justify-content-between">
                            <strong>Questions Answered:</strong>
                            <span className="text-info">
                              {selectedResult.correct_answers}/{selectedResult.total_questions}
                            </span>
                          </div>
                        </div>
                        <div className="metric-item mb-3">
                          <div className="d-flex justify-content-between">
                            <strong>Total Earnable Marks:</strong>
                            <span className="text-success">{selectedResult.total_earnable_marks}</span>
                          </div>
                        </div>
                        <div className="metric-item">
                          <div className="d-flex justify-content-between">
                            <strong>Percentage:</strong>
                            <span
                              className={`badge fs-6 ${selectedResult.total_earnable_marks
                                  ? Math.round(
                                    (selectedResult.total_score / selectedResult.total_earnable_marks) * 100,
                                  ) >= 70
                                    ? "bg-success"
                                    : Math.round(
                                      (selectedResult.total_score / selectedResult.total_earnable_marks) * 100,
                                    ) >= 50
                                      ? "bg-warning"
                                      : "bg-danger"
                                  : "bg-secondary"
                                }`}
                            >
                              {selectedResult.total_earnable_marks
                                ? Math.round((selectedResult.total_score / selectedResult.total_earnable_marks) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grading System */}
              <div className="card border-info">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">📋 Grading System</h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Grade</th>
                          <th>Minimum Score</th>
                          <th>Maximum Score</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(gradingSystem).map(([grade, info]) => (
                          <tr key={grade}>
                            <td>
                              <span
                                className={`badge ${grade === "A"
                                    ? "bg-success"
                                    : grade === "B"
                                      ? "bg-primary"
                                      : grade === "C"
                                        ? "bg-info"
                                        : grade === "D"
                                          ? "bg-warning"
                                          : "bg-danger"
                                  }`}
                              >
                                {grade}
                              </span>
                            </td>
                            <td>≥ {info.min}%</td>
                            <td>≤ {info.max}%</td>
                            <td>
                              {grade === "A"
                                ? "Excellent"
                                : grade === "B"
                                  ? "Very Good"
                                  : grade === "C"
                                    ? "Good"
                                    : grade === "D"
                                      ? "Fair"
                                      : "Needs Improvement"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default ExamsAdminReports
