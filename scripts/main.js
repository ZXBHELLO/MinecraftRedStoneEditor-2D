const canvasSize = 64; // 64x64
const tileSize = 30; // 像素
let grid = {}; // 稀疏矩阵
let selectedComponent = 'air';
let hasChanges = false;
let isResourceLoaded = false;

// 撤销/重做历史记录
let history = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

function init() {
  try {
    loadThemeFromStorage();
    setupEventListeners();
    setupMobileEventListeners();
    preloadResources();
    updateStatusBar();
    resetCanvasPosition();
    window.addEventListener("unload", handleBeforeUnload);
    loadDesignFromStorage();
    // 保存初始状态到历史记录
    saveHistory();
  } catch (error) {
    displayError(`init error: ${error.message}`);
  }
}

// 保存历史记录
function saveHistory() {
  try {
    // 如果当前不在历史末尾，删除后面的历史
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }
    
    // 保存当前状态
    const state = {
      grid: JSON.parse(JSON.stringify(grid)),
      selectedComponent: selectedComponent
    };
    
    history.push(state);
    
    // 限制历史记录数量
    if (history.length > MAX_HISTORY) {
      history.shift();
    } else {
      historyIndex++;
    }
    
    // 确保historyIndex在有效范围内
    if (historyIndex >= history.length) {
      historyIndex = history.length - 1;
    }
    
    updateUndoRedoButtons();
  } catch (error) {
    displayError(`saveHistory error: ${error.message}`);
  }
}

// 撤销
function undo() {
  try {
    if (historyIndex > 0) {
      historyIndex--;
      const state = history[historyIndex];
      grid = JSON.parse(JSON.stringify(state.grid));
      selectedComponent = state.selectedComponent;
      render();
      updateStatusBar();
      updateUndoRedoButtons();
      hasChanges = true;
    }
  } catch (error) {
    displayError(`undo error: ${error.message}`);
  }
}

// 重做
function redo() {
  try {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      const state = history[historyIndex];
      grid = JSON.parse(JSON.stringify(state.grid));
      selectedComponent = state.selectedComponent;
      render();
      updateStatusBar();
      updateUndoRedoButtons();
      hasChanges = true;
    }
  } catch (error) {
    displayError(`redo error: ${error.message}`);
  }
}

// 更新撤销/重做按钮状态
function updateUndoRedoButtons() {
  try {
    const undoBtn = document.getElementById('mobile-undo-btn');
    const redoBtn = document.getElementById('mobile-redo-btn');
    
    if (undoBtn) {
      undoBtn.style.opacity = historyIndex > 0 ? '1' : '0.5';
    }
    if (redoBtn) {
      redoBtn.style.opacity = historyIndex < history.length - 1 ? '1' : '0.5';
    }
  } catch (error) {
    // 静默失败
  }
}

// 设置移动端事件监听器
function setupMobileEventListeners() {
  try {
    // 组件面板切换
    const panelToggle = document.getElementById('mobile-panel-toggle');
    const panelClose = document.getElementById('panel-close-btn');
    const componentsPanel = document.getElementById('components-panel');
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'panel-overlay';
    overlay.id = 'panel-overlay';
    document.body.appendChild(overlay);
    
    if (panelToggle) {
      panelToggle.addEventListener('click', function() {
        componentsPanel.classList.add('open');
        overlay.classList.add('show');
      });
    }
    
    if (panelClose) {
      panelClose.addEventListener('click', function() {
        componentsPanel.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
    
    if (overlay) {
      overlay.addEventListener('click', function() {
        componentsPanel.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
    
    // 移动端工具栏按钮
    const mobileUndoBtn = document.getElementById('mobile-undo-btn');
    const mobileRedoBtn = document.getElementById('mobile-redo-btn');
    const mobileClearBtn = document.getElementById('mobile-clear-btn');
    const mobileSaveBtn = document.getElementById('mobile-save-btn');
    const mobileLoadBtn = document.getElementById('mobile-load-btn');
    const mobileThemeBtn = document.getElementById('mobile-theme-btn');
    
    if (mobileUndoBtn) {
      mobileUndoBtn.addEventListener('click', function() {
        undo();
        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    }
    
    if (mobileRedoBtn) {
      mobileRedoBtn.addEventListener('click', function() {
        redo();
        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    }
    
    if (mobileClearBtn) {
      mobileClearBtn.addEventListener('click', function() {
        openClearConfirmModal();
        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    }
    
    if (mobileSaveBtn) {
      mobileSaveBtn.addEventListener('click', function() {
        openSaveModal();
        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    }
    
    if (mobileLoadBtn) {
      mobileLoadBtn.addEventListener('click', function() {
        openLoadModal();
        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    }
    
    if (mobileThemeBtn) {
      mobileThemeBtn.addEventListener('click', function() {
        toggleTheme();
        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    }
    
    // 组件选择后自动关闭面板（移动端）
    const componentsList = document.getElementById('components-list');
    if (componentsList) {
      componentsList.addEventListener('click', function(e) {
        if (e.target.closest('.component')) {
          // 延迟关闭，让用户看到选择效果
          setTimeout(function() {
            componentsPanel.classList.remove('open');
            overlay.classList.remove('show');
          }, 200);
        }
      });
    }
    
  } catch (error) {
    displayError(`setupMobileEventListeners error: ${error.message}`);
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
