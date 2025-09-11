import React from 'react';
import { Position } from '@/types/rabbitmq';

interface ConnectionLineProps {
  from: Position;
  to: Position;
  routingKey: string;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ from, to, routingKey }) => {
  // Calculate the line path with curve
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  // Create a curved path
  const path = `M ${from.x} ${from.y} Q ${midX} ${midY - 30} ${to.x} ${to.y}`;

  return (
    <g>
      {/* Connection line */}
      <path
        d={path}
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        strokeDasharray="5,5"
        className="animate-pulse"
      />
      
      {/* Arrow marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="hsl(var(--primary))"
          />
        </marker>
      </defs>
      
      <path
        d={path}
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />

      {/* Routing key label */}
      <text
        x={midX}
        y={midY - 35}
        textAnchor="middle"
        className="fill-primary text-xs font-medium"
      >
        {routingKey}
      </text>
    </g>
  );
};