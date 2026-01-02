/** GINGERBREAD SHRED */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiScore = document.getElementById('ui');
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');

// --- BONUS TEXT DISPLAY ---

/**
 * Show floating bonus text above player
 * @param {number} points - Points to display
 */
function showBonus(points) {
  if (!gameContainer) return; // Guard for test environment

  const bonusEl = document.createElement('div');
  bonusEl.className = 'bonus-text';
  bonusEl.textContent = `+${points}`;

  // Position above player's head
  bonusEl.style.left = `${player.x}px`;
  bonusEl.style.top = `${player.y - BONUS_TEXT_Y_OFFSET}px`;

  gameContainer.appendChild(bonusEl);

  // Remove element after animation completes
  setTimeout(() => {
    bonusEl.remove();
  }, BONUS_TEXT_DURATION_MS);
}

// Palette
const C = {
  white: '#fff1e8',
  black: '#000000',
  brown: '#ab5236', // Gingerbread
  green: '#008751', // Tree
  green2: '#30c873', // sprinkles
  grey: '#5f574f', // Rock
  red: '#ff004d', // Buttons
  blue: '#29adff', // Sky/Ice
  light_grey: '#c2c3c7',
};

// --- GAME CONSTANTS ---

// Display & Debug
const PLAYER_Y = 200; // Fixed screen Y position of player
const SHOW_HITBOXES = false; // Debug flag to visualize collision boxes

// Physics
const TERMINAL_VELOCITY = 20;
const GRAVITY = 0.4;
const PARTICLE_GRAVITY = 0.5;
const ANGLE_DECAY = 0.99;
const PLAYER_ROTATION_FACTOR = 0.3;

// Movement
const ACCELERATION_RATE = 0.05;
const ACCELERATION_Z_THRESHOLD = 2; // Disable acceleration when above this Z height. We use a small number here to allow accelerating out of a bunny hop.
const BRAKE_RATE = 0.15;
const STEERING_RATE = 0.06;
const AIRBORNE_STEERING_RATE = 0.03;
const LATERAL_VELOCITY_MULTIPLIER = 1.5;
const ANGLE_CLAMP_MIN = -2;
const ANGLE_CLAMP_MAX = 2;
const SCOOT_THRESHOLD = 0.5;
const SCOOT_SPEED = 140; // Pixels per second
const SCOOT_HOP_VELOCITY = 3;

// Game Mechanics
const INITIAL_GAME_SPEED = 3;
const INITIAL_HP = 4;
const MIN_FLIP_SPEED = 1.7;
const CRASH_SPEED_MULTIPLIER = 0.3;
const STUMBLE_SPEED_MULTIPLIER = 0.7;
const CRASH_RECOVERY_FRAMES = 60; // ~1 second at 60fps
const INVULNERABILITY_FRAMES = 120; // ~2 seconds at 60fps
const HIT_DODGE_CHANCE = 0.5;

// Jump & Flip
const JUMP_BOOST_MULTIPLIER = 1.5;
const JUMP_BOOST_BASE = 5;
const JUMP_BONUS_MULTIPLIER = 100;
const FLIP_BONUS_POINTS = 5000;
const ROTATION_BONUS_POINTS = 2500; // Bonus per 180º of spin on jumps

// Scoring
const SCORE_MULTIPLIER = 1;

// Spawning
const BASE_SPAWN_CHANCE = 0.03;
const SPAWN_SPEED_DIVISOR = 200;
const TREE_SPAWN_PROBABILITY = 0.5;
const ROCK_SPAWN_THRESHOLD = 0.75;
const OBSTACLE_SPAWN_WIDTH_MULTIPLIER = 1.5;
const OBSTACLE_SPAWN_Y_OFFSET = 50;
const OBSTACLE_CLEANUP_Y = -50;
const SNOW_PARTICLE_COUNT = 50;

// Touch Input
const TOUCH_DRAG_THRESHOLD = 20;
const DOUBLE_TAP_THRESHOLD_MS = 300;
const TOUCH_INDICATOR_ALPHA = 0.8;
const TOUCH_INDICATOR_Y_OFFSET = 80;
const TOUCH_INDICATOR_SPACING = 30;
const TOUCH_INDICATOR_VERTICAL_SPACING = 40;

// Visual Effects
const BONUS_TEXT_Y_OFFSET = 40;
const BONUS_TEXT_DURATION_MS = 1000;
const SCREEN_SHAKE_AMOUNT = 15;
const SCREEN_SHAKE_DECAY = 0.9;
const SCREEN_SHAKE_MIN_THRESHOLD = 0.5;
const SHADOW_OPACITY = 0.2;
const INVUL_BLINK_DIVISOR = 4;
const PARALLAX_FACTOR = 0.5;
const SNOW_FALL_SPEED = 0.3;

// Player Rendering Offsets
const PLAYER_RENDER_X_OFFSET = 20;
const PLAYER_RENDER_Y_OFFSET = -10;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 15;

// Particle Configuration
const BRAKE_PARTICLE_COUNT = 2;
const BRAKE_PARTICLE_MIN_LIFE = 20;
const BRAKE_PARTICLE_MAX_LIFE = 10;
const BRAKE_PARTICLE_Y_OFFSET = 20;
const BRAKE_PARTICLE_DY = -2.5;
const BRAKE_PARTICLE_MIN_SIZE = 3;
const BRAKE_PARTICLE_MAX_SIZE = 3;

// Movement Particles (turning & accelerating)
const MOVEMENT_PARTICLE_COUNT = 2;
const MOVEMENT_PARTICLE_MIN_LIFE = 15;
const MOVEMENT_PARTICLE_MAX_LIFE = 10;
const MOVEMENT_PARTICLE_MIN_SIZE = 2;
const MOVEMENT_PARTICLE_MAX_SIZE = 2;
const MIN_MOVEMENT_PARTICLE_SPEED = 3; // Only spawn particles above this speed
const CRUMB_COUNT = 5;
const CHUNK_SIZE = 15;
const CHUNK_LIFETIME = 100;
const CRUMB_SIZE = 5;
const CRUMB_LIFETIME = 60;

// Player States (formerly Flip States)
const PLAYER_STATE = {
  UPRIGHT: 0,
  LAID_BACK: 1,
  BACKSIDE_INVERTED: 2,
  LAID_FORWARD: 3,
  BACKSIDE: 4,
  INVERTED: 5,
  BACKSIDE_LAID_BACK: 6,
  BACKSIDE_LAID_FORWARD: 7,
};

const isInverted = (state) =>
  state === PLAYER_STATE.INVERTED || state === PLAYER_STATE.BACKSIDE_INVERTED;

const isPerfectlyUpright = (state) =>
  state === PLAYER_STATE.UPRIGHT || state === PLAYER_STATE.BACKSIDE;

const isBackside = (state) =>
  state === PLAYER_STATE.BACKSIDE || state === PLAYER_STATE.BACKSIDE_INVERTED;

const FLIP_ROTATION_LAID_BACK = -0.5;
const FLIP_ROTATION_LAID_FORWARD = 0.5;

// HP States
const HP_FULL = 4;
const HP_NO_ARM = 3;
const HP_NO_ARMS = 2;
const HP_HEAD_ONLY = 1;

// Obstacle Type Definitions
const OBSTACLE_TYPES = {
  tree1: { w: 20, h: 20 }, // Tall Pine - narrow and tall
  tree2: { w: 30, h: 20 }, // Layered Tree - wider with stacked layers
  tree3: { w: 30, h: 20 }, // Bushy Tree - wide and short
  rock1: { w: 30, h: 15 }, // Off-center hump
  rock2: { w: 30, h: 15 }, // Classic jagged
  rock3: { w: 40, h: 15 }, // Wide flat rock
  ramp: { w: 60, h: 20 }, // Jump ramp
  rail: { w: 12, h: 300 }, // Vertical rail running up/down mountain
};

// Rail/Grinding Constants
const RAIL_HEIGHT = 6; // Z height of the rail
const RAIL_GRIND_TOLERANCE = 0.5; // How close to rail height to initiate grind
const GRIND_START_MULTIPLIER = 10; // Velocity multiplier for starting a grind
const GRIND_START_EXPONENT = 4; // Exponent for grind starting bonus
const GRIND_POINTS_PER_DISTANCE = 2; // Base points per pixel traveled
const GRIND_SPEED_MULTIPLIER = 5; // Multiplier for gameSpeed bonus
const MIN_GRIND_SPEED = 2; // Minimum speed when grinding

// State cycle for airborne tricks
const FLIP_STATES = [
  PLAYER_STATE.UPRIGHT,
  PLAYER_STATE.LAID_BACK,
  PLAYER_STATE.BACKSIDE_INVERTED,
  PLAYER_STATE.LAID_FORWARD,
];

// 2D Rotation Grid for ramp jumps
// Vertical axis (up/down): rotation stages (upright -> laid back -> inverted -> laid forward)
// Horizontal axis (left/right): frontside (0) vs backside (1)
const ROTATION_GRID = [
  [
    PLAYER_STATE.UPRIGHT,
    PLAYER_STATE.BACKSIDE_LAID_FORWARD,
    PLAYER_STATE.BACKSIDE,
    PLAYER_STATE.LAID_BACK,
  ], // Vertical index 0
  [
    PLAYER_STATE.LAID_BACK,
    PLAYER_STATE.BACKSIDE_LAID_FORWARD,
    PLAYER_STATE.BACKSIDE_LAID_BACK,
    PLAYER_STATE.LAID_FORWARD,
  ], // Vertical index 1
  [
    PLAYER_STATE.BACKSIDE_INVERTED,
    PLAYER_STATE.LAID_FORWARD,
    PLAYER_STATE.INVERTED,
    PLAYER_STATE.BACKSIDE_LAID_BACK,
  ], // Vertical index 2
  [
    PLAYER_STATE.LAID_FORWARD,
    PLAYER_STATE.BACKSIDE_LAID_FORWARD,
    PLAYER_STATE.BACKSIDE_LAID_BACK,
    PLAYER_STATE.LAID_BACK,
  ], // Vertical index 3
];

// State cycle for grind tricks
const GRIND_STATES = [
  PLAYER_STATE.LAID_BACK,
  PLAYER_STATE.UPRIGHT,
  PLAYER_STATE.LAID_FORWARD,
  PLAYER_STATE.BACKSIDE,
];
const GRIND_TRICK_COOLDOWN = 0.15; // Seconds between flip changes while grinding

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let score = 0;
let gameSpeed = INITIAL_GAME_SPEED;
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
let trail = null; // Optional trail definition with width constraints

// --- CANVAS SETUP ---

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Reinitialize player position if game is running
  if (gameState === 'PLAYING' && player.x) {
    player.x = canvas.width / 2;
  }
}

// Initialize canvas size
resizeCanvas();

// Detect touch support
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// --- UTILITY FUNCTIONS ---

/**
 * Get device-specific resume text
 * @returns {string} Resume instruction text based on device type
 */
function getResumeText() {
  return isTouchDevice ? 'TAP TO RESUME' : 'PRESS SPACE TO RESUME';
}

/**
 * Get device-specific restart text
 * @returns {string} Restart instruction text based on device type
 */
function getRestartText() {
  return isTouchDevice ? 'TAP TO RESTART' : 'PRESS SPACE TO RESTART';
}

/**
 * Get device-specific start text
 * @returns {string} Start instruction text based on device type
 */
function getStartText() {
  return isTouchDevice ? 'TAP TO START' : 'PRESS SPACE TO START';
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
  startScreen.style.display = 'flex';
}

/**
 * Get touch coordinates relative to canvas
 * @param {TouchEvent} e - Touch event
 * @returns {{x: number, y: number}|null} Touch coordinates or null if no touches
 */
function getTouchCoordinates(e) {
  if (!e.touches || e.touches.length === 0) {
    return null;
  }
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.touches[0].clientX - rect.left,
    y: e.touches[0].clientY - rect.top,
  };
}

/**
 * Sync rotation coordinates from current player state
 * Finds the current state in the rotation grid and updates rotationVertical/Horizontal
 */
function syncRotationFromState() {
  for (let v = 0; v < ROTATION_GRID.length; v++) {
    for (let h = 0; h < ROTATION_GRID[v].length; h++) {
      if (ROTATION_GRID[v][h] === player.state) {
        player.rotationVertical = v;
        player.rotationHorizontal = h;
        return;
      }
    }
  }
  // Default to upright frontside if state not found
  player.rotationVertical = 0;
  player.rotationHorizontal = 0;
}

// Update start screen based on device type
function updateStartScreenInstructions() {
  if (isTouchDevice) {
    startScreen.innerHTML = `
            <h1>GINGERBREAD SHRED</h1>
            <br>
            <p class="blink">${getStartText()}</p>
        `;
  } else {
    startScreen.innerHTML = `
            <h1>GINGERBREAD SHRED</h1>
            <p>Arrow keys: Move</p>
            <p>Space: Jump</p>
            <p>Esc: Pause</p>
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
  gameSpeed = INITIAL_GAME_SPEED;
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
    y: PLAYER_Y, // y position on screen fixed except when jumping.
    w: PLAYER_WIDTH, // Hitbox width
    h: PLAYER_HEIGHT, // Hitbox is small here because we only care if feet/board hit
    worldX: 0, // Position in world space
    angle: 0, // Direction angle (-1 to 1, 0 is straight down)
    dx: 0, // Horizontal velocity in world space
    hp: INITIAL_HP, // 4:Full, 3:NoArm, 2:NoArms, 1:HeadOnly
    invul: 0, // Invulnerability timer
    z: 0, // Jump height
    dz: 0, // Jump velocity
    state: PLAYER_STATE.UPRIGHT, // Current player orientation
    lastState: PLAYER_STATE.UPRIGHT, // Track previous state to detect completed rotations
    flipsCompleted: 0, // Count full rotations while airborne
    halfSpinsCompleted: 0, // Count horizontal rotations (spins) while airborne
    rotationVertical: 0, // 2D rotation: vertical axis (0-3: upright, laid back, inverted, laid forward)
    rotationHorizontal: 0, // 2D rotation: horizontal axis (0=frontside, 1=backside)
    crashed: false,
    crashTimer: 0,
    grinding: false, // Is player currently grinding a rail?
    grindingRail: null, // Reference to the rail being ground
    grindDistance: 0, // Distance traveled while grinding (for scoring)
    grindTrickCooldown: 0, // Cooldown timer for flip changes while grinding
  };

  obstacles = [];
  particles = [];
  snow = [];

  // Init background snow
  for (let i = 0; i < SNOW_PARTICLE_COUNT; i++) {
    snow.push({
      worldX: (Math.random() - 0.5) * canvas.width * 2,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
    });
  }

  gameState = 'PLAYING';
  startScreen.style.display = 'none';
  uiScore.innerText = 'SCORE: 0';
  updateButtonVisibility();

  loop();
}

// --- OBSTACLE GENERATION ---

/**
 * Attempts to spawn a random obstacle based on current game speed and spawn rates.
 * Ensures new obstacles don't overlap with existing ones.
 */
function spawnRandomObstacle() {
  // Chance to spawn increases slightly with speed
  if (Math.random() < BASE_SPAWN_CHANCE + gameSpeed / SPAWN_SPEED_DIVISOR) {
    const rand = Math.random();
    let type;

    if (rand < TREE_SPAWN_PROBABILITY) {
      // 50% chance: tree (randomly pick variant)
      const treeVariant = Math.floor(Math.random() * 3) + 1;
      type = `tree${treeVariant}`;
    } else if (rand < ROCK_SPAWN_THRESHOLD) {
      // 25% chance: rock (randomly pick variant)
      const rockVariant = Math.floor(Math.random() * 3) + 1;
      type = `rock${rockVariant}`;
    } else if (rand < 0.875) {
      // 12.5% chance: ramp
      type = 'ramp';
    } else {
      // 12.5% chance: rail
      type = 'rail';
    }

    // Spawn in world coordinates around the visible area
    const worldXPos =
      player.worldX +
      (Math.random() - 0.5) * canvas.width * OBSTACLE_SPAWN_WIDTH_MULTIPLIER;

    // Create new obstacle
    const newObstacle = {
      type: type,
      worldX: worldXPos,
      y: canvas.height + OBSTACLE_SPAWN_Y_OFFSET,
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
}

// --- UPDATE LOOP ---

function update(deltaTime) {
  if (gameState !== 'PLAYING') return;

  // Score based on distance traveled downhill
  score += gameSpeed * deltaTime; // Distance-based scoring
  if (uiScore) {
    uiScore.innerText = 'SCORE: ' + Math.floor(score).toLocaleString();
  }

  // Touch input is now handled via on-screen buttons
  // (see touchstart/touchend event handlers)

  // 2D Rotation controls when airborne (only at reasonable speed)
  if (player.z > 0 && gameSpeed >= MIN_FLIP_SPEED && !player.grinding) {
    // Up/Down arrows: vertical rotation (upright -> laid back -> inverted -> laid forward)
    if (keys.down) {
      player.rotationVertical =
        (player.rotationVertical + 1) % ROTATION_GRID.length;
      player.state =
        ROTATION_GRID[player.rotationVertical][player.rotationHorizontal];
      keys.down = false; // Consume the key press
    }
    if (keys.up) {
      player.rotationVertical =
        (player.rotationVertical - 1 + ROTATION_GRID.length) %
        ROTATION_GRID.length;
      player.state =
        ROTATION_GRID[player.rotationVertical][player.rotationHorizontal];
      keys.up = false; // Consume the key press
    }

    // Left/Right arrows: horizontal flip (frontside <-> backside)
    if (keys.left) {
      player.rotationHorizontal =
        (player.rotationHorizontal + 1) %
        ROTATION_GRID[player.rotationVertical].length;
      player.state =
        ROTATION_GRID[player.rotationVertical][player.rotationHorizontal];
      keys.left = false; // Consume the key press
    }
    if (keys.right) {
      player.rotationHorizontal =
        (player.rotationHorizontal + 1) %
        ROTATION_GRID[player.rotationVertical].length;
      player.state =
        ROTATION_GRID[player.rotationVertical][player.rotationHorizontal];
      keys.right = false; // Consume the key press
    }

    // Detect flips (transitioning through inverted states)
    if (isInverted(player.state) && !isInverted(player.lastState)) {
      player.flipsCompleted++;
    }

    // Detect spins (crossing from frontside to backside or vice versa)

    const wasBackside = isBackside(player.lastState);
    const nowBackside = isBackside(player.state);
    if ((wasBackside && !nowBackside) || (!wasBackside && nowBackside)) {
      player.halfSpinsCompleted++;
    }

    player.lastState = player.state;
  }

  // Acceleration (disabled when crashed or in air)
  if (keys.down && player.z < ACCELERATION_Z_THRESHOLD && !player.crashed) {
    gameSpeed = Math.min(
      TERMINAL_VELOCITY,
      gameSpeed + ACCELERATION_RATE * deltaTime * 60
    );
  }

  // Braking
  if (keys.up && player.z === 0) {
    gameSpeed = Math.max(0, gameSpeed - BRAKE_RATE * deltaTime * 60);

    // Snow cloud effect when braking
    if (gameSpeed > SCOOT_THRESHOLD && Math.random() < 0.3) {
      for (let i = 0; i < BRAKE_PARTICLE_COUNT; i++) {
        particles.push(createBrakeParticle());
      }
    }
  }

  // Movement particles (turning and accelerating)
  if (player.z === 0 && gameSpeed > MIN_MOVEMENT_PARTICLE_SPEED) {
    // Turning left - particles spray out the right side
    if (keys.left && Math.random() < 0.3) {
      for (let i = 0; i < MOVEMENT_PARTICLE_COUNT; i++) {
        particles.push(
          createMovementParticle(
            player.worldX + player.w,
            gameSpeed * 0.3 + Math.random() * 2
          )
        );
      }
    }

    // Turning right - particles spray out the left side
    if (keys.right && Math.random() < 0.3) {
      for (let i = 0; i < MOVEMENT_PARTICLE_COUNT; i++) {
        particles.push(
          createMovementParticle(
            player.worldX,
            -gameSpeed * 0.3 - Math.random() * 2
          )
        );
      }
    }
  }

  // Scoot mode: when speed is very low, allow direct left/right movement
  const isScootMode = gameSpeed < SCOOT_THRESHOLD;

  // Calculate trail boundaries if trail is defined
  const trailLeftBound = trail ? -trail.width / 2 : -Infinity;
  const trailRightBound = trail ? trail.width / 2 : Infinity;

  if (isScootMode) {
    // Scoot left/right by directly moving worldX
    if (keys.left && player.worldX > trailLeftBound) {
      player.worldX -= SCOOT_SPEED * deltaTime;
      // Little hop animation when scooting
      if (player.z === 0) {
        player.dz = SCOOT_HOP_VELOCITY; // Small upward velocity
      }
    }
    if (keys.right && player.worldX < trailRightBound) {
      player.worldX += SCOOT_SPEED * deltaTime;
      // Little hop animation when scooting
      if (player.z === 0) {
        player.dz = SCOOT_HOP_VELOCITY; // Small upward velocity
      }
    }
    player.angle = 0; // Reset angle when scooting
    player.dx = 0;
  } else {
    // Normal steering: adjust angle based on left/right
    if (keys.left && player.worldX > trailLeftBound) {
      if (player.z > 0) {
        player.angle -= AIRBORNE_STEERING_RATE * deltaTime * 60;
      } else {
        player.angle -= STEERING_RATE * deltaTime * 60;
      }
    }
    if (keys.right && player.worldX < trailRightBound) {
      if (player.z > 0) {
        player.angle += AIRBORNE_STEERING_RATE * deltaTime * 60;
      } else {
        player.angle += STEERING_RATE * deltaTime * 60;
      }
    }

    player.angle *= ANGLE_DECAY; // Angle decay
    player.angle = Math.max(
      ANGLE_CLAMP_MIN,
      Math.min(ANGLE_CLAMP_MAX, player.angle)
    ); // Clamp angle
    player.dx = player.angle * gameSpeed * LATERAL_VELOCITY_MULTIPLIER;

    player.worldX += player.dx * deltaTime * 60; // Scale movement by deltaTime
  }

  // Clamp player position to trail bounds if trail is defined
  if (trail) {
    player.worldX = Math.max(trailLeftBound, Math.min(trailRightBound, player.worldX));
  }

  // Grinding physics
  if (player.grinding && player.grindingRail) {
    const railDef = OBSTACLE_TYPES.rail;

    // End grind if rail has moved off screen
    if (
      player.grindingRail.y + railDef.h < 0 ||
      player.grindingRail.y > canvas.height
    ) {
      player.grinding = false;
      player.grindingRail = null;
      player.grindDistance = 0;
      player.state = PLAYER_STATE.UPRIGHT; // Reset to upright when leaving rail
    } else {
      // Check if still colliding with rail
      const playerBox = {
        x: player.worldX,
        y: player.y,
        w: player.w,
        h: player.h,
      };
      const railBox = {
        x: player.grindingRail.worldX,
        y: player.grindingRail.y,
        w: railDef.w,
        h: railDef.h,
      };

      if (checkCollision(playerBox, railBox)) {
        // Still on rail - maintain grind
        player.z = RAIL_HEIGHT; // Lock to rail height
        player.dz = 0; // No falling
        player.y = PLAYER_Y - RAIL_HEIGHT; // Adjust visual height

        // Award points based on distance traveled and speed
        // Track both lateral movement and downward travel along the rail
        const lateralDistance = Math.abs(player.dx * deltaTime * 60);
        const downwardDistance = gameSpeed * deltaTime * 60;
        const totalDistance = Math.sqrt(
          lateralDistance * lateralDistance +
            downwardDistance * downwardDistance
        );

        const speedBonus = gameSpeed * GRIND_SPEED_MULTIPLIER;
        const pointsThisFrame = Math.floor(
          totalDistance * (GRIND_POINTS_PER_DISTANCE + speedBonus)
        );

        if (pointsThisFrame > 0) {
          score += pointsThisFrame;
          player.grindDistance += totalDistance;

          // Show bonus every 50 pixels traveled
          if (
            Math.floor(player.grindDistance / 50) >
            Math.floor((player.grindDistance - totalDistance) / 50)
          ) {
            showBonus(pointsThisFrame * 10); // Show accumulated bonus
          }
        }

        // Handle grind trick cycling with up/down arrows
        player.grindTrickCooldown -= deltaTime;
        if (player.grindTrickCooldown <= 0) {
          const grindStateIndex = GRIND_STATES.indexOf(player.state);
          if (keys.left) {
            // Cycle forward
            const nextIndex = (grindStateIndex + 1) % GRIND_STATES.length;
            player.state = GRIND_STATES[nextIndex];
            player.grindTrickCooldown = GRIND_TRICK_COOLDOWN;
          } else if (keys.right) {
            // Cycle backward
            const prevIndex =
              (grindStateIndex - 1 + GRIND_STATES.length) % GRIND_STATES.length;
            player.state = GRIND_STATES[prevIndex];
            player.grindTrickCooldown = GRIND_TRICK_COOLDOWN;
          }
        }
      } else {
        // Left the rail - resume normal physics
        player.grinding = false;
        player.grindingRail = null;
        player.grindDistance = 0;
        player.state = PLAYER_STATE.UPRIGHT; // Reset to upright when leaving rail
      }
    }
  }

  // Jumping (normal physics when not grinding)
  if (!player.grinding) {
    player.z += player.dz * deltaTime * 60;
    player.dz -= GRAVITY * deltaTime * 60; // Gravity
    player.y -= player.dz * deltaTime * 60; // Make the player "jump"
  }

  if (player.z <= 0) {
    player.z = 0;
    player.dz = 0;
    player.y = PLAYER_Y; // Reset Y position when landing

    // Check for successful flip landing
    if (
      isPerfectlyUpright(player.state) &&
      (player.flipsCompleted > 0 || player.halfSpinsCompleted > 0)
    ) {
      // Award bonus: points per flip + points per rotation
      const flipBonus = player.flipsCompleted * FLIP_BONUS_POINTS;
      const rotationBonus = player.halfSpinsCompleted * ROTATION_BONUS_POINTS;
      const totalBonus = flipBonus + rotationBonus;
      score += totalBonus;
      showBonus(totalBonus);
    }

    // Check for crash landing (landing in non-upright state)
    if (!isPerfectlyUpright(player.state) && !player.crashed) {
      player.crashed = true;
      player.crashTimer = CRASH_RECOVERY_FRAMES; // ~1 second recovery at 60fps
      if (isInverted(player.state)) {
        gameSpeed *= CRASH_SPEED_MULTIPLIER;
        hitPlayer(); // Hit if landing inverted
      } else {
        gameSpeed *= STUMBLE_SPEED_MULTIPLIER;
        crumble(); // Just crumble limbs otherwise
      }
      player.lastState = PLAYER_STATE.UPRIGHT;
    }

    // Reset flip and rotation tracking on landing
    player.flipsCompleted = 0;
    player.halfSpinsCompleted = 0;
    syncRotationFromState(); // Sync rotation coordinates with current state
  }
  cameraX = player.worldX;

  // Invulnerability ticker
  if (player.invul > 0) player.invul--;

  // Crash timer countdown and recovery
  if (player.crashed && player.crashTimer > 0) {
    player.crashTimer--;
    if (player.crashTimer === 0) {
      player.crashed = false;
      player.state = PLAYER_STATE.UPRIGHT; // Return to upright
    }
  }

  // --- Screen Shake Decay ---
  if (shakeAmt > 0) shakeAmt *= SCREEN_SHAKE_DECAY;
  if (shakeAmt < SCREEN_SHAKE_MIN_THRESHOLD) shakeAmt = 0;

  // --- Obstacle Spawner ---
  spawnRandomObstacle();

  // --- Update Obstacles ---
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.y -= gameSpeed; // Move UP (simulating downhill)

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

    // Collision (in world space)
    if (o.active && player.invul === 0 && player.z === 0) {
      if (checkCollision(playerBox, obstacleBox)) {
        if (o.type === 'ramp') {
          player.dz = gameSpeed * JUMP_BOOST_MULTIPLIER + JUMP_BOOST_BASE; // Jump boost
          const jumpBonus = Math.floor(JUMP_BONUS_MULTIPLIER * gameSpeed);
          score += jumpBonus; // Jump score bonus
          showBonus(jumpBonus);
          // Reset flip and rotation tracking when taking off
          player.flipsCompleted = 0;
          player.halfSpinsCompleted = 0;
          player.lastState = player.state; // Preserve current state
          syncRotationFromState(); // Sync rotation coordinates with current state
          o.active = false;
        } else {
          hitPlayer();
          o.active = false;
        }
      }
    } else if (
      !player.grinding &&
      player.z > 0 &&
      !isInverted(player.state) &&
      player.z < RAIL_HEIGHT + RAIL_GRIND_TOLERANCE &&
      o.type === 'rail' &&
      checkCollision(playerBox, obstacleBox)
    ) {
      // start grind
      player.grinding = true;
      player.grindingRail = o;
      player.z = RAIL_HEIGHT; // Lock to rail height
      player.dz = 0; // Stop falling
      player.grindDistance = 0; // Reset distance tracker
      player.grindTrickCooldown = 0; // Reset cooldown
      // player.state = GRIND_STATES[0]; // Start with laid-back

      // Accelerate if starting grind with low speed
      if (gameSpeed < MIN_GRIND_SPEED) {
        gameSpeed = MIN_GRIND_SPEED;
      }

      const grindStartBonus = Math.floor(
        GRIND_START_MULTIPLIER * gameSpeed ** GRIND_START_EXPONENT
      );
      score += grindStartBonus;
      showBonus(grindStartBonus);
    } else if (
      player.grinding &&
      player.grindingRail === o &&
      !checkCollision(playerBox, obstacleBox)
    ) {
      // end grind if we leave THIS rail (the one we're grinding)
      player.grinding = false;
      player.grindingRail = null;
      player.grindDistance = 0;
      player.state = PLAYER_STATE.UPRIGHT; // Reset to upright when leaving rail
    }

    // Cleanup - remove if off top of screen
    // For rails, need to account for their full height (300px)
    const cleanupThreshold =
      o.type === 'rail' ? -OBSTACLE_TYPES.rail.h : OBSTACLE_CLEANUP_Y;
    if (o.y < cleanupThreshold) obstacles.splice(i, 1);
  }

  // --- Update Particles (Limbs/Crumbs/Snow) ---
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.worldX += p.dx;
    p.y += p.dy;
    p.dy += PARTICLE_GRAVITY; // Gravity
    p.rot += p.rSpeed;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // --- Update Background Snow ---
  snow.forEach((s) => {
    s.y += s.speed * SNOW_FALL_SPEED; // Fall downward slowly

    // Wrap vertically
    if (s.y > canvas.height) {
      s.y = 0;
      s.worldX = player.worldX + (Math.random() - 0.5) * canvas.width * 2;
    }
  });
}

/** Handle player getting hit by an obstacle. */
function hitPlayer(crumbleThreshold = HIT_DODGE_CHANCE) {
  if (Math.random() < crumbleThreshold) {
    crumble();
    return; // 50% chance to avoid damage (luck)
  }
  player.hp--;
  player.invul = INVULNERABILITY_FRAMES; // ~2 seconds invulnerability at 60fps
  player.state = PLAYER_STATE.BACKSIDE_INVERTED; // womp womp
  shakeAmt = SCREEN_SHAKE_AMOUNT;

  // Spawn limb particles
  crumble();

  if (player.hp <= 0) {
    gameOver();
  }
}

/**
 * Helper function to create a particle object
 */
function createParticle(worldX, y, dx, dy, w, h, color, rot, rSpeed, life) {
  return { worldX, y, dx, dy, w, h, color, rot, rSpeed, life };
}

/**
 * Create a brake particle (snow cloud effect)
 */
function createBrakeParticle() {
  return createParticle(
    player.worldX + Math.random() * player.w,
    player.y + BRAKE_PARTICLE_Y_OFFSET,
    (Math.random() - 0.5) * 5 + player.dx,
    BRAKE_PARTICLE_DY,
    BRAKE_PARTICLE_MIN_SIZE + Math.random() * BRAKE_PARTICLE_MAX_SIZE,
    BRAKE_PARTICLE_MIN_SIZE + Math.random() * BRAKE_PARTICLE_MAX_SIZE,
    '#fff',
    0,
    0,
    BRAKE_PARTICLE_MIN_LIFE + Math.random() * BRAKE_PARTICLE_MAX_LIFE
  );
}

/**
 * Create a movement particle (turning spray)
 */
function createMovementParticle(worldX, dx) {
  return createParticle(
    worldX,
    player.y + 10 + Math.random() * 10,
    dx,
    -1 - Math.random() * 2,
    MOVEMENT_PARTICLE_MIN_SIZE + Math.random() * MOVEMENT_PARTICLE_MAX_SIZE,
    MOVEMENT_PARTICLE_MIN_SIZE + Math.random() * MOVEMENT_PARTICLE_MAX_SIZE,
    '#fff',
    0,
    0,
    MOVEMENT_PARTICLE_MIN_LIFE + Math.random() * MOVEMENT_PARTICLE_MAX_LIFE
  );
}

/**
 * Create a crumble chunk particle
 */
function createCrumbleChunk() {
  return createParticle(
    player.worldX,
    player.y,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10 - 5,
    CHUNK_SIZE,
    CHUNK_SIZE,
    C.brown,
    0,
    (Math.random() - 0.5) * 0.5,
    CHUNK_LIFETIME
  );
}

/**
 * Create a crumb particle
 */
function createCrumb() {
  return createParticle(
    player.worldX,
    player.y,
    (Math.random() - 0.5) * 15,
    (Math.random() - 0.5) * 15,
    CRUMB_SIZE,
    CRUMB_SIZE,
    C.brown,
    0,
    0,
    CRUMB_LIFETIME
  );
}

/** Throw crumb particles. */
function crumble() {
  particles.push(createCrumbleChunk());
  for (let i = 0; i < CRUMB_COUNT; i++) {
    particles.push(createCrumb());
  }
}

/** Handle Game Over state. */
function gameOver() {
  gameState = 'GAMEOVER';
  startScreen.innerHTML = `
        <h1>CRUMBLED!</h1>
        <p>Score: ${Math.floor(score)}</p>
        <br>
        <p class="blink">${getRestartText()}</p>
    `;
  startScreen.style.display = 'flex';
  updateButtonVisibility();
}

/**
 * Get the visual bottom Y position of an obstacle (excluding shadow)
 * @param {Object} obstacle - The obstacle object
 * @returns {number} The Y coordinate of the obstacle's visual bottom
 */
function getObstacleBottom(obstacle) {
  // Rocks have a smaller visual bottom due to their y-shift
  if (obstacle.type.startsWith('rock')) {
    return obstacle.y + 15;
  }
  // Rails run vertically down the mountain
  if (obstacle.type === 'rail') {
    return obstacle.y + 300; // Full length of the rail
  }
  // Trees and ramps
  return obstacle.y + 20;
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
  ctx.fillStyle = '#fff';
  snow.forEach((s) => {
    // Convert world X to screen X with parallax effect (0.5 = slower than obstacles)
    let screenX = (s.worldX - cameraX) * PARALLAX_FACTOR + canvas.width / 2;

    // Only draw if visible
    if (screenX > -s.size && screenX < canvas.width + s.size) {
      ctx.fillRect(screenX, s.y, s.size, s.size);
    }
  });

  // Player visual bottom for depth sorting
  const playerBottom = player.y + 15;

  // Draw Obstacles BEHIND player (visual bottom <= player bottom, or rails which are always behind)
  obstacles.forEach((o) => {
    const obstacleBottom = getObstacleBottom(o);
    // Rails are always drawn behind the player (player grinds on top)
    const isRail = o.type === 'rail';
    if (!isRail && obstacleBottom > playerBottom) return; // Skip, will draw later

    // Convert world X to screen X using camera offset
    let screenX = o.worldX - cameraX + canvas.width / 2;
    const obstacleDef = OBSTACLE_TYPES[o.type];

    // Only draw if visible on screen
    if (screenX > -obstacleDef.w && screenX < canvas.width + obstacleDef.w) {
      if (o.type === 'tree1') drawTree(screenX, o.y, 1);
      else if (o.type === 'tree2') drawTree(screenX, o.y, 2);
      else if (o.type === 'tree3') drawTree(screenX, o.y, 3);
      else if (o.type === 'rock1') drawRock(screenX, o.y, 1);
      else if (o.type === 'rock2') drawRock(screenX, o.y, 2);
      else if (o.type === 'rock3') drawRock(screenX, o.y, 3);
      else if (o.type === 'ramp') drawRamp(screenX, o.y);
      else if (o.type === 'rail') drawRail(screenX, o.y);

      // Draw hitbox
      if (SHOW_HITBOXES) {
        ctx.strokeStyle = 'red';
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
  if (gameState !== 'GAMEOVER') {
    // Blink if invulnerable
    if (Math.floor(player.invul / INVUL_BLINK_DIVISOR) % 2 === 0) {
      drawPlayer(player);

      // Draw player hitbox (in screen space)
      if (SHOW_HITBOXES) {
        const screenX = player.worldX - cameraX + canvas.width / 2;
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, player.y, player.w, player.h);
      }
    }
  }

  // Draw Obstacles IN FRONT of player (visual bottom > player bottom, excluding rails)
  obstacles.forEach((o) => {
    const obstacleBottom = getObstacleBottom(o);
    // Rails are always drawn in the behind pass
    if (o.type === 'rail' || obstacleBottom <= playerBottom) return; // Already drawn

    // Convert world X to screen X using camera offset
    let screenX = o.worldX - cameraX + canvas.width / 2;
    const obstacleDef = OBSTACLE_TYPES[o.type];

    // Only draw if visible on screen
    if (screenX > -obstacleDef.w && screenX < canvas.width + obstacleDef.w) {
      if (o.type === 'tree1') drawTree(screenX, o.y, 1);
      else if (o.type === 'tree2') drawTree(screenX, o.y, 2);
      else if (o.type === 'tree3') drawTree(screenX, o.y, 3);
      else if (o.type === 'rock1') drawRock(screenX, o.y, 1);
      else if (o.type === 'rock2') drawRock(screenX, o.y, 2);
      else if (o.type === 'rock3') drawRock(screenX, o.y, 3);
      else if (o.type === 'ramp') drawRamp(screenX, o.y);

      // Draw hitbox
      if (SHOW_HITBOXES) {
        ctx.strokeStyle = 'blue'; // Different color for obstacles in front
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, o.y, obstacleDef.w, obstacleDef.h);
      }
    }
  });

  ctx.restore();
}

// --- GAME LOOP ---

function loop() {
  if (gameState !== 'PLAYING') return;
  const now = performance.now();
  let deltaTime = (now - lastTime) / 1000; // Convert to seconds
  lastTime = now;

  // Clamp deltaTime to prevent physics issues from time anomalies
  // (system time changes, tab suspension, etc.)
  deltaTime = Math.max(0, Math.min(deltaTime, 0.1)); // Max 100ms per frame

  update(deltaTime);
  draw();
  requestAnimationFrame(loop);
}

let lastTime = performance.now();

// --- LISTENERS ---

window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'ArrowDown') keys.down = true;
  if (e.code === 'ArrowUp') keys.up = true;
  if (e.code === 'Space') {
    if (player.z === 0) {
      player.dz = 6; // JUMP!
      if (gameSpeed < 2) gameSpeed += 0.7;
    } else if (player.grinding) {
      player.dz = 5;
      player.grinding = false;
      player.grindingRail = null;
    }
  }
  if (e.code === 'Escape') {
    if (gameState === 'PLAYING') {
      gameState = 'PAUSED';
      setPauseScreen();
      updateButtonVisibility();
    }
  }

  if (e.code === 'Space') {
    if (gameState === 'PAUSED') {
      gameState = 'PLAYING';
      startScreen.style.display = 'none';
      updateButtonVisibility();
      loop();
    } else if (gameState === 'MENU' || gameState === 'GAMEOVER') {
      init();
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'ArrowRight') keys.right = false;
  if (e.code === 'ArrowDown') keys.down = false;
  if (e.code === 'ArrowUp') keys.up = false;
});

window.addEventListener('resize', () => {
  resizeCanvas();
});

// Touch event handlers
window.addEventListener(
  'touchstart',
  (e) => {
    e.preventDefault();
    const coords = getTouchCoordinates(e);
    if (!coords) return; // Guard against invalid touch data

    touch.active = true;
    touch.startX = coords.x;
    touch.startY = coords.y;
    touch.currentX = coords.x;
    touch.currentY = coords.y;

    // Detect double-tap for pause (during gameplay only)
    const currentTime = Date.now();
    const tapGap = currentTime - touch.lastTapTime;

    if (tapGap < DOUBLE_TAP_THRESHOLD_MS && tapGap > 0) {
      // Double tap detected
      if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        setPauseScreen();
        updateButtonVisibility();
      }
      touch.lastTapTime = 0;
    } else {
      // Single tap
      touch.lastTapTime = currentTime;

      // Handle menu interactions with single tap
      if (gameState === 'MENU' || gameState === 'GAMEOVER') {
        init();
      } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        startScreen.style.display = 'none';
        updateButtonVisibility();
        loop();
      }
    }
  },
  { passive: false }
);

window.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault();
    if (!touch.active) return;

    const coords = getTouchCoordinates(e);
    if (!coords) return; // Guard against invalid touch data

    touch.currentX = coords.x;
    touch.currentY = coords.y;
  },
  { passive: false }
);

window.addEventListener(
  'touchend',
  (e) => {
    e.preventDefault();
    touch.active = false;
  },
  { passive: false }
);

// Mobile control buttons - Function to update button visibility based on game state
function updateButtonVisibility() {
  const shouldShow = isTouchDevice && gameState === 'PLAYING';
  const buttons = [
    document.getElementById('btn-left'),
    document.getElementById('btn-right'),
    document.getElementById('btn-up'),
    document.getElementById('btn-down'),
    document.getElementById('btn-pause'),
    document.getElementById('btn-jump-left'),
    document.getElementById('btn-jump-right'),
  ];

  buttons.forEach((btn) => {
    if (shouldShow) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
}

// Helper function to add event listeners to a direction button
function addDirectionButtonListeners(button, direction) {
  // Handle touchstart - press button
  button.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      button.classList.add('pressed');
      keys[direction] = true;
    },
    { passive: false }
  );

  const releaseButton = (e) => {
    e.preventDefault();
    e.stopPropagation();
    button.classList.remove('pressed');
    keys[direction] = false;
  };

  // Handle touchend - release button
  button.addEventListener('touchend', releaseButton, { passive: false });

  // Handle touchcancel - release button if touch is cancelled
  button.addEventListener('touchcancel', releaseButton, { passive: false });
}

// Helper function to add event listeners to a jump button
function addJumpButtonListeners(button) {
  button.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (gameState === 'PLAYING') {
        if (player.z === 0) {
          player.dz = 6; // JUMP!
        } else if (player.grinding) {
          player.dz = 5;
          player.grinding = false;
          player.grindingRail = null;
        }
      }
    },
    { passive: false }
  );
}

// Set up button event listeners (only if buttons exist - e.g., not on sprites page)
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnPause = document.getElementById('btn-pause');
const btnJumpLeft = document.getElementById('btn-jump-left');
const btnJumpRight = document.getElementById('btn-jump-right');

if (btnLeft && btnRight && btnUp && btnDown && btnPause) {
  addDirectionButtonListeners(btnLeft, 'left');
  addDirectionButtonListeners(btnRight, 'right');
  addDirectionButtonListeners(btnUp, 'up');
  addDirectionButtonListeners(btnDown, 'down');

  // Pause button has special behavior
  btnPause.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      gameState = 'PAUSED';
      setPauseScreen();
      updateButtonVisibility();
    },
    { passive: false }
  );

  // Jump buttons
  if (btnJumpLeft) {
    addJumpButtonListeners(btnJumpLeft);
  }

  if (btnJumpRight) {
    addJumpButtonListeners(btnJumpRight);
  }
}
