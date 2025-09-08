const pool = require("../config/dbConfig");

// ✅ 1. Get All Questions (ordered, with options array)
const getQuestionnaire = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, question_type, question_text,
             option_1, option_2, option_3, option_4,
             COALESCE(score, 0) AS max_score, order_number
      FROM questions
      ORDER BY order_number NULLS LAST, id
    `);

    const questions = result.rows.map(q => ({
      id: q.id,
      question_type: q.question_type,
      question_text: q.question_text,
      options: [q.option_1, q.option_2, q.option_3, q.option_4].filter(opt => opt !== null),
      order_number: q.order_number,
      max_score: q.max_score
    }));

    res.status(200).json({
      status: "success",
      total_questions: questions.length,
      questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 2. Submit Questionnaire
const submitQuestionnaire = async (req, res) => {
  try {
    const { user_id, answers } = req.body;

    if (!user_id || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "user_id and answers are required" });
    }

    // Fetch all questions in one go
    const { rows: questions } = await pool.query(`SELECT *, COALESCE(reverse_scored, false) AS reverse_scored FROM questions`);

    // Build map for quick lookup
    const questionMap = {};
    let maxPossibleScore = 0;
    questions.forEach(q => {
      questionMap[q.id] = q;
      maxPossibleScore += q.score || 0;
    });

    let totalScore = 0;
    const processedAnswers = [];

    for (const ans of answers) {
      const { question_id, selected_option, score_value, free_text } = ans;
      const question = questionMap[question_id];

      if (!question) {
        return res.status(404).json({ message: `Question ID ${question_id} not found` });
      }

      let points = 0;

      if (question.question_type === "MCQ") {
        if (!selected_option) {
          return res.status(400).json({ message: `MCQ answer missing selected_option for Q${question_id}` });
        }
        const options = [question.option_1, question.option_2, question.option_3, question.option_4].filter(o => o !== null);
        const idx = ["option_1", "option_2", "option_3", "option_4"].indexOf(selected_option);
        if (idx === -1 || idx >= options.length) {
          return res.status(400).json({ message: `Invalid option for Q${question_id}` });
        }

        const n = options.length;
        const max = question.score || 0;

        // Calculate raw points based on option index
        let rawPoints = max === 0 ? 0 : Math.round((idx / (n - 1)) * max);

        // Reverse scoring logic: if question is marked reverse_scored, invert the points
        points = question.reverse_scored ? max - rawPoints : rawPoints;

      } else if (question.question_type === "SCORE") {
        if (typeof score_value !== "number") {
          return res.status(400).json({ message: `SCORE answer missing score_value for Q${question_id}` });
        }
        const max = question.score || 0;
        let rawPoints = Math.min(Math.max(score_value, 0), max);

        // Reverse scoring for SCORE type too if applicable
        points = question.reverse_scored ? max - rawPoints : rawPoints;

      } else if (question.question_type === "FILL_UP") {
        points = 0; // text answers don't contribute
      }

      totalScore += points;
      processedAnswers.push({ question_id, selected_option, score_value, free_text, points });
    }

    const normalizedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // Insert into questionnaire_responses
    const insertQuery = `
      INSERT INTO questionnaire_responses (user_id, responses, total_score)
      VALUES ($1, $2, $3)
      RETURNING id, completed_at
    `;
    const insertValues = [user_id, JSON.stringify({ answers: processedAnswers, version: 1 }), totalScore];
    const { rows: inserted } = await pool.query(insertQuery, insertValues);

    // Determine band
    let bandLabel = "Low";
    if (normalizedScore >= 61) bandLabel = "High";
    else if (normalizedScore >= 21) bandLabel = "Moderate";

    res.status(201).json({
      status: "success",
      result: {
        total_score: totalScore,
        max_possible_score: maxPossibleScore,
        normalized_score: normalizedScore,
        bands: {
          label: bandLabel,
          range: bandLabel === "Low" ? "0–20" : bandLabel === "Moderate" ? "21–60" : "61–100"
        }
      },
      submission: {
        id: inserted[0].id,
        completed_at: inserted[0].completed_at
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 3. Get Latest Questionnaire
const getLatestQuestionnaire = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const { rows } = await pool.query(`
      SELECT id, responses, total_score, completed_at
      FROM questionnaire_responses
      WHERE user_id = $1
      ORDER BY completed_at DESC
      LIMIT 1
    `, [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No questionnaire found" });
    }

    // Calculate normalized score dynamically
    const { total_score, completed_at, id } = rows[0];

    const { rows: questions } = await pool.query(`SELECT COALESCE(SUM(score), 0) AS max_score FROM questions`);
    const maxPossibleScore = parseInt(questions[0].max_score, 10);
    const normalizedScore = maxPossibleScore > 0 ? Math.round((total_score / maxPossibleScore) * 100) : 0;

    res.status(200).json({
      status: "success",
      submission: {
        id,
        total_score,
        max_possible_score: maxPossibleScore,
        normalized_score: normalizedScore,
        completed_at
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getQuestionnaire,
  submitQuestionnaire,
  getLatestQuestionnaire
};
