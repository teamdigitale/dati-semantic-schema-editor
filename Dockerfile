FROM node:20.11.0-alpine3.19

COPY . /app
WORKDIR /app
RUN npm i -g pnpm
RUN pnpm install
RUN pnpm build
ENTRYPOINT ["pnpm", "--filter", "@italia/schema-editor", "start"]
