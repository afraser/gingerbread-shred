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

// Visual bounds for selection boxes (matches actual rendering)
const VISUAL_BOUNDS = {
  tree1: { x: -5, y: -70, w: 30, h: 90 },  // From rendering: x+10-15 to x+10+15, y-60 to y+30
  tree2: { x: -5, y: -45, w: 40, h: 65 },  // From rendering: x+15-20 to x+15+20, y-35 to y+30
  tree3: { x: -8, y: -40, w: 46, h: 60 },  // From rendering: x+15-23 to x+15+23, y-30 to y+30
  rock1: { x: 0, y: -5, w: 30, h: 20 },    // From rendering
  rock2: { x: 0, y: -5, w: 30, h: 20 },    // From rendering
  rock3: { x: 0, y: -5, w: 40, h: 20 },    // From rendering
  ramp: { x: 0, y: 0, w: 60, h: 20 },      // No offset
  rail: { x: -5, y: 0, w: 12, h: 300 },    // From rendering
};

// DOM Elements
const menuScreen = document.getElementById('menuScreen');
const editorContainer = document.getElementById('editorContainer');
const btnNewTrail = document.getElementById('btnNewTrail');
const btnLoadTrail = document.getElementById('btnLoadTrail');
const canvas = document.getElementById('trailCanvas');
const ctx = canvas.getContext('2d');
const saveBtn = document.getElementById('saveBtn');
const selectTool = document.getElementById('selectTool');
const obstacleButtons = document.querySelectorAll('.obstacle-btn');

// Set select tool as selected by default
selectTool.classList.add('selected');

// State
let selectedObstacle = null;
let isSelectMode = true; // Select tool active by default
let selectedObstaclesForEdit = []; // Currently selected obstacles for editing
let obstacles = [];
let mouseX = 0;
let mouseY = 0;
let hoveredObstacle = null;
let draggingObstacle = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let selectionBoxStart = null; // Start point for selection box
let isDrawingSelectionBox = false;
let isDraggingSelection = false; // Track if dragging multiple selected obstacles
let clipboard = []; // Copied obstacles

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

    // Draw outline if this obstacle is selected
    if (selectedObstaclesForEdit.includes(obstacle)) {
      const bounds = VISUAL_BOUNDS[obstacle.type];
      ctx.strokeStyle = '#29adff';
      ctx.lineWidth = 3;
      ctx.strokeRect(obstacle.worldX + bounds.x, obstacle.y + bounds.y, bounds.w, bounds.h);
    }
    // Draw faint outline if hovering in select mode (and not already selected)
    else if (isSelectMode && hoveredObstacle === obstacle && !isDraggingSelection) {
      const bounds = VISUAL_BOUNDS[obstacle.type];
      ctx.strokeStyle = 'rgba(41, 173, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.worldX + bounds.x, obstacle.y + bounds.y, bounds.w, bounds.h);
    }
  });

  // Draw selection box if being drawn
  if (isDrawingSelectionBox && selectionBoxStart) {
    const x = Math.min(selectionBoxStart.x, mouseX);
    const y = Math.min(selectionBoxStart.y, mouseY);
    const w = Math.abs(mouseX - selectionBoxStart.x);
    const h = Math.abs(mouseY - selectionBoxStart.y);

    ctx.strokeStyle = '#29adff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    // Fill with semi-transparent color
    ctx.fillStyle = 'rgba(41, 173, 255, 0.1)';
    ctx.fillRect(x, y, w, h);
  }

  // Draw hover preview if hovering and not over an existing obstacle
  if (selectedObstacle && !hoveredObstacle && !draggingObstacle && !isSelectMode) {
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
  const bounds = VISUAL_BOUNDS[obstacle.type];
  return (
    px >= obstacle.worldX + bounds.x &&
    px <= obstacle.worldX + bounds.x + bounds.w &&
    py >= obstacle.y + bounds.y &&
    py <= obstacle.y + bounds.y + bounds.h
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

// Check if a box intersects with an obstacle
function boxIntersectsObstacle(boxX, boxY, boxW, boxH, obstacle) {
  const bounds = VISUAL_BOUNDS[obstacle.type];
  return !(
    boxX + boxW < obstacle.worldX + bounds.x ||
    boxX > obstacle.worldX + bounds.x + bounds.w ||
    boxY + boxH < obstacle.y + bounds.y ||
    boxY > obstacle.y + bounds.y + bounds.h
  );
}

// Get all obstacles that intersect with a box
function getObstaclesInBox(boxX, boxY, boxW, boxH) {
  return obstacles.filter(obstacle =>
    boxIntersectsObstacle(boxX, boxY, boxW, boxH, obstacle)
  );
}

// Event Handlers
btnNewTrail.addEventListener('click', () => {
  menuScreen.style.display = 'none';
  editorContainer.style.display = 'block';
  init();
});

btnLoadTrail.addEventListener('click', () => {
  // Create a file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const trailData = JSON.parse(text);

      // Validate trail data
      if (!trailData.width || !trailData.length || !trailData.obstacles) {
        alert('Invalid trail file format');
        return;
      }

      // Load the trail data
      obstacles = trailData.obstacles.map(o => ({
        type: o.type,
        worldX: o.worldX,
        y: o.y
      }));

      // Show editor and redraw
      menuScreen.style.display = 'none';
      editorContainer.style.display = 'block';
      redraw();
    } catch (error) {
      alert(`Failed to load trail: ${error.message}`);
    }
  });

  // Trigger file selection
  fileInput.click();
});

// Select tool handler
selectTool.addEventListener('click', () => {
  // Remove selected class from all buttons
  obstacleButtons.forEach(b => b.classList.remove('selected'));

  // Add selected class to select tool
  selectTool.classList.add('selected');

  // Enable select mode
  isSelectMode = true;
  selectedObstacle = null;
  canvas.style.cursor = 'crosshair';
});

// Obstacle buttons handler
obstacleButtons.forEach(btn => {
  // Skip the select tool button
  if (btn.id === 'selectTool') return;

  btn.addEventListener('click', () => {
    // Remove selected class from all buttons
    obstacleButtons.forEach(b => b.classList.remove('selected'));

    // Add selected class to clicked button
    btn.classList.add('selected');

    // Disable select mode and store selected obstacle type
    isSelectMode = false;
    selectedObstacle = btn.dataset.type;
    selectedObstaclesForEdit = []; // Deselect any selected obstacles
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
    // Update dragged obstacle position(s)
    const deltaX = mouseX - dragOffsetX - draggingObstacle.worldX;
    const deltaY = mouseY - dragOffsetY - draggingObstacle.y;

    if (isDraggingSelection) {
      // Move all selected obstacles by the same delta
      selectedObstaclesForEdit.forEach(obstacle => {
        obstacle.worldX += deltaX;
        obstacle.y += deltaY;
      });
    } else {
      // Move single obstacle
      draggingObstacle.worldX = mouseX - dragOffsetX;
      draggingObstacle.y = mouseY - dragOffsetY;
    }
    redraw();
  } else if (isDrawingSelectionBox) {
    // Update selection box as mouse moves
    redraw();
  } else {
    // Check if hovering over an obstacle
    hoveredObstacle = getObstacleAt(mouseX, mouseY);

    // Update cursor
    if (isSelectMode && hoveredObstacle) {
      canvas.style.cursor = 'grab';
    } else if (isSelectMode) {
      canvas.style.cursor = 'crosshair';
    } else if (hoveredObstacle) {
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

  if (isSelectMode) {
    // Select mode: support dragging and box selection
    if (clickedObstacle) {
      // Clicked on an obstacle
      if (selectedObstaclesForEdit.includes(clickedObstacle)) {
        // Clicked on a selected obstacle - start dragging all selected
        draggingObstacle = clickedObstacle;
        dragOffsetX = mouseX - clickedObstacle.worldX;
        dragOffsetY = mouseY - clickedObstacle.y;
        isDraggingSelection = true;
        canvas.style.cursor = 'grabbing';
      } else {
        // Clicked on an unselected obstacle - clear selection, select it, and start dragging
        selectedObstaclesForEdit = [clickedObstacle];
        draggingObstacle = clickedObstacle;
        dragOffsetX = mouseX - clickedObstacle.worldX;
        dragOffsetY = mouseY - clickedObstacle.y;
        isDraggingSelection = false;
        canvas.style.cursor = 'grabbing';
      }
    } else {
      // Start box selection
      selectionBoxStart = { x: mouseX, y: mouseY };
      isDrawingSelectionBox = true;
      selectedObstaclesForEdit = []; // Clear selection
    }
  } else if (clickedObstacle) {
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
  if (isDrawingSelectionBox) {
    // Calculate box bounds
    const x = Math.min(selectionBoxStart.x, mouseX);
    const y = Math.min(selectionBoxStart.y, mouseY);
    const w = Math.abs(mouseX - selectionBoxStart.x);
    const h = Math.abs(mouseY - selectionBoxStart.y);

    // Get all obstacles in box
    selectedObstaclesForEdit = getObstaclesInBox(x, y, w, h);

    // Reset box drawing state
    isDrawingSelectionBox = false;
    selectionBoxStart = null;
    redraw();
  } else if (draggingObstacle) {
    draggingObstacle = null;
    isDraggingSelection = false;
    canvas.style.cursor = hoveredObstacle ? 'grab' : (isSelectMode ? 'crosshair' : 'default');
  }
});

// Mouse leave handler
canvas.addEventListener('mouseleave', () => {
  draggingObstacle = null;
  isDraggingSelection = false;
  hoveredObstacle = null;
  isDrawingSelectionBox = false;
  selectionBoxStart = null;
  canvas.style.cursor = 'default';
  redraw();
});

// Keyboard event handlers for copy/paste
document.addEventListener('keydown', (e) => {
  // Check for Ctrl+C or Cmd+C (copy)
  if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
    if (selectedObstaclesForEdit.length > 0) {
      // Copy selected obstacles
      clipboard = selectedObstaclesForEdit.map(obstacle => ({
        type: obstacle.type,
        worldX: obstacle.worldX,
        y: obstacle.y
      }));
      e.preventDefault();
    }
  }

  // Check for Ctrl+V or Cmd+V (paste)
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    if (clipboard.length > 0) {
      // Create new obstacles from clipboard with +10x, +10y offset
      const newObstacles = clipboard.map(copied => ({
        type: copied.type,
        worldX: copied.worldX + 10,
        y: copied.y + 10
      }));

      // Add to obstacles array
      obstacles.push(...newObstacles);

      // Set newly pasted obstacles as current selection
      selectedObstaclesForEdit = newObstacles;

      // Update clipboard to the new positions for repeated pasting
      clipboard = newObstacles.map(obstacle => ({
        type: obstacle.type,
        worldX: obstacle.worldX,
        y: obstacle.y
      }));

      redraw();
      e.preventDefault();
    }
  }
});
