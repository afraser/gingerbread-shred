/** GINGERBREAD SHRED - RENDERING MODULE */

// All rendering/drawing functions for the game
// Requires: ctx, C (color palette), PLAYER_STATE constants from game.js

function drawTouchIndicators(x, y) {
  const horizontalDrag = touch.startX - touch.currentX;
  const verticalDrag = touch.startY - touch.currentY;

  ctx.save();
  ctx.globalAlpha = TOUCH_INDICATOR_ALPHA;

  // Position indicators above the touch point
  const indicatorY = y - TOUCH_INDICATOR_Y_OFFSET;
  let indicatorX = x;

  // Steering indicator (left/right arrows)
  if (horizontalDrag > TOUCH_DRAG_THRESHOLD) {
    // Left arrow
    drawArrow(indicatorX - TOUCH_INDICATOR_SPACING, indicatorY, 'left');
  } else if (horizontalDrag < -TOUCH_DRAG_THRESHOLD) {
    // Right arrow
    drawArrow(indicatorX + TOUCH_INDICATOR_SPACING, indicatorY, 'right');
  }

  // Speed indicator (up/down arrows)
  if (verticalDrag > TOUCH_DRAG_THRESHOLD) {
    // Up arrow (slowing down)
    drawArrow(indicatorX, indicatorY - TOUCH_INDICATOR_VERTICAL_SPACING, 'up');
  } else if (verticalDrag < -TOUCH_DRAG_THRESHOLD) {
    // Down arrow (speeding up)
    drawArrow(
      indicatorX,
      indicatorY + TOUCH_INDICATOR_VERTICAL_SPACING,
      'down'
    );
  }

  ctx.restore();
}

function drawArrow(x, y, direction) {
  ctx.fillStyle = C.white;
  ctx.strokeStyle = C.black;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'miter';

  ctx.beginPath();

  if (direction === 'left') {
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 5, y - 10);
    ctx.lineTo(x + 5, y + 10);
  } else if (direction === 'right') {
    ctx.moveTo(x + 15, y);
    ctx.lineTo(x - 5, y - 10);
    ctx.lineTo(x - 5, y + 10);
  } else if (direction === 'up') {
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x - 10, y + 5);
    ctx.lineTo(x + 10, y + 5);
  } else if (direction === 'down') {
    ctx.moveTo(x, y + 15);
    ctx.lineTo(x - 10, y - 5);
    ctx.lineTo(x + 10, y - 5);
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// --- ON-SCREEN BUTTONS ---

// --- ART ASSETS (Procedural) ---

function drawPlayer(player) {
  const { x, y, z, hp, angle, state } = player;
  ctx.save();
  ctx.translate(x, y);
  // Shift all drawing to align drawing with player hitbox coords
  ctx.translate(PLAYER_RENDER_X_OFFSET, PLAYER_RENDER_Y_OFFSET);

  // Tilt based on direction angle
  ctx.rotate(angle * PLAYER_ROTATION_FACTOR);

  // Shadow
  ctx.fillStyle = `rgba(0,0,0,${SHADOW_OPACITY})`;
  ctx.beginPath();
  ctx.ellipse(0, 25 + z, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw player based on state
  if (state === PLAYER_STATE.UPRIGHT) {
    // Upright (normal) position
    drawPlayerUpright(hp);
  } else if (state === PLAYER_STATE.LAID_BACK) {
    // Laid-back position
    drawPlayerLaidBack(hp);
  } else if (state === PLAYER_STATE.BACKSIDE_INVERTED) {
    // Backside inverted (upside-down, backside showing) position
    drawPlayerBacksideInverted(hp);
  } else if (state === PLAYER_STATE.LAID_FORWARD) {
    // Laid-forward position
    drawPlayerLaidForward(hp);
  } else if (state === PLAYER_STATE.BACKSIDE) {
    // Backside (facing backward) position
    drawPlayerBackside(hp);
  } else if (state === PLAYER_STATE.INVERTED) {
    // Inverted (upside-down, face showing) position
    drawPlayerInverted(hp);
  } else if (state === PLAYER_STATE.BACKSIDE_LAID_BACK) {
    // Backside laid back (leaning back, backside showing) position
    drawPlayerBacksideLaidBack(hp);
  } else if (state === PLAYER_STATE.BACKSIDE_LAID_FORWARD) {
    // Backside laid forward (leaning forward, backside showing) position
    drawPlayerBacksideLaidForward(hp);
  }

  ctx.restore();
}

function drawSnowboard(c = ctx) {
  c.fillStyle = C.red;
  c.beginPath();
  c.roundRect(-20, 15, 40, 10, 10);
  c.fill();
  c.strokeStyle = C.black;
  c.lineWidth = 2;
  c.stroke();
}

function drawPlayerHead(headY, c = ctx) {
  c.fillStyle = C.brown;
  c.beginPath();
  c.arc(0, headY, 12, 0, Math.PI * 2);
  c.fill();
  c.stroke();
}

function drawPlayerFace(eyeY, mouthY, c = ctx) {
  // Eyes
  c.fillStyle = '#fff';
  c.beginPath();
  c.roundRect(-5, eyeY, 3, 5, 2);
  c.roundRect(2, eyeY, 3, 5, 2);
  c.fill();
  // Mouth
  c.fillStyle = C.red;
  c.fillRect(-3, mouthY, 6, 2);
}

function drawPlayerBody(showButtons, c = ctx) {
  c.fillStyle = C.brown;
  c.fillRect(-10, -5, 20, 18);
  c.strokeRect(-10, -5, 20, 18);

  if (showButtons) {
    // Draw two buttons
    c.fillStyle = C.green2;
    c.beginPath();
    c.arc(0, 0, 2.5, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(0, 8, 2.5, 0, Math.PI * 2);
    c.fill();
  }
}

function drawPlayerArms(hp, c = ctx) {
  // Left Arm (Draw if HP > 2)
  if (hp > 2) {
    c.fillStyle = C.brown;
    c.beginPath();
    c.roundRect(-22, -5, 14, 8, 4);
    c.fill();
    c.stroke();
  }
  // Right Arm (Draw if HP > 3)
  if (hp > 3) {
    c.fillStyle = C.brown;
    c.beginPath();
    c.roundRect(8, -5, 14, 8, 4);
    c.fill();
    c.stroke();
  }
}

function drawPlayerFeet(hp, c = ctx) {
  if (hp > 1) {
    c.fillStyle = C.brown;
    // Left foot
    c.beginPath();
    c.roundRect(-8.5, 8, 7, 12, 2.5);
    c.fill();
    c.stroke();
    // Right foot
    c.beginPath();
    c.roundRect(1.5, 8, 7, 12, 2.5);
    c.fill();
    c.stroke();
  }
}

function drawPlayerUpright(hp, c = ctx) {
  c.save();

  // SNOWBOARD
  drawSnowboard(c);

  if (hp > 0) {
    // HEAD (Always draw unless dead)
    // Position head lower when HP is 1 to sit on snowboard
    let headY = hp === 1 ? 7 : -15;
    let eyeY = hp === 1 ? 3 : -18;
    let mouthY = hp === 1 ? 11 : -11;

    drawPlayerHead(headY, c);
    drawPlayerFace(eyeY, mouthY, c);
  }

  // ARMS
  drawPlayerArms(hp, c);

  // FEET (Draw behind torso)
  drawPlayerFeet(hp, c);

  // TORSO (Draw if HP > 1)
  if (hp > 1) {
    drawPlayerBody(true, c);
  }

  c.restore();
}

function drawPlayerBackside(hp, c = ctx) {
  c.save();

  // SNOWBOARD
  drawSnowboard(c);

  if (hp > 0) {
    // HEAD (Always draw unless dead)
    // Position head lower when HP is 1 to sit on snowboard
    let headY = hp === 1 ? 7 : -15;
    drawPlayerHead(headY, c);
    // No face shown when facing backwards
  }

  // ARMS
  drawPlayerArms(hp, c);

  // FEET (Draw behind torso)
  drawPlayerFeet(hp, c);

  // TORSO (Draw if HP > 1)
  if (hp > 1) {
    drawPlayerBody(false, c); // No buttons when facing backwards
  }
  c.restore();
}

function drawPlayerLaidBack(hp, c = ctx) {
  // Player leaning back, body tilted backward
  c.save();
  c.rotate(FLIP_ROTATION_LAID_BACK); // Lean back

  // SNOWBOARD
  drawSnowboard(c);

  if (hp > 0) {
    // HEAD - positioned above body
    drawPlayerHead(-20, c);
    drawPlayerFace(-23, -15, c);
  }

  // ARMS (draw before torso so they appear behind)
  drawPlayerArms(hp, c);

  // FEET (Draw behind torso)
  drawPlayerFeet(hp, c);

  // TORSO & LEGS
  if (hp > 1) {
    drawPlayerBody(true, c);
  }

  c.restore();
}

function drawPlayerBacksideInverted(hp, c = ctx) {
  // Player completely upside down (backside showing)
  c.save();

  c.rotate(Math.PI); // 180 degrees

  // SNOWBOARD
  drawSnowboard(c);

  if (hp > 0) {
    // HEAD - now at bottom when rotated
    let headY = hp === 1 ? 3 : -15;
    drawPlayerHead(headY, c);
    // No face shown when upside down backside
  }

  // ARMS (draw before torso so they appear behind)
  drawPlayerArms(hp, c);

  // FEET (Draw behind torso)
  drawPlayerFeet(hp, c);

  // TORSO & LEGS
  if (hp > 1) {
    drawPlayerBody(false, c); // No buttons when backside showing
  }

  c.restore();
}

function drawPlayerInverted(hp, c = ctx) {
  // Player completely upside down (face showing)
  c.save();

  c.rotate(Math.PI); // 180 degrees

  // SNOWBOARD
  drawSnowboard(c);

  if (hp > 0) {
    // HEAD - now at bottom when rotated
    let headY = hp === 1 ? 3 : -15;
    let eyeY = hp === 1 ? -1 : -18;
    let mouthY = hp === 1 ? 7 : -11;

    drawPlayerHead(headY, c);
    drawPlayerFace(eyeY, mouthY, c); // Show face when inverted facing forward
  }

  // ARMS (draw before torso so they appear behind)
  drawPlayerArms(hp, c);

  // FEET (Draw behind torso)
  drawPlayerFeet(hp, c);

  // TORSO & LEGS
  if (hp > 1) {
    drawPlayerBody(true, c); // Show buttons when facing forward
  }

  c.restore();
}

function drawPlayerLaidForward(hp, c = ctx) {
  // Player leaning forward, body tilted forward
  c.save();

  c.rotate(FLIP_ROTATION_LAID_FORWARD); // Lean forward

  // SNOWBOARD
  drawSnowboard(c);

  if (hp > 0) {
    // HEAD - positioned above body
    drawPlayerHead(-20, c);
    drawPlayerFace(-23, -15, c);
  }

  // ARMS (draw before torso so they appear behind)
  drawPlayerArms(hp, c);

  // FEET (Draw behind torso)
  drawPlayerFeet(hp, c);

  // TORSO & LEGS
  if (hp > 1) {
    drawPlayerBody(true, c);
  }

  c.restore();
}

function drawPlayerBacksideLaidBack(hp, c = ctx) {
  // Player leaning back, facing backward (backside showing)
  c.save();
  c.rotate(FLIP_ROTATION_LAID_BACK); // Lean back

  // SNOWBOARD
  drawSnowboard(c);

  if (hp > 0) {
    // HEAD - positioned above body
    drawPlayerHead(-20, c);
    // No face shown when facing backward
  }

  // ARMS (draw before torso so they appear behind)
  drawPlayerArms(hp, c);

  // FEET (Draw behind torso)
  drawPlayerFeet(hp, c);

  // TORSO & LEGS
  if (hp > 1) {
    drawPlayerBody(false, c); // No buttons when facing backward
  }

  c.restore();
}

function drawPlayerBacksideLaidForward(hp, c = ctx) {
  // Player leaning forward, facing backward (backside showing)
  c.save();

  c.rotate(FLIP_ROTATION_LAID_FORWARD); // Lean forward

  // SNOWBOARD
  drawSnowboard(c);

  if (hp > 0) {
    // HEAD - positioned above body
    drawPlayerHead(-20, c);
    // No face shown when facing backward
  }

  // ARMS (draw before torso so they appear behind)
  drawPlayerArms(hp, c);

  // FEET (Draw behind torso)
  drawPlayerFeet(hp, c);

  // TORSO & LEGS
  if (hp > 1) {
    drawPlayerBody(false, c); // No buttons when facing backward
  }

  c.restore();
}

function drawRamp(x, y, c = ctx) {
  // Shadow
  c.fillStyle = 'rgba(0,0,0,0.2)';
  c.beginPath();
  c.ellipse(x + 30, y + 22, 25, 8, 0, 0, Math.PI * 2);
  c.fill();

  // Ramp
  c.fillStyle = C.blue;
  c.beginPath();
  c.moveTo(x + 10, y);
  c.lineTo(x + 50, y);
  c.lineTo(x + 60, y + 20);
  c.lineTo(x, y + 20);
  c.closePath();
  c.fill();

  // Double up-chevron icon to indicate jump
  c.strokeStyle = '#1a5f8f'; // Darker blue
  c.lineWidth = 2;
  c.lineCap = 'round';
  c.lineJoin = 'round';

  // First chevron (bottom)
  c.beginPath();
  c.moveTo(x + 23, y + 15);
  c.lineTo(x + 30, y + 10);
  c.lineTo(x + 37, y + 15);
  c.stroke();

  // Second chevron (top)
  c.beginPath();
  c.moveTo(x + 23, y + 10);
  c.lineTo(x + 30, y + 5);
  c.lineTo(x + 37, y + 10);
  c.stroke();
}

function drawRail(x, y, c = ctx) {
  c.save();
  // Support posts (horizontal, holding up the vertical rail)
  c.fillStyle = C.grey;
  c.fillRect(x - 5, y + 50, 19, 4);
  c.fillRect(x - 5, y + 150, 19, 4);
  c.fillRect(x - 5, y + 250, 19, 4);

  // Shadow (elongated vertically)
  c.fillStyle = 'rgba(0,0,0,0.2)';
  c.beginPath();
  c.roundRect(x + 6, y + 10, 6, 300, 3);
  c.fill();

  // Rail bar (vertical, the grindable part)
  c.fillStyle = '#ffcc00'; // Yellow/gold color
  c.strokeStyle = C.black;
  c.lineWidth = 1;
  c.beginPath();
  c.roundRect(x, y, 6, 300, 3);
  c.fill();
  c.stroke();

  // Shine effect on rail (vertical stripe)
  c.fillStyle = 'rgba(255, 255, 255, 0.4)';
  c.fillRect(x + 1, y, 1.5, 300);
  c.restore();
}

function drawTree(x, y, variant = 1, c = ctx) {
  c.save();
  // Shift entire tree up to include trunk in hitbox
  y -= 10;

  if (variant === 1) {
    // Variant 1: Tall Pine - narrow, tall triangle
    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.beginPath();
    c.ellipse(x + 18, y + 30, 18, 6, 0, 0, Math.PI * 2);
    c.fill();
    // Tree foliage
    c.fillStyle = C.green;
    c.beginPath();
    c.moveTo(x + 10, y - 60); // Top (higher)
    c.lineTo(x + 25, y + 20); // Bot Right (narrower)
    c.lineTo(x - 5, y + 20); // Bot Left (narrower)
    c.fill();
    // Trunk
    c.fillStyle = C.brown;
    c.fillRect(x + 5, y + 20, 10, 10);
  } else if (variant === 2) {
    // Variant 2: Layered Tree - stacked triangles
    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.beginPath();
    c.ellipse(x + 20, y + 30, 20, 6, 0, 0, Math.PI * 2);
    c.fill();
    // Tree foliage
    c.fillStyle = C.green;

    // Bottom layer
    c.beginPath();
    c.moveTo(x + 15, y - 5);
    c.lineTo(x + 35, y + 20);
    c.lineTo(x - 5, y + 20);
    c.fill();

    // Middle layer
    c.beginPath();
    c.moveTo(x + 15, y - 15);
    c.lineTo(x + 32, y + 5);
    c.lineTo(x - 2, y + 6);
    c.fill();

    // Middle layer 2
    c.beginPath();
    c.moveTo(x + 15, y - 25);
    c.lineTo(x + 30, y - 8);
    c.lineTo(x, y - 7);
    c.fill();

    // Top layer
    c.beginPath();
    c.moveTo(x + 15, y - 35);
    c.lineTo(x + 25, y - 20);
    c.lineTo(x + 5, y - 21);
    c.fill();
    // Trunk
    c.fillStyle = C.brown;
    c.fillRect(x + 10, y + 20, 10, 10);
  } else {
    // Variant 3: Bushy Tree - wider, shorter triangle
    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.beginPath();
    c.ellipse(x + 18, y + 30, 25, 6, 0, 0, Math.PI * 2);
    c.fill();
    // Tree foliage
    c.fillStyle = C.green;
    c.beginPath();
    c.moveTo(x + 15, y - 30); // Top (lower)
    c.lineTo(x + 38, y + 20); // Bot Right (wider)
    c.lineTo(x - 8, y + 20); // Bot Left (wider)
    c.fill();
    // Trunk
    c.fillStyle = C.brown;
    c.fillRect(x + 10, y + 20, 10, 10);
  }
  c.restore();
}

function drawRock(x, y, variant = 1, c = ctx) {
  // Shift entire tree up
  y = y - 5;

  if (variant === 1) {
    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.beginPath();
    c.ellipse(x + 15, y + 22, 15, 6, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = C.grey;
    c.beginPath();
    // Variant 1: Off-center hump - peak shifted left
    c.moveTo(x, y + 20); // Bottom left
    c.lineTo(x + 3, y + 12); // Left side gentle
    c.lineTo(x + 8, y + 7); // Upper left
    c.lineTo(x + 12, y + 5); // Peak (left of center)
    c.lineTo(x + 15, y + 8); // Slope down
    c.lineTo(x + 22, y + 14); // Right side gentle
    c.lineTo(x + 28, y + 16); // Lower right
    c.lineTo(x + 30, y + 20); // Bottom right
  } else if (variant === 2) {
    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.beginPath();
    c.ellipse(x + 15, y + 22, 15, 6, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = C.grey;
    c.beginPath();
    // Variant 2: Classic jagged rock
    c.moveTo(x, y + 20); // Bottom left (flat)
    c.lineTo(x + 3, y + 10); // Left side jagged
    c.lineTo(x + 7, y + 5); // Upper left
    c.lineTo(x + 12, y + 2); // Peak left
    c.lineTo(x + 18, y); // Highest peak
    c.lineTo(x + 23, y + 4); // Peak right
    c.lineTo(x + 27, y + 8); // Upper right
    c.lineTo(x + 30, y + 14); // Right side jagged
    c.lineTo(x + 30, y + 20); // Bottom right (flat)
  } else {
    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.beginPath();
    c.ellipse(x + 20, y + 22, 20, 6, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = C.grey;
    c.beginPath();
    // Variant 3: Wide flat rock - horizontal emphasis
    c.moveTo(x, y + 20); // Bottom left (wider)
    c.lineTo(x + 5, y + 12); // Left side
    c.lineTo(x + 10, y + 8); // Upper left
    c.lineTo(x + 20, y + 5); // Low peak
    c.lineTo(x + 30, y + 8); // Upper right
    c.lineTo(x + 35, y + 12); // Right side
    c.lineTo(x + 40, y + 20); // Bottom right (wider)
  }

  c.closePath();
  c.fill();
}
