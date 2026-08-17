/**
 * 核心工具模块：全局状态、主题、缩放控制、历史记录、本地存储、资源加载。
 *
 * 依赖：
 * - lang.js（lang / updateDynamicText / getCurrentLanguage）
 * - components.js（getAllComponents / getComponentName / selectComponent）
 * - canvas.js（requestRender / updateZoomDisplay 由本模块调用）
 * 加载顺序见 index.html：lang.js → utils.js → components.js → placements.js → canvas.js → events.js → modals.js → main.js
 */

/** localStorage 中设计自动存档的键名 */
const STORAGE_KEY = 'MREMap';
/** localStorage 中主题偏好的键名 */
const THEME_KEY = 'theme';
/** 撤销/重做历史的最大记录数 */
const MAX_HISTORY = 50;

/** 画布逻辑尺寸：64×64 格 */
const canvasSize = 64;
/** 每格边长（像素） */
const tileSize = 30;

/**
 * 全局应用状态（单例）。
 * - grid：键为 "x,y" 字符串、值为组件 id 的稀疏地图（仅存已放置的方块）
 * - history/historyIndex：撤销重做栈
 * - canvasScale/offsetX/offsetY：视图变换（缩放与平移）
 * - canvas/ctx/images：画布元素、2D 上下文、组件图片缓存
 */
const AppState = {
  grid: {},
  selectedComponent: 'air',
  hasChanges: false,
  isResourceLoaded: false,
  history: [],
  historyIndex: -1,
  canvasScale: 1,
  offsetX: 0,
  offsetY: 0,
  canvas: null,
  ctx: null,
  images: {}
};

/**
 * 在右上角错误面板追加一条带时间戳的错误信息（最多保留 10 条）。
 * @param {string} message 错误描述
 */
function displayError(message) {
  const errorDisplay = document.getElementById('error-display');
  const errorMessages = document.getElementById('error-messages');
  if (!errorDisplay || !errorMessages) {
    console.error(message);
    return;
  }
  errorDisplay.style.display = 'block';
  const errorDiv = document.createElement('div');
  errorDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  errorMessages.appendChild(errorDiv);
  while (errorMessages.children.length > 10) {
    errorMessages.removeChild(errorMessages.firstChild);
  }
}

/** 刷新状态栏中的缩放百分比 */
function updateZoomDisplay() {
  updateDynamicText('canvas-scale', Math.round(AppState.canvasScale * 100));
}

/** 刷新状态栏中的主题模式文本（随语言切换） */
function updateThemeDisplay() {
  const isDarkMode = document.body.classList.contains('theme-dark');
  updateDynamicText('theme-display', lang(isDarkMode ? 'theme_dark' : 'theme_light'));
}

/**
 * 整体刷新状态栏：已放置数量、当前选中组件、缩放、主题模式。
 * 在放置/撤销/清空/导入等操作后调用。
 */
function updateStatusBar() {
  const placedCount = Object.keys(AppState.grid).length;
  updateDynamicText('block-count', placedCount);

  const compData = getAllComponents().find(c => c.id === AppState.selectedComponent);
  const compName = compData ? getComponentName(compData) : AppState.selectedComponent;
  updateDynamicText('current-component', compName);

  updateZoomDisplay();
  updateThemeDisplay();
}

/** 返回系统偏好主题（prefers-color-scheme），未手动设置时使用 */
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** 从 localStorage 读取主题偏好并应用；无偏好时跟随系统 */
function loadThemeFromStorage() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const isDarkMode = savedTheme ? savedTheme === 'dark' : getSystemTheme() === 'dark';
  applyTheme(isDarkMode);
}

/**
 * 应用主题：切换 body.theme-dark、更新图标与状态栏文本。
 * @param {boolean} isDarkMode 是否为夜间模式
 */
function applyTheme(isDarkMode) {
  document.body.classList.toggle('theme-dark', isDarkMode);
  const themeIcon = document.querySelector('#theme-toggle i');
  const mobileThemeIcon = document.querySelector('#mobile-theme-btn i');

  if (themeIcon) themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
  if (mobileThemeIcon) mobileThemeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
  updateThemeDisplay();
}

/** 切换主题并持久化到 localStorage */
function toggleTheme() {
  const isDarkMode = !document.body.classList.contains('theme-dark');
  applyTheme(isDarkMode);
  localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
}

/** 绑定桌面端缩放按钮（画布右下角）与移动端重置按钮 */
function setupZoomControls() {
  bindClick('zoom-out', () => zoomCanvas(-0.1));
  bindClick('zoom-in', () => zoomCanvas(0.1));
  bindClick('zoom-reset', resetCanvasPosition);
  bindClick('zoom-reset-top', resetCanvasPosition);
}

/**
 * 通用点击绑定：给指定 id 的元素注册点击事件，并阻止冒泡
 * （避免与画布/面板的全局点击逻辑冲突）。
 * @param {string} id 元素 id
 * @param {Function} handler 点击处理函数
 */
function bindClick(id, handler) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      handler(e);
    });
  }
}

/** 绑定顶栏主题切换按钮 */
function setupDayNightToggle() {
  bindClick('theme-toggle', toggleTheme);
}

/**
 * 保存当前状态到撤销历史。
 * - 若此前执行过撤销，先丢弃被撤销的分支（redo 栈清空）
 * - 超出 MAX_HISTORY 时丢弃最旧记录
 * - historyIndex 始终指向最新记录
 */
function saveHistory() {
  if (AppState.historyIndex < AppState.history.length - 1) {
    AppState.history = AppState.history.slice(0, AppState.historyIndex + 1);
  }

  const state = {
    grid: structuredClone ? structuredClone(AppState.grid) : JSON.parse(JSON.stringify(AppState.grid)),
    selectedComponent: AppState.selectedComponent
  };

  AppState.history.push(state);

  if (AppState.history.length > MAX_HISTORY) {
    AppState.history.shift();
  }
  AppState.historyIndex = AppState.history.length - 1;

  updateUndoRedoButtons();
}

/** 撤销一步：回退到上一条历史记录 */
function undo() {
  if (AppState.historyIndex <= 0) return;
  AppState.historyIndex--;
  restoreHistoryState();
}

/** 重做一步：前进到下一条历史记录 */
function redo() {
  if (AppState.historyIndex >= AppState.history.length - 1) return;
  AppState.historyIndex++;
  restoreHistoryState();
}

/** 用当前 historyIndex 指向的记录恢复画布状态 */
function restoreHistoryState() {
  const state = AppState.history[AppState.historyIndex];
  AppState.grid = structuredClone ? structuredClone(state.grid) : JSON.parse(JSON.stringify(state.grid));
  AppState.selectedComponent = state.selectedComponent;
  selectComponent(AppState.selectedComponent); // 内部已刷新状态栏
  requestRender();
  updateUndoRedoButtons();
  AppState.hasChanges = true;
}

/** 按历史位置更新移动端撤销/重做按钮的可用态（半透明 = 不可用） */
function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('mobile-undo-btn');
  const redoBtn = document.getElementById('mobile-redo-btn');
  if (undoBtn) undoBtn.style.opacity = AppState.historyIndex > 0 ? '1' : '0.5';
  if (redoBtn) redoBtn.style.opacity = AppState.historyIndex < AppState.history.length - 1 ? '1' : '0.5';
}

/** 序列化当前设计（用于 localStorage 自动存档） */
function serializeDesignData() {
  return {
    name: '',
    description: '',
    grid: AppState.grid,
    timestamp: new Date().toISOString(),
    scale: AppState.canvasScale,
    offsetX: AppState.offsetX,
    offsetY: AppState.offsetY
  };
}

/**
 * 解析设计数据并写入 AppState（导入/读取存档共用）。
 * 会过滤越界坐标与空气占位；缩放值限制在 [0.1, 2] 防止异常数据。
 * @param {object} designData 解析后的设计对象
 * @throws {Error} 数据缺少 grid 字段时抛出
 */
function parseDesignData(designData) {
  if (!designData.grid || typeof designData.grid !== 'object') {
    throw new Error(lang('invalid_design_format'));
  }

  AppState.grid = {};
  for (const [key, comp] of Object.entries(designData.grid)) {
    const [x, y] = key.split(',').map(Number);
    if (x >= 0 && x < canvasSize && y >= 0 && y < canvasSize && comp !== 'air') {
      AppState.grid[key] = comp;
    }
  }

  if (designData.scale) {
    AppState.canvasScale = Math.max(0.1, Math.min(2.0, Number(designData.scale) || 1));
  }
  if (designData.offsetX !== undefined) AppState.offsetX = designData.offsetX;
  if (designData.offsetY !== undefined) AppState.offsetY = designData.offsetY;
}

/** 将当前设计自动存档到 localStorage（静默失败，不打断用户） */
function saveDesignToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeDesignData()));
  } catch (error) {
    console.error('Failed to save design:', error);
  }
}

/** 页面启动时从 localStorage 恢复上次的设计 */
function loadDesignFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    parseDesignData(JSON.parse(saved));
    updateStatusBar();
    updateZoomDisplay();
    AppState.hasChanges = false;
  } catch (error) {
    displayError(`${lang('load_error')}: ${error.message}`);
  }
}

/**
 * 页面关闭前处理：有改动时自动存档并提示确认；无改动也存档（保险）。
 * @param {BeforeUnloadEvent} e
 */
function handleBeforeUnload(e) {
  if (AppState.hasChanges) {
    saveDesignToStorage();
    const confirmationMessage = lang('unsaved_changes_warning');
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
  saveDesignToStorage();
}

/**
 * 触发移动端触觉反馈（Android 震动）。
 * @param {number} duration 震动时长（毫秒），默认 10
 */
function triggerHaptic(duration = 10) {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

/**
 * 动态测量移动端底部工具栏的真实渲染高度（含安全区），
 * 写入 CSS 变量 --mobile-toolbar-real-h，供 .main-container 的 padding-bottom
 * 使用。这样无论何种设备（不同字体渲染/安全区），画布都能恰好避让工具栏，
 * 间隙恒等于侧边距。
 */
function updateMobileToolbarHeight() {
  const toolbar = document.getElementById('mobile-toolbar');
  if (!toolbar) return;
  const height = toolbar.offsetHeight || 0;
  document.documentElement.style.setProperty('--mobile-toolbar-real-h', `${height}px`);
}

/**
 * 预加载全部组件图片，显示加载进度条；全部完成后初始化组件面板与画布。
 * 图片格式直接查 COMPONENT_FORMATS 清单（components.js），
 * 避免逐格式尝试产生 404 噪音（如 file:// 下的 ERR_BLOCKED_BY_CLIENT）。
 * 任一组件缺失资源时显示错误页并列出缺失 id。
 */
function preloadResources() {
  const allComponents = getAllComponents();
  const progressBar = document.getElementById('progress-bar');
  const loaderText = document.querySelector('.loader-text');
  let loadedCount = 0;
  const totalCount = allComponents.length;

  /** 更新进度条与加载文案 */
  function updateProgress() {
    loadedCount++;
    const progress = (loadedCount / totalCount) * 100;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (loaderText) loaderText.textContent = `${lang('loader_text')} (${loadedCount}/${totalCount})`;
  }

  /** 全部加载完成后：检查缺失 → 进入应用或展示错误页 */
  function checkAllResourcesLoaded() {
    if (loadedCount !== totalCount) return;

    AppState.isResourceLoaded = true;
    const missingResources = allComponents.filter(c => !AppState.images[c.id]);

    if (missingResources.length > 0) {
      document.getElementById('resource-error').style.display = 'flex';
      document.getElementById('resource-loader').style.display = 'none';
      displayError(`${lang('resource_load_failed')}: ${missingResources.map(c => c.id).join(', ')}`);
      return;
    }

    setTimeout(() => {
      const loader = document.getElementById('resource-loader');
      if (loader) loader.style.opacity = '0';
      setTimeout(() => {
        if (loader) loader.style.display = 'none';
        loadComponents();
        initCanvas();
        // 记录初始画布状态为历史起点，使"撤销"能回到加载完成后的初始状态
        saveHistory();
      }, 500);
    }, 300);
  }

  /**
   * 加载单个组件图片：按 COMPONENT_FORMATS 中的格式直接取用；
   * 清单缺失时回退到 png，仍失败则记为 null。
   * @param {object} comp 组件定义
   */
  function tryLoadImage(comp) {
    // 绝大多数组件为 webp；清单中的 7 个 png 例外优先使用 png
    const format = COMPONENT_FORMATS[comp.id] || 'webp';
    const img = new Image();
    img.onload = () => {
      AppState.images[comp.id] = img;
      updateProgress();
      checkAllResourcesLoaded();
    };
    img.onerror = () => {
      AppState.images[comp.id] = null;
      updateProgress();
      checkAllResourcesLoaded();
    };
    img.src = `assets/${comp.id}.${format}`;
  }

  allComponents.forEach(comp => tryLoadImage(comp));
}
