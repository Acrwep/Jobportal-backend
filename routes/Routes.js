const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");
const candidateController = require("../controllers/CandidatesController");
const { verifyToken } = require("../Validation/Validation");

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

module.exports = router;
