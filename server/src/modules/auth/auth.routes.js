const express = require("express");
const authController = require("./auth.controller");
const { signupValidation, loginValidation } = require("./auth.validation");

const router = express.Router();

router.post("/signup", signupValidation, authController.signup);
router.post("/login", loginValidation, authController.login);
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
