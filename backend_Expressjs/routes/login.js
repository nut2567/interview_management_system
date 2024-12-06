const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
require("dotenv").config();

const prisma = new PrismaClient();
const router = express.Router();

// Secret key สำหรับการ sign token
const secretKey = process.env.SECRET_KEY || "default_secret_key";
const users = [{ username: "admin", password: "1234" }];
// POST /users/login

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/", async function (req, res) {
  const { username, password } = req.body;
  try {
    const existingUser = await prisma.user_info.findFirst({
      where: {
        email: username,
      },
    });

    if (!existingUser) {
      // กรณี username หรือ password ไม่ถูกต้อง
      res.status(401).json({ message: "Invalid username or password" });
    } else {
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid username or password" });
      } else {
        // สร้าง JWT token โดยใส่ข้อมูลผู้ใช้ลงใน token
        const token = jwt.sign({ userInfo: existingUser }, secretKey, {
          expiresIn: "1h",
        });
        // ส่ง token และข้อมูลผู้ใช้กลับไปที่ client
        res.json({ message: "Login successful", token: token });
      }
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
