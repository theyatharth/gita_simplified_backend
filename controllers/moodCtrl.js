const pool = require("../config/dbConfig")

const addMood = async (req, res) => {
  try {

    const { user_id, mood_value, mood_label, notes } = req.body;

    if (!user_id || !mood_value || !mood_label) {
      return res.status(400).json({ messgae: "user_id, mood_value, and mood_label are required" });
    }

    const query =
      `INSERT INTO moods (user_id, mood_value, mood_label, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, mood_value, mood_label, notes, created_at
    `;
    const values = [user_id, mood_value, mood_label, notes || null];

    const { rows } = await pool.query(query, values);

    res.status(201).json({
      status: "success",
      message: "Mood added successfully",
      mood: rows[0]
    });
  } catch (error) {
    console.error("Error adding mood:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get latest mood entry
const getLatestMood = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const query = `
      SELECT id, mood_value, mood_label, notes, created_at
      FROM moods
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No mood entry found" });
    }

    res.status(200).json({
      status: "success",
      latest_mood: rows[0]
    });
  } catch (error) {
    console.error("Error fetching latest mood:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get mood history (with optional limit)
const getMoodHistory = async (req, res) => {
  try {
    const { user_id, limit } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const query =
      `SELECT id, mood_value, mood_label, notes, created_at
      FROM moods
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`;

    const { rows } = await pool.query(query, [user_id, limit || 10]);

    res.status(200).json({
      status: "success",
      tal: rows.length,
      moods: rows
    });

  } catch (error) {
    console.error("Error fetching mood history:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { addMood, getLatestMood, getMoodHistory };