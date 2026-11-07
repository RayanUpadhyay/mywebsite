# Hangar Zero: design doc

Status: **plan only.** Nothing is built yet.

- **Site:** `hangarzero.rayanupadhyay.com`.
- **Where the code goes:** its own repo and Vercel project, like Unrendered. This repo only holds this design doc. Hangar Zero is not part of `index.html`.
- **What it is:** a combat-focused, third-person fighting game set in the rayanupadhyay.com world, after its story ends.

---

## Canon: where this sits

Hangar Zero starts the **morning after Book Nine, The Last Page**. Every final ending of the main site (write yourself out, write everyone in, close the book, the true last page) finishes the same way:

> Your room. Morning. On the desk, the comic is closed. You don't remember buying it. You remember everything else.

That's the first scene of Hangar Zero, word for word. The game works with **all four endings**:

- **One rule covers every ending:** whatever was written on the last page, some things weren't on it. Aliens and machines from the Books were left out of every ending, and they come loose into the real world.
- **The friendly aliens and the Council change with the ending.**
  - **Write everyone in:** the Dustwalkers, Lumins and Driftkin are neighbours, and the hostile aliens are the ones who refused to be written in.
  - **The other three endings:** they're stragglers.
  - The small lines that change are listed under "What it remembers" below.

- **The Monkey King:** after the Mandalink story, Wukong stays on the islands and races you whenever you visit (第七回 and the epilogue). He's there at the start of Hangar Zero.
- **Halcyon:** the main site's agency, with black tactical kit, visors, batons, sonic emitters and flamethrowers. Halcyon runs Hangar Zero. They're not new villains; they're the main site's own.
- **Unrendered:** set thirty years later, it remembers "the Mandalink islands sank". Hangar Zero is how that really happened.

## The premise

Mandalink island floats in the sky, through the round portal in your room. On this morning, it's under attack. Loose aliens have swarmed it, because a world built out of radicals is the one place in the story nobody ever wrote over.

Halcyon declares it an infestation. They harpoon the island with anchor chains, drag it down out of the sky, and hold it inside **Hangar Zero**, a sealed facility under the Thar desert. The islanders, Wukong and everything on the island are held with it.

You fight your way across your own city, then into Hangar Zero, then onto the island.

## The map: the whole of rayanupadhyay.com, accessible

The world is the main site's, in the main site's art style, and you can walk all of it. The Mandalink portal in your room is visible and open from the first scene.

| Zone | What's in it |
|---|---|
| **Your room** | The room as it is after the Last Page: the closed comic on the desk, and the **Mandalink portal** showing the sky and the floating islands |
| **The house** | The hallway, the ladder, the greenhouse, the bookshelf area |
| **The lair and the undercroft** | Under the house |
| **The rooftop and your tower** | Your roof, ten floors above Bangalore |
| **Bangalore** | The streets, the market, the Purple Line, parks, the Bugle office, Meridian General, the Space Centre |
| **The farm and the village** | Out through the greenhouse's north gate |
| **Mandalink world** | The hub, the radical islands and 云路 (the Cloud Road), first as normal, then dragged down into Hangar Zero |
| **Hangar Zero** | New. Levels 1–4 under the Thar desert (below) |
| **Other cities (stretch goal)** | Mumbai, Goa and Delhi are on the main site's map too. They come after the core game ships |

**Art style:** the same as the main site. The way to get that exactly is to reuse the main site's own world-building code (its room, house, lair, rooftop, city and Mandalink builders, and its `mat()` materials, lighting and soft shadows), copied into the new repo and trimmed down, not redrawn. Mandalink code is frozen in `index.html` and stays untouched there; Hangar Zero gets its own copy.

## Fighting

Third person, close to the camera, built for melee.

- **Light attack and heavy attack:** chain them into combos.
- **Dodge:** has invincibility frames, so a well-timed dodge goes straight through attacks.
- **Parry:** time it to an enemy's red flash to stun them.
- **Tag:** swap fighters mid-combo.
- **Super:** call the Monkey King once the meter is full.
- **Combo grade:** each fight is graded from D to S, and a high grade earns upgrades.

**The fighters:**
- **You:** the player, the one who remembers everything, with the main site's moves.
- **Mei Lin:** an islander, about your age, who fights with a staff. She unlocks in chapter 4.
- **Juno Okafor, 19:** a Halcyon junior archivist who switches sides in chapter 3, with a stolen shock baton. She's fast and her hits stun.
- **The Monkey King (super):** 金箍棒, 变大 (grow huge), 分身 (clones). His moves come from the Mandalink story.

**Enemies:**
- **Loose aliens:**
  - Grey drones, with stun beams.
  - Scaled soldiers, the Council's old troops, with rifles.
  - Berserker scraps: spider-like machine parts left over from the main site's Berserker campaign.
  - Ink-blots: half-written creatures that split when you hit them.
- **Halcyon:**
  - Riot troopers with shields and batons.
  - Hazmat sprayers, whose foam slows you.
  - Anchor drones that fire chain-harpoons and pull you in.
  - Sonic troopers, whose blasts knock you down.

## Chapters (one boss each)

1. **Morning.** Your room. The comic is closed. Something is scratching at the other side of the Mandalink portal, and aliens pour through into the house. Fight through the room, hallway and greenhouse. **Boss:** a Grey drone swarm that merges into one big drone in the greenhouse.
2. **The City.** Bangalore. Aliens are loose on the streets, and Halcyon vans are everywhere. On the rooftop you watch the anchor chains go up into the sky. **Boss:** a Halcyon riot captain on the rooftop of your tower.
3. **The Island Falls.** Through the portal to Mandalink world, as the chains drag it down. Fight across the hub while the islands tilt. You meet Juno, a Halcyon archivist who refuses to file the island as an "infestation", and she switches sides. **Boss:** an anchor drone the size of a bus. Beat it, and the island is gone from the sky anyway.
4. **Hangar Zero, Level 1–2.** Get into the facility: decontamination, then the observation ring, looking down at the chained island. **Boss:** Dr. Sana Whitlock's containment mech.
5. **The Island, chained.** Down onto the island inside the dome, where Mei Lin has been holding the troopers off alone. Tag-team fighting unlocks. Defend the islanders and Wukong's cave in a wave fight. **Boss:** a scaled general, the Council's last officer, who's been using the confusion to strip the island.
6. **The Levels Below.** Under the island are the levels from the main site, now inside the hangar. Wukong is chained at the bottom. Free him and his super unlocks fully. **Boss:** Director Ingrid Hale-Moreau of Halcyon, in a sonic exosuit.
7. **Collapse.** The anchors have torn the island's core and it's breaking apart. Fight across the falling island with everything you have. **Final boss:** a creature the island's loose aliens have merged into, held together with leftover ink from the Last Page.

## The ending

The island can't be saved. The anchors ripped its core out, and it collapses into the desert.

The Monkey King summons his cloud (筋斗云) and moves **everything** off it to a **new island**, raised from a cloud far above the old sky:
- the people, the temple bell, Mei Lin's family;
- the radical monuments;
- the Dust shapes and the friendly aliens who'd been hiding there.

Juno stays behind to write Halcyon's official report: *"Mandalink island: lost in containment breach. Public statement: sank in a storm."* That's the story Unrendered remembers, thirty years later.

**Last scene:** your room, the next morning. Through the portal is the new island, at sunrise. On the desk, the comic is still closed.

## What it remembers from the main site

These are small, one per chapter or so, and never explained:

- **The opening line:** taken word for word from the main site's ending.
- **The portal sign:** "齐天大圣到此一游" is still on Wukong's cloud by the Mandalink tablet.
- **Write everyone in:** if this was your ending, a Dustwalker neighbour shouts warnings from a balcony in chapter 2. Otherwise his balcony is empty.
- **Halcyon's kit:** exactly as the main site describes it.
- **The Courier's coat:** in Juno's Halcyon locker. It's an Unrendered nod, a story that hasn't happened yet.
- **Hale:** Deacon Hale's radio show is playing in the Halcyon guard post. Another Unrendered nod.
- **The Purple Line night train:** the only thing that sees the island fall.
- **The Wardens:** for one frame in the final fight, the ink the creature is held together with spells "we are writing now". Then it cuts off.

## Still to decide

- **The four endings:** read the player's main-site save (`ru-bk`, `end9`) to pick the ending-specific lines, or ask the player which ending they had on the title screen. Hangar Zero is its own site, so it can't read the main site's storage. That means **ask on the title screen**, with "I don't know" as an option.
- **How much of the city:** central Bangalore and the house first. Mumbai, Goa and Delhi only if the core game ships well.
- **Phones:** touch buttons for light, heavy, dodge, tag and super, plus the joystick.
