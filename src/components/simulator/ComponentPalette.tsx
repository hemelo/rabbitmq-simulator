import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Share2, Layers, Users, Database } from 'lucide-react';
import { useSimulator } from '@/hooks/useSimulator';

interface ComponentPaletteProps {
  simulator: ReturnType<typeof useSimulator>;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ simulator }) => {
  const handleDragStart = (e: React.DragEvent, componentType: string, exchangeType?: string) => {
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.setData('componentName', '');
    if (exchangeType) {
      e.dataTransfer.setData('exchangeType', exchangeType);
    }
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-sm">Components</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exchanges */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Exchanges
          </div>
          <div className="space-y-2">
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, 'exchange', 'direct')}
              className="flex items-center gap-2 p-2 rounded-lg bg-exchange-direct/20 border border-exchange-direct/30 cursor-grab hover:bg-exchange-direct/30 transition-colors component-bounce"
            >
              <Share2 className="w-4 h-4 text-exchange-direct" />
              <span className="text-sm">Direct</span>
            </div>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, 'exchange', 'fanout')}
              className="flex items-center gap-2 p-2 rounded-lg bg-exchange-fanout/20 border border-exchange-fanout/30 cursor-grab hover:bg-exchange-fanout/30 transition-colors"
            >
              <Layers className="w-4 h-4 text-exchange-fanout" />
              <span className="text-sm">Fanout</span>
            </div>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, 'exchange', 'topic')}
              className="flex items-center gap-2 p-2 rounded-lg bg-exchange-topic/20 border border-exchange-topic/30 cursor-grab hover:bg-exchange-topic/30 transition-colors"
            >
              <Share2 className="w-4 h-4 text-exchange-topic" />
              <span className="text-sm">Topic</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Queues */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Queues
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'queue')}
            className="flex items-center gap-2 p-2 rounded-lg bg-queue/20 border border-queue/30 cursor-grab hover:bg-queue/30 transition-colors"
          >
            <Database className="w-4 h-4 text-queue" />
            <span className="text-sm">Queue</span>
          </div>
        </div>

        <Separator />

        {/* Consumers */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Consumers
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'consumer')}
            className="flex items-center gap-2 p-2 rounded-lg bg-consumer/20 border border-consumer/30 cursor-grab hover:bg-consumer/30 transition-colors"
          >
            <Users className="w-4 h-4 text-consumer" />
            <span className="text-sm">Consumer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};