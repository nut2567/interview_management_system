# เลือก Node.js เวอร์ชัน 20
FROM node:20

# ตั้ง working directory ภายใน container
WORKDIR /app

# คัดลอกไฟล์ package.json และ lock file
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์โปรเจกต์ทั้งหมด
COPY . .

# Build โปรเจกต์ Vite (เพิ่มขั้นตอนนี้ถ้าเป็น frontend)
RUN npm run build

# รันคำสั่งเพื่อเริ่มเซิร์ฟเวอร์
CMD ["npx", "serve", "-s", "dist", "-l", "5000"]

