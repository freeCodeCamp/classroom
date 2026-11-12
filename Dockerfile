FROM node:26.13.0-bookworm-slim@sha256:add5c17c14752c54d2f3d519ec46a3815684d41c33f198bcb09fb998f7dcbf68 AS deps
WORKDIR /app
ENV HUSKY=0
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
RUN npm install --global pnpm@12.18.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm run challenge-map
RUN pnpm run build && rm -rf .next/cache

FROM node:26.13.0-bookworm-slim@sha256:add5c17c14752c54d2f3d519ec46a3815684d41c33f198bcb09fb998f7dcbf68 AS production
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl tini wget \
  && rm -rf /var/lib/apt/lists/*
RUN groupadd --gid 1001 appgroup \
  && useradd --uid 1001 --gid appgroup --shell /usr/sbin/nologin --create-home appuser
WORKDIR /app
COPY --from=build /app ./
RUN mkdir -p .next/cache && chown appuser:appgroup .next/cache
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
USER appuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1
ENTRYPOINT ["tini", "--"]
CMD ["node", "node_modules/next/dist/bin/next", "start"]
