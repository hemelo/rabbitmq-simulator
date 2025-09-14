import React from 'react';
import { Consumer } from '@/types/rabbitmq';
import { Position } from '@/types/rabbitmq';
import { Users, Activity } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface ConsumerComponentProps {
  consumer: Consumer;
  onMove: (position: Position) => void;
  onRename?: (id: string, newName: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  hasActiveFlow?: boolean;
}

export const ConsumerComponent: React.FC<ConsumerComponentProps> = ({ consumer, onMove, onRename, isSelected, onSelect, hasActiveFlow }) => {
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('Enter new name:', consumer.name);
    if (newName && newName !== consumer.name && onRename) {
      onRename(consumer.id, newName);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border-2 border-consumer bg-consumer/20 text-consumer glass cursor-move hover:scale-105 transition-all duration-300 min-w-32 select-none ${
        consumer.isActive ? '' : 'opacity-60'
      } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} ${hasActiveFlow ? 'animate-pulse scale-105 shadow-lg shadow-cyan-500/50' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center gap-2 mb-2">
        {consumer.isActive ? (
          <Activity className="w-5 h-5" />
        ) : (
          <Users className="w-5 h-5" />
        )}
        <div>
          <div className="font-medium text-sm">{consumer.name}</div>
          <div className="flex gap-1 mt-1">
            <Badge 
              variant="secondary" 
              className={`text-xs ${consumer.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
            >
              {consumer.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Processed: {consumer.processedMessages}
      </div>
    </div>
  );
};