export enum NodeType {
  Message = 'MESSAGE',
  Condition = 'CONDITION',
  Action = 'ACTION',
  Custom = 'CUSTOM',
}

export enum HandleType {
  Source = 'SOURCE',
  Target = 'TARGET',
}

export enum HandlePosition {
  Top = 'TOP',
  Bottom = 'BOTTOM',
  Left = 'LEFT',
  Right = 'RIGHT',
}

export interface NodeHandle {
  id: string;
  nodeId: string;
  type: HandleType;
  position: HandlePosition | { x: number; y: number };
  // Optional fields for future enhancements:
  // connectionType?: string; 
  // allowedNodeTypes?: NodeType[];
}

// --- Message Node Specifics ---
export interface MessageNodeData {
  text: string;
  // Placeholders for future enhancements from the plan:
  // richTextContent?: any; 
  // supportedVariables?: string[];
  // mediaAttachments?: MediaAttachment[];
}

// --- Condition Node Specifics (Placeholder) ---
export interface ConditionNodeData {
  // Example structure (can be expanded later):
  // conditionExpression?: string;
  // rules?: ConditionRule[];
  [key: string]: any; // General placeholder for now
}

// --- Action Node Specifics (Placeholder) ---
export interface ActionNodeData {
  // Example structure (can be expanded later):
  // actionType?: string; // e.g., 'API_CALL', 'DB_OPERATION'
  // config?: any;
  [key: string]: any; // General placeholder for now
}

// --- Custom Node Specifics (Placeholder) ---
export interface CustomNodeData {
  customType: string;
  [key: string]: any;
}

// --- NodeData Union ---
// This union will combine all specific node data types.
export type NodeData =
  | MessageNodeData
  | ConditionNodeData
  | ActionNodeData
  | CustomNodeData;

// --- Base Node Definition ---
// This is the core structure for any node in the flow.
export interface BaseNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  handles: NodeHandle[];
  width?: number;
  height?: number;
  // Optional UI state flags:
  // selected?: boolean;
  // dragging?: boolean;
}

// --- Supporting interfaces (placeholders, can be expanded) ---
// export interface MediaAttachment {
//   id: string;
//   type: 'image' | 'video' | 'document';
//   url: string;
//   fileName?: string;
//   size?: number; // in bytes
// }

// export interface ConditionRule {
//   id: string;
//   field: string;
//   operator: string; // e.g., 'EQUALS', 'GREATER_THAN'
//   value: any;
// } 