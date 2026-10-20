#!/usr/bin/env bash
# Builds the APRÓBETŰ intro: synthesises the sound design, renders the frames, encodes the MP4.
#   ./render.sh                         uses assets/logo.svg or assets/logo.png (placeholder if missing)
#   ./render.sh --logo path/to/logo.png
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output/build
python3 intro/audio.py output/build/sound.wav
node intro/render.js --audio output/build/sound.wav "$@"
