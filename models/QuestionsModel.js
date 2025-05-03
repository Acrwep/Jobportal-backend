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
  insertQuestion: async (question, correct_answer, section_id, course_id) => {
    try {
      const query = `INSERT INTO questions (question, correct_answer, section_id, course_id) VALUES (?, ?, ?, ?)`;
      const [result] = await pool.execute(query, [
        question,
        correct_answer,
        section_id,
        course_id,
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

  bulkInsertOptions: async (question_id, options) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Use regular query with multiple value sets
      const query = `
                INSERT INTO options (question_id, option_text)
                VALUES ${options.map(() => "(?, ?)").join(",")}
            `;

      // Flatten the parameters array
      const params = options.flatMap((option_text) => [
        question_id,
        option_text,
      ]);

      const [result] = await conn.query(query, params);
      await conn.commit();

      return {
        affectedRows: result.affectedRows,
        question_id,
        optionCount: options.length,
      };
    } catch (error) {
      await conn.rollback();
      throw new Error(`Bulk insert failed: ${error.message}`);
    } finally {
      conn.release();
    }
  },

  // Check for existing options (bulk version)
  findExistingOptions: async (question_id, options) => {
    const conn = await pool.getConnection();
    try {
      // Create a temporary table pattern for IN clause
      const placeholders = options.map(() => "?").join(",");
      const query = `
            SELECT * FROM options 
            WHERE is_active = 1 
            AND question_id = ? 
            AND option_text IN (${placeholders})
        `;

      const [results] = await conn.query(query, [question_id, ...options]);
      return results;
    } catch (error) {
      throw new Error(`Error checking option existence: ${error.message}`);
    } finally {
      conn.release();
    }
  },

  getQuestionsWithOptions: async (course_id, section_id) => {
    let query;
    if (course_id === undefined && section_id === undefined) {
      query = `SELECT id, question  AS name FROM questions`;
    } else {
      query = `SELECT id, question AS name FROM questions WHERE course_id = ? AND section_id = ?`;
    }
    try {
      // 1. First get all questions
      const values = [course_id, section_id];
      const [questions] = await pool.query(query, values);
      console.log("questions", questions);
      // 2. Get all active options
      const [options] = await pool.query(
        "SELECT id, question_id, option_text AS name FROM options WHERE is_active = 1"
      );
      console.log("options", options);
      // 3. Transform into nested structure
      const result = questions.map((question) => ({
        id: question.id,
        name: question.name,
        options: options
          .filter((option) => option.question_id === question.id)
          .map((option) => ({
            id: option.id,
            name: option.name,
          })),
      }));

      return result;
    } catch (error) {
      throw new Error(`Failed to get questions with options: ${error.message}`);
    }
  },
};
module.exports = QuestionsModel;
