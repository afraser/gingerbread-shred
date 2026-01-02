// Trail Maker - Tool for creating custom trails

// Constants
const TRAIL_WIDTH = 800;
const TRAIL_LENGTH = 12000;

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

// Initialize
function init() {
  // Draw initial canvas background
  ctx.fillStyle = '#c2c3c7';
  ctx.fillRect(0, 0, TRAIL_WIDTH, TRAIL_LENGTH);

  // Draw grid lines for reference
  drawGrid();
}

// Draw a grid on the canvas to help with placement
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
  alert('Save functionality coming soon!');
});

// Canvas click handler (placeholder for future functionality)
canvas.addEventListener('click', (e) => {
  if (!selectedObstacle) {
    alert('Please select an obstacle type first!');
    return;
  }

  // Future: Place obstacle at click location
  console.log('Canvas clicked at:', e.offsetX, e.offsetY, 'with obstacle:', selectedObstacle);
});
