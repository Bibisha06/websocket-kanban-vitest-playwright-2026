import { render, screen, fireEvent } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import TaskCard from "../../components/TaskCard";
import { describe, it, expect, vi } from "vitest";

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

const mockTask = {
    _id: "1",
    title: "Test Task",
    priority: "high",
    category: "bug",
    status: "todo",
    assignee: "Test User",
    attachments: [],
};

const renderWithChakra = (ui) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe("TaskCard", () => {
    it("renders priority and category badges with correct text", () => {
        renderWithChakra(
            <TaskCard
                task={mockTask}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onClick={vi.fn()}
            />
        );

        expect(screen.getByText("high")).toBeInTheDocument();
        expect(screen.getByText("bug")).toBeInTheDocument();
    });

    it("displays attachment indicator when task has attachments", () => {
        const taskWithAttachments = { ...mockTask, attachments: [{ fileName: "test.jpg" }] };
        renderWithChakra(
            <TaskCard
                task={taskWithAttachments}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onClick={vi.fn()}
            />
        );

        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("calls onEdit when edit is clicked in menu", () => {
        const handleEdit = vi.fn();
        renderWithChakra(
            <TaskCard
                task={mockTask}
                onEdit={handleEdit}
                onDelete={vi.fn()}
                onClick={vi.fn()}
            />
        );

        const menuButton = screen.getByLabelText("Options");
        fireEvent.click(menuButton);

        const editButton = screen.getByText("Edit");
        fireEvent.click(editButton);

        expect(handleEdit).toHaveBeenCalledWith(mockTask);
    });

    it("calls onDelete when delete is clicked in menu", () => {
        const handleDelete = vi.fn();
        renderWithChakra(
            <TaskCard
                task={mockTask}
                onEdit={vi.fn()}
                onDelete={handleDelete}
                onClick={vi.fn()}
            />
        );

        const menuButton = screen.getByLabelText("Options");
        fireEvent.click(menuButton);

        const deleteButton = screen.getByText("Delete");
        fireEvent.click(deleteButton);

        expect(handleDelete).toHaveBeenCalledWith("1");
    });
});
