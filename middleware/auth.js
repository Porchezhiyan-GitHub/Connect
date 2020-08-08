const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = await req.header("x-auth-jwt");
    if (!token)
      res.status(401).json({ err: ["No token, authorization failed."] });

    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).send("Invalid token, authorization failed.");
  }
};
