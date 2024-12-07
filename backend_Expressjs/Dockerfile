FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 3000

# สร้าง entrypoint script สำหรับรันคำสั่งเพิ่มเติม
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# รัน entrypoint script เมื่อเริ่ม Container
ENTRYPOINT ["entrypoint.sh"]