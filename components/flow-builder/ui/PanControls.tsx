'use client';

import React from 'react';
import { useFlowCanvas } from '../../../contexts/FlowCanvasProvider';
import { Button } from '../../ui/button';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface PanControlsProps {
  className?: string;
  panStep?: number; // Optional: customize how much to pan on each click
}

const PanControls: React.FC<PanControlsProps> = ({ className, panStep = 50 }) => {
  const { pan } = useFlowCanvas();

  return (
    <div className={`grid grid-cols-3 gap-1 p-1 bg-white border border-gray-300 rounded shadow-lg ${className || ''}`}>
      <div /> {/* Empty cell for grid layout */}
      <Button variant="ghost" size="icon" onClick={() => pan(0, panStep)} aria-label="Pan Up">
        <ArrowUp className="h-5 w-5" />
      </Button>
      <div /> {/* Empty cell */}

      <Button variant="ghost" size="icon" onClick={() => pan(panStep, 0)} aria-label="Pan Left">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div /> {/* Center cell, could be a reset view button in future */}
      <Button variant="ghost" size="icon" onClick={() => pan(-panStep, 0)} aria-label="Pan Right">
        <ArrowRight className="h-5 w-5" />
      </Button>

      <div /> {/* Empty cell */}
      <Button variant="ghost" size="icon" onClick={() => pan(0, -panStep)} aria-label="Pan Down">
        <ArrowDown className="h-5 w-5" />
      </Button>
      <div /> {/* Empty cell */}
    </div>
  );
};

export default PanControls; 