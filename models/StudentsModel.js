const mysql = require("mysql2/promise");
const pool = require("../config/dbConfig");

const studentsModel = {
  createStudents: async (
    name,
    email,
    mobile,
    dob,
    address,
    location,
    collegename,
    collegedepartment,
    passedout,
    skills,
    interest,
    experience,
    designation,
    companyname,
    workingStatus,
    Resume
  ) => {
    try {
      const mySqlQuery = `
              INSERT INTO students (name, email, mobile, DOB, address, location, collegeName, collegeDepartment, passedout, skills, interest, experience, designation, companyName, workingStatus, resume) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
      const values = [
        name,
        email,
        mobile,
        dob,
        address,
        location,
        collegename,
        collegedepartment,
        passedout,
        JSON.stringify(skills), // Convert to string before inserting,
        interest,
        experience,
        designation,
        companyname,
        workingStatus,
        Resume,
      ];
      const [result] = await pool.query(mySqlQuery, values);
      return result;
    } catch (error) {
      throw new Error("Error inserting students: " + error.message);
    }
  },

  getStudents: async () => {
    try {
      const [result] = await pool.query("SELECT * FROM students");
      const formattedResult = result.map((student) => ({
        ...student,
        skills: student.skills ? JSON.parse(student.skills) : [],
      }));

      console.log(formattedResult);
      return formattedResult;
    } catch (error) {
      throw new Error("Error getting students", +error.message);
    }
  },
};

module.exports = studentsModel;
