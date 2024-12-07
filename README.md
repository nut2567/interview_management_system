# interview_management_system

### การเริ่มต้นใช้งาน

ทำตามขั้นตอนเหล่านี้เพื่อเซ็ตอัพและรันโปรเจกต์ในเครื่องของคุณ

1. Clone Repository
   -> git clone https://github.com/nut2567/interview_management_system

2. รัน PostgreSQL ด้วย Docker
   ให้แน่ใจว่า Docker เปิดใช้งานในเครื่องของคุณก่อนที่จะทำขั้นตอนนี้
   -> docker-compose up --build -d
   คำสั่งนี้จะทำการเริ่มต้น PostgreSQL container,express api บนเครื่องของคุณ ตรวจสอบว่า Docker Desktop หรือเครื่องมือที่ใช้ในการรัน Docker ทำงานอยู่

3. ใช้ Prisma Migrations
   รันคำสั่ง Prisma เพื่อสร้าง schema ของฐานข้อมูล:
   -> npx prisma migrate dev --name init
   หากคุณไม่ต้องการรัน migration แต่แค่ต้องการสร้าง Prisma models ให้ใช้คำสั่งนี้แทน:
   -> npx peisma generate
   (แบบไม่ migrate)

4. Seed ข้อมูลเบื้องต้น
   เพิ่มข้อมูลเบื้องต้นลงในฐานข้อมูลโดยใช้คำสั่งต่อไปนี้:
   -> npm run user_seed
   เพิ่มข้อมูล user เบื้องต้น ข้อมูลตามไฟล lib/userinfo.ts
   -> npm run list_seed
   เพิ่มข้อมูล courses เบื้องต้น ข้อมูลตามไฟล lib/courses_seed.ts
   ตรวจสอบฐานข้อมูลถ้าไม่ติดอะไรจะได้ข้อมูลเพื่อใช้กับหน้าเว็บแล้ว
   หรือ npm run seed

5. เปิดเว็บ [http://localhost:3000](http://localhost:3000) บนเบราว์เซอร์ของคุณเพื่อทดสอบผลลัพธ์
   หรือใช้ไฟล์ [text](thunder-collection_postman_interview_management_system.json) ทดสอบ เรียกใช้งาน api service
