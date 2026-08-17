/**
 * 画布渲染模块：网格绘制、组件绘制、视图变换（缩放/平移）、截图。
 *
 * 渲染策略：
 * - 仅绘制可视范围内的格子（getVisibleGridRange 裁剪），64×64 网格下保持流畅
 * - requestRender() 合并多次状态变更到同一帧（requestAnimationFrame 去抖）
 * - 画布物理分辨率跟随 devicePixelRatio，保证高分屏清晰
 *
 * 依赖：
 * - utils.js（AppState / canvasSize / tileSize / displayError / updateDynamicText / updateZoomDisplay）
 * - events.js（setupCanvasEventListeners）
 * - modals.js（openModal）
 */

/** 渲染去抖标记：一帧内多次请求只渲染一次 */
let renderPending = false;

/** 初始化画布：获取元素与 2D 上下文、适配尺寸、绑定事件、首次渲染 */
function initCanvas() {
  AppState.canvas = document.getElementById('canvas');
  if (!AppState.canvas) {
    displayError('Canvas element not found');
    return;
  }

  AppState.ctx = AppState.canvas.getContext('2d');
  AppState.ctx.imageSmoothingEnabled = false; // 保持像素风（方块贴图不模糊）

  resizeCanvas();
  setupCanvasEventListeners();
  requestRender();
}

/** 按容器尺寸 + devicePixelRatio 重建画布缓冲 */
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

  // 以 CSS 像素为单位绘制（坐标换算在 dpr 缩放之后）
  AppState.ctx.setTransform(1, 0, 0, 1, 0, 0);
  AppState.ctx.scale(dpr, dpr);
  requestRender();
}

/** 请求一帧渲染（同一帧内多次调用只渲染一次） */
function requestRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => {
    render();
    renderPending = false;
  });
}

/** 执行一帧渲染：清屏 → 网格 → 可见范围内的组件贴图 */
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

/** 计算当前视口可见的网格范围（含 1 格外扩，避免边缘线条/贴图缺失） */
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

/** 绘制网格线；颜色读取 body 上的 --grid-line 变量（暗色模式覆盖在 body 上） */
function drawGrid() {
  const ctx = AppState.ctx;
  // 从 body 读取已解析的变量，确保暗色主题下的高亮网格线生效
  const gridLineColor = getComputedStyle(document.body).getPropertyValue('--grid-line').trim() || '#d1dbe6';
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth = 1 / AppState.canvasScale; // 缩放后保持 1px 视觉宽度
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

/** 重置视图：缩放 40% 并将整个网格居中显示 */
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

/**
 * 以指定点为中心缩放视图。
 * @param {number} zoomAmount 缩放增量（正数放大、负数缩小）
 * @param {number} [centerX] 缩放中心屏幕横坐标；缺省为画布中心
 * @param {number} [centerY] 缩放中心屏幕纵坐标；缺省为画布中心
 */
function zoomCanvas(zoomAmount, centerX, centerY) {
  const oldScale = AppState.canvasScale;
  AppState.canvasScale = Math.max(0.1, Math.min(2.0, AppState.canvasScale + zoomAmount));

  const rect = AppState.canvas.getBoundingClientRect();
  const canvasX = (centerX ?? rect.left + rect.width / 2) - rect.left;
  const canvasY = (centerY ?? rect.top + rect.height / 2) - rect.top;

  // 保持缩放中心对应的网格点不动（锚点缩放）
  const gridCenterX = (canvasX - AppState.offsetX) / (tileSize * oldScale);
  const gridCenterY = (canvasY - AppState.offsetY) / (tileSize * oldScale);

  AppState.offsetX = canvasX - gridCenterX * tileSize * AppState.canvasScale;
  AppState.offsetY = canvasY - gridCenterY * tileSize * AppState.canvasScale;

  updateZoomDisplay();
  requestRender();
}

/**
 * 屏幕坐标 → 网格坐标（考虑视图偏移与缩放）。
 * @param {number} clientX 屏幕横坐标
 * @param {number} clientY 屏幕纵坐标
 * @returns {{x: number, y: number}} 网格坐标
 */
function screenToGrid(clientX, clientY) {
  const rect = AppState.canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  return {
    x: Math.floor((x - AppState.offsetX) / (tileSize * AppState.canvasScale)),
    y: Math.floor((y - AppState.offsetY) / (tileSize * AppState.canvasScale))
  };
}

/** 刷新状态栏中的光标坐标（越界显示 0,0） */
function updateCursorPosition(gridX, gridY) {
  const isInBounds = gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize;
  updateDynamicText('cursor-position', isInBounds ? `${gridX},${gridY}` : '0,0');
}

/**
 * 生成截图预览：将当前画布缩采样到 CSS 像素尺寸的 80%，
 * 打开预览弹窗。基于 CSS 像素计算可避免高 DPR 下预览超出弹窗。
 */
function openScreenshotPreview() {
  const sourceCanvas = AppState.canvas;
  const previewCanvas = document.getElementById('screenshot-preview');
  if (!sourceCanvas || !previewCanvas) return;

  // 以 CSS 像素为基准生成预览，避免 DPR 放大导致溢出
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

/** 下载预览图为 PNG 文件 */
function downloadScreenshot() {
  const previewCanvas = document.getElementById('screenshot-preview');
  if (!previewCanvas) return;

  const link = document.createElement('a');
  link.download = 'redstone_screenshot.png';
  link.href = previewCanvas.toDataURL('image/png');
  link.click();
}
