import React, { useState, useEffect } from 'react';
import Grid from './components/Grid';
import { Node, NodeState, SearchStats } from './types';
import { 
  createSimpleMaze, 
  createComplexMaze, 
  createSpiralMaze, 
  createRandomMaze,
  createRecursiveMaze 
} from './utils/mazes';
import { 
  createNode, 
  calculateHeuristic, 
  getNeighbors, 
  reconstructPath,
  bfs,
  dfs,
  dijkstra,
  greedyBestFirst 
} from './utils/algorithms';

type Algorithm = 'astar' | 'bfs' | 'dfs' | 'dijkstra' | 'greedy';
type MazeType = 'simple' | 'complex' | 'spiral' | 'random' | 'recursive';

function App() {
  const [grid, setGrid] = useState(createSimpleMaze());
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [openSet, setOpenSet] = useState<Set<Node>>(new Set());
  const [closedSet, setClosedSet] = useState<Set<Node>>(new Set());
  const [path, setPath] = useState<Node[] | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>('astar');
  const [isRunning, setIsRunning] = useState(false);
  const [mazeSize, setMazeSize] = useState({ width: 15, height: 15 });
  const [stats, setStats] = useState<SearchStats | null>(null);

  const updateVisualization = (
    current: Node,
    openSet: Set<Node>,
    closedSet: Set<Node>
  ) => {
    setCurrentNode(current);
    setOpenSet(openSet);
    setClosedSet(closedSet);
    
    // Update stats
    setStats(prev => ({
      ...prev!,
      nodesVisited: closedSet.size,
      frontierSize: openSet.size,
      maxDepth: Math.max(prev?.maxDepth || 0, current.depth || 0)
    }));
  };

  const aStarSearch = async (start: [number, number], target: [number, number]) => {
    const startTime = performance.now();
    const startNode = createNode(start[0], start[1]);
    const targetNode = createNode(target[0], target[1]);
    
    startNode.g = 0;
    startNode.h = calculateHeuristic(startNode, targetNode);
    startNode.f = startNode.g + startNode.h;
    startNode.depth = 0;

    const openSetLocal = new Set<Node>([startNode]);
    const closedSetLocal = new Set<Node>();

    setStats({
      nodesVisited: 0,
      pathLength: 0,
      pathCost: 0,
      executionTime: 0,
      maxDepth: 0,
      frontierSize: 1
    });

    while (openSetLocal.size > 0) {
      const current = Array.from(openSetLocal)
        .reduce((min, node) => node.f < min.f ? node : min);
      
      updateVisualization(current, openSetLocal, closedSetLocal);
      
      if (current.x === targetNode.x && current.y === targetNode.y) {
        const finalPath = reconstructPath(current);
        const endTime = performance.now();
        
        setStats(prev => ({
          ...prev!,
          pathLength: finalPath.length - 1,
          pathCost: current.g,
          executionTime: Math.round(endTime - startTime)
        }));
        
        setPath(finalPath);
        return finalPath;
      }

      openSetLocal.delete(current);
      closedSetLocal.add(current);

      for (const neighbor of getNeighbors(current, grid)) {
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

    const endTime = performance.now();
    setStats(prev => ({
      ...prev!,
      executionTime: Math.round(endTime - startTime)
    }));
    
    setPath(null);
    return null;
  };

  const handleMazeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mazeType = event.target.value as MazeType;
    switch (mazeType) {
      case 'simple':
        setGrid(createSimpleMaze());
        break;
      case 'complex':
        setGrid(createComplexMaze());
        break;
      case 'spiral':
        setGrid(createSpiralMaze());
        break;
      case 'random':
        setGrid(createRandomMaze(mazeSize.width, mazeSize.height));
        break;
      case 'recursive':
        setGrid(createRecursiveMaze(mazeSize.width, mazeSize.height));
        break;
    }
    resetVisualization();
  };

  const handleAlgorithmChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAlgorithm(event.target.value as Algorithm);
    resetVisualization();
  };

  const resetVisualization = () => {
    setCurrentNode(null);
    setOpenSet(new Set());
    setClosedSet(new Set());
    setPath(null);
    setStats(null);
    setIsRunning(false);
  };

  const startVisualization = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    resetVisualization();
    
    const start: [number, number] = [0, 0];
    const target: [number, number] = [grid[0].length - 1, grid.length - 1];
    
    try {
      switch (algorithm) {
        case 'astar':
          await aStarSearch(start, target);
          break;
        case 'bfs':
          const bfsPath = await bfs(grid, start, target, updateVisualization);
          setPath(bfsPath);
          break;
        case 'dfs':
          const dfsPath = await dfs(grid, start, target, updateVisualization);
          setPath(dfsPath);
          break;
        case 'dijkstra':
          const dijkstraPath = await dijkstra(grid, start, target, updateVisualization);
          setPath(dijkstraPath);
          break;
        case 'greedy':
          const greedyPath = await greedyBestFirst(grid, start, target, updateVisualization);
          setPath(greedyPath);
          break;
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const newSize = Math.max(5, Math.min(50, parseInt(value) || 15));
    setMazeSize(prev => ({ ...prev, [name]: newSize }));
  };

  const generateNewMaze = () => {
    setGrid(createRandomMaze(mazeSize.width, mazeSize.height));
    resetVisualization();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Pathfinding Visualizer</h1>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select 
            onChange={handleMazeChange}
            className="px-4 py-2 border rounded-md"
            disabled={isRunning}
          >
            <option value="simple">Simple Maze</option>
            <option value="complex">Complex Maze</option>
            <option value="spiral">Spiral Maze</option>
            <option value="random">Random Maze</option>
            <option value="recursive">Recursive Maze</option>
          </select>
          
          <select
            onChange={handleAlgorithmChange}
            className="px-4 py-2 border rounded-md"
            disabled={isRunning}
          >
            <option value="astar">A* Search</option>
            <option value="bfs">Breadth-First Search</option>
            <option value="dfs">Depth-First Search</option>
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="greedy">Greedy Best-First Search</option>
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              name="width"
              value={mazeSize.width}
              onChange={handleSizeChange}
              className="px-4 py-2 border rounded-md w-24"
              placeholder="Width"
              min="5"
              max="50"
              disabled={isRunning}
            />
            <input
              type="number"
              name="height"
              value={mazeSize.height}
              onChange={handleSizeChange}
              className="px-4 py-2 border rounded-md w-24"
              placeholder="Height"
              min="5"
              max="50"
              disabled={isRunning}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={generateNewMaze}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              disabled={isRunning}
            >
              Generate Maze
            </button>
            
            <button
              onClick={startVisualization}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Start Search'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <Grid
            grid={grid}
            currentNode={currentNode}
            openSet={openSet}
            closedSet={closedSet}
            path={path}
            stats={stats}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border"></div>
            <span>Unvisited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800"></div>
            <span>Wall</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500"></div>
            <span>Open Set</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500"></div>
            <span>Closed Set</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span>Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;