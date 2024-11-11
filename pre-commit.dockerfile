#
# Self-baked pre-commit docker image.
#

# checkov:skip=CKV_DOCKER_2: HEALTHCHECK is not required.
FROM python:3
RUN useradd noop -m
USER noop
RUN  pip3 --no-cache-dir install --user \
    tox==4.3.5 \
    pre-commit==3.0.0
ENTRYPOINT ["/home/noop/.local/bin/pre-commit", "run", "-a"]
