// ============================================================
// ALERT SERVICE — Proactive alert system for students & faculty
// Checks data conditions and generates alerts automatically
// ============================================================

const { readData, writeData } = require("./dataService");

const PASS_MARK = 40;
const ATTENDANCE_THRESHOLD = 75;

// ── Helpers ─────────────────────────────────────────────────

function nextId(alerts) {
  return alerts.length > 0 ? Math.max(...alerts.map(a => a.id)) + 1 : 1;
}

function alertExists(alerts, userId, userType, alertType, key) {
  return alerts.some(
    a => a.userId === userId && a.userType === userType &&
         a.alertType === alertType && a.key === key && !a.isRead
  );
}

function addAlert(alerts, userId, userType, alertType, title, message, severity, key) {
  if (alertExists(alerts, userId, userType, alertType, key)) return;
  alerts.push({
    id: nextId(alerts),
    userId,
    userType,
    alertType,
    title,
    message,
    severity,
    key,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
}

// ── Student Alerts ──────────────────────────────────────────

function checkStudentAttendanceAlerts(alerts) {
  const attendance = readData("attendance.json");
  const students = readData("students.json");

  // Group attendance per student+course
  const grouped = {};
  for (const rec of attendance) {
    const k = `${rec.studentId}_${rec.courseCode}`;
    if (!grouped[k]) grouped[k] = { studentId: rec.studentId, studentName: rec.studentName, course: rec.courseCode, total: 0, present: 0 };
    grouped[k].total++;
    if (rec.status === "present") grouped[k].present++;
  }

  for (const g of Object.values(grouped)) {
    const pct = g.total > 0 ? Math.round((g.present / g.total) * 100) : 100;
    if (pct < ATTENDANCE_THRESHOLD) {
      addAlert(alerts, g.studentId, "student", "low_attendance",
        "Low Attendance Warning ⚠️",
        `Your attendance in ${g.course} is ${pct}%. You need ${ATTENDANCE_THRESHOLD}% to appear for exams. Attend more classes!`,
        "high",
        `att_${g.studentId}_${g.course}`
      );
    }
  }
}

function checkUpcomingExamAlerts(alerts) {
  const exams = readData("exams.json");
  const students = readData("students.json");
  const now = new Date();

  for (const exam of exams) {
    const examDate = new Date(exam.date);
    const daysUntil = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntil > 0 && daysUntil <= 3) {
      // Alert all students
      for (const s of students) {
        addAlert(alerts, s.id, "student", "upcoming_exam",
          `Exam in ${daysUntil} Day${daysUntil > 1 ? "s" : ""} 📝`,
          `${exam.course} ${exam.type} exam is on ${exam.date}. Make sure you are prepared!`,
          "medium",
          `exam_${s.id}_${exam.id}`
        );
      }
    }
  }
}

function checkLowMarksAlerts(alerts) {
  const marks = readData("marks.json");

  for (const m of marks) {
    const pct = m.maxMarks > 0 ? Math.round((m.marks / m.maxMarks) * 100) : 0;
    if (pct < PASS_MARK) {
      addAlert(alerts, m.studentId, "student", "low_marks",
        "Low Marks Alert 📉",
        `You scored ${m.marks}/${m.maxMarks} in ${m.courseName} (${m.type}). The pass mark is ${PASS_MARK}%. Please seek help from your faculty.`,
        "high",
        `marks_${m.studentId}_${m.courseCode}_${m.type}`
      );
    }
  }
}

function checkFeeDeadlineAlerts(alerts) {
  const notices = readData("notices.json");
  const students = readData("students.json");
  const now = new Date();

  const feeNotices = notices.filter(n =>
    n.title.toLowerCase().includes("fee") || n.content.toLowerCase().includes("fee payment")
  );

  for (const notice of feeNotices) {
    // Try to extract a deadline date from content
    const dateMatch = notice.content.match(/(\w+ \d{1,2},?\s*\d{4})/);
    if (dateMatch) {
      const deadline = new Date(dateMatch[1]);
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil <= 5) {
        for (const s of students) {
          addAlert(alerts, s.id, "student", "fee_deadline",
            "Fee Payment Due Soon 💰",
            `Your fee payment deadline is ${notice.date}. Please pay before the due date to avoid penalty.`,
            "high",
            `fee_${s.id}_${notice.id}`
          );
        }
      }
    }
  }
}

// ── Faculty Alerts ──────────────────────────────────────────

function checkFacultyLowAttendanceAlerts(alerts) {
  const attendance = readData("attendance.json");
  const faculty = readData("faculty.json");
  const courses = readData("courses.json");

  // Group per student+course
  const grouped = {};
  for (const rec of attendance) {
    const k = `${rec.studentId}_${rec.courseCode}`;
    if (!grouped[k]) grouped[k] = { studentId: rec.studentId, course: rec.courseCode, total: 0, present: 0 };
    grouped[k].total++;
    if (rec.status === "present") grouped[k].present++;
  }

  // Count students below threshold per course
  const lowPerCourse = {};
  for (const g of Object.values(grouped)) {
    const pct = g.total > 0 ? Math.round((g.present / g.total) * 100) : 100;
    if (pct < ATTENDANCE_THRESHOLD) {
      if (!lowPerCourse[g.course]) lowPerCourse[g.course] = 0;
      lowPerCourse[g.course]++;
    }
  }

  for (const [courseCode, count] of Object.entries(lowPerCourse)) {
    const course = courses.find(c => c.code === courseCode);
    if (!course) continue;
    const fac = faculty.find(f => f.name === course.faculty);
    if (!fac) continue;

    addAlert(alerts, fac.id, "faculty", "students_low_attendance",
      "Students With Low Attendance 📊",
      `${count} student(s) in ${course.name} (${courseCode}) have attendance below ${ATTENDANCE_THRESHOLD}%. Consider sending them a warning.`,
      "medium",
      `facatt_${fac.id}_${courseCode}`
    );
  }
}

function checkFacultyWorkloadAlerts(alerts) {
  const faculty = readData("faculty.json");

  for (const f of faculty) {
    if (f.subjects && f.subjects.length > 4) {
      addAlert(alerts, f.id, "faculty", "high_workload",
        "High Workload Detected 📋",
        `You are currently assigned ${f.subjects.length} subjects this semester. This may be too many. Consider requesting a redistribution.`,
        "low",
        `workload_${f.id}`
      );
    }
  }
}

function checkFacultyPendingMarksAlerts(alerts) {
  const courses = readData("courses.json");
  const marks = readData("marks.json");
  const enrollments = readData("enrollments.json");
  const faculty = readData("faculty.json");

  for (const course of courses) {
    const enrolled = enrollments.filter(e => e.courseCode === course.code);
    const marksEntered = marks.filter(m => m.courseCode === course.code);
    const studentsWithMarks = new Set(marksEntered.map(m => m.studentId));

    const missing = enrolled.filter(e => !studentsWithMarks.has(e.studentId));
    if (missing.length > 0 && enrolled.length > 0) {
      const fac = faculty.find(f => f.name === course.faculty);
      if (!fac) continue;

      addAlert(alerts, fac.id, "faculty", "pending_marks",
        "Marks Entry Pending ✍️",
        `Marks for ${course.name} (${course.code}) have not been entered for ${missing.length} student(s). Please enter marks soon.`,
        "high",
        `pendmarks_${fac.id}_${course.code}`
      );
    }
  }
}

// ── Main check function ─────────────────────────────────────

function runAlertCheck() {
  const alerts = readData("alerts.json");
  const before = alerts.length;

  checkStudentAttendanceAlerts(alerts);
  checkUpcomingExamAlerts(alerts);
  checkLowMarksAlerts(alerts);
  checkFeeDeadlineAlerts(alerts);
  checkFacultyLowAttendanceAlerts(alerts);
  checkFacultyWorkloadAlerts(alerts);
  checkFacultyPendingMarksAlerts(alerts);

  if (alerts.length > before) {
    writeData("alerts.json", alerts);
    console.log(`[Alerts] Generated ${alerts.length - before} new alert(s). Total: ${alerts.length}`);
  }
}

// ── API functions ───────────────────────────────────────────

function getAlerts(userId, userType) {
  const alerts = readData("alerts.json");
  const userAlerts = alerts
    .filter(a => a.userId === userId && a.userType === userType)
    .sort((a, b) => {
      const sev = { high: 0, medium: 1, low: 2 };
      if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  const unreadCount = userAlerts.filter(a => !a.isRead).length;
  return { alerts: userAlerts, unreadCount };
}

function getUnreadCount(userId, userType) {
  const alerts = readData("alerts.json");
  return alerts.filter(a => a.userId === userId && a.userType === userType && !a.isRead).length;
}

function markRead(alertId) {
  const alerts = readData("alerts.json");
  const alert = alerts.find(a => a.id === alertId);
  if (!alert) return false;
  alert.isRead = true;
  writeData("alerts.json", alerts);
  return true;
}

function markAllRead(userId, userType) {
  const alerts = readData("alerts.json");
  let count = 0;
  for (const a of alerts) {
    if (a.userId === userId && a.userType === userType && !a.isRead) {
      a.isRead = true;
      count++;
    }
  }
  writeData("alerts.json", alerts);
  return count;
}

function clearReadAlerts(userId, userType) {
  const alerts = readData("alerts.json");
  const remaining = alerts.filter(a => !(a.userId === userId && a.userType === userType && a.isRead));
  const cleared = alerts.length - remaining.length;
  writeData("alerts.json", remaining);
  return cleared;
}

// ── Background scheduler ────────────────────────────────────

let alertInterval = null;

function startAlertScheduler(intervalMs = 30000) {
  runAlertCheck(); // Run immediately on startup
  alertInterval = setInterval(() => {
    try {
      runAlertCheck();
    } catch (err) {
      console.error("[Alerts] Check error:", err.message);
    }
  }, intervalMs);
  console.log(`[Alerts] Scheduler started — checking every ${intervalMs / 1000}s`);
}

function stopAlertScheduler() {
  if (alertInterval) clearInterval(alertInterval);
}

module.exports = {
  runAlertCheck,
  getAlerts,
  getUnreadCount,
  markRead,
  markAllRead,
  clearReadAlerts,
  startAlertScheduler,
  stopAlertScheduler,
};
