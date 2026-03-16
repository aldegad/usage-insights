#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a lightweight GIF preview from an MP4 example render."
    )
    parser.add_argument("--input", required=True, help="Source MP4 path.")
    parser.add_argument("--output", required=True, help="Destination GIF path.")
    parser.add_argument("--width", type=int, default=920, help="Output width in pixels.")
    parser.add_argument(
        "--fps",
        type=float,
        default=5.0,
        help="Frame sampling rate from the source video.",
    )
    parser.add_argument(
        "--speed",
        type=float,
        default=1.0,
        help="Playback speed multiplier for the exported GIF.",
    )
    parser.add_argument(
        "--start-seconds",
        type=float,
        default=0.0,
        help="Start time inside the source video.",
    )
    parser.add_argument(
        "--max-seconds",
        type=float,
        default=12.0,
        help="Maximum source duration to include in the GIF.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    src = Path(args.input).expanduser().resolve()
    dst = Path(args.output).expanduser().resolve()

    if not src.exists():
        raise FileNotFoundError(f"Input video not found: {src}")

    capture = cv2.VideoCapture(str(src))
    if not capture.isOpened():
        raise RuntimeError(f"Could not open video: {src}")

    input_fps = capture.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    sample_fps = max(args.fps, 0.1)
    speed = max(args.speed, 0.1)
    sample_interval = input_fps / sample_fps
    start_frame = max(0, int(args.start_seconds * input_fps))
    max_frames = int(args.max_seconds * input_fps)
    stop_frame = start_frame + max_frames
    if total_frames > 0:
        stop_frame = min(total_frames, stop_frame)

    frames: list[Image.Image] = []
    frame_index = 0
    next_capture_frame = float(start_frame)
    capture.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

    while True:
        ok, frame = capture.read()
        if not ok:
            break

        absolute_frame_index = start_frame + frame_index
        if absolute_frame_index >= stop_frame:
            break

        if absolute_frame_index + 0.5 >= next_capture_frame:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image = Image.fromarray(rgb)
            scale = args.width / image.width
            resized = image.resize((args.width, int(image.height * scale)), Image.Resampling.LANCZOS)
            frames.append(resized.convert("P", palette=Image.Palette.ADAPTIVE))
            next_capture_frame += sample_interval

        frame_index += 1

    capture.release()

    if not frames:
        raise RuntimeError("No frames were captured for the GIF.")

    dst.parent.mkdir(parents=True, exist_ok=True)
    playback_fps = sample_fps * speed
    duration_ms = max(20, int(round(1000 / playback_fps)))
    frames[0].save(
        dst,
        save_all=True,
        append_images=frames[1:],
        optimize=True,
        duration=duration_ms,
        loop=0,
        disposal=2,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
