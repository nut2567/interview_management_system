var express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var router = express.Router();
const { verifyToken, authorize } = require("./middleware/auth");

/* GET home page. */

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/getHistoryList", verifyToken, async function (req, res) {
  const { InterviewId } = req.body;
  const Historys = await prisma.History.findMany({
    where: {
      InterviewId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.History.count({
    where: {
      InterviewId,
    },
  });

  console.log(req.user, Historys);
  if (Historys.length == 0) {
    return res
      .status(200)
      .json({ Historys, message: "list data not found!", total });
  }
  res.json({ Historys, total });
});

router.post("/createHistory", verifyToken, async function (req, res) {
  const { Title, status, detail, InterviewId } = req.body;

  const time = new Date();
  if (!Title || !InterviewId || !status || !detail) {
    return res.status(400).json({
      time,
      message: "Title, status, detail, InterviewId are required",
    });
  }
  try {
    // สร้างรายการใหม่
    const History = await prisma.History.create({
      data: {
        detail,
        Title,
        InterviewId,
        status,
      },
    });

    console.log(req.user, History);

    res.json({ History });
  } catch (error) {
    console.error("Error creating History:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/DeleteHistory", verifyToken, async function (req, res) {
  const { id } = req.body;
  const time = new Date();
  try {
    const deletedHistory = await prisma.History.delete({
      where: {
        id: id,
      },
    });

    res.json({
      message: "History deleted successfully!",
      deletedHistory,
      time,
    });
  } catch (error) {
    console.error("Error deleting History:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
