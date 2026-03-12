// reseed-db.js — Re-seeds the PostgreSQL auth tables using the JSON data files.
// This ensures login credentials match the students / faculty in the JSON flat files.
//
//   node reseed-db.js

require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "Ashrudi",
  database: process.env.DB_NAME     || "zenai",
});

async function run() {
  // Ensure tables exist (same CREATE as setup-db.js, idempotent)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(150) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      department  VARCHAR(50),
      year        INTEGER,
      gpa         DECIMAL(3,2),
      roll_number VARCHAR(20) UNIQUE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS faculty (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(150) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      department  VARCHAR(50),
      designation VARCHAR(100),
      subjects    TEXT[],
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Hash passwords once
  const studentPass = await bcrypt.hash("Student123", 10);
  const facultyPass = await bcrypt.hash("Faculty123", 10);

  // ── Students ──────────────────────────────────────────────────
  const studentsRaw = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "students.json"), "utf8")
  );

  // Truncate and re-seed students
  await pool.query("TRUNCATE TABLE students RESTART IDENTITY CASCADE");
  for (const s of studentsRaw) {
    await pool.query(
      `INSERT INTO students (name, email, password, department, year, gpa, roll_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        s.name,
        s.email,
        studentPass,
        s.department,
        s.year,
        s.gpa,
        `ROLL-${s.year}-${String(s.id).padStart(3, "0")}`,
      ]
    );
  }
  console.log(`✔  ${studentsRaw.length} students seeded from students.json (password: Student123)`);

  // ── Faculty ───────────────────────────────────────────────────
  const facultyRaw = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "faculty.json"), "utf8")
  );

  // Truncate and re-seed faculty
  await pool.query("TRUNCATE TABLE faculty RESTART IDENTITY CASCADE");
  for (const f of facultyRaw) {
    const email = f.email.replace(/\.\./g, "."); // fix any double-dot typos
    await pool.query(
      `INSERT INTO faculty (name, email, password, department, designation, subjects)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET name=$1, password=$3, department=$4, designation=$5, subjects=$6`,
      [
        f.name,
        email,
        facultyPass,
        f.department,
        f.designation || "Lecturer",
        f.subjects || [],
      ]
    );
  }
  console.log(`✔  ${facultyRaw.length} faculty seeded from faculty.json (password: Faculty123)`);

  await pool.end();
  console.log("\n✅  Re-seed complete. All users can now log in.");
  console.log("    Student password : Student123");
  console.log("    Faculty password : Faculty123");
}

run().catch((err) => {
  console.error("❌  Re-seed failed:", err.message);
  pool.end();
  process.exit(1);
});
