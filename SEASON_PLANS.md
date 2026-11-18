# Season plans

Plans for seasons that aren't built yet. Each season is four weeks with a chapter a week, its own original villain, a tool or vehicle you keep, three skins (story, challenge, villain) and a permanent change to the map. See the Seasons section of `CLAUDE.md` for how a season file plugs into the page.

## Season 2 · High Water (16 December 2026 – 12 January 2027)

### Story synopsis

**The cast**
- **You ({N}):** the hero of Landfall.
- **The Keeper:** still watching over the island, quieter now. They know more about the tear than they've said.
- **Nila (new):** the pilot of the pier ferry. Quick, funny and stubborn, she knows every channel in the city once the streets turn to water. She's been rebuilding an old jet skiff in her shed for years.
- **The Undertow (villain, original):** a tall figure made of moving seawater, with a crown of driftwood and a lantern of deep-sea light. It speaks slowly, like the tide, and keeps coming back to one line: *“Everything finds its level.”*
- **The Salvager:** beaten in Landfall. He turns up again, stuck and grumpy.

**Prologue (16 Dec, opening scene).** The night after the Salvager falls, the tear over Crash Isle stays open. Just after midnight it starts to rain out of a clear sky. Rain comes down through the tear, warm and salty and faintly blue. Far out west, the wall of water seen at the end of Landfall still stands on the horizon, not moving, as if it's waiting. By morning the low streets of Bangalore are underwater.

**Chapter 1 · Rising (16 Dec).**
- You wake to rain on the bedroom window. Outside, your street is ankle-deep, and the garage under your tower is flooded.
- At the pier, Nila is stuck: the ferry can't run when the roads are rivers. She hands you the skiff she's been rebuilding: “Don’t scratch it.” It's yours to keep.
- You race through the flooded districts rescuing people stranded on rooftops, bus shelters and an auto-rickshaw roof. The water isn't coming from the sea. It's welling up out of the storm drains, glowing blue.
- Things crawl out with it: **Driftlings**, scuttling shapes of wreckage held together by water.
- You and Nila shut the first floodgate at the canal mouth. **Bilge**, a hulking crab-like Driftling built from boat hulls, rams you to stop you; you fight it from the skiff.
- The gate closes and the water drops a little. Then, from every drain in the street at once, a voice: *“Everything finds its level.”*

**Chapter 2 · Undercurrent (23 Dec).**
- The Keeper explains that the water isn't Bangalore's. Under the city, where there should only be rock, there's a drowned district that was never built here. Something is pulling it up from below.
- Nila lends you her diving mask, and you go under. Swimming through drowned streets that look almost like Bangalore's, but older, you find air pockets in sunken rooms, and murals on the walls.
- The murals tell a story: a city on another world, a meteor key, a door opening, and the sea pouring in until nothing was left above the water. Standing at the city's edge in every mural is a robed figure with a lantern: a keeper, like ours.
- At the bottom waits **the Pearl Warden**, an eel-like guardian circling a nest of glowing pearls. Each pearl is an anchor pulling the drowned world through.
- Breaking the last pearl shows you the truth. The Undertow was that world's Keeper. It couldn't save its city, so it means to bring a new one home to it: Bangalore.

**Chapter 3 · The Floodgate (30 Dec).**
- The wall of water in the west starts to move. The city races to build a sea wall along the west coast, and it stays there for good after the season.
- The gates aren't finished, and the only crane big enough is on the Salvager's sunken barge. Over the radio, the Salvager is stranded on top of its crane as the tide climbs. “Fine. Get me off this thing, and you can have the crane.”
- You rescue him in the skiff. Grumbling, he swings the crane round to lift the last gate into place.
- Then you hold the wall against wave after wave of Driftlings while the gates close.
- At the end, **the Tide Engine** bursts out of the wall's pump house: a pump-monster that drags the tide up and lets it fall, so the ground you can stand on keeps changing.
- When it breaks, the gates slam shut and the great wave smashes against the new wall, and holds.

**Chapter 4 · High Water (6 Jan, finale).**
- The Undertow comes itself. It walks out of the sea onto Crash Isle, under the tear, carrying its lantern.
- The Keeper goes to meet it, and they recognise each other: two keepers from two worlds. “You opened the door,” says the Undertow. “Doors open both ways.” It doesn't hate Bangalore. It wants a city to keep again, and it means to take this one.
- The finale has three phases:
  1. On the skiff, through whirlpools, shooting at its lantern.
  2. On a platform that sinks as the tide rises.
  3. Up close under the tear, as the light in the lantern fails.
- When the lantern breaks, the drowned world's light goes out with it, and the Undertow stops. It isn't beaten so much as calmed. It sinks back through the tear. *“Then I will wait. Everything finds its level.”*
- The water drains out of the city.

**Epilogue (sets up Season 3 · The Carnival).**
- One low neighbourhood never quite dries out and becomes a canal district. Nila starts a water-taxi there.
- The Keeper watches the tear and says quietly, “Something else has noticed us.”
- On the drained lake bed, half-buried in silt, sits something that came through with the water: a striped ticket booth. A music box inside is still playing. On the counter is one ticket: **ADMIT ONE · {N}**.

### What you keep and what changes
- **Vehicle:** Nila's skiff, a small jet boat. It drives like the cars, but on water: through flooded streets, around the island and out to the other lands.
- **Weapons:**
  - Tide cannon: pushes enemies back.
  - Anchor flail: a heavy melee weapon with a wide spin.
  - Maybe a net launcher that slows enemies.
- **Skins:**
  - Story skin, Floodrunner: finish chapters 1–3.
  - Challenge skin, Abyssal: beat the Pearl Warden without surfacing for air.
  - Villain skin, Undertow's Crown: beat the finale.
- **Left on the map:** the canal district (water streets you can boat through, with Nila's water-taxi) and the sea wall on the west coast.
- **Winter crossover (it all runs in December):** floodwater freezes at night, the canals become skating lanes, and the skiff gets a light on the bow.
- **Scenes:**
  - an opening cutscene (the rain from the tear);
  - an intro and a payoff for every boss;
  - the finale under the tear;
  - a Season 2 trailer;
  - all replayable from the Season tab, like Season 1.

### Engine work it needs (in `index.html`, so later seasons can use it too)
- Crash Isle and the other Season 1 map changes must move out of `seasons/s01.js`, which stops loading on 16 Dec, or the island vanishes.
- Boat physics for the skiff.
- An underwater mode: swimming down, a breath meter, blue fog and air pockets.
- A water level that can rise and fall (flooded streets, tide arenas).
- Season 1's fights stay replayable after it ends, so latecomers can still earn its skins (to be decided).

## The Moon (saved for a future season)

**Premise.** The meteor came from the Moon. Something living inside it sends out keys like the meteor, and wherever one lands it opens a door and takes something back. This game's Moon is its own place, with air pockets, ruins and someone living inside it.

**Villain (original): the Archivist.** An ancient collector, tall and thin, with a coat of hanging lanterns. It sleeps in a vault deep inside the Moon, and each lantern holds a piece of a world it has taken.

**Kept for good.**
- A rocket, built on Crash Isle. Its launch pad stays on the map.
- A moon rover, a buggy with big, bouncy low-gravity jumps. You can bring it back and drive it in Bangalore.

**Chapters.**

| Chapter | What you do | Boss |
|---|---|---|
| 1 · Liftoff | Build the rocket on Crash Isle from scrap collected around the city. Launch cinematic, then a rough landing near the Moon's north pole, with Earth in the sky. | **The Welcome Party**: moon drones swarm the landing site. |
| 2 · Tranquility Base | An abandoned moonbase, with low gravity, an oxygen meter (refills at airlocks and tanks) and crew logs. | **The Custodian**, a robot that switches the base's gravity on and off. |
| 3 · The Dark Side | Drive the rover across the far side: glowing craters, chasms to jump, and diggers boring into the core. | **The Burrower**, a drilling machine that tunnels under you and bursts out. |
| 4 · Heart of the Moon | The vault inside the Moon, full of things taken from other worlds. | Three phases:<br>1. A rover chase down the spiral tunnel.<br>2. Zero gravity in the hollow core.<br>3. Close up as the vault collapses.<br>You escape on the rocket. |

**After the finale.** The Moon is left cracked, and stays that way in Bangalore's sky.

**Weapons.**
- Plasma lance: long reach.
- Gravity gun: pulls or pushes enemies and rocks.
- Star shot: hold to charge.

**Skins.** Moonwalker (story), Zero-G (beat the Custodian without touching the floor while gravity is off), Archivist's Lanterns (villain).

**Engine work.** A separate Moon world in `index.html` (the old world system is frozen Mandalink code), low and zero gravity, an oxygen meter, rocket launch and landing scenes, and the rover.
