const express = require("express");
const Routes = require("./routes/Routes");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "50mb" }));

// Enable CORS if your frontend is running on a different port, like 3001
app.use(
  cors({
    origin: "http://localhost:3001",
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
