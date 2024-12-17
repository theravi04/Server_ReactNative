const express = require("express");
const { register, login, accountStatus, walletStatus, resetPassword, getUsers } = require("../controllers/userController");
const authCheck = require("../middleware/authMiddleware");

const router = express.Router();

// for general users only
router.post("/register", register); 
router.post("/login", login);       

// for admin only
router.post("/accountStatus", authCheck, accountStatus); 
router.post("/walletStatus", authCheck, walletStatus);  
router.post("/resetPassword",authCheck,resetPassword);     
router.get("/getUsers", authCheck, getUsers); 

module.exports = router;
