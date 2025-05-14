const pool = require("../config/dbConfig");
const path = require("path");

const CourseVideosModel = {
  async createVideo(courseId, topic_id, trainer_id, videoData) {
    try {
      const {
        filename,
        originalname,
        size,
        mimetype,
        path: filePath,
      } = videoData;

      const [result] = await pool.query(
        `INSERT INTO course_videos 
      (course_id, topic_id, trainer_id, filename, original_name, size, mime_type, file_path) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          topic_id,
          trainer_id,
          filename,
          originalname,
          size,
          mimetype,
          filePath,
        ]
      );

      return result.insertId;
    } catch (error) {
      throw new Error("Error while uploading video: " + error.message);
    }
  },

  async getVideosByCourse(courseId) {
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
            ct.name AS topic_name
        FROM
            course_videos cv
        INNER JOIN course c ON
          cv.course_id = c.id
        INNER JOIN course_topics ct ON
          ct.id = cv.topic_id
        WHERE
            cv.course_id = ? AND cv.is_deleted = 0
        ORDER BY
            cv.created_at
        DESC
    `,
        [courseId]
      );
      return videos;
    } catch (error) {
      throw new Error("Error while fetching videos: " + error.message);
    }
  },

  deleteVideo: async (fileName) => {
    try {
      const query = `UPDATE course_videos SET is_deleted = 1 WHERE filename = ?`;
      const [result] = await pool.query(query, [fileName]);
      return result[0];
    } catch (error) {
      throw new Error("Error deleting video: " + error.message);
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
      const query = `SELECT id, course_id, name FROM course_topics WHERE is_active = 1`;

      if (conditions.length > 0) {
        query += conditions.join(" AND ");
      }

      const [topics] = await pool.query(query, values);
      return topics;
    } catch (error) {
      throw new Error("Error getting topics: " + error.message);
    }
  },
};

module.exports = CourseVideosModel;
