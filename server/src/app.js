const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Middlewares
const authenticate = require("./middleware/auth.middleware");
const authorize = require("./middleware/role.middleware");
const errorHandler = require("./middleware/error.middleware");

// Routes
const authRoutes = require("./modules/auth/auth.routes");
const departmentRoutes = require("./modules/organization/departments/departments.routes");
const categoryRoutes = require("./modules/organization/categories/categories.routes");
const employeeRoutes = require("./modules/organization/employees/employees.routes");
const activityRoutes = require("./modules/activity/activity.routes");
const notificationRoutes = require("./modules/notifications/notifications.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes registration
app.use("/api/auth", authRoutes);
app.use("/api/departments", authenticate, authorize("Admin"), departmentRoutes);
app.use("/api/categories", authenticate, authorize("Admin"), categoryRoutes);
app.use("/api/employees", authenticate, authorize("Admin"), employeeRoutes);
app.use("/api/activity", authenticate, authorize("Admin"), activityRoutes);
app.use("/api/notifications", authenticate, notificationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AssetFlow API Running"
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
