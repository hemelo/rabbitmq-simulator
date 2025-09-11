import React from 'react';
import { Queue } from '@/types/rabbitmq';
import { Position } from '@/types/rabbitmq';
import { Database } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface QueueComponentProps {
  queue: Queue;
  onMove: (position: Position) => void;
}

export const QueueComponent: React.FC<QueueComponentProps> = ({ queue, onMove }) => {
  return (
    <div
      className="absolute p-3 rounded-lg border-2 border-queue bg-queue/20 text-queue glass cursor-move hover:scale-105 transition-transform min-w-36"
      style={{
        left: queue.position.x,
        top: queue.position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5" />
        <div>
          <div className="font-medium text-sm">{queue.name}</div>
          <div className="flex gap-1 mt-1">
            <Badge variant="secondary" className="text-xs">
              {queue.messages.length} msg
            </Badge>
            {queue.consumers.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {queue.consumers.length} consumer(s)
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {queue.dlq && (
        <div className="text-xs text-muted-foreground">
          DLQ: Configured
        </div>
      )}

      {/* Message count indicator */}
      {queue.messages.length > 0 && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 bg-message text-background rounded-full flex items-center justify-center text-xs font-bold pulse-glow">
            {queue.messages.length}
          </div>
        </div>
      )}
    </div>
  );
};