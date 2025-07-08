const { request, response } = require("express");
const pool = require("../config/dbConfig");
const candidatesModal = require("../models/CandidatesModal");

const registerCandidate = async (request, response) => {
  const {
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
    companyName,
    designation,
    companyStartdate,
    companyEnddate,
    workingStatus,
    skills,
    qualification,
    university,
    graduateYear,
    typeOfEducation,
    certifications,
    gender,
    preferredJobTitles,
    preferredJobLocations,
    noticePeriod,
    currentCTC,
    expectedCTC,
    linkedinURL,
    profileSummary,
    profileImage,
    languages,
    resume,
    // courseName,
    course_id,
    courseLocation,
    courseStatus,
    mockupPercentage,
    courseJoiningDate,
    createdAt,
  } = request.body;

  const formattedSkills = Array.isArray(skills) ? skills : [skills];
  const formattedCertificateDetails = Array.isArray(certifications)
    ? certifications
    : [certifications];
  const formattedLanguages = Array.isArray(languages) ? languages : [languages];
  const formattedJobtitles = Array.isArray(preferredJobTitles)
    ? preferredJobTitles
    : [preferredJobTitles];

  const formattedJoblocations = Array.isArray(preferredJobLocations)
    ? preferredJobLocations
    : [preferredJobLocations];

  try {
    await candidatesModal.registerCandidate(
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
      companyName,
      designation,
      companyStartdate,
      companyEnddate,
      workingStatus,
      formattedSkills,
      qualification,
      university,
      graduateYear,
      typeOfEducation,
      formattedCertificateDetails,
      gender,
      formattedJobtitles,
      formattedJoblocations,
      noticePeriod,
      currentCTC,
      expectedCTC,
      linkedinURL,
      profileSummary,
      profileImage,
      formattedLanguages,
      resume,
      // courseName,
      course_id,
      courseLocation,
      courseStatus,
      mockupPercentage,
      courseJoiningDate,
      createdAt
    );
    response.status(201).send({ message: "Registration successful!" });
  } catch (error) {
    console.log("controller error", error);
    response
      .status(500)
      .send({ message: "error while register", details: error.message });
  }
};

const getCandidates = async (request, response) => {
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
    favorites,
    page,
    limit,
  } = request.query;

  try {
    const result = await candidatesModal.getCandidates(
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
      favorites,
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
    response
      .status(200)
      .send({ message: "candidates fetched successfully", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while getting candidates",
      details: error.message,
    });
  }
};

const getCandidateById = async (request, response) => {
  const { id } = request.query;

  try {
    const result = await candidatesModal.getCandidatesById(id);
    response
      .status(200)
      .send({ message: "candidate data fetched", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while getting candidate",
      details: error.message,
    });
  }
};

const getMultipleCandidatesbyId = async (request, response) => {
  const {
    candidateIds,
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
    const result = await candidatesModal.getMultipleCandidatesbyId(
      candidateIds,
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
      limit
    );
    response
      .status(200)
      .send({ message: "candidates data fetched", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while getting multiple candidates",
      details: error.message,
    });
  }
};

const updateEligibleCandidate = async (request, response) => {
  const { eligibleStatus, candidateId } = request.body;

  try {
    const result = await candidatesModal.updateEligibleCandidate(
      eligibleStatus,
      candidateId
    );
    response
      .status(200)
      .send({ message: "updated successfully", data: result });
  } catch (error) {
    response.status(500).send({
      message: "error while updating candidate",
      details: error.message,
    });
  }
};

const getUsers = async (request, response) => {
  const {
    name,
    mobile,
    course_location,
    from_date,
    to_date,
    course_id,
    email,
  } = request.query;
  try {
    const candidates = await candidatesModal.getUsers(
      name,
      mobile,
      course_location,
      from_date,
      to_date,
      course_id,
      email
    );
    response.status(200).send({
      message: "All candidates data fetched successfully",
      data: candidates,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching candidates",
      details: error.message,
    });
  }
};

const getLocations = async (request, response) => {
  try {
    const locations = await candidatesModal.getLocations();
    return response.status(200).send({
      messages: "Location data fetched successfully",
      data: locations,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching location data",
      details: error.message,
    });
  }
};

const checkCandidate = async (request, response) => {
  const { email } = request.query;
  try {
    const result = await candidatesModal.checkCandidate(email);
    return response.status(200).send({
      message: "Candidate verified successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while checking candidate",
      details: error.message,
    });
  }
};

const updateCandidate = async (request, response) => {
  const {
    firstName,
    lastName,
    mobile,
    email,
    country,
    city,
    state,
    pincode,
    yearsOfExperience,
    monthOfExperience,
    skills,
    qualification,
    university,
    graduateYear,
    typeOfEducation,
    certifications,
    gender,
    preferredJobTitles,
    noticePeriod,
    currentCTC,
    expectedCTC,
    linkedinURL,
    updatedAt,
    resume,
    companyName,
    designation,
    companyStartdate,
    companyEnddate,
    workingStatus,
    preferredJobLocations,
    profileSummary,
    profileImage,
    favorites,
    languages,
    courseLocation,
    courseStatus,
    mockupPercentage,
    courseJoiningDate,
    eligibleCandidates,
    password,
    course_id,
    id,
  } = request.body;

  const formattedSkills = Array.isArray(skills) ? skills : [skills];
  const formattedCertificateDetails = Array.isArray(certifications)
    ? certifications
    : [certifications];
  const formattedLanguages = Array.isArray(languages) ? languages : [languages];
  const formattedJobtitles = Array.isArray(preferredJobTitles)
    ? preferredJobTitles
    : [preferredJobTitles];

  const formattedJoblocations = Array.isArray(preferredJobLocations)
    ? preferredJobLocations
    : [preferredJobLocations];

  try {
    const result = await candidatesModal.updateCandidate(
      firstName,
      lastName,
      mobile,
      email,
      country,
      city,
      state,
      pincode,
      yearsOfExperience,
      monthOfExperience,
      formattedSkills,
      qualification,
      university,
      graduateYear,
      typeOfEducation,
      formattedCertificateDetails,
      gender,
      formattedJobtitles,
      noticePeriod,
      currentCTC,
      expectedCTC,
      linkedinURL,
      updatedAt,
      resume,
      companyName,
      designation,
      companyStartdate,
      companyEnddate,
      workingStatus,
      formattedJoblocations,
      profileSummary,
      profileImage,
      favorites,
      formattedLanguages,
      courseLocation,
      courseStatus,
      mockupPercentage,
      courseJoiningDate,
      eligibleCandidates,
      password,
      course_id,
      id
    );

    return response.status(200).send({
      message: "Candidate updated successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while updating candidate",
      details: error.message,
    });
  }
};

module.exports = {
  registerCandidate,
  getCandidates,
  getCandidateById,
  getMultipleCandidatesbyId,
  updateEligibleCandidate,
  // getAllCandidates,
  getLocations,
  getUsers,
  checkCandidate,
  updateCandidate,
};
