/** * GINGERBREAD SHRED: CRUMBLE EDITION
 * A Javascript port of the PICO-8 Design Doc
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const uiScore = document.getElementById("ui");
const startScreen = document.getElementById("startScreen");
const gameContainer = document.getElementById("gameContainer");

// --- BONUS TEXT DISPLAY ---

/**
 * Show floating bonus text above player
 * @param {number} points - Points to display
 */
function showBonus(points) {
  const bonusEl = document.createElement("div");
  bonusEl.className = "bonus-text";
  bonusEl.textContent = `+${points}`;

  // Position above player's head
  bonusEl.style.left = `${player.x}px`;
  bonusEl.style.top = `${player.y - 40}px`;

  gameContainer.appendChild(bonusEl);

  // Remove element after animation completes
  setTimeout(() => {
    bonusEl.remove();
  }, 1000);
}

// PICO-8 Palette approximation
const C = {
  white: "#fff1e8",
  black: "#000000",
  brown: "#ab5236", // Gingerbread
  green: "#008751", // Tree
  grey: "#5f574f", // Rock
  red: "#ff004d", // Buttons
  blue: "#29adff", // Sky/Ice
  light_grey: "#c2c3c7",
};

const TERMINAL_VELOCITY = 20;
const PLAYER_Y = 200; // Fixed screen Y position of player
const SHOW_HITBOXES = false; // Debug flag to visualize collision boxes

// Obstacle Type Definitions
const OBSTACLE_TYPES = {
  tree1: { w: 26, h: 20 }, // Tall Pine - narrow and tall
  tree2: { w: 30, h: 20 }, // Layered Tree - wider with stacked layers
  tree3: { w: 30, h: 20 }, // Bushy Tree - wide and short
  rock1: { w: 30, h: 15 }, // Off-center hump
  rock2: { w: 30, h: 15 }, // Classic jagged
  rock3: { w: 40, h: 15 }, // Wide flat rock
  ramp: { w: 60, h: 20 },
};

// Game State
let gameState = "MENU"; // MENU, PLAYING, GAMEOVER
let score = 0;
let gameSpeed = 3;
let shakeAmt = 0;
let cameraX = 0; // Camera position in world space

// Inputs
const keys = { left: false, right: false, up: false, down: false };

// Touch input state
let touch = {
  active: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  lastTapTime: 0,
};

// Entities
let player = {};
let obstacles = [];
let particles = [];
let snow = [];

// --- CANVAS SETUP ---

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Reinitialize player position if game is running
  if (gameState === "PLAYING" && player.x) {
    player.x = canvas.width / 2;
  }
}

// Initialize canvas size
resizeCanvas();

// Detect touch support
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

// --- UTILITY FUNCTIONS ---

/**
 * Get device-specific resume text
 * @returns {string} Resume instruction text based on device type
 */
function getResumeText() {
  return isTouchDevice ? "TAP TO RESUME" : "PRESS SPACE TO RESUME";
}

/**
 * Get device-specific restart text
 * @returns {string} Restart instruction text based on device type
 */
function getRestartText() {
  return isTouchDevice ? "TAP TO RESTART" : "PRESS SPACE TO RESTART";
}

/**
 * Get device-specific start text
 * @returns {string} Start instruction text based on device type
 */
function getStartText() {
  return isTouchDevice ? "TAP TO START" : "PRESS SPACE TO START";
}

/**
 * Display pause screen
 */
function setPauseScreen() {
  startScreen.innerHTML = `
        <h1>PAUSED</h1>
        <br>
        <p class="blink">${getResumeText()}</p>
    `;
  startScreen.style.display = "flex";
}

/**
 * Get touch coordinates relative to canvas
 * @param {TouchEvent} e - Touch event
 * @returns {{x: number, y: number}} Touch coordinates
 */
function getTouchCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.touches[0].clientX - rect.left,
    y: e.touches[0].clientY - rect.top,
  };
}

// Update start screen based on device type
function updateStartScreenInstructions() {
  if (isTouchDevice) {
    startScreen.innerHTML = `
            <h1>GINGERBREAD SHRED</h1>
            <p>Drag to Steer & Control Speed</p>
            <p>Double-Tap to Pause</p>
            <br>
            <p class="blink">${getStartText()}</p>
        `;
  } else {
    startScreen.innerHTML = `
            <h1>GINGERBREAD SHRED</h1>
            <p>Arrow Keys to Steer</p>
            <p>Up/Down to Control Speed</p>
            <p>ESC to Pause</p>
            <br>
            <p class="blink">${getStartText()}</p>
        `;
  }
}

// Set initial instructions
updateStartScreenInstructions();

// --- COLLISION DETECTION ---

/**
 * Check if two bounding boxes overlap.
 * @param {Object} box1 - First bounding box with {x, y, w, h}
 * @param {Object} box2 - Second bounding box with {x, y, w, h}
 * @returns {boolean} - True if boxes overlap, false otherwise
 */
function checkCollision(box1, box2) {
  return (
    box1.x < box2.x + box2.w &&
    box1.x + box1.w > box2.x &&
    box1.y < box2.y + box2.h &&
    box1.y + box1.h > box2.y
  );
}

// --- INITIALIZATION ---

function init() {
  score = 0;
  gameSpeed = 3;
  shakeAmt = 0;
  cameraX = 0;

  // Reset input state
  keys.left = false;
  keys.right = false;
  keys.down = false;
  keys.up = false;

  // Reset Player
  player = {
    x: canvas.width / 2, // Screen position (stays centered)
    y: PLAYER_Y,
    w: 40,
    h: 15, // Hitbox is small here because we only care if feet/board hit
    worldX: 0, // Position in world space
    angle: 0, // Direction angle (-1 to 1, 0 is straight down)
    dx: 0, // Horizontal velocity in world space
    hp: 4, // 4:Full, 3:NoArm, 2:NoArms, 1:HeadOnly
    invul: 0,
    z: 0, // Jump height
    dz: 0, // Jump velocity
    flipState: 0, // 0:upright, 1:laid-back, 2:upside-down, 3:laid-forward
    lastFlipState: 0, // Track previous flip state to detect completed rotations
    flipsCompleted: 0, // Count full rotations while airborne
    crashed: false,
    crashTimer: 0,
  };

  obstacles = [];
  particles = [];
  snow = [];

  // Init background snow
  for (let i = 0; i < 50; i++) {
    snow.push({
      worldX: (Math.random() - 0.5) * canvas.width * 2,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
    });
  }

  gameState = "PLAYING";
  startScreen.style.display = "none";
  uiScore.innerText = "SCORE: 0";

  loop();
}

// --- UPDATE LOOP ---

function update(deltaTime) {
  if (gameState !== "PLAYING") return;

  // Score based on distance traveled downhill
  score += gameSpeed * deltaTime * 10; // Distance-based scoring
  uiScore.innerText = "SCORE: " + Math.floor(score);

  if (Math.floor(score) % 500 === 0) gameSpeed += 0.5 * deltaTime;

  // Process touch input
  if (touch.active) {
    // Horizontal drag for steering (relative to touch start)
    const horizontalDrag = touch.startX - touch.currentX;
    if (horizontalDrag > 20) {
      // Dragged left = steer left
      keys.left = true;
      keys.right = false;
    } else if (horizontalDrag < -20) {
      // Dragged right = steer right
      keys.right = true;
      keys.left = false;
    } else {
      keys.left = false;
      keys.right = false;
    }

    // Vertical drag for speed control (relative to touch start)
    const verticalDrag = touch.startY - touch.currentY;
    if (verticalDrag > 20) {
      // Dragged up = slow down
      keys.up = true;
      keys.down = false;
    } else if (verticalDrag < -20) {
      // Dragged down = speed up
      keys.down = true;
      keys.up = false;
    } else {
      keys.up = false;
      keys.down = false;
    }
  }

  // Flip controls when airborne (only at reasonable speed)
  const minFlipSpeed = 2; // Minimum speed required to flip
  if (player.z > 0 && gameSpeed >= minFlipSpeed) {
    // Down arrow advances flip, Up arrow reverses flip
    if (keys.down) {
      player.flipState = (player.flipState + 1) % 4;
      keys.down = false; // Consume the key press
    }
    if (keys.up) {
      player.flipState = (player.flipState + 3) % 4; // +3 is same as -1 in mod 4
      keys.up = false; // Consume the key press
    }

    // Detect completed flip (returning to upright while airborne)
    if (player.flipState === 0 && player.lastFlipState !== 0) {
      // Completed a full rotation (either forward or backward)
      if (player.lastFlipState === 3 || player.lastFlipState === 1) {
        player.flipsCompleted++;
      }
    }

    player.lastFlipState = player.flipState;
  }

  // Acceleration (disabled when crashed)
  if (keys.down && player.z === 0 && !player.crashed) {
    gameSpeed = Math.min(TERMINAL_VELOCITY, gameSpeed + 0.05 * deltaTime * 60);
  }

  // Braking
  if (keys.up && player.z === 0) {
    gameSpeed = Math.max(0, gameSpeed - 0.15 * deltaTime * 60);

    // Snow cloud effect when braking
    if (gameSpeed > 0.5 && Math.random() < 0.3) {
      // Spawn snow particles beneath the snowboard
      for (let i = 0; i < 2; i++) {
        particles.push({
          worldX: player.worldX + Math.random() * 40, // Across full snowboard width
          y: player.y + 20, // Below the snowboard
          dx: (Math.random() - 0.5) * 5 + player.dx,
          dy: -2.5,
          w: 3 + Math.random() * 3,
          h: 3 + Math.random() * 3,
          color: "#fff",
          rot: 0,
          rSpeed: 0,
          life: 20 + Math.random() * 10, // Short lifetime
        });
      }
    }
  }

  // Scoot mode: when speed is very low, allow direct left/right movement
  const scootThreshold = 0.5;
  const isScootMode = gameSpeed < scootThreshold;

  if (isScootMode) {
    // Scoot left/right by directly moving worldX
    const scootSpeed = 140; // Pixels per second
    if (keys.left) {
      player.worldX -= scootSpeed * deltaTime;
      // Little hop animation when scooting
      if (player.z === 0) {
        player.dz = 3; // Small upward velocity
      }
    }
    if (keys.right) {
      player.worldX += scootSpeed * deltaTime;
      // Little hop animation when scooting
      if (player.z === 0) {
        player.dz = 3; // Small upward velocity
      }
    }
    player.angle = 0; // Reset angle when scooting
    player.dx = 0;
  } else {
    // Normal steering: adjust angle based on left/right
    if (keys.left) player.angle -= 0.06 * deltaTime * 60;
    if (keys.right) player.angle += 0.06 * deltaTime * 60;

    player.angle *= 0.99; // Angle decay
    player.angle = Math.max(-2, Math.min(2, player.angle)); // Clamp angle
    player.dx = player.angle * gameSpeed * 1.5;

    player.worldX += player.dx * deltaTime * 60; // Scale movement by deltaTime
  }

  // Jumping
  player.z += player.dz * deltaTime * 60;
  player.dz -= 0.4 * deltaTime * 60; // Gravity
  player.y -= player.dz * deltaTime * 60; // Make the player "jump"
  if (player.z < 0) {
    player.z = 0;
    player.dz = 0;
    player.y = PLAYER_Y; // Reset Y position when landing

    // Check for successful flip landing
    if (player.flipState === 0 && player.flipsCompleted > 0) {
      // Award bonus: 5000 per flip
      const flipBonus = player.flipsCompleted * 5000;
      score += flipBonus;
      showBonus(flipBonus);
    }

    // Check for crash landing (landing in non-upright state)
    if (player.flipState !== 0 && !player.crashed) {
      player.crashed = true;
      player.crashTimer = 60; // ~1 second recovery at 60fps
      gameSpeed *= 0.3; // Greatly diminish velocity
      if (player.flipState === 2) {
        hitPlayer(); // Hit if landing upside-down
      } else {
        crumble(); // Just crumble limbs otherwise
      }
    }

    // Reset flip tracking on landing
    player.flipsCompleted = 0;
    player.lastFlipState = 0;
  }
  cameraX = player.worldX;

  // Invulnerability ticker
  if (player.invul > 0) player.invul--;

  // Crash timer countdown and recovery
  if (player.crashed && player.crashTimer > 0) {
    player.crashTimer--;
    if (player.crashTimer === 0) {
      player.crashed = false;
      player.flipState = 0; // Return to upright
    }
  }

  // --- Screen Shake Decay ---
  if (shakeAmt > 0) shakeAmt *= 0.9;
  if (shakeAmt < 0.5) shakeAmt = 0;

  // --- Obstacle Spawner ---
  // Chance to spawn increases slightly with speed
  if (Math.random() < 0.03 + gameSpeed / 200) {
    const rand = Math.random();
    let type;

    if (rand < 0.5) {
      // 50% chance: tree (randomly pick variant)
      const treeVariant = Math.floor(Math.random() * 3) + 1;
      type = `tree${treeVariant}`;
    } else if (rand < 0.75) {
      // 25% chance: rock (randomly pick variant)
      const rockVariant = Math.floor(Math.random() * 3) + 1;
      type = `rock${rockVariant}`;
    } else {
      // 25% chance: ramp
      type = "ramp";
    }

    // Spawn in world coordinates around the visible area
    const worldXPos =
      player.worldX + (Math.random() - 0.5) * canvas.width * 1.5;

    // Create new obstacle
    const newObstacle = {
      type: type,
      worldX: worldXPos,
      y: canvas.height + 50,
      active: true,
    };

    // Check if new obstacle collides with existing obstacles
    const newObstacleDef = OBSTACLE_TYPES[newObstacle.type];
    const newBox = {
      x: newObstacle.worldX,
      y: newObstacle.y,
      w: newObstacleDef.w,
      h: newObstacleDef.h,
    };

    let canSpawn = true;
    for (let existing of obstacles) {
      const existingDef = OBSTACLE_TYPES[existing.type];
      const existingBox = {
        x: existing.worldX,
        y: existing.y,
        w: existingDef.w,
        h: existingDef.h,
      };

      if (checkCollision(newBox, existingBox)) {
        canSpawn = false;
        break;
      }
    }

    // Only add obstacle if it doesn't overlap with existing ones
    if (canSpawn) {
      obstacles.push(newObstacle);
    }
  }

  // --- Update Obstacles ---
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.y -= gameSpeed; // Move UP (simulating downhill)

    // Collision (in world space)
    if (o.active && player.invul === 0 && player.z === 0) {
      // Simple box collision using world coordinates
      const obstacleDef = OBSTACLE_TYPES[o.type];
      const playerBox = {
        x: player.worldX,
        y: player.y,
        w: player.w,
        h: player.h,
      };
      const obstacleBox = {
        x: o.worldX,
        y: o.y,
        w: obstacleDef.w,
        h: obstacleDef.h,
      };

      if (checkCollision(playerBox, obstacleBox)) {
        if (o.type === "ramp") {
          player.dz = gameSpeed * 1.5 + 5; // Jump boost
          const jumpBonus = Math.floor(100 * gameSpeed);
          score += jumpBonus; // Jump score bonus
          showBonus(jumpBonus);
          // Reset flip tracking when taking off
          player.flipsCompleted = 0;
          player.lastFlipState = 0;
        } else {
          hitPlayer();
        }
        o.active = false;
      }
    }

    // Cleanup - remove if off top of screen
    if (o.y < -50) obstacles.splice(i, 1);
  }

  // --- Update Particles (Limbs/Crumbs) ---
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.worldX += p.dx;
    p.y += p.dy;
    p.dy += 0.5; // Gravity
    p.rot += p.rSpeed;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // --- Update Background Snow ---
  snow.forEach((s) => {
    s.y += s.speed * 0.3; // Fall downward slowly

    // Wrap vertically
    if (s.y > canvas.height) {
      s.y = 0;
      s.worldX = player.worldX + (Math.random() - 0.5) * canvas.width * 2;
    }
  });
}

/** Handle player getting hit by an obstacle. */
function hitPlayer(crumbleThreshold = 0.5) {
  if (Math.random() < crumbleThreshold) {
    crumble();
    return; // 50% chance to avoid damage (luck)
  }
  player.hp--;
  player.invul = 120; // ~2 seconds invulnerability at 60fps
  shakeAmt = 15;

  // Spawn limb particles
  crumble();

  if (player.hp <= 0) {
    gameOver();
  }
}

/** Throw crumb particles. */
function crumble() {
  // Generate a "chunk"
  particles.push({
    worldX: player.worldX,
    y: player.y,
    dx: (Math.random() - 0.5) * 10,
    dy: (Math.random() - 0.5) * 10 - 5,
    w: 15,
    h: 15,
    color: C.brown,
    rot: 0,
    rSpeed: (Math.random() - 0.5) * 0.5,
    life: 100,
  });
  // Generate crumbs
  for (let i = 0; i < 5; i++) {
    particles.push({
      worldX: player.worldX,
      y: player.y,
      dx: (Math.random() - 0.5) * 15,
      dy: (Math.random() - 0.5) * 15,
      w: 5,
      h: 5,
      color: C.brown,
      rot: 0,
      rSpeed: 0,
      life: 60,
    });
  }
}

/** Handle Game Over state. */
function gameOver() {
  gameState = "GAMEOVER";
  startScreen.innerHTML = `
        <h1>CRUMBLED!</h1>
        <p>Score: ${Math.floor(score)}</p>
        <br>
        <p class="blink">${getRestartText()}</p>
    `;
  startScreen.style.display = "flex";
}

/**
 * --- DRAWING ---
 * Draw all game elements for a frame.
 */
function draw() {
  // Clear screen
  ctx.fillStyle = C.light_grey;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply Shake
  ctx.save();
  if (shakeAmt > 0) {
    let dx = (Math.random() - 0.5) * shakeAmt;
    let dy = (Math.random() - 0.5) * shakeAmt;
    ctx.translate(dx, dy);
  }

  // Draw Snow (Background)
  ctx.fillStyle = "#fff";
  snow.forEach((s) => {
    // Convert world X to screen X with parallax effect (0.5 = slower than obstacles)
    let screenX = (s.worldX - cameraX) * 0.5 + canvas.width / 2;

    // Only draw if visible
    if (screenX > -s.size && screenX < canvas.width + s.size) {
      ctx.fillRect(screenX, s.y, s.size, s.size);
    }
  });

  // Draw Obstacles
  obstacles.forEach((o) => {
    // Convert world X to screen X using camera offset
    let screenX = o.worldX - cameraX + canvas.width / 2;
    const obstacleDef = OBSTACLE_TYPES[o.type];

    // Only draw if visible on screen
    if (screenX > -obstacleDef.w && screenX < canvas.width + obstacleDef.w) {
      if (o.type === "tree1") drawTree(screenX, o.y, 1);
      else if (o.type === "tree2") drawTree(screenX, o.y, 2);
      else if (o.type === "tree3") drawTree(screenX, o.y, 3);
      else if (o.type === "rock1") drawRock(screenX, o.y, 1);
      else if (o.type === "rock2") drawRock(screenX, o.y, 2);
      else if (o.type === "rock3") drawRock(screenX, o.y, 3);
      else if (o.type === "ramp") drawRamp(screenX, o.y);

      // Draw hitbox
      if (SHOW_HITBOXES) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, o.y, obstacleDef.w, obstacleDef.h);
      }
    }
  });

  // Draw Particles
  particles.forEach((p) => {
    // Convert world X to screen X
    let screenX = p.worldX - cameraX + canvas.width / 2;

    ctx.save();
    ctx.translate(screenX, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  // Draw Player
  if (gameState !== "GAMEOVER") {
    // Blink if invulnerable
    if (Math.floor(player.invul / 4) % 2 === 0) {
      drawPlayer(player);

      // Draw player hitbox (in screen space)
      if (SHOW_HITBOXES) {
        const screenX = player.worldX - cameraX + canvas.width / 2;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, player.y, player.w, player.h);
      }
    }
  }

  // Draw touch indicators
  if (touch.active && gameState === "PLAYING") {
    drawTouchIndicators(touch.currentX, touch.currentY);
  }

  ctx.restore();
}

// --- TOUCH INDICATORS ---

function drawTouchIndicators(x, y) {
  const horizontalDrag = touch.startX - touch.currentX;
  const verticalDrag = touch.startY - touch.currentY;

  ctx.save();
  ctx.globalAlpha = 0.8;

  // Position indicators above the touch point
  const indicatorY = y - 80;
  let indicatorX = x;

  // Steering indicator (left/right arrows)
  if (horizontalDrag > 20) {
    // Left arrow
    drawArrow(indicatorX - 30, indicatorY, "left");
  } else if (horizontalDrag < -20) {
    // Right arrow
    drawArrow(indicatorX + 30, indicatorY, "right");
  }

  // Speed indicator (up/down arrows)
  if (verticalDrag > 20) {
    // Up arrow (slowing down)
    drawArrow(indicatorX, indicatorY - 40, "up");
  } else if (verticalDrag < -20) {
    // Down arrow (speeding up)
    drawArrow(indicatorX, indicatorY + 40, "down");
  }

  ctx.restore();
}

function drawArrow(x, y, direction) {
  ctx.fillStyle = C.white;
  ctx.strokeStyle = C.black;
  ctx.lineWidth = 2;
  ctx.lineJoin = "miter";

  ctx.beginPath();

  if (direction === "left") {
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 5, y - 10);
    ctx.lineTo(x + 5, y + 10);
  } else if (direction === "right") {
    ctx.moveTo(x + 15, y);
    ctx.lineTo(x - 5, y - 10);
    ctx.lineTo(x - 5, y + 10);
  } else if (direction === "up") {
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x - 10, y + 5);
    ctx.lineTo(x + 10, y + 5);
  } else if (direction === "down") {
    ctx.moveTo(x, y + 15);
    ctx.lineTo(x - 10, y - 5);
    ctx.lineTo(x + 10, y - 5);
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// --- ART ASSETS (Procedural) ---

function drawPlayer(player) {
  const { x, y, z, hp, angle, flipState } = player;
  ctx.save();
  ctx.translate(x, y);
  // Shift all drawing to align drawing with player hitbox coords
  ctx.translate(20, -10);

  // Tilt based on direction angle
  ctx.rotate(angle * 0.3);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 25 + z, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw Snowboard
  ctx.fillStyle = C.red;
  ctx.beginPath();
  ctx.roundRect(-20, 15, 40, 10, 10);
  ctx.fill();
  ctx.strokeStyle = C.black;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw player based on flip state
  if (flipState === 0) {
    // Upright (normal) position
    drawPlayerUpright(hp);
  } else if (flipState === 1) {
    // Laid-back position
    drawPlayerLaidBack(hp);
  } else if (flipState === 2) {
    // Upside-down (facing backward) position
    drawPlayerUpsideDown(hp);
  } else if (flipState === 3) {
    // Laid-forward position
    drawPlayerLaidForward(hp);
  }

  ctx.restore();
}

function drawPlayerUpright(hp) {
  if (hp > 0) {
    // HEAD (Always draw unless dead)
    // Position head lower when HP is 1 to sit on snowboard
    let headY = hp === 1 ? 3 : -15;
    let eyeY = hp === 1 ? 0 : -18;
    let mouthY = hp === 1 ? 8 : -10;

    ctx.fillStyle = C.brown;
    ctx.beginPath();
    ctx.arc(0, headY, 12, 0, Math.PI * 2); // Head
    ctx.fill();
    ctx.stroke();

    // Face
    ctx.fillStyle = "#fff"; // Eyes
    ctx.fillRect(-5, eyeY, 4, 4);
    ctx.fillRect(1, eyeY, 4, 4);
    ctx.fillStyle = C.red; // Mouth
    ctx.fillRect(-3, mouthY, 6, 2);
  }

  // TORSO & LEGS (Draw if HP > 1)
  if (hp > 1) {
    ctx.fillStyle = C.brown;
    // Body
    ctx.fillRect(-10, -5, 20, 20);
    ctx.strokeRect(-10, -5, 20, 20);
    // Buttons
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ARMS
  // Left Arm (Draw if HP > 2)
  if (hp > 2) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(-22, -5, 12, 8);
    ctx.strokeRect(-22, -5, 12, 8);
  }
  // Right Arm (Draw if HP > 3)
  if (hp > 3) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(10, -5, 12, 8);
    ctx.strokeRect(10, -5, 12, 8);
  }
}

function drawPlayerLaidBack(hp) {
  // Player leaning back, body tilted backward
  ctx.save();
  ctx.rotate(-0.5); // Lean back

  if (hp > 0) {
    // HEAD - positioned above body
    ctx.fillStyle = C.brown;
    ctx.beginPath();
    ctx.arc(0, -20, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Face
    ctx.fillStyle = "#fff";
    ctx.fillRect(-5, -23, 4, 4);
    ctx.fillRect(1, -23, 4, 4);
    ctx.fillStyle = C.red;
    ctx.fillRect(-3, -15, 6, 2);
  }

  // TORSO & LEGS
  if (hp > 1) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(-10, -5, 20, 20);
    ctx.strokeRect(-10, -5, 20, 20);
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ARMS - extended outward
  if (hp > 2) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(-25, -3, 15, 8);
    ctx.strokeRect(-25, -3, 15, 8);
  }
  if (hp > 3) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(10, -3, 15, 8);
    ctx.strokeRect(10, -3, 15, 8);
  }

  ctx.restore();
}

function drawPlayerUpsideDown(hp) {
  // Player completely upside down
  ctx.save();
  ctx.rotate(Math.PI); // 180 degrees

  if (hp > 0) {
    // HEAD - now at bottom when rotated
    let headY = hp === 1 ? 3 : -15;

    ctx.fillStyle = C.brown;
    ctx.beginPath();
    ctx.arc(0, headY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // TORSO & LEGS
  if (hp > 1) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(-10, -5, 20, 20);
    ctx.strokeRect(-10, -5, 20, 20);
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ARMS
  if (hp > 2) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(-22, -5, 12, 8);
    ctx.strokeRect(-22, -5, 12, 8);
  }
  if (hp > 3) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(10, -5, 12, 8);
    ctx.strokeRect(10, -5, 12, 8);
  }

  ctx.restore();
}

function drawPlayerLaidForward(hp) {
  // Player leaning forward, body tilted forward
  ctx.save();
  ctx.rotate(0.5); // Lean forward

  if (hp > 0) {
    // HEAD - positioned above body
    ctx.fillStyle = C.brown;
    ctx.beginPath();
    ctx.arc(0, -20, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Face
    ctx.fillStyle = "#fff";
    ctx.fillRect(-5, -23, 4, 4);
    ctx.fillRect(1, -23, 4, 4);
    ctx.fillStyle = C.red;
    ctx.fillRect(-3, -15, 6, 2);
  }

  // TORSO & LEGS
  if (hp > 1) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(-10, -5, 20, 20);
    ctx.strokeRect(-10, -5, 20, 20);
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ARMS - tucked in forward
  if (hp > 2) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(-25, 0, 15, 8);
    ctx.strokeRect(-25, 0, 15, 8);
  }
  if (hp > 3) {
    ctx.fillStyle = C.brown;
    ctx.fillRect(10, 0, 15, 8);
    ctx.strokeRect(10, 0, 15, 8);
  }

  ctx.restore();
}

function drawRamp(x, y) {
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x + 30, y + 22, 25, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ramp
  ctx.fillStyle = C.blue;
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + 50, y);
  ctx.lineTo(x + 60, y + 20);
  ctx.lineTo(x, y + 20);
  ctx.closePath();
  ctx.fill();
}

function drawTree(x, y, variant = 1) {
  // Shift entire tree up to include trunk in hitbox
  y = y - 10;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x + 18, y + 30, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (variant === 1) {
    // Variant 1: Tall Pine - narrow, tall triangle
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 25); // Top (higher)
    ctx.lineTo(x + 28, y + 20); // Bot Right (narrower)
    ctx.lineTo(x + 2, y + 20); // Bot Left (narrower)
    ctx.fill();
  } else if (variant === 2) {
    // Variant 2: Layered Tree - stacked triangles
    ctx.fillStyle = C.green;

    // Bottom layer
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 5);
    ctx.lineTo(x + 35, y + 20);
    ctx.lineTo(x - 5, y + 20);
    ctx.fill();

    // Middle layer
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 8);
    ctx.lineTo(x + 30, y + 8);
    ctx.lineTo(x, y + 8);
    ctx.fill();

    // Top layer
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 20);
    ctx.lineTo(x + 25, y - 5);
    ctx.lineTo(x + 5, y - 5);
    ctx.fill();
  } else {
    // Variant 3: Bushy Tree - wider, shorter triangle
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 10); // Top (lower)
    ctx.lineTo(x + 38, y + 20); // Bot Right (wider)
    ctx.lineTo(x - 8, y + 20); // Bot Left (wider)
    ctx.fill();
  }

  // Trunk
  ctx.fillStyle = C.brown;
  ctx.fillRect(x + 10, y + 20, 10, 10);
}

function drawRock(x, y, variant = 1) {
  // Shift entire tree up
  y = y - 5;

  if (variant === 1) {
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 22, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.grey;
    ctx.beginPath();
    // Variant 1: Off-center hump - peak shifted left
    ctx.moveTo(x, y + 20); // Bottom left
    ctx.lineTo(x + 3, y + 12); // Left side gentle
    ctx.lineTo(x + 8, y + 7); // Upper left
    ctx.lineTo(x + 12, y + 5); // Peak (left of center)
    ctx.lineTo(x + 15, y + 8); // Slope down
    ctx.lineTo(x + 22, y + 14); // Right side gentle
    ctx.lineTo(x + 28, y + 16); // Lower right
    ctx.lineTo(x + 30, y + 20); // Bottom right
  } else if (variant === 2) {
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 22, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.grey;
    ctx.beginPath();
    // Variant 2: Classic jagged rock
    ctx.moveTo(x, y + 20); // Bottom left (flat)
    ctx.lineTo(x + 3, y + 10); // Left side jagged
    ctx.lineTo(x + 7, y + 5); // Upper left
    ctx.lineTo(x + 12, y + 2); // Peak left
    ctx.lineTo(x + 18, y); // Highest peak
    ctx.lineTo(x + 23, y + 4); // Peak right
    ctx.lineTo(x + 27, y + 8); // Upper right
    ctx.lineTo(x + 30, y + 14); // Right side jagged
    ctx.lineTo(x + 30, y + 20); // Bottom right (flat)
  } else {
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 22, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.grey;
    ctx.beginPath();
    // Variant 3: Wide flat rock - horizontal emphasis
    ctx.moveTo(x, y + 20); // Bottom left (wider)
    ctx.lineTo(x + 5, y + 12); // Left side
    ctx.lineTo(x + 10, y + 8); // Upper left
    ctx.lineTo(x + 20, y + 5); // Low peak
    ctx.lineTo(x + 30, y + 8); // Upper right
    ctx.lineTo(x + 35, y + 12); // Right side
    ctx.lineTo(x + 40, y + 20); // Bottom right (wider)
  }

  ctx.closePath();
  ctx.fill();
}

// --- GAME LOOP ---

function loop() {
  if (gameState !== "PLAYING") return;
  const now = performance.now();
  const deltaTime = (now - lastTime) / 1000; // Convert to seconds
  lastTime = now;

  update(deltaTime);
  draw();
  requestAnimationFrame(loop);
}

let lastTime = performance.now();

// --- LISTENERS ---

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") keys.left = true;
  if (e.code === "ArrowRight") keys.right = true;
  if (e.code === "ArrowDown") keys.down = true;
  if (e.code === "ArrowUp") keys.up = true;
  if (e.code === "Escape") {
    if (gameState === "PLAYING") {
      gameState = "PAUSED";
      setPauseScreen();
    }
  }

  if (e.code === "Space") {
    if (gameState === "PAUSED") {
      gameState = "PLAYING";
      startScreen.style.display = "none";
      loop();
    } else if (gameState === "MENU" || gameState === "GAMEOVER") {
      init();
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "ArrowDown") keys.down = false;
  if (e.code === "ArrowUp") keys.up = false;
});

window.addEventListener("resize", () => {
  resizeCanvas();
});

// Touch event handlers
window.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const coords = getTouchCoordinates(e);

    touch.active = true;
    touch.startX = coords.x;
    touch.startY = coords.y;
    touch.currentX = coords.x;
    touch.currentY = coords.y;

    // Detect double-tap for pause (during gameplay only)
    const currentTime = Date.now();
    const tapGap = currentTime - touch.lastTapTime;

    if (tapGap < 300 && tapGap > 0) {
      // Double tap detected
      if (gameState === "PLAYING") {
        gameState = "PAUSED";
        setPauseScreen();
      }
      touch.lastTapTime = 0;
    } else {
      // Single tap
      touch.lastTapTime = currentTime;

      // Handle menu interactions with single tap
      if (gameState === "MENU" || gameState === "GAMEOVER") {
        init();
      } else if (gameState === "PAUSED") {
        gameState = "PLAYING";
        startScreen.style.display = "none";
        loop();
      }
    }
  },
  { passive: false }
);

window.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    if (!touch.active) return;

    const coords = getTouchCoordinates(e);
    touch.currentX = coords.x;
    touch.currentY = coords.y;
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    touch.active = false;

    // Reset keys when touch ends
    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;
  },
  { passive: false }
);
