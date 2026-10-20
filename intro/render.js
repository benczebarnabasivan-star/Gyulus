// Renders intro/scene.html frame by frame in headless Chromium and encodes it with ffmpeg.
//
//   node intro/render.js [--logo assets/logo.png] [--audio output/build/sound.wav]
//                        [--fps 60] [--out output/x.mp4] [--stills 1.0,2.5,6.5]
//
// Without --logo it uses assets/logo.svg or assets/logo.png, and falls back to the
// placeholder wordmark (the output file name then says so).
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    out[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

function findLogo(explicit) {
  if (explicit) return { file: path.resolve(explicit), placeholder: false };
  for (const name of ['logo.svg', 'logo.png', 'logo.webp']) {
    const file = path.join(ROOT, 'assets', name);
    if (fs.existsSync(file)) return { file, placeholder: false };
  }
  return { file: path.join(ROOT, 'assets', 'logo-placeholder.png'), placeholder: true };
}

function toDataUrl(file) {
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) throw new Error(`Unsupported logo format: ${file} (use .svg, .png, .webp or .jpg)`);
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const fps = Number(args.fps || 60);
  const logo = findLogo(args.logo);
  if (logo.placeholder) {
    console.warn('! No assets/logo.svg or assets/logo.png found: using the PLACEHOLDER wordmark.');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.addInitScript(() => { window.__RENDER__ = true; });
  await page.goto(pathToFileURL(path.join(__dirname, 'scene.html')).href);
  const info = await page.evaluate(src => window.APROBETU.setup({ src }), toDataUrl(logo.file));
  const duration = await page.evaluate(() => window.APROBETU.DURATION);

  console.log(`logo: ${path.relative(ROOT, logo.file)} -> ${info.width}x${info.height}px on screen` +
    `${info.round ? ' (round badge)' : ''}, star ring radius ${info.ringRadius}px`);
  if (!info.isSvg && info.upscale > 1.01) {
    console.warn(`! The logo image is small and is being upscaled ${info.upscale.toFixed(2)}x. ` +
      'Use an SVG or a PNG at least ' + Math.ceil(info.sourceWidth * info.upscale) + 'px wide for a sharp result.');
  }
  if (!info.round && info.luminance < 0.22) {
    console.warn('! The logo is mostly dark and the background is dark navy: use the light/inverted version of the logo.');
  }

  const grab = t => page.evaluate(tt => {
    window.APROBETU.frame(tt);
    return document.getElementById('c').toDataURL('image/png').slice(22);
  }, t);

  if (args.stills) {
    const dir = path.resolve(args.dir || path.join(ROOT, 'output', 'stills'));
    fs.mkdirSync(dir, { recursive: true });
    for (const s of String(args.stills).split(',')) {
      const t = Number(s);
      const file = path.join(dir, `frame_${t.toFixed(2)}s.png`);
      fs.writeFileSync(file, Buffer.from(await grab(t), 'base64'));
      console.log('still', path.relative(ROOT, file));
    }
    await browser.close();
    return;
  }

  const suffix = logo.placeholder ? '_PLACEHOLDER-LOGO' : '';
  const outFile = path.resolve(args.out || path.join(ROOT, 'output', `aprobetu-intro-1080x1920${suffix}.mp4`));
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const frames = Math.round(duration * fps);

  const ff = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  ];
  if (args.audio) ff.push('-i', path.resolve(args.audio));
  ff.push(
    '-map', '0:v',
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-level', '4.2',
    '-g', String(fps * 10), '-bf', '2', // long GOP: no scheduled keyframe pops inside the static hold
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  );
  if (args.audio) ff.push('-map', '1:a', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000');
  ff.push('-t', String(duration), '-movflags', '+faststart', outFile);

  const enc = spawn('ffmpeg', ff, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((resolve, reject) => enc.on('close', c => (c === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${c}`)))));

  const started = Date.now();
  let last = null;
  for (let f = 0; f < frames; f++) {
    last = Buffer.from(await grab(f / fps), 'base64');
    if (!enc.stdin.write(last)) await new Promise(r => enc.stdin.once('drain', r));
    if (f % fps === 0) process.stdout.write(`\rframe ${f}/${frames}`);
  }
  enc.stdin.end();
  await done;
  await browser.close();

  const still = outFile.replace(/\.mp4$/, '_final-frame.png');
  fs.writeFileSync(still, last);
  console.log(`\rrendered ${frames} frames in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log('video:', path.relative(ROOT, outFile));
  console.log('final frame:', path.relative(ROOT, still));
}

main().catch(e => { console.error(e); process.exit(1); });
