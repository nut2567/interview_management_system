var express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var router = express.Router();
const { verifyToken, authorize } = require("./middleware/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get(
  "/getInterviewList/:limit",
  verifyToken,
  authorize(["admin,HR"]),
  async function (req, res) {
    const limit = parseInt(req.params.limit) || 3;
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
      take: limit,
    });

    const total = await prisma.Interview.count({
      where: {
        active: {
          not: "Save",
        },
        user_id: req.user.userInfo.id,
      },
    });

    console.log(req.user, interviews);
    if (interviews.length == 0) {
      return res
        .status(200)
        .json({ interviews, message: "list data not found!", total });
    }
    res.json({ interviews, total });
  }
);

router.get("/getInterviewById", verifyToken, async function (req, res) {
  const { id } = req.body;
  let interview = await prisma.Interview.findFirst({
    where: {
      active: {
        not: "Save",
      },
      id: id,
      user_id: req.user.userInfo.id,
    },
    include: {
      user:
        // true
        {
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
      Comment: true,
      History: true,
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

  const time = new Date();
  if (!Title || !status || !detail) {
    return res.status(400).json({
      time,
      message: " Title, status, detail are required",
    });
  }
  // ตรวจสอบว่ามี Title สำหรับ userId นี้อยู่แล้วหรือไม่
  const existingPost = await prisma.Interview.findFirst({
    where: {
      Title: Title, // ค้นหาชื่อที่ "ตรงกัน"
      user_id: req.user.userInfo.id, // เฉพาะผู้ใช้ที่เกี่ยวข้อง
    },
  });
  console.log(existingPost);
  if (existingPost) {
    return res.status(400).json({
      time,
      message: "ผู้ใช้นี้มีชื่อรายการนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น",
    });
  }
  try {
    // สร้างรายการใหม่
    const interview = await prisma.Interview.create({
      data: {
        Title,
        image,
        user_id: req.user.userInfo.id,
        detail,
        status,
        active: "y",
      },
    });

    console.log(req.user, interview);

    // ตรวจสอบสถานะก่อนตอบกลับ
    if (interview && interview.status !== "Save") {
      res.json({ interview });
    } else {
      res.status(200).json({ interview, message: "data not found!" });
    }
  } catch (error) {
    console.error("Error creating interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updateInterview", verifyToken, async function (req, res) {
  const { id, Title, status, detail, image } = req.body; // เพิ่ม `id` เพื่อระบุข้อมูลที่ต้องอัปเดต

  if (!id) {
    return res.status(400).json({ message: "Interview ID is required!" });
  }

  const time = new Date();
  if (!Title || !status || !detail) {
    return res.status(400).json({
      time,
      message: "Title, status, or detail are required",
    });
  }

  try {
    // ตรวจสอบว่าข้อมูลที่จะอัปเดตมีอยู่ในฐานข้อมูลหรือไม่
    const existingInterview = await prisma.Interview.findFirst({
      where: {
        id: id,
        user_id: req.user.userInfo.id, // ตรวจสอบว่าผู้ใช้นี้เป็นเจ้าของ
      },
    });

    if (!existingInterview) {
      return res.status(404).json({
        time,
        message: "ผู้ใช้นี้ไม่มีชื่อรายการนี้อยู่หรือไม่มีสิทธิแก้ไข",
      });
    }

    // ตรวจสอบว่าชื่อใหม่ซ้ำกับรายการอื่นหรือไม่
    const duplicateTitle = await prisma.Interview.findFirst({
      where: {
        Title: Title,
        user_id: req.user.userInfo.id,
        NOT: { id: id }, // ยกเว้นรายการนี้เอง
      },
    });

    if (duplicateTitle) {
      return res.status(400).json({
        time,
        message: "ผู้ใช้นี้มีชื่อรายการนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น",
      });
    }

    // อัปเดตข้อมูล
    const updatedInterview = await prisma.Interview.update({
      where: {
        id: id,
      },
      data: {
        Title,
        image: image || existingInterview.image,
        detail,
        status,
        updatedAt: time,
      },
    });

    await addHistory(existingInterview);
    res.json({
      message: "Interview updated successfully!",
      updatedInterview,
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

async function addHistory({ Title, status, detail, id }) {
  try {
    // สร้างรายการใหม่
    const History = await prisma.History.create({
      data: {
        detail,
        Title,
        InterviewId: id,
        status,
      },
    });
    console.log(req.user, History);
  } catch (error) {
    console.error("Error creating History:", error);
  }
}

router.delete("/DeleteInterview", verifyToken, async function (req, res) {
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
        .json({ message: "Interview ID not found for this user!", time });
    }

    // ลบ interview
    const deletedInterview = await prisma.Interview.delete({
      where: {
        id: id,
      },
    });

    res.json({
      message: "Interview deleted successfully!",
      deletedInterview,
      time,
    });
  } catch (error) {
    console.error("Error deleting interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updateInterviewActive", verifyToken, async function (req, res) {
  const { id } = req.body; // เพิ่ม `id` เพื่อระบุข้อมูลที่ต้องอัปเดต

  if (!id) {
    return res.status(400).json({ message: "Interview ID is required!" });
  }

  const time = new Date();
  try {
    // ตรวจสอบว่าข้อมูลที่จะอัปเดตมีอยู่ในฐานข้อมูลหรือไม่
    const existingInterview = await prisma.Interview.findFirst({
      where: {
        id: id,
        user_id: req.user.userInfo.id, // ตรวจสอบว่าผู้ใช้นี้เป็นเจ้าของ
      },
    });

    if (!existingInterview) {
      return res.status(404).json({
        time,
        message: "ผู้ใช้นี้ไม่มีชื่อรายการนี้อยู่หรือไม่มีสิทธิแก้ไข",
      });
    }

    // อัปเดตข้อมูล
    const updatedInterview = await prisma.Interview.update({
      where: {
        id: id,
      },
      data: {
        active: "Save",
        updatedAt: time,
      },
    });
    res.json({
      message: "Interview updated successfully!",
      updatedInterview,
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
