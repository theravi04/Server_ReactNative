const express = require("express");
const {
  createWallet,
  getWalletBalance,
  updateWalletBalance,
  getAllWallets,
} = require("../controllers/walletController");
const authCheck = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/createWallet", authCheck, createWallet); // Create wallet (requires user token)
router.get("/balance", authCheck, getWalletBalance); // Get balance for logged-in user
router.put("/update-balance", authCheck, updateWalletBalance); // Add/Remove balance
router.get("/getAllWallets", authCheck, getAllWallets); // Admin: Get all wallets

module.exports = router;
