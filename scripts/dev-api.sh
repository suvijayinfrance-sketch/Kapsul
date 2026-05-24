#!/bin/sh
# Apple Silicon: system Python is often universal (x86_64 under Rosetta/npm).
# pymupdf wheels are arm64-only; uvicorn --reload spawns a child that can pick x86_64.
# Use a project venv created with native arm64 Python so parent and reload worker match.
set -e
cd "$(dirname "$0")/.." || exit 1

VENV=".venv"
PY="$VENV/bin/python"

bootstrap_venv() {
  echo "Creating arm64 virtualenv in $VENV ..."
  if [ "$(uname -s)" = "Darwin" ] && [ "$(uname -m)" = "arm64" ]; then
    arch -arm64 python3 -m venv "$VENV"
  else
    python3 -m venv "$VENV"
  fi
  "$PY" -m pip install --upgrade pip
  "$PY" -m pip install -r requirements.txt
  echo "Done. Dependencies installed."
}

if [ ! -x "$PY" ]; then
  bootstrap_venv
elif ! "$PY" -c "import fitz" 2>/dev/null; then
  echo "Repairing venv (pymupdf/arch mismatch) ..."
  rm -rf "$VENV"
  bootstrap_venv
fi

exec "$PY" -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload "$@"
