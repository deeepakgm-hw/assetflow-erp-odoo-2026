const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authenticate = require("./middleware/auth.middleware");
const errorHandler = require("./middleware/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const departmentRoutes = require("./modules/organization/departments/departments.routes");
const categoryRoutes = require("./modules/organization/categories/categories.routes");
const employeeRoutes = require("./modules/organization/employees/employees.routes");
const activityRoutes = require("./modules/activity/activity.routes");
const notificationRoutes = require("./modules/notifications/notifications.routes");
const assetRoutes = require("./routes/asset.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const resourceRoutes = require("./modules/organization/resources/resources.routes");
const allocationRoutes = require("./modules/allocations/allocations.routes");
const transferRoutes = require("./modules/transfers/transfers.routes");
const bookingRoutes = require("./modules/bookings/bookings.routes");
const maintenanceRoutes = require("./modules/maintenance/maintenance.routes");
const auditRoutes = require("./modules/audit/audit.routes");
const reportRoutes = require("./modules/reports/reports.routes");
const { startOverdueChecker } = require("./helpers/overdueChecker");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/departments", authenticate, departmentRoutes);
app.use("/api/categories", authenticate, categoryRoutes);
app.use("/api/employees", authenticate, employeeRoutes);
app.use("/api/activity", authenticate, activityRoutes);
app.use("/api/notifications", authenticate, notificationRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/transfer-requests", transferRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/maintenance-requests", authenticate, maintenanceRoutes);
app.use("/api/audit-cycles", authenticate, auditRoutes);
app.use("/api/reports", authenticate, reportRoutes);

startOverdueChecker();

app.get("/", (req, res) => {
  res.json({
    message: "AssetFlow Enterprise ERP API Running"
  });
});

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use(errorHandler);

module.exports = app;
