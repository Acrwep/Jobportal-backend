const { response, request } = require("express");
const questionsModel = require("../models/QuestionsModel");

const getSections = async (request, response) => {
    try {
        // Model methods should be awaited since they're async
        const result = await questionsModel.getSections();

        response.status(200).json({
            message: "Section data fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Error in getSections:", error);
        response.status(500).json({
            message: "Error while fetching sections",
            details: error.message
        });
    }
};

const getCourses = async (request, response) => {
    try {
        const courses = await questionsModel.getCourses();

        response.status(200).json({
            message: "Course date fetched successfully",
            data: courses
        });
    } catch (error) {
        console.error("Error in getCourses:", error);
        response.status(500).json({
            message: "Error while fetchng courses",
            details: error.message
        });
    }
};

const insertQuestion = async (request, response) => {
    const {
        question,
        correct_answer,
        section_id,
        course_id
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
                existingQuestion
            });
        }

        // 3. If not exists, proceed with insertion
        await questionsModel.insertQuestion(question, correct_answer, section_id, course_id);
        response.status(201).send({ message: "Question inserted successfully" });
    } catch (error) {
        response.status(500).send({
            message: "Error while inserting.",
            details: error.message,
        });
    }
};

const insertOption = async (request, response) => {
    const {
        question_id,
        option_text
    } = request.body;
    try {
        const existingOption = await questionsModel.findOptionByQuestion(question_id, option_text);

        if (existingOption) {
            return response.status(409).json({
                message: "Option already exists for this question",
                existingOption
            });
        }

        await questionsModel.insertOptions(question_id, option_text);
        response.status(201).send({
            message: "Option inserted successfully"
        });
    } catch (error) {
        response.status(500).send({
            message: "Error while inserting.",
            details: error.message
        });
    }
}


module.exports = {
    getSections,
    getCourses,
    insertQuestion,
    insertOption,
};