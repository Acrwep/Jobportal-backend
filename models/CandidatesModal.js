const { json } = require("express");
const pool = require("../config/dbConfig");

const candidatesModal = {
  registerCandidate: async (
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
    createdAt
  ) => {
    try {
      const query = `INSERT INTO candidates (firstName,lastName,mobile,email,country,state,city,pincode,yearsOfExperience,monthOfExperience,companyName,designation,companyStartdate,companyEnddate,workingStatus,skills,qualification,university,graduateYear,typeOfEducation,certifications,gender,preferredJobTitles,preferredJobLocations,noticePeriod,currentCTC,expectedCTC,linkedinURL,profileSummary,profileImage,resume,createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      const values = [
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
        workingStatus, // Convert to string before inserting,
        JSON.stringify(skills), // Convert to string before inserting,
        qualification,
        university,
        graduateYear,
        typeOfEducation,
        JSON.stringify(certifications),
        gender,
        JSON.stringify(preferredJobTitles), // Convert to string before inserting,
        JSON.stringify(preferredJobLocations),
        noticePeriod,
        currentCTC,
        expectedCTC,
        linkedinURL,
        profileSummary,
        profileImage,
        resume,
        createdAt,
      ];

      const [result] = await pool.query(query, values);
      return result;
    } catch (error) {
      throw new Error("Error inserting candidates: " + error.message);
    }
  },

  getCandidates: async (
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
  ) => {
    let conditions = [];
    let values = [];
    console.log("skillll", skills);
    if (firstName) {
      conditions.push("firstName LIKE ?");
      values.push(`%${firstName}%`);
    }

    if (lastName) {
      conditions.push("lastName LIKE ?");
      values.push(`%${lastName}%`);
    }

    if (mobile) {
      conditions.push("mobile = ?");
      values.push(mobile);
    }

    if (email) {
      conditions.push("email LIKE ?");
      values.push(`%${email}%`);
    }

    if (country) {
      conditions.push("lastName LIKE ?");
      values.push(`%${country}%`);
    }

    if (city) {
      conditions.push("city LIKE ?");
      values.push(`%${city}%`);
    }

    if (state) {
      conditions.push("state LIKE ?");
      values.push(`%${state}%`);
    }

    if (pincode) {
      conditions.push("pincode LIKE ?");
      values.push(`%${pincode}%`);
    }

    if (yearsOfExperience) {
      conditions.push("yearsOfExperience LIKE ?");
      values.push(`%${yearsOfExperience}%`);
    }

    if (monthOfExperience) {
      conditions.push("monthOfExperience LIKE ?");
      values.push(`%${monthOfExperience}%`);
    }

    if (companyDetails) {
      conditions.push("companyDetails LIKE ?");
      values.push(`%${companyDetails}%`);
    }

    // if (skills && Array.isArray(skills) && skills.length > 0) {
    //   conditions.push(`JSON_CONTAINS(skills, ?)`);
    //   values.push(JSON.stringify(skills));
    // }

    if (skills && Array.isArray(skills) && skills.length > 0) {
      const skillConditions = skills
        .map(() => `JSON_CONTAINS(skills, ?, '$')`)
        .join(" AND ");
      conditions.push(`(${skillConditions})`);
      values.push(...skills);
    }

    if (qualification) {
      conditions.push("qualification LIKE ?");
      values.push(`%${qualification}%`);
    }
    if (university) {
      conditions.push("university LIKE ?");
      values.push(`%${university}%`);
    }
    if (graduateYear) {
      conditions.push("graduateYear LIKE ?");
      values.push(`%${graduateYear}%`);
    }
    if (gender) {
      conditions.push("gender = ?");
      values.push(gender);
    }
    if (companyName) {
      conditions.push("companyName LIKE ?");
      values.push(`%${companyName}%`);
    }
    if (designation) {
      conditions.push("designation LIKE ?");
      values.push(`%${designation}%`);
    }
    if (noticePeriod) {
      conditions.push("noticePeriod LIKE ?");
      values.push(`%${noticePeriod}%`);
    }
    if (currentCTC) {
      conditions.push("currentCTC = ?");
      values.push(currentCTC);
    }
    if (preferredJobTitles) {
      conditions.push("JSON_SEARCH(preferredJobTitles, 'all', ?) IS NOT NULL");
      values.push(`%${preferredJobTitles}%`);
    }
    if (preferredJobLocations) {
      conditions.push(
        "JSON_SEARCH(preferredJobLocations, 'all', ?) IS NOT NULL"
      );
      values.push(`%${preferredJobLocations}%`);
    }
    if (linkedinURL) {
      conditions.push("linkedinURL LIKE ?");
      values.push(`%${linkedinURL}%`);
    }

    try {
      let query = "SELECT * FROM candidates";
      let countQuery = "SELECT COUNT(*) AS total FROM candidates";

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
        countQuery += " WHERE " + conditions.join(" AND ");
      }

      // Pagination logic
      const offset = (page - 1) * limit;
      query += " LIMIT ? OFFSET ?";
      values.push(parseInt(limit), parseInt(offset));

      // Execute the queries
      const [result] = await pool.query(query, values);
      const [[{ total }]] = await pool.query(countQuery, values.slice(0, -2)); // Remove pagination values

      const [skillsList] = await pool.query("SELECT * FROM skills");
      const formattedResult = result.map((candidate) => {
        return {
          ...candidate,
          skills: candidate.skills
            ? skillsList.filter((s) =>
                JSON.parse(candidate.skills || "[]").some((can) => s.id === can)
              )
            : [],
          companyDetails: candidate.companyDetails
            ? JSON.parse(candidate.companyDetails)
            : [],
          certifications: candidate.certifications
            ? JSON.parse(candidate.certifications)
            : [],
          preferredJobTitles: candidate.preferredJobTitles
            ? JSON.parse(candidate.preferredJobTitles)
            : [],
          preferredJobLocations: candidate.preferredJobLocations
            ? JSON.parse(candidate.preferredJobLocations)
            : [],
        };
      });
      return {
        data: formattedResult,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error("Error getting candidates: " + error.message);
    }
  },

  getSkills: async () => {
    try {
      const [result] = await pool.query("SELECT * FROM skills");
      return result;
    } catch (error) {
      throw new Error("Error getting skills: " + error.message);
    }
  },
};

module.exports = candidatesModal;
