/**
 * 弹窗管理模块：通用弹窗开关、保存/导入/清空/帮助/截图等业务弹窗。
 *
 * 弹窗机制：
 * - 所有弹窗复用 .modal 结构；openModal 显示 + 淡入，closeAllModals 淡出后隐藏
 * - 点击遮罩或关闭按钮（.close-modal）关闭；Esc 由 events.js 的 handleKeyDown 处理
 * - 导入弹窗支持点击选择与拖放 JSON 文件
 *
 * 依赖：
 * - utils.js（AppState / saveHistory / updateStatusBar / displayError / bindClick）
 * - lang.js（lang）
 * - canvas.js（openScreenshotPreview / downloadScreenshot / requestRender）
 */

/** 打开指定 id 的弹窗（display:flex 后下一帧加 .show 触发过渡动画） */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('show'));
}

/** 关闭所有弹窗：移除 .show 淡出，300ms 后隐藏 */
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('show');
    setTimeout(() => {
      if (!modal.classList.contains('show')) {
        modal.style.display = 'none';
      }
    }, 300);
  });
}

/** 打开导出设计弹窗 */
function openSaveModal() {
  openModal('save-modal');
}

/** 打开导入设计弹窗，并重置状态提示 */
function openLoadModal() {
  openModal('load-modal');
  const statusElement = document.getElementById('load-status');
  if (statusElement) {
    statusElement.innerHTML = `<i class="fas fa-info-circle"></i> ${lang('load_status')}`;
  }
}

/** 打开清空画布确认弹窗 */
function openClearConfirmModal() {
  openModal('clear-confirm-modal');
}

/** 打开帮助弹窗 */
function openHelpModal() {
  openModal('help-modal');
}

/** 清空画布：重置网格、记录历史、关闭弹窗并重绘 */
function clearCanvas() {
  AppState.grid = {};
  updateStatusBar();
  AppState.hasChanges = true;
  closeAllModals();
  saveHistory();
  requestRender();
}

/** 将当前设计导出为 JSON 文件下载 */
function saveDesign() {
  const designName = document.getElementById('design-name').value.trim() || lang('untitled_design');
  const designDescription = document.getElementById('design-description').value.trim();
  const designData = {
    name: designName,
    description: designDescription,
    grid: AppState.grid,
    timestamp: new Date().toISOString(),
    scale: AppState.canvasScale,
    offsetX: AppState.offsetX,
    offsetY: AppState.offsetY
  };

  // 通过 Blob + 临时 <a> 触发下载
  const jsonData = JSON.stringify(designData);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${designName.replace(/\s+/g, '_')}_${lang('design_file_suffix')}.json`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  closeAllModals();
  document.getElementById('design-name').value = '';
  document.getElementById('design-description').value = '';
  AppState.hasChanges = false;
}

/** 从选中的 JSON 文件导入设计并应用 */
function loadDesign() {
  const fileInput = document.getElementById('load-file');
  const statusElement = document.getElementById('load-status');

  if (!fileInput.files.length) {
    if (statusElement) {
      statusElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${lang('select_file_prompt')}`;
    }
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      parseDesignData(JSON.parse(e.target.result));
      updateStatusBar();
      updateZoomDisplay();
      closeAllModals();
      AppState.hasChanges = false;
      saveHistory(); // 导入结果作为新的历史起点
      requestRender();
      if (statusElement) {
        statusElement.innerHTML = `<i class="fas fa-check-circle"></i> ${lang('load_success')}`;
      }
    } catch (error) {
      if (statusElement) {
        statusElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${lang('error')}: ${error.message}`;
      }
      displayError(`${lang('load_error')}: ${error.message}`);
    }
  };

  reader.onerror = () => {
    if (statusElement) {
      statusElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${lang('file_read_error')}`;
    }
    displayError(lang('file_read_error'));
  };

  reader.readAsText(file);
}

/** 绑定弹窗相关按钮与文件拖放区域的事件 */
function setupModalEventListeners() {
  // 顶栏按钮 → 打开对应弹窗
  bindClick('save-btn', openSaveModal);
  bindClick('load-btn', openLoadModal);
  bindClick('clear-btn', openClearConfirmModal);
  bindClick('help-btn', openHelpModal);
  bindClick('save-screen', openScreenshotPreview);

  // 弹窗内的确认按钮
  bindClick('confirm-save', saveDesign);
  bindClick('confirm-load', loadDesign);
  bindClick('confirm-clear', clearCanvas);
  bindClick('download-screenshot', downloadScreenshot);

  // 所有 .close-modal 按钮关闭全部弹窗
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // 点击弹窗遮罩（空白区域）关闭
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  // 导入弹窗的文件选择与拖放
  const fileDropArea = document.getElementById('file-drop-area');
  const fileInput = document.getElementById('load-file');
  const loadStatus = document.getElementById('load-status');

  if (fileDropArea && fileInput) {
    fileDropArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length && loadStatus) {
        loadStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${lang('selected_file')}: ${fileInput.files[0].name}`;
      }
    });

    fileDropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropArea.classList.add('drag-over');
    });

    fileDropArea.addEventListener('dragleave', () => {
      fileDropArea.classList.remove('drag-over');
    });

    fileDropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropArea.classList.remove('drag-over');
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        if (loadStatus) {
          loadStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${lang('selected_file')}: ${fileInput.files[0].name}`;
        }
      }
    });
  }
}
