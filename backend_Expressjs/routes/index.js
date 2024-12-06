var express = require("express");
var router = express.Router();
const verifyToken = require("./middleware/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/getInterviewList", verifyToken, async function (req, res) {
  // ค้นหาผู้ใช้จาก mock data

  const user = await prisma.user_info.findFirst({
    where: {
      email: req.user,
    },
  });
  console.log(req.user);
  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }
  res.json(user);
});

module.exports = router;
