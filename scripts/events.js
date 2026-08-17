// Canvas and window event handling

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let touchStartTime = null;
let initialTouchDistance = null;
let initialCanvasScale = null;
let touchPending = null;
let longPressTimer = null;
let lastTapTime = 0;
let lastTapX = 0;
let lastTapY = 0;
let resizeTimer = null;

const LONG_PRESS_DURATION = 500;
const DOUBLE_TAP_DISTANCE = 30;
const DOUBLE_TAP_TIME = 300;

function setupCanvasEventListeners() {
  const canvas = AppState.canvas;
  if (!canvas) return;

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
  canvas.addEventListener('wheel', handleMouseWheel, { passive: false });

  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd);

  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('orientationchange', handleWindowResize);
  document.addEventListener('keydown', handleKeyDown);
}

function handleWindowResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    updateMobileToolbarHeight();
    resizeCanvas();
    const container = document.getElementById('canvas-container');
    if (container) {
      const canvasWidth = canvasSize * tileSize * AppState.canvasScale;
      const canvasHeight = canvasSize * tileSize * AppState.canvasScale;
      AppState.offsetX = (container.clientWidth - canvasWidth) / 2;
      AppState.offsetY = (container.clientHeight - canvasHeight) / 2;
    }
    updateZoomDisplay();
  }, 100);
}

function handleMouseDown(e) {
  if (e.button === 1 || e.button === 2) {
    isDragging = true;
    dragStartX = e.clientX - AppState.offsetX;
    dragStartY = e.clientY - AppState.offsetY;
    AppState.canvas.style.cursor = 'grabbing';
    e.preventDefault();
    return;
  }

  if (e.button === 0) {
    const gridPos = screenToGrid(e.clientX, e.clientY);
    setBlock(gridPos.x, gridPos.y, AppState.selectedComponent);
  }
}

function handleMouseMove(e) {
  const gridPos = screenToGrid(e.clientX, e.clientY);
  updateCursorPosition(gridPos.x, gridPos.y);

  if (isDragging) {
    AppState.offsetX = e.clientX - dragStartX;
    AppState.offsetY = e.clientY - dragStartY;
    requestRender();
  }
}

function handleMouseUp() {
  isDragging = false;
  if (AppState.canvas) AppState.canvas.style.cursor = 'default';
}

function handleMouseWheel(e) {
  e.preventDefault();
  const zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
  zoomCanvas(zoomAmount, e.clientX, e.clientY);
}

function handleTouchStart(e) {
  e.preventDefault();
  const touches = e.touches;
  touchStartTime = Date.now();
  clearLongPressTimer();

  if (touches.length === 1) {
    isDragging = true;
    dragStartX = touches[0].clientX - AppState.offsetX;
    dragStartY = touches[0].clientY - AppState.offsetY;

    const gridPos = screenToGrid(touches[0].clientX, touches[0].clientY);
    if (gridPos.x >= 0 && gridPos.x < canvasSize && gridPos.y >= 0 && gridPos.y < canvasSize) {
      touchPending = { gridX: gridPos.x, gridY: gridPos.y };

      longPressTimer = setTimeout(() => {
        if (touchPending && AppState.grid[`${gridPos.x},${gridPos.y}`]) {
          setBlock(gridPos.x, gridPos.y, 'air');
          triggerHaptic(20);
          touchPending = null;
        }
      }, LONG_PRESS_DURATION);
    }
  } else if (touches.length === 2) {
    isDragging = false;
    const [touch1, touch2] = touches;
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    initialTouchDistance = Math.sqrt(dx * dx + dy * dy);
    initialCanvasScale = AppState.canvasScale;
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  const touches = e.touches;
  clearLongPressTimer();

  if (touches.length === 1 && isDragging) {
    AppState.offsetX = touches[0].clientX - dragStartX;
    AppState.offsetY = touches[0].clientY - dragStartY;

    const gridPos = screenToGrid(touches[0].clientX, touches[0].clientY);
    updateCursorPosition(gridPos.x, gridPos.y);
    requestRender();
  } else if (touches.length === 2 && initialTouchDistance) {
    const [touch1, touch2] = touches;
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    const scaleChange = currentDistance / initialTouchDistance;
    const oldScale = AppState.canvasScale;

    AppState.canvasScale = Math.max(0.1, Math.min(2.0, initialCanvasScale * scaleChange));

    const rect = AppState.canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const canvasX = centerX - rect.left;
    const canvasY = centerY - rect.top;

    const gridCenterX = (canvasX - AppState.offsetX) / (tileSize * oldScale);
    const gridCenterY = (canvasY - AppState.offsetY) / (tileSize * oldScale);

    AppState.offsetX = canvasX - gridCenterX * tileSize * AppState.canvasScale;
    AppState.offsetY = canvasY - gridCenterY * tileSize * AppState.canvasScale;

    updateZoomDisplay();
    requestRender();
  }
}

function handleTouchEnd(e) {
  clearLongPressTimer();

  const touchDuration = Date.now() - touchStartTime;
  const changedTouches = e.changedTouches;

  if (touchDuration < 200 && touchPending && changedTouches.length === 1) {
    const { gridX, gridY } = touchPending;
    const touch = changedTouches[0];
    const currentTime = Date.now();
    const tapDistance = Math.hypot(touch.clientX - lastTapX, touch.clientY - lastTapY);

    if (currentTime - lastTapTime < DOUBLE_TAP_TIME && tapDistance < DOUBLE_TAP_DISTANCE) {
      if (AppState.canvasScale < 1.0) {
        zoomCanvas(0.5, touch.clientX, touch.clientY);
      } else {
        zoomCanvas(-0.5, touch.clientX, touch.clientY);
      }
      triggerHaptic(15);
      lastTapTime = 0;
    } else {
      setBlock(gridX, gridY, AppState.selectedComponent);
      lastTapTime = currentTime;
      lastTapX = touch.clientX;
      lastTapY = touch.clientY;
    }
  }

  isDragging = false;
  initialTouchDistance = null;
  initialCanvasScale = null;
  touchPending = null;
  touchStartTime = null;
}

function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function handleKeyDown(e) {
  if (e.key !== 'Escape') return;

  const openModal = document.querySelector('.modal.show');
  if (openModal) {
    closeAllModals();
    return;
  }

  const componentsPanel = document.getElementById('components-panel');
  const overlay = document.getElementById('panel-overlay');
  if (componentsPanel && componentsPanel.classList.contains('open')) {
    componentsPanel.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  }
}

function setupMobileEventListeners() {
  const panelToggle = document.getElementById('mobile-panel-toggle');
  const panelClose = document.getElementById('panel-close-btn');
  const componentsPanel = document.getElementById('components-panel');

  let overlay = document.getElementById('panel-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'panel-overlay';
    overlay.id = 'panel-overlay';
    document.body.appendChild(overlay);
  }

  function openPanel() {
    componentsPanel.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    componentsPanel.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (panelToggle) panelToggle.addEventListener('click', openPanel);
  if (panelClose) panelClose.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', closePanel);

  const componentsList = document.getElementById('components-list');
  if (componentsList) {
    componentsList.addEventListener('click', (e) => {
      if (e.target.closest('.component')) {
        setTimeout(closePanel, 180);
      }
    });
  }

  bindMobileTool('mobile-undo-btn', undo);
  bindMobileTool('mobile-redo-btn', redo);
  bindMobileTool('mobile-clear-btn', openClearConfirmModal);
  bindMobileTool('mobile-save-btn', openSaveModal);
  bindMobileTool('mobile-load-btn', openLoadModal);
  bindMobileTool('mobile-theme-btn', toggleTheme);
}

function bindMobileTool(id, handler) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('click', () => {
      handler();
      triggerHaptic(10);
    });
  }
}
