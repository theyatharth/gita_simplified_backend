const pool = require('../config/dbConfig');

// ✅ 1. Create Category
const createCategory = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Category type is required" });
    }

    const existing = await pool.query("SELECT * FROM categories WHERE type = $1", [type]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const result = await pool.query(
      "INSERT INTO categories (type) VALUES ($1) RETURNING *",
      [type]
    );

    res.status(201).json({ message: "Category created successfully", category: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 2. Get All Categories
const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 3. Get Category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 4. Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Category type is required" });
    }

    const result = await pool.query(
      "UPDATE categories SET type=$1 WHERE id=$2 RETURNING *",
      [type, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully", category: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 5. Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM categories WHERE id=$1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory }
