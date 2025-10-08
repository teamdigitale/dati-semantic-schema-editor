FROM docker.io/nginxinc/nginx-unprivileged:alpine3.22-perl AS nginx

# checkov:skip=CKV_DOCKER_2
# checkov:skip=CKV_DOCKER_3
FROM docker.io/library/node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# checkov:skip=CKV_DOCKER_2
# checkov:skip=CKV_DOCKER_3
FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=webapp --prod /prod/webapp
RUN pnpm deploy --filter=example --prod /prod/example

# checkov:skip=CKV_DOCKER_2
FROM nginx AS webapp
COPY --from=build /prod/webapp/dist /usr/share/nginx/html
EXPOSE 8080
USER 1000
CMD ["nginx","-g","daemon off;"]

# checkov:skip=CKV_DOCKER_2
FROM nginx AS example
COPY --from=build /prod/example/dist /usr/share/nginx/html
EXPOSE 8080
USER 1000
CMD ["nginx","-g","daemon off;"]
