function displayError(message) {
  const errorDisplay = document.getElementById('error-display');
  const errorMessages = document.getElementById('error-messages');
  if (!errorDisplay || !errorMessages) {
    console.error('Error display elements not found');
    return;
  }
  errorDisplay.style.display = 'block';
  const errorDiv = document.createElement('div');
  errorDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  errorMessages.appendChild(errorDiv);
  if (errorMessages.children.length > 10) {
    errorMessages.removeChild(errorMessages.firstChild);
  }
}

function updateZoomDisplay() {
  try {
    document.querySelector('#canvas-scale span').textContent = `${Math.round(canvasScale * 100)}%`;
  } catch (error) {
    displayError(`updateZoomDisplay error: ${error.message}`);
  }
}

function updateStatusBar() {
  try {
    const placedCount = Object.keys(grid).length;
    document.querySelector('#block-count span').textContent = `已放置: ${placedCount} 个组件`;
  } catch (error) {
    displayError(`updateStatusBar error: ${error.message}`);
  }
}

function setupDayNightToggle() {
  try {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    const themeDisplay = document.querySelector('#theme-display span');
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isLight = !document.body.classList.contains('theme-dark');
      if (isLight) {
        document.body.classList.add('theme-dark');
        themeIcon.className = 'fas fa-sun';
        themeDisplay.textContent = '夜间模式';
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('theme-dark');
        themeIcon.className = 'fas fa-moon';
        themeDisplay.textContent = '日间模式';
        localStorage.setItem('theme', 'light');
      }
    });
  } catch (error) {
    displayError(`setupDayNightToggle error: ${error.message}`);
  }
}

function loadThemeFromStorage() {
  try {
    // 检查系统主题偏好
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 检查是否有保存的用户主题设置
    const savedTheme = localStorage.getItem('theme');
    
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeDisplay = document.querySelector('#theme-display span');
    
    let isDarkMode;
    
    // 如果有保存的设置，使用保存的设置，否则跟随系统
    if (savedTheme === 'dark') {
      isDarkMode = true;
    } else if (savedTheme === 'light') {
      isDarkMode = false;
    } else {
      // 跟随系统主题
      isDarkMode = systemPrefersDark;
    }
    
    if (isDarkMode) {
      document.body.classList.add('theme-dark');
      themeIcon.className = 'fas fa-sun';
      themeDisplay.textContent = '夜间模式';
    } else {
      document.body.classList.remove('theme-dark');
      themeIcon.className = 'fas fa-moon';
      themeDisplay.textContent = '日间模式';
    }
  } catch (error) {
    displayError(`loadThemeFromStorage error: ${error.message}`);
  }
}

function setupZoomControls() {
  try {
    document.getElementById('zoom-out').addEventListener('click', (e) => {
      e.stopPropagation();
      zoomCanvas(-0.1);
    });
    document.getElementById('zoom-in').addEventListener('click', (e) => {
      e.stopPropagation();
      zoomCanvas(0.1);
    });
    document.getElementById('zoom-reset').addEventListener('click', (e) => {
      e.stopPropagation();
      resetCanvasPosition();
    });
  } catch (error) {
    displayError(`setupZoomControls error: ${error.message}`);
  }
}

function setupEventListeners() {
  try {
    document.getElementById('clear-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openClearConfirmModal();
    });
    document.getElementById('save-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openSaveModal();
    });
    document.getElementById('load-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openLoadModal();
    });
    document.getElementById('help-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openHelpModal();
    });
    document.getElementById('component-search').addEventListener('input', (e) => {
      e.stopPropagation();
      filterComponents();
    });
    setupZoomControls();
    setupDayNightToggle();
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    });
    document.getElementById('confirm-save').addEventListener('click', saveDesign);
    document.getElementById('confirm-load').addEventListener('click', loadDesign);
    document.getElementById('confirm-clear').addEventListener('click', clearCanvas);
    document.getElementById('reload-btn').addEventListener('click', () => {
      location.reload();
    });
    const fileDropArea = document.getElementById('file-drop-area');
    const fileInput = document.getElementById('load-file');
    fileDropArea.addEventListener('click', () => {
      fileInput.click();
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        document.getElementById('load-status').innerHTML = `<i class="fas fa-check-circle"></i> 已选择文件: ${fileInput.files[0].name}`;
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
        document.getElementById('load-status').innerHTML = `<i class="fas fa-check-circle"></i> 已选择文件: ${fileInput.files[0].name}`;
      }
    });
    document.addEventListener('contextmenu', (e) => {
      if (e.target.id === 'canvas') {
        e.preventDefault();
      }
    });
  } catch (error) {
    displayError(`setupEventListeners error: ${error.message}`);
  }
}

function handleBeforeUnload(e) {
  if (hasChanges) {
    const confirmationMessage = '您有未保存的更改，确定要离开吗？';
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
}

function preloadResources() {
  try {
    const allComponents = getAllComponents();
    const progressBar = document.getElementById('progress-bar');
    const loaderText = document.querySelector('.loader-text');
    let loadedCount = 0;
    const totalCount = allComponents.length;

    function updateProgress() {
      loadedCount++;
      const progress = (loadedCount / totalCount) * 100;
      progressBar.style.width = `${progress}%`;
      loaderText.textContent = `Loading... (${loadedCount}/${totalCount})`;
    }

    function checkAllResourcesLoaded() {
      if (loadedCount === totalCount) {
        isResourceLoaded = true;
        setTimeout(() => {
          document.getElementById('resource-loader').style.opacity = '0';
          setTimeout(() => {
            document.getElementById('resource-loader').style.display = 'none';
            loadComponents();
            initCanvas();
          }, 500);
        }, 300);
        const missingResources = allComponents.filter(c => !images[c.id]);
        if (missingResources.length > 0) {
          document.getElementById('resource-error').style.display = 'flex';
          document.getElementById('resource-loader').style.display = 'none';
          displayError(`Failed to load resources: ${missingResources.map(c => c.id).join(', ')}`);
        }
      }
    }

    function tryLoadImage(comp, formats, index = 0) {
      if (index >= formats.length) {
        console.error(`无法加载资源: ${comp.id} (${formats.join(', ')})`);
        images[comp.id] = null;
        updateProgress();
        checkAllResourcesLoaded();
        return;
      }
      const format = formats[index];
      const img = new Image();
      img.onload = () => {
        images[comp.id] = img;
        updateProgress();
        checkAllResourcesLoaded();
      };
      img.onerror = () => {
        tryLoadImage(comp, formats, index + 1);
      };
      img.src = `assets/${comp.id}.${format}`;
    }

    allComponents.forEach(comp => {
      tryLoadImage(comp, ['webp', 'png', 'jpg']);
    });
  } catch (error) {
    displayError(`preloadResources error: ${error.message}`);
  }
}
