import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

function KanbanBoard({
  tasks = [],
  socket,
  loading,
  syncing,
  onSync,
  onEditTask,
  onDeleteTask,
  onViewTask,
  onNewTask,
}) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    if (socket) {
      socket.emit("task:move", { taskId: draggableId, newStatus: destination.droppableId });
    }
  };

  const getTasksByStatus = (status) =>
    tasks.filter((task) => task.status === status);

  const columns = [
    { id: "todo", title: "TO DO" },
    { id: "inprogress", title: "IN PROGRESS" },
    { id: "done", title: "DONE" },
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <div className="board-header">
        <div className="board-title-block">
          <h1 className="board-title">Development Board</h1>
          <p className="board-description">
            Manage and track engineering tasks for Q3 roadmap.
          </p>
        </div>
        <div className="board-actions">
          <button
            type="button"
            className={`btn btn-sync ${syncing ? "syncing" : ""}`}
            onClick={onSync}
            disabled={syncing}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <button type="button" className="btn btn-add-column">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Column
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div key={column.id} className="kanban-column">
                <div className="column-header">
                  <h3 className="column-title">{column.title}</h3>
                  <span className="column-meta">
                    <span className="task-count">{columnTasks.length}</span>
                    <button
                      type="button"
                      className="column-add-btn"
                      onClick={onNewTask}
                      title="Add task"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`tasks-list ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="task-card-wrapper"
                              onClick={() => onViewTask?.(task)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onViewTask?.(task);
                                }
                              }}
                              aria-label={`View task: ${task.title}`}
                            >
                              <TaskCard
                                task={task}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnTasks.length === 0 && (
                        <div className="empty-drop-zone" />
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <div className="board-footer">
        <span className="footer-updated">UPDATED 2M AGO</span>
        <span className="footer-tasks">{tasks.length} TOTAL TASKS</span>
        <span className="footer-done">
          {getTasksByStatus("done").length} DONE {getTasksByStatus("inprogress").length} IN PROGRESS
        </span>
      </div>
    </div>
  );
}

export default KanbanBoard;
