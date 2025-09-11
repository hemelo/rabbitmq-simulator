import React, { useState, useRef, useCallback } from 'react';
import { ExchangeComponent } from './components/ExchangeComponent';
import { QueueComponent } from './components/QueueComponent';
import { ConsumerComponent } from './components/ConsumerComponent';
import { ConnectionLine } from './components/ConnectionLine';
import { useSimulator } from '@/hooks/useSimulator';
import { Position } from '@/types/rabbitmq';

interface WorkspaceProps {
  simulator: ReturnType<typeof useSimulator>;
}

export const Workspace: React.FC<WorkspaceProps> = ({ simulator }) => {
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const position: Position = {
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y
    };

    const componentType = e.dataTransfer.getData('componentType');
    const componentName = e.dataTransfer.getData('componentName');

    // Snap to grid
    position.x = Math.round(position.x / 20) * 20;
    position.y = Math.round(position.y / 20) * 20;

    switch (componentType) {
      case 'exchange':
        const exchangeType = e.dataTransfer.getData('exchangeType') as any;
        simulator.createExchange(componentName || `Exchange-${Date.now()}`, exchangeType, position);
        break;
      case 'queue':
        simulator.createQueue(componentName || `Queue-${Date.now()}`, position);
        break;
      case 'consumer':
        // For consumers, we need to associate with a queue
        // For now, create at position and let user connect later
        const nearestQueue = simulator.state.queues
          .map(q => ({ 
            queue: q, 
            distance: Math.sqrt((q.position.x - position.x) ** 2 + (q.position.y - position.y) ** 2) 
          }))
          .sort((a, b) => a.distance - b.distance)[0];

        if (nearestQueue && nearestQueue.distance < 100) {
          simulator.createConsumer(
            componentName || `Consumer-${Date.now()}`,
            nearestQueue.queue.id,
            position
          );
        }
        break;
    }
  }, [simulator, dragOffset]);

  return (
    <div className="bg-card rounded-xl border glass min-h-[600px] relative overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Workspace */}
      <div 
        ref={workspaceRef}
        className="relative w-full h-full p-4"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {simulator.state.bindings.map(binding => {
            const exchange = simulator.state.exchanges.find(e => e.id === binding.exchangeId);
            const queue = simulator.state.queues.find(q => q.id === binding.queueId);
            
            if (!exchange || !queue) return null;
            
            return (
              <ConnectionLine 
                key={binding.id}
                from={exchange.position}
                to={queue.position}
                routingKey={binding.routingKey}
              />
            );
          })}
        </svg>

        {/* Exchanges */}
        {simulator.state.exchanges.map(exchange => (
          <ExchangeComponent 
            key={exchange.id} 
            exchange={exchange} 
            onMove={(position) => {
              // Update position logic would go here
            }}
          />
        ))}

        {/* Queues */}
        {simulator.state.queues.map(queue => (
          <QueueComponent 
            key={queue.id} 
            queue={queue} 
            onMove={(position) => {
              // Update position logic would go here
            }}
          />
        ))}

        {/* Consumers */}
        {simulator.state.consumers.map(consumer => (
          <ConsumerComponent 
            key={consumer.id} 
            consumer={consumer} 
            onMove={(position) => {
              // Update position logic would go here
            }}
          />
        ))}

        {/* Empty State */}
        {simulator.state.exchanges.length === 0 && simulator.state.queues.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-6xl mb-4 opacity-20">🐰</div>
              <h3 className="text-xl font-semibold mb-2">Start Building Your Message Flow</h3>
              <p>Drag components from the palette to create exchanges, queues, and consumers</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};