#!/bin/bash

# รัน Prisma Migrations
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

# Seed ข้อมูลเบื้องต้น
echo "Seeding database..."
npm run user_seed
npm run list_seed

# เริ่มต้นแอปพลิเคชัน
echo "Starting application..."
npm run start
