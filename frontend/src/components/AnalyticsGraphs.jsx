import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, SimpleGrid, Heading, Text } from "@chakra-ui/react";

const CHART_COLORS = {
  todo: "#718096", // Gray-500
  inprogress: "#d000d0", // Brand-500 (Neon Magenta)
  done: "#48BB78", // Green-400 (Neon Green)
  low: "#718096", // Gray
  medium: "#805AD5", // Accent-400 (Neon Purple)
  high: "#d000d0", // Brand-500 (Neon Magenta)
};

function toDateKey(d) {
  const date = new Date(d);
  return date.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (24 * 60 * 60 * 1000));
}

function getCompletedAt(task) {
  if (task.completedAt) return new Date(task.completedAt);
  if (task.status === "done" && task.updatedAt) return new Date(task.updatedAt);
  return null;
}

function getStartedAt(task) {
  if (task.startedAt) return new Date(task.startedAt);
  if (task.status === "inprogress" && task.updatedAt) return new Date(task.updatedAt);
  return null;
}

export default function AnalyticsGraphs({ tasks }) {
  const now = useMemo(() => new Date(), []);
  const windowDays = 30;
  const windowStart = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - windowDays);
    return d;
  }, [now]);

  const dateBuckets = useMemo(() => {
    const buckets = [];
    for (let i = 0; i <= windowDays; i++) {
      const d = new Date(windowStart);
      d.setDate(d.getDate() + i);
      buckets.push(toDateKey(d));
    }
    return buckets;
  }, [windowStart]);

  // --- Cumulative Flow Diagram: tasks in each status over time (from statusHistory or inferred)
  const cfdData = useMemo(() => {
    const byDate = {};
    dateBuckets.forEach((key) => {
      byDate[key] = { date: key, todo: 0, inprogress: 0, done: 0 };
    });
    tasks.forEach((task) => {
      const history = task.statusHistory || [];
      const created = task.createdAt ? new Date(task.createdAt) : now;
      const completedAt = getCompletedAt(task);
      const startedAt = getStartedAt(task);
      dateBuckets.forEach((key) => {
        const d = new Date(key);
        if (d < created) return;
        let status = task.status;
        if (history.length) {
          const lastBefore = history.filter((h) => new Date(h.changedAt) <= d).pop();
          status = lastBefore ? lastBefore.status : task.status;
        } else {
          if (completedAt && d >= completedAt) status = "done";
          else if (startedAt && d >= startedAt) status = "inprogress";
          else if (d >= created) status = "todo";
        }
        if (status === "todo") byDate[key].todo += 1;
        else if (status === "inprogress") byDate[key].inprogress += 1;
        else byDate[key].done += 1;
      });
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks, dateBuckets, now]);

  // --- Burndown: remaining tasks over time (total - completed by date)
  const burndownData = useMemo(() => {
    const total = tasks.length;
    const completedByDate = {};
    dateBuckets.forEach((key) => (completedByDate[key] = 0));
    tasks.forEach((task) => {
      const completedAt = getCompletedAt(task);
      if (completedAt) {
        const key = toDateKey(completedAt);
        if (completedByDate[key] !== undefined) completedByDate[key] += 1;
      }
    });
    let cumulative = 0;
    return dateBuckets.map((date) => {
      cumulative += completedByDate[date] || 0;
      return { date, remaining: Math.max(0, total - cumulative), completed: cumulative };
    });
  }, [tasks, dateBuckets]);

  // --- Throughput: tasks completed per day
  const throughputData = useMemo(() => {
    const byDate = {};
    dateBuckets.forEach((key) => (byDate[key] = { date: key, count: 0 }));
    tasks.forEach((task) => {
      const completedAt = getCompletedAt(task);
      if (completedAt) {
        const key = toDateKey(completedAt);
        if (byDate[key]) byDate[key].count += 1;
      }
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks, dateBuckets]);

  // --- Lead Time: completedAt - createdAt (days) per task
  const leadTimeData = useMemo(() => {
    return tasks
      .filter((t) => t.status === "done")
      .map((t) => {
        const created = new Date(t.createdAt || t.updatedAt);
        const completed = getCompletedAt(t);
        const days = completed ? daysBetween(created, completed) : 0;
        return { name: (t.title || "Task").slice(0, 20), leadTime: days, fullTitle: t.title };
      })
      .slice(-15);
  }, [tasks]);

  // --- Cycle Time: completedAt - startedAt (days) per task
  const cycleTimeData = useMemo(() => {
    return tasks
      .filter((t) => t.status === "done")
      .map((t) => {
        const started = getStartedAt(t) || new Date(t.createdAt);
        const completed = getCompletedAt(t);
        const days = completed ? daysBetween(started, completed) : 0;
        return { name: (t.title || "Task").slice(0, 20), cycleTime: days, fullTitle: t.title };
      })
      .slice(-15);
  }, [tasks]);

  // --- WIP over time: in-progress count per day
  const wipData = useMemo(() => {
    return cfdData.map((row) => ({ date: row.date, wip: row.inprogress }));
  }, [cfdData]);

  // --- Aging WIP: current in-progress tasks, how long open (days since startedAt)
  const agingWipData = useMemo(() => {
    return tasks
      .filter((t) => t.status === "inprogress")
      .map((t) => {
        const started = getStartedAt(t) || new Date(t.createdAt || t.updatedAt);
        const days = daysBetween(started, now);
        return {
          name: (t.title || "Task").slice(0, 18),
          daysOpen: days,
          fullTitle: t.title,
        };
      })
      .sort((a, b) => b.daysOpen - a.daysOpen)
      .slice(0, 10);
  }, [tasks, now]);

  // --- Task distribution by assignee
  const assigneeData = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const key = t.assignee || "Unassigned";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, value: count }));
  }, [tasks]);

  // --- Task distribution by priority
  const priorityData = useMemo(() => {
    const map = { low: 0, medium: 0, high: 0 };
    tasks.forEach((t) => {
      const p = t.priority || "medium";
      map[p] = (map[p] || 0) + 1;
    });
    return [
      { name: "High", value: map.high, color: CHART_COLORS.high },
      { name: "Medium", value: map.medium, color: CHART_COLORS.medium },
      { name: "Low", value: map.low, color: CHART_COLORS.low },
    ].filter((d) => d.value > 0);
  }, [tasks]);

  // --- Flow Efficiency: (Cycle Time / Lead Time) * 100 per completed task
  const flowEfficiencyData = useMemo(() => {
    const withBoth = tasks
      .filter((t) => t.status === "done")
      .map((t) => {
        const created = new Date(t.createdAt || t.updatedAt);
        const started = getStartedAt(t) || created;
        const completed = getCompletedAt(t);
        if (!completed) return null;
        const lead = daysBetween(created, completed);
        const cycle = daysBetween(started, completed);
        const efficiency = lead > 0 ? Math.round((cycle / lead) * 100) : 100;
        return { name: (t.title || "Task").slice(0, 18), efficiency, fullTitle: t.title };
      })
      .filter(Boolean)
      .slice(-10);
    return withBoth;
  }, [tasks]);

  const avgLeadTime = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "done" && getCompletedAt(t));
    if (!completed.length) return 0;
    const sum = completed.reduce((acc, t) => {
      const created = new Date(t.createdAt || t.updatedAt);
      const completedAt = getCompletedAt(t);
      return acc + daysBetween(created, completedAt);
    }, 0);
    return (sum / completed.length).toFixed(1);
  }, [tasks]);

  const avgCycleTime = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "done" && getCompletedAt(t));
    if (!completed.length) return 0;
    const sum = completed.reduce((acc, t) => {
      const started = getStartedAt(t) || new Date(t.createdAt);
      const completedAt = getCompletedAt(t);
      return acc + daysBetween(started, completedAt);
    }, 0);
    return (sum / completed.length).toFixed(1);
  }, [tasks]);

  const avgFlowEfficiency = useMemo(() => {
    const withBoth = tasks
      .filter((t) => t.status === "done")
      .map((t) => {
        const created = new Date(t.createdAt || t.updatedAt);
        const started = getStartedAt(t) || created;
        const completed = getCompletedAt(t);
        if (!completed) return null;
        const lead = daysBetween(created, completed);
        const cycle = daysBetween(started, completed);
        return lead > 0 ? (cycle / lead) * 100 : 100;
      })
      .filter((v) => v != null);
    if (!withBoth.length) return "—";
    return `${(withBoth.reduce((a, b) => a + b, 0) / withBoth.length).toFixed(0)}%`;
  }, [tasks]);

  const chartProps = { margin: { top: 10, right: 10, left: 0, bottom: 0 } };
  const cartesian = <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />;
  const tooltipStyle = { backgroundColor: "#1A202C", borderRadius: "8px", border: "1px solid #2D3748", color: "#F7FAFC" };

  const GraphCard = ({ title, subtitle, children, fullWidth }) => (
    <Box
      bg="gray.800"
      p={6}
      borderRadius="xl"
      border="1px"
      borderColor="gray.700"
      boxShadow="lg"
      gridColumn={fullWidth ? "span 1 / -1" : "auto"}
      _hover={{ borderColor: "brand.500", boxShadow: "0 0 10px rgba(255, 0, 255, 0.2)" }}
      transition="all 0.2s"
    >
      <Heading size="md" mb={2} color="white">
        {title}
      </Heading>
      <Text fontSize="sm" color="gray.400" mb={6}>
        {subtitle}
      </Text>
      <Box h="250px" w="100%">
        {children}
      </Box>
    </Box>
  );

  return (
    <Box mt={8}>
      <Heading size="lg" mb={6} color="white">
        Charts & Workflow Insights
      </Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Cumulative Flow Diagram */}
        <GraphCard
          title="Cumulative Flow Diagram (CFD)"
          subtitle="Number of tasks in each workflow state over time. Detects bottlenecks."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cfdData} {...chartProps}>
              {cartesian}
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0AEC0" }} tickFormatter={(v) => v.slice(5)} stroke="#4A5568" />
              <YAxis tick={{ fontSize: 11, fill: "#A0AEC0" }} stroke="#4A5568" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, ""]} labelFormatter={(l) => l} />
              <Legend wrapperStyle={{ color: "#CBD5E0" }} />
              <Area type="monotone" dataKey="done" stackId="1" stroke={CHART_COLORS.done} fill={CHART_COLORS.done} fillOpacity={0.7} name="Done" />
              <Area type="monotone" dataKey="inprogress" stackId="1" stroke={CHART_COLORS.inprogress} fill={CHART_COLORS.inprogress} fillOpacity={0.7} name="In Progress" />
              <Area type="monotone" dataKey="todo" stackId="1" stroke={CHART_COLORS.todo} fill={CHART_COLORS.todo} fillOpacity={0.7} name="To Do" />
            </AreaChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Burndown Chart */}
        <GraphCard
          title="Burndown Chart"
          subtitle="Remaining tasks over time. Tracks completion progress."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={burndownData} {...chartProps}>
              {cartesian}
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0AEC0" }} tickFormatter={(v) => v.slice(5)} stroke="#4A5568" />
              <YAxis tick={{ fontSize: 11, fill: "#A0AEC0" }} stroke="#4A5568" />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => l} />
              <Legend wrapperStyle={{ color: "#CBD5E0" }} />
              <Line type="monotone" dataKey="remaining" stroke="#F56565" name="Remaining" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Throughput Chart */}
        <GraphCard
          title="Throughput Chart"
          subtitle="Tasks completed per day. Measures delivery rate."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={throughputData} {...chartProps}>
              {cartesian}
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0AEC0" }} tickFormatter={(v) => v.slice(5)} stroke="#4A5568" />
              <YAxis tick={{ fontSize: 11, fill: "#A0AEC0" }} stroke="#4A5568" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Completed"]} labelFormatter={(l) => l} />
              <Bar dataKey="count" fill="#d000d0" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Lead Time Chart */}
        <GraphCard
          title="Lead Time Chart"
          subtitle={`Time from creation to completion. Avg: ${avgLeadTime}d`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadTimeData} layout="vertical" margin={{ ...chartProps.margin, left: 20 }} {...chartProps}>
              {cartesian}
              <XAxis type="number" tick={{ fontSize: 11, fill: "#A0AEC0" }} stroke="#4A5568" />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: "#A0AEC0" }} stroke="#4A5568" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} days`, "Lead time"]} />
              <Bar dataKey="leadTime" fill="#805AD5" name="Lead time (days)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Cycle Time Chart */}
        <GraphCard
          title="Cycle Time Chart"
          subtitle={`Time from active start to completion. Avg: ${avgCycleTime}d`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cycleTimeData} layout="vertical" margin={{ ...chartProps.margin, left: 20 }} {...chartProps}>
              {cartesian}
              <XAxis type="number" tick={{ fontSize: 11, fill: "#A0AEC0" }} stroke="#4A5568" />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: "#A0AEC0" }} stroke="#4A5568" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} days`, "Cycle time"]} />
              <Bar dataKey="cycleTime" fill="#d000d0" name="Cycle time (days)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* WIP Chart */}
        <GraphCard
          title="Work In Progress (WIP)"
          subtitle="In-progress task count over time."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wipData} {...chartProps}>
              {cartesian}
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0AEC0" }} tickFormatter={(v) => v.slice(5)} stroke="#4A5568" />
              <YAxis tick={{ fontSize: 11, fill: "#A0AEC0" }} stroke="#4A5568" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "WIP"]} labelFormatter={(l) => l} />
              <Line type="monotone" dataKey="wip" stroke={CHART_COLORS.inprogress} name="In progress" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Aging WIP */}
        <GraphCard
          title="Aging WIP"
          subtitle="Days open for current in-progress tasks."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agingWipData} {...chartProps}>
              {cartesian}
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#A0AEC0" }} stroke="#4A5568" />
              <YAxis tick={{ fontSize: 11, fill: "#A0AEC0" }} stroke="#4A5568" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} days`, "Days open"]} />
              <Bar dataKey="daysOpen" fill="#DD6B20" name="Days open" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Task Distribution by Assignee */}
        <GraphCard
          title="Distribution by Assignee"
          subtitle="Workload per team member."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assigneeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#A0AEC0" }}
              >
                {assigneeData.map((_, i) => (
                  <Cell key={i} fill={["#d000d0", "#805AD5", "#B794F4", "#48BB78"][i % 4]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Tasks"]} />
            </PieChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Task Distribution by Priority */}
        <GraphCard
          title="Distribution by Priority"
          subtitle="Proportion of tasks by priority level."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#A0AEC0" }}
              >
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Tasks"]} />
            </PieChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Flow Efficiency */}
        <GraphCard
          title="Flow Efficiency"
          subtitle={`Active vs Lead Time. Avg: ${avgFlowEfficiency}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flowEfficiencyData} {...chartProps}>
              {cartesian}
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#A0AEC0" }} stroke="#4A5568" />
              <YAxis tick={{ fontSize: 11, fill: "#A0AEC0" }} unit="%" domain={[0, 100]} stroke="#4A5568" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Efficiency"]} />
              <Bar dataKey="efficiency" fill="#3182CE" name="Efficiency %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>
      </SimpleGrid>
    </Box>
  );
}
