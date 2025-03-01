const pool = require("../config/dbConfig");

const adminModal = {
  login: async (email, password) => {
    try {
      const query = `SELECT * FROM admin WHERE email= ? AND password = ?`;
      const values = [email, password];

      const [result] = await pool.query(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = adminModal;
