var express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var router = express.Router();
const verifyToken = require("./middleware/auth");

/* GET home page. */

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/getCommentList", verifyToken, async function (req, res) {
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

router.get("/getCommentById", verifyToken, async function (req, res) {
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

router.post("/createComment", verifyToken, async function (req, res) {
  const { content, InterviewId } = req.body;

  const time = new Date();
  if (!content || !InterviewId) {
    return res.status(400).json({
      time,
      message: "content ,InterviewId are required",
    });
  }
  try {
    // สร้างรายการใหม่
    const Comment = await prisma.Comment.create({
      data: {
        content,
        user_id: req.user.userInfo.id,
        InterviewId,
        status: "",
      },
    });

    console.log(req.user, Comment);

    res.json({ Comment });
  } catch (error) {
    console.error("Error creating Comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updateComment", verifyToken, async function (req, res) {
  const { id, content, InterviewId } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Comment ID is required!" });
  }

  const time = new Date();
  if (!content || !InterviewId) {
    return res.status(400).json({
      time,
      message: "content ,InterviewId are required",
    });
  }

  const existingcomment = await prisma.comment.findFirst({
    where: {
      id: id,
      InterviewId: InterviewId,
    },
  });
  console.log(existingcomment);
  if (existingcomment && existingcomment.user_id != req.user.userInfo.id) {
    return res.status(400).json({
      time,
      message: "ผู้ใช้นี้ไม่ได้เป็นเจ้าของความคิดเห็น",
    });
  }

  try {
    // อัปเดตข้อมูล
    const updatedcomment = await prisma.comment.update({
      where: {
        id: id,
      },
      data: {
        content,
        user_id: req.user.userInfo.id,
        InterviewId,
        status: "",
        updatedAt: time,
      },
    });

    res.json({
      message: "Comment updated successfully!",
      updatedcomment,
    });
  } catch (error) {
    console.error("Error updating Comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/DeleteComment", verifyToken, async function (req, res) {
  const { id } = req.body;

  const time = new Date();
  try {
    // ตรวจสอบว่ามี interview สำหรับ id และ user_id นี้หรือไม่
    const interview = await prisma.Interview.findFirst({
      where: {
        id: id,
        user_id: req.user.userInfo.id,
      },
    });

    if (!interview) {
      return res
        .status(404)
        .json({ message: "Comment ID not found for this user!", time });
    }

    // ลบ interview
    const deletedInterview = await prisma.Interview.delete({
      where: {
        id: id,
      },
    });

    res.json({
      message: "Comment deleted successfully!",
      deletedInterview,
      time,
    });
  } catch (error) {
    console.error("Error deleting Comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
