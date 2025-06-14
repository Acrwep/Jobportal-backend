const pool = require("../config/dbConfig");
const { convertUTCDateToLocalDate } = require("../Validation/Validation");

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
    languages,
    resume,
    // courseName,
    course_id,
    courseLocation,
    courseStatus,
    mockupPercentage,
    courseJoiningDate,
    createdAt
  ) => {
    try {
      const query = `INSERT INTO candidates (
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
    course_id,
    courseLocation,
    courseStatus,
    mockupPercentage,
    courseJoiningDate,
    createdAt
) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`; //39

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
        JSON.stringify(languages),
        resume,
        // courseName,
        course_id,
        courseLocation,
        courseStatus,
        mockupPercentage,
        courseJoiningDate,
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
    favorites,
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
    if (favorites) {
      conditions.push("favorites = ?");
      values.push(favorites);
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
          languages: candidate.languages ? JSON.parse(candidate.languages) : [],
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

  getCandidatesById: async (candidateId) => {
    try {
      const query = `SELECT c.*, cr.name AS course_name FROM candidates c INNER JOIN course cr ON cr.id = c.course_id WHERE c.id = ?`;
      const values = [candidateId];

      const [result] = await pool.query(query, values);

      const query1 = `SELECT
                          a.id,
                          IFNULL(ua.attempt_number, 0) AS attempt_number,
                          COUNT(ua.question_id) AS total_questions,
                          SUM(IFNULL(ua.mark, 0)) AS total_obtained_marks,
                          ROUND(
                              (
                                  SUM(IFNULL(ua.mark, 0)) / COUNT(ua.question_id)
                              ) * 100,
                              0
                          ) AS attempt_percentage,
                          qt.name AS question_type,
                          ta.attempt_date
                      FROM
                          candidates c
                      INNER JOIN admin a ON
                          c.email = a.email
                      LEFT JOIN user_answers ua ON
                          a.id = ua.user_id
                      LEFT JOIN test_attempts ta ON
                          ua.attempt_number = ta.attempt_number
                      LEFT JOIN questions q ON
                          ua.question_id = q.id
                      LEFT JOIN question_type qt ON
                          q.question_type_id = qt.id
                      WHERE
                          c.id = ?
                      GROUP BY
                          ua.attempt_number
                      ORDER BY
                          ua.attempt_number`;

      const [attempt_result] = await pool.query(query1, [candidateId]);

      // Add grade to each attempt result
      const attemptResultsWithGrade = attempt_result.map((attempt) => ({
        ...attempt,
        grade: getGrade(attempt.attempt_percentage || 0),
      }));

      const formattedResult = result.map((candidate) => {
        return {
          ...candidate,
          skills: candidate.skills ? JSON.parse(candidate.skills) : [],
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
          languages: candidate.languages ? JSON.parse(candidate.languages) : [],
          attempt_result: attemptResultsWithGrade,
        };
      });
      return formattedResult;
    } catch (error) {
      throw new Error("Error getting particular candidate: " + error.message);
    }
  },

  getMultipleCandidatesbyId: async (
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
  ) => {
    try {
      let conditions = [];
      let values = [];

      const ids = candidateIds.map(() => "?").join(",");
      values.push(...candidateIds);

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
        conditions.push("country LIKE ?");
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

      if (Array.isArray(skills) && skills.length > 0) {
        const skillConditions = skills.map(() => `LOWER(skills) LIKE ?`);
        conditions.push(`(${skillConditions.join(" AND ")})`);
        skills.forEach((skill) => {
          values.push(`%"${skill.toLowerCase()}"%`);
        });
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
        conditions.push(
          "JSON_SEARCH(preferredJobTitles, 'all', ?) IS NOT NULL"
        );
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

      let query = `SELECT * FROM candidates WHERE id IN (${ids})`;

      let countQuery = `SELECT COUNT(*) AS total FROM candidates WHERE id IN (${ids})`;

      if (conditions.length > 0) {
        const whereClause = " AND " + conditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
      }

      // Pagination logic
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 10;
      const offset = (pageNumber - 1) * limitNumber;

      query += " LIMIT ? OFFSET ?";
      values.push(limitNumber, offset);

      // Execute the queries
      const [result] = await pool.query(query, values);
      const [[{ total }]] = await pool.query(countQuery, values.slice(0, -2)); // Remove pagination values

      const formattedResult = result.map((candidate) => {
        return {
          ...candidate,
          skills: candidate.skills ? JSON.parse(candidate.skills) : [],
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
          languages: candidate.languages ? JSON.parse(candidate.languages) : [],
        };
      });
      return {
        data: formattedResult,
        pagination: {
          total,
          page: parseInt(pageNumber),
          limit: parseInt(limitNumber),
          totalPages: Math.ceil(total / limitNumber),
        },
      };
    } catch (error) {
      console.log("multiple candidates error", error);
      throw new Error("Error getting multiple candidates: " + error.message);
    }
  },

  updateEligibleCandidate: async (eligibleStatus, candidateId) => {
    try {
      const query = `UPDATE candidates SET eligibleCandidates = ? WHERE id = ?;`;
      const values = [eligibleStatus, candidateId];

      const [result] = await pool.query(query, values);
      return result;
    } catch (error) {
      throw new Error("Error updating candidate: " + error.message);
    }
  },

  getUsers: async (
    name,
    course_location,
    from_date,
    to_date,
    course_id,
    email
  ) => {
    try {
      let conditions = [];
      let values = [];
      if (name) {
        conditions.push("LOWER(a.name) LIKE ?");
        values.push(`%${name}%`);
      }

      if (course_location) {
        conditions.push("LOWER(l.name) LIKE ?");
        values.push(`%${course_location}%`);
      }

      if (from_date && to_date) {
        conditions.push(`CAST(a.course_join_date AS DATE) BETWEEN ? AND ?`);
        values.push(from_date, to_date);
      }

      if (course_id) {
        conditions.push("a.course_id = ?");
        values.push(course_id);
      }

      if (email) {
        conditions.push("a.email = ?");
        values.push(email);
      }

      // Always exclude Admin and Trainer roles
      // conditions.push("r.name NOT IN ('Admin', 'Trainer')");

      let query = `SELECT
                    a.id,
                    a.name,
                    a.email,
                    a.password,
                    a.profile,
                    a.experience,
                    l.name AS course_location,
                    a.course_join_date,
                    cr.name AS course_name,
                    cr.id AS course_id,
                    IFNULL(latest_email.sent_at, '') AS last_email_sent_date,
                    IFNULL(t.attempt_count, 0) AS attempt_number,
                    r.name AS role,
                    CASE WHEN c.email IS NOT NULL THEN 1 ELSE 0 END AS is_placement_registered
                  FROM admin a
                  LEFT JOIN course cr ON a.course_id = cr.id
                  LEFT JOIN location l ON a.location_id = l.id
                  LEFT JOIN role r ON r.id = a.role_id
                  LEFT JOIN candidates c ON a.email = c.email
                  LEFT JOIN (
                    SELECT user_id, MAX(sent_at) AS sent_at
                    FROM email_logs
                    GROUP BY user_id
                  ) latest_email ON a.id = latest_email.user_id
                  LEFT JOIN (
                    SELECT user_id, MAX(attempt_number) AS attempt_count
                    FROM test_attempts
                    GROUP BY user_id
                  ) t ON a.id = t.user_id`;

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      const [candidates] = await pool.query(query, values);
      return candidates;
    } catch (error) {
      throw new Error("Error while getting candidates: " + error.message);
    }
  },

  getLocations: async () => {
    try {
      const query = `SELECT id, name FROM location WHERE is_active = 1 ORDER BY name`;
      const [locations] = await pool.query(query);
      return locations;
    } catch (error) {
      throw new Error("Error while fetching location: " + error.message);
    }
  },

  checkCandidate: async (email) => {
    try {
      const query = `SELECT id FROM candidates WHERE email = ?`;
      const [result] = await pool.query(query, [email]);
      if (result.length > 0) {
        return {
          id: result[0].id,
          is_exists: true,
        };
      } else
        return {
          id: 0,
          is_exists: false,
        };
    } catch (error) {
      throw new Error("Error while checking candidate: " + error.message);
    }
  },

  updateCandidate: async (
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
    id
  ) => {
    try {
      const query = `UPDATE
                        candidates
                    SET
                        firstName = ?,
                        lastName = ?,
                        mobile = ?,
                        email = ?,
                        country = ?,
                        city = ?,
                        state = ?,
                        pincode = ?,
                        yearsOfExperience = ?,
                        monthOfExperience = ?,
                        skills = ?,
                        qualification = ?,
                        university = ?,
                        graduateYear = ?,
                        typeOfEducation = ?,
                        certifications = ?,
                        gender = ?,
                        preferredJobTitles = ?,
                        noticePeriod = ?,
                        currentCTC = ?,
                        expectedCTC = ?,
                        linkedinURL = ?,
                        updatedAt = ?,
                        resume = ?,
                        companyName = ?,
                        designation = ?,
                        companyStartdate = ?,
                        companyEnddate = ?,
                        workingStatus = ?,
                        preferredJobLocations = ?,
                        profileSummary = ?,
                        profileImage = ?,
                        favorites = ?,
                        languages = ?,
                        courseLocation = ?,
                        courseStatus = ?,
                        mockupPercentage = ?,
                        courseJoiningDate = ?,
                        eligibleCandidates = ?,
                        password = ?,
                        course_id = ?
                    WHERE
                        id = ?`;
      const values = [
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
        JSON.stringify(skills), // Convert to string before inserting,
        qualification,
        university,
        graduateYear,
        typeOfEducation,
        JSON.stringify(certifications), // Convert to string before inserting,
        gender,
        JSON.stringify(preferredJobTitles), // Convert to string before inserting,
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
        JSON.stringify(preferredJobLocations), // Convert to string before inserting,
        profileSummary,
        profileImage,
        favorites,
        JSON.stringify(languages), // Convert to string before inserting,
        courseLocation,
        courseStatus,
        mockupPercentage,
        courseJoiningDate,
        eligibleCandidates,
        password,
        course_id,
        id,
      ];
      const [result] = await pool.query(query, values);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

function getGrade(percentage) {
  // Ensure the percentage is within valid range (0-100)
  percentage = Math.max(0, Math.min(100, percentage));

  // Determine the grade using switch case
  let grade;
  switch (true) {
    case percentage >= 91 && percentage <= 100:
      grade = "Excellent";
      break;
    case percentage >= 81 && percentage <= 90:
      grade = "Very good";
      break;
    case percentage >= 61 && percentage <= 80:
      grade = "Good";
      break;
    case percentage >= 41 && percentage <= 60:
      grade = "Above Average";
      break;
    case percentage >= 35 && percentage <= 40:
      grade = "Average";
      break;
    case percentage >= 0 && percentage <= 34:
      grade = "Fail";
      break;
    default:
      grade = "Invalid";
  }

  return grade;
}
module.exports = candidatesModal;
