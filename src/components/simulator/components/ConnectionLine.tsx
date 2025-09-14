import React from 'react';
import { Position } from '@/types/rabbitmq';

interface ConnectionLineProps {
  from: Position;
  to: Position;
  routingKey?: string;
  id?: string;
  color?: string; // CSS color string
  dashed?: boolean;
  label?: string;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ from, to, routingKey, id, color, dashed, label }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const path = `M ${from.x} ${from.y} Q ${midX} ${midY - 30} ${to.x} ${to.y}`;
  const stroke = color ?? 'hsl(var(--primary))';
  const markerId = `arrowhead-${id ?? `${from.x}-${from.y}-${to.x}-${to.y}`}`;

  return (
    <g>
      <defs>
        <marker id={markerId} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={stroke} />
        </marker>
      </defs>
      <path d={path} stroke={stroke} strokeWidth="2" fill="none" markerEnd={`url(#${markerId})`} strokeDasharray={dashed ? '6,6' : undefined} />
      {(label ?? routingKey) && (
        <text x={midX} y={midY - 35} textAnchor="middle" className="text-xs font-medium" style={{ fill: stroke }}>
          {label ?? routingKey}
        </text>
      )}
    </g>
  );
};