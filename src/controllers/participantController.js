const pool = require("../config/db");

// Join Event via QR or Link
exports.joinEvent = async (req, res) => {
  const { slug } = req.params;
  const { join_method, selected_tags, linkedin_url, company, designation } = req.body;
  const userId = req.user.id;

  try {
    // Get event by slug
    const eventResult = await pool.query(
      `SELECT * FROM events WHERE slug = $1 AND status = 'APPROVED'`,
      [slug]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found or not approved" });
    }

    const event = eventResult.rows[0];

    // Check if already joined
    const existingParticipant = await pool.query(
      `SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2`,
      [event.id, userId]
    );

    if (existingParticipant.rows.length > 0) {
      return res.status(400).json({ message: "Already joined this event" });
    }

    // Update user profile if additional info provided
    if (linkedin_url || company || designation) {
      await pool.query(
        `UPDATE users 
         SET linkedin_url = COALESCE($1, linkedin_url),
             company = COALESCE($2, company),
             designation = COALESCE($3, designation),
             updated_at = NOW()
         WHERE id = $4`,
        [linkedin_url, company, designation, userId]
      );
    }

    // Add to event participants
    await pool.query(
      `INSERT INTO event_participants (event_id, user_id, join_method)
       VALUES ($1, $2, $3)`,
      [event.id, userId, join_method || 'LINK']
    );

    // Add selected tags
    if (selected_tags && selected_tags.length > 0) {
      for (const tagId of selected_tags) {
        await pool.query(
          `INSERT INTO participant_tags (event_id, user_id, tag_id)
           VALUES ($1, $2, $3)`,
          [event.id, userId, tagId]
        );
      }
    }

    res.status(201).json({
      message: "Successfully joined event",
      event_id: event.id,
      event_name: event.name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Event Directory (Only for participants of this event)
exports.getEventDirectory = async (req, res) => {
  const { eventId } = req.params;
  const { search, tags } = req.query;
  const userId = req.user.id;

  try {
    // Check if user is participant of this event
    const participantCheck = await pool.query(
      `SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: "You must join this event to view the directory" });
    }

    let query = `
      SELECT DISTINCT u.id, u.name, u.email, u.linkedin_url, u.company, u.designation,
             ep.joined_at, ep.join_method,
             EXISTS(SELECT 1 FROM favorites WHERE event_id = $1 AND user_id = $2 AND favorited_user_id = u.id) as is_favorited,
             ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM event_participants ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN participant_tags pt ON pt.user_id = u.id AND pt.event_id = $1
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE ep.event_id = $1 AND u.id != $2
    `;

    const params = [eventId, userId];

    // Add search filter
    if (search) {
      query += ` AND (u.name ILIKE $${params.length + 1} OR u.company ILIKE $${params.length + 1} OR u.designation ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY u.id, u.name, u.email, u.linkedin_url, u.company, u.designation, ep.joined_at, ep.join_method`;

    // Add tag filter
    if (tags) {
      const tagArray = tags.split(',');
      query += ` HAVING ARRAY_AGG(DISTINCT t.name) && $${params.length + 1}`;
      params.push(tagArray);
    }

    query += ` ORDER BY ep.joined_at DESC`;

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Participant Profile in Event
exports.getParticipantProfile = async (req, res) => {
  const { eventId, participantId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is participant of this event
    const participantCheck = await pool.query(
      `SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: "You must join this event to view profiles" });
    }

    // Get participant profile
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.linkedin_url, u.company, u.designation,
              ep.joined_at, ep.join_method,
              EXISTS(SELECT 1 FROM favorites WHERE event_id = $1 AND user_id = $2 AND favorited_user_id = $3) as is_favorited,
              ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
       FROM users u
       JOIN event_participants ep ON ep.user_id = u.id AND ep.event_id = $1
       LEFT JOIN participant_tags pt ON pt.user_id = u.id AND pt.event_id = $1
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE u.id = $3
       GROUP BY u.id, u.name, u.email, u.linkedin_url, u.company, u.designation, ep.joined_at, ep.join_method`,
      [eventId, userId, participantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Participant not found in this event" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update My Tags for an Event
exports.updateMyEventTags = async (req, res) => {
  const { eventId } = req.params;
  const { tag_ids } = req.body;
  const userId = req.user.id;

  try {
    // Check if user is participant
    const participantCheck = await pool.query(
      `SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: "You are not a participant of this event" });
    }

    // Delete existing tags
    await pool.query(
      `DELETE FROM participant_tags WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    // Insert new tags
    if (tag_ids && tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await pool.query(
          `INSERT INTO participant_tags (event_id, user_id, tag_id)
           VALUES ($1, $2, $3)`,
          [eventId, userId, tagId]
        );
      }
    }

    res.json({ message: "Tags updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
