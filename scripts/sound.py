"""Launch film: the full mix (music bed + sound design, no voice).

Reads src/film/cues.json (the same times the picture uses) and writes
public/audio/mix.wav. Rules from the launch film: no bells or dings; clicks, shutters,
taps, low drifts and bass; whooshes only on the big moves; typing from a real keyboard
recording, one stroke per character; one deep hit on the logo. Effects land ~0.05s after
their cue (eases make a change visible a few frames late); typed characters land on the frame.

  python3 scripts/sound.py        (needs: pip install -r requirements.txt, and npm install for ffmpeg)
"""
import json, math, os, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, sosfilt

ROOT = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, os.path.dirname(__file__))
from _ff import run  # noqa: E402

SR = 48000
CUES = json.load(open(os.path.join(ROOT, 'src/film/cues.json')))
DUR = CUES['duration']
N = int(SR * DUR)
PUB = os.path.join(ROOT, 'public/audio')
SFX_FILES = ['camera-shutter-click.mp3', 'mouse-click.wav', 'reverse-crash.wav', 'single-camera-click.mp3']
# Preflight: music and sound effects are not shipped with the kit. Bring files you have the rights to.
_need = [os.path.join(PUB, 'music', CUES['music']['file'])] + [os.path.join(PUB, 'sfx', f) for f in SFX_FILES]
_missing = [f for f in _need if not os.path.exists(f)]
if _missing:
    sys.exit('Missing audio files (not included in the kit, add your own):\n  ' + '\n  '.join(os.path.relpath(f, ROOT) for f in _missing))
TMP = os.path.join(ROOT, '.cache/audio')
os.makedirs(TMP, exist_ok=True)
rng = np.random.default_rng(7)
LAG = 0.05


def load(path, offset=0.0, dur=None):
    out = os.path.join(TMP, os.path.basename(path) + '.wav')
    args = ['-y']
    if offset: args += ['-ss', f'{offset:.4f}']
    args += ['-i', path]
    if dur: args += ['-t', f'{dur:.4f}']
    run('ffmpeg', *args, '-ac', 2, '-ar', SR, '-c:a', 'pcm_s16le', out)
    r, x = wavfile.read(out)
    return x.astype(np.float32) / 32768


def sfx(name):
    return load(os.path.join(PUB, 'sfx', name))


class Bus:
    def __init__(self):
        self.x = np.zeros((N, 2), np.float32)

    def add(self, t, sig, gain=1.0, pan=0.0):
        if sig.ndim == 1: sig = np.stack([sig, sig], 1)
        a = (pan + 1) * math.pi / 4
        g = np.array([math.cos(a), math.sin(a)]) * math.sqrt(2) * gain
        s0 = int(round(t * SR))
        if s0 < 0: sig, s0 = sig[-s0:], 0
        n = min(len(sig), N - s0)
        if n > 0: self.x[s0:s0 + n] += sig[:n] * g


def env_exp(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def bp(x, f, q=1.0):
    lo, hi = f / (1 + 0.5 / q), f * (1 + 0.5 / q)
    return sosfilt(butter(2, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos'), x)


def tap(f=230, seed=1):
    r = np.random.default_rng(seed)
    n = int(0.09 * SR); t = np.arange(n) / SR
    ff = f * (1 + r.random() * 0.08)
    ph = 2 * np.pi * np.cumsum(ff * (1 + 0.3 * np.exp(-t / 0.006))) / SR
    return (np.sin(ph) * np.exp(-t / 0.024) * 0.8 + lp(r.standard_normal(n), 1000) * np.exp(-t / 0.006) * 0.5).astype(np.float32)


def drift(dur, f=260, sub=52):
    n = int(dur * SR); u = np.arange(n) / n
    e = np.sin(np.pi * np.minimum(1, u * 1.15)) ** 2 * np.where(u > 0.87, (1 - u) / 0.13, 1)
    ph = 2 * np.pi * np.cumsum(sub * (1 + 0.1 * u)) / SR
    return ((lp(lp(rng.standard_normal(n), f), f) * 2.2 + np.sin(ph) * 0.35) * e).astype(np.float32)


def whoosh(dur, f0, f1, peak=0.6, curve=1.6):
    n = int(dur * SR); u = np.arange(n) / n
    x = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 512
    for i in range(0, n, seg):
        f = f0 * (f1 / f0) ** (i / n)
        y = bp(x[max(0, i - 2048):i + seg], f, 0.9)
        out[i:i + seg] = y[-len(out[i:i + seg]):]
    shape = np.where(u < peak, (u / peak) ** curve, ((1 - u) / (1 - peak)) ** 1.2)
    return (out * shape * 0.9).astype(np.float32)


def thump(f0=70, f1=38, dur=0.45, decay=0.16, click=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.05)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.minimum(1, t / 0.004) * np.exp(-t / decay) + lp(rng.standard_normal(n), 1200) * click * np.exp(-t / 0.004)).astype(np.float32)


def mclick(seed=1):
    r = np.random.default_rng(seed)
    n = int(0.1 * SR); t = np.arange(n) / SR
    x = r.standard_normal(n)
    a = bp(x, 3600 + r.random() * 600, 2) * np.exp(-t / 0.0022) * 1.6
    b = np.where(t > 0.055, bp(x, 2600, 2) * np.exp(-np.maximum(0, t - 0.055) / 0.002) * 0.7, 0)
    return (a + b).astype(np.float32)


def sweep(dur):
    """A soft rising air sweep (curves drawing, the ring)."""
    return whoosh(dur, 500, 3800, peak=0.75, curve=1.3) * 0.7


# ---------------- placement ----------------
fx = Bus()      # effects
keys = Bus()    # typing, its own bus
sc = CUES['scenes']
pan_x = lambda x: max(-0.7, min(0.7, (x - 960) / 960 * 0.8))

click_cam = sfx('single-camera-click.mp3')
shutter = sfx('camera-shutter-click.mp3')
mouse = sfx('mouse-click.wav')
rcrash = sfx('reverse-crash.wav')

def words(ws, g=0.16, f=260):
    for i, (_, at) in enumerate(ws):
        fx.add(at + LAG, tap(f, 30 + i), g)

# hook
H = CUES['hook']
MESSY_X = [330, 1590, 300, 1630, 770, 1190]
for i, at in enumerate(H['cards']):
    fx.add(at + 0.02, click_cam, 0.9, pan_x(MESSY_X[i]))
words(H['line1']); words(H['line2'])
for i in range(6):
    fx.add(H['snap'] + i * 0.04 + LAG, mclick(40 + i), 0.16, pan_x(960 + (i - 2.5) * 186))
fx.add(H['snap'] + LAG, thump(90, 50, 0.3, 0.09, 0.2), 0.35)
fx.add(3.0 - len(rcrash) / SR + 0.02, rcrash, 0.38)
fx.add(3.0, thump(62, 34, 0.9, 0.3, 0.3), 0.9)

# intro: "You can now [Ask AI]", the chat slides in beside it, the product fades in around them
IN = CUES['intro']
words(IN['words'])
fx.add(IN['btn'] + LAG, tap(180, 3), 0.4)
fx.add(IN['btn'] + LAG, drift(0.45, 300, 60), 0.22)
fx.add(IN['pan'][0] + LAG, drift(IN['pan'][1], 300, 56), 0.26)
words(IN['words2'])
fx.add(IN['press'], mouse, 0.95, 0.15)
fx.add(IN['move1'][0] + LAG, drift(IN['move1'][1], 300, 55), 0.3)
fx.add(IN['panel'][0] + LAG, whoosh(0.7, 400, 2600, 0.5, 1.4), 0.16, 0.4)
fx.add(IN['panel'][0] + 0.45, tap(240, 5), 0.2, 0.4)
for i in range(3): fx.add(IN['panel'][0] + 0.5 + i * 0.06 + LAG, tap(380 + i * 30, 6 + i), 0.09, 0.4)
fx.add(IN['iface'][0], drift(1.0, 420, 62), 0.3)
fx.add(IN['move2'][0] + LAG, drift(IN['move2'][1], 280, 50), 0.32)


# prompts
SPACE_KEYS = None
bank = json.load(open(os.path.join(ROOT, 'public/audio/keys/bank.json')))
r_, ksrc = wavfile.read(os.path.join(ROOT, 'public/audio', bank['file']))
ksrc = ksrc.astype(np.float32) / 32768
if ksrc.ndim > 1: ksrc = ksrc.mean(1)
if r_ != SR:
    from scipy.signal import resample_poly
    ksrc = resample_poly(ksrc, SR, r_).astype(np.float32)


def key_times(text, a, b):
    n = len(text)
    return [a + (b - a) * i / max(1, n - 1) + (0.012 * math.sin(i * 2.7) if 0 < i < n - 1 else 0) for i in range(n)]


def type_keys(text, times, seed, level=1.0):
    last = -1
    for i, t in enumerate(times):
        space = text[i] == ' '
        b = bank['spaces'] if space else bank['letters']
        j = (i * 7 + seed) % len(b)
        if j == last: j = (j + 1) % len(b)
        last = j
        e = b[j]
        nxt = times[i + 1] if i + 1 < len(times) else t + 0.2
        ln = min(e['len'] + 0.0015, nxt - t + 0.014)
        s0 = int((e['on'] - 0.0015) * SR); n = int(ln * SR)
        o = ksrc[s0:s0 + n].copy() * e['gain'] * (0.92 + 0.16 * (((i * 37 + seed * 11) % 10) / 10))
        fi, fo = int(0.0005 * SR), int(0.008 * SR)
        o *= np.minimum(1, np.minimum(np.arange(n) / fi, (n - np.arange(n)) / fo))
        keys.add(t + 0.01, o, (1.08 if space else 1.0) * level, 0.05 + 0.1 * math.sin(i * 0.9))


# titles: words sharpen in (taps), a soft air under each
for name in ['title1', 'title2', 'title3']:
    s0 = sc[name][0]
    fx.add(s0 + 0.04, drift(0.5, 340, 60), 0.18)
    words([[w, s0 + at] for w, at in CUES['titles'][name]['words']], 0.17)

for k, (name, seed) in enumerate([('prompt1', 3), ('prompt2', 9), ('prompt3', 5)]):
    c = CUES['prompts'][name]; s = sc[name][0]
    if name != 'prompt3':
        fx.add(s + 0.02, drift(0.4, 360, 64), 0.22)
        fx.add(s + 0.06, tap(210, 11 + k), 0.22)
    else:
        for i in range(3): fx.add(s + 0.02 + i * 0.04, tap(320, 50 + i), 0.14)
    type_keys(c['text'], key_times(c['text'], s + c['type'][0], s + c['type'][1]), seed)
    fx.add(s + c['send'], mclick(60 + k), 0.4)
    fx.add(s + c['send'] + 0.01, tap(170, 70 + k), 0.3)
    fx.add(s + c['exit'] - 0.05, whoosh(0.28, 700, 5200, 0.55, 1.8), 0.22)

def answer(bubble, ans, g=0.11):
    fx.add(bubble + LAG, tap(280, 80), 0.26, 0.4)
    for i, at in enumerate(ans): fx.add(at + LAG, tap(420 + i * 30, 90 + i), g, 0.4)

# p1
P1 = CUES['p1']
answer(P1['bubble'], P1['ans'])
fx.add(P1['pull'][0] + LAG, drift(P1['pull'][1] + 0.1, 300, 55), 0.28)
fx.add(P1['out'] + 0.02, shutter, 0.9)
fx.add(P1['chips'] + LAG, tap(260, 7), 0.18, -0.4)
for i in range(6):
    fx.add(P1['move'] + i * 0.05 + 0.12, tap(200 + i * 18, 100 + i), 0.12, -0.5 + i * 0.15)
fx.add(P1['ring'], sweep(0.5), 0.2, -0.4)
fx.add(P1['ring'] + 0.02, thump(110, 70, 0.4, 0.14, 0.1), 0.25, -0.4)

# p2
P2 = CUES['p2']
answer(P2['bubble'], P2['ans'])
fx.add(P2['pull'][0] + LAG, drift(P2['pull'][1] + 0.1, 300, 55), 0.28)
fx.add(P2['veil'] + LAG, drift(0.7, 220, 48), 0.3)
fx.add(P2['move'] + 0.02, shutter, 0.8)
for i in range(6):
    fx.add(P2['move'] + i * 0.06 + 0.14, tap(200 + i * 18, 160 + i), 0.12, -0.5 + i * 0.15)
fx.add(P2['tags'][0] + LAG, thump(95, 48, 0.4, 0.12, 0.3), 0.55, 0.3)
fx.add(P2['tags'][1] + LAG, thump(85, 44, 0.4, 0.12, 0.3), 0.5, -0.2)

# pick
PK = CUES['pick']
for i, at in enumerate(PK['cards']): fx.add(at + 0.02, click_cam, 0.8, [-0.4, 0, 0.4][i])
for i, at in enumerate(PK['clicks']): fx.add(at, mouse, 0.9, [-0.4, 0, 0.4][i])
fx.add(PK['exit'], whoosh(0.25, 900, 5000, 0.7, 1.6), 0.2)

# p3
P3 = CUES['p3']
answer(P3['bubble'], [P3['building']])
fx.add(P3['pull'][0] + LAG, drift(P3['pull'][1] + 0.1, 300, 55), 0.28)
fx.add(P3['gridOut'] + 0.02, shutter, 0.85)
fx.add(P3['close'][0] + LAG, drift(P3['close'][1] + 0.1, 360, 60), 0.24, 0.5)
fx.add(P3['board'] + LAG, drift(0.5, 340, 60), 0.22)
for i, at in enumerate(P3['cols']): fx.add(at + LAG, tap(230 + i * 25, 120 + i), 0.18, -0.4 + i * 0.3)
fx.add(P3['curves'][0], sweep(P3['curves'][1] + 0.1), 0.16)
answer(P3['ready'], [P3['ready'] + 0.06])
fx.add(P3['share'], mouse, 0.9, 0.4)
fx.add(P3['toast'] + LAG, tap(300, 130), 0.22, 0.4)

# payoff + logo
PO = CUES['payoff']
words(PO['words'], 0.18)
fx.add(PO['words'][3][1] + LAG, thump(70, 36, 0.7, 0.22, 0.2), 0.6)
fx.add(PO['zoom'][0] - 0.1, whoosh(PO['zoom'][1] - 0.05, 300, 4200, 0.82, 2.0), 0.4)
fx.add(PO['zoom'][0] + PO['zoom'][1] - 0.28, thump(60, 34, 0.9, 0.3, 0.05), 0.28)
# logo: soft, no big hit
fx.add(CUES['end']['logo'] + LAG, drift(1.4, 240, 46), 0.3)
fx.add(CUES['end']['logo'] + 0.08, tap(150, 150), 0.25)

# ---------------- mix ----------------
def reverb(x, decay=1.4, mix=0.18):
    n = int(decay * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t * 6.9 / decay)[:, None]
    ir = lp(ir.T, 6000).T
    from scipy.signal import fftconvolve
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], 1)
    wet *= np.abs(x).max() / (np.abs(wet).max() + 1e-9)
    return x + wet * mix

fxm = reverb(fx.x, 1.2, 0.16)
keym = reverb(keys.x, 0.9, 0.12)

mu = CUES['music']

music = load(os.path.join(PUB, 'music', mu['file']), mu['offset'], DUR + 0.1)[:N]
music = np.pad(music, ((0, N - len(music)), (0, 0)))
tt = np.arange(N) / SR
fade = np.clip((mu['fadeOut'][1] - tt) / (mu['fadeOut'][1] - mu['fadeOut'][0]), 0, 1) ** 1.5
fade *= np.clip(tt / 0.02, 0, 1)
music *= fade[:, None]


def k_weight(x):
    # BS.1770 K-weighting (shelf + high-pass) at 48 kHz
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)


def lufs(x):
    y = k_weight(x)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    ls = []
    for i in range(0, len(y) - blk, hop):
        ms = (y[i:i + blk] ** 2).mean(0).sum()
        ls.append(ms)
    ls = np.array(ls)
    l = -0.691 + 10 * np.log10(ls + 1e-12)
    g = ls[l > -70]
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = ls[(l > -70) & (l > rel)]
    return -0.691 + 10 * np.log10(g2.mean())


# Levels: music is the bed (no voice); effects sit clearly on top; typing ~6 dB under the effects.
FX_DB, KEY_DB = 0.0, -7.0
m_l = lufs(music)
music_g = 10 ** ((-18 - m_l) / 20)                     # music alone at about -18 LUFS
fx_peak = 1.0                                          # pinned effect level (never normalised from the effects peak)
mix = music * music_g + fxm * fx_peak * 10 ** (FX_DB / 20) + keym * fx_peak * 10 ** (KEY_DB / 20)

# master: to -14 LUFS, soft limit under -1 dBFS
for _ in range(3):
    mix *= 10 ** ((-14 - lufs(np.tanh(mix / 10 ** (-1 / 20) * 0.98) * 10 ** (-1 / 20))) / 20)
ceil = 10 ** (-1 / 20)
mix = np.tanh(mix / ceil * 0.98) * ceil
print(f'music alone {m_l:.1f} LUFS (gain {20*np.log10(music_g):.1f} dB) · final {lufs(mix):.1f} LUFS · peak {20*np.log10(np.abs(mix).max()):.2f} dBFS')
wavfile.write(os.path.join(PUB, 'mix.wav'), SR, (mix * 32767).astype(np.int16))
wavfile.write(os.path.join(ROOT, '.cache/audio/sfx-only.wav'), SR, (np.clip(fxm * fx_peak + keym * fx_peak * 10 ** (KEY_DB / 20), -1, 1) * 32767).astype(np.int16))
print('->', os.path.join(PUB, 'mix.wav'))
