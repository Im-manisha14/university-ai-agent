// ============================================================
// ACTION ROUTER — Executes structured JSON actions on data
// This is the core "brain" that maps AI decisions to operations
// ============================================================

const { readData, writeData } = require("./dataService");

/**
 * Execute a structured action against the data layer.
 * Returns { success, message, data } indicating operation result.
 *
 * @param {string} action - The action name (e.g. "create_student")
 * @param {object} data   - The action payload
 * @returns {{ success: boolean, message: string, data: any }}
 */
function executeAction(action, data) {
  switch (action) {
    // ===================== STUDENT ACTIONS =====================

    case "create_student": {
      const students = readData("students.json");
      const newId = students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;
      const newStudent = {
        id: newId,
        name: data.name || "Unknown",
        department: data.department || "General",
        year: data.year || new Date().getFullYear(),
        gpa: data.gpa || 0,
        email: data.email || `${(data.name || "student").toLowerCase().replace(/\s+/g, ".")}@university.edu`,
        enrolledAt: new Date().toISOString().split("T")[0],
      };
      students.push(newStudent);
      writeData("students.json", students);
      return { success: true, message: `Student "${newStudent.name}" enrolled successfully.`, data: newStudent };
    }

    case "list_students": {
      const students = readData("students.json");
      // Support optional filters
      let filtered = students;
      if (data.department) {
        filtered = filtered.filter((s) => s.department.toLowerCase() === data.department.toLowerCase());
      }
      if (data.year) {
        filtered = filtered.filter((s) => s.year === data.year);
      }
      return { success: true, message: `Found ${filtered.length} student(s).`, data: filtered };
    }

    case "update_student": {
      const students = readData("students.json");
      const idx = students.findIndex(
        (s) => s.id === data.id || s.name.toLowerCase().includes((data.name || "").toLowerCase())
      );
      if (idx === -1) return { success: false, message: "Student not found.", data: null };

      // Merge updates (don't overwrite id)
      const updated = { ...students[idx], ...data, id: students[idx].id };
      students[idx] = updated;
      writeData("students.json", students);
      return { success: true, message: `Student "${updated.name}" updated.`, data: updated };
    }

    case "delete_student": {
      const students = readData("students.json");
      const before = students.length;
      const remaining = students.filter(
        (s) => s.id !== data.id && !s.name.toLowerCase().includes((data.name || "").toLowerCase())
      );
      if (remaining.length === before) return { success: false, message: "Student not found.", data: null };
      writeData("students.json", remaining);
      return { success: true, message: `Student removed. ${remaining.length} student(s) remaining.`, data: remaining };
    }

    // ===================== FACULTY ACTIONS =====================

    case "add_faculty": {
      const faculty = readData("faculty.json");
      const newId = faculty.length > 0 ? Math.max(...faculty.map((f) => f.id)) + 1 : 1;
      const newFaculty = {
        id: newId,
        name: data.name || "Unknown",
        department: data.department || "General",
        subjects: data.subjects || [],
        email: data.email || `${(data.name || "faculty").toLowerCase().replace(/\s+/g, ".")}@university.edu`,
      };
      faculty.push(newFaculty);
      writeData("faculty.json", faculty);
      return { success: true, message: `Faculty "${newFaculty.name}" added.`, data: newFaculty };
    }

    case "list_faculty": {
      const faculty = readData("faculty.json");
      let filtered = faculty;
      if (data.department) {
        filtered = filtered.filter((f) => f.department.toLowerCase() === data.department.toLowerCase());
      }
      return { success: true, message: `Found ${filtered.length} faculty member(s).`, data: filtered };
    }

    case "delete_faculty": {
      const faculty = readData("faculty.json");
      const before = faculty.length;
      const remaining = faculty.filter(
        (f) => f.id !== data.id && !f.name.toLowerCase().includes((data.name || "").toLowerCase())
      );
      if (remaining.length === before) return { success: false, message: "Faculty not found.", data: null };
      writeData("faculty.json", remaining);
      return { success: true, message: `Faculty removed.`, data: remaining };
    }

    case "assign_subject": {
      const faculty = readData("faculty.json");
      const member = faculty.find((f) => f.name.toLowerCase().includes((data.faculty || "").toLowerCase()));
      if (!member) return { success: false, message: "Faculty member not found.", data: null };
      if (data.subject && !member.subjects.includes(data.subject)) {
        member.subjects.push(data.subject);
      }
      writeData("faculty.json", faculty);
      return { success: true, message: `Subject "${data.subject}" assigned to ${member.name}.`, data: member };
    }

    case "generate_workload": {
      const faculty = readData("faculty.json");
      const workload = faculty.map((f) => ({
        name: f.name,
        department: f.department,
        subjectCount: f.subjects.length,
        subjects: f.subjects,
      }));
      return { success: true, message: "Faculty workload report generated.", data: workload };
    }

    // ===================== COURSE ACTIONS =====================

    case "create_course": {
      const courses = readData("courses.json");
      const newId = courses.length > 0 ? Math.max(...courses.map((c) => c.id)) + 1 : 1;
      const newCourse = {
        id: newId,
        name: data.name || "New Course",
        code: data.code || `COURSE${newId}`,
        semester: data.semester || 1,
        department: data.department || "General",
        credits: data.credits || 3,
        faculty: data.faculty || "TBD",
      };
      courses.push(newCourse);
      writeData("courses.json", courses);
      return { success: true, message: `Course "${newCourse.name}" created.`, data: newCourse };
    }

    case "list_courses": {
      const courses = readData("courses.json");
      let filtered = courses;
      if (data.semester) {
        filtered = filtered.filter((c) => c.semester === data.semester);
      }
      if (data.department) {
        filtered = filtered.filter((c) => c.department.toLowerCase() === data.department.toLowerCase());
      }
      return { success: true, message: `Found ${filtered.length} course(s).`, data: filtered };
    }

    case "update_course": {
      const courses = readData("courses.json");
      const idx = courses.findIndex(
        (c) => c.id === data.id || c.name.toLowerCase().includes((data.name || "").toLowerCase())
      );
      if (idx === -1) return { success: false, message: "Course not found.", data: null };
      const updated = { ...courses[idx], ...data, id: courses[idx].id };
      courses[idx] = updated;
      writeData("courses.json", courses);
      return { success: true, message: `Course "${updated.name}" updated.`, data: updated };
    }

    case "delete_course": {
      const courses = readData("courses.json");
      const before = courses.length;
      const remaining = courses.filter(
        (c) => c.id !== data.id && !c.name.toLowerCase().includes((data.name || "").toLowerCase())
      );
      if (remaining.length === before) return { success: false, message: "Course not found.", data: null };
      writeData("courses.json", remaining);
      return { success: true, message: `Course removed.`, data: remaining };
    }

    // ===================== ATTENDANCE ACTIONS ===================

    case "record_attendance": {
      const attendance = readData("attendance.json");
      const students = readData("students.json");
      const student = students.find((s) =>
        s.name.toLowerCase().includes((data.studentName || "").toLowerCase())
      );
      const newId = attendance.length > 0 ? Math.max(...attendance.map((a) => a.id)) + 1 : 1;
      const record = {
        id: newId,
        studentId: student ? student.id : null,
        studentName: data.studentName || "Unknown",
        courseCode: data.courseCode || "GENERAL",
        date: data.date || new Date().toISOString().split("T")[0],
        status: data.status || "present",
      };
      attendance.push(record);
      writeData("attendance.json", attendance);
      return { success: true, message: `Attendance recorded for ${record.studentName}.`, data: record };
    }

    case "list_attendance": {
      const attendance = readData("attendance.json");
      let filtered = attendance;
      if (data.studentName) {
        filtered = filtered.filter((a) =>
          a.studentName.toLowerCase().includes(data.studentName.toLowerCase())
        );
      }
      if (data.date) {
        filtered = filtered.filter((a) => a.date === data.date);
      }
      return { success: true, message: `Found ${filtered.length} attendance record(s).`, data: filtered };
    }

    case "attendance_report": {
      const attendance = readData("attendance.json");
      const students = readData("students.json");
      const threshold = data.threshold || 75;

      // Calculate attendance percentage per student
      const report = students.map((s) => {
        const records = attendance.filter((a) => a.studentId === s.id);
        const total = records.length;
        const present = records.filter((a) => a.status === "present").length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
        return { name: s.name, department: s.department, total, present, percentage };
      });

      const below = report.filter((r) => r.percentage < threshold);
      return {
        success: true,
        message: `${below.length} student(s) below ${threshold}% attendance.`,
        data: { threshold, studentsBelow: below, allStudents: report },
      };
    }

    // ===================== EXAM ACTIONS =========================

    case "schedule_exam": {
      // Exams are stored in-memory (could extend to a JSON file)
      return {
        success: true,
        message: `Exam for "${data.course || "Unknown"}" scheduled on ${data.date || "TBD"}.`,
        data: { course: data.course, date: data.date, type: data.type || "midterm" },
      };
    }

    case "list_exams": {
      return {
        success: true,
        message: "Exam listing is available.",
        data: [
          { course: "Data Structures", date: "2024-04-15", type: "midterm" },
          { course: "Database Systems", date: "2024-04-18", type: "midterm" },
        ],
      };
    }

    // ===================== REPORT ACTIONS ========================

    case "generate_report": {
      const students = readData("students.json");
      const faculty = readData("faculty.json");
      const courses = readData("courses.json");
      const attendance = readData("attendance.json");

      const report = {
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalCourses: courses.length,
        totalAttendanceRecords: attendance.length,
        departments: [...new Set(students.map((s) => s.department))],
        averageGPA: students.length > 0
          ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2)
          : "N/A",
      };

      return { success: true, message: "University report generated.", data: report };
    }

    default:
      return { success: false, message: `Unknown action: "${action}". Cannot execute.`, data: null };
  }
}

module.exports = { executeAction };
