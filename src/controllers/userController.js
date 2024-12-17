const prisma = require("../models/prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || "client", // Default role is "client"
      },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    next(err);
  }
};

// Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
};

exports.accountStatus = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { userId, status } = req.body; // status: true/false for activate/deactivate

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: status },
    });

    res.json({
      message: `User account ${
        status ? "activated" : "deactivated"
      } successfully`,
      user,
    });
  } catch (error) {
    next(err);
  }
};

exports.walletStatus = async (req, res, next) => {
  try {

    const { userId, walletStatus } = req.body; // walletStatus: true/false for freeze/unfreeze

    const user = await prisma.user.update({
      where: { id: userId },
      data: { walletFrozen: walletStatus },
    });

    res.json({
      message: `Wallet ${walletStatus ? "frozen" : "unfrozen"} successfully`,
      user,
    });
  } catch (err) {
    next(err);
  }
};


// only by admin
exports.resetPassword = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { userId, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "User password reset successfully", user });
  } catch (err) {
    next(err);
  }
};

// Get All Users (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    // Ensure user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    next(err);
  }
};
