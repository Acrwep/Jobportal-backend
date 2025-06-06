const { response, request } = require("express");
const questionsModel = require("../models/QuestionsModel");

const getSections = async (request, response) => {
  try {
    // Model methods should be awaited since they're async
    const result = await questionsModel.getSections();

    response.status(200).json({
      message: "Section data fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getSections:", error);
    response.status(500).json({
      message: "Error while fetching sections",
      details: error.message,
    });
  }
};

const getCourses = async (request, response) => {
  const { courses } = request.body;
  try {
    const result = await questionsModel.getCourses(courses);

    response.status(200).json({
      message: "Course date fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getCourses:", error);
    response.status(500).json({
      message: "Error while fetchng courses",
      details: error.message,
    });
  }
};

const insertQuestion = async (request, response) => {
  const {
    question,
    correct_answer,
    section_id,
    course_id,
    option_a,
    option_b,
    option_c,
    option_d,
  } = request.body;
  try {
    // 1. First check if the question already exists
    const existingQuestion = await questionsModel.findQuestionByTextAndSection(
      question,
      section_id,
      course_id
    );

    // 2. If exists, return a 409 Conflict response
    if (existingQuestion) {
      return response.status(409).json({
        message: "Question already exists for this section and course",
        existingQuestion,
      });
    }

    // 3. If not exists, proceed with insertion
    await questionsModel.insertQuestion(
      question,
      correct_answer,
      section_id,
      course_id,
      option_a,
      option_b,
      option_c,
      option_d
    );
    response.status(201).send({ message: "Question inserted successfully" });
  } catch (error) {
    response.status(500).send({
      message: "Error while inserting.",
      details: error.message,
    });
  }
};

// const insertOptions = async (request, response) => {
//     const { question_id, options } = request.body; // Now accepts array of options

//     if (!question_id || !options || !Array.isArray(options)) {
//         return response.status(400).json({
//             message: "question_id and options array are required"
//         });
//     }

//     try {
//         // Check for existing options
//         const existingOptions = await questionsModel.findExistingOptions(question_id, options);

//         if (existingOptions.length > 0) {
//             return response.status(409).json({
//                 message: "Some options already exist for this question",
//                 existingOptions
//             });
//         }

//         // Insert all new options
//         const result = await questionsModel.bulkInsertOptions(question_id, options);

//         response.status(201).json({
//             message: `${result.affectedRows} options inserted successfully`,
//             insertedCount: result.affectedRows
//         });
//     } catch (error) {
//         response.status(500).json({
//             message: "Error while inserting options",
//             details: error.message
//         });
//     }
// };

const getQuestions = async (request, response) => {
  const { courses, section_id } = request.body;
  try {
    const questionsWithOptions = await questionsModel.getQuestionsWithOptions(
      courses,
      section_id
    );
    response.status(200).send({
      message: "Questions with option fetched successfully",
      data: questionsWithOptions,
    });
  } catch (error) {
    response.status(500).json({
      message: "Error fetching questions",
      details: error.message,
    });
  }
};

const updateQuestion = async (request, response) => {
  const {
    id,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    section_id,
    course_id,
  } = request.body;
  try {
    // 1. First check if the question already exists
    const existingQuestion = await questionsModel.findQuestionExists(id);

    // 2. If not exists, return a 409 Conflict response
    if (!existingQuestion) {
      return response.status(404).json({
        message: "Question not found.",
        questionId: id,
      });
    }

    // 3. If exists, proceed with insertion
    const result = await questionsModel.updateQuestion(
      id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      section_id,
      course_id
    );
    return (await result).affectedRows > 0
      ? response.status(201).send({ message: "Question updated successfully" })
      : response.status(409).send({ message: "No records updated" });
  } catch (error) {
    response.status(500).send({
      message: "Error while updating.",
      details: error.message,
    });
  }
};

const deleteQuestion = async (request, response) => {
  const { id } = request.query;
  try {
    // 1. First check if the question already exists
    const existingQuestion = await questionsModel.findQuestionExists(id);

    // 2. If not exists, return a 409 Conflict response
    if (!existingQuestion) {
      return response.status(404).json({
        message: "Question not found.",
        questionId: id,
      });
    }

    const affectedRows = await questionsModel.deleteQuestion(id);
    return affectedRows > 0
      ? response.status(200).send({ message: "Question has been deleted" })
      : response.status(409).send({ message: "No records deleted" });
  } catch (error) {
    response.status(500).send({
      message: "Error while deleting.",
      details: error.message,
    });
  }
};

const insertUserAnswer = async (request, response) => {
  const { course_id, user_id, answers, assesmentLink } = request.body;
  try {
    const result = await questionsModel.insertUserAnswer(
      user_id,
      course_id,
      answers,
      assesmentLink
    );
    return response
      .status(201)
      .send({ message: "Answers submited successfully", result });
  } catch (error) {
    response.status(500).send({
      message: "Error while updating.",
      details: error.message,
    });
  }
};

const checkTestCompleted = async (request, response) => {
  const { test_link } = request.query;
  try {
    const result = await questionsModel.checkTestCompleted(test_link);
    if (result) {
      return response
        .status(200)
        .send({ message: "Test completed successfully.", data: true });
    } else {
      return response
        .status(200)
        .send({ message: "Test has not completed yet.", data: false });
    }
  } catch (error) {
    response.status(500).send({
      message: "Error checking test link.",
      details: error.message,
    });
  }
};

const getRoles = async (request, response) => {
  try {
    const roles = await questionsModel.getRoles();
    return response.status(200).send({
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while getting roles",
      details: error.message,
    });
  }
};

const insertAdmin = async (request, response) => {
  const {
    name,
    email,
    password,
    role_id,
    course_id,
    location_id,
    course_join_date,
    experience,
    profile,
  } = request.body;
  // Validate required fields
  if (!name || !email || !password || !role_id || !course_id || !experience) {
    return response.status(400).json({
      message: "Missing required fields",
      required: [
        "name",
        "email",
        "password",
        "role_id",
        "course_id",
        "location_id",
        "course_join_date",
        "experience",
        "profile",
      ],
    });
  }
  try {
    const result = await questionsModel.insertAdmin(
      name,
      email,
      password,
      role_id,
      course_id,
      location_id,
      course_join_date,
      experience,
      profile
    );
    return response.status(201).send({
      message: "Inserted successfully",
      data: result.insertId,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while inserting admin",
      details: error.message,
    });
  }
};

const getUserAttemptsWithAnswers = async (request, response) => {
  const { user_id } = request.query;
  try {
    const result = await questionsModel.getUserAttemptsWithAnswers(user_id);
    return response.status(200).send({
      message: "Data fetched successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error fetching attempts with answers",
      details: error.message,
    });
  }
};

const updateUser = async (request, response) => {
  const {
    id,
    name,
    email,
    password,
    experience,
    role_id,
    course_id,
    profile,
    location_id,
  } = request.body;
  if (!name || !email || !password) {
    return response.status(400).json({
      message: "Missing required fields",
      required: [
        "name",
        "email",
        "password",
        "role_id",
        "course_id",
        "location_id",
        "experience",
        "profile",
      ],
    });
  }
  try {
    const result = await questionsModel.updateUser(
      id,
      name,
      email,
      password,
      experience,
      profile,
      role_id,
      course_id,
      location_id
    );
    return response.status(200).send({
      message: "User updated successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error updating user",
      details: error.message,
    });
  }
};

const bulkInsertQuestions = async (request, response) => {
  const { questions } = request.body;

  try {
    // Validate input
    if (!Array.isArray(questions) || questions.length === 0) {
      return response.status(400).json({
        message: "Please provide an array of questions",
      });
    }

    // Check for existing questions (single query for all questions)
    const existingQuestions = await questionsModel.findExistingQuestions(
      questions
    );

    if (existingQuestions.length > 0) {
      return response.status(409).json({
        message: "Some questions already exist",
        duplicates: existingQuestions,
      });
    }

    // Perform bulk insert
    const insertedQuestions = await questionsModel.bulkInsertQuestions(
      questions
    );

    response.status(201).json({
      message: `${questions.length} questions inserted successfully`,
      insertedCount: insertedQuestions.affectedRows,
    });
  } catch (error) {
    response.status(500).json({
      message: "Error while bulk inserting questions",
      details: error.message,
    });
  }
};

module.exports = {
  getSections,
  getCourses,
  insertQuestion,
  // insertOptions,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  insertUserAnswer,
  getRoles,
  insertAdmin,
  // getUsers,
  getUserAttemptsWithAnswers,
  updateUser,
  bulkInsertQuestions,
  checkTestCompleted,
};
