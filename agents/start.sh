#!/bin/bash
cd "$(dirname "$0")"

PYTHON=$(command -v python3.12 || command -v python3.13 || command -v python3.11)

if [ -z "$PYTHON" ]; then
  echo "Error: Python 3.11-3.13 required (3.14 not yet supported by pydantic)"
  exit 1
fi

echo "Using: $PYTHON"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  "$PYTHON" -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
python main.py
