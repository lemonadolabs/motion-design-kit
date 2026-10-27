"""Reference vs rebuild, for your own check and for sign-off.

  python3 scripts/rebuild/compare.py ref.png out/stills/screen.png out/compare/screen
Writes <prefix>-side-by-side.jpg (send this for sign-off), <prefix>-blend.jpg (50/50 overlay:
any drift shows as a double image) and prints the mean pixel difference.
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw

ref, out, prefix = sys.argv[1:4]
os.makedirs(os.path.dirname(prefix) or '.', exist_ok=True)
a = Image.open(ref).convert('RGB')
b = Image.open(out).convert('RGB').resize(a.size, Image.LANCZOS)
W = 1200; H = round(a.height * W / a.width)
sheet = Image.new('RGB', (W * 2 + 30, H + 50), '#1c1917')
sheet.paste(a.resize((W, H), Image.LANCZOS), (10, 40)); sheet.paste(b.resize((W, H), Image.LANCZOS), (W + 20, 40))
d = ImageDraw.Draw(sheet)
d.text((14, 12), 'REFERENCE SCREENSHOT', fill='#a8a29e'); d.text((W + 24, 12), 'REBUILT IN CODE', fill='#f9cfbd')
sheet.save(prefix + '-side-by-side.jpg', quality=92)
Image.blend(a, b, 0.5).save(prefix + '-blend.jpg', quality=90)
print('mean abs diff', np.abs(np.asarray(a).astype(int) - np.asarray(b).astype(int)).mean())
