import { BaseNode, NodeData, NodeType } from './flow-node';
import { BaseEdge, EdgeData, EdgeType } from './flow-edge';
import { CanvasView, CanvasConfig } from './flow-canvas';

/**
 * Enum representing the different types of answers a question can have
 */
export enum AnswerType {
  TEXT = "TEXT",
  YES_NO = "YES_NO",
  RADIO = "RADIO",
  DATE = "DATE"
}

/**
 * Represents a question in a wizard-based flow
 */
export interface Question {
  id: string;
  text: string;
  type: AnswerType;
  options: string[];
}

/**
 * Represents a logic rule for conditional flow branching
 */
export interface LogicRule {
  id: string;
  sourceQuestionId: string;
  condition: string;
  targetQuestionId: string;
}

/**
 * Represents a tool call integration
 */
export interface ToolCall {
  id: string;
  name: string;
  enabled: boolean;
  details: string;
}

/**
 * Represents a wizard-based flow (different from node-based flows)
 */
export interface WizardFlow {
  id: string;
  name: string;
  questions: Question[];
  logic: LogicRule[];
  toolCalls: ToolCall[];
  lastEditedDate: string;
  status: "Draft" | "Published";
  description?: string;
  introductionGreeting?: string;
  goodbyeGreeting?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: string;
}

/**
 * Represents the entire state of a single flow diagram (node-based).
 */
export interface Flow {
  id: string;
  name: string; // Name of the flow, e.g., from Step 1 in your plan
  nodes: BaseNode[];
  edges: BaseEdge[];
  // Optional metadata
  description?: string;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  version?: string;   // For version control, as per plan 3.3.1
}

/**
 * Represents the state of the flow editor UI, including the current flow
 * being edited, canvas view, selection, and any interaction states.
 */
export interface FlowEditorState {
  currentFlow: Flow | null; // The flow currently loaded in the editor
  canvasView: CanvasView;
  canvasConfig: CanvasConfig;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  // States for interactions
  isPanning?: boolean;
  isDraggingNode?: boolean;
  isConnectingEdge?: boolean; // When user is dragging a new edge
  // Potentially add pendingConnectionDetails here from flow-edge.ts if needed globally
  // For managing history/undo-redo, as per plan (though implementation is later)
  // history: FlowSnapshot[]; 
  // currentHistoryIndex: number;
}

/**
 * A snapshot of the flow state, used for history/version control.
 */
// export interface FlowSnapshot {
//   nodes: BaseNode[];
//   edges: BaseEdge[];
//   timestamp: string;
//   // Optional: description of change
// }

// --- Utility types that might be useful across the flow system ---

/**
 * Generic type for an element in the flow (either a node or an edge).
 */
export type FlowElement = BaseNode | BaseEdge;

/**
 * Type guard to check if an element is a Node.
 */
export function isNode(element: FlowElement): element is BaseNode {
  return 'position' in element && 'data' in element && 'handles' in element;
}

/**
 * Type guard to check if an element is an Edge.
 */
export function isEdge(element: FlowElement): element is BaseEdge {
  return 'source' in element && 'target' in element;
}

// Re-exporting key types for easier access from other modules
export * from './flow-node';
export * from './flow-edge';
export * from './flow-canvas'; 