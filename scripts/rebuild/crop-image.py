"""Cut a photo/creative out of a reference screenshot and paint out UI drawn on top of it
(badges, chips): those are drawn by your components, so they must not be baked into the image.

  python3 scripts/rebuild/crop-image.py ref.png 319,146,719,678 public/ads/mine/01.jpg --paint 330,155,370,195
Prefer the original high-res asset whenever you have it; crops are stand-ins.
"""
import sys
from PIL import Image, ImageFilter

ref, box, out = sys.argv[1], tuple(int(v) for v in sys.argv[2].split(',')), sys.argv[3]
img = Image.open(ref).convert('RGB').crop(box)
args = sys.argv[4:]
for i, a in enumerate(args):
    if a == '--paint':
        x0, y0, x1, y1 = (int(v) for v in args[i + 1].split(','))
        x0 -= box[0]; x1 -= box[0]; y0 -= box[1]; y1 -= box[1]
        # fill from a blurred copy of the surroundings
        pad = 24
        region = img.crop((max(0, x0 - pad), max(0, y0 - pad), min(img.width, x1 + pad), min(img.height, y1 + pad)))
        region = region.filter(ImageFilter.GaussianBlur(18))
        img.paste(region.crop((x0 - max(0, x0 - pad), y0 - max(0, y0 - pad), x1 - max(0, x0 - pad), y1 - max(0, y0 - pad))), (x0, y0))
img.save(out, quality=95)
print(out, img.size)
