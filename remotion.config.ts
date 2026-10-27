import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
// CRF only applies to h264/h265; ProRes renders (e.g. alpha masters) reject it.
if (!process.argv.some((a) => a.includes('prores'))) Config.setCrf(16);
Config.setOverwriteOutput(true);
// WebGL (launch-v5 liquid gradient) needs a real GL backend in headless Chrome.
Config.setChromiumOpenGlRenderer('angle');
