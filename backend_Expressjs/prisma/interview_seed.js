const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const interview = require("../lib/interview");

async function main() {
  console.log("Seeding initial interviews...");

  for (const item of interview) {
    try {
      // ตรวจสอบว่าผู้ใช้ที่เกี่ยวข้องมีอยู่หรือไม่
      const existingUser = await prisma.User_info.findUnique({
        where: { id: item.create_by },
      });

      if (!existingUser) {
        console.error(
          `User ID ${item.create_by} does not exist. Skipping "${item.Title}".`
        );
        continue;
      }

      // ตรวจสอบว่าคอร์สที่มีชื่อและ create_by นี้มีอยู่แล้วหรือไม่
      const existingCourse = await prisma.Interview.findFirst({
        where: {
          Title: item.Title,
          create_by: item.create_by,
        },
      });

      if (existingCourse) {
        console.log(
          `Course "${item.Title}" for user ID ${item.create_by} already exists. Skipping.`
        );
        continue;
      }

      // สร้างข้อมูลคอร์ส
      await prisma.Interview.create({
        data: {
          Title: item.Title,
          detail: item.detail,
          status: item.Status,
          image: item.image,
          create_by: item.create_by,
          update_by: item.create_by,
          user: {
            connect: {
              id: item.create_by,
            },
          },
        },
      });

      console.log(`Course "${item.Title}" created successfully.`);
    } catch (error) {
      console.error(`Error creating course "${item.Title}":`, error);
    }
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
