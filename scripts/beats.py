import sys, os, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _ff import run
from scipy.io import wavfile
from scipy.signal import stft

def load(p, sr=22050):
    tmp = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.cache', '_beats.wav'); os.makedirs(os.path.dirname(tmp), exist_ok=True)
    run('ffmpeg', '-y', '-i', p, '-ac', 1, '-ar', sr, tmp)
    r, x = wavfile.read(tmp); return x.astype(np.float32) / 32768, r

def analyse(p):
    x, sr = load(p)
    hop = 512
    f, t, Z = stft(x, sr, nperseg=2048, noverlap=2048 - hop)
    S = np.log1p(np.abs(Z) * 100)
    flux = np.maximum(0, np.diff(S, axis=1)).sum(0)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)
    fps = sr / hop
    ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
    lags = np.arange(len(ac)); bpm = 60 * fps / np.maximum(lags, 1)
    m = (bpm > 70) & (bpm < 180)
    lag = lags[m][np.argmax(ac[m])]; tempo = 60 * fps / lag
    period = lag
    # phase
    best = max(range(int(period)), key=lambda ph: flux[ph::int(round(period))].sum())
    beats = np.arange(best, len(flux), period) / fps
    rms = np.array([np.sqrt(np.mean(x[i:i + sr] ** 2)) for i in range(0, len(x) - sr, sr)])
    db = 20 * np.log10(rms + 1e-9)
    return tempo, beats, db, len(x) / sr

if __name__ == '__main__':
    for p in sys.argv[1:]:
        tempo, beats, db, dur = analyse(p)
        print(os.path.basename(p), f'{tempo:.1f} bpm  dur {dur:.1f}s  first beat {beats[0]:.3f}')
        print('  dB/s:', ' '.join(f'{d:.0f}' for d in db))

def detail(p, t0, t1):
    x, sr = load(p)
    hop = 256
    f, t, Z = stft(x, sr, nperseg=2048, noverlap=2048 - hop)
    S = np.log1p(np.abs(Z) * 100)
    lo = S[f < 150]; 
    flux = np.maximum(0, np.diff(S, axis=1)).sum(0); bass = np.maximum(0, np.diff(lo, axis=1)).sum(0)
    fps = sr / hop
    from scipy.signal import find_peaks
    pk, _ = find_peaks(flux, distance=int(fps * 0.15), height=np.percentile(flux, 85))
    for i in pk:
        tt = i / fps
        if t0 <= tt <= t1: print(f'{tt:7.3f}  flux {flux[i]:7.1f}  bass {bass[i]:6.1f}')
