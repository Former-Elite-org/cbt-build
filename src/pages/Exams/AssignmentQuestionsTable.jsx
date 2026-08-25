import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm } from 'antd';

const AssignmentQuestionsTable = ({ questions, onUpdate, onDelete }) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showEditModal = (question) => {
    setEditingQuestion(question);
    form.setFieldsValue({
      question_text: question.question_text,
      question_type: question.question_type,
      marks: question.marks,
      correct_answer: question.correct_answer,
    });
    setIsModalVisible(true);
  };

  const handleEditSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onUpdate({ ...editingQuestion, ...values });
        setIsModalVisible(false);
        setEditingQuestion(null);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingQuestion(null);
    form.resetFields();
  };

  const columns = [
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
    {
      title: 'Correct Answer / Marking Guide',
      dataIndex: 'correct_answer',
      key: 'correct_answer',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this question?"
            onConfirm={() => onDelete(record.id)}
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
    <>
      <Table dataSource={questions} columns={columns} rowKey="id" />

      <Modal
        title="Edit Question"
        visible={isModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleCancel}
        okText="Save"
      >
        <Form form={form} layout="vertical">
           <Form.Item
            name="question_type"
            label="Question Type"
            rules={[{ required: true, message: 'Please enter the question type' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="question_text"
            label="Question Text"
            rules={[{ required: true, message: 'Please enter the question text' }]}
          >
            <Input />
          </Form.Item>
         
          <Form.Item
            name="marks"
            label="Marks"
            rules={[{ required: true, message: 'Please enter the marks' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="correct_answer"
            label="Correct Answer / Marking Guide"
            rules={[{ required: true, message: 'Please enter the correct answer or marking guide' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AssignmentQuestionsTable;
