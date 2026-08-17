/**
 * 事件处理模块：画布鼠标/触摸交互、窗口缩放、移动端抽屉面板。
 *
 * 交互约定：
 * - 鼠标：左键放置组件、中/右键拖动画布、滚轮缩放
 * - 触摸：单指拖动画布、双击缩放、长按删除、双指捏合缩放、轻点放置
 * - 键盘：Esc 关闭弹窗或抽屉面板
 *
 * 依赖：
 * - utils.js（AppState / updateMobileToolbarHeight / triggerHaptic）
 * - canvas.js（resizeCanvas / screenToGrid / updateCursorPosition / zoomCanvas / requestRender）
 * - placements.js（setBlock）
 * - modals.js（openClearConfirmModal / openSaveModal / openLoadModal / closeAllModals）
 */

// ---- 交互状态（模块级，避免污染全局） ----
let isDragging = false;            // 是否正在拖动画布
let dragStartX = 0;                // 拖拽起点（记录 offsetX 与指针的差值基准）
let dragStartY = 0;
let touchStartTime = null;         // 触摸开始时间（用于区分轻点/长按）
let initialTouchDistance = null;   // 双指初始间距（捏合缩放的基准）
let initialCanvasScale = null;     // 双指开始时的缩放值
let touchPending = null;           // 等待确认的轻点目标（{gridX, gridY}）
let longPressTimer = null;         // 长按定时器
let lastTapTime = 0;               // 上一次轻点时间（双击检测）
let lastTapX = 0;                  // 上一次轻点坐标
let lastTapY = 0;
let resizeTimer = null;            // resize 防抖定时器

/** 长按触发删除的时长（毫秒） */
const LONG_PRESS_DURATION = 500;
/** 双击判定：两次点击的最大距离（像素） */
const DOUBLE_TAP_DISTANCE = 30;
/** 双击判定：两次点击的最大间隔（毫秒） */
const DOUBLE_TAP_TIME = 300;

/** 绑定画布的全部事件监听（在 initCanvas 后调用） */
function setupCanvasEventListeners() {
  const canvas = AppState.canvas;
  if (!canvas) return;

  // 鼠标交互
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
  canvas.addEventListener('wheel', handleMouseWheel, { passive: false });

  // 触摸交互（passive:false 以允许 preventDefault 阻止页面滚动）
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd);

  // 窗口与键盘
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('orientationchange', handleWindowResize);
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * 窗口尺寸变化（防抖 100ms）：重测工具栏高度、重建画布缓冲、重定位视图到画布中心。
 */
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

/**
 * 鼠标按下：中键/右键进入拖拽模式；左键放置/删除组件。
 * @param {MouseEvent} e
 */
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

/**
 * 鼠标移动：持续刷新光标坐标；拖拽中更新视图偏移。
 * @param {MouseEvent} e
 */
function handleMouseMove(e) {
  const gridPos = screenToGrid(e.clientX, e.clientY);
  updateCursorPosition(gridPos.x, gridPos.y);

  if (isDragging) {
    AppState.offsetX = e.clientX - dragStartX;
    AppState.offsetY = e.clientY - dragStartY;
    requestRender();
  }
}

/** 鼠标抬起/离开：结束拖拽 */
function handleMouseUp() {
  isDragging = false;
  if (AppState.canvas) AppState.canvas.style.cursor = 'default';
}

/** 滚轮缩放（以鼠标位置为缩放中心） */
function handleMouseWheel(e) {
  e.preventDefault();
  const zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
  zoomCanvas(zoomAmount, e.clientX, e.clientY);
}

/**
 * 触摸开始：
 * - 单指：记录拖拽起点，并开启长按删除定时器
 * - 双指：切换为捏合缩放，清除待放置状态避免误触发放置
 */
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

      // 长按 500ms：若该格已有组件则删除（等价于"空气"点击）
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
    // 进入双指缩放：清除轻点候选，防止抬起单指时误触发放置
    touchPending = null;
    const [touch1, touch2] = touches;
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    initialTouchDistance = Math.sqrt(dx * dx + dy * dy);
    initialCanvasScale = AppState.canvasScale;
  }
}

/**
 * 触摸移动：
 * - 单指：拖动画布
 * - 双指：以两指中心为基准捏合缩放
 */
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

    // 缩放范围 [0.1, 2.0]
    AppState.canvasScale = Math.max(0.1, Math.min(2.0, initialCanvasScale * scaleChange));

    // 保持画布中心对应的网格点不动（以中心为锚点的缩放）
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

/**
 * 触摸结束：
 * - 短按（<200ms）且未发生长按 → 判定为轻点：双击缩放或放置组件
 * - 重置所有触摸状态
 */
function handleTouchEnd(e) {
  clearLongPressTimer();

  const touchDuration = Date.now() - touchStartTime;
  const changedTouches = e.changedTouches;

  if (touchDuration < 200 && touchPending && changedTouches.length === 1) {
    const { gridX, gridY } = touchPending;
    const touch = changedTouches[0];
    const currentTime = Date.now();
    const tapDistance = Math.hypot(touch.clientX - lastTapX, touch.clientY - lastTapY);

    // 双击：在缩放 <100% 时放大 50%，否则缩小 50%
    if (currentTime - lastTapTime < DOUBLE_TAP_TIME && tapDistance < DOUBLE_TAP_DISTANCE) {
      if (AppState.canvasScale < 1.0) {
        zoomCanvas(0.5, touch.clientX, touch.clientY);
      } else {
        zoomCanvas(-0.5, touch.clientX, touch.clientY);
      }
      triggerHaptic(15);
      lastTapTime = 0;
    } else {
      // 单击：放置当前选中的组件
      setBlock(gridX, gridY, AppState.selectedComponent);
      lastTapTime = currentTime;
      lastTapX = touch.clientX;
      lastTapY = touch.clientY;
    }
  }

  // 重置触摸交互状态
  isDragging = false;
  initialTouchDistance = null;
  initialCanvasScale = null;
  touchPending = null;
  touchStartTime = null;
}

/** 清除长按定时器（触摸移动/结束时调用） */
function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

/**
 * 键盘事件：
 * - Ctrl/Cmd + Z：撤销；Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y：重做
 *   （与移动端撤销/重做按钮共用 undo()/redo()）
 * - Esc：依次关闭弹窗 → 抽屉面板
 * 输入框/文本域获得焦点时跳过快捷键处理，保留浏览器原生行为。
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e) {
  const target = e.target;
  const isTyping = target && (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
  if (isTyping) return;

  const isModifier = e.ctrlKey || e.metaKey;

  // 撤销 / 重做快捷键
  if (isModifier && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
    return;
  }
  if (isModifier && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    redo();
    return;
  }

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

/**
 * 移动端抽屉面板：绑定开/关按钮、遮罩点击、选中组件后自动收起。
 * 同时绑定底部工具栏的六个功能按钮。
 */
function setupMobileEventListeners() {
  const panelToggle = document.getElementById('mobile-panel-toggle');
  const panelClose = document.getElementById('panel-close-btn');
  const componentsPanel = document.getElementById('components-panel');

  // 遮罩层由 JS 创建（避免在桌面端留下无用 DOM）
  let overlay = document.getElementById('panel-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'panel-overlay';
    overlay.id = 'panel-overlay';
    document.body.appendChild(overlay);
  }

  /** 打开抽屉：加 class 触发过渡，并锁定 body 滚动 */
  function openPanel() {
    componentsPanel.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  /** 关闭抽屉：移除 class，恢复 body 滚动 */
  function closePanel() {
    componentsPanel.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (panelToggle) panelToggle.addEventListener('click', openPanel);
  if (panelClose) panelClose.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', closePanel);

  // 在抽屉中选中组件后延迟收起，让用户看到选中高亮
  const componentsList = document.getElementById('components-list');
  if (componentsList) {
    componentsList.addEventListener('click', (e) => {
      if (e.target.closest('.component')) {
        setTimeout(closePanel, 180);
      }
    });
  }

  // 底部工具栏按钮
  bindMobileTool('mobile-undo-btn', undo);
  bindMobileTool('mobile-redo-btn', redo);
  bindMobileTool('mobile-clear-btn', openClearConfirmModal);
  bindMobileTool('mobile-save-btn', openSaveModal);
  bindMobileTool('mobile-load-btn', openLoadModal);
  bindMobileTool('mobile-theme-btn', toggleTheme);
}

/**
 * 绑定移动端工具栏按钮：点击执行处理函数并附带轻震动反馈。
 * @param {string} id 按钮元素 id
 * @param {Function} handler 处理函数
 */
function bindMobileTool(id, handler) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('click', () => {
      handler();
      triggerHaptic(10);
    });
  }
}
