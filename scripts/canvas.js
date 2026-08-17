// Canvas rendering and screenshot utilities

let renderPending = false;

function initCanvas() {
  AppState.canvas = document.getElementById('canvas');
  if (!AppState.canvas) {
    displayError('Canvas element not found');
    return;
  }

  AppState.ctx = AppState.canvas.getContext('2d');
  AppState.ctx.imageSmoothingEnabled = false;

  resizeCanvas();
  setupCanvasEventListeners();
  requestRender();
}

function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  if (!container || !AppState.canvas || !AppState.ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = container.clientWidth;
  const height = container.clientHeight;

  AppState.canvas.width = width * dpr;
  AppState.canvas.height = height * dpr;
  AppState.canvas.style.width = `${width}px`;
  AppState.canvas.style.height = `${height}px`;

  AppState.ctx.setTransform(1, 0, 0, 1, 0, 0);
  AppState.ctx.scale(dpr, dpr);
  requestRender();
}

function requestRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => {
    render();
    renderPending = false;
  });
}

function render() {
  if (!AppState.ctx || !AppState.canvas) return;

  const ctx = AppState.ctx;
  const width = AppState.canvas.clientWidth;
  const height = AppState.canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(AppState.offsetX, AppState.offsetY);
  ctx.scale(AppState.canvasScale, AppState.canvasScale);

  drawGrid();

  const visibleRange = getVisibleGridRange();
  for (const [key, compId] of Object.entries(AppState.grid)) {
    const [x, y] = key.split(',').map(Number);
    if (
      x >= visibleRange.startX &&
      x < visibleRange.endX &&
      y >= visibleRange.startY &&
      y < visibleRange.endY &&
      AppState.images[compId]
    ) {
      ctx.drawImage(AppState.images[compId], x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  ctx.restore();
}

function getVisibleGridRange() {
  if (!AppState.canvas) return { startX: 0, endX: canvasSize, startY: 0, endY: canvasSize };

  const width = AppState.canvas.clientWidth;
  const height = AppState.canvas.clientHeight;

  return {
    startX: Math.max(0, Math.floor((-AppState.offsetX / AppState.canvasScale) / tileSize) - 1),
    endX: Math.min(canvasSize, Math.ceil((width - AppState.offsetX) / (tileSize * AppState.canvasScale)) + 1),
    startY: Math.max(0, Math.floor((-AppState.offsetY / AppState.canvasScale) / tileSize) - 1),
    endY: Math.min(canvasSize, Math.ceil((height - AppState.offsetY) / (tileSize * AppState.canvasScale)) + 1)
  };
}

function drawGrid() {
  const ctx = AppState.ctx;
  // Read the resolved custom property from body so the dark-mode value applies
  const gridLineColor = getComputedStyle(document.body).getPropertyValue('--grid-line').trim() || '#d1dbe6';
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth = 1 / AppState.canvasScale;
  ctx.globalAlpha = 0.7;

  const range = getVisibleGridRange();
  ctx.beginPath();
  for (let x = range.startX; x <= range.endX; x++) {
    const pixelX = x * tileSize;
    ctx.moveTo(pixelX, range.startY * tileSize);
    ctx.lineTo(pixelX, range.endY * tileSize);
  }
  for (let y = range.startY; y <= range.endY; y++) {
    const pixelY = y * tileSize;
    ctx.moveTo(range.startX * tileSize, pixelY);
    ctx.lineTo(range.endX * tileSize, pixelY);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function resetCanvasPosition() {
  AppState.canvasScale = 0.4;
  const container = document.getElementById('canvas-container');
  if (!container) return;

  const canvasWidth = canvasSize * tileSize * AppState.canvasScale;
  const canvasHeight = canvasSize * tileSize * AppState.canvasScale;
  AppState.offsetX = (container.clientWidth - canvasWidth) / 2;
  AppState.offsetY = (container.clientHeight - canvasHeight) / 2;
  updateZoomDisplay();
  requestRender();
}

function zoomCanvas(zoomAmount, centerX, centerY) {
  const oldScale = AppState.canvasScale;
  AppState.canvasScale = Math.max(0.1, Math.min(2.0, AppState.canvasScale + zoomAmount));

  const rect = AppState.canvas.getBoundingClientRect();
  const canvasX = (centerX ?? rect.left + rect.width / 2) - rect.left;
  const canvasY = (centerY ?? rect.top + rect.height / 2) - rect.top;

  const gridCenterX = (canvasX - AppState.offsetX) / (tileSize * oldScale);
  const gridCenterY = (canvasY - AppState.offsetY) / (tileSize * oldScale);

  AppState.offsetX = canvasX - gridCenterX * tileSize * AppState.canvasScale;
  AppState.offsetY = canvasY - gridCenterY * tileSize * AppState.canvasScale;

  updateZoomDisplay();
  requestRender();
}

function screenToGrid(clientX, clientY) {
  const rect = AppState.canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  return {
    x: Math.floor((x - AppState.offsetX) / (tileSize * AppState.canvasScale)),
    y: Math.floor((y - AppState.offsetY) / (tileSize * AppState.canvasScale))
  };
}

function updateCursorPosition(gridX, gridY) {
  const isInBounds = gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize;
  updateDynamicText('cursor-position', isInBounds ? `${gridX},${gridY}` : '0,0');
}

function openScreenshotPreview() {
  const sourceCanvas = AppState.canvas;
  const previewCanvas = document.getElementById('screenshot-preview');
  if (!sourceCanvas || !previewCanvas) return;

  // Build the preview at a reasonable internal resolution (based on CSS pixels)
  const dpr = window.devicePixelRatio || 1;
  const sourceCssWidth = sourceCanvas.width / dpr;
  const sourceCssHeight = sourceCanvas.height / dpr;
  const scale = 0.8;
  previewCanvas.width = Math.max(1, Math.floor(sourceCssWidth * scale));
  previewCanvas.height = Math.max(1, Math.floor(sourceCssHeight * scale));

  const ctx = previewCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.drawImage(sourceCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

  const info = document.getElementById('screenshot-info');
  if (info) info.textContent = `${previewCanvas.width}×${previewCanvas.height}`;

  openModal('screenshot-modal');
}

function downloadScreenshot() {
  const previewCanvas = document.getElementById('screenshot-preview');
  if (!previewCanvas) return;

  const link = document.createElement('a');
  link.download = 'redstone_screenshot.png';
  link.href = previewCanvas.toDataURL('image/png');
  link.click();
}
