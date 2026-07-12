const { verifyToken } = require("../utils/jwt");
const prisma = require("../lib/prisma");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing or invalid",
        errors: [{ msg: "Authorization header must start with Bearer" }]
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing",
        errors: []
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        errors: [{ msg: err.message }]
      });
    }

    // Check if user still exists and is Active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        errors: []
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "User account is suspended",
        errors: []
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
      errors: [{ msg: error.message }]
    });
  }
};

module.exports = authenticate;
