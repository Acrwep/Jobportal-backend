const express = require("express");
const router = express.Router();
const StudentsController = require("../controllers/StudentsController");
const AdminController = require("../controllers/AdminController");
const candidateController = require("../controllers/CandidatesController");
const { verifyToken } = require("../Validation/Validation");

router.post("/createStudent", StudentsController.createStudents);
router.get("/getStudents", verifyToken, StudentsController.getStudents);
router.post("/adminlogin", AdminController.login);
router.post("/registration", candidateController.registerCandidate);
router.get("/getCandidates", candidateController.getCandidates);
router.get("/getCandidateById", candidateController.getCandidateById);
router.get(
  "/getMultipleCandidatesById",
  candidateController.getMultipleCandidatesbyId
);
router.get("/getSkills", candidateController.getSkills);
router.put("/updateFavorites", candidateController.updateCandidateFavorites);
router.post("/createfolder", candidateController.createFolder);
router.get("/getfolders", candidateController.getFolders);

module.exports = router;
