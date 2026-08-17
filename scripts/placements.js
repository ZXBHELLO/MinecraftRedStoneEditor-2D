/**
 * 放置逻辑模块：格子写入/删除与"关联方块"处理。
 *
 * 交互规则：
 * - 点击空格放置当前选中组件
 * - 点击已含相同组件的格子，或使用"空气"点击，会删除该格组件（负负得正）
 * - 双箱子（chestdl/chestdr）成对联动：放置一边自动生成另一边，删除一边连带删除另一边
 *
 * 注意（历史决策）：门与活塞的自动粘连功能已按稳定性考虑移除，
 * 目前仅双箱子保留联动。
 *
 * 依赖：
 * - utils.js（AppState / saveHistory / updateStatusBar）
 * - canvas.js（requestRender）
 */

/** 连续放置标记：一次连续操作（如联动放置）只记录一条历史 */
let isPlacing = false;

/**
 * 关联方块配置表。
 * doubleChests：值为配对信息 {dx, dy, pair}，
 * 表示 pair 应出现在当前方块偏移 (dx, dy) 的位置。
 */
const CONNECTED_BLOCKS = {
  doubleChests: {
    chestdl: { dx: 1, dy: 0, pair: 'chestdr' },
    chestdr: { dx: -1, dy: 0, pair: 'chestdl' }
  }
};

/**
 * 放置/删除单个格子上的组件（核心入口）。
 * @param {number} gridX 网格横坐标
 * @param {number} gridY 网格纵坐标
 * @param {string} componentId 组件 id（'air' 表示删除）
 */
function setBlock(gridX, gridY, componentId) {
  if (gridX < 0 || gridX >= canvasSize || gridY < 0 || gridY >= canvasSize) return;

  const key = `${gridX},${gridY}`;
  const oldValue = AppState.grid[key];

  // 负负得正：再次点击相同组件或点击空气 → 删除该格组件
  const shouldRemove = componentId === 'air' || oldValue === componentId;
  if (oldValue === undefined && shouldRemove) return; // 空格上无操作

  // 仅在非连续放置时记录历史（联动方块不产生独立历史记录）
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

/**
 * 处理关联方块：
 * - 放置的是配对组件 → 在偏移位置自动补放配对方块
 * - 删除的是配对组件 → 检查并移除成对关联（避免孤儿方块）
 * @param {number} x 网格横坐标
 * @param {number} y 网格纵坐标
 * @param {string} block 本次操作的组件 id
 */
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

/**
 * 在指定位置补放关联方块（仅当该格为空时）。
 * @param {number} x 网格横坐标
 * @param {number} y 网格纵坐标
 * @param {string} blockId 要补放的组件 id
 */
function placeConnectedBlock(x, y, blockId) {
  if (x < 0 || x >= canvasSize || y < 0 || y >= canvasSize) return;
  const key = `${x},${y}`;
  if (!AppState.grid[key]) {
    AppState.grid[key] = blockId;
  }
}

/**
 * 删除孤儿关联方块：当前格被清空后，检查相邻配对位置，
 * 若存在成对的方块则一并删除（例如删除左箱时连带删除右箱）。
 * @param {number} x 网格横坐标
 * @param {number} y 网格纵坐标
 */
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
