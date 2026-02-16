import { render, screen, within } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";
import { describe, it, expect, vi } from "vitest";

vi.mock("recharts", () => ({
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => null,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div data-testid="area" />,
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
}));

const mockTasks = Array.from({ length: 20 }, (_, i) => ({
    _id: `${i}`,
    status: i < 6 ? "todo" : i < 13 ? "inprogress" : "done",
    category: "feature",
}));

const mockUser = { firstName: "Test", imageUrl: "test.jpg" };

describe("AnalyticsDashboard", () => {
    it("renders the dashboard with correct task counts", () => {
        render(
            <ChakraProvider>
                <AnalyticsDashboard tasks={mockTasks} user={mockUser} />
            </ChakraProvider>
        );

        expect(screen.getByText("System Analytics")).toBeInTheDocument();

        const activeStat = screen.getByText("Total Active Tasks").closest(".chakra-stat");
        expect(within(activeStat).getByText("13")).toBeInTheDocument();

        const completionStat = screen.getByText("Completion Rate").closest(".chakra-stat");
        expect(within(completionStat).getByText("35%")).toBeInTheDocument();
    });

    it("updates graph data when tasks move", () => {
        const { rerender } = render(
            <ChakraProvider>
                <AnalyticsDashboard tasks={mockTasks} user={mockUser} />
            </ChakraProvider>
        );


        const initialStat = screen.getByText("Completion Rate").closest(".chakra-stat");
        expect(within(initialStat).getByText("35%")).toBeInTheDocument();

        const updatedTasks = mockTasks.map((t, i) => ({
            ...t,
            status: i < 5 ? "todo" : i < 10 ? "inprogress" : "done"
        }));

        rerender(
            <ChakraProvider>
                <AnalyticsDashboard tasks={updatedTasks} user={mockUser} />
            </ChakraProvider>
        );

        const updatedStat = screen.getByText("Completion Rate").closest(".chakra-stat");
        expect(within(updatedStat).getByText("50%")).toBeInTheDocument();
    });
});
