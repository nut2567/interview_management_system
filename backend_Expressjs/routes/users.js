var express = require("express");
const jwt = require("jsonwebtoken");
const { verifyToken, authorize } = require("./middleware/auth");

var router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/profile", verifyToken, async function (req, res) {
  // ค้นหาผู้ใช้จาก mock data

  const user = await prisma.user_info.findFirst({
    where: {
      email: req.user.userInfo.email,
    },
  });
  console.log(req.user);
  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }
  res.json(user);
});

module.exports = router;
