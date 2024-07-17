FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=webapp --prod /prod/webapp
RUN pnpm deploy --filter=example --prod /prod/example

FROM ubuntu AS webapp
RUN apt-get update
RUN apt-get install nginx -y
COPY --from=build /prod/webapp/dist /var/www/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

FROM ubuntu AS example
RUN apt-get update
RUN apt-get install nginx -y
COPY --from=build /prod/example/dist /var/www/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]