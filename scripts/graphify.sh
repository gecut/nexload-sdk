#!/usr/bin/env bash

set -euo pipefail

set -a
source .env
set +a

exec graphify extract . --backend openai --ignore .graphifyignore --token-budget 4000 "$@"
