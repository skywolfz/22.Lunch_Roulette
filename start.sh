#!/bin/sh
# start.sh — run docker-compose with BuildKit disabled
# Fixes the metadata file error on some Docker installations

export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

docker compose up --build
