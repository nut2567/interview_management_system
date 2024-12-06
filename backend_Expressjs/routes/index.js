var express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var router = express.Router();
const verifyToken = require("./middleware/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/getInterviewList", verifyToken, async function (req, res) {
  const interviews = await prisma.Interview.findMany({
    where: {
      AND: [
        {
          active: {
            not: "Save",
          },
        },
        {
          user_id: req.user.userInfo.id,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          Name: true,
          email: true,
          createdAt: true,
          age: true,
          image: true,
          phone: true,
          role: true,
        },
      },
    },
  });

  const total = await prisma.Interview.count({
    where: {
      AND: [
        {
          active: {
            not: "Save",
          },
        },
        {
          user_id: req.user.userInfo.id,
        },
      ],
    },
  });

  console.log(req.user, interviews);
  if (interviews.length == 0) {
    return res
      .status(204)
      .json({ interviews, message: "list data not found!", total });
  }
  res.json({ interviews, total });
});

router.get("/getInterviewById", verifyToken, async function (req, res) {
  const { id } = req.body;
  let interview = await prisma.Interview.findFirst({
    where: {
      AND: [
        {
          active: {
            not: "Save",
          },
        },
        {
          id: id,
        },
        {
          user_id: req.user.userInfo.id,
        },
      ],
    },
  });

  console.log(req.user, interview);
  if (interview && interview.status !== "Save") {
    res.json({ interview });
  } else {
    interview = interview ?? {};
    return res.status(200).json({ interview, message: "data not found!" });
  }
});

router.post("/createInterview", verifyToken, async function (req, res) {
  const { Title, status, detail, image } = req.body;

  // ตรวจสอบว่ามี Title สำหรับ userId นี้อยู่แล้วหรือไม่
  const existingPost = await prisma.Interview.findFirst({
    where: {
      AND: [
        {
          Title: {
            not: Title,
          },
        },
        {
          user_id: req.user.userInfo.id,
        },
      ],
    },
  });

  const time = new Date();

  if (existingPost) {
    return res
      .status(400)
      .json({
        time,
        message: "ผู้ใช้นี้มีชื่อรายการนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น",
      });
  }

  // สร้างรายการใหม่
  const newCourse = await prisma.Interview.create({
    Title,
    image,
    user_id: req.user.userInfo.id,
    detail,
    status,
    active: "y",
    createdAt: time,
  });

  console.log(req.user, interview);
  if (interview && interview.status !== "Save") {
    res.json({ interview });
  } else {
    return res.status(200).json({ interview, message: "data not found!" });
  }
});
module.exports = router;
