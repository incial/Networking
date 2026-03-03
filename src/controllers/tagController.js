const pool = require("../config/db");

// Create Tags for Event (Organizer only)
exports.createTags = async (req, res) => {
  const { eventId } = req.params;
  const { tags } = req.body; // Array of tag names
  const organizerId = req.user.id;

  try {
    // Verify organizer owns this event
    const eventCheck = await pool.query(
      `SELECT * FROM events WHERE id = $1 AND organizer_id = $2`,
      [eventId, organizerId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to manage this event's tags" });
    }

    const createdTags = [];

    for (const tagName of tags) {
      const result = await pool.query(
        `INSERT INTO tags (event_id, name) VALUES ($1, $2) RETURNING *`,
        [eventId, tagName]
      );
      createdTags.push(result.rows[0]);
    }

    res.status(201).json({
      message: "Tags created successfully",
      tags: createdTags
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Tags for Event
exports.getEventTags = async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM tags WHERE event_id = $1 ORDER BY name ASC`,
      [eventId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Tag (Organizer only)
exports.updateTag = async (req, res) => {
  const { tagId } = req.params;
  const { name } = req.body;
  const organizerId = req.user.id;

  try {
    // Verify organizer owns the event this tag belongs to
    const tagCheck = await pool.query(
      `SELECT t.*, e.organizer_id 
       FROM tags t
       JOIN events e ON t.event_id = e.id
       WHERE t.id = $1`,
      [tagId]
    );

    if (tagCheck.rows.length === 0) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (tagCheck.rows[0].organizer_id !== organizerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const result = await pool.query(
      `UPDATE tags SET name = $1 WHERE id = $2 RETURNING *`,
      [name, tagId]
    );

    res.json({
      message: "Tag updated successfully",
      tag: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Tag (Organizer only)
exports.deleteTag = async (req, res) => {
  const { tagId } = req.params;
  const organizerId = req.user.id;

  try {
    // Verify organizer owns the event this tag belongs to
    const tagCheck = await pool.query(
      `SELECT t.*, e.organizer_id 
       FROM tags t
       JOIN events e ON t.event_id = e.id
       WHERE t.id = $1`,
      [tagId]
    );

    if (tagCheck.rows.length === 0) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (tagCheck.rows[0].organizer_id !== organizerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await pool.query(`DELETE FROM tags WHERE id = $1`, [tagId]);

    res.json({ message: "Tag deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Tag Distribution for Event (Organizer only)
exports.getTagDistribution = async (req, res) => {
  const { eventId } = req.params;
  const organizerId = req.user.id;

  try {
    // Verify organizer owns this event
    const eventCheck = await pool.query(
      `SELECT * FROM events WHERE id = $1 AND organizer_id = $2`,
      [eventId, organizerId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const result = await pool.query(
      `SELECT t.id, t.name, COUNT(pt.user_id) as participant_count
       FROM tags t
       LEFT JOIN participant_tags pt ON t.id = pt.tag_id
       WHERE t.event_id = $1
       GROUP BY t.id, t.name
       ORDER BY participant_count DESC, t.name ASC`,
      [eventId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
