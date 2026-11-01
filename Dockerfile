FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
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
RUN apk add --no-cache wget \
  && addgroup -g 10000 -S app \
  && adduser -S -u 10000 -G app app
COPY --from=build --chown=10000:10000 /app/.next/standalone ./
COPY --from=build --chown=10000:10000 /app/.next/static ./.next/static
COPY --from=build --chown=10000:10000 /app/public ./public
USER 10000:10000
EXPOSE 3000
ENTRYPOINT ["node", "server.js"]
