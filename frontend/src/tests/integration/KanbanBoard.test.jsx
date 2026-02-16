import { render, screen, waitFor, act } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import KanbanBoard from "../../components/KanbanBoard";
import { describe, it, expect, vi, beforeEach } from "vitest";

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.mock("@hello-pangea/dnd", () => ({
    DragDropContext: ({ children }) => <div>{children}</div>,
    Droppable: ({ children }) => children(
        { droppableProps: {}, innerRef: vi.fn() },
        { isDraggingOver: false }
    ),
    Draggable: ({ children }) => children(
        { draggableProps: {}, dragHandleProps: {}, innerRef: vi.fn() },
        { isDragging: false }
    ),
}));

const mockSocket = {
    on: vi.fn((event, callback) => {
        if (event === "sync:tasks") {
            setTimeout(() => {
                act(() => {
                    callback([]);
                });
            }, 0);
        }
    }),
    emit: vi.fn(),
    close: vi.fn(),
};

vi.mock("socket.io-client", () => ({
    default: vi.fn(() => mockSocket),
}));

vi.mock("../../components/TaskCard", () => ({
    default: ({ task }) => <div data-testid="task-card">{task.title}</div>,
}));

vi.mock("../../components/TaskForm", () => ({
    default: () => <div data-testid="task-form">Task Form</div>,
}));

vi.mock("../../components/ProgressChart", () => ({
    default: () => <div data-testid="progress-chart">Progress Chart</div>,
}));

const renderWithChakra = (ui) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe("KanbanBoard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state initially", () => {
        renderWithChakra(<KanbanBoard />);
        expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
    });

    it("renders all columns after loading", async () => {
        renderWithChakra(<KanbanBoard />);

        await waitFor(() => {
            expect(screen.getByText("To Do")).toBeInTheDocument();
        });

        expect(screen.getByText("In Progress")).toBeInTheDocument();
        expect(screen.getByText("Done")).toBeInTheDocument();
    });

    it("adds a task card when task:created event is received", async () => {
        renderWithChakra(<KanbanBoard />);

        await waitFor(() => expect(screen.queryByText("Loading tasks...")).not.toBeInTheDocument());

        const newTask = { _id: "new-1", title: "New Realtime Task", status: "todo", priority: "low", category: "feature" };

        const createdCallback = mockSocket.on.mock.calls.find(call => call[0] === "task:created")[1];
        act(() => {
            createdCallback(newTask);
        });

        await waitFor(() => {
            expect(screen.getByText("New Realtime Task")).toBeInTheDocument();
        });
    });

    it("removes a task card when task:deleted event is received", async () => {
        const existingTask = { _id: "del-1", title: "Deleting Task", status: "todo", priority: "low", category: "feature" };

        mockSocket.on.mockImplementation((event, callback) => {
            if (event === "sync:tasks") {
                setTimeout(() => {
                    act(() => {
                        callback([existingTask]);
                    });
                }, 0);
            }
        });

        renderWithChakra(<KanbanBoard />);

        await waitFor(() => expect(screen.getByText("Deleting Task")).toBeInTheDocument());

        const deletedCallback = mockSocket.on.mock.calls.find(call => call[0] === "task:deleted")[1];
        act(() => {
            deletedCallback("del-1");
        });

        await waitFor(() => {
            expect(screen.queryByText("Deleting Task")).not.toBeInTheDocument();
        });
    });

    it("moves a task card when task:moved event is received (Multi-client Sync)", async () => {
        const movingTask = { _id: "move-1", title: "Moving Task", status: "todo", priority: "low", category: "feature" };

        mockSocket.on.mockImplementation((event, callback) => {
            if (event === "sync:tasks") {
                setTimeout(() => {
                    act(() => {
                        callback([movingTask]);
                    });
                }, 0);
            }
        });

        renderWithChakra(<KanbanBoard />);
        await waitFor(() => expect(screen.getByText("Moving Task")).toBeInTheDocument());

        const movedTask = { ...movingTask, status: "inprogress" };
        const movedCallback = mockSocket.on.mock.calls.find(call => call[0] === "task:moved")[1];
        act(() => {
            movedCallback({ task: movedTask });
        });

        expect(screen.getByText("Moving Task")).toBeInTheDocument();
    });
});
