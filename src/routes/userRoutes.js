const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
  requestOrganizer,
  approveOrganizer,
  getPendingOrganizers,
  getUserProfile,
  updateUserProfile,
  getMyJoinedEvents,
} = require("../controllers/userController");

// User profile routes
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.get("/joined-events", authenticate, getMyJoinedEvents);

// Organizer request routes
router.post("/request-organizer", authenticate, requestOrganizer);

// Super Admin routes
router.get("/admin/pending-organizers", authenticate, authorizeRoles("SUPER_ADMIN"), getPendingOrganizers);
router.patch("/admin/approve-organizer/:userId", authenticate, authorizeRoles("SUPER_ADMIN"), approveOrganizer);

module.exports = router;