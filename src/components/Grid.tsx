import React from 'react';
import { Node, NodeState, SearchStats } from '../types';

interface GridProps {
  grid: number[][];
  currentNode: Node | null;
  openSet: Set<Node>;
  closedSet: Set<Node>;
  path: Node[] | null;
  stats: SearchStats | null;
}

const Grid: React.FC<GridProps> = ({ grid, currentNode, openSet, closedSet, path, stats }) => {
  const getNodeClass = (x: number, y: number): string => {
    if (grid[y][x] === 1) return 'bg-gray-800'; // Wall
    
    const node = { x, y } as Node;
    if (path?.some(n => n.x === x && n.y === y)) return 'bg-green-500';
    if (currentNode?.x === x && currentNode?.y === y) return 'bg-purple-500';
    if (Array.from(openSet).some(n => n.x === x && n.y === y)) return 'bg-yellow-500';
    if (Array.from(closedSet).some(n => n.x === x && n.y === y)) return 'bg-blue-500';
    
    return 'bg-white';
  };

  const getNodeInfo = (x: number, y: number): Node | null => {
    if (path?.some(n => n.x === x && n.y === y)) {
      return path.find(n => n.x === x && n.y === y) || null;
    }
    if (currentNode?.x === x && currentNode?.y === y) return currentNode;
    const openNode = Array.from(openSet).find(n => n.x === x && n.y === y);
    if (openNode) return openNode;
    const closedNode = Array.from(closedSet).find(n => n.x === x && n.y === y);
    if (closedNode) return closedNode;
    return null;
  };

  return (
    <div>
      <div className="grid gap-1 p-4" style={{ 
        gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`
      }}>
        {grid.map((row, y) =>
          row.map((_, x) => {
            const node = getNodeInfo(x, y);
            return (
              <div
                key={`${x}-${y}`}
                className={`w-8 h-8 border border-gray-200 ${getNodeClass(x, y)} relative group`}
              >
                {node && (
                  <div className="absolute hidden group-hover:block bg-black text-white p-2 rounded-md text-sm z-10 whitespace-nowrap -translate-y-full">
                    <div>Position: ({x}, {y})</div>
                    {node.g !== Infinity && <div>Cost (g): {node.g.toFixed(2)}</div>}
                    {node.h > 0 && <div>Heuristic (h): {node.h.toFixed(2)}</div>}
                    {node.f > 0 && <div>Total (f): {node.f.toFixed(2)}</div>}
                    {node.depth !== undefined && <div>Depth: {node.depth}</div>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {stats && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-700">Nodes</h3>
            <div className="text-sm">
              <div>Visited: {stats.nodesVisited}</div>
              <div>Frontier Size: {stats.frontierSize}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Path</h3>
            <div className="text-sm">
              <div>Length: {stats.pathLength} steps</div>
              <div>Total Cost: {stats.pathCost.toFixed(2)}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Performance</h3>
            <div className="text-sm">
              <div>Time: {stats.executionTime}ms</div>
              <div>Max Depth: {stats.maxDepth}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grid;