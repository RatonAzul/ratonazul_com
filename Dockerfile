FROM node:lts AS build

RUN corepack enable

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:PATH"

WORKDIR /app

COPY pnpm-lock.yaml ./

RUN --mount=type=cache,target=/pnpm/store \
    pnpm fetch --frozen-lockfile \

COPY package.json ./

RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --offline

COPY . .

RUN pnpm build

# -------------------

FROM node:lts
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/drizzle.config.ts .
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

EXPOSE 3000
CMD ["node build/index.js"]