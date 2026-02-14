import { render, screen } from "@testing-library/react";

import KanbanBoard from "../../components/KanbanBoard.jsx";

test("renders board title and columns", () => {
  render(
    <KanbanBoard
      tasks={[]}
      socket={null}
      loading={false}
      syncing={false}
      onSync={() => {}}
      onEditTask={() => {}}
      onDeleteTask={() => {}}
      onNewTask={() => {}}
    />
  );
  expect(screen.getByText("Development Board")).toBeInTheDocument();
  expect(screen.getByText("TO DO")).toBeInTheDocument();
  expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
  expect(screen.getByText("DONE")).toBeInTheDocument();
});

// TODO: Add more unit tests for individual components
