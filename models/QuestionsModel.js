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
        course_id
    ) => {
        try {
            const query = `INSERT INTO questions (question, correct_answer, section_id, course_id) VALUES (?, ?, ?, ?)`;
            const [result] = await pool.execute(query, [question, correct_answer, section_id, course_id]);
            return result;
        } catch (error) {
            throw new Error("Error while inserting question: " + error.message);
        }
    },

    //Check question is already exists
    findQuestionByTextAndSection: async (
        questionText,
        sectionId,
        courseId
    ) => {
        try {
            const query = `
                SELECT * FROM questions 
                WHERE question = ? 
                AND section_id = ? 
                AND course_id = ?
            `;
            const [result] = await pool.query(query, [questionText, sectionId, courseId]);
            return result[0]; // Returns the first match (or undefined if none)
        } catch (error) {
            throw new Error("Error checking question existence: " + error.message);
        }
    },

    //Insert new option for the question
    insertOptions: async (
        question_id,
        option_text
    ) => {
        try {
            const query = `INSERT INTO options (question_id, option_text) VALUES (?, ?)`;
            const [result] = await pool.execute(query, [question_id, option_text]);
            return result;
        } catch (error) {
            throw new Error("Error while inserting option: " + error.message);
        }
    },

    //Check option is exists for the specific question
    findOptionByQuestion: async (
        question_id,
        option_text
    ) => {
        try {
            const query = `SELECT * FROM options WHERE is_active = 1 AND question_id = ? AND option_text = ?`
            const [result] = await pool.query(query, [question_id, option_text]);
            return result[0];
        } catch (error) {
            throw new Error("Error checking option existence: " + error.message);
        }
    }
}
module.exports = QuestionsModel;