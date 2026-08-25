import React, { useCallback, useEffect, useState } from "react";
import StudentExams from "./StudentExam";
import TeachersExam from "./TeachersExam";
import { BiErrorCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ExamsManager from "./ExamsManager";
import { Spinner } from "reactstrap";

export default function Exams() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const switchExam = () => {
    switch (user?.user_type?.toLowerCase() || "") {
      case "teacher":
        return <TeachersExam />;
      case "admin":
      case "branchadmin":
        return <ExamsManager />;
      case "student":
        return <StudentExams />;
      default:
        return user === null ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h3 className="loading-text">Loading your Exams...</h3>
          </div>
        ) : (
          <div className="login-message-container text-center">
            <Spinner />
             {/*  <div className="login-message-box">
            <BiErrorCircle className="message-icon" />
              <h2>Session Expired {user?.user_type?.toUpperCase() + ":!"}</h2>
              <p>Your session has expired or you're not logged in.</p>
              <p>Please log in again to access your exams.</p>
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
  return <>{switchExam()}</>;
}
