FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY nest-cli.json tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:16-alpine AS production

WORKDIR /app

RUN npm install --global pm2@5.4.3

COPY package*.json ./
RUN npm pkg delete devDependencies \
    && npm install --omit=dev --omit=optional \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY ecosystem.config.js ./

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]
