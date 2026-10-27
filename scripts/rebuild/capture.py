"""Grab full-resolution frames from a screen recording of the feature (the reference for the rebuild).

  python3 scripts/rebuild/capture.py recording.mov 12.5 40 61.2          # frames at these seconds
  python3 scripts/rebuild/capture.py recording.mov --every 5               # one every 5 s (to find the moments)
Frames land in reference/screens/<recording>-<t>.png. Then crop/scale the app area to 2000 px wide
(app space) with --app x0 y0 x1 y1 (the app window inside the recording, in recording pixels).
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from _ff import frame, run
from PIL import Image

args = sys.argv[1:]
video = args.pop(0)
app = None
if '--app' in args:
    i = args.index('--app'); app = tuple(int(v) for v in args[i + 1:i + 5]); del args[i:i + 5]
if '--every' in args:
    step = float(args[args.index('--every') + 1])
    dur = float(run('ffprobe', '-show_entries', 'format=duration', '-of', 'csv=p=0', video, capture=True).strip())
    times = [round(i * step, 2) for i in range(int(dur / step) + 1)]
else:
    times = [float(a) for a in args]
out = os.path.join(os.path.dirname(__file__), '..', '..', 'reference', 'screens')
os.makedirs(out, exist_ok=True)
base = os.path.splitext(os.path.basename(video))[0]
for t in times:
    p = os.path.join(out, f'{base}-{t:06.2f}.png')
    frame(video, t, p)
    if app:
        im = Image.open(p).crop(app)
        im.resize((2000, round(im.height * 2000 / im.width)), Image.LANCZOS).save(p)
    print(p)
