const express = require("express");
const {
  addTransaction,
  filterTransactions,
} = require("../controllers/transactionController");
const authCheck = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/addTransaction", authCheck, addTransaction); // Add transaction (send/receive)
router.get("/filterTransactions", authCheck, filterTransactions); // Filter transactions

module.exports = router;
