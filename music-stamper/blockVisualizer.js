const canvas = document.getElementById('block-canvas');
const ctx = canvas.getContext('2d');
const gridSize = 10;
const gridCount = 40;
const stampedBlocks = [];
let mouseX = 200, mouseY = 200;
let audioContext, analyser, sourceNode, audioBufferSource, dataArray;
let isPlaying = false;
let animationId;
let audioElement;
let isShiftDown = false;
let isPainting = false;
let lastPaintTime = 0;
const paintInterval = 20; // ms between smears (10x faster)

// Slider elements
const binsSlider = document.getElementById('bins-slider');
const heightSlider = document.getElementById('height-slider');
const minvalSlider = document.getElementById('minval-slider');
const maxvalSlider = document.getElementById('maxval-slider');
const bassbaseSlider = document.getElementById('bassbase-slider');
const bassboostSlider = document.getElementById('bassboost-slider');
const minfreqSlider = document.getElementById('minfreq-slider');
const maxfreqSlider = document.getElementById('maxfreq-slider');

const binsValue = document.getElementById('bins-value');
const heightValue = document.getElementById('height-value');
const minvalValue = document.getElementById('minval-value');
const maxvalValue = document.getElementById('maxval-value');
const bassbaseValue = document.getElementById('bassbase-value');
const bassboostValue = document.getElementById('bassboost-value');
const minfreqValue = document.getElementById('minfreq-value');
const maxfreqValue = document.getElementById('maxfreq-value');

// Pastel color palette (100% opacity)
const pastelColors = [
  '#ffd6e0', // pink
  '#d6eaff', // blue
  '#d6ffd6', // green
  '#fff5d6', // yellow
  '#e0d6ff', // purple
  '#ffe6d6', // orange
  '#d6fff6', // teal
  '#f6d6ff', // lavender
];
let colorIndex = 0;

function getNextColor() {
  const color = pastelColors[colorIndex];
  colorIndex = (colorIndex + 1) % pastelColors.length;
  return color;
}
let currentStampColor = getNextColor();

// Set canvas background to fixed color (white)
canvas.style.background = '#FFF';

function updateSliderDisplays() {
  binsValue.textContent = binsSlider.value;
  heightValue.textContent = heightSlider.value;
  minvalValue.textContent = minvalSlider.value;
  maxvalValue.textContent = maxvalSlider.value;
  bassbaseValue.textContent = bassbaseSlider.value;
  bassboostValue.textContent = bassboostSlider.value;
  minfreqValue.textContent = minfreqSlider.value;
  maxfreqValue.textContent = maxfreqSlider.value;
}

[binsSlider, heightSlider, minvalSlider, maxvalSlider, bassbaseSlider, bassboostSlider, minfreqSlider, maxfreqSlider].forEach(slider => {
  slider.addEventListener('input', updateSliderDisplays);
  slider.addEventListener('input', () => { if (!animationId) draw(); });
});

// Ensure minfreq <= maxfreq - 1 and maxfreq >= minfreq + 1
minfreqSlider.addEventListener('input', () => {
  if (parseInt(minfreqSlider.value) >= parseInt(maxfreqSlider.value)) {
    maxfreqSlider.value = String(parseInt(minfreqSlider.value) + 1);
    updateSliderDisplays();
  }
});
maxfreqSlider.addEventListener('input', () => {
  if (parseInt(maxfreqSlider.value) <= parseInt(minfreqSlider.value)) {
    minfreqSlider.value = String(parseInt(maxfreqSlider.value) - 1);
    updateSliderDisplays();
  }
});

updateSliderDisplays();

const blendModeSelect = document.getElementById('blend-mode');
const softMultLabel = document.getElementById('soft-mult-label');
const softMultSlider = document.getElementById('soft-mult-slider');
const softMultValue = document.getElementById('soft-mult-value');

softMultSlider.addEventListener('input', () => {
  softMultValue.textContent = softMultSlider.value;
});
blendModeSelect.addEventListener('change', () => {
  softMultLabel.style.display = blendModeSelect.value === 'soft-multiply' ? '' : 'none';
});

// Grid-based storage: grid[x][y] = color string or null
const gridCells = Array.from({length: canvas.width / gridSize}, () =>
  Array(canvas.height / gridSize).fill(null)
);

function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  const num = parseInt(hex, 16);
  return [num >> 16 & 255, num >> 8 & 255, num & 255];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function multiplyBlend(existing, incoming) {
  return [
    Math.round((existing[0] * incoming[0]) / 255),
    Math.round((existing[1] * incoming[1]) / 255),
    Math.round((existing[2] * incoming[2]) / 255)
  ];
}
function softMultiplyBlend(existing, incoming, alpha) {
  const mult = multiplyBlend(existing, incoming);
  return [
    Math.round(existing[0] * (1 - alpha) + mult[0] * alpha),
    Math.round(existing[1] * (1 - alpha) + mult[1] * alpha),
    Math.round(existing[2] * (1 - alpha) + mult[2] * alpha)
  ];
}
function screenBlend(existing, incoming) {
  return [
    255 - Math.round((255 - existing[0]) * (255 - incoming[0]) / 255),
    255 - Math.round((255 - existing[1]) * (255 - incoming[1]) / 255),
    255 - Math.round((255 - existing[2]) * (255 - incoming[2]) / 255)
  ];
}
function averageBlend(existing, incoming) {
  return [
    Math.round((existing[0] + incoming[0]) / 2),
    Math.round((existing[1] + incoming[1]) / 2),
    Math.round((existing[2] + incoming[2]) / 2)
  ];
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw grid cells
  for (let gx = 0; gx < gridCells.length; gx++) {
    for (let gy = 0; gy < gridCells[0].length; gy++) {
      const color = gridCells[gx][gy];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(gx * gridSize, gy * gridSize, gridSize, gridSize);
      }
    }
  }
  // Draw grid lines
  ctx.strokeStyle = '#eee';
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawStampedBlocks() {
  // No-op: gridCells handles all drawing
}

function drawBlockShape(gridX, gridY, shape, color = currentStampColor) {
  // Only used for preview (not for grid painting)
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = color;
  for (let col = 0; col < shape.length; col++) {
    const blocks = shape[col];
    const centerY = gridY;
    const startY = centerY - Math.floor(blocks / 2) * gridSize;
    for (let row = 0; row < blocks; row++) {
      const x = gridX + col * gridSize;
      const y = startY + row * gridSize;
      ctx.fillRect(x, y, gridSize, gridSize);
    }
  }
  ctx.globalAlpha = 1.0;
}

function paintStamp() {
  let shape = getCurrentShape();
  if (isShiftDown) shape = rotateShape(shape);
  const snapX = Math.floor(mouseX / gridSize) * gridSize;
  const snapY = Math.floor(mouseY / gridSize) * gridSize;
  for (let col = 0; col < shape.length; col++) {
    const blocks = shape[col];
    const centerY = snapY;
    const startY = centerY - Math.floor(blocks / 2) * gridSize;
    for (let row = 0; row < blocks; row++) {
      const x = snapX + col * gridSize;
      const y = startY + row * gridSize;
      const gx = x / gridSize;
      const gy = y / gridSize;
      if (gx >= 0 && gx < gridCells.length && gy >= 0 && gy < gridCells[0].length) {
        const newRgb = hexToRgb(currentStampColor);
        const existingColor = gridCells[gx][gy];
        if (existingColor && blendModeSelect.value !== 'default') {
          const existingRgb = hexToRgb(existingColor);
          let blended;
          switch (blendModeSelect.value) {
            case 'multiply':
              blended = multiplyBlend(existingRgb, newRgb);
              break;
            case 'soft-multiply':
              blended = softMultiplyBlend(existingRgb, newRgb, parseFloat(softMultSlider.value));
              break;
            case 'screen':
              blended = screenBlend(existingRgb, newRgb);
              break;
            case 'average':
              blended = averageBlend(existingRgb, newRgb);
              break;
            default:
              blended = newRgb;
          }
          gridCells[gx][gy] = rgbToHex(blended);
        } else {
          gridCells[gx][gy] = currentStampColor;
        }
      }
    }
  }
  // Cycle to next color for next stamp
  currentStampColor = getNextColor();
}

canvas.addEventListener('mousedown', e => {
  isPainting = true;
  lastPaintTime = Date.now();
  paintStamp();
});
canvas.addEventListener('mouseup', e => {
  isPainting = false;
});
canvas.addEventListener('mouseleave', e => {
  isPainting = false;
});
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  if (isPainting) {
    const now = Date.now();
    if (now - lastPaintTime > paintInterval) {
      paintStamp();
      lastPaintTime = now;
    }
  }
});

// Remove old click event for stamping
canvas.removeEventListener && canvas.removeEventListener('click', () => {});

// Audio setup
function setupAudioContext(audio) {
  if (audioContext) audioContext.close();
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 64;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);
}

// Play default audio or loaded file
function playAudio(file) {
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
  audioElement = new Audio();
  audioElement.crossOrigin = 'anonymous';
  audioElement.loop = true;
  if (file) {
    audioElement.src = URL.createObjectURL(file);
  } else {
    audioElement.src = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b6fae3b7.mp3'; // Free sample
  }
  audioElement.addEventListener('canplay', () => {
    setupAudioContext(audioElement);
    audioElement.play();
    isPlaying = true;
    if (!animationId) draw();
  });
}

document.getElementById('play-btn').addEventListener('click', () => {
  if (!isPlaying) {
    playAudio();
  } else if (audioElement) {
    audioElement.pause();
    isPlaying = false;
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
  }
});

document.getElementById('audio-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) playAudio(file);
});

// Initial draw
drawGrid();

function updateCanvasBg() {
  canvas.style.background = currentStampColor;
}

document.getElementById('clear-btn').addEventListener('click', () => {
  for (let gx = 0; gx < gridCells.length; gx++) {
    for (let gy = 0; gy < gridCells[0].length; gy++) {
      gridCells[gx][gy] = null;
    }
  }
  drawGrid();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Shift') isShiftDown = true;
});
window.addEventListener('keyup', e => {
  if (e.key === 'Shift') isShiftDown = false;
});

function rotateShape(shape) {
  // shape: [col0Height, col1Height, ...]
  // Build 2D grid: grid[col][row] = 1 if filled, 0 if empty
  const maxBlocks = Math.max(...shape);
  const bins = shape.length;
  const grid = Array.from({length: bins}, (_, col) =>
    Array.from({length: maxBlocks}, (_, row) => row < shape[col] ? 1 : 0)
  );
  // Rotate 90deg clockwise: newGrid[row][bins - col - 1] = grid[col][row]
  const rotatedGrid = Array.from({length: maxBlocks}, () => Array(bins).fill(0));
  for (let col = 0; col < bins; col++) {
    for (let row = 0; row < maxBlocks; row++) {
      rotatedGrid[row][bins - col - 1] = grid[col][row];
    }
  }
  // Convert each new column to a height (count of filled blocks)
  const rotatedShape = [];
  for (let col = 0; col < maxBlocks; col++) {
    let height = 0;
    for (let row = 0; row < bins; row++) {
      if (rotatedGrid[col][row]) height++;
    }
    rotatedShape.push(height);
  }
  return rotatedShape;
}

function draw() {
  drawGrid();
  // Draw the moving visualizer shape at the mouse position (snapped to grid)
  let shape = getCurrentShape();
  if (isShiftDown) shape = rotateShape(shape);
  const snapX = Math.floor(mouseX / gridSize) * gridSize;
  const snapY = Math.floor(mouseY / gridSize) * gridSize;
  drawBlockShape(snapX, snapY, shape);
  animationId = requestAnimationFrame(draw);
}

function getCurrentShape() {
  if (!analyser || !dataArray) return Array(Number(binsSlider.value)).fill(0);
  analyser.getByteFrequencyData(dataArray);
  const bins = Number(binsSlider.value);
  const shape = [];
  const minVal = Number(minvalSlider.value);
  const maxVal = Number(maxvalSlider.value);
  const maxBlocks = Number(heightSlider.value);
  const bassBase = Number(bassbaseSlider.value);
  const bassBoost = Number(bassboostSlider.value);
  const minFreq = Number(minfreqSlider.value);
  const maxFreq = Number(maxfreqSlider.value);
  const freqRange = maxFreq - minFreq;
  for (let i = 0; i < bins; i++) {
    // Map frequency bins to our shape columns, within selected range
    const binIdx = minFreq + Math.floor(i * freqRange / bins);
    let magnitude = dataArray[binIdx];
    // More aggressive normalization: cubic boost for treble
    const t = i / (bins - 1);
    const norm = bassBase + bassBoost * Math.pow(t, 2.5); // Stronger boost for high bins
    magnitude = magnitude * norm;
    // Clamp and linearly interpolate
    let height = (magnitude - minVal) / (maxVal - minVal) * maxBlocks;
    height = Math.max(0, Math.min(maxBlocks, height));
    shape[i] = Math.round(height);
  }
  return shape;
}

document.getElementById('download-btn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'music-stamp.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}); 