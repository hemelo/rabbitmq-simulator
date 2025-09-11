import React from 'react';
import { Exchange } from '@/types/rabbitmq';
import { Position } from '@/types/rabbitmq';
import { Share2, Layers } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface ExchangeComponentProps {
  exchange: Exchange;
  onMove: (position: Position) => void;
}

const exchangeIcons = {
  direct: Share2,
  fanout: Layers,
  topic: Share2
};

const exchangeColors = {
  direct: 'border-exchange-direct bg-exchange-direct/20 text-exchange-direct',
  fanout: 'border-exchange-fanout bg-exchange-fanout/20 text-exchange-fanout',
  topic: 'border-exchange-topic bg-exchange-topic/20 text-exchange-topic'
};

export const ExchangeComponent: React.FC<ExchangeComponentProps> = ({ exchange, onMove }) => {
  const Icon = exchangeIcons[exchange.type];

  return (
    <div
      className={`absolute p-3 rounded-lg border-2 glass cursor-move hover:scale-105 transition-transform min-w-32 ${exchangeColors[exchange.type]}`}
      style={{
        left: exchange.position.x,
        top: exchange.position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <div>
          <div className="font-medium text-sm">{exchange.name}</div>
          <Badge variant="secondary" className="text-xs">
            {exchange.type}
          </Badge>
        </div>
      </div>
      
      {exchange.bindings.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {exchange.bindings.length} binding(s)
        </div>
      )}
    </div>
  );
};