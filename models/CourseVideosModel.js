const pool = require("../config/dbConfig");
const path = require("path");

const CourseVideosModel = {
  async createVideo(courseId, videoData) {
    try {
      const {
        filename,
        originalname,
        size,
        mimetype,
        path: filePath,
        // sort_order,
      } = videoData;

      const [result] = await pool.query(
        `INSERT INTO course_videos 
      (course_id, filename, original_name, size, mime_type, file_path) 
      VALUES (?, ?, ?, ?, ?, ?)`,
        [courseId, filename, originalname, size, mimetype, filePath]
      );

      return result.insertId;
    } catch (error) {
      throw new Error("Error while uploading video: " + error.message);
    }
  },

  async getVideosByCourse(courseId) {
    try {
      const [videos] = await pool.query(
        `SELECT id, filename, original_name, size, file_path, created_at 
       FROM course_videos 
       WHERE course_id = ? 
       ORDER BY created_at`,
        [courseId]
      );
      return videos;
    } catch (error) {
      throw new Error("Error while fetching videos: " + error.message);
    }
  },
};

module.exports = CourseVideosModel;
