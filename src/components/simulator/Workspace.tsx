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
  const [isDragOver, setIsDragOver] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set dragOver to false if we're leaving the workspace entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const position: Position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Snap to grid (optional, makes positioning cleaner)
    position.x = Math.round(position.x / 20) * 20;
    position.y = Math.round(position.y / 20) * 20;

    // Ensure minimum distances from edges
    position.x = Math.max(60, Math.min(position.x, rect.width - 60));
    position.y = Math.max(40, Math.min(position.y, rect.height - 40));

    const componentType = e.dataTransfer.getData('componentType');
    console.log('Dropping component:', componentType, 'at position:', position);

    try {
      switch (componentType) {
        case 'exchange':
          const exchangeType = e.dataTransfer.getData('exchangeType') as any;
          const exchangeName = `Exchange-${simulator.state.exchanges.length + 1}`;
          console.log('Creating exchange:', exchangeName, exchangeType);
          simulator.createExchange(exchangeName, exchangeType, position);
          break;
        case 'queue':
          const queueName = `Queue-${simulator.state.queues.length + 1}`;
          console.log('Creating queue:', queueName);
          const newQueue = simulator.createQueue(queueName, position);
          
          // Auto-bind to nearby exchanges
          simulator.state.exchanges.forEach(exchange => {
            const distance = Math.sqrt((exchange.position.x - position.x) ** 2 + (exchange.position.y - position.y) ** 2);
            if (distance < 150) {
              // Create a default binding
              const routingKey = exchange.type === 'fanout' ? '' : `${queueName.toLowerCase().replace(/\s+/g, '.')}.*`;
              simulator.createBinding(exchange.id, newQueue.id, routingKey);
            }
          });
          break;
        case 'consumer':
          const consumerName = `Consumer-${simulator.state.consumers.length + 1}`;
          console.log('Creating consumer:', consumerName);
          
          // Find any queue to attach to, or create consumer without queue initially
          const availableQueue = simulator.state.queues[0];
          if (availableQueue) {
            simulator.createConsumer(consumerName, availableQueue.id, position);
          } else {
            // Create a default queue first, then the consumer
            const defaultQueue = simulator.createQueue('Default-Queue', { x: position.x - 100, y: position.y });
            simulator.createConsumer(consumerName, defaultQueue.id, position);
          }
          break;
        default:
          console.log('Unknown component type:', componentType);
      }
    } catch (error) {
      console.error('Error creating component:', error);
    }
  }, [simulator]);

  return (
    <div className={`bg-card rounded-xl border glass min-h-[500px] sm:min-h-[600px] relative overflow-hidden transition-colors ${
      isDragOver ? 'border-primary bg-primary/5' : ''
    }`}>
      {/* Grid Background */}
      <div 
        className={`absolute inset-0 transition-opacity ${isDragOver ? 'opacity-20' : 'opacity-5'}`}
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Drop Zone Indicator */}
      <div className={`absolute top-4 left-4 text-xs px-2 py-1 rounded border transition-colors ${
        isDragOver 
          ? 'text-primary bg-primary/10 border-primary' 
          : 'text-muted-foreground bg-background/80 border-border'
      }`}>
        {isDragOver ? '🎯 Drop here to create component!' : '💡 Drag components here to add them to your workspace'}
      </div>

      {/* Workspace */}
      <div 
        ref={workspaceRef}
        className="relative w-full h-full p-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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
              <p className="text-sm sm:text-base">Drag components from the palette to create exchanges, queues, and consumers</p>
              <div className="mt-4 text-xs bg-background/60 border rounded-lg p-3 max-w-sm mx-auto">
                <p><strong>💡 Quick Start:</strong></p>
                <p className="mt-1">1. Drag an Exchange (Direct/Topic/Fanout)</p>
                <p>2. Add a Queue</p>
                <p>3. Create a Consumer</p>
                <p>4. Publish messages to see them flow!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};