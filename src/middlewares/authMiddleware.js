const admin = require("../config/firebase");
const pool = require("../config/db");

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const userResult = await pool.query(
      "SELECT * FROM users WHERE firebase_uid = $1",
      [decoded.uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found in DB" });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = authenticate;