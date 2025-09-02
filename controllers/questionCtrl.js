const pool = require('../config/dbConfig');

// ✅ 1. Create Question
const createQuestion = async (req, res) => {
  try {
    const {
      question_type,
      question_text,
      option_1,
      option_2,
      option_3,
      option_4,
      score,
      order_number
    } = req.body;

    if (!question_type || !question_text) {
      return res.status(400).json({ message: "Question type and text are required" });

    }

    const result = await pool.query(

      `INSERT INTO questions 
      (question_type, question_text, option_1, option_2, option_3, option_4, score, order_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [question_type, question_text, option_1, option_2, option_3, option_4, score || 0, order_number]
    );

    res.status(201).json({ message: "Question created successfully", question: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 2. Get All Questions
const getAllQuestions = async (req, res) => {
  try {
    const result = await pool.query('SELECT * from questions ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 3. Get Question by ID
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * from questions WHERE id = $1', [id]);

    if (result.rows.length == 0) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }

}

// ✅ 4. Update Question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question_type,
      question_text,
      option_1,
      option_2,
      option_3,
      option_4,
      score,

      order_number
    } = req.body;

    const result = await pool.query(
      `UPDATE questions SET 
      question_type=$1, question_text=$2, option_1=$3, option_2=$4, option_3=$5, option_4=$6, score=$7, order_number=$8
      WHERE id=$9 RETURNING *`,
      [question_type, question_text, option_1, option_2, option_3, option_4, score, order_number, id]
    );
    if (result.rows.length == 0) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question Updated Successfully", question: result.rows[0] });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
}

// ✅ 5. Delete Question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE from questions WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length == 0) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server error" });
  }

};


module.exports = { createQuestion, getAllQuestions, getQuestionById, updateQuestion, deleteQuestion };