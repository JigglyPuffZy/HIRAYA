"""Strip white / soft glow background from HIRAYA logo for in-app use."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
SRC = ASSETS / 'hiraya-logo-source.png'
if not SRC.exists():
    SRC = ASSETS / 'hiraya-logo.png'


def alpha_for_pixel(r: int, g: int, b: int, a: int) -> int:
    if a < 8:
        return 0

    brightness = (r + g + b) / 3
    saturation = max(r, g, b) - min(r, g, b)

    # Pure / near-white background
    if r > 246 and g > 246 and b > 246:
        return 0

    # Soft white-peach glow around the mark
    if brightness > 215 and saturation < 55:
        fade = int((248 - brightness) * 14)
        return max(0, min(255, fade))

    # Very pale fringe pixels
    if brightness > 185 and saturation < 35:
        fade = int((230 - brightness) * 10)
        return max(0, min(255, fade))

    return 255


def content_bbox(img: Image.Image, pad: int = 16):
    pixels = img.load()
    w, h = img.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            _, _, _, a = pixels[x, y]
            if a < 24:
                continue
            found = True
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)
    if not found:
        raise RuntimeError('No visible logo pixels after transparency pass')
    return (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(w, max_x + pad + 1),
        min(h, max_y + pad + 1),
    )


def main() -> None:
    src = Image.open(SRC).convert('RGBA')
    pixels = src.load()
    w, h = src.size
    transparent = Image.new('RGBA', (w, h), (0, 0, 0, 0))

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            alpha = alpha_for_pixel(r, g, b, a)
            if alpha > 0:
                transparent.putpixel((x, y), (r, g, b, alpha))

    bbox = content_bbox(transparent)
    cropped = transparent.crop(bbox)
    out = ASSETS / 'hiraya-logo-transparent.png'
    cropped.save(out)
    print('saved', out, cropped.size)


if __name__ == '__main__':
    main()
