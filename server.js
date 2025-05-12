const express = require("express");
const Routes = require("./routes/Routes");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enable CORS if your frontend is running on a different port, like 3001
app.use(
  cors({
    origin: ["http://localhost:3001", "https://placement.acte.in"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

//use the routes
app.use("/api", Routes);

// Catch all undefined routes
app.use((req, res) => {
  res.status(404).send({
    message: "404 Not Found",
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
