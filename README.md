# rayanupadhyay.com

My personal website, live at **[rayanupadhyay.com](https://rayanupadhyay.com)**.

Instead of a normal portfolio page, the site is a 3D room you can walk around in. The desk, laptop, bookshelf and music corner are how you find my research, projects and music, and the room opens out into a whole world of side stories and mini-games.

## What's inside

- **The room:** a first-person 3D bedroom built with Three.js. Walk with WASD or the on-screen joystick, look around, and click objects to open them. There's a guided tour for first-time visitors.
- **Research:** my published paper, *[Fairness and Dependency Preservation in Synthetic Credit Data](https://nhsjs.com/2026/fairness-and-dependency-preservation-in-synthetic-credit-data/)* (NHSJS, 2026), and work in progress.
- **Projects:** [Mandalink](https://mandalink.org), my Mandarin radicals app; AgriBridge, an Android app for farmers in India, which I presented at the 64th UN Commission for Social Development (the APK is in `downloads/`); and [MEDCON 2026](https://medcon.tisb.org).
- **Little sites:** small side projects on their own subdomains, linked from the Sites button, the laptop and the simple view: [tools](https://tools.rayanupadhyay.com), [study](https://study.rayanupadhyay.com), [wish](https://wish.rayanupadhyay.com) and [links](https://links.rayanupadhyay.com).
- **Music:** live charts from my Last.fm, a crate of my vinyl and speakers that play lo-fi.
- **News pill:** a short announcement driven by `news.json`, plus a news feed pulled from Mandalink's announcement board.
- **Story mode and mini-games:** a multi-chapter story that runs through the room, the city and several other worlds, with boss fights, side quests, a Mandalink world of radical islands, and a growing list of arcade games.
- **Private channel:** the walkie-talkie on the desk (or `/#chat`) opens an end-to-end encrypted, password-protected chat. See below.
- **Simple view** for anyone who just wants the information without the 3D, and a printable layout.

## Tech

The whole site is a single self-contained **`index.html`**: vanilla JavaScript, CSS, and [Three.js r128](https://threejs.org/) from cdnjs. There's no build step and no framework. It's hosted on GitHub Pages with a custom domain (`CNAME`).

| File | Purpose |
|---|---|
| `index.html` | The entire site |
| `news.json` | The current news-pill message, link and expiry date |
| `og-image.png` | Social preview image |
| `downloads/` | Files offered for download (AgriBridge APK) |
| `CNAME` | Custom domain for GitHub Pages |
| `CHAT_SETUP.md` | How to set up the private chat |
| `STORY_PLAN.md`, `MANDALINK_STORY_PLAN.md` | Design docs for the story modes |
| `IDEAS.md` | Backlog of future ideas |

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
