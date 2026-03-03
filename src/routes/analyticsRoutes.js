const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
  getEventAnalytics,
  getOrganizerDashboard,
  exportEventParticipants,
} = require("../controllers/analyticsController");

// All routes are organizer only
router.get("/dashboard", authenticate, authorizeRoles("ORGANIZER"), getOrganizerDashboard);
router.get("/events/:eventId", authenticate, authorizeRoles("ORGANIZER"), getEventAnalytics);
router.get("/events/:eventId/export", authenticate, authorizeRoles("ORGANIZER"), exportEventParticipants);

module.exports = router;
