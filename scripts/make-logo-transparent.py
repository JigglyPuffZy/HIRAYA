"""Strip background from HIRAYA logo — keep only sun + wordmark pixels."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
SRC = ASSETS / 'hiraya-logo-source.png'
if not SRC.exists():
    SRC = ASSETS / 'hiraya-logo.png'


def chroma(r: int, g: int, b: int) -> int:
    return max(r, g, b) - min(r, g, b)


def is_foreground_pixel(r: int, g: int, b: int, a: int) -> bool:
    if a < 12:
        return False

    brightness = (r + g + b) / 3
    saturation = chroma(r, g, b)

    # White / off-white background (older logo exports).
    if r > 248 and g > 248 and b > 248:
        return False

    # Black background (newer logo exports).
    if brightness < 18 and saturation < 25:
        return False

    # Warm orange / red mark pixels.
    return saturation >= 80 or (brightness >= 25 and saturation >= 50)


def content_bbox(img: Image.Image, pad: int = 10):
    pixels = img.load()
    w, h = img.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            if pixels[x, y][3] < 24:
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
    out_pixels = transparent.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if is_foreground_pixel(r, g, b, a):
                out_pixels[x, y] = (r, g, b, 255)

    bbox = content_bbox(transparent)
    cropped = transparent.crop(bbox)
    out = ASSETS / 'hiraya-logo-transparent.png'
    cropped.save(out)
    print('saved', out, cropped.size)


if __name__ == '__main__':
    main()
