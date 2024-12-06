const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Secret key สำหรับการ sign token
const secretKey = 'P@55w0rD';
const users = [{username:"admin", password:'1234'}]
// POST /users/login

router.post('/login', function (req, res) {
  const { username, password } = req.body;

  // ค้นหาผู้ใช้จาก mock data
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // สร้าง JWT token โดยใส่ข้อมูลผู้ใช้ลงใน token
    const token = jwt.sign({ userInfo: user }, secretKey, { expiresIn: '1h' });

    // ส่ง token และข้อมูลผู้ใช้กลับไปที่ client
    res.json({ message: 'Login successful', token: token });
  } else {
    // กรณี username หรือ password ไม่ถูกต้อง
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// ฟังก์ชันตรวจสอบ JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // แยก Bearer และ token
  console.log(token)

  if (!token) return res.status(403).json({ message: 'No token provided.' });

  jwt.verify(token, secretKey, function (err, decoded) {
    console.log(err)
    if (err) {
      // ตรวจสอบประเภทของข้อผิดพลาด
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired!' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: 'Invalid token!' });
      } else if (err.name === 'NotBeforeError') {
        return res.status(403).json({ message: 'Token not active yet!' });
      } else {
        return res.status(403).json({ message: 'Failed to authenticate token!' });
      }
    }
    // หาก token ถูกต้อง สามารถดึงข้อมูลจาก token มาใช้งานต่อได้
    console.log(decoded)
    req.user = decoded.userInfo.username;
    next();
  });
}

router.get('/profile', verifyToken, function (req, res) {

  // ค้นหาผู้ใช้จาก mock data
  const user = users.find(u => u.username === req.user);
  console.log(req.user)
  if (!user) {
    return res.status(404).json({ message: 'User not found!' });
  }
  res.json(user);
});




module.exports = router;
