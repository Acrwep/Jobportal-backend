const express = require("express");
const router = express.Router();
const StudentsController = require("../controllers/StudentsController");
const AdminController = require("../controllers/AdminController");
const candidateController = require("../controllers/CandidatesController");
const { verifyToken } = require("../Validation/Validation");

router.post("/createStudent", StudentsController.createStudents);
router.get("/searchByKeyword", AdminController.searchbyKeyword);
router.get("/getStudents", verifyToken, StudentsController.getStudents);
router.post("/adminlogin", AdminController.login);
router.post("/registration", candidateController.registerCandidate);
router.get("/getCandidates", candidateController.getCandidates);
router.get("/getCandidateById", candidateController.getCandidateById);
router.get(
  "/getMultipleCandidatesById",
  candidateController.getMultipleCandidatesbyId
);
router.put("/updateFavorites", AdminController.updateCandidateFavorites);
router.post("/createfolder", AdminController.createFolder);
router.put("/updatefolder", AdminController.updateFolder);
router.get("/getfolders", AdminController.getFolders);
router.post("/createFavorites", AdminController.createFavorites);
router.delete("/removeFavorites", AdminController.removeFavorites);
router.get("/getFavorites", AdminController.getFavorites);
router.get("/getFavoriteCandidates", AdminController.getFavoriteCandidates);

module.exports = router;
