import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import Layout from "./components/Layout";
import KanbanBoard from "./components/KanbanBoard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import TaskForm from "./components/TaskForm";
import TaskDetailModal from "./components/TaskDetailModal";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AuthenticatedApp() {
  const [view, setView] = useState("board");
  const [tasks, setTasks] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("sync:tasks", (syncedTasks) => {
      setTasks(syncedTasks);
      setLoading(false);
      setSyncing(false);
    });

    newSocket.on("task:created", (newTask) => {
      setTasks((prev) => [newTask, ...prev]);
    });

    newSocket.on("task:updated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    });

    newSocket.on("task:moved", ({ task }) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    });

    newSocket.on("task:deleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    });

    newSocket.on("error", (errorData) => {
      setError(errorData.message);
      setTimeout(() => setError(null), 5000);
    });

    return () => newSocket.close();
  }, []);

  const handleSync = () => {
    if (socket) {
      setSyncing(true);
      socket.emit("sync:request");
    }
  };

  const handleCreateTask = (taskData) => {
    if (socket) socket.emit("task:create", taskData);
    setShowTaskForm(false);
  };

  const handleUpdateTask = (taskData) => {
    if (socket) socket.emit("task:update", taskData);
    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setViewingTask(null);
    setEditingTask(task);
  };

  const handleViewTask = (task) => {
    setViewingTask(task);
  };

  const handleDeleteTask = (taskId) => {
    if (socket && window.confirm("Are you sure you want to delete this task?")) {
      socket.emit("task:delete", taskId);
    }
  };

  return (
    <div className="App">
      <Layout
        currentView={view}
        onNavigate={setView}
        onNewTask={() => setShowTaskForm(true)}
      >
        {error && <div className="error-message">{error}</div>}

        {view === "board" && (
          <KanbanBoard
            tasks={tasks}
            setTasks={setTasks}
            socket={socket}
            loading={loading}
            syncing={syncing}
            onSync={handleSync}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onViewTask={handleViewTask}
            onNewTask={() => setShowTaskForm(true)}
          />
        )}

        {view === "analytics" && <AnalyticsDashboard tasks={tasks} user={user} />}
      </Layout>

      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={handleEditTask}
        />
      )}

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

function App() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <AuthenticatedApp />
      </SignedIn>
    </>
  );
}

export default App;
