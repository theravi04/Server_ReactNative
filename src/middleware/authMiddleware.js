const jwt = require("jsonwebtoken");

const authCheck = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    // console.log(authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Extract the token after "Bearer "
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data (user info) to the request
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = authCheck;
