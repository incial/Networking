const pool = require("../config/db");
const generateSlug = require("../utils/generateSlug");
const QRCode = require("qrcode");

// Create Event with Tags
exports.createEvent = async (req, res) => {
  const { name, description, location, event_date, tags } = req.body;
  const organizerId = req.user.id;

  try {
    const slug = generateSlug();

    const eventResult = await pool.query(
      `INSERT INTO events 
       (organizer_id, name, description, location, event_date, slug, status)
       VALUES ($1,$2,$3,$4,$5,$6,'PENDING')
       RETURNING *`,
      [organizerId, name, description, location, event_date, slug]
    );

    const event = eventResult.rows[0];

    // Insert tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        await pool.query(
          `INSERT INTO tags (event_id, name) VALUES ($1, $2)`,
          [event.id, tagName]
        );
      }
    }

    res.status(201).json({
      message: "Event created and pending approval",
      event,
      qr_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${slug}`,
      direct_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${slug}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Event by Slug (Public - for join page)
exports.getEventBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const eventResult = await pool.query(
      `SELECT e.*, u.name as organizer_name 
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.slug = $1 AND e.status = 'APPROVED'`,
      [slug]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found or not approved" });
    }

    const event = eventResult.rows[0];

    // Get tags for this event
    const tagsResult = await pool.query(
      `SELECT * FROM tags WHERE event_id = $1`,
      [event.id]
    );

    res.json({
      ...event,
      tags: tagsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Event by ID (with full details)
exports.getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const eventResult = await pool.query(
      `SELECT e.*, u.name as organizer_name, u.email as organizer_email
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = eventResult.rows[0];

    // Get tags
    const tagsResult = await pool.query(
      `SELECT * FROM tags WHERE event_id = $1`,
      [event.id]
    );

    // Get participant count
    const countResult = await pool.query(
      `SELECT COUNT(*) as participant_count FROM event_participants WHERE event_id = $1`,
      [event.id]
    );

    res.json({
      ...event,
      tags: tagsResult.rows,
      participant_count: parseInt(countResult.rows[0].participant_count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, location, event_date } = req.body;
  const organizerId = req.user.id;

  try {
    // Check if user owns this event
    const checkResult = await pool.query(
      `SELECT * FROM events WHERE id = $1 AND organizer_id = $2`,
      [id, organizerId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to edit this event" });
    }

    const result = await pool.query(
      `UPDATE events 
       SET name = $1, description = $2, location = $3, event_date = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, description, location, event_date, id]
    );

    res.json({
      message: "Event updated successfully",
      event: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Archive Event
exports.archiveEvent = async (req, res) => {
  const { id } = req.params;
  const organizerId = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE events 
       SET status = 'ARCHIVED', updated_at = NOW()
       WHERE id = $1 AND organizer_id = $2
       RETURNING *`,
      [id, organizerId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized or event not found" });
    }

    res.json({ message: "Event archived successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Organizer's Events
exports.getMyEvents = async (req, res) => {
  const organizerId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT e.*, 
       (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
       FROM events e
       WHERE e.organizer_id = $1
       ORDER BY e.created_at DESC`,
      [organizerId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Approved Events
exports.getAllApprovedEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name as organizer_name,
       (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.status = 'APPROVED'
       ORDER BY e.event_date DESC`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Super Admin: Approve Event
exports.approveEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE events SET status='APPROVED', updated_at=NOW() WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ 
      message: "Event approved successfully",
      event: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Super Admin: Reject Event
exports.rejectEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE events SET status='REJECTED', updated_at=NOW() WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ 
      message: "Event rejected",
      event: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Super Admin: Get Pending Events
exports.getPendingEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name as organizer_name, u.email as organizer_email
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.status='PENDING'
       ORDER BY e.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate QR Code for Event
exports.generateQRCode = async (req, res) => {
  const { slug } = req.params;

  try {
    const joinUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${slug}`;
    const qrCode = await QRCode.toDataURL(joinUrl);

    res.json({
      qr_code: qrCode,
      join_url: joinUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};