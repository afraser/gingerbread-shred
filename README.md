# TODO

- [x] Abstract hit detection to a function that takes 2 bounding boxes and returns a boolean. We can use this for hit detection as well as for spawning.
- [x] Testing: draw hitboxes and improve collision detection.
- [x] Spawning: Rocks and trees should not be spawned on top of ramps.
- [ ] Spawning: Make spawning a function of available space, not time.
- [ ] Stop game timer on pause.
- [ ] Score is broken. Should be distance traveled downhill + jump scores (TBD).
- [x] Rendering: Add shadows to obstacles.
- [x] Code Duplication: Extract pause screen HTML to reusable function (duplicated 3x at lines 786-790, 840-844).
- [x] Code Duplication: Extract touch coordinate calculation to utility function (duplicated 3x).
- [x] Code Duplication: Consolidate resume/restart text ternary expressions into utility functions.
- [x] Logic Error: Fix comment at line 412 (says 30% but implements 50% chance).
- [x] Logic Error: Clarify invulnerability timing at line 415 (comment vs deltaTime scaling).
- [x] Logic Error: Remove redundant null check at lines 878-884 (touch.active always false).
- [ ] Dead Code: Initialize keys object with all properties (up/down missing at line 110).
- [ ] Dead Code: Remove unused touch.tapCount property (line 120, written but never read).
