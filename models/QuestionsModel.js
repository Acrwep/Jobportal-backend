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
  getCourses: async (courses) => {
    try {
      let query = `SELECT id, name FROM course WHERE isActive = 1`;
      let values = [];

      // Check if courses is an array and has values
      if (Array.isArray(courses) && courses.length > 0) {
        const placeholders = courses.map(() => "?").join(", ");
        query += ` AND id IN (${placeholders})`;
        values = courses;
      }
      const [result] = await pool.query(query, values);
      return result;
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
                AND is_active = 1
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

  getQuestionsWithOptions: async (courses, section_id) => {
    try {
      let conditions = ["q.is_active = 1"];
      let values = [];

      // Handle multiple courses
      if (Array.isArray(courses) && courses.length > 0) {
        const placeholders = courses.map(() => "?").join(", ");
        conditions.push(`q.course_id IN (${placeholders})`);
        values.push(...courses);
      }

      // Handle optional section_id
      if (section_id) {
        conditions.push("q.section_id = ?");
        values.push(section_id);
      }

      let query = `
      SELECT 
        q.id AS question_id, 
        q.course_id, 
        c.name AS course_name, 
        q.correct_answer, 
        q.section_id, 
        s.name AS section_name, 
        q.question, 
        q.option_a, 
        q.option_b, 
        q.option_c, 
        q.option_d
      FROM 
        questions q
      LEFT JOIN 
        section s ON q.section_id = s.id
      LEFT JOIN 
        course c ON c.id = q.course_id
      WHERE 
        ${conditions.join(" AND ")}
    `;

      const [questions] = await pool.query(query, values);
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
      const query = `DELETE FROM questions WHERE id = ?`;
      const [result] = await pool.query(query, [id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error("Error while deleting: " + error.message);
    }
  },

  insertUserAnswer: async (user_id, course_id, answers) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      // 1. Get the last attempt number for this user and course
      const query = `SELECT MAX(attempt_number) AS last_attempt FROM test_attempts WHERE user_id = ? AND course_id = ?`;
      const [rows] = await connection.query(query, [user_id, course_id]);
      const lastAttempt = rows[0].last_attempt || 0;
      const nextAttempt = lastAttempt + 1;

      // 2. Insert new attempt with incremented attempt_number
      const [attemptResult] = await connection.query(
        "INSERT INTO test_attempts (user_id, course_id, attempt_number) VALUES (?, ?, ?)",
        [user_id, course_id, nextAttempt]
      );

      // Step 3: For each answer, get correct answer, compare, calculate mark
      const answerValues = [];
      let totalMarks = 0;
      let percentage = 0;
      console.log("Answers", answers);

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
      }

      // Calculate percentage
      percentage = (totalMarks / answers.length) * 100;

      // 4. Bulk insert all answers at once (more efficient)
      if (answerValues.length > 0) {
        await connection.query(
          `INSERT INTO user_answers 
             (user_id, question_id, selected_option, mark, attempt_number)
             VALUES ?`,
          [answerValues]
        );
      }

      await connection.commit();
      connection.release();

      return {
        success: true,
        attempt_number: nextAttempt,
        total_questions: answers.length,
        total_marks_obtained: totalMarks,
        percentage: percentage.toFixed(2),
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw new Error("Error in insertUserAnswer:" + error.message);
    }
  },

  getRoles: async () => {
    try {
      const [result] = await pool.query(
        "SELECT id, name FROM role WHERE is_active = 1 ORDER BY id"
      );
      return result;
    } catch (error) {
      throw new Error("Error while getting roles: ", error.message);
    }
  },

  insertAdmin: async (
    name,
    email,
    password,
    role_id,
    course_id,
    location_id,
    course_join_date,
    experience,
    profile
  ) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Check if email exists (properly)
      const [emailCheck] = await conn.query(
        "SELECT id FROM admin WHERE email = ? LIMIT 1",
        [email]
      );

      if (emailCheck.length > 0) {
        return `Email already exists`;
      }
      const query = `INSERT INTO admin (name, email, password, experience, profile, role_id, course_id, location_id, course_join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        name,
        email,
        password,
        experience,
        profile,
        role_id,
        course_id,
        location_id,
        course_join_date,
      ];
      const [result] = await conn.execute(query, values);
      await conn.commit();
      conn.release();
      return result;
    } catch (error) {
      await conn.rollback();
      conn.release();
      throw new Error("Error while inserting: " + error.message);
    }
  },

  getUserAttemptsWithAnswers: async (user_id) => {
    try {
      // 1. Get all attempts for the user
      const [attempts] = await pool.query(
        "SELECT attempt_number, attempt_date FROM test_attempts WHERE user_id = ? ORDER BY attempt_number",
        [user_id]
      );

      // 2. Loop through attempts to get answers and calculate stats
      for (const attempt of attempts) {
        const [answers] = await pool.query(
          `SELECT
              ua.question_id,
              q.question,
              ua.selected_option,
              ua.mark,
              q.section_id,
              q.correct_answer,
              q.option_a,
              q.option_b,
              q.option_c,
              q.option_d
          FROM
              user_answers ua
          INNER JOIN questions q ON
            q.id = ua.question_id
          WHERE
              ua.user_id = ? AND ua.attempt_number = ?`,
          [user_id, attempt.attempt_number]
        );

        const totalQuestions = answers.length;
        const correctAnswers = answers.filter((a) => a.mark === 1).length;
        const percentage =
          totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0;

        // Transform answers to include options array
        const transformedAnswers = answers.map((answer) => {
          // Create options array in the desired format
          const options = [];
          if (answer.option_a)
            options.push({ name: "option_a", value: answer.option_a });
          if (answer.option_b)
            options.push({ name: "option_b", value: answer.option_b });
          if (answer.option_c)
            options.push({ name: "option_c", value: answer.option_c });
          if (answer.option_d)
            options.push({ name: "option_d", value: answer.option_d });

          return {
            question_id: answer.question_id,
            question: answer.question,
            selected_option: answer.selected_option,
            correct_answer: answer.correct_answer,
            mark: answer.mark,
            section_id: answer.section_id,
            options: options,
          };
        });

        attempt.total_questions = totalQuestions;
        attempt.correct_answers = correctAnswers;
        attempt.percentage = percentage;
        attempt.answers = transformedAnswers;
      }

      return attempts;
    } catch (error) {
      throw new Error("Error getting candidate questions: " + error.message);
    }
  },

  updateUser: async (
    id,
    name,
    email,
    password,
    experience,
    profile,
    role_id,
    course_id,
    location_id
  ) => {
    try {
      const query = `UPDATE admin SET name = ?, email = ?, password = ?, experience = ?, profile = ?, role_id = ?, course_id = ?, location_id = ? WHERE id = ?`;
      const values = [
        name,
        email,
        password,
        experience,
        profile,
        role_id,
        course_id,
        location_id,
        id,
      ];
      const [result] = await pool.query(query, values);
      return result.affectedRows;
    } catch (error) {
      throw new Error("Error while updating user: " + error.message);
    }
  },

  bulkInsertQuestions: async (questions) => {
    try {
      const query = `
      INSERT INTO questions 
        (question, correct_answer, section_id, course_id, option_a, option_b, option_c, option_d) 
      VALUES ?
    `;

      const values = questions.map((q) => [
        q.question,
        q.correct_answer,
        q.section_id,
        q.course_id,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
      ]);

      const [result] = await pool.query(query, [values]);
      return result;
    } catch (error) {
      throw new Error("Bulk insert failed: " + error.message);
    }
  },

  findExistingQuestions: async (questions) => {
    try {
      const questionTexts = questions.map((q) => q.question);
      const sectionId = questions[0].section_id;
      const courseId = questions[0].course_id;

      // Use JOIN with VALUES to check all questions in one query
      const query = `
      SELECT q.question 
      FROM questions q
      JOIN (
        SELECT ? AS question_text
        ${Array(questionTexts.length - 1)
          .fill()
          .map(() => "UNION ALL SELECT ?")
          .join(" ")}
      ) AS input_questions ON q.question = input_questions.question_text
      WHERE q.section_id = ? 
      AND q.course_id = ?
      AND q.is_active = 1
    `;

      const [existing] = await pool.query(query, [
        ...questionTexts,
        sectionId,
        courseId,
      ]);

      return existing.map((q) => q.question);
    } catch (error) {
      throw new Error("Error checking existing questions: " + error.message);
    }
  },
};
module.exports = QuestionsModel;
