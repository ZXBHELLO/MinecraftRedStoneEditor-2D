const canvasSize = 64; // 64x64
const tileSize = 30; // 像素
let grid = {}; // 稀疏矩阵
let selectedComponent = 'air';
let hasChanges = false;
let isResourceLoaded = false;

function init() {
  try {
    loadThemeFromStorage();
    setupEventListeners();
    preloadResources();
    updateStatusBar();
    resetCanvasPosition();

    window.addEventListener("unload", handleBeforeUnload);
    loadDesignFromStorage();

  } catch (error) {
    displayError(`init error: ${error.message}`);
  }
}

function loadDesignFromStorage() {
  try {
    const saved = localStorage.getItem("MREMap");
    if (!saved) {
      return;
    }

    const designData = JSON.parse(saved);
    if (!designData.grid || typeof designData.grid !== 'object') {
      throw new Error('无效的设计文件格式');
    }

    grid = {};
    for (const [key, comp] of Object.entries(designData.grid)) {
      const [x, y] = key.split(',').map(Number);
      if (x >= 0 && x < canvasSize && y >= 0 && y < canvasSize && comp !== 'air') {
        grid[key] = comp;
      }
    }

    if (designData.scale) canvasScale = designData.scale;
    if (designData.offsetX) offsetX = designData.offsetX;
    if (designData.offsetY) offsetY = designData.offsetY;

    updateStatusBar();
    updateZoomDisplay();
    closeAllModals();
    hasChanges = false;

  } catch (error) {
    displayError(`loadDesign parse error: ${error.message}`);
  }
}

function handleBeforeUnload() {
  try {
    const designData = {
      name: "",
      description: "",
      grid: grid,
      timestamp: new Date().toISOString(),
      scale: canvasScale,
      offsetX: offsetX,
      offsetY: offsetY
    };

    localStorage.setItem("MREMap", JSON.stringify(designData));
  } catch (error) {
    console.error("保存失败:", error);
    displayError(`loadDesign parse error: ${error.message}`);
  }
}

window.addEventListener("DOMContentLoaded", init);
