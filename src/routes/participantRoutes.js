const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const {
  joinEvent,
  getEventDirectory,
  getParticipantProfile,
  updateMyEventTags,
} = require("../controllers/participantController");

// Join event
router.post("/join/:slug", authenticate, joinEvent);

// Event directory
router.get("/events/:eventId/directory", authenticate, getEventDirectory);
router.get("/events/:eventId/participants/:participantId", authenticate, getParticipantProfile);

// Update my tags for an event
router.put("/events/:eventId/my-tags", authenticate, updateMyEventTags);

module.exports = router;
