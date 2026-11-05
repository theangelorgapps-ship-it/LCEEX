# Gates: KV freight services scroll hero

OWNS: index.html, email/**, scripts/**, GATES.md

Scope: a single-file scroll-driven KV freight hero (index.html, served at the site root) with scrubbed video, sticky scene, giant-letter band reveal, services strip, self-hosted fonts, verified structurally and visually.

- [x] G0: this ledger states outcomes that can fail
  CHECK: node /Users/charlesfinney/.agents/skills/unlazy/scripts/gate-lint.mjs GATES.md
  EXPECT: LINT OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=fcf86d4af21fe8819851ea75e6a88cbb2efbcfc5aa9ea13f771156cdee60f411; exit=0; EXPECT=matched; output-sha256=0944152ab63307929cab0ace4315ccccf0f1a4d92dfa7fabc062b3c32bada118; output-bytes=403; shell=/bin/sh; cwd=/Users/charlesfinney/Downloads/goodnews-meeting-email; path=a6e48af35b72/16 entries

- [x] G1: index.html source implements the full spec contract (media URLs, embedded latin woff2 fonts, blend-mode layering, scroll-mapping constants, scrub-only video, recorder hook, valid inline JS)
  CHECK: node scripts/verify-kv-hero.mjs index.html
  EXPECT: kv hero source verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=3caf337be680323020876f77eaad5ccae3c56944a53e5eb4ff98854a6511337a; exit=0; EXPECT=matched; output-sha256=623355d98516d2c41bbc181a076a789cffcedb9a3462dce7463f7462f1d1ba12; output-bytes=35; shell=/bin/sh; cwd=/Users/charlesfinney/Downloads/goodnews-meeting-email; path=a6e48af35b72/16 entries

- [x] G2: all three cloudfront media assets used by the page are reachable with the expected content types
  CHECK: node scripts/verify-kv-media.mjs
  EXPECT: kv media verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=e04ed52fd0d84204b7b0716599790029282625b6d00763af238ba9126c38748d; exit=0; EXPECT=matched; output-sha256=22fecea18ece8a33409988bd97441ced83a4ee80f11888196814f15b91dd9a0d; output-bytes=29; shell=/bin/sh; cwd=/Users/charlesfinney/Downloads/goodnews-meeting-email; path=a6e48af35b72/16 entries

- [x] G3: visual acceptance at 1440x960 — load state, handling scrub, settled band with letters behind truck, cards sweeping blue to white, readout, and full reverse on scroll-back
  EVIDENCE: manual review 2026-11-05 via built-in browser at 1440x960 CSS (fixed scale): load shows stacker holding navy container over stack under KV nav; y=950 scrolls clip to t=1.66s mid-turn; y=2304 settles truck wheels on band edge at 44.8% with readout+pill appearing; y=3164/4148 show OUR SERVICES sliding behind truck (no bleed through container/cab) and cards sweeping cobalt-to-white; y=4760 end state all cards white; scroll-back to y=0 restores frame 0. Phone 430x860: 720p source, 155vw framing (left=0.5vw-0.4w, edge at 36%), Follow hidden, cards/reverse OK. Recorder: __recTime(v,5500) returned clip=4.021, y=2528, readout "24 KM/H" deterministically. No real brands in markup.
