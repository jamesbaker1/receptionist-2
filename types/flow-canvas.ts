export interface CanvasView {
  x: number;          // Pan offset X
  y: number;          // Pan offset Y
  zoom: number;       // Zoom level (e.g., 1 = 100%, 0.5 = 50%)
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Represents the overall state of the flow editor canvas, 
 * including nodes, edges, and the current view transformation.
 */
// We will define FlowState in a more central types file later, 
// once we have nodes and edges defined.
// For now, this file focuses purely on canvas-specific types.

// Configuration for canvas features
export interface CanvasConfig {
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  panSpeed?: number;
  gridSize?: number;
  snapToGrid?: boolean;
  showGrid?: boolean;
  multiSelectModifierKey?: 'Shift' | 'Control' | 'Meta'; // Key for multi-selection
}

// Default values for CanvasConfig
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  minZoom: 0.1,
  maxZoom: 4,
  zoomStep: 0.1,
  panSpeed: 1,
  gridSize: 20,
  snapToGrid: true,
  showGrid: true,
  multiSelectModifierKey: 'Shift',
}; 