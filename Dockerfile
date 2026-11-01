FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 10000 -S ory \
  && adduser -S -D -H -u 10000 -G ory ory
COPY --from=builder --chown=10000:10000 /app/.next/standalone ./
COPY --from=builder --chown=10000:10000 /app/.next/static ./.next/static
COPY --from=builder --chown=10000:10000 /app/public ./public
USER 10000:10000
EXPOSE 3000
# Swarm truyền command một chuỗi. /bin/sh -c nhận đúng chuỗi đó.
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["node server.js"]
