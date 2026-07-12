const prisma = require("../../lib/prisma");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateToken } = require("../../utils/jwt");

class AuthService {
  async signup({ name, email, password }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error("Email is already in use");
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user. Role is ALWAYS Employee.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "Employee",
        status: "Active",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login({ email, password }) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== "Active") {
      const error = new Error("User account is suspended");
      error.statusCode = 403;
      throw error;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Exclude password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }
}

module.exports = new AuthService();
