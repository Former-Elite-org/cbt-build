"use client"

import { useCallback, useEffect, useState } from "react"
import { FaBook, FaClock, FaCheckCircle, FaCalendarAlt, FaUser, FaSignOutAlt } from "react-icons/fa"
import CustomTable from "../reusablecomponent/CustomTable"
import { Button, Col, Row, Card, CardBody, Badge } from "reactstrap"
import { useNavigate } from "react-router-dom"
import { _get } from "../../Helper"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { logout } from "../../redux/actions/auth"
import "./student-exam.css"
import moment from "moment"

export default function StudentExam() {
  const [viewType, setViewType] = useState("Pending")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = () => {
    navigate("/login")
    dispatch(logout(navigate))
  }

  const { user } = useSelector((s) => s.auth)

  const [examStatus, setExamStatus] = useState({
    Pending: [],
    Completed: [],
    Upcoming: [],
  })

  const getReg = useCallback(() => {
    if (user.admission_no) {
      _get(
        `examinations?query_type=select-student-exams&class_code=${user?.current_class}&id=${user.admission_no}`,
        (resp) => {
          if (resp.success && resp.data && resp.data.length) {
            const exams = resp.data

            const Pending = []
            const Completed = []
            const Upcoming = []

            exams.forEach((exam) => {
              if (exam.student_exam_status === "Completed") {
                Completed.push(exam)
              } else if (exam.student_exam_status === "Upcoming") {
                Upcoming.push(exam)
              } else {
                Pending.push(exam)
              }
            })

            setExamStatus({ Pending, Completed, Upcoming })
          }
        },
      )
    }
  }, [user.admission_no, user.current_class])

  useEffect(() => {
    getReg()
  }, [user])

  const examTable = [
    { title: "S/N", custom: true, component: (item, idx) => <strong>{idx + 1}</strong> },
    { title: "Assessment Type", value: "exam_name" },
    { title: "Subject", value: "subject_name" },
    { title: "Date", value: "commence_date" },
    {
      title: "Duration",
      custom: true,
      component: (exam) => `${exam.start_time} - ${exam.end_time}`,
    },
    {
      title: "Status",
      custom: true,
      component: (exam) => {
        const status = exam.student_exam_status
        const colorMap = {
          Completed: "success",
          Upcoming: "warning",
          Pending: "primary",
        }
        return (
          <Badge color={colorMap[status] || "secondary"} className="status-badge-table">
            {status}
          </Badge>
        )
      },
    },
    {
      title: "Action",
      custom: true,
      component: (exam) => {
        const isUpcoming = exam.student_exam_status === "Upcoming"
        const isCompleted = exam.status != "Released" && exam.student_exam_status === "Completed"
        const isReleased = exam.status === "Released"
        
        const today = moment().format("YYYY-MM-DD");
        let startTime = moment(`${today} ${exam.start_time}`, "YYYY-MM-DD hh:mm A");
        let endTime = moment(`${today} ${exam.end_time}`, "YYYY-MM-DD hh:mm A");

        if (endTime.isBefore(startTime)) {
          endTime.add(1, 'day');
        }

        const now = moment();
        const isActive = now.isBetween(startTime, endTime);

        console.log({originilan_start:exam.start_time, startTime, original_end:exam.end_time, endTime,isActive },'XXXXCCCCCVVVV')
        if (isReleased) {
          return (
            <Button
              color="info"
              size="sm"
              className="action-btn-table"
              onClick={() => navigate(`/studentresult/${exam.id}`)}
            >
              View Results
            </Button>
          )
        }
        if (isCompleted) {
          return <span className="waiting-text">Waiting for results</span>
        }
        if (isUpcoming) {
          return <span className="not-started-text">Not yet started</span>
        }

        return (
          <Button
            color="primary"
            size="sm"
             className={isActive ? "blink-button" : ""}
            disabled={!isActive}
            onClick={() => navigate(`/takeexam/${exam.id}`)}
          >
            {isActive ? 'Take Exam' : 'Exam Not Active'}
          </Button>
        )
      },
    },
  ]

  const getCardIcon = (type) => {
    switch (type) {
      case "Pending":
        return <FaClock />
      case "Upcoming":
        return <FaCalendarAlt />
      case "Completed":
        return <FaCheckCircle />
      default:
        return <FaBook />
    }
  }

  const getCardColor = (type) => {
    switch (type) {
      case "Pending":
        return "pending"
      case "Upcoming":
        return "upcoming"
      case "Completed":
        return "completed"
      default:
        return "primary"
    }
  }

  return (
    <div className="elite-student-dashboard">
      {/* Header Section */}
      <div className="student-header">
        <Row className="align-items-center">
          <Col md={8}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="welcome-section">
                <h2 className="welcome-title">
                  <FaUser className="me-2" />
                  Welcome, {user?.student_name || "Student"}!
                </h2>
                <p className="welcome-subtitle">Ready to take your exams? Let's get started!</p>
              </div>
            </motion.div>
          </Col>
          <Col md={4} className="text-end">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                <span className="logout-text">Logout</span>
              </Button>
            </motion.div>
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <Row className="exam-stats-section">
        {["Pending", "Upcoming", "Completed"].map((type, index) => (
          <Col lg={4} md={6} key={type} className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card
                className={`exam-stat-card ${getCardColor(type)} ${viewType === type ? "active" : ""}`}
                onClick={() => setViewType(type)}
              >
                <CardBody>
                  <div className="stat-card-content">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">{getCardIcon(type)}</div>
                    </div>
                    <div className="stat-info">
                      <h3 className="stat-number">{examStatus[type].length}</h3>
                      <p className="stat-label">{type} Exams</p>
                    </div>
                  </div>
                  <div className="card-overlay"></div>
                </CardBody>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Exam Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="exam-table-section"
      >
        <Card className="exam-table-card">
          <CardBody>
            <div className="table-header">
              <h4 className="table-title">
                {getCardIcon(viewType)}
                <span className="ms-2">{viewType} Exams</span>
              </h4>
              <Badge color={getCardColor(viewType)} className="count-badge">
                {examStatus[viewType].length} {examStatus[viewType].length === 1 ? "exam" : "exams"}
              </Badge>
            </div>

            {examStatus[viewType].length > 0 ? (
              <CustomTable
                fields={examTable}
                data={examStatus[viewType]}
                type={`${viewType} Exams`}
                className="student-exam-table"
              />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{getCardIcon(viewType)}</div>
                <h5 className="empty-title">No {viewType} Exams</h5>
                <p className="empty-message">
                  {viewType === "Pending"
                    ? "You don't have any pending exams at the moment."
                    : viewType === "Upcoming"
                      ? "No upcoming exams scheduled."
                      : "You haven't completed any exams yet."}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}
