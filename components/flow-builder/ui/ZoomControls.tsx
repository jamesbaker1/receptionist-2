'use client';

import React from 'react';
import { useFlowCanvas } from '../../../contexts/FlowCanvasProvider';
import { Button } from '@/components/ui/button';
import { ZoomInIcon, ZoomOutIcon, Maximize2 } from 'lucide-react';
import { BaseNode } from '../../../types/flow';

interface ZoomControlsProps {
  nodes: BaseNode[];
  canvasWidth?: number;
  canvasHeight?: number;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ nodes, canvasWidth, canvasHeight }) => {
  const { canvasView, zoomIn, zoomOut, zoomTo } = useFlowCanvas();

  const fitToCanvas = () => {
    if (!nodes.length || !canvasWidth || !canvasHeight) return;

    const padding = 50;
    const minX = Math.min(...nodes.map(n => n.position.x));
    const maxX = Math.max(...nodes.map(n => n.position.x + (n.width || 150)));
    const minY = Math.min(...nodes.map(n => n.position.y));
    const maxY = Math.max(...nodes.map(n => n.position.y + (n.height || 50)));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const scaleX = (canvasWidth - 2 * padding) / contentWidth;
    const scaleY = (canvasHeight - 2 * padding) / contentHeight;
    
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const offsetX = canvasWidth / 2 - centerX * scale;
    const offsetY = canvasHeight / 2 - centerY * scale;

    zoomTo(scale, { x: offsetX, y: offsetY });
  };

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  return (
    <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomIn}
        className="h-8 w-8"
        title="Zoom In"
      >
        <ZoomInIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomOut}
        className="h-8 w-8"
        title="Zoom Out"
      >
        <ZoomOutIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={fitToCanvas}
        className="h-8 w-8"
        title="Fit to Screen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center px-1">
        {Math.round(canvasView.zoom * 100)}%
      </div>
    </div>
  );
};

export default ZoomControls; 