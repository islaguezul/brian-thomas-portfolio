#!/usr/bin/env bash
set -euo pipefail

# Extract video frames as WebP images for the scroll-driven video component.
# Usage: ./scripts/extract-frames.sh <input-video> [fps]
#
# Arguments:
#   input-video  Path to the source video file
#   fps          Frames per second to extract (default: 30)
#
# Output: public/frames/frame_0001.webp through frame_NNNN.webp

if [ $# -lt 1 ]; then
  echo "Usage: $0 <input-video> [fps]"
  echo "Example: $0 input.mp4 30"
  exit 1
fi

INPUT="$1"
FPS="${2:-30}"
OUTPUT_DIR="$(dirname "$0")/../public/frames"

if ! command -v ffmpeg &>/dev/null; then
  echo "Error: ffmpeg is not installed."
  exit 1
fi

if [ ! -f "$INPUT" ]; then
  echo "Error: Input file '$INPUT' not found."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Extracting frames at ${FPS} fps from: $INPUT"
echo "Output directory: $OUTPUT_DIR"

ffmpeg -i "$INPUT" -vf "fps=${FPS}" "$OUTPUT_DIR/frame_%04d.webp"

FRAME_COUNT=$(ls "$OUTPUT_DIR"/frame_*.webp 2>/dev/null | wc -l | tr -d ' ')
echo "Done. Extracted $FRAME_COUNT frames."
