const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const user = require("../lib/userinfo");

const prisma = new PrismaClient();
async function main() {
  console.log("Seeding initial users...");

  for (const userData of user) {
    try {
      const existingUser = await prisma.user_info.findFirst({
        where: {
          Name: userData.Name,
        },
      });

      if (existingUser) {
        console.log(`User "${userData.Name}" already exists. Skipping.`);
        continue;
      }

      // แฮชรหัสผ่านก่อนบันทึก
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user_info.create({
        data: {
          id: userData.id,
          Name: userData.Name,
          age: userData.age,
          email: userData.email,
          image: userData.image,
          phone: userData.phone,
          role: userData.role,
          password: hashedPassword, // เพิ่มรหัสผ่านที่แฮชแล้ว
        },
      });

      console.log(`User "${userData.Name}" created successfully.`);
    } catch (error) {
      console.error(`Error creating user "${userData.Name}":`, error);
    }
  }

  console.log("Seeding completed.");
}

// เรียกใช้ฟังก์ชัน main และจัดการข้อผิดพลาด
main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
