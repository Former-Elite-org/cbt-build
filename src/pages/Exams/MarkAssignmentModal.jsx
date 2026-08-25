import {
  Modal,
  Typography,
  Input,
  Form,
  Divider,
  InputNumber,
  Row,
  Col,
  Tooltip,
  Tag,
} from "antd";
import { LockOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const MarkAssignmentModal = ({
  modalVisible,
  setModalVisible,
  selectedAssignments = [],
  onSubmit,
  examStatus,
}) => {
  const [form] = Form.useForm();

  const isReleased = examStatus?.toLowerCase() === "released";

  const handleFinish = (values) => {
    const marks = selectedAssignments.map((assignment) => ({
      id: assignment.id,
      score: values[`score_${assignment.id}`],
      remark: values[`remark_${assignment.id}`] || "",
    }));
    onSubmit(marks);
    setModalVisible(false);
  };

  const renderResponse = (assignment, idx) => {
    const {
      id,
      question_text,
      question_type,
      correct_answer,
      response_json,
      selected_responses,
      attachment_url,
      question_hint,
      max_marks,
      max_score,
      remark,
    } = assignment;

    // Parse response
    let response = "";
    if (["Multiple Choice", "Fill In The Blanks"].includes(question_type)) {
      try {
        const parsed = JSON.parse(
          response_json?.startsWith("[") ? response_json : `[${response_json}]`
        );
        response = Array.isArray(parsed)
          ? parsed.map((r) => r.response || r).join(", ")
          : response_json;
      } catch (e) {
        response = Array.isArray(selected_responses)
          ? selected_responses.join(", ")
          : selected_responses || "";
      }
    } else {
      response = response_json || selected_responses || "";
    }

    // Parse options for MCQ/Fill-in
    const options_json = [];
    if (["Multiple Choice", "Fill In The Blanks"].includes(question_type)) {
      try {
        const parsed = JSON.parse(
          response_json?.startsWith("[") ? response_json : `[${response_json}]`
        );
        options_json.push(
          ...parsed.map((opt) => ({
            value: opt.response,
            marks: opt.marks ?? 0,
            is_correct: opt.is_correct,
          }))
        );
      } catch (e) {
        // fallback
      }
    }

    return (
      <>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Paragraph>
              <b>#:</b> {idx + 1}
            </Paragraph>
          </Col>
          <Col span={12}>
            <Paragraph>
              <b>Question:</b> {question_text}
            </Paragraph>
          </Col>
        </Row>

        {/* Response Display */}
        {["Multiple Choice", "Fill In The Blanks"].includes(question_type) ? (
          <Row>
            <Col span={24}>
              <Paragraph>
                <b>Response:</b> {response}
              </Paragraph>
              <div className="options-grid">
                {options_json.map((opt, i) => (
                  <div key={i} className="option-item">
                    <div className="option-label">
                      <b>{String.fromCharCode(65 + i)}.</b> {opt.value}
                      <div className="text-muted small">
                        Available: {opt.marks} mark(s)
                        {opt.is_correct === "1" || opt.is_correct === 1 ? (
                          <span className="text-success"> | Correct</span>
                        ) : <span className="text-danger"> | Incorrect</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        ) : (
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Paragraph>
                <b>Response:</b> {response}
              </Paragraph>
            </Col>
            <Col span={12}>
              <Paragraph>
                <b>
                  {question_type === "Essay" ? "Marking Guide" : "Correct Answer"}:
                </b>{" "}
                {question_type === "Essay" ? question_hint : correct_answer}
              </Paragraph>
            </Col>
          </Row>
        )}

        {attachment_url && (
          <Row>
            <Col span={24}>
              <Paragraph>
                <b>Attachment:</b>{" "}
                <a href={attachment_url} target="_blank" rel="noopener noreferrer">
                  View Submission
                </a>
              </Paragraph>
            </Col>
          </Row>
        )}

        {/* Score Input */}
        <Form.Item
          label={`Marks / ${max_marks}`}
          name={`score_${id}`}
          initialValue={parseFloat(max_score) || 0}
        >
          <InputNumber
            min={0}
            max={Number(max_marks)}
            style={{ width: "100%" }}
            disabled={isReleased}
            readOnly={isReleased}
          />
        </Form.Item>

        {/* Remark Input */}
        <Form.Item
          label="Remark"
          name={`remark_${id}`}
          initialValue={remark || ""}
        >
          <Input.TextArea
            rows={2}
            disabled={isReleased}
            readOnly={isReleased}
            placeholder={isReleased ? "" : "Enter remark (optional)"}
          />
        </Form.Item>

        <Divider />
      </>
    );
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          <Title level={4} style={{ margin: 0 }}>
            Student: {selectedAssignments[0]?.student_name || "N/A"}
          </Title>
          <Paragraph type="secondary" style={{ margin: "4px 0" }}>
            Admission No: {selectedAssignments[0]?.admission_no || "N/A"}
          </Paragraph>
          {isReleased && (
            <Tag icon={<LockOutlined />} color="warning" style={{ fontSize: "1em" }}>
              Exam Released – Responses are locked
            </Tag>
          )}
        </div>
      }
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      okText="Submit"
      okButtonProps={{
        disabled: isReleased,
        htmlType: "button",
      }}
      onOk={() => {
        if (!isReleased) {
          form.validateFields().then(handleFinish);
        }
      }}
      width={800}
      centered
    >
      {isReleased && (
        <div
          style={{
            backgroundColor: "#fff8e1",
            color: "#5b480b",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            border: "1px solid #ffd591",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          <LockOutlined /> This exam has been released. Marks cannot be edited.
        </div>
      )}

      <Form form={form} layout="vertical" initialValues={{}}>
        {selectedAssignments.map((assignment, idx) => (
          <div key={assignment.id || idx}>{renderResponse(assignment, idx)}</div>
        ))}
      </Form>
    </Modal>
  );
};

export default MarkAssignmentModal;