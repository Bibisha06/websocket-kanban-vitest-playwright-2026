require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Task = require("./models/Task");

const app = express();
app.use(express.json());

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kanban";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const ALLOWED_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
  "category",
  "attachments",
  "assignee",
];

io.on("connection", async (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    socket.emit("sync:tasks", tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    socket.emit("error", { message: "Failed to fetch tasks" });
  }

  socket.on("task:create", async (taskData, callback) => {
    try {
      const status = taskData.status || "todo";
      const newTask = await Task.create({
        title: taskData.title || "Untitled Task",
        description: taskData.description || "",
        status,
        priority: taskData.priority || "medium",
        category: taskData.category || "feature",
        attachments: taskData.attachments || [],
        assignee: taskData.assignee || null,
        statusHistory: [{ status, changedAt: new Date() }],
      });

      io.emit("task:created", newTask);
      callback?.({ status: "ok", task: newTask });
    } catch (error) {
      console.error("Error creating task:", error);
      socket.emit("error", { message: "Failed to create task" });
      callback?.({ status: "error", message: "Failed to create task" });
    }
  });

  socket.on("task:update", async (taskData, callback) => {
    try {
      const taskId = taskData._id || taskData.id;
      if (!taskId) {
        return callback?.({
          status: "error",
          message: "Task ID is required",
        });
      }

      const current = await Task.findById(taskId).lean();
      if (!current) {
        return callback?.({ status: "error", message: "Task not found" });
      }

      const setFields = {};
      for (const field of ALLOWED_FIELDS) {
        if (taskData[field] !== undefined) {
          setFields[field] = taskData[field];
        }
      }

      const updateDoc = { $set: setFields };
      if (taskData.status !== undefined && taskData.status !== current.status) {
        updateDoc.$push = { statusHistory: { status: taskData.status, changedAt: new Date() } };
        if (taskData.status === "inprogress") setFields.startedAt = new Date();
        if (taskData.status === "done") setFields.completedAt = new Date();
      }

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        updateDoc,
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return callback?.({
          status: "error",
          message: "Task not found",
        });
      }

      io.emit("task:updated", updatedTask);
      callback?.({ status: "ok", task: updatedTask });
    } catch (error) {
      console.error("Error updating task:", error);
      socket.emit("error", { message: "Failed to update task" });
      callback?.({ status: "error", message: "Failed to update task" });
    }
  });

  socket.on("task:move", async ({ taskId, newStatus }, callback) => {
    try {
      if (!taskId || !newStatus) {
        return callback?.({
          status: "error",
          message: "taskId and newStatus are required",
        });
      }

      const now = new Date();
      const update = {
        status: newStatus,
        $push: { statusHistory: { status: newStatus, changedAt: now } },
      };
      if (newStatus === "inprogress") update.startedAt = now;
      if (newStatus === "done") update.completedAt = now;

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        update,
        { new: true }
      );

      if (!updatedTask) {
        return callback?.({
          status: "error",
          message: "Task not found",
        });
      }

      io.emit("task:moved", { task: updatedTask });
      callback?.({ status: "ok", task: updatedTask });
    } catch (error) {
      console.error("Error moving task:", error);
      socket.emit("error", { message: "Failed to move task" });
      callback?.({ status: "error", message: "Failed to move task" });
    }
  });

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

      io.emit("task:deleted", taskId);
      callback?.({ status: "ok", taskId });
    } catch (error) {
      console.error("Error deleting task:", error);
      socket.emit("error", { message: "Failed to delete task" });
      callback?.({ status: "error", message: "Failed to delete task" });
    }
  });

  const handleSync = async (callback) => {
    try {
      const tasks = await Task.find().sort({ createdAt: -1 });
      socket.emit("sync:tasks", tasks);
      callback?.({ status: "ok" });
    } catch (error) {
      console.error("Error syncing tasks:", error);
      socket.emit("error", { message: "Failed to sync tasks" });
      callback?.({ status: "error", message: "Failed to sync tasks" });
    }
  };
  socket.on("sync:request", handleSync);
  socket.on("sync:tasks", handleSync);

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
