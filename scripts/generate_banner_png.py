#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 1280
HEIGHT = 460

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
BRAND_PANEL = (255, 244, 235)


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


def measure_text(draw: ImageDraw.ImageDraw, text: str, font) -> int:
    left, _, right, _ = draw.textbbox((0, 0), text, font=font)
    return right - left


def draw_chip(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    width: int,
    label: str,
    dot,
    outline,
    font,
) -> None:
    draw.rounded_rectangle((x, y, x + width, y + 52), radius=26, fill=(255, 255, 255), outline=outline, width=2)
    draw.ellipse((x + 24, y + 18, x + 44, y + 38), fill=dot)
    draw.text((x + 60, y + 12), label, font=font, fill=(63, 76, 89))


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    media_dir = repo_root / "media"
    logo = Image.open(media_dir / "logo.png").convert("RGBA").resize((150, 150))

    image = Image.new("RGBA", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(image)

    outer = (36, 24, WIDTH - 36, HEIGHT - 24)
    inner = (96, 62, WIDTH - 96, HEIGHT - 62)
    brand = (126, 94, 348, HEIGHT - 94)
    content_x = 398

    draw.rounded_rectangle(outer, radius=44, fill=(244, 235, 216))
    draw.rounded_rectangle(inner, radius=36, fill=PANEL, outline=PANEL_STROKE, width=2)
    draw.rounded_rectangle(brand, radius=30, fill=BRAND_PANEL)

    line = gradient_line(1020, 10)
    image.alpha_composite(line, (130, 114))

    for i, color in enumerate((CORAL, BUTTER, MINT)):
        draw.ellipse((148 + i * 34, 188, 170 + i * 34, 210), fill=color)

    eyebrow_font = load_font(22, bold=True)
    draw.text((146, 136), "Usage Insights", font=eyebrow_font, fill=(137, 113, 92))
    draw.text((146, 166), "Codex skill", font=load_font(18), fill=(160, 142, 125))
    image.alpha_composite(logo, (160, 218))

    title_font = load_font(62, bold=True)
    subtitle_font = load_font(24)
    meta_font = load_font(18, bold=True)

    draw.text((content_x, 136), "Analyze local AI usage", font=meta_font, fill=(135, 113, 92))
    draw.text((content_x, 182), "usage-insights", font=title_font, fill=INK)
    draw.text(
        (content_x, 274),
        "Generate reports, summarize project patterns,",
        font=subtitle_font,
        fill=MUTED,
    )
    draw.text(
        (content_x, 306),
        "and render shareable videos from local history.",
        font=subtitle_font,
        fill=MUTED,
    )

    chip_y = 356
    chip_gap = 16
    chip_area_x = content_x
    chip_area_width = inner[2] - content_x - 54
    chip_labels = [
        ("Codex + Claude", SKY, (183, 216, 250)),
        ("Gemini traces", MINT, (184, 230, 209)),
        ("Remotion video", CORAL, (246, 208, 194)),
    ]

    chip_font_size = 18
    chip_font = load_font(chip_font_size, bold=True)
    chip_widths = [
        measure_text(draw, label, chip_font) + 74 for label, _, _ in chip_labels
    ]
    total_chip_width = sum(chip_widths) + chip_gap * (len(chip_widths) - 1)

    while total_chip_width > chip_area_width and chip_font_size > 15:
        chip_font_size -= 1
        chip_font = load_font(chip_font_size, bold=True)
        chip_widths = [
            measure_text(draw, label, chip_font) + 70 for label, _, _ in chip_labels
        ]
        total_chip_width = sum(chip_widths) + chip_gap * (len(chip_widths) - 1)

    chip_x = chip_area_x
    for (label, dot, outline), width in zip(chip_labels, chip_widths):
        draw_chip(draw, chip_x, chip_y, width, label, dot, outline, chip_font)
        chip_x += width + chip_gap

    image.save(media_dir / "banner.png")


if __name__ == "__main__":
    main()
