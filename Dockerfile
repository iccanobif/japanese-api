# Multi-stage build for the Japanese API

# Builder: install deps and compile TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Runner: run only compiled JavaScript plus required runtime assets
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json /app/yarn.lock ./
RUN yarn install --frozen-lockfile --production=true
COPY --from=builder /app/build ./build
COPY --from=builder /app/datasets ./datasets
COPY --from=builder /app/views ./views
COPY --from=builder /app/src/integrated-dictionary ./src/integrated-dictionary
# copy entrypoint
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
EXPOSE 8085
CMD ["./entrypoint.sh"]
