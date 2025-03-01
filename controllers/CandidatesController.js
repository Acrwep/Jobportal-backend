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
    resume,
    createdAt,
  } = request.body;

  const formattedSkills = Array.isArray(skills) ? skills : [skills];
  const formattedCertificateDetails = Array.isArray(certifications)
    ? certifications
    : [certifications];
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
      resume,
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

const getSkills = async (request, response) => {
  try {
    const result = await candidatesModal.getSkills();
    response
      .status(200)
      .send({ message: "skills fetched successfully", data: result });
  } catch (error) {
    response
      .status(500)
      .send({ message: "error while getting skills", details: error.message });
  }
};
module.exports = { registerCandidate, getCandidates, getSkills };
