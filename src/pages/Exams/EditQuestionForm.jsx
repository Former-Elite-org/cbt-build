import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Row, Col, message, Tooltip } from 'antd';
import { server_url } from '../../Helper';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';

const { Option } = Select;

const EditQuestionForm = ({ question, onUpdate, onCancel }) => {
  const [form] = Form.useForm();
  const [editedQuestion, setEditedQuestion] = useState({
    ...question,
    options: [],
    is_case_sensitive: false,
    question_hint: '',
  });

  const [imagePreview, setImagePreview] = useState(question.attachment_url || null);
  const [isUploading, setIsUploading] = useState(false);

  // Parse options_json safely
  useEffect(() => {
    let parsedOptions = [];

    if (question.question_type === "Multiple Choice" && question.options_json) {
      try {
        parsedOptions = JSON.parse(question.options_json) || [];
      } catch (e) {
        parsedOptions = [];
        console.error("Failed to parse options_json", e);
      }
    }

    // For Short Answer / Fill in the Blanks
    else if (["Short Answer", "Fill in the Blanks"].includes(question.question_type)) {
      parsedOptions = [
        { option: question.correct_answer, is_correct: true, marks: question.marks || 1 },
      ];
    }

    // Essay
    else if (question.question_type === "Essay") {
      parsedOptions = [];
    }

    // Set default values
    setEditedQuestion({
      ...question,
      options: parsedOptions,
      is_case_sensitive: question.is_case_sensitive || false,
      partial_credit: question.partial_credit || true,
      question_hint: question.question_hint || question.correct_answer || "",
    });

    // Set initial form values
    form.setFieldsValue({
      question_text: question.question_text,
      question_type: question.question_type,
      correct_answer: question.correct_answer,
      question_hint: question.question_hint || question.correct_answer || "",
      marks: question.marks,
    });
  }, [question]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field, value) => {
    setEditedQuestion((prev) => ({ ...prev, [field]: value }));
  };

  // Handle option changes
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...editedQuestion.options];
    updatedOptions[index][field] = value;
    setEditedQuestion((prev) => ({ ...prev, options: updatedOptions }));
  };

  // Add new option
  const addOption = () => {
    const newOption = {
      id: Date.now(),
      option: "",
      is_correct: false,
      marks: 0,
    };
    setEditedQuestion((prev) => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
  };

  // Remove an option
  const removeOption = (index) => {
    const updatedOptions = editedQuestion.options.filter((_, i) => i !== index);
    setEditedQuestion((prev) => ({ ...prev, options: updatedOptions }));
  };

  // File upload handler
  const onChangeUpload = (e) => {
    const attachmentFile = e.target.files?.[0];
    if (!attachmentFile) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (attachmentFile.size > maxSize) {
      message.error("File size exceeds the 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(attachmentFile);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("media", attachmentFile);

    fetch(server_url + "/upload_transfer_certificate-document", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setEditedQuestion((prev) => ({ ...prev, attachment_url: data.url }));
        message.success("Uploaded successfully");
      })
      .catch((err) => {
        console.error("Upload error:", err);
        message.error("Upload failed");
      })
      .finally(() => setIsUploading(false));
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      await form.validateFields();

      let formattedData = { ...editedQuestion };

      // Map options back to JSON string if needed
      if (
        ["Multiple Choice", "True/False", "Short Answer", "Fill in the Blanks"].includes(
          formattedData.question_type
        )
      ) {
        formattedData.options_json = JSON.stringify(formattedData.options);
      }

      // Map hint for short answer / fill in blanks
      if (["Short Answer", "Fill in the Blanks"].includes(formattedData.question_type)) {
        formattedData.correct_answer = formattedData.question_hint;
      }

      // Essay only uses question_hint
      if (formattedData.question_type === "Essay") {
        formattedData.question_hint = formattedData.question_hint || "";
      }

      onUpdate(formattedData);
      message.success("Question updated successfully.");
    } catch (error) {
      message.error("Please fill in all required fields.");
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      {/* Question Type */}
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="Question Type" name="question_type" rules={[{ required: true }]}>
            <Select
              value={editedQuestion.question_type}
              onChange={(val) => handleSelectChange("question_type", val)}
            >
              <Option value="Multiple Choice">Multiple Choice</Option>
              <Option value="True/False">True/False</Option>
              <Option value="Fill in the Blanks">Fill in the Blanks</Option>
              <Option value="Short Answer">Short Answer</Option>
              <Option value="Essay">Essay</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Question Text */}
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="Question Text" name="question_text" rules={[{ required: true }]}>
            <Input.TextArea
              rows={3}
              name="question_text"
              value={editedQuestion.question_text}
              onChange={handleInputChange}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Attach Image */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={
              <strong>Image (Optional){" "}
                <Tooltip title="Image attachement can serve for Question Diagrams, Mathematical Equetions, Scientific Formulars and Graph ploting Pad."
                  placement="right">
                  <QuestionCircleOutlined
                    style={{ marginLeft: 1, color: "#999", with: '40%' }}
                  />
                </Tooltip></strong>
            }>
            <div className="profile-upload">
              <div className="profile-uploader d-flex align-items-center">
                {!question.attachment_url ? (
                  <div className="drag-upload-btn mb-1 d-flex align-items-center">
                    <input type="file"
                      accept="image/*"
                      onChange={onChangeUpload}
                      className="form-control image-sign"
                    />{" "}<strong><Tooltip
                      title="Allowed (Max size 4MB, Format JPG, PNG, SVG)"
                      placement="right">
                      <QuestionCircleOutlined
                        style={{ marginLeft: 1, color: "#999", with: '40%' }} />
                    </Tooltip>
                    </strong>
                  </div>
                ) : (<div className="d-flex direction-column">
                  <img
                    src={question.attachment_url}
                    width={200}
                    height={200}
                  />
                  <Button danger onClick={() => {
                    setEditedQuestion((p) => ({ ...p, attachment_url: "" }));
                    setImagePreview("");
                  }}>
                    X
                  </Button>
                </div>
                )}
              </div>
              <i className="fs-12">
                {isUploading ? "Uploading..." : ""}
              </i>
            </div>
          </Form.Item>
        </Col>
      </Row>

      {/* Multiple Choice Options */}
      {editedQuestion.question_type === "Multiple Choice" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button type="dashed" block onClick={addOption}>
              + Add Option
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Col span={10}>
            <Form.Item
              label={
                <span>
                  Is Partial Credit?
                  <Tooltip title="Should the response match all marked correct?" placement="right">
                    <QuestionCircleOutlined style={{ marginLeft: 8, color: "#999", cursor: "pointer" }} />
                  </Tooltip>
                </span>
              }
            >
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={editedQuestion.partial_credit || false}
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      partial_credit: e.target.checked,
                    })
                  }
                />
                <span>{editedQuestion.partial_credit ? "Yes" : "No"}</span>
              </div>
            </Form.Item>
            </Col>
            {editedQuestion.options.map((option, index) => (
              <div key={index} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Input
                  placeholder="Option Text"
                  value={option.value}
                  onChange={(e) => handleOptionChange(index, "option", e.target.value)}
                  style={{ flex: 1 }}
                />
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={option.is_correct > 0 ? 1 : false}
                    onChange={(e) => handleOptionChange(index, "is_correct", e.target.checked)}
                  />
                  <span>Correct</span>
                </div>
                <Input
                  type="number"
                  placeholder="Marks"
                  value={option.marks || ""}
                  onChange={(e) => handleOptionChange(index, "marks", parseFloat(e.target.value) || 0)}
                  style={{ width: 80 }}
                />
                <Button danger size="small" onClick={() => removeOption(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* True/False */}
     {editedQuestion.question_type === "True/False" && (
              <>
                <p style={{ marginBottom: 12 }}>
                  <strong>Options:</strong> Fixed to <code>True</code> and <code>False</code>
                </p>
                {/* {JSON.stringify(question)} */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      padding: "10px",
                      border: "1px solid #eee",
                      borderRadius: "6px",
                      backgroundColor: "#fafafa",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* True Option */}
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <input
                        type="radio"
                        name="true-false"
                        checked={editedQuestion.options[0]?.option === "True"}
                        onChange={() => {
                          setEditedQuestion((q) => ({
                            ...q,
                            options: [{
                              option: 'True',
                              is_correct: true,
                              marks: q.options[0]?.marks || 0
                            }],
                          }));
                        }}
                      />
                      True
                    </label>

                    {/* False Option */}
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <input
                        type="radio"
                        name="true-false"
                        checked={editedQuestion.options[0]?.option === "False"}
                        onChange={() => {
                          setEditedQuestion((q) => ({
                            ...q,
                            options: [{
                              option: 'False',
                              is_correct: true,
                              marks: q.options[0]?.marks || 0
                            }],
                          }));
                        }}
                      />
                      False
                    </label>

                    {/* Marks Input */}
                    <Input
                      type="number"
                      placeholder="Marks"
                      value={question.options[0]?.marks || ""}
                      onChange={(e) => {
                        const marks = parseFloat(e.target.value);
                        setEditedQuestion((q) => ({
                          ...q,
                          options: [{
                            option: q.options[0]?.option || "True",
                            is_correct: true,
                            marks
                          }],
                        }));
                      }}
                      style={{ width: 100 }}
                    />
                  </div>
                </div>
              </>
            )}

      {/* Short Answer / Fill in the Blanks */}
      {["Short Answer", "Fill in the Blanks"].includes(editedQuestion.question_type) && (
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item label="Correct Answer">
              <Input
                value={editedQuestion.options[0]?.option || ""}
                onChange={(e) =>
                  handleOptionChange(0, "option", e.target.value)
                }
                placeholder="Enter correct answer"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={
                <span>
                  Case Sensitive?
                  <Tooltip title="Should the answer match case exactly?" placement="right">
                    <QuestionCircleOutlined style={{ marginLeft: 8, color: "#999", cursor: "pointer" }} />
                  </Tooltip>
                </span>
              }
            >
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={editedQuestion.is_case_sensitive || false}
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      is_case_sensitive: e.target.checked,
                    })
                  }
                />
                <span>{editedQuestion.is_case_sensitive ? "Yes" : "No"}</span>
              </div>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Marks">
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                value={editedQuestion.options[0]?.marks || 1}
                onChange={(value) => handleOptionChange(0, "marks", value)}
              />
            </Form.Item>
          </Col>
        </Row>
      )}

     {/* Essay */}
            {editedQuestion.question_type === "Essay" && (
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    label={
                      <span>
                        Question Hint (Optional)
                        <Tooltip
                          title="Provide optional hint or marking guide for essay"
                          placement="right"
                        >
                          <QuestionCircleOutlined
                            style={{
                              marginLeft: 8,
                              color: "#999",
                              cursor: "pointer",
                            }}
                          />
                        </Tooltip>
                      </span>
                    }
                  >
                    <TextArea
                      rows={4}
                      name="question_hint"
                      value={editedQuestion.question_hint || ""}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          question_hint: e.target.value,
                        })
                      }
                      placeholder="Provide optional hint or marking guide for essay"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item rules={[{ required: true }]} label="Marks">
                    <Input
                      type="number"
                      min="1"
                      value={editedQuestion.marks || 0}
                      onChange={(e) => {
                        setEditedQuestion((prev) => ({
                          ...prev,
                          marks: parseFloat(e.target.value) || 0,
                        }));
                      }}
                      placeholder="Enter marks"
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

      {/* Action Buttons */}
      <Form.Item style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onCancel} style={{ marginRight: 10 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default EditQuestionForm;