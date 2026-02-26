#!/bin/sh
# start.sh — run docker-compose with BuildKit disabled
# Usage: ./start.sh [down]
#        down  stops and removes containers

if [ "$1" = "down" ]; then
    docker compose down
    exit 0
fi

export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

docker compose up --build
