import { render, screen, waitFor } from "@testing-library/react";
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
            setTimeout(() => callback([]), 0);
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
});
