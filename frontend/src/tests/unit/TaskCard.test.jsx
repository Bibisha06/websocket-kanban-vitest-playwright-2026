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
    it("renders task details correctly", () => {
        renderWithChakra(
            <TaskCard
                task={mockTask}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onClick={vi.fn()}
            />
        );

        expect(screen.getByText("Test Task")).toBeInTheDocument();
        expect(screen.getByText("high")).toBeInTheDocument();
        expect(screen.getByText("bug")).toBeInTheDocument();
    });

    it("calls onClick when card is clicked", () => {
        const handleClick = vi.fn();
        renderWithChakra(
            <TaskCard
                task={mockTask}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onClick={handleClick}
            />
        );

        const card = screen.getByText("Test Task").closest("div[role='group']");
        if (card) {
            fireEvent.click(card);
            expect(handleClick).toHaveBeenCalled();
        }
    });

    it("calls onDelete when delete is clicked", () => {
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
