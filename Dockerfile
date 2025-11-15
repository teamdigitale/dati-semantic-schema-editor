FROM docker.io/nginxinc/nginx-unprivileged:alpine3.22-perl AS nginx
FROM docker.io/library/node:22-slim AS node

# checkov:skip=CKV_DOCKER_2
# checkov:skip=CKV_DOCKER_3
FROM node AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# checkov:skip=CKV_DOCKER_2
# checkov:skip=CKV_DOCKER_3
FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm --prod --filter=api deploy /prod/api
RUN pnpm --prod --filter=example deploy /prod/example
RUN pnpm --prod --filter=webapp deploy /prod/webapp

# checkov:skip=CKV_DOCKER_2
FROM base AS api
WORKDIR /app
COPY --from=build /prod/api/package.json .
COPY --from=build /prod/api/public ./public
COPY --from=build /prod/api/dist ./dist
COPY --from=build /prod/api/node_modules ./node_modules
EXPOSE 3000
USER 1000

ENV NODE_ENV=production
ENV HOME=/home/node
CMD ["pnpm","start:prod"]

# checkov:skip=CKV_DOCKER_2
FROM nginx AS example
COPY --from=build /prod/example/dist /usr/share/nginx/html
EXPOSE 8080
USER 1000
CMD ["nginx","-g","daemon off;"]

# checkov:skip=CKV_DOCKER_2
FROM nginx AS webapp
COPY --from=build /prod/webapp/dist /usr/share/nginx/html
EXPOSE 8080
USER 1000
CMD ["nginx","-g","daemon off;"]
