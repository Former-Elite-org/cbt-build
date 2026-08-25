import React, { useEffect, useState, useCallback } from "react";
import { Button, Container, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { _get } from "../../Helper";
import Datatable from "../../core/common/dataTable/index.tsx";
import { useSelector } from "react-redux";
import { message, Tabs } from "antd";
import { motion } from "framer-motion";

const ExamsResults = () => {
  const [completedExams, setCompletedExams] = useState([]);
  const [releasedExams, setReleasedExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const { selected_branch } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("Completed");
  const navigate = useNavigate();

  const fetchExams = useCallback(
    (status) => {
      if (!selected_branch?.branch_id) return;
      setLoading(true);
      _get(
        `examinations?query_type=select&status=${status}&branch_id=${selected_branch.branch_id}`,
        (resp) => {
          if (resp.success && resp.data) {
            if (status === "Completed") setCompletedExams(resp.data);
            else if (status === "Released") setReleasedExams(resp.data);
          } else {
            if (status === "Completed") setCompletedExams([]);
            else if (status === "Released") setReleasedExams([]);
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
    fetchExams("Completed");
    fetchExams("Released");
  }, [fetchExams]);

  const examTable = [
    { title: "S/N", render: (item, record, idx) => <strong>{idx + 1}</strong> },
    { title: "Assessment Type", dataIndex: "assessment_type" },
    { title: "Date", dataIndex: "commence_date" },
    { title: "Total Marks", dataIndex: "total_marks" },
    { title: "Total Questions", dataIndex: "total_questions" },
    { title: "Status", dataIndex: "status" },
    {
      title: "Action",
      render: (text, exam) => (
        <div className="d-flex gap-2">
          <Button
            color="info"
            size="xs"
            style={{ fontSize: "12px", padding: "4px 8px" }}
            onClick={() => navigate(`/examresults/${exam.id}`)}
          >
            View Results
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="elite-admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header ">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="dashboard-title mb-5">Exams Results</h2>
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

        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <Tabs.TabPane tab="📝 Completed" key="Completed">
            <Datatable
              loading={loading}
              columns={examTable}
              dataSource={completedExams}
              size="sm"
              title="Completed Exams"
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="✅ Released" key="Released">
            <Datatable
              loading={loading}
              columns={examTable}
              dataSource={releasedExams}
              size="sm"
              title="Released Exams"
            />
          </Tabs.TabPane>
        </Tabs>
      </Container>
    </div>
  );
};

export default ExamsResults;
