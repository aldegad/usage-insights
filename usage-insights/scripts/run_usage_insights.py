#!/usr/bin/env python3

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from create_project import create_project, get_template_root, install_dependencies

WORKSPACE_MARKERS = (
    "package.json",
    "remotion.config.ts",
    "scripts/generate-insights.mjs",
    "src/Root.tsx",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the usage-insights report and render pipeline from the current directory."
    )
    parser.add_argument(
        "--workspace",
        help=(
            "Workspace directory. Defaults to the current directory when it is already "
            "a usage-insights workspace, otherwise uses .usage-insights-workspace in the current directory."
        ),
    )
    parser.add_argument(
        "--mode",
        choices=("report", "poster", "video", "all", "dev"),
        default="all",
        help="Which outputs to generate. Defaults to the full report + poster + video pipeline.",
    )
    parser.add_argument(
        "--force-refresh",
        action="store_true",
        help="Replace an existing generated workspace with a fresh copy of the bundled template.",
    )
    parser.add_argument(
        "--skip-install",
        action="store_true",
        help="Skip npm install when dependencies are not already present.",
    )
    return parser.parse_args()


def is_usage_insights_workspace(path: Path) -> bool:
    return all((path / marker).exists() for marker in WORKSPACE_MARKERS)


def resolve_workspace_path(args: argparse.Namespace, current_dir: Path) -> Path:
    if args.workspace:
        return Path(args.workspace).expanduser().resolve()

    if is_usage_insights_workspace(current_dir):
        return current_dir

    return current_dir / ".usage-insights-workspace"


def ensure_workspace(path: Path, *, force_refresh: bool) -> tuple[Path, bool]:
    if is_usage_insights_workspace(path) and not force_refresh:
        return path, False

    if path.exists() and any(path.iterdir()):
        if not force_refresh and not is_usage_insights_workspace(path):
            raise RuntimeError(
                f"Workspace path exists but is not a usage-insights workspace: {path}\n"
                "Pass --workspace to choose a different directory or remove the existing folder."
            )

    created = create_project(path, force=force_refresh, install=False)
    if not created and not is_usage_insights_workspace(path):
        raise RuntimeError(
            f"Unable to prepare usage-insights workspace at: {path}\n"
            "Use --force-refresh to replace the existing directory."
        )

    return path, created


def ensure_dependencies(path: Path, *, skip_install: bool) -> bool:
    if (path / "node_modules").exists():
        return False

    if skip_install:
        raise RuntimeError(
            "Dependencies are missing in the workspace and --skip-install was provided."
        )

    install_dependencies(path)
    return True


def run_npm_script(path: Path, script: str) -> None:
    subprocess.check_call(["npm", "run", script], cwd=path)


def build_steps_for_mode(mode: str) -> list[str]:
    return ["analyze"]


def print_summary(path: Path, *, created: bool, installed: bool, mode: str) -> None:
    workspace_status = "Created" if created else "Reused"
    install_status = "Installed" if installed else "Reused existing"

    print("")
    print(f"{workspace_status} workspace: {path}")
    print(f"{install_status} dependencies")
    print(f"Template source: {get_template_root()}")
    print("Outputs:")
    print(f"  data:   {path / 'src/data/insights-data.json'}")
    print(f"  report: {path / 'INSIGHTS.md'}")
    print(f"  ts:     {path / 'src/data/usage-insights.generated.ts'}")
    print("")
    print("Narrative fields are empty. The agent should now:")
    print("  1. Read src/data/insights-data.json")
    print("  2. Write narrative (persona, habits, strengths, cautions)")
    print("  3. Update usage-insights.generated.ts and INSIGHTS.md")
    print("  4. Run render commands: npm run render:poster / npm run render:video")


def main() -> int:
    args = parse_args()
    current_dir = Path.cwd().resolve()
    workspace = resolve_workspace_path(args, current_dir)

    try:
        workspace, created = ensure_workspace(
            workspace, force_refresh=args.force_refresh
        )
        installed = ensure_dependencies(workspace, skip_install=args.skip_install)
        for step in build_steps_for_mode(args.mode):
            run_npm_script(workspace, step)
    except (RuntimeError, FileNotFoundError, subprocess.CalledProcessError) as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print_summary(workspace, created=created, installed=installed, mode=args.mode)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
