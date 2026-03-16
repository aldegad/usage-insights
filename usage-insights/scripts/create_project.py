#!/usr/bin/env python3

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a reusable usage-insights workspace from the bundled template."
    )
    parser.add_argument(
        "--dest",
        default="usage-insights-project",
        help="Destination directory for the generated project.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite the destination if it already exists.",
    )
    parser.add_argument(
        "--install",
        action="store_true",
        help="Run npm install after copying the template.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    skill_root = Path(__file__).resolve().parent.parent
    template_root = skill_root / "assets" / "remotion-template"
    destination = Path(args.dest).expanduser().resolve()

    if not template_root.exists():
        print(f"Template directory is missing: {template_root}", file=sys.stderr)
        return 1

    if destination.exists():
        if not args.force:
            print(
                f"Destination already exists: {destination}\n"
                "Use --force to replace it.",
                file=sys.stderr,
            )
            return 1

        shutil.rmtree(destination)

    shutil.copytree(
        template_root,
        destination,
        ignore=shutil.ignore_patterns("node_modules", "out", "INSIGHTS.md", ".DS_Store"),
    )

    gitignore_path = destination / ".gitignore"
    generated_rules = ["INSIGHTS.md", "src/data/usage-insights.generated.ts"]
    existing_lines: set[str] = set()

    if gitignore_path.exists():
        existing_lines = set(gitignore_path.read_text().splitlines())

    with gitignore_path.open("a", encoding="utf-8") as handle:
        needs_separator = bool(existing_lines)
        for rule in generated_rules:
            if rule not in existing_lines:
                if needs_separator:
                    handle.write("\n")
                    needs_separator = False
                handle.write(f"{rule}\n")

    if args.install:
        subprocess.check_call(["npm", "install"], cwd=destination)

    print(f"Created usage-insights project at: {destination}")
    print("Next steps:")
    print(f"  cd {destination}")
    if not args.install:
        print("  npm install")
    print("  npm run analyze")
    print("  npm run dev")
    print("  npm run render:poster")
    print("  npm run render:video")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
