"use client"

import { useCallback, useEffect, useState } from "react"
import {
  FaClock,
  FaCalculator,
  FaBook,
  FaKeyboard,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaFileUpload,
  FaCheckCircle,
  FaEyeSlash,
} from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Card, CardBody, Modal, ModalBody, ModalHeader, Progress, Badge, Alert, Row, Col } from "reactstrap"
import { motion } from "framer-motion"
import { _get, _post, formatDuration, getAlpha } from "../../Helper"
import moment from "moment"
import { toast } from "react-hot-toast"
import { useSelector } from "react-redux"
import { Popconfirm } from "antd"
import "./take-exam-enhanced.css"

// Calculator Component with Keyboard Support
const Calculator = ({ isVisible, onClose }) => {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState(null)
  const [operation, setOperation] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  // Calculator keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return

    const handleCalcKeyPress = (e) => {
      e.preventDefault()
      const key = e.key

      if (key >= "0" && key <= "9") {
        inputNumber(Number.parseInt(key))
      } else if (key === ".") {
        setDisplay(display.includes(".") ? display : display + ".")
      } else if (key === "+") {
        inputOperation("+")
      } else if (key === "-") {
        inputOperation("-")
      } else if (key === "*") {
        inputOperation("×")
      } else if (key === "/") {
        inputOperation("÷")
      } else if (key === "Enter" || key === "=") {
        performCalculation()
      } else if (key === "Escape" || key === "c" || key === "C") {
        clearAll()
      }
    }

    window.addEventListener("keydown", handleCalcKeyPress)
    return () => window.removeEventListener("keydown", handleCalcKeyPress)
  }, [isVisible, display, previousValue, operation])

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? String(num) : display + num)
    }
  }

  const inputOperation = (nextOperation) => {
    const inputValue = Number.parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue
      case "-":
        return firstValue - secondValue
      case "×":
        return firstValue * secondValue
      case "÷":
        return firstValue / secondValue
      case "=":
        return secondValue
      default:
        return secondValue
    }
  }

  const performCalculation = () => {
    const inputValue = Number.parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  const clearAll = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  if (!isVisible) return null

  return (
    <div className="calculator-overlay">
      <div className="calculator">
        <div className="calculator-header">
          <h5>Calculator</h5>
          <div className="calc-shortcuts">
            <small>Use keyboard: 0-9, +, -, *, /, Enter, Esc</small>
          </div>
          <Button size="sm" color="light" onClick={onClose}>
            <FaTimes />
          </Button>
        </div>
        <div className="calculator-display">{display}</div>
        <div className="calculator-buttons">
          <Button onClick={clearAll} color="danger" size="sm">
            C
          </Button>
          <Button onClick={() => inputOperation("÷")} color="primary" size="sm">
            ÷
          </Button>
          <Button onClick={() => inputOperation("×")} color="primary" size="sm">
            ×
          </Button>
          <Button onClick={() => inputOperation("-")} color="primary" size="sm">
            -
          </Button>

          <Button onClick={() => inputNumber(7)} size="sm">
            7
          </Button>
          <Button onClick={() => inputNumber(8)} size="sm">
            8
          </Button>
          <Button onClick={() => inputNumber(9)} size="sm">
            9
          </Button>
          <Button onClick={() => inputOperation("+")} color="primary" size="sm" className="tall">
            +
          </Button>

          <Button onClick={() => inputNumber(4)} size="sm">
            4
          </Button>
          <Button onClick={() => inputNumber(5)} size="sm">
            5
          </Button>
          <Button onClick={() => inputNumber(6)} size="sm">
            6
          </Button>

          <Button onClick={() => inputNumber(1)} size="sm">
            1
          </Button>
          <Button onClick={() => inputNumber(2)} size="sm">
            2
          </Button>
          <Button onClick={() => inputNumber(3)} size="sm">
            3
          </Button>
          <Button onClick={performCalculation} color="success" size="sm" className="tall">
            =
          </Button>

          <Button onClick={() => inputNumber(0)} size="sm" className="wide">
            0
          </Button>
          <Button onClick={() => setDisplay(display.includes(".") ? display : display + ".")} size="sm">
            .
          </Button>
        </div>
      </div>
    </div>
  )
}

// Dictionary Component with Enhanced Search
const Dictionary = ({ isVisible, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [definition, setDefinition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])

  // Dictionary keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return

    const handleDictKeyPress = (e) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "Enter" && searchTerm.trim()) {
        searchDefinition()
      }
    }

    window.addEventListener("keydown", handleDictKeyPress)
    return () => window.removeEventListener("keydown", handleDictKeyPress)
  }, [isVisible, searchTerm])

  const searchDefinition = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`)
      const data = await response.json()

      if (data && data[0]) {
        setDefinition(data[0])
        setSearchHistory((prev) => [searchTerm, ...prev.filter((term) => term !== searchTerm)].slice(0, 5))
      } else {
        setDefinition({ error: "Word not found" })
      }
    } catch (error) {
      setDefinition({ error: "Failed to fetch definition" })
    }
    setLoading(false)
  }

  if (!isVisible) return null

  return (
    <div className="dictionary-overlay">
      <div className="dictionary">
        <div className="dictionary-header">
          <h5>Dictionary</h5>
          <div className="dict-shortcuts">
            <small>Press Enter to search, Esc to close</small>
          </div>
          <Button size="sm" color="light" onClick={onClose}>
            <FaTimes />
          </Button>
        </div>
        <div className="dictionary-search">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter word to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchDefinition()}
              autoFocus
            />
            <Button color="primary" onClick={searchDefinition} disabled={loading}>
              {loading ? "..." : "Search"}
            </Button>
          </div>
          {searchHistory.length > 0 && (
            <div className="search-history">
              <small>Recent searches:</small>
              {searchHistory.map((term, idx) => (
                <Badge
                  key={idx}
                  color="light"
                  className="me-1 mt-1 cursor-pointer"
                  onClick={() => {
                    setSearchTerm(term)
                    searchDefinition()
                  }}
                >
                  {term}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="dictionary-content">
          {definition && !definition.error && (
            <div>
              <h6>{definition.word}</h6>
              <p className="phonetic">{definition.phonetic}</p>
              {definition.meanings?.map((meaning, idx) => (
                <div key={idx} className="meaning">
                  <strong>{meaning.partOfSpeech}</strong>
                  <ul>
                    {meaning.definitions?.slice(0, 3).map((def, defIdx) => (
                      <li key={defIdx}>{def.definition}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {definition?.error && <p className="text-muted">{definition.error}</p>}
        </div>
      </div>
    </div>
  )
}

// Countdown Timer Component
const CountdownTimer = ({ duration, onTimeUp, onSubmitShortcut }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeUp])

  // Add 'S' key shortcut when time is critical
  useEffect(() => {
    if (timeLeft <= 300) {
      // Last 5 minutes
      const handleSubmitShortcut = (e) => {
        if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          onSubmitShortcut()
        }
      }

      window.addEventListener("keydown", handleSubmitShortcut)
      return () => window.removeEventListener("keydown", handleSubmitShortcut)
    }
  }, [timeLeft, onSubmitShortcut])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressColor = () => {
    const percentage = (timeLeft / (duration * 60)) * 100
    if (percentage > 50) return "success"
    if (percentage > 25) return "warning"
    return "danger"
  }

  return (
    <div className="countdown-timer">
      <div className="timer-display">
        <FaClock className="me-2" />
        <span className={`time-text ${timeLeft < 300 ? "time-critical" : ""}`}>{formatTime(timeLeft)}</span>
        {timeLeft <= 300 && (
          <Badge color="danger" className="ms-2">
            Press Ctrl+S to submit
          </Badge>
        )}
      </div>
      <Progress value={(timeLeft / (duration * 60)) * 100} color={getProgressColor()} className="timer-progress" />
    </div>
  )
}

// Success Modal Component
const SubmissionSuccessModal = ({ isVisible, onClose }) => {
  if (!isVisible) return null

  return (
    <div className="success-overlay">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="success-card"
      >
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        <h3 className="success-title">Exam Submitted Successfully!</h3>
        <p className="success-message">
          Your answers have been recorded and submitted. You will be redirected to the dashboard shortly.
        </p>
        <div className="success-animation">
          <div className="checkmark">
            <div className="checkmark-circle"></div>
            <div className="checkmark-stem"></div>
            <div className="checkmark-kick"></div>
          </div>
        </div>
        <Button color="primary" onClick={onClose} className="success-btn">
          Continue to Dashboard
        </Button>
      </motion.div>
    </div>
  )
}

export default function TakeExam() {
  const navigate = useNavigate()
  const params = useParams()
  const { user } = useSelector((s) => s.auth)

  const [takeExam, setTakeExam] = useState({
    status: "examDetails",
    isEditted: false,
  })

  const [questions, setQuestions] = useState([])
  const [exam, setExam] = useState([])
  const [answers, setAnswers] = useState([])
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Tool states
  const [showCalculator, setShowCalculator] = useState(false)
  const [showDictionary, setShowDictionary] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Security states
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [isTabVisible, setIsTabVisible] = useState(true)

  const exam_id = params.id
  const limit = 1

  // Copy Protection
  useEffect(() => {
    const preventCopy = (e) => {
      e.preventDefault()
      toast.error("Copying is not allowed during the exam!")
      return false
    }

    const preventRightClick = (e) => {
      e.preventDefault()
      toast.warning("Right-click is disabled during the exam!")
      return false
    }

    const preventKeyboardShortcuts = (e) => {
      // Prevent common copy shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" || e.key === "a" || e.key === "v" || e.key === "x" || e.key === "s") &&
        takeExam.status === "exam"
      ) {
        // Allow our custom shortcuts
        if (e.key === "c" && showCalculator) return
        if (e.key === "d" && showDictionary) return
        if (e.key === "s") return // Allow submit shortcut

        e.preventDefault()
        toast.error("Keyboard shortcuts are restricted during the exam!")
        return false
      }

      // Prevent F12, Ctrl+Shift+I, etc.
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault()
        toast.error("Developer tools are not allowed during the exam!")
        return false
      }
    }

    if (takeExam.status === "exam") {
      document.addEventListener("copy", preventCopy)
      document.addEventListener("cut", preventCopy)
      document.addEventListener("contextmenu", preventRightClick)
      document.addEventListener("keydown", preventKeyboardShortcuts)
      document.addEventListener("selectstart", preventCopy)
      document.addEventListener("dragstart", preventCopy)

      return () => {
        document.removeEventListener("copy", preventCopy)
        document.removeEventListener("cut", preventCopy)
        document.removeEventListener("contextmenu", preventRightClick)
        document.removeEventListener("keydown", preventKeyboardShortcuts)
        document.removeEventListener("selectstart", preventCopy)
        document.removeEventListener("dragstart", preventCopy)
      }
    }
  }, [takeExam.status, showCalculator, showDictionary])

  // Tab Visibility Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (takeExam.status !== "exam") return

      if (document.hidden) {
        setIsTabVisible(false)
        setTabSwitchCount((prev) => prev + 1)
        toast.warning(`Tab switch detected! Count: ${tabSwitchCount + 1}`)
      } else {
        setIsTabVisible(true)
        // Auto-advance to next question when returning to tab
        if (tabSwitchCount > 0) {
          setTimeout(() => {
            handleNextPage()
            toast.info("Automatically moved to next question due to tab switch")
          }, 1000)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [takeExam.status, tabSwitchCount])

  // Enhanced Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (takeExam.status !== "exam") return

      // Don't interfere with calculator or dictionary shortcuts
      if (showCalculator || showDictionary) return

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "arrowright":
          case "n":
            e.preventDefault()
            handleNextPage()
            break
          case "arrowleft":
          case "p":
            e.preventDefault()
            handlePrevPage()
            break
          case "c":
            e.preventDefault()
            setShowCalculator(!showCalculator)
            break
          case "d":
            e.preventDefault()
            setShowDictionary(!showDictionary)
            break
          case "h":
            e.preventDefault()
            setShowShortcuts(!showShortcuts)
            break
          case "s":
            e.preventDefault()
            handleSubmitShortcut()
            break
        }
      }

      // Number keys for quick option selection (1-6 for A-F)
      if (e.key >= "1" && e.key <= "6" && !e.ctrlKey && !e.metaKey) {
        const currentQuestion = paginationList[0]
        if (currentQuestion && currentQuestion.question_type === "Multiple Choice") {
          const options_json = currentQuestion.options_json ? JSON.parse(currentQuestion.options_json) : []
          const optionIndex = Number.parseInt(e.key) - 1
          if (options_json[optionIndex]) {
            handleAnswer({
              ...currentQuestion,
              response: options_json[optionIndex].value,
              selected_option: getAlpha(optionIndex),
            })
            toast.success(`Selected option ${e.key}`)
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [takeExam.status, showCalculator, showDictionary, showShortcuts])

  // Fetch exam data
  const getReg = useCallback(() => {
    setLoading(true)
    _get(`exam-questions?query_type=select&exam_id=${exam_id}`, (resp) => {
      if (resp.success) {
        let questionsData = []
        
        // Handle different response formats
        if (resp.data && Array.isArray(resp.data)) {
          // Enhanced API format: { success: true, data: [...] }
          if (resp.data[0]?.result && Array.isArray(resp.data[0].result)) {
            questionsData = resp.data[0].result
          } else if (Array.isArray(resp.data) && resp.data.length > 0 && resp.data[0].id) {
            // Direct array of questions
            questionsData = resp.data
          }
        }
        
        if (questionsData.length > 0) {
          // CRITICAL: Never shuffle options - they must stay in original order
          // Options are already in correct order from backend (sorted by option_order)
          // Only shuffle questions if needed (this is handled by backend now)
          
          // Ensure options are in correct order (by option_order)
          questionsData = questionsData.map(question => {
            if (question.options && Array.isArray(question.options)) {
              // Sort options by option_order to maintain original order
              question.options = question.options.sort((a, b) => {
                const orderA = a.option_order !== undefined && a.option_order !== null ? a.option_order : 999
                const orderB = b.option_order !== undefined && b.option_order !== null ? b.option_order : 999
                return orderA - orderB
              })
            }
            // Handle options_json format (legacy)
            if (question.options_json && typeof question.options_json === 'string') {
              try {
                const parsed = JSON.parse(question.options_json)
                if (Array.isArray(parsed)) {
                  // Ensure options_json is also in correct order
                  question.options_json = JSON.stringify(parsed.sort((a, b) => {
                    // If options have order info, use it; otherwise maintain array order
                    return 0 // Don't shuffle - maintain original order
                  }))
                }
              } catch (e) {
                console.warn('Error parsing options_json:', e)
              }
            }
            return question
          })
          
          setQuestions(questionsData)
        }
      }
      setLoading(false)
    })
  }, [exam_id])

  useEffect(() => {
    if (questions && questions.length) {
      _get(`examinations?query_type=by_id&id=${exam_id}`, (resp) => {
        if (resp.success && resp.data && resp.data.length) {
          setExam(resp.data)
        }
      })
    }
  }, [questions, exam_id])

  useEffect(() => {
    getReg()
  }, [getReg])

  const paginationList = questions.slice((page - 1) * limit, page * limit)

  const handleNextPage = () => {
    if (page < Math.ceil(questions.length / limit)) {
      setPage((prevPage) => prevPage + 1)
    }
  }

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1))
  }

  const handleAnswer = ({ id, question_text, response, selected_option = null, attachment_url = null }) => {
    const updatedAnswers = answers.filter((ans) => ans.id !== id)
    const newAnswer = {
      exam_id,
      id,
      class_name: exam[0]?.class_name,
      class_code: exam[0]?.class_code,
      question_text,
      response,
      selected_option,
      page,
      admission_no: user.admission_no,
      subject_name: exam[0]?.subject_name,
      subject_code: exam[0]?.subject_code,
      attachment_url,
    }

    updatedAnswers.push(newAnswer)
    setAnswers(updatedAnswers)
  }

  const handleSubmit = () => {
    setLoading(true)
    const responses = answers.map((x) => ({
      ...x,
      query_type: "insert",
      question_id: x.id,
    }))

    _post(
      "exam-responses",
      responses,
      (resp) => {
        if (resp.success) {
          setLoading(false)
          setShowSuccessModal(true)
          setTimeout(() => {
            navigate("/exams")
          }, 3000)
        }
      },
      () => {
        setLoading(false)
        toast.error("Error submitting exam")
        setModal(false)
      },
    )
  }

  const handleTimeUp = () => {
    toast.warning("Time's up! Submitting your exam automatically.")
    handleSubmit()
  }

  const handleSubmitShortcut = () => {
    setTakeExam((prev) => ({ ...prev, status: "finishedExam" }))
  }

const getExamDuration = () => {
  if (!exam[0]) return 60;

  const start = moment(exam[0].start_time, "hh:mm A");
  const end = moment(exam[0].end_time, "hh:mm A");

  const duration = moment.duration(end.diff(start));
  let minutes = duration.asMinutes();

  // Handle negative duration (end is on next day)
  if (minutes < 0) {
    minutes += 1440; // add 24 hours worth of minutes
  }

  return minutes;
};

  const getAnsweredCount = () => {
    return answers.length
  }

  const getProgressPercentage = () => {
    return (getAnsweredCount() / questions.length) * 100
  }

  return (
    <div className="take-exam-container no-select">
      {/* Tab Switch Warning */}
      {!isTabVisible && takeExam.status === "exam" && (
        <div className="tab-warning">
          <FaEyeSlash className="me-2" />
          Please return to the exam tab. Tab switches are being monitored.
        </div>
      )}

      {/* Security Notice */}
      {takeExam.status === "exam" && tabSwitchCount > 0 && (
        <Alert color="warning" className="security-alert">
          <FaExclamationTriangle className="me-2" />
          Warning: {tabSwitchCount} tab switch(es) detected. Excessive tab switching may result in exam termination.
        </Alert>
      )}

      {/* Exam Details/Rules Screen */}
      {takeExam.status === "examDetails" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="exam-details-screen">
          <Card className="exam-details-card">
            <CardBody>
              <div className="text-center mb-4">
                <h2 className="exam-details-title">
                  <FaQuestionCircle className="me-2" />
                  Exam Instructions & Rules
                </h2>
                <p className="exam-details-subtitle">Please read carefully before starting your exam</p>
              </div>

              {exam.map((item, id) => (
                <div key={id}>
                  <Card className="exam-info-card mb-4">
                    <CardBody>
                      <h4 className="section-title">
                        <FaBook className="me-2" />
                        Exam Details
                      </h4>
                      <Row>
                        <Col md={6}>
                          <div className="exam-detail-item">
                            <strong>Subject:</strong> {item.subject_name}
                          </div>
                          <div className="exam-detail-item">
                            <strong>Assessment Type:</strong> {item.assessment_type}
                          </div>
                          <div className="exam-detail-item">
                            <strong>Class:</strong> {item.class_name}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="exam-detail-item">
                            <strong>Total Questions:</strong> {questions.length}
                          </div>
                          <div className="exam-detail-item">
                            <strong>Total Marks:</strong> {item.total_marks} marks
                          </div>
                          <div className="exam-detail-item">
                            <strong>Duration:</strong> {formatDuration(getExamDuration())}
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>

                  <Card className="rules-card mb-4">
                    <CardBody>
                      <h4 className="section-title">
                        <FaExclamationTriangle className="me-2" />
                        Important Rules & Guidelines
                      </h4>

                      <div className="rules-section">
                        <h5 className="rules-subtitle">Security Rules:</h5>
                        <ul className="rules-list">
                          <li>
                            <strong>No copying or pasting</strong> - Text selection and copying are disabled
                          </li>
                          <li>
                            <strong>No tab switching</strong> - Switching tabs will automatically advance to the next
                            question
                          </li>
                          <li>
                            <strong>No right-click</strong> - Context menu is disabled during the exam
                          </li>
                          <li>
                            <strong>No developer tools</strong> - Browser developer tools are blocked
                          </li>
                          <li>Tab switches are monitored and recorded</li>
                        </ul>
                      </div>

                      <div className="rules-section">
                        <h5 className="rules-subtitle">General Rules:</h5>
                        <ul className="rules-list">
                          <li>Each question carries different marks as indicated</li>
                          <li>You must answer all questions to complete the exam</li>
                          <li>The exam will auto-submit when time expires</li>
                          <li>Do not refresh or close the browser during the exam</li>
                          <li>Ensure stable internet connection throughout</li>
                          <li>Your answers are automatically saved as you progress</li>
                        </ul>
                      </div>

                      <div className="rules-section">
                        <h5 className="rules-subtitle">Available Tools:</h5>
                        <ul className="rules-list">
                          <li>Built-in calculator with keyboard support</li>
                          <li>Dictionary with search history</li>
                          <li>File upload option for essay questions</li>
                          <li>Review screen to check all your answers before submission</li>
                        </ul>
                      </div>

                      <div className="rules-section">
                        <h5 className="rules-subtitle">Keyboard Shortcuts:</h5>
                        <ul className="rules-list">
                          <li>
                            <kbd>Ctrl + →</kbd> or <kbd>Ctrl + N</kbd> - Next question
                          </li>
                          <li>
                            <kbd>Ctrl + ←</kbd> or <kbd>Ctrl + P</kbd> - Previous question
                          </li>
                          <li>
                            <kbd>Ctrl + C</kbd> - Toggle calculator
                          </li>
                          <li>
                            <kbd>Ctrl + D</kbd> - Toggle dictionary
                          </li>
                          <li>
                            <kbd>Ctrl + S</kbd> - Quick submit (when time is critical)
                          </li>
                          <li>
                            <kbd>1-4</kbd> - Quick select options A-D for multiple choice
                          </li>
                          <li>
                            <kbd>Ctrl + H</kbd> - Show shortcuts help
                          </li>
                        </ul>
                      </div>

                      <Alert color="danger" className="mt-3">
                        <strong>Security Notice:</strong> This exam is monitored for security violations. Any attempt to
                        cheat or circumvent security measures will be recorded and may result in exam termination.
                      </Alert>
                    </CardBody>
                  </Card>
                </div>
              ))}

              <div className="text-center">
                <Button
                  color="primary"
                  size="lg"
                  className="start-exam-btn"
                  onClick={() => {
                    setTakeExam((prev) => ({
                      ...prev,
                      status: "exam",
                      isEditted: false,
                    }))
                  }}
                >
                  <FaCheck className="me-2" />
                  Start Exam
                </Button>
                <p className="mt-3 good-luck-text">
                  <strong>Best of Luck! 🍀</strong>
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Main Exam Screen */}
      {takeExam.status === "exam" && (
        <div className="exam-screen">
          {/* Exam Header */}
          <div className="exam-header">
            <Row className="align-items-center">
              <Col md={3}>
                <div className="question-counter">
                  <span className="current-question">Question {page}</span>
                  <span className="total-questions">of {questions.length}</span>
                  {tabSwitchCount > 0 && (
                    <Badge color="warning" className="mt-1">
                      Tab switches: {tabSwitchCount}
                    </Badge>
                  )}
                </div>
              </Col>
              <Col md={6} className="text-center">
                <CountdownTimer
                  duration={getExamDuration()}
                  onTimeUp={handleTimeUp}
                  onSubmitShortcut={handleSubmitShortcut}
                />
              </Col>
              <Col md={3} className="text-end">
                <div className="exam-tools">
                  <Button
                    size="sm"
                    color="light"
                    className="tool-btn me-2"
                    onClick={() => setShowCalculator(!showCalculator)}
                    title="Calculator (Ctrl+C)"
                  >
                    <FaCalculator />
                  </Button>
                  <Button
                    size="sm"
                    color="light"
                    className="tool-btn me-2"
                    onClick={() => setShowDictionary(!showDictionary)}
                    title="Dictionary (Ctrl+D)"
                  >
                    <FaBook />
                  </Button>
                  <Button
                    size="sm"
                    color="light"
                    className="tool-btn"
                    onClick={() => setShowShortcuts(!showShortcuts)}
                    title="Shortcuts (Ctrl+H)"
                  >
                    <FaKeyboard />
                  </Button>
                </div>
              </Col>
            </Row>

            {/* Progress Bar */}
            <div className="progress-section mt-3">
              <div className="d-flex justify-content-between mb-2">
                <span>
                  Progress: {getAnsweredCount()}/{questions.length} answered
                </span>
                <span>{Math.round(getProgressPercentage())}% complete</span>
              </div>
              <Progress value={getProgressPercentage()} color="primary" />
            </div>
          </div>

          {/* Question Content */}
          <div className="question-content">
            {paginationList.map((question, index) => {
              const options_json = question.options_json ? JSON.parse(question.options_json) : []
              const answer = answers.find((ans) => ans.id === question.id)

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="question-card-container"
                >
                  <Card className="question-card">
                    <CardBody>
                      <div className="question-header">
                        <h4 className="question-text no-select">{question.question_text}</h4>
                        <Badge color="primary" className="marks-badge">
                          {question.marks} marks
                        </Badge>
                      </div>

                      {question.attachment_url && (
                        <div className="question-image mb-3">
                          <img
                            src={question.attachment_url || "/placeholder.svg"}
                            alt="Question attachment"
                            className="img-fluid question-attachment no-select"
                            draggable="false"
                          />
                        </div>
                      )}

                      <div className="answer-section">
                        {/* Multiple Choice */}
                        {question.question_type === "Multiple Choice" && (
                          <div className="">
                            <div className="quick-select-hint">
                              <small className="text-muted">
                                Quick select: Press 1-{options_json.length} for options A-{getAlpha(options_json.length)}
                              </small>
                            </div>
                            <div className="options-grid">
                              {question.is_multi_responses ? (
                                options_json.map((option, idx) => (
                                  <div key={idx} className="option-item">
                                    <label className="option-label">
                                      <input
                                        type="checkbox"
                                        name={`question_${question.id}`}
                                        value={option.value}
                                        checked={
                                          Array.isArray(answer?.response) && answer.response.includes(option.value)
                                        }
                                        onChange={(e) => {
                                          const currentAnswers = Array.isArray(answer?.response)
                                            ? [...answer.response]
                                            : [];
                                          const updatedAnswers = e.target.checked
                                            ? [...currentAnswers, option.value]
                                            : currentAnswers.filter((val) => val !== option.value);

                                          handleAnswer({
                                            ...question,
                                            response: updatedAnswers,
                                          });
                                        }}
                                        className="option-input"
                                      />
                                      <span className="option-marker">
                                        {getAlpha(idx)}. <kbd>{idx + 1}</kbd>
                                      </span>
                                      <span className="option-text no-select">{option.value}</span>
                                      <div className="text-muted mt-1 ms-4 small">
                                        <span>Available: {option.marks || 0} mark(s)</span>
                                        {option.earned !== undefined && (
                                          <> | Earned: {option.earned} mark(s)</>
                                        )}
                                      </div>
                                    </label>
                                  </div>
                                ))
                              ) : (
                                options_json.map((option, idx) => (
                                  <div key={idx} className="option-item">
                                    <label className="option-label">
                                      <input
                                        type="radio"
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
                                        className="option-input"
                                      />
                                      <span className="option-marker">
                                        {getAlpha(idx)}. <kbd>{idx + 1}</kbd>
                                      </span>
                                      <span className="option-text no-select">{option.value}</span>
                                      <div className="text-muted mt-1 ms-4 small">
                                        <span>Available: {option.marks || 0} mark(s)</span>
                                        {option.earned !== undefined && (
                                          <> | Earned: {option.earned} mark(s)</>
                                        )}
                                      </div>
                                    </label>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* True/False */}
                        {question.question_type === "True/False" && (
                          <div className="true-false-options">
                            {["True", "False"].map((val, idx) => (
                              <div key={idx} className="option-item">
                                <label className="option-label">
                                  <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={val}
                                    checked={answer?.response === val}
                                    onChange={() => handleAnswer({ ...question, response: val })}
                                    className="option-input"
                                  />
                                  <span className="option-text no-select">{val}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Short Answer / Fill in the Blank */}
                        {["Short Answer", "Fill in the Blanks"].includes(question.question_type) && (
                          <div className="text-answer-section">
                            <label className="answer-label">Your Answer:</label>
                            <input
                              type="text"
                              className="form-control answer-input"
                              placeholder="Type your answer here..."
                              value={answer?.response || ""}
                              onChange={(e) => handleAnswer({ ...question, response: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Essay */}
                        {question.question_type === "Essay" && (
                          <div className="essay-answer-section">
                            <label className="answer-label">Your Answer:</label>
                            <textarea
                              className="form-control answer-textarea"
                              rows={6}
                              placeholder="Write your essay here..."
                              value={answer?.response || ""}
                              onChange={(e) =>
                                handleAnswer({
                                  ...question,
                                  response: e.target.value,
                                })
                              }
                            />

                            <div className="file-upload-section mt-3">
                              <label className="file-upload-label">
                                <FaFileUpload className="me-2" />
                                Attach a file (optional):
                              </label>
                              <input
                                type="file"
                                className="form-control"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                                onChange={(e) => {
                                  console.log("File selected:", e.target.files[0])
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="exam-navigation">
            <Row>
              <Col md={4}>
                <Button color="secondary" onClick={handlePrevPage} disabled={page === 1} className="nav-btn">
                  <FaArrowLeft className="me-2" />
                  Previous
                </Button>
              </Col>
              <Col md={4} className="text-center">
                <Button
                  color="success"
                  onClick={() => setTakeExam((prev) => ({ ...prev, status: "finishedExam" }))}
                  className="review-btn"
                >
                  Review Answers
                </Button>
              </Col>
              <Col md={4} className="text-end">
                {page < questions.length ? (
                  <Button color="primary" onClick={handleNextPage} className="nav-btn">
                    Next
                    <FaArrowRight className="ms-2" />
                  </Button>
                ) : (
                  <Button
                    color="warning"
                    onClick={() => setTakeExam((prev) => ({ ...prev, status: "finishedExam" }))}
                    className="nav-btn"
                  >
                    Finish Exam
                  </Button>
                )}
              </Col>
            </Row>
          </div>
        </div>
      )}

      {/* Review Screen */}
      {takeExam.status === "finishedExam" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="review-screen">
          <Card className="review-card">
            <CardBody>
              <h3 className="review-title">Review Your Answers</h3>
              <p className="review-subtitle">Please review your answers before final submission</p>

              <div className="review-summary mb-4">
                <Row>
                  <Col md={3}>
                    <div className="summary-item">
                      <strong>Total Questions:</strong> {questions.length}
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="summary-item">
                      <strong>Answered:</strong> {getAnsweredCount()}
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="summary-item">
                      <strong>Unanswered:</strong> {questions.length - getAnsweredCount()}
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="summary-item">
                      <strong>Tab Switches:</strong> {tabSwitchCount}
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="answers-review">
                {questions.map((question, index) => {
                  const answer = answers.find((ans) => ans.id === question.id)
                  return (
                    <div key={question.id} className="review-item">
                      <div className="review-question">
                        <strong>Q{index + 1}:</strong> {question.question_text}
                      </div>
                      <div className="review-answer">
                        {answer ? (
                          <span className="answered">
                            <FaCheck className="text-success me-2" />
                            {answer.selected_option && `${answer.selected_option}. `}
                            {answer.response}
                          </span>
                        ) : (
                          <span className="unanswered">
                            <FaTimes className="text-danger me-2" />
                            Not answered
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="review-actions">
                <Button
                  color="secondary"
                  onClick={() => setTakeExam((prev) => ({ ...prev, status: "exam" }))}
                  className="me-3"
                >
                  Go Back to Exam
                </Button>
                <Popconfirm
                  title="Submit Exam"
                  description="Are you sure you want to submit your exam? This action cannot be undone."
                  onConfirm={handleSubmit}
                  okText="Yes, Submit"
                  cancelText="Cancel"
                >
                  <Button color="success" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Exam"}
                  </Button>
                </Popconfirm>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Tools */}
      <Calculator isVisible={showCalculator} onClose={() => setShowCalculator(false)} />
      <Dictionary isVisible={showDictionary} onClose={() => setShowDictionary(false)} />

      {/* Success Modal */}
      <SubmissionSuccessModal
        isVisible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          navigate("/exams")
        }}
      />

      {/* Enhanced Shortcuts Modal */}
      <Modal isOpen={showShortcuts} toggle={() => setShowShortcuts(false)} centered size="lg">
        <ModalHeader toggle={() => setShowShortcuts(false)}>Keyboard Shortcuts & Quick Actions</ModalHeader>
        <ModalBody>
          <Row>
            <Col md={6}>
              <h5>Navigation</h5>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <kbd>Ctrl + →</kbd> or <kbd>Ctrl + N</kbd>
                  <span>Next question</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl + ←</kbd> or <kbd>Ctrl + P</kbd>
                  <span>Previous question</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl + S</kbd>
                  <span>Quick submit (when time critical)</span>
                </div>
              </div>

              <h5 className="mt-4">Tools</h5>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <kbd>Ctrl + C</kbd>
                  <span>Toggle calculator</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl + D</kbd>
                  <span>Toggle dictionary</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl + H</kbd>
                  <span>Show this help</span>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <h5>Quick Selection</h5>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <kbd>1</kbd>
                  <span>Select option A</span>
                </div>
                <div className="shortcut-item">
                  <kbd>2</kbd>
                  <span>Select option B</span>
                </div>
                <div className="shortcut-item">
                  <kbd>3</kbd>
                  <span>Select option C</span>
                </div>
                <div className="shortcut-item">
                  <kbd>4</kbd>
                  <span>Select option D</span>
                </div>
              </div>

              <h5 className="mt-4">Calculator (when open)</h5>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <kbd>0-9</kbd>
                  <span>Number input</span>
                </div>
                <div className="shortcut-item">
                  <kbd>+ - * /</kbd>
                  <span>Operations</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Enter</kbd>
                  <span>Calculate result</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Esc</kbd>
                  <span>Clear all</span>
                </div>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </div>
  )
}
