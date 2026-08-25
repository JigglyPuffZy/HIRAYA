from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
SRC_PATH = ASSETS / 'hiraya-logo-source.png'
if not SRC_PATH.exists():
    SRC_PATH = ASSETS / 'hiraya-logo.png'


def content_bbox(img: Image.Image, pad: int = 24):
    pixels = img.load()
    w, h = img.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a < 8:
                continue
            if r > 245 and g > 245 and b > 245:
                continue
            found = True
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)
    if not found:
        raise RuntimeError('No logo content found')
    return (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(w, max_x + pad + 1),
        min(h, max_y + pad + 1),
    )


def main() -> None:
    src = Image.open(SRC_PATH).convert('RGBA')
    print('original', src.size)
    bbox = content_bbox(src)
    print('bbox', bbox)
    cropped = src.crop(bbox)
    print('cropped', cropped.size)

    wide = Image.new('RGBA', cropped.size, (255, 255, 255, 255))
    wide.paste(cropped, (0, 0), cropped)
    wide.save(ASSETS / 'hiraya-logo-wide.png')
    wide.save(ASSETS / 'hiraya-logo.png')
    print('saved hiraya-logo.png / hiraya-logo-wide.png', wide.size)

    side = 1024
    cw, ch = wide.size

    splash = Image.new('RGBA', (side, side), (255, 255, 255, 255))
    scale = (side * 0.82) / cw
    nw, nh = int(cw * scale), int(ch * scale)
    resized = wide.resize((nw, nh), Image.Resampling.LANCZOS)
    splash.paste(resized, ((side - nw) // 2, (side - nh) // 2), resized)
    splash.save(ASSETS / 'hiraya-splash.png')
    print('saved hiraya-splash.png', splash.size)

    scale2 = (side * 0.70) / cw
    nw2, nh2 = int(cw * scale2), int(ch * scale2)
    resized2 = wide.resize((nw2, nh2), Image.Resampling.LANCZOS)

    fg = Image.new('RGBA', (side, side), (255, 255, 255, 0))
    fg.paste(resized2, ((side - nw2) // 2, (side - nh2) // 2), resized2)
    fg.save(ASSETS / 'hiraya-icon-foreground.png')
    print('saved hiraya-icon-foreground.png', fg.size)

    icon = Image.new('RGBA', (side, side), (255, 255, 255, 255))
    icon.paste(resized2, ((side - nw2) // 2, (side - nh2) // 2), resized2)
    icon.save(ASSETS / 'icon.png')
    print('saved icon.png', icon.size)


if __name__ == '__main__':
    main()
