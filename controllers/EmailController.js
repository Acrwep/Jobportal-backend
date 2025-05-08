const { request, response } = require("express");
const emailModal = require("../models/EmailModel");

const sendTestLinks = async (request, response) => {
  const { users } = request.body;
  try {
    const result = await emailModal.sendTestLinks(users);
    return response.status(201).send({
      message: "Test link sent successfully",
    });
  } catch (error) {
    response.status(500).send({
      message: "Error while sending email",
      details: error.message,
    });
  }
};

module.exports = {
  sendTestLinks,
};
