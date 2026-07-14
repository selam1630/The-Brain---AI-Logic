#!/usr/bin/env python3
"""Transcribe one local audio/video file with faster-whisper and emit JSON."""

import argparse
import json
import sys

from faster_whisper import WhisperModel


def parse_arguments() -> argparse.Namespace:
    """Read the file and model settings supplied by the NestJS adapter."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--language")
    return parser.parse_args()


def main() -> None:
    """Run local transcription and write a stable JSON contract to stdout."""
    arguments = parse_arguments()
    model = WhisperModel(arguments.model, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(
        arguments.file,
        language=arguments.language,
        vad_filter=True,
    )
    text = " ".join(segment.text.strip() for segment in segments).strip()
    print(json.dumps({"text": text}))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # pragma: no cover - surfaced through the NestJS adapter
        print(str(error), file=sys.stderr)
        sys.exit(1)
