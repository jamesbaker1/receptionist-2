'use client';

import React from 'react';
import { BaseNode, NodeType, NodeHandle, HandleType, HandlePosition } from '../../../types/flow';

interface BasicNodeProps {
  node: BaseNode;
  selected?: boolean;
  onClick?: (nodeId: string, event: React.MouseEvent | React.TouchEvent) => void;
}

const BasicNode: React.FC<BasicNodeProps> = ({ node, selected, onClick }) => {
  const { id, type, data, position, width = 150, height = 50 } = node;

  let backgroundColor = 'bg-blue-500';
  let label = 'Node';
  const borderStyle = selected ? 'border-2 border-yellow-400 ring-2 ring-yellow-300' : 'border-transparent';

  if (type === NodeType.Message) {
    backgroundColor = 'bg-green-500';
    label = 'Message Node';
  } else if (type === NodeType.Condition) {
    backgroundColor = 'bg-yellow-500';
    label = 'Condition Node';
  } else if (type === NodeType.Action) {
    backgroundColor = 'bg-purple-500';
    label = 'Action Node';
  }

  const handleNodeClick = (event: React.MouseEvent | React.TouchEvent) => {
    if (onClick) {
      onClick(id, event);
    }
  };

  const renderHandles = (handles: NodeHandle[]) => {
    return handles.map(handle => {
      let handleStyle: React.CSSProperties = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: 'gray',
        borderRadius: '50%',
        border: '1px solid white',
        zIndex: 10,
      };
      if (typeof handle.position === 'string') {
        switch (handle.position) {
          case HandlePosition.Top:
            handleStyle.top = '-5px';
            handleStyle.left = 'calc(50% - 5px)';
            break;
          case HandlePosition.Bottom:
            handleStyle.bottom = '-5px';
            handleStyle.left = 'calc(50% - 5px)';
            break;
          case HandlePosition.Left:
            handleStyle.left = '-5px';
            handleStyle.top = 'calc(50% - 5px)';
            break;
          case HandlePosition.Right:
            handleStyle.right = '-5px';
            handleStyle.top = 'calc(50% - 5px)';
            break;
        }
      } else {
        handleStyle.left = `calc(${handle.position.x * 100}% - 5px)`;
        handleStyle.top = `calc(${handle.position.y * 100}% - 5px)`;
      }
      return <div key={handle.id} style={handleStyle} data-handle-id={handle.id} data-node-id={id} data-handle-type={handle.type}></div>;
    });
  };

  return (
    <div
      data-node-id={id}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: `${width}px`,
        height: `${height}px`,
        cursor: 'grab',
      }}
      className={`p-2 rounded shadow-md text-white text-xs relative ${backgroundColor} ${borderStyle}`}
    >
      <div className="font-bold mb-1">{label} (ID: {id})</div>
      {type === NodeType.Message && data && 'text' in data && (
        <p className="truncate">{(data as any).text}</p>
      )}
      {node.handles && renderHandles(node.handles)}
    </div>
  );
};

export default BasicNode; 