// Core utilities, theme, zoom controls, and resource loading

const STORAGE_KEY = 'MREMap';
const THEME_KEY = 'theme';
const MAX_HISTORY = 50;

const canvasSize = 64;
const tileSize = 30;

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

function updateZoomDisplay() {
  updateDynamicText('canvas-scale', Math.round(AppState.canvasScale * 100));
}

function updateThemeDisplay() {
  const isDarkMode = document.body.classList.contains('theme-dark');
  updateDynamicText('theme-display', lang(isDarkMode ? 'theme_dark' : 'theme_light'));
}

function updateStatusBar() {
  const placedCount = Object.keys(AppState.grid).length;
  updateDynamicText('block-count', placedCount);

  const compData = getAllComponents().find(c => c.id === AppState.selectedComponent);
  const compName = compData ? getComponentName(compData) : AppState.selectedComponent;
  updateDynamicText('current-component', compName);

  updateZoomDisplay();
  updateThemeDisplay();
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadThemeFromStorage() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const isDarkMode = savedTheme ? savedTheme === 'dark' : getSystemTheme() === 'dark';
  applyTheme(isDarkMode);
}

function applyTheme(isDarkMode) {
  document.body.classList.toggle('theme-dark', isDarkMode);
  const themeIcon = document.querySelector('#theme-toggle i');
  const mobileThemeIcon = document.querySelector('#mobile-theme-btn i');

  if (themeIcon) themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
  if (mobileThemeIcon) mobileThemeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
  updateThemeDisplay();
}

function toggleTheme() {
  const isDarkMode = !document.body.classList.contains('theme-dark');
  applyTheme(isDarkMode);
  localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
}

function setupZoomControls() {
  bindClick('zoom-out', () => zoomCanvas(-0.1));
  bindClick('zoom-in', () => zoomCanvas(0.1));
  bindClick('zoom-reset', resetCanvasPosition);
  bindClick('zoom-reset-top', resetCanvasPosition);
}

function bindClick(id, handler) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      handler(e);
    });
  }
}

function setupDayNightToggle() {
  bindClick('theme-toggle', toggleTheme);
}

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

function undo() {
  if (AppState.historyIndex <= 0) return;
  AppState.historyIndex--;
  restoreHistoryState();
}

function redo() {
  if (AppState.historyIndex >= AppState.history.length - 1) return;
  AppState.historyIndex++;
  restoreHistoryState();
}

function restoreHistoryState() {
  const state = AppState.history[AppState.historyIndex];
  AppState.grid = structuredClone ? structuredClone(state.grid) : JSON.parse(JSON.stringify(state.grid));
  AppState.selectedComponent = state.selectedComponent;
  selectComponent(AppState.selectedComponent);
  requestRender();
  updateStatusBar();
  updateUndoRedoButtons();
  AppState.hasChanges = true;
}

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('mobile-undo-btn');
  const redoBtn = document.getElementById('mobile-redo-btn');
  if (undoBtn) undoBtn.style.opacity = AppState.historyIndex > 0 ? '1' : '0.5';
  if (redoBtn) redoBtn.style.opacity = AppState.historyIndex < AppState.history.length - 1 ? '1' : '0.5';
}

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

  if (designData.scale) AppState.canvasScale = designData.scale;
  if (designData.offsetX !== undefined) AppState.offsetX = designData.offsetX;
  if (designData.offsetY !== undefined) AppState.offsetY = designData.offsetY;
}

function saveDesignToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeDesignData()));
  } catch (error) {
    console.error('Failed to save design:', error);
  }
}

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

function handleBeforeUnload(e) {
  if (AppState.hasChanges) {
    saveDesignToStorage();
    const confirmationMessage = lang('unsaved_changes_warning');
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
  saveDesignToStorage();
}

function triggerHaptic(duration = 10) {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

// Measure the real rendered height of the mobile toolbar (incl. safe-area padding)
// and expose it as a CSS variable so the canvas always clears the toolbar on any device.
function updateMobileToolbarHeight() {
  const toolbar = document.getElementById('mobile-toolbar');
  if (!toolbar) return;
  const height = toolbar.offsetHeight || 0;
  document.documentElement.style.setProperty('--mobile-toolbar-real-h', `${height}px`);
}

function preloadResources() {
  const allComponents = getAllComponents();
  const progressBar = document.getElementById('progress-bar');
  const loaderText = document.querySelector('.loader-text');
  let loadedCount = 0;
  const totalCount = allComponents.length;

  function updateProgress() {
    loadedCount++;
    const progress = (loadedCount / totalCount) * 100;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (loaderText) loaderText.textContent = `${lang('loader_text')} (${loadedCount}/${totalCount})`;
  }

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
      }, 500);
    }, 300);
  }

  function tryLoadImage(comp, formats, index = 0) {
    if (index >= formats.length) {
      AppState.images[comp.id] = null;
      updateProgress();
      checkAllResourcesLoaded();
      return;
    }

    const img = new Image();
    img.onload = () => {
      AppState.images[comp.id] = img;
      updateProgress();
      checkAllResourcesLoaded();
    };
    img.onerror = () => tryLoadImage(comp, formats, index + 1);
    img.src = `assets/${comp.id}.${formats[index]}`;
  }

  allComponents.forEach(comp => tryLoadImage(comp, ['webp', 'png', 'jpg']));
}
