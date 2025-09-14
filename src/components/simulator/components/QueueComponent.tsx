import React from 'react';
import { Queue } from '@/types/rabbitmq';
import { Position } from '@/types/rabbitmq';
import { Database } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface QueueComponentProps {
  queue: Queue;
  onMove: (position: Position) => void;
  onAcceptLink?: () => void;
  onRename?: (id: string, newName: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  hasActiveFlow?: boolean;
}

export const QueueComponent: React.FC<QueueComponentProps> = ({ queue, onMove, onAcceptLink, onRename, isSelected, onSelect, hasActiveFlow }) => {
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('Enter new name:', queue.name);
    if (newName && newName !== queue.name && onRename) {
      onRename(queue.id, newName);
    }
  };

  return (
    <div
      className={`relative p-3 rounded-lg border-2 border-queue bg-queue/20 text-queue glass cursor-move hover:scale-105 transition-all duration-300 min-w-36 select-none ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} ${hasActiveFlow ? 'animate-pulse shadow-lg shadow-green-500/50 scale-105' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onDoubleClick={handleDoubleClick}
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

      {/* Incoming link handle */}
      <button
        type="button"
        title="Connect here"
        data-link-handle="true"
        onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); onAcceptLink && onAcceptLink(); }}
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-queue border border-background shadow cursor-crosshair"
      />
    </div>
  );
};