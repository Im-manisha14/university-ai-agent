// ============================================================
// ALERT ROUTES — Proactive notification system endpoints
// ============================================================

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getAlerts,
  getUnreadCount,
  markRead,
  markAllRead,
  clearReadAlerts,
} = require("../services/alertService");

// GET /api/alerts — Get all alerts for current user
router.get("/", authenticateToken, (req, res) => {
  const { id, role } = req.user;
  const result = getAlerts(id, role);
  res.json({ success: true, data: result });
});

// GET /api/alerts/count — Unread count for notification badge
router.get("/count", authenticateToken, (req, res) => {
  const { id, role } = req.user;
  const count = getUnreadCount(id, role);
  res.json({ success: true, data: { unreadCount: count } });
});

// PUT /api/alerts/read/:alertId — Mark single alert as read
router.put("/read/:alertId", authenticateToken, (req, res) => {
  const alertId = parseInt(req.params.alertId);
  const ok = markRead(alertId);
  if (!ok) return res.status(404).json({ success: false, message: "Alert not found" });
  res.json({ success: true, message: "Alert marked as read" });
});

// PUT /api/alerts/read-all — Mark all alerts as read for current user
router.put("/read-all", authenticateToken, (req, res) => {
  const { id, role } = req.user;
  const count = markAllRead(id, role);
  res.json({ success: true, message: `${count} alert(s) marked as read` });
});

// DELETE /api/alerts/clear — Delete all read alerts for current user
router.delete("/clear", authenticateToken, (req, res) => {
  const { id, role } = req.user;
  const cleared = clearReadAlerts(id, role);
  res.json({ success: true, message: `${cleared} alert(s) cleared` });
});

module.exports = router;
