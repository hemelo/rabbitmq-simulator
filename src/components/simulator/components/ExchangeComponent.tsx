import React from 'react';
import { Exchange } from '@/types/rabbitmq';
import { Position } from '@/types/rabbitmq';
import { Share2, Layers } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface ExchangeComponentProps {
  exchange: Exchange;
  onMove: (position: Position) => void;
  onStartLink?: () => void;
  onRename?: (id: string, newName: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  hasActiveFlow?: boolean;
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

export const ExchangeComponent: React.FC<ExchangeComponentProps> = ({ exchange, onMove, onStartLink, onRename, isSelected, onSelect, hasActiveFlow }) => {
  const Icon = exchangeIcons[exchange.type];

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('Enter new name:', exchange.name);
    if (newName && newName !== exchange.name && onRename) {
      onRename(exchange.id, newName);
    }
  };

  return (
    <div
      className={`relative p-3 rounded-lg border-2 glass cursor-move hover:scale-105 transition-all duration-300 min-w-32 select-none ${exchangeColors[exchange.type]} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} ${hasActiveFlow ? 'animate-pulse shadow-lg shadow-blue-500/50 scale-105' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onDoubleClick={handleDoubleClick}
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

      {/* Outgoing link handle */}
      <button
        type="button"
        title="Start connection"
        data-link-handle="true"
        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onStartLink && onStartLink(); }}
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border border-background shadow cursor-crosshair"
      />
    </div>
  );
};