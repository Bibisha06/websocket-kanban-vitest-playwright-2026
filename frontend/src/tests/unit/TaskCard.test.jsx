import { render, screen, fireEvent } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import TaskCard from "../../components/TaskCard";
import { describe, it, expect, vi } from "vitest";

// Mock resize observer which is used by Chakra
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
};

const renderWithChakra = (ui) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe("TaskCard", () => {
    it("renders task details correctly", () => {
        renderWithChakra(
            <TaskCard
                task={mockTask}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText("Test Task")).toBeInTheDocument();
        expect(screen.getByText("high")).toBeInTheDocument();
        expect(screen.getByText("bug")).toBeInTheDocument();
    });

    it("calls onEdit when edit is clicked", () => {
        const handleEdit = vi.fn();
        renderWithChakra(
            <TaskCard
                task={mockTask}
                onEdit={handleEdit}
                onDelete={vi.fn()}
            />
        );

        // Open menu
        const menuButton = screen.getByLabelText("Options");
        fireEvent.click(menuButton);

        // Click edit
        const editButton = screen.getByText("Edit");
        fireEvent.click(editButton);

        expect(handleEdit).toHaveBeenCalledWith(mockTask);
    });

    it("calls onDelete when delete is clicked", () => {
        const handleDelete = vi.fn();
        renderWithChakra(
            <TaskCard
                task={mockTask}
                onEdit={vi.fn()}
                onDelete={handleDelete}
            />
        );

        // Open menu
        const menuButton = screen.getByLabelText("Options");
        fireEvent.click(menuButton);

        // Click delete
        const deleteButton = screen.getByText("Delete");
        fireEvent.click(deleteButton);

        expect(handleDelete).toHaveBeenCalledWith("1");
    });
});
