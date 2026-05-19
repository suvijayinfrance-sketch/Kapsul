#!/bin/sh
# On Apple Silicon, npm may invoke x86_64 Python while pymupdf is arm64 — force native arch.
cd "$(dirname "$0")/.." || exit 1
if [ "$(uname -s)" = "Darwin" ] && [ "$(uname -m)" = "arm64" ]; then
  exec arch -arm64 python3 -m uvicorn server:app --port 8000 --reload "$@"
fi
exec python3 -m uvicorn server:app --port 8000 --reload "$@"
