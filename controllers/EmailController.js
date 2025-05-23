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
      testLinks,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while fetching link",
      details: error.message,
    });
  }
};

module.exports = {
  sendTestLinks,
  readTestLink,
  getTestLinkByUser,
};
