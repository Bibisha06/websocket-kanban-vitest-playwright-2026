import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
} from "@chakra-ui/react";
import io from "socket.io-client";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import TaskDetailModal from "./TaskDetailModal";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("sync:tasks", (syncedTasks) => {
      setTasks(syncedTasks);
      setLoading(false);
    });

    newSocket.on("task:created", (newTask) => {
      setTasks((prevTasks) => [newTask, ...prevTasks]);
    });

    newSocket.on("task:updated", (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    newSocket.on("task:moved", ({ task }) => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === task._id ? task : t))
      );
    });

    newSocket.on("task:deleted", (taskId) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    });

    newSocket.on("error", (errorData) => {
      setError(errorData.message);
      setTimeout(() => setError(null), 5000);
    });

    return () => newSocket.close();
  }, []);

  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter(t => t.status === "todo"),
      inprogress: tasks.filter(t => t.status === "inprogress"),
      done: tasks.filter(t => t.status === "done"),
    };
  }, [tasks]);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    // OPTIMISTIC UPDATE
    setTasks((prevTasks) => {
      const taskToMove = prevTasks.find(t => t._id === draggableId);
      if (!taskToMove) return prevTasks;

      const updatedTask = { ...taskToMove, status: newStatus };
      return prevTasks.map(t => t._id === draggableId ? updatedTask : t);
    });

    if (socket) {
      socket.emit("task:move", { taskId: draggableId, newStatus });
    }
  }, [socket]);

  const handleCreateTask = useCallback((taskData) => {
    if (socket) socket.emit("task:create", taskData);
    setShowTaskForm(false);
  }, [socket]);

  const handleUpdateTask = useCallback((taskData) => {
    if (socket) socket.emit("task:update", taskData);
    setEditingTask(null);
  }, [socket]);

  const handleDeleteTask = useCallback((taskId) => {
    if (socket && window.confirm("Are you sure you want to delete this task?")) {
      socket.emit("task:delete", taskId);
    }
  }, [socket]);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
  }, []);

  const handleViewTask = useCallback((task) => {
    setSelectedTask(task);
  }, []);

  const columns = [
    { id: "todo", title: "To Do", color: "blue" },
    { id: "inprogress", title: "In Progress", color: "orange" },
    { id: "done", title: "Done", color: "green" },
  ];

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh" bg="gray.900">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color="gray.400">Loading tasks...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100vh" bg="gray.900" overflow="hidden">
      <Box p={6} pb={4}>
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="white">
            Task Management Board
          </Heading>
          <HStack spacing={3}>
            <Button
              colorScheme="brand"
              onClick={() => setShowTaskForm(true)}
              _hover={{ boxShadow: "0 0 20px rgba(255, 0, 255, 0.5)" }}
            >
              + Add New Task
            </Button>
            <Button
              variant="outline"
              colorScheme="accent"
              onClick={() => socket && socket.emit("sync:request")}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>

        {error && (
          <Alert status="error" bg="red.900" borderColor="red.500" mt={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Flex gap={4} px={6} pb={6} flex="1" overflow="hidden">
          {columns.map((column) => {
            const columnTasks = tasksByStatus[column.id] || [];
            return (
              <Flex
                key={column.id}
                direction="column"
                flex="1"
                maxW="400px"
                bg="gray.800"
                borderRadius="lg"
                border="1px"
                borderColor="gray.700"
                overflow="hidden"
              >
                <Flex
                  justify="space-between"
                  align="center"
                  p={4}
                  borderBottom="2px"
                  borderColor={`${column.color}.500`}
                  flexShrink={0}
                >
                  <Heading size="md" color="white">
                    {column.title}
                  </Heading>
                  <Badge
                    colorScheme={column.color}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {columnTasks.length}
                  </Badge>
                </Flex>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <VStack
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      spacing={3}
                      p={4}
                      flex="1"
                      overflowY="auto"
                      bg={snapshot.isDraggingOver ? "whiteAlpha.50" : "transparent"}
                      transition="background 0.2s"
                      sx={{
                        "&::-webkit-scrollbar": {
                          width: "8px",
                        },
                        "&::-webkit-scrollbar-track": {
                          bg: "gray.900",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          bg: "gray.600",
                          borderRadius: "full",
                        },
                      }}
                    >
                      {columnTasks.length === 0 ? (
                        <Text color="gray.500" fontSize="sm" textAlign="center" mt={8}>
                          No tasks in this column
                        </Text>
                      ) : (
                        columnTasks.map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                w="full"
                                opacity={snapshot.isDragging ? 0.8 : 1}
                                transform={snapshot.isDragging ? "rotate(2deg)" : "none"}
                                transition="all 0.2s"
                              >
                                <TaskCard
                                  task={task}
                                  onEdit={handleEditTask}
                                  onDelete={handleDeleteTask}
                                  onClick={() => handleViewTask(task)}
                                />
                              </Box>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </VStack>
                  )}
                </Droppable>
              </Flex>
            );
          })}
        </Flex>
      </DragDropContext>

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

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={(task) => {
            setSelectedTask(null);
            setEditingTask(task);
          }}
        />
      )}
    </Flex>
  );
}

export default KanbanBoard;
