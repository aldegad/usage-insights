#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 1280
HEIGHT = 420

BG = (249, 243, 231)
PANEL = (255, 251, 246)
INK = (29, 23, 20)
MUTED = (106, 98, 88)
CORAL = (255, 140, 122)
SKY = (88, 174, 255)
MINT = (103, 200, 161)
BUTTER = (255, 209, 113)
LINE_LEFT = (255, 216, 143)
LINE_MID = (255, 168, 150)
LINE_RIGHT = (135, 200, 255)
PANEL_STROKE = (232, 223, 211)


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


def gradient_line(width: int, height: int) -> Image.Image:
    image = Image.new("RGBA", (width, height))
    pixels = image.load()
    for x in range(width):
        t = x / max(width - 1, 1)
        if t < 0.5:
            local = t / 0.5
            color = tuple(
                int(LINE_LEFT[i] + (LINE_MID[i] - LINE_LEFT[i]) * local) for i in range(3)
            )
        else:
            local = (t - 0.5) / 0.5
            color = tuple(
                int(LINE_MID[i] + (LINE_RIGHT[i] - LINE_MID[i]) * local) for i in range(3)
            )
        for y in range(height):
            pixels[x, y] = (*color, 170)
    return image


def draw_chip(draw: ImageDraw.ImageDraw, x: int, y: int, width: int, label: str, dot, outline) -> None:
    draw.rounded_rectangle((x, y, x + width, y + 52), radius=26, fill=(255, 255, 255), outline=outline, width=2)
    draw.ellipse((x + 24, y + 18, x + 44, y + 38), fill=dot)
    font = load_font(22, bold=True)
    draw.text((x + 60, y + 12), label, font=font, fill=(63, 76, 89))


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    media_dir = repo_root / "media"
    logo = Image.open(media_dir / "logo.png").convert("RGBA").resize((182, 182))

    image = Image.new("RGBA", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle((36, 22, WIDTH - 36, HEIGHT - 22), radius=42, fill=(244, 235, 216))
    draw.rounded_rectangle((90, 58, WIDTH - 90, HEIGHT - 58), radius=34, fill=PANEL, outline=PANEL_STROKE, width=2)

    line = gradient_line(1020, 10)
    image.alpha_composite(line, (128, 114))

    for i, color in enumerate((CORAL, BUTTER, MINT)):
        draw.ellipse((142 + i * 30, 174, 162 + i * 30, 194), fill=color)

    image.alpha_composite(logo, (150, 215))

    title_font = load_font(64, bold=True)
    subtitle_font = load_font(24)

    draw.text((438, 176), "usage-insights", font=title_font, fill=INK)
    draw.text(
        (438, 270),
        "Analyze local AI usage, generate reports, and render videos.",
        font=subtitle_font,
        fill=MUTED,
    )

    draw_chip(draw, 438, 332, 232, "Codex + Claude", SKY, (183, 216, 250))
    draw_chip(draw, 688, 332, 220, "Gemini traces", MINT, (184, 230, 209))
    draw_chip(draw, 926, 332, 310, "Optional Remotion MP4", CORAL, (246, 208, 194))

    image.save(media_dir / "banner.png")


if __name__ == "__main__":
    main()
