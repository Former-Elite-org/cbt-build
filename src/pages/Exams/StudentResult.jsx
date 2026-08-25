import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";
import CustomTable from "../reusablecomponent/CustomTable";
import { useNavigate, useParams } from "react-router-dom";
import { _get } from "../../Helper";
import { useSelector } from "react-redux";

export default function StudentResult() {
  const navigate = useNavigate();
  const params = useParams();
  const [studentExam, setStudentExam] = useState([]);
  const exam_id = params.id;
  const { user } = useSelector((s) => s.auth);

   useEffect(() => {
      _get(
        `get_exam_table?query_type=get_student_exam&exam_id=${exam_id}&student_id=${user.admission_no}`,
        (resp) => {
          if (resp.success && resp.data.length > 0) {
            setStudentExam(resp.data);
          }
        }
      );
    }, [exam_id, user.admission_no]);

   const studentExamTable = [
      { title: "S/N", custom: true, component: (i, index) => index + 1 },
      { title: "Question", value: "question" },
      { title: "Answer", value: "response" },
      { title: "Correct Answer", value: "answer" },
      { title: "Score", value: "mark" },
      {
        title: "Action",
        custom: true,
        component: (i) => (
          <div className="place-center">
            {
              <Button
                disabled
                className="text-capitalize"
                color={i.remarks === "correct" ? "success" : "danger"}
              >
                {i.remarks}
              </Button>
            }
          </div>
        ),
      },
    ];

  return (
    <div>
      <div className="card shadow-sm m-2">
        <div className="card-body">
          <Button onClick={() => navigate(-1)}>Back</Button>
          <CustomTable
            fields={studentExamTable}
            data={studentExam}
            size="sm"
            type={studentExam[0]?.exam_name}
          />
        </div>
      </div>
    </div>
  );
}
