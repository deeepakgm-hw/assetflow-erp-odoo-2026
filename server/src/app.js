const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

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
const assetRoutes = require("./routes/asset.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const assetRoutes = require("./modules/organization/assets/assets.routes");
const resourceRoutes = require("./modules/organization/resources/resources.routes");
const allocationRoutes = require("./modules/allocations/allocations.routes");
const transferRoutes = require("./modules/transfers/transfers.routes");
const bookingRoutes = require("./modules/bookings/bookings.routes");
const { startOverdueChecker } = require("./helpers/overdueChecker");

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes registration
app.use("/api/auth", authRoutes);
app.use("/api/departments", authenticate, departmentRoutes);
app.use("/api/categories", authenticate, categoryRoutes);
app.use("/api/employees", authenticate, employeeRoutes);
app.use("/api/activity", authenticate, activityRoutes);
app.use("/api/notifications", authenticate, notificationRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/dashboard", dashboardRoutes);

<<<<<<< HEAD
// Base route
=======
app.use("/api/assets", assetRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/transfer-requests", transferRoutes);
app.use("/api/bookings", bookingRoutes);

// Start background overdue return checker daemon
startOverdueChecker();


>>>>>>> f8829ed (Add asset booking and allocation modules)
app.get("/", (req, res) => {
  res.json({
    message: "AssetFlow Enterprise ERP API Running"
  });
});

// 404 Route handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
