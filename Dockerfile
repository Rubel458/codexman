FROM node:20-alpine

RUN apk add --no-cache postgresql-client
WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN mkdir -p /app/storage/uploads /app/storage/downloads /app/storage/backups
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3010
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]


# FROM node:20-alpine

# # Required for Admin Backup: pg_dump + pg_restore
# RUN apk add --no-cache postgresql-client

# WORKDIR /app

# COPY package*.json ./
# COPY prisma ./prisma

# RUN npm install

# COPY . .

# RUN npx prisma generate

# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "start"]