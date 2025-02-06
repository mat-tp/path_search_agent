export interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
  state: NodeState;
  visited?: boolean;
  cost?: number;
  depth?: number;
}

export enum NodeState {
  UNVISITED = 'UNVISITED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PATH = 'PATH',
  WALL = 'WALL'
}

export type Grid = number[][];


export type PathFinder = (
  grid: Grid,
  start: [number, number],
  target: [number, number]
) => Promise<Node[]>;



export interface SearchStats {
  nodesVisited: number;
  pathLength: number;
  pathCost: number;
  executionTime: number;
  maxDepth: number;
  frontierSize: number;
  steps: number;
}
