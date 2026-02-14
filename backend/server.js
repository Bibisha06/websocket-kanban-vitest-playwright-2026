require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Task = require("./models/Task");

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// ---------------------
// MongoDB Connection
// ---------------------
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kanban";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// ---------------------
// Allowed Update Fields
// ---------------------
const ALLOWED_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
  "category",
  "attachments",
];

// ---------------------
// Socket Logic
// ---------------------
io.on("connection", async (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // ---------------------
  // INITIAL SYNC ON CONNECT
  // ---------------------
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    socket.emit("sync:tasks", tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    socket.emit("task:error", {
      action: "sync",
      message: "Failed to fetch tasks",
    });
  }

  // ---------------------
  // CREATE TASK
  // ---------------------
  socket.on("task:create", async (taskData, callback) => {
    try {
      const newTask = await Task.create({
        title: taskData.title || "Untitled Task",
        description: taskData.description || "",
        status: taskData.status || "todo",
        priority: taskData.priority || "medium",
        category: taskData.category || "feature",
        attachments: taskData.attachments || [],
      });

      // Broadcast to ALL clients
      io.emit("task:create", newTask);

      callback?.({ status: "ok", task: newTask });
    } catch (error) {
      console.error("Error creating task:", error);
      callback?.({ status: "error", message: "Failed to create task" });
    }
  });

  // ---------------------
  // UPDATE TASK
  // ---------------------
  socket.on("task:update", async (taskData, callback) => {
    try {
      const taskId = taskData._id || taskData.id;
      if (!taskId) {
        return callback?.({
          status: "error",
          message: "Task ID is required",
        });
      }

      // Only allow specific fields
      const updates = {};
      for (const field of ALLOWED_FIELDS) {
        if (taskData[field] !== undefined) {
          updates[field] = taskData[field];
        }
      }

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return callback?.({
          status: "error",
          message: "Task not found",
        });
      }

      io.emit("task:update", updatedTask);

      callback?.({ status: "ok", task: updatedTask });
    } catch (error) {
      console.error("Error updating task:", error);
      callback?.({ status: "error", message: "Failed to update task" });
    }
  });

  // ---------------------
  // MOVE TASK
  // ---------------------
  socket.on("task:move", async ({ taskId, newStatus }, callback) => {
    try {
      if (!taskId || !newStatus) {
        return callback?.({
          status: "error",
          message: "taskId and newStatus are required",
        });
      }

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { status: newStatus },
        { new: true }
      );

      if (!updatedTask) {
        return callback?.({
          status: "error",
          message: "Task not found",
        });
      }

      io.emit("task:move", updatedTask);

      callback?.({ status: "ok", task: updatedTask });
    } catch (error) {
      console.error("Error moving task:", error);
      callback?.({ status: "error", message: "Failed to move task" });
    }
  });

  // ---------------------
  // DELETE TASK
  // ---------------------
  socket.on("task:delete", async (taskId, callback) => {
    try {
      if (!taskId) {
        return callback?.({
          status: "error",
          message: "Task ID is required",
        });
      }

      const deletedTask = await Task.findByIdAndDelete(taskId);

      if (!deletedTask) {
        return callback?.({
          status: "error",
          message: "Task not found",
        });
      }

      io.emit("task:delete", taskId);

      callback?.({ status: "ok", taskId });
    } catch (error) {
      console.error("Error deleting task:", error);
      callback?.({ status: "error", message: "Failed to delete task" });
    }
  });

  // ---------------------
  // MANUAL SYNC REQUEST
  // ---------------------
  socket.on("sync:tasks", async (callback) => {
    try {
      const tasks = await Task.find().sort({ createdAt: -1 });
      socket.emit("sync:tasks", tasks);
      callback?.({ status: "ok" });
    } catch (error) {
      console.error("Error syncing tasks:", error);
      callback?.({ status: "error", message: "Failed to sync tasks" });
    }
  });

  // ---------------------
  // DISCONNECT
  // ---------------------
  socket.on("disconnect", () => {
    console.log(` User disconnected: ${socket.id}`);
  });
});

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
