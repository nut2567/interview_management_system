var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const rateLimit = require("express-rate-limit");

const cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");
const commentRouter = require("./routes/comment");
const historyRouter = require("./routes/history");

var app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // อนุญาตให้โดเมนนี้เข้าถึง
    methods: ["get", "post", "put", "delete"], // วิธีที่อนุญาต
    credentials: true, // ถ้าคุณต้องการส่ง cookies หรือ HTTP Auth
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  handler: (req, res, next) => {
    console.log("Rate limit exceeded for:", req.ip);
    res
      .status(429)
      .json({ message: "Too many login attempts, please try again later." });
  },
  keyGenerator: (req, res) => {
    // ใช้ IP รวมกับเส้นทาง (path) เป็น key
    return `${req.ip}-${req.originalUrl}`;
  },
});

// จำกัดทั่วไปสำหรับทุก API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100, // จำกัด 100 requests ต่อ 15 นาที
  message: "Too many requests, please try again later.",
  keyGenerator: (req, res) => {
    // ใช้ IP รวมกับเส้นทาง (path) เป็น key
    return `${req.ip}-${req.originalUrl}`;
  },
});

// จำกัดเฉพาะเส้นทางล็อกอิน
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 นาที
  max: 15, // จำกัด 15 requests ต่อ 5 นาที
  message: "Too many login attempts, please try again later.",
});

app.use("/", limiter);
app.use("/login", loginLimiter);
app.get("/users", loginLimiter);
app.use("/comment", globalLimiter);
app.use("/history", globalLimiter);
// app.use("/login", limiter);

app.use("/", indexRouter);
app.get("/users", usersRouter);
app.use("/login", loginRouter);
app.use("/comment", commentRouter);
app.use("/history", historyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
