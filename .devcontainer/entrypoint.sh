#!/bin/sh
set -e

dockerd &

while (! docker info >/dev/null 2>&1); do
  sleep 1
done

docker info

exec "$@"
