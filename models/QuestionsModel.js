const pool = require("../config/dbConfig");

const QuestionsModel = {
    getSections: async () => {
        try {
            const query = "SELECT id, name FROM section WHERE isActive = 1";
            const [result] = await pool.query(query);
            return result;
        } catch (error) {
            throw new Error("Error getting section: " + error.message);
        }
    },

    getCourses: async () => {
        try {
            const query = `SELECT id, name FROM course WHERE isActive = 1`;
            const [courses] = await pool.query(query);
            return courses;
        } catch (error) {
            throw new Error("Error getting courses: " + error.message);
        }
    },

    insertQuestion: async (
        question, correct_answer, section_id, course_id
    ) => {
        try {
            const query = `INSERT INTO questions (question, correct_answer, section_id, course_id) VALUES (?, ?, ?, ?)`;
            const [result] = await pool.execute(query, [question, correct_answer, section_id, course_id]);
            return result;
        } catch (error) {
            throw new Error("Error while insrting question: " + error.message);
        }
    }
}
module.exports = QuestionsModel;