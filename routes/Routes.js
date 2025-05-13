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
router.get("/getcourses", questionsController.getCourses);
router.post(
  "/insertQuestions",
  verifyToken,
  questionsController.insertQuestion
);
// router.post("/insertoption", verifyToken, questionsController.insertOptions);
router.get("/getquestions", verifyToken, questionsController.getQuestions);
router.post(
  "/updateQuestions",
  verifyToken,
  questionsController.updateQuestion
);
router.delete(
  "/deleteQuestions",
  verifyToken,
  questionsController.deleteQuestion
);
router.post(
  "/insertAnswers",
  verifyToken,
  questionsController.insertUserAnswer
);
router.get("/getRoles", questionsController.getRoles);
router.post("/insertAdmin", questionsController.insertAdmin);
// router.get("/getUsers", verifyToken, questionsController.getUsers);
router.post("/sendEmail", emailController.sendTestLinks);
router.get("/getUsers", verifyToken, candidateController.getUsers);
router.get("/getLocations", candidateController.getLocations);
router.get("/checkCandidate", candidateController.checkCandidate);

// Upload video for a course
router.post(
  "/:courseId/videos",
  upload.single("video"),
  CourseVideoController.uploadVideo
);

// Get all videos for a course
router.get("/:courseId/videos", CourseVideoController.getCourseVideos);

module.exports = router;
