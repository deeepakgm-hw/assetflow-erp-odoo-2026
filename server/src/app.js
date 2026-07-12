const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./modules/auth/auth.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AssetFlow API Running"
  });
});

module.exports = app;
