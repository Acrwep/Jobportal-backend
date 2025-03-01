const pool = require("../config/dbConfig");
const adminModal = require("../models/AdminModal");
const jwt = require("jsonwebtoken");

const login = async (request, response) => {
  const { email, password } = request.body;

  try {
    const result = await adminModal.login(email, password);
    console.log("login result", result);
    if (result.length >= 1) {
      const Token = generateToken(result[0]);
      response.status(200).send({
        message: "Login successfully!",
        details: {
          id: result[0].id,
          email: result[0].email,
          token: Token,
        },
      });
    } else {
      response.status(400).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("login error", error);
    response.status(500).send({ message: "Error while login" });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, //Payload
    process.env.JWT_SECRET, // Secret
    { expiresIn: "1d" } // Token expires in 1 hour
  );
};

module.exports = {
  login,
};
