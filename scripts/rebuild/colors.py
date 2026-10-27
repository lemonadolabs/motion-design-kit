"""Sample exact colours from a reference screenshot (in app space, 2000 px wide).

  python3 scripts/rebuild/colors.py ref.png --at 300,15 1000,600          # surfaces: 7x7 averaged patch
  python3 scripts/rebuild/colors.py ref.png --text 68,128,115,148          # text: darkest pixels in a box
Anti-aliasing makes sampled text one step lighter than the real colour: snap to the palette
(if your product has design tokens, snap to those).
"""
import sys
from PIL import Image

img = Image.open(sys.argv[1]).convert('RGB')
mode = None
for a in sys.argv[2:]:
    if a in ('--at', '--text'):
        mode = a; continue
    v = [int(x) for x in a.split(',')]
    if mode == '--at':
        x, y = v; r = 3
        px = [img.getpixel((i, j)) for i in range(x - r, x + r + 1) for j in range(y - r, y + r + 1)]
        c = tuple(round(sum(p[k] for p in px) / len(px)) for k in range(3))
    else:
        px = sorted(img.crop(tuple(v)).getdata(), key=sum)
        d = px[:max(3, len(px) // 60)]
        c = tuple(sum(p[k] for p in d) // len(d) for k in range(3))
    print(f'{a:24s} #%02x%02x%02x' % c)
