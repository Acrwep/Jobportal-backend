const mysql = require("mysql2/promise");
const pool = require("../config/dbConfig");
const studentsModel = require("../models/StudentsModel");

const createStudents = async (request, response) => {
  const {
    name,
    email,
    mobile,
    DOB,
    address,
    location,
    collegeName,
    collegeDepartment,
    passedout,
    skills,
    interest,
    experience,
    designation,
    companyname,
    workingStatus,
    resume,
  } = request.body;

  const [existingStudent] = await pool.query(
    "SELECT * FROM students WHERE email = ?",
    [email]
  );
  console.log("existing", existingStudent);
  if (existingStudent.length >= 1) {
    return response.status(400).send({ message: "Email already exists" });
  }

  // Ensure skills is an array
  const formattedSkills = Array.isArray(skills) ? skills : [skills];
  try {
    await studentsModel.createStudents(
      name,
      email,
      mobile,
      DOB,
      address,
      location,
      collegeName,
      collegeDepartment,
      passedout,
      formattedSkills,
      interest,
      experience,
      designation,
      companyname,
      workingStatus,
      resume
    );
    response.status(201).send({ message: "Registration successful!" });
  } catch (error) {
    response
      .status(500)
      .send({ message: "error creating student", details: error.message });
  }
};

const getStudents = async (request, response) => {
  try {
    const result = await studentsModel.getStudents();
    response
      .status(200)
      .send({ message: "students fetched successfully", data: result });
  } catch (error) {
    response
      .status(500)
      .send({ message: "error getting student", details: error.message });
  }
};

module.exports = {
  createStudents,
  getStudents,
};
