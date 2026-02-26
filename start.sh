#!/bin/sh
# start.sh — run docker-compose with BuildKit disabled and alternate tmpdir
# Usage: ./start.sh [down]\n#        down  stops and removes containers

if [ "$1" = "down" ]; then
    docker compose down
    exit 0
fi

# Disable BuildKit and use alternate temp directory
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0
export TMPDIR=/var/tmp
export TMPBASE=/var/tmp

# Ensure /var/tmp exists
mkdir -p /var/tmp

docker compose up --build
