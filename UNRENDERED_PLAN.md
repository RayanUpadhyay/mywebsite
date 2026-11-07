# Unrendered: design doc

Status: **built.** All nine chapters are playable. The game is one `index.html` for its own repo (see Where the code goes).

- **Site:** `unrendered.rayanupadhyay.com`.
- **Where the code goes:** a separate repo and Vercel project, like the other little sites. This repo only holds this design doc. Unrendered is not part of `index.html`.

---

## Tone

A bleak, post-apocalyptic Wild West. The story is a man struggling to survive in the ruins of a world players already know.

The world stays in ruins forever. Nothing grows back, nothing gets fixed, and there's no healing ending.

## Setting

Thirty years after the world of rayanupadhyay.com came apart, it's all ruins: the site's own map, wrecked. Ruined Bangalore, a gutted Meridian General, the Mandalink islands sunk, the ruins of Mumbai, the old Space Centre, and the bedroom buried somewhere out in the static.

## Characters

- **The Courier:** an old drifter with a revolver and not much else. His wife died in the collapse. He dies in the final chapter.
- **Deacon Hale and the Static Choir:** a cult that worships the static and hunts the Courier.
- **The Hollows:** people the static has emptied out.
- **Kiran:** old now, running a settlement in the ruins of Mumbai on rules and a ledger. He's an uneasy ally for the Courier.
- **The reptilians:** they come down to strip what's left of the world, from a mothership above it.

## Chapters

1. **Last Frame:** survival in ruined Bangalore: scavenging, hiding from the Hollows, getting through each night.
2. **The Salt Line:** the Courier crosses the dead land between cities while Deacon Hale and the Static Choir hunt him. He takes a wound that never heals.
3. **Kiran:** the Courier reaches Kiran's settlement in the ruins of Mumbai, and Kiran appears to die there.
4. **The Sky Opens:** the ruin isn't natural. Reptilians come down to strip what's left of the world.
5. **The Seam:** the Courier fights his way to the old Space Centre and takes a ship up. In the battle in space he rams the reptilian mothership and destroys it. The reptilians die with it, and so does the Courier.

The world stays in ruins.

## Part Two: Kiran

### Setup

The Courier dies destroying the reptilian mothership. Kiran survived Chapter 3, and he wakes up in Mumbai as a cyborg. He rebuilt himself from reptilian tech he scavenged from the mothership's wreckage. One of his eyes sees in static, and he can see seams of light across the sky.

### The threat: the Wardens

The Wardens are an older alien species who were here first. They sent the reptilians and they built the static. The reptilians were a cleanup crew working under a pact with them. By destroying the mothership, the Courier took away the Wardens' last reason to wait.

### Chapters

6. **Spare Parts:** Kiran learns his new body. A whole district disappears cleanly. It's the first sign of the Wardens.
7. **The Pact:** at a reptilian crash site, Kiran finds out about the pact. His implants let him move among the last reptilians, who are in hiding.
8. **Who Was Here First:** the twist. The bright Bangalore on rayanupadhyay.com was the Wardens' model of the world, built to study us. The ruins are that model being shut down. The cracks on the main site (the comic writing itself, the Clockmaker, "somebody is writing your ending") were the Wardens adjusting the experiment.
9. **Last Frame:** the Wardens come down, for the first and only time. Kiran can't stop them. He watches the planet fall apart, and he dies with it. There's no ledger, no last message and no title card: it cuts to black.

The world is destroyed for good. Nothing survives.

### How the Wardens fit the main site

Checked against `index.html`:

- **The Wardens are the main site's Hidden Species:** the ones who "wrote the Pact" and are "still writing". Their ink scene says "we wrote them all and we are writing now".
- **They aren't the friendly aliens:** the Dustwalker, Lumin and Driftkin ("the people who were here first") play no part in Unrendered.
- **The reptilians are the main site's Council of Scales.** In Unrendered they turn out to be a cleanup crew, not rulers. The elder says so in Chapter 7.

## Mechanics

- **Scavenging** for ammo, food and medicine.
- **Standoff duels.** The timing windows shrink as the Courier gets hurt.
- **Wounds carry across chapters.**
- **The final sequence strips the game away.** The HUD and abilities are removed one by one.
- **The space battle (Chapter 5):** first person in the ship. You steer with the look controls and shoot fighters down. When a fighter locks on (a red light and a click), you roll to dodge, the same rule as ducking. After eight kills the mothership turns towards you. Your guns go dead, and the ship drifts onto the seam on its own while the HUD is taken away piece by piece.
- **Kiran (Part Two):** an arm cannon that recharges (Charge) instead of rounds. A static eye (V / Eye) shows the seams and things hidden from the normal eye. He's faster and jumps higher, and he doesn't eat.
- **The ending (Chapter 9):** everything is stripped one by one: the map, inventory, health, clock, arm, crosshair, sound and words. Then the ground goes and the screen cuts to black, with no card. Only a small ↺ appears after a while, to get back to the start.

## Nods to the original site

- The ruined rayanupadhyay.com map is the setting itself.
- A bedroom with a record crate, buried in the static.
- "The Broker's bargain."
- A stopped clock showing the Clockmaker's time.
- Dust bunnies are the only animals left.

## Scope

- First-person 3D (Three.js r128), built on the ruined rayanupadhyay.com map.
- All nine chapters are playable and can be picked from **Chapters** on the title screen.
