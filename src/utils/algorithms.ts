// algorithms.ts
import { Node, Grid, NodeState } from '../types';

// Create a new node
export const createNode = (x: number, y: number): Node => ({
  x,
  y,
  g: Infinity,
  h: 0,
  f: 0,
  parent: null,
  state: NodeState.UNVISITED,
});

// Manhattan heuristic for grids
export const calculateHeuristic = (node: Node, target: Node): number => {
  return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
};

// Get valid neighbors (up, down, left, right) for a given node
export const getNeighbors = (node: Node, grid: Grid): Node[] => {
  const neighbors: Node[] = [];
  const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  for (const [dx, dy] of directions) {
    const newX = node.x + dx;
    const newY = node.y + dy;
    if (isValid(newX, newY, grid)) {
      const neighbor = createNode(newX, newY);
      neighbor.g = Infinity;
      neighbors.push(neighbor);
    }
  }
  return neighbors;
};

// Check if a position is valid and not a wall (assuming walls are represented by nonzero values)
export const isValid = (x: number, y: number, grid: Grid): boolean => {
  return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length && grid[y][x] === 0;
};

// Reconstruct path from target node back to start using the parent pointers
export const reconstructPath = (node: Node): Node[] => {
  const path: Node[] = [];
  let current: Node | null = node;
  while (current) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
};

//
// A* Search
//
export const aStarSearch = async (
  grid: Grid,
  start: [number, number],
  target: [number, number],
  updateVisualization: (
    current: Node,
    openSet: Set<Node>,
    closedSet: Set<Node>,
    currentStep?: number
  ) => void
): Promise<Node[]> => {
  const startTime = performance.now();
  let steps = 0;

  const startNode = createNode(start[0], start[1]);
  const targetNode = createNode(target[0], target[1]);
  startNode.g = 0;
  startNode.h = calculateHeuristic(startNode, targetNode);
  startNode.f = startNode.g + startNode.h;
  startNode.depth = 0;

  const openSetLocal = new Set<Node>([startNode]);
  const closedSetLocal = new Set<Node>();

  while (openSetLocal.size > 0) {
    steps++;
    const current = Array.from(openSetLocal).reduce((min, node) =>
      node.f < min.f ? node : min
    );

    updateVisualization(current, openSetLocal, closedSetLocal, steps);

    if (current.x === targetNode.x && current.y === targetNode.y) {
      const finalPath = reconstructPath(current);
      const endTime = performance.now();
      // Final stats can be computed in your App (e.g. executionTime, pathCost, pathLength, steps)
      return finalPath;
    }

    openSetLocal.delete(current);
    closedSetLocal.add(current);

    for (const neighbor of getNeighbors(current, grid)) {
      // Skip if neighbor already in closed set
      if (Array.from(closedSetLocal).some(n => n.x === neighbor.x && n.y === neighbor.y)) {
        continue;
      }
      const tentativeG = current.g + 1;
      if (tentativeG < neighbor.g) {
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = calculateHeuristic(neighbor, targetNode);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.depth = (current.depth || 0) + 1;
        if (!Array.from(openSetLocal).some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSetLocal.add(neighbor);
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return [];
};

//
// Breadth‑First Search (BFS)
//
export const bfs = async (
  grid: Grid,
  start: [number, number],
  target: [number, number],
  updateVisualization: (
    current: Node,
    openSet: Set<Node>,
    closedSet: Set<Node>,
    currentStep?: number
  ) => void
): Promise<Node[]> => {
  const startTime = performance.now();
  let steps = 0;

  const queue: Node[] = [];
  const visited = new Set<string>();
  const startNode = createNode(start[0], start[1]);
  startNode.g = 0;
  startNode.depth = 0;
  queue.push(startNode);
  visited.add(`${start[0]},${start[1]}`);

  while (queue.length > 0) {
    steps++;
    const current = queue.shift()!;

    // Prepare copies for visualization
    const openSet = new Set(queue.map(n => ({ ...n })));
    const closedSet = new Set(
      Array.from(visited).map(coord => {
        const [x, y] = coord.split(',').map(Number);
        return createNode(x, y);
      })
    );
    updateVisualization(current, openSet, closedSet, steps);

    if (current.x === target[0] && current.y === target[1]) {
      const finalPath = reconstructPath(current);
      const endTime = performance.now();
      return finalPath;
    }

    for (const neighbor of getNeighbors(current, grid)) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        neighbor.parent = current;
        neighbor.depth = (current.depth || 0) + 1;
        neighbor.g = current.g + 1;
        queue.push(neighbor);
        visited.add(key);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return [];
};

//
// Depth‑First Search (DFS)
//
export const dfs = async (
  grid: Grid,
  start: [number, number],
  target: [number, number],
  updateVisualization: (
    current: Node,
    openSet: Set<Node>,
    closedSet: Set<Node>,
    currentStep?: number
  ) => void
): Promise<Node[]> => {
  const startTime = performance.now();
  let steps = 0;

  const stack: Node[] = [];
  const visited = new Set<string>();
  const startNode = createNode(start[0], start[1]);
  startNode.g = 0;
  startNode.depth = 0;
  stack.push(startNode);

  while (stack.length > 0) {
    steps++;
    const current = stack.pop()!;
    const key = `${current.x},${current.y}`;
    if (!visited.has(key)) {
      visited.add(key);

      if (current.x === target[0] && current.y === target[1]) {
        const finalPath = reconstructPath(current);
        const endTime = performance.now();
        return finalPath;
      }

      const openSet = new Set(stack.map(n => ({ ...n })));
      const closedSet = new Set(
        Array.from(visited).map(coord => {
          const [x, y] = coord.split(',').map(Number);
          return createNode(x, y);
        })
      );
      updateVisualization(current, openSet, closedSet, steps);
      await new Promise(resolve => setTimeout(resolve, 100));

      for (const neighbor of getNeighbors(current, grid)) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(neighborKey)) {
          neighbor.parent = current;
          neighbor.depth = (current.depth || 0) + 1;
          neighbor.g = current.g + 1;
          stack.push(neighbor);
        }
      }
    }
  }
  return [];
};

//
// Dijkstra’s Algorithm
//
export const dijkstra = async (
  grid: Grid,
  start: [number, number],
  target: [number, number],
  updateVisualization: (
    current: Node,
    openSet: Set<Node>,
    closedSet: Set<Node>,
    currentStep?: number
  ) => void
): Promise<Node[]> => {
  const startTime = performance.now();
  let steps = 0;

  const distances = new Map<string, number>();
  const pq: Node[] = [];
  const visited = new Set<string>();
  const startNode = createNode(start[0], start[1]);
  startNode.g = 0;
  startNode.depth = 0;
  pq.push(startNode);
  distances.set(`${start[0]},${start[1]}`, 0);

  while (pq.length > 0) {
    steps++;
    pq.sort((a, b) => a.g - b.g);
    const current = pq.shift()!;
    const key = `${current.x},${current.y}`;

    if (current.x === target[0] && current.y === target[1]) {
      const finalPath = reconstructPath(current);
      const endTime = performance.now();
      return finalPath;
    }

    if (visited.has(key)) continue;
    visited.add(key);

    const openSet = new Set(pq.map(n => ({ ...n })));
    const closedSet = new Set(
      Array.from(visited).map(coord => {
        const [x, y] = coord.split(',').map(Number);
        return createNode(x, y);
      })
    );
    updateVisualization(current, openSet, closedSet, steps);
    await new Promise(resolve => setTimeout(resolve, 100));

    for (const neighbor of getNeighbors(current, grid)) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      const newDist = current.g + 1;
      if (!distances.has(neighborKey) || newDist < distances.get(neighborKey)!) {
        distances.set(neighborKey, newDist);
        neighbor.g = newDist;
        neighbor.depth = (current.depth || 0) + 1;
        neighbor.parent = current;
        pq.push(neighbor);
      }
    }
  }
  return [];
};

//
// Greedy Best‑First Search
//
export const greedyBestFirst = async (
  grid: Grid,
  start: [number, number],
  target: [number, number],
  updateVisualization: (
    current: Node,
    openSet: Set<Node>,
    closedSet: Set<Node>,
    currentStep?: number
  ) => void
): Promise<Node[]> => {
  const startTime = performance.now();
  let steps = 0;

  const openSet = new Set<Node>();
  const closedSet = new Set<string>();
  const startNode = createNode(start[0], start[1]);
  const targetNode = createNode(target[0], target[1]);
  startNode.h = calculateHeuristic(startNode, targetNode);
  startNode.depth = 0;
  openSet.add(startNode);

  while (openSet.size > 0) {
    steps++;
    const current = Array.from(openSet).reduce((min, node) =>
      node.h < min.h ? node : min
    );

    if (current.x === target[0] && current.y === target[1]) {
      const finalPath = reconstructPath(current);
      const endTime = performance.now();
      return finalPath;
    }

    openSet.delete(current);
    closedSet.add(`${current.x},${current.y}`);

    // Prepare copies for visualization.
    const openSetCopy = new Set(Array.from(openSet));
    const closedSetCopy = new Set(
      Array.from(closedSet).map(coord => {
        const [x, y] = coord.split(',').map(Number);
        return createNode(x, y);
      })
    );
    updateVisualization(current, openSetCopy, closedSetCopy, steps);
    await new Promise(resolve => setTimeout(resolve, 100));

    for (const neighbor of getNeighbors(current, grid)) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!closedSet.has(key)) {
        neighbor.parent = current;
        neighbor.h = calculateHeuristic(neighbor, targetNode);
        neighbor.depth = (current.depth || 0) + 1;
        openSet.add(neighbor);
      }
    }
  }
  return [];
};


// import { Node, Grid, NodeState } from '../types';

// export const createNode = (x: number, y: number): Node => ({
//   x,
//   y,
//   g: Infinity,
//   h: 0,
//   f: 0,
//   parent: null,
//   state: NodeState.UNVISITED
// });

// export const calculateHeuristic = (node: Node, target: Node): number => {
//   return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
// };

// export const getNeighbors = (node: Node, grid: Grid): Node[] => {
//   const neighbors: Node[] = [];
//   const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

//   for (const [dx, dy] of directions) {
//     const newX = node.x + dx;
//     const newY = node.y + dy;

//     if (isValid(newX, newY, grid)) {
//       const neighbor = createNode(newX, newY);
//       neighbor.g = Infinity;
//       neighbors.push(neighbor);
//     }
//   }

//   return neighbors;
// };

// export const isValid = (x: number, y: number, grid: Grid): boolean => {
//   return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length && grid[y][x] === 0;
// };

// export const reconstructPath = (node: Node): Node[] => {
//   const path: Node[] = [];
//   let current: Node | null = node;

//   while (current) {
//     path.unshift(current);
//     current = current.parent;
//   }

//   return path;
// };

// // A* Search
// export const aStarSearch = async (
//   grid: Grid,
//   start: [number, number],
//   target: [number, number],
//   updateVisualization: (
//     current: Node,
//     openSet: Set<Node>,
//     closedSet: Set<Node>,
//     currentStep?: number
//   ) => void
// ): Promise<Node[]> => {
//   // const startTime = performance.now();
//   let steps = 0;

//   const startNode = createNode(start[0], start[1]);
//   const targetNode = createNode(target[0], target[1]);
  
//   startNode.g = 0;
//   startNode.h = calculateHeuristic(startNode, targetNode);
//   startNode.f = startNode.g + startNode.h;
//   startNode.depth = 0;

//   const openSetLocal = new Set<Node>([startNode]);
//   const closedSetLocal = new Set<Node>();

//   while (openSetLocal.size > 0) {
//     steps++;
//     const current = Array.from(openSetLocal).reduce((min, node) =>
//       node.f < min.f ? node : min
//     );
    
//     updateVisualization(current, openSetLocal, closedSetLocal, steps);
    
//     if (current.x === targetNode.x && current.y === targetNode.y) {
//       const finalPath = reconstructPath(current);
//       // const endTime = performance.now();
      
//       // Update final stats here (pathCost = current.g, pathLength = finalPath.length - 1)
//       // You may choose to call updateVisualization one last time or let your App update the state.
//       return finalPath;
//     }

//     openSetLocal.delete(current);
//     closedSetLocal.add(current);

//     for (const neighbor of getNeighbors(current, grid)) {
//       if (Array.from(closedSetLocal).some(n => n.x === neighbor.x && n.y === neighbor.y)) {
//         continue;
//       }
//       const tentativeG = current.g + 1;
//       if (tentativeG < neighbor.g) {
//         neighbor.parent = current;
//         neighbor.g = tentativeG;
//         neighbor.h = calculateHeuristic(neighbor, targetNode);
//         neighbor.f = neighbor.g + neighbor.h;
//         neighbor.depth = (current.depth || 0) + 1;
//         if (!Array.from(openSetLocal).some(n => n.x === neighbor.x && n.y === neighbor.y)) {
//           openSetLocal.add(neighbor);
//         }
//       }
//     }
//     await new Promise(resolve => setTimeout(resolve, 100));
//   }
//   return [];
// };

// // export const bfs = async (
// //   grid: Grid,
// //   start: [number, number],
// //   target: [number, number],
// //   updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
// // ): Promise<Node[]> => {
// //   const queue: Node[] = [];
// //   const visited = new Set<string>();
// //   const startNode = createNode(start[0], start[1]);
  
// //   queue.push(startNode);
// //   visited.add(`${start[0]},${start[1]}`);
  
// //   while (queue.length > 0) {
// //     const current = queue.shift()!;
    
// //     if (current.x === target[0] && current.y === target[1]) {
// //       return reconstructPath(current);
// //     }
    
// //     const openSet = new Set(queue.map(n => ({ ...n })));
// //     const closedSet = new Set(Array.from(visited).map(coord => {
// //       const [x, y] = coord.split(',').map(Number);
// //       return createNode(x, y);
// //     }));
    
// //     updateVisualization(current, openSet, closedSet);
// //     await new Promise(resolve => setTimeout(resolve, 100));
    
// //     for (const neighbor of getNeighbors(current, grid)) {
// //       const key = `${neighbor.x},${neighbor.y}`;
// //       if (!visited.has(key)) {
// //         neighbor.parent = current;
// //         queue.push(neighbor);
// //         visited.add(key);
// //       }
// //     }
// //   }
  
// //   return [];
// // };
// export const bfs = async (
//   grid: Grid,
//   start: [number, number],
//   target: [number, number],
//   updateVisualization: (
//     current: Node,
//     openSet: Set<Node>,
//     closedSet: Set<Node>,
//     currentStep?: number
//   ) => void
// ): Promise<Node[]> => {
//   let steps = 0;
//   // const startTime = performance.now();
  
//   const queue: Node[] = [];
//   const visited = new Set<string>();
//   const startNode = createNode(start[0], start[1]);
  
//   // For BFS on an unweighted grid, we can set the initial cost (g) to 0.
//   startNode.g = 0;
//   startNode.depth = 0;
  
//   queue.push(startNode);
//   visited.add(`${start[0]},${start[1]}`);
  
//   while (queue.length > 0) {
//     steps++;
//     const current = queue.shift()!;
    
//     // Create openSet and closedSet copies for visualization.
//     const openSet = new Set(queue.map(n => ({ ...n })));
//     const closedSet = new Set(
//       Array.from(visited).map(coord => {
//         const [x, y] = coord.split(',').map(Number);
//         return createNode(x, y);
//       })
//     );
    
//     updateVisualization(current, openSet, closedSet, steps);
    
//     if (current.x === target[0] && current.y === target[1]) {
//       return reconstructPath(current);
//     }
    
//     for (const neighbor of getNeighbors(current, grid)) {
//       const key = `${neighbor.x},${neighbor.y}`;
//       if (!visited.has(key)) {
//         neighbor.parent = current;
//         // For BFS, assign depth and cost based on the parent's values.
//         neighbor.depth = (current.depth || 0) + 1;
//         neighbor.g = current.g + 1;
//         queue.push(neighbor);
//         visited.add(key);
//       }
//     }
//     await new Promise(resolve => setTimeout(resolve, 100));
//   }
  
//   return [];
// };


// // export const dfs = async (
// //   grid: Grid,
// //   start: [number, number],
// //   target: [number, number],
// //   updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
// // ): Promise<Node[]> => {
// //   const stack: Node[] = [];
// //   const visited = new Set<string>();
// //   const startNode = createNode(start[0], start[1]);
  
// //   stack.push(startNode);
  
// //   while (stack.length > 0) {
// //     const current = stack.pop()!;
// //     const key = `${current.x},${current.y}`;
    
// //     if (!visited.has(key)) {
// //       visited.add(key);
      
// //       if (current.x === target[0] && current.y === target[1]) {
// //         return reconstructPath(current);
// //       }
      
// //       const openSet = new Set(stack.map(n => ({ ...n })));
// //       const closedSet = new Set(Array.from(visited).map(coord => {
// //         const [x, y] = coord.split(',').map(Number);
// //         return createNode(x, y);
// //       }));
      
// //       updateVisualization(current, openSet, closedSet);
// //       await new Promise(resolve => setTimeout(resolve, 100));
      
// //       for (const neighbor of getNeighbors(current, grid)) {
// //         const neighborKey = `${neighbor.x},${neighbor.y}`;
// //         if (!visited.has(neighborKey)) {
// //           neighbor.parent = current;
// //           stack.push(neighbor);
// //         }
// //       }
// //     }
// //   }
  
// //   return [];
// // };
// export const dfs = async (
//   grid: Grid,
//   start: [number, number],
//   target: [number, number],
//   updateVisualization: (
//     current: Node,
//     openSet: Set<Node>,
//     closedSet: Set<Node>,
//     currentStep?: number
//   ) => void
// ): Promise<Node[]> => {
//   let steps = 0;
//   // const startTime = performance.now();
  
//   const stack: Node[] = [];
//   const visited = new Set<string>();
//   const startNode = createNode(start[0], start[1]);
//   startNode.depth = 0;
//   startNode.g = 0;
  
//   stack.push(startNode);
  
//   while (stack.length > 0) {
//     steps++;
//     const current = stack.pop()!;
//     const key = `${current.x},${current.y}`;
    
//     if (!visited.has(key)) {
//       visited.add(key);
      
//       if (current.x === target[0] && current.y === target[1]) {
//         return reconstructPath(current);
//       }
      
//       const openSet = new Set(stack.map(n => ({ ...n })));
//       const closedSet = new Set(
//         Array.from(visited).map(coord => {
//           const [x, y] = coord.split(',').map(Number);
//           return createNode(x, y);
//         })
//       );
      
//       updateVisualization(current, openSet, closedSet, steps);
//       await new Promise(resolve => setTimeout(resolve, 100));
      
//       for (const neighbor of getNeighbors(current, grid)) {
//         const neighborKey = `${neighbor.x},${neighbor.y}`;
//         if (!visited.has(neighborKey)) {
//           neighbor.parent = current;
//           neighbor.depth = (current.depth || 0) + 1;
//           neighbor.g = current.g + 1;
//           stack.push(neighbor);
//         }
//       }
//     }
//   }
  
//   return [];
// };


// // export const dijkstra = async (
// //   grid: Grid,
// //   start: [number, number],
// //   target: [number, number],
// //   updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
// // ): Promise<Node[]> => {
// //   const distances = new Map<string, number>();
// //   const pq: Node[] = [];
// //   const visited = new Set<string>();
// //   const startNode = createNode(start[0], start[1]);
  
// //   startNode.g = 0;
// //   pq.push(startNode);
// //   distances.set(`${start[0]},${start[1]}`, 0);
  
// //   while (pq.length > 0) {
// //     pq.sort((a, b) => a.g - b.g);
// //     const current = pq.shift()!;
// //     const key = `${current.x},${current.y}`;
    
// //     if (current.x === target[0] && current.y === target[1]) {
// //       return reconstructPath(current);
// //     }
    
// //     if (visited.has(key)) continue;
// //     visited.add(key);
    
// //     const openSet = new Set(pq.map(n => ({ ...n })));
// //     const closedSet = new Set(Array.from(visited).map(coord => {
// //       const [x, y] = coord.split(',').map(Number);
// //       return createNode(x, y);
// //     }));
    
// //     updateVisualization(current, openSet, closedSet);
// //     await new Promise(resolve => setTimeout(resolve, 100));
    
// //     for (const neighbor of getNeighbors(current, grid)) {
// //       const neighborKey = `${neighbor.x},${neighbor.y}`;
// //       const newDist = current.g + 1;
      
// //       if (!distances.has(neighborKey) || newDist < distances.get(neighborKey)!) {
// //         distances.set(neighborKey, newDist);
// //         neighbor.g = newDist;
// //         neighbor.parent = current;
// //         pq.push(neighbor);
// //       }
// //     }
// //   }
  
// //   return [];
// // };
// export const dijkstra = async (
//   grid: Grid,
//   start: [number, number],
//   target: [number, number],
//   updateVisualization: (
//     current: Node,
//     openSet: Set<Node>,
//     closedSet: Set<Node>,
//     currentStep?: number
//   ) => void
// ): Promise<Node[]> => {
//   let steps = 0;
//   // const startTime = performance.now();
  
//   const distances = new Map<string, number>();
//   const pq: Node[] = [];
//   const visited = new Set<string>();
//   const startNode = createNode(start[0], start[1]);
  
//   startNode.g = 0;
//   startNode.depth = 0;
//   pq.push(startNode);
//   distances.set(`${start[0]},${start[1]}`, 0);
  
//   while (pq.length > 0) {
//     steps++;
//     pq.sort((a, b) => a.g - b.g);
//     const current = pq.shift()!;
//     const key = `${current.x},${current.y}`;
    
//     if (current.x === target[0] && current.y === target[1]) {
//       return reconstructPath(current);
//     }
    
//     if (visited.has(key)) continue;
//     visited.add(key);
    
//     const openSet = new Set(pq.map(n => ({ ...n })));
//     const closedSet = new Set(
//       Array.from(visited).map(coord => {
//         const [x, y] = coord.split(',').map(Number);
//         return createNode(x, y);
//       })
//     );
    
//     updateVisualization(current, openSet, closedSet, steps);
//     await new Promise(resolve => setTimeout(resolve, 100));
    
//     for (const neighbor of getNeighbors(current, grid)) {
//       const neighborKey = `${neighbor.x},${neighbor.y}`;
//       const newDist = current.g + 1;
      
//       if (!distances.has(neighborKey) || newDist < distances.get(neighborKey)!) {
//         distances.set(neighborKey, newDist);
//         neighbor.g = newDist;
//         neighbor.depth = (current.depth || 0) + 1;
//         neighbor.parent = current;
//         pq.push(neighbor);
//       }
//     }
//   }
  
//   return [];
// };


// // export const greedyBestFirst = async (
// //   grid: Grid,
// //   start: [number, number],
// //   target: [number, number],
// //   updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
// // ): Promise<Node[]> => {
// //   const openSet = new Set<Node>();
// //   const closedSet = new Set<string>();
// //   const startNode = createNode(start[0], start[1]);
// //   const targetNode = createNode(target[0], target[1]);
  
// //   startNode.h = calculateHeuristic(startNode, targetNode);
// //   openSet.add(startNode);
  
// //   while (openSet.size > 0) {
// //     const current = Array.from(openSet).reduce((min, node) => 
// //       node.h < min.h ? node : min
// //     );
    
// //     if (current.x === target[0] && current.y === target[1]) {
// //       return reconstructPath(current);
// //     }
    
// //     openSet.delete(current);
// //     closedSet.add(`${current.x},${current.y}`);
    
// //     updateVisualization(current, openSet, new Set(Array.from(closedSet).map(coord => {
// //       const [x, y] = coord.split(',').map(Number);
// //       return createNode(x, y);
// //     })));
// //     await new Promise(resolve => setTimeout(resolve, 100));
    
// //     for (const neighbor of getNeighbors(current, grid)) {
// //       const key = `${neighbor.x},${neighbor.y}`;
// //       if (!closedSet.has(key)) {
// //         neighbor.parent = current;
// //         neighbor.h = calculateHeuristic(neighbor, targetNode);
// //         openSet.add(neighbor);
// //       }
// //     }
// //   }
  
// //   return [];
// // };
// export const greedyBestFirst = async (
//   grid: Grid,
//   start: [number, number],
//   target: [number, number],
//   updateVisualization: (
//     current: Node,
//     openSet: Set<Node>,
//     closedSet: Set<Node>,
//     currentStep?: number
//   ) => void
// ): Promise<Node[]> => {
//   let steps = 0;
//   // const startTime = performance.now();
  
//   const openSet = new Set<Node>();
//   const closedSet = new Set<string>();
//   const startNode = createNode(start[0], start[1]);
//   const targetNode = createNode(target[0], target[1]);
  
//   startNode.h = calculateHeuristic(startNode, targetNode);
//   startNode.depth = 0;
//   openSet.add(startNode);
  
//   while (openSet.size > 0) {
//     steps++;
//     const current = Array.from(openSet).reduce((min, node) =>
//       node.h < min.h ? node : min
//     );
    
//     if (current.x === target[0] && current.y === target[1]) {
//       return reconstructPath(current);
//     }
    
//     openSet.delete(current);
//     closedSet.add(`${current.x},${current.y}`);
    
//     const openSetCopy = new Set(Array.from(openSet));
//     const closedSetCopy = new Set(
//       Array.from(closedSet).map(coord => {
//         const [x, y] = coord.split(',').map(Number);
//         return createNode(x, y);
//       })
//     );
    
//     updateVisualization(current, openSetCopy, closedSetCopy, steps);
//     await new Promise(resolve => setTimeout(resolve, 100));
    
//     for (const neighbor of getNeighbors(current, grid)) {
//       const key = `${neighbor.x},${neighbor.y}`;
//       if (!closedSet.has(key)) {
//         neighbor.parent = current;
//         neighbor.h = calculateHeuristic(neighbor, targetNode);
//         neighbor.depth = (current.depth || 0) + 1;
//         openSet.add(neighbor);
//       }
//     }
//   }
  
//   return [];
// };


// // import { Node, Grid, NodeState } from '../types';

// // export const createNode = (x: number, y: number): Node => ({
// //   x,
// //   y,
// //   g: Infinity,
// //   h: 0,
// //   f: 0,
// //   parent: null,
// //   state: NodeState.UNVISITED
// // });

// // export const calculateHeuristic = (node: Node, target: Node): number => {
// //   return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
// // };

// // export const getNeighbors = (node: Node, grid: Node[][]): Node[] => {
// //   const neighbors: Node[] = [];
// //   const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

// //   for (const [dx, dy] of directions) {
// //     const newX = node.x + dx;
// //     const newY = node.y + dy;

// //     if (isValid(newX, newY, grid)) {
// //       neighbors.push(grid[newY][newX]);
// //     }
// //   }

// //   return neighbors;
// // };

// // export const isValid = (x: number, y: number, grid: Node[][]): boolean => {
// //   return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length && 
// //          grid[y][x].state !== NodeState.WALL;
// // };

// // export const reconstructPath = (node: Node): Node[] => {
// //   const path: Node[] = [];
// //   let current: Node | null = node;

// //   while (current) {
// //     path.unshift(current);
// //     current = current.parent;
// //   }

// //   return path;
// // };

// // // A* Search Algorithm
// // export const astar = async (
// //   grid: Node[][],
// //   start: [number, number],
// //   target: [number, number],
// //   updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
// // ): Promise<Node[]> => {
// //   const openSet = new Set<Node>();
// //   const closedSet = new Set<Node>();
// //   const startNode = grid[start[1]][start[0]];
// //   const targetNode = grid[target[1]][target[0]];

// //   startNode.g = 0;
// //   startNode.h = calculateHeuristic(startNode, targetNode);
// //   startNode.f = startNode.g + startNode.h;
// //   openSet.add(startNode);

// //   while (openSet.size > 0) {
// //     const current = Array.from(openSet).reduce((min, node) => 
// //       node.f < min.f ? node : min
// //     );

// //     if (current.x === target[0] && current.y === target[1]) {
// //       return reconstructPath(current);
// //     }

// //     openSet.delete(current);
// //     closedSet.add(current);

// //     updateVisualization(current, openSet, closedSet);
// //     await new Promise(resolve => setTimeout(resolve, 100));

// //     for (const neighbor of getNeighbors(current, grid)) {
// //       if (closedSet.has(neighbor)) continue;

// //       const tentativeG = current.g + 1;

// //       if (!openSet.has(neighbor)) {
// //         openSet.add(neighbor);
// //       } else if (tentativeG >= neighbor.g) {
// //         continue;
// //       }

// //       neighbor.parent = current;
// //       neighbor.g = tentativeG;
// //       neighbor.h = calculateHeuristic(neighbor, targetNode);
// //       neighbor.f = neighbor.g + neighbor.h;
// //     }
// //   }

// //   return [];
// // };

// // // Breadth-First Search
// // export const bfs = async (
// //   grid: Node[][],
// //   start: [number, number],
// //   target: [number, number],
// //   updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
// // ): Promise<Node[]> => {
// //   const queue: Node[] = [];
// //   const visited = new Set<Node>();
// //   const startNode = grid[start[1]][start[0]];
  
// //   queue.push(startNode);
// //   visited.add(startNode);
  
// //   while (queue.length > 0) {
// //     const current = queue.shift()!;
    
// //     if (current.x === target[0] && current.y === target[1]) {
// //       return reconstructPath(current);
// //     }
    
// //     updateVisualization(current, new Set(queue), visited);
// //     await new Promise(resolve => setTimeout(resolve, 100));
    
// //     for (const neighbor of getNeighbors(current, grid)) {
// //       if (!visited.has(neighbor)) {
// //         neighbor.parent = current;
// //         queue.push(neighbor);
// //         visited.add(neighbor);
// //       }
// //     }
// //   }
  
// //   return [];
// // };

// // // Depth-First Search
// // export const dfs = async (
// //   grid: Node[][],
// //   start: [number, number],
// //   target: [number, number],
// //   updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
// // ): Promise<Node[]> => {
// //   const stack: Node[] = [];
// //   const visited = new Set<Node>();
// //   const startNode = grid[start[1]][start[0]];
  
// //   stack.push(startNode);
  
// //   while (stack.length > 0) {
// //     const current = stack.pop()!;
    
// //     if (!visited.has(current)) {
// //       visited.add(current);
      
// //       if (current.x === target[0] && current.y === target[1]) {
// //         return reconstructPath(current);
// //       }
      
// //       updateVisualization(current, new Set(stack), visited);
// //       await new Promise(resolve => setTimeout(resolve, 100));
      
// //       for (const neighbor of getNeighbors(current, grid)) {
// //         if (!visited.has(neighbor)) {
// //           neighbor.parent = current;
// //           stack.push(neighbor);
// //         }
// //       }
// //     }
// //   }
  
// //   return [];
// // };

// // // Dijkstra's Algorithm
// // export const dijkstra = async (
// //   grid: Node[][],
// //   start: [number, number],
// //   target: [number, number],
// //   updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
// // ): Promise<Node[]> => {
// //   const unvisited = new Set<Node>();
// //   const visited = new Set<Node>();
// //   const startNode = grid[start[1]][start[0]];
  
// //   // Initialize all nodes
// //   for (let y = 0; y < grid.length; y++) {
// //     for (let x = 0; x < grid[0].length; x++) {
// //       const node = grid[y][x];
// //       node.g = Infinity;
// //       unvisited.add(node);
// //     }
// //   }
  
// //   startNode.g = 0;
  
// //   while (unvisited.size > 0) {
// //     const current = Array.from(unvisited).reduce((min, node) => 
// //       node.g < min.g ? node : min
// //     );
    
// //     if (current.x === target[0] && current.y === target[1]) {
// //       return reconstructPath(current);
// //     }
    
// //     unvisited.delete(current);
// //     visited.add(current);
    
// //     updateVisualization(current, unvisited, visited);
// //     await new Promise(resolve => setTimeout(resolve, 100));
    
// //     for (const neighbor of getNeighbors(current, grid)) {
// //       if (visited.has(neighbor)) continue;
      
// //       const tentativeDistance = current.g + 1;
// //       if (tentativeDistance < neighbor.g) {
// //         neighbor.g = tentativeDistance;
// //         neighbor.parent = current;
// //       }
// //     }
// //   }
  
// //   return [];
// // };

// // // Greedy Best-First Search
// // export const greedyBestFirst = async (
// //   grid: Node[][],
// //   start: [number, number],
// //   target: [number, number],
// //   updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
// // ): Promise<Node[]> => {
// //   const openSet = new Set<Node>();
// //   const closedSet = new Set<Node>();
// //   const startNode = grid[start[1]][start[0]];
// //   const targetNode = grid[target[1]][target[0]];
  
// //   startNode.h = calculateHeuristic(startNode, targetNode);
// //   openSet.add(startNode);
  
// //   while (openSet.size > 0) {
// //     const current = Array.from(openSet).reduce((min, node) => 
// //       node.h < min.h ? node : min
// //     );
    
// //     if (current.x === target[0] && current.y === target[1]) {
// //       return reconstructPath(current);
// //     }
    
// //     openSet.delete(current);
// //     closedSet.add(current);
    
// //     updateVisualization(current, openSet, closedSet);
// //     await new Promise(resolve => setTimeout(resolve, 100));
    
// //     for (const neighbor of getNeighbors(current, grid)) {
// //       if (closedSet.has(neighbor)) continue;
      
// //       if (!openSet.has(neighbor)) {
// //         neighbor.parent = current;
// //         neighbor.h = calculateHeuristic(neighbor, targetNode);
// //         openSet.add(neighbor);
// //       }
// //     }
// //   }
  
// //   return [];
// // };