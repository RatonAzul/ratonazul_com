FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=2048" pnpm build

FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/drizzle.config.ts .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
EXPOSE 3000
CMD ["./entrypoint.sh"]