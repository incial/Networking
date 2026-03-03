const pool = require("../config/db");

// Get Event Analytics (Organizer only)
exports.getEventAnalytics = async (req, res) => {
  const { eventId } = req.params;
  const organizerId = req.user.id;

  try {
    // Verify organizer owns this event
    const eventCheck = await pool.query(
      `SELECT * FROM events WHERE id = $1 AND organizer_id = $2`,
      [eventId, organizerId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to view analytics for this event" });
    }

    // Total Participants
    const totalParticipants = await pool.query(
      `SELECT COUNT(*) as total FROM event_participants WHERE event_id = $1`,
      [eventId]
    );

    // Join Method Distribution
    const joinMethodDistribution = await pool.query(
      `SELECT join_method, COUNT(*) as count 
       FROM event_participants 
       WHERE event_id = $1 
       GROUP BY join_method`,
      [eventId]
    );

    // Tag Distribution
    const tagDistribution = await pool.query(
      `SELECT t.id, t.name, COUNT(pt.user_id) as participant_count
       FROM tags t
       LEFT JOIN participant_tags pt ON t.id = pt.tag_id
       WHERE t.event_id = $1
       GROUP BY t.id, t.name
       ORDER BY participant_count DESC, t.name ASC`,
      [eventId]
    );

    // Engagement Metrics
    const engagementMetrics = await pool.query(
      `SELECT 
         COUNT(DISTINCT f.user_id) as users_who_favorited,
         COUNT(*) as total_favorites
       FROM favorites f
       WHERE f.event_id = $1`,
      [eventId]
    );

    // Participants with Complete Profiles
    const profileCompletion = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE u.linkedin_url IS NOT NULL) as with_linkedin,
         COUNT(*) FILTER (WHERE u.company IS NOT NULL) as with_company,
         COUNT(*) FILTER (WHERE u.designation IS NOT NULL) as with_designation,
         COUNT(*) as total
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.id
       WHERE ep.event_id = $1`,
      [eventId]
    );

    // Recent Joins (Last 10)
    const recentJoins = await pool.query(
      `SELECT u.name, u.email, ep.joined_at, ep.join_method
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.id
       WHERE ep.event_id = $1
       ORDER BY ep.joined_at DESC
       LIMIT 10`,
      [eventId]
    );

    // Joins Over Time (Daily)
    const joinsOverTime = await pool.query(
      `SELECT 
         DATE(joined_at) as date,
         COUNT(*) as joins
       FROM event_participants
       WHERE event_id = $1
       GROUP BY DATE(joined_at)
       ORDER BY date DESC`,
      [eventId]
    );

    res.json({
      total_participants: parseInt(totalParticipants.rows[0].total),
      join_method_distribution: joinMethodDistribution.rows,
      tag_distribution: tagDistribution.rows,
      engagement: {
        users_who_favorited: parseInt(engagementMetrics.rows[0].users_who_favorited),
        total_favorites: parseInt(engagementMetrics.rows[0].total_favorites)
      },
      profile_completion: {
        with_linkedin: parseInt(profileCompletion.rows[0].with_linkedin),
        with_company: parseInt(profileCompletion.rows[0].with_company),
        with_designation: parseInt(profileCompletion.rows[0].with_designation),
        total: parseInt(profileCompletion.rows[0].total)
      },
      recent_joins: recentJoins.rows,
      joins_over_time: joinsOverTime.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Organizer Statistics (Dashboard)
exports.getOrganizerDashboard = async (req, res) => {
  const organizerId = req.user.id;

  try {
    // Total Events by Status
    const eventStats = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
         COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
         COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
         COUNT(*) FILTER (WHERE status = 'ARCHIVED') as archived,
         COUNT(*) as total
       FROM events
       WHERE organizer_id = $1`,
      [organizerId]
    );

    // Total Participants Across All Events
    const totalParticipants = await pool.query(
      `SELECT COUNT(DISTINCT ep.user_id) as total
       FROM event_participants ep
       JOIN events e ON ep.event_id = e.id
       WHERE e.organizer_id = $1`,
      [organizerId]
    );

    // Most Popular Event
    const mostPopularEvent = await pool.query(
      `SELECT e.id, e.name, COUNT(ep.user_id) as participant_count
       FROM events e
       LEFT JOIN event_participants ep ON e.id = ep.event_id
       WHERE e.organizer_id = $1 AND e.status = 'APPROVED'
       GROUP BY e.id, e.name
       ORDER BY participant_count DESC
       LIMIT 1`,
      [organizerId]
    );

    // Recent Events
    const recentEvents = await pool.query(
      `SELECT e.*, 
         (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
       FROM events e
       WHERE e.organizer_id = $1
       ORDER BY e.created_at DESC
       LIMIT 5`,
      [organizerId]
    );

    res.json({
      event_statistics: eventStats.rows[0],
      total_participants_reached: parseInt(totalParticipants.rows[0].total),
      most_popular_event: mostPopularEvent.rows[0] || null,
      recent_events: recentEvents.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export Event Participants (Organizer only)
exports.exportEventParticipants = async (req, res) => {
  const { eventId } = req.params;
  const organizerId = req.user.id;

  try {
    // Verify organizer owns this event
    const eventCheck = await pool.query(
      `SELECT name FROM events WHERE id = $1 AND organizer_id = $2`,
      [eventId, organizerId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const result = await pool.query(
      `SELECT 
         u.name, u.email, u.linkedin_url, u.company, u.designation,
         ep.joined_at, ep.join_method,
         ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.id
       LEFT JOIN participant_tags pt ON pt.user_id = u.id AND pt.event_id = $1
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE ep.event_id = $1
       GROUP BY u.id, u.name, u.email, u.linkedin_url, u.company, u.designation, ep.joined_at, ep.join_method
       ORDER BY ep.joined_at ASC`,
      [eventId]
    );

    res.json({
      event_name: eventCheck.rows[0].name,
      total_participants: result.rows.length,
      participants: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
