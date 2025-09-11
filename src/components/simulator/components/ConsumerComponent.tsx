import React from 'react';
import { Consumer } from '@/types/rabbitmq';
import { Position } from '@/types/rabbitmq';
import { Users, Activity } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface ConsumerComponentProps {
  consumer: Consumer;
  onMove: (position: Position) => void;
}

export const ConsumerComponent: React.FC<ConsumerComponentProps> = ({ consumer, onMove }) => {
  return (
    <div
      className={`absolute p-3 rounded-lg border-2 border-consumer bg-consumer/20 text-consumer glass cursor-move hover:scale-105 transition-transform min-w-32 ${
        consumer.isActive ? 'pulse-glow' : 'opacity-60'
      }`}
      style={{
        left: consumer.position.x,
        top: consumer.position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {consumer.isActive ? (
          <Activity className="w-5 h-5 animate-pulse" />
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