const pool = require("../config/db");

exports.syncUser = async (req, res) => {
  const { uid, email, name } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length === 0) {
      const result = await pool.query(
        `INSERT INTO users (email, name, role)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [email, name, "PARTICIPANT"]
      );
      return res.status(201).json({ 
        message: "User created successfully",
        user: result.rows[0]
      });
    }

    res.json({ 
      message: "User already exists",
      user: existingUser.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};