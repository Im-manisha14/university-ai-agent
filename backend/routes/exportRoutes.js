// ============================================================
// EXPORT ROUTES — PDF & Excel export endpoints
// ============================================================

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");

// POST /api/export/pdf
router.post("/pdf", authenticateToken, (req, res) => {
  const { title, headers, rows } = req.body;
  if (!headers || !rows) {
    return res.status(400).json({ success: false, message: "headers and rows required" });
  }

  const reportTitle = title || "Report";
  const colCount = headers.length;
  const colWidth = Math.floor(170 / colCount);

  // Build a simple HTML-to-PDF style approach using raw PDF generation
  // We'll generate a clean HTML table and let the browser render it
  const now = new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${reportTitle}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #111; }
  h1 { text-align: center; color: #1A56DB; margin-bottom: 4px; }
  .date { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #1A56DB; color: #fff; padding: 8px 12px; text-align: center; border: 1px solid #1A56DB; }
  td { padding: 7px 12px; text-align: center; border: 1px solid #ddd; }
  tr:nth-child(even) { background: #f0f5ff; }
  .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #999; }
</style></head><body>
<h1>${reportTitle}</h1>
<div class="date">Generated: ${now}</div>
<table><thead><tr>`;

  for (const h of headers) {
    html += `<th>${h}</th>`;
  }
  html += `</tr></thead><tbody>`;

  for (const row of rows) {
    html += `<tr>`;
    for (const cell of row) {
      html += `<td>${cell}</td>`;
    }
    html += `</tr>`;
  }

  html += `</tbody></table>
<div class="footer">ZenAi University Management System</div>
</body></html>`;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Content-Disposition", `attachment; filename="${reportTitle.replace(/[^a-zA-Z0-9]/g, "_")}.html"`);
  res.send(html);
});

// POST /api/export/csv (Excel-compatible CSV)
router.post("/excel", authenticateToken, (req, res) => {
  const { title, headers, rows } = req.body;
  if (!headers || !rows) {
    return res.status(400).json({ success: false, message: "headers and rows required" });
  }

  // Build CSV with BOM for Excel compatibility
  const BOM = "\uFEFF";
  let csv = BOM;

  // Title row
  csv += `"${title || "Report"}"\n`;
  csv += `"Generated: ${new Date().toLocaleString()}"\n\n`;

  // Headers
  csv += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(",") + "\n";

  // Data rows
  for (const row of rows) {
    csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n";
  }

  const filename = (title || "Report").replace(/[^a-zA-Z0-9]/g, "_");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
  res.send(csv);
});

module.exports = router;
