# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Rayan Upadhyay's personal site (rayanupadhyay.com), hosted on GitHub Pages (`CNAME`). The **entire site is one self-contained `index.html`** (~28k lines, ~4 MB): inline CSS, inline vanilla JS and Three.js **r128** from cdnjs (post-processing extras load lazily from `cdn.jsdelivr.net/npm/three@0.128.0/examples/js/`). There is no build step, no framework, no package.json and no test suite. Keep it that way: everything goes inside `index.html`, and Three.js stays on r128.

The `*.rayanupadhyay.com` "little sites" (tools, study, wish, links, agribridge, research) live in **separate repos/Vercel projects**. This repo only links to them (Sites section, RayanOS, terminal `open` list, README).

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

- Cloud sandboxes usually can't reach Last.fm, iTunes or the Mandalink API. Stub them with `page.route()` (fake JSON and a tiny PNG) to test covers, charts and the board.
- Without WebGL the page logs `Cannot access 'ac' before initialization`. That error is pre-existing, so don't chase it unless your change touches it.
- Start the server in the background and stop it by PID. `pkill -f http.server` also matches, and kills, the shell running it.

Merging to `main` publishes the site (GitHub Pages, live within a minute or two). Work goes on a branch, then a PR into `main`.

## Editing content

Rayan's editable data sits near the top of the main script, under `// ===== YOUR … =====` banner comments (search for `// ---------- content data ----------`):

- `VINYLS`: `[title, artist]` pairs. Covers come from Last.fm, then iTunes, at runtime, and they drive the vinyl section, the shelf and the crate in the room.
- `REVIEWS`: `{ album, artist, score, date, text, cover? }`, newest first, with `\n` for line breaks. A review's cover comes from `cover`, then the matching vinyl, then a Last.fm/iTunes lookup (`reviewCover`). Title matching folds accents, so `AftërLyfe` matches `Afterlyfe`. When `REVIEWS` is empty, the Writing section shows "Coming soon".
- `PHOTOS`, plus `PAPER_DOI` and `QUOTES` for the "At a glance" sheet. Leave these empty to keep their sections hidden.
- `news.json` holds the news pill (see External data below).

Use Rayan's own words for reviews and other writing; fix only what breaks the page (e.g. quoting).

## Architecture (the big picture)

- **Two views over the same content.** `#simple` (the "Simple version") holds the real content as `<section class="sec" data-s="KEY">` blocks (about, research, projects, sites, music, vinyl, writing, news, highlights, contact, vault, plus `only-panel` ones like swim and photos). Those sections are the **single source of truth**:
  - `openPanel(key)` copies a section's `innerHTML` into the room's side panel when you click an object or a dock button (`data-go="KEY"`).
  - `rosApp(k)` (RayanOS, the laptop desktop) copies sections into its windows, e.g. `sites`, `music` and `news`.
  - So when you change content, change the section, and don't rely on DOM injected into a section: it gets copied too. Visibility tweaks for the simple view belong in CSS scoped to `#simple .in>.sec` (not `.simple`: the "At a glance" sheet `#brief` reuses the `.simple` classes).
- **Simple view layout.** The simple view opens on a bento grid (`.bento` / `.bt` tiles). Each tile's `[data-more="KEY"]` opens one full section under the grid at a time (`bOpen`), and `.bback` ("↑ Top") closes it. In the simple view the little sites are opt-in only, behind the Sites tile and the `.xtoggle` button. RayanOS removes that toggle and shows them all.
- **The 3D world.** It is one big async IIFE: the room (WASD/joystick, click objects), then the city, story chapters, side quests, mini-games and other worlds (`enterWorld`/`exitWorld`, `travel(dest)`). Dialogue uses `say()` and achievements use `secret()`. If WebGL/THREE fails, the page falls back to the simple view.
- **Stories stay low-key.** Nothing points at them: the saga comic has no light or marker, the Meridian General doors are plain (no sign, cross or guide line), and no hint mentions the comic, story vault or hospital. Story content only runs once started: `sagaStarted()` / `storyStarted()` gate the phone's Story tab, The Quiet, and the Incursion fallout; the Tidy Man needs the lair found. Keep new story content behind the same checks.
- **Persistence.** Everything is in `localStorage` under `ru-*` keys. Every storage access is wrapped in `try/catch`; keep that pattern.
- **External data.** Several features load data from outside the page:
  - Last.fm charts and album covers (filled into `#lfmAlbums` and friends inside the music section);
  - the Mandalink announcements board (`anRender`), from the read-only API at `mychineseapp.onrender.com`. It's a free Render server, so the first load can take a while as it wakes up;
  - `news.json`, the news pill, which Mandalink also reads (give each new message a new `id`; it hides after `until`);
  - the private chat (`chatOpen`, `/#chat`): AES-GCM in the browser, ciphertext stored in Supabase; see `CHAT_SETUP.md`.

## Rules specific to this repo

- **The Mandalink code is frozen.** Don't modify these three regions unless explicitly asked:
  - `function radTile(` … `function toHub(){`;
  - the block from the `猴王闹海岛: the Mandalink story` banner comment to the **first** `// ---------- input ----------` after it (that marker appears twice in the file);
  - `function enterWorld(){` … `function exitWorld(){`.
  To verify, compare those slices against `git show 4d3c6d1:index.html`.
- Never put the chat password in the repo or site, and never use the Supabase `service_role` key; only the public anon key belongs in the page.
- Content must be factual: don't invent achievements, dates, numbers or credits for Rayan, and don't credit mentors or teachers.
- Phones must work: no horizontal scroll at 390px, touch controls intact, safe-area insets respected.
- `STORY_PLAN.md` and `MANDALINK_STORY_PLAN.md` are the design docs for story mode. `IDEAS.md` is an unpromised backlog; don't build from it unless asked.
