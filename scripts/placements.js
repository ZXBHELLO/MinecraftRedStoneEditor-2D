// Block placement logic with connected-block handling

let isPlacing = false;

const CONNECTED_BLOCKS = {
  doubleChests: {
    chestdl: { dx: 1, dy: 0, pair: 'chestdr' },
    chestdr: { dx: -1, dy: 0, pair: 'chestdl' }
  }
};

function setBlock(gridX, gridY, componentId) {
  if (gridX < 0 || gridX >= canvasSize || gridY < 0 || gridY >= canvasSize) return;

  const key = `${gridX},${gridY}`;
  const oldValue = AppState.grid[key];

  // 负负得正：再次点击相同组件或点击空气 → 删除该格组件
  const shouldRemove = componentId === 'air' || oldValue === componentId;
  if (oldValue === undefined && shouldRemove) return; // 空格上无操作

  const shouldSaveHistory = !isPlacing;
  if (shouldSaveHistory) isPlacing = true;

  if (shouldRemove) {
    delete AppState.grid[key];
    handleConnectedBlocks(gridX, gridY, 'air');
  } else {
    AppState.grid[key] = componentId;
    handleConnectedBlocks(gridX, gridY, componentId);
  }

  AppState.hasChanges = true;
  updateStatusBar();
  requestRender();

  if (shouldSaveHistory) {
    saveHistory();
    isPlacing = false;
  }
}

function handleConnectedBlocks(x, y, block) {
  const key = `${x},${y}`;
  const current = AppState.grid[key];

  const doubleChest = CONNECTED_BLOCKS.doubleChests[block];
  if (doubleChest) {
    placeConnectedBlock(x + doubleChest.dx, y + doubleChest.dy, doubleChest.pair);
    return;
  }

  if (!current) {
    removeOrphanedConnectedBlocks(x, y);
  }
}

function placeConnectedBlock(x, y, blockId) {
  if (x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) return;
  const key = `${x},${y}`;
  if (!AppState.grid[key]) {
    AppState.grid[key] = blockId;
  }
}

function removeOrphanedConnectedBlocks(x, y) {
  const key = `${x},${y}`;

  for (const [chest, { dx, dy, pair }] of Object.entries(CONNECTED_BLOCKS.doubleChests)) {
    // pair 位于当前方块 +dx/+dy 方向（与放置逻辑一致）
    const neighborKey = `${x + dx},${y + dy}`;
    if (AppState.grid[neighborKey] === pair) {
      delete AppState.grid[neighborKey];
    }
  }
}
