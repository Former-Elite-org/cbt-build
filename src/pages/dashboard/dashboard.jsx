import React from "react";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiErrorCircle } from "react-icons/bi";
import TeachersDashboard from "./TeachersDashboard";
import AdminDashboard from "./AdminDashboard";
import StudentExam from "../Exams/StudentExam";
import { Spinner } from "reactstrap";

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);

  const navigate = useNavigate();



  const switchTable = () => {
    switch (user?.user_type?.toLowerCase() || "") {
      case "teacher":
        return <TeachersDashboard />;
      case "admin":
      case "branchadmin":
        return (
          <AdminDashboard />
        );
      case "student":
        return <StudentExam />;
      default:
        return user === null ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h3 className="loading-text">Loading your dashboard...</h3>
          </div>
        ) : (
          <div className="login-message-container  text-center">
                      <Spinner />
            {/* <div className="login-message-box">
              <BiErrorCircle className="message-icon" />
              <h2>Session Expired {user?.user_type?.toUpperCase() + "!"}</h2>
              <p>Your session has expired or you're not logged in.</p>
              <p>Please log in again to access your dashboard.</p>
              <button
                className="login-redirect-btn"
                onClick={() => navigate("/login")}
              >
                Return to Login
              </button>
            </div> */}
          </div>
        );
    }
  };

  return <>{switchTable()}</>;
}
