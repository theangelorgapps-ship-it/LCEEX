#!/usr/bin/env node
// Structural verification of the KV scroll hero against its spec contract.
// Usage: node scripts/verify-kv-hero.mjs <path-to-html>
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const file = process.argv[2];
if (!file) { console.error('usage: verify-kv-hero.mjs <html>'); process.exit(2); }

let html;
try { html = readFileSync(file, 'utf8'); }
catch (e) { console.error('cannot read ' + file + ': ' + e.message); process.exit(1); }

const failures = [];
const ok = (cond, label) => { if (!cond) failures.push(label); };

// --- Media wiring ---
ok(html.includes('409763c0-95f4-49d3-a601-dc564d55072b.mp4'), 'missing 1080p clip URL');
ok(/409763c0-95f4-49d3-a601-dc564d55072b\.mp4/.test(html), '1080p URL malformed');
ok(html.includes('b3718419-7a0a-478d-bfb0-0ff8bef7f3f7.mp4'), 'missing 720p clip URL');
ok(html.includes('2307e4bf-be39-42b4-b579-e168aeccabf0.jpg'), 'missing poster URL');
ok(html.includes('900'), '720p 900px switch missing');
ok(/<video[\s\S]*?muted/.test(html), 'video must be muted');
ok(/preload\s*=\s*["']auto["']/.test(html), 'video must preload=auto for scrubbing');
ok(html.includes('playsinline'), 'video must be playsinline');

// --- Self-hosted fonts embedded as woff2 data URIs ---
for (const fam of ['Anton', 'Archivo', 'JetBrains Mono']) {
  const re = new RegExp("@font-face[\\s\\S]{0,400}?font-family:\\s*['\"]?" + fam.replace(' ', '\\s?') + "['\"]?", 'i');
  ok(re.test(html), 'missing @font-face for ' + fam);
}
const dataUris = [...html.matchAll(/data:font\/woff2;base64,([A-Za-z0-9+/=]{100,})/g)].map(m => m[1]);
ok(dataUris.length >= 3, 'expected at least 3 embedded woff2 data URIs, found ' + dataUris.length);
for (const b64 of dataUris) {
  const buf = Buffer.from(b64, 'base64');
  ok(buf.length > 5000 && buf.subarray(0, 4).toString('latin1') === 'wOF2',
     'embedded font failed wOF2 magic/size check (' + buf.length + ' bytes)');
}

// --- Colour and unit system ---
ok(html.includes('#2f63ff'), 'cobalt #2f63ff missing');
ok(html.includes('#e9e9e9'), 'giant-letter grey #e9e9e9 missing');
ok(html.includes('#111'), 'ink #111 missing');
ok(/100\s*(vw|\*\s*innerWidth|\s*vw)?\s*\/\s*1440/.test(html) || html.includes('/ 1440') || html.includes('/1440'), 'unit base 1440 missing');
ok(html.includes('960'), 'unit base 960 missing');
ok(html.includes('430'), 'phone unit base 430 missing');

// --- Layering ---
ok(/mix-blend-mode:\s*darken/.test(html), 'giant letters need mix-blend-mode: darken');
ok(html.includes('--edge-px'), 'JS must write --edge-px');
ok(html.includes('0.448'), 'final band edge factor 0.448 missing');
ok(/font-size:\s*calc\([\s\S]{0,40}?330/.test(html), 'giant letters 330u missing');
ok(html.includes('180'), 'phone giant letters 180u missing');

// --- Scroll mapping constants ---
ok(html.includes('2.4'), 'A = 2.4 viewports missing');
ok(html.includes('1 / 48') || html.includes('1/48'), 'duration minus 1/48 missing');
ok(/0\.2(?!\d)/.test(html), 'easing factor 0.2 missing');
ok(html.includes('1 / 60') || html.includes('1/60'), 'seek threshold 1/60 missing');
ok(html.includes('0.94'), 'settled threshold 0.94 missing');
ok(html.includes('--ph'), 'settled flag --ph missing');
ok(html.includes('0.45'), 'strip overshoot 0.45vw missing');
ok(html.includes('1.1'), 'B multiplier 1.1 missing');
ok(html.includes("addEventListener('seeked'") || html.includes('addEventListener("seeked"') || html.includes("'seeked'"), 'seeked re-seek handler missing');

// --- Recorder mode ---
ok(html.includes('rec=1') || html.includes("'rec'") || html.includes('"rec"'), 'recorder mode ?rec=1 missing');
ok(html.includes('__recTime'), 'window.__recTime hook missing');
ok(html.includes('cubic-bezier(.4,.05,.55,.95)') || html.includes('cubic-bezier(0.4,0.05,0.55,0.95)') || html.includes('cubic-bezier(0.4, 0.05, 0.55, 0.95)'), 'recorder easing missing');
ok(html.includes('11000'), 'recorder 11s animation missing');
ok(html.includes('0.04'), 'recorder 4% hold missing');
ok(html.includes('0.96'), 'recorder 96% hold missing');

// --- Card reveal gradient ---
ok(/background-clip:\s*text/.test(html), 'card text needs background-clip: text');
ok(html.includes('0.98'), 'card sweep 0.98 anchor missing');
ok(/\/\s*0\.3/.test(html) || html.includes('/0.3'), 'card sweep /0.3 divisor missing');
ok(html.includes('-0.4'), 'card sweep clamp min -0.4 missing');
ok(html.includes('1.6'), 'card sweep clamp max 1.6 missing');
ok(html.includes('- 34') || html.includes('-34'), 'gradient stop s-34 missing');
ok(html.includes('- 6') || html.includes('-6'), 'gradient stop s-6 missing');
ok(html.includes('+ 26') || html.includes('+26'), 'gradient stop s+26 missing');

// --- Video discipline: scrubbed, never played, no opacity transitions ---
ok(!/\.\s*play\s*\(/.test(html), 'video.play() must never be called');
ok(!/playbackRate/.test(html), 'playbackRate must not be used');
ok(!/video[^{]*\{[^}]*opacity/.test(html), 'video must not have opacity styling');
ok(!/video[^{]*\{[^}]*transition/.test(html), 'video must not have transitions');
ok(!/requestVideoFrameCallback[\s\S]{0,200}play/.test(html), 'no hidden playback path');

// --- Sticky structure ---
ok(/\.scene[\s\S]{0,300}?position:\s*sticky/.test(html), '.scene must be sticky');
ok(/\.track/.test(html), '.track missing');
ok(/100lvh/.test(html), 'scene must use 100lvh');
ok(html.includes('overflow-x: clip'), 'html/body must use overflow-x: clip (overflow-x:hidden breaks sticky)');

// --- Copy ---
for (const t of ['OUR SERVICES', 'EVERYTHING YOUR', 'FREIGHT NEEDS.', 'UNDER ONE GROUP.',
  'Air freight', 'Ocean freight', 'Customs brokerage', 'Warehousing and 3PL', 'Project cargo',
  'Work with us', 'Our services', 'KM/H', 'Menu', 'Follow', '>KV<',
  'From air to sea', 'One integrated network']) {
  ok(html.includes(t), 'missing copy: ' + t);
}

// --- No external font/CDN requests (self-hosted) ---
ok(!/fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.|unpkg|jsdelivr/i.test(html), 'external font/CDN reference found');

// --- No real brands (acceptance: fictional KV only) ---
// Scan the markup with embedded base64 font payloads stripped, since random
// base64 substrings can collide with short brand names.
const visible = html.replace(/data:font\/woff2;base64,[A-Za-z0-9+/=]+/g, 'data:font/woff2;base64,');
for (const bad of ['Maersk', 'DHL', 'FedEx', 'UPS', 'Kuehne', 'DB Schenker', 'DSV', 'CMA CGM']) {
  ok(!visible.includes(bad), 'real brand present: ' + bad);
}

// --- Inline JS syntax must be valid ---
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
ok(scripts.length >= 1, 'no inline script found');
for (const [i, src] of scripts.entries()) {
  try { new vm.Script(src, { filename: 'inline-' + i + '.js' }); }
  catch (e) { failures.push('inline script ' + i + ' syntax error: ' + e.message); }
}

if (failures.length) {
  console.error('FAIL (' + failures.length + '):');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('kv hero source verification passed');
