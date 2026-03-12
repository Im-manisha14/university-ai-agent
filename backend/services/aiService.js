// ============================================================
// AI SERVICE — Communicates with Gemini to convert natural
// language queries into structured JSON actions
// ============================================================

const axios = require("axios");

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Send a user query to Gemini along with the agent's system prompt.
 * Returns the AI-generated structured action (JSON) and a
 * conversational response for the chat UI.
 *
 * @param {string} systemPrompt - The agent's system prompt with instructions
 * @param {string} userQuery    - The natural language query from the user
 * @param {string} apiKey       - Gemini API key
 * @returns {{ action: object|null, response: string }}
 */
async function processQuery(systemPrompt, userQuery, apiKey) {
  // If no API key is configured, use a mock response for demo purposes
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    return generateMockResponse(userQuery);
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userQuery }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const aiMessage =
      response.data.candidates[0].content.parts[0].text.trim();

    // Try to parse the AI response as JSON action
    const parsed = extractJsonAction(aiMessage);

    return {
      action: parsed,
      response: aiMessage,
    };
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return {
      action: null,
      response: "Sorry, I encountered an error processing your request. Please try again.",
    };
  }
}

/**
 * Extract JSON action from AI response text.
 * The AI might return JSON wrapped in markdown code blocks or mixed with text.
 */
function extractJsonAction(text) {
  try {
    // Try direct JSON parse first
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Fall through
      }
    }

    // Try finding JSON object in the text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // Fall through
      }
    }

    return null;
  }
}

/**
 * Generate mock responses for demo mode (when no API key is configured).
 * This allows the platform to be fully functional without an API key.
 */
function generateMockResponse(query) {
  const q = query.toLowerCase();

  // ---- Student actions ----
  if (q.includes("enroll") || q.includes("add student") || q.includes("register student")) {
    const nameMatch = query.match(/enroll\s+(\w+)/i) || query.match(/add\s+student\s+(\w+)/i);
    const deptMatch = query.match(/in\s+(\w+)\s+department/i) || query.match(/to\s+(\w+)/i);
    const yearMatch = query.match(/for\s+(\d{4})/i) || query.match(/year\s+(\d{4})/i);

    return {
      action: {
        action: "create_student",
        data: {
          name: nameMatch ? nameMatch[1] : "New Student",
          department: deptMatch ? deptMatch[1].toUpperCase() : "CSE",
          year: yearMatch ? parseInt(yearMatch[1]) : 2024,
          gpa: 0,
        },
      },
      response: `I'll enroll ${nameMatch ? nameMatch[1] : "the student"} right away.`,
    };
  }

  if (q.includes("list student") || q.includes("show student") || q.includes("all student") || q.includes("get student")) {
    return {
      action: { action: "list_students", data: {} },
      response: "Here are the current student records.",
    };
  }

  if (q.includes("delete student") || q.includes("remove student")) {
    const nameMatch = query.match(/(?:delete|remove)\s+(?:student\s+)?(\w+)/i);
    return {
      action: {
        action: "delete_student",
        data: { name: nameMatch ? nameMatch[1] : "Unknown" },
      },
      response: `I'll remove ${nameMatch ? nameMatch[1] : "the student"} from records.`,
    };
  }

  if (q.includes("update student") || q.includes("change student") || q.includes("modify student")) {
    const nameMatch = query.match(/(?:update|change|modify)\s+(?:student\s+)?(\w+)/i);
    return {
      action: {
        action: "update_student",
        data: { name: nameMatch ? nameMatch[1] : "Unknown" },
      },
      response: `I'll update the record for ${nameMatch ? nameMatch[1] : "the student"}.`,
    };
  }

  // ---- Faculty actions ----
  if (q.includes("add faculty") || q.includes("hire") || q.includes("add professor") || q.includes("new faculty")) {
    const nameMatch = query.match(/(?:add|hire)\s+(?:faculty\s+|professor\s+)?(?:Prof\.?\s+)?(\w+)/i);
    const deptMatch = query.match(/(?:in|to|for)\s+(\w+)\s+(?:department|dept)/i);
    return {
      action: {
        action: "add_faculty",
        data: {
          name: nameMatch ? `Prof. ${nameMatch[1]}` : "Prof. New",
          department: deptMatch ? deptMatch[1].toUpperCase() : "CSE",
          subjects: [],
        },
      },
      response: `I'll add ${nameMatch ? "Prof. " + nameMatch[1] : "the new faculty member"} to the records.`,
    };
  }

  if (q.includes("list faculty") || q.includes("show faculty") || q.includes("all faculty") || q.includes("get faculty")) {
    return {
      action: { action: "list_faculty", data: {} },
      response: "Here are the current faculty members.",
    };
  }

  if (q.includes("assign subject") || q.includes("assign course") || q.includes("assign") && q.includes("prof")) {
    const courseMatch = query.match(/assign\s+(.+?)\s+to/i);
    const facultyMatch = query.match(/to\s+(?:Prof\.?\s+)?(\w+)/i);
    return {
      action: {
        action: "assign_subject",
        data: {
          faculty: facultyMatch ? `Prof. ${facultyMatch[1]}` : "Unknown",
          subject: courseMatch ? courseMatch[1] : "Unknown Subject",
        },
      },
      response: `I'll assign the subject to the faculty member.`,
    };
  }

  if (q.includes("delete faculty") || q.includes("remove faculty")) {
    const nameMatch = query.match(/(?:delete|remove)\s+(?:faculty\s+)?(?:Prof\.?\s+)?(\w+)/i);
    return {
      action: {
        action: "delete_faculty",
        data: { name: nameMatch ? nameMatch[1] : "Unknown" },
      },
      response: `I'll remove the faculty member from records.`,
    };
  }

  if (q.includes("workload") || q.includes("faculty report") || q.includes("faculty load")) {
    return {
      action: { action: "generate_workload", data: {} },
      response: "Here is the faculty workload report.",
    };
  }

  // ---- Course actions ----
  if (q.includes("add course") || q.includes("create course") || q.includes("new course")) {
    const nameMatch = query.match(/(?:add|create|new)\s+course\s+(.+?)(?:\s+(?:in|for|to|semester)|$)/i);
    const semMatch = query.match(/semester\s+(\d+)/i);
    return {
      action: {
        action: "create_course",
        data: {
          name: nameMatch ? nameMatch[1].trim() : "New Course",
          semester: semMatch ? parseInt(semMatch[1]) : 1,
          department: "CSE",
          credits: 3,
        },
      },
      response: `I'll create the new course.`,
    };
  }

  if (q.includes("list course") || q.includes("show course") || q.includes("all course") || q.includes("get course")) {
    return {
      action: { action: "list_courses", data: {} },
      response: "Here are the available courses.",
    };
  }

  if (q.includes("delete course") || q.includes("remove course")) {
    const nameMatch = query.match(/(?:delete|remove)\s+course\s+(.+)/i);
    return {
      action: {
        action: "delete_course",
        data: { name: nameMatch ? nameMatch[1].trim() : "Unknown" },
      },
      response: `I'll remove the course.`,
    };
  }

  if (q.includes("update course") || q.includes("modify course")) {
    return {
      action: { action: "update_course", data: {} },
      response: "I'll update the course details.",
    };
  }

  // ---- Attendance actions ----
  if (q.includes("record attendance") || q.includes("mark attendance") || q.includes("mark present") || q.includes("mark absent")) {
    const studentMatch = query.match(/(?:for|of)\s+(\w+)/i);
    const status = q.includes("absent") ? "absent" : "present";
    return {
      action: {
        action: "record_attendance",
        data: {
          studentName: studentMatch ? studentMatch[1] : "Unknown",
          date: new Date().toISOString().split("T")[0],
          status,
        },
      },
      response: `I'll record the attendance.`,
    };
  }

  if (q.includes("attendance") && (q.includes("below") || q.includes("low") || q.includes("less than"))) {
    const pctMatch = query.match(/(\d+)%/);
    return {
      action: {
        action: "attendance_report",
        data: { threshold: pctMatch ? parseInt(pctMatch[1]) : 75 },
      },
      response: "Here is the attendance report.",
    };
  }

  if (q.includes("list attendance") || q.includes("show attendance") || q.includes("attendance report") || q.includes("get attendance")) {
    return {
      action: { action: "list_attendance", data: {} },
      response: "Here are the attendance records.",
    };
  }

  // ---- Exam actions ----
  if (q.includes("schedule exam") || q.includes("create exam") || q.includes("add exam")) {
    const courseMatch = query.match(/(?:for|of)\s+(.+?)(?:\s+on|\s*$)/i);
    const dateMatch = query.match(/on\s+(.+)/i);
    return {
      action: {
        action: "schedule_exam",
        data: {
          course: courseMatch ? courseMatch[1].trim() : "Unknown",
          date: dateMatch ? dateMatch[1].trim() : "TBD",
          type: "midterm",
        },
      },
      response: "I'll schedule the exam.",
    };
  }

  if (q.includes("list exam") || q.includes("show exam") || q.includes("upcoming exam") || q.includes("get exam")) {
    return {
      action: { action: "list_exams", data: {} },
      response: "Here are the scheduled exams.",
    };
  }

  if (q.includes("report") || q.includes("generate report") || q.includes("summary")) {
    return {
      action: { action: "generate_report", data: {} },
      response: "Here is the requested report.",
    };
  }

  // Fallback — general help
  return {
    action: null,
    response:
      "I understand your request. Could you be more specific? I can help with operations like:\n" +
      "• Enrolling/listing/updating/deleting students\n" +
      "• Adding/listing faculty and assigning subjects\n" +
      "• Creating/listing courses\n" +
      "• Recording/reporting attendance\n" +
      "• Scheduling exams\n" +
      "• Generating reports",
  };
}

module.exports = { processQuery };
