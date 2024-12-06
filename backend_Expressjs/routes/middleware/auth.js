const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY || "default_secret_key";

// ฟังก์ชันตรวจสอบ JWT token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1]; // แยก Bearer และ token

  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  jwt.verify(token, secretKey, function (err, decoded) {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired!" });
      } else if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Invalid token!" });
      } else if (err.name === "NotBeforeError") {
        return res.status(403).json({ message: "Token not active yet!" });
      } else {
        return res
          .status(403)
          .json({ message: "Failed to authenticate token!" });
      }
    }
    // หาก token ถูกต้อง ให้ดึงข้อมูลจาก token มาใช้งาน
    req.user = decoded; // เก็บข้อมูล decoded token ใน req
    next();
  });
}

module.exports = verifyToken;