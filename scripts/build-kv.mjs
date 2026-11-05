#!/usr/bin/env node
// Inject the self-hosted woff2 fonts into the KV template, producing the
// single-file deliverable kv/index.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const FONTS = {
  ANTON: 'scripts/fonts/anton-latin.woff2',
  ARCHIVO: 'scripts/fonts/archivo-latin.woff2',
  JBM: 'scripts/fonts/jetbrainsmono-latin.woff2',
};

let html = readFileSync('scripts/kv-template.html', 'utf8');
for (const [key, path] of Object.entries(FONTS)) {
  const b64 = readFileSync(path).toString('base64');
  if (!html.includes('%%' + key + '%%')) {
    console.error('missing placeholder %%' + key + '%%');
    process.exit(1);
  }
  html = html.replace('%%' + key + '%%', b64);
}
mkdirSync('kv', { recursive: true });
writeFileSync('kv/index.html', html);
console.log('built kv/index.html (' + html.length + ' bytes)');
