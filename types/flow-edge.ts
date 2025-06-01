import { BaseNode, NodeHandle } from './flow-node';

export enum EdgeType {
  Default = 'DEFAULT',
  Conditional = 'CONDITIONAL',
  Custom = 'CUSTOM',
}

// --- Default Edge Specifics ---
export enum DefaultEdgeStyle {
  Straight = 'STRAIGHT',
  Bezier = 'BEZIER',
  Step = 'STEP',
}

export interface DefaultEdgeData {
  style?: DefaultEdgeStyle;
  // Optional: animated?: boolean;
  // Optional: strokeWidth?: number;
  // Optional: color?: string;
}

// --- Conditional Edge Specifics ---
export interface ConditionalEdgeData {
  conditionExpression: string; // e.g., "data.age > 18 && data.status === 'active'"
  // Optional: label?: string;
  // Optional: priority?: number; // For multiple conditional edges from a single source
}

// --- Custom Edge Specifics ---
export interface CustomEdgeData {
  customType: string;
  [key: string]: any;
}

// --- EdgeData Union ---
export type EdgeData =
  | DefaultEdgeData
  | ConditionalEdgeData
  | CustomEdgeData
  | undefined; // Edges might not always have data

// --- Base Edge Definition ---
export interface BaseEdge {
  id: string;
  source: string; // Source Node ID
  sourceHandle?: string; // Optional: Source Handle ID on the Node
  target: string; // Target Node ID
  targetHandle?: string; // Optional: Target Handle ID on the Node
  type: EdgeType;
  data?: EdgeData;
  // Optional UI state flags:
  // selected?: boolean;
  // animated?: boolean;
  // label?: string; // A general label, could also be in data
}

// --- Additional related types (can be expanded as needed) ---

/**
 * Represents a connection point on a node, linking to an edge.
 */
export interface Connection {
  nodeId: string;
  handleId: string;
  // Potentially add handle type (source/target) if needed for validation
}

/**
 * Helper type for when an edge is being constructed or previewed.
 */
export interface PendingConnection {
  sourceNode: BaseNode | null;
  sourceHandle: NodeHandle | null;
  targetNode: BaseNode | null;
  targetHandle: NodeHandle | null;
  targetPosition: { x: number; y: number } | null; // Mouse position when dragging to empty space
} 