import React, { useState, useEffect } from "react";

const IconBoard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconUpload = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    category: "feature",
    attachments: [],
  });

  const [previewFiles, setPreviewFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (task) {
      setFormData({
        _id: task._id,
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        category: task.category || "feature",
        attachments: task.attachments || [],
      });
      setPreviewFiles(task.attachments || []);
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const processFiles = (files) => {
    const list = Array.from(files || []);
    list.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return; // 10MB
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment = {
          fileName: file.name,
          fileUrl: event.target.result,
          fileType: file.type,
          fileSize: file.size,
        };
        setPreviewFiles((prev) => [...prev, newAttachment]);
        setFormData((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemoveFile = (index) => {
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a task title");
      return;
    }
    onSubmit(formData);
  };

  const isEdit = Boolean(task);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-task-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="modal-title-icon">
              <IconBoard />
            </span>
            {isEdit ? "Edit Task" : "New Task Form"}
          </h2>
          <button type="button" className="close-btn" onClick={onCancel} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">TASK TITLE {!isEdit && "*"}</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Redesign landing page hero section"
              required
              className="input-underline"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">PRIORITY</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="select-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="category">CATEGORY</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select-input"
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="enhancement">Enhancement</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">DESCRIPTION</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details about this task..."
              className="textarea-input"
              rows={4}
            />
          </div>

          {isEdit && (
            <div className="form-group">
              <label htmlFor="status">STATUS</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select-input"
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <div className="attachments-label-row">
              <label>ATTACHMENTS</label>
              {previewFiles.length > 0 && (
                <span className="attachments-count">{previewFiles.length} files attached</span>
              )}
            </div>
            <div
              className={`file-upload-zone ${dragOver ? "drag-over" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              <IconUpload />
              <p className="upload-text">Click or drag files to upload</p>
              <p className="upload-hint">PDF, PNG, JPG, DOCX up to 10MB</p>
            </div>

            {previewFiles.length > 0 && (
              <div className="attached-files-list">
                {previewFiles.map((file, index) => (
                  <div key={index} className="attached-file-item">
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <span className="file-name">{file.fileName}</span>
                      <span className="file-size">
                        {formatFileSize(file.fileSize)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isEdit && (
              <p className="last-edited">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Last edited 2 hours ago
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
