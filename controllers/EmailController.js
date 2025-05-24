const { request, response } = require("express");
const emailModal = require("../models/EmailModel");

const sendTestLinks = async (request, response) => {
  const { users } = request.body;
  try {
    const result = await emailModal.sendTestLinks(users);
    return response.status(201).send({
      message: "Test link sent successfully",
      result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while sending email",
      details: error.message,
    });
  }
};

const readTestLink = async (request, response) => {
  const { id } = request.query;
  try {
    const result = await emailModal.readTestLink(id);
    if (result != 0) {
      return response.status(200).send({
        message: "Test link read successfully",
        result,
      });
    } else {
      throw new Error();
    }
  } catch (error) {
    response.status(500).send({
      message: "Error while reading link",
      details: error.message,
    });
  }
};

const getTestLinkByUser = async (request, response) => {
  const { user_id } = request.query;
  try {
    const testLinks = await emailModal.getTestLinkByUser(user_id);
    return response.status(200).send({
      message: "Test link fetched successfully",
      data: testLinks,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching link",
      details: error.message,
    });
  }
};

const sendOTP = async (request, response) => {
  const { email } = request.query;
  try {
    if (!email) throw new Error("Email is required.");
    const result = await emailModal.sendOTP(email);
    return response.status(200).send({
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while sending otp",
      details: error.message,
    });
  }
};

const validateOTP = async (request, response) => {
  const { email, otp } = request.query;
  try {
    const result = await emailModal.validateOTP(email, otp);
    return response.status(200).send({
      message: "OTP validated successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while validating otp",
      details: error.message,
    });
  }
};

const forgotPassword = async (request, response) => {
  const { password, email } = request.body;
  try {
    const result = await emailModal.forgotPassword(password, email);
    return response.status(200).send({
      message: "Password has been changed successfully",
      data: result,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while updating password",
      details: error.message,
    });
  }
};

module.exports = {
  sendTestLinks,
  readTestLink,
  getTestLinkByUser,
  sendOTP,
  validateOTP,
  forgotPassword,
};
