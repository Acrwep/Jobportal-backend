const pool = require("../config/dbConfig");

const adminModal = {
  login: async (email, password) => {
    try {
      const query = `CALL uspAuthenticateUser(?, ?)`;
      const values = [email, password];

      const [result] = await pool.query(query, values);
      if (!result[0] || result[0].length === 0) {
        return null;
      }
      const user = result[0][0];
      return user;
    } catch (error) {
      throw error;
    }
  },

  searchByKeyword: async (queryParams) => {
    try {
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
      } = queryParams;
      const filters = [];

      // Keyword filter
      if (q) {
        const words = q.toLowerCase().split(" ");
        words.forEach((word) => {
          const likeFields = [
            `firstName LIKE '%${word}%'`,
            `lastName LIKE '%${word}%'`,
            `mobile LIKE '%${word}%'`,
            `email LIKE '%${word}%'`,
            `country LIKE '%${word}%'`,
            `state LIKE '%${word}%'`,
            `city LIKE '%${word}%'`,
            `pincode LIKE '%${word}%'`,
            `yearsOfExperience LIKE '%${word}%'`,
            `monthOfExperience LIKE '%${word}%'`,
            `qualification LIKE '%${word}%'`,
            `university LIKE '%${word}%'`,
            `graduateYear LIKE '%${word}%'`,
            `linkedinURL LIKE '%${word}%'`,
            `companyName LIKE '%${word}%'`,
            `designation LIKE '%${word}%'`,
            `noticePeriod LIKE '%${word}%'`,
            `currentCTC LIKE '%${word}%'`,
            `linkedinURL LIKE '%${word}%'`,
            `languages LIKE '%${word}%'`,
            `LOWER(skills) LIKE '%${word}%'`,
          ];

          // Exact match only for gender
          const exactMatchFields = [];
          if (word === "male" || word === "female") {
            exactMatchFields.push(`gender = '${word}'`);
          }

          filters.push(
            `(${[...likeFields, ...exactMatchFields].join(" OR ")})`
          );
        });
      }
      // Additional filters
      if (firstName) filters.push(`firstName LIKE '%${firstName}'`);
      if (lastName) filters.push(`lastName LIKE '%${lastName}'`);
      if (mobile) filters.push(`mobile = '${mobile}'`);
      if (email) filters.push(`email = '${email}'`);
      if (country) filters.push(`country = '${country}'`);
      if (state) filters.push(`state = '${state}'`);
      if (city) filters.push(`city = '${city}'`);
      if (gender) filters.push(`gender = '${gender}'`);
      if (Array.isArray(skills) && skills.length > 0) {
        const skillFilters = skills.map((skill) => {
          const lowerSkill = skill.toLowerCase();
          return `LOWER(skills) LIKE '%"${lowerSkill}"%'`;
        });
        filters.push(`(${skillFilters.join(" AND ")})`);
      }

      if (yearsOfExperience)
        filters.push(`yearsOfExperience = '${yearsOfExperience}'`);
      if (monthOfExperience)
        filters.push(`monthOfExperience = '${monthOfExperience}'`);
      if (qualification)
        filters.push(`qualification LIKE '%${qualification}%'`);
      if (university) filters.push(`university LIKE '%${university}%'`);
      if (graduateYear) filters.push(`graduateYear LIKE '%${graduateYear}%'`);
      if (companyName) filters.push(`companyName LIKE '%${companyName}%'`);
      if (designation) filters.push(`designation LIKE '%${designation}%'`);
      if (noticePeriod) filters.push(`noticePeriod LIKE '%${noticePeriod}%'`);
      if (currentCTC) filters.push(`currentCTC LIKE '%${currentCTC}%'`);
      if (linkedinURL) filters.push(`linkedinURL LIKE '%${linkedinURL}%'`);

      if (courseName) filters.push(`courseName = '${courseName}'`);
      if (Array.isArray(courseLocation) && courseLocation.length > 0) {
        const courseLocationFilters = courseLocation.map((location) => {
          const lowerCourseLocation = location.toLowerCase();
          return `LOWER(courseLocation) LIKE '%${lowerCourseLocation}%'`;
        });
        filters.push(`(${courseLocationFilters.join(" OR ")})`);
      }
      if (courseStatus) filters.push(`courseStatus LIKE '%${courseStatus}'`);
      if (eligibleStatus)
        filters.push(`eligibleCandidates = '${eligibleStatus}'`);
      if (startJoingingDate && endJoiningDate)
        filters.push(
          `courseJoiningDate BETWEEN '${startJoingingDate}' AND '${endJoiningDate}'`
        );

      const whereClause =
        filters.length > 0 ? "WHERE " + filters.join(" AND ") : "";

      // Pagination logic
      const values = []; // build values array according to filters
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 10;
      const offset = (pageNumber - 1) * limitNumber;

      const query = `SELECT * FROM candidates ${whereClause} LIMIT ? OFFSET ?`;
      const countQuery = `SELECT COUNT(*) AS total FROM candidates ${whereClause}`;

      const paginatedValues = [...values, limitNumber, offset];

      const [result] = await pool.query(query, paginatedValues);
      const [[{ total }]] = await pool.query(countQuery, values); // no LIMIT/OFFSET for count

      const formattedResult = result.map((candidate) => {
        return {
          ...candidate,
          skills: candidate.skills ? JSON.parse(candidate.skills) : [],
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
          page: parseInt(pageNumber),
          limit: parseInt(limitNumber),
          totalPages: Math.ceil(total / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  },

  updateCandidateFavorites: async (favoriteStatus, candidateId) => {
    try {
      const query = "UPDATE candidates SET favorites = ? WHERE id = ?";
      const values = [favoriteStatus, candidateId];
      console.log("favorites values", values);
      const [result] = await pool.query(query, values);
      return result;
    } catch (error) {
      throw new Error("Error update favorites: " + error.message);
    }
  },

  createFavorites: async (userId, candidateId) => {
    try {
      const query = `INSERT INTO favorites (userId,candidateId) 
    VALUES (?,?)`;
      const values = [userId, candidateId];
      const [result] = await pool.query(query, values);
      return result;
    } catch (error) {
      throw new Error("Error creating favorites", +error.message);
    }
  },

  removeFavorites: async (userId, candidateId) => {
    try {
      const query = `DELETE FROM favorites WHERE userId = ? AND candidateId = ?`;
      const values = [userId, candidateId];
      const [result] = await pool.query(query, values);
      return result;
    } catch (error) {
      throw new Error("Error creating favorites", +error.message);
    }
  },

  getFavorites: async () => {
    try {
      const query = `SELECT * FROM favorites`;
      const [result] = await pool.query(query);
      return result;
    } catch (error) {
      throw new Error("Error getting favorites", +error.message);
    }
  },

  getFavoriteCandidates: async (
    userId, // The user who favorited the candidates
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
    let conditions = ["f.userId = ?"]; // Ensure we only get favorite candidates for this user
    let values = [userId]; // Store userId first
    console.log("favoritess", skills);

    if (firstName) {
      conditions.push("c.firstName LIKE ?");
      values.push(`%${firstName}%`);
    }

    if (lastName) {
      conditions.push("c.lastName LIKE ?");
      values.push(`%${lastName}%`);
    }

    if (mobile) {
      conditions.push("c.mobile = ?");
      values.push(mobile);
    }

    if (email) {
      conditions.push("c.email LIKE ?");
      values.push(`%${email}%`);
    }

    if (country) {
      conditions.push("c.country LIKE ?");
      values.push(`%${country}%`);
    }

    if (city) {
      conditions.push("c.city LIKE ?");
      values.push(`%${city}%`);
    }

    if (state) {
      conditions.push("c.state LIKE ?");
      values.push(`%${state}%`);
    }

    if (pincode) {
      conditions.push("c.pincode LIKE ?");
      values.push(`%${pincode}%`);
    }

    if (yearsOfExperience) {
      conditions.push("c.yearsOfExperience LIKE ?");
      values.push(`%${yearsOfExperience}%`);
    }

    if (monthOfExperience) {
      conditions.push("c.monthOfExperience LIKE ?");
      values.push(`%${monthOfExperience}%`);
    }

    if (companyDetails) {
      conditions.push("c.companyDetails LIKE ?");
      values.push(`%${companyDetails}%`);
    }

    if (Array.isArray(skills) && skills.length > 0) {
      const skillConditions = skills.map(() => `LOWER(c.skills) LIKE ?`);
      conditions.push(`(${skillConditions.join(" AND ")})`);
      skills.forEach((skill) => {
        values.push(`%"${skill.toLowerCase()}"%`);
      });
    }

    if (qualification) {
      conditions.push("c.qualification LIKE ?");
      values.push(`%${qualification}%`);
    }
    if (university) {
      conditions.push("c.university LIKE ?");
      values.push(`%${university}%`);
    }
    if (graduateYear) {
      conditions.push("c.graduateYear LIKE ?");
      values.push(`%${graduateYear}%`);
    }
    if (gender) {
      conditions.push("c.gender = ?");
      values.push(gender);
    }
    if (companyName) {
      conditions.push("c.companyName LIKE ?");
      values.push(`%${companyName}%`);
    }
    if (designation) {
      conditions.push("c.designation LIKE ?");
      values.push(`%${designation}%`);
    }
    if (noticePeriod) {
      conditions.push("c.noticePeriod LIKE ?");
      values.push(`%${noticePeriod}%`);
    }
    if (currentCTC) {
      conditions.push("c.currentCTC = ?");
      values.push(currentCTC);
    }
    if (preferredJobTitles) {
      conditions.push(
        "JSON_SEARCH(c.preferredJobTitles, 'all', ?) IS NOT NULL"
      );
      values.push(`%${preferredJobTitles}%`);
    }
    if (preferredJobLocations) {
      conditions.push(
        "JSON_SEARCH(c.preferredJobLocations, 'all', ?) IS NOT NULL"
      );
      values.push(`%${preferredJobLocations}%`);
    }
    if (linkedinURL) {
      conditions.push("c.linkedinURL LIKE ?");
      values.push(`%${linkedinURL}%`);
    }

    try {
      let query = `
        SELECT c.* 
        FROM candidates c
        JOIN favorites f ON c.id = f.candidateId
      `;

      let countQuery = `
        SELECT COUNT(*) AS total 
        FROM candidates c
        JOIN favorites f ON c.id = f.candidateId
      `;

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
        countQuery += " WHERE " + conditions.join(" AND ");
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
          page: parseInt(pageNumber),
          limit: parseInt(limitNumber),
          totalPages: Math.ceil(total / limitNumber),
        },
      };
    } catch (error) {
      console.log("getfavorite error", error);
      throw new Error("Error getting favorite candidates: " + error.message);
    }
  },

  createFolder: async (name, candidateIds, userId) => {
    try {
      const query = `INSERT INTO folders (name,candidateIds,userId) 
    VALUES (?,?,?)`;

      const values = [name, JSON.stringify(candidateIds), userId];

      const [result] = await pool.query(query, values);
      return result;
    } catch (error) {
      throw new Error("Error inserting folders: " + error.message);
    }
  },

  updateFolder: async (name, folderId) => {
    try {
      const query = `UPDATE folders SET name = ? WHERE id = ?`;

      const values = [name, folderId];

      const [result] = await pool.query(query, values);
      return result;
    } catch (error) {
      throw new Error("Error inserting folders: " + error.message);
    }
  },

  getFolders: async (userId) => {
    try {
      const query = `SELECT * FROM folders WHERE userId = ?`;
      const values = [userId];
      const [result] = await pool.query(query, values);

      const folders = result.map((folder) => ({
        ...folder,
        createdAt: folder.createdAt,
      }));
      return folders;
    } catch (error) {
      throw new Error("Error getting folders: " + error.message);
    }
  },

  deleteFolder: async (folderId) => {
    try {
      const query = `DELETE FROM folders WHERE id = ?`;
      const values = [folderId];
      const result = await pool.query(query, values);
      console.log("delete result", result);
      return result;
    } catch (error) {
      console.log("delete folder error", error);
      throw new Error("Error while deleting folder:", +error.message);
    }
  },
};

module.exports = adminModal;
