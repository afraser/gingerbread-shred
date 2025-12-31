# 🏂 Gingerbread Shred

You're a gingerbread man on a snowboard. Show off your moves. Dodge obstacles. Don't lose your head.

🌲 Jump & dodge obstacles\
🚠 Launch off ramps\
🏂 Grind rails\
⛄ Score points for tricks\
🍪 Don't lose your head

### 🕹️ [Play Here](https://afraser.github.io/gingerbread-shred/)

# Ideas / TODO

- Bonus for landing on a rail from a ramp jump.
- Bonus for exiting a rail cleanly.
- Bonus for exiting a rail cleanly after backslide.
  - Count backslides and multiply same as the flip bonus.
- Bonus for jumping over an obstacle.
- Add height attribute to obstacle hit-box and use it to for collision in z-space. (No more bunny hopping trees)
- Name tricks.
- Log tricks and show them in receipt form at the end.
- Lodge at the bottom of the hill.
- New "Aprés Ski" screen:
  - Hot cocoa.
  - Tricks & point tally / receipt.
  - Render player sprite / HP remaining.
- New "crashed" screen:
  - Ski patrol, red cross.
  - Render body parts in a pile on a ski sled.
- New crash behavior:
  - Lost body part is dropped as an obstacle on the hill.
- Add a longer rail variant.
- Leaderboard
- Cliffs!
  - Must be able to enter from top & sides
  - When player hit-box occludes 50% in either dimension initiate a fall (z = player height at cliff entry point)
  - OR if player hits the side of a cliff hitbox then crumble() AND fall?
- Levels / Trails
  1. Implement min/max X-position: Render trees and/or stakes with pink tape along the edges.
  2. Make a level builder
  3. Intro screen: "free ride" / "load trail".
- Add debug mode
  - Show hit-boxes checkbox.
  - Invincibility checkbox.
  - Obstacle checkboxes.
