const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized! Invalid token" });
    }

    // If token is valid, store user info in the request and move to the next middleware
    req.user = decoded;
    next();
  });
};

module.exports = {
  verifyToken,
};
