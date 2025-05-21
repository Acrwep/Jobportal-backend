const { title } = require("process");
const pool = require("../config/dbConfig");
const path = require("path");
const { constants } = require("buffer");

const CourseVideosModel = {
  createContent: async (
    course_id,
    topic_id,
    trainer_id,
    title,
    contentData
  ) => {
    try {
      const { type, fileName, originalname, size, mimetype, path, content } =
        contentData;

      const query = `INSERT INTO course_videos (course_id, topic_id, trainer_id, content_type, title, filename, original_name, size, mime_type, file_path, content_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
      const values = [
        course_id,
        topic_id,
        trainer_id,
        type,
        title,
        fileName,
        originalname,
        size,
        mimetype,
        path,
        content,
      ];

      const [result] = await pool.query(query, values);
      return result.insertId;
    } catch (error) {
      throw new Error("Error while uploading content: " + error.message);
    }
  },

  async getVideosByCourse(courseId, topic_id, trainer_id) {
    try {
      const [videos] = await pool.query(
        `SELECT
            cv.id,
            cv.filename,
            cv.original_name,
            cv.size,
            cv.file_path,
            cv.created_at,
            c.name AS course_name,
            ct.name AS topic_name,
            cv.content_data,
            cv.mime_type,
            a.name AS trainer_name,
            cv.content_type,
            cv.title
        FROM
            course_videos cv
        INNER JOIN course c ON
            cv.course_id = c.id
        INNER JOIN course_topics ct ON
            ct.id = cv.topic_id
        LEFT JOIN admin a ON
          a.id = cv.trainer_id
        WHERE
            cv.course_id = ? AND cv.topic_id = ? AND cv.trainer_id = ? AND cv.is_deleted = 0
        ORDER BY
            cv.created_at
        DESC
    `,
        [courseId, topic_id, trainer_id]
      );
      return videos;
    } catch (error) {
      throw new Error("Error while fetching videos: " + error.message);
    }
  },

  deleteContent: async (id) => {
    try {
      const query = `UPDATE course_videos SET is_deleted = 1 WHERE id = ?`;
      const [result] = await pool.query(query, [id]);
      return result[0];
    } catch (error) {
      throw new Error("Error deleting content: " + error.message);
    }
  },

  insertCourseTopics: async (course_id, topics) => {
    try {
      const [isTopicExists] = await pool.query(
        `SELECT id FROM course_topics WHERE course_id = ? AND name = ?`,
        [course_id, topics]
      );

      if (isTopicExists.length > 0) {
        throw new Error("The given topic is already exists for this course.");
      }
      const query = `INSERT INTO course_topics (course_id, name) VALUES (?, ?)`;
      const [result] = await pool.query(query, [course_id, topics]);
      return result[0];
    } catch (error) {
      throw new Error("Error while inserting topics: " + error.message);
    }
  },

  updateCourseTopics: async (topic_id, topic) => {
    try {
      //Check whether the topic id is exists
      const [isTopicIdExists] = await pool.query(
        `SELECT id FROM course_topics WHERE id = ?`,
        [topic_id]
      );
      if (!isTopicIdExists) {
        throw new Error("Invalid topic id");
      }
      //Check whether the topic is exists
      const [isTopicExists] = await pool.query(
        `SELECT id FROM course_topics WHERE name = ? AND id <> ?`,
        [topic, topic_id]
      );
      if (isTopicExists.length > 0) {
        throw new Error("The given topic is already exists for another id.");
      }
      //Update topic
      const query = `UPDATE course_topics SET name = ? WHERE id = ?`;
      const [result] = await pool.query(query, [topic, topic_id]);
      return result[0];
    } catch (error) {
      throw new Error("Error while updating topic: " + error.message);
    }
  },

  getCourseTopics: async (course_id) => {
    try {
      let conditions = [];
      let values = [];
      if (course_id) {
        conditions.push("course_id = ?");
        values.push(course_id);
      }
      let query = `SELECT id, course_id, name FROM course_topics WHERE is_active = 1`;

      if (conditions.length > 0) {
        query += " AND " + conditions.join(" AND ");
      }
      query += " ORDER BY id";
      const [topics] = await pool.query(query, values);
      return topics;
    } catch (error) {
      throw new Error("Error getting topics: " + error.message);
    }
  },

  courseTrainerMap: async (course_id, trainers) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. First check for existing mappings - FIXED PARAMETER BINDING
      const checkQuery = `
      SELECT trainer_id 
      FROM trainer_course_mapping 
      WHERE course_id = ? 
      AND trainer_id IN (${trainers.map(() => "?").join(",")})
    `;

      const existingTrainerIds = trainers.map((t) => t.trainer_id);
      const [existingMappings] = await conn.execute(
        checkQuery,
        [course_id, ...existingTrainerIds] // Spread operator for individual values
      );

      // 2. Filter out already mapped trainers
      const existingIds = existingMappings.map((row) => row.trainer_id);
      const newTrainers = trainers.filter(
        (trainer) => !existingIds.includes(trainer.trainer_id)
      );

      if (newTrainers.length === 0) {
        await conn.rollback();
        conn.release();
        return {
          success: true,
          message: "All trainers are already mapped to this course",
          existingMappings: existingMappings,
          newMappings: [],
        };
      }

      // 3. Insert only new mappings
      const placeholders = newTrainers.map(() => "(?, ?)").join(",");
      const values = newTrainers.flatMap((trainer) => [
        course_id,
        trainer.trainer_id,
      ]);

      const insertQuery = `
      INSERT INTO trainer_course_mapping (course_id, trainer_id) 
      VALUES ${placeholders}
    `;

      const [result] = await conn.execute(insertQuery, values);
      await conn.commit();

      return {
        success: true,
        message: "Trainers mapped successfully",
        existingMappings: existingMappings,
        newMappings: result,
        affectedRows: result.affectedRows,
      };
    } catch (error) {
      await conn.rollback();
      console.error("Database error details:", error); // Log full error for debugging
      throw {
        message: "Error mapping trainers",
        details: error.message,
      };
    } finally {
      conn.release();
    }
  },

  getTrainersByCourse: async (course_id) => {
    try {
      const query = `SELECT
                        a.id AS trainer_id,
                        a.name AS trainer_name,
                        a.email,
                        r.name AS role,
                        IFNULL(l.name, '') AS course_location,
                        IFNULL(a.experience, '') AS experience,
                        IFNULL(a.profile, '') AS profile,
                        COUNT(CASE WHEN cv.content_type = 'document' THEN 1 END) AS document_count,
                        COUNT(CASE WHEN cv.content_type IN ('video', 'youtube') THEN 1 END) AS video_count,
                        COUNT(cv.id) AS total_content_count
                    FROM
                        trainer_course_mapping t
                    LEFT JOIN admin a ON
                        t.trainer_id = a.id
                    LEFT JOIN role r ON
                        r.id = a.role_id
                    LEFT JOIN location l ON
                        l.id = a.location_id
                    LEFT JOIN course_videos cv ON
                        a.id = cv.trainer_id AND cv.course_id = t.course_id AND cv.is_deleted = 0
                    WHERE
                        t.course_id = ? AND r.name = 'Trainer'
                    GROUP BY
                        a.id, a.name, a.email, r.name, l.name, a.experience, a.profile;`;
      const [trainers] = await pool.query(query, [course_id]);
      return trainers;
    } catch (error) {
      throw new Error("Error getting trainers: ", error.message);
    }
  },

  deleteTopic: async (topic_id) => {
    try {
      const [isTopicExists] = await pool.query(
        `SELECT id FROM course_topics WHERE id = ? AND is_active = 1`,
        [topic_id]
      );

      if (isTopicExists.length === 0) {
        throw new Error("Invalid topic id");
      }
      const [checkTopicVideos] = await pool.query(
        `SELECT id FROM course_videos WHERE topic_id = ? AND is_deleted = 0`,
        [topic_id]
      );

      if (checkTopicVideos.length > 0) {
        throw new Error(
          "Unable to remove the topic because it contains content."
        );
      }

      const [result] = await pool.query(
        `UPDATE course_topics SET is_active = 0 WHERE id = ?`,
        [topic_id]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error("Error deleting topic: " + error.message);
    }
  },

  insertCompanies: async (name, logo, coures_id) => {
    try {
      const [isComapnyExists] = await pool.query(
        `SELECT id FROM companies WHERE is_deleted = 0 AND name = ? AND course_id = ?`,
        [name, coures_id]
      );

      if (isComapnyExists.length > 0) {
        throw new Error("The given company name is already exists.");
      }

      const query = `INSERT INTO companies (name, logo, course_id) VALUES (?, ?, ?)`;
      const values = [name, logo, coures_id];
      const [result] = await pool.query(query, values);
      return result;
    } catch (error) {
      throw new Error("Error inserting company: " + error.message);
    }
  },

  // getCompanies: async () => {
  //   try {
  //     const query = `SELECT id, name, logo FROM companies WHERE is_deleted = 0 ORDER BY name`;
  //     const [companies] = await pool.query(query);
  //     return companies;
  //   } catch (error) {
  //     throw new Error("Error getting companies: " + error.message);
  //   }
  // },

  getCompanyByCourse: async (course_id) => {
    try {
      const query = `SELECT
                        c.id,
                        c.name AS company_name,
                        IFNULL(c.logo, '') AS logo,
                        COUNT(
                            CASE WHEN cc.content_type = 'document' THEN 1 END
                        ) AS document_count,
                        COUNT(
                            CASE WHEN cc.content_type IN('video', 'youtube') THEN 1 END
                        ) AS video_count,
                        COUNT(cc.id) AS total_content_count
                    FROM
                        companies c
                    LEFT JOIN company_contents cc 
                        ON c.id = cc.company_id AND cc.is_deleted = 0
                    WHERE
                        c.course_id = ? AND c.is_deleted = 0
                    GROUP BY
                        c.id, c.name, c.logo;`;
      const [companies] = await pool.query(query, [course_id]);
      return companies;
    } catch (error) {
      throw new Error("Error getting companies: ", error.message);
    }
  },

  uploadCompanyContent: async (company_id, title, contentData) => {
    try {
      const { type, fileName, originalname, size, mimetype, path, content } =
        contentData;

      const query = `INSERT INTO company_contents (company_id, content_type, title, filename, original_name, size, mime_type, file_path, content_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
      const values = [
        company_id,
        type,
        title,
        fileName,
        originalname,
        size,
        mimetype,
        path,
        content,
      ];

      const [result] = await pool.query(query, values);
      return result.insertId;
    } catch (error) {
      throw new Error("Error while uploading content: " + error.message);
    }
  },

  async getCompanyContents(company_id) {
    try {
      const [videos] = await pool.query(
        `SELECT
            cc.id,
            cc.filename,
            cc.original_name,
            cc.size,
            cc.file_path,
            cc.created_date,
            c.name AS course_name,
            cc.content_data,
            cc.mime_type,
            cc.content_type,
            cc.title,
            cm.name AS company_name
        FROM
            company_contents cc
        INNER JOIN companies cm ON
            cc.company_id = cm.id
        INNER JOIN course c ON
            cm.course_id = c.id
        WHERE
            cc.is_deleted = 0 AND cc.company_id = ?
        ORDER BY
            cc.created_date
        DESC
    `,
        [company_id]
      );
      return videos;
    } catch (error) {
      throw new Error("Error while fetching videos: " + error.message);
    }
  },

  getCourseByTrainers: async (user_id) => {
    try {
      const query = `SELECT
                        c.id,
                        c.name AS course_name
                    FROM
                        trainer_course_mapping t
                    INNER JOIN course c ON
                        c.id = t.course_id
                    WHERE
                        c.isActive = 1 AND t.is_deleted = 0 AND t.trainer_id = ?`;
      const [courses] = await pool.query(query, user_id);
      return courses;
    } catch (error) {
      throw new Error("Error while getting courses: " + error.message);
    }
  },

  updateCompany: async (company_id, name, logo, course_id) => {
    try {
      //Check whether the company id is exists
      const [isCompanyIdExists] = await pool.query(
        `SELECT id FROM companies WHERE id = ?`,
        [company_id]
      );

      if (isCompanyIdExists.length === 0) {
        throw new Error("Company not found");
      }
      //Check whether the company is exists
      const [isCompanyExists] = await pool.query(
        `SELECT id FROM companies WHERE name = ? AND id <> ? AND course_id = ?`,
        [name, company_id, course_id]
      );
      console.log("isCompanyExists", isCompanyExists);

      if (isCompanyExists.length > 0) {
        throw new Error(
          "The given company name is already exists for another id."
        );
      }
      //Update company
      const query = `UPDATE companies SET name = ?, logo = ? WHERE id = ?`;
      const [result] = await pool.query(query, [name, logo, company_id]);
      console.log("result", result);

      return result;
    } catch (error) {
      throw new Error("Error while updating company: " + error.message);
    }
  },

  deleteCompany: async (company_id) => {
    try {
      const [isCompanyExists] = await pool.query(
        `SELECT id FROM companies WHERE id = ? AND is_deleted = 0`,
        [company_id]
      );

      if (isCompanyExists.length === 0) {
        throw new Error("Company not found");
      }
      const [checkCompanyContents] = await pool.query(
        `SELECT id FROM company_contents WHERE company_id = ? AND is_deleted = 0`,
        [company_id]
      );

      if (checkCompanyContents.length > 0) {
        throw new Error(
          "Unable to remove the company because it contains content."
        );
      }

      const [result] = await pool.query(
        `UPDATE companies SET is_deleted = 1 WHERE id = ?`,
        [company_id]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error("Error deleting company: " + error.message);
    }
  },

  deleteCompanyContent: async (id) => {
    try {
      const query = `UPDATE company_contents SET is_deleted = 1 WHERE id = ?`;
      const [result] = await pool.query(query, [id]);
      return result;
    } catch (error) {
      throw new Error("Error deleting content: " + error.message);
    }
  },
};

module.exports = CourseVideosModel;
