import React from "react";

const statusLabel = { todo: "To Do", inprogress: "In Progress", done: "Done" };
const priorityLabel = { high: "High", medium: "Medium", low: "Low" };
const categoryLabel = (c) => c && c.charAt(0).toUpperCase() + c.slice(1);

function TaskDetailModal({ task, onClose, onEdit }) {
  if (!task) return null;

  const attachments = task.attachments || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-task-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Task Details</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="task-detail-body">
          <div className="task-detail-field">
            <label>TITLE</label>
            <p className="task-detail-value title">{task.title}</p>
          </div>

          <div className="task-detail-field">
            <label>DESCRIPTION</label>
            <p className="task-detail-value description">
              {task.description || "— No description —"}
            </p>
          </div>

          <div className="task-detail-row">
            <div className="task-detail-field">
              <label>PRIORITY</label>
              <p className="task-detail-value">
                <span className={`priority-badge priority-${task.priority}`}>
                  {priorityLabel[task.priority] || task.priority}
                </span>
              </p>
            </div>
            <div className="task-detail-field">
              <label>CATEGORY</label>
              <p className="task-detail-value">
                <span className={`category-badge category-${task.category}`}>
                  {categoryLabel(task.category)}
                </span>
              </p>
            </div>
            <div className="task-detail-field">
              <label>STATUS</label>
              <p className="task-detail-value">{statusLabel[task.status] || task.status}</p>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="task-detail-field">
              <label>ATTACHMENTS ({attachments.length})</label>
              <ul className="task-detail-attachments">
                {attachments.map((att, i) => (
                  <li key={i} className="attached-file-item">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{att.fileName}</span>
                    {att.fileUrl && att.fileType && att.fileType.startsWith("image/") && (
                      <div className="attachment-preview-inline">
                        <img src={att.fileUrl} alt={att.fileName} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="task-detail-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onEdit(task)}>
              Edit Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
