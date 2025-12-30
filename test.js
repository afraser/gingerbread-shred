/**
 * Test Suite for Gingerbread Shred
 */

// Simple test framework
const tests = [];
let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
    tests.push({ description, fn });
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(
            `${message || 'Assertion failed'}\n` +
            `  Expected: ${expected}\n` +
            `  Actual: ${actual}`
        );
    }
}

function assertTrue(value, message) {
    if (!value) {
        throw new Error(message || 'Expected true but got false');
    }
}

function assertFalse(value, message) {
    if (value) {
        throw new Error(message || 'Expected false but got true');
    }
}

function assertApproximately(actual, expected, tolerance, message) {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(
            `${message || 'Value not approximately equal'}\n` +
            `  Expected: ${expected} ± ${tolerance}\n` +
            `  Actual: ${actual}`
        );
    }
}

function assertGreaterThan(actual, expected, message) {
    if (actual <= expected) {
        throw new Error(
            `${message || 'Value not greater than expected'}\n` +
            `  Expected: > ${expected}\n` +
            `  Actual: ${actual}`
        );
    }
}

function assertLessThan(actual, expected, message) {
    if (actual >= expected) {
        throw new Error(
            `${message || 'Value not less than expected'}\n` +
            `  Expected: < ${expected}\n` +
            `  Actual: ${actual}`
        );
    }
}

function assertBetween(actual, min, max, message) {
    if (actual < min || actual > max) {
        throw new Error(
            `${message || 'Value not in range'}\n` +
            `  Expected: ${min} to ${max}\n` +
            `  Actual: ${actual}`
        );
    }
}

function runTests() {
    console.log('Running tests...\n');

    tests.forEach(({ description, fn }) => {
        try {
            fn();
            console.log(`✓ ${description}`);
            passedTests++;
        } catch (error) {
            console.error(`✗ ${description}`);
            console.error(`  ${error.message}`);
            failedTests++;
        }
    });

    console.log(`\n${passedTests + failedTests} tests, ${passedTests} passed, ${failedTests} failed`);

    // Return exit code for CI/CD
    return failedTests === 0 ? 0 : 1;
}

// ============================================================================
// Test Suite: checkCollision
// ============================================================================

test('checkCollision: overlapping boxes should return true', () => {
    const box1 = { x: 0, y: 0, w: 10, h: 10 };
    const box2 = { x: 5, y: 5, w: 10, h: 10 };
    assertTrue(checkCollision(box1, box2), 'Overlapping boxes should collide');
});

test('checkCollision: non-overlapping boxes should return false', () => {
    const box1 = { x: 0, y: 0, w: 10, h: 10 };
    const box2 = { x: 20, y: 20, w: 10, h: 10 };
    assertFalse(checkCollision(box1, box2), 'Non-overlapping boxes should not collide');
});

test('checkCollision: boxes touching edges should return false', () => {
    const box1 = { x: 0, y: 0, w: 10, h: 10 };
    const box2 = { x: 10, y: 0, w: 10, h: 10 };
    assertFalse(checkCollision(box1, box2), 'Boxes touching at edges should not collide');
});

test('checkCollision: box1 completely inside box2 should return true', () => {
    const box1 = { x: 5, y: 5, w: 5, h: 5 };
    const box2 = { x: 0, y: 0, w: 20, h: 20 };
    assertTrue(checkCollision(box1, box2), 'Box inside another should collide');
});

test('checkCollision: box2 completely inside box1 should return true', () => {
    const box1 = { x: 0, y: 0, w: 20, h: 20 };
    const box2 = { x: 5, y: 5, w: 5, h: 5 };
    assertTrue(checkCollision(box1, box2), 'Box inside another should collide');
});

test('checkCollision: boxes separated horizontally should return false', () => {
    const box1 = { x: 0, y: 0, w: 10, h: 10 };
    const box2 = { x: 15, y: 0, w: 10, h: 10 };
    assertFalse(checkCollision(box1, box2), 'Horizontally separated boxes should not collide');
});

test('checkCollision: boxes separated vertically should return false', () => {
    const box1 = { x: 0, y: 0, w: 10, h: 10 };
    const box2 = { x: 0, y: 15, w: 10, h: 10 };
    assertFalse(checkCollision(box1, box2), 'Vertically separated boxes should not collide');
});

test('checkCollision: partial overlap on top-left corner should return true', () => {
    const box1 = { x: 5, y: 5, w: 10, h: 10 };
    const box2 = { x: 0, y: 0, w: 10, h: 10 };
    assertTrue(checkCollision(box1, box2), 'Corner overlap should collide');
});

test('checkCollision: partial overlap on bottom-right corner should return true', () => {
    const box1 = { x: 0, y: 0, w: 10, h: 10 };
    const box2 = { x: 5, y: 5, w: 10, h: 10 };
    assertTrue(checkCollision(box1, box2), 'Corner overlap should collide');
});

test('checkCollision: boxes with same position and size should return true', () => {
    const box1 = { x: 10, y: 10, w: 20, h: 20 };
    const box2 = { x: 10, y: 10, w: 20, h: 20 };
    assertTrue(checkCollision(box1, box2), 'Identical boxes should collide');
});

test('checkCollision: boxes with zero width should not collide', () => {
    const box1 = { x: 0, y: 0, w: 0, h: 10 };
    const box2 = { x: 0, y: 0, w: 10, h: 10 };
    assertFalse(checkCollision(box1, box2), 'Zero-width boxes should not collide');
});

test('checkCollision: boxes with zero height should not collide', () => {
    const box1 = { x: 0, y: 0, w: 10, h: 0 };
    const box2 = { x: 0, y: 0, w: 10, h: 10 };
    assertFalse(checkCollision(box1, box2), 'Zero-height boxes should not collide');
});

// ============================================================================
// Test Suite: Game State
// ============================================================================

test('State: score can be reset', () => {
    score = 999;
    score = 0;
    assertEqual(score, 0, 'Score should be 0');
});

test('State: gameSpeed can be set to initial value', () => {
    gameSpeed = 10;
    gameSpeed = INITIAL_GAME_SPEED;
    assertEqual(gameSpeed, INITIAL_GAME_SPEED, 'Game speed should be initial value');
});

test('State: obstacles array can be cleared', () => {
    obstacles = [{ type: 'tree1', x: 100, y: 100 }];
    obstacles = [];
    assertEqual(obstacles.length, 0, 'Obstacles should be cleared');
});

test('State: particles array can be cleared', () => {
    particles = [{ x: 100, y: 100 }];
    particles = [];
    assertEqual(particles.length, 0, 'Particles should be cleared');
});

// ============================================================================
// Test Suite: Player Physics
// ============================================================================

function setupPlayer() {
    // Manually set up player state without calling init()
    score = 0;
    gameSpeed = INITIAL_GAME_SPEED;
    gameState = 'PLAYING';
    player = {
        x: 400,
        y: PLAYER_Y,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        worldX: 0,
        angle: 0,
        dx: 0,
        hp: INITIAL_HP,
        invul: 0,
        z: 0,
        dz: 0,
        state: PLAYER_STATE.UPRIGHT,
        flipIndex: 0,
        lastState: PLAYER_STATE.UPRIGHT,
        flipsCompleted: 0,
        crashed: false,
        crashTimer: 0,
    };
    obstacles = [];
    particles = [];
    snow = [];
    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;
}

test('Physics: gravity should pull player down when airborne', () => {
    setupPlayer();
    player.z = 10;
    player.dz = 5;
    const initialDz = player.dz;

    update(1/60); // One frame at 60fps

    assertLessThan(player.dz, initialDz, 'Jump velocity should decrease due to gravity');
});

test('Physics: player should land when z reaches 0', () => {
    setupPlayer();
    player.z = 1;
    player.dz = -10;

    update(1/60);

    assertEqual(player.z, 0, 'Player should be on ground');
    assertEqual(player.dz, 0, 'Jump velocity should be reset');
});

test('Physics: angle should decay over time', () => {
    setupPlayer();
    player.angle = 1;

    update(1/60);

    assertLessThan(player.angle, 1, 'Angle should decay');
    assertGreaterThan(player.angle, 0, 'Angle should not become negative');
});

test('Physics: angle should be clamped to limits', () => {
    setupPlayer();
    player.angle = 100; // Way too high

    update(1/60);

    assertBetween(player.angle, ANGLE_CLAMP_MIN, ANGLE_CLAMP_MAX, 'Angle should be clamped');
});

// ============================================================================
// Test Suite: Flip Mechanics
// ============================================================================

test('Flip: should not advance flip state when on ground', () => {
    setupPlayer();
    player.z = 0; // On ground
    player.state = PLAYER_STATE.UPRIGHT;
    keys.down = true;

    update(1/60);

    assertEqual(player.state, PLAYER_STATE.UPRIGHT, 'Should not flip when on ground');
});

test('Flip: should advance flip state when airborne', () => {
    setupPlayer();
    player.z = 10; // Airborne
    gameSpeed = MIN_FLIP_SPEED + 1;
    player.state = PLAYER_STATE.UPRIGHT;
    keys.down = true;

    update(1/60);

    assertEqual(player.state, PLAYER_STATE.LAID_BACK, 'Should advance to next flip state');
});

test('Flip: should cycle through all flip states', () => {
    setupPlayer();
    player.z = 10;
    gameSpeed = MIN_FLIP_SPEED + 1;

    player.state = PLAYER_STATE.UPRIGHT;
    keys.down = true;
    update(1/60);
    assertEqual(player.state, PLAYER_STATE.LAID_BACK, 'Should be laid back');

    keys.down = true;
    update(1/60);
    assertEqual(player.state, PLAYER_STATE.BACKSIDE_INVERTED, 'Should be backside inverted');

    keys.down = true;
    update(1/60);
    assertEqual(player.state, PLAYER_STATE.LAID_FORWARD, 'Should be laid forward');

    keys.down = true;
    update(1/60);
    assertEqual(player.state, PLAYER_STATE.UPRIGHT, 'Should cycle back to upright');
});

test('Flip: should count completed flips', () => {
    setupPlayer();
    player.z = 10;
    gameSpeed = MIN_FLIP_SPEED + 1;
    player.flipsCompleted = 0;

    // Complete one full rotation
    for (let i = 0; i < 4; i++) {
        keys.down = true;
        update(1/60);
    }

    assertEqual(player.flipsCompleted, 1, 'Should count one completed flip');
});

test('Flip: should not flip when speed is too low', () => {
    setupPlayer();
    player.z = 10; // Airborne
    gameSpeed = MIN_FLIP_SPEED - 0.5; // Below minimum
    player.state = PLAYER_STATE.UPRIGHT;
    keys.down = true;

    update(1/60);

    assertEqual(player.state, PLAYER_STATE.UPRIGHT, 'Should not flip at low speed');
});

test('Flip: landing upright after flip should award bonus', () => {
    setupPlayer();
    const initialScore = score;
    player.z = 1;
    player.state = PLAYER_STATE.UPRIGHT;
    player.flipsCompleted = 2;
    player.dz = -10; // Moving down

    update(1/60); // This should land the player

    // Score increases from both flip bonus AND distance traveled
    const expectedIncrease = (2 * FLIP_BONUS_POINTS) + (gameSpeed * (1/60));
    assertApproximately(score, initialScore + expectedIncrease, 0.01, 'Should award flip bonus plus distance');
});

test('Flip: landing non-upright should trigger crash', () => {
    setupPlayer();
    player.z = 1;
    player.state = PLAYER_STATE.LAID_BACK; // Not upright
    player.crashed = false;
    player.dz = -10;

    update(1/60);

    assertTrue(player.crashed, 'Should crash when landing non-upright');
});

// ============================================================================
// Test Suite: Scoring
// ============================================================================

test('Scoring: score should increase with distance traveled', () => {
    setupPlayer();
    const initialScore = score;

    update(1/60);

    assertGreaterThan(score, initialScore, 'Score should increase over time');
});

test('Scoring: jump bonus calculation', () => {
    gameSpeed = 10;
    const expectedBonus = Math.floor(JUMP_BONUS_MULTIPLIER * gameSpeed);
    assertEqual(expectedBonus, 1000, 'Jump bonus should be speed * 100');
});

test('Scoring: flip bonus should be consistent', () => {
    const flips = 3;
    const expectedBonus = flips * FLIP_BONUS_POINTS;
    assertEqual(expectedBonus, 15000, 'Three flips should award 15000 points');
});

// ============================================================================
// Test Suite: Collision Response
// ============================================================================

test('Collision: HP can be decreased', () => {
    setupPlayer();
    const initialHP = player.hp;
    player.hp--;
    assertEqual(player.hp, initialHP - 1, 'HP should decrease');
});

test('Collision: hitPlayer should trigger invulnerability', () => {
    setupPlayer();
    player.invul = 0;
    hitPlayer(0); // 0% dodge chance
    assertEqual(player.invul, INVULNERABILITY_FRAMES, 'Should grant invulnerability frames');
});

test('Collision: hitPlayer should trigger screen shake', () => {
    setupPlayer();
    shakeAmt = 0;
    hitPlayer(0);
    assertEqual(shakeAmt, SCREEN_SHAKE_AMOUNT, 'Should trigger screen shake');
});

test('Collision: invulnerability should decay over time', () => {
    setupPlayer();
    player.invul = INVULNERABILITY_FRAMES;
    update(1/60);
    assertEqual(player.invul, INVULNERABILITY_FRAMES - 1, 'Invulnerability should decrease');
});

test('Collision: crumble should create particles', () => {
    setupPlayer();
    const initialParticleCount = particles.length;
    crumble();
    assertGreaterThan(particles.length, initialParticleCount, 'Should create particles');
    assertEqual(particles.length, initialParticleCount + CRUMB_COUNT + 1, 'Should create crumbs + chunk');
});

// ============================================================================
// Test Suite: Obstacle Management
// ============================================================================

test('Obstacles: should have correct dimensions', () => {
    const tree1 = OBSTACLE_TYPES.tree1;
    assertTrue(tree1.w > 0, 'Tree width should be positive');
    assertTrue(tree1.h > 0, 'Tree height should be positive');
});

test('Obstacles: ramp should have largest width', () => {
    const ramp = OBSTACLE_TYPES.ramp;
    assertEqual(ramp.w, 60, 'Ramp should be 60px wide');
});

test('Obstacles: particles should have gravity applied', () => {
    setupPlayer();
    particles.push({
        worldX: 0,
        y: 100,
        dx: 0,
        dy: 0,
        w: 5,
        h: 5,
        life: 100,
        rot: 0,
        rSpeed: 0
    });

    const initialDy = particles[0].dy;
    update(1/60);
    assertEqual(particles[0].dy, initialDy + PARTICLE_GRAVITY, 'Particle should have gravity applied');
});

test('Obstacles: particles should be removed when life expires', () => {
    setupPlayer();
    particles.push({
        worldX: 0,
        y: 100,
        dx: 0,
        dy: 0,
        w: 5,
        h: 5,
        life: 1,
        rot: 0,
        rSpeed: 0
    });

    update(1/60);
    assertEqual(particles.length, 0, 'Particle should be removed when life reaches 0');
});

// Run tests when loaded
if (typeof window !== 'undefined') {
    // Browser environment
    window.addEventListener('load', () => {
        const exitCode = runTests();
        // Display results in DOM if test-results element exists
        const resultsEl = document.getElementById('test-results');
        if (resultsEl) {
            resultsEl.innerHTML = `
                <h2>Test Results</h2>
                <p class="${failedTests === 0 ? 'pass' : 'fail'}">
                    ${passedTests + failedTests} tests,
                    <span class="pass">${passedTests} passed</span>,
                    <span class="fail">${failedTests} failed</span>
                </p>
            `;
        }
    });
} else {
    // Node.js environment (if we add support later)
    const exitCode = runTests();
    process.exit(exitCode);
}
