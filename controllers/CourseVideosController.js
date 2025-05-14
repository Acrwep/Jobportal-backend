const { request } = require("http");
const CourseVideoModel = require("../models/CourseVideosModel");
const upload = require("../Validation/UploadMiddleware");
const fs = require("fs").promises;
const path = require("path");

class CourseVideosController {
  static async uploadVideo(request, response) {
    const { course_id, topic_id, trainer_id } = request.body;
    try {
      if (!request.file) {
        return response.status(400).send({
          message: "No video file uploaded",
        });
      }

      const videoData = {
        filename: request.file.filename,
        originalname: request.file.originalname,
        size: request.file.size,
        mimetype: request.file.mimetype,
        path: `/uploads/course-videos/${request.file.filename}`,
      };

      const videoId = await CourseVideoModel.createVideo(
        course_id,
        topic_id,
        trainer_id,
        videoData
      );

      return response.status(201).send({
        message: "Video uploaded successfully",
        data: videoId,
        videoPath: videoData.path,
      });
    } catch (error) {
      response.status(500).send({
        message: "Failed to upload video",
        details: error.message,
      });
    }
  }

  static async deleteVideo(request, response) {
    try {
      // const path = `/uploads/course-videos/${request.params.filename}`;
      const filePath = path.join(
        __dirname,
        `../uploads/course-videos/${request.params.fileName}`
      );
      await fs.unlink(filePath);
      const result = await CourseVideoModel.deleteVideo(
        request.params.fileName
      );
      response.status(200).send({
        message: "Video deleted successfully",
      });
    } catch (error) {
      response.status(500).send({
        message: "Error deleting video",
        details: error.message,
      });
    }
  }

  static async getCourseVideos(request, response) {
    const { course_id } = request.query;
    try {
      const courseId = request.params.courseId;
      const videos = await CourseVideoModel.getVideosByCourse(course_id);

      return response.status(200).send({
        message: "Videos has been deleted",
        videos,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Failed to fetch videos",
        details: error.message,
      });
    }
  }

  static async insertCourseTopics(request, response) {
    const { course_id, topic } = request.body;
    try {
      const result = await CourseVideoModel.insertCourseTopics(
        course_id,
        topic
      );
      return response.status(201).send({
        message: "Topic inserted successfully",
        result,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error inserting topic",
        details: error.message,
      });
    }
  }

  static async updateCourseTopics(request, response) {
    const { topic_id, topic } = request.body;
    try {
      const result = await CourseVideoModel.updateCourseTopics(topic_id, topic);
      return response.status(200).send({
        message: "Topic updated successfully",
        result,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error updating topic",
        details: error.message,
      });
    }
  }

  static async getCourseTopics(request, response) {
    const { course_id } = request.query;
    try {
      const topics = await CourseVideoModel.getCourseTopics(course_id);
      return response.status(200).send({
        message: "Topic updated successfully",
        topics,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error getting topics",
        details: error.message,
      });
    }
  }

  static async courseTrainerMap(request, response) {
    const { course_id, trainers } = request.body;
    try {
      const result = await CourseVideoModel.courseTrainerMap(
        course_id,
        trainers
      );
      return response.status(200).send({
        message: "Mapped successfully",
        result,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error mapping trainers",
        details: error.message,
      });
    }
  }
}

module.exports = CourseVideosController;
