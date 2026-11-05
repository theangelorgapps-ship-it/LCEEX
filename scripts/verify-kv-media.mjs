#!/usr/bin/env node
// Verify the three KV media assets are reachable with expected content types.
const ASSETS = [
  ['1080p clip', 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/409763c0-95f4-49d3-a601-dc564d55072b.mp4', 'video/mp4'],
  ['720p clip', 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/b3718419-7a0a-478d-bfb0-0ff8bef7f3f7.mp4', 'video/mp4'],
  ['poster', 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/2307e4bf-be39-42b4-b579-e168aeccabf0.jpg', 'image/jpeg'],
];

const failures = [];
for (const [label, url, type] of ASSETS) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
    const ct = res.headers.get('content-type') || '';
    const len = Number(res.headers.get('content-length') || 0);
    if (res.status !== 200) failures.push(label + ': HTTP ' + res.status);
    else if (!ct.startsWith(type)) failures.push(label + ': content-type ' + ct);
    else if (len < 10000) failures.push(label + ': suspicious content-length ' + len);
  } catch (e) {
    failures.push(label + ': ' + e.message);
  }
}
if (failures.length) {
  console.error('FAIL (' + failures.length + '):');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('kv media verification passed');
