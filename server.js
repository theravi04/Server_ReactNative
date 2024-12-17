const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
const userRoutes = require("./src/routes/userRoutes");
const walletRoutes = require("./src/routes/walletRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
// const userRoutes = require("");
require("./src/scheduler/recurringTransaction");
const PORT = 5000;
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
// routes
app.use("/api/users", userRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/transactions", transactionRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
})