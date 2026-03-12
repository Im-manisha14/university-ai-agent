import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  getFacultyClassPerformance, getFacultyGrades,
  getFacultyAttVsMarks, getFacultySemComparison, getAtRiskStudents,
} from "../services/api";
import ExportButtons from "./ExportButtons";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#64748b", "#ec4899"];

export default function FacultyAnalytics() {
  const [classPerf, setClassPerf] = useState([]);
  const [grades, setGrades] = useState([]);
  const [scatter, setScatter] = useState([]);
  const [semComp, setSemComp] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFacultyClassPerformance().catch(() => ({ data: { data: {} } })),
      getFacultyGrades().catch(() => ({ data: { data: {} } })),
      getFacultyAttVsMarks().catch(() => ({ data: { data: {} } })),
      getFacultySemComparison().catch(() => ({ data: { data: {} } })),
      getAtRiskStudents().catch(() => ({ data: { data: {} } })),
    ]).then(([cp, gr, sc, sem, ar]) => {
      // Transform class performance to array for chart
      const cpd = cp.data.data || {};
      if (cpd.total_students !== undefined) {
        setClassPerf([{
          course: "All Courses",
          passed: cpd.passed || 0,
          failed: cpd.failed || 0,
          avgMarks: cpd.average_marks || 0,
          passRate: cpd.pass_percentage || 0,
          totalStudents: cpd.total_students || 0,
        }]);
      }

      // Transform grades: { grades, counts } → [{ grade, count }]
      const grd = gr.data.data || {};
      if (grd.grades && grd.counts) {
        setGrades(grd.grades.map((g, i) => ({ grade: g, count: grd.counts[i] })));
      }

      // Transform scatter: { data_points } → [{ attendance, marks }]
      const scd = sc.data.data || {};
      setScatter(scd.data_points || []);

      // Transform semester comparison → chart format
      const semd = sem.data.data || {};
      if (semd.current_semester && semd.previous_semester) {
        const cur = semd.current_semester;
        const prev = semd.previous_semester;
        setSemComp([
          { metric: "Avg Marks", current: cur.avg_marks, previous: prev.avg_marks },
          { metric: "Pass Rate", current: cur.pass_rate, previous: prev.pass_rate },
          { metric: "Attendance", current: cur.avg_attendance, previous: prev.avg_attendance },
        ]);
      }

      // Transform at-risk students
      const ard = ar.data.data || {};
      const riskArr = (ard.at_risk || []).map(s => ({
        name: s.name,
        course: s.department,
        attendance: s.attendance,
        marks: s.avg_marks,
        reason: s.attendance < 75 ? "Low Attendance" : "Low Marks",
      }));
      setAtRisk(riskArr);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-4)" }}>Loading analytics…</div>;
  }

  return (
    <div>
      {/* Summary row */}
      <div className="metrics-grid" style={{ marginBottom: 28 }}>
        <div className="metric-card">
          <div className="metric-value" style={{ color: "var(--color-accent)" }}>{classPerf.length}</div>
          <div className="metric-label">Courses Taught</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{atRisk.length}</div>
          <div className="metric-label">At-Risk Students</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {classPerf.length > 0 ? Math.round(classPerf.reduce((s, c) => s + (c.passRate || 0), 0) / classPerf.length) : 0}%
          </div>
          <div className="metric-label">Avg Pass Rate</div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid-2-col" style={{ gap: 20, marginBottom: 20 }}>
        {/* Class Performance */}
        <div className="card chart-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: "0.925rem", fontWeight: 700, color: "var(--color-text-1)", margin: 0 }}>
              Class Performance
            </h3>
            {classPerf.length > 0 && (
              <ExportButtons title="Class Performance"
                headers={["Course", "Avg Marks", "Pass Rate", "Total Students"]}
                rows={classPerf.map(c => [c.course, c.avgMarks, `${c.passRate}%`, c.totalStudents])} />
            )}
          </div>
          {classPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={classPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="course" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="passed" fill="#22c55e" name="Passed" radius={[2, 2, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>

        {/* Grade Distribution */}
        <div className="card chart-card">
          <h3 style={{ fontSize: "0.925rem", fontWeight: 700, color: "var(--color-text-1)", margin: 0, marginBottom: 16 }}>
            Grade Distribution
          </h3>
          {grades.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={grades} dataKey="count" nameKey="grade" cx="50%" cy="50%"
                  outerRadius={90} innerRadius={45} paddingAngle={3}
                  label={({ grade, count }) => `${grade}: ${count}`}>
                  {grades.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid-2-col" style={{ gap: 20, marginBottom: 20 }}>
        {/* Attendance vs Marks scatter */}
        <div className="card chart-card">
          <h3 style={{ fontSize: "0.925rem", fontWeight: 700, color: "var(--color-text-1)", margin: 0, marginBottom: 16 }}>
            Attendance vs Marks
          </h3>
          {scatter.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" dataKey="attendance" name="Attendance %" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="marks" name="Marks %" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  formatter={(v, name) => [`${v}%`, name]} />
                <Scatter data={scatter} fill="#6366f1">
                  {scatter.map((s, i) => (
                    <Cell key={i} fill={s.attendance < 75 || s.marks < 40 ? "#ef4444" : "#6366f1"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>

        {/* Semester Comparison */}
        <div className="card chart-card">
          <h3 style={{ fontSize: "0.925rem", fontWeight: 700, color: "var(--color-text-1)", margin: 0, marginBottom: 16 }}>
            Semester Comparison
          </h3>
          {semComp.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={semComp}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="current" fill="#6366f1" name="Current" radius={[2, 2, 0, 0]} />
                <Bar dataKey="previous" fill="#cbd5e1" name="Previous" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>
      </div>

      {/* At-Risk Students Table */}
      {atRisk.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid var(--color-border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-1)" }}>
              ⚠ At-Risk Students ({atRisk.length})
            </span>
            <ExportButtons title="At-Risk Students"
              headers={["Student", "Course", "Attendance", "Marks", "Reason"]}
              rows={atRisk.map(s => [s.name, s.course, `${s.attendance}%`, s.marks, s.reason])} />
          </div>

          {/* Desktop table */}
          <div className="log-table-desktop table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Attendance</th>
                <th>Marks</th>
                <th>Risk Reason</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.course}</td>
                  <td>
                    <span style={{
                      color: s.attendance < 75 ? "#ef4444" : "var(--color-text-2)",
                      fontWeight: s.attendance < 75 ? 700 : 400,
                    }}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td>
                    <span style={{
                      color: s.marks < 40 ? "#ef4444" : "var(--color-text-2)",
                      fontWeight: s.marks < 40 ? 700 : 400,
                    }}>
                      {s.marks}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.reason === "Low Attendance" ? "badge-red" : "badge-amber"}`}>
                      {s.reason}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile cards */}
          <div className="log-cards-mobile">
            {atRisk.map((s, i) => (
              <div key={i} className="log-mobile-card" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-1)" }}>{s.name}</span>
                  <span className={`badge ${s.reason === "Low Attendance" ? "badge-red" : "badge-amber"}`}>
                    {s.reason}
                  </span>
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", marginBottom: 6 }}>{s.course}</div>
                <div style={{ display: "flex", gap: 16, fontSize: "0.8125rem" }}>
                  <div>
                    <span className="text-caption">Attendance </span>
                    <span style={{
                      fontWeight: 600,
                      color: s.attendance < 75 ? "#ef4444" : "var(--color-text-2)",
                    }}>{s.attendance}%</span>
                  </div>
                  <div>
                    <span className="text-caption">Marks </span>
                    <span style={{
                      fontWeight: 600,
                      color: s.marks < 40 ? "#ef4444" : "var(--color-text-2)",
                    }}>{s.marks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-4)", fontSize: "0.85rem" }}>
      No data available
    </div>
  );
}
