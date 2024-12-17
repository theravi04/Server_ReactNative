const prisma = require("../models/prismaClient");

// Create Wallet for a User
exports.createWallet = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (existingWallet) {
      return res.status(400).json({ error: "Wallet already exists for this user." });
    }

    // Create new wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
      },
    });

    res.status(201).json({ message: "Wallet created successfully", wallet });
  } catch (err) {
    next(err);
  }
};

// Get Wallet Balance
exports.getWalletBalance = async (req, res, next) => {
  try {
    const { userId } = req.user; // From token

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.json({ balance: wallet.balance });
  } catch (err) {
    next(err);
  }
};

// Add or Remove Balance
exports.updateWalletBalance = async (req, res, next) => {
  try {
    const { userId } = req.user; // From token
    const { balance } = req.body;
    console.log("Request Payload:", req.body);
    console.log("Request Payload:", balance);
    const amount = req.body.balance;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Amount must be a valid number" });
    }

    // Fetch wallet
    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    // Update balance
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance + amount,
      },
    });

    res.json({
      message: `Wallet updated successfully. New balance: ${updatedWallet.balance}`,
      balance: updatedWallet.balance,
    });
  } catch (err) {
    next(err);
  }
};

// Get All Wallets (Admin only)
exports.getAllWallets = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const wallets = await prisma.wallet.findMany({
      include: { user: true },
    });

    res.json(wallets);
  } catch (err) {
    next(err);
  }
};