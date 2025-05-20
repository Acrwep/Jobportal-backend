const { request } = require("http");
const CourseVideoModel = require("../models/CourseVideosModel");
const upload = require("../Validation/UploadMiddleware");
const fs = require("fs").promises;
const path = require("path");
const { type } = require("os");

class CourseVideosController {
  static async uploadContent(request, response) {
    const {
      course_id,
      topic_id,
      trainer_id,
      content_type,
      content_url,
      title,
      document_content,
    } = request.body;
    try {
      //Validate required fields
      if (!course_id || !topic_id || !trainer_id || !content_type) {
        return response.status(400).send({
          message:
            "Missing required fields (coures_id, topic_id, trainer_id, content_type)",
        });
      }

      let contentDate;

      switch (content_type) {
        case "video":
          if (!request.file) {
            return response.status(400).send({
              message: "No video file uploaded",
            });
          }

          contentDate = {
            type: "video",
            fileName: request.file.filename,
            originalname: request.file.originalname,
            size: request.file.size,
            mimetype: request.file.mimetype,
            path: `/uploads/course-videos/${request.file.filename}`,
          };
          break;

        case "youtube":
          if (!content_url) {
            return response.status(400).send({
              message: "YouTube URL is required",
            });
          }

          contentDate = {
            type: "youtube",
            fileName: null,
            originalname: null,
            size: null,
            mimetype: null,
            path: content_url,
            content: null,
          };
          break;

        case "document":
          if (!document_content) {
            return response.status(400).send({
              message: "No document file uploaded",
            });
          }

          contentDate = {
            type: "document",
            fileName: null,
            originalname: null,
            size: null,
            mimetype: null,
            path: null,
            content: document_content, // store binary data
          };
          break;

        default:
          return response.status(400).send({
            message:
              "Invalid conetnt type (must be 'video', 'youtube', or 'document')",
          });
      }

      const contentId = await CourseVideoModel.createContent(
        course_id,
        topic_id,
        trainer_id,
        title,
        contentDate
      );

      return response.status(201).send({
        message: "Content uploaded successfully",
        data: {
          contentId,
          type: content_type,
          path: contentDate.path,
        },
      });
    } catch (error) {
      response.status(500).send({
        message: "Failed to upload content",
        details: error.message,
      });
    }
  }

  static async deleteContent(request, response) {
    const { filename, id } = request.query;
    try {
      if (filename) {
        const filePath = path.join(
          __dirname,
          `../uploads/course-videos/${filename}`
        );
        await fs.unlink(filePath);
      }
      const result = await CourseVideoModel.deleteContent(id);
      response.status(200).send({
        message: "Content has been deleted",
      });
    } catch (error) {
      response.status(500).send({
        message: "Error deleting content",
        details: error.message,
      });
    }
  }

  static async getCourseVideos(request, response) {
    const { course_id, topic_id, trainer_id } = request.query;
    try {
      const videos = await CourseVideoModel.getVideosByCourse(
        course_id,
        topic_id,
        trainer_id
      );

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

  static async getTrainersByCourse(request, response) {
    const { course_id } = request.query;
    try {
      const trainers = await CourseVideoModel.getTrainersByCourse(course_id);
      return response.status(200).send({
        message: "Trainers data fetched successfully",
        trainers,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error getting trainers",
        details: error.message,
      });
    }
  }

  static async deleteTopic(request, response) {
    const { topic_id } = request.query;
    try {
      const result = await CourseVideoModel.deleteTopic(topic_id);
      return response.status(200).send({
        message: "Topic has been removed successfully",
        result,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error removing topics",
        details: error.message,
      });
    }
  }

  static async insertCompanies(request, response) {
    const { name, logo, course_id } = request.body;
    try {
      const result = await CourseVideoModel.insertCompanies(
        name,
        logo,
        course_id
      );
      return response.status(201).send({
        message: "Company inserted successfully.",
        result,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error inserting companie",
        details: error.message,
      });
    }
  }

  // static async getCompanies(request, response) {
  //   try {
  //     const companies = await CourseVideoModel.getCompanies();
  //     return response.status(200).send({
  //       message: "Data fetched successfully.",
  //       companies,
  //     });
  //   } catch (error) {
  //     return response.status(500).send({
  //       message: "Error getting companies",
  //       details: error.message,
  //     });
  //   }
  // }

  static async getCompanyByCourse(request, response) {
    const { course_id } = request.query;
    try {
      const companies = await CourseVideoModel.getCompanyByCourse(course_id);
      return response.status(200).send({
        message: "Companies data fetched successfully",
        companies,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error getting companies",
        details: error.message,
      });
    }
  }

  static async uploadCompanyContent(request, response) {
    const { company_id, content_type, content_url, title, document_content } =
      request.body;
    try {
      //Validate required fields
      if (!company_id || !content_type) {
        return response.status(400).send({
          message: "Missing required fields (company_id, content_type)",
        });
      }

      let contentDate;

      switch (content_type) {
        case "video":
          if (!request.file) {
            return response.status(400).send({
              message: "No video file uploaded",
            });
          }

          contentDate = {
            type: "video",
            fileName: request.file.filename,
            originalname: request.file.originalname,
            size: request.file.size,
            mimetype: request.file.mimetype,
            path: `/uploads/company-contents/${request.file.filename}`,
          };
          break;

        case "youtube":
          if (!content_url) {
            return response.status(400).send({
              message: "YouTube URL is required",
            });
          }

          contentDate = {
            type: "youtube",
            fileName: null,
            originalname: null,
            size: null,
            mimetype: null,
            path: content_url,
            content: null,
          };
          break;

        case "document":
          if (!document_content) {
            return response.status(400).send({
              message: "No document file uploaded",
            });
          }

          contentDate = {
            type: "document",
            fileName: null,
            originalname: null,
            size: null,
            mimetype: null,
            path: null,
            content: document_content, // store binary data
          };
          break;

        default:
          return response.status(400).send({
            message:
              "Invalid conetnt type (must be 'video', 'youtube', or 'document')",
          });
      }

      const contentId = await CourseVideoModel.uploadCompanyContent(
        company_id,
        title,
        contentDate
      );

      return response.status(201).send({
        message: "Content uploaded successfully",
        data: {
          contentId,
          type: content_type,
          path: contentDate.path,
        },
      });
    } catch (error) {
      response.status(500).send({
        message: "Failed to upload content",
        details: error.message,
      });
    }
  }

  static async getCompanyContents(request, response) {
    const { company_id } = request.query;
    try {
      const videos = await CourseVideoModel.getCompanyContents(company_id);

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

  static async getCourseByTrainers(request, response) {
    const { user_id } = request.query;
    try {
      const courses = await CourseVideoModel.getCourseByTrainers(user_id);
      return response.status(200).send({
        message: "Courses fetched successfully",
        courses,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Failed to fetch courses",
        details: error.message,
      });
    }
  }

  static async updateCompany(request, response) {
    const { company_id, name } = request.body;
    try {
      const result = await CourseVideoModel.updateCompany(company_id, name);
      return response.status(200).send({
        message: "Company updated successfully",
        result,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error updating company",
        details: error.message,
      });
    }
  }

  static async deleteCompany(request, response) {
    const { company_id } = request.query;
    try {
      const result = await CourseVideoModel.deleteCompany(company_id);
      return response.status(200).send({
        message: "Company has been removed successfully",
        result,
      });
    } catch (error) {
      return response.status(500).send({
        message: "Error removing company",
        details: error.message,
      });
    }
  }

  static async deleteCompanyContent(request, response) {
    const { filename, id } = request.query;
    try {
      if (filename) {
        const filePath = path.join(
          __dirname,
          `../uploads/company-contents/${filename}`
        );
        await fs.unlink(filePath);
      }
      const result = await CourseVideoModel.deleteCompanyContent(id);
      response.status(200).send({
        message: "Content has been deleted",
        result,
      });
    } catch (error) {
      response.status(500).send({
        message: "Error deleting content",
        details: error.message,
      });
    }
  }
}

module.exports = CourseVideosController;
