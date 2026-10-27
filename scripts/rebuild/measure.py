"""Compare text extents between the reference screenshot and your rendered still, band by band.
Each band is x0,y0,x1,y1,threshold (app px; pixels darker than threshold count as text).

  python3 scripts/rebuild/measure.py ref.png out/stills/screen.png "title=405,694,700,713,120" "label=325,729,420,746,170"
Get every width ratio within ~2% (ratio = reference width / render width). Fix font size or
letter-spacing, never by scaling the element.
"""
import sys
from PIL import Image

def ext(img, b):
    x0, y0, x1, y1, thr = b
    xs, ys = [], []
    for x in range(x0, x1):
        for y in range(y0, y1):
            if sum(img.getpixel((x, y))) / 3 < thr:
                xs.append(x); ys.append(y)
    return (min(xs), max(xs), min(ys), max(ys)) if xs else None

a = Image.open(sys.argv[1]).convert('RGB'); b = Image.open(sys.argv[2]).convert('RGB')
for spec in sys.argv[3:]:
    name, vals = spec.split('=')
    band = tuple(int(v) for v in vals.split(','))
    ra, rb = ext(a, band), ext(b, band)
    if ra and rb:
        print(f'{name:16s} ref x{ra[0]}-{ra[1]} w{ra[1]-ra[0]} y{ra[2]}-{ra[3]} | out x{rb[0]}-{rb[1]} w{rb[1]-rb[0]} y{rb[2]}-{rb[3]}  ratio {(ra[1]-ra[0])/max(1,rb[1]-rb[0]):.3f}')
    else:
        print(f'{name:16s} no text found (ref {bool(ra)}, out {bool(rb)})')
