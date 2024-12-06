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
      status: {
        not: "Save",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.Interview.count({
    where: {
      status: {
        not: "Save",
      },
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

  const interview = await prisma.Interview.findFirst({
    where: {
      AND: [
        {
          status: {
            not: "Save",
          },
        },
        {
          id: id,
        },
      ],
    },
  });

  console.log(req.user, interview);
  if (interview && interview.status !== "Save") {
    res.json({ interview });
  } else {
    return res.status(204).json({ interview, message: "data not found!" });
  }
});

module.exports = router;
