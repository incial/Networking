const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
  createEvent,
  getEventBySlug,
  getEventById,
  updateEvent,
  archiveEvent,
  getMyEvents,
  getAllApprovedEvents,
  approveEvent,
  rejectEvent,
  getPendingEvents,
  generateQRCode,
} = require("../controllers/eventController");

// Public routes
router.get("/slug/:slug", getEventBySlug);

// Authenticated routes
router.get("/approved", authenticate, getAllApprovedEvents);
router.get("/my-events", authenticate, authorizeRoles("ORGANIZER"), getMyEvents);
router.get("/:id", authenticate, getEventById);
router.get("/:slug/qr", authenticate, generateQRCode);

// Organizer routes
router.post("/", authenticate, authorizeRoles("ORGANIZER"), createEvent);
router.put("/:id", authenticate, authorizeRoles("ORGANIZER"), updateEvent);
router.patch("/:id/archive", authenticate, authorizeRoles("ORGANIZER"), archiveEvent);

// Super Admin routes
router.get("/admin/pending", authenticate, authorizeRoles("SUPER_ADMIN"), getPendingEvents);
router.patch("/:id/approve", authenticate, authorizeRoles("SUPER_ADMIN"), approveEvent);
router.patch("/:id/reject", authenticate, authorizeRoles("SUPER_ADMIN"), rejectEvent);

module.exports = router;