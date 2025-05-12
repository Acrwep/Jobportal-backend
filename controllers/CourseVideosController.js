const CourseVideoModel = require("../models/CourseVideosModel");
const upload = require("../Validation/UploadMiddleware");

class CourseVideosController {
  static async uploadVideo(request, response) {
    try {
      if (!request.file) {
        return response.status(400).send({
          message: "No video file uploaded",
        });
      }

      const courseId = request.params.courseId;
      const videoData = {
        filename: request.file.filename,
        originalname: request.file.originalname,
        size: request.file.size,
        mimetype: request.file.mimetype,
        path: `/uploads/course-videos/${request.file.filename}`,
      };

      const videoId = await CourseVideoModel.createVideo(courseId, videoData);

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

  static async getCourseVideos(request, response) {
    try {
      const courseId = request.params.courseId;
      const videos = await CourseVideoModel.getVideosByCourse(courseId);

      return response.status(200).send({
        message: "Videos fetched successfully",
        videos,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Failed to fetch videos",
        details: error.message,
      });
    }
  }
}

module.exports = CourseVideosController;
