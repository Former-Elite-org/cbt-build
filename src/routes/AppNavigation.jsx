import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
// Old component imports removed - using new components from routes/index.tsx
// import Teachers from "../pages/teachers/Teachers"; // DELETED - use TeacherList instead
// import Students from "../pages/students/Students"; // DELETED - use StudentList instead
import Exams from "../pages/Exams/Exams";
import Dashboard from "../pages/dashboard/dashboard";
import TakeExam from "../pages/Exams/TakeExam";
// import StudentID from "../pages/students/StudentID"; // DELETED
import VirtualClassApp from "../pages/videocall/VideoCallPage";
import Login from "../pages/Login/Login";
import AppIndex from "./AppIndex";
import ViewResult from "../pages/Exams/ViewResult";
import StudentResult from "../pages/Exams/StudentResult";
import CBTExamsForm from "../pages/Exams/CBTExamsForm";
import ExamsResults from "../pages/Exams/ExamsResults";
import ExamsAdminReports from "../pages/Exams/ExamsAdminReports";
// import StudentList from "../pages/students/index.tsx"; // DELETED - use StudentList.tsx instead
import TeacherList from "../pages/teachers/index.tsx";
import TeacherForm from "../pages/teachers/TeacherForm";
// import SchoolTermSetup from "../pages/school-Setup/SchoolTermSetup.tsx";
// import SectionSetup from "../pages/school-Setup/sectionSetup.tsx"; // DELETED - use SectionManager instead
// import Subjects from "../pages/school-Setup/Subjects.tsx"; // DELETED - use SubjectsManager instead
// import ClassesSetUp from "../pages/school-Setup/ClassesSetUp.tsx"; // DELETED - use ClassesManager instead
// import ExamGradeSetup from "../pages/school-Setup/ExamGradeSetup.tsx";

export default function AppNavigation() {
  const Pages = useRoutes([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: <AppIndex />,
      children: [
        {
          index: true,
          path: "dashboard",
          element: <Dashboard />,
        },
        // {
        //   path: "teachers",
        //   element: <Teachers />, // DELETED - use TeacherList instead
        // },
        // {
        //   path: "students",
        //   element: <Students />,
        // },
        {
          path: "exams",
          element: <Exams />,
        },
        // {
        //   path: "student-id",
        //   element: <StudentID />,
        // },
        {
          path: "videocall",
          element: <VirtualClassApp />,
        },
        {
          path: "takeexam/:id",
          element: <TakeExam />,
        },
        {
          path: "managequestion/:id",
          // element: <ManageQuestions />,
          element: <CBTExamsForm />,
          
        },
        {
          path: "exam/results",
          element: <ExamsResults />,
          
        },
        {
          path: "exam/reports",
          element: <ExamsAdminReports />,
          
        },
        {
          path: "examresults/:id",
          element: <ViewResult />,
        },
        {
          path: "studentresult/:id",
          element: <StudentResult />,
        },
        //  {
        //   path: "students/list",
        //   element: <StudentList />,
        // },
         {
          path: "teachers/list",
          element: <TeacherList />,
        },
        {
          path: "teachers/create",
          element: <TeacherForm />,
        },
        // { 
        //   path: "school/terms",
        //   element: <SchoolTermSetup />
        // }, 
        // { 
        //   path: "school/sections",
        //   element: <SectionSetup /> // DELETED - use SectionManager instead
        // },
        // { 
        //   path: "school/subjects",
        //   element: <Subjects /> // DELETED - use SubjectsManager instead
        // },
        // { 
        //   path: "school/classes",
        //   element: <ClassesSetUp /> // DELETED - use ClassesManager instead
        // },
        // { 
        //   path: "school/exam-grading",
        //   element: <ExamGradeSetup />
        // }
      ],
    },
  ]);

  return Pages;
}
