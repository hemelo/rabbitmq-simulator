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
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 2000, height: 1200 });
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const [linkDraft, setLinkDraft] = useState<{ fromExchangeId: string; toPos: Position } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const didAutoFitRef = useRef(false);
  const userPannedRef = useRef(false);

  const fitToView = useCallback(() => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const items = [
      ...simulator.state.exchanges.map(e => e.position),
      ...simulator.state.queues.map(q => q.position),
      ...simulator.state.consumers.map(c => c.position)
    ];
    if (items.length === 0) return;
    const padding = 80;
    const minX = Math.min(...items.map(p => p.x));
    const minY = Math.min(...items.map(p => p.y));
    const maxX = Math.max(...items.map(p => p.x));
    const maxY = Math.max(...items.map(p => p.y));
    const worldW = (maxX - minX) + padding * 2;
    const worldH = (maxY - minY) + padding * 2;
    // Resize canvas to content bounds with minimum size
    const minW = Math.max(rect.width, 1200);
    const minH = Math.max(rect.height, 800);
    const newCanvas = { width: Math.max(worldW, minW), height: Math.max(worldH, minH) };
    setCanvasSize(newCanvas);
    // Compute scale to fit both dimensions
    const scaleX = rect.width / newCanvas.width;
    const scaleY = rect.height / newCanvas.height;
    const newScale = Math.min(1.5, Math.max(0.5, Math.min(scaleX, scaleY)));
    setScale(newScale);
    // Center viewport via scroll
    const scrollX = (newCanvas.width * newScale - rect.width) / 2;
    const scrollY = (newCanvas.height * newScale - rect.height) / 2;
    workspaceRef.current.scrollLeft = Math.max(0, scrollX);
    workspaceRef.current.scrollTop = Math.max(0, scrollY);
  }, [simulator.state.exchanges, simulator.state.queues, simulator.state.consumers]);

  const centerToView = useCallback(() => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const contentW = canvasSize.width * scale;
    const contentH = canvasSize.height * scale;
    workspaceRef.current.scrollLeft = Math.max(0, (contentW - rect.width) / 2);
    workspaceRef.current.scrollTop = Math.max(0, (contentH - rect.height) / 2);
  }, [scale, canvasSize]);

  // Auto-fit once when content first appears
  React.useEffect(() => {
    const hasContent = simulator.state.exchanges.length + simulator.state.queues.length + simulator.state.consumers.length > 0;
    if (hasContent && !didAutoFitRef.current) {
      didAutoFitRef.current = true;
      fitToView();
    }
    if (hasContent && !userPannedRef.current) {
      centerToView();
    }
  }, [simulator.state.exchanges.length, simulator.state.queues.length, simulator.state.consumers.length, fitToView, centerToView]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'copy'; } catch {}
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Be lenient to keep drop zone active while moving inside children
    const next = e.relatedTarget as Node | null;
    if (!next || !e.currentTarget.contains(next)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const position: Position = {
      x: (e.clientX - rect.left + workspaceRef.current.scrollLeft) / scale,
      y: (e.clientY - rect.top + workspaceRef.current.scrollTop) / scale
    };

    position.x = Math.round(position.x / 20) * 20;
    position.y = Math.round(position.y / 20) * 20;

    // Try to read structured payload; fallback to simple string and Safari ghost drag
    let componentType = e.dataTransfer.getData('componentType');
    let data = e.dataTransfer.getData('text/plain');
    let payload: any = {};
    try { if (data) payload = JSON.parse(data); } catch {}
    if (!componentType && payload.componentType) componentType = payload.componentType;
    if (!componentType && data && (data === 'exchange' || data === 'queue' || data === 'consumer')) componentType = data;
    if (!componentType) {
      // Safari ghost drag end fallback
      const anyDoc = document as any;
      const lastGhost = (anyDoc.__lastGhostDrop as { x: number; y: number; payload: any } | undefined);
      if (lastGhost) {
        payload = lastGhost.payload || {};
        componentType = payload.componentType;
      }
    }
    console.log('Dropping component:', componentType, 'at position:', position, 'payload:', payload);

    try {
      switch (componentType) {
        case 'exchange':
          const exchangeType = (e.dataTransfer.getData('exchangeType') as any) || payload.exchangeType;
          const exchangeName = `Exchange-${simulator.state.exchanges.length + 1}`;
          console.log('Creating exchange:', exchangeName, exchangeType);
          simulator.createExchange(exchangeName, exchangeType, position);
          break;
        case 'queue':
          const queueName = `Queue-${simulator.state.queues.length + 1}`;
          console.log('Creating queue:', queueName);
          const maxLengthStr = e.dataTransfer.getData('queueMaxLength') || payload.queueMaxLength;
          const ttlStr = e.dataTransfer.getData('queueTtl') || payload.queueTtl;
          const maxLength = maxLengthStr ? parseInt(maxLengthStr, 10) : undefined;
          const messageTtlMs = ttlStr ? parseInt(ttlStr, 10) : undefined;
          const newQueue = simulator.createQueue(queueName, position, undefined, maxLength, messageTtlMs);
          
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
  }, [simulator, scale, translate]);

  // Safari ghost drag end listener
  React.useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ clientX: number; clientY: number; payload: any }>;
      (document as any).__lastGhostDrop = { x: e.detail.clientX, y: e.detail.clientY, payload: e.detail.payload };
      // If pointer is over workspace, synthesize a drop
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      if (e.detail.clientX >= rect.left && e.detail.clientX <= rect.right && e.detail.clientY >= rect.top && e.detail.clientY <= rect.bottom) {
        const dt = new DataTransfer();
        try { dt.setData('text/plain', JSON.stringify(e.detail.payload)); } catch {}
        const dragEvent = new DragEvent('drop', { clientX: e.detail.clientX, clientY: e.detail.clientY, bubbles: true, cancelable: true, dataTransfer: dt } as DragEventInit);
        workspaceRef.current.dispatchEvent(dragEvent);
      }
    };
    document.addEventListener('ghost-drag-end', handler as EventListener);
    return () => document.removeEventListener('ghost-drag-end', handler as EventListener);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!workspaceRef.current) return;
    if (!e.ctrlKey) return; // allow native scroll
    e.preventDefault();
    const delta = -e.deltaY;
    const zoomFactor = Math.exp(delta * 0.001);
    const oldScale = scale;
    const newScale = Math.min(2, Math.max(0.5, oldScale * zoomFactor));
    const rect = workspaceRef.current.getBoundingClientRect();
    const sx = workspaceRef.current.scrollLeft + (e.clientX - rect.left);
    const sy = workspaceRef.current.scrollTop + (e.clientY - rect.top);
    setScale(newScale);
    const k = newScale / oldScale;
    // Zoom around cursor by adjusting scroll to keep cursor position stable
    workspaceRef.current.scrollLeft = Math.max(0, sx * k - (e.clientX - rect.left));
    workspaceRef.current.scrollTop = Math.max(0, sy * k - (e.clientY - rect.top));
    userPannedRef.current = true;
  }, [scale]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 1 && !(e.button === 0 && e.shiftKey)) return;
    e.preventDefault();
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - workspaceRef.current!.scrollLeft, y: e.clientY - workspaceRef.current!.scrollTop };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    userPannedRef.current = true;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanningRef.current && panStartRef.current && workspaceRef.current) {
      workspaceRef.current.scrollLeft = Math.max(0, panStartRef.current.x - e.clientX);
      workspaceRef.current.scrollTop = Math.max(0, panStartRef.current.y - e.clientY);
    }
    if (linkDraft && workspaceRef.current) {
      const rect = workspaceRef.current.getBoundingClientRect();
      const toPos: Position = {
        x: (e.clientX - rect.left + workspaceRef.current.scrollLeft) / scale,
        y: (e.clientY - rect.top + workspaceRef.current.scrollTop) / scale
      };
      setLinkDraft({ ...linkDraft, toPos });
    }
  }, [linkDraft, scale]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isPanningRef.current = false;
    panStartRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Keyboard delete handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          const exchange = simulator.state.exchanges.find(e => e.id === selectedId);
          const queue = simulator.state.queues.find(q => q.id === selectedId);
          const consumer = simulator.state.consumers.find(c => c.id === selectedId);
          
          if (exchange) {
            simulator.deleteExchange(exchange.id);
          } else if (queue) {
            simulator.deleteQueue(queue.id);
          } else if (consumer) {
            simulator.deleteConsumer(consumer.id);
          }
          setSelectedId(null);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, simulator]);

  return (
    <div 
      data-workspace
      className={`bg-card rounded-xl border glass h-full relative overflow-auto transition-colors ${
        isDragOver ? 'border-primary bg-primary/5' : ''
      }`}
    >
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

      

      {/* Workspace */}
      <div 
        ref={workspaceRef}
        className="relative w-full h-full min-h-[500px] p-0 overflow-auto"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Fit button */}
        <button
          type="button"
          onClick={fitToView}
          className="absolute top-2 right-2 z-30 text-xs px-2 py-1 rounded border bg-background/80 hover:bg-background"
        >
          Fit
        </button>
        <button
          type="button"
          onClick={centerToView}
          className="absolute top-2 right-14 z-30 text-xs px-2 py-1 rounded border bg-background/80 hover:bg-background"
        >
          Center
        </button>
        <div className="relative" style={{ width: canvasSize.width * scale, height: canvasSize.height * scale }}>
          <div className="absolute" style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: canvasSize.width, height: canvasSize.height }}>
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Exchange → Queue bindings (primary color, labeled by routing key) */}
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
                  id={binding.id}
                  color={'hsl(var(--primary))'}
                />
              );
            })}
            {/* In-flight draft link from exchange handle to cursor */}
            {linkDraft && (() => {
              const exchange = simulator.state.exchanges.find(e => e.id === linkDraft.fromExchangeId);
              if (!exchange) return null;
              return (
                <ConnectionLine
                  key="draft"
                  from={exchange.position}
                  to={linkDraft.toPos}
                  id="draft"
                  dashed
                  color={'hsl(var(--muted-foreground))'}
                />
              );
            })()}
            {/* Queue → Consumer implied flow (muted, unlabeled) */}
            {simulator.state.consumers.map(consumer => {
              const q = simulator.state.queues.find(qq => qq.id === consumer.queueId);
              if (!q) return null;
              return (
                <ConnectionLine
                  key={`qc-${consumer.id}`}
                  from={q.position}
                  to={consumer.position}
                  id={`qc-${consumer.id}`}
                  color={'hsl(var(--muted-foreground))'}
                />
              );
            })}
          </svg>

          {/* Exchanges */}
          {simulator.state.exchanges.map(exchange => (
            <DraggableNode key={exchange.id} position={exchange.position} scale={scale} onDrag={(pos) => simulator.moveExchange(exchange.id, pos)}>
              <ExchangeComponent 
                exchange={exchange} 
                onMove={() => {}} 
                onStartLink={() => setLinkDraft({ fromExchangeId: exchange.id, toPos: exchange.position })}
                onRename={simulator.renameExchange}
                isSelected={selectedId === exchange.id}
                onSelect={() => setSelectedId(exchange.id)}
                hasActiveFlow={simulator.state.activeFlows?.some(flow => flow.componentId === exchange.id && flow.componentType === 'exchange') || false}
              />
            </DraggableNode>
          ))}

          {/* Queues */}
          {simulator.state.queues.map(queue => (
            <DraggableNode key={queue.id} position={queue.position} scale={scale} onDrag={(pos) => simulator.moveQueue(queue.id, pos)}>
              <QueueComponent 
                queue={queue} 
                onMove={() => {}} 
                onAcceptLink={() => {
                  if (linkDraft) {
                    const exchange = simulator.state.exchanges.find(e => e.id === linkDraft.fromExchangeId);
                    const routingKey = exchange?.type === 'fanout' ? '' : (window.prompt('Routing key:', '') ?? '');
                    simulator.createBinding(linkDraft.fromExchangeId, queue.id, routingKey);
                    setLinkDraft(null);
                  }
                }}
                onRename={simulator.renameQueue}
                isSelected={selectedId === queue.id}
                onSelect={() => setSelectedId(queue.id)}
                hasActiveFlow={simulator.state.activeFlows?.some(flow => flow.componentId === queue.id && flow.componentType === 'queue') || false}
              />
            </DraggableNode>
          ))}

          {/* Consumers */}
          {simulator.state.consumers.map(consumer => (
            <DraggableNode key={consumer.id} position={consumer.position} scale={scale} onDrag={(pos) => simulator.moveConsumer(consumer.id, pos)}>
              <ConsumerComponent 
                consumer={consumer} 
                onMove={() => {}} 
                onRename={simulator.renameConsumer}
                isSelected={selectedId === consumer.id}
                onSelect={() => setSelectedId(consumer.id)}
                hasActiveFlow={simulator.state.activeFlows?.some(flow => flow.componentId === consumer.id && flow.componentType === 'consumer') || false}
              />
            </DraggableNode>
          ))}
          </div>
        </div>

        
      </div>
    </div>
  );
};

interface DraggableNodeProps {
  position: Position;
  scale: number;
  onDrag: (pos: Position) => void;
  children: React.ReactNode;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ position, onDrag, scale, children }) => {
  const draggingRef = useRef(false);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    // If pointer started on a link handle, do not drag the node
    if ((e.target as HTMLElement).closest('[data-link-handle="true"]')) {
      return;
    }
    e.stopPropagation();
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    const parent = (e.currentTarget as HTMLElement).parentElement as HTMLElement;
    const parentRect = parent.getBoundingClientRect();
    const x = (e.clientX - parentRect.left - offsetRef.current.x) / scale;
    const y = (e.clientY - parentRect.top - offsetRef.current.y) / scale;
    const snapped: Position = { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 };
    onDrag(snapped);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="absolute z-20"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
    </div>
  );
};