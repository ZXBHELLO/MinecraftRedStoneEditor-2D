let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let touchStartTime = null;
let initialTouchDistance = null;
let initialCanvasScale = null;
let touchCenterX = null, touchCenterY = null;
let touchPending = null;
let draggingPlancement = false;

// 长按和双击检测
let longPressTimer = null;
let lastTapTime = 0;
let lastTapX = 0, lastTapY = 0;
const LONG_PRESS_DURATION = 500; // 长按持续时间（毫秒）
const DOUBLE_TAP_DISTANCE = 30; // 双击最大距离（像素）
const DOUBLE_TAP_TIME = 300; // 双击最大时间间隔（毫秒）

function setupCanvasEventListeners() {
  try {
    //鼠标
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleMouseWheel);
    //触屏
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleWindowResize);
  } catch (error) {
    displayError(`setupCanvasEventListeners error: ${error.message}`);
  }
}

// 防抖定时器
let resizeTimer = null;

function handleWindowResize() {
  try {
    // 防抖处理，避免频繁触发
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      resizeCanvas();
      // 保持当前缩放比例，重新居中画布
      const container = document.getElementById('canvas-container');
      const canvasWidth = canvasSize * tileSize * canvasScale;
      const canvasHeight = canvasSize * tileSize * canvasScale;
      offsetX = (container.clientWidth - canvasWidth) / 2;
      offsetY = (container.clientHeight - canvasHeight) / 2;
      render();
      updateZoomDisplay();
    }, 100);
  } catch (error) {
    displayError(`handleWindowResize error: ${error.message}`);
  }
}

function handleMouseDown(e) {
  try {
    if (e.button === 1 || e.button === 2) {
      isDragging = true;
      dragStartX = e.clientX - offsetX;
      dragStartY = e.clientY - offsetY;
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }
    if (e.button === 0) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
      const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));

      setBlock(gridX,gridY,selectedComponent);
    }
  } catch (error) {
    displayError(`handleMouseDown error: ${error.message}`);
  }
}

function handleMouseMove(e) {
  try {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
    const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
    if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
      document.querySelector('#cursor-position span').textContent = `坐标: ${gridX},${gridY}`;
    } else {
      document.querySelector('#cursor-position span').textContent = `坐标: 0,0`;
    }
    if (isDragging) {
      offsetX = e.clientX - dragStartX;
      offsetY = e.clientY - dragStartY;
    }
  } catch (error) {
    displayError(`handleMouseMove error: ${error.message}`);
  }
}

function handleMouseUp(e) {
  try {
    isDragging = false;
    canvas.style.cursor = 'default';
  } catch (error) {
    displayError(`handleMouseUp error: ${error.message}`);
  }
}

function handleTouchStart(e) {
  try {
    e.preventDefault();
    const touches = e.touches;
    const rect = canvas.getBoundingClientRect();
    touchStartTime = Date.now();
    
    // 清除之前的长按定时器
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    
    if (touches.length === 1) {
      isDragging = true;
      dragStartX = touches[0].clientX - offsetX;
      dragStartY = touches[0].clientY - offsetY;
      canvas.style.cursor = 'grabbing';
      
      // 设置长按定时器
      const touch = touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
      const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
      
      if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
        touchPending = { gridX, gridY };
        
        // 长按检测
        longPressTimer = setTimeout(function() {
          // 长按触发删除操作
          if (touchPending && grid[`${gridX},${gridY}`]) {
            setBlock(gridX, gridY, 'air');
            // 触觉反馈
            if (navigator.vibrate) {
              navigator.vibrate(20);
            }
            touchPending = null;
          }
        }, LONG_PRESS_DURATION);
      }
    } else if (touches.length === 2) {
      isDragging = false;
      // 双指触摸时清除长按定时器
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      
      const touch1 = touches[0];
      const touch2 = touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      initialTouchDistance = Math.sqrt(dx * dx + dy * dy);
      initialCanvasScale = canvasScale;
      touchCenterX = centerX;
      touchCenterY = centerY;
    }
  } catch (error) {
    displayError(`handleTouchStart error: ${error.message}`);
  }
}

function handleTouchMove(e) {
  try {
    e.preventDefault();
    const touches = e.touches;
    const rect = canvas.getBoundingClientRect();
    
    // 移动时清除长按定时器
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    
    if (touches.length === 1 && isDragging) {
      offsetX = touches[0].clientX - dragStartX;
      offsetY = touches[0].clientY - dragStartY;
      const x = touches[0].clientX - rect.left;
      const y = touches[0].clientY - rect.top;
      const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
      const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
      if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
        document.querySelector('#cursor-position span').textContent = `坐标: ${gridX},${gridY}`;
      } else {
        document.querySelector('#cursor-position span').textContent = `坐标: 0,0`;
      }
    } else if (touches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleChange = currentDistance / initialTouchDistance;
      const oldScale = canvasScale;
      canvasScale = Math.max(0.1, Math.min(2.0, initialCanvasScale * scaleChange));

      // 画布中心作为缩放锚点
      const centerX = rect.left + canvas.width / 2;
      const centerY = rect.top + canvas.height / 2;
      const canvasX = centerX - rect.left;
      const canvasY = centerY - rect.top;

      const gridCenterX = (canvasX - offsetX) / (tileSize * oldScale);
      const gridCenterY = (canvasY - offsetY) / (tileSize * oldScale);

      offsetX = canvasX - gridCenterX * tileSize * canvasScale;
      offsetY = canvasY - gridCenterY * tileSize * canvasScale;

      updateZoomDisplay();
    }
  } catch (error) {
    displayError(`handleTouchMove error: ${error.message}`);
  }
}

function handleTouchEnd(e) {
  try {
    // 清除长按定时器
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    
    const touchDuration = Date.now() - touchStartTime;
    const touches = e.changedTouches;
    
    if (touchDuration < 200 && touchPending && touches.length === 1) {
      const { gridX, gridY } = touchPending;
      const touch = touches[0];
      const currentTime = Date.now();
      
      // 双击检测
      const tapDistance = Math.sqrt(
        Math.pow(touch.clientX - lastTapX, 2) + 
        Math.pow(touch.clientY - lastTapY, 2)
      );
      
      if (currentTime - lastTapTime < DOUBLE_TAP_TIME && tapDistance < DOUBLE_TAP_DISTANCE) {
        // 双击触发：快速放大/缩小
        const rect = canvas.getBoundingClientRect();
        const centerX = touch.clientX;
        const centerY = touch.clientY;
        
        // 如果当前缩放小于1.0，双击放大；否则缩小
        if (canvasScale < 1.0) {
          zoomCanvas(0.5, centerX, centerY);
        } else {
          zoomCanvas(-0.5, centerX, centerY);
        }
        
        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate(15);
        }
        
        // 重置双击计时
        lastTapTime = 0;
      } else {
        // 单击放置方块
        setBlock(gridX, gridY, selectedComponent);
        
        // 记录点击信息用于双击检测
        lastTapTime = currentTime;
        lastTapX = touch.clientX;
        lastTapY = touch.clientY;
      }
    }
    
    isDragging = false;
    canvas.style.cursor = 'default';
    initialTouchDistance = null;
    initialCanvasScale = null;
    touchCenterX = null;
    touchCenterY = null;
    touchPending = null;
    touchStartTime = null;
  } catch (error) {
    displayError(`handleTouchEnd error: ${error.message}`);
  }
}

function handleMouseWheel(e) {
  try {
    e.preventDefault();
    const zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
    zoomCanvas(zoomAmount, e.clientX, e.clientY);
  } catch (error) {
    displayError(`handleMouseWheel error: ${error.message}`);
  }
}

function zoomCanvas(zoomAmount, centerX, centerY) {
  try {
    const oldScale = canvasScale;
    canvasScale = Math.max(0.1, Math.min(2.0, canvasScale + zoomAmount));
    const rect = canvas.getBoundingClientRect();
    if (!centerX) centerX = rect.left + canvas.width / 2;
    if (!centerY) centerY = rect.top + canvas.height / 2;
    const canvasX = centerX - rect.left;
    const canvasY = centerY - rect.top;
    const gridCenterX = (canvasX - offsetX) / (tileSize * oldScale);
    const gridCenterY = (canvasY - offsetY) / (tileSize * oldScale);
    offsetX = canvasX - gridCenterX * tileSize * canvasScale;
    offsetY = canvasY - gridCenterY * tileSize * canvasScale;
    updateZoomDisplay();
  } catch (error) {
    displayError(`zoomCanvas error: ${error.message}`);
  }
}
