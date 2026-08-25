import React, { useState, useEffect } from 'react';
import { Modal, Button, Popconfirm, Col } from 'antd';
import EditQuestionForm from './EditQuestionForm';
import Table from "../../../core/common/dataTable/index";
const UpdateAssignmentQuestionsTable = ({  questions, onUpdate, onDelete }) => {
  const [questionList, setQuestionList] = useState(questions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);

  useEffect(() => {
    setQuestionList(questions);
  }, [questions]);

  const handleEdit = (question, index) => {
    setCurrentQuestion(question);
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (record, index) => {
    const updatedList = questionList.filter((_, i) => i !== index);
    setQuestionList(updatedList);
    onDelete(record);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentQuestion(null);
    setCurrentIndex(null);
  };

  const handleModalSave = (updatedQuestion) => {
    // alert(JSON.stringify(updatedQuestion));
    const updatedList = [...questionList];
    updatedList[currentIndex] = updatedQuestion;
    setQuestionList(updatedList);
    onUpdate(updatedQuestion);
    handleModalClose();
  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => <p>{index + 1}</p>,
    },
    {
      title: 'Question Text',
      dataIndex: 'question_text',
      key: 'question_text',
    },
    {
      title: 'Question Type',
      dataIndex: 'question_type',
      key: 'question_type',
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
    },
    // {
    //   title: 'Correct Answer / Marking Guide',
    //   dataIndex: 'correct_answer',
    //   key: 'correct_answer',
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record, index) => (
        <>
          <Button type="link" onClick={() => handleEdit(record, index)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this question?"
            onConfirm={() => handleDelete(record, index)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
     <div style={{ border: "1px solid #f0f0f0", borderRadius: "8px", padding: "16px", marginBottom: "14px" }}>
         
      <h3>Assignment Questions</h3>
      <Table dataSource={questionList} columns={columns} rowKey="id" />
      <Col span={24} className="m-5 ">
          <Button
            type="dashed"
            onClick={() => handleEdit({ question_text: '', question_type: '', marks: 0, correct_answer: '' })}
            block
            style={{ marginBottom: 16, padding: 10 }}
          >
            Add Question
          </Button>
        </Col>
      <Modal
        visible={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        title="Edit Question"
      >
        <EditQuestionForm
          question={currentQuestion}
          onUpdate={handleModalSave}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default UpdateAssignmentQuestionsTable;
