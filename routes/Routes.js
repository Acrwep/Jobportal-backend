const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");
const candidateController = require("../controllers/CandidatesController");
const questionsController = require("../controllers/QuestionsController");
const emailController = require("../controllers/EmailController");
const { verifyToken } = require("../Validation/Validation");
const CourseVideoController = require("../controllers/CourseVideosController");
const upload = require("../Validation/UploadMiddleware");

//candidateController apis
router.post("/registration", candidateController.registerCandidate);
//AdminController apis
router.post("/adminlogin", AdminController.login);
router.get("/searchByKeyword", verifyToken, AdminController.searchbyKeyword);
router.get("/getCandidates", verifyToken, candidateController.getCandidates);
router.get(
  "/getCandidateById",
  verifyToken,
  candidateController.getCandidateById
);
router.get(
  "/getMultipleCandidatesById",
  verifyToken,
  candidateController.getMultipleCandidatesbyId
);
router.put(
  "/updateEligibleCandidate",
  verifyToken,
  candidateController.updateEligibleCandidate
);
router.post("/createFavorites", verifyToken, AdminController.createFavorites);
router.put(
  "/updateFavorites",
  verifyToken,
  AdminController.updateCandidateFavorites
);
router.get("/getFavorites", verifyToken, AdminController.getFavorites);
router.delete("/removeFavorites", verifyToken, AdminController.removeFavorites);

router.post("/createfolder", verifyToken, AdminController.createFolder);
router.put("/updatefolder", verifyToken, AdminController.updateFolder);
router.get("/getfolders", verifyToken, AdminController.getFolders);
router.delete("/deletefolder", verifyToken, AdminController.deleteFolder);
router.get(
  "/getFavoriteCandidates",
  verifyToken,
  AdminController.getFavoriteCandidates
);
router.get("/getsection", verifyToken, questionsController.getSections);
router.post("/getcourses", questionsController.getCourses);
router.post(
  "/insertQuestions",
  verifyToken,
  questionsController.insertQuestion
);
// router.post("/insertoption", verifyToken, questionsController.insertOptions);
router.post("/getquestions", verifyToken, questionsController.getQuestions);
router.post(
  "/updateQuestions",
  verifyToken,
  questionsController.updateQuestion
);
router.post(
  "/deleteQuestions",
  verifyToken,
  questionsController.deleteQuestion
);
router.post(
  "/insertAnswers",
  verifyToken,
  questionsController.insertUserAnswer
);

router.get(
  "/checkTestCompleted",
  verifyToken,
  questionsController.checkTestCompleted
);
router.get("/getRoles", questionsController.getRoles);
router.post("/insertAdmin", questionsController.insertAdmin);
// router.get("/getUsers", verifyToken, questionsController.getUsers);
router.post("/sendEmail", emailController.sendTestLinks);
router.get("/getUsers", verifyToken, candidateController.getUsers);
router.get("/getLocations", candidateController.getLocations);
router.get("/checkCandidate", candidateController.checkCandidate);

// Get all videos for a course
router.get("/getVideos", CourseVideoController.getCourseVideos);
router.delete("/deleteContent", CourseVideoController.deleteContent);
router.post(
  "/insertTopic",
  verifyToken,
  CourseVideoController.insertCourseTopics
);
router.put(
  "/updateTopic",
  verifyToken,
  CourseVideoController.updateCourseTopics
);
router.get("/getTopics", verifyToken, CourseVideoController.getCourseTopics);
router.post("/courseMap", verifyToken, CourseVideoController.courseTrainerMap);
router.get(
  "/getTrainers",
  verifyToken,
  CourseVideoController.getTrainersByCourse
);

router.post(
  "/uploadContent",
  upload.uploadCourseVideo.single("content"),
  CourseVideoController.uploadContent
);

router.delete("/deleteTopic", verifyToken, CourseVideoController.deleteTopic);
router.get(
  "/user-attempts",
  verifyToken,
  questionsController.getUserAttemptsWithAnswers
);

router.post(
  "/insertCompany",
  verifyToken,
  CourseVideoController.insertCompanies
);
// router.get("/getCompanies", verifyToken, CourseVideoController.getCompanies);

router.get(
  "/getCompanyByCourse",
  verifyToken,
  CourseVideoController.getCompanyByCourse
);

router.post(
  "/uploadCompanyContent",
  upload.uploadCompanyContent.single("content"),
  CourseVideoController.uploadCompanyContent
);
router.get(
  "/getCompanyContents",
  verifyToken,
  CourseVideoController.getCompanyContents
);

router.get(
  "/getCourseByTrainers",
  verifyToken,
  CourseVideoController.getCourseByTrainers
);

router.put("/updateCompany", verifyToken, CourseVideoController.updateCompany);
router.delete(
  "/deleteCompany",
  verifyToken,
  CourseVideoController.deleteCompany
);

router.delete(
  "/deleteCompanyContent",
  CourseVideoController.deleteCompanyContent
);

router.put("/readTestLink", verifyToken, emailController.readTestLink);
router.get(
  "/getTestLinkByUser",
  verifyToken,
  emailController.getTestLinkByUser
);
router.get("/sendOTP", emailController.sendOTP);
router.get("/validateOTP", emailController.validateOTP);
router.put("/forgotPassword", emailController.forgotPassword);
router.put("/updateUser", verifyToken, questionsController.updateUser);
router.post(
  "/bulkInsertQuestions",
  verifyToken,
  questionsController.bulkInsertQuestions
);
router.post(
  "/createQuestionType",
  verifyToken,
  questionsController.createQuestionType
);
router.get(
  "/getQuestionTypes",
  verifyToken,
  questionsController.getQuestionTypes
);

router.put(
  "/updateCandidate",
  verifyToken,
  candidateController.updateCandidate
);

router.post("/getResults", verifyToken, questionsController.getResults);
router.get(
  "/getDateWiseTest",
  verifyToken,
  questionsController.getDateWiseTest
);

module.exports = router;
