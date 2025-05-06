const pool = require("../config/dbConfig");

const QuestionsModel = {
  //Get sections list
  getSections: async () => {
    try {
      const query = "SELECT id, name FROM section WHERE isActive = 1";
      const [result] = await pool.query(query);
      return result;
    } catch (error) {
      throw new Error("Error getting section: " + error.message);
    }
  },

  //Get courses list
  getCourses: async () => {
    try {
      const query = `SELECT id, name FROM course WHERE isActive = 1`;
      const [courses] = await pool.query(query);
      return courses;
    } catch (error) {
      throw new Error("Error getting courses: " + error.message);
    }
  },

  //Insert new question
  insertQuestion: async (
    question,
    correct_answer,
    section_id,
    course_id,
    option_a,
    option_b,
    option_c,
    option_d
  ) => {
    try {
      const query = `INSERT INTO questions (question, correct_answer, section_id, course_id, option_a, option_b, option_c, option_d) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await pool.execute(query, [
        question,
        correct_answer,
        section_id,
        course_id,
        option_a,
        option_b,
        option_c,
        option_d,
      ]);
      return result;
    } catch (error) {
      throw new Error("Error while inserting question: " + error.message);
    }
  },

  //Check question is already exists
  findQuestionByTextAndSection: async (questionText, sectionId, courseId) => {
    try {
      const query = `
                SELECT * FROM questions 
                WHERE question = ? 
                AND section_id = ? 
                AND course_id = ?
            `;
      const [result] = await pool.query(query, [
        questionText,
        sectionId,
        courseId,
      ]);
      return result[0]; // Returns the first match (or undefined if none)
    } catch (error) {
      throw new Error("Error checking question existence: " + error.message);
    }
  },

  // bulkInsertOptions: async (question_id, options) => {
  //     const conn = await pool.getConnection();
  //     try {
  //         await conn.beginTransaction();

  //         // Use regular query with multiple value sets
  //         const query = `
  //             INSERT INTO options (question_id, option_text)
  //             VALUES ${options.map(() => "(?, ?)").join(",")}
  //         `;

  //         // Flatten the parameters array
  //         const params = options.flatMap((option_text) => [
  //             question_id,
  //             option_text,
  //         ]);

  //         const [result] = await conn.query(query, params);
  //         await conn.commit();

  //         return {
  //             affectedRows: result.affectedRows,
  //             question_id,
  //             optionCount: options.length,
  //         };
  //     } catch (error) {
  //         await conn.rollback();
  //         throw new Error(`Bulk insert failed: ${error.message}`);
  //     } finally {
  //         conn.release();
  //     }
  // },

  // // Check for existing options (bulk version)
  // findExistingOptions: async (question_id, options) => {
  //     const conn = await pool.getConnection();
  //     try {
  //         // Create a temporary table pattern for IN clause
  //         const placeholders = options.map(() => "?").join(",");
  //         const query = `
  //         SELECT * FROM options
  //         WHERE is_active = 1
  //         AND question_id = ?
  //         AND option_text IN (${placeholders})
  //     `;

  //         const [results] = await conn.query(query, [question_id, ...options]);
  //         return results;
  //     } catch (error) {
  //         throw new Error(`Error checking option existence: ${error.message}`);
  //     } finally {
  //         conn.release();
  //     }
  // },

  getQuestionsWithOptions: async (course_id, section_id) => {
    const queryd = `SELECT q.id AS question_id, q.course_id, c.name AS course_name, q.correct_answer, section_id, s.name as section_name, question, option_a, option_b, option_c, option_d FROM questions q LEFT JOIN section s on q.section_id = s.id LEFT JOIN course c on c.id = q.course_id WHERE q.is_active = 1 AND (${
      course_id === undefined ? null : course_id
    } IS NULL OR course_id = ?) AND (${
      section_id === undefined ? null : section_id
    } IS NULL OR section_id = ?)`;

    try {
      // 1. First get all questions
      const values = [course_id, section_id];
      const [questions] = await pool.query(queryd, values);
      return questions;
    } catch (error) {
      throw new Error(`Failed to get questions with options: ${error.message}`);
    }
  },

  updateQuestion: async (
    id,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    section_id,
    course_id
  ) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const query = `
                UPDATE questions 
                SET 
                    question = ?, 
                    correct_answer = ?, 
                    option_a = ?, 
                    option_b = ?, 
                    option_c = ?, 
                    option_d = ?, 
                    section_id = ?, 
                    course_id = ?
                WHERE id = ? AND is_active = 1`;

      const values = [
        question,
        correct_answer,
        option_a,
        option_b,
        option_c,
        option_d,
        section_id,
        course_id,
        id,
      ];

      const [result] = await pool.query(query, values);
      await conn.commit();

      console.log("Result", result);

      return {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows,
        id: id,
      };
    } catch (error) {
      await conn.rollback();
      console.error("Database update error:", error);
      throw new Error(`Failed to update question: ${error.message}`);
    } finally {
      conn.release();
    }
  },

  findQuestionExists: async (id) => {
    try {
      const query = `
                SELECT * FROM questions 
                WHERE id = ?
            `;
      const [result] = await pool.query(query, [id]);
      return result[0]; // Returns the first match (or undefined if none)
    } catch (error) {
      throw new Error("Error checking question existence: " + error.message);
    }
  },

  deleteQuestion: async (id) => {
    try {
      const query = `UPDATE questions SET is_active = 0 WHERE id = ?`;
      const [result] = await pool.query(query, [id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error("Error while deleting: " + error.message);
    }
  },

  insertUserAnswer: async (user_id, course_id, answers) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // 1. Get the last attempt number for this user and course
      const query = `SELECT MAX(attempt_number) AS last_attempt FROM test_attempts WHERE user_id = ? AND course_id = ?`;
      const [rows] = await db.query(query, [user_id, course_id]);
      const lastAttempt = rows[0].last_attempt || 0;
      const nextAttempt = lastAttempt + 1;

      // 2. Insert new attempt with incremented attempt_number
      const [attemptResult] = await db.query(
        "INSERT INTO test_attempts (user_id, course_id, attempt_number) VALUES (?, ?, ?)",
        [user_id, course_id, nextAttempt]
      );

      // Step 3: For each answer, get correct answer, compare, calculate mark
      const answerValues = [];
      let totalMarks = 0;

      for (const answer of answers) {
        const { question_id, selected_option } = answer;

        // Get correct answer for the question
        const [correctRows] = await connection.query(
          `SELECT correct_answer FROM questions WHERE id = ?`,
          [question_id]
        );

        const correctAnswer = correctRows[0]?.correct_answer;
        const mark = correctAnswer === selected_option ? 1 : 0;
        totalMarks += mark;

        answerValues.push([
          user_id,
          question_id,
          selected_option,
          mark,
          nextAttempt,
        ]);

        // Step 4: Bulk insert all answers
        await connection.query(
          `INSERT INTO user_answers 
       (user_id, question_id, selected_option, mark, attempt_number)
       VALUES ?`,
          [answerValues]
        );

        await connection.commit();
        connection.release();

        return {
          success: true,
          attempt_number: nextAttempt,
          total_questions: answers.length,
          total_marks_obtained: totalMarks,
        };
      }
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw new Error("Error in insertUserAnswer:" + error.message);
    }
  },
};
module.exports = QuestionsModel;
