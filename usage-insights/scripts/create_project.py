#!/usr/bin/env python3

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

GENERATED_RULES = ("INSIGHTS.md", "src/data/usage-insights.generated.ts")
IGNORE_PATTERNS = ("node_modules", "out", "INSIGHTS.md", ".DS_Store")


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


def get_template_root() -> Path:
    skill_root = Path(__file__).resolve().parent.parent
    return skill_root / "assets" / "remotion-template"


def copy_template(destination: Path, *, force: bool = False) -> bool:
    template_root = get_template_root()
    if not template_root.exists():
        print(f"Template directory is missing: {template_root}", file=sys.stderr)
        raise FileNotFoundError(template_root)

    if destination.exists():
        if destination.is_dir() and not any(destination.iterdir()):
            destination.rmdir()
        elif not force:
            return False
        else:
            shutil.rmtree(destination)

    shutil.copytree(
        template_root,
        destination,
        ignore=shutil.ignore_patterns(*IGNORE_PATTERNS),
    )
    return True


def ensure_generated_gitignore_rules(destination: Path) -> None:
    gitignore_path = destination / ".gitignore"
    existing_lines: set[str] = set()

    if gitignore_path.exists():
        existing_lines = set(gitignore_path.read_text().splitlines())

    with gitignore_path.open("a", encoding="utf-8") as handle:
        needs_separator = bool(existing_lines)
        for rule in GENERATED_RULES:
            if rule not in existing_lines:
                if needs_separator:
                    handle.write("\n")
                    needs_separator = False
                handle.write(f"{rule}\n")


def install_dependencies(destination: Path) -> None:
    subprocess.check_call(["npm", "install"], cwd=destination)


def create_project(
    destination: Path, *, force: bool = False, install: bool = False
) -> bool:
    created = copy_template(destination, force=force)
    ensure_generated_gitignore_rules(destination)

    if install:
        install_dependencies(destination)

    return created


def main() -> int:
    args = parse_args()
    destination = Path(args.dest).expanduser().resolve()

    try:
        created = create_project(destination, force=args.force, install=args.install)
    except FileNotFoundError:
        return 1

    if not created:
        print(
            f"Destination already exists: {destination}\n"
            "Use --force to replace it.",
            file=sys.stderr,
        )
        return 1

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
