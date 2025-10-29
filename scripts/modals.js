function openSaveModal() {
  try {
    document.getElementById('save-modal').classList.add('show');
    document.getElementById('save-modal').style.display = 'flex';
  } catch (error) {
    displayError(`openSaveModal error: ${error.message}`);
  }
}

function openLoadModal() {
  try {
    document.getElementById('load-modal').classList.add('show');
    document.getElementById('load-modal').style.display = 'flex';
    document.getElementById('load-status').innerHTML = '<i class="fas fa-info-circle"></i> 请选择或拖放JSON设计文件';
  } catch (error) {
    displayError(`openLoadModal error: ${error.message}`);
  }
}

function openClearConfirmModal() {
  try {
    document.getElementById('clear-confirm-modal').classList.add('show');
    document.getElementById('clear-confirm-modal').style.display = 'flex';
  } catch (error) {
    displayError(`openClearConfirmModal error: ${error.message}`);
  }
}

function openHelpModal() {
  try {
    document.getElementById('help-modal').classList.add('show');
    document.getElementById('help-modal').style.display = 'flex';
  } catch (error) {
    displayError(`openHelpModal error: ${error.message}`);
  }
}

function closeAllModals() {
  try {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    });
  } catch (error) {
    displayError(`closeAllModals error: ${error.message}`);
  }
}

function clearCanvas() {
  try {
    grid = {};
    updateStatusBar();
    hasChanges = true;
    closeAllModals();
  } catch (error) {
    displayError(`clearCanvas error: ${error.message}`);
  }
}

function saveDesign() {
  try {
    const designName = document.getElementById('design-name').value.trim() || '未命名设计';
    const designDescription = document.getElementById('design-description').value.trim();
    const designData = {
      name: designName,
      description: designDescription,
      grid: grid,
      timestamp: new Date().toISOString(),
      scale: canvasScale,
      offsetX: offsetX,
      offsetY: offsetY
    };
    const jsonData = JSON.stringify(designData);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName.replace(/\s+/g, '_')}_红石设计.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    closeAllModals();
    document.getElementById('design-name').value = '';
    document.getElementById('design-description').value = '';
    hasChanges = false;
  } catch (error) {
    displayError(`saveDesign error: ${error.message}`);
  }
}

function loadDesign() {
  try {
    const fileInput = document.getElementById('load-file');
    const statusElement = document.getElementById('load-status');
    if (!fileInput.files.length) {
      statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> 请选择设计文件';
      return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const designData = JSON.parse(e.target.result);
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
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i> 设计导入成功！';
      } catch (error) {
        statusElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> 错误: ${error.message}`;
        displayError(`loadDesign parse error: ${error.message}`);
      }
    };
    reader.onerror = function() {
      statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> 读取文件时出错';
      displayError('loadDesign file read error');
    };
    reader.readAsText(file);
  } catch (error) {
    displayError(`loadDesign error: ${error.message}`);
  }
}
