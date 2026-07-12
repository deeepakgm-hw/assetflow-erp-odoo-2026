const authService = require("./auth.service");

class AuthController {
  signup = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const result = await authService.signup({ name, email, password });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "An error occurred during registration",
        errors: [{ msg: error.message }]
      });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "An error occurred during login",
        errors: [{ msg: error.message }]
      });
    }
  };

  forgotPassword = async (req, res) => {
    return res.status(200).json({
      message: "Password reset feature coming soon."
    });
  };
}

module.exports = new AuthController();
