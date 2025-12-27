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
