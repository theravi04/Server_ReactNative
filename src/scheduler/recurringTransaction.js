const cron = require("node-cron");
const { addRecurringTransactions } = require("../controllers/transactionController");

// Run the recurring transaction job every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running recurring transactions job...");
  addRecurringTransactions();
});
