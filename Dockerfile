FROM node:lts-alpine AS builder
WORKDIR /app

RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm fetch --frozen-lockfile

RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --offline

COPY . .
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# -------------------
FROM node:lts-alpine
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/drizzle.config.ts .
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh
EXPOSE 3000
CMD ["./entrypoint.sh"]