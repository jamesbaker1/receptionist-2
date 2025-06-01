'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { CanvasView, CanvasConfig, DEFAULT_CANVAS_CONFIG, BaseNode, FlowElement, isNode } from '../types/flow';

interface FlowCanvasContextType {
  canvasView: CanvasView;
  setCanvasView: React.Dispatch<React.SetStateAction<CanvasView>>;
  canvasConfig: CanvasConfig;
  setCanvasConfig: React.Dispatch<React.SetStateAction<CanvasConfig>>;
  zoomIn: (pointer?: { x: number; y: number }) => void;
  zoomOut: (pointer?: { x: number; y: number }) => void;
  zoomTo: (zoomLevel: number, pointer?: { x: number; y: number }) => void;
  zoomToFit: (nodes: BaseNode[], canvasWidth: number, canvasHeight: number, padding?: number) => void;
  pan: (deltaX: number, deltaY: number) => void;
  transformCoordinates: (clientX: number, clientY: number, canvasRect?: DOMRect) => { x: number; y: number };
}

const FlowCanvasContext = createContext<FlowCanvasContextType | undefined>(undefined);

interface FlowCanvasProviderProps {
  children: ReactNode;
  initialView?: Partial<CanvasView>;
  config?: Partial<CanvasConfig>;
}

export const FlowCanvasProvider: React.FC<FlowCanvasProviderProps> = ({
  children,
  initialView = {},
  config = {},
}) => {
  const [canvasView, setCanvasView] = useState<CanvasView>({
    x: initialView.x || 0,
    y: initialView.y || 0,
    zoom: initialView.zoom || 1,
  });

  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
    ...DEFAULT_CANVAS_CONFIG,
    ...config,
  });

  const pan = useCallback((deltaX: number, deltaY: number) => {
    setCanvasView(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);

  const zoomTo = useCallback((newZoomLevel: number, pointer?: { x: number; y: number }) => {
    setCanvasView(prevView => {
      const clampedZoom = Math.max(canvasConfig.minZoom!, Math.min(canvasConfig.maxZoom!, newZoomLevel));
      
      let newX = prevView.x;
      let newY = prevView.y;

      if (pointer) {
        // If a pointer position (relative to canvas container) is provided, zoom towards it.
        // The pointer coordinates are the point that should remain stationary after zoom.
        // prevPointerOnCanvas = (pointer.x - prevView.x) / prevView.zoom
        // newPointerOnCanvas = (pointer.x - newX) / clampedZoom
        // We want prevPointerOnCanvas == newPointerOnCanvas
        // (pointer.x - prevView.x) / prevView.zoom = (pointer.x - newX) / clampedZoom
        // newX = pointer.x - (pointer.x - prevView.x) * (clampedZoom / prevView.zoom)
        newX = pointer.x - (pointer.x - prevView.x) * (clampedZoom / prevView.zoom);
        newY = pointer.y - (pointer.y - prevView.y) * (clampedZoom / prevView.zoom);
      }
      // If no pointer, zoom is centered on the current view center (effectively)
      // or rather, the origin (0,0) of the pan, which might not be the visual center.
      // For true center zoom without pointer, a bit more math involving canvas center is needed.
      // This implementation defaults to zooming around the current top-left of the view content if no pointer.

      return {
        ...prevView,
        x: newX,
        y: newY,
        zoom: clampedZoom,
      };
    });
  }, [canvasConfig.minZoom, canvasConfig.maxZoom]);

  const zoomIn = useCallback((pointer?: { x: number; y: number }) => {
    zoomTo(canvasView.zoom + canvasConfig.zoomStep!, pointer);
  }, [canvasView.zoom, canvasConfig.zoomStep, zoomTo]);

  const zoomOut = useCallback((pointer?: { x: number; y: number }) => {
    zoomTo(canvasView.zoom - canvasConfig.zoomStep!, pointer);
  }, [canvasView.zoom, canvasConfig.zoomStep, zoomTo]);
  
  const transformCoordinates = useCallback((clientX: number, clientY: number, canvasRect?: DOMRect): { x: number; y: number } => {
    // clientX, clientY are viewport coordinates (e.g., event.clientX, event.clientY)
    // canvasRect is from canvasRef.current.getBoundingClientRect()
    const  rect = canvasRect || { left: 0, top: 0 }; // Assume (0,0) if no rect provided
    const xRelativeToCanvas = clientX - rect.left;
    const yRelativeToCanvas = clientY - rect.top;

    const canvasX = (xRelativeToCanvas - canvasView.x) / canvasView.zoom;
    const canvasY = (yRelativeToCanvas - canvasView.y) / canvasView.zoom;
    return { x: canvasX, y: canvasY };
  }, [canvasView.x, canvasView.y, canvasView.zoom]);

  const zoomToFit = useCallback((nodes: BaseNode[], canvasWidth: number, canvasHeight: number, padding = 50) => {
    if (nodes.length === 0) {
      setCanvasView({ x: canvasWidth / 2, y: canvasHeight / 2, zoom: 1 }); // Center if no nodes
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + (node.width || 150)); 
      maxY = Math.max(maxY, node.position.y + (node.height || 50)); 
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) {
      const newZoom = Math.min(canvasConfig.maxZoom!, 1); // Default to 100% or maxZoom
      const boundedZoom = Math.max(canvasConfig.minZoom!, newZoom);
      const firstNode = nodes[0] || { position: { x: 0, y: 0 }, width: 150, height: 50 }; // Fallback for empty nodes array, though guarded earlier
      // Center the single node (or the first node if multiple are stacked)
      const newX = (canvasWidth / 2) - ((firstNode.position.x + (firstNode.width || 150)/2) * boundedZoom) ;
      const newY = (canvasHeight / 2) - ((firstNode.position.y + (firstNode.height || 50)/2) * boundedZoom);
      setCanvasView({ x: newX, y: newY, zoom: boundedZoom});
      return;
    }

    const zoomX = (canvasWidth - 2 * padding) / contentWidth;
    const zoomY = (canvasHeight - 2 * padding) / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, canvasConfig.maxZoom!);
    const boundedZoom = Math.max(canvasConfig.minZoom!, newZoom);

    const newX = (canvasWidth - (contentWidth * boundedZoom)) / 2 - (minX * boundedZoom);
    const newY = (canvasHeight - (contentHeight * boundedZoom)) / 2 - (minY * boundedZoom);

    setCanvasView({ x: newX, y: newY, zoom: boundedZoom });

  }, [canvasConfig.maxZoom, canvasConfig.minZoom]);

  const value = useMemo(() => ({
    canvasView,
    setCanvasView,
    canvasConfig,
    setCanvasConfig,
    zoomIn,
    zoomOut,
    zoomTo,
    zoomToFit,
    pan,
    transformCoordinates,
  }), [canvasView, canvasConfig, zoomIn, zoomOut, zoomTo, zoomToFit, pan, transformCoordinates]);

  return <FlowCanvasContext.Provider value={value}>{children}</FlowCanvasContext.Provider>;
};

export const useFlowCanvas = (): FlowCanvasContextType => {
  const context = useContext(FlowCanvasContext);
  if (context === undefined) {
    throw new Error('useFlowCanvas must be used within a FlowCanvasProvider');
  }
  return context;
}; 