const prisma = require("../models/prismaClient");

// Add Transaction (Send/Receive)
exports.addTransaction = async (req, res, next) => {
  try {
    const { walletId, type, amount, category, recurring, interval } = req.body;

    // Validate input
    if (!walletId || !type || !amount || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!["send", "receive"].includes(type)) {
      return res.status(400).json({ error: "Type must be 'send' or 'receive'" });
    }

    // Fetch wallet
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    // Update wallet balance based on transaction type
    const newBalance =
      type === "send" ? wallet.balance - amount : wallet.balance + amount;

    if (newBalance < 0) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        walletId,
        type,
        amount,
        category,
        recurring: recurring || false,
        interval: recurring ? interval : null,
      },
    });

    // Update wallet balance
    await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance },
    });

    res.status(201).json({ message: "Transaction added successfully", transaction });
  } catch (err) {
    next(err);
  }
};

// Filter Transaction History
exports.filterTransactions = async (req, res, next) => {
  try {
    const { walletId, type, category, startDate, endDate } = req.query;

    // Build filter conditions
    const filters = { walletId };

    if (type) filters.type = type;
    if (category) filters.category = category;
    if (startDate && endDate) {
      filters.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });

    res.json({ transactions });
  } catch (err) {
    next(err);
  }
};

// Add Recurring Transactions
exports.addRecurringTransactions = async () => {
  try {
    const recurringTransactions = await prisma.transaction.findMany({
      where: { recurring: true },
    });

    for (const transaction of recurringTransactions) {
      const now = new Date();

      // Check the interval and create a new transaction if needed
      const shouldAdd = checkRecurringInterval(transaction.createdAt, now, transaction.interval);

      if (shouldAdd) {
        await prisma.transaction.create({
          data: {
            walletId: transaction.walletId,
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            recurring: true,
            interval: transaction.interval,
          },
        });

        // Update wallet balance
        const wallet = await prisma.wallet.findUnique({
          where: { id: transaction.walletId },
        });

        const newBalance =
          transaction.type === "send"
            ? wallet.balance - transaction.amount
            : wallet.balance + transaction.amount;

        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance },
        });
      }
    }
    console.log("Recurring transactions processed");
  } catch (err) {
    console.error("Error processing recurring transactions:", err);
  }
};

// Helper function to check recurring intervals
function checkRecurringInterval(createdAt, now, interval) {
  const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
  if (interval === "daily" && diffInDays >= 1) return true;
  if (interval === "weekly" && diffInDays >= 7) return true;
  if (interval === "monthly" && diffInDays >= 30) return true;
  return false;
}
