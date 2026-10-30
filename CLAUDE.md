# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Rayan Upadhyay's personal site (rayanupadhyay.com), hosted on GitHub Pages (`CNAME`). The **entire site is one self-contained `index.html`** (~28k lines, ~4 MB): inline CSS, inline vanilla JS and Three.js **r128** from cdnjs (post-processing extras load lazily from `cdn.jsdelivr.net/npm/three@0.128.0/examples/js/`). There is no build step, no framework, no package.json and no test suite. Keep it that way: everything goes inside `index.html`, and Three.js stays on r128.

The `*.rayanupadhyay.com` "little sites" (tools, study, wish, links, agribridge, swimming, research, elevator) live in **separate repos/Vercel projects**. This repo only links to them (Sites section, RayanOS, terminal `open` list, README).

## Running and checking

```bash
python3 -m http.server 8000      # serve locally; news.json needs HTTP, not file://
```

There are no tests. Before committing an edit to `index.html`, at least syntax-check every inline script:

```bash
python3 - <<'EOF'
import re
s = open('index.html', encoding='utf-8').read()
js = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', s, re.S)
open('/tmp/chk.js', 'w').write('\n;\n'.join('(function(){' + x + '\n})' for x in js))
EOF
node --check /tmp/chk.js
```

For behaviour checks, drive the page headlessly with Playwright/Chromium. Click `#simpleBtn` for the simple view; the 3D room needs WebGL (`--use-gl=swiftshader`). Check phone width (390px) as well as desktop, plus light and dark themes.

## Architecture (the big picture)

- **Two views over the same content.** `#simple` (the "Simple version") holds the real content as `<section class="sec" data-s="KEY">` blocks (about, research, projects, sites, music, vinyl, writing, news, highlights, contact, vault, plus `only-panel` ones like swim and photos). Those sections are the **single source of truth**:
  - `openPanel(key)` copies a section's `innerHTML` into the room's side panel when you click an object or a dock button (`data-go="KEY"`).
  - `rosApp(k)` (RayanOS, the laptop desktop) copies sections into its windows, e.g. `sites`, `music` and `news`.
  - So when you change content, change the section, and don't rely on DOM injected into a section: it gets copied too. Visibility tweaks for the simple view belong in CSS scoped to `.simple .in>.sec`.
- **Simple view layout.** The simple view opens on a bento grid (`.bento` / `.bt` tiles). Each tile's `[data-more="KEY"]` opens one full section under the grid at a time (`bOpen`), and `.bback` ("↑ Top") closes it. In the simple view the little sites are opt-in only, behind the Sites tile and the `.xtoggle` button. RayanOS removes that toggle and shows them all.
- **The 3D world.** It is one big async IIFE: the room (WASD/joystick, click objects), then the city, story chapters, side quests, mini-games and other worlds (`enterWorld`/`exitWorld`, `travel(dest)`). Dialogue uses `say()` and achievements use `secret()`. If WebGL/THREE fails, the page falls back to the simple view.
- **Persistence.** Everything is in `localStorage` under `ru-*` keys. Every storage access is wrapped in `try/catch`; keep that pattern.
- **External data.** Several features load data from outside the page:
  - Last.fm charts and album covers (filled into `#lfmAlbums` and friends inside the music section);
  - the Mandalink announcements board (`anRender`);
  - `news.json`, the news pill, which Mandalink also reads (give each new message a new `id`; it hides after `until`);
  - the private chat (`chatOpen`, `/#chat`): AES-GCM in the browser, ciphertext stored in Supabase; see `CHAT_SETUP.md`.

## Rules specific to this repo

- **The Mandalink code is frozen.** Don't modify these three regions unless explicitly asked:
  - `function radTile(` … `function toHub(){`;
  - the block from the `猴王闹海岛: the Mandalink story` banner comment to `// ---------- input ----------`;
  - `function enterWorld(){` … `function exitWorld(){`.
  To verify, compare those slices against `git show 4d3c6d1:index.html`.
- Never put the chat password in the repo or site, and never use the Supabase `service_role` key; only the public anon key belongs in the page.
- Content must be factual: don't invent achievements, dates, numbers or credits for Rayan, and don't credit mentors or teachers.
- Phones must work: no horizontal scroll at 390px, touch controls intact, safe-area insets respected.
- `STORY_PLAN.md` and `MANDALINK_STORY_PLAN.md` are the design docs for story mode. `IDEAS.md` is an unpromised backlog; don't build from it unless asked.
