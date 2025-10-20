FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm install

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY . .

RUN npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npm run build && npx prisma migrate deploy && node --loader ./loader.mjs dist/src/server.js"]
