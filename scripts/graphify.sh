#!/usr/bin/env bash

set -euo pipefail

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

if [ $# -eq 0 ]; then
  exec graphify update .
else
  exec graphify "$@"
fi