import React, { useCallback, useEffect, useState } from "react";
import { Button, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { _get, _post } from "../../Helper";
import { toast } from "react-hot-toast";
import { CreateExam } from "../dashboard/TeachersDashboard";
import Datatable from "../../core/common/dataTable/index.tsx";
import { message, Popconfirm } from "antd";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Tabs } from "antd";

export default function TeachersExam() {
  const { selected_branch } = useSelector((s) => s.auth);
  const [draftExams, setDraftExams] = useState([]);
  const [pendingExams, setPendingExams] = useState([]);
  const [approvedExams, setApprovedExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Draft");
  const [selectedExam, setSelectedExam] = useState(null);
  const [comment, setComment] = useState("");
  const handleChangeComment = ({ target: { value } }) => {
    setComment(value);
  };
  const [modal, setModal] = useState({ isOpen: false, type: null });

  const fetchExams = useCallback(
    (status) => {
      if (!selected_branch?.branch_id) return;
      setLoading(true);
      _get(
        `examinations?query_type=select&status=${status}&branch_id=${selected_branch.branch_id}`,
        (resp) => {
          if (resp.success && resp.data) {
            if (status === "Draft") setDraftExams(resp.data);
            else if (status === "Pending") setPendingExams(resp.data);
            else if (status === "Approved") setApprovedExams(resp.data);
          } else {
            if (status === "Draft") setDraftExams([]);
            else if (status === "Pending") setPendingExams([]);
            message.warning(`No ${status} exams found`);
          }
          setLoading(false);
        },
        () => {
          setLoading(false);
          message.error(`Failed to fetch ${status} exams`);
        }
      );
    },
    [selected_branch?.branch_id]
  );
  useEffect(() => {
    fetchExams("Draft");
    fetchExams("Pending");
    fetchExams("Approved");
  }, [fetchExams]);
  const handleUpdate = () => {
    _post(
      "examinations",
      selectedExam,
      (res) => {
        if (res.success) {
          fetchExams("Draft");
          fetchExams("Pending");
          fetchExams("Approved");
        }
      },
      (err) => {
        message.error("No Pending Exams");
      }
    );
  };
  const navigate = useNavigate();
  const examTable = [
    {
      title: "S/N",
      custom: true,
      render: (text, item, idx) => <strong>{idx + 1}</strong>,
    },
    { title: "Assessment Type", dataIndex: "assessment_type" },
    { title: "Date", dataIndex: "commence_date" },
    { title: "Total Marks", dataIndex: "total_marks" },
    { title: "Total Questions", dataIndex: "total_questions" },
    {
      title: "Action",
      custom: true,
      render: (text, exam, idx) => (
        <div className="d-flex gap-2 text-end">
          <Button
            color="success"
            size="xs"
            style={{ fontSize: "12px", padding: "4px 8px" }}
            onClick={() => navigate(`/managequestion/${exam.id}`)}
          >
            Manage Questions
          </Button>

          {exam.status !== "Draft" && (
            <Popconfirm
              title={
                <div>
                  <p>Are you sure you want to Discard this Exam?</p>
                  <Input
                    value={comment}
                    onChange={handleChangeComment}
                    placeholder="Please Tell Reason."
                  />
                </div>
              }
              onConfirm={() => handleUpdate()}
              okText="Yes"
              cancelText="No"
            >
              <Button
                color="danger"
                size="xs"
                style={{ fontSize: "12px", padding: "4px 8px" }}
                onClick={() => {
                  setSelectedExam({
                    ...exam,
                    query_type: "update",
                    status: "Draft",
                  });
                }}
              >
                Discard
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];
  const approvedExamTable = [
    {
      title: "S/N",
      custom: true,
      render: (text, item, idx) => <strong>{idx + 1}</strong>,
    },
    { title: "Assessment Type", dataIndex: "assessment_type" },
    { title: "Date", dataIndex: "commence_date" },
    { title: "Total Marks", dataIndex: "total_marks" },
    { title: "Total Questions", dataIndex: "total_questions" },
    {
      title: "Action",
      custom: true,
      render: (text, exam, idx) => (
        <div className="d-flex gap-2 text-end">
          <Button
            color="info"
            size="xs"
            style={{ fontSize: "12px", padding: "4px 8px" }}
            onClick={() => navigate(`/managequestion/${exam.id}`)}
          >
            View Questions
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="row m-0 p-3 mb-5">
        <div className="dashboard-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="dashboard-title mb-5">Created Exams</h2>
          </motion.div>
        </div>
      </div>
      <div className="p-3 mt-3">
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <Tabs.TabPane tab="📝 Draft" key="Draft">
            <Datatable
              loading={loading}
              columns={examTable}
              dataSource={draftExams}
              size="sm"
              title="Draft Exams"
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="⏳ Pending Approval" key="Pending">
            <Datatable
              loading={loading}
              columns={examTable}
              dataSource={pendingExams}
              size="sm"
              title="Pending Exams"
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="✅ Approved Exams" key="Approved">
            <Datatable
              loading={loading}
              columns={approvedExamTable}
              dataSource={approvedExams}
              size="sm"
              title="Approved Exams"
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
      <CreateExam setModal={setModal} modal={modal} />
    </div>
  );
}
