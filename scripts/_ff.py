"""Shared helper: run the ffmpeg/ffprobe that ships with Remotion (no system ffmpeg on this Mac)."""
import os, subprocess

FF_DIR = os.path.join(os.path.dirname(__file__), '..', 'node_modules', '@remotion', 'compositor-darwin-arm64')


def run(tool, *args, capture=False):
    env = dict(os.environ, DYLD_LIBRARY_PATH=os.path.abspath(FF_DIR))
    cmd = [os.path.join(FF_DIR, tool), '-hide_banner', '-loglevel', 'error', *map(str, args)]
    if tool == 'ffprobe':
        cmd = [os.path.join(FF_DIR, tool), '-v', 'error', *map(str, args)]
    return subprocess.run(cmd, env=env, check=True, capture_output=capture, text=True).stdout


def to_wav(src, dst, sr=48000):
    run('ffmpeg', '-y', '-i', src, '-vn', '-ac', 1, '-ar', sr, dst)
    return dst


def frame(video, t, dst, width=None):
    args = ['-y', '-ss', f'{t:.3f}', '-i', video, '-frames:v', 1]
    if width:
        args += ['-vf', f'scale={width}:-1']
    run('ffmpeg', *args, dst)
    return dst
