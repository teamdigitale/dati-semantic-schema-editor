#
# A dockerfile for development environment.
# The executing container should mount the local
#   development directory.
#
# * Don't need HEALTHCHECK for development container.
# trivy:ignore:DS026
# checkov:skip=CKV_DOCKER_2
# * Don't need USER for development container.
# checkov:skip=CKV_DOCKER_3
FROM docker.io/node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
USER node
EXPOSE 80
