import React from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function ProgressChart({ tasks }) {
  // Calculate task statistics
  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const inProgressCount = tasks.filter((task) => task.status === "inprogress").length;
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Data for bar chart
  const barData = [
    { name: "To Do", count: todoCount, fill: "#ff6bb5" },
    { name: "In Progress", count: inProgressCount, fill: "#a855f7" },
    { name: "Done", count: doneCount, fill: "#c41771" },
  ];

  // Data for pie chart
  const pieData = [
    { name: "To Do", value: todoCount, color: "#ff6bb5" },
    { name: "In Progress", value: inProgressCount, color: "#a855f7" },
    { name: "Done", value: doneCount, color: "#c41771" },
  ].filter((item) => item.value > 0);

  return (
    <div className="progress-chart-container">
      <h3>Task Progress Overview</h3>
      
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#c41771" }}>
          {completionPercentage}%
        </div>
        <div style={{ color: "#64748b" }}>
          Completion Rate ({doneCount} of {totalTasks} tasks)
        </div>
      </div>

      <div className="chart-wrapper">
        {/* Bar Chart */}
        <div style={{ width: "100%", maxWidth: "500px" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#e91e8c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressChart;
