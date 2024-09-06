#
# A dockerfile for development environment.
# The executing container should mount the local
#   development directory.
#
FROM docker.io/node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
EXPOSE 80
