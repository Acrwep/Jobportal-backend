const pool = require("../config/dbConfig");
const adminModal = require("../models/AdminModal");
const jwt = require("jsonwebtoken");

const login = async (request, response) => {
  const { email, password } = request.body;

  try {
    const result = await adminModal.login(email, password);
    console.log("login results", result);
    if (result.length >= 1) {
      const Token = generateToken(result[0]);
      response.status(200).send({
        message: "Login successfully!",
        details: {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email,
          token: Token,
        },
      });
    } else {
      response.status(400).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("login error", error);
    response.status(500).send({ message: "Error while login" });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, //Payload
    process.env.JWT_SECRET, // Secret
    { expiresIn: "1d" } // Token expires in 1 hour
  );
};

const searchbyKeyword = async (request, response) => {
  const {
    q,
    firstName,
    lastName,
    mobile,
    email,
    country,
    state,
    city,
    yearsOfExperience,
    monthOfExperience,
    skills,
    qualification,
    university,
    graduateYear,
    gender,
    companyName,
    designation,
    noticePeriod,
    currentCTC,
    linkedinURL,
    courseName,
    courseLocation,
    courseStatus,
    eligibleStatus,
    startJoingingDate,
    endJoiningDate,
    page,
    limit,
  } = request.query;

  try {
    const result = await adminModal.searchByKeyword({
      q,
      firstName,
      lastName,
      mobile,
      email,
      country,
      state,
      city,
      yearsOfExperience,
      monthOfExperience,
      skills,
      qualification,
      university,
      graduateYear,
      gender,
      companyName,
      designation,
      noticePeriod,
      currentCTC,
      linkedinURL,
      courseName,
      courseLocation,
      courseStatus,
      eligibleStatus,
      startJoingingDate,
      endJoiningDate,
      page,
      limit,
    });
    response.status(200).send({ message: "success", data: result });
  } catch (error) {
    console.log("errorr", error);
    response.status(500).send({ message: "error while fetching", data: error });
  }
};

//favorites api's
const createFavorites = async (request, response) => {
  const { userId, candidateId } = request.body;
  try {
    const result = await adminModal.createFavorites(userId, candidateId);
    response.status(201).send({ message: "Favorites added", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while add favorites",
      details: error.message,
    });
  }
};

const getFavorites = async (request, response) => {
  try {
    const result = await adminModal.getFavorites();
    response.status(200).send({ message: "Favorites fetched", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while get favorites",
      details: error.message,
    });
  }
};

const updateCandidateFavorites = async (request, response) => {
  const { favoriteStatus, id } = request.body;
  try {
    const result = await adminModal.updateCandidateFavorites(
      favoriteStatus,
      id
    );
    response.status(200).send({ message: "Favorites updated", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while update favorites",
      details: error.message,
    });
  }
};

const removeFavorites = async (request, response) => {
  const { userId, candidateId } = request.query;
  try {
    const result = await adminModal.removeFavorites(userId, candidateId);
    response.status(200).send({ message: "Favorites deleted", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while delete favorites",
      details: error.message,
    });
  }
};

const getFavoriteCandidates = async (request, response) => {
  const {
    userId,
    firstName,
    lastName,
    mobile,
    email,
    country,
    state,
    city,
    pincode,
    yearsOfExperience,
    monthOfExperience,
    companyDetails,
    skills,
    qualification,
    university,
    graduateYear,
    gender,
    companyName,
    designation,
    noticePeriod,
    currentCTC,
    preferredJobTitles,
    preferredJobLocations,
    linkedinURL,
    page,
    limit,
  } = request.query;

  try {
    const result = await adminModal.getFavoriteCandidates(
      userId,
      firstName,
      lastName,
      mobile,
      email,
      country,
      state,
      city,
      pincode,
      yearsOfExperience,
      monthOfExperience,
      companyDetails,
      skills,
      qualification,
      university,
      graduateYear,
      gender,
      companyName,
      designation,
      noticePeriod,
      currentCTC,
      preferredJobTitles,
      preferredJobLocations,
      linkedinURL,
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
    response.status(200).send({
      message: "favorite candidates fetched successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "error while getting candidates",
      details: error.message,
    });
  }
};

//folder api's
const createFolder = async (request, response) => {
  const { name, candidateIds, userId } = request.body;

  const formattedCandidateIds = Array.isArray(candidateIds)
    ? candidateIds
    : [candidateIds];

  try {
    await adminModal.createFolder(name, formattedCandidateIds, userId);
    response.status(201).send({ message: "Folder created successful!" });
  } catch (error) {
    console.log("controller error", error);
    response
      .status(500)
      .send({ message: "error while create folder", details: error.message });
  }
};

const updateFolder = async (request, response) => {
  const { name, folderId } = request.body;

  try {
    await adminModal.updateFolder(name, folderId);
    response.status(201).send({ message: "Folder updated successful!" });
  } catch (error) {
    console.log("controller error", error);
    response
      .status(500)
      .send({ message: "error while update folder", details: error.message });
  }
};

const getFolders = async (request, response) => {
  const { userId } = request.query;
  try {
    const result = await adminModal.getFolders(userId);
    response
      .status(200)
      .send({ message: "folders fetched successfully", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while getting folders",
      details: error.message,
    });
  }
};

const deleteFolder = async (request, response) => {
  const { folderId } = request.query;

  try {
    const result = await adminModal.deleteFolder(folderId);
    response
      .status(200)
      .send({ message: "folders deleted successfully", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while deleting folders",
      details: error,
    });
  }
};

module.exports = {
  login,
  searchbyKeyword,
  createFavorites,
  updateCandidateFavorites,
  removeFavorites,
  getFavorites,
  getFavoriteCandidates,
  createFolder,
  updateFolder,
  getFolders,
  deleteFolder,
};
