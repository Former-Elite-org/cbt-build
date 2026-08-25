import React, { useState } from 'react';

const QuestionForm = ({ onSubmit }) => {
  const initialQuestion = {
    question_type: '',
    question_text: '',
    correct_answer: '',
    marks: '',
    hint: '',
    attached_file: null,
    options: {
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
    },
  };

  const [question, setQuestion] = useState(initialQuestion);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [name]: value,
      },
    }));
  };

  const handleFileChange = (e) => {
    setQuestion((prev) => ({
      ...prev,
      attached_file: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!question.question_type || !question.question_text || !question.marks) {
      alert('Please fill in all required fields.');
      return;
    }

    if (
      question.question_type === 'Multiple Choice' &&
      Object.values(question.options).some((opt) => !opt)
    ) {
      alert('Please fill in all options for the multiple-choice question.');
      return;
    }

    if (
      question.question_type === 'True/False' &&
      !['True', 'False'].includes(question.correct_answer)
    ) {
      alert('Please select the correct answer for the True/False question.');
      return;
    }

    // Submit the question
    onSubmit(question);
    setQuestion(initialQuestion);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Question Type */}
      <div>
        <label>Question Type:</label>
        <select
          name="question_type"
          value={question.question_type}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Type</option>
          <option value="Essay">Essay</option>
          <option value="Multiple Choice">Multiple Choice</option>
          <option value="True/False">True/False</option>
        </select>
      </div>

      {/* Question Text */}
      <div>
        <label>Question Text:</label>
        <textarea
          name="question_text"
          value={question.question_text}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Marks */}
      <div>
        <label>Marks:</label>
        <input
          type="number"
          name="marks"
          value={question.marks}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Conditional Fields */}
      {question.question_type === 'Essay' && (
        <>
          {/* Hint */}
          <div>
            <label>Hint:</label>
            <textarea
              name="hint"
              value={question.hint}
              onChange={handleInputChange}
            />
          </div>

          {/* File Attachment */}
          <div>
            <label>Attach File:</label>
            <input type="file" onChange={handleFileChange} />
          </div>
        </>
      )}

      {question.question_type === 'Multiple Choice' && (
        <>
          {/* Options */}
          <div>
            <label>Option A:</label>
            <input
              type="text"
              name="option_a"
              value={question.options.option_a}
              onChange={handleOptionChange}
              required
            />
          </div>
          <div>
            <label>Option B:</label>
            <input
              type="text"
              name="option_b"
              value={question.options.option_b}
              onChange={handleOptionChange}
              required
            />
          </div>
          <div>
            <label>Option C:</label>
            <input
              type="text"
              name="option_c"
              value={question.options.option_c}
              onChange={handleOptionChange}
              required
            />
          </div>
          <div>
            <label>Option D:</label>
            <input
              type="text"
              name="option_d"
              value={question.options.option_d}
              onChange={handleOptionChange}
              required
            />
          </div>

          {/* Correct Answer */}
          <div>
            <label>Correct Answer:</label>
            <select
              name="correct_answer"
              value={question.correct_answer}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Correct Answer</option>
              <option value={question.options.option_a}>
                {question.options.option_a}
              </option>
              <option value={question.options.option_b}>
                {question.options.option_b}
              </option>
              <option value={question.options.option_c}>
                {question.options.option_c}
              </option>
              <option value={question.options.option_d}>
                {question.options.option_d}
              </option>
            </select>
          </div>
        </>
      )}

      {question.question_type === 'True/False' && (
        <>
          {/* Correct Answer */}
          <div>
            <label>Correct Answer:</label>
            <div>
              <input
                type="radio"
                name="correct_answer"
                value="True"
                checked={question.correct_answer === 'True'}
                onChange={handleInputChange}
                required
              />
              <label>True</label>
            </div>
            <div>
              <input
                type="radio"
                name="correct_answer"
                value="False"
                checked={question.correct_answer === 'False'}
                onChange={handleInputChange}
                required
              />
              <label>False</label>
            </div>
          </div>
        </>
      )}

      {/* Submit Button */}
      <button type="submit">Add Question</button>
    </form>
  );
};

export default QuestionForm;
