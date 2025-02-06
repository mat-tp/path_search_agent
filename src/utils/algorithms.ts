import { Node, Grid, NodeState } from '../types';

export const createNode = (x: number, y: number): Node => ({
  x,
  y,
  g: Infinity,
  h: 0,
  f: 0,
  parent: null,
  state: NodeState.UNVISITED
});

export const calculateHeuristic = (node: Node, target: Node): number => {
  return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
};

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

export const isValid = (x: number, y: number, grid: Grid): boolean => {
  return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length && grid[y][x] === 0;
};

export const reconstructPath = (node: Node): Node[] => {
  const path: Node[] = [];
  let current: Node | null = node;

  while (current) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
};

export const bfs = async (
  grid: Grid,
  start: [number, number],
  target: [number, number],
  updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
): Promise<Node[]> => {
  const queue: Node[] = [];
  const visited = new Set<string>();
  const startNode = createNode(start[0], start[1]);
  
  queue.push(startNode);
  visited.add(`${start[0]},${start[1]}`);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.x === target[0] && current.y === target[1]) {
      return reconstructPath(current);
    }
    
    const openSet = new Set(queue.map(n => ({ ...n })));
    const closedSet = new Set(Array.from(visited).map(coord => {
      const [x, y] = coord.split(',').map(Number);
      return createNode(x, y);
    }));
    
    updateVisualization(current, openSet, closedSet);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    for (const neighbor of getNeighbors(current, grid)) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        neighbor.parent = current;
        queue.push(neighbor);
        visited.add(key);
      }
    }
  }
  
  return [];
};

export const dfs = async (
  grid: Grid,
  start: [number, number],
  target: [number, number],
  updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
): Promise<Node[]> => {
  const stack: Node[] = [];
  const visited = new Set<string>();
  const startNode = createNode(start[0], start[1]);
  
  stack.push(startNode);
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = `${current.x},${current.y}`;
    
    if (!visited.has(key)) {
      visited.add(key);
      
      if (current.x === target[0] && current.y === target[1]) {
        return reconstructPath(current);
      }
      
      const openSet = new Set(stack.map(n => ({ ...n })));
      const closedSet = new Set(Array.from(visited).map(coord => {
        const [x, y] = coord.split(',').map(Number);
        return createNode(x, y);
      }));
      
      updateVisualization(current, openSet, closedSet);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      for (const neighbor of getNeighbors(current, grid)) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(neighborKey)) {
          neighbor.parent = current;
          stack.push(neighbor);
        }
      }
    }
  }
  
  return [];
};

export const dijkstra = async (
  grid: Grid,
  start: [number, number],
  target: [number, number],
  updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
): Promise<Node[]> => {
  const distances = new Map<string, number>();
  const pq: Node[] = [];
  const visited = new Set<string>();
  const startNode = createNode(start[0], start[1]);
  
  startNode.g = 0;
  pq.push(startNode);
  distances.set(`${start[0]},${start[1]}`, 0);
  
  while (pq.length > 0) {
    pq.sort((a, b) => a.g - b.g);
    const current = pq.shift()!;
    const key = `${current.x},${current.y}`;
    
    if (current.x === target[0] && current.y === target[1]) {
      return reconstructPath(current);
    }
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    const openSet = new Set(pq.map(n => ({ ...n })));
    const closedSet = new Set(Array.from(visited).map(coord => {
      const [x, y] = coord.split(',').map(Number);
      return createNode(x, y);
    }));
    
    updateVisualization(current, openSet, closedSet);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    for (const neighbor of getNeighbors(current, grid)) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      const newDist = current.g + 1;
      
      if (!distances.has(neighborKey) || newDist < distances.get(neighborKey)!) {
        distances.set(neighborKey, newDist);
        neighbor.g = newDist;
        neighbor.parent = current;
        pq.push(neighbor);
      }
    }
  }
  
  return [];
};

export const greedyBestFirst = async (
  grid: Grid,
  start: [number, number],
  target: [number, number],
  updateVisualization: (current: Node, openSet: Set<Node>, closedSet: Set<Node>) => void
): Promise<Node[]> => {
  const openSet = new Set<Node>();
  const closedSet = new Set<string>();
  const startNode = createNode(start[0], start[1]);
  const targetNode = createNode(target[0], target[1]);
  
  startNode.h = calculateHeuristic(startNode, targetNode);
  openSet.add(startNode);
  
  while (openSet.size > 0) {
    const current = Array.from(openSet).reduce((min, node) => 
      node.h < min.h ? node : min
    );
    
    if (current.x === target[0] && current.y === target[1]) {
      return reconstructPath(current);
    }
    
    openSet.delete(current);
    closedSet.add(`${current.x},${current.y}`);
    
    updateVisualization(current, openSet, new Set(Array.from(closedSet).map(coord => {
      const [x, y] = coord.split(',').map(Number);
      return createNode(x, y);
    })));
    await new Promise(resolve => setTimeout(resolve, 100));
    
    for (const neighbor of getNeighbors(current, grid)) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!closedSet.has(key)) {
        neighbor.parent = current;
        neighbor.h = calculateHeuristic(neighbor, targetNode);
        openSet.add(neighbor);
      }
    }
  }
  
  return [];
};