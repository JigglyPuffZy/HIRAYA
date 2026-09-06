from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
TRANSPARENT_PATH = ASSETS / 'hiraya-logo-transparent.png'
SRC_PATH = ASSETS / 'hiraya-logo-source.png'
if not SRC_PATH.exists():
    SRC_PATH = ASSETS / 'hiraya-logo.png'

SPLASH_BG = (255, 255, 255, 255)
ICON_BG = (255, 255, 255, 255)


def load_logo() -> Image.Image:
    if TRANSPARENT_PATH.exists():
        return Image.open(TRANSPARENT_PATH).convert('RGBA')
    return Image.open(SRC_PATH).convert('RGBA')


def main() -> None:
    logo = load_logo()
    print('logo', logo.size)

    logo.save(ASSETS / 'hiraya-logo.png')
    logo.save(ASSETS / 'hiraya-logo-wide.png')
    print('saved hiraya-logo.png / hiraya-logo-wide.png', logo.size)

    side = 1024
    cw, ch = logo.size

    splash = Image.new('RGBA', (side, side), SPLASH_BG)
    scale = (side * 0.84) / cw
    nw, nh = int(cw * scale), int(ch * scale)
    resized = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    splash.paste(resized, ((side - nw) // 2, (side - nh) // 2), resized)
    splash.save(ASSETS / 'hiraya-splash.png')
    print('saved hiraya-splash.png', splash.size)

    scale2 = (side * 0.72) / cw
    nw2, nh2 = int(cw * scale2), int(ch * scale2)
    resized2 = logo.resize((nw2, nh2), Image.Resampling.LANCZOS)

    fg = Image.new('RGBA', (side, side), (255, 255, 255, 0))
    fg.paste(resized2, ((side - nw2) // 2, (side - nh2) // 2), resized2)
    fg.save(ASSETS / 'hiraya-icon-foreground.png')
    print('saved hiraya-icon-foreground.png', fg.size)

    icon = Image.new('RGBA', (side, side), ICON_BG)
    icon.paste(resized2, ((side - nw2) // 2, (side - nh2) // 2), resized2)
    icon.save(ASSETS / 'icon.png')
    print('saved icon.png', icon.size)


if __name__ == '__main__':
    main()
