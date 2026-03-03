const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
  createTags,
  getEventTags,
  updateTag,
  deleteTag,
  getTagDistribution,
} = require("../controllers/tagController");

// Get tags for an event (available to all authenticated users)
router.get("/events/:eventId", authenticate, getEventTags);

// Organizer only routes
router.post("/events/:eventId", authenticate, authorizeRoles("ORGANIZER"), createTags);
router.put("/:tagId", authenticate, authorizeRoles("ORGANIZER"), updateTag);
router.delete("/:tagId", authenticate, authorizeRoles("ORGANIZER"), deleteTag);
router.get("/events/:eventId/distribution", authenticate, authorizeRoles("ORGANIZER"), getTagDistribution);

module.exports = router;
