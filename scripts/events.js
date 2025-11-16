let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let touchStartTime = null;
let initialTouchDistance = null;
let initialCanvasScale = null;
let touchCenterX = null, touchCenterY = null;
let touchPending = null;
let draggingPlancement = false;

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

function handleWindowResize() {
  try {
    resizeCanvas();
    resetCanvasPosition();
    render(); // 强制重新渲染
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
    if (touches.length === 1) {
      isDragging = true;
      dragStartX = touches[0].clientX - offsetX;
      dragStartY = touches[0].clientY - offsetY;
      canvas.style.cursor = 'grabbing';
    } else if (touches.length === 2) {
      isDragging = false;
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
    if (touches.length === 1) {
      const x = touches[0].clientX - rect.left;
      const y = touches[0].clientY - rect.top;
      const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
      const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
      if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
        touchPending = { gridX, gridY };
      }
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
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 200 && touchPending) {
      const { gridX, gridY } = touchPending;
      setBlock(gridX,gridY,selectedComponent);
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
