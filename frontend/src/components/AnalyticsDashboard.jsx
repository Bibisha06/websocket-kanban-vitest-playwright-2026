import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AnalyticsGraphs from "./AnalyticsGraphs";

const IconLightning = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconHourglass = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 2 19 2 12 12 19 22 5 22 12 12 5 2" />
  </svg>
);
const IconPie = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function AnalyticsDashboard({ tasks, lastUpdated }) {
  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "inprogress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const activeTasks = todoCount + inProgressCount;

  const completedWithDate = tasks.filter((t) => t.status === "done" && (t.completedAt || t.updatedAt));
  const avgLeadTimeDays =
    completedWithDate.length > 0
      ? (
          completedWithDate.reduce((acc, t) => {
            const created = new Date(t.createdAt || t.updatedAt);
            const completed = new Date(t.completedAt || t.updatedAt);
            return acc + Math.round((completed - created) / (24 * 60 * 60 * 1000));
          }, 0) / completedWithDate.length
        ).toFixed(1)
      : "—";

  const barData = [
    { name: "To Do", count: todoCount },
    { name: "In Progress", count: inProgressCount },
    { name: "Done", count: doneCount },
  ];

  const categories = ["feature", "bug", "enhancement"];
  const performanceData = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const completed = catTasks.filter((t) => t.status === "done").length;
    return {
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      total: catTasks.length,
      completed,
      pct: catTasks.length ? Math.round((completed / catTasks.length) * 100) : 0,
      velocity: catTasks.length > 2 ? "High" : catTasks.length > 0 ? "Medium" : "Low",
    };
  }).filter((r) => r.total > 0);

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="analytics-dashboard">
      <div className="breadcrumb">Dashboard / Analytics Overview</div>
      <h1 className="analytics-title">System Analytics</h1>

      <div className="analytics-toolbar">
        <label className="checkbox-label">
          <input type="checkbox" defaultChecked />
          Last 30 Days
        </label>
        <button type="button" className="btn btn-export">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Report
        </button>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-value">{activeTasks}</div>
          <div className="metric-label">Total Active Tasks</div>
          <div className="metric-trend up">+12% vs last month</div>
          <div className="metric-icon"><IconLightning /></div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{inProgressCount}</div>
          <div className="metric-label">In Progress</div>
          <div className="metric-trend down">-4% vs last month</div>
          <div className="metric-icon"><IconHourglass /></div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{completionRate}%</div>
          <div className="metric-label">Completion Rate</div>
          <div className="metric-trend up">+8% vs last month</div>
          <div className="metric-icon"><IconPie /></div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{avgLeadTimeDays}{avgLeadTimeDays !== "—" ? "d" : ""}</div>
          <div className="metric-label">Avg. Lead Time</div>
          <div className="metric-trend down">-6% vs last month</div>
          <div className="metric-icon"><IconClock /></div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card chart-card">
          <h3>Task Progress by Column</h3>
          <p className="card-subtitle">Visual breakdown of tasks across the current workflow stages.</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(value) => [value, "Tasks"]}
                />
                <Bar dataKey="count" fill="var(--primary-magenta)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footer">
            <span className="trend-badge up">Trending up by 5.2% this week</span>
          </div>
          <p className="chart-note">Based on task movement from the last 7 active business days.</p>
        </div>

        <div className="analytics-card live-updates">
          <h3>Live Updates</h3>
          <p className="card-subtitle">Real-time activity log.</p>
          <ul className="updates-list">
            {recentTasks.length ? recentTasks.map((t) => (
              <li key={t._id}>
                <div className="update-avatar">{t.title ? t.title[0].toUpperCase() : "?"}</div>
                <div className="update-content">
                  <span className="update-user">User</span>
                  <span className="update-action">updated "{t.title}"</span>
                </div>
                <span className="update-time">2h ago</span>
              </li>
            )) : (
              <li className="no-updates">No recent activity</li>
            )}
          </ul>
          <button type="button" className="btn btn-outline">View Full Audit Log</button>
        </div>
      </div>

      <div className="analytics-grid second">
        <div className="analytics-card performance-card">
          <h3>Performance by Category</h3>
          <p className="card-subtitle">Success metrics across different task types.</p>
          <div className="performance-table-wrap">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Tasks</th>
                  <th>Completed</th>
                  <th>Velocity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.length ? performanceData.map((row) => (
                  <tr key={row.category}>
                    <td>{row.category}</td>
                    <td>{row.total}</td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${row.pct}%` }} />
                        </div>
                        <span>{row.pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`velocity-tag ${row.velocity.toLowerCase()}`}>{row.velocity}</span>
                    </td>
                    <td>
                      <button type="button" className="icon-btn table-menu">⋮</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5}>No category data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analytics-card completion-card">
          <h3>Global Completion</h3>
          <p className="card-subtitle">Overall progress towards project milestones.</p>
          <div className="completion-circle-wrap">
            <div className="completion-circle">
              <svg viewBox="0 0 36 36">
                <path
                  className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle-fill"
                  style={{ strokeDasharray: `${completionRate}, 100` }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="completion-text">
                <span className="completion-pct">{completionRate}%</span>
                <span className="completion-label">PROJECT DONE</span>
              </div>
            </div>
          </div>
          <div className="completion-stats">
            <div className="completion-stat"><span className="num">{doneCount}</span> DONE</div>
            <div className="completion-stat"><span className="num">{total - doneCount}</span> PENDING</div>
          </div>
        </div>
      </div>

      <AnalyticsGraphs tasks={tasks} />

      <footer className="analytics-footer">
        <span>© 2024 Kanban Flow Inc.</span>
        <span className="sync-status"><span className="sync-dot" /> Connected to Real-time Sync</span>
        <span className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#help">Help Center</a>
        </span>
      </footer>
    </div>
  );
}

export default AnalyticsDashboard;
