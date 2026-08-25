import React, { useCallback, useEffect, useState } from "react";
import { _get, _post } from "../../Helper";
import Datatable from "../../core/common/dataTable/index.tsx";
import {
  Button,
  Input,
  message,
  Popconfirm,
  DatePicker,
  Tabs,
  TimePicker,
  Row,
  Col,
  Form,
} from "antd";
import { Container, Spinner } from "reactstrap";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ExamsManager = () => {
  const { selected_branch } = useSelector((s) => s.auth);
  const [examList, setExamList] = useState([]);
  const [ApprovedList, setApprovedList] = useState([]);
  const [RejectedList, setRejectedList] = useState([]);
  const [ReleasedList, setReleasedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("Pending");
  const navigate = useNavigate();

  const handleChangeComment = ({ target: { value } }) => setComment(value);

  const getExams = useCallback(
    (status) => {
      if (selected_branch?.branch_id) {
        setLoading(true);
        _get(
          `examinations?query_type=select&status=${status}&branch_id=${selected_branch.branch_id}`,
          (resp) => {
            setLoading(false);
            if (resp.success && resp.data) {
              if (status === "Pending") setExamList(resp.data);
              else if (status === "Approved") setApprovedList(resp.data);
              else if (status === "Rejected") setRejectedList(resp.data);
              else if (status === "Released") setReleasedList(resp.data);
            }
          },
          () => {
            setLoading(false);
            message.error("No record found.");
            if (status === "Pending") setExamList([]);
            else if (status === "Approved") setApprovedList([]);
            else if (status === "Rejected") setRejectedList([]);
            else if (status === "Released") setReleasedList([]);
          }
        );
      }
    },
    [selected_branch?.branch_id]
  );

  useEffect(() => {
    getExams("Pending");
    getExams("Approved");
    getExams("Rejected");
    getExams("Released");
  }, [getExams]);

  const handleUpdate = () => {
    if (!selectedExam) return;
    _post(
      "examinations",
      selectedExam,
      (res) => {
        if (res.success) {
          getExams("Pending");
          getExams("Approved");
          getExams("Rejected");
          getExams("Released");
          setSelectedExam(null);
          setComment("");
        }
      },
      () => {
        message.error("Operation failed");
      }
    );
  };
  const handleReleased = (exam_id) => {
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
          getExams("Pending");
          getExams("Approved");
          getExams("Rejected");
          getExams("Released");
        }
      }
    );
  };

  const canRejectExam = (commence_date) =>
    dayjs(commence_date).isAfter(dayjs(), "day");

  const renderActionButtons = (_record) => (
    <div className="d-flex gap-2">
      <Popconfirm
        title="Are you sure you want to approve this exam?"
        onConfirm={handleUpdate}
        okText="Yes"
        cancelText="No"
      >
        <Button
          className="border-success text-success outline"
          size="xs"
          style={{ fontSize: "12px", padding: "4px 8px" }}
          onClick={() =>
            setSelectedExam({
              ..._record,
              query_type: "update",
              status: "Approved",
            })
          }
        >
          Approve
        </Button>
      </Popconfirm>

      <Popconfirm
        title={
          <div>
            <p>Are you sure you want to reject this exam?</p>
            <Input
              value={comment}
              onChange={handleChangeComment}
              placeholder="Enter Comment"
            />
          </div>
        }
        onConfirm={handleUpdate}
        okText="Yes"
        cancelText="No"
      >
        <Button
          danger
          size="xs"
          style={{ fontSize: "12px", padding: "4px 8px" }}
          onClick={() =>
            setSelectedExam({
              ..._record,
              query_type: "update",
              status: "Rejected",
            })
          }
        >
          Reject
        </Button>
      </Popconfirm>

      <Popconfirm
        title={
          <div style={{ maxWidth: 400 }}>
            <h4 style={{ marginBottom: 10 }}>Update Exam Schedule</h4>

            <Row gutter={[16, 8]}>
              <Col span={24}>
                <label style={{ fontWeight: 500 }}>Commencement Date</label>
                <DatePicker
                  style={{ width: "100%" }}
                  defaultValue={dayjs(_record.commence_date)}
                  onChange={(date, dateString) => {
                    setSelectedExam((prev) => ({
                      ...prev,
                      commence_date: dateString,
                      query_type: "update",
                    }));
                  }}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: 500 }}>Start Time</label>
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  placeholder="Select Start Time"
                  defaultValue={
                    _record.start_time &&
                    dayjs(_record.start_time, "HH:mm").isValid()
                      ? dayjs(_record.start_time, "HH:mm")
                      : null
                  }
                  onChange={(time) => {
                    setSelectedExam((prev) => ({
                      ...prev,
                      start_time: time ? time.format("HH:mm") : "",
                      query_type: "update",
                    }));
                  }}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: 500 }}>End Time</label>
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  placeholder="Select End Time"
                  defaultValue={
                    _record.end_time &&
                    dayjs(_record.end_time, "HH:mm").isValid()
                      ? dayjs(_record.end_time, "HH:mm")
                      : null
                  }
                  onChange={(time) => {
                    setSelectedExam((prev) => ({
                      ...prev,
                      end_time: time ? time.format("HH:mm") : "",
                      query_type: "update",
                    }));
                  }}
                />
              </Col>
            </Row>
          </div>
        }
        onConfirm={handleUpdate}
        okText="Save"
        cancelText="Cancel"
      >
        <Button
          type="primary"
          outline
          size="xs"
          style={{ fontSize: "12px", padding: "4px 8px" }}
        >
          Change Schedule
        </Button>
      </Popconfirm>
    </div>
  );

  const renderReleasedButton = (_record) => {
    return (
      <Popconfirm
        title="Are you sure you want to release this exam?"
        onConfirm={handleReleased}
        okText="Yes"
        cancelText="No"
      >
        <Button
          color="primary"
          size="sm"
          className="btn-gradient-primary"
          onClick={() => {
            navigate(`/examresults/${_record.id}`);
          }}
        >
          <FaEye className="me-1" />
          View Results
        </Button>
      </Popconfirm>
    );
  };

  const renderRejectButtonForApproved = (_record) => {
    const canReject = canRejectExam(_record.commence_date);

    return canReject ? (
      <Popconfirm
        title={
          <div style={{ maxWidth: 400 }}>
            <h4 style={{ marginBottom: 10 }}>Update Exam Schedule</h4>

            <Row gutter={[16, 8]}>
              <Col span={24}>
                <label style={{ fontWeight: 500 }}>Commencement Date</label>
                <DatePicker
                  style={{ width: "100%" }}
                  defaultValue={dayjs(_record.commence_date)}
                  onChange={(date, dateString) => {
                    setSelectedExam((prev) => ({
                      ...prev,
                      commence_date: dateString,
                      query_type: "update",
                    }));
                  }}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: 500 }}>Start Time</label>
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  placeholder="Select Start Time"
                  defaultValue={
                    _record.start_time &&
                    dayjs(_record.start_time, "HH:mm").isValid()
                      ? dayjs(_record.start_time, "HH:mm")
                      : null
                  }
                  onChange={(time) => {
                    setSelectedExam((prev) => ({
                      ...prev,
                      start_time: time ? time.format("HH:mm") : "",
                      query_type: "update",
                    }));
                  }}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: 500 }}>End Time</label>
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  placeholder="Select End Time"
                  defaultValue={
                    _record.end_time &&
                    dayjs(_record.end_time, "HH:mm").isValid()
                      ? dayjs(_record.end_time, "HH:mm")
                      : null
                  }
                  onChange={(time) => {
                    setSelectedExam((prev) => ({
                      ...prev,
                      end_time: time ? time.format("HH:mm") : "",
                      query_type: "update",
                    }));
                  }}
                />
              </Col>
            </Row>
          </div>
        }
        onConfirm={handleUpdate}
        okText="Save"
        cancelText="Cancel"
      >
        <Button
          type="default"
          size="xs"
          style={{ fontSize: "12px", padding: "4px 8px" }}
        >
          Change Date/Time
        </Button>
      </Popconfirm>
    ) : (
      <Button
        color="success"
        className="float-end"
        onClick={() => handleReleased(_record.id)}
      >
        Release Results
      </Button>
    );
  };

  const examTable = (tabType = "Pending") => {
    const showActions = tabType !== "Rejected";
    return [
      {
        title: "#",
        dataIndex: "id",
        key: "id",
        render: (_text, _record, index) => <span>{index + 1}</span>,
      },
      {
        title: "Assessment Type",
        dataIndex: "assessment_type",
      },
      {
        title: "Class",
        dataIndex: "class_name",
      },
      {
        title: "Subject",
        dataIndex: "subject_name",
      },
      {
        title: "Commence Date",
        dataIndex: "commence_date",
        render: (date, _record, index) => (
          <div>
            {" "}
            <strong>{dayjs(date).format("DD/MM/YYYY")}</strong> (From:{" "}
            {_record.start_time} To: {_record.end_time})
          </div>
        ),
      },
      {
        title: "Total Marks",
        dataIndex: "total_marks",
      },
      {
        title: "Total Questions",
        dataIndex: "total_questions",
      },
      {
        title: "Status",
        dataIndex: "status",
      },
      ...(showActions
        ? [
            {
              title: "Action",
              key: "action",
              render: (_text, _record) =>
                tabType === "Pending"
                  ? renderActionButtons(_record)
                  : tabType === "Released"
                  ? renderReleasedButton(_record)
                  : renderRejectButtonForApproved(_record),
            },
          ]
        : []),
    ];
  };

  return (
    <div className="elite-admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header ">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="dashboard-title mb-5">Exams Management</h2>
        </motion.div>
      </div>

      <Container className="dashboard-container mt-5">
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <Spinner animation="border" />
            </div>
            <div className="mt-3">Loading exams...</div>
          </div>
        )}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "Pending",
              label: "⏳ Pending Approval",
              children: (
                <Datatable
                  columns={examTable("Pending")}
                  dataSource={examList}
                  size="sm"
                  title="Pending Approval Exams"
                />
              ),
            },
            {
              key: "Approved",
              label: "✅ Approved Exams",
              children: (
                <Datatable
                  columns={examTable("Approved")}
                  dataSource={ApprovedList}
                  size="sm"
                  title="Approved Exams"
                />
              ),
            },
            {
              key: "Rejected",
              label: "❌ Rejected Exams",
              children: (
                <Datatable
                  columns={examTable("Rejected")}
                  dataSource={RejectedList}
                  size="sm"
                  title="Rejected Exams"
                />
              ),
            },
            {
              key: "Released",
              label: "✅ Released Exams",
              children: (
                <Datatable
                  columns={examTable("Released")}
                  dataSource={ReleasedList}
                  size="sm"
                  title="Released Exams"
                />
              ),
            },
          ]}
        />
      </Container>
    </div>
  );
};

export default ExamsManager;
