// ============================================================
// AGENT CONTROLLER — Handles AI agent CRUD operations
// Agents are the core abstraction: each "owns" a domain
// ============================================================

const { readData, writeData } = require("../services/dataService");

// Agent domain templates — auto-generated based on purpose keywords
const DOMAIN_TEMPLATES = {
  student: {
    name: "Student Management Agent",
    domain: "students",
    description: "Handles student enrollment, updates, deletions, and student reports.",
    allowedActions: ["create_student", "update_student", "delete_student", "list_students"],
    systemPrompt: `You are a Student Management AI Agent responsible for managing student records.
You can enroll students, update their information, delete records, and generate reports.
You must convert user requests into structured JSON actions.

Allowed actions: create_student, update_student, delete_student, list_students

For each user query, return ONLY a JSON object with:
{
  "action": "<action_name>",
  "data": { ...relevant fields... }
}

Fields for students: name, department, year, gpa, email
Do NOT include any text outside the JSON.`,
  },

  faculty: {
    name: "Faculty Management Agent",
    domain: "faculty",
    description: "Manages faculty records, subject assignments, and workload tracking.",
    allowedActions: ["add_faculty", "list_faculty", "delete_faculty", "assign_subject", "generate_workload"],
    systemPrompt: `You are a Faculty Management AI Agent responsible for managing faculty records.
You can add faculty, assign subjects, generate workload reports, and list faculty.
You must convert user requests into structured JSON actions.

Allowed actions: add_faculty, list_faculty, delete_faculty, assign_subject, generate_workload

For each user query, return ONLY a JSON object with:
{
  "action": "<action_name>",
  "data": { ...relevant fields... }
}

Fields for faculty: name, department, subjects, email
For assign_subject: faculty (name), subject (name)
Do NOT include any text outside the JSON.`,
  },

  course: {
    name: "Course Management Agent",
    domain: "courses",
    description: "Handles course creation, updates, listings, and curriculum management.",
    allowedActions: ["create_course", "list_courses", "update_course", "delete_course"],
    systemPrompt: `You are a Course Management AI Agent responsible for managing courses.
You can create courses, update details, delete courses, and list available courses.
You must convert user requests into structured JSON actions.

Allowed actions: create_course, list_courses, update_course, delete_course

For each user query, return ONLY a JSON object with:
{
  "action": "<action_name>",
  "data": { ...relevant fields... }
}

Fields for courses: name, code, semester, department, credits, faculty
Do NOT include any text outside the JSON.`,
  },

  attendance: {
    name: "Attendance Agent",
    domain: "attendance",
    description: "Records and reports student attendance across courses.",
    allowedActions: ["record_attendance", "list_attendance", "attendance_report"],
    systemPrompt: `You are an Attendance Management AI Agent responsible for tracking attendance.
You can record attendance, list records, and generate attendance reports.
You must convert user requests into structured JSON actions.

Allowed actions: record_attendance, list_attendance, attendance_report

For each user query, return ONLY a JSON object with:
{
  "action": "<action_name>",
  "data": { ...relevant fields... }
}

Fields: studentName, courseCode, date, status (present/absent)
For reports: threshold (percentage number)
Do NOT include any text outside the JSON.`,
  },

  exam: {
    name: "Exam Management Agent",
    domain: "exams",
    description: "Manages exam scheduling, listings, and exam-related operations.",
    allowedActions: ["schedule_exam", "list_exams"],
    systemPrompt: `You are an Exam Management AI Agent responsible for scheduling and managing exams.
You can schedule exams and list upcoming exams.
You must convert user requests into structured JSON actions.

Allowed actions: schedule_exam, list_exams

For each user query, return ONLY a JSON object with:
{
  "action": "<action_name>",
  "data": { ...relevant fields... }
}

Fields: course, date, type (midterm/final/quiz)
Do NOT include any text outside the JSON.`,
  },
};

/**
 * Determine the best domain template by matching keywords in the purpose.
 */
function detectDomain(purpose) {
  const p = purpose.toLowerCase();
  if (p.includes("student") || p.includes("enroll") || p.includes("admission")) return "student";
  if (p.includes("faculty") || p.includes("professor") || p.includes("teacher")) return "faculty";
  if (p.includes("course") || p.includes("curriculum") || p.includes("subject")) return "course";
  if (p.includes("attendance") || p.includes("presence") || p.includes("absent")) return "attendance";
  if (p.includes("exam") || p.includes("test") || p.includes("assessment")) return "exam";
  return "student"; // Default fallback
}

// --- Controller Methods ---

/**
 * GET /api/agents — Return all agents
 */
function getAllAgents(req, res) {
  const agents = readData("agents.json");
  res.json({ success: true, data: agents });
}

/**
 * GET /api/agents/:id — Return a single agent
 */
function getAgent(req, res) {
  const agents = readData("agents.json");
  const agent = agents.find((a) => a.id === parseInt(req.params.id));
  if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });
  res.json({ success: true, data: agent });
}

/**
 * POST /api/agents — Create a new agent from a purpose description
 * The system auto-generates name, domain, actions, and system prompt
 */
function createAgent(req, res) {
  const { purpose } = req.body;
  if (!purpose) return res.status(400).json({ success: false, message: "Purpose is required" });

  const domain = detectDomain(purpose);
  const template = DOMAIN_TEMPLATES[domain];

  const agents = readData("agents.json");
  const newId = agents.length > 0 ? Math.max(...agents.map((a) => a.id)) + 1 : 1;

  const newAgent = {
    id: newId,
    name: template.name,
    domain: template.domain,
    description: template.description,
    purpose: purpose,
    allowedActions: template.allowedActions,
    systemPrompt: template.systemPrompt,
    createdAt: new Date().toISOString(),
    chatHistory: [],
    actionLog: [],
  };

  agents.push(newAgent);
  writeData("agents.json", agents);

  res.status(201).json({ success: true, data: newAgent });
}

/**
 * DELETE /api/agents/:id — Remove an agent
 */
function deleteAgent(req, res) {
  const agents = readData("agents.json");
  const remaining = agents.filter((a) => a.id !== parseInt(req.params.id));
  if (remaining.length === agents.length) {
    return res.status(404).json({ success: false, message: "Agent not found" });
  }
  writeData("agents.json", remaining);
  res.json({ success: true, message: "Agent deleted" });
}

/**
 * GET /api/agents/:id/logs — Return action log for an agent
 */
function getAgentLogs(req, res) {
  const logs = readData("logs.json");
  const agentLogs = logs.filter((l) => l.agentId === parseInt(req.params.id));
  res.json({ success: true, data: agentLogs });
}

module.exports = { getAllAgents, getAgent, createAgent, deleteAgent, getAgentLogs };
