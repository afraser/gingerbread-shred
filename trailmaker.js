// Trail Maker - Tool for creating custom trails

// Constants
const TRAIL_WIDTH = 800;
const TRAIL_LENGTH = 12000;

// Obstacle dimensions (from game.js)
const OBSTACLE_TYPES = {
  tree1: { w: 30, h: 70 },
  tree2: { w: 40, h: 70 },
  tree3: { w: 46, h: 70 },
  rock1: { w: 30, h: 15 },
  rock2: { w: 30, h: 15 },
  rock3: { w: 40, h: 15 },
  ramp: { w: 60, h: 20 },
  rail: { w: 12, h: 300 },
};

// DOM Elements
const menuScreen = document.getElementById('menuScreen');
const editorContainer = document.getElementById('editorContainer');
const btnNewTrail = document.getElementById('btnNewTrail');
const btnLoadTrail = document.getElementById('btnLoadTrail');
const canvas = document.getElementById('trailCanvas');
const ctx = canvas.getContext('2d');
const saveBtn = document.getElementById('saveBtn');
const obstacleButtons = document.querySelectorAll('.obstacle-btn');

// State
let selectedObstacle = null;
let obstacles = [];
let mouseX = 0;
let mouseY = 0;
let hoveredObstacle = null;
let draggingObstacle = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Initialize
function init() {
  obstacles = [];
  redraw();
}

// Redraw the entire canvas
function redraw() {
  // Clear canvas
  ctx.fillStyle = '#c2c3c7';
  ctx.fillRect(0, 0, TRAIL_WIDTH, TRAIL_LENGTH);

  // Draw grid
  drawGrid();

  // Draw all placed obstacles
  obstacles.forEach(obstacle => {
    drawObstacle(obstacle.type, obstacle.worldX, obstacle.y, 1.0);
  });

  // Draw hover preview if hovering and not over an existing obstacle
  if (selectedObstacle && !hoveredObstacle && !draggingObstacle) {
    drawObstacle(selectedObstacle, mouseX, mouseY, 0.5);
  }
}

// Draw a grid on the canvas
function drawGrid() {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;

  // Vertical lines every 100px
  for (let x = 0; x <= TRAIL_WIDTH; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TRAIL_LENGTH);
    ctx.stroke();
  }

  // Horizontal lines every 100px
  for (let y = 0; y <= TRAIL_LENGTH; y += 100) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TRAIL_WIDTH, y);
    ctx.stroke();
  }
}

// Draw an obstacle using the rendering functions
function drawObstacle(type, x, y, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;

  if (type === 'tree1') drawTree(x, y, 1, ctx);
  else if (type === 'tree2') drawTree(x, y, 2, ctx);
  else if (type === 'tree3') drawTree(x, y, 3, ctx);
  else if (type === 'rock1') drawRock(x, y, 1, ctx);
  else if (type === 'rock2') drawRock(x, y, 2, ctx);
  else if (type === 'rock3') drawRock(x, y, 3, ctx);
  else if (type === 'ramp') drawRamp(x, y, ctx);
  else if (type === 'rail') drawRail(x, y, ctx);

  ctx.restore();
}

// Check if point is inside obstacle bounds
function isPointInObstacle(px, py, obstacle) {
  const def = OBSTACLE_TYPES[obstacle.type];
  return (
    px >= obstacle.worldX &&
    px <= obstacle.worldX + def.w &&
    py >= obstacle.y &&
    py <= obstacle.y + def.h
  );
}

// Find obstacle at given point
function getObstacleAt(x, y) {
  // Check in reverse order so top obstacles are picked first
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (isPointInObstacle(x, y, obstacles[i])) {
      return obstacles[i];
    }
  }
  return null;
}

// Event Handlers
btnNewTrail.addEventListener('click', () => {
  menuScreen.style.display = 'none';
  editorContainer.style.display = 'block';
  init();
});

btnLoadTrail.addEventListener('click', () => {
  alert('Load trail functionality coming soon!');
});

obstacleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove selected class from all buttons
    obstacleButtons.forEach(b => b.classList.remove('selected'));

    // Add selected class to clicked button
    btn.classList.add('selected');

    // Store selected obstacle type
    selectedObstacle = btn.dataset.type;
  });
});

saveBtn.addEventListener('click', () => {
  const trailData = {
    width: TRAIL_WIDTH,
    length: TRAIL_LENGTH,
    obstacles: obstacles.map(o => ({
      type: o.type,
      worldX: o.worldX,
      y: o.y
    }))
  };

  // Create a download link
  const json = JSON.stringify(trailData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'trail.json';
  a.click();

  URL.revokeObjectURL(url);
});

// Mouse move handler
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  if (draggingObstacle) {
    // Update dragged obstacle position
    draggingObstacle.worldX = mouseX - dragOffsetX;
    draggingObstacle.y = mouseY - dragOffsetY;
    redraw();
  } else {
    // Check if hovering over an obstacle
    hoveredObstacle = getObstacleAt(mouseX, mouseY);

    // Update cursor
    if (hoveredObstacle) {
      canvas.style.cursor = 'grab';
    } else if (selectedObstacle) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = 'default';
    }

    redraw();
  }
});

// Mouse down handler
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  const clickedObstacle = getObstacleAt(mouseX, mouseY);

  if (clickedObstacle) {
    // Start dragging existing obstacle
    draggingObstacle = clickedObstacle;
    dragOffsetX = mouseX - clickedObstacle.worldX;
    dragOffsetY = mouseY - clickedObstacle.y;
    canvas.style.cursor = 'grabbing';
  } else if (selectedObstacle) {
    // Place new obstacle
    const def = OBSTACLE_TYPES[selectedObstacle];
    obstacles.push({
      type: selectedObstacle,
      worldX: mouseX,
      y: mouseY
    });
    redraw();
  }
});

// Mouse up handler
canvas.addEventListener('mouseup', () => {
  if (draggingObstacle) {
    draggingObstacle = null;
    canvas.style.cursor = hoveredObstacle ? 'grab' : 'crosshair';
  }
});

// Mouse leave handler
canvas.addEventListener('mouseleave', () => {
  draggingObstacle = null;
  hoveredObstacle = null;
  canvas.style.cursor = 'default';
  redraw();
});
