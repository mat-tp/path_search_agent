export const createSimpleMaze = () => [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0]
];

export const createComplexMaze = () => [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0]
];

export const createSpiralMaze = () => [
  [0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0]
];

export const createRandomMaze = (width: number, height: number, density: number = 0.3): number[][] => {
  const maze: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));
  
  // Ensure start and end positions are clear
  maze[0][0] = 0;
  maze[height - 1][width - 1] = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Skip start and end positions
      if ((x === 0 && y === 0) || (x === width - 1 && y === height - 1)) continue;
      
      if (Math.random() < density) {
        maze[y][x] = 1;
      }
    }
  }

  return maze;
};

export const createRecursiveMaze = (width: number, height: number): number[][] => {
  const maze: number[][] = Array(height).fill(0).map(() => Array(width).fill(1));
  
  const carve = (x: number, y: number) => {
    const directions = [
      [0, -2], // Up
      [2, 0],  // Right
      [0, 2],  // Down
      [-2, 0]  // Left
    ];
    
    // Shuffle directions
    directions.sort(() => Math.random() - 0.5);
    
    maze[y][x] = 0;
    
    for (const [dx, dy] of directions) {
      const nextX = x + dx;
      const nextY = y + dy;
      
      if (nextX > 0 && nextX < width - 1 && nextY > 0 && nextY < height - 1 && maze[nextY][nextX] === 1) {
        maze[y + dy/2][x + dx/2] = 0;
        carve(nextX, nextY);
      }
    }
  };
  
  // Start from a random point
  carve(1, 1);
  
  // Ensure start and end are accessible
  maze[0][0] = 0;
  maze[height - 1][width - 1] = 0;
  
  return maze;
};