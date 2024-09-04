FROM docker.io/nginx:stable-alpine3.19 AS nginx

FROM docker.io/node:20-slim AS base
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

FROM nginx AS webapp
COPY --from=build /prod/webapp/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

FROM nginx AS example
COPY --from=build /prod/example/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
