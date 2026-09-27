FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate --config ./prisma.config.ts

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --config ./prisma.config.ts && npm run start:prod"]