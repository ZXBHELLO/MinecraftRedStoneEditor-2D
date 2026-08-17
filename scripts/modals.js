// Modal management and design save/load operations

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('show'));
}

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

function openSaveModal() {
  openModal('save-modal');
}

function openLoadModal() {
  openModal('load-modal');
  const statusElement = document.getElementById('load-status');
  if (statusElement) {
    statusElement.innerHTML = `<i class="fas fa-info-circle"></i> ${lang('load_status')}`;
  }
}

function openClearConfirmModal() {
  openModal('clear-confirm-modal');
}

function openHelpModal() {
  openModal('help-modal');
}

function clearCanvas() {
  AppState.grid = {};
  updateStatusBar();
  AppState.hasChanges = true;
  closeAllModals();
  saveHistory();
  requestRender();
}

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
      saveHistory();
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

function setupModalEventListeners() {
  bindClick('save-btn', openSaveModal);
  bindClick('load-btn', openLoadModal);
  bindClick('clear-btn', openClearConfirmModal);
  bindClick('help-btn', openHelpModal);
  bindClick('save-screen', openScreenshotPreview);

  bindClick('confirm-save', saveDesign);
  bindClick('confirm-load', loadDesign);
  bindClick('confirm-clear', clearCanvas);
  bindClick('download-screenshot', downloadScreenshot);

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

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
