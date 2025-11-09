let canvasScale = 1.0; // 默认缩放
let offsetX = 0, offsetY = 0;
let canvas, ctx;
let animationFrameId;
let images = {}; // 图集

function initCanvas() {
  try {
    canvas = document.getElementById('canvas');
    if (!canvas) throw new Error('Canvas element not found');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    resizeCanvas();
    setupCanvasEventListeners();
    render();
  } catch (error) {
    displayError(`initCanvas error: ${error.message}`);
  }
}

function resizeCanvas() {
  try {
    const container = document.getElementById('canvas-container');
    if (!container) throw new Error('Canvas container not found');

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 实际像素大小 = CSS 像素 * DPR
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // canvas 样式维持视觉大小
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    // 调整绘制比例
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  } catch (error) {
    displayError(`resizeCanvas error: ${error.message}`);
  }
}


function drawGrid() {
  try {
    const gridLineColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-line').trim() || '#d1dbe6';
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1 / canvasScale;
    ctx.globalAlpha = 0.7;
    const visibleStartX = Math.max(0, Math.floor((-offsetX / canvasScale) / tileSize) - 1);
    const visibleEndX = Math.min(canvasSize, Math.ceil((canvas.width - offsetX) / (tileSize * canvasScale)) + 1);
    const visibleStartY = Math.max(0, Math.floor((-offsetY / canvasScale) / tileSize) - 1);
    const visibleEndY = Math.min(canvasSize, Math.ceil((canvas.height - offsetY) / (tileSize * canvasScale)) + 1);
    ctx.beginPath();
    for (let x = visibleStartX; x <= visibleEndX; x++) {
      const pixelX = x * tileSize;
      ctx.moveTo(pixelX, visibleStartY * tileSize);
      ctx.lineTo(pixelX, visibleEndY * tileSize);
    }
    for (let y = visibleStartY; y <= visibleEndY; y++) {
      const pixelY = y * tileSize;
      ctx.moveTo(visibleStartX * tileSize, pixelY);
      ctx.lineTo(visibleEndX * tileSize, pixelY);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  } catch (error) {
    displayError(`drawGrid error: ${error.message}`);
  }
}

function render() {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(canvasScale, canvasScale);
    drawGrid();
    const visibleStartX = Math.max(0, Math.floor((-offsetX / canvasScale) / tileSize) - 1);
    const visibleEndX = Math.min(canvasSize, Math.ceil((canvas.width - offsetX) / (tileSize * canvasScale)) + 1);
    const visibleStartY = Math.max(0, Math.floor((-offsetY / canvasScale) / tileSize) - 1);
    const visibleEndY = Math.min(canvasSize, Math.ceil((canvas.height - offsetY) / (tileSize * canvasScale)) + 1);
    for (const [key, compId] of Object.entries(grid)) {
      const [x, y] = key.split(',').map(Number);
      if (x >= visibleStartX && x < visibleEndX && y >= visibleStartY && y < visibleEndY && images[compId]) {
        const img = images[compId];
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
    ctx.restore();
    animationFrameId = requestAnimationFrame(render);
  } catch (error) {
    displayError(`render error: ${error.message}`);
    cancelAnimationFrame(animationFrameId);
  }
}

function resetCanvasPosition() {
  try {
    canvasScale = 1.0;
    const container = document.getElementById('canvas-container');
    const canvasWidth = canvasSize * tileSize * canvasScale;
    const canvasHeight = canvasSize * tileSize * canvasScale;
    offsetX = (container.clientWidth - canvasWidth) / 2;
    offsetY = (container.clientHeight - canvasHeight) / 2;
    updateZoomDisplay();
  } catch (error) {
    displayError(`resetCanvasPosition error: ${error.message}`);
  }
}

const screenshotBtn = document.getElementById("save-screen");
const screenshotModal = document.getElementById("screenshot-modal");
const previewCanvas = document.getElementById("screenshot-preview");
const downloadBtn = document.getElementById("download-screenshot");

screenshotBtn.addEventListener("click", openScreenshotPreview);

function openScreenshotPreview() {
  const canvas = document.getElementById("canvas");
  const scale = 0.8; // 导出倍率，可调整
  previewCanvas.width = canvas.width * scale;
  previewCanvas.height = canvas.height * scale;
  const ctx = previewCanvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(canvas, 0, 0);//绘制于导出缓冲区

  document.getElementById("screenshot-info").textContent =
    `${previewCanvas.width}×${previewCanvas.height}`;

  screenshotModal.style.display = "flex";
  setTimeout(() => screenshotModal.classList.add("show"), 10);
}

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "redstone_screenshot.png";
  link.href = previewCanvas.toDataURL("image/png");
  link.click();//下载
});

document.querySelectorAll("#screenshot-modal .close-modal").forEach(btn => {
  btn.addEventListener("click", closeAllModals);
});

screenshotModal.addEventListener("click", (e) => {
  if (e.target === screenshotModal) {
    closeAllModals();
  }
});

