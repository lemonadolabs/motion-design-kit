"""Contact sheet from a rendered film: one frame per second (or at given times). Works for 16:9 and 9:16.

  python3 scripts/sheet.py out/film.mp4 out/sheet.jpg            # every second
  python3 scripts/sheet.py out/film.mp4 out/sheet.jpg 5.1 8.2   # these times
"""
import os, sys, tempfile
from PIL import Image, ImageDraw
from _ff import frame, run


def main():
    video, out = sys.argv[1], sys.argv[2]
    dur = float(run('ffprobe', '-show_entries', 'format=duration', '-of', 'csv=p=0', video, capture=True).strip())
    times = [float(x) for x in sys.argv[3:]] or [i + 0.5 for i in range(int(dur))]
    tmp = tempfile.mkdtemp()
    ims = [Image.open(frame(video, t, os.path.join(tmp, f'{i:04d}.jpg'), 320)).convert('RGB') for i, t in enumerate(times)]
    w, h = ims[0].size
    cols = 10 if h > w else 6
    rows = (len(ims) + cols - 1) // cols
    sh = Image.new('RGB', (cols * (w + 6), rows * (h + 18)), '#222')
    d = ImageDraw.Draw(sh)
    for i, (im, t) in enumerate(zip(ims, times)):
        x, y = (i % cols) * (w + 6), (i // cols) * (h + 18)
        sh.paste(im, (x, y))
        d.text((x + 4, y + h + 3), f'{t:.2f}s', fill='white')
    sh.save(out, quality=85)
    print('sheet ->', out)


if __name__ == '__main__':
    main()
