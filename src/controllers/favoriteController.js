const pool = require("../config/db");

// Add to Favorites
exports.addFavorite = async (req, res) => {
  const { eventId, participantId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is participant of this event
    const participantCheck = await pool.query(
      `SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: "You must join this event to add favorites" });
    }

    // Check if target user is also a participant
    const targetCheck = await pool.query(
      `SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2`,
      [eventId, participantId]
    );

    if (targetCheck.rows.length === 0) {
      return res.status(404).json({ message: "User is not a participant of this event" });
    }

    // Check if already favorited
    const existingFavorite = await pool.query(
      `SELECT * FROM favorites WHERE event_id = $1 AND user_id = $2 AND favorited_user_id = $3`,
      [eventId, userId, participantId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    // Add to favorites
    await pool.query(
      `INSERT INTO favorites (event_id, user_id, favorited_user_id)
       VALUES ($1, $2, $3)`,
      [eventId, userId, participantId]
    );

    res.status(201).json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove from Favorites
exports.removeFavorite = async (req, res) => {
  const { eventId, participantId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `DELETE FROM favorites 
       WHERE event_id = $1 AND user_id = $2 AND favorited_user_id = $3
       RETURNING *`,
      [eventId, userId, participantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get My Favorites for an Event
exports.getEventFavorites = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is participant
    const participantCheck = await pool.query(
      `SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: "You must join this event to view favorites" });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.linkedin_url, u.company, u.designation,
              f.created_at as favorited_at,
              ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
       FROM favorites f
       JOIN users u ON f.favorited_user_id = u.id
       LEFT JOIN participant_tags pt ON pt.user_id = u.id AND pt.event_id = $1
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE f.event_id = $1 AND f.user_id = $2
       GROUP BY u.id, u.name, u.email, u.linkedin_url, u.company, u.designation, f.created_at
       ORDER BY f.created_at DESC`,
      [eventId, userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All My Favorites Across All Events
exports.getAllMyFavorites = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT e.id as event_id, e.name as event_name, e.event_date,
              u.id, u.name, u.email, u.linkedin_url, u.company, u.designation,
              f.created_at as favorited_at,
              ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
       FROM favorites f
       JOIN events e ON f.event_id = e.id
       JOIN users u ON f.favorited_user_id = u.id
       LEFT JOIN participant_tags pt ON pt.user_id = u.id AND pt.event_id = e.id
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE f.user_id = $1
       GROUP BY e.id, e.name, e.event_date, u.id, u.name, u.email, u.linkedin_url, u.company, u.designation, f.created_at
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
