// ============================================================
// SETUP-DB.JS — Run once to initialise the zenai PostgreSQL
// database, create tables, and seed dummy data.
//
//   node setup-db.js
// ============================================================

require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Connect to the default "postgres" DB first so we can CREATE DATABASE
const adminPool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "Ashrudi",
  database: "postgres",
});

async function run() {
  // 1. Create database if it doesn't exist
  const dbName = process.env.DB_NAME || "zenai";
  const exists = await adminPool.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
  );
  if (exists.rows.length === 0) {
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`✔  Database "${dbName}" created.`);
  } else {
    console.log(`ℹ  Database "${dbName}" already exists.`);
  }
  await adminPool.end();

  // 2. Connect to zenai DB
  const pool = new Pool({
    host:     process.env.DB_HOST     || "localhost",
    port:     parseInt(process.env.DB_PORT) || 5432,
    user:     process.env.DB_USER     || "postgres",
    password: process.env.DB_PASSWORD || "Ashrudi",
    database: dbName,
  });

  // 3. Create tables
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
  console.log("✔  Tables ready.");

  // 4. Seed dummy data (skip if already present)
  const studentCount = await pool.query("SELECT COUNT(*) FROM students");
  if (parseInt(studentCount.rows[0].count) === 0) {
    const studentPass = await bcrypt.hash("Student123", 10);
    const students = [
      ["Alice Johnson",     "alice.johnson@university.edu",   studentPass, "CSE", 2, 3.80, "ROLL-2024-001"],
      ["Bob Smith",         "bob.smith@university.edu",       studentPass, "ECE", 3, 3.50, "ROLL-2023-001"],
      ["Carol Williams",    "carol.williams@university.edu",  studentPass, "ME",  1, 3.90, "ROLL-2025-001"],
      ["David Brown",       "david.brown@university.edu",     studentPass, "CSE", 4, 3.20, "ROLL-2022-001"],
      ["Emma Davis",        "emma.davis@university.edu",      studentPass, "IT",  2, 3.70, "ROLL-2024-002"],
      ["Liam Martinez",     "liam.martinez@university.edu",   studentPass, "ECE", 1, 3.60, "ROLL-2025-002"],
      ["Sophia Wilson",     "sophia.wilson@university.edu",   studentPass, "CSE", 3, 3.85, "ROLL-2023-002"],
      ["Ethan Taylor",      "ethan.taylor@university.edu",    studentPass, "ME",  2, 3.40, "ROLL-2024-003"],
    ];
    for (const s of students) {
      await pool.query(
        `INSERT INTO students (name, email, password, department, year, gpa, roll_number)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        s
      );
    }
    console.log(`✔  ${students.length} students seeded. Password for all: Student123`);
  } else {
    console.log("ℹ  Students already seeded, skipping.");
  }

  const facultyCount = await pool.query("SELECT COUNT(*) FROM faculty");
  if (parseInt(facultyCount.rows[0].count) === 0) {
    const facultyPass = await bcrypt.hash("Faculty123", 10);
    const facultyList = [
      ["Prof. James Wilson",     "james.wilson@university.edu",     facultyPass, "CSE", "Professor",            ["Data Structures", "Algorithms", "DBMS"]],
      ["Prof. Sarah Miller",     "sarah.miller@university.edu",     facultyPass, "ECE", "Associate Professor",  ["Digital Electronics", "VLSI Design"]],
      ["Prof. Michael Taylor",   "michael.taylor@university.edu",   facultyPass, "ME",  "Assistant Professor",  ["Thermodynamics", "Fluid Mechanics"]],
      ["Prof. Jennifer Anderson","jennifer.anderson@university.edu", facultyPass, "IT",  "Professor",            ["Web Technologies", "Cloud Computing"]],
      ["Prof. Robert Thomas",    "robert.thomas@university.edu",    facultyPass, "CSE", "Associate Professor",  ["Operating Systems", "Computer Networks"]],
      ["Prof. Olivia Harris",    "olivia.harris@university.edu",    facultyPass, "ECE", "Assistant Professor",  ["Microprocessors", "Embedded Systems"]],
    ];
    for (const f of facultyList) {
      await pool.query(
        `INSERT INTO faculty (name, email, password, department, designation, subjects)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        f
      );
    }
    console.log(`✔  ${facultyList.length} faculty seeded. Password for all: Faculty123`);
  } else {
    console.log("ℹ  Faculty already seeded, skipping.");
  }

  await pool.end();
  console.log("\n✅ Database setup complete!\n");
  console.log("Demo credentials:");
  console.log("  Students  → any email above  | password: Student123");
  console.log("  Faculty   → any email above  | password: Faculty123\n");
}

run().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
