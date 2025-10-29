function setBlock(gridX, gridY, selectedComponent){
  if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
    const key = `${gridX},${gridY}`;
    if (grid[key] === selectedComponent || selectedComponent === 'air') {
        delete grid[key];
    } else if (selectedComponent !== 'air') {
        grid[key] = selectedComponent;
    }
    checkConnectedPlacement(gridX, gridY, selectedComponent);
    hasChanges = true;
    updateStatusBar();
  }
}
function checkConnectedPlacement(x, y, block) {
  const pistonPairs = {
    pistonbodyu: { dx: 0, dy: -1, head: "pistonheadu" },
    pistonbodyd: { dx: 0, dy: 1, head: "pistonheadd" },
    pistonbodyl: { dx: -1, dy: 0, head: "pistonheadl" },
    pistonbodyr: { dx: 1, dy: 0, head: "pistonheadr" },
  };

  const pistonHeads = {
    pistonheadu: { dx: 0, dy: 1, body: "pistonbodyu" },
    pistonheadd: { dx: 0, dy: -1, body: "pistonbodyd" },
    pistonheadl: { dx: 1, dy: 0, body: "pistonbodyl" },
    pistonheadr: { dx: -1, dy: 0, body: "pistonbodyr" },
    stickypistonheadu: { dx: 0, dy: 1, body: "pistonbodyu" },
    stickypistonheadd: { dx: 0, dy: -1, body: "pistonbodyd" },
    stickypistonheadl: { dx: 1, dy: 0, body: "pistonbodyl" },
    stickypistonheadr: { dx: -1, dy: 0, body: "pistonbodyr" },
  };
  const doorPairs = {
    iron_door_bottom: { dx: 0, dy: -1, pair: "iron_door_top" },
    iron_door_top: { dx: 0, dy: 1, pair: "iron_door_bottom" },
  };
  const doubleChests = {
    chestdl: { dx: 1, dy: 0, pair: "chestdr" },
    chestdr: { dx: -1, dy: 0, pair: "chestdl" },
  };
  
  const key = `${x},${y}`;
  const current = grid[key];

  if (pistonPairs[block]) {
    const { dx, dy, head } = pistonPairs[block];
    const headKey = `${x + dx},${y + dy}`;
    if (!grid[headKey]) {
      setBlock(x + dx, y + dy, head);
    }
  }

  else if (pistonHeads[block]) {
    const { dx, dy, body } = pistonHeads[block];
    const bodyKey = `${x + dx},${y + dy}`;
    if (!grid[bodyKey]) {
      setBlock(x + dx, y + dy, body);
    }
  }
  else if (doubleChests[block]) {
    const { dx, dy, pair } = doubleChests[block];
    if (!grid[`${x + dx},${y + dy}`]) setBlock(x + dx, y + dy, pair);
  }
  else if (doorPairs[block]) {
    const { dx, dy, pair } = doorPairs[block];
    if (!grid[`${x + dx},${y + dy}`]) setBlock(x + dx, y + dy, pair);
  }

  else if (!current) {
    for (const [body, { dx, dy, head }] of Object.entries(pistonPairs)) {
      if (grid[`${x - dx},${y - dy}`] === body && grid[`${x},${y}`] === undefined) {
        setBlock(x - dx, y - dy, 'air');
      }
    }
    for (const [head, { dx, dy, body }] of Object.entries(pistonHeads)) {
      if (grid[`${x - dx},${y - dy}`] === head && grid[`${x},${y}`] === undefined) {
        setBlock(x - dx, y - dy, 'air');
      }
    }
    for (const [chest, { dx, dy, pair }] of Object.entries(doubleChests)) {
      if (grid[`${x - dx},${y - dy}`] === pair) {
        setBlock(x - dx, y - dy, "air");
      }
    }
    for (const [door, { dx, dy, pair }] of Object.entries(doorPairs)) {
      if (grid[`${x - dx},${y - dy}`] === pair) {
        setBlock(x - dx, y - dy, "air");
      }
    }
  }
}
