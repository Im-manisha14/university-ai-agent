// ============================================================
// DATA SERVICE — Reads and writes JSON files as our "database"
// Uses simple file-based storage for hackathon simplicity
// ============================================================

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

/**
 * Read a JSON data file and return its parsed contents.
 * Falls back to an empty array if the file doesn't exist.
 */
function readData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Write data (array) to a JSON file, overwriting its contents.
 */
function writeData(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readData, writeData };
