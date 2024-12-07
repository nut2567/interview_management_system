var express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var router = express.Router();
const { verifyToken, authorize } = require("./middleware/auth");

/* GET home page. */

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/getCommentList", verifyToken, async function (req, res) {
  const { InterviewId } = req.body;
  const Comments = await prisma.Comment.findMany({
    where: {
      InterviewId,
      user_id: req.user.userInfo.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.Comment.count({
    where: { InterviewId, user_id: req.user.userInfo.id },
  });

  console.log(req.user, Comments);
  if (Comments.length == 0) {
    return res
      .status(200)
      .json({ Comments, message: "list data not found!", total });
  }
  res.json({ Comments, total });
});

router.get("/getCommentById", verifyToken, async function (req, res) {
  const { id, InterviewId } = req.body;
  let Comment = await prisma.Comment.findFirst({
    where: {
      id,
      InterviewId,
      user_id: req.user.userInfo.id,
    },
  });

  console.log(req.user, Comment);
  if (Comment) {
    res.json({ Comment });
  } else {
    Comment = Comment ?? {};
    return res.status(200).json({ Comment, message: "data not found!" });
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
  const { id, content } = req.body;

  const time = new Date();
  if (!content && !id) {
    return res.status(400).json({
      time,
      message: "content Comment ID is required",
    });
  }

  const existingcomment = await prisma.comment.findFirst({
    where: {
      id: id,
      user_id: req.user.userInfo.id,
    },
  });
  console.log(existingcomment);
  if (!existingcomment) {
    return res.status(400).json({
      time,
      message: "ผู้ใช้นี้ไม่ได้เป็นเจ้าของความคิดเห็น",
    });
  }

  if (existingcomment.content == content) {
    return res.status(400).json({
      time,
      message: "ความคิดเห็นเดิมแก้ไขหรือเปลี่ยนแปลงก่อนบันทึก",
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
        InterviewId: existingcomment.InterviewId,
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
    const comment = await prisma.comment.findFirst({
      where: {
        id: id,
        user_id: req.user.userInfo.id,
      },
    });

    if (!comment) {
      return res
        .status(404)
        .json({ message: "ผู้ใช้นี้ไม่ได้เป็นเจ้าของความคิดเห็น", time });
    }
    const deletedcomment = await prisma.comment.delete({
      where: {
        id: id,
        user_id: req.user.userInfo.id,
      },
    });

    res.json({
      message: "Comment deleted successfully!",
      deletedcomment,
      time,
    });
  } catch (error) {
    console.error("Error deleting Comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
