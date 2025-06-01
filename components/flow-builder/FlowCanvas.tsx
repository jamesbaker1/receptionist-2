'use client';

import React, { useRef, useEffect, useCallback, WheelEvent, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { useFlowCanvas } from '../../contexts/FlowCanvasProvider';
import { BaseNode, BaseEdge } from '../../types/flow'; // Assuming types are correctly pathed

// Props for the FlowCanvas component
interface FlowCanvasProps {
  nodes: BaseNode[];
  edges: BaseEdge[];
  renderNode: (node: BaseNode) => React.ReactNode;
  renderEdge: (edge: BaseEdge) => React.ReactNode;
  onNodeDragStart?: (nodeId: string, event: ReactMouseEvent | ReactTouchEvent) => void;
  onNodeDrag?: (nodeId: string, newPosition: { x: number; y: number }, event: ReactMouseEvent | ReactTouchEvent) => void;
  onNodeDragStop?: (nodeId: string, event: ReactMouseEvent | ReactTouchEvent) => void;
  onNodeClick?: (nodeId: string, event: ReactMouseEvent | ReactTouchEvent) => void;
  onCanvasClick?: (event: ReactMouseEvent, transformedCoords: {x: number, y: number}) => void;
  onCanvasContextMenu?: (event: ReactMouseEvent, transformedCoords: {x: number, y: number}) => void;
  // Additional interaction handlers can be added here: e.g., for selection box
}

const CLICK_TRESHOLD_PX = 5; // Max pixels mouse can move to still be considered a click

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  renderNode,
  renderEdge,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragStop,
  onNodeClick,
  onCanvasClick,
  onCanvasContextMenu,
}) => {
  const { canvasView, canvasConfig, pan, zoomIn, zoomOut, zoomTo, transformCoordinates } = useFlowCanvas();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const draggingNodeId = useRef<string | null>(null);
  const dragStartOffset = useRef<{ x: number; y: number } | null>(null); // Offset from node top-left to mouse click
  const lastDragPosition = useRef<{ x: number; y: number } | null>(null); // Last known raw mouse position for delta calculation
  const mouseDownPosition = useRef<{x: number, y: number} | null>(null); // For click vs drag detection

  // Grid Rendering
  const renderGrid = () => {
    if (!canvasConfig.showGrid || !canvasRef.current) return null;
    const { zoom, x: panX, y: panY } = canvasView;
    const { gridSize } = canvasConfig;
    const scaledGridSize = gridSize! * zoom;

    // Ensure scaledGridSize is not too small to avoid performance issues
    if (scaledGridSize < 5) return null;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    const offsetX = panX % scaledGridSize;
    const offsetY = panY % scaledGridSize;

    const M_PATH = [];
    for (let i = offsetX; i < width; i += scaledGridSize) {
      M_PATH.push(`M ${i} 0 V ${height}`);
    }
    for (let i = offsetY; i < height; i += scaledGridSize) {
      M_PATH.push(`M 0 ${i} H ${width}`);
    }

    return (
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <defs>
          <pattern id="gridPattern" width={scaledGridSize} height={scaledGridSize} patternUnits="userSpaceOnUse">
            <path d={`M ${scaledGridSize} 0 L 0 0 0 ${scaledGridSize}`} fill="none" stroke="rgba(200, 200, 200, 0.3)" strokeWidth="1" />
          </pattern>
        </defs>
        {/* This rect covers the entire SVG, applying the pattern. The transform ensures grid aligns with pan. */}
        <rect width="100%" height="100%" fill="url(#gridPattern)" x={offsetX} y={offsetY}/>
      </svg>
    );
  };
  
  // Mouse Wheel for Zoom
  const handleWheelZoom = useCallback((event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    const zoomSpeed = 0.1; // Adjust sensitivity (might need to be from config)
    const delta = event.deltaY * -1; // Invert deltaY for natural zoom direction
    const zoomFactor = Math.exp(delta * zoomSpeed * 0.1);
    const newZoom = canvasView.zoom * zoomFactor;
    
    zoomTo(newZoom, { x: pointerX, y: pointerY });
  }, [canvasView.zoom, zoomTo]);

  // Mouse Drag for Pan
  const isPanning = useRef(false);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);

  // Touch state
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchMidpoint = useRef<{ x: number; y: number } | null>(null);
  const primaryTouchId = useRef<number | null>(null);
  const potentialClickTarget = useRef<EventTarget | null>(null);

  // Combined MouseDown handler for Panning and Node Drag Start
  const handleMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const targetElement = event.target as HTMLElement;
    const nodeElement = targetElement.closest('[data-node-id]') as HTMLElement | null;
    const rect = canvasRef.current.getBoundingClientRect();
    potentialClickTarget.current = event.target;
    mouseDownPosition.current = { x: event.clientX, y: event.clientY }; 

    if (nodeElement && event.button === 0) { 
      const nodeId = nodeElement.dataset.nodeId;
      if (!nodeId) return;
      // Intention is drag, but could be a click. Decide on mouseup.
      draggingNodeId.current = nodeId; // Tentatively start drag
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      const pointerCanvasCoords = transformCoordinates(event.clientX, event.clientY, rect);
      dragStartOffset.current = { x: pointerCanvasCoords.x - node.position.x, y: pointerCanvasCoords.y - node.position.y };
      lastDragPosition.current = {x: event.clientX, y: event.clientY };
      // Don't set cursor to grabbing immediately, wait for mouse move to confirm drag
      // if (onNodeDragStart) onNodeDragStart(nodeId, event); // Call on first move instead
      event.stopPropagation(); 
    } else if (event.button === 0) { 
      isPanning.current = true;
      lastMousePosition.current = { x: event.clientX, y: event.clientY };
      // document.body.style.cursor = 'grabbing'; // Set on move
    }
  }, [nodes, transformCoordinates]);

  const handleMouseMove = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    if (draggingNodeId.current && dragStartOffset.current && lastDragPosition.current) {
      // Confirm drag if mouse moved beyond threshold
      if (!document.body.style.cursor.includes('grabbing')) {
          if (Math.abs(event.clientX - mouseDownPosition.current!.x) > CLICK_TRESHOLD_PX || Math.abs(event.clientY - mouseDownPosition.current!.y) > CLICK_TRESHOLD_PX) {
            document.body.style.cursor = 'grabbing';
            if (onNodeDragStart) onNodeDragStart(draggingNodeId.current, event); // Call drag start here
          }
      }
      
      if (document.body.style.cursor.includes('grabbing')) { // Only drag if confirmed
        const nodeId = draggingNodeId.current;
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        const pointerCanvasCoords = transformCoordinates(event.clientX, event.clientY, rect);
        let newX = pointerCanvasCoords.x - dragStartOffset.current.x;
        let newY = pointerCanvasCoords.y - dragStartOffset.current.y;
        if (canvasConfig.snapToGrid && canvasConfig.gridSize! > 0) {
          newX = Math.round(newX / canvasConfig.gridSize!) * canvasConfig.gridSize!;
          newY = Math.round(newY / canvasConfig.gridSize!) * canvasConfig.gridSize!;
        }
        if (onNodeDrag) onNodeDrag(nodeId, { x: newX, y: newY }, event);
        lastDragPosition.current = {x: event.clientX, y: event.clientY };
      }
    } else if (isPanning.current && lastMousePosition.current) {
      if (!document.body.style.cursor.includes('grabbing')) {
         if (Math.abs(event.clientX - mouseDownPosition.current!.x) > CLICK_TRESHOLD_PX || Math.abs(event.clientY - mouseDownPosition.current!.y) > CLICK_TRESHOLD_PX) {
            document.body.style.cursor = 'grabbing';
         }
      }
      if (document.body.style.cursor.includes('grabbing')){
        const deltaX = event.clientX - lastMousePosition.current.x;
        const deltaY = event.clientY - lastMousePosition.current.y;
        pan(deltaX, deltaY);
        lastMousePosition.current = { x: event.clientX, y: event.clientY };
      }
    }
  }, [nodes, onNodeDrag, onNodeDragStart, pan, canvasConfig.snapToGrid, canvasConfig.gridSize, transformCoordinates]);

  // Combined MouseUp and TouchEnd handler
  const handleMouseUpOrTouchEnd = useCallback((event?: ReactMouseEvent | ReactTouchEvent | MouseEvent) => {
    const upEvent = event as ReactMouseEvent; // Assume mouse event for clientX/Y for click check
    const eventTarget = potentialClickTarget.current;
    
    if (draggingNodeId.current) {
      // Check if it was a click or a drag
      const movedDistance = mouseDownPosition.current && upEvent && upEvent.clientX ? Math.hypot(upEvent.clientX - mouseDownPosition.current.x, upEvent.clientY - mouseDownPosition.current.y) : CLICK_TRESHOLD_PX + 1;
      
      if (movedDistance < CLICK_TRESHOLD_PX && eventTarget) {
        const nodeElement = (eventTarget as HTMLElement).closest('[data-node-id]') as HTMLElement | null;
        if (nodeElement && nodeElement.dataset.nodeId === draggingNodeId.current && onNodeClick) {
            onNodeClick(draggingNodeId.current, upEvent as any);
        }
      } else if (onNodeDragStop && document.body.style.cursor.includes('grabbing')) { // Was a drag
        onNodeDragStop(draggingNodeId.current, upEvent as any);
      }
    }

    // Reset states
    draggingNodeId.current = null;
    dragStartOffset.current = null;
    lastDragPosition.current = null;
    isPanning.current = false;
    lastMousePosition.current = null;
    primaryTouchId.current = null;
    lastTouchDistance.current = null;
    lastTouchMidpoint.current = null;
    mouseDownPosition.current = null;
    potentialClickTarget.current = null;
    document.body.style.cursor = 'default';
  }, [onNodeDragStop, onNodeClick]);
  
  const handleCanvasClickInternal = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    // This is the raw click event on the canvas div itself.
    // We use onMouseUpOrTouchEnd to determine if it was a click on canvas background or node.
    if (mouseDownPosition.current && event.clientX && event.target === canvasRef.current) { // Click on canvas background
         const movedDistance = Math.hypot(event.clientX - mouseDownPosition.current.x, event.clientY - mouseDownPosition.current.y);
         if (movedDistance < CLICK_TRESHOLD_PX) {
            if (onCanvasClick && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const coords = transformCoordinates(event.clientX, event.clientY, rect);
                onCanvasClick(event, coords);
            }
         }
    }
  }, [onCanvasClick, transformCoordinates]);

  const handleContextMenu = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault(); 
    if (onCanvasContextMenu && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const coords = transformCoordinates(event.clientX, event.clientY, rect);
        onCanvasContextMenu(event, coords);
    }
  }, [onCanvasContextMenu, transformCoordinates]);

  // TOUCH EVENT HANDLERS
  const handleTouchStart = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    potentialClickTarget.current = event.target;

    if (event.touches.length === 1) {
      primaryTouchId.current = event.touches[0].identifier;
      const touch = event.touches[0];
      mouseDownPosition.current = { x: touch.clientX, y: touch.clientY }; // For click detection
      const targetElement = touch.target as HTMLElement;
      const nodeElement = targetElement.closest('[data-node-id]') as HTMLElement | null;

      if (nodeElement) {
        const nodeId = nodeElement.dataset.nodeId;
        if (!nodeId) return;
        draggingNodeId.current = nodeId; // Tentative drag
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        const pointerCanvasCoords = transformCoordinates(touch.clientX, touch.clientY, rect);
        dragStartOffset.current = { x: pointerCanvasCoords.x - node.position.x, y: pointerCanvasCoords.y - node.position.y };
        lastDragPosition.current = { x: touch.clientX, y: touch.clientY };
        // onNodeDragStart called on move
        event.stopPropagation();
      } else {
        isPanning.current = true;
        lastMousePosition.current = { x: touch.clientX, y: touch.clientY };
      }
    } else if (event.touches.length === 2) {
      isPanning.current = false; 
      draggingNodeId.current = null; 
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      lastTouchDistance.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      lastTouchMidpoint.current = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
      document.body.style.cursor = 'default'; // Ensure no grabbing cursor during pinch
    }
  }, [nodes, transformCoordinates]);

  const handleTouchMove = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    if (event.touches.length === 1 && primaryTouchId.current === event.touches[0].identifier) {
      const touch = event.touches[0];
      if (draggingNodeId.current && dragStartOffset.current) {
          if (!document.body.style.cursor.includes('grabbing')) {
            if (Math.abs(touch.clientX - mouseDownPosition.current!.x) > CLICK_TRESHOLD_PX || Math.abs(touch.clientY - mouseDownPosition.current!.y) > CLICK_TRESHOLD_PX) {
                document.body.style.cursor = 'grabbing';
                if (onNodeDragStart) onNodeDragStart(draggingNodeId.current, event);
            }
          }
          if (document.body.style.cursor.includes('grabbing')) {
            const nodeId = draggingNodeId.current;
            const node = nodes.find(n => n.id === nodeId);
            if (!node) return;
            const pointerCanvasCoords = transformCoordinates(touch.clientX, touch.clientY, rect);
            let newX = pointerCanvasCoords.x - dragStartOffset.current.x;
            let newY = pointerCanvasCoords.y - dragStartOffset.current.y;
            if (canvasConfig.snapToGrid && canvasConfig.gridSize! > 0) {
              newX = Math.round(newX / canvasConfig.gridSize!) * canvasConfig.gridSize!;
              newY = Math.round(newY / canvasConfig.gridSize!) * canvasConfig.gridSize!;
            }
            if (onNodeDrag) onNodeDrag(nodeId, { x: newX, y: newY }, event);
            lastDragPosition.current = { x: touch.clientX, y: touch.clientY };
          }
      } else if (isPanning.current && lastMousePosition.current) {
          if (!document.body.style.cursor.includes('grabbing')) {
            if (Math.abs(touch.clientX - mouseDownPosition.current!.x) > CLICK_TRESHOLD_PX || Math.abs(touch.clientY - mouseDownPosition.current!.y) > CLICK_TRESHOLD_PX) {
                document.body.style.cursor = 'grabbing';
            }
          }
          if (document.body.style.cursor.includes('grabbing')) {
            const deltaX = touch.clientX - lastMousePosition.current.x;
            const deltaY = touch.clientY - lastMousePosition.current.y;
            pan(deltaX, deltaY);
            lastMousePosition.current = { x: touch.clientX, y: touch.clientY };
          }
      }
    } else if (event.touches.length === 2 && lastTouchDistance.current && lastTouchMidpoint.current) {
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const currentMidpoint = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
      const zoomFactor = currentDist / lastTouchDistance.current;
      const newZoom = canvasView.zoom * zoomFactor;
      const pointerForZoom = { x: currentMidpoint.x - rect.left, y: currentMidpoint.y - rect.top };
      zoomTo(newZoom, pointerForZoom);
      lastTouchDistance.current = currentDist;
      lastTouchMidpoint.current = currentMidpoint;
    }
  }, [nodes, onNodeDrag, onNodeDragStart, pan, canvasConfig, canvasView.zoom, transformCoordinates, zoomTo]);

  // Add global mouse up listener to handle cases where mouse up occurs outside the canvas
  useEffect(() => {
    const currentCanvasRef = canvasRef.current;
    // Mouse up listener
    window.addEventListener('mouseup', handleMouseUpOrTouchEnd);
    // Touch end listener for global release, helps if finger slides off canvas
    window.addEventListener('touchend', handleMouseUpOrTouchEnd as any);
    window.addEventListener('touchcancel', handleMouseUpOrTouchEnd as any);

    // Passive event listeners for touchmove and wheel to allow scrolling if not handled
    // currentCanvasRef?.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    // currentCanvasRef?.addEventListener('wheel', handleWheelZoom as any, { passive: false });

    return () => {
      window.removeEventListener('mouseup', handleMouseUpOrTouchEnd);
      window.removeEventListener('touchend', handleMouseUpOrTouchEnd as any);
      window.removeEventListener('touchcancel', handleMouseUpOrTouchEnd as any);
      // currentCanvasRef?.removeEventListener('touchmove', handleTouchMove as any);
      // currentCanvasRef?.removeEventListener('wheel', handleWheelZoom as any);
    };
  }, [handleMouseUpOrTouchEnd]); // Removed handleTouchMove, handleWheelZoom from deps as they are stable

  return (
    <div
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: isPanning.current || document.body.style.cursor === 'grabbing' ? 'grabbing' : 'grab', // Updated cursor logic
        background: '#f0f0f0', // A light background for the canvas
        touchAction: 'none', // Prevent default touch actions like scroll/zoom on the element
      }}
      onWheel={handleWheelZoom}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrTouchEnd as any} // Reuse mouse up logic for touch end
      onClick={handleCanvasClickInternal} // Use internal handler
      onContextMenu={handleContextMenu} // Attach context menu handler
    >
      {canvasConfig.showGrid && renderGrid()}
      <div
        style={{
          position: 'absolute',
          transform: `translate(${canvasView.x}px, ${canvasView.y}px) scale(${canvasView.zoom})`,
          transformOrigin: 'top left',
          width: '100%', // These might need to be very large if we don't virtualize
          height: '100%',
        }}
      >
        {edges.map(renderEdge)}
        {nodes.map(renderNode)}
      </div>
      {/* UI for zoom buttons, etc., can be added here or in a parent component */}
    </div>
  );
};

export default FlowCanvas; 