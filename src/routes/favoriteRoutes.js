const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const {
  addFavorite,
  removeFavorite,
  getEventFavorites,
  getAllMyFavorites,
} = require("../controllers/favoriteController");

// Favorites management
router.post("/events/:eventId/participants/:participantId", authenticate, addFavorite);
router.delete("/events/:eventId/participants/:participantId", authenticate, removeFavorite);

// Get favorites
router.get("/events/:eventId", authenticate, getEventFavorites);
router.get("/all", authenticate, getAllMyFavorites);

module.exports = router;
