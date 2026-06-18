FROM node:20-alpine

# Required for Admin Backup: pg_dump + pg_restore
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]