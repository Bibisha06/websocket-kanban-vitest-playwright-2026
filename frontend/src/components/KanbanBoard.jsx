import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import io from "socket.io-client";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import ProgressChart from "./ProgressChart";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // WebSocket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Listen for initial task sync
    newSocket.on("sync:tasks", (syncedTasks) => {
      setTasks(syncedTasks);
      setLoading(false);
    });

    // Listen for new tasks created by other users
    newSocket.on("task:created", (newTask) => {
      setTasks((prevTasks) => [newTask, ...prevTasks]);
    });

    // Listen for task updates
    newSocket.on("task:updated", (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    // Listen for task moves
    newSocket.on("task:moved", ({ task }) => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === task._id ? task : t))
      );
    });

    // Listen for task deletions
    newSocket.on("task:deleted", (taskId) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    });

    // Listen for errors
    newSocket.on("error", (errorData) => {
      setError(errorData.message);
      setTimeout(() => setError(null), 5000);
    });

    return () => newSocket.close();
  }, []);

  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    // Emit move event to server
    if (socket) {
      socket.emit("task:move", { taskId: draggableId, newStatus });
    }
  };

  // Handle task creation
  const handleCreateTask = (taskData) => {
    if (socket) {
      socket.emit("task:create", taskData);
    }
    setShowTaskForm(false);
  };

  // Handle task update
  const handleUpdateTask = (taskData) => {
    if (socket) {
      socket.emit("task:update", taskData);
    }
    setEditingTask(null);
  };

  // Handle task deletion
  const handleDeleteTask = (taskId) => {
    if (socket && window.confirm("Are you sure you want to delete this task?")) {
      socket.emit("task:delete", taskId);
    }
  };

  // Handle task edit
  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  // Get tasks by status
  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  // Column configuration
  const columns = [
    { id: "todo", title: "To Do", color: "todo" },
    { id: "inprogress", title: "In Progress", color: "inprogress" },
    { id: "done", title: "Done", color: "done" },
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      {/* Header */}
      <div className="kanban-header">
        <h2>Task Management Board</h2>
        <div className="kanban-controls">
          <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>
            + Add New Task
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => socket && socket.emit("sync:request")}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div key={column.id} className="kanban-column">
                <div className={`column-header ${column.color}`}>
                  <h3 className="column-title">{column.title}</h3>
                  <span className="task-count">{columnTasks.length}</span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="tasks-list"
                    >
                      {columnTasks.length === 0 ? (
                        <div className="empty-state">
                          No tasks in this column
                        </div>
                      ) : (
                        columnTasks.map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  onEdit={handleEditTask}
                                  onDelete={handleDeleteTask}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Progress Chart */}
      <ProgressChart tasks={tasks} />

      {/* Task Form Modal */}
      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

export default KanbanBoard;
