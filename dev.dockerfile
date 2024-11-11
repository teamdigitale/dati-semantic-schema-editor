#
# A dockerfile for development environment.
# The executing container should mount the local
#   development directory.
#
# checkov:skip=CKV_DOCKER_2
# checkov:skip=CKV_DOCKER_3
FROM docker.io/node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
EXPOSE 80
