import React, { useCallback, useEffect, useState } from "react";
import { _get, _post } from "../../Helper";
import Datatable from "../../core/common/dataTable/index.tsx";
import { Button, Input, message, Popconfirm } from "antd";
import { Spinner } from "reactstrap";

const ApprovedExams = () => {
    //   const [tableShow, setTableShow] = useState("exams");
    //     const [subjects, setSubjects] = useState([]);
    //     const [classes, setClasses] = useState([]);
    const [examList, setExamList] = useState([]);
    // const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    // const [error, setError] = useState({});
    // const [page, setPage] = useState(1);
    const [selectedExam, setSelectedExam] = useState(null);
    // const [questions, setQuestions] = useState([]);
    // const [examResults, setExamResults] = useState([]);
    const [comment, setComment] = useState("");

    const handleChangeComment = ({ target: { value } }) => {
        setComment(value)
    }
    const getReg = useCallback(() => {
        setLoading(true)
        _get(`examinations?query_type=select&status=Approved`,
            (resp) => {
                setLoading(false)
                if (resp.success && resp.data && resp.data.length) {
                    setExamList(resp.data);
                }
            },
            (error) => {
                setLoading(false)
                message.error("No record")
                setExamList([]);
            });
        // _get(`subjects?query_type=select-all`, (resp) => {
        //     if (resp.success  && resp.data && resp.data.length) {
        //         //z console.log(resp.data);
        //         setSubjects(resp.data);
        //     }
        // });
        // _get(`classes?query_type=select-all`, (resp) => {
        //     if (resp.success  && resp.data && resp.data.length) {
        //         // console.log(resp.data);
        //         setClasses(resp.data);
        //     }
        // });
    }, []);

    useEffect(() => {
        getReg();
    }, [getReg]);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setForm({ ...form, [name]: value });
    //     setError({ ...form, [name]: "" });
    //   };

    //     const handleNextPage = () => {
    //         if (page < Math.ceil(examList.length / limit)) {
    //             setPage((prevPage) => prevPage + 1);
    //         }
    //     };
    //     const handlePrevPage = () => {
    //         setPage((prevPage) => Math.max(prevPage - 1, 1));
    //     };

    //   const fetchQuestions = (examId) => {
    //     _get(`exam-questions/${examId}`, (resp) => {

    //          if (resp.success && resp.data && resp.data.length) {
    //         setQuestions(resp.data);
    //       }
    //     });
    //   };

    //   const fetchResults = (examId) => {
    //     _get(`exam-responses?query_type=select&exam_id=${examId}`, 
    //         (resp) => {
    //       if (resp.success && resp.data && resp.data.length) {
    //         setExamResults(resp.data);
    //       }
    //     });
    //   };
    const handleUpdate = () => {
        _post('examinations',
            selectedExam,
            (res) => {
                if (res.success) {
                    getReg();
                }
            },
            (err) => {
                message.error('No Pending Exams')
            }
        );
    }
    const examTable = [
        {
            title: "#",
            dataIndex: "id",
            key: "id",
            render: (_text, _record, index) => (
                <span>{index + 1}</span>
            ),
        },
        {
            title: "Assessment Type",
            dataIndex: "assessment_type",
            render: (_text, _record, index) => (
                <span>{_text}</span>
            ),
        },
        {
            title: "Commencement Date",
            dataIndex: "commence_date",
            render: (_text, _record, index) => (
                <span>{_text}</span>
            ),
        },
        { title: "Total Marks", dataIndex: "total_marks" },
        {
            title: "Total Questions", value: "total_questions",
            render: (_text, _record, index) => (
                <span>{_text}</span>
            ),
        },
        {
            title: "Status", value: "status", render: (_text, _record, index) => (
                <span>{_text}</span>
            ),
        },
        // {
        //     title: "Action",
        //     dataIndex: "",
        //     render: (_text, _record, index) => (
        //         <div className="d-flex gap-2">
        //             <Popconfirm
        //                 title="Are you sure you want Returne this exam for review?"
        //                 onConfirm={() => handleUpdate()}
        //                 okText="Yes"
        //                 cancelText="No"
        //             >
        //                 <Button
        //                     color="success"
        //                     size="xs"
        //                     style={{ fontSize: "12px", padding: "4px 8px" }}
        //                     onClick={() => {
        //                         setSelectedExam({ ..._record, query_type: "update", status: 'Approved' });
        //                     }}
        //                 >
        //                     Approve
        //                 </Button>
        //             </Popconfirm>

        //             <Popconfirm
        //                 title={<div><p>Are you sure you want Returne this exam for review?</p>
        //                     <Input
        //                         value={comment}
        //                         onChange={handleChangeComment}
        //                         placeholder="Enter Comment"
        //                     />
        //                 </div>}
        //                 onConfirm={() => handleUpdate()}
        //                 okText="Yes"
        //                 cancelText="No"
        //             >
        //                 <Button
        //                     danger
        //                     size="xs"
        //                     style={{ fontSize: "12px", padding: "4px 8px" }}
        //                     onClick={() => {
        //                         setSelectedExam({ ..._record, query_type: "update", status: 'Disapprove' });
        //                     }}
        //                 >
        //                     Disapprove
        //                 </Button>
        //             </Popconfirm>

        //         </div>
        //     ),
        // },
    ];

    return (<>
        {loading && <Spinner />}
        <h3> Approved Exams</h3>
        <Datatable
            columns={examTable}
            dataSource={examList}
            size="sm"
            title="Upcoming Exams"
        />
    </>)
}
export default ApprovedExams;