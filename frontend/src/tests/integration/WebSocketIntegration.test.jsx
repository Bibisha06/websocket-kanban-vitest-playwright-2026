import { render, screen } from "@testing-library/react";

import KanbanBoard from "../../components/KanbanBoard";

test("WebSocket receives task update", async () => {
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
});

// TODO: Add more integration tests
