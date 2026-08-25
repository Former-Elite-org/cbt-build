import React, { useState } from "react";
import {
  FaPlus,
  FaRegClock,
  FaCheckCircle,
  FaList,
  FaHourglassHalf,
  FaUserCircle,
  FaArrowLeft,
  FaBell,
} from "react-icons/fa";
import "./task.css";

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentView, setCurrentView] = useState("list");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "Pending",
    assignedTo: "",
  });
  const [review, setReview] = useState({
    comment: "",
    rating: "good",
  });

  const teamMembers = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com" },
  ];

  const addTask = (e) => {
    e.preventDefault();
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      status: "Pending",
      assignedTo: "",
    });
    setCurrentView("list"); // Return to list view after adding task
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prevTask => ({
      ...prevTask,
      [name]: value
    }));
  };

  const filterTasks = () => {
    switch (activeTab) {
      case "Pending":
        return tasks.filter((task) => task.status === "Pending");
      case "inProgress":
        return tasks.filter((task) => task.status === "inProgress");
      case "Completed":
        return tasks.filter((task) => task.status === "Completed");
      default:
        return tasks;
    }
  };

  const getPendingReviewsCount = () => {
    return tasks.filter((task) => task.status === "underReview").length;
  };

  const handleStatusChange = (taskId, newStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            review: newStatus === "Completed" ? review : null,
          }
        : task
    );
    setTasks(updatedTasks);
    setShowReviewModal(false);
    setReview({ comment: "", rating: "good" });
  };

  const openReviewModal = (task) => {
    setSelectedTask(task);
    setShowReviewModal(true);
  };

  const getStatusButton = (task) => {
    switch (task.status) {
      case "Pending":
        return (
          <button
            className="status-button start"
            onClick={() => {
              const updatedTasks = tasks.map((t) =>
                t.id === task.id ? { ...t, status: "inProgress" } : t
              );
              setTasks(updatedTasks);
            }}
          >
            <FaRegClock /> Start Task
          </button>
        );
      case "inProgress":
        return (
          <button
            className="status-button submit"
            onClick={() => {
              const updatedTasks = tasks.map((t) =>
                t.id === task.id ? { ...t, status: "underReview" } : t
              );
              setTasks(updatedTasks);
            }}
          >
            <FaCheckCircle /> Submit for Review
          </button>
        );
      case "underReview":
        return (
          <div className="status-badge review">
            <FaHourglassHalf /> Under Review
          </div>
        );
      case "Completed":
        return (
          <div className="status-badge Completed">
            <FaCheckCircle /> Completed
          </div>
        );
      default:
        return null;
    }
  };

  const TaskCard = ({ task }) => (
    <div className={`task-card priority-${task.priority}`}>
      <div className="task-card-header">
        <span className={`priority-indicator ${task.priority}`} />
        <span className={`priority-badge ${task.priority}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      <div className="task-card-content">
        <h3>{task.title}</h3>
        <p className="task-description">{task.description}</p>

        <div className="task-meta">
          <div className="assigned-to">
            <FaUserCircle />
            <span>
              {teamMembers.find((m) => m.id === parseInt(task.assignedTo))
                ?.name || "Unassigned"}
            </span>
          </div>
          <div className="due-date">
            <FaRegClock />
            <span>{task.dueDate}</span>
          </div>
        </div>

        <div className="task-card-footer">
          {getStatusButton(task)}
          {task.review && (
            <div className="review-info">
              <p className="review-rating">Rating: {task.review.rating}</p>
              <p className="review-comment">{task.review.comment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const TaskForm = () => (
    <div className="task-form-container">
      <div className="form-header">
        <button className="back-button" onClick={() => setCurrentView("list")}>
          <FaArrowLeft /> Back to Tasks
        </button>
        <h2>Create New Task</h2>
      </div>
      <form onSubmit={addTask}>
        <div className="form-group">
          <label>Task Title</label>
          <input
            type="text"
            name="title"
            placeholder="Enter task title"
            value={newTask.title || ''}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Task Description</label>
          <textarea
            name="description"
            placeholder="Enter task description"
            value={newTask.description}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={newTask.priority}
              onChange={handleChange}
              className="form-input"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assign To</label>
            <select
              name="assignedTo"
              value={newTask.assignedTo}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select Team Member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          <FaPlus /> Create Task
        </button>
      </form>
    </div>
  );

  const ReviewModal = () => (
    <div className="modal-overlay">
      <div className="review-modal">
        <h2>Review Task</h2>
        <div className="form-group">
          <label>Rating</label>
          <div className="radio-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                id="excellent"
                name="rating"
                value="excellent"
                checked={review.rating === "excellent"}
                onChange={(e) => setReview({ ...review, rating: e.target.value })}
              />
              <label htmlFor="excellent">Excellent</label>
            </div>
            <div className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                id="very_good"
                name="rating" 
                value="very_good"
                checked={review.rating === "very_good"}
                onChange={(e) => setReview({ ...review, rating: e.target.value })}
              />
              <label htmlFor="very_good">Very Good</label>
            </div>
            <div className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                id="good"
                name="rating"
                value="good"
                checked={review.rating === "good"}
                onChange={(e) => setReview({ ...review, rating: e.target.value })}
              />
              <label htmlFor="good">Good</label>
            </div>
            <div className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                id="fair"
                name="rating"
                value="fair"
                checked={review.rating === "fair"}
                onChange={(e) => setReview({ ...review, rating: e.target.value })}
              />
              <label htmlFor="fair">Fair</label>
            </div>
            <div className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                id="poor"
                name="rating"
                value="poor"
                checked={review.rating === "poor"}
                onChange={(e) => setReview({ ...review, rating: e.target.value })}
              />
              <label htmlFor="poor">Poor</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Comments</label>
          <textarea
            value={review.comment}
            onChange={(e) => setReview({ ...review, comment: e.target.value })}
            placeholder="Enter your review comments..."
            className="form-input"
            required
          />
        </div>
        <div className="modal-actions">
          <button
            className="reject-btn"
            onClick={() => handleStatusChange(selectedTask.id, "inProgress")}
          >
            Reject & Return to Progress
          </button>
          <button
            className="submit-btn"
            onClick={() => handleStatusChange(selectedTask.id, "Completed")}
          >
            Submit Review
          </button>
        </div>
        <button
          className="close-modal"
          onClick={() => setShowReviewModal(false)}
        >
          ×
        </button>
      </div>
    </div>
  );

  const PendingReviews = () => (
    <div className="Pending-reviews">
      <div className="form-header">
        <button className="back-button" onClick={() => setCurrentView("list")}>
          <FaArrowLeft /> Back to Tasks
        </button>
        <h2>Pending Reviews</h2>
      </div>
      <div className="task-list">
        {tasks.filter((task) => task.status === "underReview").length === 0 ? (
          <div className="no-tasks">
            <p>No tasks to review</p>
          </div>
        ) : (
          <div className="review-list">
            {tasks
              .filter((task) => task.status === "underReview")
              .map((task) => (
                <div
                  key={task.id}
                  className={`review-card priority-${task.priority}`}
                >
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <div className="assigned-to">
                      <FaUserCircle />
                      <span>
                        {teamMembers.find((m) => m.id === parseInt(task.assignedTo))
                          ?.name || "Unassigned"}
                      </span>
                    </div>
                    <div className="due-date">
                      <FaRegClock />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                  <button
                    className="review-btn"
                    onClick={() => openReviewModal(task)}
                  >
                    Review Task
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
      
    </div>
  );

  const TaskList = () => (
    <>
      <header className="header">
        <h1>Task Manager</h1>
        <div className="header-actions">
          <button
            className="review-badge-btn"
            onClick={() => setCurrentView("reviews")}
          >
            <FaBell />
            Pending Reviews
            {getPendingReviewsCount() > 0 && (
              <span className="badge">{getPendingReviewsCount()}</span>
            )}
          </button>
          <button
            className="add-task-btn"
            onClick={() => setCurrentView("form")}
          >
            <FaPlus /> New Task
          </button>
        </div>
      </header>

      <div className="task-tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          <FaList /> All Tasks
        </button>
        <button
          className={activeTab === "Pending" ? "active" : ""}
          onClick={() => setActiveTab("Pending")}
        >
          <FaHourglassHalf /> Pending
        </button>
        <button
          className={activeTab === "inProgress" ? "active" : ""}
          onClick={() => setActiveTab("inProgress")}
        >
          <FaRegClock /> In Progress
        </button>
        <button
          className={activeTab === "Completed" ? "active" : ""}
          onClick={() => setActiveTab("Completed")}
        >
          <FaCheckCircle /> Completed
        </button>
      </div>

      <div className="task-list">
        {filterTasks().length === 0 ? (
          <div className="no-tasks">
            <p>No tasks found in this category</p>
          </div>
        ) : (
          filterTasks().map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </>
  );

  return (
    <div className="task-manager">
      {showReviewModal && <ReviewModal />}
      {currentView === "list" && <TaskList />}
      {currentView === "form" && <TaskForm />}
      {currentView === "reviews" && <PendingReviews />}
    </div>
  );
};

export default Task;
