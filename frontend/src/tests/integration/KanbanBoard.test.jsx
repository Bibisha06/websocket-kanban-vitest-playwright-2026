import { render, screen, fireEvent } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import KanbanBoard from "../../components/KanbanBoard";
import { describe, it, expect, vi } from "vitest";

// Mock resize observer
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock @hello-pangea/dnd
vi.mock("@hello-pangea/dnd", () => ({
    DragDropContext: ({ children }) => <div>{children}</div>,
    Droppable: ({ children }) => children(
        { draggableProps: {}, innerRef: vi.fn() },
        { isDraggingOver: false }
    ),
    Draggable: ({ children }) => children(
        { draggableProps: {}, dragHandleProps: {}, innerRef: vi.fn() },
        { isDragging: false }
    ),
}));

// Mock TaskCard to simplify testing
vi.mock("../../components/TaskCard", () => ({
    default: ({ task, onEdit, onDelete }) => (
        <div data-testid="task-card">
            {task.title}
            <button onClick={() => onEdit(task)}>Edit</button>
            <button onClick={() => onDelete(task._id)}>Delete</button>
        </div>
    ),
}));

const mockTasks = [
    { _id: "1", title: "Task 1", status: "todo", priority: "high", category: "bug" },
    { _id: "2", title: "Task 2", status: "inprogress", priority: "medium", category: "feature" },
    { _id: "3", title: "Task 3", status: "done", priority: "low", category: "enhancement" },
];

const renderWithChakra = (ui) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe("KanbanBoard", () => {
    it("renders all columns", () => {
        renderWithChakra(<KanbanBoard tasks={[]} />);
        expect(screen.getByText("To Do")).toBeInTheDocument();
        expect(screen.getByText("In Progress")).toBeInTheDocument();
        expect(screen.getByText("Done")).toBeInTheDocument();
    });

    it("renders tasks in correct columns", () => {
        renderWithChakra(<KanbanBoard tasks={mockTasks} />);
        expect(screen.getByText("Task 1")).toBeInTheDocument();
        expect(screen.getByText("Task 2")).toBeInTheDocument();
        expect(screen.getByText("Task 3")).toBeInTheDocument();
    });

    it("calls onNewTask when add button is clicked", () => {
        const handleNewTask = vi.fn();
        renderWithChakra(<KanbanBoard tasks={[]} onNewTask={handleNewTask} />);

        const buttons = screen.getAllByRole("button");
        const addButton = buttons.find(b => !b.textContent.includes("Sync"));

        if (addButton) {
            fireEvent.click(addButton);
            expect(handleNewTask).toHaveBeenCalled();
        } else {
            throw new Error("Add button not found in render");
        }
    });
});
