# rayanupadhyay.com

My personal website, live at **[rayanupadhyay.com](https://rayanupadhyay.com)**.

Instead of a normal portfolio page, the site is a 3D room you can walk around in. The desk, laptop, bookshelf and music corner are how you find my research, projects and music, and the room opens out into a whole world of side stories and mini-games.

## What's inside

- **The room:** a first-person 3D bedroom built with Three.js. Walk with WASD or the on-screen joystick, look around, and click objects to open them. There's a guided tour for first-time visitors.
- **Research:** my published paper, *[Fairness and Dependency Preservation in Synthetic Credit Data](https://nhsjs.com/2026/fairness-and-dependency-preservation-in-synthetic-credit-data/)* (NHSJS, 2026), and work in progress.
- **Projects:** [Mandalink](https://mandalink.org), my Mandarin radicals app; AgriBridge, an Android app for farmers in India, which I presented at the 64th UN Commission for Social Development (the APK is in `downloads/`); and [MEDCON 2026](https://medcon.tisb.org).
- **Little sites:** small side projects on their own subdomains, linked from the Sites button, the laptop and the simple view: [tools](https://tools.rayanupadhyay.com), [study](https://study.rayanupadhyay.com), [wish](https://wish.rayanupadhyay.com), [links](https://links.rayanupadhyay.com), [agribridge](https://agribridge.rayanupadhyay.com) and [research](https://research.rayanupadhyay.com).
- **Music:** live charts from my Last.fm, a crate of my vinyl and speakers that play lo-fi.
- **News pill:** a short announcement driven by `news.json`, plus a news feed pulled from Mandalink's announcement board.
- **The city:** step out of the room into an island version of Bangalore, cut off from the other cities and the Far Range mountains by the sea. You can walk, drive, take the ferry or swim. Your tower has an underground garage with about ten vehicles to take out.
- **Seasons:** a new story every four weeks, starting 18 November 2026 (see below).
- **Mandalink story and mini-games:** a Mandalink world of radical islands, side quests and a growing list of arcade games.
- **Private channel:** the walkie-talkie on the desk (or `/#chat`) opens an end-to-end encrypted, password-protected chat. See below.
- **Simple view** for anyone who just wants the information without the 3D, and a printable layout.

## Seasons

The world runs in seasons of four weeks each, with a new chapter unlocking every week. Each season has its own villain, boss fights, a tool or vehicle you keep, three skins to earn and a change it leaves on the map for good. The phone's Season tab shows your progress, lets you replay the season's scenes, and holds your Loadout and Wardrobe.

### Season 1 · Landfall (18 November – 15 December 2026)

A meteor crashes into the sea off the west coast, and the Salvager wants every piece of it.

| Chapter | Unlocks | What happens |
|---|---|---|
| 1 · Impact | 18 Nov | The meteor comes down. The Keeper gives you a scanner at the ferry pier; find three fragments on the beaches, then fight off a scrapper ambush on the west beach. |
| 2 · Salvage | 25 Nov | The Salvager's drones race you to four more fragments. Take the ferry to his barge and beat the Hauler, an armoured rig you have to get behind. |
| 3 · Crash Isle | 2 Dec | A new island rises where the meteor fell. Find three crystal shards past the searchlights, beat the Foreman (shielded by crystal pylons) and light the core. |
| 4 · The Salvager | 9 Dec | The finale, in three phases: his drone swarm and magnet, his salvage mech, then him while the crater floods. |

- **Weapons you keep:** blaster pistol, scatter gun, scrap rifle, shard sword, heavy wrench and harpoon spear. You carry one gun and one melee weapon (Q switches; phones get Fire, Swing and Switch buttons).
- **Skins:** Crater Scout (light the core), Meteor Glow (beat the Foreman without being spotted) and Salvager's Rig (beat the finale).
- **Left on the map:** Crash Isle, with the core's beam.
- Every boss has an intro and an outro scene, and there's a Season 1 trailer in the Season tab.

Add `?week=N` to the address to preview a later chapter, or `?season=N` to preview another season.

## Tech

The whole site is a single self-contained **`index.html`** (apart from one small script per season): vanilla JavaScript, CSS, and [Three.js r128](https://threejs.org/) from cdnjs. There's no build step and no framework. It's hosted on GitHub Pages with a custom domain (`CNAME`).

| File | Purpose |
|---|---|
| `index.html` | The entire site |
| `seasons/` | One script per season (`s01.js` is Season 1), loaded only while that season runs |
| `news.json` | The current news-pill message, link and expiry date |
| `og-image.png` | Social preview image |
| `downloads/` | Files offered for download (AgriBridge APK) |
| `CNAME` | Custom domain for GitHub Pages |
| `CHAT_SETUP.md` | How to set up the private chat |
| `CLAUDE.md` | Notes on how the code fits together |
| `SEASON_PLANS.md` | Plans for seasons that aren't built yet |

## Running locally

Any static file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly mostly works too, but some features (like loading `news.json`) need it served over HTTP.

## Updating the news pill

Edit `news.json`:

```json
{
  "id": "open-house-2026",
  "message": "🚪 Free Open House badge on Mandalink, celebrating the launch of rayanupadhyay.com",
  "link": "https://mandalink.org",
  "linkText": "Claim it",
  "until": "2026-12-07"
}
```

Give each new message a new `id`. The pill stops showing after the `until` date.

## Private chat

Messages are encrypted in the browser with AES-GCM using a key derived from the room password (PBKDF2, 250,000 rounds), then stored in Supabase as ciphertext. Nobody without the password can read them, including Supabase. A wrong password just opens a different, empty room. Setup takes about five minutes and is described in [`CHAT_SETUP.md`](CHAT_SETUP.md); use a long password, since the ciphertext is publicly readable.

## Author

Rayan Upadhyay · [GitHub](https://github.com/RayanUpadhyay)
