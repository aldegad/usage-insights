#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 1280
HEIGHT = 720
FRAME_DURATION_MS = 1200


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


BG = (249, 243, 231)
PANEL = (255, 251, 246)
TEXT = (28, 23, 20)
MUTED = (108, 100, 91)
CORAL = (255, 141, 122)
SKY = (92, 174, 255)
MINT = (102, 201, 162)
BUTTER = (234, 192, 92)
TERMINAL = (29, 32, 37)
TERMINAL_LINE = (227, 235, 244)
GREEN = (111, 207, 151)


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill, radius: int, outline=None):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2 if outline else 1)


def make_frame(title: str, subtitle: str, lines: list[tuple[str, tuple[int, int, int]]], logo: Image.Image) -> Image.Image:
    image = Image.new("RGBA", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(image)

    for i, color in enumerate((BUTTER, CORAL, SKY)):
        x0 = 40 + i * 360
        draw.ellipse((x0, -80, x0 + 260, 180), fill=(*color, 28) if isinstance(color, tuple) else color)

    rounded(draw, (56, 44, WIDTH - 56, HEIGHT - 44), PANEL, 36, outline=(232, 223, 211))
    rounded(draw, (88, 96, 292, 300), (255, 246, 238), 30)
    image.alpha_composite(logo.resize((180, 180)), (100, 108))

    title_font = load_font(62, bold=True)
    subtitle_font = load_font(28)
    chip_font = load_font(24, bold=True)
    terminal_font = load_font(28)

    draw.text((328, 132), title, font=title_font, fill=TEXT)
    draw.text((328, 214), subtitle, font=subtitle_font, fill=MUTED)

    chips = [
        ("Codex + Claude", SKY),
        ("Gemini traces", MINT),
        ("Video export", CORAL),
    ]
    x = 328
    for label, color in chips:
        draw.rounded_rectangle((x, 264, x + 200, 308), radius=22, fill=(255, 255, 255), outline=(*color, 180))
        draw.ellipse((x + 16, 280, x + 32, 296), fill=color)
        draw.text((x + 44, 273), label, font=chip_font, fill=TEXT)
        x += 216

    rounded(draw, (88, 348, WIDTH - 88, HEIGHT - 92), TERMINAL, 28)
    draw.rectangle((88, 390, WIDTH - 88, 392), fill=(70, 78, 88))
    for i, color in enumerate(((255, 157, 143), (255, 211, 110), (130, 215, 184))):
        draw.ellipse((114 + i * 28, 364, 132 + i * 28, 382), fill=color)

    y = 430
    for text, color in lines:
        draw.text((124, y), text, font=terminal_font, fill=color)
        y += 58

    return image.convert("P", palette=Image.ADAPTIVE)


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    media_dir = repo_root / "media"
    logo = Image.open(media_dir / "logo.png").convert("RGBA")

    frames = [
        make_frame(
            "usage-insights",
            "A Codex skill for local AI usage reports and videos.",
            [
                ("$ use $usage-insights to analyze my local AI usage", TERMINAL_LINE),
                ("# Generate a report, inspect project mix, then render visuals", MUTED),
                ("ready", GREEN),
            ],
            logo,
        ),
        make_frame(
            "1. Bootstrap a workspace",
            "Create a reusable project from the bundled template.",
            [
                ("$ python3 usage-insights/scripts/create_project.py --dest ~/usage-insights-project --install", TERMINAL_LINE),
                ("Created usage-insights project at: ~/usage-insights-project", GREEN),
                ("Next: npm run analyze", MUTED),
            ],
            logo,
        ),
        make_frame(
            "2. Generate the analysis",
            "Collect token ledgers and activity traces into a report.",
            [
                ("$ npm run analyze", TERMINAL_LINE),
                ("Wrote INSIGHTS.md", GREEN),
                ("Wrote src/data/usage-insights.generated.ts", GREEN),
            ],
            logo,
        ),
        make_frame(
            "3. Render a poster or MP4",
            "Use Remotion to preview and export the final artifact.",
            [
                ("$ npm run dev", TERMINAL_LINE),
                ("$ npm run render:poster", TERMINAL_LINE),
                ("$ npm run render:video", TERMINAL_LINE),
            ],
            logo,
        ),
    ]

    out_path = media_dir / "install-demo.gif"
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_DURATION_MS,
        loop=0,
        disposal=2,
    )


if __name__ == "__main__":
    main()
