import React, { useState, useRef, useEffect } from "react";

function TaskCard({ task, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const attachmentCount = task.attachments?.length ?? 0;
  const assigneeInitials = task.assignee
    ? String(task.assignee).slice(0, 2).toUpperCase()
    : "—";

  const priorityLabel = {
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
  }[task.priority] || task.priority;

  const categoryLabel =
    task.category && task.category.charAt(0).toUpperCase() + task.category.slice(1);

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        <div className="task-card-menu" ref={menuRef}>
          <button
            type="button"
            className="btn-icon task-menu-trigger"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            title="Options"
            aria-label="Task options"
          >
            <span className="ellipsis">⋮</span>
          </button>
          {menuOpen && (
            <div className="task-dropdown">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                  setMenuOpen(false);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task._id);
                  setMenuOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="task-card-badges">
        <span className={`priority-badge priority-${task.priority}`}>
          <span className="priority-dot" />
          {priorityLabel}
        </span>
        <span className={`category-badge category-${task.category}`}>
          {categoryLabel}
        </span>
      </div>

      <div className="task-card-footer">
        <div className="task-card-meta">
          {attachmentCount > 0 && (
            <span className="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              {attachmentCount}
            </span>
          )}
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            0
          </span>
        </div>
        <span className="task-assignee">{assigneeInitials}</span>
      </div>
    </div>
  );
}

export default TaskCard;
